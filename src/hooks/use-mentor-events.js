import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthInfo } from "@propelauth/react";
import { useEnv } from "../context/env.context";

// Lean application fields the dashboard reads; mirrors the backend's
// _MENTOR_EVENT_SELF_FIELDS so the older-backend probe below produces the
// same shape as GET /api/mentor/me/events.
const SELF_FIELDS = [
  "status",
  "inPerson",
  "isInPerson",
  "availability",
  "checkInTime",
  "timeSlot",
  "timestamp",
];

const authHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

const INITIAL = { status: "loading", events: [], error: "", available: true };

/**
 * Every event the logged-in user has a mentor application for — ONE request
 * (`GET /api/mentor/me/events`, the mentor counterpart of the judge
 * assignments call). `available: false` means the route 404'd (older
 * backend); the page then falls back to `useMentorEventProbe`.
 *
 * Token-rotation pattern: the token is read through a ref and the load
 * effect keys on its PRESENCE, so a PropelAuth refresh on refocus never
 * re-triggers a load.
 */
export default function useMentorEvents() {
  const { accessToken } = useAuthInfo();
  const { apiServerUrl } = useEnv();
  const tokenRef = useRef(accessToken);
  tokenRef.current = accessToken;
  const [state, setState] = useState(INITIAL);

  const load = useCallback(async () => {
    if (!tokenRef.current) return;
    setState((s) => ({ ...s, status: "loading", error: "" }));
    try {
      const { data } = await axios.get(`${apiServerUrl}/api/mentor/me/events`, {
        headers: authHeaders(tokenRef.current),
      });
      const events = Array.isArray(data?.data?.events) ? data.data.events : [];
      setState({ status: "ready", events, error: "", available: true });
    } catch (err) {
      if (err?.response?.status === 404) {
        setState({ status: "ready", events: [], error: "", available: false });
        return;
      }
      setState({
        status: "error",
        events: [],
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Couldn't load your mentoring events",
        available: true,
      });
    }
  }, [apiServerUrl]);

  const hasToken = Boolean(accessToken);
  useEffect(() => {
    if (hasToken) load();
  }, [hasToken, load]);

  return { ...state, reload: load };
}

/**
 * Older-backend fallback: when the batched route is missing, probe the
 * per-event application route (the one mentor-checkin already uses) for each
 * current/upcoming hackathon and synthesize the same event shape. Past events
 * are not probed (that would be one request per archive entry).
 */
export function useMentorEventProbe({ enabled, hackathons }) {
  const { accessToken } = useAuthInfo();
  const { apiServerUrl } = useEnv();
  const tokenRef = useRef(accessToken);
  tokenRef.current = accessToken;
  const hackathonsRef = useRef(hackathons);
  hackathonsRef.current = hackathons;
  const [state, setState] = useState({ status: "idle", events: [] });

  const hasToken = Boolean(accessToken);
  const key = (hackathons || [])
    .map((h) => h?.event_id)
    .filter(Boolean)
    .join("|");

  useEffect(() => {
    if (!enabled || !hasToken || !key) {
      setState({ status: enabled && key ? "loading" : "idle", events: [] });
      return undefined;
    }
    let cancelled = false;
    setState({ status: "loading", events: [] });
    const list = (hackathonsRef.current || []).filter((h) => h?.event_id);
    Promise.all(
      list.map((h) =>
        axios
          .get(
            `${apiServerUrl}/api/mentor/application/${encodeURIComponent(h.event_id)}`,
            { headers: authHeaders(tokenRef.current) },
          )
          .then(({ data }) => data?.data || null)
          .catch(() => null),
      ),
    ).then((apps) => {
      if (cancelled) return;
      const events = [];
      apps.forEach((app, i) => {
        if (!app) return;
        const h = list[i];
        const application = {};
        SELF_FIELDS.forEach((k) => {
          if (app[k] !== undefined && app[k] !== null) application[k] = app[k];
        });
        application.isSelected = Boolean(app.isSelected);
        application.isCheckedIn = Boolean(app.isCheckedIn);
        events.push({
          event_id: h.event_id,
          id: h.id,
          title: h.title,
          start_date: h.start_date,
          end_date: h.end_date,
          location: h.location,
          timezone: h.timezone,
          image_url: h.image_url,
          application,
        });
      });
      setState({ status: "ready", events });
    });
    return () => {
      cancelled = true;
    };
  }, [enabled, hasToken, key, apiServerUrl]);

  return state;
}
