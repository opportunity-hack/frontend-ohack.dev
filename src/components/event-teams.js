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
import { Tooltip, Typography } from '@mui/material';
import Badge from '@mui/material/Badge';
import Alert from '@mui/material/Alert';
import React, { useRef, useEffect }  from 'react';

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
export default function EventTeams(
    {   teams,    
        user,
        isEventStartDateOlderThanToday,
        userDetails,
        problemStatementId,
        eventId,
        eventStringId,
        constraints,
        onTeamCreate,
        onTeamLeave,        
        onTeamJoin,
        isHelping }) {     
    var teamCounter = 0;       
    
    const myRef = useRef();


    function scrollToComponent() {        
        const targetHash = '#create-team-'+eventStringId+'-'+problemStatementId;
        if (window.location.hash === targetHash ){            
            myRef.current.scrollIntoView();
            myRef.current.focus();
        }
    }

    useEffect( () => scrollToComponent(), [] )
    
    const isUserInAnyTeamListTemp = teams && teams.map(team =>{                
        const isTeamAssociatedToProblemStatement = team?.problem_statements !=null && team.problem_statements?.includes(problemStatementId);
        if (!isTeamAssociatedToProblemStatement )
        {                
            return false;
        }

        teamCounter++;
        
        const result = team.users.map(auser => {            
            var extendedDetails = {};
            if (userDetails != null && auser != null && userDetails[auser] != null ) {                
                extendedDetails["slack_id"] = userDetails[auser]["user_id"];                                
            }                            
            
            if( user == null ) // Only show this to logged in people
            {
                return false;
            }
            else if (extendedDetails && extendedDetails["slack_id"] === user.user_id) {
                return true;
            }
            else {
                console.log("Event Teams: No Slack ID for user, not displaying.");
                return false;
            }
        });
        
        return result;
    });
    
    const isUserInAnyTeamList = [].concat.apply([], isUserInAnyTeamListTemp);
    const isLoggedInUserAlreadyOnTeam = isUserInAnyTeamList.includes(true);
    const handleDeleteClicked = (team) => {
        console.log("Delete Button Clicked");    
        onTeamLeave(team.id)
    };

    const showCreateTeamButton = !isLoggedInUserAlreadyOnTeam && !isEventStartDateOlderThanToday && isHelping && constraints?.max_teams_per_problem > teamCounter;

    // Declare const that will return Alert dialog if constraints.max_teams_per_problem is reached
    const AlertMaxTeamsPerProblem = () => {
        return (
            <Alert severity="warning" style={{margin: 5, fontSize: 13}}>
                <b>We have reached the maximum number of teams per problem statement.</b>
                <br/>
                Head back to the hackathon page to see if there are other problem statements that need help.
                <br/>
                We do this to ensure that every nonprofit has a fair chance of getting a team.
                <br/><br/>
                Once every nonprofit has a team, we will open up more teams.
            </Alert>
        );
    };

    const handleJoinClicked = (team) => {
        console.log("Join Button Clicked");            
        onTeamJoin(team.id);
    };


    const teamsToShow = teams && teams.map(team => {
            const users = team?.users;

            const isTeamAssociatedToProblemStatement = team?.problem_statements != null && team?.problem_statements.includes(problemStatementId);
            
            if (!isTeamAssociatedToProblemStatement) {
                return "";
            }
        
                        
            // This will give a result for each team, e.g. [true, false, false]
            const isUserOnThisTeam = users.map( auser => {
                var extendedDetails = {};

                if (userDetails != null && auser != null && userDetails[auser] != null ) {                
                    extendedDetails["slack_id"] = userDetails[auser]["user_id"];                                
                }
                
                if( user == null )
                {
                    return false;
                }
                else if (extendedDetails && extendedDetails["slack_id"] === user.user_id )
                {
                    return true;
                }
                else 
                {
                    return false;
                }
            })
            const isOnTeam = isUserOnThisTeam.includes(true);            

            
        return (<Team team={team} userDetails={userDetails} isHelping={isHelping} _isOnTeam={isOnTeam} _isOnAnyTeam={isLoggedInUserAlreadyOnTeam} onJoin={handleJoinClicked} onDelete={handleDeleteClicked} />);
    });
    
    
    return (
      <Stack spacing={0}>
        <div
          ref={myRef}
          id={`create-team-${eventStringId}-${problemStatementId}`}
        >
          {constraints?.max_teams_per_problem <= teamCounter && (
            <AlertMaxTeamsPerProblem />
          )}

          {showCreateTeamButton &&
            false && ( // FIXME: Never show the create button just to be sure people use the other way to create a team http://localhost:3000/hack/newteam
              <Button
                style={{
                  marginTop: 5,
                  marginBottom: 5,
                  padding: 10,
                  fontSize: 15,
                }}
                color="success"
                onClick={() => onTeamCreate(problemStatementId, eventId)}
                variant="contained"
              >
                Create Team (and GitHub repo)
              </Button>
            )}
        </div>

        { // FIXME: Hard disable the create team button so that people have to use http://localhost:3000/hack/newteam
        false && !isHelping &&
          !isLoggedInUserAlreadyOnTeam &&
          !isEventStartDateOlderThanToday && (
            <Tooltip
              placement="right"
              enterTouchDelay={0}
              title={
                <span style={{ fontSize: "15px" }}>
                  You need to be helping to create or join a team, slide that »
                  slider below to the right to help. 👇
                </span>
              }
            >
              <Badge color="error" badgeContent="!">
                <Button
                  onClick={() => onTeamCreate(problemStatementId, eventId)}
                  variant="contained"
                  disabled
                >
                  Create Team
                </Button>
              </Badge>
            </Tooltip>
          )}

        {teamCounter > 0 && (
          <div>
            <GroupIcon style={{ color: "blue" }} /> {teamCounter} team
            {teamCounter > 1 || teamCounter === 0 ? "s" : ""}
          </div>
        )}

        <Stack spacing={0}>
          {user && teamsToShow}
          {!user && <Typography>Log in to see teams</Typography>}
        </Stack>
      </Stack>
    );
}    