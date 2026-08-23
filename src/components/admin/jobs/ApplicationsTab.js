import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Description as ResumeIcon,
  LinkedIn as LinkedInIcon,
  PlayCircleOutline as VideoIcon,
} from "@mui/icons-material";
import * as ga from "../../../lib/ga";

// Job application review (job_applications collection via /api/jobs/admin/*).
// Row click opens a detail Dialog with the work sample, links, status/notes,
// and the one-click decision actions (kind rejection / accept) that send the
// backend's templated emails.

const STATUS_OPTIONS = [
  "submitted",
  "confirmed",
  "call_scheduled",
  "accepted",
  "rejected",
  "withdrawn",
];

const STATUS_CHIP = {
  submitted: { color: "info", label: "Submitted" },
  confirmed: { color: "primary", label: "Confirmed" },
  call_scheduled: { color: "warning", label: "Call scheduled" },
  accepted: { color: "success", label: "Accepted" },
  rejected: { color: "default", label: "Rejected" },
  withdrawn: { color: "default", label: "Withdrawn" },
};

const formatDate = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
};

export default function ApplicationsTab({ accessToken, orgId, isAdmin, onSnack }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [decision, setDecision] = useState(null); // null | {type, note}
  const [busy, setBusy] = useState(false);

  const apiBase = process.env.NEXT_PUBLIC_API_SERVER_URL;
  const authHeaders = useCallback(
    () => ({
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
      ...(orgId ? { "X-Org-Id": orgId } : {}),
    }),
    [accessToken, orgId],
  );

  const fetchApplications = useCallback(async () => {
    if (!isAdmin || !accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/api/jobs/admin/applications`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`Failed to load applications (${res.status})`);
      const data = await res.json();
      setApplications(data.applications || []);
    } catch (err) {
      setError(err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [apiBase, accessToken, isAdmin, authHeaders]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Derive the live record from list state, never a click-time snapshot
  // (CLAUDE.md "stale selected item" gotcha).
  const selected = useMemo(
    () => applications.find((a) => a.id === selectedId) || null,
    [applications, selectedId],
  );

  const roleOptions = useMemo(() => {
    const map = new Map();
    applications.forEach((a) => map.set(a.listing_slug, a.listing_title));
    return Array.from(map.entries());
  }, [applications]);

  const filtered = useMemo(
    () =>
      applications.filter((a) => {
        if (roleFilter !== "all" && a.listing_slug !== roleFilter) return false;
        if (statusFilter !== "all" && (a.status || "submitted") !== statusFilter)
          return false;
        return true;
      }),
    [applications, roleFilter, statusFilter],
  );

  const openDetail = (application) => {
    setSelectedId(application.id);
    setNotesDraft(application.admin_notes || "");
  };

  const patchApplication = async (applicationId, patch, successMessage) => {
    setBusy(true);
    try {
      const res = await fetch(`${apiBase}/api/jobs/admin/applications/${applicationId}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(patch),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Update failed (${res.status})`);
      setApplications((prev) =>
        prev.map((a) => (a.id === applicationId ? { ...a, ...patch } : a)),
      );
      if (successMessage) onSnack(successMessage, "success");
    } catch (err) {
      onSnack(err.message || "Update failed", "error");
    } finally {
      setBusy(false);
    }
  };

  const handleDecision = async () => {
    if (!decision || !selected) return;
    setBusy(true);
    try {
      const res = await fetch(
        `${apiBase}/api/jobs/admin/applications/${selected.id}/decision`,
        {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            decision: decision.type,
            personal_note: decision.note || "",
          }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Decision failed (${res.status})`);
      setApplications((prev) =>
        prev.map((a) => (a.id === selected.id ? { ...a, status: decision.type } : a)),
      );
      onSnack(
        data.email_sent
          ? `Marked ${decision.type} — email sent to ${selected.email}`
          : `Marked ${decision.type} (email could not be sent — follow up manually)`,
        data.email_sent ? "success" : "warning",
      );
      ga.trackStructuredEvent(ga.EventCategory.ADMIN, "admin_jobs_decision", decision.type);
      setDecision(null);
    } catch (err) {
      onSnack(err.message || "Decision failed", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Typography variant="body1" color="text.secondary">
        Every application sends the applicant a confirmation email asking them to
        reply within 5 days (the responsiveness test) and an FYI to
        questions@ohack.org. Mark someone <strong>Confirmed</strong> when they
        reply. Decisions below send the templated warm emails.
      </Typography>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <FormControl size="small" sx={{ minWidth: 240 }}>
            <InputLabel id="role-filter-label">Role</InputLabel>
            <Select
              labelId="role-filter-label"
              label="Role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <MenuItem value="all">All roles</MenuItem>
              {roleOptions.map(([slug, title]) => (
                <MenuItem key={slug} value={slug}>
                  {title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
            <Chip
              label={`All (${applications.length})`}
              color={statusFilter === "all" ? "primary" : "default"}
              onClick={() => setStatusFilter("all")}
            />
            {STATUS_OPTIONS.map((s) => {
              const count = applications.filter(
                (a) => (a.status || "submitted") === s,
              ).length;
              if (!count) return null;
              return (
                <Chip
                  key={s}
                  label={`${STATUS_CHIP[s].label} (${count})`}
                  color={statusFilter === s ? "primary" : "default"}
                  onClick={() => setStatusFilter(s)}
                />
              );
            })}
          </Stack>
        </Stack>
      </Paper>

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper variant="outlined">
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Hrs/wk</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Applied</TableCell>
                  <TableCell align="right">Links</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((a) => {
                  const chip = STATUS_CHIP[a.status || "submitted"] || STATUS_CHIP.submitted;
                  return (
                    <TableRow
                      key={a.id}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => openDetail(a)}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {a.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {a.email}
                        </Typography>
                      </TableCell>
                      <TableCell>{a.listing_title}</TableCell>
                      <TableCell>
                        <Chip size="small" label={chip.label} color={chip.color} />
                      </TableCell>
                      <TableCell>{a.hours_per_week}</TableCell>
                      <TableCell>{a.duration_commitment}</TableCell>
                      <TableCell>{formatDate(a.timestamp)}</TableCell>
                      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                        {a.resume_url && (
                          <Tooltip title="Resume (PDF)">
                            <IconButton
                              size="small"
                              href={a.resume_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ResumeIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {a.video_url && (
                          <Tooltip title="Intro video">
                            <IconButton
                              size="small"
                              href={a.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <VideoIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {a.linkedin_url && (
                          <Tooltip title="LinkedIn">
                            <IconButton
                              size="small"
                              href={a.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <LinkedInIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        align="center"
                        sx={{ py: 4 }}
                      >
                        {applications.length === 0
                          ? "No applications yet."
                          : "No applications match the current filters."}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* --------- Detail dialog --------- */}
      <Dialog
        open={!!selected}
        onClose={() => setSelectedId(null)}
        maxWidth="md"
        fullWidth
      >
        {selected && (
          <>
            <DialogTitle>
              {selected.name} — {selected.listing_title}
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  {selected.email}
                  {selected.pronouns ? ` · ${selected.pronouns}` : ""}
                  {selected.phone ? ` · ${selected.phone}` : ""}
                  {selected.location ? ` · ${selected.location}` : ""}
                  {" · applied "}
                  {formatDate(selected.timestamp)}
                </Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {selected.resume_url && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ResumeIcon />}
                      href={selected.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Resume
                    </Button>
                  )}
                  {selected.video_url && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<VideoIcon />}
                      href={selected.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Intro video
                    </Button>
                  )}
                  {selected.linkedin_url && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<LinkedInIcon />}
                      href={selected.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      LinkedIn
                    </Button>
                  )}
                </Stack>

                <Divider />

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Commitment
                  </Typography>
                  <Typography variant="body2">
                    {selected.hours_per_week} per week · {selected.duration_commitment} ·
                    prefers {selected.preferred_channel || "—"}
                    {selected.slack_member ? ` · Slack: ${selected.slack_member}` : ""}
                    {selected.in_person_ok ? " · can be on-site" : ""}
                  </Typography>
                  {selected.referral_source && (
                    <Typography variant="body2" color="text.secondary">
                      Heard about us via: {selected.referral_source}
                    </Typography>
                  )}
                </Box>

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Work sample answer
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{ p: 2, whiteSpace: "pre-wrap", bgcolor: "grey.50" }}
                  >
                    <Typography variant="body2">{selected.work_sample_answer}</Typography>
                  </Paper>
                </Box>

                {selected.why_ohack && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Why Opportunity Hack
                    </Typography>
                    <Paper
                      variant="outlined"
                      sx={{ p: 2, whiteSpace: "pre-wrap", bgcolor: "grey.50" }}
                    >
                      <Typography variant="body2">{selected.why_ohack}</Typography>
                    </Paper>
                  </Box>
                )}

                <Divider />

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel id="app-status-label">Status</InputLabel>
                    <Select
                      labelId="app-status-label"
                      label="Status"
                      value={selected.status || "submitted"}
                      disabled={busy}
                      onChange={(e) =>
                        patchApplication(
                          selected.id,
                          { status: e.target.value },
                          `Status → ${e.target.value}`,
                        )
                      }
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <MenuItem key={s} value={s}>
                          {STATUS_CHIP[s].label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    size="small"
                    fullWidth
                    label="Internal notes"
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    onBlur={() => {
                      if (notesDraft !== (selected.admin_notes || "")) {
                        patchApplication(selected.id, { admin_notes: notesDraft }, "Notes saved");
                      }
                    }}
                  />
                </Stack>

                {(selected.sent_emails || []).length > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    Emails sent:{" "}
                    {selected.sent_emails
                      .map((e) => `${e.recipient_type} (${formatDate(e.timestamp)})`)
                      .join(", ")}
                  </Typography>
                )}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ justifyContent: "space-between", px: 3, py: 2 }}>
              <Button
                color="error"
                variant="outlined"
                disabled={busy || selected.status === "rejected"}
                onClick={() => setDecision({ type: "rejected", note: "" })}
              >
                Send kind rejection
              </Button>
              <Stack direction="row" spacing={1}>
                <Button onClick={() => setSelectedId(null)}>Close</Button>
                <Button
                  color="success"
                  variant="contained"
                  disabled={busy || selected.status === "accepted"}
                  onClick={() => setDecision({ type: "accepted", note: "" })}
                >
                  Accept &amp; send next steps
                </Button>
              </Stack>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* --------- Decision confirm --------- */}
      <Dialog open={!!decision} onClose={() => setDecision(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {decision?.type === "accepted"
            ? `Accept ${selected?.name}?`
            : `Send a kind rejection to ${selected?.name}?`}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {decision?.type === "accepted"
              ? "This emails them that we'd like to move forward and that questions@ohack.org will reach out to schedule a call."
              : "This sends the warm, door-stays-open rejection email (thanks them for the effort, points to mentoring/judging/volunteering and Slack, and invites them to apply again). No further action needed from you."}
          </DialogContentText>
          <TextField
            fullWidth
            multiline
            minRows={2}
            label="Optional personal note (added to the email)"
            value={decision?.note || ""}
            onChange={(e) => setDecision((prev) => ({ ...prev, note: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDecision(null)} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color={decision?.type === "accepted" ? "success" : "error"}
            onClick={handleDecision}
            disabled={busy}
          >
            {busy
              ? "Sending…"
              : decision?.type === "accepted"
                ? "Accept & email"
                : "Reject & email"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
