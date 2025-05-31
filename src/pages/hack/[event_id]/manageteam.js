import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Button,
  Collapse,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import WarningIcon from "@mui/icons-material/Warning";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { styled } from "@mui/material/styles";
import { FaRocket } from "react-icons/fa";
import axios from "axios";
import {
  useAuthInfo,  
  RequiredAuthProvider,
  RedirectToLogin
} from "@propelauth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Puff } from "react-loading-icons";

// Import components
import TeamDetailsForm from "../../../components/TeamCreation/TeamDetailsForm";
import GitHubInfoForm from "../../../components/TeamCreation/GitHubInfoForm";
import NonprofitSelectionStep from "../../../components/TeamCreation/NonprofitSelectionStep";
import ConfirmationSummary from "../../../components/TeamCreation/ConfirmationSummary";
import TeamStatusPanel from "../../../components/TeamCreation/TeamStatusPanel";

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

// Creating a wrapper with RequiredAuthProvider


// Apply our custom HOC to the component
// Define keyframes for animations
const keyframes = `
  @keyframes pulse {
    0% { background-position: 0% 50% }
    50% { background-position: 100% 50% }
    100% { background-position: 0% 50% }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg) }
    100% { transform: rotate(360deg) }
  }

  @keyframes fadeInOut {
    0% { opacity: 0.7 }
    50% { opacity: 1 }
    100% { opacity: 0.7 }
  }
`;

// Define video files array for waiting animations
const waitingVideos = [
  'a_cat_that_is_waiting_to_pounce.mp4',
  'a_cat_that_is_waiting_to_pounce_1.mp4',
  'a_cat_that_is_waiting_to_pounce_2.mp4',
  'a_cat_that_is_waiting_to_pounce_3.mp4',
  'a_dog_that_is_waiting_by_the.mp4',
  'a_dog_that_is_waiting_by_the_1.mp4',
  'a_dog_that_is_waiting_by_the_2.mp4',
  'a_dog_that_is_waiting_by_the_3.mp4'
];

