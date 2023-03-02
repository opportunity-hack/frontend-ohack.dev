import React, { useState, useEffect } from "react";
import useHackathonEvents from "../../hooks/use-hackathon-events";
import { EmptyGrid, OuterGrid, TypographyStyled } from "./styles";
import EventFeature from "./EventFeature";
import { SectionTitle } from "./styles";
import { Player } from "@lottiefiles/react-lottie-player";
import { hackathons } from "./dummyData";

function HackathonList() {
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
      <SectionTitle variant="h2">Upcoming and Current Events</SectionTitle>

      <EmptyGrid container justifyContent="center">
        {hackathons?.length > 0 ? (
          hackathons.map((event) => {
            return (
              <EventFeature
                title={event?.title}
                type={event?.type}
                nonprofits={event?.nonprofits}
                start_date={event?.start_date}
                end_date={event?.end_date}
                location={event?.location}
                devpostUrl={event?.devpost_url}
                eventLinks={event?.links}
                icon={event?.image_url}
                donationUrl={event?.donation_url}
                donationGoals={event?.donation_goals}
                donationCurrent={event?.donation_current}
              />
            );
          })
        ) : (
          <Player
            src="https://assets8.lottiefiles.com/private_files/lf30_e3pteeho.json"
            className="player"
            loop
            autoplay
            speed={1}
            style={{
              width: "100%",
              height: width >= 600 ? "40rem" : "100%",
            }}
          />
        )}
        {hackathons?.length > 0 ? null : (
          <TypographyStyled variant="h3">
            No events found!
          </TypographyStyled>
        )}
      </EmptyGrid>
    </OuterGrid>
  );
}

export default HackathonList;