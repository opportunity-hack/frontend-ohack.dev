import { useCallback, useEffect, useRef, useState } from "react";
import judgeApi from "../lib/judgeApi";

const REFOCUS_THROTTLE_MS = 15000;
const SHARED_TTL_MS = 15000;

// Module-level in-flight/short-TTL dedupe so the "Your judging" card and a
// page that also reads the schedule never fire two requests for one event.
const shared = new Map(); // eventId -> { at, promise }

function fetchSchedule(eventId, { force = false } = {}) {
  const hit = shared.get(eventId);
  if (!force && hit && Date.now() - hit.at < SHARED_TTL_MS) return hit.promise;
  const promise = judgeApi.getPublicSchedule(eventId);
  shared.set(eventId, { at: Date.now(), promise });
  // A failed request must not be reused by the next caller.
  promise.catch(() => {
    if (shared.get(eventId)?.promise === promise) shared.delete(eventId);
  });
  return promise;
}

/** Test hook: forget every cached schedule. */
export function __resetJudgingScheduleCache() {
  shared.clear();
}

/**
 * Public judging schedule for one event (`GET /api/judge/schedule/<id>`).
 *
 * - `initialData`: the SSR copy. When present the mount fetch is skipped
 *   (like `usePublicProfile`); null/undefined means "fetch on mount".
 * - Refetches on tab refocus (15s throttle) and, with `pollMs`, on an
 *   interval while the tab is visible — assignments change during the day.
 * - A failed refetch NEVER resets `schedule` to null (CLAUDE.md data-hook
 *   rule); `loading` starts true whenever a mount fetch will fire, so the
 *   first render never reaches the data branch with nothing to show.
 *
 * Returns `{ schedule, available, loading, error, refetch }`. `available`
 * is false once the backend answered 404 (older backend / unknown event)
 * or the first fetch failed with nothing to fall back on.
 */
export default function useJudgingSchedule(
  eventId,
  { initialData = null, enabled = true, pollMs = 0 } = {},
) {
  const seeded = Boolean(initialData);
  const active = Boolean(enabled && eventId);
  const [state, setState] = useState(() => ({
    schedule: seeded ? initialData : null,
    available: seeded ? true : null,
    loading: !seeded && active,
    error: null,
  }));
  const lastFetchRef = useRef(seeded ? Date.now() : 0);
  const lastJsonRef = useRef(seeded ? JSON.stringify(initialData) : null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refetch = useCallback(
    async ({ force = false } = {}) => {
      if (!eventId) return;
      lastFetchRef.current = Date.now();
      try {
        const data = await fetchSchedule(eventId, { force });
        if (!mountedRef.current) return;
        if (data === null) {
          lastJsonRef.current = null;
          setState({
            schedule: null,
            available: false,
            loading: false,
            error: null,
          });
          return;
        }
        const json = JSON.stringify(data);
        if (json === lastJsonRef.current) {
          setState((s) =>
            s.loading || s.error || !s.available
              ? { ...s, loading: false, error: null, available: true }
              : s,
          );
          return;
        }
        lastJsonRef.current = json;
        setState({ schedule: data, available: true, loading: false, error: null });
      } catch (err) {
        if (!mountedRef.current) return;
        setState((s) => ({
          ...s,
          loading: false,
          error: err,
          available: s.schedule ? s.available : false,
        }));
      }
    },
    [eventId],
  );

  // Mount fetch (skipped when seeded from SSR).
  useEffect(() => {
    if (!active || seeded) return;
    refetch();
  }, [eventId, active]);

  // Refocus + optional polling while visible.
  useEffect(() => {
    if (!active || typeof document === "undefined") return undefined;
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastFetchRef.current < REFOCUS_THROTTLE_MS) return;
      refetch({ force: true });
    };
    document.addEventListener("visibilitychange", onVisible);
    let timer = null;
    if (pollMs > 0) {
      timer = setInterval(() => {
        if (document.visibilityState === "visible") refetch({ force: true });
      }, pollMs);
    }
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      if (timer) clearInterval(timer);
    };
  }, [active, pollMs, refetch]);

  return { ...state, refetch };
}
