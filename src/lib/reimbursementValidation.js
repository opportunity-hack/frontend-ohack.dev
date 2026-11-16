/**
 * Pure helpers for the reimbursement flow (public form + admin review).
 *
 * Kept free of React and network calls so Jest can cover them directly.
 * Rules mirror the backend accountable-plan checks: amount > 0 and
 * <= $10,000, expense date not in the future and not more than 120 days
 * old, and an itemized receipt is required.
 */

// ---- Statuses -------------------------------------------------------------

export const REIMBURSEMENT_STATUSES = [
  "submitted",
  "under_review",
  "approved",
  "paid",
  "denied",
  "needs_info",
];

export const REIMBURSEMENT_STATUS_LABELS = {
  submitted: "Submitted",
  under_review: "Under review",
  approved: "Approved",
  paid: "Paid",
  denied: "Denied",
  needs_info: "Needs info",
};

export const statusLabel = (status) =>
  REIMBURSEMENT_STATUS_LABELS[status] || status || "Unknown";

// Allowed transitions, per the API contract. The backend enforces these
// server-side; the UI mirrors them so reviewers never see a dead button.
export const ALLOWED_TRANSITIONS = {
  submitted: ["under_review", "needs_info", "approved", "denied"],
  under_review: ["approved", "denied", "needs_info", "submitted"],
  needs_info: ["under_review", "approved", "denied"],
  approved: ["paid"],
  denied: ["under_review"],
  paid: [],
};

export const allowedNextStatuses = (status) => [
  ...(ALLOWED_TRANSITIONS[status] || []),
];

/** True when the reviewer may move a claim from `from` to `to`. */
export const canTransition = (from, to) =>
  (ALLOWED_TRANSITIONS[from] || []).includes(to);

// ---- Self-approval --------------------------------------------------------

// Neither the treasurer nor the president may approve their own claim.
// The backend enforces this server-side; the UI disables the actions too.
export const isOwnClaim = (reviewerEmail, submitterEmail) => {
  if (!reviewerEmail || !submitterEmail) return false;
  return (
    String(reviewerEmail).trim().toLowerCase() ===
    String(submitterEmail).trim().toLowerCase()
  );
};

// Approve and Mark paid both move money, so both are blocked on own claims.
// The other transitions (under review, needs info, deny, back to submitted)
// stay available so a reviewer can still triage their own claim.
export const SELF_APPROVAL_BLOCKED_STATUSES = ["approved", "paid"];

export const isActionBlockedForSelfApproval = (
  targetStatus,
  reviewerEmail,
  submitterEmail,
) =>
  SELF_APPROVAL_BLOCKED_STATUSES.includes(targetStatus) &&
  isOwnClaim(reviewerEmail, submitterEmail);

/**
 * The review actions shown for one claim: every allowed transition, with
 * approve/paid flagged when the reviewer is the submitter.
 * Returns [{ status, label, blocked, blockedReason }].
 */
export const reviewActionsFor = (claim, reviewerEmail) => {
  const current = claim?.status;
  const submitterEmail = claim?.submitterEmail || claim?.submitter_email;
  return allowedNextStatuses(current).map((status) => {
    const blocked = isActionBlockedForSelfApproval(
      status,
      reviewerEmail,
      submitterEmail,
    );
    return {
      status,
      label: actionLabel(status),
      blocked,
      blockedReason: blocked
        ? "You submitted this claim, so you cannot approve or pay it. Another admin needs to review it."
        : "",
    };
  });
};

export const actionLabel = (status) => {
  switch (status) {
    case "under_review":
      return "Mark under review";
    case "approved":
      return "Approve";
    case "denied":
      return "Deny";
    case "needs_info":
      return "Needs info";
    case "paid":
      return "Mark paid";
    case "submitted":
      return "Back to submitted";
    default:
      return statusLabel(status);
  }
};

// ---- Money ----------------------------------------------------------------

