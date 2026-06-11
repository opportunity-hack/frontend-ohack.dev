import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Typography,
  Box,
  Alert,
  LinearProgress,
  Step,
  Stepper,
  StepLabel,
  Fade,
  CircularProgress,
  Container,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  GlobalStyles,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import WarningIcon from "@mui/icons-material/Warning";
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
import { RefinedRoot, RefinedFonts } from "../../../components/design/refined";

const steps = [
  "Team Details",
  "GitHub Information",
  "Nonprofit Rankings & Team",
  "Confirming & Creating",
];

// Shared "Find Teammates" CTA — used in both the existing-team and no-team cases
const FindTeammatesCTA = ({ eventId, teamFindingEnabled, heading, body }) => (
  <Box
    sx={{
      mt: 3,
      p: 3,
      bgcolor: "var(--surface-2, #F4F1E9)",
      borderRadius: 2,
      border: "1px solid var(--line, #E7E1D4)",
      display: "flex",
      flexDirection: { xs: "column", sm: "row" },
      alignItems: "center",
      justifyContent: "space-between",
      gap: 2,
    }}
  >
    <Box>
      <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}>
        👥 {heading}
      </Typography>
      <Typography variant="body1" sx={{ color: "var(--muted, #5B6270)" }}>
        {body}
      </Typography>
    </Box>
    <Button
      variant="contained"
      href={teamFindingEnabled ? `/hack/${eventId}/findteam` : undefined}
      disabled={!teamFindingEnabled}
      component={teamFindingEnabled ? "a" : "button"}
      size="large"
      sx={{
        px: 3,
        py: 1.2,
        whiteSpace: "nowrap",
        minWidth: { xs: "100%", sm: "auto" },
        fontWeight: 600,
        bgcolor: "var(--brand, #1B3A6B)",
        "&:hover": { bgcolor: "var(--brand-ink, #0E2547)" },
        opacity: teamFindingEnabled ? 1 : 0.6,
        cursor: teamFindingEnabled ? "pointer" : "not-allowed",
      }}
    >
      {teamFindingEnabled ? "Find Teammates" : "Find Teammates (Closed)"}
    </Button>
  </Box>
);

