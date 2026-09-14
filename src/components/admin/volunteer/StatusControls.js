// Review-axis controls: application `status` only. Nothing in this module
// touches `isSelected` — that lives in RosterControls.js on purpose.
import React from "react";
import {
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  ListSubheader,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckIcon from "@mui/icons-material/Check";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import VerifiedIcon from "@mui/icons-material/Verified";
import CloseIcon from "@mui/icons-material/Close";
import UndoIcon from "@mui/icons-material/Undo";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import {
  isKnownStatus,
  normalizeStatus,
  pipelineStatuses,
  statusChipProps,
  statusMeta,
  terminalStatuses,
} from "../../../lib/applicationStatus";

const STATUS_ICONS = {
  hourglass: HourglassEmptyIcon,
  check: CheckIcon,
  queue: PlaylistAddIcon,
  flight: FlightTakeoffIcon,
  verified: VerifiedIcon,
  close: CloseIcon,
  undo: UndoIcon,
  personOff: PersonOffIcon,
  help: HelpOutlineIcon,
};

const stop = (e) => e.stopPropagation();

export const StatusChip = React.memo(function StatusChip({ status, ...chipProps }) {
  const meta = statusMeta(status);
  const Icon = STATUS_ICONS[meta.icon] || HelpOutlineIcon;
  return <Chip size="small" icon={<Icon />} {...statusChipProps(status)} {...chipProps} />;
});

const PendingSpinner = (props) => (
  <CircularProgress size={14} sx={{ mr: 1, position: "absolute", right: 0, pointerEvents: "none" }} {...props} />
);

const StatusMenuItem = ({ meta, dense }) => {
  const Icon = STATUS_ICONS[meta.icon] || HelpOutlineIcon;
  return (
    <MenuItem key={meta.value} value={meta.value} dense={dense}>
      <Icon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
      <span>
        <Typography variant="body2" component="span" sx={{ display: "block" }}>
          {meta.label}
        </Typography>
        {meta.description && (
          <Typography variant="caption" color="text.secondary" component="span" sx={{ display: "block" }}>
            {meta.description}
          </Typography>
        )}
      </span>
    </MenuItem>
  );
};

// Select children must be direct MenuItem/ListSubheader elements (no wrapper
// components), so build the list as a flat array.
const buildItems = (currentValue, dense) => {
  const items = [];
  if (!isKnownStatus(currentValue)) {
    const legacy = statusMeta(currentValue);
    items.push(
      <MenuItem key={legacy.value} value={legacy.value} dense={dense}>
        <HelpOutlineIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
        {legacy.label}
      </MenuItem>
    );
  }
  items.push(
    <ListSubheader key="hdr-pipeline" disableSticky>
      Pipeline
    </ListSubheader>
  );
  pipelineStatuses().forEach((meta) => items.push(StatusMenuItem({ meta, dense })));
  items.push(
    <ListSubheader key="hdr-closed" disableSticky>
      Closed
    </ListSubheader>
  );
  terminalStatuses().forEach((meta) => items.push(StatusMenuItem({ meta, dense })));
  return items;
};

/**
 * Compact status picker for table cells and card headers. Renders the current
 * value as a StatusChip; clicks never bubble to click-to-copy rows.
 */
export const InlineStatusSelect = React.memo(function InlineStatusSelect({
  value,
  onChange,
  pending = false,
  disabled = false,
  ariaLabel = "Application status",
}) {
  const current = normalizeStatus(value);
  return (
    <Select
      variant="standard"
      disableUnderline
      size="small"
      value={current}
      onChange={(e) => onChange?.(e.target.value)}
      onClick={stop}
      MenuProps={{ onClick: stop, PaperProps: { sx: { maxHeight: 360 } } }}
      renderValue={(v) => <StatusChip status={v} sx={{ cursor: "pointer" }} />}
      IconComponent={pending ? PendingSpinner : ArrowDropDownIcon}
      disabled={disabled || pending}
      inputProps={{ "aria-label": ariaLabel }}
      sx={{
        "& .MuiSelect-select": { py: 0.25, pr: "24px !important", display: "flex", alignItems: "center" },
      }}
    >
      {buildItems(current, true)}
    </Select>
  );
});

/**
 * Labelled outlined variant for the edit dialog and the bulk bar.
 * `placeholderLabel` lets the bulk bar render an empty "Set status…" control.
 */
export const StatusPicker = React.memo(function StatusPicker({
  value,
  onChange,
  label = "Application status",
  disabled = false,
  size = "small",
  fullWidth = true,
  allowEmpty = false,
  sx,
}) {
  const current = allowEmpty && (value === "" || value == null) ? "" : normalizeStatus(value);
  return (
    <FormControl size={size} fullWidth={fullWidth} disabled={disabled} sx={sx}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={current}
        label={label}
        onChange={(e) => onChange?.(e.target.value)}
        onClick={stop}
        MenuProps={{ onClick: stop, PaperProps: { sx: { maxHeight: 400 } } }}
        renderValue={(v) => (v ? <StatusChip status={v} /> : "")}
        displayEmpty={allowEmpty}
      >
        {allowEmpty && (
          <MenuItem value="" disabled>
            Choose a status…
          </MenuItem>
        )}
        {buildItems(current || "pending", false)}
      </Select>
    </FormControl>
  );
});
