import { useState, useEffect } from "react";
import axios from "axios";
import { useEnv } from "../context/env.context";

/**
 * Hook to fetch the parent nonprofit(s) for a given problem statement / project.
 * Uses the reverse-lookup endpoint: GET /api/messages/problem_statement/{id}/nonprofit
 *
 * A project can belong to multiple nonprofits, so this returns an array.
 *
 * @param {string} problemStatementId - The project/problem statement ID
 * @param {string} [existingNpoId] - If already known (e.g. navigated from nonprofit page), skip the fetch
 * @returns {{ nonprofits: object[], loading: boolean, error: string|null }}
 */
export default function useProjectNonprofit(problemStatementId, existingNpoId) {
  const { apiServerUrl } = useEnv();
  const [nonprofits, setNonprofits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If we already have the nonprofit ID from props, don't fetch
    if (existingNpoId || !problemStatementId || !apiServerUrl) {
      return;
    }

    let cancelled = false;
    const fetchNonprofits = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `${apiServerUrl}/api/messages/problem_statement/${problemStatementId}/nonprofit`
        );
        if (!cancelled && response.data?.nonprofits?.length > 0) {
          setNonprofits(response.data.nonprofits);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error fetching project nonprofits:", err);
          setError("Failed to load nonprofit information");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchNonprofits();

    return () => {
      cancelled = true;
    };
  }, [problemStatementId, existingNpoId, apiServerUrl]);

  return { nonprofits, loading, error };
}
