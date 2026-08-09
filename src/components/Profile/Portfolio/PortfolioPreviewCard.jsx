import React from "react";
import LaunchIcon from "@mui/icons-material/Launch";
import {
  buildTitle,
  buildDescription,
  buildOgImage,
  canonicalPathForProfile,
} from "../../../lib/portfolioMeta";
import { Arrow } from "../../design/refined";

/**
 * WYSIWYG unfurl preview — built with the SAME portfolioMeta helpers the SSR
 * pages use, so what's shown here is exactly what LinkedIn/Slack render.
 */
export default function PortfolioPreviewCard({ profile, visibility }) {
  const previewProfile = { ...profile, profile_visibility: visibility };
  const title = buildTitle(previewProfile);
  const description = buildDescription(previewProfile);
  const { image } = buildOgImage(previewProfile);
  const path = canonicalPathForProfile(previewProfile);

  return (
    <div>
      <div className="ohx-card" style={{ maxWidth: 460, overflow: "hidden", padding: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt=""
          width={460}
          height={240}
          loading="lazy"
          style={{ width: "100%", height: 160, objectFit: "cover", display: "block", background: "var(--surface-2)", borderBottom: "1px solid var(--line)" }}
        />
        <div style={{ padding: "12px 16px 14px" }}>
          <div className="ohx-eyebrow" style={{ fontSize: "0.6rem" }}>www.ohack.dev</div>
          <div style={{ fontWeight: 600, marginTop: 4, fontSize: "0.95rem", lineHeight: 1.3 }}>{title}</div>
          <div className="ohx-muted" style={{ marginTop: 4, fontSize: "0.85rem", lineHeight: 1.4 }}>{description}</div>
        </div>
      </div>
      <p className="ohx-muted" style={{ margin: "10px 0 14px", fontSize: "0.85rem" }}>
        How your link previews when shared on LinkedIn, Slack, or X.
      </p>
      <a
        className="ohx-btn ohx-btn--primary"
        href={path}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
      >
        View my portfolio <Arrow />
        <LaunchIcon sx={{ fontSize: 14 }} />
      </a>
    </div>
  );
}
