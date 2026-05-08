import { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
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

  async function handleSave() {
    setSaving(true);
    await onUpdateConfig({
      slack: { channel: channel.replace(/^#/, ""), notify_on_card_change: notify },
    });
    setSaving(false);
  }

  async function handleSendNow() {
    setSending(true);
    await onSlackNotify();
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
      </Stack>
    </Box>
  );
}
