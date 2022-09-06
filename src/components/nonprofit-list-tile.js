import React from "react";
import { Link } from "react-router-dom";
import TagIcon from '@mui/icons-material/Tag';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import BuildIcon from '@mui/icons-material/Build';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

import { useAuth0 } from "@auth0/auth0-react";


export const NonProfitListTile = ({
    onSelected,
    admin, 
    npo,
    need_help_problem_statement_count,
    in_production_problem_statement_count,
    icon 
    }) => {
    const { user } = useAuth0();

    const JOIN_SLACK_LINK = "https://join.slack.com/t/opportunity-hack/shared_invite/zt-1db1ehglc-2tR6zpmszc5898MhiSxHig";
    

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
        slackDetails = <p className="ohack-feature__callout_mono"><Tooltip title={<span style={{ fontSize: "15px" }}>We don't have an official Slack channel, use this general one to get the dialog going.</span>}><span onClick={openCodeSample}><IconButton><TagIcon />npo-selection</IconButton></span></Tooltip></p>;
    }
    else {
        slackDetails = <p className="ohack-feature__callout_mono">
            <Tooltip title={<span style={{ fontSize: "15px" }}>This is their dedicated channel in Slack</span>}>
                <span onClick={ (event) => openCodeSample(event, npo.slack_channel)}>
                    <IconButton>
                        <TagIcon />{npo.slack_channel}
                    </IconButton>
                </span>
            </Tooltip>
            </p>;    
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
                <span className="ohack-feature__callout">{npo.problem_statements.length} Projects</span>
                <ul className="ohack-feature__list">
                    <li className="ohack-feature__warning"><BuildIcon /> {need_help_problem_statement_count} Need Help</li>
                    <li><WorkspacePremiumIcon /> {in_production_problem_statement_count} Live</li>
                </ul>
                </div>);
        }
    }

    if( admin )
    {       
       return(
        <span>
            <button onClick={() => { onSelected(npo) }}>Edit</button>
            <h3 className="ohack-feature__headline">
                <img
                    className="ohack-feature__icon"
                    src={icon}
                    alt="external link icon"
                />
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
        <Link
            to={`/nonprofit/${npo.id}`}
            className={helping_class}
        >
            {helping_text}
            <h3 className="ohack-feature__headline">
                <img
                    className="ohack-feature__icon"
                    src={icon}
                    alt="external link icon"
                />
                    {npo.name}
            </h3>            
            
            {slackDetails}

            {displayCountDetails()}
                
                
            <br/>
                <p className="ohack-feature__description">{npo.description}</p>
        </Link> 
        );   
    }
    
};
