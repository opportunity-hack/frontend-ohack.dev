import React, { useMemo } from "react";
import Link from "next/link";
import { Box, Skeleton } from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import { Eyebrow, Arrow } from "../design/refined";
import { statusLabel } from "../Teams/teamPageData";
import { getWinningStatus } from "../../constants/teamStatus";
import { formatEventDates } from "../../lib/mentorEvents";
import {
  rankMyTeams,
  currentHackerEvent,
  PHASE_LABELS,
} from "../../lib/myTeams";
import { trackEvent, EventCategory } from "../../lib/ga";

// Rendered only inside /profile's RefinedRoot, so `.ohx-*` + CSS vars are safe.

const track = (label, eventId) =>
  trackEvent({
    action: "profile_my_teams_click",
    params: {
      event_category: EventCategory.ENGAGEMENT,
      event_label: label,
      event_id: eventId || undefined,
    },
  });

const teamHref = (team) => `/hack/${team.hackathon_event_id}/team/${team.id}`;
const manageHref = (team) => `/hack/${team.hackathon_event_id}/manageteam`;

const phaseTagClass = (phase) =>
  phase === "live" ? "ohx-tag ohx-tag--accent" : "ohx-tag";

function TeamStatusLine({ team }) {
  const label = statusLabel(team.status);
  const winning = getWinningStatus(team.status);
  const awards = Array.isArray(team.awards) ? team.awards.filter(Boolean) : [];
  const inactive = team.active === false || team.active === "False";
  if (!label && awards.length === 0 && !inactive) return null;
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 1,
        mt: 1,
      }}
    >
      {label && team.status !== "INACTIVE" && (
        <span className="ohx-tag">{winning ? `🏆 ${label}` : label}</span>
      )}
      {inactive && <span className="ohx-tag">Inactive</span>}
      {awards.map((award) => (
        <span key={award} className="ohx-tag ohx-tag--accent">
          {award}
        </span>
      ))}
    </Box>
  );
}

function FeaturedTeam({ team }) {
  const event = team.event || {};
  const eventName = event.title || team.hackathon_event_id;
  const dates = formatEventDates(event.start_date, event.end_date);
  const eventId = team.hackathon_event_id;
  const isPast = team.phase === "past";
  const manageLabel = isPast ? "Team dashboard" : "Manage your team";

  return (
    <Box>
      <Box
        sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}
      >
        <span className={phaseTagClass(team.phase)}>
          {PHASE_LABELS[team.phase]}
        </span>
        <span className="ohx-muted" style={{ fontSize: "0.92rem" }}>
          {eventName}
          {dates ? ` · ${dates}` : ""}
        </span>
      </Box>
      <h2
        className="ohx-display"
        style={{ fontSize: "clamp(1.4rem,2.6vw,1.9rem)", margin: "10px 0 0" }}
      >
        {team.name || "Your team"}
      </h2>
      <TeamStatusLine team={team} />
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 2.5 }}>
        {isPast ? (
          <>
            <Link
              href={teamHref(team)}
              className="ohx-btn ohx-btn--primary"
              onClick={() => track("team_page", eventId)}
            >
              Team page <Arrow />
            </Link>
            <Link
              href={manageHref(team)}
              className="ohx-btn ohx-btn--ghost"
              onClick={() => track("manage", eventId)}
            >
              {manageLabel}
            </Link>
          </>
        ) : (
          <>
            <Link
              href={manageHref(team)}
              className="ohx-btn ohx-btn--primary"
              onClick={() => track("manage", eventId)}
            >
              {manageLabel} <Arrow />
            </Link>
            <Link
              href={teamHref(team)}
              className="ohx-btn ohx-btn--ghost"
              onClick={() => track("team_page", eventId)}
            >
              Team page
            </Link>
          </>
        )}
      </Box>
    </Box>
  );
}

