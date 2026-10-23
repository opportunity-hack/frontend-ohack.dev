// Client-rendered body of /cert/[cert_id] (the page itself is ISR so the
// signed certificate PNG unfurls as the og:image — see pages/cert/[cert_id].js).
// Refined chrome: editorial masthead, the certificate in a framed 1:1 card,
// Fraunces stat tiles, ONE primary download action + soft share links.
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { normalizeImageUrl } from "../../lib/imageUtils";
import {
  RefinedPage,
  BackLink,
  PageMasthead,
  CtaBand,
} from "../design/RefinedPage";
import { Eyebrow, Stat } from "../design/refined";

const SITE_URL = "https://www.ohack.dev";

// Payload shape (GET /api/certificates/<id>):
// { author_name, certificate_url, date, file_id, repository_url,
//   stats: { commits, files, hours, lines_of_code },
//   totals: { commits, files, hours, lines_of_code } }

const repoNameOf = (url) =>
  (url || "").replace(/\/$/, "").split("/").pop() || "";

const formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const fmt = (n) =>
  typeof n === "number" ? n.toLocaleString("en-US") : (n ?? "—");

const buttonReset = {
  background: "none",
  border: 0,
  padding: 0,
  cursor: "pointer",
  font: "inherit",
};

const cardStyle = { padding: "22px 24px" };

const skeletonLine = (width, height = 14) => (
  <div
    aria-hidden="true"
    style={{
      width,
      height,
      borderRadius: 6,
      background: "var(--surface-2)",
    }}
  />
);

const StatsSkeleton = () => (
  <div
    role="progressbar"
    aria-busy="true"
    aria-label="Loading certificate"
    style={{ display: "flex", flexDirection: "column", gap: 14 }}
  >
    {skeletonLine("40%", 10)}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
        gap: 18,
      }}
    >
      {skeletonLine("100%", 44)}
      {skeletonLine("100%", 44)}
      {skeletonLine("100%", 44)}
      {skeletonLine("100%", 44)}
    </div>
    {skeletonLine("60%")}
    {skeletonLine("45%")}
  </div>
);

const StatsCard = ({ cert }) => {
  const stats = cert.stats || {};
  const totals = cert.totals || {};
  const repoName = repoNameOf(cert.repository_url);
  return (
    <div className="ohx-card" style={{ ...cardStyle, minHeight: 240 }}>
      <Eyebrow>{cert.author_name}&apos;s contributions</Eyebrow>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
          gap: 18,
          marginTop: 14,
        }}
      >
        <Stat value={fmt(stats.hours)} label="Hours" />
        <Stat value={fmt(stats.commits)} label="Commits" />
        <Stat value={fmt(stats.lines_of_code)} label="Lines of code" />
        <Stat value={fmt(stats.files)} label="Files" />
      </div>
      <hr className="ohx-rule" style={{ margin: "20px 0" }} />
      <Eyebrow>Team totals</Eyebrow>
      <p className="ohx-muted" style={{ margin: "8px 0 0", fontSize: 14.5 }}>
        {fmt(totals.hours)} hours · {fmt(totals.commits)} commits ·{" "}
        {fmt(totals.lines_of_code)} lines of code · {fmt(totals.files)} files
      </p>
      <p className="ohx-faint" style={{ margin: "12px 0 0", fontSize: 13 }}>
        Issued {formatDate(cert.date)}
      </p>
      {cert.repository_url && (
        <a
          className="ohx-link"
          href={cert.repository_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ marginTop: 10, fontSize: 14.5 }}
        >
          {repoName || "Repository"} on GitHub ↗
        </a>
      )}
    </div>
  );
};

const ShareCard = ({ cert, shareUrl }) => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const copyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).catch(() => {});
    }
    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 3000);
  };

  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="ohx-card" style={cardStyle}>
      <Eyebrow>Share it</Eyebrow>
      <p className="ohx-muted" style={{ margin: "8px 0 0", fontSize: 14.5 }}>
        This link unfurls the signed certificate on LinkedIn, Slack and anywhere
        else you post it.
      </p>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "12px 20px",
          marginTop: 16,
          fontSize: 14.5,
        }}
      >
        <a
          className="ohx-btn ohx-btn--primary"
          href={normalizeImageUrl(cert.certificate_url)}
          target="_blank"
          rel="noopener noreferrer"
          download
        >
          Download certificate
        </a>
        <button
          type="button"
          className="ohx-link"
          style={buttonReset}
          onClick={copyLink}
        >
          Copy link
        </button>
        <a
          className="ohx-link"
          href={linkedInUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Share on LinkedIn ↗
        </a>
      </div>
      <span
        role="status"
        aria-live="polite"
        className="ohx-faint"
        style={{ display: "block", minHeight: 18, fontSize: 13, marginTop: 8 }}
      >
        {copied ? "Link copied" : ""}
      </span>
    </div>
  );
};

