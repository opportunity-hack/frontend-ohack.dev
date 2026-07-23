import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  InputLabel,
  Divider,
} from "@mui/material";
import CronInput, { isValidCron } from "./CronInput";

const EMPTY_FORM = {
  name: "",
  enabled: true,
  mode: "repos",
  event_id: "",
  repos: "",
  channels: "",
  digest_enabled: true,
  digest_cron: "0 16 * * *",
  rollup_enabled: false,
  rollup_cron: "0 16 * * 1",
  rollup_channel: "",
  dry_run: false,
};

const toForm = (watcher) => ({
  name: watcher.name || "",
  enabled: watcher.enabled !== false,
  mode: watcher.source?.mode || "repos",
  event_id: watcher.source?.event_id || "",
  repos: (watcher.source?.repos || []).join("\n"),
  channels: (watcher.source?.channels || []).join(", "),
  digest_enabled: Boolean(watcher.digest?.enabled),
  digest_cron: watcher.digest?.cron || "0 16 * * *",
  rollup_enabled: Boolean(watcher.rollup?.enabled),
  rollup_cron: watcher.rollup?.cron || "0 16 * * 1",
  rollup_channel: watcher.rollup?.channel || "",
  dry_run: Boolean(watcher.dry_run),
});

const GithubWatcherEditDialog = ({ open, onClose, watcher, hackathons, onSave }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setForm(watcher ? toForm(watcher) : EMPTY_FORM);
    setErrors({});
  }, [watcher, open]);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (form.mode === "hackathon" && !form.event_id) {
      next.event_id = "Pick a hackathon event";
    }
    if (form.mode === "repos") {
      if (!form.repos.trim()) next.repos = "At least one repo is required";
      if (!form.channels.trim()) next.channels = "At least one channel is required";
    }
    if (form.digest_enabled && !isValidCron(form.digest_cron)) next.digest_cron = true;
    if (form.rollup_enabled) {
      if (!isValidCron(form.rollup_cron)) next.rollup_cron = true;
      if (!form.rollup_channel.trim()) next.rollup_channel = "Rollup channel is required";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const source =
        form.mode === "hackathon"
          ? { mode: "hackathon", event_id: form.event_id }
          : {
              mode: "repos",
              repos: form.repos.split(/\n|,/).map((s) => s.trim()).filter(Boolean),
              channels: form.channels.split(",").map((s) => s.trim()).filter(Boolean),
            };
      await onSave({
        id: watcher?.id,
        type: "github_watcher",
        name: form.name.trim(),
        enabled: form.enabled,
        source,
        digest: { enabled: form.digest_enabled, cron: form.digest_cron.trim() },
        rollup: {
          enabled: form.rollup_enabled,
          cron: form.rollup_cron.trim(),
          channel: form.rollup_channel.trim(),
        },
        dry_run: form.dry_run,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{watcher ? "Edit GitHub Watcher" : "Add GitHub Watcher"}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
              label="Name"
              value={form.name}
              onChange={(e) => set("name")(e.target.value)}
              error={Boolean(errors.name)}
              helperText={errors.name}
              sx={{ flexGrow: 1 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.enabled}
                  onChange={(e) => set("enabled")(e.target.checked)}
                />
              }
              label="Enabled"
            />
          </Box>

          <FormControl>
            <FormLabel>Source</FormLabel>
            <RadioGroup
              row
              value={form.mode}
              onChange={(e) => set("mode")(e.target.value)}
            >
              <FormControlLabel
                value="repos"
                control={<Radio />}
                label="Explicit repo list"
              />
              <FormControlLabel
                value="hackathon"
                control={<Radio />}
                label="Hackathon teams"
              />
            </RadioGroup>
          </FormControl>

          {form.mode === "hackathon" ? (
            <FormControl error={Boolean(errors.event_id)}>
              <InputLabel>Hackathon event</InputLabel>
              <Select
                label="Hackathon event"
                value={form.event_id}
                onChange={(e) => set("event_id")(e.target.value)}
              >
                {(hackathons || []).map((h) => (
                  <MenuItem key={h.event_id} value={h.event_id}>
                    {h.event_id} {h.title ? `— ${h.title}` : ""}
                  </MenuItem>
                ))}
              </Select>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                Teams, repos, and channels are pulled live from this event&apos;s
                active teams — same behavior as the original bot.
              </Typography>
            </FormControl>
          ) : (
            <>
              <TextField
                label="Repos (one per line — owner/repo or GitHub URL)"
                value={form.repos}
                onChange={(e) => set("repos")(e.target.value)}
                error={Boolean(errors.repos)}
                helperText={errors.repos}
                multiline
                minRows={3}
              />
              <TextField
                label="Slack channels (comma-separated names or C… IDs)"
                value={form.channels}
                onChange={(e) => set("channels")(e.target.value)}
                error={Boolean(errors.channels)}
                helperText={
                  errors.channels ||
                  "Channel IDs (C0123…) are more reliable than names in large workspaces"
                }
              />
            </>
          )}

          <Divider />
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.digest_enabled}
                  onChange={(e) => set("digest_enabled")(e.target.checked)}
                />
              }
              label="Daily digest"
              sx={{ minWidth: 140 }}
            />
          </Box>
          {form.digest_enabled && (
            <CronInput
              label="Digest"
              value={form.digest_cron}
              onChange={set("digest_cron")}
              error={Boolean(errors.digest_cron)}
            />
          )}

          <Divider />
          <FormControlLabel
            control={
              <Switch
                checked={form.rollup_enabled}
                onChange={(e) => set("rollup_enabled")(e.target.checked)}
              />
            }
            label="Mentor rollup (cross-team health summary)"
          />
          {form.rollup_enabled && (
            <>
              <CronInput
                label="Rollup"
                value={form.rollup_cron}
                onChange={set("rollup_cron")}
                error={Boolean(errors.rollup_cron)}
              />
              <TextField
                label="Rollup channel (name or C… ID)"
                value={form.rollup_channel}
                onChange={(e) => set("rollup_channel")(e.target.value)}
                error={Boolean(errors.rollup_channel)}
                helperText={errors.rollup_channel}
              />
            </>
          )}

          <Divider />
          <FormControlLabel
            control={
              <Switch
                checked={form.dry_run}
                onChange={(e) => set("dry_run")(e.target.checked)}
              />
            }
            label="Dry run (log to bot console instead of posting to Slack)"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GithubWatcherEditDialog;
