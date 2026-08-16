import { useState, useEffect, useCallback } from 'react';
import { useAuthInfo } from '@propelauth/react';

// Keys must match backend model/user.py privacy_fields exactly ("why", not
// the old "why_are_you_here" — that toggle was a silent no-op server-side).
const DEFAULT_PRIVACY_SETTINGS = {
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
  praises: "public",
  // Portfolio fields — default private (default-private-first)
  bio: "private",
  bio_video_url: "private",
  portfolio_links: "private",
  teams: "private",
  certificates: "private",
  github_history: "private",
  hearts: "private",
};

export default function usePrivacySettings() {
  const { user, accessToken} = useAuthInfo();
  const [privacySettings, setPrivacySettings] = useState(DEFAULT_PRIVACY_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch privacy settings from API
  const fetchPrivacySettings = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/users/profile/privacy-settings`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched privacy settings:', data);
        setPrivacySettings({ ...DEFAULT_PRIVACY_SETTINGS, ...data.privacy_settings });
      } else if (response.status === 404) {
        // If no privacy settings exist yet, use defaults
        console.log('No privacy settings found, using defaults');
        setPrivacySettings(DEFAULT_PRIVACY_SETTINGS);
      } else {
        throw new Error(`Failed to fetch privacy settings: ${response.status}`);
      }
    } catch (err) {
      console.error('Error fetching privacy settings:', err);
      setError(err.message);
      // Use defaults on error
      setPrivacySettings(DEFAULT_PRIVACY_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Update a specific privacy setting
  const updatePrivacySetting = useCallback(async (field, value) => {
    if (!user) return;

    try {
      const updateData = { [field]: value };

      console.log(`Updating privacy setting: ${field} = ${value}`);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/users/profile/privacy-settings`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      if (response.ok) {
        // Update local state optimistically
        setPrivacySettings(prev => ({
          ...prev,
          [field]: value
        }));
        console.log(`Privacy setting updated: ${field} = ${value}`);
      } else {
        throw new Error(`Failed to update privacy setting: ${response.status}`);
      }
    } catch (err) {
      console.error('Error updating privacy setting:', err);
      setError(err.message);
      // Revert optimistic update on error
      await fetchPrivacySettings();
    }
  }, [user, fetchPrivacySettings]);

  // Toggle a privacy setting between public and private
  const togglePrivacySetting = useCallback((field) => {
    const currentValue = privacySettings[field];
    const newValue = currentValue === "public" ? "private" : "public";
    updatePrivacySetting(field, newValue);
  }, [privacySettings, updatePrivacySetting]);

  // Load privacy settings when user is available
  useEffect(() => {
    if (user) {
      fetchPrivacySettings();
    }
  }, [user, fetchPrivacySettings]);

  return {
    privacySettings,
    isLoading,
    error,
    updatePrivacySetting,
    togglePrivacySetting,
    fetchPrivacySettings
  };
}