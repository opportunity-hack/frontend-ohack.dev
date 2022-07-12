import React from "react";
import { Puff } from 'react-loading-icons'
import { LinkedInButton } from "./buttons/linkedin-button";

export const BadgeList = ({ badges }) => {
    if( badges == null )
    {
        return (<p>Loading... <Puff stroke="#0000FF" /> <Puff stroke="#0000FF" /></p>);
    }    
    
    return(
    <div className="badge-list">        
        {
                badges.map(badge => {
                    return <div key={badge.id}><img key={badge.id} alt="Badge" src={badge.image} className="profile__avatar" />{badge.description}</div>;
                })
        }
        {badges.length > 0 ? <LinkedInButton/> : null}        
    </div>
    )
};
