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
