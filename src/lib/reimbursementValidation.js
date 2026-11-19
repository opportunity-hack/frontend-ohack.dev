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

// One plain sentence per status for the public lookup: what it means and
// what, if anything, the submitter should do.
const STATUS_HINTS = {
  submitted: "We have your request. The treasurer has not opened it yet.",
  under_review: "The treasurer is reviewing your receipt.",
  needs_info:
    "We need more detail. Check your email for a note from the treasurer.",
  approved: "Approved. The treasurer will be in touch to arrange your payment.",
  paid: "Paid. Thank you for helping feed the event.",
  denied:
    "This request was not approved. Reply to the treasurer's email if you have questions.",
};
export const statusHint = (status) => STATUS_HINTS[status] || "";

export const PAYMENT_METHOD_LABELS = {
  personal_card: "Personal card",
  personal_cash: "Personal cash",
  other: "Other",
};
export const REIMBURSEMENT_METHOD_LABELS = {
  zelle: "Zelle",
  venmo: "Venmo",
  paypal: "PayPal",
  ach: "Direct deposit (ACH)",
  check: "Check",
};
// Order shown in the form: the app payouts first (most people's pick and
// the fastest to send), then the two that need a follow-up.
export const REIMBURSEMENT_METHODS = Object.keys(REIMBURSEMENT_METHOD_LABELS);

// ---- Payment-app payouts ---------------------------------------------------

// Twin of the backend's PAYOUT_APP_METHODS / validate_payout. A PayPal /
// Venmo / Zelle handle is something people hand out to be paid, so it is
// collected here; bank account and routing numbers never are.
export const PAYOUT_APP_METHODS = ["zelle", "venmo", "paypal"];
export const isPayoutAppMethod = (method) =>
  PAYOUT_APP_METHODS.includes(method);

const PAYOUT_FIELD_COPY = {
  zelle: {
    label: "Zelle email or mobile number",
    placeholder: "you@example.com or 480-555-0100",
    helper: "The email or mobile number enrolled with Zelle at your bank.",
  },
  venmo: {
    label: "Venmo username",
    placeholder: "@your-name",
    helper: "Your @username, shown under your name in the Venmo app.",
  },
  paypal: {
    label: "PayPal email or mobile number",
    placeholder: "you@example.com or 480-555-0100",
    helper: "The email or mobile number on your PayPal account.",
  },
};
export const payoutFieldCopy = (method) => PAYOUT_FIELD_COPY[method] || null;

const VENMO_RE = /^@?[A-Za-z0-9][A-Za-z0-9_-]{4,29}$/;
const phoneDigits = (value) =>
  /^\+?[\d\s().-]+$/.test(value) ? value.replace(/\D/g, "") : "";

/** Error string or "" for one payout handle under `method`. */
export const validatePayoutHandle = (method, handle) => {
  const value = String(handle || "").trim();
  if (!value) return "This is required so we know where to send your money";
  if (method === "venmo")
    return VENMO_RE.test(value)
      ? ""
      : "Enter your Venmo username, like @your-name (5 to 30 letters, numbers, - or _)";
  if (value.includes("@"))
    return isValidEmail(value) ? "" : "Enter a valid email address";
  const digits = phoneDigits(value);
  return digits.length >= 10 && digits.length <= 15
    ? ""
    : "Enter a valid email address or a mobile number with area code";
};

// Compare the way the backend stores them, so "480-555-0100" typed once
// and "4805550100" typed again still count as the same destination.
const canonicalHandle = (method, handle) => {
  const value = String(handle || "").trim();
  if (method === "venmo") return value.replace(/^@/, "").toLowerCase();
  if (value.includes("@")) return value.toLowerCase();
  return phoneDigits(value);
};

/**
 * Errors for the payout block (empty object = valid, or not an app method).
 * The handle is typed twice: these sends cannot be pulled back, so a typo
 * pays a stranger.
 */
