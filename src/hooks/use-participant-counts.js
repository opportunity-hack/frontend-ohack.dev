import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useEnv } from '../context/env.context';

/**
 * Custom hook to fetch accepted participant counts for psychological nudging
 * Fetches counts of accepted hackers, mentors, judges, volunteers, and sponsors
 */
export default function useParticipantCounts(eventId) {
  const { apiServerUrl } = useEnv();
  const [counts, setCounts] = useState({
    hackers: { accepted: 0, total: 0 },
    mentors: { accepted: 0, total: 0 },
    judges: { accepted: 0, total: 0 },
    volunteers: { accepted: 0, total: 0 },
    sponsors: { accepted: 0, total: 0 },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchParticipantCounts = useCallback(async () => {
    if (!eventId || !apiServerUrl) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch counts for each participant type
      const participantTypes = ['hacker', 'mentor', 'judge', 'volunteer', 'sponsor'];
      const countPromises = participantTypes.map(async (type) => {
        try {
          const response = await axios.get(
            `${apiServerUrl}/api/messages/hackathon/${eventId}/${type}`,
            {
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            }
          );

          if (response.data && Array.isArray(response.data.data)) {
            const participants = response.data.data;
            const acceptedCount = participants.filter(p => p.isSelected === true).length;
            const totalCount = participants.length;

            return {
              type: type === 'hacker' ? 'hackers' : `${type}s`, // Convert to plural
              accepted: acceptedCount,
              total: totalCount
            };
          }

          return {
            type: type === 'hacker' ? 'hackers' : `${type}s`,
            accepted: 0,
            total: 0
          };
        } catch (error) {
          console.warn(`Failed to fetch ${type} counts:`, error);
          return {
            type: type === 'hacker' ? 'hackers' : `${type}s`,
            accepted: 0,
            total: 0
          };
        }
      });

      const results = await Promise.all(countPromises);

      // Transform results into counts object
      const newCounts = results.reduce((acc, result) => {
        acc[result.type] = {
          accepted: result.accepted,
          total: result.total
        };
        return acc;
      }, {});

      setCounts(newCounts);
    } catch (err) {
      console.error('Error fetching participant counts:', err);
      setError(err.message || 'Failed to fetch participant counts');
    } finally {
      setLoading(false);
    }
  }, [eventId, apiServerUrl]);

  useEffect(() => {
    fetchParticipantCounts();
  }, [fetchParticipantCounts]);

  return {
    counts,
    loading,
    error,
    refetch: fetchParticipantCounts
  };
}