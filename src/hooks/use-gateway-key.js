import { useCallback, useEffect, useRef, useState } from "react";
import { fetchGatewayKey } from "../lib/teamDashboardApi";

/**
 * Fetches the team's AI gateway key. The backend mints the key when
 * organizers approve the team (nonprofit pairing), so this hook only fires
 * when `enabled` is true - callers keep it off for IN_REVIEW teams, where
 * no key can exist yet.
 *
 * `keyData` shape: `{ team_id, keys }`, one entry per key:
 * `{ label, key, key_alias, models, max_budget, expires, spend, status }`
 * (`spend` may be null when the backend can't reach LiteLLM right now;
 * a `status: "missing"` entry has `key: null`). See
 * `normalizeGatewayKeyResponse` in ../lib/teamDashboardApi — the hook
 * passes the normalized shape through unchanged.
 *
 * Token-rotation stable (Nov 2026): PropelAuth hands out a fresh accessToken
 * on every tab refocus. The token is read through a ref and the fetch is keyed
 * on the team + token PRESENCE, so coming back from the terminal no longer
 * blanks the card, resets its tool tab and re-hits LiteLLM. The key is cleared
 * only when the team changes, and a failed refetch keeps a working key.
 */
export default function useGatewayKey({ teamId, accessToken, enabled }) {
  // Start as loading whenever the fetch will fire on mount: the first render
  // happens BEFORE the effect calls load(), and a `false` here let the card
  // fall through to its data branch with keyData === null (Oct 2026 crash).
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState(null);
  const [keyData, setKeyData] = useState(null);
  const tokenRef = useRef(accessToken);
  tokenRef.current = accessToken;
  // Mirrors keyData for the current team so load() can tell a first load
  // (show the skeleton, report errors) from a refetch (stay quiet).
  const dataRef = useRef(null);
  const lastTeamRef = useRef(teamId);
  // Guards against a slow fetch for a previous team overwriting state after
  // the team changed mid-flight.
  const attemptRef = useRef(0);

  const load = useCallback(async () => {
    const token = tokenRef.current;
    if (!teamId || !token) return;
    const attempt = ++attemptRef.current;
    const hasData = Boolean(dataRef.current);
    if (!hasData) {
      setLoading(true);
      setError(null);
    }
    try {
      const data = await fetchGatewayKey(teamId, token);
      if (attemptRef.current !== attempt) return;
      dataRef.current = data;
      setKeyData(data);
      setError(null);
    } catch (err) {
      if (attemptRef.current !== attempt) return;
      // Keep showing a working key; only report errors when there's nothing.
      if (!dataRef.current) setError(err);
    } finally {
      if (attemptRef.current === attempt) setLoading(false);
    }
  }, [teamId]);

  const hasToken = Boolean(accessToken);
  useEffect(() => {
    if (lastTeamRef.current !== teamId) {
      lastTeamRef.current = teamId;
      dataRef.current = null;
      setKeyData(null);
      setError(null);
    }
    if (!enabled || !hasToken) return;
    load();
  }, [enabled, teamId, hasToken, load]);

  const retry = useCallback(() => {
    load();
  }, [load]);

  return { loading, error, keyData, retry };
}
