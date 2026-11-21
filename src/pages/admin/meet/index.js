import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/router";
import { useAuthInfo, withRequiredAuthInfo } from "@propelauth/react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Radio,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AdminPage from "../../../components/admin/AdminPage";
import SectionContainer from "../../../components/admin/hackathon-edit/SectionContainer";
import meetApi from "../../../lib/meetApi";
import {
  ANSWER_LABELS,
  ANSWER_SYMBOLS,
  DURATION_OPTIONS,
  bestSlotIds,
  browserTimeZone,
  fromLocalInputValue,
  parseEmailList,
  pollUrl,
  slotLongLabel,
  slotParts,
  tallyVotes,
  toLocalInputValue,
} from "../../../lib/meetTime";

// Admin side of the meeting scheduler (public page: /meet?code=<code>).
// Create a poll with candidate times, share the link, watch the answers
// come in, then pick the time — the backend creates the Google Calendar
// event with a Meet link on the @ohack.org calendar and Google emails the
// invitations. Gated on volunteer.admin.

const NAVY = "#1B3A6B";
const ANSWER_COLORS = {
  yes: { bgcolor: "#E3F1E8", color: "#2F6E50" },
  maybe: { bgcolor: "#FBF1D9", color: "#7A5A12" },
  no: { bgcolor: "transparent", color: "#8A8F9A" },
};

const statusChip = (status) => {
  if (status === "finalized") return { label: "Scheduled", color: "success" };
  if (status === "closed") return { label: "Closed", color: "warning" };
  return { label: "Open", color: "primary" };
};

let slotKeySeq = 0;
const newSlotRow = (value = "", id = null) => ({
  key: `slot-${(slotKeySeq += 1)}`,
  id,
  value,
});

const emptyForm = () => ({
  title: "",
  description: "",
  code: "",
  durationMinutes: 30,
  slots: [newSlotRow()],
});

// ---- Create / edit dialog --------------------------------------------------

