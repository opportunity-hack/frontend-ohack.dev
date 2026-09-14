// Roster-axis controls: `isSelected` only ("this person is live on the event
// page with participant tools unlocked"). Deliberately one shape everywhere —
// a globe + switch — so it never reads like a review status. Status controls
// live in StatusControls.js.
import React from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import PublicIcon from "@mui/icons-material/Public";
import PublicOffIcon from "@mui/icons-material/PublicOff";

export const ROSTER_CONSEQUENCES =
  "Shows on the public event page and unlocks participant tools (team finder, mentor panel, judge check-in, surveys) and roster emails/Slack.";

const stop = (e) => e.stopPropagation();

/**
 * The one roster control. `compact` hides the text label (table cells) but
 * keeps the tooltip; the full form shows "On roster" / "Not on roster".
 */
export const RosterToggle = React.memo(function RosterToggle({
  checked,
  onChange,
  pending = false,
  disabled = false,
  compact = false,
  ariaLabel = "On event roster",
}) {
  const on = Boolean(checked);
  const Icon = on ? PublicIcon : PublicOffIcon;
  return (
    <Tooltip title={`Event roster — ${ROSTER_CONSEQUENCES}`} enterDelay={400}>
      <Box
        component="span"
        onClick={stop}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: compact ? 0 : 0.5,
          color: on ? "primary.main" : "text.disabled",
          whiteSpace: "nowrap",
        }}
      >
        {pending ? (
          <CircularProgress size={14} sx={{ mx: 0.5 }} />
        ) : (
          <Icon fontSize="small" />
        )}
        {!compact && (
          <Typography variant="body2" component="span" sx={{ color: on ? "text.primary" : "text.secondary" }}>
            {on ? "On roster" : "Not on roster"}
          </Typography>
        )}
        <Switch
          size="small"
          color="primary"
          checked={on}
          disabled={disabled || pending}
          onChange={(e) => onChange?.(e.target.checked)}
          // slotProps.input REPLACES MUI's default input props (that's where
          // role="switch" comes from), so restate the role alongside the label.
          slotProps={{ input: { role: "switch", "aria-label": ariaLabel, "aria-checked": on } }}
        />
      </Box>
    </Tooltip>
  );
});

// Read-only marker (stats rows, summaries).
export const RosterChip = React.memo(function RosterChip({ on, count, onClick, selected = false, ...rest }) {
  const Icon = on ? PublicIcon : PublicOffIcon;
  const label = count === undefined ? (on ? "On roster" : "Not on roster") : `${on ? "On roster" : "Not on roster"} ${count}`;
  return (
    <Chip
      size="small"
      icon={<Icon />}
      label={label}
      color={on ? "primary" : "default"}
      variant={selected ? "filled" : "outlined"}
      onClick={onClick}
      {...rest}
    />
  );
});

/**
 * Bulk roster changes are consequential and un-emailed; confirm first.
 * direction: true = add to roster, false = remove.
 */
export function RosterConfirmDialog({ open, count = 0, direction = true, onClose, onConfirm, busy = false }) {
  const verb = direction ? "Add" : "Remove";
  const noun = count === 1 ? "person" : "people";
  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {direction ? <PublicIcon color="primary" /> : <PublicOffIcon color="action" />}
        {verb} {count} {noun} {direction ? "to" : "from"} the event roster?
      </DialogTitle>
      <DialogContent>
        <DialogContentText component="div">
          <Typography variant="body2" sx={{ mb: 1 }}>
            {direction
              ? `They will appear on the public event page and get participant tools. ${ROSTER_CONSEQUENCES}`
              : "They will disappear from the public event page and lose participant tools (team finder, mentor panel, judge check-in, surveys)."}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This does not email anyone. Use “Email roster” afterwards if they should hear about it. Application
            status is not changed.
          </Typography>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={direction ? "primary" : "inherit"}
          disabled={busy || count === 0}
          startIcon={busy ? <CircularProgress size={14} /> : null}
        >
          {verb} {count}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
