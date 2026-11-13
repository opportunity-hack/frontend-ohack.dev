import { useCallback, useEffect, useRef, useState } from "react";
import {
  saveTeamProject,
  submitTeamProject,
  isSubmissionsClosed,
  isNotFound,
  isInvalidProject,
  isProjectConflict,
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

function fieldValue(team, key) {
  const value = team?.[key];
  return value !== undefined ? value : ARRAY_FIELDS.has(key) ? [] : "";
}

function pickProjectFields(team) {
  const out = {};
  PROJECT_FIELDS.forEach((key) => {
    out[key] = fieldValue(team, key);
  });
  return out;
}

function sameValue(key, a, b) {
  if (ARRAY_FIELDS.has(key)) {
    return JSON.stringify(a ?? []) === JSON.stringify(b ?? []);
  }
  return (a ?? "") === (b ?? "");
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

// Teammates edit the same write-up at once. The backend stamps every saved
// field with a revision (`project_field_meta[field] = {rev, by, at}`); a
// field's revision moving past the one this page last saw means a teammate
// saved it. Absent meta (legacy doc / older backend) reads as revision 0.
function fieldRev(team, key) {
  const rev = team?.project_field_meta?.[key]?.rev;
  return Number.isInteger(rev) ? rev : 0;
}

function pickRevs(team) {
  const out = {};
  PROJECT_FIELDS.forEach((key) => {
    out[key] = fieldRev(team, key);
  });
  return out;
}

function conflictFrom(team, key) {
  return {
    value: fieldValue(team, key),
    rev: fieldRev(team, key),
    by: team?.project_field_meta?.[key]?.by || null,
  };
}

const CONFLICT_SUBMIT_MESSAGE =
  "A teammate changed part of the write-up while you were editing. Choose which version to keep, then submit again.";

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
 *
 * Several teammates can have this page open at once:
 *  - a field this person has NOT touched follows the server (refocus refetch
 *    and every save response) instead of staying frozen at page-load;
 *  - a field with unsaved local edits that a teammate saved meanwhile becomes
 *    a `conflicts[field]` entry (`{value, rev, by}`), its autosave pauses, and
 *    `resolveConflict(field, "mine" | "theirs")` decides. Saves carry
 *    `base_revs`, so the backend refuses (409 `project_conflict`) to overwrite
 *    a newer teammate save even when this page hasn't heard about it yet.
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
  const seenRevRef = useRef(pickRevs(team));
  const [conflicts, setConflicts] = useState({});
  const conflictsRef = useRef(conflicts);
  const updateConflicts = useCallback((updater) => {
    const next = updater(conflictsRef.current);
    conflictsRef.current = next;
    setConflicts(next);
  }, []);
  const [saveState, setSaveState] = useState(IDLE_SAVE_STATE);
  const saveStateRef = useRef(saveState);
  const timerRef = useRef(null);
  // Token-rotation pattern (Class C, Nov 2026): PropelAuth mints a fresh
  // accessToken on refocus. Saves read it through a ref, so a debounced save
  // scheduled before a rotation sends the CURRENT token and `doSave` keeps a
  // stable identity.
  const tokenRef = useRef(accessToken);
  tokenRef.current = accessToken;

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
    seenRevRef.current = pickRevs(team);
    updateConflicts(() => ({}));
    setSaveState(IDLE_SAVE_STATE);
  }, [teamId]);

  // A teammate's save reached this page (refocus refetch or a save response
  // merged into `team`): untouched fields adopt it, edited fields conflict.
  // Keyed on the revision map, so merges that don't move a revision (mentor
  // fields, an older backend) do nothing.
  const fieldMeta = team?.project_field_meta;
  useEffect(() => {
    if (!teamId || teamId !== teamIdRef.current) return;
    const adopted = {};
    const found = {};
    PROJECT_FIELDS.forEach((key) => {
      const rev = fieldRev(team, key);
      if (rev <= seenRevRef.current[key]) return;
      const incoming = fieldValue(team, key);
      const local = draftRef.current[key];
      const dirty = !sameValue(key, committedRef.current[key], local);
      if (!dirty || sameValue(key, incoming, local)) {
        adopted[key] = dirty ? local : incoming;
        committedRef.current = { ...committedRef.current, [key]: incoming };
        seenRevRef.current = { ...seenRevRef.current, [key]: rev };
      } else {
        found[key] = conflictFrom(team, key);
      }
    });
    if (Object.keys(adopted).length > 0) {
      const next = { ...draftRef.current, ...adopted };
      draftRef.current = next;
      setDraft(next);
      updateConflicts((prev) => {
        const kept = { ...prev };
        Object.keys(adopted).forEach((key) => delete kept[key]);
        return kept;
      });
    }
    if (Object.keys(found).length > 0) {
      updateConflicts((prev) => ({ ...prev, ...found }));
    }
  }, [fieldMeta, teamId]);

  const doSaveRef = useRef(null);
  const doSave = useCallback(async () => {
    if (!teamId || !tokenRef.current) return;
    const changed = diffChanged(committedRef.current, draftRef.current);
    // A field waiting on "keep mine / use theirs" is not sent.
    Object.keys(conflictsRef.current).forEach((key) => delete changed[key]);
    if (Object.keys(changed).length === 0) return;
    const baseRevs = {};
    Object.keys(changed).forEach((key) => {
      baseRevs[key] = seenRevRef.current[key];
    });
    setSaveState((s) => ({ ...s, status: "saving", error: null }));
    try {
      const res = await saveTeamProject(
        teamId,
        { ...changed, base_revs: baseRevs },
        tokenRef.current,
      );
      committedRef.current = { ...committedRef.current, ...changed };
      // Record the revisions of our own save BEFORE the response is merged
      // into `team`, so the sync effect doesn't read it as a teammate's.
      if (res?.team?.project_field_meta) {
        const seen = { ...seenRevRef.current };
        Object.keys(changed).forEach((key) => {
          seen[key] = fieldRev(res.team, key);
        });
        seenRevRef.current = seen;
      }
      setSaveState({
        status: "saved",
        lastSavedAt: Date.now(),
        error: null,
        deadline: res?.window?.submission ?? null,
        lateUntil: res?.window?.late_until ?? null,
      });
      if (onTeamUpdated && res?.team) onTeamUpdated(teamId, res.team);
    } catch (err) {
      if (isProjectConflict(err)) {
        // A teammate saved one of these fields first; nothing was written.
        const fresh = err.body?.team || {};
        const fields = (err.body?.fields || []).filter((key) =>
          PROJECT_FIELDS.includes(key),
        );
        const found = {};
        fields.forEach((key) => {
          found[key] = conflictFrom(fresh, key);
        });
        updateConflicts((prev) => ({ ...prev, ...found }));
        setSaveState((s) => ({ ...s, status: "conflict", error: null }));
        if (onTeamUpdated && fresh.id) onTeamUpdated(teamId, fresh);
        // The other fields of this save were refused with it — send them
        // again on their own (conflicted ones are skipped by doSave).
        if (fields.length > 0 && Object.keys(changed).length > fields.length) {
          clearTimer();
          timerRef.current = setTimeout(() => {
            timerRef.current = null;
            doSaveRef.current?.();
          }, 0);
        }
      } else if (isSubmissionsClosed(err)) {
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
  }, [teamId, onTeamUpdated, clearTimer, updateConflicts]);

  // Settle a conflict. "theirs" takes the teammate's version (returns the
  // discarded local value so the caller can offer it back); "mine" keeps the
  // local text and saves it over the teammate's, now knowingly.
  const resolveConflict = useCallback(
    (key, choice) => {
      const conflict = conflictsRef.current[key];
      if (!conflict) return null;
      const mine = draftRef.current[key];
      seenRevRef.current = { ...seenRevRef.current, [key]: conflict.rev };
      committedRef.current = { ...committedRef.current, [key]: conflict.value };
      updateConflicts((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setSaveState((s) =>
        s.status === "conflict" ? { ...s, status: "idle" } : s,
      );
      if (choice === "theirs") {
        const next = { ...draftRef.current, [key]: conflict.value };
        draftRef.current = next;
        setDraft(next);
        return mine;
      }
      clearTimer();
      doSaveRef.current?.();
      return mine;
    },
    [clearTimer, updateConflicts],
  );

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
    if (!teamId || !tokenRef.current) return { success: false };
    // Never submit while a field still shows text that isn't what's saved.
    if (Object.keys(conflictsRef.current).length > 0) {
      return { success: false, conflict: true, error: CONFLICT_SUBMIT_MESSAGE };
    }
    try {
      const res = await submitTeamProject(teamId, tokenRef.current);
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
  }, [flush, teamId, onTeamUpdated]);

  // Keep the latest `doSave` in a ref so the unmount effect below can call
  // it without depending on its identity — `doSave` is recreated whenever
  // `onTeamUpdated` changes identity, and an effect keyed on `[doSave]` would
  // re-run its cleanup each time, firing whatever save is mid-debounce right
  // then instead of waiting the documented 1.5s.
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
        doSaveRef.current?.();
      }
    };
  }, []);

  return {
    draft,
    setField,
    saveState,
    submit,
    flush,
    conflicts,
    resolveConflict,
  };
}
