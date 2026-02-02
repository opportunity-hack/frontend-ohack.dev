import { useState, useCallback } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { useEnv } from "../context/env.context";

/**
 * A hook to handle reCAPTCHA v3 integration
 * @returns {Object} - reCAPTCHA utilities and state
 */
export const useRecaptcha = () => {
  const { recaptchaSiteKey } = useEnv();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Initializes the reCAPTCHA script
   * Note: With react-google-recaptcha-v3, initialization is handled by the provider
   * This function is kept for backward compatibility
   * @returns {Promise<boolean>} - Whether initialization was successful
   */
  const initializeRecaptcha = useCallback(async () => {
    // In production, always require a valid configuration
    // Only skip in development if site key is not configured
    if (
      process.env.NODE_ENV === "development" &&
      (!recaptchaSiteKey || recaptchaSiteKey === "<TODO>")
    ) {
      console.log(
        "Skipping reCAPTCHA in development (site key not configured)",
      );
      return true;
    }

    // With the new library, initialization is handled by GoogleReCaptchaProvider
    // Just check if executeRecaptcha is available
    return !!executeRecaptcha;
  }, [recaptchaSiteKey, executeRecaptcha]);

  /**
   * Gets a reCAPTCHA token for form submission
   * @param {string} action - The action name for this reCAPTCHA execution (default: 'submit')
   * @returns {Promise<string|null>} - The reCAPTCHA token or null if unsuccessful
   */
  const getRecaptchaToken = useCallback(
    async (action = "submit") => {
      // In production, always require a valid reCAPTCHA token
      // Only skip in development if explicitly disabled via site key
      if (
        process.env.NODE_ENV === "development" &&
        (!recaptchaSiteKey || recaptchaSiteKey === "<TODO>")
      ) {
        console.log(
          "Using mock reCAPTCHA token in development (site key not configured)",
        );
        return "development-mock-token";
      }

      if (!executeRecaptcha) {
        console.error("Execute recaptcha not yet available");
        setError("reCAPTCHA not ready. Please try again.");
        return null;
      }

      try {
        setIsLoading(true);
        setError(null);
        const token = await executeRecaptcha(action);
        return token;
      } catch (error) {
        console.error("Error getting reCAPTCHA token:", error);
        setError("Failed to verify you are human. Please try again.");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [executeRecaptcha, recaptchaSiteKey],
  );

  return {
    initializeRecaptcha,
    getRecaptchaToken,
    isLoading,
    error,
    isRecaptchaReady: !!executeRecaptcha,
    setError,
  };
};
