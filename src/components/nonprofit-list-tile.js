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
            <p className="ohack-feature__callout_mono"><Tooltip title="This is their dedicated channel in Slack">
                <IconButton>
                    <TagIcon />
                </IconButton>
               </Tooltip>{npo.slack_channel}</p>
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
            <p className="ohack-feature__callout_mono"><Tooltip title="This is their dedicated channel in Slack">
                <IconButton>
                    <TagIcon />
                </IconButton>
                </Tooltip>{npo.slack_channel}</p>

            {displayCountDetails()}

                
            <br/>
                <p className="ohack-feature__description">{npo.description}</p>
        </Link> 
        );   
    }
    
};
