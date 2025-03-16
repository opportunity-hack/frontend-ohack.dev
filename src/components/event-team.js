import { 
    useState, 
    // useMemo, 
    useEffect } from "react";

import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';

import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

import CancelIcon from '@mui/icons-material/Cancel';

import Stack from '@mui/material/Stack';
import Image from 'next/image'
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Puff } from 'react-loading-icons';
import { Typography } from "@mui/material";
import GitHubIcon from '@mui/icons-material/GitHub';
import Link from 'next/link';

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
                setJoinOrLeaveTeam(
                <Tooltip placeholder="bottom-end" title={<span style={{ fontSize: "15px" }}>Join a team (only join one team please)</span>}>
                    <Button style={{padding:3, margin:2}} onClick={handleJoin} variant="outlined" color="success"><PersonAddIcon fontSize="medium" color="success" />&nbsp;Join Team</Button>              
                </Tooltip>
                );
            }
                
            
        }
        else if (isOnTeam) {
            if (isHelping) {
            setJoinOrLeaveTeam(
            <Tooltip placeholder="bottom-end" title={<span style={{ fontSize: "15px" }}>Leave this team</span>}>
                <Button value={team} style={{padding:3, margin:2}} onClick={handleLeave} variant="outlined" color="success"><PersonRemoveIcon fontSize="medium" color="error" />&nbsp;Leave Team</Button>              
            
            </Tooltip>
            );
            }
        }
    
    }, [team, isOnTeam, isOnAnyTeam, isHelping]);

    const userIcons = team.users.map(auser => {
        var extendedDetails = {};
        if (userDetails != null && auser != null) {                
            extendedDetails = userDetails[auser];            
        }        

        return (
            <Stack             
             direction="row" alignItems="center" spacing={1}
                key={auser}
             >
                { extendedDetails && <Image className="ohack-feature__icon"
                    alt={extendedDetails.name}                    
                    src={extendedDetails.profile_image}
                    width={50}
                    height={50} />
                }

                {
                    !extendedDetails && <Puff stroke="#000000" fill="#000000" />
                }

                <div>{extendedDetails?.name}</div>
            </Stack>
        )
    });

    console.log("    == Event Team Render")
    return(
        <ul key={team.id} style={{margin: '0px'}}>
            <li id={team.id}>
                {team.active === "True" ?
                    <Tooltip title={<span style={{ fontSize: "15px" }}>This team is active with {countOfPeopleOnTeam} {peoplePersonString}! Jump into Slack to see if you can help out.</span>}>
                        <StyledBadge showZero badgeContent={countOfPeopleOnTeam} sx={{ "& .MuiBadge-badge": { fontSize: 12, } }} color="primary"><DirectionsRunIcon style={{ color: "green" }} /></StyledBadge></Tooltip> :
                    <Tooltip title={<span style={{ fontSize: "15px" }}>This team is no longer working on this.  You can check out their Slack channel for posterity.</span>}>
                        <CancelIcon style={{ color: "red" }} /></Tooltip>}&nbsp;
                {(() => {
                    if (team.team_number > 0) {
                        return "Team " + team.team_number + " ";
                    }
                })()}
                
                {(() => {
                    if (team.github_links.length > 0) {
                        return team.github_links.map((link) => {
                            if (link.link != null && link.link !== "")
                            {
                                return <Link 
                                key={link.name}
                                href={link.link} target="_blank"  ><GitHubIcon style={{ color: "black", marginLeft: 2, marginRight: 2 }} /></Link>
                            }                            
                        });
                                                
                    }
                })()}
                

                    <Typography style={{ fontSize: 18 }} variant="caption">{team.name} <font face="Courier"><Link href={`https://opportunity-hack.slack.com/app_redirect?channel=${team.slack_channel}`} target="_blank">#{team.slack_channel}</Link></font> {joinOrLeaveTeam}</Typography>
                <div>
                        {isOnTeam && <b><CheckCircleIcon sx={{color: 'green'}}/>You are on this team</b>}
                        {userIcons}                        
                </div>
            </li>
        </ul>
    
)

}

