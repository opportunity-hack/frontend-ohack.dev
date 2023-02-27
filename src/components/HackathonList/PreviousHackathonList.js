import React, { useState, useEffect } from "react";
import useHackathonEvents from "../../hooks/use-hackathon-events";
import { EmptyGrid, OuterGrid, TypographyStyled } from "./styles";
import EventFeature from "./EventFeature";
import { SectionTitle } from "./styles";
import { Player } from "@lottiefiles/react-lottie-player";
import { hackathons } from "./dummyData";

function PreviousHackathonList() {
  // const { hackathons } = useHackathonEvents("yes");

  const [width, setWidth] = useState();
  const functionName = () => {
    setInterval(() => {
      setWidth(window.screen.width);
    }, 500);
  };

  window.addEventListener("resize", functionName);

  useEffect(() => {
    setWidth(window.screen.width);
  }, []);

  return (
    <OuterGrid
      container
      alignItems="center"
      direction="column"
      textAlign="center"
    >
      <SectionTitle variant="h2">Previous events</SectionTitle>

      <EmptyGrid container justifyContent="center">
        {hackathons?.length > 0
          ? hackathons.map((event) => {
              return (
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
            })
          : null}
      </EmptyGrid>
    </OuterGrid>
  );
}

export default PreviousHackathonList;