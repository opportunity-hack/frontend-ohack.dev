import React, { useState, useEffect } from "react";

// MUI Components
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
import BuildIcon from "@mui/icons-material/Build";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import TagIcon from "@mui/icons-material/Tag";
import Switch from "@mui/material/Switch";
import Stack from "@mui/material/Stack";
import FormControlLabel from "@mui/material/FormControlLabel";
import { styled } from "@mui/material/styles";
import Divider from '@mui/material/Divider';
import SupportIcon from "@mui/icons-material/Support";
import Badge from "@mui/material/Badge";
import { LoginButton } from "../Navbar/styles";
import ArticleIcon from "@mui/icons-material/Article";
import Button from "@mui/material/Button";
import DeveloperModeIcon from "@mui/icons-material/DeveloperMode";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import NotesIcon from '@mui/icons-material/Notes'; 
import EventIcon from "@mui/icons-material/Event";
import CodeIcon from "@mui/icons-material/Code";
import useMediaQuery from '@mui/material/useMediaQuery';
import Link from "next/link";
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Fade from '@mui/material/Fade';
import Zoom from '@mui/material/Zoom';
import { useTheme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LaunchIcon from '@mui/icons-material/Launch';
import ShareIcon from '@mui/icons-material/Share';
import StarIcon from '@mui/icons-material/Star';
import PeopleIcon from '@mui/icons-material/People';
import GitHubIcon from '@mui/icons-material/GitHub';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ReactMarkdown from 'react-markdown';


// Imported Components
import useProfileApi from "../../hooks/use-profile-api";
import ProjectProgress from "../ProjectProgress/ProjectProgress";
import useTeams from "../../hooks/use-teams";
import SkillSet from "../skill-set";
import CopyToClipboardButton from "../buttons/CopyToClipboardButton";
import useProblemstatements from "../../hooks/use-problem-statements";
import useHackathonEvents from "../../hooks/use-hackathon-events";
import {useRedirectFunctions} from "@propelauth/react";
import { trackEvent, initFacebookPixel } from '../../lib/ga';
import { 
  ProjectCard,
  ProjectDescText,
  ShortDescText,
  TitleStyled,
  ReferencesStyled,
  YearStyled,
  AccordionButton,
} from "./styles";
import Events from "../Events/Events";
import ReferenceItem from "../ReferenceItem/ReferenceItem";
import ProblemStatementContent from "../ProblemStatementContent/ProblemStatementContent";
import { HelpDialog, UnhelpDialog } from "../HelpDialog/HelpDialog";

// Modern styled components for engagement-driven UX
const ModernProjectCard = styled(Card)(({ theme, status }) => ({
  position: 'relative',
  marginBottom: theme.spacing(4),
  borderRadius: theme.spacing(3),
  background: status === 'production' 
    ? 'linear-gradient(135deg, #e8f5e8 0%, #f0fdf4 100%)'
    : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  border: `1px solid ${status === 'production' ? '#22c55e20' : '#e2e8f0'}`,
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: status === 'production'
      ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)'
      : 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)',
  }
}));

const HeroSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  borderRadius: `${theme.spacing(3)} ${theme.spacing(3)} 0 0`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("data:image/svg+xml,%3Csvg width=\\"20\\" height=\\"20\\" xmlns=\\"http://www.w3.org/2000/svg\\"%3E%3Cdefs%3E%3Cpattern id=\\"grid\\" width=\\"20\\" height=\\"20\\" patternUnits=\\"userSpaceOnUse\\"%3E%3Cpath d=\\"M 20 0 L 0 0 0 20\\" fill=\\"none\\" stroke=\\"%23ffffff\\" stroke-width=\\"0.5\\" opacity=\\"0.1\\"%2F%3E%3C%2Fpattern%3E%3C%2Fdefs%3E%3Crect width=\\"100%25\\" height=\\"100%25\\" fill=\\"url(%23grid)\\" %2F%3E%3C%2Fsvg%3E")',
  }
}));

const MetricCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  textAlign: 'center',
  background: 'linear-gradient(145deg, #ffffff 0%, #f1f5f9 100%)',
  border: '1px solid rgba(0,0,0,0.06)',
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-2px) scale(1.02)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
    borderColor: theme.palette.primary.main
  }
}));

