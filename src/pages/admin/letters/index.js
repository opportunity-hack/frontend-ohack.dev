import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import { useAuthInfo, withRequiredAuthInfo } from "@propelauth/react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import AdminPage from "../../../components/admin/AdminPage";
import lettersApi from "../../../lib/lettersApi";
import { roleLabel } from "../../../components/Profile/Letters/letterStates";
import {
  ROLE_OPTIONS,
  STATUS_FILTERS,
  countsByStatus,
  eligibilityLabel,
  evidenceLines,
  factRows,
  filterRows,
  formatIssuedDate,
  rowStatus,
  sampleRowFor,
} from "../../../components/admin/letters/adminLetters";

// /admin/letters — check that participation letters look right. Nothing here
// approves anything: eligible people get their letter themselves on /profile.
// Admins preview any letter (the exact stored PDF once issued), open its
// public verify page, revoke one, or issue an exception outside the rules.

const API = () => process.env.NEXT_PUBLIC_API_SERVER_URL;

const STATUS_CHIP = {
  issued: { label: "Issued", color: "success" },
  revoked: { label: "Revoked", color: "default" },
  eligible: { label: "Not issued", color: "primary" },
  not_eligible: { label: "Not eligible", color: "default" },
};

const PreviewDialog = ({ target, onClose, accessToken, orgId }) => {
  // Read at open time through refs: a token rotation must not refetch.
  const authRef = useRef({ accessToken, orgId });
  authRef.current = { accessToken, orgId };
  const [state, setState] = useState({ loading: true, url: null, error: "", headers: {} });

  useEffect(() => {
    if (!target) return undefined;
    let cancelled = false;
    let url = null;
    setState({ loading: true, url: null, error: "", headers: {} });
    lettersApi
      .adminPreview(
        { userId: target.row.user_id, eventId: target.eventId, role: target.row.role },
        authRef.current.accessToken,
        authRef.current.orgId,
      )
      .then(({ blob, headers }) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setState({ loading: false, url, error: "", headers: headers || {} });
      })
      .catch((err) => {
        if (!cancelled) setState({ loading: false, url: null, error: err.message, headers: {} });
      });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [target]);

  if (!target) return null;
  const { row } = target;
  const issued = rowStatus(row) === "issued";
  const facts = factRows(row.facts);
  const reason = state.headers["x-letter-reason"];

  return (
    <Dialog open onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        {target.sample ? "Sample: " : ""}
        {row.name || row.email} · {roleLabel(row.role)} letter
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "1fr 340px" } }}>
          <Box sx={{ position: "relative", minHeight: 640, border: "1px solid #E7E1D4", borderRadius: 1, bgcolor: "#F6F3EC" }}>
            {state.url && (
              <iframe
                title="Letter PDF"
                src={`${state.url}#view=FitH`}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
              />
            )}
            {state.loading && (
              <Box sx={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                <CircularProgress size={28} />
              </Box>
            )}
            {state.error && (
              <Alert severity="error" sx={{ m: 2 }}>
                {state.error}
              </Alert>
            )}
          </Box>
          <Box>
            {issued ? (
              <Alert severity="success" sx={{ mb: 2 }}>
                This is the stored PDF the person downloads.
              </Alert>
            ) : (
              <Alert severity={row.eligible ? "info" : "warning"} sx={{ mb: 2 }}>
                Not issued yet. This watermarked render uses today&apos;s data
                {row.eligible ? "." : `; the person isn't eligible (${eligibilityLabel({ reason: reason || row.reason })}).`}
              </Alert>
            )}
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {issued ? "Frozen facts" : "Evidence"}
            </Typography>
            {issued && facts.length > 0 ? (
              <Table size="small">
                <TableBody>
                  {facts.map(([label, value]) => (
                    <TableRow key={label}>
                      <TableCell sx={{ color: "text.secondary", pl: 0, width: 130 }}>{label}</TableCell>
                      <TableCell sx={{ pr: 0 }}>{value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                {evidenceLines(row).map((line) => (
                  <li key={line}>
                    <Typography variant="body2">{line}</Typography>
                  </li>
                ))}
              </Box>
            )}
            {row.exception && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Issued by exception: {row.exception_note}
              </Alert>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        {state.url && (
          <Button href={state.url} target="_blank" rel="noopener noreferrer">
            Open PDF in a new tab
          </Button>
        )}
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const RevokeDialog = ({ row, onClose, onRevoke }) => {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    setReason("");
    setError("");
  }, [row]);
  if (!row) return null;
  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      await onRevoke(row, reason.trim());
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open onClose={busy ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Revoke {row.name || row.email}&apos;s {roleLabel(row.role).toLowerCase()} letter?</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          The verification page will show the letter as revoked and the person can no longer
          download it. This can&apos;t be undone here.
        </Typography>
        <TextField
          label="Reason (internal)"
          value={reason}
          onChange={(e) => setReason(e.target.value.slice(0, 1000))}
          multiline
          minRows={2}
          fullWidth
          required
          autoFocus
        />
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>Cancel</Button>
        <Button color="error" variant="contained" onClick={submit} disabled={busy || !reason.trim()}>
          {busy ? "Revoking…" : "Revoke letter"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ExceptionDialog = ({ open, onClose, onSubmit, hackathons, defaultEventId }) => {
  const [form, setForm] = useState({ email: "", eventId: "", role: "mentor", note: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (open) {
      setForm({ email: "", eventId: defaultEventId || "", role: "mentor", note: "" });
      setError("");
    }
  }, [open, defaultEventId]);
  if (!open) return null;
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const valid = /\S+@\S+\.\S+/.test(form.email.trim()) && form.eventId && form.note.trim();
  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      await onSubmit({
        email: form.email.trim(),
        event_id: form.eventId,
        role: form.role,
        note: form.note.trim(),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open onClose={busy ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Issue an exception letter</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          For cases the rules don&apos;t cover, such as Spring 2026 mentors or a missed check-in.
          The letter skips the date and eligibility rules, uses whatever facts exist, is issued
          immediately and is flagged as an exception.
        </Typography>
        <Box sx={{ display: "grid", gap: 2 }}>
          <TextField label="Person's email" value={form.email} onChange={set("email")} required fullWidth autoFocus />
          <TextField select label="Event" value={form.eventId} onChange={set("eventId")} required fullWidth>
            {hackathons.map((h) => (
              <MenuItem key={h.event_id} value={h.event_id}>
                {h.title || h.event_id}
              </MenuItem>
            ))}
          </TextField>
          <TextField select label="Role" value={form.role} onChange={set("role")} fullWidth>
            {ROLE_OPTIONS.map((r) => (
              <MenuItem key={r} value={r}>{roleLabel(r)}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Why this exception (internal)"
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value.slice(0, 1000) }))}
            multiline
            minRows={2}
            required
            fullWidth
          />
        </Box>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={busy || !valid}>
          {busy ? "Issuing…" : "Issue letter"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const AdminLettersPage = withRequiredAuthInfo(({ userClass }) => {
  const { accessToken } = useAuthInfo();
  const org = userClass.getOrgByName("Opportunity Hack Org");
  const isAdmin = Boolean(org?.hasPermission("volunteer.admin"));
  const orgId = org?.orgId;
  const tokenRef = useRef(accessToken);
  tokenRef.current = accessToken;
  const hasToken = Boolean(accessToken);

  const [hackathons, setHackathons] = useState([]);
  const [eventId, setEventId] = useState("");
  const [data, setData] = useState(null);
  const [listState, setListState] = useState("idle"); // idle | loading | ready | error
  const [listError, setListError] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState(null);
  const [revokeRow, setRevokeRow] = useState(null);
  const [exceptionOpen, setExceptionOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const notify = (message, severity = "success") => setSnackbar({ open: true, message, severity });

  useEffect(() => {
    if (!isAdmin || !hasToken) return;
    (async () => {
      try {
        const res = await fetch(`${API()}/api/messages/hackathons`, {
          headers: { Authorization: `Bearer ${tokenRef.current}` },
        });
        if (!res.ok) throw new Error("hackathons");
        const body = await res.json();
        const sorted = [...(body.hackathons || [])].sort(
          (a, b) => new Date(b.end_date || b.start_date) - new Date(a.end_date || a.start_date),
        );
        setHackathons(sorted);
        const fromUrl = new URLSearchParams(window.location.search).get("event_id");
        setEventId((cur) => cur || fromUrl || sorted[0]?.event_id || "");
      } catch {
        notify("Could not load hackathons.", "error");
      }
    })();
  }, [isAdmin, hasToken]);

  const load = useCallback(async () => {
    if (!eventId) return;
    setListState("loading");
    setListError("");
    try {
      const body = await lettersApi.adminList(eventId, tokenRef.current, orgId);
      setData(body);
      setListState("ready");
    } catch (err) {
      setListError(err.message);
      setListState("error");
    }
  }, [eventId, orgId]);

  useEffect(() => {
    if (isAdmin && hasToken && eventId) load();
  }, [isAdmin, hasToken, eventId, load]);

  const rows = useMemo(() => data?.rows || [], [data]);
  const visible = useMemo(
    () => filterRows(rows, { role: roleFilter, status: statusFilter, search }),
    [rows, roleFilter, statusFilter, search],
  );
  const counts = useMemo(() => countsByStatus(rows), [rows]);

  const openSample = (role) => {
    const row = sampleRowFor(rows, role);
    if (!row) {
      notify(`No ${roleLabel(role).toLowerCase()}s at this event to render a sample from.`, "info");
      return;
    }
    setPreview({ row, eventId, sample: true });
  };

  const revoke = async (row, reason) => {
    await lettersApi.adminRevoke(row.letter_id, reason, tokenRef.current, orgId);
    setRevokeRow(null);
    notify("Letter revoked.");
    load();
  };

  const issueException = async (payload) => {
    const result = await lettersApi.adminException(payload, tokenRef.current, orgId);
    setExceptionOpen(false);
    notify(`Exception letter ${result.letter_id} issued.`);
    if (payload.event_id === eventId) load();
  };

  if (!isAdmin) {
    return (
      <AdminPage title="Participation letters" isAdmin={false}>
        <div />
      </AdminPage>
    );
  }

  return (
    <AdminPage
      title="Participation letters"
      snackbar={snackbar}
      onSnackbarClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      isAdmin={isAdmin}
    >
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: "75ch" }}>
        People who qualify download their signed letter on their profile; nothing here approves
        letters. Use this page to check letters look right, revoke one, or issue an exception.
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center", mb: 2 }}>
        <TextField
          select
          size="small"
          label="Event"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          sx={{ minWidth: 280 }}
        >
          {hackathons.map((h) => (
            <MenuItem key={h.event_id} value={h.event_id}>
              {h.title || h.event_id}
            </MenuItem>
          ))}
        </TextField>
        <TextField select size="small" label="Role" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} sx={{ minWidth: 140 }}>
          <MenuItem value="all">All roles</MenuItem>
          {ROLE_OPTIONS.map((r) => (
            <MenuItem key={r} value={r}>{roleLabel(r)}</MenuItem>
          ))}
        </TextField>
        <TextField select size="small" label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 200 }}>
          {STATUS_FILTERS.map((s) => (
            <MenuItem key={s.value} value={s.value}>
              {s.label} ({counts[s.value] ?? 0})
            </MenuItem>
          ))}
        </TextField>
        <TextField size="small" label="Search name, email, team" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: 220 }} />
        <Box sx={{ flex: 1 }} />
        <Button variant="outlined" onClick={() => setExceptionOpen(true)}>
          Issue exception
        </Button>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center", mb: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
          Preview sample:
        </Typography>
        {ROLE_OPTIONS.map((r) => (
          <Button key={r} size="small" variant="text" onClick={() => openSample(r)} disabled={listState !== "ready"}>
            {roleLabel(r)}
          </Button>
        ))}
      </Box>

      {listState === "loading" && <CircularProgress size={28} />}
      {listState === "error" && (
        <Alert severity="error" action={<Button onClick={load}>Retry</Button>}>
          {listError}
        </Alert>
      )}
      {listState === "ready" && (
        <Box sx={{ overflowX: "auto" }}>
          <Table size="small" data-testid="letters-table">
            <TableHead>
              <TableRow>
                <TableCell>Person</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Eligibility</TableCell>
                <TableCell>Evidence</TableCell>
                <TableCell>Letter</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visible.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography variant="body2" color="text.secondary">
                      {rows.length ? "No one matches these filters." : "No applications for this event."}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {visible.map((row) => {
                const status = rowStatus(row);
                const chip = STATUS_CHIP[status];
                return (
                  <TableRow key={`${row.user_id || row.email}-${row.role}`} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.name || "—"}</Typography>
                      <Typography variant="caption" color="text.secondary">{row.email}</Typography>
                    </TableCell>
                    <TableCell>{roleLabel(row.role)}</TableCell>
                    <TableCell sx={{ maxWidth: 260 }}>
                      <Typography variant="body2" color={row.eligible ? "success.main" : "text.secondary"}>
                        {eligibilityLabel(row)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {evidenceLines(row).map((line) => (
                        <Typography key={line} variant="caption" display="block">{line}</Typography>
                      ))}
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={chip.label} color={chip.color} variant={status === "issued" ? "filled" : "outlined"} />
                      {row.exception && <Chip size="small" label="Exception" color="warning" variant="outlined" sx={{ ml: 0.5 }} />}
                      {row.issued_at && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          {formatIssuedDate(row.issued_at)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      <Button size="small" onClick={() => setPreview({ row, eventId })} disabled={!row.user_id}>
                        Preview
                      </Button>
                      {row.letter_id && (
                        <Button
                          size="small"
                          href={`/letters/verify/${row.letter_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          endIcon={<OpenInNewIcon fontSize="small" />}
                        >
                          Verify page
                        </Button>
                      )}
                      {status === "issued" && (
                        <Button size="small" color="error" onClick={() => setRevokeRow(row)}>
                          Revoke
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      )}

      <PreviewDialog target={preview} onClose={() => setPreview(null)} accessToken={accessToken} orgId={orgId} />
      <RevokeDialog row={revokeRow} onClose={() => setRevokeRow(null)} onRevoke={revoke} />
      <ExceptionDialog
        open={exceptionOpen}
        onClose={() => setExceptionOpen(false)}
        onSubmit={issueException}
        hackathons={hackathons}
        defaultEventId={eventId}
      />
    </AdminPage>
  );
});

export default AdminLettersPage;
