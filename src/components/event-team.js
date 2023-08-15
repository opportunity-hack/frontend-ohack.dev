import { 
    useState, 
    // useMemo, 
    useEffect } from "react";

import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import Badge from '@mui/material/Badge';

import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

import IconButton from '@mui/material/IconButton';
import CancelIcon from '@mui/icons-material/Cancel';

import Stack from '@mui/material/Stack';
import Image from 'next/image'
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        right: 30,
        top: 10,
        border: `1px solid black`,
        padding: '0 2px',
    },
}));



export default function EventTeam({ team, userDetails, _isOnTeam, _isOnAnyTeam, onJoin, onDelete, isHelping }) {    
    const countOfPeopleOnTeam = team.users.length;
    
    const [isOnTeam, setOnTeam] = useState(_isOnTeam);
    const [isOnAnyTeam, setOnAnyTeam] = useState(_isOnAnyTeam);
    const [joinOrLeaveTeam, setJoinOrLeaveTeam] = useState();

    useEffect( () => {
        setOnAnyTeam(_isOnAnyTeam);
    }, [_isOnAnyTeam, isHelping])

    useEffect(() => {
        setOnTeam(_isOnTeam);
    }, [_isOnTeam, isHelping])

    
    

    var peoplePersonString = "hacker";
    if (countOfPeopleOnTeam === 0 || countOfPeopleOnTeam >= 2) {
        peoplePersonString = "hackers";
    }

    const handleJoin = () => {
        onJoin(team);
        setOnAnyTeam(true);
        setOnTeam(true);        
    }

    const handleLeave = () => {
        onDelete(team);
        setOnAnyTeam(false);
        setOnTeam(false);
    }

    useEffect(() => {                    

        // TODO: Why are we caching markup here? We should probably disabling/enabling hiding/showing these buttons based on the values of isOnAnyTeam, isHelping, and isOnTeam
        if (!isOnAnyTeam )
        {        
            if (isHelping)
            {
                setJoinOrLeaveTeam(<IconButton onClick={handleJoin} edge="end" aria-label="comments">
                    <PersonAddIcon fontSize="large" color="success" />
                </IconButton>);
            }
                
            
        }
        else if (isOnTeam) {
            if (isHelping) {
            setJoinOrLeaveTeam(<IconButton value={team} onClick={handleLeave} edge="end" aria-label="comments">
                <PersonRemoveIcon fontSize="large" color="error" />
            </IconButton>);
            }
        }
    
    }, [team, isOnTeam, isOnAnyTeam, isHelping]);

    const userIcons = team.users.map(auser => {
        var extendedDetails = {};
        if (userDetails != null && auser != null) {                
            extendedDetails = userDetails[auser];
            console.log("Profile Image: " + extendedDetails.profile_image);
        }

        return (
            <Stack direction="row" alignItems="center" spacing={1}>
                <Image className="ohack-feature__icon"
                    src={extendedDetails.profile_image}
                    width={50}
                    height={50} />

                <div>{extendedDetails.name}</div>
            </Stack>
        )
    });

    console.log("    == Event Team Render")
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
                    <b>{team.name}</b> <font face="Courier">#{team.slack_channel}</font> {joinOrLeaveTeam}<br />
                <div>
                        {isOnTeam && <b><CheckCircleIcon sx={{color: 'green'}}/>You are on this team</b>}
                        {userIcons}                        
                </div>
            </li>


        </ul>
    </div>
)

}

