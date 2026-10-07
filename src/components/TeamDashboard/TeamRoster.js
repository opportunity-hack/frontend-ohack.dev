import React, { useState } from "react";
import { Box, Skeleton } from "@mui/material";
import DashboardSection from "./DashboardSection";
import { ROSTER_TITLE } from "./copy";

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

export default function TeamRoster({
  users,
  loading,
  ownId,
  eventId,
  teamId,
  teamFindingEnabled,
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
    </DashboardSection>
  );
}
