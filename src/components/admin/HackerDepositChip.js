import React from "react";
import { Chip, Tooltip } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import ReplyIcon from "@mui/icons-material/Reply";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

// Derive the deposit display state from a hacker volunteer doc. Status priority:
//   1. refund_failed beats everything (sticky error until next attempt)
//   2. refunded
//   3. donated (disposition-driven while still in "paid")
//   4. paid
//   5. unpaid (no payment intent recorded)
export const getDepositState = (volunteer) => {
  const status = volunteer?.deposit_status;
  const piid = volunteer?.stripe_payment_intent_id;
  const disposition = volunteer?.deposit_disposition;
  const amountCents =
    volunteer?.deposit_refund_amount_cents ?? volunteer?.deposit_amount_cents;

  if (status === "refund_failed") return { kind: "refund_failed", amountCents };
  if (status === "refunded") return { kind: "refunded", amountCents };
  if (piid && disposition === "donate") return { kind: "donated", amountCents };
  if (piid) return { kind: "paid", amountCents };
  return { kind: "unpaid", amountCents: null };
};

const formatDollars = (cents) => {
  if (!Number.isFinite(cents)) return "";
  return `$${(cents / 100).toFixed(2)}`;
};

const CONFIG = {
  paid: {
    label: (cents) => `Paid ${formatDollars(cents)}`,
    color: "success",
    icon: <CheckCircleIcon fontSize="small" />,
    tooltip: "Deposit paid. Click to issue a refund.",
  },
  unpaid: {
    label: () => "Unpaid",
    color: "warning",
    icon: <WarningAmberIcon fontSize="small" />,
    tooltip:
      "Deposit required for this event but no payment recorded. Chase the hacker.",
  },
  donated: {
    label: (cents) => `Donated ${formatDollars(cents)}`,
    color: "primary",
    variant: "outlined",
    icon: <VolunteerActivismIcon fontSize="small" />,
    tooltip:
      "Hacker chose to donate their deposit. Click to override and refund anyway.",
  },
  refunded: {
    label: (cents) => `Refunded ${formatDollars(cents)}`,
    color: "default",
    icon: <ReplyIcon fontSize="small" />,
    tooltip: "Deposit was refunded. Click for details.",
  },
  refund_failed: {
    label: () => "Refund failed",
    color: "error",
    icon: <ErrorOutlineIcon fontSize="small" />,
    tooltip:
      "Stripe rejected the refund. Click to see the error and retry.",
  },
};

// Plain-text label for exports/printing (mirrors the chip text)
export const getDepositLabel = (volunteer) => {
  const state = getDepositState(volunteer);
  const cfg = CONFIG[state.kind];
  return cfg ? cfg.label(state.amountCents) : "";
};

const HackerDepositChip = ({ volunteer, onClick }) => {
  const state = getDepositState(volunteer);
  const cfg = CONFIG[state.kind];
  const clickable = state.kind !== "unpaid" || Boolean(onClick);
  const tooltip =
    state.kind === "refund_failed" && volunteer?.deposit_refund_status_msg
      ? `Stripe error: ${volunteer.deposit_refund_status_msg}`
      : cfg.tooltip;

  return (
    <Tooltip title={tooltip}>
      <Chip
        size="small"
        icon={cfg.icon}
        label={cfg.label(state.amountCents)}
        color={cfg.color}
        variant={cfg.variant || "filled"}
        onClick={clickable && onClick ? onClick : undefined}
        sx={{
          fontSize: "0.72rem",
          cursor: onClick ? "pointer" : "default",
        }}
      />
    </Tooltip>
  );
};

export default HackerDepositChip;
