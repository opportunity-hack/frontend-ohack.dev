import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { parseLocalDate } from "../../../lib/dateUtils";

export const RESET_ROLE_OPTIONS = [
  { value: "mentor", label: "Mentors", singular: "mentor" },
  { value: "judge", label: "Judges", singular: "judge" },
  { value: "volunteer", label: "Volunteers", singular: "volunteer" },
  { value: "hacker", label: "Hackers", singular: "hacker" },
  { value: "sponsor", label: "Sponsors", singular: "sponsor" },
];

/** When a person checked in: desk scan time, else the online self check-in. */
export function checkInMoment(person) {
  return person?.checkedInAt || person?.checkInTime || null;
}

/** A mentor who checked in online has `checkInTime` but no desk `checkedInAt`. */
export function isOnlineSelfCheckIn(person) {
  return !person?.checkedInAt;
}

function formatMoment(iso, timezone) {
  if (!iso) return "Unknown time";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Unknown time";
  try {
    return d.toLocaleString("en-US", {
      timeZone: timezone || "America/Phoenix",
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });
  } catch (e) {
    return d.toLocaleString();
  }
}

/**
 * Reset check-ins for one role (full admins only — the workbench gates the
 * button on volunteer.admin and the backend route is volunteer.admin only).
 *
 * The list is derived LIVE from the workbench's polled `people` (never a
 * snapshot taken at open), so a 7s refresh can't leave stale rows here.
 * `onConfirm(type, ids, { all })` returns a promise; `all` is true only when
 * every listed person is selected.
 */
export default function ResetCheckInsDialog({
  open,
  onClose,
  people = [],
  eventStartDate,
  timezone,
  onConfirm,
  busy = false,
}) {
  const [role, setRole] = useState("mentor");
  const [selected, setSelected] = useState(() => new Set());
  // ids already auto-selected in this open+role session, so a person who
  // appears while the dialog is open is ticked once but a row the admin
  // un-ticked stays un-ticked across the 7s refresh.
  const seenRef = useRef(new Set());
  const sessionRef = useRef("");

  const rows = useMemo(
    () =>
      (people || [])
        .filter((p) => p && p.id && p.volunteerType === role)
        .sort(
          (a, b) =>
            new Date(checkInMoment(a) || 0) - new Date(checkInMoment(b) || 0),
        ),
    [people, role],
  );

  // Everyone listed is selected by default (per open + role).
  useEffect(() => {
    if (!open) {
      sessionRef.current = "";
      return;
    }
    if (sessionRef.current !== role) {
      sessionRef.current = role;
      seenRef.current = new Set();
      setSelected(new Set());
    }
    const fresh = rows.filter((r) => !seenRef.current.has(r.id));
    if (fresh.length === 0) return;
    fresh.forEach((r) => seenRef.current.add(r.id));
    setSelected((prev) => new Set([...prev, ...fresh.map((r) => r.id)]));
  }, [open, role, rows]);

  const listedIds = rows.map((r) => r.id);
  const selectedIds = listedIds.filter((id) => selected.has(id));
  const n = selectedIds.length;
  const roleMeta =
    RESET_ROLE_OPTIONS.find((o) => o.value === role) || RESET_ROLE_OPTIONS[0];
  const noun = `${roleMeta.singular} check-in${n === 1 ? "" : "s"}`;

  const eventStart = eventStartDate ? parseLocalDate(eventStartDate) : null;
  const eventStartKnown = eventStart && !Number.isNaN(eventStart.getTime());
  const earlyIds = eventStartKnown
    ? rows
        .filter((r) => {
          const at = checkInMoment(r);
          return at && new Date(at) < eventStart;
        })
        .map((r) => r.id)
    : [];

  const toggle = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allSelected = n > 0 && n === listedIds.length;

  const handleConfirm = () => {
    if (n === 0 || busy) return;
    onConfirm?.(role, selectedIds, { all: allSelected });
  };

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="reset-checkins-title"
    >
      <DialogTitle id="reset-checkins-title">Reset check-ins</DialogTitle>
      <DialogContent dividers>
        <FormControl fullWidth size="small" sx={{ mb: 2, mt: 0.5 }}>
          <InputLabel id="reset-checkins-role">Role</InputLabel>
          <Select
            labelId="reset-checkins-role"
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={busy}
          >
            {RESET_ROLE_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          They&apos;ll show as not checked in on the event page and can check in
          again. Nobody is notified.
        </Typography>

        {rows.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No {roleMeta.label.toLowerCase()} are checked in for this event.
          </Typography>
        ) : (
          <>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Button
                size="small"
                onClick={() => setSelected(new Set(listedIds))}
                disabled={busy || allSelected}
              >
                Select all
              </Button>
              <Button
                size="small"
                onClick={() => setSelected(new Set())}
                disabled={busy || n === 0}
              >
                Select none
              </Button>
              {eventStartKnown && (
                <Button
                  size="small"
                  onClick={() => setSelected(new Set(earlyIds))}
                  disabled={busy || earlyIds.length === 0}
                >
                  Select only check-ins before the event starts (
                  {earlyIds.length})
                </Button>
              )}
            </Box>
            <Box
              component="ul"
              sx={{
                listStyle: "none",
                m: 0,
                p: 0,
                maxHeight: 360,
                overflowY: "auto",
              }}
            >
              {rows.map((person) => {
                const checked = selected.has(person.id);
                const online = isOnlineSelfCheckIn(person);
                const labelId = `reset-row-${person.id}`;
                return (
                  <Box
                    component="li"
                    key={person.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      py: 0.5,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Checkbox
                      checked={checked}
                      onChange={() => toggle(person.id)}
                      disabled={busy}
                      inputProps={{ "aria-labelledby": labelId }}
                    />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        id={labelId}
                        variant="body2"
                        sx={{ fontWeight: 500 }}
                      >
                        {person.name || "Unknown"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatMoment(checkInMoment(person), timezone)}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      variant="outlined"
                      label={online ? "Online self check-in" : "Desk"}
                    />
                  </Box>
                );
              })}
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={busy} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="warning"
          disabled={n === 0 || busy}
          startIcon={
            busy ? <CircularProgress size={16} color="inherit" /> : null
          }
        >
          Reset {n} {noun}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
