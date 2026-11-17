import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuthInfo, withRequiredAuthInfo } from "@propelauth/react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AdminPage from "../../../components/admin/AdminPage";
import SectionContainer from "../../../components/admin/hackathon-edit/SectionContainer";
import reimbursementApi from "../../../lib/reimbursementApi";
import {
  MAX_REVIEW_NOTE_LENGTH,
  PAYMENT_METHOD_LABELS,
  REIMBURSEMENT_METHOD_LABELS,
  REIMBURSEMENT_STATUSES,
  actionLabel,
  formatDollars,
  isNoteRequired,
  isOwnClaim,
  reviewActionsFor,
  statusLabel,
} from "../../../lib/reimbursementValidation";

// Admin review of reimbursement requests. Gated on volunteer.admin, same
// as the other admin list pages. The backend enforces the status
// transitions and the no-self-approval rule server-side; this page mirrors
// both so reviewers never see a dead button.

// Backend rows are snake_case; tolerate camelCase too.
const pick = (row, snake, camel) => row?.[snake] ?? row?.[camel] ?? "";
const rowReferenceId = (row) => pick(row, "reference_id", "referenceId");
const rowSubmitterName = (row) => pick(row, "submitter_name", "submitterName");
const rowSubmitterEmail = (row) =>
  pick(row, "submitter_email", "submitterEmail");
const rowExpenseDate = (row) => pick(row, "expense_date", "expenseDate");
const rowAmountCents = (row) => pick(row, "amount_cents", "amountCents");
const rowSubmittedAt = (row) =>
  pick(row, "created_at", "createdAt") ||
  pick(row, "submitted_at", "submittedAt");
const rowEventId = (row) => pick(row, "event_id", "eventId");
// The backend nests the receipt: { receipt: { final_url, filename,
// content_type, size_bytes } }. Reading flat receipt_url keys meant the
// dialog always said "No receipt link on file".
const rowReceipt = (row) => row?.receipt || {};
const rowReceiptUrl = (row) =>
  pick(rowReceipt(row), "final_url", "finalUrl") ||
  pick(row, "receipt_url", "receiptUrl");
const rowReceiptFilename = (row) =>
  rowReceipt(row).filename || pick(row, "receipt_filename", "receiptFilename");
const rowReceiptIsImage = (row) =>
  String(pick(rowReceipt(row), "content_type", "contentType")).startsWith(
    "image/",
  );

// One request, filtered on screen: the status chips and event options stay
// stable while a filter is on (they used to be built from the filtered rows,
// so picking a status hid every other chip).
const FETCH_LIMIT = 200;

const statusColor = (status) => {
  switch (status) {
    case "approved":
    case "paid":
      return "success";
    case "denied":
      return "error";
    case "needs_info":
    case "under_review":
      return "warning";
    default:
      return "default";
  }
};

