import React, { useState } from "react";
import { Box, CircularProgress, Skeleton } from "@mui/material";
import DashboardSection from "./DashboardSection";
import { ROSTER_TITLE } from "./copy";
import { isMembershipRefusal } from "../../lib/teamMembershipApi";

function memberName(member) {
  return member?.nickname || member?.name || "Teammate";
}

function Avatar({ member }) {
  if (member?.profile_image) {
    return (
      <img
        src={member.profile_image}
        alt=""
        width={40}
        height={40}
        style={{ borderRadius: "50%", flexShrink: 0 }}
      />
    );
  }
  return (
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        bgcolor: "var(--surface-2, #F4F1E9)",
        border: "1px solid var(--line, #E7E1D4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {memberName(member).charAt(0).toUpperCase()}
    </Box>
  );
}

const mutedSx = {
  fontSize: "0.92rem",
  lineHeight: 1.55,
  color: "var(--muted)",
  m: 0,
};

const errorStripSx = {
  fontSize: "0.92rem",
  lineHeight: 1.5,
  color: "var(--ink)",
  background: "var(--surface-2)",
  borderLeft: "3px solid #B3261E",
  borderRadius: 1,
  px: 2,
  py: 1.25,
  mb: 1.5,
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 1.5,
};

const linkButtonStyle = {
  background: "none",
  border: 0,
  padding: 0,
  cursor: "pointer",
};

/**
 * "Leave team" for the dashboard roster card. Same two-step inline confirm as
 * the public team page (`Teams/TeamMembershipActions`), and the same blocked
 * copy (`teamLeaveBlockedReason` / server refusal codes) so the two pages
 * never disagree. `onLeave` resolves on success — the page then drops the
 * team, which unmounts this card — or throws a `TeamMembershipError`.
 */
export function LeaveTeamControl({
  teamName,
  slackChannel,
  memberCount,
  blockedReason,
  onLeave,
}) {
  const [confirming, setConfirming] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState(null);
  const [refusal, setRefusal] = useState(null);

  const name = teamName || "this team";
  const channel = slackChannel
    ? `#${String(slackChannel).replace(/^#/, "")}`
    : "the team's Slack channel";
  const reason = blockedReason || refusal;

  const handleLeave = async () => {
    setLeaving(true);
    setError(null);
    try {
      await onLeave();
    } catch (err) {
      setConfirming(false);
      if (isMembershipRefusal(err)) {
        setRefusal(err.message);
      } else {
        setError(err?.message || "Couldn't leave the team. Please try again.");
      }
    } finally {
      setLeaving(false);
    }
  };

  let body;
  if (reason) {
    body = (
      <Box component="p" sx={mutedSx}>
        {reason}
      </Box>
    );
  } else if (confirming) {
    body = (
      <Box role="group" aria-label={`Leave ${name}?`}>
        <Box component="p" sx={{ ...mutedSx, color: "var(--ink)", mb: 0.5 }}>
          {memberCount <= 1
            ? `You're the only member — ${name} will have no one on it. An organizer can close it.`
            : `Leave ${name}? Your teammates will see a note in ${channel}.`}
        </Box>
        <Box component="p" sx={{ ...mutedSx, mb: 1.5 }}>
          You&apos;ll stay in the Slack channel; you can leave it in Slack.
        </Box>
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <button
            type="button"
            className="ohx-btn ohx-btn--primary"
            onClick={handleLeave}
            disabled={leaving}
            style={leaving ? { opacity: 0.6, cursor: "not-allowed" } : undefined}
          >
            {leaving && (
              <CircularProgress size={14} sx={{ color: "inherit" }} aria-hidden />
            )}
            {leaving ? "Leaving…" : "Yes, leave the team"}
          </button>
          <button
            type="button"
            className="ohx-btn ohx-btn--ghost"
            onClick={() => setConfirming(false)}
            disabled={leaving}
          >
            Stay on the team
          </button>
        </Box>
      </Box>
    );
  } else {
    body = (
      <button
        type="button"
        className="ohx-btn ohx-btn--ghost"
        onClick={() => {
          setError(null);
          setConfirming(true);
        }}
      >
        Leave team
      </button>
    );
  }

  return (
    <Box
      sx={{
        mt: 2.5,
        pt: 2.5,
        borderTop: "1px solid var(--line, #E7E1D4)",
        minHeight: 44,
      }}
    >
      {error && (
        <Box role="alert" sx={errorStripSx}>
          <span>{error}</span>
          <button
            type="button"
            className="ohx-link"
            onClick={() => setError(null)}
            style={linkButtonStyle}
          >
            Dismiss
          </button>
        </Box>
      )}
      {body}
    </Box>
  );
}

export default function TeamRoster({
  users,
  loading,
  ownId,
  eventId,
  teamId,
  teamFindingEnabled,
  teamName,
  slackChannel,
  leaveBlockedReason,
  onLeave,
}) {
  const [copied, setCopied] = useState(false);

  const inviteLink = () => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/hack/${eventId}/team/${teamId}`;
  };

  const handleInvite = () => {
    const link = inviteLink();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(link).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardSection id="roster" eyebrow="Your teammates" title={ROSTER_TITLE}>
      {loading ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {[0, 1, 2].map((i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              height={56}
              sx={{ borderRadius: 1 }}
            />
          ))}
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
          {(users || []).map((member) => (
            <Box
              key={member.id || member.user_id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                minHeight: 56,
              }}
            >
              <Avatar member={member} />
              <a href={`/profile/${member.id}`} className="ohx-link">
                {memberName(member)}
              </a>
              {member.id === ownId && <span className="ohx-tag">You</span>}
            </Box>
          ))}
          {(users || []).length === 0 && (
            <Box sx={{ color: "var(--muted)" }}>No teammates listed yet.</Box>
          )}
        </Box>
      )}

      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <button
          type="button"
          className="ohx-btn ohx-btn--ghost"
          onClick={handleInvite}
        >
          {copied ? "Link copied ✓" : "Invite a teammate"}
        </button>
        {teamFindingEnabled && (
          <a href={`/hack/${eventId}/findteam`} className="ohx-link">
            Find teammates →
          </a>
        )}
      </Box>
      {copied && (
        <Box sx={{ fontSize: "0.8rem", color: "var(--muted)", mt: 0.5 }}>
          Send them this link — they click Join on your public team page.
        </Box>
      )}

      {/* Hidden while the roster loads so the last-member warning is never
          shown against an empty list. */}
      {onLeave && !loading && (
        <LeaveTeamControl
          teamName={teamName}
          slackChannel={slackChannel}
          memberCount={(users || []).length}
          blockedReason={leaveBlockedReason}
          onLeave={onLeave}
        />
      )}
    </DashboardSection>
  );
}