const PollFormDialog = ({ open, editing, busy, onClose, onSubmit }) => {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const timeZone = useMemo(browserTimeZone, []);

  useEffect(() => {
    if (!open) return;
    setError("");
    setForm(
      editing
        ? {
            title: editing.title || "",
            description: editing.description || "",
            code: editing.code,
            durationMinutes: editing.duration_minutes || 30,
            slots: (editing.slots || []).map((s) =>
              newSlotRow(toLocalInputValue(s.start), s.id),
            ),
          }
        : emptyForm(),
    );
  }, [open, editing]);

  const setSlot = (key, value) =>
    setForm((f) => ({
      ...f,
      slots: f.slots.map((s) => (s.key === key ? { ...s, value } : s)),
    }));

  const addSlot = () =>
    setForm((f) => {
      // New row starts a day after the last one: the common case is the
      // same hour on several days.
      const last = f.slots[f.slots.length - 1]?.value;
      let value = "";
      if (last) {
        const next = new Date(new Date(last).getTime() + 24 * 60 * 60 * 1000);
        value = toLocalInputValue(next.toISOString());
      }
      return { ...f, slots: [...f.slots, newSlotRow(value)] };
    });

  const submit = () => {
    if (!form.title.trim()) {
      setError("Give the meeting a title.");
      return;
    }
    const slots = [];
    for (const row of form.slots) {
      if (!row.value) continue;
      const start = fromLocalInputValue(row.value);
      if (!start) {
        setError("One of the times isn't a valid date.");
        return;
      }
      slots.push(row.id ? { id: row.id, start } : { start });
    }
    if (slots.length === 0) {
      setError("Add at least one time.");
      return;
    }
    setError("");
    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      durationMinutes: Number(form.durationMinutes),
      slots,
      ...(editing ? {} : { code: form.code.trim() }),
    });
  };

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>{editing ? "Edit poll" : "New meeting poll"}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Meeting title"
            name="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            fullWidth
            required
            inputProps={{ maxLength: 120 }}
            helperText="Becomes the calendar event title."
          />
          <TextField
            label="Description (optional)"
            name="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            fullWidth
            multiline
            minRows={2}
            inputProps={{ maxLength: 2000 }}
            helperText="Shown on the poll and in the calendar invite."
          />
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <TextField
              label="Code"
              name="code"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              disabled={Boolean(editing)}
              sx={{ flex: "1 1 200px" }}
              inputProps={{ maxLength: 40 }}
              helperText={
                editing
                  ? "The code can't change once shared."
                  : "Optional, e.g. 1234. Leave blank to generate one."
              }
            />
            <TextField
              select
              label="Length"
              name="durationMinutes"
              value={form.durationMinutes}
              onChange={(e) =>
                setForm({ ...form, durationMinutes: e.target.value })
              }
              sx={{ flex: "0 0 140px" }}
            >
              {[...new Set([...DURATION_OPTIONS, Number(form.durationMinutes)])]
                .sort((a, b) => a - b)
                .map((m) => (
                  <MenuItem key={m} value={m}>
                    {m} min
                  </MenuItem>
                ))}
            </TextField>
          </Box>

          <Box>
            <Typography variant="subtitle2">Proposed start times</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Enter them in your time ({timeZone.replace(/_/g, " ")}). Everyone
              else sees them converted to theirs.
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {form.slots.map((row, index) => (
                <Box
                  key={row.key}
                  sx={{ display: "flex", gap: 1, alignItems: "center" }}
                >
                  <TextField
                    type="datetime-local"
                    name={`slot-${index}`}
                    value={row.value}
                    onChange={(e) => setSlot(row.key, e.target.value)}
                    size="small"
                    fullWidth
                    inputProps={{
                      "aria-label": `Time ${index + 1}`,
                      step: 300,
                    }}
                  />
                  <IconButton
                    aria-label={`Remove time ${index + 1}`}
                    disabled={form.slots.length === 1}
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        slots: f.slots.filter((s) => s.key !== row.key),
                      }))
                    }
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </Box>
              ))}
            </Box>
            <Button
              onClick={addSlot}
              sx={{ mt: 1 }}
              disabled={form.slots.length >= 40}
            >
              + Add another time
            </Button>
            {editing && (
              <Typography variant="body2" color="text.secondary">
                Removing a time also drops the answers people gave for it.
              </Typography>
            )}
          </Box>
          {error && <Alert severity="error">{error}</Alert>}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={busy}>
          Cancel
        </Button>
        <Button
          onClick={submit}
          variant="contained"
          disabled={busy}
          sx={{ bgcolor: NAVY, "&:hover": { bgcolor: "#0E2547" } }}
        >
          {busy ? "Saving…" : editing ? "Save changes" : "Create poll"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ---- Results + finalize dialog ---------------------------------------------

const ResultsDialog = ({
  open,
  detail,
  loading,
  loadError,
  busy,
  calendar,
  onClose,
  onRetry,
  onEdit,
  onToggleClosed,
  onDeleteVote,
  onFinalize,
}) => {
  const timeZone = useMemo(browserTimeZone, []);
  const poll = detail?.poll;
  const votes = useMemo(() => detail?.votes || [], [detail]);
  const slots = useMemo(() => poll?.slots || [], [poll]);
  const tally = useMemo(() => tallyVotes(slots, votes), [slots, votes]);
  const best = useMemo(() => bestSlotIds(slots, tally), [slots, tally]);

  const [slotId, setSlotId] = useState("");
  const [excluded, setExcluded] = useState([]);
  const [extraText, setExtraText] = useState("");
  const [sendInvites, setSendInvites] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const seededRef = useRef("");

  // Seed once per opened poll; a background reload must not undo choices.
  useEffect(() => {
    if (!open) {
      seededRef.current = "";
      return;
    }
    if (!poll || seededRef.current === poll.code) return;
    seededRef.current = poll.code;
    setSlotId("");
    setExcluded([]);
    setExtraText("");
    setConfirming(false);
    setError("");
    setSendInvites(Boolean(calendar.configured));
  }, [open, poll, calendar.configured]);

  const finalized = poll?.status === "finalized";
  const finalSlot = slots.find((s) => s.id === poll?.final_slot_id);
  const chosen = slots.find((s) => s.id === slotId);
  const invitedVotes = votes.filter((v) => !excluded.includes(v.id));
  const extra = parseEmailList(extraText);
  const inviteCount = new Set([
    ...invitedVotes.map((v) => v.email),
    ...extra.emails,
  ]).size;

  const startFinalize = () => {
    if (!chosen) {
      setError("Pick the time first.");
      return;
    }
    if (extra.invalid.length) {
      setError(`Not a valid email: ${extra.invalid.join(", ")}`);
      return;
    }
    if (sendInvites && inviteCount === 0) {
      setError("There is nobody to invite. Add an email or untick the invite.");
      return;
    }
    setError("");
    setConfirming(true);
  };

  const label = (slot) =>
    slotLongLabel(slot.start, poll.duration_minutes, timeZone);

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      fullWidth
      maxWidth="lg"
    >
      <DialogTitle>
        {poll?.title || "Meeting poll"}
        {poll && (
          <Chip
            size="small"
            sx={{ ml: 1.5 }}
            label={statusChip(poll.status).label}
            color={statusChip(poll.status).color}
          />
        )}
      </DialogTitle>
      <DialogContent dividers>
        {loading && !detail && <CircularProgress size={24} />}
        {loadError && !detail && (
          <Alert
            severity="error"
            action={<Button onClick={onRetry}>Retry</Button>}
          >
            {loadError}
          </Alert>
        )}
        {poll && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {finalized && finalSlot && (
              <Alert severity="success">
                <strong>{label(finalSlot)}</strong>
                <br />
                {poll.calendar_event_id ? (
                  <>
                    Invites sent to {(poll.invited_emails || []).length} people
                    from {calendar.organizer || "the Opportunity Hack calendar"}
                    .{" "}
                    {poll.meet_link && (
                      <a
                        href={poll.meet_link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {poll.meet_link}
                      </a>
                    )}
                    {poll.calendar_html_link && (
                      <>
                        {" · "}
                        <a
                          href={poll.calendar_html_link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open in Google Calendar
                        </a>
                      </>
                    )}
                  </>
                ) : (
                  "Time recorded. No calendar invite was sent from here."
                )}
              </Alert>
            )}

            <Box sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ minWidth: 220 }}>
                      {votes.length === 1
                        ? "1 response"
                        : `${votes.length} responses`}
                    </TableCell>
                    {slots.map((slot) => {
                      const parts = slotParts(
                        slot.start,
                        poll.duration_minutes,
                        timeZone,
                      );
                      const highlight = finalized
                        ? slot.id === poll.final_slot_id
                        : best.includes(slot.id);
                      return (
                        <TableCell
                          key={slot.id}
                          align="center"
                          sx={{
                            minWidth: 110,
                            bgcolor: highlight ? "#FBE9E2" : undefined,
                          }}
                        >
                          <Typography variant="caption" display="block">
                            {parts.weekday} {parts.date}
                          </Typography>
                          <Typography variant="caption" display="block" noWrap>
                            {parts.time}
                          </Typography>
                          {!finalized && (
                            <Radio
                              size="small"
                              checked={slotId === slot.id}
                              onChange={() => {
                                setSlotId(slot.id);
                                setConfirming(false);
                              }}
                              inputProps={{
                                "aria-label": `Choose ${label(slot)}`,
                              }}
                            />
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {votes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={slots.length + 2}>
                        <Typography variant="body2" color="text.secondary">
                          No responses yet. Share the link and check back.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  {votes.map((vote) => (
                    <TableRow key={vote.id}>
                      <TableCell>
                        {finalized ? (
                          <Typography variant="body2">{vote.name}</Typography>
                        ) : (
                          <FormControlLabel
                            sx={{ m: 0 }}
                            control={
                              <Checkbox
                                size="small"
                                checked={!excluded.includes(vote.id)}
                                onChange={(e) =>
                                  setExcluded((cur) =>
                                    e.target.checked
                                      ? cur.filter((id) => id !== vote.id)
                                      : [...cur, vote.id],
                                  )
                                }
                                inputProps={{
                                  "aria-label": `Invite ${vote.name}`,
                                }}
                              />
                            }
                            label={
                              <Typography variant="body2">
                                {vote.name}
                              </Typography>
                            }
                          />
                        )}
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          {vote.email}
                        </Typography>
                      </TableCell>
                      {slots.map((slot) => {
                        const answer = vote.choices?.[slot.id] || "no";
                        return (
                          <TableCell
                            key={slot.id}
                            align="center"
                            sx={ANSWER_COLORS[answer]}
                          >
                            <Tooltip title={ANSWER_LABELS[answer]}>
                              <span style={{ fontWeight: 700 }}>
                                {ANSWER_SYMBOLS[answer]}
                              </span>
                            </Tooltip>
                          </TableCell>
                        );
                      })}
                      <TableCell align="right">
                        {!finalized && (
                          <Tooltip title="Remove this response (they can answer again)">
                            <span>
                              <IconButton
                                size="small"
                                disabled={busy}
                                aria-label={`Remove ${vote.name}'s response`}
                                onClick={() => onDeleteVote(vote)}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Can make it</TableCell>
                    {slots.map((slot) => (
                      <TableCell
                        key={slot.id}
                        align="center"
                        sx={{ fontWeight: 700 }}
                      >
                        {tally[slot.id]?.yes || 0}
                        {tally[slot.id]?.maybe > 0 && (
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                          >
                            {" "}
                            +{tally[slot.id].maybe} maybe
                          </Typography>
                        )}
                      </TableCell>
                    ))}
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </Box>

            {!finalized && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Schedule the meeting
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {chosen
                    ? `Chosen: ${label(chosen)}`
                    : "Pick a time with the round button above its column. Untick anyone who shouldn't be invited."}
                </Typography>
                <TextField
                  label="Also invite (optional)"
                  name="extraEmails"
                  value={extraText}
                  onChange={(e) => {
                    setExtraText(e.target.value);
                    setConfirming(false);
                  }}
                  size="small"
                  fullWidth
                  helperText="Emails of people who didn't answer the poll, separated by commas."
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={sendInvites}
                      disabled={!calendar.configured}
                      onChange={(e) => {
                        setSendInvites(e.target.checked);
                        setConfirming(false);
                      }}
                    />
                  }
                  label={
                    calendar.configured
                      ? `Send a Google Calendar invite with a Meet link from ${calendar.organizer}`
                      : "Send a Google Calendar invite with a Meet link"
                  }
                />
                {!calendar.configured && (
                  <Alert severity="warning">
                    Google Calendar isn&apos;t connected on the backend yet
                    (GOOGLE_CALENDAR_SA_CONFIG and GOOGLE_CALENDAR_ORGANIZER),
                    so no invite can be sent from here. You can still record the
                    chosen time and send the invite yourself.
                  </Alert>
                )}
                {error && <Alert severity="error">{error}</Alert>}
                {confirming && chosen && (
                  <Alert
                    severity="info"
                    action={
                      <Button
                        color="inherit"
                        disabled={busy}
                        onClick={() =>
                          onFinalize({
                            slotId: chosen.id,
                            sendInvites,
                            voteIds: invitedVotes.map((v) => v.id),
                            extraEmails: extra.emails,
                          })
                        }
                      >
                        {busy ? "Scheduling…" : "Yes, schedule it"}
                      </Button>
                    }
                  >
                    {sendInvites
                      ? `This emails a calendar invite to ${inviteCount} ${inviteCount === 1 ? "person" : "people"} for ${label(chosen)} and closes the poll. It can't be undone from here.`
                      : `This records ${label(chosen)} as the meeting time and closes the poll. No invite is sent.`}
                  </Alert>
                )}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, flexWrap: "wrap", gap: 1 }}>
        <Button onClick={onClose} color="inherit" disabled={busy}>
          Close
        </Button>
        {poll && !finalized && (
          <>
            <Button onClick={onEdit} disabled={busy}>
              Edit times
            </Button>
            <Button onClick={onToggleClosed} disabled={busy}>
              {poll.status === "closed" ? "Reopen poll" : "Stop responses"}
            </Button>
            <Button
              onClick={startFinalize}
              variant="contained"
              disabled={busy || confirming}
              sx={{ bgcolor: NAVY, "&:hover": { bgcolor: "#0E2547" } }}
            >
              Schedule meeting
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

// ---- Page ------------------------------------------------------------------

const AdminMeetPage = withRequiredAuthInfo(({ userClass }) => {
  const router = useRouter();
  const { accessToken } = useAuthInfo();
  const org = userClass.getOrgByName("Opportunity Hack Org");
  const isAdmin = Boolean(org?.hasPermission("volunteer.admin"));
  const orgId = org?.orgId;
  const tokenRef = useRef(accessToken);
  tokenRef.current = accessToken;

  // listState: loading | ready | error. An error never renders "no polls".
  const [listState, setListState] = useState("loading");
  const [polls, setPolls] = useState([]);
  const [calendar, setCalendar] = useState({
    configured: false,
    organizer: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [copied, setCopied] = useState("");
  const timeZone = useMemo(browserTimeZone, []);

  const openCode = router.isReady ? String(router.query.code || "") : "";
  const snack = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  const readCalendar = (data) =>
    setCalendar({
      configured: Boolean(data.calendar_configured),
      organizer: data.calendar_organizer || "",
    });

  const fetchPolls = useCallback(async () => {
    try {
      const data = await meetApi.listAdmin(tokenRef.current, orgId);
      setPolls(data.data || []);
      readCalendar(data);
      setListState("ready");
    } catch (error) {
      setListState((current) => (current === "ready" ? current : "error"));
      setSnackbar({ open: true, message: error.message, severity: "error" });
    }
  }, [orgId]);

  const fetchDetail = useCallback(
    async (code) => {
      setDetailLoading(true);
      setDetailError("");
      try {
        const data = await meetApi.getAdmin(code, tokenRef.current, orgId);
        setDetail(data);
        readCalendar(data);
      } catch (error) {
        setDetailError(error.message);
      } finally {
        setDetailLoading(false);
      }
    },
    [orgId],
  );

  // Keyed on token PRESENCE: PropelAuth rotates the token on tab refocus and
  // a refetch then would reset an open dialog.
  const hasToken = Boolean(accessToken);
  useEffect(() => {
    if (isAdmin && hasToken) fetchPolls();
  }, [isAdmin, hasToken, fetchPolls]);

  useEffect(() => {
    if (!isAdmin || !hasToken) return;
    if (openCode) {
      setDetail((current) =>
        current?.poll?.code === openCode ? current : null,
      );
      fetchDetail(openCode);
    } else {
      setDetail(null);
      setDetailError("");
    }
  }, [isAdmin, hasToken, openCode, fetchDetail]);

  const setOpenCode = (code) =>
    router.replace(
      { pathname: "/admin/meet", query: code ? { code } : {} },
      undefined,
      { shallow: true, scroll: false },
    );

  const run = async (fn, successMessage) => {
    setBusy(true);
    try {
      const result = await fn();
      if (successMessage) snack(successMessage);
      return result;
    } catch (error) {
      snack(error.message, "error");
      return null;
    } finally {
      setBusy(false);
    }
  };

  const submitForm = async (payload) => {
    const result = await run(
      () =>
        editing
          ? meetApi.updateAdmin(editing.code, payload, tokenRef.current, orgId)
          : meetApi.createAdmin(payload, tokenRef.current, orgId),
      editing ? "Poll updated." : "Poll created. Copy the link and share it.",
    );
    if (!result) return;
    setFormOpen(false);
    fetchPolls();
    if (editing) fetchDetail(editing.code);
    else setOpenCode(result.poll.code);
  };

  const copyLink = async (code) => {
    try {
      await navigator.clipboard.writeText(pollUrl(code));
      setCopied(code);
      setTimeout(() => setCopied(""), 2000);
    } catch (e) {
      snack(pollUrl(code), "info");
    }
  };

  const reloadBoth = (code) => {
    fetchPolls();
    fetchDetail(code);
  };

  if (!isAdmin) {
    return (
      <AdminPage title="Meeting scheduler" isAdmin={false}>
        <Typography>You do not have permission to view this page.</Typography>
      </AdminPage>
    );
  }

  const detailPoll = detail?.poll;

  return (
    <AdminPage
      title="Meeting scheduler"
      snackbar={snackbar}
      onSnackbarClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      isAdmin={isAdmin}
    >
      <SectionContainer title="Meeting polls">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Propose a few times, share the link, and let people mark what works in
          their own timezone. When the answers are in, pick the time and the
          calendar invite with a Google Meet link goes out
          {calendar.organizer ? ` from ${calendar.organizer}` : ""}.
        </Typography>
        {listState === "ready" && !calendar.configured && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Google Calendar isn&apos;t connected yet, so polls work but invites
            can&apos;t be sent from here. Set GOOGLE_CALENDAR_SA_CONFIG and
            GOOGLE_CALENDAR_ORGANIZER on the backend.
          </Alert>
        )}
        <Box sx={{ display: "flex", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            sx={{ bgcolor: NAVY, "&:hover": { bgcolor: "#0E2547" } }}
          >
            New meeting poll
          </Button>
          <Button variant="outlined" onClick={fetchPolls}>
            Refresh
          </Button>
        </Box>

        {listState === "loading" && <CircularProgress size={24} />}
        {listState === "error" && (
          <Alert
            severity="error"
            action={<Button onClick={fetchPolls}>Retry</Button>}
          >
            Could not load meeting polls.
          </Alert>
        )}
        {listState === "ready" && polls.length === 0 && (
          <Typography color="text.secondary">
            No polls yet. Create one to get a shareable link.
          </Typography>
        )}
        {listState === "ready" && polls.length > 0 && (
          <Box sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Meeting</TableCell>
                  <TableCell>Link</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Responses</TableCell>
                  <TableCell>When</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {polls.map((poll) => {
                  const chip = statusChip(poll.status);
                  const finalSlot = (poll.slots || []).find(
                    (s) => s.id === poll.final_slot_id,
                  );
                  return (
                    <TableRow key={poll.code} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {poll.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {poll.duration_minutes} min ·{" "}
                          {(poll.slots || []).length} times
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          startIcon={<ContentCopyIcon fontSize="small" />}
                          onClick={() => copyLink(poll.code)}
                          sx={{ textTransform: "none" }}
                        >
                          {copied === poll.code
                            ? "Copied"
                            : `/meet?code=${poll.code}`}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={chip.label}
                          color={chip.color}
                        />
                      </TableCell>
                      <TableCell align="right">{poll.vote_count}</TableCell>
                      <TableCell>
                        {finalSlot
                          ? slotLongLabel(
                              finalSlot.start,
                              poll.duration_minutes,
                              timeZone,
                            )
                          : "Not chosen yet"}
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                        <Button
                          size="small"
                          onClick={() => setOpenCode(poll.code)}
                        >
                          {poll.status === "finalized" ? "View" : "Results"}
                        </Button>
                        <IconButton
                          size="small"
                          aria-label={`Delete ${poll.title}`}
                          onClick={() => setDeleteTarget(poll)}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        )}
      </SectionContainer>

      <PollFormDialog
        open={formOpen}
        editing={editing}
        busy={busy}
        onClose={() => setFormOpen(false)}
        onSubmit={submitForm}
      />

      <ResultsDialog
        open={Boolean(openCode)}
        detail={detail}
        loading={detailLoading}
        loadError={detailError}
        busy={busy}
        calendar={calendar}
        onClose={() => setOpenCode("")}
        onRetry={() => fetchDetail(openCode)}
        onEdit={() => {
          setEditing(detailPoll);
          setFormOpen(true);
        }}
        onToggleClosed={async () => {
          const status = detailPoll.status === "closed" ? "open" : "closed";
          const ok = await run(
            () =>
              meetApi.updateAdmin(
                detailPoll.code,
                { status },
                tokenRef.current,
                orgId,
              ),
            status === "closed"
              ? "Poll closed to new responses."
              : "Poll reopened.",
          );
          if (ok) reloadBoth(detailPoll.code);
        }}
        onDeleteVote={async (vote) => {
          const ok = await run(
            () =>
              meetApi.deleteVoteAdmin(
                detailPoll.code,
                vote.id,
                tokenRef.current,
                orgId,
              ),
            `Removed ${vote.name}'s response.`,
          );
          if (ok) reloadBoth(detailPoll.code);
        }}
        onFinalize={async (payload) => {
          const result = await run(() =>
            meetApi.finalizeAdmin(
              detailPoll.code,
              payload,
              tokenRef.current,
              orgId,
            ),
          );
          if (!result) return;
          snack(
            payload.sendInvites
              ? `Meeting scheduled. Invites sent to ${result.invited} people.`
              : "Meeting time recorded. No invite was sent.",
          );
          reloadBoth(detailPoll.code);
        }}
      />

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
      >
        <DialogTitle>Delete this poll?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            &ldquo;{deleteTarget?.title}&rdquo; and its{" "}
            {deleteTarget?.vote_count || 0} responses will be deleted and the
            link will stop working.
            {deleteTarget?.calendar_event_id &&
              " The calendar event already sent stays on the calendar; cancel it in Google Calendar."}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} color="inherit">
            Keep it
          </Button>
          <Button
            color="error"
            disabled={busy}
            onClick={async () => {
              const ok = await run(
                () =>
                  meetApi.deleteAdmin(
                    deleteTarget.code,
                    tokenRef.current,
                    orgId,
                  ),
                "Poll deleted.",
              );
              if (!ok) return;
              if (openCode === deleteTarget.code) setOpenCode("");
              setDeleteTarget(null);
              fetchPolls();
            }}
          >
            Delete poll
          </Button>
        </DialogActions>
      </Dialog>
    </AdminPage>
  );
});

export default AdminMeetPage;
