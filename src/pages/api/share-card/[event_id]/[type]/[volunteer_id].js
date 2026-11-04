// GET /api/share-card/<event_id>/<type>/<volunteer_id>?format=og|square|story[&download=1]
//
// Renders a participant's branded share card as a PNG with satori
// (`next/og`, Node runtime — no Edge). Data comes from the SAME public,
// denylisted endpoints the event-page roster uses, and only a person who is
// on the roster (isSelected) renders; everyone else is a 404. The response is
// cached at Vercel's CDN (s-maxage) so unfurl scrapers and repeat downloads
// don't re-render.
//
// Fonts: satori can't read the woff2 variable files the site ships, so static
// TTF instances live in src/assets/share-card/fonts (OFL). They're registered
// under neutral names ("Display"/"Body") — see ShareCardImage.js.

import fs from "fs";
import path from "path";
import React from "react";
import { ImageResponse } from "next/og";
import ShareCardImage from "../../../../../components/ShareCard/ShareCardImage";
import {
  DEFAULT_FORMAT,
  SHARE_FORMATS,
  eventDisplayName,
  eventTense,
  formatEventDateRange,
  isShareFormat,
  isShareType,
  monogram,
  publicVolunteerForCard,
  shareImageFilename,
  shortLocation,
} from "../../../../../lib/shareCard";

export const config = { api: { responseLimit: false } };

const FONT_DIR = path.join(process.cwd(), "src/assets/share-card/fonts");
const LOGO_URL =
  "https://cdn.ohack.dev/ohack.dev/logos/OpportunityHack_2Letter_Dark_Blue.png";
const UPSTREAM_TIMEOUT_MS = 8000;
const IMAGE_TIMEOUT_MS = 5000;
const IMAGE_MAX_BYTES = 6 * 1024 * 1024;

let fontsPromise = null;
function loadFonts() {
  if (!fontsPromise) {
    fontsPromise = Promise.resolve().then(() => {
      const read = (f) => fs.readFileSync(path.join(FONT_DIR, f));
      return [
        { name: "Display", data: read("display-600.ttf"), weight: 600, style: "normal" },
        { name: "Display", data: read("display-600-italic.ttf"), weight: 600, style: "italic" },
        { name: "Body", data: read("body-400.ttf"), weight: 400, style: "normal" },
        { name: "Body", data: read("body-600.ttf"), weight: 600, style: "normal" },
      ];
    });
  }
  return fontsPromise;
}

async function fetchJson(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS) });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Upstream ${res.status} for ${url}`);
  return res.json();
}

async function fetchBytes(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(IMAGE_TIMEOUT_MS) });
  if (!res.ok) throw new Error(`Image ${res.status}`);
  const len = Number(res.headers.get("content-length") || 0);
  if (len > IMAGE_MAX_BYTES) throw new Error("Image too large");
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > IMAGE_MAX_BYTES) throw new Error("Image too large");
  return buf;
}

// Normalize any uploaded photo (WebP/HEIC/huge JPEG, EXIF rotation) into a
// small square JPEG data URI satori can draw. Any failure → monogram.
async function photoDataUri(photoUrl, size) {
  if (!photoUrl) return null;
  try {
    const sharp = (await import("sharp")).default;
    const raw = await fetchBytes(photoUrl);
    const out = await sharp(raw)
      .rotate()
      .resize(size, size, { fit: "cover", position: "attention" })
      .jpeg({ quality: 86 })
      .toBuffer();
    return `data:image/jpeg;base64,${out.toString("base64")}`;
  } catch (err) {
    console.warn("share-card: photo skipped", err?.message);
    return null;
  }
}

let logoPromise = null;
function logoDataUri() {
  if (!logoPromise) {
    logoPromise = fetchBytes(LOGO_URL)
      .then((buf) => `data:image/png;base64,${buf.toString("base64")}`)
      .catch((err) => {
        console.warn("share-card: logo skipped", err?.message);
        logoPromise = null;
        return null;
      });
  }
  return logoPromise;
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).json({ error: "method_not_allowed" });
  }
  const { event_id: eventId, type, volunteer_id: volunteerId } = req.query;
  const format = typeof req.query.format === "string" ? req.query.format : DEFAULT_FORMAT;
  if (!isShareType(type) || !isShareFormat(format) || !eventId || !volunteerId) {
    return res.status(400).json({ error: "bad_request" });
  }

  const api = process.env.NEXT_PUBLIC_API_SERVER_URL;
  let event;
  let list;
  try {
    [event, list] = await Promise.all([
      fetchJson(`${api}/api/messages/hackathon/${encodeURIComponent(eventId)}`),
      fetchJson(
        `${api}/api/messages/hackathon/${encodeURIComponent(eventId)}/${encodeURIComponent(type)}`,
      ),
    ]);
  } catch (err) {
    console.error("share-card: upstream failed", err?.message);
    res.setHeader("Cache-Control", "no-store");
    return res.status(502).json({ error: "upstream_unavailable" });
  }
  if (!event || !event.id) {
    res.setHeader("Cache-Control", "public, s-maxage=60");
    return res.status(404).json({ error: "event_not_found" });
  }
  const rows = Array.isArray(list?.data) ? list.data : [];
  const person = publicVolunteerForCard(rows.find((r) => String(r?.id) === String(volunteerId)));
  if (!person) {
    res.setHeader("Cache-Control", "public, s-maxage=60");
    return res.status(404).json({ error: "not_on_roster" });
  }

  const { width, height } = SHARE_FORMATS[format];
  const [fonts, photo, logo] = await Promise.all([
    loadFonts(),
    photoDataUri(person.photoUrl, format === "og" ? 600 : 1040),
    logoDataUri(),
  ]);

  const image = new ImageResponse(
    React.createElement(ShareCardImage, {
      format,
      name: person.name,
      initials: monogram(person.name),
      photo,
      logo,
      type,
      eventTitle: eventDisplayName(event),
      dates: formatEventDateRange(event.start_date, event.end_date),
      location: shortLocation(event.location),
      tense: eventTense(event),
    }),
    { width, height, fonts },
  );
  const png = Buffer.from(await image.arrayBuffer());

  const filename = shareImageFilename({ eventId, type, name: person.name, format });
  const disposition = req.query.download ? "attachment" : "inline";
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Content-Length", String(png.length));
  res.setHeader("Content-Disposition", `${disposition}; filename="${filename}"`);
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.setHeader("X-Content-Type-Options", "nosniff");
  return res.status(200).send(png);
}
