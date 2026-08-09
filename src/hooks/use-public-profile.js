import { useState, useEffect, useCallback, useRef } from "react";

// Secure-by-default privacy fallback used when the privacy endpoint is
// unavailable. Only `praises` is public by default — keep in sync with
// backend model/user.py default_public_privacy_fields.
const PRIVATE_FALLBACK = {
  github: "private",
  role: "private",
  company: "private",
  why: "private",
  education: "private",
  expertise: "private",
  linkedin_url: "private",
  instagram_url: "private",
  badges: "private",
  feedback: "private",
  what: "private",
  how: "private",
  hackathon_history: "private",
  praises: "private",
  bio: "private",
  bio_video_url: "private",
  portfolio_links: "private",
  teams: "private",
  certificates: "private",
  github_history: "private",
  hearts: "private",
};

/**
 * Hook for fetching public profile data for a specific user.
 * Respects privacy settings and only returns data marked as public.
 *
 * options.initialData: SSR-fetched portfolio payload. When provided, all
 * state is seeded from it and the mount fetch is skipped (the payload
 * already embeds privacy_settings). `refetch` still works.
 */
export default function usePublicProfile(userId, options = {}) {
  const { initialData = null } = options;

  const [profile, setProfile] = useState(initialData);
  const [badges, setBadges] = useState(initialData?.badges || null);
  const [hackathons, setHackathons] = useState(
    initialData ? initialData.hackathon_history || initialData.hackathons || [] : null
  );
  const [praisesRecent, setPraisesRecent] = useState(initialData?.praises_recent || []);
  const [praisesCount, setPraisesCount] = useState(initialData?.praises_count || 0);
  const [feedbackUrl, setFeedbackUrl] = useState(userId ? `/feedback/${userId}` : "");
  const [privacySettings, setPrivacySettings] = useState(
    initialData?.privacy_settings || null
  );
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState(null);
  const seededRef = useRef(Boolean(initialData));

  const fetchPublicProfile = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);

      const profileResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/users/${userId}/profile/public`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!profileResponse.ok) {
        if (profileResponse.status === 404) {
          throw new Error("Profile not found");
        }
        throw new Error(`Failed to fetch profile: ${profileResponse.status}`);
      }

      const profileData = await profileResponse.json();
      setProfile(profileData);

      // The portfolio payload embeds privacy_settings; fall back to the
      // dedicated endpoint for older payload shapes, then to private-only.
      if (profileData.privacy_settings) {
        setPrivacySettings(profileData.privacy_settings);
      } else {
        try {
          const privacyResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/users/${userId}/profile/privacy-settings`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (privacyResponse.ok) {
            const privacyData = await privacyResponse.json();
            setPrivacySettings(privacyData.privacy_settings);
          } else {
            setPrivacySettings({ ...PRIVATE_FALLBACK });
          }
        } catch (privacyError) {
          console.log("Privacy settings not available, defaulting to private for security");
          setPrivacySettings({ ...PRIVATE_FALLBACK });
        }
      }

      setFeedbackUrl(`/feedback/${userId}`);
      setBadges(profileData.badges || []);
      setHackathons(profileData.hackathon_history || profileData.hackathons || []);
      setPraisesRecent(profileData.praises_recent || []);
      setPraisesCount(profileData.praises_count || 0);
    } catch (err) {
      console.error("Error fetching public profile:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    // SSR already provided the payload — skip the duplicate mount fetch.
    if (seededRef.current) {
      seededRef.current = false;
      return;
    }
    fetchPublicProfile();
  }, [userId, fetchPublicProfile]);

  return {
    profile,
    badges,
    hackathons,
    praisesRecent,
    praisesCount,
    feedbackUrl,
    privacySettings,
    isLoading,
    error,
    refetch: fetchPublicProfile,
  };
}
