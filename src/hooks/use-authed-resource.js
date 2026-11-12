import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthInfo } from "@propelauth/react";

/**
 * useAuthedResource — ONE way to fetch something that needs (or may use) the
 * caller's PropelAuth token, without the bug class behind the Nov 2026 mentor
 * check-in fixes (plan: docs/plans/reliability-bug-classes-2026-11.md, Class C).
 *
 * The patterns it bakes in (generalised from `useMentorCheckin`):
 *
 * - **Waits for PropelAuth.** While `useAuthInfo().loading` is true the status
 *   is `loading` — never `logged_out` and never a negative/empty result. A run
 *   started before auth resolved can't finish first and paint "not registered".
 * - **Token rotation is not a new identity.** PropelAuth mints a fresh
 *   `accessToken` on tab refocus. The token is read through a ref; the fetch
 *   effect keys on the resource `key`, `user?.userId` and token PRESENCE only,
 *   so a rotation fires zero requests and never remounts the page.
 * - **Stale runs never write.** Every run is cancelled (AbortController +
 *   generation counter) when the key or identity changes; a slow response for
 *   the old identity is dropped.
 * - **`loading` from the first render** whenever a fetch will fire (the
 *   data-hook rule — a consumer never sees `ready` with `null` data first).
 * - **A failure is `error`, never empty data.** Non-2xx (thrown by the fetcher
 *   — `authedFetchJson` below, axios and the `ApiError` wrappers all throw)
 *   lands in `status: "error"` so the page renders a Retry, not "you have no
 *   teams". A 404 can opt into "feature off" via `treat404As`.
 * - **Background `refresh()`** (refocus, after a write) never flips the status
 *   back to `loading` and never wipes good data when it fails.
 *
 * @param {string|Array} key  identifies the resource; anything that changes
 *   WHAT is fetched (event id, team id) belongs here. JSON-serialised.
 * @param {(ctx: {token: string|null, signal: AbortSignal|undefined,
 *   userId: string|null, background: boolean}) => Promise<any>} fetcher
 *   read through a ref — an inline closure is fine and never refires.
 * @param {object} [options]
 * @param {boolean} [options.enabled=true] false ⇒ `idle`, no request.
 * @param {boolean} [options.requireAuth=true] true ⇒ logged-out callers get
 *   `logged_out` with no request. false ⇒ fetch once auth has resolved, with
 *   the token when there is one (public routes that recognise a logged-in
 *   caller, e.g. the survey context) — and again when a token appears.
 * @param {boolean|((data:any) => boolean)} [options.refreshOnFocus=false]
 *   background-refresh on `visibilitychange`; a function is asked with the
 *   current data (e.g. only while a vote is still "upcoming").
 * @param {number} [options.refocusThrottleMs=15000]
 * @param {any|((err:Error) => any)} [options.treat404As] when set, a 404
 *   resolves to `ready` with this value instead of `error`.
 *
 * @returns {{status: "idle"|"loading"|"ready"|"error"|"logged_out",
 *   data: any, error: Error|null, loading: boolean,
 *   reload: () => Promise<void>, refresh: () => Promise<boolean>,
 *   setData: (next: any|((prev:any) => any)) => void,
 *   tokenRef: {current: string|null}}}
 */

export const DEFAULT_REFOCUS_THROTTLE_MS = 15000;

/** Thrown by `authedFetchJson` for any non-2xx response. */
export class AuthedResourceError extends Error {
  constructor(status, body, message) {
    super(message || `Request failed with status ${status}`);
    this.name = "AuthedResourceError";
    this.status = status;
    this.body = body;
  }
}

/** HTTP status of an error from fetch wrappers, axios or ApiError. */
export function errorStatus(err) {
  if (!err) return null;
  if (typeof err.status === "number") return err.status;
  if (typeof err.response?.status === "number") return err.response.status;
  return null;
}

/**
 * `fetch` + JSON with a Bearer token; throws `AuthedResourceError` on a
 * non-2xx so callers can't mistake an error body for data.
 */
export async function authedFetchJson(
  url,
  { token, signal, headers, ...init } = {},
) {
  const res = await fetch(url, {
    ...init,
    signal,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
  });
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (!res.ok) throw new AuthedResourceError(res.status, body);
  return body;
}

const isAbort = (err) =>
  err?.name === "AbortError" || err?.name === "CanceledError";

