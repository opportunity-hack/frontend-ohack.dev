import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { setMentorAvailability, isNotFound } from "../../lib/teamDashboardApi";
import { trackEvent, EventCategory } from "../../lib/ga";

const OPEN = {
  value: "open",
  label: "Open to mentors",
  color: "var(--success, #2F6E50)",
  helper: "Mentors may drop into your channel to check in.",
};
const HEADS_DOWN = {
  value: "heads_down",
  label: "Heads-down",
  color: "var(--danger, #B04A36)",
  helper: "Mentors will hold off unless you ask in #ask-a-mentor.",
};

/**
 * Two-way segmented toggle — a signal only, never a behavior gate. Optimistic
 * with revert-on-failure; hidden entirely on a 404 (older backend).
 */
export default function MentorAvailabilityToggle({
  team,
  accessToken,
  onTeamUpdated,
  onNotify,
}) {
  const [open, setOpen] = useState(team?.mentor_help_wanted !== false);
  const [hidden, setHidden] = useState(false);
  const [saving, setSaving] = useState(false);

  // Resync when a fresh `team` merges in `mentor_help_wanted` from
  // elsewhere — a teammate's edit picked up on `use-public-team.js`'s
  // `visibilitychange` refetch, or another tab's own toggle. Skipped while
  // `saving` so an in-flight optimistic update isn't clobbered by the
  // (not-yet-updated) value it's about to replace.
  useEffect(() => {
    if (saving) return;
    setOpen(team?.mentor_help_wanted !== false);
  }, [team?.mentor_help_wanted]);

  if (hidden) return null;

  const choose = async (wantsOpen) => {
    if (wantsOpen === open || saving) return;
    const prev = open;
    setOpen(wantsOpen);
    setSaving(true);
    try {
      await setMentorAvailability(team.id, wantsOpen, accessToken);
      onTeamUpdated?.(team.id, { mentor_help_wanted: wantsOpen });
      trackEvent({
        action: "team_mentor_availability_toggled",
        params: {
          event_category: EventCategory.ENGAGEMENT,
          event_label: wantsOpen ? "open" : "heads_down",
        },
      });
    } catch (err) {
      setOpen(prev);
      if (isNotFound(err)) {
        setHidden(true);
      } else {
        onNotify?.(
          "Couldn't update mentor availability. Please try again.",
          "error",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      choose(!open);
    }
  };

  const current = open ? OPEN : HEADS_DOWN;

  return (
    <Box sx={{ mb: 2.5 }}>
      <div
        role="radiogroup"
        aria-label="Mentor availability"
        onKeyDown={handleKeyDown}
        style={{
          display: "flex",
          border: "1px solid var(--line, #E7E1D4)",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {[OPEN, HEADS_DOWN].map((opt) => {
          const selected = opt.value === current.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => choose(opt.value === "open")}
              style={{
                flex: 1,
                minHeight: 56,
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.95rem",
                background: selected ? opt.color : "var(--paper, #fff)",
                color: selected ? "#fff" : "var(--ink, #16181D)",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      <Box sx={{ fontSize: "0.85rem", color: "var(--muted)", mt: 0.75 }}>
        {current.helper}
      </Box>
    </Box>
  );
}
