import React, { use } from "react";
import { useState, useMemo, useEffect } from "react";

import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
import BuildIcon from "@mui/icons-material/Build";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import TagIcon from "@mui/icons-material/Tag";
import Switch from "@mui/material/Switch";
import Stack from "@mui/material/Stack";
import FormControlLabel from "@mui/material/FormControlLabel";
import { styled } from "@mui/material/styles";
import CoPresentIcon from '@mui/icons-material/CoPresent';
import GitHubIcon from '@mui/icons-material/GitHub';

import ReactMarkdown from 'react-markdown'
import Divider from '@mui/material/Divider';



import SupportIcon from "@mui/icons-material/Support";
import Badge from "@mui/material/Badge";
import { LoginButton } from "../Navbar/styles";


import ArticleIcon from "@mui/icons-material/Article";
import SmartDisplayIcon from '@mui/icons-material/SmartDisplay';
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";

import DeveloperModeIcon from "@mui/icons-material/DeveloperMode";

import useProfileApi from "../../hooks/use-profile-api";
import ProjectProgress from "../ProjectProgress/ProjectProgress";

import Box from "@mui/material/Box";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InputAdornment from "@mui/material/InputAdornment";

import NotesIcon from '@mui/icons-material/Notes'; 
import EventIcon from "@mui/icons-material/Event";
import CodeIcon from "@mui/icons-material/Code";

import useMediaQuery from '@mui/material/useMediaQuery';

import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Link from "next/link";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
// Add circle spinner
import CircularProgress from '@mui/material/CircularProgress';


import useTeams from "../../hooks/use-teams";
import Events from "../Events/Events";
import {
  AccordionButton,
  AccordionContainer,
  AccordionTitle,  
  ProjectCard,
  ProjectDescText,
  ShortDescText,
  TitleStyled,
  ReferencesStyled,
  YearStyled,
} from "./styles";
import Grid from '@mui/material/Grid';


import SkillSet from "../skill-set";
import CopyToClipboardButton from "../buttons/CopyToClipboardButton";
import ReactPixel from 'react-facebook-pixel';
import useProblemstatements from "../../hooks/use-problem-statements";
import useHackathonEvents from "../../hooks/use-hackathon-events";
import {useRedirectFunctions} from "@propelauth/react"

import * as ga from '../../lib/ga';
import VideoDisplay from "../VideoDisplay/VideoDisplay";

