import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { Send } from "@mui/icons-material";

export default function PlanningSlackSettings({ planning = {}, onUpdateConfig, onSlackNotify }) {
  const slack = planning.slack || {};
  const [channel, setChannel] = useState((slack.channel || "").replace(/^#/, ""));
  const [notify, setNotify] = useState(!!slack.notify_on_card_change);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState(null); // { severity, message }

  async function handleSave() {
    setSaving(true);
    await onUpdateConfig({
      slack: { channel: channel.replace(/^#/, ""), notify_on_card_change: notify },
    });
    setSaving(false);
  }

  async function handleSendNow() {
    setSending(true);
    setFeedback(null);
    const result = await onSlackNotify();
    if (result?.ok) {
      setFeedback({
        severity: "success",
        message: result.data?.message || `Digest posted to #${channel}`,
      });
    } else {
      setFeedback({
        severity: "error",
        message:
          result?.error ||
          `Couldn't post to #${channel}. Make sure the OHack bot is invited to the channel (/invite @ohack-bot).`,
      });
    }
    setSending(false);
  }

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Slack integration
      </Typography>

      <Stack spacing={2}>
        <TextField
          label="Slack channel (no #)"
          size="small"
          value={channel}
          onChange={(e) => setChannel(e.target.value.replace(/^#/, ""))}
          placeholder="2026-fall-plan"
          helperText="Members can join via the 'Join Slack' button on the planning board."
        />

        <FormControlLabel
          control={
            <Switch
              checked={notify}
              onChange={(e) => setNotify(e.target.checked)}
            />
          }
          label="Send card-change digests to this channel"
        />

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={14} /> : null}
          >
            Save Slack settings
          </Button>

          {slack.channel && (
            <Button
              variant="outlined"
              size="small"
              onClick={handleSendNow}
              disabled={sending}
              startIcon={sending ? <CircularProgress size={14} /> : <Send />}
            >
              Send digest now
            </Button>
          )}
        </Stack>

        {feedback && (
          <Alert severity={feedback.severity} onClose={() => setFeedback(null)}>
            {feedback.message}
          </Alert>
        )}
      </Stack>

      <Snackbar
        open={!!feedback && feedback.severity === "success"}
        autoHideDuration={3000}
        onClose={() => setFeedback(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        message={feedback?.message}
      />
    </Box>
  );
}
