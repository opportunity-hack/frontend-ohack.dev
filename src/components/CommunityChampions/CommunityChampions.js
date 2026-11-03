import React, { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useEnv } from "../../context/env.context";
import { TIERS, getTierForHearts, formatHearts } from "../../lib/heartTiers";
import { trackEvent } from "../../lib/ga";
import { serializeJsonLd } from "../../lib/jsonLd";
import { RefinedRoot, Eyebrow, Arrow } from "../design/refined";
import { CtaBand } from "../design/RefinedPage";

/*
 * /community-champions — the public hearts leaderboard.
 * Civic-editorial design: one <h1>, a framed (not full-bleed) hero photo,
 * native search + quiet toggle-tag filters, and people rendered as calm
 * hairline rows (list, default) or small text-led cards (grid). No avatar
 * wall, no tier-colored backgrounds — tier color only as a small dot.
 *
 * Data: GET /api/hearts/leaderboard?limit=50 → { leaderboard: [{ userId,
 * name, totalHearts, profileImage }] } sorted by hearts desc. `userId` is the
 * Firestore user doc id, so /profile/<userId> is the right link.
 *
 * All subcomponents are module-scope (never define them inside the render
 * body — the list would remount on every keystroke in the search box).
 */

const HERO_PHOTO = "https://cdn.ohack.dev/ohack.dev/2023_hackathon_4.webp";
const LIST_MIN_HEIGHT = 480;
const SKELETON_ROWS = 8;
const VIEW_OPTIONS = [
  { value: "table", label: "List" },
  { value: "cards", label: "Grid" },
];

const tierOf = (entry) => getTierForHearts(entry.totalHearts);
const tierNameOf = (entry) => tierOf(entry)?.name || "Newcomer";
const displayName = (entry) => entry.name || "Community member";
const initialOf = (entry) => (entry.name || "?").trim().charAt(0).toUpperCase();

const toggleTagStyle = (active) => ({
  cursor: "pointer",
  fontFamily: "inherit",
  background: active ? "var(--brand)" : "var(--surface)",
  color: active ? "#fff" : "var(--muted)",
  borderColor: active ? "var(--brand)" : "var(--line)",
});

function TierDot({ color, size = 8 }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        border: "1px solid rgba(0,0,0,0.15)",
        display: "inline-block",
        flexShrink: 0,
      }}
    />
  );
}

function TierTag({ entry }) {
  const tier = tierOf(entry);
  return (
    <span className="ohx-tag" style={{ gap: 6 }}>
      {tier && <TierDot color={tier.color} />}
      {tierNameOf(entry)}
    </span>
  );
}

// Profile images come from Slack/Google/GitHub (not in next.config
// remotePatterns), so this is a plain <img> with explicit dimensions.
function ChampionAvatar({ entry, size }) {
  const [broken, setBroken] = useState(false);
  const alt = `${displayName(entry)}, Opportunity Hack ${tierNameOf(entry)} community champion`;
  if (entry.profileImage && !broken) {
    return (
      <img
        src={entry.profileImage}
        alt={alt}
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setBroken(true)}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          border: "1px solid var(--line)",
          background: "var(--surface-2)",
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <span
      role="img"
      aria-label={alt}
      className="ohx-display"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "var(--surface-2)",
        border: "1px solid var(--line)",
        color: "var(--brand)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.42,
        flexShrink: 0,
      }}
    >
      {initialOf(entry)}
    </span>
  );
}

const thStyle = {
  textAlign: "left",
  fontFamily: "var(--body)",
  fontWeight: 600,
  fontSize: 10,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--muted)",
  padding: "12px 14px",
  borderBottom: "1px solid var(--line)",
  whiteSpace: "nowrap",
};
const tdStyle = {
  padding: "10px 14px",
  borderBottom: "1px solid var(--line)",
  verticalAlign: "middle",
};

