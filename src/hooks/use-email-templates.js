import { useState, useEffect, useCallback, useMemo } from "react";
import {
  MESSAGE_TEMPLATES,
  groupTemplatesByCategory,
} from "../lib/messageTemplates";

// Module-level cache shared by every consumer (VolunteerCommunication mounts
// per volunteer row; BatchEmailDialog per tab) so opening dialogs doesn't
// refetch. refresh(true) busts it after admin edits.
const CACHE_TTL_MS = 60 * 1000;
let cache = { data: null, fetchedAt: 0, promise: null };

const fetchTemplateList = (accessToken, orgId) =>
  fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/admin/templates`, {
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
      ...(orgId ? { "X-Org-Id": orgId } : {}),
    },
  }).then((res) => {
    if (!res.ok) throw new Error(`Failed to load templates (${res.status})`);
    return res.json().then((data) => data.text || []);
  });

/**
 * Loads admin-managed email templates from the backend.
 *
 * Returns:
 * - templates: grouped MESSAGE_TEMPLATES-shaped object. Falls back to the
 *   hardcoded MESSAGE_TEMPLATES while loading or on fetch failure, so the
 *   send-email dialogs always have something to offer.
 * - rawTemplates: flat backend array (includes version/status/audit fields)
 *   or null until loaded — used by the template manager UI.
 * - isFallback: true while templates is the hardcoded fallback.
 */
export default function useEmailTemplates({
  accessToken,
  orgId,
  enabled = true,
}) {
  const [rawTemplates, setRawTemplates] = useState(cache.data);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(
    async (force = false) => {
      if (!accessToken) return;
      const isFresh = cache.data && Date.now() - cache.fetchedAt < CACHE_TTL_MS;
      if (isFresh && !force) {
        setRawTemplates(cache.data);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        if (!cache.promise || force) {
          cache.promise = fetchTemplateList(accessToken, orgId)
            .then((list) => {
              cache = { data: list, fetchedAt: Date.now(), promise: null };
              return list;
            })
            .catch((err) => {
              cache.promise = null;
              throw err;
            });
        }
        const list = await cache.promise;
        setRawTemplates(list);
      } catch (err) {
        console.error("Email template fetch failed:", err);
        setError(err.message || "Failed to load templates");
      } finally {
        setLoading(false);
      }
    },
    [accessToken, orgId],
  );

  useEffect(() => {
    if (enabled && accessToken) {
      refresh();
    }
  }, [enabled, accessToken, refresh]);

  const grouped = useMemo(
    () =>
      rawTemplates && rawTemplates.length > 0
        ? groupTemplatesByCategory(rawTemplates)
        : null,
    [rawTemplates],
  );

  return {
    templates: grouped || MESSAGE_TEMPLATES,
    rawTemplates,
    isFallback: !grouped,
    loading,
    error,
    refresh,
  };
}
