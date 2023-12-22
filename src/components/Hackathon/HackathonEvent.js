import React, { useState, useEffect } from "react";
import useHackathonEvents from "../../hooks/use-hackathon-events";
import { EmptyGrid, OuterGrid, TypographyStyled } from "./styles";
import { SectionTitle } from "./styles";
import EventFeature from "../HackathonList/EventFeature";


function HackathonEvent( { event_id }) {
  const { handle_get_hackathon } = useHackathonEvents();
  const [event, setEvent] = useState(null);

    useEffect(() => {        
        handle_get_hackathon(event_id, (data) => {
            setEvent(data);
        });
    }, []);


  return (
    <OuterGrid
      container
      alignItems="center"
      direction="column"
      textAlign="center"
    >
      <SectionTitle variant="h1">Upcoming and Current Events</SectionTitle>
      <EmptyGrid container justifyContent="center">
        <EventFeature
                title={event?.title}
                description={event?.description}
                key={event?.title}
                type={event?.type}
                nonprofits={event?.nonprofits}
                start_date={event?.start_date}
                end_date={event?.end_date}
                location={event?.location}
                devpostUrl={event?.devpost_url}
                rawEventLinks={event?.links}
                icon={event?.image_url}
                donationUrl={event?.donation_url}
                donationGoals={event?.donation_goals}
                donationCurrent={event?.donation_current}                                 
                />
      </EmptyGrid>
    </OuterGrid>
  );
}

export default HackathonEvent;