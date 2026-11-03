// /cert — recent GitHub contribution certificates. Refined (civic editorial):
// editorial masthead → framed wide photo → native search + quiet repo toggle
// tags → hairline certificate cards (reserved 1:1 image boxes) → navy CTA band.
// Fetch / filter / sort logic is unchanged from the previous version.
import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { useEnv } from "../../context/env.context";
import {
  RefinedPage,
  PageMasthead,
  CtaBand,
} from "../../components/design/RefinedPage";
import { Arrow } from "../../components/design/refined";

const CANONICAL = "https://www.ohack.dev/cert";
const HERO_PHOTO = "https://cdn.ohack.dev/ohack.dev/2023_hackathon_3.webp";
const SKELETON_COUNT = 6;

function formatDate(isoDate) {
  if (!isoDate) return "";
  try {
    return new Date(isoDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return isoDate;
  }
}

function getRepoName(url) {
  if (!url) return "Unknown";
  return url.replace(/\/$/, "").split("/").pop();
}

const inputStyle = {
  flex: "1 1 260px",
  minWidth: 0,
  font: "inherit",
  fontSize: "0.95rem",
  color: "var(--ink)",
  background: "var(--surface)",
  border: "1px solid var(--line)",
  borderRadius: 6,
  padding: "11px 14px",
  outline: "none",
};

const buttonReset = {
  background: "none",
  border: 0,
  padding: 0,
  cursor: "pointer",
  font: "inherit",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))",
  gap: 20,
};

const CertCardSkeleton = () => (
  <div className="ohx-card" aria-hidden="true" style={{ overflow: "hidden" }}>
    <div style={{ aspectRatio: "1 / 1", background: "var(--surface-2)" }} />
    <div style={{ padding: "16px 18px 18px" }}>
      <div
        style={{
          height: 16,
          width: "60%",
          borderRadius: 6,
          background: "var(--surface-2)",
        }}
      />
      <div
        style={{
          height: 12,
          width: "35%",
          marginTop: 10,
          borderRadius: 6,
          background: "var(--surface-2)",
        }}
      />
      <div
        style={{
          height: 12,
          width: "80%",
          marginTop: 14,
          borderRadius: 6,
          background: "var(--surface-2)",
        }}
      />
    </div>
  </div>
);

