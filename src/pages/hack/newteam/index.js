import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { FaRocket, FaSlack, FaGithub } from "react-icons/fa";
import { MdGroup } from "react-icons/md";
import axios from "axios";
import { useAuthInfo, withRequiredAuthInfo } from "@propelauth/react";
import Head from "next/head";

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

  const event_id = "2024_fall"; // TODO - Update this with the current event ID

  useEffect(() => {
    fetchNonprofits();
  }, []);

  const fetchNonprofits = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/npos`
      );
      setNonprofits(response.data.nonprofits || []);
    } catch (err) {
      console.error("Error fetching nonprofits:", err);
      setError("Failed to fetch nonprofits. Please try again later.");
    }
  };

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
    if (!selectedNonprofit) {
      setError("Please select a nonprofit.");
      return false;
    }
    return true;
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
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
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
              inputProps={{ pattern: "[a-z0-9-_]+" }}
              helperText="Use lowercase letters, numbers, hyphens, and underscores only"
              InputProps={{
                startAdornment: <FaSlack style={{ marginRight: 8 }} />,
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
            InputProps={{
              startAdornment: <FaGithub style={{ marginRight: 8 }} />,
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
                  disabled={loading}
                >
                  {activeStep === steps.length - 1 ? "Create Team" : "Next"}
                  {loading && <CircularProgress size={24} sx={{ ml: 1 }} />}
                </AnimatedButton>
              </Box>
            </form>
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
