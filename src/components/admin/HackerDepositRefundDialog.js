import React, { useState, useMemo } from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { getDepositState } from "./HackerDepositChip";

const formatDollars = (cents) =>
  Number.isFinite(cents) ? `$${(cents / 100).toFixed(2)}` : "—";

const formatTs = (ts) => {
  if (!ts) return "—";
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
};

// Centralizes the conditional copy and CTA wiring per deposit state. Returning
// JSX in this map keeps the render below flat and scannable.
const HackerDepositRefundDialog = ({
  open,
  onClose,
  volunteer,
  apiServerUrl,
  accessToken,
  orgId,
  onRefunded,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [overrideArmed, setOverrideArmed] = useState(false);

  const state = useMemo(
    () => (volunteer ? getDepositState(volunteer) : { kind: "unpaid" }),
    [volunteer],
  );

  // Reset state when the dialog opens for a different volunteer.
  React.useEffect(() => {
    if (open) {
      setError("");
      setOverrideArmed(false);
      setSubmitting(false);
    }
  }, [open, volunteer?.id]);

  if (!volunteer) return null;

  const isDonate = state.kind === "donated";
  const isRefunded = state.kind === "refunded";
  const isFailed = state.kind === "refund_failed";
  const isUnpaid = state.kind === "unpaid";
  const canRefund = !isUnpaid && !isRefunded;

  const handleRefund = async () => {
    if (!apiServerUrl || !accessToken) {
      setError("Missing API credentials. Refresh and try again.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(
        `${apiServerUrl}/api/admin/hacker/${volunteer.id}/refund-deposit`,
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${accessToken}`,
            "content-type": "application/json",
            "X-Org-Id": orgId,
          },
          body: JSON.stringify({ override: isDonate }),
        },
      );

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          payload?.message || payload?.error || `Refund failed (${res.status})`,
        );
      }
      onRefunded?.(payload?.data || payload);
      onClose();
    } catch (e) {
      setError(e.message || "Refund failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderSummary = () => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" color="text.secondary">
        Hacker
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 600 }}>
        {volunteer.name || volunteer.firstName || "(no name)"}
      </Typography>
      {volunteer.email && (
        <Typography variant="body2" color="text.secondary">
          {volunteer.email}
        </Typography>
      )}

      <Divider sx={{ my: 1.5 }} />

      <Stack direction="row" spacing={3} sx={{ flexWrap: "wrap" }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Deposit paid
          </Typography>
          <Typography variant="body1">
            {formatDollars(volunteer.deposit_amount_cents)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Hacker's choice
          </Typography>
          <Typography variant="body1">
            {volunteer.deposit_disposition === "donate"
              ? "Donate to OHack"
              : volunteer.deposit_disposition === "refund"
                ? "Refund after event"
                : "—"}
          </Typography>
        </Box>
        <Box sx={{ minWidth: 200 }}>
          <Typography variant="caption" color="text.secondary">
            Stripe PaymentIntent
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontFamily: "monospace", wordBreak: "break-all" }}
          >
            {volunteer.stripe_payment_intent_id || "—"}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );

  const renderAuditTrail = () => {
    if (!isRefunded && !isFailed) return null;
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Refund history
        </Typography>
        <Stack spacing={0.5}>
          {isRefunded && (
            <>
              <Typography variant="body2">
                Refunded {formatDollars(volunteer.deposit_refund_amount_cents)}{" "}
                on {formatTs(volunteer.deposit_refunded_at)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                By admin {volunteer.deposit_refunded_by || "—"}
              </Typography>
              {volunteer.deposit_refund_id && (
                <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                  {volunteer.deposit_refund_id}{" "}
                  <Link
                    href={`https://dashboard.stripe.com/refunds/${volunteer.deposit_refund_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    (view in Stripe)
                  </Link>
                </Typography>
              )}
            </>
          )}
          {isFailed && volunteer.deposit_refund_status_msg && (
            <Alert severity="error" variant="outlined" sx={{ mt: 1 }}>
              <AlertTitle>Last attempt failed</AlertTitle>
              {volunteer.deposit_refund_status_msg}
            </Alert>
          )}
        </Stack>
      </Box>
    );
  };

  const renderActionArea = () => {
    if (isUnpaid) {
      return (
        <Alert severity="info">
          No deposit recorded for this hacker. Nothing to refund.
        </Alert>
      );
    }

    if (isRefunded) {
      return (
        <Alert severity="success">
          This deposit has already been refunded.
        </Alert>
      );
    }

    if (isDonate && !overrideArmed) {
      return (
        <Alert severity="warning" variant="outlined">
          <AlertTitle>Hacker chose to donate</AlertTitle>
          We don't normally refund donations. If you have a specific reason
          (financial hardship, admin error), you can override this and issue a
          refund anyway.
          <Box sx={{ mt: 1.5 }}>
            <Button
              size="small"
              color="error"
              variant="outlined"
              onClick={() => setOverrideArmed(true)}
            >
              I understand — let me refund anyway
            </Button>
          </Box>
        </Alert>
      );
    }

    return (
      <Alert severity="warning">
        <AlertTitle>This issues a real Stripe refund</AlertTitle>
        Clicking "Refund {formatDollars(volunteer.deposit_amount_cents)}" sends
        the money back to the hacker's card via Stripe. Refunds typically settle
        in 5–10 business days and cannot be undone from this UI.
      </Alert>
    );
  };

  const refundButtonVisible =
    canRefund && (!isDonate || overrideArmed) && !isRefunded;

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Hacker deposit</DialogTitle>
      <DialogContent dividers>
        {renderSummary()}
        {renderActionArea()}
        {renderAuditTrail()}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Close
        </Button>
        {refundButtonVisible && (
          <Button
            variant="contained"
            color={isDonate ? "error" : "primary"}
            onClick={handleRefund}
            disabled={submitting}
            startIcon={
              submitting ? <CircularProgress size={16} /> : null
            }
          >
            {isFailed
              ? "Retry refund"
              : isDonate
                ? `Override — refund ${formatDollars(volunteer.deposit_amount_cents)}`
                : `Refund ${formatDollars(volunteer.deposit_amount_cents)}`}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default HackerDepositRefundDialog;
