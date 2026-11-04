// The share kit: pick a format, download the card (or hand it to the phone's
// share sheet), copy a ready caption, post. Only ever renders inside a
// <RefinedRoot> (the share page), so .ohx-* classes and the CSS-var tokens
// are available. No MUI — native controls styled with the refined tokens.
//
// Every subcomponent is module-scope (SectionBlock remount lesson).

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { trackEvent } from "../../lib/ga";
import { FONT_BODY } from "../../styles/fonts";
import {
  DEFAULT_FORMAT,
  ROLE_COPY,
  SHARE_FORMATS,
  THREADS_LIMIT,
  absoluteUrl,
  buildCaption,
  buildShareLinks,
  buildShortCaption,
  eventDisplayName,
  shareImageFilename,
  shareImagePath,
  sharePagePath,
} from "../../lib/shareCard";

const X_LIMIT = 280;
const FORMAT_KEYS = Object.keys(SHARE_FORMATS);

const ga = (action, params) =>
  trackEvent({ action, params: { page: "share_card", ...params } });

function firstName(name) {
  return (name || "").trim().split(/\s+/)[0] || "them";
}

async function copyText(text) {
  if (typeof navigator === "undefined" || !navigator.clipboard) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function canShareFiles() {
  if (
    typeof navigator === "undefined" ||
    !navigator.canShare ||
    !navigator.share
  )
    return false;
  try {
    return navigator.canShare({
      files: [new File([""], "card.png", { type: "image/png" })],
    });
  } catch {
    return false;
  }
}

const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    const id = setTimeout(onClose, 4500);
    return () => clearTimeout(id);
  }, [toast, onClose]);
  return (
    <div
      role="status"
      style={{
        position: "fixed",
        left: "50%",
        bottom: 24,
        transform: "translateX(-50%)",
        zIndex: 1400,
        maxWidth: "92vw",
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 16px",
        borderRadius: 8,
        fontFamily: FONT_BODY,
        fontSize: "0.92rem",
        color: "#fff",
        background: toast.severity === "error" ? "#b23a18" : "#1B3A6B",
        boxShadow: "0 14px 40px -16px rgba(22,24,29,0.5)",
      }}
    >
      <span>{toast.message}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        style={{
          background: "none",
          border: 0,
          color: "#fff",
          fontSize: "1.1rem",
          cursor: "pointer",
          lineHeight: 1,
          opacity: 0.85,
        }}
      >
        ×
      </button>
    </div>
  );
};

const StepHeading = ({ n, children }) => (
  <div
    style={{
      display: "flex",
      alignItems: "baseline",
      gap: 12,
      marginBottom: 10,
    }}
  >
    <span
      aria-hidden="true"
      className="ohx-display"
      style={{ fontSize: 22, color: "var(--accent)", minWidth: "1.2em" }}
    >
      {n}
    </span>
    <h3 className="ohx-display" style={{ fontSize: 20, margin: 0 }}>
      {children}
    </h3>
  </div>
);

const FormatToggle = ({ format, onChange }) => (
  <div
    role="group"
    aria-label="Image format"
    style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
  >
    {FORMAT_KEYS.map((key) => {
      const f = SHARE_FORMATS[key];
      const active = key === format;
      return (
        <button
          key={key}
          type="button"
          aria-pressed={active}
          onClick={() => onChange(key)}
          className="ohx-tag"
          style={{
            cursor: "pointer",
            fontSize: 12,
            padding: "0.45em 1em",
            ...(active
              ? {
                  background: "var(--brand)",
                  color: "#fff",
                  borderColor: "var(--brand)",
                }
              : {}),
          }}
        >
          {f.label}
          <span
            style={{
              opacity: active ? 0.8 : 0.7,
              marginLeft: 6,
              fontWeight: 400,
            }}
          >
            {f.width}×{f.height}
          </span>
        </button>
      );
    })}
  </div>
);

