import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import axios from "axios";
import { useAuthInfo } from "@propelauth/react";
import SectionContainer from "../SectionContainer";
import {
  DEFAULT_EVENT_TIMEZONE,
  toIsoWithTimezone,
  safeParse,
  formatDualTimezone,
} from "../../../../lib/timezoneUtils";
import {
  validateDeadlines,
  upsertCountdownByName,
  hoursBeforeLabel,
} from "../deadlinesUtils";
import * as ga from "../../../../lib/ga";

const REMINDER_HOURS = [24, 6, 1];

const DeadlineField = ({
  label,
  description,
  value,
  onChange,
  error,
  minDateTime,
  tz,
}) => {
  const parsed = safeParse(value);
  const dual = parsed ? formatDualTimezone(parsed, tz) : null;
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 0.25 }}>
        {label}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {description}
        </Typography>
      )}
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DateTimePicker
          value={parsed}
          onChange={(d) => onChange(d ? toIsoWithTimezone(d, tz) : null)}
          minDateTime={minDateTime}
          slotProps={{
            textField: {
              size: "small",
              sx: { width: 280 },
              error: Boolean(error),
              helperText:
                error ||
                (dual
                  ? `${dual.eventTime} ${dual.eventAbbr}${
                      dual.isSameTimezone
                        ? ""
                        : ` · Your time: ${dual.userTime} ${dual.userAbbr}`
                    }`
                  : "Not set"),
            },
          }}
        />
      </LocalizationProvider>
      {value && (
        <Button
          size="small"
          color="inherit"
          sx={{ mt: 0.5, display: "block" }}
          onClick={() => onChange(null)}
        >
          Clear
        </Button>
      )}
    </Box>
  );
};

