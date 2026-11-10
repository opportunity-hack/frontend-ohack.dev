import axios from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuthInfo } from "@propelauth/react";
import { useEnv } from "../context/env.context";
import { deriveMentorGate } from "../lib/mentorCheckinGate";

const REFOCUS_THROTTLE_MS = 15000;

const authHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

const formatLongDate = (value) =>
  new Date(value).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

/** The single-event payload → the display shape the page has always used. */
export function toMentorCheckinEvent(eventId, data) {
  return {
    id: eventId,
    name: data.title || `Opportunity Hack - ${eventId}`,
    description: data.description || "Annual hackathon for nonprofits",
    date: new Date(data.start_date).getFullYear().toString(),
    startDate: data.start_date,
    endDate: data.end_date,
    timezone: data.timezone,
    formattedStartDate: formatLongDate(data.start_date),
    formattedEndDate: formatLongDate(data.end_date),
    location: data.location || "Tempe, Arizona",
    image:
      data.image_url || "https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp",
  };
}

const EVENT_LOADING = {
  status: "loading",
  event: null,
  teams: [],
  nonprofits: [],
};
const MENTOR_LOADING = {
  status: "loading",
  mentor: null,
  checkedIn: false,
  window: null,
};

// Fold a /status payload into the mentor state. `/status` reads the volunteer
// doc straight from Firestore (no cache), so its `isSelected` and review
// `status` win over the application GET — that one goes through a backend
// cache, and a stale copy once made refreshes alternate between "awaiting
// confirmation" and "not selected" (Nov 2026). Older backends send no
// `status` key; then the application's value stands.
function applyStatus(prev, status) {
  let mentor = prev.mentor;
  if (mentor) {
    const fresh = {};
    if (typeof status.isSelected === "boolean")
      fresh.isSelected = status.isSelected;
    if (Object.prototype.hasOwnProperty.call(status, "status")) {
      fresh.status = status.status;
    }
    if (Object.keys(fresh).length) mentor = { ...mentor, ...fresh };
  }
  return {
    ...prev,
    mentor,
    checkedIn: Boolean(status.isCheckedIn),
    window: status.window || null,
  };
}

/**
 * Everything /hack/[event_id]/mentor-checkin reads, behind one stable gate.
 *
 * Why a hook (Nov 2026): the page used ONE effect keyed on
 * `[event_id, isLoggedIn, user, accessToken]` with no cancellation. A stale run
 * started while PropelAuth was still resolving finished first and rendered
 * "You are not registered as a mentor" before the real run landed, and every
 * token rotation on refocus re-ran it (spinner, table remount).
 *
 * - The public event fetch keys on `event_id` only.
 * - The mentor fetch keys on `event_id`, `isLoggedIn`, `user?.userId` and token
 *   PRESENCE — never the token value or the `user` object. The token is read
 *   through a ref (token-rotation pattern).
 * - Every effect cancels on cleanup; a stale run never calls a setter.
 * - A `/status` failure never clears `mentor` (the application GET already
 *   proved they applied); it just leaves `checkedIn` false.
 * - `refreshStatus()` re-reads `/status` only and never shows the spinner; it
 *   runs on tab refocus (15s throttle) so an admin reset or an approval lands
 *   on an open tab.
 */