const ManageTeamComponent = () => {
  const authInfo = useAuthInfo();
  const { accessToken } = useAuthInfo();
  const [teamName, setTeamName] = useState("");
  const [slackChannel, setSlackChannel] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [nonprofits, setNonprofits] = useState([]);
  const [filteredNonprofits, setFilteredNonprofits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNonprofits, setSelectedNonprofits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [teamsError, setTeamsError] = useState("");
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [event, setEvent] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [memberInput, setMemberInput] = useState("");
  const [comments, setComments] = useState("");
  const [slackUsers, setSlackUsers] = useState([]);
  const [myTeams, setMyTeams] = useState(null);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  const [showNewTeamForm, setShowNewTeamForm] = useState(false);

  const [isValidatingGithub, setIsValidatingGithub] = useState(false);
  const [isGithubValid, setIsGithubValid] = useState(null);
  const [githubError, setGithubError] = useState("");

  const [isValidatingSlack, setIsValidatingSlack] = useState(false);
  const [isSlackValid, setIsSlackValid] = useState(null);
  const [slackError, setSlackError] = useState("");

  const [hackerApplication, setHackerApplication] = useState(null);
  const [isLoadingApplication, setIsLoadingApplication] = useState(true);

  const router = useRouter();
  const { event_id } = router.query;

  // Refs to prevent double-fetching lazy data
  const slackFetchedRef = useRef(false);
  const nonprofitFetchedRef = useRef(false);

  useEffect(() => {
    if (event_id && accessToken) {
      fetchHackathonEvent();
      fetchMyTeams();
      fetchHackerApplication();
    }
  }, [event_id, accessToken]);

  // Lazy Slack user fetch — only when user reaches the team-member step
  const fetchActiveSlackUsers = useCallback(async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/slack/users/active?active_days=365`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data && response.data.users) {
        setSlackUsers(
          response.data.users.map((user) => ({
            id: user.id,
            name: user.name,
            real_name: user.real_name,
            tz: user.tz,
          }))
        );
      }
    } catch (err) {
      console.error("Error fetching active Slack users:", err);
      // Non-critical — member picker works in freeSolo mode without the list
    }
  }, [accessToken]);

  // Trigger Slack fetch lazily when step 2 is reached or accordion opened
  useEffect(() => {
    if ((activeStep === 2 || showNewTeamForm) && !slackFetchedRef.current && accessToken) {
      slackFetchedRef.current = true;
      fetchActiveSlackUsers();
    }
  }, [activeStep, showNewTeamForm, accessToken, fetchActiveSlackUsers]);

  // Trigger nonprofit detail fetch lazily when step 2 is reached
  useEffect(() => {
    if (
      (activeStep === 2 || showNewTeamForm) &&
      !nonprofitFetchedRef.current &&
      event?.nonprofits?.length > 0 &&
      nonprofits.length === 0
    ) {
      nonprofitFetchedRef.current = true;
      fetchNonprofitDetails(event.nonprofits);
    }
  }, [activeStep, showNewTeamForm, event]);

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
        setMyTeams(response.data.teams);
        setTeamsError("");
      } else {
        setTeamsError("Failed to fetch team details. Please try again later.");
        setMyTeams([]);
      }
    } catch (err) {
      console.error("Error fetching team details:", err);
      setTeamsError("Failed to fetch team details. Please try again later.");
      setMyTeams([]);
    } finally {
      setIsLoadingTeams(false);
    }
  };

  const fetchHackerApplication = async () => {
    setIsLoadingApplication(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/hacker/application/${event_id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "X-Org-Id": authInfo?.userClass?.getOrgByName("Opportunity Hack Org")?.orgId,
          },
        }
      );
      if (response.data && response.data.data) {
        setHackerApplication(response.data.data);
      } else {
        setHackerApplication(null);
      }
    } catch (err) {
      console.error("Error fetching hacker application:", err);
      setHackerApplication(null);
    } finally {
      setIsLoadingApplication(false);
    }
  };

  const fetchHackathonEvent = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${event_id}`
      );
      if (response && response.data) {
        setEvent(response.data);
        // Nonprofit detail fetch is deferred to step 2 (see useEffect above)
      }
    } catch (err) {
      console.error("Error fetching event details:", err);
    }
  };

  const fetchNonprofitDetails = async (nonprofitIds) => {
    try {
      const nonprofitResponses = await Promise.all(
        nonprofitIds.map((npo) =>
          axios.get(
            `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/npo/${npo.id}`
          )
        )
      );
      const detailedNonprofits = nonprofitResponses.map((r) => r.data.nonprofits);
      const nonprofitsWithProblems = await Promise.all(
        detailedNonprofits.map(async (nonprofit) => {
          if (nonprofit.problem_statements && nonprofit.problem_statements.length > 0) {
            const problemStatementDetails = await Promise.all(
              nonprofit.problem_statements.map(async (problemId) => {
                try {
                  const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/problem-statements/${problemId}`
                  );
                  const problemData = response.data;
                  return {
                    id: problemId,
                    ...problemData,
                    displayTitle:
                      problemData.title ||
                      (problemData.description && problemData.description.length > 30
                        ? `${problemData.description.substring(0, 30)}...`
                        : problemData.description) ||
                      `Need ${problemId.substring(0, 6)}`,
                  };
                } catch {
                  return {
                    id: problemId,
                    displayTitle: `Problem ${problemId.substring(0, 6)}...`,
                    description: "Details could not be loaded",
                    error: true,
                  };
                }
              })
            );
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
      // Non-critical — user can still use the search with partial data
    }
  };

  // Prefill GitHub username from profile
  useEffect(() => {
    if (!accessToken) return;
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
        if (response?.data?.github) {
          setGithubUsername(response.data.github);
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        // Non-critical — user can type their own username
      }
    };
    fetchUserProfile();
  }, [accessToken]);

  const filterNonprofits = useCallback(
    (term) => {
      if (!term.trim()) {
        setFilteredNonprofits(nonprofits);
        return;
      }
      const lowerTerm = term.toLowerCase();
      setFilteredNonprofits(
        nonprofits.filter(
          (nonprofit) =>
            nonprofit.name.toLowerCase().includes(lowerTerm) ||
            (nonprofit.description && nonprofit.description.toLowerCase().includes(lowerTerm)) ||
            (nonprofit.problem_statements &&
              nonprofit.problem_statements.some(
                (p) =>
                  p.displayTitle.toLowerCase().includes(lowerTerm) ||
                  (p.description && p.description.toLowerCase().includes(lowerTerm))
              ))
        )
      );
    },
    [nonprofits]
  );

  const handleSearchChange = useCallback(
    (e) => {
      const term = e.target.value;
      setSearchTerm(term);
      filterNonprofits(term);
    },
    [filterNonprofits]
  );

  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setFilteredNonprofits(nonprofits);
  }, [nonprofits]);

  const toggleNonprofitSelection = useCallback((nonprofit) => {
    setSelectedNonprofits((prev) => {
      const isSelected = prev.some((np) => np.id === nonprofit.id);
      return isSelected ? prev.filter((np) => np.id !== nonprofit.id) : [...prev, nonprofit];
    });
  }, []);

  const handleDragEnd = useCallback(
    (result) => {
      if (!result.destination) return;
      const items = Array.from(selectedNonprofits);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      setSelectedNonprofits(items);
    },
    [selectedNonprofits]
  );

  const handleAddTeamMember = useCallback(() => {
    if (!memberInput) return;
    const memberName =
      typeof memberInput === "string"
        ? memberInput.trim()
        : (memberInput.real_name || memberInput.name || "").trim();
    if (!memberName) return;

    const isDuplicate = teamMembers.some((member) => {
      if (typeof member === "string" && typeof memberInput === "string") return member === memberName;
      if (typeof member === "object" && typeof memberInput === "object") return member.id === memberInput.id;
      if (typeof member === "string" && typeof memberInput === "object") return member === memberInput.real_name || member === memberInput.name;
      if (typeof member === "object" && typeof memberInput === "string") return member.real_name === memberInput || member.name === memberInput;
      return false;
    });

    if (isDuplicate) {
      setFormError("This team member has already been added");
      return;
    }
    setTeamMembers((prev) => [...prev, memberInput]);
    setMemberInput("");
    setFormError("");
  }, [memberInput, teamMembers]);

  const handleRemoveTeamMember = useCallback((index) => {
    setTeamMembers((prev) => {
      const newMembers = [...prev];
      newMembers.splice(index, 1);
      return newMembers;
    });
  }, []);

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
        setGithubError(response.data.valid ? "GitHub username exists" : response.data.message || "Invalid GitHub username");
      } catch {
        setIsGithubValid(false);
        setGithubError("Could not verify GitHub username");
      } finally {
        setIsValidatingGithub(false);
      }
    }, 400),
    []
  );

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
        setSlackError("Use only lowercase letters, numbers, hyphens, and underscores");
        setIsValidatingSlack(false);
        return;
      }
      setIsValidatingSlack(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/validate/slack/${channel}`
        );
        if (response.data.exists) {
          setIsSlackValid(false);
          setSlackError(response.data.message || "Invalid Slack channel");
        } else {
          setIsSlackValid(response.data.valid);
          setSlackError("Slack channel is available");
        }
      } catch {
        setIsSlackValid(false);
        setSlackError("Slack channel already exists or is invalid");
      } finally {
        setIsValidatingSlack(false);
      }
    }, 400),
    []
  );

  useEffect(() => {
    if (githubUsername) validateGithubUsername(githubUsername);
  }, [githubUsername, validateGithubUsername]);

  useEffect(() => {
    if (slackChannel) validateSlackChannel(slackChannel);
  }, [slackChannel, validateSlackChannel]);

  const validateForm = () => {
    if (!teamName.trim()) { setFormError("Team name is required."); return false; }
    if (!slackChannel.trim()) { setFormError("Slack channel is required."); return false; }
    if (!slackChannel.match(/^[a-z0-9-_]+$/)) {
      setFormError("Invalid Slack channel name. Use only lowercase letters, numbers, hyphens, and underscores.");
      return false;
    }
    if (!githubUsername.trim()) { setFormError("GitHub username is required."); return false; }
    if (isValidatingGithub || isValidatingSlack) { setFormError("Please wait for validation to complete."); return false; }
    if (isGithubValid === false) { setFormError(githubError || "Invalid GitHub username."); return false; }
    if (isSlackValid === false) { setFormError(slackError || "Invalid Slack channel name."); return false; }
    if (selectedNonprofits.length === 0) { setFormError("Please select and rank at least one nonprofit."); return false; }
    return true;
  };

  const validateCurrentStep = (step) => {
    switch (step) {
      case 0:
        if (!teamName.trim()) { setFormError("Team name is required."); return false; }
        if (!slackChannel.trim()) { setFormError("Slack channel is required."); return false; }
        if (!slackChannel.match(/^[a-z0-9-_]+$/)) {
          setFormError("Invalid Slack channel name. Use only lowercase letters, numbers, hyphens, and underscores.");
          return false;
        }
        if (isValidatingSlack) { setFormError("Please wait for Slack channel validation to complete."); return false; }
        if (isSlackValid === false) { setFormError(slackError || "Invalid Slack channel name."); return false; }
        return true;
      case 1:
        if (!githubUsername.trim()) { setFormError("GitHub username is required."); return false; }
        if (isValidatingGithub) { setFormError("Please wait for GitHub username validation to complete."); return false; }
        if (isGithubValid === false) { setFormError(githubError || "Invalid GitHub username."); return false; }
        return true;
      case 2:
        if (selectedNonprofits.length === 0) { setFormError("Please select and rank at least one nonprofit."); return false; }
        return true;
      case 3:
        return validateForm();
      default:
        return true;
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setFormError("");
    setProgress(0);

    try {
      const rankings = selectedNonprofits.map((nonprofit, index) => ({
        nonprofit_id: nonprofit.id,
        rank: index + 1,
      }));

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/team/queue`,
        {
          name: teamName,
          slackChannel,
          eventId: event_id,
          nonprofitRankings: rankings,
          teamMembers,
          githubUsername,
          comments,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setLoading(false);
      setProgress(100);

      if (response.data.success) {
        // Refetch teams so TeamStatusPanel shows IN_REVIEW state
        await fetchMyTeams();
        // Reset form
        setActiveStep(0);
        setTeamName("");
        setSlackChannel("");
        setGithubUsername("");
        setSelectedNonprofits([]);
        setTeamMembers([]);
        setComments("");
        setShowNewTeamForm(false);
        // Scroll to team hub
        setTimeout(() => {
          const el = document.getElementById("team-hub");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        setFormError(response.data.message || "An error occurred while creating the team.");
      }
    } catch (err) {
      setLoading(false);
      setFormError(
        err.response?.data?.message || "An unexpected error occurred. Please try again."
      );
    }
  };

  const handleNext = () => {
    if (validateCurrentStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
      setFormError("");
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setFormError("");
  };

  const isNextDisabled = () => {
    if (loading) return true;
    switch (activeStep) {
      case 0: return !teamName.trim() || !slackChannel.trim() || !slackChannel.match(/^[a-z0-9-_]+$/) || isValidatingSlack || isSlackValid === false;
      case 1: return !githubUsername.trim() || isValidatingGithub || isGithubValid === false;
      case 2: return selectedNonprofits.length === 0;
      default: return false;
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
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
      case 1:
        return (
          <GitHubInfoForm
            githubUsername={githubUsername}
            setGithubUsername={setGithubUsername}
            isValidatingGithub={isValidatingGithub}
            isGithubValid={isGithubValid}
            githubError={githubError}
          />
        );
      case 2:
        return (
          <NonprofitSelectionStep
            searchTerm={searchTerm}
            filteredNonprofits={filteredNonprofits}
            selectedNonprofits={selectedNonprofits}
            handleSearchChange={handleSearchChange}
            toggleNonprofitSelection={toggleNonprofitSelection}
            clearSearch={clearSearch}
            handleDragEnd={handleDragEnd}
            teamMembers={teamMembers}
            memberInput={memberInput}
            setMemberInput={setMemberInput}
            handleAddTeamMember={handleAddTeamMember}
            handleRemoveTeamMember={handleRemoveTeamMember}
            comments={comments}
            setComments={setComments}
            slackUsers={slackUsers}
            error={formError}
          />
        );
      case 3:
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

  // Callback for TeamStatusPanel to update local team data after DevPost/video saves
  const handleTeamUpdated = useCallback((teamId, partial) => {
    setMyTeams((prev) =>
      prev ? prev.map((t) => (t.id === teamId ? { ...t, ...partial } : t)) : prev
    );
  }, []);

  const hasExistingTeam = myTeams && myTeams.length > 0;
  const hasApprovedTeam = myTeams && myTeams.some((t) => t.status === "APPROVED" || t.status === "PROJECT_COMPLETE");
  const teamCreationEnabled = event?.constraints?.team_creation_enabled !== false;
  const teamFindingEnabled = event?.constraints?.team_find_a_team_enabled !== false;

  const pageTitle = hasApprovedTeam
    ? "Manage Your Hackathon Team - Opportunity Hack"
    : "Create or Manage Team - Opportunity Hack";

  return (
    <RefinedRoot>
      <GlobalStyles
        styles={{
          "@keyframes ohx-spin": { from: { transform: "rotate(0deg)" }, to: { transform: "rotate(360deg)" } },
          "@keyframes ohx-fade": { "0%, 100%": { opacity: 0.7 }, "50%": { opacity: 1 } },
        }}
      />
      <Head>
        <title>{pageTitle}</title>
        <meta
          name="description"
          content={
            hasApprovedTeam
              ? "Manage your hackathon team, access resources, and coordinate with your teammates during the Opportunity Hack event."
              : "Create a new team or manage existing team applications for Opportunity Hack and start working on nonprofit projects."
          }
        />
        <meta name="robots" content="noindex" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <RefinedFonts />
        <link rel="preconnect" href="https://opportunity-hack.slack.com" />
        <link rel="preconnect" href="https://github.com" />
      </Head>

      <Box className="ohx-wrap" sx={{ pt: "clamp(80px, 12vh, 100px)", pb: 6 }}>
        {/* Masthead */}
        <Box sx={{ mb: 4 }}>
          <a
            href={`/hack/${event_id}`}
            className="ohx-link"
            style={{ fontSize: "0.9rem", display: "inline-block", marginBottom: "0.75rem" }}
          >
            ← {event?.title || "Back to hackathon"}
          </a>
          <h1
            style={{
              fontFamily: "var(--display)",
              fontWeight: 600,
              fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
              margin: 0,
              color: "var(--ink)",
              lineHeight: 1.2,
            }}
          >
            {!myTeams || myTeams.length === 0 ? "Create a team" : "Your team"}
          </h1>
        </Box>

        {/* Team Status Hub */}
        <div id="team-hub">
          <TeamStatusPanel
            eventId={event_id}
            teams={myTeams}
            loading={isLoadingTeams}
            error={teamsError}
            nonprofits={nonprofits}
            event={event}
            accessToken={accessToken}
            onTeamUpdated={handleTeamUpdated}
          />
        </div>

        {/* Application loading */}
        {isLoadingApplication && (
          <Box className="ohx-card" sx={{ mt: 3, p: 4, textAlign: "center" }}>
            <CircularProgress size={40} sx={{ color: "var(--brand)" }} />
            <Typography variant="body1" sx={{ mt: 2, color: "var(--muted)" }}>
              Checking your participation status for {event?.title || "this hackathon"}…
            </Typography>
          </Box>
        )}

        {/* No application */}
        {!isLoadingApplication && !hackerApplication && (
          <Box className="ohx-card" sx={{ mt: 3, p: 4, textAlign: "center" }}>
            <Typography sx={{ fontSize: "3rem", mb: 1 }}>📝</Typography>
            <Typography
              variant="h5"
              sx={{ fontFamily: "var(--display)", fontWeight: 600, mb: 2, color: "var(--brand)" }}
            >
              Apply first to manage a team
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: "var(--muted)", maxWidth: 560, mx: "auto" }}>
              Team management is only available to hackers who have submitted a hacker application
              and been confirmed for {event?.title || "this hackathon"}. Submit your application to
              get started — we&apos;ll email you once your spot is confirmed.
            </Typography>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, justifyContent: "center" }}>
              <a href={`/hack/${event_id}/hacker-application`} className="ohx-btn ohx-btn--primary">
                Submit Hacker Application
              </a>
              <a href={`/hack/${event_id}`} className="ohx-btn ohx-btn--ghost">
                Back to Hackathon
              </a>
            </Box>
          </Box>
        )}

        {/* Application submitted but not yet confirmed */}
        {!isLoadingApplication && hackerApplication && hackerApplication.isSelected === false && (
          <Box className="ohx-card" sx={{ mt: 3, p: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Typography sx={{ fontSize: "2.5rem" }}>⏳</Typography>
              <Typography
                variant="h5"
                sx={{ fontFamily: "var(--display)", fontWeight: 600, color: "var(--brand)" }}
              >
                Your application is awaiting confirmation
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ mb: 2, color: "var(--muted)" }}>
              Thanks for applying to {event?.title || "this hackathon"}! We&apos;ve received your
              hacker application — it just hasn&apos;t been confirmed for a spot yet, so team
              management is locked for now.
            </Typography>
            <Alert severity="info" icon={false} sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>What this means:</strong> Most applications are reviewed within about a
                week. You&apos;ll get an email as soon as your spot is confirmed, and team
                management will unlock automatically.
              </Typography>
              <Typography variant="body2">
                If the event is close and you haven&apos;t heard back, we may have reached capacity
                for this hackathon.
              </Typography>
            </Alert>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: "var(--brand)" }}>
              While you wait
            </Typography>
            {[
              ["🤝", "Join our Slack to meet hackers, mentors, and nonprofits"],
              ["💻", "Contribute to open-source nonprofit projects year-round"],
              ["🎯", "Browse other Opportunity Hack events you can apply to"],
            ].map(([icon, text]) => (
              <Typography key={text} variant="body1" sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1.5 }}>
                <span>{icon}</span> {text}
              </Typography>
            ))}
            <Box sx={{ mt: 3, display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
              <a
                href="https://opportunity-hack.slack.com"
                target="_blank"
                rel="noopener noreferrer"
                className="ohx-btn ohx-btn--primary"
              >
                Join Our Community
              </a>
              <a href="/hack" className="ohx-btn ohx-btn--ghost">
                View Upcoming Events
              </a>
            </Box>
            <Typography variant="caption" sx={{ display: "block", mt: 2, color: "var(--faint)" }}>
              Already received your confirmation email? Try refreshing — your status may not have synced yet.
            </Typography>
          </Box>
        )}

        {/* Team creation content — only for confirmed hackers */}
        {!isLoadingApplication && hackerApplication?.isSelected !== false && hackerApplication && (
          <>
            {/* Team creation disabled */}
            {!teamCreationEnabled && (
              <Alert severity="warning" icon={<WarningIcon />} sx={{ mt: 4 }}>
                <Typography variant="h6" fontWeight="bold">
                  Team Creation Currently Disabled
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  Team creation has been disabled for this hackathon. Please check with the event
                  organizers or wait for team creation to be re-enabled.
                </Typography>
              </Alert>
            )}

            {/* Existing team: accordion around the create form */}
            {teamCreationEnabled && hasExistingTeam && (
              <Box sx={{ mt: 4 }}>
                <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">You Already Have a Team</Typography>
                  <Typography variant="body1" sx={{ mt: 0.5 }}>
                    {hasApprovedTeam
                      ? "You already have an approved team for this hackathon. Creating another team is not recommended unless explicitly instructed by Opportunity Hack staff."
                      : "You already have a team application in review. Please wait for it to be processed before creating another team."}
                  </Typography>
                </Alert>

                <FindTeammatesCTA
                  eventId={event_id}
                  teamFindingEnabled={teamFindingEnabled}
                  heading="Need additional teammates?"
                  body="You can find additional teammates with complementary skills before creating a new team."
                />

                <Accordion
                  expanded={showNewTeamForm}
                  onChange={() => setShowNewTeamForm(!showNewTeamForm)}
                  sx={{
                    mt: 2,
                    border: "1px solid var(--line, #E7E1D4)",
                    borderRadius: "8px !important",
                    overflow: "hidden",
                    boxShadow: "none",
                    "&:before": { display: "none" },
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: "var(--surface-2, #F4F1E9)" }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <FaRocket style={{ marginRight: "12px", color: "var(--accent, #E2552E)" }} />
                      <Typography variant="h6" fontWeight="medium">
                        {showNewTeamForm ? "Hide Team Creation Form" : "Show Team Creation Form"}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 0 }}>
                    {renderCreateForm()}
                  </AccordionDetails>
                </Accordion>
              </Box>
            )}

            {/* No existing team: show find teammates + create form directly */}
            {teamCreationEnabled && !hasExistingTeam && (
              <Box sx={{ mt: 4 }}>
                <FindTeammatesCTA
                  eventId={event_id}
                  teamFindingEnabled={teamFindingEnabled}
                  heading="Looking for teammates?"
                  body="Don't create a team alone! Find other participants with complementary skills and shared interests."
                />
                {renderCreateForm()}
              </Box>
            )}
          </>
        )}
      </Box>
    </RefinedRoot>
  );

  function renderCreateForm() {
    return (
      <Box
        className="ohx-card"
        sx={{ mt: 3, p: { xs: 2, md: 3 } }}
      >
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={handleSubmit}>
          {getStepContent(activeStep)}

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
            <Button disabled={activeStep === 0} onClick={handleBack} sx={{ textTransform: "none" }}>
              Back
            </Button>
            <Button
              variant="contained"
              onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
              disabled={activeStep === steps.length - 1 ? loading : isNextDisabled()}
              sx={{
                textTransform: "none",
                bgcolor: "var(--brand, #1B3A6B)",
                "&:hover": { bgcolor: "var(--brand-ink, #0E2547)" },
                "&:disabled": { bgcolor: "rgba(27,58,107,0.4)", color: "white" },
              }}
            >
              {activeStep === steps.length - 1 ? "Create Team" : "Next"}
              {loading && <Puff stroke="#fff" width={20} height={20} style={{ marginLeft: "8px" }} />}
            </Button>
          </Box>
        </form>

        {isNextDisabled() && !formError && (
          <Typography color="textSecondary" align="right" sx={{ mt: 1, fontSize: "0.875rem", fontStyle: "italic" }}>
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
            <Box sx={{ mt: 3 }}>
              <LinearProgress sx={{ "& .MuiLinearProgress-bar": { bgcolor: "var(--brand)" } }} />
              <Typography variant="body2" align="center" sx={{ mt: 1, color: "var(--muted)" }}>
                Creating your Slack channel and GitHub repo — this takes up to a minute…
              </Typography>
            </Box>
          </Fade>
        )}

        {formError && (
          <Fade in={!!formError}>
            <Alert severity="error" sx={{ mt: 2 }}>
              {formError}
            </Alert>
          </Fade>
        )}
      </Box>
    );
  }
};

const AuthenticatedTeam = () => {
  const { user } = useAuthInfo();
  return <ManageTeamComponent userClass={user} />;
};

const ManageTeam = () => {
  const router = useRouter();
  const { event_id } = router.query;

  const currentUrl =
    typeof window !== "undefined" && event_id
      ? `${window.location.origin}/hack/${event_id}/manageteam`
      : null;

  return (
    <RequiredAuthProvider
      authUrl={process.env.NEXT_PUBLIC_REACT_APP_AUTH_URL}
      displayIfLoggedOut={
        <RedirectToLogin
          postLoginRedirectUrl={currentUrl || (typeof window !== "undefined" ? window.location.href : undefined)}
        />
      }
    >
      <AuthenticatedTeam />
    </RequiredAuthProvider>
  );
};

export default ManageTeam;
