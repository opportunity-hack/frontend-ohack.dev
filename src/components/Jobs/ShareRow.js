import React, { useState } from "react";
import { trackEvent } from "../../lib/ga";

// Share buttons for a job listing (copy link / LinkedIn / X). Plain refined
// .ohx-btn--ghost anchors so it works anywhere inside a <RefinedRoot>. The
// share text is pre-written so a supporter can post in one click.

export default function ShareRow({ url, title, slug, heading }) {
  const [copied, setCopied] = useState(false);

  const shareText = `${title} — a volunteer role at Opportunity Hack. Real portfolio work for social good:`;
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(shareText);

  const track = (method) => {
    trackEvent({
      action: "job_share",
      params: { event_label: slug, method },
    });
  };

  const handleCopy = async () => {
    track("copy_link");
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // Clipboard API unavailable (http / permissions) — best effort only
      window.prompt("Copy this link:", url);
    }
  };

  return (
    <div>
      {heading && (
        <p
          className="ohx-muted"
          style={{ marginTop: 0, marginBottom: 12, fontWeight: 600 }}
        >
          {heading}
        </p>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <button
          type="button"
          className="ohx-btn ohx-btn--ghost"
          onClick={handleCopy}
          style={{ cursor: "pointer" }}
        >
          {copied ? "Link copied ✓" : "Copy link"}
        </button>
        <a
          className="ohx-btn ohx-btn--ghost"
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("linkedin")}
        >
          Share on LinkedIn
        </a>
        <a
          className="ohx-btn ohx-btn--ghost"
          href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("x")}
        >
          Share on X
        </a>
      </div>
    </div>
  );
}
