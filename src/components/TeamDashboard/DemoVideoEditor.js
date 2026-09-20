import React, { useState } from "react";
import { Box, TextField } from "@mui/material";
import DashboardSection from "./DashboardSection";
import LiteVideoThumbnail from "../VideoDisplay/LiteVideoThumbnail";
import { saveTeamDemoVideo } from "../../lib/teamDashboardApi";
import { trackEvent, EventCategory } from "../../lib/ga";

// Verbatim from the retired TeamStatusPanel.js — accepts YouTube, Vimeo,
// Loom, or Google Drive (matches the VideoDisplay providers).
function isValidDemoVideoUrl(url) {
  if (!url) return false;
  const trimmed = url.trim();
  return (
    /youtube\.com\/.+v=[\w-]{11}/i.test(trimmed) ||
    /youtu\.be\/[\w-]{11}/i.test(trimmed) ||
    /vimeo\.com\/\d+/i.test(trimmed) ||
    /loom\.com\/(share|embed)\/[a-zA-Z0-9]+/i.test(trimmed) ||
    /drive\.google\.com\/file\/d\//i.test(trimmed)
  );
}

/**
 * Demo video link. The 320×180 frame is always reserved (`LiteVideoThumbnail`
 * or an empty placeholder of the same size) so saving a video doesn't shift
 * the layout.
 */
export default function DemoVideoEditor({
  team,
  accessToken,
  onTeamUpdated,
  onNotify,
}) {
  const [value, setValue] = useState(team?.demo_video_url || "");
  const [saving, setSaving] = useState(false);

  const showError = value && !isValidDemoVideoUrl(value);

  const handleSave = async () => {
    const url = value.trim();
    if (!url || !isValidDemoVideoUrl(url)) {
      onNotify?.(
        "Please enter a YouTube, Vimeo, Loom, or Google Drive video URL.",
        "error",
      );
      return;
    }
    setSaving(true);
    try {
      await saveTeamDemoVideo(team.id, url, accessToken);
      onTeamUpdated?.(team.id, { demo_video_url: url });
      onNotify?.(
        "Demo video saved! Judges and visitors will see it on your project page.",
        "success",
      );
      trackEvent({
        action: "team_demo_video_saved",
        params: {
          event_category: EventCategory.ENGAGEMENT,
          event_label: team?.id,
        },
      });
    } catch {
      onNotify?.("Failed to update demo video. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardSection
      id="demo"
      eyebrow="Show what you built"
      title="Demo video"
    >
      <Box sx={{ color: "var(--muted)", mb: 2, maxWidth: "40em" }}>
        4 minutes or less. Show the problem, the demo, and who it helps.
      </Box>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "flex-start",
        }}
      >
        <Box sx={{ width: 320, height: 180, flexShrink: 0 }}>
          {isValidDemoVideoUrl(team?.demo_video_url) ? (
            <LiteVideoThumbnail
              url={team.demo_video_url}
              width={320}
              height={180}
            />
          ) : (
            <Box
              sx={{
                width: 320,
                height: 180,
                borderRadius: 1,
                border: "1px dashed var(--line, #E7E1D4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--faint)",
                fontSize: "0.85rem",
                bgcolor: "var(--surface-2, #F4F1E9)",
              }}
            >
              No video yet
            </Box>
          )}
        </Box>
        <Box sx={{ flex: 1, minWidth: 240 }}>
          <TextField
            fullWidth
            label="Demo video URL"
            placeholder="https://youtu.be/..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            error={!!showError}
            helperText={
              showError
                ? "Enter a YouTube, Vimeo, Loom, or Google Drive link"
                : " "
            }
            sx={{ mb: 1.5 }}
          />
          <button
            type="button"
            className="ohx-btn ohx-btn--primary"
            onClick={handleSave}
            disabled={saving || !value.trim()}
          >
            {saving ? "Saving…" : "Save video"}
          </button>
        </Box>
      </Box>
    </DashboardSection>
  );
}
