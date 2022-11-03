
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import Badge from '@mui/material/Badge';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import IconButton from '@mui/material/IconButton';
import GroupIcon from '@mui/icons-material/Group';
import Image from 'next/image'
import Stack from '@mui/material/Stack';


const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        right: 30,
        top: 10,
        border: `1px solid black`,
        padding: '0 2px',
    },
}));

export default function EventTeams({ teams, user, problemStatementId }) {    
    var teamCounter = 0;

    const handleDeleteClicked = () => {
        console.log("Delete Button Clicked");
    };


    const allTeams = teams.map(team => {
        const countOfPeopleOnTeam = team.users.length;
        var peoplePersonString = "hacker";
        if (countOfPeopleOnTeam >= 2) {
            peoplePersonString = "hackers";
        }

        const isTeamAssociatedToProblemStatement = team.problem_statements.includes(problemStatementId);
        if ( !isTeamAssociatedToProblemStatement )
        {
            return("");
        }

        teamCounter++;
        
        const isUserOnTeam = team.users.map(auser => {
                if( user == null )
                {
                    return false;
                }

                if (auser["slack_id"] === user.sub)
                {
                    return (
                        <IconButton onClick={handleDeleteClicked} edge="end" aria-label="comments">
                            <PersonRemoveIcon />
                        </IconButton>
                        );
                }
            });

        const userIcons = team.users.map(auser => {
           return(
            <Stack direction="row" alignItems="center" spacing={1}>
                <Image className="ohack-feature__icon"
                   src={auser.profile_image}          
                   width={50}
                   height={50} />
                
                   <div>{auser.name}</div>
            </Stack>
           )          
        });
        
        return(
            <div>                              
                <ul key={team.id}>
                    <li>
                        {team.active === "True" ?
                            <Tooltip title={<span style={{ fontSize: "15px" }}>This team is active with {countOfPeopleOnTeam} {peoplePersonString}! Jump into Slack to see if you can help out.</span>}>
                                <StyledBadge badgeContent={countOfPeopleOnTeam} color="primary"><DirectionsRunIcon style={{ color: "green" }} /></StyledBadge></Tooltip> :
                            <Tooltip title={<span style={{ fontSize: "15px" }}>This team is no longer working on this.  You can check out their Slack channel for posterity.</span>}>
                                <CancelIcon style={{ color: "red" }} /></Tooltip>}&nbsp;
                        {(() => {
                            if (team.team_number > 0) {
                                return "Team " + team.team_number + " ";
                            }
                        })()}
                        <b>{team.name}</b> <font face="Courier">#{team.slack_channel}</font> {isUserOnTeam}<br />
                        <div>
                        {userIcons}
                        </div>
                    </li>

                        
                </ul>
            </div>
        )
    })

/*
const render_event_teams = (problemStatementId, event) => {
    console.log("===> I GET HERE");
    if (event.teams != null && event.teams.length > 0) {
        var teamCounter = 0;
        const details = event.teams.map((team) => {
            const countOfPeopleOnTeam = team.users.length;
            var peoplePersonString = "hacker";
            if (countOfPeopleOnTeam >= 2) {
                peoplePersonString = "hackers";
            }
            console.log(team);

            useMemo(() => {
                const isLoggedInUserAlreadyOnTeam = team.users.map(auser => {
                    return user != null && (user.sub === auser.slack_id)
                });
                setAbleToCreateTeam(!isLoggedInUserAlreadyOnTeam);


            }, [user]);


    
            


            if (team.problem_statements.length > 0 && team.problem_statements.includes(problemStatementId)) {
                teamCounter++;


                return (
                    <ul key={team.id}>
                        <li>
                            {team.active === "True" ?
                                <Tooltip title={<span style={{ fontSize: "15px" }}>This team is active with {countOfPeopleOnTeam} {peoplePersonString}! Jump into Slack to see if you can help out.</span>}>
                                    <StyledBadge badgeContent={countOfPeopleOnTeam} color="primary"><DirectionsRunIcon style={{ color: "green" }} /></StyledBadge></Tooltip> :
                                <Tooltip title={<span style={{ fontSize: "15px" }}>This team is no longer working on this.  You can check out their Slack channel for posterity.</span>}>
                                    <CancelIcon style={{ color: "red" }} /></Tooltip>}&nbsp;
                            {(() => {
                                if (team.team_number > 0) {
                                    return "Team " + team.team_number + " ";
                                }
                            })()}
                            <b>{team.name}</b><br />
                            <font face="Courier">#{team.slack_channel}</font></li>
                    </ul>
                );
            }
            else {
                return ("");
            }

        });

        if (teamCounter > 0) {
            return (
                <p>
                    <h5><GroupIcon style={{ color: "blue" }} /> {event.teams.length} team{event.teams.length > 1 ? "s" : ""}</h5>
                    {details}
                </p>
            );
        }
        else {
            return ("");
        }

    }
    else {
        // We don't have any teams linked to this event yet
        return (<p></p>)
    }
}
*/

return(
    <div>
        <h5><GroupIcon style={{ color: "blue" }} /> {teamCounter} team{teamCounter > 1 || teamCounter == 0 ? "s" : ""}</h5>
        {allTeams}
    </div>
    );

}