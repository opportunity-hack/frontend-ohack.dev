import { isEventEnded } from "../dateUtils";

describe("isEventEnded", () => {
  it("counts the whole last day as open (local time)", () => {
    expect(isEventEnded("2026-11-15", new Date(2026, 10, 15, 23, 59))).toBe(
      false,
    );
    expect(isEventEnded("2026-11-15", new Date(2026, 10, 16, 0, 0, 1))).toBe(
      true,
    );
  });

  it("never treats a missing or unparseable date as ended", () => {
    expect(isEventEnded(undefined)).toBe(false);
    expect(isEventEnded("")).toBe(false);
    expect(isEventEnded("not-a-date")).toBe(false);
  });
});
