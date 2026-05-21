import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const SAVE_DEBOUNCE_MS = 1500;

const cloneDeep = (v) =>
  typeof structuredClone === "function" ? structuredClone(v) : JSON.parse(JSON.stringify(v));

// Sections that get explicit Save / Discard. Everything else autosaves.
export const EXPLICIT_SAVE_SECTIONS = new Set([
  "overview-dates",
  "schedule",
  "meals",
  "screening",
  "deposit",
  "nonprofits",
]);

export const SECTION_LABELS = {
  "overview-dates": "Overview (dates)",
  schedule: "Schedule",
  meals: "Meals",
  screening: "Screening Questions",
  deposit: "Deposit",
  nonprofits: "Nonprofits",
};

const buildHeaders = (accessToken, orgId) => ({
  authorization: `Bearer ${accessToken}`,
  "content-type": "application/json",
  ...(orgId ? { "X-Org-Id": orgId } : {}),
});

/**
 * Loads a hackathon by event_id and exposes the editing state machine for the
 * per-event admin page. Holds two shapes of state:
 *   - draft: the in-memory edit (what the form renders from)
 *   - committed: last server-confirmed version (used to compute autosave diffs
 *     and tell whether explicit-save sections are dirty)
 *
 * Hybrid save model:
 *   - Autosave fires on draft changes after debounce, BUT only for keys not
 *     touched in any explicit-save section currently marked dirty.
 *   - Explicit-save sections call commitSection(name) to flush.
 */