function ChampionTable({ entries, rankById }) {
  return (
    <table
      aria-label="Community champions ranked by hearts"
      style={{
        width: "100%",
        borderCollapse: "collapse",
        tableLayout: "fixed",
      }}
    >
      <colgroup>
        <col style={{ width: 48 }} />
        <col />
        <col style={{ width: 88 }} />
      </colgroup>
      <thead>
        <tr>
          <th scope="col" style={thStyle}>
            <span aria-hidden="true">#</span>
            <span
              className="sr-only"
              style={{ position: "absolute", left: -9999 }}
            >
              Rank
            </span>
          </th>
          <th scope="col" style={thStyle}>
            Champion
          </th>
          <th scope="col" style={{ ...thStyle, textAlign: "right" }}>
            Hearts
          </th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry, i) => {
          const last = i === entries.length - 1;
          const cell = last ? { ...tdStyle, borderBottom: "none" } : tdStyle;
          return (
            <tr key={entry.userId}>
              <td
                className="ohx-faint"
                style={{
                  ...cell,
                  fontFamily: "var(--display)",
                  fontSize: "1rem",
                }}
              >
                {rankById.get(entry.userId)}
              </td>
              <td style={{ ...cell, minWidth: 0 }}>
                <Link
                  href={`/profile/${entry.userId}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    textDecoration: "none",
                    color: "inherit",
                    minWidth: 0,
                  }}
                >
                  <ChampionAvatar entry={entry} size={40} />
                  <span style={{ minWidth: 0 }}>
                    <span
                      style={{
                        display: "block",
                        fontWeight: 600,
                        color: "var(--brand)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {displayName(entry)}
                    </span>
                    <span style={{ display: "inline-block", marginTop: 3 }}>
                      <TierTag entry={entry} />
                    </span>
                  </span>
                </Link>
              </td>
              <td
                className="ohx-display"
                style={{
                  ...cell,
                  textAlign: "right",
                  fontSize: "1.25rem",
                  color: "var(--brand)",
                  fontVariantNumeric: "tabular-nums",
                  whiteSpace: "nowrap",
                }}
              >
                {formatHearts(entry.totalHearts)}
                <span
                  className="ohx-faint"
                  style={{
                    fontFamily: "var(--body)",
                    fontSize: "0.75rem",
                    marginLeft: 4,
                  }}
                >
                  ♥
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function ChampionGrid({ entries, rankById }) {
  return (
    <ul
      aria-label="Community champions ranked by hearts"
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: 14,
      }}
    >
      {entries.map((entry) => (
        <li key={entry.userId}>
          <Link
            href={`/profile/${entry.userId}`}
            className="ohx-card ohx-card--hover"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: 8,
              padding: "20px 14px",
              textDecoration: "none",
              color: "inherit",
              height: "100%",
              boxSizing: "border-box",
            }}
          >
            <span
              className="ohx-faint"
              style={{ fontFamily: "var(--display)", fontSize: "0.85rem" }}
            >
              #{rankById.get(entry.userId)}
            </span>
            <ChampionAvatar entry={entry} size={56} />
            <span
              style={{
                fontWeight: 600,
                color: "var(--brand)",
                maxWidth: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {displayName(entry)}
            </span>
            <TierTag entry={entry} />
            <span
              className="ohx-display"
              style={{ fontSize: "1.4rem", color: "var(--ink)", lineHeight: 1 }}
            >
              {formatHearts(entry.totalHearts)}
              <span
                className="ohx-faint"
                style={{
                  fontFamily: "var(--body)",
                  fontSize: "0.75rem",
                  marginLeft: 4,
                }}
              >
                heart{entry.totalHearts === 1 ? "" : "s"}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function ListSkeleton() {
  return (
    <div role="status" aria-live="polite">
      <span style={{ position: "absolute", left: -9999 }}>
        Loading community champions…
      </span>
      {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
        <div
          key={i}
          aria-hidden="true"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 14px",
            borderBottom:
              i === SKELETON_ROWS - 1 ? "none" : "1px solid var(--line)",
          }}
        >
          <span
            style={{
              width: 24,
              height: 12,
              borderRadius: 3,
              background: "var(--surface-2)",
            }}
          />
          <span
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "var(--surface-2)",
            }}
          />
          <span
            style={{
              flex: 1,
              height: 12,
              borderRadius: 3,
              background: "var(--surface-2)",
            }}
          />
          <span
            style={{
              width: 36,
              height: 16,
              borderRadius: 3,
              background: "var(--surface-2)",
            }}
          />
        </div>
      ))}
    </div>
  );
}

function StatusCard({ title, body, action }) {
  return (
    <div style={{ padding: "40px 24px", textAlign: "center" }}>
      <p className="ohx-display" style={{ fontSize: "1.15rem", margin: 0 }}>
        {title}
      </p>
      {body && (
        <p
          className="ohx-muted"
          style={{
            margin: "8px auto 0",
            maxWidth: "46ch",
            fontSize: "0.95rem",
          }}
        >
          {body}
        </p>
      )}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}

export default function CommunityChampions() {
  const { apiServerUrl } = useEnv();
  const [leaders, setLeaders] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [reloadKey, setReloadKey] = useState(0);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table");

  useEffect(() => {
    trackEvent({
      action: "community_champions_view_mode",
      params: { view_mode: "table", interaction: "page_load" },
    });
  }, []);

  const handleViewModeChange = (val) => {
    if (!val || val === viewMode) return;
    setViewMode(val);
    trackEvent({
      action: "community_champions_view_mode",
      params: { view_mode: val, interaction: "toggle" },
    });
  };

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    fetch(`${apiServerUrl}/api/hearts/leaderboard?limit=50`, {
      signal: controller.signal,
    })
      .then((res) =>
        res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`)),
      )
      .then((data) => {
        setLeaders(data.leaderboard || []);
        setStatus("ready");
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setStatus("error");
      });
    return () => controller.abort();
  }, [apiServerUrl, reloadKey]);

  // Rank by position in the full (hearts-desc) leaderboard, so filtering
  // never renumbers people.
  const rankById = useMemo(
    () => new Map(leaders.map((entry, i) => [entry.userId, i + 1])),
    [leaders],
  );

  const filtered = useMemo(() => {
    let result = leaders;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((entry) =>
        (entry.name || "").toLowerCase().includes(q),
      );
    }
    if (tierFilter !== "all") {
      result = result.filter((entry) => tierOf(entry)?.name === tierFilter);
    }
    return result;
  }, [leaders, search, tierFilter]);

  // Count champions per tier for the filter tags
  const tierCounts = useMemo(() => {
    const counts = {};
    leaders.forEach((entry) => {
      const name = tierNameOf(entry);
      counts[name] = (counts[name] || 0) + 1;
    });
    return counts;
  }, [leaders]);

  const structuredData = useMemo(() => {
    if (!leaders.length) return null;
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Opportunity Hack Community Champions",
      description:
        "Top volunteers, mentors, and hackers who have earned the most hearts through their contributions to Opportunity Hack.",
      numberOfItems: leaders.length,
      itemListElement: leaders.map((entry, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        item: {
          "@type": "Person",
          name: entry.name,
          url: `https://www.ohack.dev/profile/${entry.userId}`,
          ...(entry.profileImage && { image: entry.profileImage }),
        },
      })),
    };
  }, [leaders]);

  const isFiltering = Boolean(search.trim()) || tierFilter !== "all";

  let listBody;
  if (status === "loading") {
    listBody = <ListSkeleton />;
  } else if (status === "error") {
    listBody = (
      <StatusCard
        title="We couldn't load the leaderboard."
        body="The hearts service didn't answer. Give it another try in a moment."
        action={
          <button
            type="button"
            className="ohx-btn ohx-btn--ghost"
            onClick={() => setReloadKey((k) => k + 1)}
          >
            Try again
          </button>
        }
      />
    );
  } else if (leaders.length === 0) {
    listBody = (
      <StatusCard
        title="No champions yet."
        body="Hearts are awarded as people ship work for nonprofits. Check back after the next event."
      />
    );
  } else if (filtered.length === 0) {
    listBody = (
      <StatusCard
        title="No champions match."
        body="Try a different name or tier."
        action={
          <button
            type="button"
            className="ohx-btn ohx-btn--ghost"
            onClick={() => {
              setSearch("");
              setTierFilter("all");
            }}
          >
            Clear filters
          </button>
        }
      />
    );
  } else if (viewMode === "table") {
    listBody = <ChampionTable entries={filtered} rankById={rankById} />;
  } else {
    listBody = (
      <div style={{ padding: 14 }}>
        <ChampionGrid entries={filtered} rankById={rankById} />
      </div>
    );
  }

  return (
    <>
      {structuredData && (
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: serializeJsonLd(structuredData),
            }}
          />
        </Head>
      )}

      <RefinedRoot>
        {/* ---------------- MASTHEAD ---------------- */}
        <section
          className="ohx-wrap"
          style={{
            paddingTop: "clamp(104px, 12vh, 140px)",
            paddingBottom: "clamp(32px, 5vh, 48px)",
          }}
        >
          <Eyebrow>Community</Eyebrow>
          <h1
            className="ohx-display rise"
            style={{ marginTop: 18, maxWidth: "20ch", animationDelay: "60ms" }}
          >
            The people who make{" "}
            <span className="ohx-italic">tech for good</span> happen.
          </h1>
          <p
            className="ohx-lead rise"
            style={{ marginTop: 22, maxWidth: "62ch", animationDelay: "150ms" }}
          >
            These volunteers power Opportunity Hack&apos;s mission to connect
            technology with nonprofits. Through mentoring, judging, hacking, and
            contributing code, they earn{" "}
            <Link href="/about/hearts" className="ohx-link">
              hearts
            </Link>
            , our way of recognizing the people who ship real work for real
            causes.
          </p>
          <div
            className="ohx-card rise"
            style={{
              position: "relative",
              marginTop: 36,
              aspectRatio: "21 / 8",
              overflow: "hidden",
              background: "var(--surface-2)",
              animationDelay: "240ms",
            }}
          >
            <Image
              src={HERO_PHOTO}
              fill
              sizes="(max-width: 1120px) 100vw, 1120px"
              alt="Opportunity Hack volunteers collaborating at a hackathon for nonprofits"
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
        </section>

        {/* ---------------- LEADERBOARD ---------------- */}
        <section
          className="ohx-wrap"
          style={{
            paddingTop: "clamp(16px, 3vh, 32px)",
            paddingBottom: "clamp(48px, 8vh, 88px)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: "12px 24px",
              marginBottom: 20,
            }}
          >
            <div>
              <Eyebrow>Leaderboard</Eyebrow>
              <h2 className="ohx-display" style={{ marginTop: 8 }}>
                Top 50 by hearts
              </h2>
            </div>
            <ul
              aria-label="Tier legend"
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "flex",
                flexWrap: "wrap",
                gap: "6px 16px",
              }}
            >
              {TIERS.map((tier) => (
                <li
                  key={tier.name}
                  className="ohx-faint"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: "0.82rem",
                  }}
                >
                  <TierDot color={tier.color} />
                  {tier.name} · {tier.minHearts}+
                </li>
              ))}
            </ul>
          </div>

          {/* Search + view */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 14,
              marginBottom: 14,
            }}
          >
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search champions by name…"
              aria-label="Search community champions"
              style={{
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
              }}
            />
            <div
              role="group"
              aria-label="Display mode"
              style={{ display: "flex", gap: 8 }}
            >
              {VIEW_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className="ohx-tag"
                  aria-pressed={viewMode === opt.value}
                  onClick={() => handleViewModeChange(opt.value)}
                  style={toggleTagStyle(viewMode === opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tier filter as quiet toggle tags */}
          <div
            role="group"
            aria-label="Filter by tier"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <button
              type="button"
              className="ohx-tag"
              aria-pressed={tierFilter === "all"}
              onClick={() => setTierFilter("all")}
              style={toggleTagStyle(tierFilter === "all")}
            >
              All ({leaders.length})
            </button>
            {[...TIERS].reverse().map((tier) => {
              const active = tierFilter === tier.name;
              return (
                <button
                  key={tier.name}
                  type="button"
                  className="ohx-tag"
                  aria-pressed={active}
                  onClick={() => setTierFilter(tier.name)}
                  style={{ ...toggleTagStyle(active), gap: 6 }}
                >
                  <TierDot color={tier.color} />
                  {tier.name} ({tierCounts[tier.name] || 0})
                </button>
              );
            })}
          </div>

          <p
            className="ohx-faint"
            style={{ margin: "0 0 14px", fontSize: "0.85rem" }}
            aria-live="polite"
          >
            {status === "ready" && isFiltering
              ? `${filtered.length} of ${leaders.length} champion${leaders.length === 1 ? "" : "s"}`
              : status === "ready"
                ? `${leaders.length} champion${leaders.length === 1 ? "" : "s"}, ranked by hearts earned`
                : " "}
          </p>

          <div
            className="ohx-card"
            style={{ overflow: "hidden", minHeight: LIST_MIN_HEIGHT }}
          >
            {listBody}
          </div>

          <p
            className="ohx-muted"
            style={{ marginTop: 22, fontSize: "0.95rem" }}
          >
            <Link href="/about/hearts" className="ohx-link">
              How hearts and tiers work <Arrow />
            </Link>
          </p>

          <CtaBand
            eyebrow="Join our champions"
            title="Earn your first hearts."
            body="Volunteer as a mentor, judge, or hacker at an Opportunity Hack event. Start at Bronze and work your way up to Diamond; every contribution moves a nonprofit closer to the technology it needs."
            primary={{ href: "/about/mentors", label: "Become a mentor" }}
            secondary={{ href: "/about/judges", label: "Become a judge" }}
          />
        </section>
      </RefinedRoot>
    </>
  );
}
