import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";

// Mentor engagement for one event: check-ins + what each mentor did in the
// per-team mentor panel. The backend (api/mentors/mentor_engagement_service.py)
// owns the rules and the suggested level; this only renders them. The level is
// a suggestion against the Heart Certificate bar on /about/mentors.

export const LEVELS = {
  engaged: { label: "Engaged", color: "success" },
  some_activity: { label: "Review", color: "warning" },
  checked_in_only: { label: "Checked in only", color: "default" },
  none: { label: "No activity", color: "default" },
};

export const formatWhen = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export const checkinText = (row) => {
  if (!row.checked_in) return "Not checked in";
  const parts = [];
  if (row.self_checkin_count) {
    parts.push(`${row.self_checkin_count}×`);
    if (row.checked_in_hours > 0) parts.push(`${row.checked_in_hours}h`);
  }
  if (row.desk_checked_in) parts.push("desk");
  return parts.join(" · ");
};

const csvCell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

export const engagementCsv = (rows) => {
  const header = [
    "Rank", "Score", "Name", "Email", "Level", "On roster", "Checked in", "Self check-ins",
    "Hours checked in", "Desk check-in", "Teams helped", "Panel actions",
    "Coverage sign-offs", "Notes", "Flags raised", "Flags resolved", "Ratings",
    "Last panel activity", "Teams",
  ];
  const lines = rows.map((r) =>
    [
      r.rank, r.score, r.name, r.email, LEVELS[r.level]?.label || r.level, r.isSelected ? "yes" : "no",
      r.checked_in ? "yes" : "no", r.self_checkin_count, r.checked_in_hours,
      r.desk_checked_in ? "yes" : "no", r.teams_helped, r.panel_actions,
      r.coverage_signoffs, r.notes, r.flags_raised, r.flags_resolved, r.ratings,
      r.last_panel_activity_at || "", (r.teams || []).map((t) => t.name).join("; "),
    ].map(csvCell).join(","),
  );
  return [header.map(csvCell).join(","), ...lines].join("\n");
};

const scoreChipSx = { fontWeight: 700, cursor: "pointer" };

// The one-number summary used in the Mentors table, the mobile cards and the
// ranked panel. Click opens the detail dialog.
export const EngagementScoreChip = ({ row, onClick }) => {
  if (!row) return null;
  const level = LEVELS[row.level] || {};
  return (
    <Tooltip title={`${level.label || row.level} · rank #${row.rank} · click for details`}>
      <Chip
        size="small"
        color={level.color || "default"}
        variant={row.level === "engaged" ? "filled" : "outlined"}
        label={row.score}
        onClick={onClick}
        sx={scoreChipSx}
        aria-label={`Engagement score ${row.score}, ${level.label || row.level}. Show details`}
      />
    </Tooltip>
  );
};

const DetailLine = ({ label, value }) => (
  <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ py: 0.25 }}>
    <Typography variant="body2" color="text.secondary">{label}</Typography>
    <Typography variant="body2" sx={{ textAlign: "right" }}>{value}</Typography>
  </Stack>
);

