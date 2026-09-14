import {
  APPLICATION_STATUSES,
  ROSTER_READY_STATUSES,
  isKnownStatus,
  normalizeStatus,
  pipelineStatuses,
  rosterConflict,
  rosterReady,
  statusChipProps,
  statusLabel,
  statusMeta,
  statusSortIndex,
  terminalStatuses,
} from "../applicationStatus";

describe("applicationStatus catalog", () => {
  it("has the 7 legacy values plus waitlisted", () => {
    const values = APPLICATION_STATUSES.map((s) => s.value);
    expect(values).toEqual([
      "pending",
      "approved",
      "waitlisted",
      "verified_travel",
      "confirmed",
      "denied",
      "withdrew",
      "no_show",
    ]);
  });

  it("splits pipeline vs terminal", () => {
    expect(pipelineStatuses().map((s) => s.value)).toEqual([
      "pending",
      "approved",
      "waitlisted",
      "verified_travel",
      "confirmed",
    ]);
    expect(terminalStatuses().map((s) => s.value)).toEqual(["denied", "withdrew", "no_show"]);
  });
});

describe("normalizeStatus", () => {
  it("defaults blank to pending", () => {
    expect(normalizeStatus("")).toBe("pending");
    expect(normalizeStatus(null)).toBe("pending");
    expect(normalizeStatus(undefined)).toBe("pending");
    expect(normalizeStatus("   ")).toBe("pending");
  });

  it("folds case and whitespace onto known values", () => {
    expect(normalizeStatus(" Approved ")).toBe("approved");
    expect(normalizeStatus("Verified Travel")).toBe("verified_travel");
    expect(normalizeStatus("NO-SHOW")).toBe("no_show");
  });

  it("passes unknown legacy values through trimmed", () => {
    expect(normalizeStatus(" selected ")).toBe("selected");
    expect(isKnownStatus("selected")).toBe(false);
    expect(isKnownStatus("approved")).toBe(true);
  });
});

describe("statusMeta / labels / chips", () => {
  it("returns catalog meta for known values", () => {
    expect(statusLabel("waitlisted")).toBe("Waitlisted");
    expect(statusChipProps("approved")).toEqual({ label: "Approved", color: "success", variant: "filled" });
  });

  it("synthesizes a legacy meta for unknown values", () => {
    const meta = statusMeta("selected");
    expect(meta.isLegacy).toBe(true);
    expect(meta.label).toBe("selected (legacy)");
    expect(statusChipProps("selected").variant).toBe("outlined");
  });

  it("sorts in pipeline order with legacy last", () => {
    expect(statusSortIndex("pending")).toBeLessThan(statusSortIndex("approved"));
    expect(statusSortIndex("approved")).toBeLessThan(statusSortIndex("denied"));
    expect(statusSortIndex("weird")).toBe(99);
  });
});

describe("roster helpers", () => {
  it("rosterReady = favorably reviewed but not on roster", () => {
    expect(ROSTER_READY_STATUSES).toEqual(["approved", "verified_travel", "confirmed"]);
    expect(rosterReady({ status: "approved", isSelected: false })).toBe(true);
    expect(rosterReady({ status: "Approved" })).toBe(true);
    expect(rosterReady({ status: "confirmed", isSelected: false })).toBe(true);
    expect(rosterReady({ status: "approved", isSelected: true })).toBe(false);
    expect(rosterReady({ status: "pending", isSelected: false })).toBe(false);
    expect(rosterReady({ status: "waitlisted" })).toBe(false);
    expect(rosterReady(null)).toBe(false);
  });

  it("rosterConflict = on roster with a terminal negative status", () => {
    expect(rosterConflict({ status: "denied", isSelected: true })).toBe(true);
    expect(rosterConflict({ status: "withdrew", isSelected: true })).toBe(true);
    expect(rosterConflict({ status: "denied", isSelected: false })).toBe(false);
    expect(rosterConflict({ status: "approved", isSelected: true })).toBe(false);
    expect(rosterConflict({ status: "selected", isSelected: true })).toBe(false);
  });
});