export default function useAuthedResource(key, fetcher, options = {}) {
  const {
    enabled = true,
    requireAuth = true,
    refreshOnFocus = false,
    refocusThrottleMs = DEFAULT_REFOCUS_THROTTLE_MS,
    treat404As,
  } = options;

  const { loading: authLoading, isLoggedIn, user, accessToken } = useAuthInfo();
  const tokenRef = useRef(accessToken || null);
  tokenRef.current = accessToken || null;
  const hasToken = Boolean(accessToken);
  const userId = user?.userId || null;
  const keyString = JSON.stringify(key ?? null);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const treat404Ref = useRef(treat404As);
  treat404Ref.current = treat404As;
  const refreshOnFocusRef = useRef(refreshOnFocus);
  refreshOnFocusRef.current = refreshOnFocus;

  const canFetch =
    Boolean(enabled) &&
    !authLoading &&
    (requireAuth ? Boolean(isLoggedIn) && hasToken : true);
  const canFetchRef = useRef(canFetch);
  canFetchRef.current = canFetch;
  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  const [state, setState] = useState(() => ({
    status: enabled ? "loading" : "idle",
    data: null,
    error: null,
  }));
  const stateRef = useRef(state);
  stateRef.current = state;
  const [reloadCount, setReloadCount] = useState(0);

  const generationRef = useRef(0);
  const lastLoadedAtRef = useRef(0);
  const lastIdentityRef = useRef(null);
  const waitersRef = useRef([]);

  const flushWaiters = useCallback(() => {
    const waiters = waitersRef.current;
    waitersRef.current = [];
    waiters.forEach((resolve) => resolve());
  }, []);

  // Resolve a 404 to the opt-in "feature off" value, or null when not opted in.
  const resolve404 = useCallback((err) => {
    const fallback = treat404Ref.current;
    if (fallback === undefined || errorStatus(err) !== 404) return null;
    return {
      value: typeof fallback === "function" ? fallback(err) : fallback,
    };
  }, []);

  useEffect(() => {
    generationRef.current += 1;
    const generation = generationRef.current;
    const identity = `${keyString}|${userId || ""}|${requireAuth ? "" : hasToken}`;
    const identityChanged = lastIdentityRef.current !== identity;

    if (!enabled) {
      setState({ status: "idle", data: null, error: null });
      flushWaiters();
      return undefined;
    }
    if (authLoading) {
      setState({ status: "loading", data: null, error: null });
      return undefined;
    }
    if (requireAuth && !isLoggedIn) {
      lastIdentityRef.current = null;
      setState({ status: "logged_out", data: null, error: null });
      flushWaiters();
      return undefined;
    }
    if (requireAuth && !hasToken) {
      // Logged in, token still arriving — stay loading, don't decide yet.
      setState({ status: "loading", data: null, error: null });
      return undefined;
    }

    lastIdentityRef.current = identity;
    let cancelled = false;
    const controller =
      typeof AbortController !== "undefined" ? new AbortController() : null;
    // Same resource re-loaded (Retry, after a write): keep the last good data
    // on screen while the status says loading. New key/identity: clear it.
    setState((prev) => ({
      status: "loading",
      data: identityChanged ? null : prev.data,
      error: null,
    }));

    (async () => {
      try {
        const data = await fetcherRef.current({
          token: tokenRef.current,
          signal: controller?.signal,
          userId,
          background: false,
        });
        if (cancelled || generation !== generationRef.current) return;
        lastLoadedAtRef.current = Date.now();
        setState({ status: "ready", data, error: null });
      } catch (err) {
        if (cancelled || generation !== generationRef.current || isAbort(err))
          return;
        lastLoadedAtRef.current = Date.now();
        const off = resolve404(err);
        if (off) setState({ status: "ready", data: off.value, error: null });
        else setState({ status: "error", data: null, error: err });
      }
      flushWaiters();
    })();

    return () => {
      cancelled = true;
      if (controller) controller.abort();
    };
  }, [
    keyString,
    enabled,
    requireAuth,
    authLoading,
    isLoggedIn,
    userId,
    hasToken,
    reloadCount,
    flushWaiters,
    resolve404,
  ]);

  // Resolve pending reload() promises if the component unmounts mid-load.
  useEffect(() => () => flushWaiters(), [flushWaiters]);

  /** Foreground re-fetch (Retry, after a create): status goes to `loading`. */
  const reload = useCallback(
    () =>
      new Promise((resolve) => {
        if (!canFetchRef.current) {
          resolve();
          return;
        }
        waitersRef.current.push(resolve);
        setReloadCount((n) => n + 1);
      }),
    [],
  );

  /**
   * Background re-fetch: never sets `loading`, never wipes good data on
   * failure. Resolves true when fresh data landed.
   */
  const refresh = useCallback(async () => {
    if (!canFetchRef.current) return false;
    if (stateRef.current.status === "loading") return false;
    const generation = generationRef.current;
    lastLoadedAtRef.current = Date.now();
    try {
      const data = await fetcherRef.current({
        token: tokenRef.current,
        signal: undefined,
        userId: userIdRef.current,
        background: true,
      });
      if (generation !== generationRef.current) return false;
      setState({ status: "ready", data, error: null });
      return true;
    } catch (err) {
      if (generation !== generationRef.current) return false;
      const off = resolve404(err);
      if (off) {
        setState({ status: "ready", data: off.value, error: null });
        return true;
      }
      console.warn(
        "Background refresh failed (keeping current data):",
        err?.message || err,
      );
      return false;
    }
  }, [resolve404]);

  // Refocus → background refresh (opt-in, throttled).
  useEffect(() => {
    if (!refreshOnFocus || typeof document === "undefined") return undefined;
    const onVisibility = () => {
      if (document.hidden) return;
      const policy = refreshOnFocusRef.current;
      if (!policy) return;
      if (stateRef.current.status !== "ready") return;
      if (typeof policy === "function" && !policy(stateRef.current.data))
        return;
      if (Date.now() - lastLoadedAtRef.current < refocusThrottleMs) return;
      refresh();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [Boolean(refreshOnFocus), refocusThrottleMs, refresh]);

  /** Local update (optimistic merge after a save) — no request. */
  const setData = useCallback((next) => {
    setState((prev) => ({
      ...prev,
      data: typeof next === "function" ? next(prev.data) : next,
    }));
  }, []);

  return {
    status: state.status,
    data: state.data,
    error: state.error,
    loading: state.status === "loading",
    reload,
    refresh,
    setData,
    tokenRef,
  };
}
