import React from "react";
import EventFeature from "./event-feature";
import useHackathonEvents from '../hooks/use-hackathon-events';


export default function HackathonList() {
    const { hackathons } = useHackathonEvents( "current" );
    
    var currentEvents = "";

    if(hackathons?.length > 0)
    {
        currentEvents = hackathons.map( event => {
            return(                
                <EventFeature                   
                    title={event.title} 
                    type={event.type} 
                    nonprofits={event.nonprofits}
                    start_date={event.start_date}
                    end_date={event.end_date}                    
                    location={event.location}
                    devpostUrl={event.devpost_url}
                    eventLinks={event.links}
                    icon={event.image_url}
                    donationUrl={event.donation_url}
                    donationGoals={event.donation_goals}
                    donationCurrent={event.donation_current}
                />
            );
        });
    }


    return (
        <div className="ohack-features">
            <h2 className="ohack-features__title">Upcoming and Current Events</h2>
            <div className="ohack-features__grid">
                {currentEvents}
            </div>
        </div>
        );


};
