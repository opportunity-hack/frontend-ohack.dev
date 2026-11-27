import {
  countsByStatus,
  eligibilityLabel,
  evidenceLines,
  factRows,
  filterRows,
  rowStatus,
  sampleRowFor,
} from "../adminLetters";

const rows = [
  { user_id: "j1", name: "Ada", email: "ada@x.org", role: "judge", eligible: true, evidence: { score_count: 6, is_selected: true } },
  { user_id: "j2", name: "Bo", email: "bo@x.org", role: "judge", eligible: false, reason: "no_scores", evidence: { score_count: 0, is_selected: true } },
  { user_id: "m1", name: "Cy", email: "cy@x.org", role: "mentor", eligible: true, letter_id: "ABCDEFGHJKMN", status: "issued", evidence: { check_in_time: "2026-11-14T16:00:00Z" } },
  { user_id: "h1", name: "Di", email: "di@x.org", role: "hacker", eligible: false, reason: "no_active_team", letter_id: "ZZZZZZZZZZZZ", status: "revoked", evidence: { team_name: null } },
];

describe("adminLetters helpers", () => {
  it("rowStatus", () => {
    expect(rows.map(rowStatus)).toEqual(["eligible", "not_eligible", "issued", "revoked"]);
  });

  it("filters by role, status and search", () => {
    expect(filterRows(rows, { role: "judge" }).map((r) => r.user_id)).toEqual(["j1", "j2"]);
    expect(filterRows(rows, { status: "issued" }).map((r) => r.user_id)).toEqual(["m1"]);
    expect(filterRows(rows, { status: "not_eligible", role: "judge" }).map((r) => r.user_id)).toEqual(["j2"]);
    expect(filterRows(rows, { search: "BO@" }).map((r) => r.user_id)).toEqual(["j2"]);
  });

  it("counts by status", () => {
    expect(countsByStatus(rows)).toEqual({ all: 4, eligible: 1, not_eligible: 1, issued: 1, revoked: 1 });
  });

  it("sample row prefers issued, then eligible, then anyone", () => {
    expect(sampleRowFor(rows, "mentor").user_id).toBe("m1");
    expect(sampleRowFor(rows, "judge").user_id).toBe("j1");
    expect(sampleRowFor(rows, "hacker").user_id).toBe("h1");
    expect(sampleRowFor(rows, "volunteer")).toBeNull();
  });

  it("evidence lines per role", () => {
    expect(evidenceLines(rows[0])).toEqual(["6 scores"]);
    expect(evidenceLines(rows[3])).toEqual(["No team"]);
    expect(evidenceLines({ role: "volunteer", evidence: { is_selected: false } })).toEqual(["Not approved", "No check-in"]);
    expect(evidenceLines(rows[2])[0]).toMatch(/^Checked in Nov 14, 2026/);
  });

  it("eligibility label uses the shared reason map", () => {
    expect(eligibilityLabel(rows[0])).toBe("Eligible");
    expect(eligibilityLabel(rows[1])).toMatch(/judging scores/);
  });

  it("lists frozen facts in letter order and keeps unknown keys", () => {
    const out = factRows({ role: "judge", name: "Ada", nonprofits: ["A", "B"], venue: null, served_dates: ["x"], extra_key: 3 });
    expect(out).toEqual([
      ["Name", "Ada"],
      ["Role", "Judge"],
      ["Venue", "—"],
      ["Nonprofits", "A, B"],
      ["extra_key", "3"],
    ]);
    expect(factRows(null)).toEqual([]);
  });
});
