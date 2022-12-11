import React from "react";
import {
  EventButton,
  EventCards,
  EventGreyText,
  EventText,
  EventTitle,
  OuterGrid,
} from "./styles";
import Link from "next/link";

function EventFeature(props) {
  const {
    title,
    type,
    nonprofits,
    start_date,
    end_date,
    location,
    devpostUrl,
    eventLinks,
    donationUrl,
    donationGoals,
    donationCurrent,
    icon,
  } = props;

  console.log(props);
  return (
    <EventCards container direction="column">
      <EventTitle>{type}</EventTitle>
      <EventGreyText variant="button">
        {start_date} - {end_date}
      </EventGreyText>
      <EventGreyText variant="button">{location}</EventGreyText>

      <EventText>{title}</EventText>
      {eventLinks.map((Link) => {
        return <EventButton>{Link.name}</EventButton>;
      })}
    </EventCards>
  );
}

export default EventFeature;
