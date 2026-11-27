import {
  FALLBACK_REASON_TEXT,
  LETTER_STATES,
  REASON_TEXT,
  letterRowState,
  reasonText,
  rowsByEvent,
  rowsMissingFrom,
  verifyUrl,
} from "../letterStates";

describe("reason-code map", () => {
  it("covers every backend reason code (api/letters/letter_facts.py REASON_CODES)", () => {
    expect(Object.keys(REASON_TEXT).sort()).toEqual(
      [
        "before_start_date",
        "event_not_ended",
        "event_not_found",
        "name_missing",
        "no_active_team",
        "no_checkin",
        "no_scores",
        "not_selected",
      ].sort(),
    );
  });

  it("falls back for unknown or missing codes", () => {
    expect(reasonText("no_scores")).toMatch(/judging scores/);
    expect(reasonText("something_new")).toBe(FALLBACK_REASON_TEXT);
    expect(reasonText(undefined)).toBe(FALLBACK_REASON_TEXT);
  });
});

describe("letterRowState", () => {
  it.each([
    [{ eligible: false, reason: "no_checkin" }, LETTER_STATES.NOT_ELIGIBLE],
    [{ eligible: true }, LETTER_STATES.ELIGIBLE],
    [{ eligible: true, letter_id: "ABCDEFGHJKMN", status: "issued" }, LETTER_STATES.ISSUED],
    [{ eligible: false, letter_id: "ABCDEFGHJKMN", status: "issued" }, LETTER_STATES.ISSUED],
    [{ eligible: true, letter_id: "ABCDEFGHJKMN", status: "revoked" }, LETTER_STATES.REVOKED],
    [null, LETTER_STATES.NOT_ELIGIBLE],
  ])("%j -> %s", (row, state) => {
    expect(letterRowState(row)).toBe(state);
  });
});

describe("grouping", () => {
  const rows = [
    { event_id: "fall26", event_title: "Fall 2026", event_end_date: "2026-11-15", role: "judge" },
    { event_id: "fall26", event_title: "Fall 2026", event_end_date: "2026-11-15", role: "mentor" },
    { event_id: "spring26", event_title: "Spring 2026", event_end_date: "2026-03-15", role: "mentor" },
    { event_id: "winter27", event_title: "Winter 2027", event_end_date: "2027-01-20", role: "volunteer" },
  ];

  it("groups rows by event", () => {
    const by = rowsByEvent(rows);
    expect(by.fall26.map((r) => r.role)).toEqual(["judge", "mentor"]);
    expect(rowsByEvent(null)).toEqual({});
  });

  it("returns events missing from the attendance list, newest first", () => {
    const groups = rowsMissingFrom(rows, [{ event_id: "fall26" }]);
    expect(groups.map((g) => g.event_id)).toEqual(["winter27", "spring26"]);
    expect(groups[0].event_title).toBe("Winter 2027");
  });

  it("builds the verify url", () => {
    expect(verifyUrl("ABCDEFGHJKMN", "https://www.ohack.dev")).toBe(
      "https://www.ohack.dev/letters/verify/ABCDEFGHJKMN",
    );
  });
});

describe("certificateUrlForRow", () => {
  // eslint-disable-next-line global-require
  const { certificateUrlForRow } = require("../letterStates");
  const certs = [
    "legacy_string_only.png",
    { filename: "mentor_old.png", reasons: ["mentor"], event_id: "fall26", timestamp: "2026-11-20T00:00:00Z" },
    { filename: "mentor_new.png", reasons: ["mentor"], event_id: "fall26", timestamp: "2026-11-21T00:00:00Z" },
    { filename: "judge_spring.png", reasons: ["judge"], event_id: "spring26", timestamp: "2026-03-20T00:00:00Z" },
    { filename: "judge_legacy.png", reasons: ["judge"], timestamp: "2026-11-25T00:00:00Z" },
  ];

  it("picks the newest certificate for the row's role and event", () => {
    expect(certificateUrlForRow({ role: "mentor", event_id: "fall26" }, certs, "2026-11-14")).toBe(
      "https://cdn.ohack.dev/certificates/mentor_new.png",
    );
  });

  it("falls back to the date window for entries without event_id", () => {
    expect(certificateUrlForRow({ role: "judge", event_id: "fall26" }, certs, "2026-11-14")).toBe(
      "https://cdn.ohack.dev/certificates/judge_legacy.png",
    );
  });

  it("returns null for other roles, other events or no certificates", () => {
    expect(certificateUrlForRow({ role: "hacker", event_id: "fall26" }, certs, "2026-11-14")).toBeNull();
    expect(certificateUrlForRow({ role: "mentor", event_id: "winter27" }, certs, "2027-01-10")).toBeNull();
    expect(certificateUrlForRow({ role: "judge", event_id: "fall26" }, [], "2026-11-14")).toBeNull();
  });
});
