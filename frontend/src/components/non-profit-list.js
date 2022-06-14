import React from "react";
import { Puff } from 'react-loading-icons'


export const NonProfitList = ({ nonprofits }) => (
    <div className="badge-list">

        {nonprofits.length <= 0 ? <p>Loading... <Puff stroke="#0000FF" /> <Puff stroke="#0000FF" /></p> : null}

        {
            nonprofits.map(npo => {
                return(
                    <div key={npo.name}>
                    <a href={npo.website} className="nonprofit__website">{npo.name}</a>
                    <pre>{npo.slack_channel}</pre>
                    {npo.contact_people}            
                    </div>);
            })

        }
        

    </div>
);
