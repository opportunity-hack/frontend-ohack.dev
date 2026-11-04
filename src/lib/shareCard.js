// Pure helpers for participant share cards (see CLAUDE.md "Share cards").
//
// A share card is a per-person, per-event, per-role branded image
// (/api/share-card/<event>/<type>/<id>?format=…) plus a landing page
// (/hack/<event>/share/<type>/<id>) whose OG tags unfurl that image. These
// helpers build the paths, the captions and the per-platform share links;
// nothing here touches the network or the DOM, so it is unit-tested in
// src/lib/__tests__/shareCard.test.js.

import { parseLocalDate } from "./dateUtils";

export const SHARE_TYPES = ["mentor", "judge", "hacker", "volunteer"];

export const ROLE_COPY = {
  mentor: { noun: "Mentor", present: "mentoring at", past: "mentored at" },
  judge: { noun: "Judge", present: "judging", past: "judged" },
  hacker: { noun: "Hacker", present: "hacking at", past: "hacked at" },
  volunteer: { noun: "Volunteer", present: "volunteering at", past: "volunteered at" },
};

// Pixel dimensions per format. `og` is the Open Graph / link-preview size
// every network accepts; `square` suits LinkedIn and Instagram image posts;
// `story` is the 9:16 stories/reels canvas.
export const SHARE_FORMATS = {
  og: { width: 1200, height: 630, label: "Post", hint: "LinkedIn, X, Facebook" },
  square: { width: 1080, height: 1080, label: "Square", hint: "Instagram, LinkedIn" },
  story: { width: 1080, height: 1920, label: "Story", hint: "Instagram & LinkedIn stories" },
};
export const DEFAULT_FORMAT = "og";

export const SITE_URL = "https://www.ohack.dev";
export const HASHTAGS = "#OpportunityHack #TechForGood #Nonprofits";
const X_LIMIT = 240;

export function isShareType(type) {
  return SHARE_TYPES.includes(type);
}

export function isShareFormat(format) {
  return Object.prototype.hasOwnProperty.call(SHARE_FORMATS, format);
}

export function sharePagePath(eventId, type, volunteerId) {
  return `/hack/${encodeURIComponent(eventId)}/share/${encodeURIComponent(type)}/${encodeURIComponent(volunteerId)}`;
}

export function shareImagePath(eventId, type, volunteerId, format = DEFAULT_FORMAT) {
  return `/api/share-card/${encodeURIComponent(eventId)}/${encodeURIComponent(type)}/${encodeURIComponent(volunteerId)}?format=${encodeURIComponent(format)}`;
}

export function absoluteUrl(path, site = SITE_URL) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${site.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Append UTM parameters so GA can attribute visits from each network. */
export function withUtm(url, { source, campaign }) {
  const u = new URL(url, SITE_URL);
  u.searchParams.set("utm_source", source);
  u.searchParams.set("utm_medium", "share_card");
  if (campaign) u.searchParams.set("utm_campaign", campaign);
  return u.toString();
}

// "Fall 2026", "Fall Hackathon 2026", "2026 Fall" — up to two words between season and year.
const SEASON_RE = /\b(spring|summer|fall|autumn|winter)\b(?:\s+[A-Za-z]+){0,2}\s+(20\d{2})\b|\b(20\d{2})\s+(spring|summer|fall|autumn|winter)\b/i;

/**
 * Short, human event name for cards and captions. Event titles are written
 * for search ("ASU Fall Hackathon 2026 | Phoenix Hackathon for Nonprofits:
 * Nov 14-15"), so prefer "Opportunity Hack Fall 2026" when a season + year
 * is present, else the first clause of the title. Never doubles the brand.
 */
export function eventDisplayName(event) {
  const title = (event?.title || "").trim();
  if (!title) return "Opportunity Hack";
  const season = title.match(SEASON_RE);
  if (season) {
    const raw = season[1] || season[4];
    const year = season[2] || season[3];
    const word = raw[0].toUpperCase() + raw.slice(1).toLowerCase();
    return `Opportunity Hack ${word === "Autumn" ? "Fall" : word} ${year}`;
  }
  const first = title.split(/\s*[|:–—]\s*|\s+-\s+/)[0].trim() || title;
  return /opportunity\s*hack/i.test(first) ? first : `Opportunity Hack ${first}`;
}

const CITY_PREFIX =
  "(?:San|Los|Las|New|Fort|Ft\\.|St\\.|Santa|Saint|El|North|South|East|West|Lake|Mount|Salt Lake|Sioux)";
const CITY_STATE_RE = new RegExp(`((?:${CITY_PREFIX}\\s)?[A-Z][a-z]+),\\s*([A-Z]{2})\\b`);

/** "Engineering Center … Tempe, AZ 85281" → "Tempe, AZ"; "Online" stays. */
export function shortLocation(location) {
  const text = (location || "").trim();
  if (!text) return "";
  const m = text.match(CITY_STATE_RE);
  if (m) return `${m[1]}, ${m[2]}`;
  return text.length > 40 ? `${text.slice(0, 37).trim()}…` : text;
}

/**
 * `present` until the END of the event's last day (inclusive), then `past`.
 * Date-only strings are parsed as local calendar days (parseLocalDate).
 */
export function eventTense(event, now = new Date()) {
  const end = parseLocalDate(event?.end_date || event?.start_date);
  if (isNaN(end.getTime())) return "present";
  const endOfDay = new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1);
  return now.getTime() >= endOfDay.getTime() ? "past" : "present";
}

