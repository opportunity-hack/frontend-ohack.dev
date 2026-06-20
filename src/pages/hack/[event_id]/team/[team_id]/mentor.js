import React from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import NextLink from "next/link";
import dynamic from "next/dynamic";
import { Box, CircularProgress, Skeleton } from "@mui/material";
import { EmojiPeople as MentorIcon } from "@mui/icons-material";
import { isWinningStatus } from "../../../../../constants/teamStatus";
import { parseLocalDate } from "../../../../../lib/dateUtils";
import { Eyebrow } from "../../../../../components/design/refined";
import { Shell } from "../../../../../components/Teams/RefinedTeamShell";
import TeamBreadcrumbs from "../../../../../components/Teams/TeamBreadcrumbs";
import useLiveTeam from "../../../../../hooks/use-live-team";
import {
  fetchTeamAndEvent,
  COMPLETION_VISIBLE_STATUSES,
  OG_IMAGE,
} from "../../../../../components/Teams/teamPageData";

const MentorTeamPanel = dynamic(
  () => import("../../../../../components/Teams/MentorTeamPanel"),
  {
    ssr: false,
    loading: () => <Skeleton variant="rectangular" height={420} sx={{ borderRadius: 1 }} />,
  }
);

export default function TeamMentorPage({ teamData, eventData }) {
  const router = useRouter();
  const { event_id, team_id } = router.query;
  const { team, setTeam, event, loading, error } = useLiveTeam(
    event_id,
    team_id,
    teamData,
    eventData
  );

  if (loading) {
    return (
      <Shell maxWidth={760}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            minHeight: "40vh",
          }}
        >
          <CircularProgress sx={{ color: "var(--brand)" }} />
          <Box sx={{ color: "var(--muted)" }}>Loading mentor support…</Box>
        </Box>
      </Shell>
    );
  }

  if (error || !team) {
    return (
      <Shell maxWidth={760}>
        <Box
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            bgcolor: "var(--accent-soft)",
            border: "1px solid #f3d3c7",
            color: "#b23a18",
            fontWeight: 600,
          }}
        >
          {error || "Team not found"}
        </Box>
        <NextLink
          href={`/hack/${event_id}/team/${team_id}`}
          className="ohx-btn ohx-btn--ghost"
        >
          ← Back to team
        </NextLink>
      </Shell>
    );
  }

  const teamName = team.name || "Unnamed Team";
  const eventName = event?.title || event?.event_id || event_id;
  const eventHasStarted = (() => {
    if (!event?.start_date) return false;
    const start = parseLocalDate(event.start_date);
    return !Number.isNaN(start.getTime()) && start <= new Date();
  })();
  const showCompletionLink =
    isWinningStatus(team.status) || COMPLETION_VISIBLE_STATUSES.has(team.status);

  const startDateLabel = event?.start_date
    ? parseLocalDate(event.start_date).toLocaleDateString()
    : null;

  const pageTitle = `Mentor support · ${teamName} · ${eventName} | Opportunity Hack`;
  const pageDescription = `Mentor coverage, open flags, judging readiness, and notes for ${teamName} at ${eventName}.`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="robots" content="noindex,follow" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={OG_IMAGE} />
      </Head>

      <Shell maxWidth={960}>
        <TeamBreadcrumbs
          items={[
            { name: eventName, href: `/hack/${event_id}` },
            { name: teamName, href: `/hack/${event_id}/team/${team_id}` },
          ]}
          current="Mentor support"
        />

        <Box component="header" className="rise" sx={{ mb: { xs: 3, md: 4 } }}>
          <Eyebrow>
            {eventName} · {teamName}
          </Eyebrow>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mt: 1.5, mb: 1 }}>
            <MentorIcon sx={{ color: "var(--accent)", fontSize: 30 }} />
            <Box
              component="h1"
              className="ohx-display"
              sx={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)", m: 0 }}
            >
              Mentor support
            </Box>
          </Box>
          <Box sx={{ color: "var(--muted)", maxWidth: "60ch" }}>
            Coverage, open concerns, judging readiness, and the running notes feed
            for this team. Approved mentors can update; everyone can view.
          </Box>
          <hr className="ohx-rule" style={{ marginTop: 20 }} />
        </Box>

        {eventHasStarted ? (
          <MentorTeamPanel
            team={team}
            event={event}
            eventId={event_id}
            onTeamUpdate={setTeam}
          />
        ) : (
          <Box className="ohx-card" sx={{ p: { xs: 2.5, md: 3.5 } }}>
            <Box className="ohx-display" sx={{ fontSize: "1.2rem", color: "var(--ink)", mb: 1 }}>
              Mentor support opens when the event starts
            </Box>
            <Box sx={{ color: "var(--muted)", lineHeight: 1.6 }}>
              {startDateLabel ? `This event begins ${startDateLabel}. ` : ""}
              Mentor coverage, flags, and notes become available once the
              hackathon is underway.
            </Box>
          </Box>
        )}

        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mt: 4 }}>
          <NextLink
            href={`/hack/${event_id}/team/${team_id}`}
            className="ohx-btn ohx-btn--primary"
          >
            ← Back to {teamName}
          </NextLink>
          {showCompletionLink && (
            <NextLink
              href={`/hack/${event_id}/team/${team_id}/completion`}
              className="ohx-btn ohx-btn--ghost"
            >
              Definition of Done →
            </NextLink>
          )}
          <NextLink href={`/hack/${event_id}`} className="ohx-btn ohx-btn--ghost">
            Back to event
          </NextLink>
        </Box>
      </Shell>
    </>
  );
}

export async function getStaticProps({ params }) {
  const { event_id, team_id } = params;
  const result = await fetchTeamAndEvent(event_id, team_id);
  if (result.notFound) return { notFound: true };
  return {
    props: { teamData: result.teamData, eventData: result.eventData },
    revalidate: 60,
  };
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}
