import React from "react";
import { Link } from "react-router-dom";

export const NonProfitListTile = ({ id, title, description, slack_channel, resourceUrl, icon }) => (
    
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
        <p className="ohack-feature__callout">#{slack_channel}</p>
        <p className="ohack-feature__description">{description}</p>     
    </Link>    
);
