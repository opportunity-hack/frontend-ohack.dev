import React from "react";
import { useState, useMemo } from "react";

import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import CancelIcon from '@mui/icons-material/Cancel';
import Tooltip from '@mui/material/Tooltip';
import EngineeringIcon from '@mui/icons-material/Engineering';
import GroupIcon from '@mui/icons-material/Group';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Chip from '@mui/material/Chip';
import BuildIcon from '@mui/icons-material/Build';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import ChildFriendlyIcon from '@mui/icons-material/ChildFriendly';
import TagIcon from '@mui/icons-material/Tag';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';
import FormControlLabel from '@mui/material/FormControlLabel';
import { styled } from '@mui/material/styles';

import SupportIcon from '@mui/icons-material/Support';
import Badge from '@mui/material/Badge';

import ArticleIcon from '@mui/icons-material/Article';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import DeveloperModeIcon from '@mui/icons-material/DeveloperMode';

import { useAuth0 } from "@auth0/auth0-react";

import useProfileApi from "../hooks/use-profile-api";
import ProjectProgress from "./project-progress";


import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function ProblemStatement({ problem_statement, user, npo_id }){
    const [open, setOpen] = useState(false);
    const [openUnhelp, setOpenUnhelp] = useState(false);
    const [help_checked, setHelpedChecked] = useState("");
    const [helpingType, setHelpingType] = useState("");

    const { handle_help_toggle } = useProfileApi();

    const { loginWithRedirect } = useAuth0();

    const [expanded, setExpanded] = useState(false);
    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    const MaterialUISwitch = styled(Switch)(({ theme }) => ({
        width: 62,
        height: 34,
        padding: 7,
        '& .MuiSwitch-switchBase': {
            margin: 1,
            padding: 0,
            transform: 'translateX(6px)',
            '&.Mui-checked': {
                color: '#fff',
                transform: 'translateX(22px)',
                '& .MuiSwitch-thumb:before': {
                    backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
                        '#fff',
                    )}" d="M4.375 17.542v-3.584h1.583v3.584Zm3.458 0v-9.25q-1.021.52-1.739 1.385-.719.865-.782 2.198H4.229q.063-1.937 1.427-3.448 1.365-1.51 3.302-1.51H10.5q1.708 0 2.938-1 1.229-1 1.27-2.667h1.084q-.021 1.729-1.052 2.927-1.032 1.198-2.573 1.615v9.75h-1.084v-4.959H8.917v4.959ZM10 5.396q-.688 0-1.156-.469-.469-.469-.469-1.156 0-.667.479-1.136.479-.468 1.146-.468.688 0 1.156.468.469.469.469 1.157 0 .666-.479 1.135T10 5.396Z"/></svg>')`,
                },
                '& + .MuiSwitch-track': {
                    opacity: 1,
                    backgroundColor: '#00AA00',
                },
            },
        },
        '& .MuiSwitch-thumb': {
            backgroundColor: '#FF0000',
            width: 32,
            height: 32,
            '&:before': {
                content: "''",
                position: 'absolute',
                width: '100%',
                height: '100%',
                left: 0,
                top: 0,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20"><path fill="${encodeURIComponent(
                    '#fff',
                )}" d="m4.646 15.646-1.688-1.708L6.917 10 2.958 6.062l1.688-1.708L10.292 10Zm6.75 0-1.688-1.708L13.688 10l-3.98-3.938 1.688-1.708L17.042 10Z"/></svg>')`,
            },
        },
        '& .MuiSwitch-track': {
            opacity: 1,
            backgroundColor: '#FFFF00',
            borderRadius: 20 / 2,
        },
    }));



    const handleClickOpen = (event) => {        
        if (event.target.checked) // Only when selecting yes
        {
            setOpen(true);
        }
        else
        {
            setOpenUnhelp(true);
        }
        
        
    };

    const handleClose = (event) => {
        // They wanted to start helping
        setOpen(false);
        setHelpedChecked("checked")
        setHelpingType(event.target.value);
        // event.target.value will be either "mentor" or "hacker"
        handle_help_toggle("helping", problem_statement.id, event.target.value, npo_id)        
    };

    const handleCancel = (event) => {
        // They didn't want to start helping (cancel button pressed)
        setOpen(false);
        setHelpedChecked("");
        setHelpingType("");
    }


    const handleCloseUnhelp = (event) => {
        // They wanted to stop helping
        setOpenUnhelp(false);
        setHelpedChecked("")
        setHelpingType("");
        handle_help_toggle("not_helping", problem_statement.id, "", npo_id)
    };

    const handleCloseUnhelpCancel = (event) => {
        // They didn't want to stop helping (cancel button pressed)
        setOpenUnhelp(false);        
    };

    
    function getWordStr(str) {
        return str.split(/\s+/).slice(0, 50).join(" ");
    }

    var HackathonText;
    if (problem_statement.events.length > 0)
    {
        var s = problem_statement.events.length > 1 ? "s" : "";
        HackathonText = "We've hacked on this at " + problem_statement.events.length + " event" + s;
    }
    else {
        HackathonText = "We haven't hacked on this project yet!";
    }

    var status = "";
    if (problem_statement.status === "production" )
    {
        status = <Chip icon={<WorkspacePremiumIcon />} color="success" label="Live" />;
    }
    else {
        status = <Chip icon={<BuildIcon />} color="warning" label="Needs Help" />;
    }

    var callToAction = "";
    var helpingSwitch = "";
    var helpingSwitchType = "";
    const JOIN_SLACK_LINK = "https://join.slack.com/t/opportunity-hack/shared_invite/zt-1db1ehglc-2tR6zpmszc5898MhiSxHig";
    const createSlackAccount = () => {
        window.open(
            JOIN_SLACK_LINK,
            "_blank",
            "noopener noreferrer"
        );
    };

    var countOfHackers = 0;
    var countOfMentors = 0;
    var countOfPeopleHelping = 0;
    if (problem_statement.helping != null) {
        problem_statement.helping.forEach(help => {                
            countOfPeopleHelping++;

            if (help.type == "mentor" )
            {
                countOfMentors++;
            }
            else if( help.type == "hacker" )
            {
                countOfHackers++;
            }
        });
    }

    // Read the DB details passed into this component and update the state accordingly
    useMemo(() => {
        if (problem_statement.helping != null && user != null) {            
            problem_statement.helping.forEach(help => {                
                if (help.slack_user === user.sub) {
                    setHelpedChecked("checked")
                    setHelpingType(help.type);
                }
            })
        }
    }, [problem_statement, user]);

    if( user == null)
    {        
        callToAction = <div>
            <Stack spacing={2}>
                <Stack alignItems="center" direction="row" spacing={2}>
                    <Box sx={{ width: '60%' }}>
                        <Typography>We use Slack to collaborate, if you already have an account, login with Slack</Typography>
                    </Box>
                    <button
                        className="button button--primary button--compact"
                        onClick={() => loginWithRedirect({
                            appState: {
                                returnTo: window.location.pathname,
                                redirectUri: window.location.pathname
                            }
                        })}
                    >
                        Log In
                    </button>
                </Stack>
                
                <Stack alignItems="center" direction="row" spacing={2}>
                    <Box sx={{ width: '60%' }}>
                    <Typography>If you don't have an account, you will need to create an account</Typography>
                    </Box>

                    
                    <button onClick={createSlackAccount} className="button button--primary">
                        Create a Slack account
                    </button>                
                </Stack>
            </Stack>
            
            
            </div>;

        helpingSwitch = ""
    }
    else {
        callToAction = <a href={`https://opportunity-hack.slack.com/app_redirect?channel=${problem_statement.slack_channel}`} target="_blank" rel="noreferrer"><button className="button button--compact button--primary">Join <TagIcon />{problem_statement.slack_channel} to help</button></a>;                        
        if( helpingType === "hacker" )
        {
            helpingSwitchType = <div><DeveloperModeIcon />I'm helping as a hacker</div>
        }
        else if( helpingType === "mentor" )
        {
            helpingSwitchType = <div><SupportIcon /> I'm helping as a mentor</div>
        }
        else {
            helpingSwitchType = <span>I want to help</span>
        }

        helpingSwitch = <FormControlLabel onClick={handleClickOpen} onChange={handleClickOpen} labelPlacement="bottom" control={<MaterialUISwitch sx={{ m: 1 }} checked={help_checked} />} label={helpingSwitchType} />;
    }


    var github_buttons = "";    

    if (problem_statement.github != null && problem_statement.github.length > 0 && typeof (problem_statement.github) !== "string" )
    {
        github_buttons = problem_statement.github.map(github => {
            return (<a target="_blank"
                rel="noopener noreferrer"
                key={github.name}
                className="button button--compact button--third"
                href={github.link}>
                {github.name}
            </a>)
        })
    }
    else {
        github_buttons = <p>No Github links yet</p>
    }

    var github_issue_button = "";

    if (problem_statement.github != null && problem_statement.github.length > 0 && typeof (problem_statement.github) !== "string") {
        github_issue_button = problem_statement.github.map(github => {
            return (<a target="_blank"
                rel="noopener noreferrer"
                key={github.name}
                className="button button--compact button--third"
                href={`${github.link}/issues`}>
                {github.name} Tasks
            </a>);
        })
    }
    else {
        github_issue_button = "";
    }

    const render_event_teams = (event) => {
        if( event.teams != null && event.teams.length > 0 )
        {             
            const details = event.teams.map((team) => (                
                <ul key={team.id}>
                    <li>
                        {team.active === "True" ? <Tooltip title={<span style={{ fontSize: "15px" }}>This team is active! Jump into Slack to see if you can help out.</span>}><DirectionsRunIcon style={{ color: "green" }} /></Tooltip> : <Tooltip title={<span style={{ fontSize: "15px" }}>This team is no longer working on this.  You can check out their Slack channel for posterity.</span>}><CancelIcon style={{ color: "red" }} /></Tooltip>}&nbsp;
                        {(() => {
                            if (team.team_number > 0) {
                                return "Team " + team.team_number + " ";
                            }
                        })()}
                        <b>{team.name}</b><br />
                        <font face="Courier">#{team.slack_channel}</font></li>
                </ul>
            ));

            return(
                <p>
                <h5><GroupIcon style={{ color: "blue" }} /> {event.teams.length} team{event.teams.length > 1 ? "s" : ""}</h5>
                {details}
                </p>
            )
        }
        else {
            // We don't have any teams linked to this event yet
            return(<p></p>)
        }        
    }

    var references_buttons = "";
    if( problem_statement.references != null && problem_statement.references.length > 0 )
    {
        references_buttons = problem_statement.references.map(reference => {
            return (
                <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={reference.link}>
                        <Button key={reference.name} className="button button--pad button--third"><ArticleIcon/>&nbsp;
                        {reference.name}
                        </Button>
                </a>);
        });
    }
    else{
        references_buttons = <p>No references yet</p>
    }
    
    var mentorsAddPlural = [];
    var hackersAddPlural = [];

    if (countOfHackers == 0 || countOfHackers > 1 )
    {
        hackersAddPlural[0] = "s";
        hackersAddPlural[1] = "are";
    } else {
        hackersAddPlural[0] = "";
        hackersAddPlural[1] = "is";
    }

    if (countOfMentors == 0 || countOfMentors > 1) {
        mentorsAddPlural[0] = "s";
        mentorsAddPlural[1] = "are";
    } else {
        mentorsAddPlural[0] = "";
        mentorsAddPlural[1] = "is";
    }

    
    return (        
    <div className="ohack-problemstatement-feature">            
                   
        <Stack spacing={3}>                    
                <Stack justifyContent="flex-end" alignItems="flex-start" direction="row" spacing={2}>
                    {status}

                    <Box>
                        <Tooltip title={<span style={{ fontSize: "14px" }}>{`${countOfHackers} hacker${hackersAddPlural[0]} ${hackersAddPlural[1]} hacking`}</span>}>
                            <Badge showZero anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                                badgeContent={countOfHackers} color="secondary" >
                                <DeveloperModeIcon fontSize="large" />
                            </Badge>
                        </Tooltip>
                    </Box>

                    <Box>
                        <Tooltip title={<span style={{ fontSize: "14px" }}>{`${countOfMentors} mentor${mentorsAddPlural[0]} ${mentorsAddPlural[1]} mentoring`}</span>}>
                            <Badge showZero anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                                badgeContent={countOfMentors} color="secondary" >
                                <SupportIcon fontSize="large" />
                            </Badge>
                        </Tooltip>
                    </Box>
                </Stack>

                    <h3 className="ohack-feature__headline">{problem_statement.title}</h3>
                    
                    <Stack spacing={2} direction="row">
                        <Box sx={{ width: '75%' }}>
                        {callToAction}
                        </Box>

                        {helpingSwitch}
                    </Stack>

                <ProjectProgress state={problem_statement.status} />
        </Stack>

        
                        
        <div className="ohack-feature__description">                                        
            <Grid
                container
                direction="row"
                justifyContent="flex-start"
                alignItems="center"
                sx={{ marginTop: 3, marginBottom: 1}}
            >
                <ChildFriendlyIcon /> Born in&nbsp;<b>{problem_statement.first_thought_of}</b>
            </Grid>
            
                <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1bh-content"
                        id="panel1bh-header"
                    >
                        <Typography sx={{ width: '33%', flexShrink: 0 }}>
                            Project Description
                        </Typography>
                        <Typography sx={{ color: 'text.secondary' }}> {getWordStr(problem_statement.description)}...</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {problem_statement.description}   
                    </AccordionDetails>
                </Accordion>                         
        </div>        
        

        <div>
            <br/>
                <h3>{HackathonText}</h3>                
            
            {problem_statement.events.map(event => {
                return (                    
                    <div key={event.id}>                        
                            <h3><EngineeringIcon /> {event.location} {event.type}</h3>
                            <h5>{event.start_date} <ArrowForwardIosIcon style={{ color: "gray" }} /> {event.end_date}</h5>                            
                        
                        <a href={event.devpost_url}><button className="button button--primary button--compact">
                            Register
                        </button></a>
                            {render_event_teams(event)}                               
                            
                    </div>)
            })}
            
        </div>

        <h3>Code</h3>        
        {github_buttons}
        
        <h3>Work Remaining</h3>
        {github_issue_button}


        <h3>References</h3>
        <div>            
            {references_buttons}            
        </div>
        
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                Thank you for helping a nonprofit with your talent!
            </DialogTitle>
            <DialogContent>
                <DialogContentText component={'span'} id="alert-dialog-description">    
                    There are several ways to contibute, if you want, when you want.
                    <h4>Hacker</h4>
                    You'll be creating something that benefits nonprofits.
                    Most of what you do will take place on:
                    <ul>
                        <li><b>Slack</b> - communication with your team,  non-profits, mentors</li>
                        <li><b>DevPost</b> - for hackathons this is the main landing place for your project</li>
                        <li><b>GitHub</b> - your code must be publically available and well documented so that others can use it</li>
                        <li><b>Heroku</b> - when you productionalize your code, use Heroku as one of the easiest ways to make it available to the masses</li>
                    </ul>
                    
                    <h4>Mentor</h4>  
                    You'll be assisting hackers with their project.
                    Most of what you do will take place on:
                    <ul>
                        <li>Slack - checking in on teams and jumping into a screenshare here and there</li>
                    </ul>

                    Your goals are:
                    <ul>
                    <li>Make sure the team knows the problem they are solving</li>
                        <li>...are solving that problem 👆</li>
                        <li>Are using libraries and are not trying to reinvent the wheel</li>
                        <li>Are looking at the judging criteria (on DevPost)</li>
                        <li>Have a demo video that is 4 minutes that describes the problem and solution using tools like Loom or Quicktime.</li>
                    </ul>
                    <a href="https://www.ohack.org/about/mentors" rel="noreferrer" target="_blank">More details on mentoring</a>

                </DialogContentText>
            </DialogContent>
            <DialogActions>                          
                <Button class="button button--compact button--third" onClick={handleClose} value="hacker" autoFocus>Help as Hacker</Button>
                    <Button class="button button--compact button--third" onClick={handleClose} value="mentor">Help as Mentor</Button>
                    <Button class="button button--compact button--secondary" className="error" onClick={handleCancel}>Cancel</Button>
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
                <DialogContentText component={'span'} id="alert-dialog-description">                    
                    <h4>What this means</h4>
                    You are recording the fact that you're no longer helping this nonprofit                    

                </DialogContentText>
            </DialogContent>
            <DialogActions>
                    <Button class="button button--compact button--secondary" onClick={handleCloseUnhelpCancel}>Cancel</Button>
                    <Button class="button button--compact button--red" onClick={handleCloseUnhelp} autoFocus>Withdrawl Help</Button>                    
            </DialogActions>
        </Dialog>    
    </div>

    
    );
}
