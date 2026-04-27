import { useCallback, useEffect, useRef, useState } from "react";

const PAGE_SIZE = 20;

/**
 * Fetches praises received by the user identified by `dbUserId` from the public
 * `/api/users/{id}/praises` endpoint. The hook is opt-in via `enabled` so the
 * profile page can defer the network call until the user clicks "View all".
 */
export default function usePraisesForUser(dbUserId, { enabled = false } = {}) {
  const [praises, setPraises] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const initialFetchedRef = useRef(false);

  const fetchPage = useCallback(
    async (nextOffset = 0) => {
      if (!dbUserId) return;
      setIsLoading(true);
      setError(null);
      try {
        const url = `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/users/${encodeURIComponent(
          dbUserId
        )}/praises?limit=${PAGE_SIZE}&offset=${nextOffset}`;
        const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
        if (res.status === 403) {
          setPraises([]);
          setTotal(0);
          return;
        }
        if (!res.ok) {
          throw new Error(`Failed to load praises (${res.status})`);
        }
        const json = await res.json();
        setTotal(json.total || 0);
        setPraises((prev) =>
          nextOffset === 0 ? json.praises || [] : prev.concat(json.praises || [])
        );
        setOffset(nextOffset + (json.praises?.length || 0));
      } catch (e) {
        setError(e.message || "Failed to load praises");
      } finally {
        setIsLoading(false);
      }
    },
    [dbUserId]
  );

  useEffect(() => {
    if (!enabled || !dbUserId || initialFetchedRef.current) return;
    initialFetchedRef.current = true;
    fetchPage(0);
  }, [enabled, dbUserId, fetchPage]);

  const loadMore = useCallback(() => {
    if (isLoading) return;
    if (praises.length >= total) return;
    fetchPage(offset);
  }, [isLoading, praises.length, total, offset, fetchPage]);

  const hasMore = praises.length < total;

  return { praises, total, hasMore, isLoading, error, loadMore };
}