export default function useMentorCheckin(eventId) {
  const { loading: authLoading, isLoggedIn, user, accessToken } = useAuthInfo();
  const { apiServerUrl } = useEnv();

  const tokenRef = useRef(accessToken);
  tokenRef.current = accessToken;
  const hasToken = Boolean(accessToken);
  const userId = user?.userId || null;

  const [eventState, setEventState] = useState(EVENT_LOADING);
  const [mentorState, setMentorState] = useState(MENTOR_LOADING);
  const [eventReload, setEventReload] = useState(0);
  const [mentorReload, setMentorReload] = useState(0);

  // Bumped on every mentor-fetch run; a refresh started under an older
  // identity checks it before writing.
  const generationRef = useRef(0);
  const mentorRef = useRef(null);
  mentorRef.current = mentorState.mentor;
  const lastRefreshRef = useRef(0);

  // ---- public event (title, dates, teams, nonprofits) ----
  useEffect(() => {
    if (!eventId || !apiServerUrl) return undefined;
    let cancelled = false;
    setEventState(EVENT_LOADING);
    (async () => {
      try {
        const res = await fetch(
          `${apiServerUrl}/api/messages/hackathon/${eventId}`,
        );
        if (!res.ok)
          throw new Error(`Failed to fetch event data: ${res.status}`);
        const data = await res.json();
        if (!data || !data.start_date || !data.end_date) {
          throw new Error("Invalid event data received");
        }
        if (cancelled) return;
        setEventState({
          status: "ready",
          event: toMentorCheckinEvent(eventId, data),
          teams: Array.isArray(data.teams) ? data.teams : [],
          nonprofits: Array.isArray(data.nonprofits) ? data.nonprofits : [],
        });
      } catch (err) {
        if (cancelled) return;
        console.error("Error fetching event data:", err);
        setEventState({ ...EVENT_LOADING, status: "error" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId, apiServerUrl, eventReload]);

  const readStatus = useCallback(async () => {
    const { data } = await axios({
      url: `${apiServerUrl}/api/mentor/checkin/${eventId}/status`,
      method: "GET",
      headers: authHeaders(tokenRef.current),
    });
    return data?.data || {};
  }, [apiServerUrl, eventId]);

  // ---- the logged-in user's mentor application + check-in status ----
  useEffect(() => {
    generationRef.current += 1;
    const generation = generationRef.current;
    if (!eventId || !apiServerUrl) return undefined;
    if (authLoading) {
      setMentorState(MENTOR_LOADING);
      return undefined;
    }
    if (!isLoggedIn || !hasToken) {
      setMentorState({
        ...MENTOR_LOADING,
        status: isLoggedIn ? "loading" : "idle",
      });
      return undefined;
    }
    let cancelled = false;
    setMentorState(MENTOR_LOADING);
    (async () => {
      let mentor = null;
      try {
        const res = await axios({
          url: `${apiServerUrl}/api/mentor/application/${eventId}`,
          method: "GET",
          headers: authHeaders(tokenRef.current),
        });
        mentor = res.data?.data || null;
      } catch (err) {
        if (cancelled) return;
        // The application route answers 200 + data:null for "no application";
        // a 404 still means "none", anything else is a real failure.
        if (err?.response?.status === 404) {
          setMentorState({ ...MENTOR_LOADING, status: "ready" });
        } else {
          console.error("Error fetching mentor application:", err);
          setMentorState({ ...MENTOR_LOADING, status: "error" });
        }
        return;
      }
      if (cancelled) return;
      if (!mentor) {
        setMentorState({ ...MENTOR_LOADING, status: "ready" });
        return;
      }
      let next = { status: "ready", mentor, checkedIn: false, window: null };
      try {
        const status = await readStatus();
        next = applyStatus(next, status);
      } catch (err) {
        // Never demote a found mentor to "not registered" because /status
        // failed (older backend identity mismatch, blip, …).
        console.warn(
          "Mentor check-in status unavailable:",
          err?.message || err,
        );
      }
      if (cancelled || generation !== generationRef.current) return;
      lastRefreshRef.current = Date.now();
      setMentorState(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [
    eventId,
    apiServerUrl,
    authLoading,
    isLoggedIn,
    userId,
    hasToken,
    mentorReload,
    readStatus,
  ]);

  const refreshStatus = useCallback(async () => {
    if (!mentorRef.current || !tokenRef.current) return;
    const generation = generationRef.current;
    lastRefreshRef.current = Date.now();
    try {
      const status = await readStatus();
      if (generation !== generationRef.current) return;
      setMentorState((prev) =>
        prev.mentor ? applyStatus(prev, status) : prev,
      );
    } catch (err) {
      console.warn(
        "Mentor check-in status refresh failed:",
        err?.message || err,
      );
    }
  }, [readStatus]);

  // Refocus → re-read /status (an admin reset, an approval, the window opening).
  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const onVisibility = () => {
      if (document.hidden) return;
      if (Date.now() - lastRefreshRef.current < REFOCUS_THROTTLE_MS) return;
      refreshStatus();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [refreshStatus]);

  const retry = useCallback(() => {
    if (eventState.status === "error") setEventReload((n) => n + 1);
    if (mentorState.status === "error") setMentorReload((n) => n + 1);
  }, [eventState.status, mentorState.status]);

  const setCheckedIn = useCallback((value) => {
    setMentorState((prev) => ({ ...prev, checkedIn: Boolean(value) }));
  }, []);

  const gate = useMemo(
    () =>
      deriveMentorGate({
        authLoading,
        isLoggedIn,
        eventStatus: eventState.status,
        mentorStatus: mentorState.status,
        mentor: mentorState.mentor,
      }),
    [
      authLoading,
      isLoggedIn,
      eventState.status,
      mentorState.status,
      mentorState.mentor,
    ],
  );

  return {
    gate,
    event: eventState.event,
    teams: eventState.teams,
    nonprofits: eventState.nonprofits,
    mentor: mentorState.mentor,
    checkedIn: mentorState.checkedIn,
    checkinWindow: mentorState.window,
    refreshStatus,
    retry,
    setCheckedIn,
    tokenRef,
  };
}
