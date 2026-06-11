import { useState, useEffect } from "react";
import { useAuthInfo } from "@propelauth/react";

/**
 * Checks whether the logged-in user is a member of a specific team for an event.
 * Membership must come from the server because the public team payload omits `propel_id` (PII).
 */
export default function useTeamMembership(eventId, teamId) {
  const { accessToken, isLoggedIn } = useAuthInfo();
  const [isOnTeam, setIsOnTeam] = useState(false);
  const [membershipChecked, setMembershipChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!isLoggedIn || !accessToken || !eventId || !teamId) {
      setIsOnTeam(false);
      setMembershipChecked(!!eventId);
      return undefined;
    }
    setMembershipChecked(false);
    fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/team/${eventId}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => (r.ok ? r.json() : { teams: [] }))
      .then((data) => {
        if (cancelled) return;
        const myTeams = Array.isArray(data?.teams) ? data.teams : [];
        setIsOnTeam(myTeams.some((t) => t?.id === teamId));
        setMembershipChecked(true);
      })
      .catch(() => {
        if (cancelled) return;
        setIsOnTeam(false);
        setMembershipChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, accessToken, eventId, teamId]);

  return { isOnTeam, membershipChecked };
}
