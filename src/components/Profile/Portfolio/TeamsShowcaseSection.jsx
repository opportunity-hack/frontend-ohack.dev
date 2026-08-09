import React from "react";
import Link from "next/link";
import GitHubIcon from "@mui/icons-material/GitHub";
import LaunchIcon from "@mui/icons-material/Launch";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

import LiteVideoThumbnail from "../../VideoDisplay/LiteVideoThumbnail";
import { parseLocalDate } from "../../../lib/dateUtils";

function formatEventDate(dateStr) {
  const d = parseLocalDate(dateStr);
  if (!d) return null;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function repoEntries(githubLinks) {
  const entries = [];
  for (const item of githubLinks || []) {
    if (!item) continue;
    if (typeof item === "string") {
      entries.push({ link: item, name: item.split("/").slice(-1)[0] || "Repository" });
    } else if (item.link) {
      entries.push({ link: item.link, name: item.name || item.link.split("/").slice(-1)[0] });
    }
  }
  return entries;
}

// Winning-ish statuses get a quiet trophy marker even without awards[]
const WINNING_STATUSES = new Set([
  "FOUNDING_ENGINEERS", "CATEGORY_WINNER", "COMPLETION_SUPPORT",
  "DEPLOYED", "NONPROFIT_SIGNOFF",
]);

/**
 * The user's hackathon teams — demo videos, repos, DevPost, awards.
 * Demo thumbnails are LiteVideoThumbnail facades; playback happens in the
 * single page-level Dialog owned by PublicProfile (zero iframes at load).
 */
export default function TeamsShowcaseSection({ teams, onPlayVideo }) {
  if (!Array.isArray(teams) || teams.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {teams.map((team) => {
        const event = team.event || {};
        const eventDate = formatEventDate(event.start_date);
        const repos = repoEntries(team.github_links);
        const awards = Array.isArray(team.awards) ? team.awards : [];
        const isWinner = awards.length > 0 || WINNING_STATUSES.has(team.status);

        return (
          <article key={team.id} className="ohx-card" style={{ padding: "20px 22px" }}>
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap", justifyContent: "space-between" }}>
              <div style={{ minWidth: 0, flex: "1 1 300px" }}>
                <span className="ohx-eyebrow" style={{ fontSize: "0.62rem" }}>
                  {event.title || "Opportunity Hack"}{eventDate ? ` · ${eventDate}` : ""}
                </span>
                <h3 className="ohx-display" style={{ fontSize: "1.2rem", margin: "6px 0 0" }}>
                  {team.name || "Team"}
                </h3>

                {(isWinner || awards.length > 0) && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                    {awards.length > 0 ? (
                      awards.map((award) => (
                        <span key={award} className="ohx-tag ohx-tag--accent" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                          <EmojiEventsIcon sx={{ fontSize: 13 }} /> {award}
                        </span>
                      ))
                    ) : (
                      <span className="ohx-tag ohx-tag--accent" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <EmojiEventsIcon sx={{ fontSize: 13 }} /> Winning team
                      </span>
                    )}
                  </div>
                )}

                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 18px", marginTop: 12 }}>
                  {repos.map((repo) => (
                    <a key={repo.link} className="ohx-link" href={repo.link} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.9rem" }}>
                      <GitHubIcon sx={{ fontSize: 14 }} /> {repo.name}
                    </a>
                  ))}
                  {team.devpost_link && (
                    <a className="ohx-link" href={team.devpost_link} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.9rem" }}>
                      DevPost <LaunchIcon sx={{ fontSize: 13 }} />
                    </a>
                  )}
                  {event.event_id && (
                    <Link className="ohx-link" href={`/hack/${event.event_id}`} style={{ fontSize: "0.9rem" }}>
                      Event page
                    </Link>
                  )}
                </div>
              </div>

              {team.demo_video_url && (
                <div style={{ flex: "0 0 auto", width: "min(100%, 280px)" }}>
                  <LiteVideoThumbnail
                    url={team.demo_video_url}
                    width={280}
                    height={158}
                    label={`Watch ${team.name || "team"} demo`}
                    onClick={() => onPlayVideo(team.demo_video_url, `${team.name || "Team"} demo`)}
                  />
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