const DeadlinesSection = ({ admin, accessToken, orgId, onSnack }) => {
  const {
    hackathon,
    setField,
    setConstraint,
    markSectionDirty,
    dirtySections,
    commitSection,
    discardSection,
    saveState,
  } = admin;
  const { orgHelper } = useAuthInfo();
  const deadlines = hackathon.deadlines || {};
  const constraints = hackathon.constraints || {};
  const tz = hackathon.timezone || DEFAULT_EVENT_TIMEZONE;
  const dirty = dirtySections.has("deadlines");
  const saving = saveState.status === "saving";
  const eventId = hackathon.event_id;
  const apiBase = process.env.NEXT_PUBLIC_API_SERVER_URL;
  const resolvedOrgId = orgId || orgHelper?.getOrgs()?.[0]?.orgId;

  const [sendingReminder, setSendingReminder] = useState(null);

  const { errors, warnings } = validateDeadlines(deadlines);
  const hasErrors = Object.keys(errors).length > 0;

  const update = (key, value) => {
    setField("deadlines", { ...deadlines, [key]: value });
    markSectionDirty("deadlines", true);
  };

  const submissionDate = safeParse(deadlines.submission);

  const addToCountdownTimeline = () => {
    if (!deadlines.submission) return;
    const next = upsertCountdownByName(hackathon.countdowns, {
      name: "Submissions close",
      time: deadlines.submission,
      description: "Final project submissions are due.",
    });
    setField("countdowns", next);
    markSectionDirty("deadlines", true);
    onSnack?.(
      "Added to the countdown timeline — save to publish it.",
      "success",
    );
  };

  const slateSize = Number(constraints.peer_vote_slate_size) || 5;
  const maxPicksCeiling = Math.max(1, slateSize - 1);

  const sendReminder = async (hours) => {
    if (!eventId) return;
    setSendingReminder(hours);
    try {
      const res = await axios.post(
        `${apiBase}/api/hackathons/${encodeURIComponent(eventId)}/deadlines/remind`,
        { kind: "submission", hours_before: hours },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            ...(resolvedOrgId ? { "X-Org-Id": resolvedOrgId } : {}),
          },
        },
      );
      const data = res.data || {};
      const notified = data.notified?.length ?? 0;
      const skipped = data.skipped?.length ?? 0;
      onSnack?.(
        `Reminder sent — ${notified} team${notified === 1 ? "" : "s"} notified` +
          (skipped ? `, ${skipped} skipped` : ""),
        "success",
      );
      ga.trackStructuredEvent(
        ga.EventCategory.ADMIN,
        "admin_deadline_reminder_sent",
        eventId,
        hours,
      );
    } catch (err) {
      const status = err?.response?.status;
      const body = err?.response?.data;
      // send_deadline_reminders (submissions_service.py) returns
      // {"error": ...}, not {"message": ...} — reading body?.message here
      // rendered a generic fallback even when the backend explained why.
      if (status === 409 && body?.error === "already_sent") {
        onSnack?.(
          "That reminder has already been sent for this deadline.",
          "info",
        );
      } else if (status === 409 && body?.error === "no_deadline") {
        onSnack?.(
          "Set a submission deadline before sending this reminder.",
          "warning",
        );
      } else if (status === 404) {
        onSnack?.("Reminders aren't available on this backend yet.", "warning");
      } else {
        onSnack?.(
          body?.message || body?.error || "Failed to send reminder.",
          "error",
        );
      }
    } finally {
      setSendingReminder(null);
    }
  };

  return (
    <SectionContainer
      title="Deadlines"
      description={`Submission cutoff and Hackers' Choice voting window. Times are saved in the event timezone (${tz}). Deadlines + countdown changes are explicit-save; Hackers' Choice toggles below save automatically.`}
      dirty={dirty}
      saving={saving}
      saveDisabled={hasErrors}
      onSave={() => commitSection("deadlines")}
      onDiscard={() => discardSection("deadlines")}
    >
      <Stack spacing={3} sx={{ maxWidth: 640 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          <DeadlineField
            label="Submissions close"
            description="Hard deadline for the project write-up + demo video."
            value={deadlines.submission}
            onChange={(v) => update("submission", v)}
            tz={tz}
          />
          <DeadlineField
            label="Late submissions open until"
            description="Optional — leave blank to disable late submissions."
            value={deadlines.late_submission_until}
            onChange={(v) => update("late_submission_until", v)}
            error={errors.late_submission_until}
            minDateTime={submissionDate}
            tz={tz}
          />
        </Box>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          <DeadlineField
            label="Hackers' Choice voting opens"
            description="Defaults to the late-submission close (or the submission deadline) when unset."
            value={deadlines.voting_opens}
            onChange={(v) => update("voting_opens", v)}
            tz={tz}
          />
          <DeadlineField
            label="Hackers' Choice voting closes"
            description="Defaults to the end of the event day when unset."
            value={deadlines.voting_closes}
            onChange={(v) => update("voting_closes", v)}
            error={errors.voting_closes}
            tz={tz}
          />
        </Box>
        {warnings.voting_opens && (
          <Alert severity="warning">{warnings.voting_opens}</Alert>
        )}

        <Box>
          <Button
            size="small"
            variant="outlined"
            disabled={!deadlines.submission}
            onClick={addToCountdownTimeline}
          >
            Add to countdown timeline
          </Button>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 0.5 }}
          >
            Upserts a "Submissions close" entry on the public countdown so
            hackers see it on the event page too.
          </Typography>
        </Box>

        <Divider />

        <Card variant="outlined">
          <CardHeader
            title="Hackers' Choice peer vote"
            subheader="Eligible hackers pick up to N projects they'd be proud to have built. No tallies are ever shown to voters."
          />
          <CardContent>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={!!constraints.peer_vote_enabled}
                    onChange={(e) =>
                      setConstraint("peer_vote_enabled", e.target.checked)
                    }
                  />
                }
                label="Enable Hackers' Choice for this event"
              />
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <TextField
                  label="Slate size"
                  type="number"
                  size="small"
                  value={constraints.peer_vote_slate_size ?? 5}
                  onChange={(e) => {
                    const v = Math.min(
                      10,
                      Math.max(3, Number(e.target.value) || 5),
                    );
                    setConstraint("peer_vote_slate_size", v);
                  }}
                  inputProps={{ min: 3, max: 10 }}
                  sx={{ width: 160 }}
                  helperText="3–10 projects per ballot"
                />
                <TextField
                  label="Max picks"
                  type="number"
                  size="small"
                  value={constraints.peer_vote_max_picks ?? 2}
                  onChange={(e) => {
                    const v = Math.min(
                      maxPicksCeiling,
                      Math.max(1, Number(e.target.value) || 1),
                    );
                    setConstraint("peer_vote_max_picks", v);
                  }}
                  inputProps={{ min: 1, max: maxPicksCeiling }}
                  sx={{ width: 160 }}
                  helperText={`1–${maxPicksCeiling} (less than slate size)`}
                />
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={!!constraints.peer_vote_requires_submission}
                    onChange={(e) =>
                      setConstraint(
                        "peer_vote_requires_submission",
                        e.target.checked,
                      )
                    }
                  />
                }
                label="Require voters to have a submitted project themselves"
              />
            </Stack>
          </CardContent>
        </Card>

        <Divider />

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            Send a submission reminder now
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Posts a Slack reminder to every team missing something, tailored to
            what's left. Disabled while there are unsaved deadline changes, or
            if no submission deadline is set.
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {REMINDER_HOURS.map((hours) => (
              <Button
                key={hours}
                size="small"
                variant="outlined"
                disabled={
                  dirty || !deadlines.submission || sendingReminder != null
                }
                onClick={() => sendReminder(hours)}
              >
                {sendingReminder === hours
                  ? "Sending…"
                  : hoursBeforeLabel(hours)}
              </Button>
            ))}
          </Box>
        </Box>

        {hasErrors && (
          <Alert severity="error">
            Fix the highlighted times above before saving.
          </Alert>
        )}
      </Stack>
    </SectionContainer>
  );
};

export default DeadlinesSection;
