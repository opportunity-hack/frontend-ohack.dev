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
  payoutPayload,
  validatePayout,
  validatePayoutHandle,
} from "../reimbursementValidation";

describe("payment-app payouts", () => {
  const app = (method, handle, extra = {}) => ({
    reimbursementMethod: method,
    payoutHandle: handle,
    payoutHandleConfirm: handle,
    payoutAccountName: "Ada Lovelace",
    payoutPhoneLast4: "",
    ...extra,
  });

  it("accepts the handle shapes each app uses", () => {
    expect(validatePayoutHandle("venmo", "@ada-lovelace")).toBe("");
    expect(validatePayoutHandle("venmo", "ada_lovelace")).toBe("");
    expect(validatePayoutHandle("zelle", "ada@example.com")).toBe("");
    expect(validatePayoutHandle("zelle", "(480) 555-0100")).toBe("");
    expect(validatePayoutHandle("paypal", "+1 480 555 0100")).toBe("");
  });

  it("rejects malformed handles", () => {
    expect(validatePayoutHandle("venmo", "ab")).toMatch(/Venmo username/);
    expect(validatePayoutHandle("venmo", "ada lovelace")).toMatch(/Venmo/);
    expect(validatePayoutHandle("zelle", "555-0100")).toMatch(/area code/);
    expect(validatePayoutHandle("paypal", "ada@nowhere")).toMatch(/email/);
    expect(validatePayoutHandle("zelle", "")).toMatch(/required/);
  });

  it("needs the handle typed twice, compared the way it is stored", () => {
    expect(validatePayout(app("venmo", "@ada-lovelace"))).toEqual({});
    expect(
      validatePayout(
        app("zelle", "480-555-0100", { payoutHandleConfirm: "4805550100" }),
      ),
    ).toEqual({});
    expect(
      validatePayout(
        app("venmo", "@ada-lovelace", { payoutHandleConfirm: "ADA-LOVELACE" }),
      ),
    ).toEqual({});
    expect(
      validatePayout(
        app("zelle", "480-555-0100", { payoutHandleConfirm: "480-555-0101" }),
      ).payoutHandleConfirm,
    ).toMatch(/do not match/);
    expect(
      validatePayout(app("zelle", "a@b.co", { payoutHandleConfirm: "" }))
        .payoutHandleConfirm,
    ).toMatch(/again/);
  });

  it("needs the name on the account and a 4-digit Venmo last4", () => {
    expect(
      validatePayout(app("paypal", "a@b.co", { payoutAccountName: " " }))
        .payoutAccountName,
    ).toMatch(/name shown/);
    expect(
      validatePayout(app("venmo", "@ada-lovelace", { payoutPhoneLast4: "12" }))
        .payoutPhoneLast4,
    ).toMatch(/4 digits/);
  });

  it("asks nothing extra for ACH or check and sends no payout fields", () => {
    expect(validatePayout({ reimbursementMethod: "ach" })).toEqual({});
    expect(
      payoutPayload({ reimbursementMethod: "check", payoutHandle: "@stale" }),
    ).toEqual({});
  });

  it("sends only the fields the backend reads, never the confirm entry", () => {
    expect(
      payoutPayload(
        app("venmo", " @ada-lovelace ", { payoutPhoneLast4: "0100" }),
      ),
    ).toEqual({
      payoutHandle: "@ada-lovelace",
      payoutAccountName: "Ada Lovelace",
      payoutPhoneLast4: "0100",
    });
    expect(
      payoutPayload(app("zelle", "a@b.co", { payoutPhoneLast4: "0100" })),
    ).toEqual({ payoutHandle: "a@b.co", payoutAccountName: "Ada Lovelace" });
  });

  it("the whole form fails without payout details for an app method", () => {
    const errors = validateReimbursementForm(
      { ...validForm(), reimbursementMethod: "venmo" },
      validReceipt,
      NOW,
    );
    expect(Object.keys(errors).sort()).toEqual([
      "payoutAccountName",
      "payoutHandle",
      "payoutHandleConfirm",
    ]);
  });
});

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
  it("blocks every action on own claims, like the backend", () => {
    for (const status of ["approved", "paid", "denied", "under_review"]) {
      expect(isActionBlockedForSelfApproval(status, "a@x.org", "a@x.org")).toBe(
        true,
      );
    }
    expect(
      isActionBlockedForSelfApproval("approved", "a@x.org", "b@x.org"),
    ).toBe(false);
  });
  it("rejects more than two decimals, typeless and empty receipts", () => {
    expect(validateAmount("12.345")).toMatch(/two decimal/);
    expect(validateAmount("19.99")).toBe("");
    expect(validateReceiptFile({ name: "r.pdf", type: "", size: 9 })).toMatch(
      /JPG, PNG/,
    );
    expect(
      validateReceiptFile({ name: "r.pdf", type: "application/pdf", size: 0 }),
    ).toMatch(/empty/);
  });
  it("reviewActionsFor flags the blocked actions with a reason", () => {
    const actions = reviewActionsFor(
      { status: "submitted", submitterEmail: "a@x.org" },
      "a@x.org",
    );
    expect(actions.length).toBeGreaterThan(0);
    expect(
      actions.every((a) => a.blocked && /cannot review/.test(a.blockedReason)),
    ).toBe(true);
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