export const validatePayout = (form) => {
  const errors = {};
  const method = form.reimbursementMethod;
  if (!isPayoutAppMethod(method)) return errors;
  const handleError = validatePayoutHandle(method, form.payoutHandle);
  if (handleError) errors.payoutHandle = handleError;
  if (!String(form.payoutHandleConfirm || "").trim()) {
    errors.payoutHandleConfirm = "Type it again to confirm";
  } else if (
    !handleError &&
    canonicalHandle(method, form.payoutHandle) !==
      canonicalHandle(method, form.payoutHandleConfirm)
  ) {
    errors.payoutHandleConfirm = "The two entries do not match";
  }
  if (!String(form.payoutAccountName || "").trim())
    errors.payoutAccountName = "Enter the name shown on the account";
  if (
    method === "venmo" &&
    form.payoutPhoneLast4 &&
    !/^\d{4}$/.test(String(form.payoutPhoneLast4).trim())
  )
    errors.payoutPhoneLast4 = "Enter the last 4 digits only";
  return errors;
};

/** The payout fields to send with the claim ({} for ACH / check). */
export const payoutPayload = (form) => {
  if (!isPayoutAppMethod(form.reimbursementMethod)) return {};
  const last4 = String(form.payoutPhoneLast4 || "").trim();
  return {
    payoutHandle: String(form.payoutHandle || "").trim(),
    payoutAccountName: String(form.payoutAccountName || "").trim(),
    ...(form.reimbursementMethod === "venmo" && last4
      ? { payoutPhoneLast4: last4 }
      : {}),
  };
};

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

// The backend refuses EVERY change a reviewer makes to their own claim
// (403 self_approval, status moves and notes alike), so every action is
// blocked here too. Showing "triage" buttons that always 403 was the bug.
export const isActionBlockedForSelfApproval = (
  targetStatus,
  reviewerEmail,
  submitterEmail,
) => isOwnClaim(reviewerEmail, submitterEmail);

// Denying or asking for more detail without saying why leaves the next
// reviewer (and the submitter, who is emailed by hand) guessing.
export const NOTE_REQUIRED_STATUSES = ["denied", "needs_info"];
export const isNoteRequired = (targetStatus) =>
  NOTE_REQUIRED_STATUSES.includes(targetStatus);

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
        ? "You submitted this claim, so you cannot review it. Another admin needs to."
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

// Mirrors the backend's MAX_FIELD_LENGTHS / MAX_REVIEW_NOTE_LENGTH.
export const MAX_FIELD_LENGTHS = {
  submitterName: 200,
  submitterEmail: 254,
  phone: 40,
  vendor: 200,
  businessPurpose: 2000,
  fedDescription: 2000,
  payoutHandle: 254,
  payoutAccountName: 200,
};
export const MAX_PAYMENT_REFERENCE_LENGTH = 200;
export const MAX_REVIEW_NOTE_LENGTH = 2000;

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
  if (Math.abs(value * 100 - Math.round(value * 100)) > 1e-6)
    return "Amount can have at most two decimal places";
  return "";
};

export const validateReceiptFile = (file) => {
  if (!file) return "An itemized receipt is required";
  // The MIME type is what the upload sends and the backend checks, so a
  // matching extension alone is not enough.
  if (!ACCEPTED_RECEIPT_TYPES.includes(file.type))
    return "Receipt must be a JPG, PNG, WebP image or PDF";
  if (file.size <= 0) return "That file is empty. Choose the receipt again.";
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
  if (!REIMBURSEMENT_METHODS.includes(form.reimbursementMethod))
    errors.reimbursementMethod = "How should we pay you back?";
  Object.assign(errors, validatePayout(form));
  if (!form.attestation)
    errors.attestation = "Please confirm the attestation to submit";
  if (!receipt?.blobPath) {
    errors.receipt = receipt?.file
      ? validateReceiptFile(receipt.file)
      : "An itemized receipt is required";
  }
  return errors;
};