const MONTH_DAY = { month: "short", day: "numeric" };

/** "Oct 4–5, 2026" / "Oct 31 – Nov 1, 2026" / "Oct 4, 2026". */
export function formatEventDateRange(startDate, endDate) {
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate || startDate);
  if (isNaN(start.getTime())) return "";
  const year = start.getFullYear();
  const a = start.toLocaleDateString("en-US", MONTH_DAY);
  if (isNaN(end.getTime()) || end.getTime() === start.getTime()) return `${a}, ${year}`;
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  const b = sameMonth
    ? end.toLocaleDateString("en-US", { day: "numeric" })
    : end.toLocaleDateString("en-US", MONTH_DAY);
  const sep = sameMonth ? "–" : " – ";
  return `${a}${sep}${b}, ${end.getFullYear()}`;
}

function firstName(name) {
  return (name || "").trim().split(/\s+/)[0] || "";
}

const ROLE_BLURB = {
  mentor: "I'll be helping teams ship something real.",
  judge: "Can't wait to see what the teams ship.",
  hacker: "We build it in a weekend, then keep it running.",
  volunteer: "Keeping the weekend running for the teams.",
};

/**
 * The long caption (LinkedIn, Facebook, WhatsApp, email). Always ends with
 * the landing-page URL so every post recruits.
 *
 * voice: "self" (the participant posting) | "other" (someone sharing them)
 * tense: "present" | "past" (see eventTense)
 */
export function buildCaption({ voice = "self", type, name, event, tense = "present", url }) {
  const role = ROLE_COPY[type] || ROLE_COPY.volunteer;
  const eventName = eventDisplayName(event);
  const verb = tense === "past" ? role.past : role.present;
  const subject = voice === "self" ? (tense === "past" ? "I" : "I'm") : `${name || "A friend"} ${tense === "past" ? "" : "is"}`.replace(/\s+$/, "");
  const opener = `${subject} ${verb} ${eventName}`;
  const what = "a weekend where engineers build free software for nonprofits, then keep it running after the hackathon ends.";
  const blurb = voice === "self" ? ` ${ROLE_BLURB[type] || ""}`.replace(/\s+$/, "") : "";
  const ask =
    tense === "past"
      ? "Want in next time? Hackers, mentors and judges are all welcome:"
      : "Want to build something that matters? Hackers, mentors and judges are all welcome:";
  return `${opener} — ${what}${blurb}\n\n${ask} ${url}\n\n${HASHTAGS}`;
}

/** A short caption for X: stays under ~240 chars including the URL. */
export function buildShortCaption({ voice = "self", type, name, event, tense = "present", url }) {
  const role = ROLE_COPY[type] || ROLE_COPY.volunteer;
  const eventName = eventDisplayName(event);
  const verb = tense === "past" ? role.past : role.present;
  const subject = voice === "self" ? (tense === "past" ? "I" : "I'm") : `${name || "A friend"} ${tense === "past" ? "" : "is"}`.replace(/\s+$/, "");
  const full = `${subject} ${verb} ${eventName} — engineers building free software for nonprofits. Come hack, mentor or judge: ${url} #TechForGood`;
  if (full.length <= X_LIMIT) return full;
  return `${subject} ${verb} ${eventName}. Come hack, mentor or judge: ${url} #TechForGood`;
}

