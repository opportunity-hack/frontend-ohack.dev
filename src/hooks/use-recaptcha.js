import { useState, useCallback } from 'react';
import { useEnv } from '../context/env.context';

/**
 * A hook to handle reCAPTCHA v3 integration
 * @returns {Object} - reCAPTCHA utilities and state
 */
export const useRecaptcha = () => {
  const { recaptchaSiteKey } = useEnv();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRecaptchaReady, setIsRecaptchaReady] = useState(false);

  /**
   * Initializes the reCAPTCHA script
   * @returns {Promise<boolean>} - Whether initialization was successful
   */
  const initializeRecaptcha = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Skip reCAPTCHA in development or if not configured
      if (!recaptchaSiteKey || recaptchaSiteKey === '<TODO>' || process.env.NODE_ENV === 'development') {
        console.log('Skipping reCAPTCHA in development or site key not configured');
        setIsRecaptchaReady(true);
        return true;
      }
      
      const ReactRecaptcha3 = (await import('react-google-recaptcha3')).default;
      await ReactRecaptcha3.init(recaptchaSiteKey);
      setIsRecaptchaReady(true);
      return true;
    } catch (error) {
      console.error('Error initializing reCAPTCHA:', error);
      setError('Failed to initialize reCAPTCHA verification. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [recaptchaSiteKey]);

  /**
   * Gets a reCAPTCHA token for form submission
   * @returns {Promise<string|null>} - The reCAPTCHA token or null if unsuccessful
   */
  const getRecaptchaToken = useCallback(async () => {
    if (!isRecaptchaReady) {
      const initialized = await initializeRecaptcha();
      if (!initialized) return null;
    }
    
    // Skip token generation in development or if not configured
    if (!recaptchaSiteKey || recaptchaSiteKey === '<TODO>' || process.env.NODE_ENV === 'development') {
      console.log('Using mock reCAPTCHA token in development');
      return 'development-mock-token';
    }
    
    try {
      setIsLoading(true);
      setError(null);
      const ReactRecaptcha3 = (await import('react-google-recaptcha3')).default;
      const token = await ReactRecaptcha3.getToken();
      return token;
    } catch (error) {
      console.error('Error getting reCAPTCHA token:', error);
      setError('Failed to verify you are human. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [initializeRecaptcha, isRecaptchaReady, recaptchaSiteKey]);

  return {
    initializeRecaptcha,
    getRecaptchaToken,
    isLoading,
    error,
    isRecaptchaReady,
    setError
  };
};