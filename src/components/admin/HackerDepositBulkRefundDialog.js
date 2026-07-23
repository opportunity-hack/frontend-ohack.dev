import React, { useMemo, useState, useEffect } from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

const formatDollars = (cents) =>
  Number.isFinite(cents) ? `$${(cents / 100).toFixed(2)}` : "—";

// Three-phase flow: preview (show eligible list + confirm), running (spinner),
// done (per-row results). Splitting into discrete phases keeps the CTA
// unambiguous and lets the post-action results stay on screen until the admin
// closes — they can copy/paste the failure list if anything went wrong.
const HackerDepositBulkRefundDialog = ({
  open,
  onClose,
  eligibleHackers,
  eventId,
  apiServerUrl,
  accessToken,
  orgId,
  onComplete,
}) => {
  const [phase, setPhase] = useState("preview"); // preview | running | done
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setPhase("preview");
      setResult(null);
      setError("");
    }
  }, [open]);

  const totalCents = useMemo(
    () =>
      (eligibleHackers || []).reduce(
        (sum, h) => sum + (h.deposit_amount_cents || 0),
        0,
      ),
    [eligibleHackers],
  );

  const count = (eligibleHackers || []).length;

  const handleRun = async () => {
    if (!apiServerUrl || !accessToken) {
      setError("Missing API credentials. Refresh and try again.");
      return;
    }
    setPhase("running");
    setError("");
    try {
      const res = await fetch(
        `${apiServerUrl}/api/admin/hackathon/${eventId}/refund-eligible-deposits`,
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${accessToken}`,
            "content-type": "application/json",
            "X-Org-Id": orgId,
          },
          body: JSON.stringify({}),
        },
      );
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          payload?.message || payload?.error || `Bulk refund failed (${res.status})`,
        );
      }
      setResult(payload?.data || payload);
      setPhase("done");
      onComplete?.();
    } catch (e) {
      setError(e.message || "Bulk refund failed.");
      setPhase("preview");
    }
  };

  const renderPreview = () => (
    <>
      {count === 0 ? (
        <Alert severity="info">
          No hackers are eligible for refund right now. Eligible means deposit
          status is <strong>paid</strong> and disposition is{" "}
          <strong>refund</strong>. Donated and refund-failed rows are not
          included — handle those individually.
        </Alert>
      ) : (
        <>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <AlertTitle>This issues real Stripe refunds</AlertTitle>
            About to refund <strong>{count}</strong> hacker{count === 1 ? "" : "s"}{" "}
            for <strong>{formatDollars(totalCents)}</strong> total. Refunds
            typically settle in 5–10 business days and cannot be undone from
            this UI. Donated and refund-failed rows are excluded — handle
            those per-row.
          </Alert>
          <TableContainer
            sx={{ maxHeight: 360, border: "1px solid", borderColor: "divider" }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {eligibleHackers.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell>{h.name || "—"}</TableCell>
                    <TableCell>{h.email || "—"}</TableCell>
                    <TableCell align="right">
                      {formatDollars(h.deposit_amount_cents)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </>
  );

  const renderRunning = () => (
    <Box sx={{ textAlign: "center", py: 6 }}>
      <CircularProgress />
      <Typography sx={{ mt: 2 }}>
        Refunding {count} deposit{count === 1 ? "" : "s"}…
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Each refund is one Stripe API call. Don't close this window.
      </Typography>
    </Box>
  );

  const renderDone = () => {
    if (!result) return null;
    const refunded = result.refunded || [];
    const failed = result.failed || [];
    return (
      <Stack spacing={2}>
        <Alert severity={failed.length === 0 ? "success" : "warning"}>
          <AlertTitle>
            {failed.length === 0
              ? "All refunds succeeded"
              : `${refunded.length} refunded, ${failed.length} failed`}
          </AlertTitle>
          Total refunded: {formatDollars(result.total_amount_cents)}.{" "}
          {failed.length > 0 &&
            "Failed rows are listed below — retry from the per-row chip after investigating."}
        </Alert>

        {refunded.length > 0 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Refunded ({refunded.length})
            </Typography>
            <TableContainer
              sx={{
                maxHeight: 220,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Table size="small" stickyHeader>
                <TableBody>
                  {refunded.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.name}</TableCell>
                      <TableCell align="right">
                        {formatDollars(r.amount_cents)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          color="success"
                          label="Refunded"
                          sx={{ fontSize: "0.7rem" }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {failed.length > 0 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom color="error.main">
              Failed ({failed.length})
            </Typography>
            <TableContainer
              sx={{
                maxHeight: 220,
                border: "1px solid",
                borderColor: "error.light",
              }}
            >
              <Table size="small" stickyHeader>
                <TableBody>
                  {failed.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell sx={{ verticalAlign: "top" }}>
                        {f.name}
                      </TableCell>
                      <TableCell sx={{ color: "error.main", fontSize: "0.8rem" }}>
                        {f.error}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Stack>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={phase === "running" ? undefined : onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Bulk refund eligible deposits
        {eventId && (
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            {eventId}
          </Typography>
        )}
      </DialogTitle>
      <Divider />
      <DialogContent>
        {phase === "preview" && renderPreview()}
        {phase === "running" && renderRunning()}
        {phase === "done" && renderDone()}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={phase === "running"}>
          {phase === "done" ? "Done" : "Cancel"}
        </Button>
        {phase === "preview" && count > 0 && (
          <Button
            variant="contained"
            color="error"
            onClick={handleRun}
            disabled={!eventId}
          >
            Refund {count} deposit{count === 1 ? "" : "s"} ({formatDollars(totalCents)})
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default HackerDepositBulkRefundDialog;
