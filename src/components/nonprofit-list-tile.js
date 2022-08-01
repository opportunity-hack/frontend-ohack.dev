import React from "react";
import { Link } from "react-router-dom";
import TagIcon from '@mui/icons-material/Tag';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import BuildIcon from '@mui/icons-material/Build';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';



export const NonProfitListTile = ({
    onSelected,
    admin, 
    npo,
    need_help_problem_statement_count,
    in_production_problem_statement_count,
    icon 
    }) => {
    
    const JOIN_SLACK_LINK = "https://join.slack.com/t/opportunity-hack/shared_invite/zt-1db1ehglc-2tR6zpmszc5898MhiSxHig";
    
    const openCodeSample = (e) => {    
        e.preventDefault();
    window.open(
        JOIN_SLACK_LINK,
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
        slackDetails = <p className="ohack-feature__callout_mono"><Tooltip title={<span style={{ fontSize: "15px" }}>This is their dedicated channel in Slack</span>}><span onClick={openCodeSample}><IconButton><TagIcon />{npo.slack_channel}</IconButton></span></Tooltip></p>;
    }

    const displayCountDetails = () => {

        if (npo.problem_statements.length === 0)
        {
            return (<div><span className="ohack-feature__callout">No Projects Yet!</span></div>);
        }
        else{
            return (<div><span className="ohack-feature__callout">{npo.problem_statements.length} Projects</span>
                <ul className="ohack-feature__list">
                    <li className="ohack-feature__warning"><BuildIcon /> {need_help_problem_statement_count} Need Help</li>
                    <li><WorkspacePremiumIcon /> {in_production_problem_statement_count} Live</li>
                </ul></div>);
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
            className="ohack-feature"
        >
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
