import React from "react";
import { Link } from "react-router-dom";
import TagIcon from '@mui/icons-material/Tag';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import BuildIcon from '@mui/icons-material/Build';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

export const NonProfitListTile = ({ id, 
    admin, title, 
    count_problem_statements, need_help_problem_statement_count, in_production_problem_statement_count, 
    description, slack_channel, resourceUrl, icon }) => {
    
    
    


    const displayCountDetails = () => {

        if (count_problem_statements === 0)
        {
            return (<div><span className="ohack-feature__callout">No Projects Yet!</span></div>);
        }
        else{
            return (<div><span className="ohack-feature__callout">{count_problem_statements} Projects</span>
                <ul className="ohack-feature__list">
                    <li className="ohack-feature__warning"><BuildIcon /> {need_help_problem_statement_count} Need Help</li>
                    <li><WorkspacePremiumIcon /> {in_production_problem_statement_count} Live</li>
                </ul></div>);
        }
    }

    if( admin )
    {       
       return(
        <div>
            <h3 className="ohack-feature__headline">
                <img
                    className="ohack-feature__icon"
                    src={icon}
                    alt="external link icon"
                />
                {title}
            </h3>
            <p className="ohack-feature__callout_mono"><Tooltip title="This is their dedicated channel in Slack">
                <IconButton>
                    <TagIcon />
                </IconButton>
            </Tooltip>{slack_channel}</p>
            <p className="ohack-feature__callout">{count_problem_statements} Projects</p>
            <p className="ohack-feature__description">{description}</p>
           
        </div>
       );
    
    }
    else {
        return(
        <Link

            to={resourceUrl}
            className="ohack-feature"
        >
            <h3 className="ohack-feature__headline">
                <img
                    className="ohack-feature__icon"
                    src={icon}
                    alt="external link icon"
                />
                {title}
            </h3>
            <p className="ohack-feature__callout_mono"><Tooltip title="This is their dedicated channel in Slack">
                <IconButton>
                    <TagIcon />
                </IconButton>
            </Tooltip>{slack_channel}</p>

            {displayCountDetails()}

                
            <br/>
            <p className="ohack-feature__description">{description}</p>
        </Link> 
        );   
    }
    
};