export default function ProblemStatement({ problem_statement_id, user, npo_id }) {
  const isLargeScreen = useMediaQuery('(min-width: 768px)');

  const { redirectToLoginPage } = useRedirectFunctions();
  const { problem_statement } = useProblemstatements(problem_statement_id);
  const { handle_get_hackathon_id } = useHackathonEvents();
  const { handle_get_team, handle_new_team_submission, handle_join_team, handle_unjoin_a_team } = useTeams();
  

  // For every item in problem_statement.events, get the event details with useCallback using handle_get_hackathon(event_id, onComplete) 
  const [hackathonEvents, setHackathonEvents] = useState([]);
  const [teamCreationError, setTeamCreationError] = useState(false);
  const [teamCreationErrorDetails, setTeamCreationErrorDetails] = useState("");
  const [sendingTeamDetails, setSendingTeamDetails] = useState(false);
  const [teamSuggestions, setTeamSuggestions] = useState(null);

  const [hackathonEventsLoaded, setHackathonEventsLoaded] = useState(false);
  const [hackathonEventsError, setHackathonEventsError] = useState(false);
  const [hackathonEventsErrorDetails, setHackathonEventsErrorDetails] = useState(null);

  const songs = [
    "Lover",
    "Willow",
    "Blank Space",
    "Shake It Off",
    "Code Style",
    "Good Blood",
    "You Belong With Me",
    "Fearless",
    "Red",
    "Sparks Fly",
    "Enchanted",    
    "Mine",
    "Back To December",
    "The Story Of Us",
    "Speak Now",
    "Fifteen",    
    "Hey Stephen",
    "White Horse",
  ];

  const codeAdjectives = [
  "Compiler",
  "Cryptic",
  "Systematic", 
  "Coding",
  "Serverless",
  "Codable",
  "Codified", 
  "Exception", 
  "Exceptional"
];

const volunteerWords = [
  "Leaders",
  "Heroes",  
  "Visionaries",
  "Helpers",
  "Humans",
  "Advocates", 
  "Volunteers",  
  "Champions",
  "Ambassadors"  
];

  useEffect(() => {
    // Generate random team name suggestions using Taylor Swift songs and social good as the topic and only provide two words from them
    // Pick 1 word from songs, codeAdjectives, and volunteerWords
    const teamSuggestions = [];
    const randomSong = songs[Math.floor(Math.random() * songs.length)];
    const randomCodeAdjective = codeAdjectives[Math.floor(Math.random() * codeAdjectives.length)];
    const randomVolunteerWord = volunteerWords[Math.floor(Math.random() * volunteerWords.length)];
    teamSuggestions.push(randomSong + " " + randomCodeAdjective + " " + randomVolunteerWord);    
    setTeamSuggestions(teamSuggestions);
  


    if (problem_statement && problem_statement.events) {
      const events = problem_statement.events;
      const hackathonEvents = [];
      const promises = [];
      events.forEach((id) => {        
        const promise = new Promise((resolve, reject) => {          
          handle_get_hackathon_id(id, (hackathonEvent) => {
            if (hackathonEvent) {
              
              hackathonEvents.push(hackathonEvent);
              resolve(hackathonEvent);
            } else {
              reject("Error getting hackathon event");
            }
          });
        });
        promises.push(promise);
      });
      Promise.all(promises)
        .then((values) => {          
          setHackathonEvents(hackathonEvents);
          setHackathonEventsLoaded(true);
        })
        .catch((error) => {
          setHackathonEventsError(true);
          setHackathonEventsErrorDetails(error);
        });
    }
  }, [problem_statement_id, problem_statement]);
  

  const [teams, setTeams] = useState([]);
  const [teamsLoaded, setTeamsLoaded] = useState(false);
  const [teamsError, setTeamsError] = useState(false);
  const [teamsErrorDetails, setTeamsErrorDetails] = useState(null);



  const { get_user_by_id, profile, handle_help_toggle} = useProfileApi();
  const [userLoaded, setUserLoaded] = useState(false);
  const [userError, setUserError] = useState(false);
  const [userErrorDetails, setUserErrorDetails] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  
  // For all users within teams, call get_user_by_id to get the user details in a map and store in userDetails
  useEffect(() => {
    if (teams && teams.length > 0) {
      const userDetailsMap = {};
      const promises = [];
      teams.forEach((team) => {
        team.users &&
          team.users.forEach((user_id) => {
            promises.push(
              get_user_by_id(user_id, (user) => {
                userDetailsMap[user_id] = user;
              })
            );
          });
      });
      Promise.all(promises)
        .then((values) => {
          setUserDetails(userDetailsMap);
          setUserLoaded(true);
        })
        .catch((error) => {
          setUserError(true);
          setUserErrorDetails(error);
        });
    }
  }, [problem_statement_id]);


  const [open, setOpen] = useState(false);
  const [openUnhelp, setOpenUnhelp] = useState(false);
  const [help_checked, setHelpedChecked] = useState("");
  const [helpingType, setHelpingType] = useState("");

  const [createTeamOpen, setCreateTeamOpen] = useState(false);

  

  const [newTeamSlackChannel, setNewTeamSlackChannel] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamEventId, setNewTeamEventId] = useState("");
  const [newTeamProblemStatementId, setNewTeamProblemStatementId] =
    useState("");
  const [newGithubUsername, setNewGithubUsername] = useState("");


  const options = {
    autoConfig: true, // set pixel's autoConfig. More info: https://developers.facebook.com/docs/facebook-pixel/advanced/
    debug: false, // enable logs
  };
  const advancedMatching = undefined; // { em: 'some@email.com' }; // optional, more info: https://developers.facebook.com/docs/facebook-pixel/advanced/advanced-matching
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      ReactPixel.init(process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID, advancedMatching, options);
    }
  }, []);


  const [expanded, setExpanded] = useState("Events");
  const handleChange = (panel) => (event, isExpanded) => {
    // Set user object and handle null
    
    const params = {
      action_name: isExpanded ? "open" : "close",
      panel_id: panel,
      npo_id: npo_id,
      problem_statement_id: problem_statement.id,
      problem_statement_title: problem_statement.title,
      user_id: user?.userId // Propel User ID
    }    
    ReactPixel.trackCustom("problem_statement_accordion", params);
    ga.event({
      action: "problem_statement_accordion",
      params: params
    })
    setExpanded(isExpanded ? panel : false);
  };

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

  const handleClickOpen = (event) => {
    if (event.target.checked) {
      // Only when selecting yes
      setOpen(true);
      ReactPixel.track("Helping Dialog Opened", {
        problem_statement_id: problem_statement.id,
        problem_statement_title: problem_statement.title,
        npo_id: npo_id,
        user_id: user.userId // Propel User ID
        });
    } else {
      setOpenUnhelp(true);

      ReactPixel.track("Not Helping Dialog Opened", {
        problem_statement_id: problem_statement.id,
        problem_statement_title: problem_statement.title,
        npo_id: npo_id,
        user_id: user.userId 
        });
    }
  };

  const handleLeavingTeam = (teamId) => {
    handle_unjoin_a_team(teamId, handleTeamLeavingResponse);

    ReactPixel.track("Team Left", {
      team_id: teamId
      });

    ga.event({
      action: "team_left",
      params: {
        team_id: teamId
      }
    });

  };

  const handleJoiningTeam = (teamId) => {
    handle_join_team(teamId, handleTeamLeavingResponse);

    ReactPixel.track("Team Joined", {
      team_id: teamId
      });
    
    ga.event({
      action: "team_joined",
      params: {
        team_id: teamId
      }
    });

  };

  const handleTeamCreate = (problemStatementId, eventId) => {    
    setNewTeamProblemStatementId(problemStatementId);
    setNewTeamEventId(eventId);
    setCreateTeamOpen(true); // Open the modal

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

    ReactPixel.track("Team Name Updated", {
      team_name: value
      });

    ga.event({
      action: "team_name_updated",
      params: {
        team_name: value
      }
    });

  };

  const handleUpdateSlackChannel = (event) => {
    const value = event.target.value;
    setNewTeamSlackChannel(value);

    ReactPixel.track("Slack Channel Entered", {
      slack_channel: value
      });

    ga.event({
      action: "slack_channel_entered",
      params: {
        slack_channel: value
      }
    });

  };

  const handleUpdateGithubUsername = (event) => {
    const value = event.target.value;
    setNewGithubUsername(value);

    ReactPixel.track("Github Username Entered", {
      github_username: value
    });

    ga.event({
      action: "github_username_event",
      params: {
        github_username: value
      }
    });

  };

  const handleConfirmTeamCreate = (event) => {
    setSendingTeamDetails(true);

    // Submit button pressed to create team    
    const params = {
      team_name: newTeamName,
      slack_channel: newTeamSlackChannel,
      problem_statement_id: newTeamProblemStatementId,
      event_id: newTeamEventId      
    }
    ReactPixel.trackCustom("team_create", params);
    ga.event({
      action: "team_create",
      params: params
    })


    handle_new_team_submission(
      newTeamName,
      newTeamSlackChannel,
      newTeamProblemStatementId,
      newTeamEventId,
      newGithubUsername,      
      handleTeamCreationResponse
    );
    
  };

  const handleTeamLeavingResponse = (data) => {
    // Person left a team
    ReactPixel.track("Team Left");
    ga.event({
      category: "Team",
      action: "Team Left",
      label: "Team",
    });

    
    // We don't do anything when someone leaves
  };

  const handleTeamCreationResponse = (data, problemStatementId, eventId) => {
    // We need to update our state to temporarily show the user that they have created a team
    // This should be followed up on refresh of the page with a hit to grab the real version from the backend/DB
    setSendingTeamDetails(false); // We are done sending the team details
    setTeamCreationErrorDetails("");
    setTeamCreationError(false); // No error

    // Check if data is success (has data.message that contains "Saved Team"
    if (data.success) {    
      // Success
      setTeamCreationError(false); // No error
      setTeamCreationErrorDetails("");

      // Append this to the current teams state 
      setTeams(teams => [...teams, data.team]);  

      // Update hackathonEvents to include this team
      const hackathonEventsCopy = hackathonEvents;
      hackathonEventsCopy.forEach((event) => {
        if (event.id === eventId) {
          event.teams.push(data.team.id);
        }
      });
      setHackathonEvents(hackathonEventsCopy);

      setTeamCreationErrorDetails(data.message); // Success message
      setCreateTeamOpen(false); // Submit button pressed to create team
    }
    else {
      setCreateTeamOpen(true); // Error, so keep open
      setTeamCreationError(true); // Error
      setTeamCreationErrorDetails(data.message); // Error details      
    }      
  };

  const handleCloseTeamCreate = (event) => {
    setCreateTeamOpen(false); // Cancel or close selected
    ReactPixel.track("Team Creation Dialog Closed", {
      user_id: user.userId
    });
    ga.event({
      category: "Team Creation",
      action: "Team Creation Dialog Closed",
      label: "Team Creation",
    });

  };

  const handleClose = (event) => {
    // They wanted to start helping
    ReactPixel.track("Helping: User Finalized Start Helping", {
      problem_statement_id: problem_statement.id,
      problem_statement_title: problem_statement.title,
      npo_id: npo_id,
      user_id: user.userId,
      mentor_or_hacker: event.target.value
      });
    ga.event({
      category: "Helping",
      action: "User Finalized Helping",
      label: "Helping",
    });


    setOpen(false);
    setHelpedChecked("checked");
    setHelpingType(event.target.value);
    // event.target.value will be either "mentor" or "hacker"
    handle_help_toggle(
      "helping",
      problem_statement.id,
      event.target.value,
      npo_id
    );
  };

  const handleCancel = (event) => {
    // They didn't want to start helping (cancel button pressed)
    ReactPixel.track("Helping: User Canceled Helping", {
      problem_statement_id: problem_statement.id,
      problem_statement_title: problem_statement.title,
      npo_id: npo_id,
      user_id: user.userId
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

  const handleCloseUnhelp = (event) => {
    // They wanted to stop helping
    ReactPixel.track("Helping: User Finalized Stop Helping", {
      problem_statement_id: problem_statement.id,
      problem_statement_title: problem_statement.title,
      npo_id: npo_id,
      user_id: user.userId
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

  const handleCloseUnhelpCancel = (event) => {
    // They didn't want to stop helping (cancel button pressed)
    ReactPixel.track("Helping: User Canceled Stop Helping");
    ga.event({
      category: "Helping",
      action: "User Canceled Stop Helping",
      label: "Helping",
    });

    setOpenUnhelp(false);
  };

  function getWordStr(str) {
    if( str != null && str.length > 0 && typeof str === "string" )
    {
      return str.split(/\s+/).slice(0, 30).join(" ");
    }
    else {
      return "";
    }
    
  }

  function getIconForReferenceLinkOrName(link, name) {
    const documentExtensions = [".pdf", ".doc", ".docx"];
    for (const extension of documentExtensions) {
        if (link.endsWith(extension)) {
            return <ArticleIcon />;
        }
    }
 
    const documentPlatforms = ["docs.google.com"]; 
    for (const platform of documentPlatforms) {
        if (link.includes(platform)) {
            return <ArticleIcon />;
        }
    }

    // If YouTube is in the name or video is in the name
    const videoIconText = ["youtube", "video"];
    const videoIconLink = ["youtube.com", "vimeo.com"];
    if (videoIconText.some((text) => name.toLowerCase().includes(text)) || videoIconLink.some((text) => link.includes(text))) {
        return <SmartDisplayIcon />;
    }

    // If .pptx or slides.google.com, use a presentation icon
    const presentationExtensions = [".pptx"];
    for (const extension of presentationExtensions) {
        if (link.endsWith(extension)) {
            return <CoPresentIcon />;
        }
    }

    const presentationPlatforms = ["slides.google.com"];
    for (const platform of presentationPlatforms) {
        if (link.includes(platform)) {
            return <CoPresentIcon />;
        }
    }

    // Handle github name or link
    const githubPlatforms = ["github.com"];
    for (const platform of githubPlatforms) {
        if (link.includes(platform)) {
            return <GitHubIcon />;
        }
    }




    // Default to a link icon
    return <OpenInNewIcon />;
    
  }

  function getVideoId(url) {
    // YouTube URL patterns
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) return { platform: 'youtube', id: youtubeMatch[1] };
  
    // Vimeo URL patterns
    const vimeoRegex = /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|))(\d+)(?:[a-zA-Z0-9_\-]+)?/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) return { platform: 'vimeo', id: vimeoMatch[1] };
  
    return null;
  }
  
  function ReferenceItem({ reference }) {
    const isVideoUrl = (url) => {
      return url && (
        url.includes('youtube.com') || 
        url.includes('youtu.be') ||
        url.includes('vimeo.com') ||
        url.includes('loom.com') ||
        url.includes('drive.google.com/file')
      );
    };
  
    if (reference.link && isVideoUrl(reference.link)) {
      return <VideoDisplay url={reference.link} title={reference.name} />;
    }
  
    return (
      <Button
        key={reference.name}
        variant="outlined"
        href={reference.link}
        target="_blank"
        rel="noopener noreferrer"
        style={{ margin: "0.5rem", fontSize: '13px' }}
      >
        {getIconForReferenceLinkOrName(reference.link, reference.name)}
        &nbsp;
        {reference.name}
      </Button>
    );
  }

  var TeamText = "";
  if (hackathonEvents != null) {
    var teamCounter = teams.filter((team) => team.problem_statements?.includes(problem_statement_id)).length;
    // Count the number of teams across all events for this problem statement
    


    
    
    var s = teamCounter === 1 ? "" : "s";
    var is_are = teamCounter === 1 ? " is " : " are ";
    TeamText =
      "There" + is_are + teamCounter + " team" + s + " working on this";
  }

  var status = "";  
  var cardBackground = "#f5f7f77f";

  if (problem_statement.status === "production") {
    status = (
      <Tooltip
        enterTouchDelay={0}
        title={
          <span style={{ fontSize: "14px" }}>We pushed this to production!</span>
        }
        arrow
      >
      <Chip variant="outlined" icon={<WorkspacePremiumIcon />} color="success" label="Live" />      
      </Tooltip>
    );
    cardBackground = "#e5fbe5";

    
  } else {
    status = <Tooltip
      enterTouchDelay={0}
      title={
        <span style={{ fontSize: "14px" }}>This project isn't complete yet, and we need your help!</span>
      }
      arrow
    >
    <Chip icon={<BuildIcon />} color="warning" label="Needs Help" />
    </Tooltip>
  }

  var callToAction = "";
  var helpingSwitch = "";
  var helpingSwitchType = "";

  var countOfHackers = 0;
  var countOfMentors = 0;
  if (problem_statement.helping != null && problem_statement.helping.length > 0) {
    problem_statement.helping.forEach((help) => {
      if (help.type === "mentor") {
        countOfMentors++;
      } else if (help.type === "hacker") {
        countOfHackers++;
      }
    });
  }

  // Read the DB details passed into this component and update the state accordingly
  useMemo(() => {
    if (problem_statement.helping != null && user != null && problem_statement.helping.length > 0) {
      problem_statement.helping.forEach((help) => {
        
        if (help.slack_user === profile.user_id) {          
          setHelpedChecked("checked");
          setHelpingType(help.type);
        }
      });
    }
  }, [problem_statement, user, profile]);

  if (user == null) {     
    // helpingSwitch should set a FormControlLabel and helpingSwitch should show everyting disabled
    helpingSwitch = (
      <FormControlLabel
        labelPlacement="bottom"
        control={
          
        <Tooltip
          enterTouchDelay={0}  
          placement="top-start"       
          title={<span
              style={{ fontSize: "14px" }}
            >Login first, then you can help by sliding this</span>
          }
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
                  onClick={() => redirectToLoginPage(
                    {
                      postLoginRedirectUrl: window.location.href
                    }
                  )}
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

    helpingSwitch = (
      <Tooltip enterTouchDelay={0} title={<span style={{ fontSize: "15px" }}> {help_checked === "checked" ? "Click to stop helping 😭" : "Click to help 😍"} </span>}>
      <FormControlLabel
        onClick={handleClickOpen}
        onChange={handleClickOpen}
        labelPlacement="bottom"        
        control={<MaterialUISwitch sx={{ m: 1 }} checked={help_checked} />}
        label={helpingSwitchType}
      />
      </Tooltip>
    );
  }

  var reference_count = 0;
  var references_buttons = "";
  if (problem_statement.references != null && problem_statement.references.length > 0) {
    reference_count = problem_statement.references.length;
    references_buttons = (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {problem_statement.references.map((reference, index) => (
          <ReferenceItem key={index} reference={reference} />
        ))}
      </Box>
    );
  } else {
    references_buttons = <Typography>No references yet</Typography>;
  }

  var mentorsAddPlural = [];
  var hackersAddPlural = [];

  if (countOfHackers === 0 || countOfHackers > 1) {
    hackersAddPlural[0] = "s";
    hackersAddPlural[1] = "are";
  } else {
    hackersAddPlural[0] = "";
    hackersAddPlural[1] = "is";
  }

  if (countOfMentors === 0 || countOfMentors > 1) {
    mentorsAddPlural[0] = "";
    mentorsAddPlural[1] = "are";
  } else {
    mentorsAddPlural[0] = "";
    mentorsAddPlural[1] = "is";
  }

  const copyProjectLink = "project/"+problem_statement.id;

  const myItems = [
    {
      label: 'Events',
      icon: <EventIcon />,      
      description: <Stack>
        <ShortDescText>
          {hackathonEvents && hackathonEvents.length > 0
            ? `We've hacked on this at ${hackathonEvents.length
            } event${hackathonEvents.length > 1 ? "s" : ""}`
            : "We haven't hacked on this project yet!"}
        </ShortDescText>
        <ShortDescText>{TeamText}</ShortDescText>
      </Stack>,
      content:       
        <Events          
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
    },
    {
      label: 'Description',
      icon: <NotesIcon />,
      description: <Typography fontSize={13}>
        {getWordStr(problem_statement.description)}...
      </Typography>,
      content: 
        <ProjectDescText>
          <ReactMarkdown>
          {problem_statement.description}
          </ReactMarkdown>
        </ProjectDescText>        
    },    
    {
      label: 'Code & Tasks',
      icon: <CodeIcon />,
      description: "GitHub repos and Tasks associated with this project",

      content: 
      <ProjectDescText>
      <Grid container direction="row" spacing={0.5} padding={0}>
        <Stack spacing={1} padding={0.5}>
        {
          problem_statement.github != null &&
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
    },
    {
      label: 'References',
      icon: <ArticleIcon />,
      description: <ShortDescText>
        {reference_count} doc{
          // handle plural vs singular
          (reference_count === 0 || reference_count > 1) ? "s" : ""
          // handle zero records 
        } that will help you better understand the problem
      </ShortDescText>,
      content: <ProjectDescText>{references_buttons}</ProjectDescText>
    },    
  ];

  // Accordion for large screens
  const myAccordion = myItems.map((item) => (
    <Accordion
      expanded={expanded === item.label}
      onChange={handleChange(item.label)}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={item.label + "bh-content"}
        id={item.label + "bh-header"}
      >
        <AccordionTitle>
          {item.icon}
          {item.label}  
        </AccordionTitle>
        {item.description}
      </AccordionSummary>
      <Stack marginLeft={2}>
          {item.content}                    
        </Stack>          
    </Accordion>
  ));

  // Tabs for small screens
  const myTabs = myItems.map((item) => (
    <Tab onClick={handleChange(item.label)} sx={{ width: "50px" }} icon={item.icon} label={item.label} value={item.label} />
  ));

  const myTabPanel = myItems.map((item) => (
    <TabPanel  sx={{ padding:0, margin:0, width: "100%" }} value={item.label}>                    
      {item.content}         
    </TabPanel>
  ));

  const [tabValue, setTabValue] = React.useState('Events');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };


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
            >{`${countOfHackers} hacker${hackersAddPlural[0]} ${hackersAddPlural[1]} hacking`}</span>
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
            >{`${countOfMentors} mentor${mentorsAddPlural[0]} ${mentorsAddPlural[1]} mentoring`}</span>
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
    

    {
      // Add references here
    }
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
    
    
    { 
      isLargeScreen ? 
      <AccordionContainer>
        {myAccordion}
      </AccordionContainer> 
      : 
      <TabContext allowScrollButtonsMobile scrollButtons={true}  value={tabValue}>          
        <TabList allowScrollButtonsMobile scrollButtons={true} onChange={handleTabChange} aria-label="lab API tabs example">              
          {myTabs}                          
        </TabList>
        {myTabPanel}  
      </TabContext>    
    }

    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title" style={{fontSize: '15px'}}>
        Thank you for helping a nonprofit with your talent!
      </DialogTitle>
      <DialogContent>
        <DialogContentText component={"span"} style={{fontSize: '15px'}} id="alert-dialog-description">
          There are several ways to contibute, if you want, when you want.
          <Typography variant="h4">Hacker</Typography>
          You'll be <b>creating</b> something that benefits nonprofits. Most of what
          you do will take place on:
          <ul>
            <li>
              <b>Slack</b> - communication with your team, nonprofits, mentors
            </li>
            <li>
              <b>DevPost</b> - for hackathons this is where you formally submit your projects
            </li>
            <li>
              <b>GitHub</b> - your code must be publically available and well
              documented so that others can use it, all code is open source for the public good
            </li>
            <li>
              <b><Link href="https://heroku.com" target="_blank">Heroku<OpenInNewIcon/></Link> | <Link href="https://fly.io" target="_blank">Fly<OpenInNewIcon/></Link> | <Link href="https://aws.amazon.com/" target="_blank">AWS<OpenInNewIcon/></Link></b> - 
              when you productionalize your code, use something like this to make it available to the masses
            </li>
          </ul>
          <Typography variant="h4">
            Mentor &nbsp;
            <Link
            href="https://www.ohack.org/about/mentors"
            rel="noreferrer"
            target="_blank"
          >
            <Button variant="outlined">More details on mentoring</Button>
          </Link>
          
          </Typography>
          
          
          
          You'll be <b>assisting</b> hackers with their project. Most of what you do
          will take place on:
          <ul>
            <li>
              Slack/In-person - checking in on teams, troubleshooting, giving them guidance, and jumping into a screenshare here
              and there
            </li>            
          </ul>
          As a mentor, your goals are:
          <ul>
            <li>Make sure the team knows the problem they are solving</li>
            <li>...are solving that problem 👆</li>
            <li>
              Are using libraries and are not trying to reinvent the wheel
            </li>
            <li>Are looking at the judging criteria (on DevPost)</li>
            <li>
              Ensure teams have a demo video that describes the problem
              and solution using tools like <Link href="https://www.loom.com/">Loom<OpenInNewIcon/></Link> or <Link href="https://support.apple.com/guide/quicktime-player/record-your-screen-qtp97b08e666/">Quicktime Screen recording<OpenInNewIcon/></Link>.
            </li>
          </ul>          
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          class="button button--compact button--third"
          onClick={handleClose}
          value="hacker"
          autoFocus
        >
          Help as Hacker
        </Button>
        <Button
          class="button button--compact button--third"
          onClick={handleClose}
          value="mentor"
        >
          Help as Mentor
        </Button>
        <Button
          class="button button--compact button--secondary"
          className="error"
          onClick={handleCancel}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>

    <Dialog
      open={openUnhelp}
      onClose={handleCloseUnhelp}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        Helping has completed!
      </DialogTitle>
      <DialogContent>
        <DialogContentText component={"span"} id="alert-dialog-description">
          <h4>What this means</h4>
          You are recording the fact that you're no longer helping this
          nonprofit
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          class="button button--compact button--secondary"
          onClick={handleCloseUnhelpCancel}
        >
          Cancel
        </Button>
        <Button
          class="button button--compact button--red"
          onClick={handleCloseUnhelp}
          autoFocus
        >
          Withdrawl Help
        </Button>
      </DialogActions>
    </Dialog>

    <Dialog
      open={createTeamOpen}
      onClose={handleCloseTeamCreate}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">Create a new team</DialogTitle>
      <DialogContent>
      <b>Team Name Suggestion:</b> {teamSuggestions}

        <DialogContentText component={"span"} id="alert-dialog-description">
          <Stack spacing={2}>
            <TextField
              id="team-name"
              label=<span style={{ fontSize: "15px" }}>Team Name (at least 3 letters)</span>
              helperText=<span style={{ color:"black", fontSize: "14px" }}>A unique team name - we will create a GitHub repo for you</span>
              onChange={handleUpdateTeamName}
              margin="dense"
              FormHelperTextProps={{ style: { fontSize: 12 } }} // font size of helper label
              variant="filled"
            />

            <TextField
              id="slack-name"
              label=<span style={{ fontSize: "15px" }}>Slack Channel (at least 3 letters)</span>
              helperText=<span  style={{ color:"black", fontSize: "14px" }}>Create this public channel first <Link href="https://slack.com/help/articles/201402297-Create-a-channel" target="_blank"><Button variant="text" size="small" >How?</Button></Link></span>
              onChange={handleUpdateSlackChannel}
              margin="dense"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">#</InputAdornment>
                ),
              }}
              FormHelperTextProps={{ style: { fontSize: 12 } }} // font size of helper label
              variant="filled"
            />

            <TextField
              id="github-name"
              label=<span style={{ fontSize: "15px" }}>Github Username</span>
              helperText=<span style={{ color:"black", fontSize: "14px" }}>Enter your Github username (we will make you an admin)</span>
              onChange={handleUpdateGithubUsername}
              margin="dense"
              FormHelperTextProps={{ style: { fontSize: 12 } }} // font size of helper label
              variant="filled"
            />

          </Stack>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Stack container>
        <Stack spacing={2} direction="row">
        <Button
          class="button button--compact button--secondary"
          onClick={handleCloseTeamCreate}
        >
          Cancel
        </Button>
        { ( (newTeamName!== "" && newTeamName.length > 2) &&  (newTeamSlackChannel!=="" && newTeamSlackChannel.length > 2)  ) && <Button        
          class="button button--compact button--third"
          disabled={sendingTeamDetails}
          onClick={handleConfirmTeamCreate}                              
        >
          Submit
          {" "}
          { sendingTeamDetails && 
            <CircularProgress size={20} />
          }
          <Typography variant="body1">Takes ~14 seconds :(</Typography>
        </Button>
        }
        </Stack>
        <Stack spacing={0} direction="row" alignContent={"right"} alignItems={"right"} justifyContent={"right"}>
          <Typography>
            {teamCreationErrorDetails}
          </Typography>      
        </Stack>                
      </Stack>
      </DialogActions>
    </Dialog>

    <Stack spacing={2} direction="row">      
      {false && helpingSwitch
        // FIXME: Hard disable ability to join a team
      }      
      <Box sx={{ width: "75%" }}>{callToAction}</Box>      
    </Stack>
  </ProjectCard>
  );
}