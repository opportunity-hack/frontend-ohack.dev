import Link from "next/link";
import EventIcon from "@mui/icons-material/Event";
import GroupIcon from "@mui/icons-material/Group";
import LaunchIcon from "@mui/icons-material/Launch";
import { parseLocalDate } from "../../lib/dateUtils";

// Renders inside ProblemStatement, which is always inside a RefinedRoot —
// scoped .ohx-* classes are safe here (no var fallbacks needed).

const eventHasEnded = (event) => parseLocalDate(event.end_date) < new Date();

// Compact, readable date range: "Oct 12–13, 2024" / "Oct 30 – Nov 2, 2024"
const formatDateRange = (startStr, endStr) => {
  const start = parseLocalDate(startStr);
  const end = parseLocalDate(endStr);
  const short = { month: "short", day: "numeric" };
  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();
  if (sameMonth && start.getDate() === end.getDate()) {
    return `${start.toLocaleDateString("en-US", short)}, ${end.getFullYear()}`;
  }
  if (sameMonth) {
    return `${start.toLocaleDateString("en-US", short)}–${end.getDate()}, ${end.getFullYear()}`;
  }
  if (sameYear) {
    return `${start.toLocaleDateString("en-US", short)} – ${end.toLocaleDateString("en-US", short)}, ${end.getFullYear()}`;
  }
  const full = { month: "short", day: "numeric", year: "numeric" };
  return `${start.toLocaleDateString("en-US", full)} – ${end.toLocaleDateString("en-US", full)}`;
};

const memberName = (member) =>
  typeof member === "string"
    ? null
    : member?.nickname || member?.name || null;

const smallButtonStyle = {
  fontSize: "0.82rem",
  padding: "0.5em 0.9em",
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
};

const TeamRow = ({ team, eventStringId }) => {
  const members = Array.isArray(team.users) ? team.users : [];
  const names = members.map(memberName).filter(Boolean);
  const shown = names.slice(0, 4);
  const extra = members.length - shown.length;
  const membersLabel =
    shown.length > 0
      ? `${shown.join(", ")}${extra > 0 ? ` +${extra} more` : ""}`
      : `${members.length} member${members.length === 1 ? "" : "s"}`;

  return (
    <li
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 6,
        padding: "8px 0",
        borderTop: "1px solid var(--line)",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <Link
          href={`/hack/${eventStringId}/team/${team.id}`}
          className="ohx-link"
          style={{ fontWeight: 600, fontSize: "0.92rem" }}
        >
          {team.name}
        </Link>
        {members.length > 0 && (
          <span
            className="ohx-muted"
            style={{ fontSize: "0.82rem", marginLeft: 8 }}
          >
            {membersLabel}
          </span>
        )}
      </div>
      <Link
        href={`/hack/${eventStringId}/team/${team.id}`}
        className="ohx-link"
        style={{ fontSize: "0.82rem", whiteSpace: "nowrap" }}
      >
        Team page →
      </Link>
    </li>
  );
};

export default function Events({ events, teamsByEvent = {} }) {
  if (!events || events.length === 0) {
    return (
      <p className="ohx-muted" style={{ margin: 0, fontSize: "0.92rem" }}>
        This project hasn&rsquo;t been worked on at an event yet —{" "}
        <Link href="/hack" className="ohx-link">
          join an upcoming hackathon
        </Link>{" "}
        and pick it with your team.
      </p>
    );
  }

  // Newest event first
  const sorted = [...events].sort(
    (a, b) => parseLocalDate(b.start_date) - parseLocalDate(a.start_date)
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {sorted.map((event) => {
        const past = eventHasEnded(event);
        const title =
          event.title || `${event.location || ""} ${event.type || "event"}`.trim();
        const teams = teamsByEvent[event.event_id] || [];
        const constraints = event.constraints || {};
        const teamSizeTag =
          constraints.min_people_per_team && constraints.max_people_per_team
            ? `Teams of ${constraints.min_people_per_team}–${constraints.max_people_per_team}`
            : null;

        return (
          <div key={event.id} className="ohx-card" style={{ padding: "16px 20px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
                marginBottom: 8,
              }}
            >
              <span className={`ohx-tag${past ? "" : " ohx-tag--accent"}`}>
                {past ? "Past" : "Upcoming"} {event.type || "event"}
              </span>
              <span className="ohx-muted" style={{ fontSize: "0.82rem" }}>
                <EventIcon
                  sx={{ fontSize: 13, verticalAlign: "-2px", mr: 0.5 }}
                />
                {formatDateRange(event.start_date, event.end_date)}
              </span>
            </div>

            <Link
              href={`/hack/${event.event_id}`}
              className="ohx-link"
              style={{
                fontWeight: 600,
                fontSize: "1.05rem",
                color: "var(--ink)",
                display: "inline-block",
                marginBottom: 4,
              }}
            >
              {title}
            </Link>

            {event.location && (
              <p className="ohx-muted" style={{ fontSize: "0.85rem", margin: "0 0 8px" }}>
                {event.location}
              </p>
            )}

            {event.description && (
              <p
                className="ohx-muted"
                style={{ fontSize: "0.9rem", margin: "0 0 10px", maxWidth: "62ch" }}
              >
                {event.description}
              </p>
            )}

            {(teamSizeTag || constraints.max_teams_per_problem) && (
              <div
                style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}
              >
                {teamSizeTag && <span className="ohx-tag">{teamSizeTag}</span>}
                {constraints.max_teams_per_problem && (
                  <span className="ohx-tag">
                    Max {constraints.max_teams_per_problem} team
                    {constraints.max_teams_per_problem === 1 ? "" : "s"} per project
                  </span>
                )}
              </div>
            )}

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Link
                href={`/hack/${event.event_id}`}
                className="ohx-btn ohx-btn--ghost"
                style={smallButtonStyle}
              >
                <EventIcon sx={{ fontSize: 13 }} /> Event page
              </Link>
              {event.devpost_url && (
                <a
                  href={event.devpost_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ohx-btn ohx-btn--ghost"
                  style={smallButtonStyle}
                >
                  <LaunchIcon sx={{ fontSize: 13 }} />
                  {past ? "View on DevPost" : "Register on DevPost"}
                </a>
              )}
            </div>

            {teams.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <p
                  className="ohx-eyebrow"
                  style={{ fontSize: "0.66rem", marginBottom: 2 }}
                >
                  <GroupIcon sx={{ fontSize: 12, verticalAlign: "-2px", mr: 0.5 }} />
                  {teams.length} team{teams.length === 1 ? "" : "s"} worked on this
                  project here
                </p>
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {teams.map((team) => (
                    <TeamRow
                      key={team.id}
                      team={team}
                      eventStringId={event.event_id}
                    />
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
