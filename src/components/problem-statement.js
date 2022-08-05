import React from "react";
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import CancelIcon from '@mui/icons-material/Cancel';
import Tooltip from '@mui/material/Tooltip';
import EventIcon from '@mui/icons-material/Event';
import GroupIcon from '@mui/icons-material/Group';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Chip from '@mui/material/Chip';
import BuildIcon from '@mui/icons-material/Build';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import AnimationIcon from '@mui/icons-material/Animation';
import ChildFriendlyIcon from '@mui/icons-material/ChildFriendly';
import TagIcon from '@mui/icons-material/Tag';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';
import FormControlLabel from '@mui/material/FormControlLabel';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { AuthenticationButton } from "./buttons/authentication-button";




export const ProblemStatement = ({ problem_statement, user }) => {
    const [open, setOpen] = React.useState(false);
    
    const handleClickOpen = (event) => {        
        if (event.target.checked) // Only when selecting yes
        {
            setOpen(true);
        }
        
    };

    const handleClose = (event) => {           
        setOpen(false);
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
    const JOIN_SLACK_LINK = "https://join.slack.com/t/opportunity-hack/shared_invite/zt-1db1ehglc-2tR6zpmszc5898MhiSxHig";
    const createSlackAccount = () => {
        window.open(
            JOIN_SLACK_LINK,
            "_blank",
            "noopener noreferrer"
        );
    };
    if( user == null)
    {
        callToAction = <div>
            <h4>You will need to login with Slack</h4><AuthenticationButton />
            <h4>If you don't have an account, you will need to create an account</h4>
            <button onClick={createSlackAccount} className="button button--primary">
                Create a Slack account
            </button>
            </div>;

        helpingSwitch = <FormControlLabel onChange={handleClickOpen} disabled control={<Switch color="warning" />} label="Login first, then you can help." />;
    }
    else {
        callToAction = <button className="button button--compact button--primary">Join <TagIcon />{problem_statement.slack_channel} to help</button>;
        helpingSwitch = <FormControlLabel onChange={handleClickOpen} control={<Switch color="warning" />} label="I'm helping" />;
    }

    
    return (
    <div className="ohack-feature">    
        <h3 className="ohack-feature__headline">           
                {problem_statement.title}&nbsp;&nbsp;<div align="center">{status}<Stack direction="row" spacing={1} alignItems="center">
                    {helpingSwitch}
                </Stack></div>
        </h3>            

        <p>                        
            {callToAction}
        </p>            
            
        <div className="ohack-feature__description">
                <AnimationIcon />{problem_statement.status} <ChildFriendlyIcon /> Born on <b>{problem_statement.first_thought_of}</b>
            <br /><br />
            {problem_statement.description}
            <br />                        
        </div>        

        <div>
            <br/>
                <h3>{HackathonText}</h3>
            
            {problem_statement.events.map(event => {
                return (                    
                    <div key={event.id}>                        
                            <h3><EventIcon /> {event.location} {event.type}</h3>
                            <h5>{event.start_date} <ArrowForwardIosIcon style={{ color: "gray" }} /> {event.end_date}</h5>
                            <h5><GroupIcon style={{ color: "blue" }} /> {event.teams.length} team{event.teams.length > 1 ? "s" : ""}</h5>
                            
                                {event.teams.map((team) => (
                                    <ul key={team.id}>
                                        <li>
                                            {team.active === "True" ? <Tooltip title={<span style={{ fontSize: "15px" }}>This team is active! Jump into Slack to see if you can help out.</span>}><DirectionsRunIcon style={{ color: "green" }} /></Tooltip> : <Tooltip title={<span style={{ fontSize: "15px" }}>This team is no longer working on this.  You can check out their Slack channel for posterity.</span>}><CancelIcon style={{ color: "red" }} /></Tooltip>}&nbsp;
                                            {(() => {
                                                if (team.team_number > 0) {
                                                    return "Team " + team.team_number + " ";
                                                }
                                            })()}
                                            <b>{team.name}</b><br/>
                                        <font face="Courier">#{team.slack_channel}</font></li>
                                    </ul>
                                ))}                                
                            

                    </div>)
            })}
            
        </div>

        <h3>Code</h3>        
        {
            problem_statement.github.map(github => {
                return (<a target="_blank"
                    rel="noopener noreferrer"
                    key={github.name}
                    className="button button--secondary"
                    href={github.link}>
                    {github.name}
                    </a>)
            })
        }
                
        <h3>References</h3>
        {
            problem_statement.references.map(reference => {
                return (<a 
                    target="_blank"
                    rel="noopener noreferrer" 
                    key={reference.name} 
                    className="button button--secondary" 
                    href={reference.link}>
                    {reference.name}
                    </a>)
            })
        }
        
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
                <Button onClick={handleClose} autoFocus>Got it!</Button>                
            </DialogActions>
        </Dialog>
        

    </div>
    
    );
}
