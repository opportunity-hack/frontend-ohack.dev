import { renderHook, act } from "@testing-library/react";
import useCountdown from "../use-countdown";

describe("useCountdown", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-09-19T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("starts unmounted and flips mounted after the first effect", () => {
    const { result } = renderHook(() => useCountdown("2026-09-20T12:00:00.000Z"));
    // React Testing Library flushes effects synchronously on render, so by
    // the time we read `result.current` mount has already happened — the
    // guard exists for the SSR-vs-first-client-render gap, not for a
    // render that already ran its effects.
    expect(result.current.mounted).toBe(true);
  });

  it("computes days/hours/minutes/seconds remaining", () => {
    // +1 day, +2h, +3m, +4s from "now"
    const target = "2026-09-20T14:03:04.000Z";
    const { result } = renderHook(() => useCountdown(target));
    expect(result.current).toMatchObject({
      days: 1,
      hours: 2,
      minutes: 3,
      seconds: 4,
      done: false,
    });
  });

  it("reports done and zeroed fields once the target has passed", () => {
    const { result } = renderHook(() => useCountdown("2026-09-19T11:00:00.000Z"));
    expect(result.current).toMatchObject({ ms: 0, days: 0, hours: 0, minutes: 0, seconds: 0, done: true });
  });

  it("treats a missing target as done with zeroed fields", () => {
    const { result } = renderHook(() => useCountdown(null));
    expect(result.current).toMatchObject({ ms: 0, done: true });
  });

  it("ticks down on the interval", () => {
    const { result } = renderHook(() => useCountdown("2026-09-19T12:00:10.000Z", { intervalMs: 1000 }));
    expect(result.current.seconds).toBe(10);
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(result.current.seconds).toBe(7);
  });

  it("pauses the interval while the tab is hidden and resyncs on refocus", () => {
    const { result } = renderHook(() => useCountdown("2026-09-19T12:00:20.000Z", { intervalMs: 1000 }));
    expect(result.current.seconds).toBe(20);

    Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    // Paused — no ticks should have landed while hidden.
    expect(result.current.seconds).toBe(20);

    // Advance real elapsed time, then refocus — it resyncs immediately.
    jest.setSystemTime(new Date("2026-09-19T12:00:15.000Z"));
    Object.defineProperty(document, "hidden", { configurable: true, get: () => false });
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(result.current.seconds).toBe(5);
  });
});
