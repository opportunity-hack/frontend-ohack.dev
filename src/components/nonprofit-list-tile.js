import React from "react";
import Link from "next/link";
import TagIcon from '@mui/icons-material/Tag';
// import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';

import AddAlertIcon from '@mui/icons-material/AddAlert'; 
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

import SupportIcon from '@mui/icons-material/Support';
import DeveloperModeIcon from '@mui/icons-material/DeveloperMode';
import Badge from '@mui/material/Badge';


import { useAuth0 } from "@auth0/auth0-react";

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';



export default function NonProfitListTile({
    onSelected,
    admin, 
    npo,
    need_help_problem_statement_count,
    in_production_problem_statement_count,
    hacker_count,
    mentor_count,
    icon
    })
    {
    const { user } = useAuth0();

    // const JOIN_SLACK_LINK = "https://join.slack.com/t/opportunity-hack/shared_invite/zt-1db1ehglc-2tR6zpmszc5898MhiSxHig";
    


    var number_of_problem_statements_helping_with = 0;
    

    const openCodeSample = (e, channel) => {    
        e.preventDefault();
    window.open(
        `https://opportunity-hack.slack.com/app_redirect?channel=${channel}`,
        "_blank",
        "noopener noreferrer"
        );
    };
    
    var slackDetails = "";
    if( npo.slack_channel == null || npo.slack_channel === "" )
    {                
        slackDetails = <Tooltip title={<span style={{ fontSize: "15px" }}>We don't have an official Slack channel, join this general one to get the dialog going.</span>}>
            <Button onClick={(event) => openCodeSample(event, "npo-selection")} color="secondary" startIcon={<TagIcon />} variant="outlined" size="medium">
                npo-selection
            </Button>
        </Tooltip>; 
        
        
    }
    else {
        slackDetails = 
            <Tooltip title={<span style={{ fontSize: "15px" }}>Join their dedicated channel in Slack</span>}>
            <Button onClick={(event) => openCodeSample(event, npo.slack_channel)} color="secondary" startIcon={<TagIcon />} variant="outlined" size="medium">            
                {npo.slack_channel}
            </Button>
            </Tooltip>;    
    }


    if( npo.problem_statements != null && user != null && npo.problem_statements.length > 0 )
    {
        npo.problem_statements.forEach(ps => {            
            if (ps.helping != null) {
                ps.helping.forEach(helping => {
                    if (helping.slack_user === user.sub) {
                        number_of_problem_statements_helping_with++;
                    }
                });
            }            
        })
    }

    var helping_text = "";
    var helping_class = "ohack-nonprofit-feature";
    if (number_of_problem_statements_helping_with > 0 )
    {
        helping_text = <center><em>You're helping here!</em></center>
        helping_class = "ohack-nonprofit-feature-helping";
    }

    const displayCountDetails = () => {

        if (npo.problem_statements.length === 0)
        {
            return (<div><span className="ohack-feature__callout">No Projects Yet!</span></div>);
        }
        else{
            return (
                <div>
                    <h2 className="ohack-feature__callout">{npo.problem_statements.length} Project{npo.problem_statements.length > 1 ? "s" : ""}</h2>
               
                <Box sx={{ flexGrow: 1, marginTop: 3, marginBottom: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={7}>
                            <Badge
                                showZero                                     
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'left',
                                }}
                                        badgeContent={need_help_problem_statement_count} color="error">
                                    <AddAlertIcon color="error" fontSize="large" />
                            </Badge>Need Help
                        </Grid>
                        <Grid item xs={5}>
                            <Badge showZero anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                                }}
                                    badgeContent={hacker_count} color="secondary">
                                    <DeveloperModeIcon fontSize="large" />
                            </Badge>
                                Hackers
                        </Grid>  
                        <Grid item xs={7}>
                            <Badge
                                showZero
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'left',
                                }}
                                    badgeContent={in_production_problem_statement_count} color="success">
                                    <WorkspacePremiumIcon color="success" fontSize="large" />
                            </Badge>Live

                        </Grid>
                        <Grid item xs={5}>
                            <Badge
                                showZero
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'left',
                                }}
                                badgeContent={mentor_count} color="secondary">
                                <SupportIcon fontSize="large" />
                            </Badge>Mentors</Grid>
                    </Grid>          
                </Box>

                </div>);
        }
    }

    if( admin )
    {       
       return(
        <span>
            <button onClick={() => { onSelected(npo) }}>Edit</button>
            <h3 className="ohack-feature__headline"><img
                    className="ohack-feature__icon"
                    src={icon}
                    alt="external link icon"/>
                   {npo.name}
            </h3>
            {slackDetails}
            <p className="ohack-feature__callout">{npo.problem_statements.length} Projects</p>
            <p className="ohack-feature__description">{ npo.description }</p>
            </span>
       );
    
    }
    else {
        return(
        <Link href={`/nonprofit/${npo.id}`}>
            
            <span className={helping_class}>                
            {helping_text}
                
            <h3 className="ohack-feature__headline"><img
                    className="ohack-feature__icon"
                    src={icon}
                    alt="external link icon"/>{npo.name}</h3>
            {displayCountDetails()}
                       
            <p className="ohack-feature__description">{npo.description}</p>                
                <Grid                    
                    container
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                    sx={{marginTop:2}}
                >
                    {slackDetails}
                </Grid>

            </span>
                
        </Link> 
        );   
    }
    
};
