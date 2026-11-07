import {
  deriveHackerApplicationGates,
  hackerApplicationDeadline,
  parseHackerSubmitResponse,
} from "../hackerApplicationGates";

const TZ = "America/Phoenix"; // UTC-7, no DST
const EVENT = { startDate: "2026-11-14", endDate: "2026-11-15", timezone: TZ };
const at = (iso) => new Date(iso);

describe("hackerApplicationDeadline", () => {
  it("is 3 days before kickoff at 8 PM event time", () => {
    const d = hackerApplicationDeadline("2026-11-14", TZ);
    expect(d.toISOString()).toBe("2026-11-12T03:00:00.000Z"); // Nov 11 8 PM MST
  });
  it("is null without a start date", () => {
    expect(hackerApplicationDeadline(null, TZ)).toBeNull();
  });
});

describe("deriveHackerApplicationGates", () => {
  it("is open before the deadline with no constraints", () => {
    const g = deriveHackerApplicationGates({ ...EVENT, now: at("2026-11-05T12:00:00Z") });
    expect(g).toMatchObject({
      deadlinePassed: false,
      isEventPast: false,
      isLocked: false,
      closedByDeadline: false,
      passcode: null,
      hackerCapacity: null,
      autoApproveOn: false,
    });
  });

  it("stays OPEN after the deadline unless close_at_deadline is on", () => {
    const now = at("2026-11-13T12:00:00Z");
    expect(deriveHackerApplicationGates({ ...EVENT, now })).toMatchObject({
      deadlinePassed: true,
      isLocked: false,
    });
    expect(
      deriveHackerApplicationGates({
        ...EVENT,
        now,
        constraints: { application_hacker_close_at_deadline: true },
      }),
    ).toMatchObject({ isLocked: true, closedByDeadline: true });
  });

  it("ignores the retired force_open key", () => {
    const g = deriveHackerApplicationGates({
      ...EVENT,
      now: at("2026-11-13T12:00:00Z"),
      constraints: {
        application_hacker_force_open: true,
        application_hacker_close_at_deadline: true,
      },
    });
    expect(g.isLocked).toBe(true);
  });

  it("locks only on an explicit false (missing ⇒ open)", () => {
    const now = at("2026-11-05T12:00:00Z");
    expect(
      deriveHackerApplicationGates({ ...EVENT, now, constraints: { application_hacker_enabled: false } }).isLocked,
    ).toBe(true);
    expect(
      deriveHackerApplicationGates({ ...EVENT, now, constraints: { application_hacker_enabled: true } }).isLocked,
    ).toBe(false);
  });

  it("marks the event past once the last day is over (end date + 1 day)", () => {
    // end_date "2026-11-15" = Nov 15 00:00 MST; past from Nov 16 00:00 MST.
    expect(deriveHackerApplicationGates({ ...EVENT, now: at("2026-11-16T05:00:00Z") }).isEventPast).toBe(false);
    expect(deriveHackerApplicationGates({ ...EVENT, now: at("2026-11-16T08:00:00Z") }).isEventPast).toBe(true);
  });

  it("cleans the code, capacity and auto-approve flag", () => {
    const g = deriveHackerApplicationGates({
      ...EVENT,
      constraints: {
        application_hacker_enabled_code: "  late-2026 ",
        hacker_capacity: 90,
        hacker_auto_approve: true,
      },
    });
    expect(g.passcode).toBe("late-2026");
    expect(g.hackerCapacity).toBe(90);
    expect(g.autoApproveOn).toBe(true);
    const blank = deriveHackerApplicationGates({
      ...EVENT,
      constraints: { application_hacker_enabled_code: "  ", hacker_capacity: 0, hacker_auto_approve: "yes" },
    });
    expect(blank).toMatchObject({ passcode: null, hackerCapacity: null, autoApproveOn: false });
  });
});

describe("parseHackerSubmitResponse", () => {
  it("reads the doc out of the {success, data} envelope", () => {
    expect(
      parseHackerSubmitResponse({ success: true, data: { id: "vol-1", isSelected: true, auto_approved: true } }, "propel-1"),
    ).toEqual({ volunteerId: "vol-1", isSelected: true, rosterOutcome: "approved", autoApproved: true });
  });
  it("recognizes a waitlisted application", () => {
    expect(parseHackerSubmitResponse({ data: { id: "vol-2", isSelected: false, status: "Waitlisted" } })).toMatchObject({
      rosterOutcome: "waitlisted",
      isSelected: false,
    });
  });
  it("falls back to the login id and a pending outcome", () => {
    expect(parseHackerSubmitResponse(null, "propel-1")).toEqual({
      volunteerId: "propel-1",
      isSelected: false,
      rosterOutcome: null,
      autoApproved: false,
    });
  });
});
