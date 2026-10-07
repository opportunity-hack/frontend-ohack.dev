import { useEffect, useState } from "react";

const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

function breakdown(remainingMs) {
  const ms = Math.max(0, remainingMs);
  return {
    ms,
    days: Math.floor(ms / MS_PER_DAY),
    hours: Math.floor((ms % MS_PER_DAY) / MS_PER_HOUR),
    minutes: Math.floor((ms % MS_PER_HOUR) / MS_PER_MINUTE),
    seconds: Math.floor((ms % MS_PER_MINUTE) / MS_PER_SECOND),
    done: ms <= 0,
  };
}

function parseTarget(targetIso) {
  if (!targetIso) return NaN;
  const parsed = targetIso instanceof Date ? targetIso.getTime() : Date.parse(targetIso);
  return parsed;
}

/**
 * Live countdown to an ISO target time.
 *
 * `mounted` starts false and flips true only after the first effect runs,
 * so a server-rendered "--" placeholder never mismatches a client render
 * that already knows "now" (hydration-mismatch guard — see SurveyCTA /
 * DeadlineStrip, which gate visible countdown text on it).
 *
 * Pauses the interval while the tab is hidden (`document.hidden`) and
 * re-syncs immediately on refocus, so a backgrounded tab doesn't drift or
 * burn cycles, and the displayed value is always correct the moment the
 * user looks back.
 */
export default function useCountdown(targetIso, { intervalMs = 1000 } = {}) {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState(() => breakdown(0));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const targetMs = parseTarget(targetIso);
    if (!targetIso || Number.isNaN(targetMs)) {
      setState(breakdown(0));
      return undefined;
    }

    let intervalId = null;
    const tick = () => setState(breakdown(targetMs - Date.now()));
    const stop = () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
    const start = () => {
      if (intervalId !== null) return;
      intervalId = setInterval(tick, intervalMs);
    };
    const handleVisibility = () => {
      if (typeof document === "undefined") return;
      if (document.hidden) {
        stop();
      } else {
        tick();
        start();
      }
    };

    tick();
    if (typeof document === "undefined" || !document.hidden) start();
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibility);
    }

    return () => {
      stop();
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibility);
      }
    };
  }, [targetIso, intervalMs]);

  return { mounted, ...state };
}