const ManageTeamComponent = () => {
  // State for selected waiting video
  const [selectedVideo, setSelectedVideo] = useState('');
  
  // Inject the keyframes animation styles
  const animationStyleRef = useRef(null);
  
  // Select a random waiting video on component mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * waitingVideos.length);
    setSelectedVideo(waitingVideos[randomIndex]);
  }, []);
  
  useEffect(() => {
    // Create style element if it doesn't exist
    if (!animationStyleRef.current) {
      const styleElement = document.createElement('style');
      styleElement.innerHTML = keyframes;
      document.head.appendChild(styleElement);
      animationStyleRef.current = styleElement;
    }
    
    return () => {
      // Clean up on unmount
      if (animationStyleRef.current) {
        document.head.removeChild(animationStyleRef.current);
        animationStyleRef.current = null;
      }
    };
  }, []);
  const authInfo = useAuthInfo();
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
  const [myTeams, setMyTeams] = useState(null); // Initially null to indicate loading state
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  const [showNewTeamForm, setShowNewTeamForm] = useState(false);

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
      fetchMyTeams();
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



  const fetchMyTeams = async () => {
    setIsLoadingTeams(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/team/${event_id}/me`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",            
          },
        }
      );
      if (response && response.data) {
        console.log("Team details:", response.data.teams);        
        setMyTeams(response.data.teams);
      } else {
        setError("Failed to fetch team details. Please try again later.");
        setMyTeams([]); // Set to empty array in case of partial success response
      }
    } catch (err) {
      console.error("Error fetching team details:", err);
      setError("Failed to fetch team details. Please try again later.");
      setMyTeams([]); // Set to empty array on error
    } finally {
      setIsLoadingTeams(false);
    }
  };

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

  // Get my proifile information and if user.github is set, set it to githubUsername
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/users/profile`,
          {
            headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",            
          },
          }
        );
        if (response && response.data) {
          console.log("User profile:", response.data);
          const userProfile = response.data;
          if (userProfile.github) {
            setGithubUsername(userProfile.github);
          }
          
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to fetch user profile. Please try again later.");
      }
    };
    fetchUserProfile();
  }, [accessToken]);
  

  
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
    
    console.log("Adding team member:", memberInput);
    
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

  // Check if user already has any team (any status)
  const hasExistingTeam = myTeams && myTeams.length > 0;
  
  // Check if user already has an approved team
  const hasApprovedTeam = myTeams && myTeams.some(team => 
    team.status === 'APPROVED' || team.status === 'PROJECT_COMPLETE'
  );
  
  // Page title dynamically changes based on team status
  const pageTitle = hasApprovedTeam 
    ? "Manage Your Hackathon Team - Opportunity Hack" 
    : "Create or Manage Team - Opportunity Hack";
  
  // Appropriate meta description based on context
  const metaDescription = hasApprovedTeam
    ? "Manage your hackathon team, access resources, and coordinate with your teammates during the Opportunity Hack event."
    : "Create a new team or manage existing team applications for Opportunity Hack and start working on nonprofit projects.";

  return (
    <Container maxWidth="lg">
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://opportunity-hack.slack.com" />
        <link rel="preconnect" href="https://github.com" />
      </Head>
      
      {/* Add spacing to avoid overlapping with fixed top navigation */}
      <Box sx={{ pt: { xs: '80px', sm: '100px' }, pb: 4 }}>
        {/* Navigation header with back button */}
        <Box 
          sx={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3
          }}
        >
          <Button
            variant="outlined"
            color="primary"
            href={`/hack/${event_id}`}
            startIcon={<Box component="span" sx={{ fontSize: '1.2rem' }}>←</Box>}
            sx={{ 
              borderRadius: '8px',
              pl: 2,
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.04)',
                transform: 'translateX(-2px)'
              },
              transition: 'transform 0.2s'
            }}
          >
            Back to Hackathon
          </Button>
          
          {event?.title && (
            <Typography 
              variant="body2" 
              color="textSecondary" 
              sx={{ 
                display: { xs: 'none', md: 'block' },
                fontStyle: 'italic'
              }}
            >
              {event.title}
            </Typography>
          )}
        </Box>
        
        {/* Team Status Panel - Properly handles different loading states */}
        <TeamStatusPanel
          eventId={event_id}
          teams={myTeams}
          loading={isLoadingTeams}
          error={error}
          nonprofits={nonprofits}
          event={event}
        />

        {/* Team Creation Form - Collapsed by default when team exists */}
        {hasExistingTeam ? (
          <Box sx={{ mt: 6, mb: 4 }}>
            <Alert 
              severity="warning" 
              variant="filled"
              icon={<WarningIcon />}
              sx={{ mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
              <Typography variant="h6" fontWeight="bold">
                You Already Have a Team
              </Typography>
              <Typography variant="body1" sx={{ mt: 1, fontSize: '1.05rem' }}>
                {hasApprovedTeam 
                  ? "You already have an approved team for this hackathon. Creating another team is not recommended unless explicitly instructed by the Opportunity Hack staff." 
                  : "You already have a team application in review for this hackathon. Please wait for your application to be processed before creating another team."}
              </Typography>
            </Alert>
            
            <Accordion 
              expanded={showNewTeamForm} 
              onChange={() => setShowNewTeamForm(!showNewTeamForm)}
              sx={{ 
                border: '1px solid #e0e0e0', 
                borderRadius: '8px !important', 
                overflow: 'hidden',
                boxShadow: '0 3px 10px rgba(0,0,0,0.08)'
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{ 
                  bgcolor: '#f5f5f5', 
                  borderBottom: showNewTeamForm ? '1px solid #e0e0e0' : 'none',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FaRocket style={{ marginRight: '12px', color: '#f57c00' }} />
                  <Typography variant="h6" fontWeight="medium">
                    {showNewTeamForm ? "Hide Team Creation Form" : "Show Team Creation Form"}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body1">
                    Only proceed with creating a new team if you:
                    <ul style={{ marginTop: '8px', marginBottom: '4px' }}>
                      <li>Don't have any existing approved teams</li>
                      <li>Have been explicitly instructed by Opportunity Hack staff to create an additional team</li>
                    </ul>
                  </Typography>
                </Alert>
                
                <Box id="create-team-section" my={3}>
                  <Typography variant="h3" align="center" gutterBottom>
                    Create a New Team <FaRocket style={{ verticalAlign: "middle" }} />
                  </Typography>
                  <Typography variant="body1" align="center" paragraph>
                    Join forces and make a difference! Set up your team, connect on Slack,
                    and start working on impactful nonprofit projects.
                  </Typography>
                  
                  {/* Call to action for finding teammates */}
                  <Box 
                    sx={{ 
                      mt: 3, 
                      p: 3, 
                      bgcolor: '#e3f2fd', 
                      borderRadius: 2, 
                      border: '1px dashed #2196f3',
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}
                  >
                    <Box>
                      <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                        <Box component="span" sx={{ mr: 1, fontSize: '1.3rem' }}>👥</Box>
                        Need additional teammates?
                      </Typography>
                      <Typography variant="body1">
                        You can find additional teammates who have skills that complement yours
                        and are interested in similar causes before creating a new team.
                      </Typography>
                    </Box>
                    <Button 
                      variant="contained" 
                      color="primary"
                      href={`/hack/${event_id}/findteam`}
                      size="large"
                      sx={{ 
                        px: 3, 
                        py: 1.2,
                        whiteSpace: 'nowrap',
                        minWidth: { xs: '100%', sm: 'auto' },
                        fontWeight: 'bold',
                        boxShadow: '0 4px 8px rgba(33, 150, 243, 0.3)',
                        '&:hover': {
                          boxShadow: '0 6px 12px rgba(33, 150, 243, 0.4)',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'transform 0.2s, box-shadow 0.2s'
                      }}
                    >
                      Find Teammates
                    </Button>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          </Box>
        ) : (
          <Box my={4} id="create-team-section">
            <Typography variant="h3" align="center" gutterBottom>
              Create a New Team <FaRocket style={{ verticalAlign: "middle" }} />
            </Typography>
            <Typography variant="body1" align="center" paragraph>
              Join forces and make a difference! Set up your team, connect on Slack,
              and start working on impactful nonprofit projects.
            </Typography>
            
            {/* Call to action for finding teammates */}
            <Box 
              sx={{ 
                mt: 3, 
                p: 3, 
                bgcolor: '#e3f2fd', 
                borderRadius: 2, 
                border: '1px dashed #2196f3',
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                  <Box component="span" sx={{ mr: 1, fontSize: '1.3rem' }}>👥</Box>
                  Looking for teammates?
                </Typography>
                <Typography variant="body1">
                  Don't create a team alone! Find other participants with complementary skills 
                  and shared interests to join forces and maximize your impact.
                </Typography>
              </Box>
              <Button 
                variant="contained" 
                color="primary"
                href={`/hack/${event_id}/findteam`}
                size="large"
                sx={{ 
                  px: 3, 
                  py: 1.2,
                  whiteSpace: 'nowrap',
                  minWidth: { xs: '100%', sm: 'auto' },
                  fontWeight: 'bold',
                  boxShadow: '0 4px 8px rgba(33, 150, 243, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 12px rgba(33, 150, 243, 0.4)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
              >
                Find Teammates
              </Button>
            </Box>
          </Box>
        )}
        
        {/* Team Creation Form */}
        <Box id="create-team-section-form" sx={{ 
          display: (hasExistingTeam && !showNewTeamForm) ? 'none' : 'block'
        }}>
          <StyledPaper>
            {success ? (
              <Zoom in={success}>
                <Box>
                  {/* Animated waiting indicator */}
                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3,
                    mb: 3,
                    borderRadius: 2,
                    background: 'linear-gradient(145deg, #e8f5e9 0%, #f1f8e9 100%)',
                    border: '1px solid #c5e1a5',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {/* Progress bar animation at top */}
                    <Box sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, #c5e1a5, #aed581, #c5e1a5)',
                      backgroundSize: '200% 100%',
                      animation: 'pulse 2s infinite linear'
                    }} />
                    
                    {/* Success icon */}
                    <Box sx={{ position: 'relative', mb: 2 }}>
                      <FaRocket 
                        size={64} 
                        color="#66bb6a"
                        style={{ 
                          filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.2))',
                        }} 
                      />
                      {/* Orbit animation around the rocket */}
                      <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        border: '2px dashed #81c784',
                        animation: 'spin 10s infinite linear'
                      }} />
                    </Box>
                    
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
                      Application Submitted!
                    </Typography>
                    
                    <Typography variant="h6" sx={{ textAlign: 'center', mb: 2 }}>
                      {successMessage}
                    </Typography>
                    
                    {/* Fun waiting video */}
                    {selectedVideo && (
                      <Box sx={{ 
                        width: '100%', 
                        mb: 3, 
                        borderRadius: 2,
                        overflow: 'hidden',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        border: '1px solid #a5d6a7'
                      }}>
                        <Box sx={{ 
                          bgcolor: '#81c784', 
                          p: 2, 
                          display: 'flex', 
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderBottom: '1px solid #a5d6a7'
                        }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white', textShadow: '0 1px 1px rgba(0,0,0,0.2)' }}>
                            <AccessTimeIcon sx={{ 
                              verticalAlign: 'middle', 
                              mr: 1.5,
                              animation: 'fadeInOut 2s infinite ease-in-out'
                            }} />
                            Waiting for Team Approval
                          </Typography>
                        </Box>
                        <Box sx={{ position: 'relative', paddingTop: '100%' /* 1:1 Square Aspect Ratio */ }}>
                          <video 
                            autoPlay 
                            loop 
                            muted 
                            playsInline
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              backgroundColor: '#f9fbf9'
                            }}
                          >
                            <source 
                              src={`https://cdn.ohack.dev/ohack.dev/videos/fun/${selectedVideo}`} 
                              type="video/mp4" 
                            />
                            Your browser does not support the video tag.
                          </video>
                        </Box>
                        <Box sx={{ 
                          p: 2, 
                          textAlign: 'center', 
                          bgcolor: '#f1f8e9', 
                          borderTop: '1px solid #a5d6a7' 
                        }}>
                          <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                            Refresh the page to see a different waiting animation!
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    
                    {/* Animated waiting status */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      p: 2,
                      mb: 3,
                      bgcolor: 'rgba(129, 199, 132, 0.2)',
                      borderRadius: 2,
                      animation: 'fadeInOut 2s infinite ease-in-out'
                    }}>
                      <AccessTimeIcon sx={{ mr: 1.5, color: 'success.main', fontSize: '1.6rem' }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 'medium', fontSize: '1.1rem' }}>
                        Waiting for review from Opportunity Hack staff...
                      </Typography>
                    </Box>
                    
                    {/* YouTube-inspired waiting message */}
                    <Box sx={{ 
                      width: '100%', 
                      p: 2, 
                      bgcolor: '#f5f5f5', 
                      borderRadius: 1,
                      border: '1px solid #e0e0e0'
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Next Steps:
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ 
                          minWidth: '30px', 
                          height: '30px', 
                          borderRadius: '50%', 
                          bgcolor: 'success.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          mr: 2,
                          fontSize: '1rem'
                        }}>1</Box>
                        <Typography variant="body1" sx={{ fontSize: '1.05rem' }}>
                          The Opportunity Hack team will review your application and match you with one of your preferred nonprofits.
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ 
                          minWidth: '30px', 
                          height: '30px', 
                          borderRadius: '50%', 
                          bgcolor: 'success.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          mr: 2,
                          fontSize: '1rem'
                        }}>2</Box>
                        <Typography variant="body1" sx={{ fontSize: '1.05rem' }}>
                          You'll be notified in <strong>Slack</strong> when your team is approved with your nonprofit assignment.
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Box sx={{ 
                          minWidth: '30px', 
                          height: '30px', 
                          borderRadius: '50%', 
                          bgcolor: 'success.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          mr: 2,
                          fontSize: '1rem'
                        }}>3</Box>
                        <Typography variant="body1" sx={{ fontSize: '1.05rem' }}>
                          <strong>Refresh this page</strong> after you receive notification to see your team's status update and nonprofit assignment.
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={() => window.location.reload()}
                      sx={{ mt: 4, py: 1.5, px: 3, fontSize: '1rem' }}
                      size="large"
                    >
                      Refresh Status
                    </Button>
                  </Box>
                </Box>
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
                    "&:disabled": {
                      backgroundColor: "rgba(25, 118, 210, 0.5)",
                      color: "white",
                    },
                  }}
                >
                  {activeStep === steps.length - 1 ? "Create Team" : "Next"}
                  {loading && <Puff stroke="#fff" width={24} height={24} style={{ marginLeft: '8px' }} />}
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
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Puff stroke="#1976d2" width={60} height={60} />
                  </Box>
                  <LinearProgress variant="determinate" value={progress} />
                  <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                    {steps[Math.floor(progress / (100 / steps.length))]}
                  </Typography>
                </Box>
              </Fade>
            )}
            {error && (
              <Fade in={!!error}>
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              </Fade>
            )}
          </Box>
        )}
          </StyledPaper>
        </Box>
      </Box>
    </Container>
  );
};

// Authenticated component that receives auth context
const AuthenticatedTeam = () => {
  const { user } = useAuthInfo();
  return <ManageTeamComponent userClass={user} />;
};

// Export the component with RequiredAuthProvider
const ManageTeam = () => {
  const router = useRouter();
  const { event_id } = router.query;

  // Create the current URL for redirection
  const currentUrl = typeof window !== 'undefined' && event_id
    ? `${window.location.origin}/hack/${event_id}/manageteam`
    : null;

  return (
    <RequiredAuthProvider
      authUrl={process.env.NEXT_PUBLIC_REACT_APP_AUTH_URL}
      displayIfLoggedOut={
        <RedirectToLogin
          postLoginRedirectUrl={currentUrl || window.location.href}
        />
      }
    >
      <AuthenticatedTeam />
    </RequiredAuthProvider>
  );
};

export default ManageTeam;