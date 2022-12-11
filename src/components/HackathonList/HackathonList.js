import React from "react";
import useHackathonEvents from "../../hooks/use-hackathon-events";
import { OuterGrid } from "./styles";
import EventFeature from "./EventFeature";
import { SectionTitle } from "./styles";

function HackathonList() {
  const { hackathons } = useHackathonEvents("yes");
  return (
    <OuterGrid container alignItems="center" direction="column"  backgroundColor="lightBlue">
      <SectionTitle variant="h2">Upcoming and current events</SectionTitle>

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
    </OuterGrid>
  );
}

export default HackathonList;
