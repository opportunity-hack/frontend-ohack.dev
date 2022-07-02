import React from "react";
import { Link } from "react-router-dom";
import TagIcon from '@mui/icons-material/Tag';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';



export const NonProfitListTile = ({ id, admin, title, count_problem_statements, description, slack_channel, resourceUrl, icon }) => {
    
    
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
            <p className="ohack-feature__callout">{count_problem_statements} Problem Statements</p>
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
            <p className="ohack-feature__callout">{count_problem_statements} Problem Statements</p>
            <p className="ohack-feature__description">{description}</p>
        </Link> 
        );   
    }
    
};
