/*
import Tooltip from '@mui/material/Tooltip';
import Badge from '@mui/material/Badge';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { styled } from '@mui/material/styles';
*/

// import IconButton from '@mui/material/IconButton';
import GroupIcon from '@mui/icons-material/Group';
// import Image from 'next/image'
import Stack from '@mui/material/Stack';
// import { useState, useMemo, useEffect } from "react";
import Button from '@mui/material/Button';
import Team from './event-team';
// import next from 'next';

/*

This component should render each team

problem-statement.js -> events.js -> event-teams.js

Use Case 1: No teams
[ Event ]
 [ Create Team Button ]

Use Case 2: One team created by the same person who is logged in
[ Event ]
 1 Team
 [ Team ] -
Where - is the button to remove yourself from the team

Use Case 3: One team not created by the person who is logged in
[ Event ]
 1 Team
 [ Team ] +
 [ Create Team Button ]
Where + is the button to add yourself to that team
And [ Create Team button ] allows you to create a new team (and join that team)

Use Case 4: There are three teams created, and the logged in user is on the first team
[ Event ]
  3 Teams
  [ Team ] -
  [ Team ]
  [ Team ]

*/

/* 
TODO: Potential Design Flaw
1. Events have teams - hacker teams that are working during that event
2. Teams have users - users are hackers working on a team
3. Our nonprofit pages print problem statements, and we don't have a direct mapping from problem statement to team
4. This means we have to print the events where we worked on that problem statement, and have to filter the teams from that event to only give us the teams that worked on that problem

nonprofits -> problem_statements
problem_statements -> events
events -> teams 
teams -> users

teams -> problem_statements

*/
export default function EventTeams({ teams, user, problemStatementId, eventId, onTeamCreate, onTeamLeave, onTeamCreateComplete, onTeamJoin, isHelping }) { 
    console.log("=== EventTeams ")
    var teamCounter = 0;
    
    // TODO: Use?
    /*
    var userId = "";
    if( user != null )
    {
        userId = user.sub;
    }
    */
    
    const isUserInAnyTeamListTemp = teams.map(team =>{        
        const isTeamAssociatedToProblemStatement = team.problem_statements !=null && team.problem_statements.includes(problemStatementId);
        if (!isTeamAssociatedToProblemStatement )
        {
                
            return false;
        }

        teamCounter++;
        
        const result = team.users.map(auser => {
            if( user == null )
            {
                return false;
            }
            else if (auser["slack_id"] === user.sub) {
                return true;
            }
            else {
                return false;
            }
        });
        
        return result;
    });
    
    const isUserInAnyTeamList = [].concat.apply([], isUserInAnyTeamListTemp);
    const isLoggedInUserAlreadyOnTeam = isUserInAnyTeamList.includes(true);
       

    const handleDeleteClicked = (team) => {
        console.log("Delete Button Clicked");
        console.log(team);
        onTeamLeave(team.id)
    };


    const handleJoinClicked = (team) => {
        console.log("Join Button Clicked");        
        console.log(team);       
        onTeamJoin(team.id);
    };


    const teamsToShow = teams.map(team => {
            const users = team.users;

            const isTeamAssociatedToProblemStatement = team.problem_statements != null && team.problem_statements.includes(problemStatementId);
            if (!isTeamAssociatedToProblemStatement) {
                return "";
            }

            
            // This will give a result for each team, e.g. [true, false, false]
            const isUserOnThisTeam = users.map( auser => {
                if( user == null )
                {
                    return false;
                }
                else if (auser["slack_id"] === user.sub )
                {
                    return true;
                }
                else 
                {
                    return false;
                }
            })
            const isOnTeam = isUserOnThisTeam.includes(true);            

            
        return (<Team team={team} isHelping={isHelping} _isOnTeam={isOnTeam} _isOnAnyTeam={isLoggedInUserAlreadyOnTeam} onJoin={handleJoinClicked} onDelete={handleDeleteClicked} />);
    });
    

    console.log("  == Event Teams Render")
    return(                        
            <Stack spacing={0.5}>
            {isHelping && !isLoggedInUserAlreadyOnTeam && !onTeamCreateComplete && <Button onClick={() => onTeamCreate(problemStatementId, eventId)} variant="contained">Create Team</Button>}
            {teamCounter > 0 && <div><GroupIcon style={{ color: "blue" }} /> {teamCounter} team{teamCounter > 1 || teamCounter == 0 ? "s" : ""}</div> }
                        
            {teamsToShow}
            {onTeamCreateComplete && <Team team={onTeamCreateComplete} _isOnTeam={true} _isOnAnyTeam={true} onJoin={handleJoinClicked} onDelete={handleDeleteClicked} /> }
            </Stack>
        
    )
}    