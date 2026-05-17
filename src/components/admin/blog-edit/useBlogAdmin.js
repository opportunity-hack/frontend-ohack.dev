import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const SAVE_DEBOUNCE_MS = 1500;

const cloneDeep = (v) =>
  typeof structuredClone === "function" ? structuredClone(v) : JSON.parse(JSON.stringify(v));

// Sections that require an explicit Save action (never autosave).
// Body content shouldn't silently save mid-keystroke; SEO changes should be deliberate.
export const EXPLICIT_SAVE_SECTIONS = new Set(["content", "seo"]);

export const SECTION_LABELS = {
  content: "Content",
  seo: "SEO",
  metadata: "Metadata",
};

const buildHeaders = (accessToken, orgId) => ({
  authorization: `Bearer ${accessToken}`,
  "content-type": "application/json",
  ...(orgId ? { "X-Org-Id": orgId } : {}),
});

// Top-level keys owned by each explicit-save section. Used to pause autosave
// for those keys while the section has unsaved changes.
function collectKeysForSections(sectionSet) {
  const keys = new Set();
  sectionSet.forEach((s) => {
    if (s === "content") {
      keys.add("title");
      keys.add("description");
      keys.add("content_markdown");
      keys.add("content_format");
      keys.add("featured_image");
      keys.add("image");
    } else if (s === "seo") {
      keys.add("seo");
    }
  });
  return keys;
}

const normalizePost = (raw) => ({
  ...raw,
  title: raw.title || "",
  description: raw.description || "",
  content_markdown: raw.content_markdown || "",
  content_format: raw.content_format || (raw.content_markdown ? "markdown" : "html"),
  featured_image: raw.featured_image || raw.image || "",
  image: raw.image || raw.featured_image || "",
  tags: Array.isArray(raw.tags) ? raw.tags : [],
  status: raw.status || "published",
  slug: raw.slug || "",
  published_at: raw.published_at || raw.slack_ts_human_readable || "",
  author: raw.author || null,
  seo: {
    title: raw.seo?.title || "",
    description: raw.seo?.description || "",
    keywords: Array.isArray(raw.seo?.keywords) ? raw.seo.keywords : [],
    canonical: raw.seo?.canonical || "",
    og_image: raw.seo?.og_image || "",
  },
  links: Array.isArray(raw.links) ? raw.links : [],
});

/**
 * Per-post blog admin state machine. Mirrors useHackathonAdmin.
 *
 *   draft     — in-memory edit, what the form renders
 *   committed — last server-confirmed snapshot (autosave diffs against this)
 *
 * Hybrid save model: autosave runs for keys NOT owned by any dirty
 * explicit-save section. Explicit sections call commitSection(name) to flush.
 */
export function useBlogAdmin({ postId, accessToken, orgId, isAdmin }) {
  const [draft, setDraft] = useState(null);
  const [committed, setCommitted] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saveState, setSaveState] = useState({ status: "idle", lastSavedAt: null, error: null });
  const [dirtySections, setDirtySections] = useState(new Set());
  const saveTimerRef = useRef(null);
  const inflightRef = useRef(null);

  const apiBase = process.env.NEXT_PUBLIC_API_SERVER_URL;

  const fetchPost = useCallback(async () => {
    if (!isAdmin || !postId || !accessToken) return;
    setLoading(true);
    setLoadError(null);
    try {
      // Public single-news route works for admins reading a post by id.
      const res = await fetch(`${apiBase}/api/messages/news/${postId}`, {
        headers: buildHeaders(accessToken, orgId),
      });
      if (!res.ok) throw new Error(`Failed to load post (${res.status})`);
      const data = await res.json();
      const post = data?.text;
      if (!post || !post.title) {
        // Fall back to the admin list so drafts (filtered out of /news) are reachable.
        const adminRes = await fetch(`${apiBase}/api/messages/admin/news?limit=2000`, {
          headers: buildHeaders(accessToken, orgId),
        });
        if (adminRes.ok) {
          const adminData = await adminRes.json();
          const found = (adminData.text || []).find((p) => p.id === postId);
          if (found) {
            const normalized = normalizePost({ ...found, id: postId });
            setDraft(normalized);
            setCommitted(cloneDeep(normalized));
            return;
          }
        }
        setLoadError(`No blog post with id "${postId}"`);
        setDraft(null);
        setCommitted(null);
        return;
      }
      const normalized = normalizePost({ ...post, id: postId });
      setDraft(normalized);
      setCommitted(cloneDeep(normalized));
    } catch (err) {
      console.error("Blog post load failed:", err);
      setLoadError(err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [apiBase, postId, accessToken, orgId, isAdmin]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const pushPatch = useCallback(
    async (payload) => {
      const myToken = Symbol("save");
      inflightRef.current = myToken;
      const { id, ...patch } = payload;
      const res = await fetch(`${apiBase}/api/messages/admin/news/${postId}`, {
        method: "PATCH",
        headers: buildHeaders(accessToken, orgId),
        body: JSON.stringify(patch),
      });
      if (inflightRef.current !== myToken) return null;
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Save failed (${res.status})`);
      }
      return payload;
    },
    [apiBase, accessToken, orgId, postId]
  );

  // Autosave payload = committed + draft-for-non-dirty-explicit-section-keys
  const buildAutosavePayload = useCallback(() => {
    if (!draft || !committed) return null;
    const dirtyKeys = collectKeysForSections(dirtySections);
    const merged = { ...committed };
    Object.keys(draft).forEach((k) => {
      if (!dirtyKeys.has(k)) merged[k] = draft[k];
    });
    return merged;
  }, [draft, committed, dirtySections]);

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
  }, [draft, committed, buildAutosavePayload, pushPatch]);

  const setField = useCallback((field, value) => {
    setDraft((prev) => (prev ? { ...prev, [field]: value } : prev));
  }, []);

  const setSeo = useCallback((field, value) => {
    setDraft((prev) =>
      prev ? { ...prev, seo: { ...(prev.seo || {}), [field]: value } } : prev
    );
  }, []);

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

  useEffect(() => {
    const handler = (e) => {
      if (dirtySections.size === 0) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirtySections]);

  // Convenience: publish / unpublish flips status and immediately saves (autosave path).
  const setStatus = useCallback(
    async (newStatus) => {
      setDraft((prev) => (prev ? { ...prev, status: newStatus } : prev));
      // Force-flush via direct PATCH so the user sees the chip change immediately,
      // bypassing the debounce. Don't await dirty-section conflicts — status is in
      // MetadataSection which is autosaved.
      try {
        await fetch(`${apiBase}/api/messages/admin/news/${postId}`, {
          method: "PATCH",
          headers: buildHeaders(accessToken, orgId),
          body: JSON.stringify({ status: newStatus }),
        });
        setCommitted((prev) => (prev ? { ...prev, status: newStatus } : prev));
        setSaveState({ status: "saved", lastSavedAt: Date.now(), error: null });
      } catch (err) {
        setSaveState({ status: "error", lastSavedAt: null, error: err.message });
      }
    },
    [apiBase, accessToken, orgId, postId]
  );

  const value = useMemo(
    () => ({
      post: draft,
      committed,
      loading,
      loadError,
      saveState,
      dirtySections,
      setField,
      setSeo,
      setStatus,
      markSectionDirty,
      commitSection,
      discardSection,
      refetch: fetchPost,
    }),
    [
      draft,
      committed,
      loading,
      loadError,
      saveState,
      dirtySections,
      setField,
      setSeo,
      setStatus,
      markSectionDirty,
      commitSection,
      discardSection,
      fetchPost,
    ]
  );

  return value;
}
