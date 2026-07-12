import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControlLabel,
  Switch,
} from "@mui/material";
import CronInput, { isValidCron } from "./CronInput";

const EMPTY_FORM = {
  name: "",
  enabled: true,
  calendar_id: "",
  channels: "",
  lead_minutes: 15,
  events_page_url: "https://www.ohack.dev/office-hours",
  poll_cron: "*/5 * * * *",
};

const toForm = (reminder) => ({
  name: reminder.name || "",
  enabled: reminder.enabled !== false,
  calendar_id: reminder.calendar_id || "",
  channels: (reminder.channels || []).join(", "),
  lead_minutes: reminder.lead_minutes || 15,
  events_page_url: reminder.events_page_url || "",
  poll_cron: reminder.poll_cron || "*/5 * * * *",
});

const CalendarReminderEditDialog = ({ open, onClose, reminder, onSave }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setForm(reminder ? toForm(reminder) : EMPTY_FORM);
    setErrors({});
  }, [reminder, open]);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!form.calendar_id.trim()) next.calendar_id = "Google Calendar ID is required";
    if (!form.channels.trim()) next.channels = "At least one channel is required";
    const lead = parseInt(form.lead_minutes, 10);
    if (!Number.isInteger(lead) || lead < 1 || lead > 240) {
      next.lead_minutes = "Must be between 1 and 240 minutes";
    }
    if (!isValidCron(form.poll_cron)) next.poll_cron = true;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onSave({
        id: reminder?.id,
        type: "calendar_reminder",
        name: form.name.trim(),
        enabled: form.enabled,
        calendar_id: form.calendar_id.trim(),
        channels: form.channels.split(",").map((s) => s.trim()).filter(Boolean),
        lead_minutes: parseInt(form.lead_minutes, 10),
        events_page_url: form.events_page_url.trim(),
        poll_cron: form.poll_cron.trim(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {reminder ? "Edit Calendar Reminder" : "Add Calendar Reminder"}
      </DialogTitle>
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
          <TextField
            label="Public Google Calendar ID"
            value={form.calendar_id}
            onChange={(e) => set("calendar_id")(e.target.value)}
            error={Boolean(errors.calendar_id)}
            helperText={
              errors.calendar_id ||
              "e.g. c_…@group.calendar.google.com — the calendar must be public (read via its ICS feed)"
            }
          />
          <TextField
            label="Slack channels (comma-separated names or C… IDs)"
            value={form.channels}
            onChange={(e) => set("channels")(e.target.value)}
            error={Boolean(errors.channels)}
            helperText={errors.channels}
          />
          <TextField
            label="Lead time (minutes before event)"
            type="number"
            value={form.lead_minutes}
            onChange={(e) => set("lead_minutes")(e.target.value)}
            error={Boolean(errors.lead_minutes)}
            helperText={errors.lead_minutes}
            sx={{ maxWidth: 280 }}
          />
          <TextField
            label="Events page URL (linked in reminders)"
            value={form.events_page_url}
            onChange={(e) => set("events_page_url")(e.target.value)}
          />
          <CronInput
            label="Poll"
            value={form.poll_cron}
            onChange={set("poll_cron")}
            error={Boolean(errors.poll_cron)}
            helperText="How often the bot checks the calendar (every 5 minutes is typical)"
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

export default CalendarReminderEditDialog;