const AdminReimbursementsPage = withRequiredAuthInfo(({ userClass }) => {
  const { accessToken, user } = useAuthInfo();
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const [eventFilter, setEventFilter] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [reviewNote, setReviewNote] = useState("");
  const [reviewBusy, setReviewBusy] = useState(false);
  const [noteError, setNoteError] = useState("");

  const org = userClass.getOrgByName("Opportunity Hack Org");
  const isAdmin = org.hasPermission("volunteer.admin");
  const orgId = org.orgId;
  const reviewerEmail = user?.email || "";
  const accessTokenRef = useRef(accessToken);
  accessTokenRef.current = accessToken;

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const data = await reimbursementApi.listAdmin(
        { limit: FETCH_LIMIT, offset: 0 },
        accessTokenRef.current,
        orgId,
      );
      setRows(data.data || []);
      setCount(data.count ?? (data.data || []).length);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Failed to load reimbursements.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  // Keyed on token PRESENCE: PropelAuth rotates the token on tab refocus,
  // and refetching then would reload the table under an open review.
  const hasToken = Boolean(accessToken);
  useEffect(() => {
    if (isAdmin && hasToken) fetchRows();
  }, [isAdmin, hasToken, fetchRows]);

  const openDetail = async (row) => {
    setSelected(row);
    setReviewNote("");
    setNoteError("");
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const full = await reimbursementApi.getAdmin(
        row.id,
        accessTokenRef.current,
        orgId,
      );
      setSelected(full?.data || full || row);
    } catch (error) {
      // Fall back to the list row; the table already carries the key fields.
      setSnackbar({
        open: true,
        message: "Could not load the full detail. Showing the list row.",
        severity: "warning",
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleReview = async (targetStatus) => {
    if (!selected) return;
    if (isNoteRequired(targetStatus) && !reviewNote.trim()) {
      setNoteError(
        `Add a note saying why before you ${actionLabel(targetStatus).toLowerCase()}.`,
      );
      return;
    }
    setNoteError("");
    setReviewBusy(true);
    try {
      await reimbursementApi.reviewAdmin(
        selected.id,
        { status: targetStatus, reviewNote: reviewNote.trim() || undefined },
        accessTokenRef.current,
        orgId,
      );
      setSnackbar({
        open: true,
        message: `Marked ${statusLabel(targetStatus).toLowerCase()}.`,
        severity: "success",
      });
      setDetailOpen(false);
      setSelected(null);
      fetchRows();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Could not update that reimbursement.",
        severity: "error",
      });
    } finally {
      setReviewBusy(false);
    }
  };

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  const statusCounts = rows.reduce((acc, row) => {
    const s = row.status || "submitted";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const eventOptions = [...new Set(rows.map(rowEventId).filter(Boolean))];

  const visibleRows = useMemo(
    () =>
      rows.filter(
        (row) =>
          (statusFilter === "all" ||
            (row.status || "submitted") === statusFilter) &&
          (!eventFilter || rowEventId(row) === eventFilter),
      ),
    [rows, statusFilter, eventFilter],
  );
  const openTotalCents = rows
    .filter((row) => !["paid", "denied"].includes(row.status))
    .reduce((sum, row) => sum + (Number(rowAmountCents(row)) || 0), 0);

  if (!isAdmin) {
    return (
      <AdminPage title="Reimbursements" isAdmin={false}>
        <Typography>You do not have permission to view this page.</Typography>
      </AdminPage>
    );
  }

  const detailActions = selected
    ? reviewActionsFor(
        {
          status: selected.status,
          submitterEmail: rowSubmitterEmail(selected),
        },
        reviewerEmail,
      )
    : [];
  const ownClaim =
    selected && isOwnClaim(reviewerEmail, rowSubmitterEmail(selected));
  const history =
    selected?.status_history ||
    selected?.statusHistory ||
    selected?.history ||
    [];

  return (
    <AdminPage
      title="Reimbursements"
      snackbar={snackbar}
      onSnackbarClose={handleSnackbarClose}
      isAdmin={isAdmin}
    >
      <SectionContainer title="Reimbursement requests">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Requests from people who bought food out of pocket for Opportunity
          Hack events. Review the receipt and business purpose, then approve,
          deny, or ask for more detail. You cannot review your own claim.
        </Typography>

        {/* Summary chips */}
        <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Chip
            label={`Total: ${count}`}
            variant={statusFilter === "all" ? "filled" : "outlined"}
            onClick={() => setStatusFilter("all")}
          />
          {Object.entries(statusCounts).map(([status, n]) => (
            <Chip
              key={status}
              label={`${statusLabel(status)}: ${n}`}
              color={statusColor(status)}
              variant={statusFilter === status ? "filled" : "outlined"}
              onClick={() =>
                setStatusFilter(statusFilter === status ? "all" : status)
              }
            />
          ))}
          {openTotalCents > 0 && (
            <Chip
              variant="outlined"
              label={`Not yet paid: ${formatDollars(openTotalCents)}`}
            />
          )}
        </Box>
        {count > rows.length && (
          <Typography variant="body2" color="warning.main" sx={{ mb: 2 }}>
            Showing the newest {rows.length} of {count} requests.
          </Typography>
        )}

        <Box sx={{ mb: 3, width: "100%" }}>
          <Grid container spacing={2} alignItems="center">
            <Grid>
              <Button onClick={fetchRows} variant="outlined">
                Refresh Data
              </Button>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All statuses</MenuItem>
                {REIMBURSEMENT_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {statusLabel(status)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                label="Event"
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
              >
                <MenuItem value="">All events</MenuItem>
                {eventOptions.map((eventId) => (
                  <MenuItem key={eventId} value={eventId}>
                    {eventId}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : visibleRows.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {rows.length === 0
              ? "No reimbursement requests yet."
              : "No reimbursement requests match these filters."}
          </Typography>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Reference ID</TableCell>
                  <TableCell>Submitter</TableCell>
                  <TableCell>Purchase date</TableCell>
                  <TableCell>Vendor</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleRows.map((row) => (
                  <TableRow key={row.id || rowReferenceId(row)} hover>
                    <TableCell>{rowReferenceId(row)}</TableCell>
                    <TableCell>
                      {rowSubmitterName(row)}
                      <br />
                      <Typography variant="body2" color="text.secondary">
                        {rowSubmitterEmail(row)}
                      </Typography>
                    </TableCell>
                    <TableCell>{rowExpenseDate(row)}</TableCell>
                    <TableCell>{row.vendor}</TableCell>
                    <TableCell align="right">
                      {formatDollars(rowAmountCents(row))}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={statusLabel(row.status)}
                        color={statusColor(row.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {rowSubmittedAt(row)
                        ? new Date(rowSubmittedAt(row)).toLocaleDateString()
                        : ""}
                    </TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => openDetail(row)}>
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </SectionContainer>

      {/* ---- Detail dialog ---- */}
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Reimbursement {selected ? rowReferenceId(selected) : ""}
        </DialogTitle>
        <DialogContent dividers>
          {detailLoading || !selected ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ display: "grid", gap: 2 }}>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Chip
                  label={statusLabel(selected.status)}
                  color={statusColor(selected.status)}
                />
                <Chip label={formatDollars(rowAmountCents(selected))} />
                {rowEventId(selected) && (
                  <Chip label={`Event: ${rowEventId(selected)}`} />
                )}
              </Box>
              {ownClaim && (
                <Typography variant="body2" color="warning.main">
                  This is your claim, so you cannot review it. Another admin
                  needs to approve, deny, or pay it.
                </Typography>
              )}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2">Submitter</Typography>
                  <Typography variant="body2">
                    {rowSubmitterName(selected)}
                    <br />
                    <a
                      href={`mailto:${rowSubmitterEmail(selected)}?subject=${encodeURIComponent(
                        `Your Opportunity Hack reimbursement ${rowReferenceId(selected)}`,
                      )}`}
                    >
                      {rowSubmitterEmail(selected)}
                    </a>
                    {pick(selected, "phone", "phone") &&
                      ` · ${pick(selected, "phone", "phone")}`}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2">Purchase</Typography>
                  <Typography variant="body2">
                    {rowExpenseDate(selected)} · {selected.vendor}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2">Paid with</Typography>
                  <Typography variant="body2">
                    {PAYMENT_METHOD_LABELS[
                      pick(selected, "payment_method", "paymentMethod")
                    ] ||
                      pick(selected, "payment_method", "paymentMethod") ||
                      "—"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2">Pay back by</Typography>
                  <Typography variant="body2">
                    {REIMBURSEMENT_METHOD_LABELS[
                      pick(
                        selected,
                        "reimbursement_method",
                        "reimbursementMethod",
                      )
                    ] ||
                      pick(
                        selected,
                        "reimbursement_method",
                        "reimbursementMethod",
                      ) ||
                      "—"}
                  </Typography>
                </Grid>
              </Grid>
              <Box>
                <Typography variant="subtitle2">Business purpose</Typography>
                <Typography variant="body2">
                  {pick(selected, "business_purpose", "businessPurpose") || "—"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">Who this food fed</Typography>
                <Typography variant="body2">
                  {pick(selected, "fed_description", "fedDescription") || "—"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">Receipt</Typography>
                {rowReceiptUrl(selected) ? (
                  <>
                    {/* Inline so the reviewer checks the line items against
                        the amount without leaving the dialog. Plain <img>:
                        this is an authed admin dialog, not a CWV surface. */}
                    {rowReceiptIsImage(selected) && (
                      <Box
                        component="a"
                        href={rowReceiptUrl(selected)}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ display: "block", mt: 1 }}
                      >
                        <Box
                          component="img"
                          src={rowReceiptUrl(selected)}
                          alt={`Receipt from ${selected.vendor || "vendor"}`}
                          sx={{
                            display: "block",
                            maxWidth: "100%",
                            maxHeight: 420,
                            minHeight: 120,
                            objectFit: "contain",
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1,
                          }}
                        />
                      </Box>
                    )}
                    <Button
                      component="a"
                      href={rowReceiptUrl(selected)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open receipt in a new tab
                      {rowReceiptFilename(selected)
                        ? ` (${rowReceiptFilename(selected)})`
                        : ""}
                    </Button>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No receipt link on file.
                  </Typography>
                )}
              </Box>
              {history.length > 0 && (
                <Box>
                  <Typography variant="subtitle2">Status history</Typography>
                  {history.map((entry, i) => (
                    <Typography key={i} variant="body2">
                      {statusLabel(entry.status)} —{" "}
                      {entry.at || entry.timestamp || entry.created_at
                        ? new Date(
                            entry.at || entry.timestamp || entry.created_at,
                          ).toLocaleString()
                        : ""}
                      {entry.by ? ` by ${entry.by}` : ""}
                      {entry.note ? ` — ${entry.note}` : ""}
                    </Typography>
                  ))}
                </Box>
              )}
              <TextField
                label="Review note"
                value={reviewNote}
                onChange={(e) => {
                  setReviewNote(e.target.value);
                  if (noteError) setNoteError("");
                }}
                multiline
                rows={2}
                fullWidth
                disabled={reviewBusy || ownClaim}
                error={!!noteError}
                inputProps={{ maxLength: MAX_REVIEW_NOTE_LENGTH }}
                helperText={
                  noteError ||
                  "Required to deny or ask for more info. Saved with the status change; only admins see it, so email the submitter yourself."
                }
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ flexWrap: "wrap", gap: 1, px: 3, pb: 2 }}>
          <Button onClick={() => setDetailOpen(false)} color="inherit">
            Close
          </Button>
          {detailActions.map((action) => (
            <Button
              key={action.status}
              onClick={() => handleReview(action.status)}
              variant="contained"
              disabled={reviewBusy || action.blocked}
              title={action.blockedReason || undefined}
              sx={
                action.status === "approved" || action.status === "paid"
                  ? { bgcolor: "#1B3A6B", "&:hover": { bgcolor: "#0E2547" } }
                  : undefined
              }
            >
              {actionLabel(action.status)}
            </Button>
          ))}
        </DialogActions>
      </Dialog>
    </AdminPage>
  );
});

export default AdminReimbursementsPage;
