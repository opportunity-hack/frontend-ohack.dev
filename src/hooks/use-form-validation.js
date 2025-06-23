import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

/**
 * Custom hook for form validation (handles GitHub username and Slack channel validation)
 * 
 * @returns {Object} Validation functions and state
 */
const useFormValidation = () => {
  const [isValidatingGithub, setIsValidatingGithub] = useState(false);
  const [isGithubValid, setIsGithubValid] = useState(null);
  const [githubError, setGithubError] = useState("");

  const [isValidatingSlack, setIsValidatingSlack] = useState(false);
  const [isSlackValid, setIsSlackValid] = useState(null);
  const [slackError, setSlackError] = useState("");
  
  const [error, setError] = useState("");

  // Helper function for debounce
  const debounce = useCallback((func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }, []);

  // Debounced GitHub username validation
  const validateGithubUsername = useCallback(
    debounce(async (username) => {
      if (!username.trim()) {
        setIsGithubValid(false);
        setGithubError("GitHub username is required");
        setIsValidatingGithub(false);
        return;
      }

      setIsValidatingGithub(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/validate/github/${username}`
        );

        setIsGithubValid(response.data.valid);
        if (!response.data.valid) {
          setGithubError(response.data.message || "Invalid GitHub username");
        } else {
          setGithubError("GitHub username exists");
        }
      } catch (err) {
        setIsGithubValid(false);
        setGithubError("Could not verify GitHub username");
        console.error("GitHub validation error:", err);
      } finally {
        setIsValidatingGithub(false);
      }
    }, 800),
    [debounce]
  );

  // Debounced Slack channel validation
  const validateSlackChannel = useCallback(
    debounce(async (channel) => {
      if (!channel.trim()) {
        setIsSlackValid(false);
        setSlackError("Slack channel is required");
        setIsValidatingSlack(false);
        return;
      }

      if (!channel.match(/^[a-z0-9-_]+$/)) {
        setIsSlackValid(false);
        setSlackError(
          "Use only lowercase letters, numbers, hyphens, and underscores"
        );
        setIsValidatingSlack(false);
        return;
      }

      setIsValidatingSlack(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/validate/slack/${channel}`
        );

        setIsSlackValid(response.data.valid);
        if (response.data.exists) {
          setSlackError(response.data.message || "Invalid Slack channel");
          setIsSlackValid(false);
        } else {
          setSlackError("Slack channel is available");
        }
      } catch (err) {
        setIsSlackValid(false);
        setSlackError("Slack channel already exists or is invalid");
        console.error("Slack validation error:", err);
      } finally {
        setIsValidatingSlack(false);
      }
    }, 800),
    [debounce]
  );

  // Validate the team creation form
  const validateForm = useCallback((teamName, slackChannel, githubUsername, selectedNonprofits) => {
    if (!teamName.trim()) {
      setError("Team name is required.");
      return false;
    }
    if (!slackChannel.trim()) {
      setError("Slack channel is required.");
      return false;
    }
    if (!slackChannel.match(/^[a-z0-9-_]+$/)) {
      setError(
        "Invalid Slack channel name. Use only lowercase letters, numbers, hyphens, and underscores."
      );
      return false;
    }
    if (!githubUsername.trim()) {
      setError("GitHub username is required.");
      return false;
    }
    if (isValidatingGithub || isValidatingSlack) {
      setError("Please wait for validation to complete.");
      return false;
    }
    if (isGithubValid === false) {
      setError(githubError || "Invalid GitHub username.");
      return false;
    }
    if (isSlackValid === false) {
      setError(slackError || "Invalid Slack channel name.");
      return false;
    }
    if (!selectedNonprofits || selectedNonprofits.length === 0) {
      setError("Please select and rank at least one nonprofit.");
      return false;
    }
    return true;
  }, [isValidatingGithub, isValidatingSlack, isGithubValid, isSlackValid, githubError, slackError]);

  // Validate each step individually
  const validateStep = useCallback((step, teamName, slackChannel, githubUsername, selectedNonprofits) => {
    switch (step) {
      case 0: // Team Details
        if (!teamName.trim()) {
          setError("Team name is required.");
          return false;
        }
        if (!slackChannel.trim()) {
          setError("Slack channel is required.");
          return false;
        }
        if (!slackChannel.match(/^[a-z0-9-_]+$/)) {
          setError(
            "Invalid Slack channel name. Use only lowercase letters, numbers, hyphens, and underscores."
          );
          return false;
        }
        if (isValidatingSlack) {
          setError("Please wait for Slack channel validation to complete.");
          return false;
        }
        if (isSlackValid === false) {
          setError(slackError || "Invalid Slack channel name.");
          return false;
        }
        return true;

      case 1: // GitHub Information
        if (!githubUsername.trim()) {
          setError("GitHub username is required.");
          return false;
        }
        if (isValidatingGithub) {
          setError("Please wait for GitHub username validation to complete.");
          return false;
        }
        if (isGithubValid === false) {
          setError(githubError || "Invalid GitHub username.");
          return false;
        }
        return true;

      case 2: // Nonprofit Ranking & Team
        if (!selectedNonprofits || selectedNonprofits.length === 0) {
          setError("Please select and rank at least one nonprofit.");
          return false;
        }
        return true;

      case 3: // Confirming & Creating
        return validateForm(teamName, slackChannel, githubUsername, selectedNonprofits);

      default:
        return true;
    }
  }, [isValidatingGithub, isValidatingSlack, isGithubValid, isSlackValid, githubError, slackError, validateForm]);

  // Check if next button should be disabled
  const isNextDisabled = useCallback((activeStep, loading, teamName, slackChannel, githubUsername, selectedNonprofits) => {
    if (loading) return true;

    switch (activeStep) {
      case 0: // Team Details
        return (
          !teamName.trim() ||
          !slackChannel.trim() ||
          !slackChannel.match(/^[a-z0-9-_]+$/) ||
          isValidatingSlack ||
          isSlackValid === false
        );
      case 1: // GitHub Information
        return (
          !githubUsername.trim() ||
          isValidatingGithub ||
          isGithubValid === false
        );
      case 2: // Nonprofit Ranking & Team
        return !selectedNonprofits || selectedNonprofits.length === 0;
      default:
        return false;
    }
  }, [isValidatingGithub, isValidatingSlack, isGithubValid, isSlackValid]);

  return {
    isValidatingGithub,
    isGithubValid,
    githubError,
    isValidatingSlack,
    isSlackValid,
    slackError,
    error,
    validateGithubUsername,
    validateSlackChannel,
    validateForm,
    validateStep,
    isNextDisabled,
    setError
  };
};

export default useFormValidation;