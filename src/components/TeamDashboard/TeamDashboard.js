import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box, Snackbar, Alert } from "@mui/material";
import TeamStatusHero from "./TeamStatusHero";
import { isPendingReview } from "../../constants/teamStatus";
import DeadlineStrip from "./DeadlineStrip";
import DeliverablesChecklist from "./DeliverablesChecklist";
import HackersChoiceCard from "./HackersChoiceCard";
import ProjectWriteupEditor from "./ProjectWriteupEditor";
import DemoVideoEditor from "./DemoVideoEditor";
import DevPostEditor from "./DevPostEditor";
import CodeActivityCard from "./CodeActivityCard";
import GatewayKeyCard from "./GatewayKeyCard";
import MentorSupportCard from "./MentorSupportCard";
import SlackCoachCard from "./SlackCoachCard";
import TeamRoster from "./TeamRoster";
import JudgingAssignmentCard from "../Teams/JudgingAssignmentCard";
import useTeamProject from "../../hooks/use-team-project";
import usePublicTeam from "../../hooks/use-public-team";
import useGithubActivity from "../../hooks/use-github-activity";
import {
  leaveTeam,
  teamLeaveBlockedReason,
} from "../../lib/teamMembershipApi";
import { isEventEnded } from "../../lib/dateUtils";
import {
  deriveDeliverables,
  summarizeGithubActivity,
} from "../../lib/teamDeliverables";

function slackConfirmKey(teamId) {
  return `ohx.team.${teamId}.slackConfirmed`;
}

/**
 * Renders one team's full dashboard. `IN_REVIEW` teams see only the status
 * hero + deadline strip + Slack + roster (Part 2.1 item 12); everyone else
 * gets the full stack in the order the plan specifies.
 */
export default function TeamDashboard({
  team,
  event,
  eventId,
  accessToken,
  profile,
  onTeamUpdated,
  onLeftTeam,
  teamFindingEnabled,
}) {
  const codeCardRef = useRef(null);
  const checklistRef = useRef(null);
  // Whichever scrolls near first fires the (fire-once) GitHub fetch — the
  // checklist's "Push code" row and the Code activity card read the same data.
  const activity = useGithubActivity(team, [checklistRef, codeCardRef]);
  const projectApi = useTeamProject({ team, accessToken, onTeamUpdated });
  const { users, loading: rosterLoading } = usePublicTeam(team, onTeamUpdated);

  const [slackConfirmed, setSlackConfirmed] = useState(false);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  // Shared between `DeliverablesChecklist`'s "Submit project" row and
  // `ProjectWriteupEditor`'s own submit button/dialog — both need to open
  // and reflect the SAME confirm dialog and in-flight state (Part 9: the
  // checklist button used to just scroll to #project instead of submitting).
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!team?.id || typeof window === "undefined") return;
    try {
      setSlackConfirmed(
        window.localStorage.getItem(slackConfirmKey(team.id)) === "1",
      );
    } catch {
      setSlackConfirmed(false);
    }
  }, [team?.id]);

  const handleSlackConfirmChange = useCallback(
    (checked) => {
      setSlackConfirmed(checked);
      if (typeof window === "undefined" || !team?.id) return;
      try {
        if (checked) window.localStorage.setItem(slackConfirmKey(team.id), "1");
        else window.localStorage.removeItem(slackConfirmKey(team.id));
      } catch {
        // localStorage unavailable — non-critical
      }
    },
    [team?.id],
  );

  const notify = useCallback((message, severity = "success") => {
    setSnack({ open: true, message, severity });
  }, []);

  const activitySummary = summarizeGithubActivity(activity.byRepo);
  const deliverables = deriveDeliverables({
    team,
    activity: activitySummary,
    activityStatus: activity.status,
    slackConfirmed,
  });

  // APPROVING (a few seconds mid-approval) renders like IN_REVIEW.
  const isInReview = Boolean(team) && isPendingReview(team.status);

  // Same leave rules as the public team page (twin: backend
  // api/teams/membership_rules.py).
  const leaveBlockedReason = teamLeaveBlockedReason({
    eventEnded: isEventEnded(event?.end_date),
    teamJoinEnabled: event?.constraints?.team_join_enabled !== false,
  });
  const handleLeave = useCallback(async () => {
    const res = await leaveTeam({
      accessToken,
      teamId: team?.id,
      eventId,
      source: "team_dashboard",
    });
    if (onLeftTeam) onLeftTeam(team?.id, res);
  }, [accessToken, team?.id, eventId, onLeftTeam]);

  const rosterProps = {
    users,
    loading: rosterLoading,
    ownId: profile?.id,
    eventId,
    teamId: team?.id,
    teamFindingEnabled,
    teamName: team?.name,
    slackChannel: team?.slack_channel,
    leaveBlockedReason,
    onLeave: onLeftTeam ? handleLeave : undefined,
  };

  return (
    <Box>
      <TeamStatusHero team={team} />

      <DeadlineStrip deadlines={event?.deadlines} event={event} team={team} />

      {isInReview ? (
        <>
          <SlackCoachCard team={team} eventId={eventId} />
          <TeamRoster {...rosterProps} />
        </>
      ) : (
        <>
          {/* Renders nothing until the judging schedule is published and
              this team is on a panel. */}
          <JudgingAssignmentCard
            id="judging"
            eventId={eventId}
            teamId={team?.id}
            eventTimezone={event?.timezone}
          />

          <GatewayKeyCard
            team={team}
            accessToken={accessToken}
            onNotify={notify}
          />

          <DeliverablesChecklist
            deliverables={deliverables}
            slackConfirmed={slackConfirmed}
            onSlackConfirmChange={handleSlackConfirmChange}
            onSubmit={() => setConfirmOpen(true)}
            submitting={submitting}
            containerRef={checklistRef}
          />

          <HackersChoiceCard
            eventId={eventId}
            deadlines={event?.deadlines}
            constraints={event?.constraints}
          />

          <ProjectWriteupEditor
            team={team}
            event={event}
            accessToken={accessToken}
            projectApi={projectApi}
            onNotify={notify}
            canSubmit={deliverables.canSubmit}
            submitBlockedReason={deliverables.submitBlockedReason}
            confirmOpen={confirmOpen}
            onOpenConfirm={() => setConfirmOpen(true)}
            onCloseConfirm={() => setConfirmOpen(false)}
            submitting={submitting}
            onSubmittingChange={setSubmitting}
          />

          <DemoVideoEditor
            team={team}
            event={event}
            accessToken={accessToken}
            onTeamUpdated={onTeamUpdated}
            onNotify={notify}
          />

          <CodeActivityCard
            team={team}
            event={event}
            byRepo={activity.byRepo}
            status={activity.status}
            containerRef={codeCardRef}
          />

          <MentorSupportCard
            team={team}
            eventId={eventId}
            event={event}
            accessToken={accessToken}
            onTeamUpdated={onTeamUpdated}
            onNotify={notify}
          />

          <SlackCoachCard team={team} eventId={eventId} />

          <TeamRoster {...rosterProps} />

          <DevPostEditor
            team={team}
            event={event}
            accessToken={accessToken}
            onTeamUpdated={onTeamUpdated}
            onNotify={notify}
          />
        </>
      )}

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          sx={{ bgcolor: "var(--paper, #fff)", color: "var(--ink, #16181D)" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
