import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useAuthInfo } from "@propelauth/react";

// Module-level cache so the event page band, the roster "You" tag and the
// share page share ONE request per (user, event) per minute.
const CACHE_TTL_MS = 60 * 1000;
const cache = new Map();

const IDLE = { status: "idle", roles: [], available: true };

/**
 * Which roles the logged-in user holds for an event — ONE request to
 * `GET /api/volunteer/<event_id>/my-roles` → `{roles:[{type,id,isSelected,name}]}`.
 * `available: false` means the route 404'd (older backend): every consumer
 * must then render nothing. Logged-out users never fire a request.
 *
 * Token-rotation pattern: the token is read through a ref and the effect
 * keys on its PRESENCE, so a PropelAuth refresh on refocus doesn't refetch.
 */
export default function useMyEventRoles(eventId) {
  const { accessToken, user } = useAuthInfo();
  // process.env directly (not useEnv): the event page imports this hook, and
  // src/context/env.context.js throws at import time when NEXT_PUBLIC_* vars
  // are missing, which broke the build-safety test that requires the page
  // module under a bare environment (CI run on PR #430).
  const apiServerUrl = process.env.NEXT_PUBLIC_API_SERVER_URL;
  const tokenRef = useRef(accessToken);
  tokenRef.current = accessToken;
  const [state, setState] = useState(IDLE);

  const hasToken = Boolean(accessToken);
  const userId = user?.userId || "";

  useEffect(() => {
    if (!eventId || !hasToken) {
      setState(IDLE);
      return undefined;
    }
    const key = `${userId}|${eventId}`;
    const cached = cache.get(key);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
      setState({ status: "ready", roles: cached.roles, available: true });
      return undefined;
    }
    let cancelled = false;
    setState((s) => ({ ...s, status: "loading" }));
    axios
      .get(`${apiServerUrl}/api/volunteer/${encodeURIComponent(eventId)}/my-roles`, {
        headers: { Authorization: `Bearer ${tokenRef.current}` },
      })
      .then(({ data }) => {
        const roles = Array.isArray(data?.roles) ? data.roles : [];
        cache.set(key, { at: Date.now(), roles });
        if (!cancelled) setState({ status: "ready", roles, available: true });
      })
      .catch((err) => {
        if (cancelled) return;
        if (err?.response?.status === 404) {
          setState({ status: "ready", roles: [], available: false });
        } else {
          setState({ status: "error", roles: [], available: true });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [eventId, hasToken, userId, apiServerUrl]);

  const selectedRoles = state.roles.filter((r) => r && r.isSelected && r.id);
  return {
    ...state,
    selectedRoles,
    selectedIds: selectedRoles.map((r) => String(r.id)),
  };
}

/** Test seam: clear the module cache. */
export function __resetMyEventRolesCache() {
  cache.clear();
}