export function useHackathonAdmin({ eventId, accessToken, orgId, isAdmin }) {
  const [draft, setDraft] = useState(null);
  const [committed, setCommitted] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saveState, setSaveState] = useState({ status: "idle", lastSavedAt: null, error: null });
  const [dirtySections, setDirtySections] = useState(new Set());
  const saveTimerRef = useRef(null);
  const inflightRef = useRef(null);

  const apiBase = process.env.NEXT_PUBLIC_API_SERVER_URL;

  const fetchHackathon = useCallback(async () => {
    if (!isAdmin || !eventId || !accessToken) return;
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`${apiBase}/api/messages/hackathons`, {
        headers: buildHeaders(accessToken, orgId),
      });
      if (!res.ok) throw new Error(`Failed to load hackathons (${res.status})`);
      const data = await res.json();
      // Prefer event_id (the slug) but fall back to the Firestore doc id —
      // legacy hackathons + some of the per-event admin shortcut buttons end
      // up routing here with the doc id instead of the slug.
      const list = data.hackathons || [];
      const found =
        list.find((h) => h.event_id === eventId) ||
        list.find((h) => h.id === eventId);
      if (!found) {
        setLoadError(`No hackathon with event_id "${eventId}"`);
        setDraft(null);
        setCommitted(null);
        return;
      }
      const normalized = {
        ...found,
        start_date: found.start_date ? String(found.start_date).split("T")[0] : "",
        end_date: found.end_date ? String(found.end_date).split("T")[0] : "",
        countdowns: found.countdowns || [],
        links: found.links || [],
        event_photos: found.event_photos || [],
        social_posts: found.social_posts || [],
        constraints: found.constraints || {},
        donation_current: found.donation_current || { food: "0", prize: "0", swag: "0", thank_you: "" },
        donation_goals: found.donation_goals || { food: "0", prize: "0", swag: "0" },
        planning: found.planning || {},
      };
      setDraft(normalized);
      setCommitted(cloneDeep(normalized));
    } catch (err) {
      console.error("Hackathon load failed:", err);
      setLoadError(err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [apiBase, eventId, accessToken, orgId, isAdmin]);

  useEffect(() => {
    fetchHackathon();
  }, [fetchHackathon]);

  // Push a PATCH with the given payload. Returns the saved hackathon.
  const pushPatch = useCallback(
    async (payload) => {
      // Cancel any in-flight to avoid stale overwrites; fetch doesn't natively
      // cancel but we can ignore the response.
      const myToken = Symbol("save");
      inflightRef.current = myToken;
      const res = await fetch(`${apiBase}/api/messages/hackathon`, {
        method: "PATCH",
        headers: buildHeaders(accessToken, orgId),
        body: JSON.stringify(payload),
      });
      if (inflightRef.current !== myToken) return null;
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Save failed (${res.status})`);
      }
      return payload;
    },
    [apiBase, accessToken, orgId]
  );

  // Build a payload that contains the committed state plus only the keys not
  // touched by any currently-dirty explicit-save section. (This preserves the
  // user's expectation that an explicit-save section won't commit until Save.)
  //
  // Special case: if "overview-dates" is dirty, skip autosave entirely (return
  // null). Its fields (start_date, end_date, timezone) are required by the
  // backend AND cross-field-validated. Sending stale committed values can fail
  // the "end_date > start_date" check; omitting them causes "Missing required
  // field". The explicit Save button is the only safe flush path for this section.
  const buildAutosavePayload = useCallback(() => {
    if (!draft || !committed) return null;
    if (dirtySections.has("overview-dates")) return null;
    const dirtyKeys = collectKeysForSections(dirtySections);
    const merged = { ...committed };
    Object.keys(draft).forEach((k) => {
      if (!dirtyKeys.has(k)) merged[k] = draft[k];
    });
    return merged;
  }, [draft, committed, dirtySections]);

  // Trigger autosave when draft changes (and there are committed-vs-draft diffs
  // outside of any dirty explicit-save section).
  useEffect(() => {
    if (!draft || !committed) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    const payload = buildAutosavePayload();
    if (!payload) return;
    if (JSON.stringify(payload) === JSON.stringify(committed)) return;

    saveTimerRef.current = setTimeout(async () => {
      setSaveState({ status: "saving", lastSavedAt: null, error: null });
      try {
        const saved = await pushPatch(payload);
        if (saved) {
          setCommitted(cloneDeep(saved));
          setSaveState({ status: "saved", lastSavedAt: Date.now(), error: null });
        }
      } catch (err) {
        console.error("Autosave failed:", err);
        setSaveState({ status: "error", lastSavedAt: null, error: err.message });
      }
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(saveTimerRef.current);
  }, [draft, committed, dirtySections, buildAutosavePayload, pushPatch]);

  // Field-update helpers ----------------------------------------------------
  const setField = useCallback((field, value) => {
    setDraft((prev) => (prev ? { ...prev, [field]: value } : prev));
  }, []);

  const setConstraint = useCallback((field, value) => {
    setDraft((prev) =>
      prev ? { ...prev, constraints: { ...(prev.constraints || {}), [field]: value } } : prev
    );
  }, []);

  const setPlanning = useCallback((patch) => {
    setDraft((prev) =>
      prev ? { ...prev, planning: { ...(prev.planning || {}), ...patch } } : prev
    );
  }, []);

  const setDeposit = useCallback((field, value) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const cur = prev.constraints?.hacker_deposit || { enabled: false, default_amount_cents: 500 };
      return {
        ...prev,
        constraints: { ...(prev.constraints || {}), hacker_deposit: { ...cur, [field]: value } },
      };
    });
  }, []);

  // Mark + commit explicit-save sections -----------------------------------
  const markSectionDirty = useCallback((section, dirty) => {
    setDirtySections((prev) => {
      const next = new Set(prev);
      if (dirty) next.add(section);
      else next.delete(section);
      return next;
    });
  }, []);

  const commitSection = useCallback(
    async (section) => {
      if (!draft) return { ok: false, error: "No draft" };
      // Cancel any pending autosave timer so it can't fire mid-flight and
      // overwrite inflightRef, which would cause the explicit save to return
      // null (treated as cancelled) while the autosave wins with stale data.
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      setSaveState({ status: "saving", lastSavedAt: null, error: null });
      try {
        const saved = await pushPatch(draft);
        if (saved) {
          setCommitted(cloneDeep(saved));
          setSaveState({ status: "saved", lastSavedAt: Date.now(), error: null });
          markSectionDirty(section, false);
          return { ok: true };
        }
        return { ok: false, error: "Concurrent save" };
      } catch (err) {
        setSaveState({ status: "error", lastSavedAt: null, error: err.message });
        return { ok: false, error: err.message };
      }
    },
    [draft, pushPatch, markSectionDirty]
  );

  const discardSection = useCallback(
    (section) => {
      if (!committed) return;
      const keys = collectKeysForSections(new Set([section]));
      setDraft((prev) => {
        if (!prev) return prev;
        const next = { ...prev };
        keys.forEach((k) => {
          next[k] = cloneDeep(committed[k]);
        });
        return next;
      });
      markSectionDirty(section, false);
    },
    [committed, markSectionDirty]
  );

  // Beforeunload guard for any unsaved explicit work
  useEffect(() => {
    const handler = (e) => {
      if (dirtySections.size === 0) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirtySections]);

  const value = useMemo(
    () => ({
      hackathon: draft,
      committed,
      loading,
      loadError,
      saveState,
      dirtySections,
      setField,
      setConstraint,
      setPlanning,
      setDeposit,
      markSectionDirty,
      commitSection,
      discardSection,
      refetch: fetchHackathon,
    }),
    [
      draft,
      committed,
      loading,
      loadError,
      saveState,
      dirtySections,
      setField,
      setConstraint,
      setPlanning,
      setDeposit,
      markSectionDirty,
      commitSection,
      discardSection,
      fetchHackathon,
    ]
  );

  return value;
}

// Map an explicit-save section name to the top-level draft keys it owns. When
// any of these sections are dirty we exclude their owned keys from autosave.
function collectKeysForSections(sectionSet) {
  const keys = new Set();
  sectionSet.forEach((s) => {
    if (s === "overview-dates") {
      keys.add("start_date");
      keys.add("end_date");
      keys.add("timezone");
    } else if (s === "schedule") {
      keys.add("countdowns");
    } else if (s === "meals" || s === "screening" || s === "deposit") {
      keys.add("constraints");
    } else if (s === "nonprofits") {
      // nonprofits has its own endpoint inside NonprofitManagement
    }
  });
  return keys;
}
