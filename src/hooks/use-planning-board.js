import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthInfo } from "@propelauth/react";

const API = process.env.NEXT_PUBLIC_API_SERVER_URL;
const HOT_INTERVAL = 6000;
const COLD_INTERVAL = 30000;
const HOT_WINDOW_MS = 60000;

function buildHeaders(accessToken, orgId) {
  const h = { "content-type": "application/json" };
  if (accessToken) h["authorization"] = `Bearer ${accessToken}`;
  if (orgId) h["X-Org-Id"] = orgId;
  return h;
}

export function usePlanningBoard(eventId) {
  const { accessToken, orgHelper, userClass, user } = useAuthInfo();
  const orgId = orgHelper?.getOrgs()?.[0]?.orgId;

  const [board, setBoard] = useState(null); // { lists, cards, labels, planning }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const etagRef = useRef(null);
  const lastMutationRef = useRef(null);
  const pollRef = useRef(null);

  const isHot = useCallback(() => {
    return lastMutationRef.current && Date.now() - lastMutationRef.current < HOT_WINDOW_MS;
  }, []);

  const fetchBoard = useCallback(async () => {
    if (!eventId) return;
    try {
      const headers = {};
      if (etagRef.current) headers["If-None-Match"] = etagRef.current;

      const res = await fetch(`${API}/api/planning/${eventId}`, { headers });
      if (res.status === 304) return; // no change
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const etag = res.headers.get("ETag");
      if (etag) etagRef.current = etag;

      const data = await res.json();
      setBoard(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  // Initial fetch + adaptive polling
  useEffect(() => {
    if (!eventId) return;
    fetchBoard();

    const tick = () => {
      if (document.visibilityState !== "visible") return;
      fetchBoard();
    };

    const schedule = () => {
      clearInterval(pollRef.current);
      pollRef.current = setInterval(tick, isHot() ? HOT_INTERVAL : COLD_INTERVAL);
    };

    schedule();
    const visibilityHandler = () => {
      if (document.visibilityState === "visible") {
        fetchBoard();
        schedule();
      }
    };
    document.addEventListener("visibilitychange", visibilityHandler);

    return () => {
      clearInterval(pollRef.current);
      document.removeEventListener("visibilitychange", visibilityHandler);
    };
  }, [eventId, fetchBoard, isHot]);

  // ---------- mutation helpers ----------

  function markMutated() {
    lastMutationRef.current = Date.now();
    clearInterval(pollRef.current);
    pollRef.current = setInterval(fetchBoard, HOT_INTERVAL);
  }

  async function mutate(method, path, body, optimisticFn) {
    // Optimistic update
    const prev = board;
    if (optimisticFn) setBoard((b) => optimisticFn(b));

    try {
      const res = await fetch(`${API}/api/planning/${eventId}${path}`, {
        method,
        headers: buildHeaders(accessToken, orgId),
        body: body ? JSON.stringify(body) : undefined,
      });

      if (res.status === 412) {
        // Conflict — rollback and return the conflict payload
        if (prev) setBoard(prev);
        const data = await res.json();
        return { conflict: true, data };
      }

      if (!res.ok) {
        if (prev) setBoard(prev);
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const result = await res.json();
      markMutated();
      await fetchBoard(); // sync server state
      return { ok: true, data: result };
    } catch (err) {
      if (prev) setBoard(prev);
      return { ok: false, error: err.message };
    }
  }

  // ---------- list operations ----------

  const createList = (title) => mutate("POST", "/lists", { title });

  const updateList = (listId, updates, currentUpdatedAt) =>
    mutate(
      "PATCH",
      `/lists/${listId}`,
      updates,
      null,
      currentUpdatedAt ? { "If-Match": currentUpdatedAt } : undefined
    );

  // ---------- card operations ----------

  const createCard = (listId, title, extra = {}) =>
    mutate("POST", "/cards", { list_id: listId, title, ...extra });

  const updateCard = (cardId, updates, currentUpdatedAt) => {
    const headers = currentUpdatedAt ? { "If-Match": currentUpdatedAt } : undefined;
    return mutateWithHeaders("PATCH", `/cards/${cardId}`, updates, headers);
  };

  const archiveCard = (cardId) => mutate("DELETE", `/cards/${cardId}`);

  const moveCard = (cardId, listId, position, currentUpdatedAt) =>
    updateCard(cardId, { list_id: listId, position }, currentUpdatedAt);

  // ---------- comment operations ----------

  const createComment = (cardId, body) =>
    mutate("POST", `/cards/${cardId}/comments`, { body });

  const deleteComment = (commentId) =>
    mutate("DELETE", `/comments/${commentId}`);

  // ---------- label operations ----------

  const createLabel = (name, color) =>
    mutate("POST", "/labels", { name, color });

  const updateLabel = (labelId, updates) =>
    mutate("PATCH", `/labels/${labelId}`, updates);

  // ---------- admin operations ----------

  const updateEditors = (add, remove) =>
    mutate("PATCH", "/editors", { add, remove });

  const updateConfig = (config) =>
    mutate("PATCH", "/config", config);

  const seedTemplate = () =>
    mutate("POST", "/seed-template");

  const slackNotify = () =>
    mutate("POST", "/slack/notify");

  // ---------- helper for custom headers ----------

  async function mutateWithHeaders(method, path, body, extraHeaders = {}) {
    const prev = board;
    try {
      const res = await fetch(`${API}/api/planning/${eventId}${path}`, {
        method,
        headers: { ...buildHeaders(accessToken, orgId), ...extraHeaders },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (res.status === 412) {
        const data = await res.json();
        return { conflict: true, data };
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const result = await res.json();
      markMutated();
      await fetchBoard();
      return { ok: true, data: result };
    } catch (err) {
      if (prev) setBoard(prev);
      return { ok: false, error: err.message };
    }
  }

  // ---------- derived permissions ----------

  const planning = board?.planning || {};
  const canWrite = (() => {
    if (!user) return false;
    try {
      // Match OHack pattern (see pages/admin/index.js): use userClass —
      // orgHelper returns plain info objects without hasPermission().
      const org = userClass?.getOrgByName("Opportunity Hack Org");
      if (org?.hasPermission("volunteer.admin")) return true;
      const editors = planning.editors || [];
      return editors.includes(user.userId);
    } catch {
      return false;
    }
  })();
  const canComment = !!user;

  return {
    board,
    loading,
    error,
    canWrite,
    canComment,
    refetch: fetchBoard,
    // mutations
    createList,
    updateList,
    createCard,
    updateCard,
    archiveCard,
    moveCard,
    createComment,
    deleteComment,
    createLabel,
    updateLabel,
    updateEditors,
    updateConfig,
    seedTemplate,
    slackNotify,
  };
}
