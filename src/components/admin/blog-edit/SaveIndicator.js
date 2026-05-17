import React, { useEffect, useState } from "react";
import { Box, Chip, Tooltip } from "@mui/material";
import {
  CloudDone as SavedIcon,
  CloudSync as SavingIcon,
  CloudOff as ErrorIcon,
  PauseCircleOutline as PausedIcon,
} from "@mui/icons-material";
import { SECTION_LABELS } from "./useBlogAdmin";

const formatRelative = (ts) => {
  if (!ts) return "";
  const secs = Math.max(1, Math.round((Date.now() - ts) / 1000));
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  return new Date(ts).toLocaleTimeString();
};

const SaveIndicator = ({ saveState, dirtySections }) => {
  const [, force] = useState(0);
  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 15000);
    return () => clearInterval(t);
  }, []);

  if (dirtySections && dirtySections.size > 0) {
    const labels = Array.from(dirtySections).map((s) => SECTION_LABELS[s] || s).join(", ");
    return (
      <Tooltip title="Autosave is paused while you have unsaved manual changes. Save or discard them to resume.">
        <Chip
          icon={<PausedIcon />}
          label={`Unsaved · ${labels}`}
          color="warning"
          size="small"
          variant="outlined"
        />
      </Tooltip>
    );
  }

  if (saveState.status === "saving") {
    return <Chip icon={<SavingIcon />} label="Saving…" size="small" color="info" variant="outlined" />;
  }
  if (saveState.status === "error") {
    return (
      <Tooltip title={saveState.error || "Autosave failed. Edits will retry on the next change."}>
        <Chip icon={<ErrorIcon />} label="Save failed" size="small" color="error" />
      </Tooltip>
    );
  }
  if (saveState.status === "saved" && saveState.lastSavedAt) {
    return <Chip icon={<SavedIcon />} label={`Saved · ${formatRelative(saveState.lastSavedAt)}`} size="small" color="success" variant="outlined" />;
  }
  return <Box sx={{ width: 1 }} />;
};

export default SaveIndicator;