function OtherTeamRow({ team }) {
  const event = team.event || {};
  const eventId = team.hackathon_event_id;
  return (
    <li
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 10,
        padding: "10px 0",
        borderTop: "1px solid var(--line)",
      }}
    >
      <Link
        href={teamHref(team)}
        className="ohx-link"
        onClick={() => track("team_page", eventId)}
        style={{ fontWeight: 600 }}
      >
        {team.name || "Unnamed team"}
      </Link>
      <span className="ohx-muted" style={{ fontSize: "0.9rem" }}>
        {event.title || eventId}
      </span>
      <span className={phaseTagClass(team.phase)}>
        {PHASE_LABELS[team.phase]}
      </span>
      <Link
        href={manageHref(team)}
        className="ohx-link"
        onClick={() => track("manage", eventId)}
        style={{ marginLeft: "auto", fontSize: "0.9rem" }}
      >
        Manage <Arrow />
      </Link>
    </li>
  );
}

function EmptyState({ hackathons }) {
  const event = useMemo(() => currentHackerEvent(hackathons), [hackathons]);
  return (
    <Box>
      <h2
        className="ohx-display"
        style={{ fontSize: "clamp(1.3rem,2.4vw,1.7rem)", margin: "8px 0 6px" }}
      >
        You're not on a team yet
      </h2>
      {event ? (
        <>
          <p className="ohx-muted" style={{ margin: 0, maxWidth: "60ch" }}>
            You're registered for {event.title || event.event_id}. Find
            teammates or start a team of your own.
          </p>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 2.5 }}>
            <Link
              href={`/hack/${event.event_id}/findteam`}
              className="ohx-btn ohx-btn--primary"
              onClick={() => track("find_team", event.event_id)}
            >
              Find a team <Arrow />
            </Link>
            <Link
              href={`/hack/${event.event_id}/manageteam`}
              className="ohx-btn ohx-btn--ghost"
              onClick={() => track("create_team", event.event_id)}
            >
              Create a team
            </Link>
          </Box>
        </>
      ) : (
        <>
          <p className="ohx-muted" style={{ margin: 0, maxWidth: "60ch" }}>
            Teams form around each hackathon. Once you're registered as a
            hacker, your team and its dashboard will show up here.
          </p>
          <Box sx={{ mt: 2.5 }}>
            <Link
              href="/hack"
              className="ohx-btn ohx-btn--ghost"
              onClick={() => track("browse_events")}
            >
              See upcoming hackathons <Arrow />
            </Link>
          </Box>
        </>
      )}
    </Box>
  );
}

/**
 * "Your teams" — the one place on /profile that answers "what team am I on,
 * and where do I manage it?". The team for a live (or next upcoming) event
 * leads; older teams are a compact list underneath. Renders nothing when
 * the backend route isn't there yet (`available: false`).
 */
export default function MyTeamsCard({
  teams,
  loading,
  available = true,
  error,
  hackathons,
}) {
  const ranked = useMemo(() => rankMyTeams(teams || []), [teams]);
  if (available === false) return null;

  const [featured, ...rest] = ranked;

  return (
    <Box
      component="section"
      className="ohx-card"
      aria-label="Your teams"
      sx={{ mt: 3, p: { xs: 2.5, md: 3.5 }, minHeight: 148 }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
        <GroupsIcon sx={{ color: "var(--accent)", fontSize: 20 }} />
        <Eyebrow>Your teams</Eyebrow>
      </Box>

      {loading || (!error && !teams) ? (
        <Box aria-busy="true">
          <Skeleton variant="text" width={220} height={36} />
          <Skeleton variant="text" width={160} height={22} />
          <Skeleton
            variant="rectangular"
            width={260}
            height={38}
            sx={{ mt: 2 }}
          />
        </Box>
      ) : error ? (
        <p className="ohx-muted" role="status" style={{ margin: 0 }}>
          {error}
        </p>
      ) : !featured ? (
        <EmptyState hackathons={hackathons} />
      ) : (
        <>
          <FeaturedTeam team={featured} />
          {rest.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <p
                className="ohx-muted"
                style={{
                  margin: "0 0 4px",
                  fontSize: "0.72rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  fontWeight: 600,
                }}
              >
                Also on ({rest.length})
              </p>
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {rest.map((team) => (
                  <OtherTeamRow key={team.id} team={team} />
                ))}
              </ul>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
