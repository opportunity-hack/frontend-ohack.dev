import axios from "axios";
import { useEffect, useState } from "react";
import { useAuthInfo } from "@propelauth/react";
import { useEnv } from "../context/env.context";

/**
 * The logged-in user's teams across every hackathon, each with a trimmed
 * `event` — `GET /api/users/profile/teams` (backend
 * `users_service.get_my_teams`). Auth comes from the global axios
 * interceptor (axios-wrapper.js); the request only fires in a client
 * effect once the person is logged in.
 *
 * Older-backend rule: a 404 means the route doesn't exist yet →
 * `available: false` and the caller renders nothing.
 *
 * `loading` starts true whenever the fetch will fire on mount, so a consumer
 * never reaches its data branch with `teams === null` (data-hook rule).
 */
export default function useMyTeams() {
  const { isLoggedIn, user } = useAuthInfo();
  const { apiServerUrl } = useEnv();
  const enabled = Boolean(isLoggedIn && user);
  const [state, setState] = useState({
    teams: null,
    loading: enabled,
    available: true,
    error: null,
  });

  useEffect(() => {
    if (!enabled) {
      setState({ teams: null, loading: false, available: true, error: null });
      return undefined;
    }
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    axios({
      url: `${apiServerUrl}/api/users/profile/teams`,
      method: "GET",
      headers: { "content-type": "application/json" },
    })
      .then(({ data }) => {
        if (cancelled) return;
        const teams = Array.isArray(data?.teams) ? data.teams : [];
        setState({ teams, loading: false, available: true, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        if (err?.response?.status === 404) {
          setState({
            teams: [],
            loading: false,
            available: false,
            error: null,
          });
          return;
        }
        console.error("My teams fetch failed:", err?.message || err);
        setState({
          teams: [],
          loading: false,
          available: true,
          error: "We couldn't load your teams right now.",
        });
      });
    return () => {
      cancelled = true;
    };
    // `user` identity churns on token refresh; `enabled` is the stable gate.
  }, [enabled, apiServerUrl]);

  return state;
}
