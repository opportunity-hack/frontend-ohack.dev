import React, { useState } from "react";
import { Box, TextField } from "@mui/material";
import DashboardSection from "./DashboardSection";
import {
  saveTeamDevpost,
  isSubmissionsClosed,
  isNotTeamMember,
} from "../../lib/teamDashboardApi";
import {
  formatDeadlineMoment,
  getEventTimezone,
} from "../../lib/timezoneUtils";
import { trackEvent, EventCategory } from "../../lib/ga";

// Verbatim from the retired TeamStatusPanel.js.
function isValidDevPostUrl(url) {
  if (!url) return false;
  const devpostPattern =
    /^https?:\/\/(www\.)?devpost\.com\/software\/[a-zA-Z0-9-_]+\/?$/;
  return devpostPattern.test(url.trim());
}

/**
 * Optional DevPost portfolio link. Framed as extra, not required — the
 * public project page already covers the essentials.
 */
export default function DevPostEditor({
  team,
  event,
  accessToken,
  onTeamUpdated,
  onNotify,
}) {
  const [value, setValue] = useState(team?.devpost_link || "");
  const [saving, setSaving] = useState(false);

  const showError = value && !isValidDevPostUrl(value);

  const handleSave = async () => {
    const url = value.trim();
    if (!url || !isValidDevPostUrl(url)) {
      onNotify?.(
        "Please enter a valid DevPost project URL (e.g., https://devpost.com/software/your-project)",
        "error",
      );
      return;
    }
    setSaving(true);
    try {
      await saveTeamDevpost(team.id, url, accessToken);
      onTeamUpdated?.(team.id, { devpost_link: url });
      onNotify?.("DevPost link saved.", "success");
      trackEvent({
        action: "team_devpost_saved",
        params: {
          event_category: EventCategory.ENGAGEMENT,
          event_label: team?.id,
        },
      });
    } catch (err) {
      if (isSubmissionsClosed(err)) {
        onNotify?.(
          err.body?.late_until
            ? `Submissions are closed, but late submissions are open until ${formatDeadlineMoment(err.body.late_until, getEventTimezone(event))}.`
            : "Submissions are closed for this event.",
          "error",
        );
      } else if (isNotTeamMember(err)) {
        onNotify?.(
          "You're not a member of this team, so this can't be saved.",
          "error",
        );
      } else {
        onNotify?.("Failed to update DevPost link. Please try again.", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardSection id="devpost" eyebrow="Optional" title="DevPost project">
      <Box sx={{ color: "var(--muted)", mb: 2, maxWidth: "40em" }}>
        Some teams like an extra portfolio link. Your public project page
        already covers the essentials.
      </Box>
      <TextField
        fullWidth
        label="DevPost project URL"
        placeholder="https://devpost.com/software/your-project-name"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        error={!!showError}
        helperText={
          showError
            ? "Enter a valid DevPost URL, e.g. https://devpost.com/software/your-project"
            : " "
        }
        sx={{ mb: 2 }}
      />
      <button
        type="button"
        className="ohx-btn ohx-btn--ghost"
        onClick={handleSave}
        disabled={saving || !value.trim()}
      >
        {saving ? "Saving…" : "Save DevPost link"}
      </button>
    </DashboardSection>
  );
}
