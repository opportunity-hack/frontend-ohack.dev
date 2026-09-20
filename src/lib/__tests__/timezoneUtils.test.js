import { toIsoWithTimezone } from "../timezoneUtils";

describe("toIsoWithTimezone", () => {
  it("emits a colon-separated offset, not a bare 4-digit offset", () => {
    const iso = toIsoWithTimezone(
      new Date("2026-10-10T22:00:00.000Z"),
      "America/Phoenix",
    );
    // Arizona has no DST, so this should always be -07:00.
    expect(iso).toBe("2026-10-10T15:00:00-07:00");
    // Regression guard: the backend's `datetime.fromisoformat` (Python
    // 3.9/3.10) rejects "-0700" — only the colon form parses.
    expect(iso).toMatch(/[+-]\d{2}:\d{2}$/);
    expect(iso).not.toMatch(/[+-]\d{4}$/);
  });

  it("round-trips through the native Date parser to the same instant", () => {
    const original = new Date("2026-10-10T22:00:00.000Z");
    const iso = toIsoWithTimezone(original, "America/Phoenix");
    expect(new Date(iso).getTime()).toBe(original.getTime());
  });

  it("returns an empty string for falsy or invalid input", () => {
    expect(toIsoWithTimezone(null, "America/Phoenix")).toBe("");
    expect(toIsoWithTimezone("not-a-date", "America/Phoenix")).toBe("");
  });
});

describe("toIsoWithTimezone — offset is the EVENT zone's, never the browser's", () => {
  it("emits -07:00 for Phoenix regardless of the host timezone", () => {
    // The host running this test may be anywhere (CI is UTC, a laptop may be
    // CEST); the emitted offset must still be Arizona's.
    const iso = toIsoWithTimezone(
      new Date("2026-03-15T19:00:00.000Z"),
      "America/Phoenix",
    );
    expect(iso).toBe("2026-03-15T12:00:00-07:00");
  });

  it("follows DST for zones that observe it", () => {
    const summer = toIsoWithTimezone(
      new Date("2026-07-04T16:00:00.000Z"),
      "America/New_York",
    );
    const winter = toIsoWithTimezone(
      new Date("2026-01-04T16:00:00.000Z"),
      "America/New_York",
    );
    expect(summer).toBe("2026-07-04T12:00:00-04:00");
    expect(winter).toBe("2026-01-04T11:00:00-05:00");
  });

  it("handles positive and half-hour offsets", () => {
    const iso = toIsoWithTimezone(
      new Date("2026-10-10T22:00:00.000Z"),
      "Asia/Kolkata",
    );
    expect(iso).toBe("2026-10-11T03:30:00+05:30");
    expect(new Date(iso).getTime()).toBe(
      new Date("2026-10-10T22:00:00.000Z").getTime(),
    );
  });
});