const CertCard = ({ cert }) => {
  const repoName = getRepoName(cert.repository_url);
  const stats = cert.stats || {};
  return (
    <article
      className="ohx-card ohx-card--hover"
      style={{ overflow: "hidden" }}
    >
      <Link
        href={`/cert/${cert.file_id}`}
        style={{ display: "block", textDecoration: "none" }}
        aria-label={`Certificate for ${cert.author_name}`}
      >
        {/* Reserved 1:1 box (CWV): cert PNGs are square 1024×1024. */}
        <div
          style={{
            position: "relative",
            aspectRatio: "1 / 1",
            background: "var(--surface-2)",
          }}
        >
          <Image
            src={cert.certificate_url}
            fill
            sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
            alt={`GitHub certificate for ${cert.author_name}`}
            style={{ objectFit: "cover" }}
          />
        </div>
      </Link>
      <div style={{ padding: "16px 18px 18px" }}>
        <h3
          className="ohx-display"
          style={{
            fontSize: 18,
            margin: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          <Link
            href={`/cert/${cert.file_id}`}
            style={{ color: "inherit", textDecoration: "none" }}
          >
            {cert.author_name}
          </Link>
        </h3>
        <p className="ohx-faint" style={{ margin: "4px 0 0", fontSize: 13 }}>
          {formatDate(cert.date)}
        </p>
        <a
          className="ohx-tag"
          href={cert.repository_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            marginTop: 12,
            maxWidth: "100%",
            textDecoration: "none",
          }}
          title={cert.repository_url}
        >
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {repoName}
          </span>
        </a>
        <p className="ohx-muted" style={{ margin: "12px 0 0", fontSize: 13.5 }}>
          {(stats.commits || 0).toLocaleString()} commits · {stats.hours || 0}h
          · {(stats.lines_of_code || 0).toLocaleString()} lines
        </p>
      </div>
    </article>
  );
};

export default function CertPage() {
  const { apiServerUrl } = useEnv();
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [repoFilter, setRepoFilter] = useState("all");

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${apiServerUrl}/api/certificates/recent`, {
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setCerts(data.certs || []))
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [apiServerUrl]);

  const repos = useMemo(() => {
    const repoMap = {};
    certs.forEach((cert) => {
      const name = getRepoName(cert.repository_url);
      repoMap[name] = (repoMap[name] || 0) + 1;
    });
    return Object.entries(repoMap).sort((a, b) => b[1] - a[1]);
  }, [certs]);

  const filtered = useMemo(() => {
    let result = certs;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (cert) =>
          (cert.author_name || "").toLowerCase().includes(q) ||
          (cert.repository_url || "").toLowerCase().includes(q),
      );
    }
    if (repoFilter !== "all") {
      result = result.filter(
        (cert) => getRepoName(cert.repository_url) === repoFilter,
      );
    }
    result.sort((a, b) => (b.stats?.commits || 0) - (a.stats?.commits || 0));
    return result;
  }, [certs, search, repoFilter]);

  const filtering = Boolean(search) || repoFilter !== "all";
  const clearFilters = () => {
    setSearch("");
    setRepoFilter("all");
  };

  const toggleStyle = (active) => ({
    cursor: "pointer",
    fontFamily: "inherit",
    background: active ? "var(--brand)" : "var(--surface)",
    color: active ? "#fff" : "var(--muted)",
    borderColor: active ? "var(--brand)" : "var(--line)",
  });

  return (
    <>
      <Head>
        <title>GitHub Certificates | Opportunity Hack</title>
      </Head>

      <RefinedPage>
        <PageMasthead
          eyebrow="Recognition · GitHub certificates"
          title="Certificates for code that"
          italic="shipped."
          lead="Every line of code counts. These certificates recognize the GitHub contributions of volunteers who donated their skills to build technology for nonprofits through Opportunity Hack."
        />

        <figure
          className="ohx-card"
          style={{ margin: "36px 0 0", padding: 0, overflow: "hidden" }}
        >
          {/* Reserved wide box (CWV) — also the page's og:image. */}
          <div
            style={{
              position: "relative",
              aspectRatio: "2.4 / 1",
              minHeight: 180,
              background: "var(--surface-2)",
            }}
          >
            <Image
              src={HERO_PHOTO}
              fill
              sizes="(max-width: 1120px) 100vw, 1120px"
              alt="Opportunity Hack volunteers coding together at a hackathon for nonprofits"
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
        </figure>

        {/* Search + repo filter */}
        <section style={{ marginTop: 40 }} aria-label="Find a certificate">
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              alignItems: "center",
            }}
          >
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by contributor or repository…"
              aria-label="Search certificates"
              style={inputStyle}
            />
            <p
              className="ohx-faint"
              role="status"
              style={{ margin: 0, fontSize: 13.5, minWidth: "12ch" }}
            >
              {loading
                ? "Loading…"
                : `${filtered.length} certificate${filtered.length !== 1 ? "s" : ""}${filtering ? " found" : ""}`}
            </p>
            {filtering && (
              <button
                type="button"
                className="ohx-link"
                style={{ ...buttonReset, fontSize: "0.9rem" }}
                onClick={clearFilters}
              >
                Clear <Arrow />
              </button>
            )}
          </div>
          {repos.length > 1 && (
            <div
              role="group"
              aria-label="Filter by repository"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 16,
              }}
            >
              <button
                type="button"
                className="ohx-tag"
                aria-pressed={repoFilter === "all"}
                onClick={() => setRepoFilter("all")}
                style={toggleStyle(repoFilter === "all")}
              >
                All ({certs.length})
              </button>
              {repos.map(([name, count]) => (
                <button
                  key={name}
                  type="button"
                  className="ohx-tag"
                  aria-pressed={repoFilter === name}
                  onClick={() => setRepoFilter(name)}
                  style={toggleStyle(repoFilter === name)}
                >
                  {name} ({count})
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Certificate grid */}
        <section style={{ marginTop: 28 }} aria-label="Certificates">
          {loading ? (
            <div
              role="progressbar"
              aria-busy="true"
              aria-label="Loading certificates"
              style={gridStyle}
            >
              {Array.from({ length: SKELETON_COUNT }, (_, i) => (
                <CertCardSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div style={gridStyle}>
              {filtered.map((cert) => (
                <CertCard key={cert.file_id} cert={cert} />
              ))}
            </div>
          ) : (
            <div
              className="ohx-card"
              style={{ padding: "36px 28px", textAlign: "center" }}
            >
              <p className="ohx-muted" style={{ margin: 0 }}>
                {certs.length === 0
                  ? "No certificates have been generated yet."
                  : "No certificates match your search."}
              </p>
              {filtering && (
                <button
                  type="button"
                  className="ohx-link"
                  style={{ ...buttonReset, marginTop: 12 }}
                  onClick={clearFilters}
                >
                  Clear filters <Arrow />
                </button>
              )}
            </div>
          )}
        </section>

        <CtaBand
          eyebrow="Earn yours"
          title="Want a certificate with your name on it?"
          body="Contribute code to a nonprofit project at an Opportunity Hack event and earn a personalized GitHub certificate recognizing your impact."
          primary={{ href: "/hack", label: "Join a hackathon" }}
          secondary={{ href: "/about/hearts", label: "How hearts work" }}
        />
        <p style={{ marginTop: 14, fontSize: 14, color: "var(--muted)" }}>
          See who leads the way:{" "}
          <Link href="/community-champions" className="ohx-link">
            Community champions <Arrow />
          </Link>
        </p>
      </RefinedPage>
    </>
  );
}

export const getStaticProps = async () => {
  const title =
    "GitHub Certificates - Recognizing Open Source Contributors | Opportunity Hack";
  const description =
    "View GitHub contribution certificates earned by Opportunity Hack volunteers who donated their coding skills to build technology solutions for nonprofits.";

  return {
    props: {
      title,
      description,
      canonical: CANONICAL,
      openGraphData: [
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: CANONICAL },
        { property: "og:image", content: HERO_PHOTO },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: HERO_PHOTO },
      ],
    },
  };
};
