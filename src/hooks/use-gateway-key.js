import { useCallback, useEffect, useRef, useState } from "react";
import { fetchGatewayKey } from "../lib/teamDashboardApi";

/**
 * Fetches the team's AI gateway key. The backend mints the key when
 * organizers approve the team (nonprofit pairing), so this hook only fires
 * when `enabled` is true - callers keep it off for IN_REVIEW teams, where
 * no key can exist yet.
 *
 * `keyData` shape: { key, key_alias, models, max_budget, expires, spend }
 * (`spend` may be null when the backend can't reach LiteLLM right now).
 */
export default function useGatewayKey({ teamId, accessToken, enabled }) {
  // Start as loading whenever the fetch will fire on mount: the first render
  // happens BEFORE the effect calls load(), and a `false` here let the card
  // fall through to its data branch with keyData === null (Oct 2026 crash).
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState(null);
  const [keyData, setKeyData] = useState(null);
  // Guards against a slow fetch for a previous team overwriting state after
  // the team (or token) changed mid-flight.
  const attemptRef = useRef(0);

  const load = useCallback(async () => {
    if (!teamId || !accessToken) return;
    const attempt = ++attemptRef.current;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGatewayKey(teamId, accessToken);
      if (attemptRef.current !== attempt) return;
      setKeyData(data);
    } catch (err) {
      if (attemptRef.current !== attempt) return;
      setError(err);
    } finally {
      if (attemptRef.current === attempt) setLoading(false);
    }
  }, [teamId, accessToken]);

  useEffect(() => {
    if (!enabled) return;
    setKeyData(null);
    setError(null);
    load();
  }, [enabled, load]);

  const retry = useCallback(() => {
    load();
  }, [load]);

  return { loading, error, keyData, retry };
}