/** Backend stores cents; the UI shows dollars. */
export const centsToDollars = (cents) => {
  if (cents === null || cents === undefined || Number.isNaN(Number(cents)))
    return null;
  return Number(cents) / 100;
};

export const formatDollars = (cents) => {
  const dollars = centsToDollars(cents);
  if (dollars === null) return "";
  return dollars.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
};

// ---- Form validation ------------------------------------------------------

export const MAX_AMOUNT_DOLLARS = 10000;
export const MAX_EXPENSE_AGE_DAYS = 120;
export const MAX_RECEIPT_BYTES = 10 * 1024 * 1024;

export const ACCEPTED_RECEIPT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());

/**
 * Validate an expense date string (YYYY-MM-DD). `now` is injectable so
 * tests can pin the clock. Returns an error string or "".
 */
export const validateExpenseDate = (dateString, now = new Date()) => {
  if (!dateString) return "Expense date is required";
  const parsed = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(parsed.getTime()))
    return "Enter a valid expense date (YYYY-MM-DD)";
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  if (parsed > today) return "Expense date cannot be in the future";
  const oldest = new Date(today);
  oldest.setDate(oldest.getDate() - MAX_EXPENSE_AGE_DAYS);
  if (parsed < oldest)
    return `Expense date cannot be more than ${MAX_EXPENSE_AGE_DAYS} days old`;
  return "";
};

export const validateAmount = (amount) => {
  if (amount === "" || amount === null || amount === undefined)
    return "Amount is required";
  const value = Number(amount);
  if (Number.isNaN(value)) return "Amount must be a number";
  if (value <= 0) return "Amount must be more than $0";
  if (value > MAX_AMOUNT_DOLLARS)
    return `Amount cannot be more than $${MAX_AMOUNT_DOLLARS.toLocaleString()}`;
  return "";
};

export const validateReceiptFile = (file) => {
  if (!file) return "An itemized receipt is required";
  if (
    !ACCEPTED_RECEIPT_TYPES.includes(file.type) &&
    !/\.(jpe?g|png|webp|pdf)$/i.test(file.name || "")
  )
    return "Receipt must be a JPG, PNG, WebP image or PDF";
  if (file.size > MAX_RECEIPT_BYTES) return "Receipt must be under 10MB";
  return "";
};

/**
 * Validate the whole public form. `form` uses the camelCase field names
 * from the API contract; `receipt` is { file, blobPath } once uploaded.
 * Returns an errors object keyed by field (empty = valid).
 */
export const validateReimbursementForm = (form, receipt, now = new Date()) => {
  const errors = {};
  if (!form.submitterName?.trim())
    errors.submitterName = "Your name is required";
  if (!form.submitterEmail?.trim()) {
    errors.submitterEmail = "Email is required";
  } else if (!isValidEmail(form.submitterEmail)) {
    errors.submitterEmail = "Please enter a valid email address";
  }
  if (form.phone && !/^[\d\s()+\-.]{7,}$/.test(form.phone.trim()))
    errors.phone = "Please enter a valid phone number";
  const dateError = validateExpenseDate(form.expenseDate, now);
  if (dateError) errors.expenseDate = dateError;
  if (!form.vendor?.trim()) errors.vendor = "Vendor is required";
  const amountError = validateAmount(form.amount);
  if (amountError) errors.amount = amountError;
  if (!form.businessPurpose?.trim())
    errors.businessPurpose = "Business purpose is required";
  if (!form.fedDescription?.trim())
    errors.fedDescription = "Tell us who this food fed";
  if (!["personal_card", "personal_cash", "other"].includes(form.paymentMethod))
    errors.paymentMethod = "How did you pay?";
  if (!["ach", "check"].includes(form.reimbursementMethod))
    errors.reimbursementMethod = "How should we pay you back?";
  if (!form.attestation)
    errors.attestation = "Please confirm the attestation to submit";
  if (!receipt?.blobPath) {
    errors.receipt = receipt?.file
      ? validateReceiptFile(receipt.file)
      : "An itemized receipt is required";
  }
  return errors;
};
