import axios from "axios";
import { useState, useEffect } from "react";
import { useAuthInfo } from "@propelauth/react";
import { useEnv } from "../context/env.context";
import {
  countHeartsFromHistory,
  getTierForHearts,
  getNextTier,
} from "../lib/heartTiers";

// Module-level cache shared by every consumer (NavBar renders on every page;
// ProfileCompletionPrompt mounts app-wide) so the site makes ONE
// GET /api/users/profile per page load instead of one per hook instance.
// Auth comes from the global axios interceptor in axios-wrapper.js.
const CACHE_TTL_MS = 60 * 1000;
let cache = { profile: null, fetchedAt: 0, promise: null };

const fetchProfile = (apiServerUrl) =>
  axios({
    url: `${apiServerUrl}/api/users/profile`,
    method: "GET",
    headers: { "content-type": "application/json" },
  }).then(({ data }) => {
    if (!data || !data.id) return null;
    return { ...data, profile_url: `/profile/${data.id}` };
  });

/**
 * Lightweight read-only view of the logged-in user's profile with the hearts
 * tier math precomputed. SSR-safe (fetch runs in a client effect) and free
 * for logged-out users (no request). For mutations use useProfileApi instead.
 */
export default function useHeartsSummary() {
  const { isLoggedIn, user } = useAuthInfo();
  const { apiServerUrl } = useEnv();
  const [profile, setProfile] = useState(cache.profile);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !user) {
      setProfile(null);
      return undefined;
    }
    let cancelled = false;
    const isFresh = cache.profile && Date.now() - cache.fetchedAt < CACHE_TTL_MS;
    if (isFresh) {
      setProfile(cache.profile);
      return undefined;
    }
    setLoading(true);
    if (!cache.promise) {
      cache.promise = fetchProfile(apiServerUrl)
        .then((data) => {
          cache = { profile: data, fetchedAt: Date.now(), promise: null };
          return data;
        })
        .catch((err) => {
          cache.promise = null;
          throw err;
        });
    }
    cache.promise
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch((err) => {
        console.error("Hearts summary fetch failed:", err?.message || err);
        if (!cancelled) setProfile(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, user, apiServerUrl]);

  const hearts = countHeartsFromHistory(profile?.history);
  const tier = getTierForHearts(hearts);
  const nextTier = getNextTier(hearts);
  const curMin = tier?.minHearts || 0;
  const progressPct = nextTier
    ? Math.max(0, Math.min(100, ((hearts - curMin) / (nextTier.minHearts - curMin)) * 100))
    : 100;

  return {
    profile,
    hearts,
    tier,
    nextTier,
    heartsToNext: nextTier ? nextTier.minHearts - hearts : 0,
    progressPct,
    loading,
  };
}
