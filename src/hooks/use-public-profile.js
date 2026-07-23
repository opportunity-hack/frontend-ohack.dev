import { useState, useEffect, useCallback } from "react";

/**
 * Hook for fetching public profile data for a specific user
 * Respects privacy settings and only returns data marked as public
 */
export default function usePublicProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [badges, setBadges] = useState(null);
  const [hackathons, setHackathons] = useState(null);
  const [praisesRecent, setPraisesRecent] = useState([]);
  const [praisesCount, setPraisesCount] = useState(0);
  const [feedbackUrl, setFeedbackUrl] = useState("");
  const [privacySettings, setPrivacySettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPublicProfile = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Fetch the basic profile data
      const profileResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/users/${userId}/profile/public`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!profileResponse.ok) {
        if (profileResponse.status === 404) {
          throw new Error('Profile not found');
        }
        throw new Error(`Failed to fetch profile: ${profileResponse.status}`);
      }

      const profileData = await profileResponse.json();
      setProfile(profileData);

      // Try to fetch privacy settings for this user
      // If unavailable, default to private (secure by default)
      try {
        const privacyResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/users/${userId}/profile/privacy-settings`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (privacyResponse.ok) {
          const privacyData = await privacyResponse.json();
          setPrivacySettings(privacyData.privacy_settings);
        } else {
          // Default to private (secure by default) if no privacy settings found
          setPrivacySettings({
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
          });
        }
      } catch (privacyError) {
        console.log('Privacy settings not available, defaulting to private for security');
        // Default to private (secure by default) if privacy endpoint doesn't exist
        setPrivacySettings({
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
        });
      }

      // Set feedback URL for this user
      setFeedbackUrl(`/feedback/${userId}`);

      // For now, we'll use the existing profile data structure
      // In the future, we might want separate endpoints for badges and hackathons
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
    if (userId) {
      fetchPublicProfile();
    }
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
