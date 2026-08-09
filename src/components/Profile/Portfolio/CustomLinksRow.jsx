import React from "react";
import LaunchIcon from "@mui/icons-material/Launch";

function domainOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch (err) {
    return url;
  }
}

/** The user's own links (portfolio site, socials) as quiet .ohx-links. */
export default function CustomLinksRow({ links }) {
  if (!Array.isArray(links) || links.length === 0) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 18px", marginTop: 4 }}>
      {links.map((link, i) => (
        <a
          key={`${link.url}-${i}`}
          className="ohx-link"
          href={link.url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.92rem" }}
        >
          {link.label || domainOf(link.url)}
          <LaunchIcon sx={{ fontSize: 13, color: "var(--faint)" }} />
        </a>
      ))}
    </div>
  );
}
