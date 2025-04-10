import React, { useState, useEffect, useCallback } from "react";
import {
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  LinearProgress,
  Autocomplete,
  Step,
  Stepper,
  StepLabel,
  Paper,
  Fade,
  CircularProgress,
  Zoom,
  Container,
  InputAdornment,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { FaRocket, FaSlack, FaGithub, FaCheck, FaTimes } from "react-icons/fa";
import { MdGroup } from "react-icons/md";
import axios from "axios";
import { useAuthInfo, withRequiredAuthInfo } from "@propelauth/react";
import Head from "next/head";
import { useRouter } from "next/router";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
  transition: "transform 0.2s",
  "&:hover": {
    transform: "translateY(-2px)",
  },
}));

const steps = [
  "Team Details",
  "GitHub Information",
  "Cheering for Nonprofit",
  "Confirming & Creating",
];

const NewTeam = withRequiredAuthInfo(({ userClass }) => {
  const { accessToken } = useAuthInfo();
  const [teamName, setTeamName] = useState("");
  const [slackChannel, setSlackChannel] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [selectedNonprofit, setSelectedNonprofit] = useState(null);
  const [nonprofits, setNonprofits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [event, setEvent] = useState(null);

  // New state variables for validation
  const [isValidatingGithub, setIsValidatingGithub] = useState(false);
  const [isGithubValid, setIsGithubValid] = useState(null);
  const [githubError, setGithubError] = useState("");

  const [isValidatingSlack, setIsValidatingSlack] = useState(false);
  const [isSlackValid, setIsSlackValid] = useState(null);
  const [slackError, setSlackError] = useState("");

  // Extract event_id from the URL path parameter
  const router = useRouter();
  const { event_id } = router.query;

  useEffect(() => {
    if (event_id) {
      fetchHackathonEvent();
    }
  }, [event_id]);

  const fetchHackathonEvent = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${event_id}`
      );
      if (response && response.data) {
        console.log("Event details:", response.data);
        setEvent(response.data);

        // If the event has nonprofits, fetch detailed information for each
        if (response.data.nonprofits && response.data.nonprofits.length > 0) {
          fetchNonprofitDetails(response.data.nonprofits);
        }
      } else {
        setError("Failed to fetch event details. Please try again later.");
      }
    } catch (err) {
      console.error("Error fetching event details:", err);
      setError("Failed to fetch event details. Please try again later.");
    }
  };

  const fetchNonprofitDetails = async (nonprofitIds) => {
    console.log("Fetching nonprofit details for IDs:", nonprofitIds);
    try {
      const nonprofitPromises = nonprofitIds.map((nonprofitId) =>
        axios.get(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/npo/${nonprofitId.id}`
        )
      );

      const nonprofitResponses = await Promise.all(nonprofitPromises);
      console.log("Nonprofit details responses:", nonprofitResponses);
      const detailedNonprofits = nonprofitResponses.map(
        (response) => response.data.nonprofits
      );

      setNonprofits(detailedNonprofits);
    } catch (err) {
      console.error("Error fetching nonprofit details:", err);
      setError("Failed to fetch nonprofit information. Please try again later.");
    }
  };

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
    []
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
    []
  );

  // Helper function for debounce
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Effect to trigger validation when inputs change
  useEffect(() => {
    if (githubUsername) validateGithubUsername(githubUsername);
  }, [githubUsername, validateGithubUsername]);

  useEffect(() => {
    if (slackChannel) validateSlackChannel(slackChannel);
  }, [slackChannel, validateSlackChannel]);

  const validateForm = () => {
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
    if (!selectedNonprofit) {
      setError("Please select a nonprofit.");
      return false;
    }
    return true;
  };

  const validateCurrentStep = (step) => {
    switch (step) {
      case 0:
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

      case 1:
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

      case 2:
        if (!selectedNonprofit) {
          setError("Please select a nonprofit.");
          return false;
        }
        return true;

      case 3:
        return validateForm();

      default:
        return true;
    }
  };

  const simulateProgress = () => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
      }
    }, 2800);
    return interval;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");
    setProgress(0);

    const progressInterval = simulateProgress();

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/team`,
        {
          name: teamName,
          slackChannel,
          eventId: event_id,
          nonprofitId: selectedNonprofit.id,
          githubUsername,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      clearInterval(progressInterval);
      setLoading(false);
      setProgress(100);

      if (response.data.success) {
        setSuccess(true);
        setSuccessMessage(response.data.message);
      } else {
        setError(
          response.data.message || "An error occurred while creating the team."
        );
      }
    } catch (err) {
      clearInterval(progressInterval);
      setLoading(false);
      setError(
        err.response?.data?.message ||
          "An unexpected error occurred. Please try again."
      );
    }
  };

  const handleNext = () => {
    if (validateCurrentStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
      setError("");
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError("");
  };

  const isNextDisabled = () => {
    if (loading) return true;

    switch (activeStep) {
      case 0:
        return (
          !teamName.trim() ||
          !slackChannel.trim() ||
          !slackChannel.match(/^[a-z0-9-_]+$/) ||
          isValidatingSlack ||
          isSlackValid === false
        );
      case 1:
        return (
          !githubUsername.trim() ||
          isValidatingGithub ||
          isGithubValid === false
        );
      case 2:
        return !selectedNonprofit;
      default:
        return false;
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            <StyledTextField
              fullWidth
              label="Team Name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
              inputProps={{ maxLength: 50 }}
              helperText={`${teamName.length}/50 characters`}
              InputProps={{
                startAdornment: <MdGroup style={{ marginRight: 8 }} />,
              }}
            />
            <StyledTextField
              fullWidth
              label="Slack Channel (without #) - we will create it if it doesn't exist"
              value={slackChannel}
              onChange={(e) => setSlackChannel(e.target.value.toLowerCase())}
              required
              error={isSlackValid === false}
              helperText={
                slackError ||
                "Use lowercase letters, numbers, hyphens, and underscores only"
              }
              InputProps={{
                startAdornment: <FaSlack style={{ marginRight: 8 }} />,
                endAdornment: (
                  <InputAdornment position="end">
                    {isValidatingSlack && <CircularProgress size={20} />}
                    {!isValidatingSlack && isSlackValid === true && (
                      <FaCheck color="green" />
                    )}
                    {!isValidatingSlack && isSlackValid === false && (
                      <FaTimes color="red" />
                    )}
                  </InputAdornment>
                ),
              }}
            />
          </>
        );
      case 1:
        return (
          <StyledTextField
            fullWidth
            label="Your GitHub Username - we will create a repo and make you the owner"
            value={githubUsername}
            onChange={(e) => setGithubUsername(e.target.value)}
            required
            error={isGithubValid === false}
            helperText={githubError}
            InputProps={{
              startAdornment: <FaGithub style={{ marginRight: 8 }} />,
              endAdornment: (
                <InputAdornment position="end">
                  {isValidatingGithub && <CircularProgress size={20} />}
                  {!isValidatingGithub && isGithubValid === true && (
                    <FaCheck color="green" />
                  )}
                  {!isValidatingGithub && isGithubValid === false && (
                    <FaTimes color="red" />
                  )}
                </InputAdornment>
              ),
            }}
          />
        );
      case 2:
        return (
          <Autocomplete
            fullWidth
            options={nonprofits}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => (
              <StyledTextField {...params} label="Select Nonprofit" required />
            )}
            value={selectedNonprofit}
            onChange={(event, newValue) => {
              setSelectedNonprofit(newValue);
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Please confirm your team details:
            </Typography>
            <Typography>Team Name: {teamName}</Typography>
            <Typography>Slack Channel: #{slackChannel}</Typography>
            <Typography>GitHub Username: {githubUsername}</Typography>
            <Typography>
              Selected Nonprofit: {selectedNonprofit?.name}
            </Typography>
          </Box>
        );
      default:
        return "Unknown step";
    }
  };

  return (
    <Container maxWidth="md">
      <Head>
        <title>Create a New Team - Opportunity Hack</title>
        <meta
          name="description"
          content="Create a new team for Opportunity Hack and start working on nonprofit projects."
        />
      </Head>
      <Box my={4}>
        <Typography variant="h2" mt={10} align="center" gutterBottom>
          Create a New Team <FaRocket style={{ verticalAlign: "middle" }} />
        </Typography>
        <Typography variant="body1" align="center" paragraph>
          Join forces and make a difference! Set up your team, connect on Slack,
          and start working on impactful nonprofit projects.
        </Typography>
      </Box>
      <StyledPaper>
        {success ? (
          <Zoom in={success}>
            <Alert
              severity="success"
              sx={{ mb: 2, fontSize: "16px", alignItems: "center" }}
              icon={<FaRocket size={24} />}
            >
              <Typography variant="h6">{successMessage}</Typography>
              <Typography variant="body1">
                Your team is ready to make a difference!
              </Typography>
            </Alert>
          </Zoom>
        ) : (
          <Box>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            <form onSubmit={handleSubmit}>
              {getStepContent(activeStep)}
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}
              >
                <Button disabled={activeStep === 0} onClick={handleBack}>
                  Back
                </Button>
                <AnimatedButton
                  variant="contained"
                  color="primary"
                  onClick={
                    activeStep === steps.length - 1 ? handleSubmit : handleNext
                  }
                  disabled={
                    activeStep === steps.length - 1 ? loading : isNextDisabled()
                  }
                  sx={{
                    opacity: isNextDisabled() ? 0.7 : 1,
                    '&:disabled': {
                      backgroundColor: 'rgba(25, 118, 210, 0.5)',
                      color: 'white',
                    },
                  }}
                >
                  {activeStep === steps.length - 1 ? "Create Team" : "Next"}
                  {loading && <CircularProgress size={24} sx={{ ml: 1 }} />}
                </AnimatedButton>
              </Box>
            </form>
            {isNextDisabled() && !error && (
              <Typography
                color="textSecondary"
                align="right"
                sx={{ mt: 2, fontSize: "0.875rem", fontStyle: "italic" }}
              >
                {activeStep === 0
                  ? "Please complete your team details to continue"
                  : activeStep === 1
                  ? "Please provide a valid GitHub username"
                  : activeStep === 2
                  ? "Please select a nonprofit organization"
                  : ""}
              </Typography>
            )}
            {loading && (
              <Fade in={loading}>
                <Box sx={{ width: "100%", mt: 4 }}>
                  <LinearProgress variant="determinate" value={progress} />
                  <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                    {steps[Math.floor(progress / (100 / steps.length))]}
                  </Typography>
                </Box>
              </Fade>
            )}
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        )}
      </StyledPaper>
    </Container>
  );
});

export default NewTeam;