/**
 * Per-platform share links. `caption`/`shortCaption` must contain `pageUrl`
 * verbatim; it is swapped for a UTM-tagged copy per network.
 *
 * - linkedinPost: opens the LinkedIn composer with the caption prefilled
 *   (undocumented `shareActive`/`text` params — the kit also copies the
 *   caption to the clipboard first, as insurance).
 * - linkedinLink / facebook: classic link shares; the page's OG tags unfurl
 *   the personalized card.
 */
export function buildShareLinks({ pageUrl, eventId, event, caption, shortCaption }) {
  const tagged = (source) => withUtm(pageUrl, { source, campaign: eventId });
  const swap = (text, source) => (text || "").split(pageUrl).join(tagged(source));
  return {
    linkedinPost: `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(swap(caption, "linkedin"))}`,
    linkedinLink: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(tagged("linkedin"))}`,
    x: `https://x.com/intent/post?text=${encodeURIComponent(swap(shortCaption, "x"))}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(tagged("facebook"))}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(swap(caption, "whatsapp"))}`,
    email: `mailto:?subject=${encodeURIComponent(`Join me at ${eventDisplayName(event)}`)}&body=${encodeURIComponent(swap(caption, "email"))}`,
    copyLink: tagged("copy"),
  };
}

export function monogram(name) {
  return (name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

/** Same rule as VolunteerList.getVolunteerImage: Drive links can't be embedded. */
export function usablePhotoUrl(photoUrl) {
  if (!photoUrl || typeof photoUrl !== "string") return null;
  if (photoUrl.includes("drive.google.com")) return null;
  if (!/^https?:\/\//i.test(photoUrl)) return null;
  // Uploads are stored as "https://cdn.ohack.dev//judges/…" (double slash);
  // same fix as src/lib/imageUtils.js normalizeImageUrl.
  return photoUrl.replace(/^(https?:\/\/[^/]+)\/\/+/, "$1/");
}

function firstString(...values) {
  for (const v of values) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

/**
 * The allowlisted projection of a public volunteer doc that the card, the
 * landing page and the kit use. `null` unless the person is on the roster
 * (isSelected) — the share surfaces must never widen what the roster shows.
 */
export function publicVolunteerForCard(doc) {
  if (!doc || !doc.isSelected || !doc.id) return null;
  const name = firstString(doc.name);
  if (!name) return null;
  const org = firstString(doc.company, doc.companyName, doc.schoolOrganization);
  const title = firstString(doc.title);
  return {
    id: String(doc.id),
    name,
    photoUrl: usablePhotoUrl(doc.photoUrl),
    subtitle: [org, title].filter(Boolean).join(" · "),
  };
}

/** Lean event fields the share surfaces need (keeps page props small). */
export function leanEventForCard(event) {
  if (!event) return null;
  return {
    event_id: event.event_id || event.id || "",
    title: event.title || "",
    start_date: event.start_date || null,
    end_date: event.end_date || null,
    location: event.location || "",
    timezone: event.timezone || null,
  };
}

export function slugify(text) {
  return (text || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function shareImageFilename({ eventId, type, name, format }) {
  const parts = ["opportunity-hack", slugify(eventId), type, slugify(firstName(name)) || "card", format];
  return `${parts.filter(Boolean).join("-")}.png`;
}

/** Headline for the landing page + OG title: "Satish is judging Opportunity Hack Fall 2026". */
export function shareHeadline({ type, name, event, tense = "present" }) {
  const role = ROLE_COPY[type] || ROLE_COPY.volunteer;
  const verb = tense === "past" ? role.past : `is ${role.present}`;
  return `${name} ${verb} ${eventDisplayName(event)}`;
}

export function shareDescription({ type, event, tense = "present" }) {
  const role = ROLE_COPY[type] || ROLE_COPY.volunteer;
  const when = formatEventDateRange(event?.start_date, event?.end_date);
  const where = event?.location ? ` · ${shortLocation(event.location)}` : "";
  const lead = tense === "past" ? "Engineers built free software for nonprofits" : "Engineers build free software for nonprofits";
  return `${role.noun} at ${eventDisplayName(event)}${when ? ` · ${when}` : ""}${where}. ${lead} — hackers, mentors and judges are all welcome.`;
}
