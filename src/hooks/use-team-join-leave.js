import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthInfo } from "@propelauth/react";
import useTeamMembership from "./use-team-membership";
import {
  fetchHackerStatus,
  isMembershipRefusal,
  joinTeam,
  leaveTeam,
} from "../lib/teamMembershipApi";

/**
 * Membership + join/leave for ONE team, for pages that render a single team
 * (the public team page). Builds on `useTeamMembership` (server-side
 * membership — the public payload omits `propel_id`) and adds:
 *
 * - `hackerStatus`: "approved" | "pending" | "none" | null (loading). Only
 *   approved hackers may join — mentors/judges resolve to "none".
 * - `join()` / `leave()`: call the shared `teamMembershipApi`; on success the
 *   membership answer is overridden locally until the next server check
 *   (a token-rotation refetch), so the UI flips at once without a refetch.
 * - `pending` ("join" | "leave" | null), `error` (participant-readable),
 *   `result` ({ action, noop } for the last success), `clearFeedback()`.
 * - `refusal`: `{ action, code, reason }` when the SERVER refused under its
 *   participant rules (api/teams/membership_rules.py) — the page renders
 *   `reason` as that action's blocked state, not as an error.
 *
 * Token-rotation pattern: the access token is read through a ref and the
 * status effect keys on token PRESENCE, so a PropelAuth refresh on refocus
 * never re-runs the fetch or clobbers an in-flight action.
 */
export default function useTeamJoinLeave({
  eventId,
  teamId,
  source = "team_page",
  onJoined,
  onLeft,
}) {
  const { accessToken, isLoggedIn, loading: authLoading } = useAuthInfo();
  const tokenRef = useRef(accessToken);
  tokenRef.current = accessToken;
  const hasToken = Boolean(accessToken);

  const membership = useTeamMembership(eventId, teamId);
  const [override, setOverride] = useState(null); // { teamId, isOnTeam }
  const [hackerStatus, setHackerStatus] = useState(null);
  const [pending, setPending] = useState(null);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [refusal, setRefusal] = useState(null); // { teamId, action, code, reason }

  const onJoinedRef = useRef(onJoined);
  const onLeftRef = useRef(onLeft);
  onJoinedRef.current = onJoined;
  onLeftRef.current = onLeft;

  // A fresh server answer (membershipChecked false → true) wins over the
  // optimistic override from an earlier join/leave.
  const checkedRef = useRef(membership.membershipChecked);
  useEffect(() => {
    if (membership.membershipChecked && !checkedRef.current) {
      setOverride(null);
    }
    checkedRef.current = membership.membershipChecked;
  }, [membership.membershipChecked]);

  useEffect(() => {
    let cancelled = false;
    if (!isLoggedIn || !hasToken || !eventId) {
      setHackerStatus(isLoggedIn ? null : "none");
      return undefined;
    }
    setHackerStatus(null);
    fetchHackerStatus({ accessToken: tokenRef.current, eventId }).then(
      (status) => {
        if (!cancelled) setHackerStatus(status);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, hasToken, eventId]);

  const run = useCallback(
    async (action) => {
      if (!teamId || pending) return;
      setPending(action);
      setError(null);
      setResult(null);
      try {
        const fn = action === "join" ? joinTeam : leaveTeam;
        const res = await fn({
          accessToken: tokenRef.current,
          teamId,
          eventId,
          source,
        });
        setOverride({ teamId, isOnTeam: action === "join" });
        setResult({ action, noop: Boolean(res?.noop) });
        const cb = action === "join" ? onJoinedRef.current : onLeftRef.current;
        if (cb) cb(res);
      } catch (err) {
        if (isMembershipRefusal(err)) {
          // The server's rules say no (event ended, team closed, not an
          // approved hacker…): settle into the blocked state, no error strip.
          setRefusal({ teamId, action, code: err.code, reason: err.message });
        } else {
          setError(
            err?.message || `Couldn't ${action} the team. Please try again.`,
          );
        }
      } finally {
        setPending(null);
      }
    },
    [teamId, eventId, source, pending],
  );

  const join = useCallback(() => run("join"), [run]);
  const leave = useCallback(() => run("leave"), [run]);
  const clearFeedback = useCallback(() => {
    setError(null);
    setResult(null);
  }, []);

  const isOnTeam =
    override && override.teamId === teamId
      ? override.isOnTeam
      : membership.isOnTeam;

  return {
    isLoggedIn: Boolean(isLoggedIn),
    isOnTeam,
    // False while PropelAuth is still resolving, so the UI never flashes a
    // "Log in to join" button at someone who is logged in.
    membershipChecked: !authLoading && membership.membershipChecked,
    hackerStatus,
    pending,
    error,
    result,
    refusal:
      refusal && refusal.teamId === teamId
        ? { action: refusal.action, code: refusal.code, reason: refusal.reason }
        : null,
    join,
    leave,
    clearFeedback,
  };
}