const Preview = ({ src, format, alt }) => {
  const { width, height } = SHARE_FORMATS[format];
  const [loaded, setLoaded] = useState(false);
  useEffect(() => setLoaded(false), [src]);
  const story = format === "story";
  return (
    <div
      style={{
        width: "100%",
        maxWidth: story ? 300 : 720,
        aspectRatio: `${width} / ${height}`,
        margin: story ? "0 auto" : 0,
        background: "var(--surface-2)",
        border: "1px solid var(--line)",
        borderRadius: 8,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {!loaded && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--muted)",
            fontSize: 13,
          }}
        >
          Rendering your card…
        </div>
      )}
      <img
        key={src}
        src={src}
        alt={alt}
        width={width}
        height={height}
        onLoad={() => setLoaded(true)}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          opacity: loaded ? 1 : 0,
          transition: "opacity .2s",
        }}
      />
    </div>
  );
};

const VoiceToggle = ({ voice, name, onChange }) => (
  <div
    role="radiogroup"
    aria-label="Who is posting"
    style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}
  >
    <span className="ohx-eyebrow" style={{ marginRight: 4 }}>
      Caption
    </span>
    {[
      { key: "self", label: "I'm posting this myself" },
      { key: "other", label: `I'm sharing ${firstName(name)}'s card` },
    ].map((opt) => {
      const active = voice === opt.key;
      return (
        <button
          key={opt.key}
          type="button"
          role="radio"
          aria-checked={active}
          onClick={() => onChange(opt.key)}
          className="ohx-tag"
          style={{
            cursor: "pointer",
            fontSize: 12,
            padding: "0.45em 1em",
            ...(active
              ? {
                  background: "var(--brand)",
                  color: "#fff",
                  borderColor: "var(--brand)",
                }
              : {}),
          }}
        >
          {opt.label}
        </button>
      );
    })}
  </div>
);

const buttonRow = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  alignItems: "center",
};

/**
 * props: { event, type, volunteer:{id,name,photoUrl,subtitle}, voice,
 *          onVoiceChange?, tense, initialFormat? }
 */
