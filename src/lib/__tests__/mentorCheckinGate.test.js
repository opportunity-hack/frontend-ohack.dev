import {
  deriveMentorGate,
  effectiveWindowState,
  isCheckinRefusal,
  relativeOpening,
} from "../mentorCheckinGate";

const settled = {
  authLoading: false,
  isLoggedIn: true,
  eventStatus: "ready",
  mentorStatus: "ready",
};

describe("deriveMentorGate", () => {
  it.each([
    ["auth still resolving", { ...settled, authLoading: true }, "loading"],
    ["logged out", { ...settled, isLoggedIn: false, mentorStatus: "idle" }, "logged_out"],
    ["event failed", { ...settled, eventStatus: "error" }, "event_error"],
    ["event loading", { ...settled, eventStatus: "loading" }, "loading"],
    ["mentor loading", { ...settled, mentorStatus: "loading" }, "loading"],
    ["mentor failed", { ...settled, mentorStatus: "error" }, "mentor_error"],
    ["no application", { ...settled, mentor: null }, "not_applied"],
    ["pending (bare isSelected:false)", { ...settled, mentor: { isSelected: false } }, "pending"],
    ["pending (no fields)", { ...settled, mentor: {} }, "pending"],
    ["waitlisted", { ...settled, mentor: { isSelected: false, status: "waitlisted" } }, "pending"],
    ["denied", { ...settled, mentor: { isSelected: false, status: "Denied" } }, "not_selected"],
    ["approved", { ...settled, mentor: { isSelected: true } }, "ready"],
  ])("%s", (_label, input, expected) => {
    expect(deriveMentorGate(input)).toBe(expected);
  });

  it("auth loading + a stale null mentor is loading, never not_applied", () => {
    expect(
      deriveMentorGate({ ...settled, authLoading: true, isLoggedIn: false, mentor: null }),
    ).toBe("loading");
    expect(
      deriveMentorGate({ ...settled, authLoading: true, mentorStatus: "ready", mentor: null }),
    ).toBe("loading");
  });

  it("a mentor fetch error is mentor_error, never not_applied", () => {
    expect(deriveMentorGate({ ...settled, mentorStatus: "error", mentor: null })).toBe(
      "mentor_error",
    );
  });

  it("denied + approved later reads as ready", () => {
    expect(deriveMentorGate({ ...settled, mentor: { isSelected: true, status: "denied" } })).toBe(
      "ready",
    );
  });
});

describe("effectiveWindowState", () => {
  const win = {
    state: "upcoming",
    opens_at: "2026-11-14T00:00:00-07:00",
    closes_at: "2026-11-15T23:59:59-07:00",
  };
  const at = (iso) => Date.parse(iso);

  it("older backend (no window) is open", () => {
    expect(effectiveWindowState(null)).toBe("open");
    expect(effectiveWindowState(undefined)).toBe("open");
  });

  it("uses the clock, so an open tab flips without a refetch", () => {
    expect(effectiveWindowState(win, at("2026-11-13T23:59:00-07:00"))).toBe("upcoming");
    expect(effectiveWindowState(win, at("2026-11-14T00:00:01-07:00"))).toBe("open");
    expect(effectiveWindowState(win, at("2026-11-16T00:00:01-07:00"))).toBe("closed");
  });

  it("falls back to the reported state when dates are missing", () => {
    expect(effectiveWindowState({ state: "closed" }, Date.now())).toBe("closed");
    expect(effectiveWindowState({ state: "upcoming" }, Date.now())).toBe("upcoming");
    expect(effectiveWindowState({ state: "open" }, Date.now())).toBe("open");
  });
});

describe("isCheckinRefusal", () => {
  it.each(["not_approved", "checkin_not_open", "checkin_closed"])("%s", (code) => {
    expect(isCheckinRefusal({ response: { data: { error: code } } })).toBe(true);
  });
  it("other failures are not refusals", () => {
    expect(isCheckinRefusal({ response: { data: { message: "boom" } } })).toBe(false);
    expect(isCheckinRefusal(new Error("network"))).toBe(false);
  });
});

describe("relativeOpening", () => {
  const now = Date.parse("2026-11-11T12:00:00Z");
  it("days / hours / minutes", () => {
    expect(relativeOpening("2026-11-14T12:00:00Z", now)).toBe("in 3 days");
    expect(relativeOpening("2026-11-11T17:00:00Z", now)).toBe("in 5 hours");
    expect(relativeOpening("2026-11-11T12:01:00Z", now)).toBe("in 1 minute");
  });
  it("null once passed or unknown", () => {
    expect(relativeOpening("2026-11-10T12:00:00Z", now)).toBeNull();
    expect(relativeOpening(null, now)).toBeNull();
  });
});
