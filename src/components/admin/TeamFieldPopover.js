import React, { useState, useEffect } from "react";
import {
  Popover,
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import LiteVideoThumbnail from "../VideoDisplay/LiteVideoThumbnail";

/**
 * Inline quick-edit Popover for a single team field.
 * Designed to anchor to a table cell (DOM element passed as anchorEl).
 *
 * Props:
 *   open, anchorEl, onClose
 *   team               — current team object (used for id + current value)
 *   field              — db field key, e.g. "demo_video_url" or "devpost_link"
 *   label              — TextField label
 *   placeholder        — TextField placeholder
 *   helperText         — TextField helperText
 *   validate(value)    — optional (value) => string|null  (returns error msg or null)
 *   previewKind        — "video" | "none"
 *   onSave(team, partial)  — async; should perform the patch and resolve on success
 */
const TeamFieldPopover = ({
  open,
  anchorEl,
  onClose,
  team,
  field,
  label,
  placeholder,
  helperText,
  validate,
  previewKind = "none",
  onSave,
}) => {
  const initial = team?.[field] || "";
  const [value, setValue] = useState(initial);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setValue(team?.[field] || "");
    }
  }, [open, team, field]);

  const validationError = validate ? validate(value) : null;
  const trimmed = (value || "").trim();
  const isDirty = trimmed !== (team?.[field] || "").trim();
  const canSave = !saving && !validationError && isDirty;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await onSave(team, { [field]: trimmed });
      onClose();
    } catch (err) {
      // onSave is expected to surface its own error UI (snackbar); leave popover open.
      console.error(`Failed to save ${field}:`, err);
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await onSave(team, { [field]: "" });
      onClose();
    } catch (err) {
      console.error(`Failed to clear ${field}:`, err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
    >
      <Box sx={{ p: 2, width: 360 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {team?.name ? `${team.name} — ${label}` : label}
        </Typography>
        <TextField
          fullWidth
          size="small"
          autoFocus
          label={label}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          error={!!validationError}
          helperText={validationError || helperText}
          onKeyDown={(e) => {
            if (e.key === "Enter" && canSave) {
              e.preventDefault();
              handleSave();
            }
          }}
          sx={{ mb: 1.5 }}
        />

        {previewKind === "video" && trimmed && !validationError && (
          <Box sx={{ mb: 1.5 }}>
            <LiteVideoThumbnail url={trimmed} label="Preview" />
          </Box>
        )}

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          {team?.[field] && (
            <Button
              size="small"
              color="error"
              onClick={handleClear}
              disabled={saving}
            >
              Clear
            </Button>
          )}
          <Button size="small" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={handleSave}
            disabled={!canSave}
            startIcon={saving ? <CircularProgress size={14} /> : null}
          >
            {saving ? "Saving" : "Save"}
          </Button>
        </Stack>
      </Box>
    </Popover>
  );
};

export default TeamFieldPopover;