export default function ShareKit({
  event,
  type,
  volunteer,
  voice = "self",
  onVoiceChange,
  tense = "present",
  initialFormat = DEFAULT_FORMAT,
}) {
  const [format, setFormat] = useState(initialFormat);
  const [toast, setToast] = useState(null);
  const [filesShareable, setFilesShareable] = useState(false);
  const [sharingFile, setSharingFile] = useState(false);
  const closeToast = useCallback(() => setToast(null), []);

  useEffect(() => setFilesShareable(canShareFiles()), []);

  const eventId = event?.event_id;
  const pagePath = sharePagePath(eventId, type, volunteer.id);
  const pageUrl = absoluteUrl(pagePath);
  const role = ROLE_COPY[type] || ROLE_COPY.volunteer;
  const eventName = eventDisplayName(event);

  const defaultCaption = useMemo(
    () =>
      buildCaption({
        voice,
        type,
        name: volunteer.name,
        event,
        tense,
        url: pageUrl,
      }),
    [voice, type, volunteer.name, event, tense, pageUrl],
  );
  const [caption, setCaption] = useState(defaultCaption);
  useEffect(() => setCaption(defaultCaption), [defaultCaption]);

  const shortCaption = useMemo(
    () =>
      buildShortCaption({
        voice,
        type,
        name: volunteer.name,
        event,
        tense,
        url: pageUrl,
      }),
    [voice, type, volunteer.name, event, tense, pageUrl],
  );
  const links = useMemo(
    () => buildShareLinks({ pageUrl, eventId, event, caption, shortCaption }),
    [pageUrl, eventId, event, caption, shortCaption],
  );

  const imageSrc = shareImagePath(eventId, type, volunteer.id, format);
  const downloadHref = `${imageSrc}&download=1`;
  const filename = shareImageFilename({
    eventId,
    type,
    name: volunteer.name,
    format,
  });
  const alt = `${volunteer.name} — ${role.noun} at ${eventName}`;

  const notify = (message, severity = "success") =>
    setToast({ message, severity, at: Date.now() });

  const onFormat = (key) => {
    setFormat(key);
    ga("share_card_format", { event_label: key, event_id: eventId });
  };

  const onDownload = () =>
    ga("share_card_download", { event_label: format, event_id: eventId });

  // Fetch the PNG and hand it to the phone's share sheet. `label` is the GA
  // label (the format, or the platform that triggered it).
  const shareImage = async (label) => {
    setSharingFile(true);
    try {
      const res = await fetch(imageSrc);
      if (!res.ok) throw new Error(`Image ${res.status}`);
      const blob = await res.blob();
      const file = new File([blob], filename, { type: "image/png" });
      await navigator.share({ files: [file], text: caption });
      ga("share_card_native_share", { event_label: label, event_id: eventId });
    } catch (err) {
      if (err?.name !== "AbortError")
        notify(
          "Couldn't open the share sheet — download the image instead.",
          "error",
        );
    } finally {
      setSharingFile(false);
    }
  };

  const onShareFile = () => shareImage(format);

  const onCopyCaption = async () => {
    const ok = await copyText(caption);
    notify(
      ok ? "Caption copied." : "Couldn't copy — select the text and copy it.",
      ok ? "success" : "error",
    );
    if (ok)
      ga("share_card_copy_caption", { event_label: voice, event_id: eventId });
  };

  const onPlatform = (key) => async () => {
    ga("share_card_share", { event_label: key, event_id: eventId, voice });
    if (key === "linkedin_post") {
      const ok = await copyText(caption);
      notify(
        ok
          ? "Caption copied — paste it if LinkedIn didn't prefill it, then attach your image."
          : "Opening LinkedIn — paste your caption and attach the image.",
      );
    } else if (key === "threads") {
      const ok = await copyText(caption);
      notify(
        ok
          ? "Caption copied — paste it if Threads didn't prefill it, then attach your image."
          : "Opening Threads — paste your caption and attach the image.",
      );
    } else if (key === "facebook") {
      const ok = await copyText(caption);
      notify(
        ok
          ? "Caption copied — Facebook shares the link (your card unfurls); paste the caption as your post text."
          : "Opening Facebook — the link unfurls with your card; add your caption as the post text.",
      );
    }
  };

  // Instagram has no web composer to prefill. On a phone the share sheet
  // (with the PNG attached) is the real path — Instagram shows up there;
  // elsewhere we open instagram.com with the caption on the clipboard and
  // say what to do.
  const onInstagram = (e) => {
    ga("share_card_share", {
      event_label: "instagram",
      event_id: eventId,
      voice,
    });
    copyText(caption); // not awaited — navigator.share needs the click's activation
    if (filesShareable) {
      e.preventDefault();
      notify(
        "Caption copied — pick Instagram in the share sheet, then paste the caption.",
      );
      shareImage("instagram");
      return;
    }
    notify(
      "Caption copied — in Instagram tap Create, upload the PNG you saved (Square for the feed, Story for stories) and paste the caption.",
    );
  };

  const onCopyLink = async () => {
    const ok = await copyText(links.copyLink);
    notify(
      ok ? "Link copied." : "Couldn't copy the link.",
      ok ? "success" : "error",
    );
    if (ok)
      ga("share_card_share", {
        event_label: "copy_link",
        event_id: eventId,
        voice,
      });
  };

  const xLength = shortCaption.length;

  return (
    <div
      className="ohx-card"
      style={{ padding: "clamp(18px, 3vw, 30px)", display: "grid", gap: 28 }}
    >
      {onVoiceChange && (
        <VoiceToggle
          voice={voice}
          name={volunteer.name}
          onChange={onVoiceChange}
        />
      )}

      <div style={{ display: "grid", gap: 14 }}>
        <FormatToggle format={format} onChange={onFormat} />
        <Preview src={imageSrc} format={format} alt={alt} />
        <p className="ohx-muted" style={{ margin: 0, fontSize: 13 }}>
          {SHARE_FORMATS[format].hint}. Each size is rendered with your photo,
          name and role.
        </p>
      </div>

      <section aria-labelledby="kit-step-1">
        <StepHeading n="1">
          <span id="kit-step-1">Save the image</span>
        </StepHeading>
        <div style={buttonRow}>
          <a
            className="ohx-btn ohx-btn--primary"
            href={downloadHref}
            download={filename}
            onClick={onDownload}
          >
            Download PNG
          </a>
          {filesShareable && (
            <button
              type="button"
              className="ohx-btn ohx-btn--ghost"
              onClick={onShareFile}
              disabled={sharingFile}
            >
              {sharingFile ? "Preparing…" : "Share image…"}
            </button>
          )}
          <span className="ohx-muted" style={{ fontSize: 13 }}>
            Posting the image itself reaches more people than a link on LinkedIn
            and Instagram.
          </span>
        </div>
      </section>

      <section aria-labelledby="kit-step-2">
        <StepHeading n="2">
          <span id="kit-step-2">Copy a caption</span>
        </StepHeading>
        <label
          htmlFor="share-caption"
          className="ohx-muted"
          style={{ display: "block", fontSize: 13, marginBottom: 6 }}
        >
          Edit it however you like — the link at the end brings people to your
          page.
        </label>
        <textarea
          id="share-caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={7}
          style={{
            width: "100%",
            boxSizing: "border-box",
            fontFamily: FONT_BODY,
            fontSize: 15,
            lineHeight: 1.55,
            color: "var(--ink)",
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 6,
            padding: "12px 14px",
            resize: "vertical",
          }}
        />
        <div
          style={{
            ...buttonRow,
            marginTop: 10,
            justifyContent: "space-between",
          }}
        >
          <div style={buttonRow}>
            <button
              type="button"
              className="ohx-btn ohx-btn--primary"
              onClick={onCopyCaption}
            >
              Copy caption
            </button>
            {caption !== defaultCaption && (
              <button
                type="button"
                className="ohx-link"
                style={{
                  background: "none",
                  border: 0,
                  cursor: "pointer",
                  padding: 0,
                }}
                onClick={() => setCaption(defaultCaption)}
              >
                Reset
              </button>
            )}
          </div>
          <span className="ohx-faint" style={{ fontSize: 12 }}>
            X gets a shorter version ({xLength}/{X_LIMIT})
            {caption.length > THREADS_LIMIT
              ? ` · so does Threads (caption is over ${THREADS_LIMIT})`
              : ""}
          </span>
        </div>
      </section>

      <section aria-labelledby="kit-step-3">
        <StepHeading n="3">
          <span id="kit-step-3">Post it</span>
        </StepHeading>
        <div style={buttonRow}>
          <a
            className="ohx-btn ohx-btn--primary"
            href={links.linkedinPost}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onPlatform("linkedin_post")}
          >
            Open LinkedIn
          </a>
          <a
            className="ohx-btn ohx-btn--ghost"
            href={links.instagram}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onInstagram}
            aria-disabled={sharingFile || undefined}
          >
            Instagram
          </a>
          <a
            className="ohx-btn ohx-btn--ghost"
            href={links.facebook}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onPlatform("facebook")}
          >
            Facebook
          </a>
          <a
            className="ohx-btn ohx-btn--ghost"
            href={links.threads}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onPlatform("threads")}
          >
            Threads
          </a>
          <a
            className="ohx-btn ohx-btn--ghost"
            href={links.x}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onPlatform("x")}
          >
            Post on X
          </a>
          <a
            className="ohx-btn ohx-btn--ghost"
            href={links.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onPlatform("whatsapp")}
          >
            WhatsApp
          </a>
          <a
            className="ohx-btn ohx-btn--ghost"
            href={links.email}
            onClick={onPlatform("email")}
          >
            Email
          </a>
          <button
            type="button"
            className="ohx-btn ohx-btn--ghost"
            onClick={onCopyLink}
          >
            Copy link
          </button>
        </div>
        <p
          className="ohx-muted"
          style={{ margin: "12px 0 0", fontSize: 13, lineHeight: 1.55 }}
        >
          LinkedIn and Threads open with the caption prefilled — attach the
          image you downloaded. Instagram has no web composer: save the Square
          (feed) or Story size, create the post in the app, paste the caption.
          Facebook shares the link, which unfurls with your card. Prefer just
          the link on LinkedIn too?{" "}
          <a
            className="ohx-link"
            href={links.linkedinLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onPlatform("linkedin_link")}
          >
            Share the link
          </a>
          .
        </p>
      </section>

      {toast && <Toast toast={toast} onClose={closeToast} />}
    </div>
  );
}
