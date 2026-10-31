import React from "react";
import { act, render, screen } from "@testing-library/react";
import useCoverageNow, { coverageReferenceTime } from "../use-coverage-now";

describe("coverageReferenceTime", () => {
  it("is null without a clock (SSR / hydration: count everything)", () => {
    expect(coverageReferenceTime(null, { endDate: "2026-11-07" })).toBeNull();
  });

  it("is the clock during the event and frozen at the end of the last day", () => {
    const during = Date.parse("2026-11-07T20:00:00Z");
    expect(
      coverageReferenceTime(during, {
        endDate: "2026-11-07",
        timezone: "America/Phoenix",
      }),
    ).toBe(during);
    // 23:59:59 Phoenix (UTC-7) on the end date = 06:59:59Z next day.
    const weekLater = Date.parse("2026-11-14T12:00:00Z");
    expect(
      coverageReferenceTime(weekLater, {
        endDate: "2026-11-07",
        timezone: "America/Phoenix",
      }),
    ).toBe(Date.parse("2026-11-08T06:59:59Z"));
  });

  it("falls back to the clock when the event has no end date", () => {
    expect(coverageReferenceTime(123, {})).toBe(123);
  });
});

// Records every value the hook hands to a render, in order.
const seen = [];
function Probe() {
  const now = useCoverageNow({ intervalMs: 1000 });
  seen.push(now);
  return <span data-testid="now">{now == null ? "null" : String(now)}</span>;
}

describe("useCoverageNow", () => {
  it("is null on the first render (what the server sends), then the clock, and keeps ticking", () => {
    jest.useFakeTimers();
    seen.length = 0;
    render(<Probe />);
    // The first render — the one that must match SSR — had no clock; the
    // mount effect then committed a timestamp.
    expect(seen[0]).toBeNull();
    const first = Number(screen.getByTestId("now").textContent);
    expect(first).toBeGreaterThan(0);
    act(() => {
      jest.advanceTimersByTime(1500);
    });
    expect(
      Number(screen.getByTestId("now").textContent),
    ).toBeGreaterThanOrEqual(first + 1000);
    jest.useRealTimers();
  });
});