const CertInfoIndex = () => {
  const router = useRouter();
  const { cert_id } = router.query;

  const [cert, setCert] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  useEffect(() => {
    // The ISR fallback render has no query yet — wait for a real id.
    if (!cert_id) return undefined;
    const controller = new AbortController();
    setStatus("loading");
    fetch(
      `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/certificates/${encodeURIComponent(cert_id)}`,
      { signal: controller.signal },
    )
      .then((res) =>
        res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`)),
      )
      .then((data) => {
        if (data && data.certificate_url) {
          setCert(data);
          setStatus("ready");
        } else {
          setStatus("error");
        }
      })
      .catch((err) => {
        if (err?.name !== "AbortError") setStatus("error");
      });
    return () => controller.abort();
  }, [cert_id]);

  const repoName = cert ? repoNameOf(cert.repository_url) : "";
  const shareUrl = `${SITE_URL}/cert/${cert?.file_id || cert_id || ""}`;

  let lead = "Verifying this certificate…";
  if (status === "ready") {
    lead = `Congratulations, ${cert.author_name}. Your commits to ${repoName || "a nonprofit project"} made a real difference for the community it serves — thank you for building for good.`;
  } else if (status === "error") {
    lead =
      "We couldn't find this certificate. The link may be out of date, or the certificate is still being generated.";
  }

  return (
    <RefinedPage>
      <BackLink href="/cert">All certificates</BackLink>
      <PageMasthead
        eyebrow={`Opportunity Hack · GitHub contribution certificate${repoName ? ` · ${repoName}` : ""}`}
        title="Contribution"
        italic="certificate."
        lead={lead}
      />

      {status === "error" ? (
        <div
          className="ohx-card"
          style={{ ...cardStyle, marginTop: 36, maxWidth: 560 }}
        >
          <Eyebrow>Not found</Eyebrow>
          <p className="ohx-muted" style={{ margin: "8px 0 16px" }}>
            Certificates are generated from merged GitHub commits after each
            event. If yours was just created, give it a few minutes and reload.
          </p>
          <BackLink href="/cert">Browse recent certificates</BackLink>
        </div>
      ) : (
        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
            gap: 24,
            marginTop: 36,
            alignItems: "start",
          }}
        >
          <figure className="ohx-card" style={{ margin: 0, padding: 12 }}>
            {/* Reserved 1:1 box (CWV): cert PNGs are square 1024×1024. */}
            <div
              style={{
                position: "relative",
                aspectRatio: "1 / 1",
                background: "var(--surface-2)",
                borderRadius: 6,
                overflow: "hidden",
              }}
            >
              {cert?.certificate_url && (
                <Image
                  src={normalizeImageUrl(cert.certificate_url)}
                  alt={`GitHub contribution certificate for ${cert.author_name}`}
                  fill
                  sizes="(max-width: 760px) 100vw, 520px"
                  style={{ objectFit: "contain" }}
                  priority
                />
              )}
            </div>
            <figcaption
              className="ohx-faint"
              style={{ fontSize: 13, padding: "10px 6px 2px" }}
            >
              Signed certificate · verified from GitHub commit history
            </figcaption>
          </figure>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {status === "ready" ? (
              <>
                <StatsCard cert={cert} />
                <ShareCard cert={cert} shareUrl={shareUrl} />
              </>
            ) : (
              <div
                className="ohx-card"
                style={{ ...cardStyle, minHeight: 240 }}
              >
                <StatsSkeleton />
              </div>
            )}
          </div>
        </section>
      )}

      <CtaBand
        eyebrow="Earn yours"
        title="Ready to ship code for a nonprofit?"
        body="Every commit to an Opportunity Hack project counts toward hearts, a certificate like this one, and a public portfolio recruiters can review."
        primary={{ href: "/hack", label: "Join a hackathon" }}
        secondary={{ href: "/about/hearts", label: "How hearts work" }}
      />
    </RefinedPage>
  );
};

export default CertInfoIndex;
