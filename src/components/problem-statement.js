import React from "react";
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import CancelIcon from '@mui/icons-material/Cancel';
import Tooltip from '@mui/material/Tooltip';
import EventIcon from '@mui/icons-material/Event';
import GroupIcon from '@mui/icons-material/Group';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

export const ProblemStatement = ({ problem_statement }) => {
    
    
    var HackathonText;

    if (problem_statement.events.length > 0)
    {
        var s = problem_statement.events.length > 1 ? "s" : "";
        HackathonText = "We've hacked on this at " + problem_statement.events.length + " event" + s;
    }
    else {
        HackathonText = "We haven't hacked on this project yet!";
    }


    
    return (
    <div className="ohack-feature">    
        <h3 className="ohack-feature__headline">           
            {problem_statement.title}            
        </h3>
        <p>
            {problem_statement.status}
        </p>
        
        <div className="ohack-feature__description">
            Born on: {problem_statement.first_thought_of}
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
        
        

    </div>
    
    );
}
