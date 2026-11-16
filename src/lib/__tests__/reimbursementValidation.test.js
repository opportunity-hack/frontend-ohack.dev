import {
  ALLOWED_TRANSITIONS,
  MAX_AMOUNT_DOLLARS,
  allowedNextStatuses,
  canTransition,
  centsToDollars,
  formatDollars,
  isActionBlockedForSelfApproval,
  isOwnClaim,
  reviewActionsFor,
  validateAmount,
  validateExpenseDate,
  validateReceiptFile,
  validateReimbursementForm,
} from "../reimbursementValidation";

const NOW = new Date("2026-11-16T12:00:00");

const validForm = () => ({
  submitterName: "Greg Vannoni",
  submitterEmail: "greg@example.org",
  phone: "",
  expenseDate: "2026-11-14",
  vendor: "Costco",
  amount: "125.50",
  eventId: "",
  businessPurpose: "Dinner for hackathon volunteers",
  fedDescription: "30 volunteers at the Fall Hackathon",
  paymentMethod: "personal_card",
  reimbursementMethod: "ach",
  attestation: true,
});

const validReceipt = { blobPath: "reimbursements/abc/receipt.pdf" };

describe("validateExpenseDate", () => {
  it("accepts a date within the last 120 days", () => {
    expect(validateExpenseDate("2026-11-14", NOW)).toBe("");
    expect(validateExpenseDate("2026-07-19", NOW)).toBe("");
  });
  it("rejects a future date", () => {
    expect(validateExpenseDate("2026-11-17", NOW)).toMatch(/future/);
  });
  it("rejects a date more than 120 days old", () => {
    expect(validateExpenseDate("2026-07-18", NOW)).toMatch(/120 days/);
  });
  it("requires a date", () => {
    expect(validateExpenseDate("", NOW)).toMatch(/required/);
  });
});

describe("validateAmount", () => {
  it("accepts a positive amount up to $10,000", () => {
    expect(validateAmount("0.01")).toBe("");
    expect(validateAmount(String(MAX_AMOUNT_DOLLARS))).toBe("");
  });
  it("rejects zero, negative, and over-limit amounts", () => {
    expect(validateAmount("0")).toMatch(/more than \$0/);
    expect(validateAmount("-5")).toMatch(/more than \$0/);
    expect(validateAmount("10000.01")).toMatch(/more than \$10,000/);
  });
});

describe("validateReceiptFile", () => {
  const file = (overrides) => ({
    name: "receipt.pdf",
    type: "application/pdf",
    size: 1024,
    ...overrides,
  });
  it("accepts images and PDFs under 10MB", () => {
    expect(validateReceiptFile(file())).toBe("");
    expect(
      validateReceiptFile(file({ name: "r.jpg", type: "image/jpeg" })),
    ).toBe("");
    expect(
      validateReceiptFile(file({ name: "r.webp", type: "image/webp" })),
    ).toBe("");
  });
  it("rejects other types and oversize files", () => {
    expect(
      validateReceiptFile(file({ name: "r.txt", type: "text/plain" })),
    ).toMatch(/JPG, PNG, WebP image or PDF/);
    expect(validateReceiptFile(file({ size: 11 * 1024 * 1024 }))).toMatch(
      /under 10MB/,
    );
  });
  it("requires a receipt", () => {
    expect(validateReceiptFile(null)).toMatch(/required/);
  });
});

describe("validateReimbursementForm", () => {
  it("passes a complete valid form", () => {
    expect(validateReimbursementForm(validForm(), validReceipt, NOW)).toEqual(
      {},
    );
  });
  it("flags missing name, bad email, missing purpose, and no attestation", () => {
    const errors = validateReimbursementForm(
      {
        ...validForm(),
        submitterName: " ",
        submitterEmail: "nope",
        attestation: false,
      },
      validReceipt,
      NOW,
    );
    expect(errors.submitterName).toMatch(/required/);
    expect(errors.submitterEmail).toMatch(/valid email/);
    expect(errors.attestation).toMatch(/attestation/);
  });
  it("requires a receipt", () => {
    const errors = validateReimbursementForm(validForm(), null, NOW);
    expect(errors.receipt).toMatch(/receipt is required/);
  });
  it("requires a real payment and reimbursement method", () => {
    const errors = validateReimbursementForm(
      { ...validForm(), paymentMethod: "cash?", reimbursementMethod: "" },
      validReceipt,
      NOW,
    );
    expect(errors.paymentMethod).toBeTruthy();
    expect(errors.reimbursementMethod).toBeTruthy();
  });
});

describe("status transitions", () => {
  it("allows exactly the contracted transitions", () => {
    expect(ALLOWED_TRANSITIONS.submitted).toEqual([
      "under_review",
      "needs_info",
      "approved",
      "denied",
    ]);
    expect(ALLOWED_TRANSITIONS.approved).toEqual(["paid"]);
    expect(ALLOWED_TRANSITIONS.paid).toEqual([]);
    expect(canTransition("submitted", "paid")).toBe(false);
    expect(canTransition("needs_info", "approved")).toBe(true);
    expect(canTransition("denied", "paid")).toBe(false);
    expect(allowedNextStatuses("bogus")).toEqual([]);
  });
});

describe("self-approval", () => {
  it("matches emails case-insensitively and ignores whitespace", () => {
    expect(isOwnClaim("Greg@Example.org", " greg@example.org ")).toBe(true);
    expect(isOwnClaim("a@example.org", "b@example.org")).toBe(false);
    expect(isOwnClaim("", "b@example.org")).toBe(false);
  });
  it("blocks approve and paid on own claims, nothing else", () => {
    expect(
      isActionBlockedForSelfApproval("approved", "a@x.org", "a@x.org"),
    ).toBe(true);
    expect(isActionBlockedForSelfApproval("paid", "a@x.org", "a@x.org")).toBe(
      true,
    );
    expect(isActionBlockedForSelfApproval("denied", "a@x.org", "a@x.org")).toBe(
      false,
    );
    expect(
      isActionBlockedForSelfApproval("approved", "a@x.org", "b@x.org"),
    ).toBe(false);
  });
  it("reviewActionsFor flags the blocked actions with a reason", () => {
    const actions = reviewActionsFor(
      { status: "submitted", submitterEmail: "a@x.org" },
      "a@x.org",
    );
    const approve = actions.find((a) => a.status === "approved");
    const underReview = actions.find((a) => a.status === "under_review");
    expect(approve.blocked).toBe(true);
    expect(approve.blockedReason).toMatch(/cannot approve/);
    expect(underReview.blocked).toBe(false);
    // A different reviewer sees no blocks.
    const others = reviewActionsFor(
      { status: "submitted", submitterEmail: "a@x.org" },
      "treasurer@x.org",
    );
    expect(others.every((a) => !a.blocked)).toBe(true);
  });
});

describe("money helpers", () => {
  it("converts cents to dollars and formats USD", () => {
    expect(centsToDollars(12550)).toBe(125.5);
    expect(centsToDollars(null)).toBeNull();
    expect(formatDollars(12550)).toBe("$125.50");
    expect(formatDollars(undefined)).toBe("");
  });
});
