import { useCallback, useEffect, useRef, useState } from "react";
import {
  saveTeamProject,
  submitTeamProject,
  isSubmissionsClosed,
  isNotFound,
  isInvalidProject,
  formatProjectErrors,
} from "../lib/teamDashboardApi";

const PROJECT_FIELDS = [
  "project_tagline",
  "project_story",
  "project_built_with",
  "project_links",
  "project_thumbnail_url",
  "project_images",
];

const ARRAY_FIELDS = new Set([
  "project_built_with",
  "project_links",
  "project_images",
]);

const SAVE_DEBOUNCE_MS = 1500;

function pickProjectFields(team) {
  const out = {};
  PROJECT_FIELDS.forEach((key) => {
    const value = team?.[key];
    out[key] = value !== undefined ? value : ARRAY_FIELDS.has(key) ? [] : "";
  });
  return out;
}

function diffChanged(committed, draft) {
  const changed = {};
  PROJECT_FIELDS.forEach((key) => {
    const a = committed[key];
    const b = draft[key];
    const same = ARRAY_FIELDS.has(key)
      ? JSON.stringify(a) === JSON.stringify(b)
      : a === b;
    if (!same) changed[key] = b;
  });
  return changed;
}

const IDLE_SAVE_STATE = {
  status: "idle",
  lastSavedAt: null,
  error: null,
  deadline: null,
  lateUntil: null,
};

/**
 * Owns the team's project write-up draft: autosaves changed fields 1.5s
 * after the last edit, and exposes `submit()` for the "Submit project"
 * action (Part 3: `POST /api/team/<id>/project`, `/project/submit`).
 *
 * Only the fields that actually changed since the last successful save are
 * sent — `set(merge=True)` on the backend makes a partial update safe.
 * `draft` re-seeds from `team.project_*` only when the *active team*
 * changes (`team.id`), never on every `onTeamUpdated` merge — otherwise an
 * in-flight edit would be clobbered by the echo of its own save.
 */
export default function useTeamProject({ team, accessToken, onTeamUpdated }) {
  const teamId = team?.id;
  const teamIdRef = useRef(teamId);
  const [draft, setDraft] = useState(() => pickProjectFields(team));
  const draftRef = useRef(draft);
  const committedRef = useRef(pickProjectFields(team));
  const [saveState, setSaveState] = useState(IDLE_SAVE_STATE);
  const saveStateRef = useRef(saveState);
  const timerRef = useRef(null);

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);
  useEffect(() => {
    saveStateRef.current = saveState;
  }, [saveState]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Re-seed only when the active team changes — not on every team update.
  useEffect(() => {
    if (teamId === teamIdRef.current) return;
    teamIdRef.current = teamId;
    clearTimer();
    const seeded = pickProjectFields(team);
    setDraft(seeded);
    draftRef.current = seeded;
    committedRef.current = seeded;
    setSaveState(IDLE_SAVE_STATE);
  }, [teamId]);

  const doSave = useCallback(async () => {
    if (!teamId || !accessToken) return;
    const changed = diffChanged(committedRef.current, draftRef.current);
    if (Object.keys(changed).length === 0) return;
    setSaveState((s) => ({ ...s, status: "saving", error: null }));
    try {
      const res = await saveTeamProject(teamId, changed, accessToken);
      committedRef.current = { ...committedRef.current, ...changed };
      setSaveState({
        status: "saved",
        lastSavedAt: Date.now(),
        error: null,
        deadline: res?.window?.submission ?? null,
        lateUntil: res?.window?.late_until ?? null,
      });
      if (onTeamUpdated && res?.team) onTeamUpdated(teamId, res.team);
    } catch (err) {
      if (isSubmissionsClosed(err)) {
        clearTimer();
        setSaveState({
          status: "closed",
          lastSavedAt: null,
          error: null,
          deadline: err.body?.deadline ?? null,
          lateUntil: err.body?.late_until ?? null,
        });
      } else if (isNotFound(err)) {
        clearTimer();
        setSaveState((s) => ({ ...s, status: "unavailable" }));
      } else if (isInvalidProject(err)) {
        // A specific field (most often the thumbnail — the backend only
        // accepts its own CDN URLs under teams/<id>/) failed validation.
        // Surface the field + reason rather than a generic "couldn't save"
        // so the user knows what to fix instead of retrying blindly.
        setSaveState((s) => ({
          ...s,
          status: "error",
          error: formatProjectErrors(err.body?.errors),
        }));
      } else {
        // Unknown failure — no specific field to point at, so the UI falls
        // back to its generic "we'll retry" copy rather than showing a raw
        // status message.
        setSaveState((s) => ({ ...s, status: "error", error: null }));
      }
    }
  }, [teamId, accessToken, onTeamUpdated, clearTimer]);

  const setField = useCallback(
    (key, value) => {
      setDraft((prev) => {
        const next = { ...prev, [key]: value };
        draftRef.current = next;
        return next;
      });
      // Once the window's closed or the endpoint's missing, further local
      // edits are still allowed (nothing stops the user from typing) but we
      // stop retrying the network call every keystroke.
      if (
        saveStateRef.current.status === "closed" ||
        saveStateRef.current.status === "unavailable"
      ) {
        return;
      }
      clearTimer();
      timerRef.current = setTimeout(() => {
        doSave();
      }, SAVE_DEBOUNCE_MS);
    },
    [clearTimer, doSave],
  );

  const flush = useCallback(async () => {
    clearTimer();
    await doSave();
  }, [clearTimer, doSave]);

  const submit = useCallback(async () => {
    await flush();
    if (!teamId || !accessToken) return { success: false };
    try {
      const res = await submitTeamProject(teamId, accessToken);
      if (onTeamUpdated && res?.team) onTeamUpdated(teamId, res.team);
      return {
        success: true,
        alreadySubmitted: !!res?.already_submitted,
        team: res?.team,
      };
    } catch (err) {
      if (isSubmissionsClosed(err)) {
        return {
          success: false,
          closed: true,
          deadline: err.body?.deadline ?? null,
          lateUntil: err.body?.late_until ?? null,
        };
      }
      if (isNotFound(err)) {
        return { success: false, unavailable: true };
      }
      if (err?.body?.error === "incomplete") {
        return {
          success: false,
          incomplete: true,
          missing: err.body?.missing || [],
        };
      }
      return {
        success: false,
        error: err?.message || "Couldn't submit your project",
      };
    }
  }, [flush, teamId, accessToken, onTeamUpdated]);

  // Keep the latest `doSave` in a ref so the unmount effect below can call
  // it without depending on its identity — `doSave` is recreated whenever
  // `accessToken` changes (PropelAuth rotates it on tab refocus), and an
  // effect keyed on `[doSave]` would re-run its cleanup on every rotation,
  // firing whatever save is mid-debounce right then instead of waiting the
  // documented 1.5s.
  const doSaveRef = useRef(doSave);
  useEffect(() => {
    doSaveRef.current = doSave;
  }, [doSave]);

  // On unmount (e.g. `TeamDashboard` is keyed by team id — switching teams
  // in `TeamSwitcher` unmounts this hook instance entirely), flush any edit
  // still sitting in the 1.5s debounce instead of just discarding the
  // timer, so an edit made just before switching teams isn't silently
  // lost. Fire-and-forget: there's no state left to update once unmounted,
  // but the network write should still land. Empty deps — this must only
  // run on TRUE unmount, not on every `doSave` identity change.
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        doSaveRef.current();
      }
    };
  }, []);

  return { draft, setField, saveState, submit, flush };
}
