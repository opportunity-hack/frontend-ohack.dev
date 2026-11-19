import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Mentor engagement for one event (GET /api/admin/mentor-engagement/<event>).
// One fetch feeds the Mentors table's Engagement column, the detail dialog and
// the ranked panel. Token/org are read through refs and the effect is keyed on
// token PRESENCE — PropelAuth rotates the token on tab refocus.
export default function useMentorEngagement({ eventId, accessToken, orgId, enabled }) {
  const [state, setState] = useState({ data: null, loading: false, error: "" });
  const tokenRef = useRef(accessToken);
  const orgRef = useRef(orgId);
  tokenRef.current = accessToken;
  orgRef.current = orgId;
  const requestRef = useRef(0);

  const reload = useCallback(async () => {
    if (!eventId || !tokenRef.current) return;
    const request = ++requestRef.current;
    setState((prev) => ({ ...prev, loading: true, error: "" }));
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/admin/mentor-engagement/${eventId}`,
        { headers: { authorization: `Bearer ${tokenRef.current}`, "X-Org-Id": orgRef.current } },
      );
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      if (request === requestRef.current) setState({ data, loading: false, error: "" });
    } catch (e) {
      if (request === requestRef.current) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: `Could not load mentor engagement. ${e.message}`,
        }));
      }
    }
  }, [eventId]);

  const hasToken = Boolean(accessToken);
  useEffect(() => {
    if (!enabled || !hasToken || !eventId) return;
    setState({ data: null, loading: false, error: "" });
    reload();
  }, [enabled, hasToken, eventId, reload]);

  const byVolunteerId = useMemo(() => {
    const map = {};
    (state.data?.mentors || []).forEach((row) => {
      if (row.volunteer_id) map[row.volunteer_id] = row;
    });
    return map;
  }, [state.data]);

  return { ...state, byVolunteerId, reload };
}
