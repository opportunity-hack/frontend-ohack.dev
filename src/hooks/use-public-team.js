import { useCallback, useEffect, useRef, useState } from "react";
import { getPublicTeam } from "../lib/teamDashboardApi";

const LIVE_TEAM_FIELDS = new Set([
  "demo_video_url",
  "demo_video_url_submitted",
  "devpost_link",
]);

export function isLiveTeamField(key) {
  return (
    key.startsWith("mentor_") ||
    key.startsWith("project_") ||
    LIVE_TEAM_FIELDS.has(key)
  );
}

/**
 * Team roster for the dashboard's "Who's on the team" section.
 *
 * `GET /api/team/<event>/me` (what the dashboard already fetches for status)
 * strips `users[]` for privacy, so the roster needs one call to the public
 * `GET /api/messages/team/<id>` for the active team — but only when the
 * team we already have doesn't carry `users[]` itself (e.g. it does once
 * `onTeamUpdated` has merged a prior roster fetch back in).
 *
 * Refetches on tab refocus (`visibilitychange`) so mentor activity that
 * happened while the tab was backgrounded shows up without a manual
 * reload, mirroring `use-live-team.js`. `mentor_*` fields and the fields
 * teammates edit on the dashboard (`project_*`, demo video, DevPost) on the
 * refreshed payload are merged back into the shared team state via
 * `onTeamUpdated`, so `MentorSupportCard` and the editors benefit from the
 * same refetch without their own call.
 */
export default function usePublicTeam(team, onTeamUpdated) {
  const teamId = team?.id;
  const hasUsers = Array.isArray(team?.users);
  const [users, setUsers] = useState(hasUsers ? team.users : null);
  const [loading, setLoading] = useState(!hasUsers);
  const fetchedIdRef = useRef(null);

  const fetchRoster = useCallback(
    async (id) => {
      try {
        const data = await getPublicTeam(id);
        const fresh = data?.team || data;
        if (!fresh) return;
        setUsers(Array.isArray(fresh.users) ? fresh.users : []);
        if (onTeamUpdated) {
          // Mentor activity plus everything teammates edit on this same
          // dashboard (write-up, demo video, DevPost) — so a page left open
          // doesn't keep showing, and then save over, an old version.
          const liveFields = Object.fromEntries(
            Object.entries(fresh).filter(([key]) => isLiveTeamField(key)),
          );
          if (Object.keys(liveFields).length > 0) {
            onTeamUpdated(id, liveFields);
          }
        }
      } catch {
        // Non-critical — roster/mentor refresh is best-effort.
      } finally {
        setLoading(false);
      }
    },
    [onTeamUpdated],
  );

  useEffect(() => {
    if (!teamId) return;
    if (hasUsers) {
      setUsers(team.users);
      setLoading(false);
      fetchedIdRef.current = teamId;
      return;
    }
    if (fetchedIdRef.current === teamId) return;
    fetchedIdRef.current = teamId;
    setLoading(true);
    fetchRoster(teamId);
  }, [teamId, hasUsers]);

  useEffect(() => {
    if (!teamId || typeof document === "undefined") return undefined;
    const onVisibility = () => {
      if (!document.hidden) fetchRoster(teamId);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [teamId, fetchRoster]);

  return { users, loading };
}
