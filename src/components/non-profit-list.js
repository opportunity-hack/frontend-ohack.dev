import React from "react";
import { Puff } from 'react-loading-icons'
import ContactPageIcon from '@mui/icons-material/ContactPage';
import Link from 'next/link'
import LanguageIcon from '@mui/icons-material/Language';
export default function NonProfitList({ nonprofits }){

    return(
    <div className="badge-list">

        {nonprofits.length <= 0 ? <p>Loading... <Puff stroke="#0000FF" /> <Puff stroke="#0000FF" /></p> : null}

        {
            nonprofits.map(npo => {
                return(
                    <div key={npo.name}>
                        <Link href={`/nonprofit/${npo.id}`}>{npo.name}</Link><br/>
                        <pre>#{npo.slack_channel}</pre>
                        <LanguageIcon /> <a href={npo.website} className="nonprofit__website">{npo.website}</a><br />
                        <ContactPageIcon/> {npo.contact_people}            
                    </div>);
            })

        }
    </div>
    );
}
