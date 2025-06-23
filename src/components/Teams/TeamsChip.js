import React from "react";
import Chip from "@mui/material/Chip";
import useTeams from "../../hooks/use-teams";
import { memo, useEffect, useState } from "react";
import GroupsIcon from '@mui/icons-material/Groups';
import { Puff } from "react-loading-icons";


export default function TeamsChip({ team_id }) {    
     const { handle_get_team } = useTeams();
    
    const [team, setTeam] = useState(null);
    useEffect(() => {
      handle_get_team(team_id, (data) => {
        setTeam(data);
      });
    }, [team_id]);        

    // Handle if team is null
    if (!team) {
        return <Puff stroke="#0000FF" strokeOpacity={0.5} />;
    }
    
    return (
        <Chip
        style={{marginBottom: '5px', padding: '0px', height: 'auto', width: 'auto'}}
        label={team.name}
        variant="contained"
        icon={<GroupsIcon />}        
        />
    );
  

}
