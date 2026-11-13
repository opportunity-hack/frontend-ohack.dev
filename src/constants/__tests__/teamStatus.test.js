import {
  getStatusOption,
  isJoiningDisabled,
  isPendingReview,
} from "../teamStatus";

describe("APPROVING (transient approve_team claim)", () => {
  it("has a human label, never the raw enum", () => {
    expect(getStatusOption("APPROVING").label).toBe("Being approved");
  });

  it("counts as not-yet-approved, like IN_REVIEW and a missing status", () => {
    expect(isPendingReview("APPROVING")).toBe(true);
    expect(isPendingReview("IN_REVIEW")).toBe(true);
    expect(isPendingReview(undefined)).toBe(true);
    expect(isPendingReview("NONPROFIT_SELECTED")).toBe(false);
  });

  it("does not change join rules (stays joinable like IN_REVIEW)", () => {
    expect(isJoiningDisabled("APPROVING")).toBe(false);
  });
});
