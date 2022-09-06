import React from "react";
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

import ArticleIcon from '@mui/icons-material/Article';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { AuthenticationButton } from "./buttons/authentication-button";
import { useProfileApi } from "../hooks/use-profile-api";
import { ProjectProgress } from "./project-progress";

import { useState, useMemo } from "react";

import DeveloperModeIcon from '@mui/icons-material/DeveloperMode';
import SupportIcon from '@mui/icons-material/Support';

import DocumentMeta from 'react-document-meta';



export const ProblemStatement = ({ problem_statement, user }) => {
    const [open, setOpen] = useState(false);
    const [openUnhelp, setOpenUnhelp] = useState(false);
    const [help_checked, setHelpedChecked] = useState("");
    const [helpingType, setHelpingType] = useState("");

    const { handle_help_toggle } = useProfileApi();

    
    
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
        handle_help_toggle("helping", problem_statement.id, event.target.value)        
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
        handle_help_toggle("not_helping", problem_statement.id, "")
    };

    const handleCloseUnhelpCancel = (event) => {
        // They didn't want to stop helping (cancel button pressed)
        setOpenUnhelp(false);        
    };

    


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
            <h4>You will need to login with Slack</h4><AuthenticationButton />
            <h4>If you don't have an account, you will need to create an account</h4>
            <button onClick={createSlackAccount} className="button button--primary">
                Create a Slack account
            </button>
            </div>;

        helpingSwitch = <FormControlLabel onChange={handleClickOpen} disabled control={<Switch color="warning" />} labelPlacement="top" label="Login first, then you can help." />;
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

        helpingSwitch = <FormControlLabel onClick={handleClickOpen} onChange={handleClickOpen} labelPlacement="bottom" control={<Switch checked={help_checked} color="warning" />} label={helpingSwitchType} />;
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

    const meta = {
        title: problem_statement.title + " | " + problem_statement.status,
        description: problem_statement.description,
        
        //canonical: 'http://example.com/path/to/page',
        meta: {
            charset: 'utf-8',
            /*
            name: {
                keywords: 'react,meta,document,html,tags'
            },
            */
            name: {
                keywords: 'react,meta,document,html,tags'
            }
        }        
    };

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
    
    // More on meta tags
    // https://medium.com/slack-developer-blog/everything-you-ever-wanted-to-know-about-unfurling-but-were-afraid-to-ask-or-how-to-make-your-e64b4bb9254
    return (    
    <div className="ohack-problemstatement-feature">    
        <h3 className="ohack-feature__headline">           
                {problem_statement.title}&nbsp;{status}                
        </h3>   
            <p>
                <Stack direction="row" spacing={3} alignItems="center">
                    {helpingSwitch}
                    {callToAction}
                </Stack>
            </p>                    
        
        <ProjectProgress state={problem_statement.status} />
                        
        <div className="ohack-feature__description">    
            <br />
            <ChildFriendlyIcon /> Born on <b>{problem_statement.first_thought_of}</b>
            <br />            
            {problem_statement.description}                            
        </div>        
        

        <div>
            <br/>
                <h3>{HackathonText}</h3>                
            
            {problem_statement.events.map(event => {
                return (                    
                    <div key={event.id}>                        
                            <h3><EngineeringIcon /> {event.location} {event.type}</h3>
                            <h5>{event.start_date} <ArrowForwardIosIcon style={{ color: "gray" }} /> {event.end_date}</h5>                            
                            
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
