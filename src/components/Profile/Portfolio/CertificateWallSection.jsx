import React from "react";
import Link from "next/link";
import Image from "next/image";
import { normalizeImageUrl } from "../../../lib/imageUtils";

/**
 * Wall of certificate PNGs (all 1024×1024 squares on cdn.ohack.dev).
 * Git-fame GitHub certs link to their verifiable /cert/<file_id> page;
 * heart certificates open the image itself.
 */
export default function CertificateWallSection({ certificates }) {
  const githubCerts = certificates?.github_certificates || [];
  const heartCerts = certificates?.heart_certificates || [];
  if (githubCerts.length === 0 && heartCerts.length === 0) return null;

  const tiles = [
    ...githubCerts.map((cert) => ({
      key: `gh-${cert.file_id}`,
      image: normalizeImageUrl(cert.certificate_url),
      href: cert.file_id ? `/cert/${cert.file_id}` : normalizeImageUrl(cert.certificate_url),
      external: !cert.file_id,
      tag: "GitHub",
      caption: cert.repository_url ? cert.repository_url.split("/").slice(-1)[0] : null,
    })),
    ...heartCerts.map((cert, i) => ({
      key: `heart-${i}`,
      image: normalizeImageUrl(cert.url),
      href: normalizeImageUrl(cert.url),
      external: true,
      tag: "Hearts",
      caption: Array.isArray(cert.reasons) && cert.reasons.length ? cert.reasons.join(", ").replace(/_/g, " ") : null,
    })),
  ].filter((t) => t.image);

  return (
    <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
      {tiles.map((tile) => {
        const frame = (
          <>
            <span style={{ position: "relative", display: "block", width: "100%", aspectRatio: "1 / 1", borderRadius: 4, overflow: "hidden", border: "1px solid var(--line)", background: "var(--surface-2)" }}>
              <Image
                src={tile.image}
                alt={`${tile.tag} certificate${tile.caption ? ` — ${tile.caption}` : ""}`}
                fill
                sizes="(max-width: 600px) 45vw, 180px"
                style={{ objectFit: "cover" }}
                loading="lazy"
              />
            </span>
            <span style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 8 }}>
              <span className="ohx-tag" style={{ fontSize: "0.62rem" }}>{tile.tag}</span>
              {tile.caption && (
                <span className="ohx-muted" style={{ fontSize: "0.78rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tile.caption}</span>
              )}
            </span>
          </>
        );

        return tile.external ? (
          <a key={tile.key} href={tile.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", minWidth: 0 }}>
            {frame}
          </a>
        ) : (
          <Link key={tile.key} href={tile.href} style={{ textDecoration: "none", minWidth: 0 }}>
            {frame}
          </Link>
        );
      })}
    </div>
  );
}
