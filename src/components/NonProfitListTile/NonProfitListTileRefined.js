import React, { useEffect, useState } from "react";
import Link from "next/link";

// Calm, refined nonprofit card for /nonprofits. Mirrors NonProfitListTile's
// data logic (per-problem-statement counts + the needs-help/live show/hide
// filter) but renders a single quiet surface with hairline tags instead of the
// old stack of large colored chips and the colored top bar. Lives alongside the
// original tile so the event-page usage (EventFeatureExtended) is untouched.

function first50(str = "") {
  const words = str.split(/\s+/);
  let out = words.slice(0, 50).join(" ");
  if (out.endsWith(",")) out = out.slice(0, -1);
  return words.length > 50 ? out + "…" : out;
}

export default function NonProfitListTileRefined({ npo, profile, needs_help_flag, production_flag, delay = 0 }) {
  const [productionCount, setProductionCount] = useState(0);
  const [needHelpCount, setNeedHelpCount] = useState(0);
  const [hackersCount, setHackersCount] = useState(0);
  const [mentorsCount, setMentorsCount] = useState(0);
  const [helpingCount, setHelpingCount] = useState(0);

  useEffect(() => {
    if (!npo || !npo.problem_statements) return;
    let prod = 0;
    let need = 0;
    const hackerSet = new Set();
    const mentorSet = new Set();
    const helpingSet = new Set();

    npo.problem_statements.forEach((psId) => {
      fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/problem_statement/${psId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.status === "production") prod++;
          else need++;
          setProductionCount(prod);
          setNeedHelpCount(need);
          if (data.helping != null) {
            data.helping.forEach((h) => {
              if (h.type === "hacker") hackerSet.add(h.slack_user);
              else if (h.type === "mentor") mentorSet.add(h.slack_user);
              if (profile && h.slack_user === profile.user_id) helpingSet.add(psId);
            });
          }
          setHackersCount(hackerSet.size);
          setMentorsCount(mentorSet.size);
          setHelpingCount(helpingSet.size);
        })
        .catch((e) => console.error(e));
    });
  }, [npo, profile]);

  // Same visibility contract as the original tile.
  const visible =
    (needs_help_flag && needHelpCount > 0) || (production_flag && productionCount > 0);
  if (!visible) return null;

  const slackChannel = npo.slack_channel && npo.slack_channel !== "" ? npo.slack_channel : "npo-selection";
  const openSlack = (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(`https://opportunity-hack.slack.com/app_redirect?channel=${slackChannel}`, "_blank", "noopener noreferrer");
  };

  const total = npo.problem_statements?.length || 0;

  return (
    <Link
      href={`/nonprofit/${npo.id}`}
      className="ohx-card ohx-card--hover rise"
      style={{ display: "flex", flexDirection: "column", gap: 12, padding: "24px 24px 20px", textDecoration: "none", color: "inherit", animationDelay: `${delay}ms` }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
        <h3 className="ohx-display" style={{ fontSize: "1.3rem", lineHeight: 1.2 }}>{npo.name}</h3>
        <span className="ohx-faint" style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>{total} project{total === 1 ? "" : "s"}</span>
      </div>

      {helpingCount > 0 && (
        <span className="ohx-tag ohx-tag--accent" style={{ alignSelf: "flex-start" }}>
          You&apos;re helping with {helpingCount}
        </span>
      )}

      <p className="ohx-muted" style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.55 }}>
        {npo.description ? first50(npo.description) : "No description available."}
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2 }}>
        {needHelpCount > 0 && <span className="ohx-tag ohx-tag--accent">{needHelpCount} need{needHelpCount === 1 ? "s" : ""} help</span>}
        {productionCount > 0 && <span className="ohx-tag">{productionCount} live</span>}
        {hackersCount > 0 && <span className="ohx-tag">{hackersCount} hacker{hackersCount === 1 ? "" : "s"}</span>}
        {mentorsCount > 0 && <span className="ohx-tag">{mentorsCount} mentor{mentorsCount === 1 ? "" : "s"}</span>}
      </div>

      <div style={{ marginTop: "auto", paddingTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <button type="button" onClick={openSlack} className="ohx-link" style={{ background: "none", border: 0, cursor: "pointer", font: "inherit", fontSize: "0.85rem", padding: 0 }}>
          #{slackChannel}
        </button>
        <span className="ohx-link" style={{ fontSize: "0.88rem" }}>View projects →</span>
      </div>
    </Link>
  );
}
