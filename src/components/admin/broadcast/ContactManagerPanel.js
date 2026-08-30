import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  DialogContentText,
  DialogTitle,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import {
  DeleteOutline as DeleteIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import BroadcastService from "../../../lib/broadcastService";
import * as ga from "../../../lib/ga";

const POLL_INTERVAL_MS = 3000;
const VISIBLE_ROWS_CAP = 200;

/**
 * Resend contact inventory + quota reclaim. The marketing tier is billed by
 * GLOBAL contact count — unsubscribed contacts can't receive broadcasts but
 * still count, so "Delete unsubscribed" is the first lever when over quota.
 */
const ContactManagerPanel = ({ apiServerUrl, accessToken, orgId, onSnack }) => {
  const service = useMemo(
    () => new BroadcastService(apiServerUrl, accessToken, orgId),
    [apiServerUrl, accessToken, orgId],
  );

  const [data, setData] = useState(null); // {contacts, total, unsubscribed_count, contact_limit, over_limit}
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [pruneStatus, setPruneStatus] = useState(null);
  const [confirm, setConfirm] = useState(null); // {mode, emails?, count}
  const [confirmText, setConfirmText] = useState("");
  const pollRef = useRef(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  const load = useCallback(
    async (force = false) => {
      try {
        setLoading(true);
        const result = await service.listContacts({ force });
        setData(result);
        setSelected(new Set());
      } catch (error) {
        onSnack?.(`Failed to load contacts: ${error.message}`, "error");
      } finally {
        setLoading(false);
      }
    },
    [service, onSnack],
  );

  useEffect(() => {
    load();
  }, [load]);

  const startPolling = useCallback(() => {
    stopPolling();
    const poll = async () => {
      try {
        const result = await service.getPruneStatus();
        const status = result.status || {};
        setPruneStatus(status);
        if (["done", "error", "stalled", "none"].includes(status.state)) {
          stopPolling();
          if (status.state === "done") {
            onSnack?.(
              `Prune complete: ${status.deleted || 0} contact(s) deleted` +
                (status.failed ? `, ${status.failed} failed` : "") +
                (status.simulated ? " (simulated)" : ""),
              "success",
            );
            ga.trackStructuredEvent(
              ga.EventCategory.ADMIN,
              "broadcast_contacts_pruned",
              status.mode,
              status.deleted || 0,
            );
            load(true);
          }
        }
      } catch (error) {
        console.error("Prune status poll failed:", error);
      }
    };
    poll();
    pollRef.current = setInterval(poll, POLL_INTERVAL_MS);
  }, [service, stopPolling, onSnack, load]);

  const startPrune = async ({ mode, emails }) => {
    try {
      const result = await service.startContactPrune({ mode, emails });
      if (result.status === "empty") {
        onSnack?.("Nothing to delete for that selection", "info");
        return;
      }
      setPruneStatus({
        state: "running",
        mode,
        total_targets: result.total_targets,
      });
      startPolling();
    } catch (error) {
      if (error.status === 409) {
        onSnack?.("A prune is already running — watching it", "info");
        startPolling();
      } else {
        onSnack?.(`Prune failed to start: ${error.message}`, "error");
      }
    }
  };

  const openConfirm = (mode, emails) => {
    const count =
      mode === "all"
        ? data?.total || 0
        : mode === "unsubscribed"
          ? data?.unsubscribed_count || 0
          : emails.length;
    setConfirmText("");
    setConfirm({ mode, emails, count });
  };

  const handleConfirm = async () => {
    const { mode, emails } = confirm;
    setConfirm(null);
    await startPrune({ mode, emails });
  };

  const contacts = data?.contacts || [];
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return contacts;
    return contacts.filter(
      (c) =>
        c.email.includes(term) ||
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(term),
    );
  }, [contacts, search]);
  const visible = filtered.slice(0, VISIBLE_ROWS_CAP);

  const toggleSelected = (email) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  };

  const pruneRunning = pruneStatus?.state === "running";
  const quotaPct =
    data && data.contact_limit
      ? Math.min(100, Math.round((data.total / data.contact_limit) * 100))
      : 0;

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography variant="h6">Contacts & quota</Typography>
        <Button
          size="small"
          startIcon={loading ? <CircularProgress size={14} /> : <RefreshIcon />}
          onClick={() => load(true)}
          disabled={loading || pruneRunning}
        >
          Refresh
        </Button>
      </Box>

      {data && (
        <>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2">
                {data.total.toLocaleString()} of{" "}
                {data.contact_limit.toLocaleString()} contacts on your marketing
                tier
              </Typography>
              {data.over_limit && (
                <Chip
                  size="small"
                  color="error"
                  label={`${(data.total - data.contact_limit).toLocaleString()} over quota`}
                />
              )}
            </Box>
            <LinearProgress
              variant="determinate"
              value={quotaPct}
              color={data.over_limit ? "error" : "primary"}
              sx={{ mt: 0.5, height: 8, borderRadius: 4 }}
            />
          </Box>

          {data.over_limit && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              You&apos;re over the contact quota — Resend will reject new
              contact writes until you&apos;re back under{" "}
              {data.contact_limit.toLocaleString()} (or upgrade the marketing
              tier). Deleting the {data.unsubscribed_count.toLocaleString()}{" "}
              unsubscribed contact(s) is the safe first step: they can&apos;t
              receive broadcasts anyway but still count against quota.
            </Alert>
          )}

          {pruneRunning && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress
                variant={
                  pruneStatus.total_targets ? "determinate" : "indeterminate"
                }
                value={
                  pruneStatus.total_targets
                    ? Math.min(
                        100,
                        Math.round(
                          ((pruneStatus.deleted || 0) /
                            pruneStatus.total_targets) *
                            100,
                        ),
                      )
                    : undefined
                }
                sx={{ mb: 0.5 }}
              />
              <Typography variant="body2" color="text.secondary">
                Deleting… {pruneStatus.deleted || 0} of{" "}
                {pruneStatus.total_targets} contacts
              </Typography>
            </Box>
          )}
          {pruneStatus?.state === "stalled" && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              The prune appears stalled — the server worker may have restarted.
              Start it again; already-deleted contacts stay deleted.
            </Alert>
          )}
          {pruneStatus?.state === "error" && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Prune failed: {pruneStatus.error || "unknown error"}
            </Alert>
          )}

          <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              color="warning"
              startIcon={<DeleteIcon />}
              disabled={pruneRunning || data.unsubscribed_count === 0}
              onClick={() => openConfirm("unsubscribed")}
            >
              Delete unsubscribed ({data.unsubscribed_count})
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              disabled={pruneRunning || selected.size === 0}
              onClick={() => openConfirm("emails", [...selected])}
            >
              Delete selected ({selected.size})
            </Button>
            <Button
              variant="text"
              color="error"
              disabled={pruneRunning || data.total === 0}
              onClick={() => openConfirm("all")}
            >
              Delete ALL contacts…
            </Button>
          </Box>

          <TextField
            size="small"
            fullWidth
            placeholder="Search contacts by email or name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ mb: 1 }}
          />
          <Typography variant="caption" color="text.secondary">
            Showing {visible.length} of {filtered.length} matching contacts
            {filtered.length > VISIBLE_ROWS_CAP &&
              " (refine the search to see more)"}
          </Typography>

          <Box sx={{ maxHeight: 380, overflow: "auto", mt: 1 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      size="small"
                      indeterminate={
                        selected.size > 0 && selected.size < visible.length
                      }
                      checked={
                        visible.length > 0 &&
                        visible.every((c) => selected.has(c.email))
                      }
                      onChange={(e) =>
                        setSelected(
                          e.target.checked
                            ? new Set(visible.map((c) => c.email))
                            : new Set(),
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visible.map((c) => (
                  <TableRow key={c.email} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        size="small"
                        checked={selected.has(c.email)}
                        onChange={() => toggleSelected(c.email)}
                      />
                    </TableCell>
                    <TableCell>{c.email}</TableCell>
                    <TableCell>
                      {`${c.first_name} ${c.last_name}`.trim() || "—"}
                    </TableCell>
                    <TableCell>
                      {c.unsubscribed ? (
                        <Chip
                          size="small"
                          label="unsubscribed"
                          color="warning"
                        />
                      ) : (
                        <Chip
                          size="small"
                          label="subscribed"
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </>
      )}

      {!data && loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Confirm dialog */}
      <Dialog open={Boolean(confirm)} onClose={() => setConfirm(null)}>
        <DialogTitle>
          {confirm?.mode === "all"
            ? "Delete ALL contacts?"
            : confirm?.mode === "unsubscribed"
              ? "Delete all unsubscribed contacts?"
              : `Delete ${confirm?.count} selected contact(s)?`}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            This permanently deletes {confirm?.count?.toLocaleString()}{" "}
            contact(s) from Resend (account-wide, freeing marketing quota).
            {confirm?.mode === "unsubscribed" &&
              " These people unsubscribed, so they weren't receiving broadcasts anyway."}
            {confirm?.mode === "all" && (
              <>
                {" "}
                <strong>
                  This also erases their unsubscribe preferences
                </strong>{" "}
                — if they are re-synced later they will be subscribed again.
                Type <strong>DELETE</strong> to confirm.
              </>
            )}
          </DialogContentText>
          {confirm?.mode === "all" && (
            <TextField
              autoFocus
              fullWidth
              size="small"
              sx={{ mt: 2 }}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            disabled={confirm?.mode === "all" && confirmText !== "DELETE"}
            onClick={handleConfirm}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ContactManagerPanel;
