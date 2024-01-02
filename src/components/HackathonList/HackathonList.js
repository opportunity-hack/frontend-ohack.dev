import React, { useState, useEffect } from "react";
import useHackathonEvents from "../../hooks/use-hackathon-events";
import { EmptyGrid, OuterGrid, TypographyStyled } from "./styles";
import EventFeature from "./EventFeature";
import { SectionTitle } from "./styles";
import Image from "next/image";

import dynamic from 'next/dynamic'
const News = dynamic(() => import('../../components/News/News'), {
  ssr: false,
});


function HackathonList() {

  const { hackathons } = useHackathonEvents("current");
  const [newsData, setNewsData] = useState([]);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/news?limit=2`)
            .then(response => response.json())
            .then(data => setNewsData(data.text || null))
            .catch(error => console.error(error));
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
        <News newsData={newsData} frontPage={true}/>        

        { hackathons && hackathons.length > 0 && (
          hackathons.map((event) => {
            return (
              <EventFeature
                title={event?.title}
                event_id={event?.event_id}
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
            );
          })
        )}
      
        { 
          hackathons && hackathons.length === 0 && (
            <TypographyStyled variant="h4">
              No events found!
            </TypographyStyled>
          )
        }
      

      </EmptyGrid>
    </OuterGrid>
  );
}

export default HackathonList;