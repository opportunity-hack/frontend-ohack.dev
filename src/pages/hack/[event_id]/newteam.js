import React, { useState, useEffect, useCallback } from "react";
import {
  Typography,
  Box,
  Alert,
  LinearProgress,
  Step,
  Stepper,
  StepLabel,
  Paper,
  Fade,
  CircularProgress,
  Zoom,
  Container,
  Button
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { FaRocket } from "react-icons/fa";
import axios from "axios";
import { useAuthInfo, withRequiredAuthInfo } from "@propelauth/react";
import Head from "next/head";
import { useRouter } from "next/router";

// Import components
import TeamDetailsForm from "../../../components/TeamCreation/TeamDetailsForm";
import GitHubInfoForm from "../../../components/TeamCreation/GitHubInfoForm";
import NonprofitSelectionStep from "../../../components/TeamCreation/NonprofitSelectionStep";
import ConfirmationSummary from "../../../components/TeamCreation/ConfirmationSummary";
import FormStepper from "../../../components/TeamCreation/FormStepper";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
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
  "Nonprofit Rankings & Team",
  "Confirming & Creating",
];

const NewTeam = withRequiredAuthInfo(({ userClass }) => {
  const { accessToken } = useAuthInfo();
  const [teamName, setTeamName] = useState("");
  const [slackChannel, setSlackChannel] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [nonprofits, setNonprofits] = useState([]);
  const [filteredNonprofits, setFilteredNonprofits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNonprofits, setSelectedNonprofits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [event, setEvent] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [memberInput, setMemberInput] = useState('');
  const [teamLeadConfirmed, setTeamLeadConfirmed] = useState(false);
  const [comments, setComments] = useState('');
  const [rankingMode, setRankingMode] = useState('select'); // 'select' or 'rank'
  const [slackUsers, setSlackUsers] = useState([]);

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


  // Call the backend API /api/slack/users with active_days=30
  const fetchActiveSlackUsers = async () => {
    console.log("Fetching active Slack users...");
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/slack/users/active?active_days=30`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data && response.data.users) {
        const activeUsers = response.data.users.map((user) => ({
          id: user.id,
          name: user.name,
          real_name: user.real_name,
          tz: user.tz,          
        }        
        ));
        console.log("Active Slack users:", activeUsers);
        setSlackUsers(activeUsers);
      } else {
        setError("Failed to fetch active Slack users. Please try again later.");
      }
    } catch (err) {
      console.error("Error fetching active Slack users:", err);
      setError("Failed to fetch active Slack users. Please try again later.");
    }
  };

  useEffect(() => {
    fetchActiveSlackUsers();
  }, [event_id, accessToken]);


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

      // Enhanced nonprofits with problem statement details
      const nonprofitsWithProblems = await Promise.all(
        detailedNonprofits.map(async (nonprofit) => {
          if (nonprofit.problem_statements && nonprofit.problem_statements.length > 0) {
            // Fetch details for each problem statement ID
            const problemStatementDetails = await Promise.all(
              nonprofit.problem_statements.map(async (problemId) => {
                try {
                  const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/problem-statements/${problemId}`
                  );
                  const problemData = response.data;
                  
                  // Create a display title from the fetched data
                  const displayTitle = problemData.title || 
                    (problemData.description && problemData.description.length > 30 ? 
                      `${problemData.description.substring(0, 30)}...` : 
                      problemData.description) || 
                    `Need ${problemId.substring(0, 6)}`;
                  
                  return {
                    id: problemId,
                    ...problemData,
                    displayTitle
                  };
                } catch (err) {
                  console.error(`Error fetching problem statement ${problemId}:`, err);
                  return {
                    id: problemId,
                    displayTitle: `Problem ${problemId.substring(0, 6)}...`,
                    description: "Details could not be loaded",
                    error: true
                  };
                }
              })
            );
            
            // Replace the problem statement IDs with the detailed objects
            nonprofit.problem_statements = problemStatementDetails;
          } else {
            nonprofit.problem_statements = [];
          }
          return nonprofit;
        })
      );

      setNonprofits(nonprofitsWithProblems);
      setFilteredNonprofits(nonprofitsWithProblems);
    } catch (err) {
      console.error("Error fetching nonprofit details:", err);
      setError("Failed to fetch nonprofit information. Please try again later.");
    }
  };
  
  // Filter nonprofits based on search term
  const filterNonprofits = useCallback((term) => {
    if (!term.trim()) {
      setFilteredNonprofits(nonprofits);
      return;
    }
    
    const lowerTerm = term.toLowerCase();
    const filtered = nonprofits.filter(nonprofit => 
      nonprofit.name.toLowerCase().includes(lowerTerm) || 
      (nonprofit.description && nonprofit.description.toLowerCase().includes(lowerTerm)) ||
      (nonprofit.problem_statements && nonprofit.problem_statements.some(p => 
        p.displayTitle.toLowerCase().includes(lowerTerm) || 
        (p.description && p.description.toLowerCase().includes(lowerTerm))
      ))
    );
    
    setFilteredNonprofits(filtered);
  }, [nonprofits]);
  
  // Handle search input change
  const handleSearchChange = useCallback((e) => {
    const term = e.target.value;
    setSearchTerm(term);
    filterNonprofits(term);
  }, [filterNonprofits]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setFilteredNonprofits(nonprofits);
  }, [nonprofits]);
  
  // Toggle nonprofit selection
  const toggleNonprofitSelection = useCallback((nonprofit) => {
    setSelectedNonprofits(prev => {
      // Check if already selected
      const isSelected = prev.some(np => np.id === nonprofit.id);
      
      if (isSelected) {
        // Remove from selection
        return prev.filter(np => np.id !== nonprofit.id);
      } else {
        // Add to selection
        return [...prev, nonprofit];
      }
    });
  }, []);
  
  // Handle dragging and dropping nonprofits to rank them
  const handleDragEnd = useCallback((result) => {
    if (!result.destination) return;
    
    const items = Array.from(selectedNonprofits);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setSelectedNonprofits(items);
  }, [selectedNonprofits]);
  
  // Move from selection mode to ranking mode
  const proceedToRanking = useCallback(() => {
    if (selectedNonprofits.length === 0) {
      setError("Please select at least one nonprofit before proceeding to ranking.");
      return;
    }
    
    setRankingMode('rank');
  }, [selectedNonprofits.length]);
  
  // Go back to selection mode
  const backToSelection = useCallback(() => {
    setRankingMode('select');
  }, []);
  
  // Team member management
  const handleAddTeamMember = useCallback(() => {
    if (!memberInput) return;
    
    const memberName = typeof memberInput === 'string' ? memberInput.trim() : (memberInput.real_name || memberInput.name || '').trim();
    
    if (memberName === '') return;
    
    // Check for duplicates - check either the string value or the real_name value
    const isDuplicate = teamMembers.some(member => {
      if (typeof member === 'string' && typeof memberInput === 'string') {
        return member === memberName;
      } else if (typeof member === 'object' && typeof memberInput === 'object') {
        return member.id === memberInput.id;
      } else if (typeof member === 'string' && typeof memberInput === 'object') {
        return member === memberInput.real_name || member === memberInput.name;
      } else if (typeof member === 'object' && typeof memberInput === 'string') {
        return member.real_name === memberInput || member.name === memberInput;
      }
      return false;
    });
    
    if (isDuplicate) {
      setError('This team member has already been added');
      return;
    }
    
    setTeamMembers(prev => [...prev, memberInput]);
    setMemberInput('');
    setError('');
  }, [memberInput, teamMembers]);

  const handleRemoveTeamMember = useCallback((index) => {
    setTeamMembers(prev => {
      const newMembers = [...prev];
      newMembers.splice(index, 1);
      return newMembers;
    });
  }, []);

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
    if (selectedNonprofits.length === 0) {
      setError("Please select and rank at least one nonprofit.");
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
        if (selectedNonprofits.length === 0) {
          setError("Please select and rank at least one nonprofit.");
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
    if (e) e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");
    setProgress(0);

    const progressInterval = simulateProgress();

    try {      
      // Prepare rankings data
      const rankings = selectedNonprofits.map((nonprofit, index) => ({
        nonprofit_id: nonprofit.id,
        rank: index + 1
      }));
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/team/queue`,
        {
          name: teamName,
          slackChannel,
          eventId: event_id,
          nonprofitRankings: rankings,
          teamMembers: teamMembers,
          githubUsername,
          comments: comments,
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
        return selectedNonprofits.length === 0;
      default:
        return false;
    }
  };

  // Render the current step content
  const getStepContent = (step) => {
    switch (step) {
      case 0: // Team Details
        return (
          <TeamDetailsForm
            teamName={teamName}
            setTeamName={setTeamName}
            slackChannel={slackChannel}
            setSlackChannel={setSlackChannel}
            isValidatingSlack={isValidatingSlack}
            isSlackValid={isSlackValid}
            slackError={slackError}
          />
        );
      case 1: // GitHub Information
        return (
          <GitHubInfoForm
            githubUsername={githubUsername}
            setGithubUsername={setGithubUsername}
            isValidatingGithub={isValidatingGithub}
            isGithubValid={isGithubValid}
            githubError={githubError}
          />
        );
      case 2: // Nonprofit Selection & Team
        return (
          <NonprofitSelectionStep
            rankingMode={rankingMode}
            searchTerm={searchTerm}
            filteredNonprofits={filteredNonprofits}
            selectedNonprofits={selectedNonprofits}
            handleSearchChange={handleSearchChange}
            toggleNonprofitSelection={toggleNonprofitSelection}
            clearSearch={clearSearch}
            proceedToRanking={proceedToRanking}
            backToSelection={backToSelection}
            handleDragEnd={handleDragEnd}
            teamMembers={teamMembers}
            memberInput={memberInput}
            setMemberInput={setMemberInput}
            handleAddTeamMember={handleAddTeamMember}
            handleRemoveTeamMember={handleRemoveTeamMember}
            comments={comments}
            setComments={setComments}
            slackUsers={slackUsers}
            error={error}
          />
        );
      case 3: // Confirmation
        return (
          <ConfirmationSummary
            teamName={teamName}
            slackChannel={slackChannel}
            githubUsername={githubUsername}
            selectedNonprofits={selectedNonprofits}
            teamMembers={teamMembers}
            comments={comments}
          />
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
                <br /><br />
                <strong>Next Steps:</strong>
                <ul>
                  <li>We'll notify you in Slack when your team is assigned to a nonprofit.
                  </li>
                </ul>

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