const ActionButton = styled(Button)(({ theme, variant: buttonVariant }) => ({
  borderRadius: theme.spacing(4),
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '1rem',
  padding: theme.spacing(1.5, 4),
  minHeight: 48,
  boxShadow: buttonVariant === 'contained' ? '0 4px 14px rgba(0,0,0,0.1)' : 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: buttonVariant === 'contained' ? '0 8px 25px rgba(0,0,0,0.15)' : '0 4px 14px rgba(0,0,0,0.1)',
  }
}));

const StatusChip = styled(Chip)(({ theme, chipstatus }) => ({
  fontWeight: 600,
  fontSize: '0.875rem',
  padding: theme.spacing(0.5, 1),
  background: chipstatus === 'production'
    ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
    : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  color: 'white',
  border: 'none',
  '& .MuiChip-icon': {
    color: 'white'
  }
}));

const SectionCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  border: '1px solid #e2e8f0',
  background: '#ffffff',
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main + '40',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
  }
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
  borderBottom: '1px solid #e2e8f0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
  }
}));

const HelpToggle = styled(FormControlLabel)(({ theme }) => ({
  margin: 0,
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  border: '2px solid #e2e8f0',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
  }
}));

export default function ProblemStatement({ problem_statement_id, user, npo_id }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isLargeScreen = useMediaQuery('(min-width: 768px)');

  const { redirectToLoginPage } = useRedirectFunctions();
  const { problem_statement } = useProblemstatements(problem_statement_id);
  const { handle_get_hackathon_id } = useHackathonEvents();
  const { handle_join_team, handle_unjoin_a_team } = useTeams();
  
  // States
  const [hackathonEvents, setHackathonEvents] = useState([]);  
  const [teamSuggestions, setTeamSuggestions] = useState(null);
  const [hackathonEventsLoaded, setHackathonEventsLoaded] = useState(false);
  const [hackathonEventsError, setHackathonEventsError] = useState(false);
  const [teams, setTeams] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const [userError, setUserError] = useState(false);
  const [open, setOpen] = useState(false);
  const [openUnhelp, setOpenUnhelp] = useState(false);
  const [help_checked, setHelpedChecked] = useState("");
  const [helpingType, setHelpingType] = useState("");  
  const [expanded, setExpanded] = useState("Events");
  const [tabValue, setTabValue] = useState('Events');
  const [expandedSection, setExpandedSection] = useState(null);
  const { get_user_by_id, profile, handle_help_toggle } = useProfileApi();
  const [helperProfiles, setHelperProfiles] = useState({});
  const [isCheckingHelperStatus, setIsCheckingHelperStatus] = useState(false);

  // Helper function to toggle sections
  const handleSectionToggle = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Modern styled switch for the help toggle
  const MaterialUISwitch = styled(Switch)(({ theme }) => ({
    width: 70,
    height: 38,
    padding: 7,
    "& .MuiSwitch-switchBase": {
      margin: 1,
      padding: 0,
      transform: "translateX(6px)",
      "&.Mui-checked": {
        color: "#fff",
        transform: "translateX(26px)",
        "& .MuiSwitch-thumb:before": {
          backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
            "#fff"
          )}" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>')`,
        },
        "& + .MuiSwitch-track": {
          opacity: 1,
          backgroundColor: "#22c55e",
        },
      },
    },
    "& .MuiSwitch-thumb": {
      backgroundColor: "#fff",
      width: 32,
      height: 32,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      "&:before": {
        content: "''",
        position: "absolute",
        width: "100%",
        height: "100%",
        left: 0,
        top: 0,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          "#64748b"
        )}" d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/></svg>')`,
      },
    },
    "& .MuiSwitch-track": {
      opacity: 1,
      backgroundColor: "#e2e8f0",
      borderRadius: 20,
    },
  }));

  // Initialize Facebook Pixel
  useEffect(() => {
    initFacebookPixel();
  }, []);

  // Generate team name suggestions and fetch hackathon events - FIXED: removed unstable dependencies
  useEffect(() => {  
    // Fetch hackathon events
    if (problem_statement?.events?.length > 0) {
      const eventsData = [];
      const promises = [];
      
      problem_statement.events.forEach((id) => {        
        const promise = new Promise((resolve, reject) => {          
          handle_get_hackathon_id(id, (hackathonEvent) => {
            if (hackathonEvent) {
              eventsData.push(hackathonEvent);
              resolve(hackathonEvent);
            } else {
              reject("Error getting hackathon event");
            }
          });
        });
        promises.push(promise);
      });
      
      Promise.all(promises)
        .then(() => {          
          setHackathonEvents(eventsData);
          setHackathonEventsLoaded(true);
        })
        .catch(() => {
          setHackathonEventsError(true);
        });
    }
  }, [problem_statement_id, problem_statement?.events]);
  
  // Get user details for team members - FIXED: removed unstable dependencies
  useEffect(() => {
    if (teams?.length > 0) {
      const userDetailsMap = {};
      const promises = [];
      
      teams.forEach((team) => {
        team.users?.forEach((user_id) => {
          promises.push(
            get_user_by_id(user_id, (user) => {
              userDetailsMap[user_id] = user;
            })
          );
        });
      });
      
      Promise.all(promises)
        .then(() => {
          setUserDetails(userDetailsMap);
          setUserLoaded(true);
        })
        .catch(() => {
          setUserError(true);
        });
    }
  }, [teams]);

  // Fetch and store profiles for all helpers - FIXED: removed unstable dependencies
  useEffect(() => {
    if (problem_statement?.helping?.length > 0) {
      setIsCheckingHelperStatus(true);
      const helperProfileMap = {};
      const fetchPromises = [];
      
      problem_statement.helping.forEach(helper => {
        if (helper.user) {
          const fetchPromise = fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/users/${helper.user}/profile`)
            .then(response => {
              if (!response.ok) throw new Error('Failed to fetch helper profile');
              return response.json();
            })
            .then(data => {
              helperProfileMap[helper.user] = data;
              return data;
            })
            .catch(error => {
              console.error(`Error fetching helper profile for user ${helper.user}:`, error);
              return null;
            });
          
          fetchPromises.push(fetchPromise);
        }
      });
      
      Promise.all(fetchPromises)
        .then(() => {
          setHelperProfiles(helperProfileMap);
          setIsCheckingHelperStatus(false);
        })
        .catch(error => {
          console.error('Error fetching helper profiles:', error);
          setIsCheckingHelperStatus(false);
        });
    }
  }, [problem_statement?.helping]);

  // Check if current user is helping with this project
  useEffect(() => {
    if (
      !isCheckingHelperStatus && 
      problem_statement?.helping?.length > 0 && 
      user && 
      Object.keys(helperProfiles).length > 0
    ) {
      // Find if current user is in the helpers list
      const currentUserHelper = problem_statement.helping.find(helper => {
        // If we have the helper's profile and it has a propel_id
        if (helper.user && helperProfiles[helper.user] && helperProfiles[helper.user].propel_id) {
          // Check if the propel_id matches the current user's ID
          return helperProfiles[helper.user].propel_id === user.userId;
        }
        // Fallback to the old method for backward compatibility
        return helper.slack_user === profile?.user_id;
      });
      
      if (currentUserHelper) {
        setHelpedChecked("checked");
        setHelpingType(currentUserHelper.type);
        console.log(`User is helping as ${currentUserHelper.type}`);
      } else {
        setHelpedChecked("");
        setHelpingType("");
      }
    }
  }, [problem_statement, user, profile, helperProfiles, isCheckingHelperStatus]);

  // Event handlers
  const handleChange = (panel) => (event, isExpanded) => {
    const params = {
      action_name: isExpanded ? "open" : "close",
      panel_id: panel,
      npo_id: npo_id,
      problem_statement_id: problem_statement?.id,
      problem_statement_title: problem_statement?.title,
      user_id: user?.userId
    };
    
    trackEvent({
      action: "problem_statement_accordion",
      params: params
    });
    
    setExpanded(isExpanded ? panel : false);
  };

  const handleClickOpen = (event) => {
    if (event.target.checked) {
      setOpen(true);
      trackEvent({
        action: "Helping Dialog Opened",
        params: {
          problem_statement_id: problem_statement?.id,
          problem_statement_title: problem_statement?.title,
          npo_id: npo_id,
          user_id: user?.userId
        }
      });
    } else {
      setOpenUnhelp(true);
      trackEvent({
        action: "Not Helping Dialog Opened",
        params: {
          problem_statement_id: problem_statement?.id,
          problem_statement_title: problem_statement?.title,
          npo_id: npo_id,
          user_id: user?.userId 
        }
      });
    }
  };

  const handleLeavingTeam = (teamId) => {
    handle_unjoin_a_team(teamId, handleTeamLeavingResponse);

    trackEvent({
      action: "team_left",
      params: { team_id: teamId }
    });
  };

  const handleJoiningTeam = (teamId) => {
    handle_join_team(teamId, handleTeamLeavingResponse);

    trackEvent({
      action: "team_joined",
      params: { team_id: teamId }
    });
  };

  const handleTeamLeavingResponse = () => {
    trackEvent({
      action: "Team Left",
      params: {
        category: "Team",
        label: "Team",
      }
    });
  };
  
  const handleClose = (helperType) => {    
    trackEvent({
      action: "Helping: User Finalized Start Helping",
      params: {
        category: "Helping",
        label: "Helping",
        problem_statement_id: problem_statement?.id,
        problem_statement_title: problem_statement?.title,
        npo_id: npo_id,
        user_id: user?.userId,
        mentor_or_hacker: helperType
      }
    });

    setOpen(false);
    setHelpedChecked("checked");
    setHelpingType(helperType);
    // FIXED: Use correct parameter order
    handle_help_toggle(
      "helping",
      problem_statement.id,
      helperType,
      npo_id
    );
  };

  const handleCancel = () => {
    trackEvent({
      action: "Helping: User Canceled Helping",
      params: {
        category: "Helping",
        label: "Helping",
        problem_statement_id: problem_statement?.id,
        problem_statement_title: problem_statement?.title,
        npo_id: npo_id,
        user_id: user?.userId
      }
    });

    setOpen(false);
    setHelpedChecked("");
    setHelpingType("");
  };

  const handleCloseUnhelp = () => {
    trackEvent({
      action: "Helping: User Finalized Stop Helping",
      params: {
        category: "Helping",
        label: "Helping",
        problem_statement_id: problem_statement?.id,
        problem_statement_title: problem_statement?.title,
        npo_id: npo_id,
        user_id: user?.userId
      }
    });

    setOpenUnhelp(false);
    setHelpedChecked("");
    setHelpingType("");
    // FIXED: Use correct parameter order
    handle_help_toggle("not_helping", problem_statement.id, "", npo_id);
  };

  const handleCloseUnhelpCancel = () => {
    trackEvent({
      action: "Helping: User Canceled Stop Helping",
      params: {
        category: "Helping",
        label: "Helping"
      }
    });

    setOpenUnhelp(false);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  function getWordStr(str) {
    if(str != null && str.length > 0 && typeof str === "string") {
      return str.split(/\s+/).slice(0, 30).join(" ");
    } else {
      return "";
    }
  }

  // If problem_statement isn't loaded yet, don't try to render the component
  if (!problem_statement) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Count team and helper stats
  const teamCounter = teams.filter(team => team.problem_statements?.includes(problem_statement_id)).length;
  const teamText = `There ${teamCounter === 1 ? "is" : "are"} ${teamCounter} team${teamCounter === 1 ? "" : "s"} working on this`;
  
  // Count helpers using the correct field: problem_statement.helping
  let countOfHackers = 0;
  let countOfMentors = 0;
  if (problem_statement.helping?.length > 0) {
    problem_statement.helping.forEach((help) => {
      if (help.type === "mentor") {
        countOfMentors++;
      } else if (help.type === "hacker") {
        countOfHackers++;
      }
    });
  }

  const totalContributors = countOfHackers + countOfMentors;
  const eventsCount = hackathonEvents.length;
  const hackersPlural = countOfHackers === 1 ? "" : "s";
  const hackersVerb = countOfHackers === 1 ? "is" : "are";
  const mentorsVerb = countOfMentors === 1 ? "is" : "are";
  
  // Calculate engagement level for visual indicators
  const getEngagementLevel = () => {
    if (totalContributors >= 10 || eventsCount >= 3) return 'high';
    if (totalContributors >= 5 || eventsCount >= 2) return 'medium'; 
    return 'low';
  };
  
  // Enhanced status component with modern design
  const renderStatus = () => {
    if (problem_statement.status === "production") {
      return (
        <Tooltip
          title="This project is live and being used by the nonprofit!"
          arrow
          placement="top"
        >
          <StatusChip 
            chipstatus="production"
            icon={<WorkspacePremiumIcon />} 
            label="🚀 Live in Production" 
          />
        </Tooltip>
      );
    } else {
      return (
        <Tooltip
          title="This project needs your help to reach completion!"
          arrow
          placement="top"
        >
          <StatusChip 
            chipstatus="development"
            icon={<BuildIcon />} 
            label="🔧 Needs Help" 
          />
        </Tooltip>
      );
    }
  };

  // Modern help toggle and call-to-action components
  const renderHelpToggle = () => {
    if (!user) {
      return (
        <HelpToggle
          control={
            <Tooltip
              title="Sign in to join this project and make an impact!"
              arrow
              placement="top"
            >
              <MaterialUISwitch disabled />
            </Tooltip>
          }
          label={
            <Box sx={{ ml: 2 }}>
              <Typography variant="body1" fontWeight={600} color="text.secondary">
                🔐 Sign in to help
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Join {totalContributors} contributors making impact
              </Typography>
            </Box>
          }
          labelPlacement="end"
        />
      );
    }

    return (
      <HelpToggle
        control={
          <Tooltip
            title={help_checked === "checked" ? "You're making a difference! Click to stop helping" : "Join this project and start making impact!"}
            arrow
            placement="top"
          >
            <MaterialUISwitch 
              checked={help_checked === "checked"} 
              onChange={handleClickOpen}
            />
          </Tooltip>
        }
        label={
          <Box sx={{ ml: 2 }}>
            <Typography variant="body1" fontWeight={600}>
              {help_checked === "checked" ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {helpingType === "hacker" ? <DeveloperModeIcon /> : <SupportIcon />}
                  {helpingType === "hacker" ? "🚀 Hacking" : "🎯 Mentoring"}
                </Box>
              ) : (
                "❤️ Want to help?"
              )}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {help_checked === "checked" 
                ? "You're part of the solution!" 
                : "Join the community of changemakers"
              }
            </Typography>
          </Box>
        }
        labelPlacement="end"
      />
    );
  };

  const renderCallToAction = () => {
    if (!user) {
      return (
        <Stack direction={isMobile ? 'column' : 'row'} spacing={2} sx={{ mt: 3 }}>
          <ActionButton
            component={Link}
            href={`/signup?previousPage=/nonprofit/${npo_id}`}
            variant="contained"
            size="large"
            fullWidth={isMobile}
            startIcon={<StarIcon />}
            sx={{ 
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}
          >
            🚀 Join the Impact
          </ActionButton>
          <ActionButton
            variant="outlined"
            size="large"
            fullWidth={isMobile}
            onClick={() => redirectToLoginPage({
              postLoginRedirectUrl: window.location.href
            })}
            startIcon={<LaunchIcon />}
          >
            Sign In
          </ActionButton>
        </Stack>
      );
    }

    return (
      <Stack direction={isMobile ? 'column' : 'row'} spacing={2} alignItems="center" sx={{ mt: 3 }}>
        {problem_statement.slack_channel && (
          <ActionButton
            component="a"
            href={`https://opportunity-hack.slack.com/app_redirect?channel=${problem_statement.slack_channel}`}
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
            startIcon={<TagIcon />}
            sx={{ 
              background: 'linear-gradient(45deg, #4ade80 0%, #22c55e 100%)',
              color: 'white'
            }}
          >
            Join #{problem_statement.slack_channel}
          </ActionButton>
        )}
        <ActionButton
          variant="outlined"
          startIcon={<ShareIcon />}
          onClick={() => {
            navigator.share?.({
              title: problem_statement.title,
              text: `Check out this impactful project: ${problem_statement.title}`,
              url: window.location.href
            }) || navigator.clipboard.writeText(window.location.href);
          }}
        >
          Share Project
        </ActionButton>
      </Stack>
    );
  };

  const copyProjectLink = "project/" + problem_statement.id;


  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Fade in timeout={800}>
        <ModernProjectCard status={problem_statement.status}>
          {/* Hero Section */}
          <HeroSection>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                {renderStatus()}
                <Stack direction="row" spacing={1} alignItems="center">
                  <CopyToClipboardButton location={copyProjectLink} />
                  {problem_statement.first_thought_of && (
                    <Chip 
                      label={`Since ${problem_statement.first_thought_of}`} 
                      size="small" 
                      sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                    />
                  )}
                </Stack>
              </Stack>
              
              <Typography 
                variant="h3" 
                component="h1" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 2, 
                  color: 'white',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                {problem_statement.title}
              </Typography>
              
              <SkillSet Skills={problem_statement.skills} />
              
              <Box sx={{ mt: 3 }}>
                <ProjectProgress state={problem_statement.status} />
              </Box>
            </Box>
          </HeroSection>

          <CardContent sx={{ p: 4 }}>
            {/* Engagement Metrics */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={4}>
                <Zoom in timeout={600} style={{ transitionDelay: '200ms' }}>
                  <MetricCard>
                    <Stack alignItems="center" spacing={1}>
                      <Badge badgeContent={countOfHackers} color="primary" max={99}>
                        <DeveloperModeIcon color="primary" sx={{ fontSize: 32 }} />
                      </Badge>
                      <Typography variant="h6" fontWeight={700}>
                        {countOfHackers}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Developer{countOfHackers === 1 ? '' : 's'}
                      </Typography>
                    </Stack>
                  </MetricCard>
                </Zoom>
              </Grid>
              <Grid item xs={4}>
                <Zoom in timeout={600} style={{ transitionDelay: '400ms' }}>
                  <MetricCard>
                    <Stack alignItems="center" spacing={1}>
                      <Badge badgeContent={countOfMentors} color="secondary" max={99}>
                        <SupportIcon color="secondary" sx={{ fontSize: 32 }} />
                      </Badge>
                      <Typography variant="h6" fontWeight={700}>
                        {countOfMentors}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Mentor{countOfMentors === 1 ? '' : 's'}
                      </Typography>
                    </Stack>
                  </MetricCard>
                </Zoom>
              </Grid>
              <Grid item xs={4}>
                <Zoom in timeout={600} style={{ transitionDelay: '600ms' }}>
                  <MetricCard>
                    <Stack alignItems="center" spacing={1}>
                      <EventIcon color="action" sx={{ fontSize: 32 }} />
                      <Typography variant="h6" fontWeight={700}>
                        {eventsCount}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Event{eventsCount === 1 ? '' : 's'}
                      </Typography>
                    </Stack>
                  </MetricCard>
                </Zoom>
              </Grid>
            </Grid>

            {/* Description Preview */}
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 4,
                lineHeight: 1.7,
                fontSize: '1.1rem',
                color: 'text.secondary'
              }}
            >
              {problem_statement.description?.length > 200 
                ? `${problem_statement.description.substring(0, 200)}...`
                : problem_statement.description
              }
            </Typography>

            {/* Help Toggle */}
            <Box sx={{ mb: 4 }}>
              {renderHelpToggle()}
            </Box>

            {/* Call to Action */}
            {renderCallToAction()}

            <Divider sx={{ my: 4 }} />

            {/* Expandable Sections */}
            <Stack spacing={3}>
              {/* Full Description */}
              <SectionCard>
                <SectionHeader onClick={() => handleSectionToggle('description')}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <NotesIcon color="primary" />
                    <Typography variant="h6" fontWeight={600}>
                      Project Description
                    </Typography>
                  </Stack>
                  <IconButton>
                    <ExpandMoreIcon 
                      sx={{ 
                        transform: expandedSection === 'description' ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.3s'
                      }} 
                    />
                  </IconButton>
                </SectionHeader>
                <Collapse in={expandedSection === 'description'}>
                  <Box sx={{ p: 3 }}>
                    <ReactMarkdown>{problem_statement.description}</ReactMarkdown>
                  </Box>
                </Collapse>
              </SectionCard>

              {/* Reference Documents */}
              {problem_statement.references?.length > 0 && (
                <SectionCard>
                  <SectionHeader onClick={() => handleSectionToggle('references')}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <ArticleIcon color="primary" />
                      <Typography variant="h6" fontWeight={600}>
                        Reference Documents ({problem_statement.references.length})
                      </Typography>
                    </Stack>
                    <IconButton>
                      <ExpandMoreIcon 
                        sx={{ 
                          transform: expandedSection === 'references' ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.3s'
                        }} 
                      />
                    </IconButton>
                  </SectionHeader>
                  <Collapse in={expandedSection === 'references'}>
                    <Box sx={{ p: 3 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        📚 Review these documents to understand the problem better. Most are collaborative Google docs!
                      </Typography>
                      <Stack spacing={2}>
                        {problem_statement.references.map((reference, index) => (
                          <ReferenceItem key={index} reference={reference} />
                        ))}
                      </Stack>
                    </Box>
                  </Collapse>
                </SectionCard>
              )}

              {/* GitHub Repositories */}
              {problem_statement.github?.length > 0 && (
                <SectionCard>
                  <SectionHeader onClick={() => handleSectionToggle('github')}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <GitHubIcon color="primary" />
                      <Typography variant="h6" fontWeight={600}>
                        Code & Tasks ({problem_statement.github.length} repos)
                      </Typography>
                    </Stack>
                    <IconButton>
                      <ExpandMoreIcon 
                        sx={{ 
                          transform: expandedSection === 'github' ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.3s'
                        }} 
                      />
                    </IconButton>
                  </SectionHeader>
                  <Collapse in={expandedSection === 'github'}>
                    <Box sx={{ p: 3 }}>
                      <Grid container spacing={2}>
                        {problem_statement.github.map((repo, index) => (
                          <Grid item xs={12} sm={6} key={index}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                {repo.name}
                              </Typography>
                              <Stack direction="row" spacing={1}>
                                <ActionButton
                                  size="small"
                                  variant="outlined"
                                  startIcon={<CodeIcon />}
                                  href={repo.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  component="a"
                                >
                                  Code
                                </ActionButton>
                                <ActionButton
                                  size="small"
                                  variant="outlined"
                                  startIcon={<AssignmentIcon />}
                                  href={`${repo.link}/issues`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  component="a"
                                >
                                  Issues
                                </ActionButton>
                              </Stack>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  </Collapse>
                </SectionCard>
              )}

              {/* Events & Teams */}
              <SectionCard>
                <SectionHeader onClick={() => handleSectionToggle('events')}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <PeopleIcon color="primary" />
                    <Typography variant="h6" fontWeight={600}>
                      Events & Teams ({eventsCount} events)
                    </Typography>
                  </Stack>
                  <IconButton>
                    <ExpandMoreIcon 
                      sx={{ 
                        transform: expandedSection === 'events' ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.3s'
                      }} 
                    />
                  </IconButton>
                </SectionHeader>
                <Collapse in={expandedSection === 'events'}>
                  <Box sx={{ p: 3 }}>
                    {hackathonEventsLoaded ? (
                      <Events
                        key={problem_statement.id}
                        teams={teams}
                        userDetails={userDetails}
                        events={hackathonEvents}
                        onTeamLeave={handleLeavingTeam}
                        onTeamJoin={handleJoiningTeam}
                        user={profile}
                        problemStatementId={problem_statement.id}
                        isHelping={help_checked}
                      />
                    ) : (
                      <Box display="flex" justifyContent="center" p={3}>
                        <CircularProgress />
                      </Box>
                    )}
                  </Box>
                </Collapse>
              </SectionCard>
            </Stack>
          </CardContent>
        </ModernProjectCard>
      </Fade>

      {/* Help Dialogs */}
      <HelpDialog
        open={open}
        onClose={handleClose}
        onConfirm={handleClose}
        onHelp={handleClose}
        onCancel={handleCancel}
      />

      <UnhelpDialog
        open={openUnhelp}
        onClose={handleCloseUnhelp}
        onCancel={handleCloseUnhelpCancel}
      />
    </Container>
  );
}