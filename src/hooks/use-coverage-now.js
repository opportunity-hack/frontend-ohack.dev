import { useEffect, useState } from "react";
import { endOfEventDay } from "../lib/teamDeliverables";

/**
 * The clock behind mentor-coverage freshness (`coverageSummary(…, { now })`
 * in `Teams/mentorCoverage.js`).
 *
 * Pure part: the reference time is the client clock capped at the end of
 * the event's last day (event timezone), so a finished hackathon keeps its
 * final picture instead of decaying to 0% a week later. `null` in → `null`
 * out ("no clock yet — count everything").
 */
export function coverageReferenceTime(nowMs, { endDate, timezone } = {}) {
  if (nowMs == null) return null;
  const end = endOfEventDay(endDate, timezone);
  return end && end.getTime() < nowMs ? end.getTime() : nowMs;
}

/**
 * `null` until mounted — the server render and the hydrating client render
 * must agree, and only the client has a clock worth trusting (SurveyCTA /
 * useCountdown pattern) — then the current time, re-read every minute and on
 * tab refocus so a sign-off that crosses the 5h line actually flips without
 * a reload. Call it ONCE per page/list and pass the value down (TeamList
 * renders 30+ cards; one ticking hook is plenty).
 */
export default function useCoverageNow({
  endDate,
  timezone,
  intervalMs = 60_000,
} = {}) {
  const [now, setNow] = useState(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, intervalMs);
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [intervalMs]);

  return coverageReferenceTime(now, { endDate, timezone });
}