// Why a mentor has the score they have.
export const MentorEngagementDialog = ({ row, eventId, thresholds, onClose }) => (
  <Dialog open={Boolean(row)} onClose={onClose} maxWidth="xs" fullWidth>
    {row && (
      <>
        <DialogTitle>
          {row.name || row.email || "Mentor"}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
            <Chip size="small" color={LEVELS[row.level]?.color || "default"} label={LEVELS[row.level]?.label || row.level} />
            <Typography variant="body2" color="text.secondary">
              Score {row.score} · rank #{row.rank}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle2">How the score adds up</Typography>
          {(row.score_breakdown || []).map((part) => (
            <DetailLine key={part.label} label={`${part.label} (${part.detail})`} value={`+${part.points}`} />
          ))}
          <DetailLine label="Total" value={<strong>{row.score}</strong>} />

          <Typography variant="subtitle2" sx={{ mt: 2 }}>Check-in</Typography>
          <DetailLine label="Status" value={`${checkinText(row)}${row.currently_checked_in ? " · here now" : ""}`} />
          <DetailLine label="First check-in" value={formatWhen(row.first_checkin_at)} />
          {row.sessions_without_checkout > 0 && (
            <DetailLine label="Sessions with no check-out (hours not counted)" value={row.sessions_without_checkout} />
          )}

          <Typography variant="subtitle2" sx={{ mt: 2 }}>Mentor panel</Typography>
          <DetailLine label="Coverage sign-offs" value={row.coverage_signoffs} />
          <DetailLine label="Notes" value={row.notes} />
          <DetailLine label="Flags raised / resolved" value={`${row.flags_raised} / ${row.flags_resolved}`} />
          <DetailLine label="Readiness ratings" value={row.ratings} />
          <DetailLine label="Last activity" value={formatWhen(row.last_panel_activity_at)} />

          <Typography variant="subtitle2" sx={{ mt: 2 }}>Teams helped ({row.teams_helped})</Typography>
          {(row.teams || []).length === 0 ? (
            <Typography variant="body2" color="text.secondary">None recorded in the mentor panel.</Typography>
          ) : (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
              {row.teams.map((team) => (
                <Chip
                  key={team.id}
                  size="small"
                  variant="outlined"
                  label={team.name}
                  component="a"
                  clickable
                  href={`/hack/${eventId}/team/${team.id}/mentor`}
                  target="_blank"
                  rel="noopener"
                />
              ))}
            </Stack>
          )}
          {thresholds && (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
              Engaged = checked in and at least {thresholds.min_actions} panel actions on at least{" "}
              {thresholds.min_teams} {thresholds.min_teams === 1 ? "team" : "teams"}. Help given only in
              Slack or in person is not counted.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </>
    )}
  </Dialog>
);

const MentorEngagementPanel = ({
  eventId,
  data,
  loading,
  error,
  onReload: load,
  mentors = [],
  onBulkCertificate,
  onShowDetails,
}) => {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((v) => !v);

  const rows = data?.mentors || [];
  const engagedVolunteers = useMemo(() => {
    const ids = new Set(rows.filter((r) => r.level === "engaged").map((r) => r.volunteer_id));
    return mentors.filter((m) => ids.has(m.id));
  }, [rows, mentors]);

  const downloadCsv = () => {
    const url = URL.createObjectURL(new Blob([engagementCsv(rows)], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `mentor-engagement-${eventId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const s = data?.summary;
  const t = data?.thresholds;

  return (
    <Paper variant="outlined" sx={{ mb: 2, p: 1.5 }}>
      <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
        <Button size="small" variant={open ? "contained" : "outlined"} onClick={toggle}>
          {open ? "Hide mentor engagement" : "Mentor engagement"}
        </Button>
        <Typography variant="caption" color="text.secondary">
          Who checked in and used the team mentor panel — for Heart Certificates.
        </Typography>
      </Stack>

      <Collapse in={open} unmountOnExit>
        <Box sx={{ mt: 1.5 }}>
          {loading && <CircularProgress size={24} />}
          {error && (
            <Alert severity="error" action={<Button size="small" onClick={load}>Retry</Button>}>
              {error}
            </Alert>
          )}
          {data && !loading && (
            <>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                <Chip size="small" label={`${s.roster} on roster`} />
                <Chip size="small" label={`${s.checked_in} checked in`} />
                <Chip size="small" label={`${s.used_panel} used the panel`} />
                <Chip size="small" color="success" label={`${s.engaged} engaged`} />
                <Box sx={{ flexGrow: 1 }} />
                <Button size="small" onClick={load}>Refresh</Button>
                <Button size="small" onClick={downloadCsv} disabled={rows.length === 0}>
                  Download CSV
                </Button>
                {onBulkCertificate && (
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    disabled={engagedVolunteers.length === 0}
                    onClick={() => onBulkCertificate(engagedVolunteers, "mentors")}
                  >
                    Certificates for {engagedVolunteers.length} engaged
                  </Button>
                )}
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                Ranked most engaged first; click a score for the breakdown. Engaged = checked in and at least {t.min_actions} panel
                actions on at least {t.min_teams} {t.min_teams === 1 ? "team" : "teams"}. It is a
                suggestion: “Review” mentors used the panel but are
                under that bar or never checked in, and help given only in Slack or in person is
                not counted here. See the{" "}
                <Link href="/about/mentors" target="_blank" rel="noopener">mentor guidance</Link>.
              </Typography>

              {rows.length === 0 ? (
                <Typography variant="body2">No mentors on the roster for this event yet.</Typography>
              ) : (
                <TableContainer sx={{ maxHeight: 480 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell align="right">#</TableCell>
                        <TableCell>Mentor</TableCell>
                        <TableCell>Score</TableCell>
                        <TableCell>Suggestion</TableCell>
                        <TableCell>Check-in</TableCell>
                        <TableCell align="right">Actions</TableCell>
                        <TableCell align="right">Teams</TableCell>
                        <TableCell align="right">Sign-offs</TableCell>
                        <TableCell align="right">Notes</TableCell>
                        <TableCell align="right">Flags</TableCell>
                        <TableCell align="right">Ratings</TableCell>
                        <TableCell>Last panel activity</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((r) => (
                        <TableRow key={r.volunteer_id} hover>
                          <TableCell align="right">{r.rank}</TableCell>
                          <TableCell>
                            <Typography variant="body2">{r.name || r.email || "Unnamed"}</Typography>
                            {!r.isSelected && (
                              <Typography variant="caption" color="warning.main">
                                Not on roster
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <EngagementScoreChip row={r} onClick={() => onShowDetails?.(r)} />
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              color={LEVELS[r.level]?.color || "default"}
                              label={LEVELS[r.level]?.label || r.level}
                            />
                          </TableCell>
                          <TableCell>
                            {checkinText(r)}
                            {r.currently_checked_in ? " · here now" : ""}
                          </TableCell>
                          <TableCell align="right">
                            <strong>{r.panel_actions}</strong>
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title={(r.teams || []).map((team) => team.name).join(", ")}>
                              <span>{r.teams_helped}</span>
                            </Tooltip>
                          </TableCell>
                          <TableCell align="right">{r.coverage_signoffs}</TableCell>
                          <TableCell align="right">{r.notes}</TableCell>
                          <TableCell align="right">
                            <Tooltip title={`${r.flags_raised} raised, ${r.flags_resolved} resolved`}>
                              <span>{r.flags_raised + r.flags_resolved}</span>
                            </Tooltip>
                          </TableCell>
                          <TableCell align="right">{r.ratings}</TableCell>
                          <TableCell>{formatWhen(r.last_panel_activity_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {data.unmatched?.length > 0 && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  Panel activity we could not match to a mentor application:{" "}
                  {data.unmatched
                    .map((u) => `${u.name || "Unknown"} (${u.panel_actions} actions, ${u.teams_helped} teams)`)
                    .join("; ")}
                  .
                </Alert>
              )}
            </>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default MentorEngagementPanel;
