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
import ReactMarkdown from 'react-markdown';


// Imported Components
import useProfileApi from "../../hooks/use-profile-api";
import ProjectProgress from "../ProjectProgress/ProjectProgress";
import useTeams from "../../hooks/use-teams";
import SkillSet from "../skill-set";
import CopyToClipboardButton from "../buttons/CopyToClipboardButton";
import ReactPixel from 'react-facebook-pixel';
import useProblemstatements from "../../hooks/use-problem-statements";
import useHackathonEvents from "../../hooks/use-hackathon-events";
import {useRedirectFunctions} from "@propelauth/react";
import * as ga from '../../lib/ga';
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
import TeamCreationDialog from "../TeamCreation/TeamCreationDialog";
import { HelpDialog, UnhelpDialog } from "../HelpDialog/HelpDialog";

export default function ProblemStatement({ problem_statement_id, user, npo_id }) {
  const isLargeScreen = useMediaQuery('(min-width: 768px)');

  const { redirectToLoginPage } = useRedirectFunctions();
  const { problem_statement } = useProblemstatements(problem_statement_id);
  const { handle_get_hackathon_id } = useHackathonEvents();
  const { handle_new_team_submission, handle_join_team, handle_unjoin_a_team } = useTeams();
  
  // States
  const [hackathonEvents, setHackathonEvents] = useState([]);
  const [teamCreationError, setTeamCreationError] = useState(false);
  const [teamCreationErrorDetails, setTeamCreationErrorDetails] = useState("");
  const [sendingTeamDetails, setSendingTeamDetails] = useState(false);
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
  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const [newTeamSlackChannel, setNewTeamSlackChannel] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamEventId, setNewTeamEventId] = useState("");
  const [newTeamProblemStatementId, setNewTeamProblemStatementId] = useState("");
  const [newGithubUsername, setNewGithubUsername] = useState("");
  const [expanded, setExpanded] = useState("Events");
  const [tabValue, setTabValue] = useState('Events');

  // Data for random team name generation
  const songs = [
    "Lover", "Willow", "Blank Space", "Shake It Off", "Code Style",
    "Good Blood", "You Belong With Me", "Fearless", "Red", "Sparks Fly",
    "Enchanted", "Mine", "Back To December", "The Story Of Us", "Speak Now",
    "Fifteen", "Hey Stephen", "White Horse",
  ];

  const codeAdjectives = [
    "Compiler", "Cryptic", "Systematic", "Coding", "Serverless", 
    "Codable", "Codified", "Exception", "Exceptional"
  ];

  const volunteerWords = [
    "Leaders", "Heroes", "Visionaries", "Helpers", "Humans",
    "Advocates", "Volunteers", "Champions", "Ambassadors"  
  ];

  const { get_user_by_id, profile, handle_help_toggle } = useProfileApi();

  // Custom styled switch for the help toggle
  const MaterialUISwitch = styled(Switch)(({ theme }) => ({
    width: 62,
    height: 34,
    padding: 7,
    "& .MuiSwitch-switchBase": {
      margin: 1,
      padding: 0,
      transform: "translateX(6px)",
      "&.Mui-checked": {
        color: "#fff",
        transform: "translateX(22px)",
        "& .MuiSwitch-thumb:before": {
          backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
            "#fff"
          )}" d="M4.375 17.542v-3.584h1.583v3.584Zm3.458 0v-9.25q-1.021.52-1.739 1.385-.719.865-.782 2.198H4.229q.063-1.937 1.427-3.448 1.365-1.51 3.302-1.51H10.5q1.708 0 2.938-1 1.229-1 1.27-2.667h1.084q-.021 1.729-1.052 2.927-1.032 1.198-2.573 1.615v9.75h-1.084v-4.959H8.917v4.959ZM10 5.396q-.688 0-1.156-.469-.469-.469-.469-1.156 0-.667.479-1.136.479-.468 1.146-.468.688 0 1.156.468.469.469.469 1.157 0 .666-.479 1.135T10 5.396Z"/></svg>')`,
        },
        "& + .MuiSwitch-track": {
          opacity: 1,
          backgroundColor: "#00BB00",
        },
      },
    },
    "& .MuiSwitch-thumb": {
      backgroundColor: "#000",
      width: 32,
      height: 32,
      "&:before": {
        content: "''",
        position: "absolute",
        width: "100%",
        height: "100%",
        left: 0,
        top: 0,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20"><path fill="${encodeURIComponent(
          "#fff"
        )}" d="m4.646 15.646-1.688-1.708L6.917 10 2.958 6.062l1.688-1.708L10.292 10Zm6.75 0-1.688-1.708L13.688 10l-3.98-3.938 1.688-1.708L17.042 10Z"/></svg>')`,
      },
    },
    "& .MuiSwitch-track": {
      opacity: 1,
      backgroundColor: "#FFFF00",
      borderRadius: 20 / 2,
    },
  }));

  // Initialize Facebook Pixel
  const options = {
    autoConfig: true,
    debug: false,
  };
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      ReactPixel.init(process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID, undefined, options);
    }
  }, []);

  // Generate team name suggestions and fetch hackathon events
  useEffect(() => {
    // Generate team name suggestion
    const randomSong = songs[Math.floor(Math.random() * songs.length)];
    const randomCodeAdjective = codeAdjectives[Math.floor(Math.random() * codeAdjectives.length)];
    const randomVolunteerWord = volunteerWords[Math.floor(Math.random() * volunteerWords.length)];
    setTeamSuggestions([`${randomSong} ${randomCodeAdjective} ${randomVolunteerWord}`]);
  
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
  }, [problem_statement_id, problem_statement]);
  
  // Get user details for team members
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
  }, [teams, get_user_by_id]);

  // Check if the user is already helping with this project
  useEffect(() => {
    if (problem_statement?.helping?.length > 0 && user && profile?.user_id) {
      const isHelping = problem_statement.helping.find(help => help.slack_user === profile.user_id);
      if (isHelping) {
        setHelpedChecked("checked");
        setHelpingType(isHelping.type);
      }
    }
  }, [problem_statement, user, profile]);

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
    
    ReactPixel.trackCustom("problem_statement_accordion", params);
    ga.event({
      action: "problem_statement_accordion",
      params: params
    });
    
    setExpanded(isExpanded ? panel : false);
  };

  const handleClickOpen = (event) => {
    if (event.target.checked) {
      setOpen(true);
      ReactPixel.track("Helping Dialog Opened", {
        problem_statement_id: problem_statement?.id,
        problem_statement_title: problem_statement?.title,
        npo_id: npo_id,
        user_id: user?.userId
      });
    } else {
      setOpenUnhelp(true);
      ReactPixel.track("Not Helping Dialog Opened", {
        problem_statement_id: problem_statement?.id,
        problem_statement_title: problem_statement?.title,
        npo_id: npo_id,
        user_id: user?.userId 
      });
    }
  };

  const handleLeavingTeam = (teamId) => {
    handle_unjoin_a_team(teamId, handleTeamLeavingResponse);

    ReactPixel.track("Team Left", { team_id: teamId });
    ga.event({
      action: "team_left",
      params: { team_id: teamId }
    });
  };

  const handleJoiningTeam = (teamId) => {
    handle_join_team(teamId, handleTeamLeavingResponse);

    ReactPixel.track("Team Joined", { team_id: teamId });
    ga.event({
      action: "team_joined",
      params: { team_id: teamId }
    });
  };

  const handleTeamCreate = (problemStatementId, eventId) => {    
    setNewTeamProblemStatementId(problemStatementId);
    setNewTeamEventId(eventId);
    setCreateTeamOpen(true);

    ReactPixel.track("Team Create Dialog Opened", {
      problem_statement_id: problemStatementId,
      event_id: eventId
    });

    ga.event({
      action: "team_create_dialog_opened",
      params: {
        problem_statement_id: problemStatementId,
        event_id: eventId
      }
    });
  };

  const handleUpdateTeamName = (event) => {
    const value = event.target.value;   
    setNewTeamName(value);

    ReactPixel.track("Team Name Updated", { team_name: value });
    ga.event({
      action: "team_name_updated",
      params: { team_name: value }
    });
  };

  const handleUpdateSlackChannel = (event) => {
    const value = event.target.value;
    setNewTeamSlackChannel(value);

    ReactPixel.track("Slack Channel Entered", { slack_channel: value });
    ga.event({
      action: "slack_channel_entered",
      params: { slack_channel: value }
    });
  };

  const handleUpdateGithubUsername = (event) => {
    const value = event.target.value;
    setNewGithubUsername(value);

    ReactPixel.track("Github Username Entered", { github_username: value });
    ga.event({
      action: "github_username_event",
      params: { github_username: value }
    });
  };

  const handleConfirmTeamCreate = () => {
    setSendingTeamDetails(true);

    const params = {
      team_name: newTeamName,
      slack_channel: newTeamSlackChannel,
      problem_statement_id: newTeamProblemStatementId,
      event_id: newTeamEventId      
    };
    
    ReactPixel.trackCustom("team_create", params);
    ga.event({
      action: "team_create",
      params: params
    });

    handle_new_team_submission(
      newTeamName,
      newTeamSlackChannel,
      newTeamProblemStatementId,
      newTeamEventId,
      newGithubUsername,      
      handleTeamCreationResponse
    );
  };

  const handleTeamLeavingResponse = () => {
    ReactPixel.track("Team Left");
    ga.event({
      category: "Team",
      action: "Team Left",
      label: "Team",
    });
  };

  const handleTeamCreationResponse = (data) => {
    setSendingTeamDetails(false);
    setTeamCreationErrorDetails("");
    setTeamCreationError(false);

    if (data.success) {    
      // Add new team to local state
      setTeams(teams => [...teams, data.team]);  

      // Update hackathon events with the new team
      setHackathonEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === newTeamEventId 
            ? {...event, teams: [...event.teams, data.team.id]} 
            : event
        )
      );

      setTeamCreationErrorDetails(data.message);
      setCreateTeamOpen(false);
    } else {
      setCreateTeamOpen(true);
      setTeamCreationError(true);
      setTeamCreationErrorDetails(data.message);
    }      
  };

  const handleCloseTeamCreate = () => {
    setCreateTeamOpen(false);
    ReactPixel.track("Team Creation Dialog Closed", { user_id: user?.userId });
    ga.event({
      category: "Team Creation",
      action: "Team Creation Dialog Closed",
      label: "Team Creation",
    });
  };

  const handleClose = (helperType) => {
    console.log("handleClose", helperType);
    ReactPixel.track("Helping: User Finalized Start Helping", {
      problem_statement_id: problem_statement?.id,
      problem_statement_title: problem_statement?.title,
      npo_id: npo_id,
      user_id: user?.userId,
      mentor_or_hacker: helperType
    });
    
    ga.event({
      category: "Helping",
      action: "User Finalized Helping",
      label: "Helping",
    });

    setOpen(false);
    setHelpedChecked("checked");
    setHelpingType(event.target.value);
    handle_help_toggle(
      "helping",
      problem_statement.id,
      event.target.value,
      npo_id
    );
  };

  const handleCancel = () => {
    ReactPixel.track("Helping: User Canceled Helping", {
      problem_statement_id: problem_statement?.id,
      problem_statement_title: problem_statement?.title,
      npo_id: npo_id,
      user_id: user?.userId
    });
    
    ga.event({
      category: "Helping",
      action: "User Canceled Helping",
      label: "Helping",
    });

    setOpen(false);
    setHelpedChecked("");
    setHelpingType("");
  };

  const handleCloseUnhelp = () => {
    ReactPixel.track("Helping: User Finalized Stop Helping", {
      problem_statement_id: problem_statement?.id,
      problem_statement_title: problem_statement?.title,
      npo_id: npo_id,
      user_id: user?.userId
    });
    
    ga.event({
      category: "Helping",
      action: "User Finalized Stop Helping",
      label: "Helping",
    });

    setOpenUnhelp(false);
    setHelpedChecked("");
    setHelpingType("");
    handle_help_toggle("not_helping", problem_statement.id, "", npo_id);
  };

  const handleCloseUnhelpCancel = () => {
    ReactPixel.track("Helping: User Canceled Stop Helping");
    ga.event({
      category: "Helping",
      action: "User Canceled Stop Helping",
      label: "Helping",
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
  
  // Count helpers
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

  const hackersPlural = countOfHackers === 1 ? "" : "s";
  const hackersVerb = countOfHackers === 1 ? "is" : "are";
  const mentorsVerb = countOfMentors === 1 ? "is" : "are";
  
  // Set card appearance based on status
  let status;
  let cardBackground = "#f5f7f77f";

  if (problem_statement.status === "production") {
    status = (
      <Tooltip
        enterTouchDelay={0}
        title={<span style={{ fontSize: "14px" }}>We pushed this to production!</span>}
        arrow
      >
        <Chip variant="outlined" icon={<WorkspacePremiumIcon />} color="success" label="Live" />      
      </Tooltip>
    );
    cardBackground = "#e5fbe5";
  } else {
    status = (
      <Tooltip
        enterTouchDelay={0}
        title={<span style={{ fontSize: "14px" }}>This project isn't complete yet, and we need your help!</span>}
        arrow
      >
        <Chip icon={<BuildIcon />} color="warning" label="Needs Help" />
      </Tooltip>
    );
  }

  // Prepare help switch and call to action based on user login status
  let callToAction;
  let helpingSwitch;
  let helpingSwitchType = "";

  if (helpingType === "hacker") {
    helpingSwitchType = (
      <div>
        <DeveloperModeIcon />
        I'm helping as a hacker
      </div>
    );
  } else if (helpingType === "mentor") {
    helpingSwitchType = (
      <div>
        <SupportIcon /> I'm helping as a mentor
      </div>
    );
  } else {
    helpingSwitchType = <span>Slide to help</span>;
  }

  if (!user) {     
    helpingSwitch = (
      <FormControlLabel
        labelPlacement="bottom"
        control={
          <Tooltip
            enterTouchDelay={0}  
            placement="top-start"       
            title={<span style={{ fontSize: "14px" }}>Login first, then you can help by sliding this</span>}
            style={{ marginLeft: "2rem" }}
          >
            <Badge color="secondary" variant="dot" anchorOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}>
              <MaterialUISwitch sx={{ m: 1, color: "gray"}} disabled />
            </Badge>
          </Tooltip>
        }
        label="Login to help"
      />
    );

    callToAction = (
      <Grid container direction="column" justifyContent="flex-start" alignItems="flex-start">  
        <Grid item padding={1}>
          <Link href={`/signup?previousPage=/nonprofit/${npo_id}`}>    
            <Button variant="contained" color="primary">
              Create OHack Slack Account
            </Button>
          </Link>
        </Grid>
        
        <Grid item padding={1}>
          <LoginButton
            variant="contained"
            disableElevation
            onClick={() => redirectToLoginPage({
              postLoginRedirectUrl: window.location.href
            })}
            className="login-button"
          >
            Log In
            <svg
              fill="none"
              viewBox="0 0 10 10"
              stroke="currentColor"
              height="1em"
              width="1em"
            >
              <path className="arrow" d="M3,2 L6,5 L3,8" />
              <path className="line" d="M3,5 L8,5" />
            </svg>
          </LoginButton>
        </Grid>
      </Grid>
    );
  } else {
    callToAction = (
      <a
        href={`https://opportunity-hack.slack.com/app_redirect?channel=${problem_statement.slack_channel}`}
        target="_blank"
        rel="noreferrer"
      >
        <button className="button button--compact button--primary">
          Join <TagIcon />
          {problem_statement.slack_channel} to help
        </button>
      </a>
    );

    helpingSwitch = (
      <Tooltip 
        enterTouchDelay={0} 
        title={<span style={{ fontSize: "15px" }}>{help_checked === "checked" ? "Click to stop helping 😭" : "Click to help 😍"}</span>}
      >
        <FormControlLabel
          onClick={handleClickOpen}
          onChange={handleClickOpen}
          labelPlacement="bottom"        
          control={<MaterialUISwitch sx={{ m: 1 }} checked={help_checked === "checked"} />}
          label={helpingSwitchType}
        />
      </Tooltip>
    );
  }

  // Set up references section
  const reference_count = problem_statement.references?.length || 0;
  const references_buttons = problem_statement.references?.length > 0 ? (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {problem_statement.references.map((reference, index) => (
        <ReferenceItem key={index} reference={reference} />
      ))}
    </Box>
  ) : (
    <Typography>No references yet</Typography>
  );

  const copyProjectLink = "project/" + problem_statement.id;

  // Prepare content sections for accordion/tabs
  const contentSections = [
    {
      label: 'Events',
      icon: <EventIcon />,      
      description: (
        <Stack>
          <ShortDescText>
            {hackathonEvents && hackathonEvents.length > 0
              ? `We've hacked on this at ${hackathonEvents.length} event${hackathonEvents.length > 1 ? "s" : ""}`
              : "We haven't hacked on this project yet!"}
          </ShortDescText>
          <ShortDescText>{teamText}</ShortDescText>
        </Stack>
      ),
      content: (
        <Events          
          key={problem_statement.id}
          teams={teams}
          userDetails={userDetails}
          events={hackathonEvents}
          onTeamCreate={handleTeamCreate}
          onTeamLeave={handleLeavingTeam}          
          onTeamJoin={handleJoiningTeam}
          user={profile}
          problemStatementId={problem_statement.id}
          isHelping={help_checked}
        />
      )     
    },
    {
      label: 'Description',
      icon: <NotesIcon />,
      description: (
        <Typography fontSize={13}>
          {getWordStr(problem_statement.description)}...
        </Typography>
      ),
      content: (
        <ProjectDescText>
          <ReactMarkdown>
            {problem_statement.description}
          </ReactMarkdown>
        </ProjectDescText>
      )
    },    
    {
      label: 'Code & Tasks',
      icon: <CodeIcon />,
      description: "GitHub repos and Tasks associated with this project",
      content: (
        <ProjectDescText>
          <Grid container direction="row" spacing={0.5} padding={0}>
            <Stack spacing={1} padding={0.5}>
              {problem_statement.github != null &&
               problem_statement.github.length > 0 &&
               typeof problem_statement.github !== "string" ? (
                problem_statement.github.map((github) => (
                  <AccordionButton
                    target="_blank"
                    rel="noopener noreferrer"
                    key={github.name}
                    href={github.link}
                    className="button button--primary button--compact"
                  >
                    {github.name}
                  </AccordionButton>
                ))
              ) : (
                <p>No GitHub links yet.</p>
              )}
            </Stack>

            <Stack spacing={1} padding={0.5}>
              {problem_statement.github != null &&
               problem_statement.github.length > 0 &&
               typeof problem_statement.github !== "string" &&
               problem_statement.github.map((github) => (
                <AccordionButton
                  target="_blank"
                  rel="noopener noreferrer"
                  key={github.name}
                  className="button button--primary button--compact"
                  href={`${github.link}/issues`}
                >
                  Tasks for {github.name}
                </AccordionButton>
              ))}
            </Stack>
          </Grid>   
        </ProjectDescText>
      )
    },
    {
      label: 'References',
      icon: <ArticleIcon />,
      description: (
        <ShortDescText>
          {reference_count} doc{
            (reference_count === 0 || reference_count > 1) ? "s" : ""
          } that will help you better understand the problem
        </ShortDescText>
      ),
      content: (
        <ProjectDescText>
          {references_buttons}
        </ProjectDescText>
      )
    },    
  ];


  return (
    <ProjectCard container bgcolor={cardBackground} sx={{ border: 1, borderColor: "#C0C0C0" }} key={problem_statement.id}>
      <Grid container item xs={6} md={6} justifyItems="flex-start">        
        {status}
      </Grid>
      <Grid container item xs={6} md={6} justifyContent="flex-end" justifyItems="flex-end">
        <CopyToClipboardButton location={copyProjectLink} />                
      </Grid>
      <Grid container item xs={12} md={12} justifyContent="flex-start">
        <Stack direction="row" spacing={0} justifyContent="flex-end">          
          <SkillSet Skills={problem_statement.skills} />          
        </Stack>
      </Grid>
            
      <Grid container item xs={12} md={12} justifyItems="flex-end" justifyContent="flex-end">
        <Tooltip
         enterTouchDelay={0}
          title={
            <span
              style={{ fontSize: "14px" }}
            >{`${countOfHackers} hacker${hackersPlural} ${hackersVerb} hacking`}</span>
          }
          style={{ marginLeft: "2rem" }}
        >
          <Badge
            showZero
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            badgeContent={countOfHackers}
            color="secondary"
          >
            <DeveloperModeIcon fontSize="large" />
          </Badge>
        </Tooltip>

        <Tooltip
          enterTouchDelay={0}
          title={
            <span
              style={{ fontSize: "14px" }}
            >{`${countOfMentors} mentor${mentorsVerb} mentoring`}</span>
          }
          style={{ marginLeft: "2rem" }}
        >
          <Badge
            showZero
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            badgeContent={countOfMentors}
            color="secondary"
          >
            <SupportIcon fontSize="large" />
          </Badge>
        </Tooltip>       
      </Grid>
      
      <TitleStyled sx={{marginBottom: "5px"}} variant="h2">{problem_statement.title}</TitleStyled>            
    
      <YearStyled>{problem_statement.first_thought_of}</YearStyled>      
      <ProjectProgress state={problem_statement.status} />      
    
      <Grid container item xs={12} md={12} justifyContent="flex-start" sx={{ marginTop: "10px" }}>      
        <Grid item textAlign="justify" xs={12} md={12}>                    
            <ReferencesStyled>Reference Docs</ReferencesStyled>          
            <ShortDescText>Check these first to get more detail on the problem.  Most of these are Google docs, so feel free to comment on them to collaborate!</ShortDescText>
        </Grid>
        <Grid item xs={12} md={12}>
          <ProjectDescText>{references_buttons}</ProjectDescText>
        </Grid>      

        <Grid item xs={12} md={12}>
            <Divider/>
          </Grid>
      </Grid>
    
     <ProblemStatementContent 
        sections={contentSections}
        isLargeScreen={isLargeScreen}
        expanded={expanded}
        handleChange={handleChange}
        tabValue={tabValue}
        handleTabChange={handleTabChange}        
      />

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


      <TeamCreationDialog 
        open={createTeamOpen}
        onClose={handleCloseTeamCreate}
        onConfirm={handleConfirmTeamCreate}
        onUpdateTeamName={handleUpdateTeamName}
        onUpdateSlackChannel={handleUpdateSlackChannel}
        onUpdateGithubUsername={handleUpdateGithubUsername}
        sendingTeamDetails={sendingTeamDetails}
        teamCreationError={teamCreationError}
        teamCreationErrorDetails={teamCreationErrorDetails}
        teamSuggestions={teamSuggestions}
        newTeamName={newTeamName}
        newTeamSlackChannel={newTeamSlackChannel}
      />

      <Stack spacing={2} direction="row">      
        {helpingSwitch}
          
        <Box sx={{ width: "75%" }}>{callToAction}</Box>      
      </Stack>
    </ProjectCard>
  );
}