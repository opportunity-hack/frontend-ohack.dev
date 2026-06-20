import { useState, useEffect } from "react";

/**
 * Keeps team + event state live after hydration. ISR (revalidate: 60) plus the
 * backend's 10-min TTL on get_team would otherwise show stale users[] /
 * checklist / mentor state for several minutes, so every team page refetches on
 * the client once mounted. Mirrors the effect that lives on the team overview
 * page so the mentor / completion sub-pages stay consistent.
 *
 * @param {string} eventId
 * @param {string} teamId
 * @param {object} initialTeam  - SSR team data (from getStaticProps)
 * @param {object} initialEvent - SSR event data
 * @returns {{ team, setTeam, event, loading, error }}
 */
export default function useLiveTeam(eventId, teamId, initialTeam, initialEvent) {
  const [team, setTeam] = useState(initialTeam || null);
  const [event, setEvent] = useState(initialEvent || null);
  const [loading, setLoading] = useState(!initialTeam);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!eventId || !teamId) return undefined;
    const hadSsrData = !!(initialTeam && initialEvent);
    let cancelled = false;

    const fetchData = async () => {
      if (!hadSsrData) setLoading(true);
      try {
        const [teamRes, eventRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/team/${teamId}`),
          fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${eventId}`),
        ]);

        if (!teamRes.ok) {
          if (!hadSsrData && !cancelled) setError("Team not found");
          return;
        }

        const teamJson = await teamRes.json();
        const eventJson = eventRes.ok ? await eventRes.json() : null;
        if (cancelled) return;
        setTeam(teamJson.team || teamJson);
        if (eventJson) setEvent(eventJson);
      } catch (err) {
        console.error("Error fetching team data:", err);
        if (!hadSsrData && !cancelled) setError("Failed to load team details");
      } finally {
        if (!hadSsrData && !cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, teamId]);

  return { team, setTeam, event, loading, error };
}
