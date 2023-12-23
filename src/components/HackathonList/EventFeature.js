import React from "react";
import {
  BlankContainer,
  ButtonContainer,
  EventButton,
  EventCards,
  EventGreyText,
  EventText,  
  EventLink,
  ProgressBarHolder,
  ProgressContainer,
  ThankYouContainer,
  TypographyStyled,
} from "./styles";
import { 
  CircularProgressbar, 
  // buildStyles 
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Typography } from "@mui/material";
import Moment from 'moment';
import Link from 'next/link';

function EventFeature(props) {
  // TODO: Fix unused variable warning here
  const {
    title,
    description,
    type,
    nonprofits,
    start_date,
    end_date,
    location,
    devpostUrl,
    event_id,
    rawEventLinks,    
    donationUrl,    
    donationGoals,
    donationCurrent,
    icon,
  } = props;

  
  // TODO: Is the schema on the backend wrong? Or is the schema here wrong?
  const eventLinks = typeof rawEventLinks === 'string' ? [rawEventLinks] : rawEventLinks
  
  

  return (
    
    <EventCards container direction="column">
    <Link href={`/hack/${event_id}`}>

      <EventLink variant="h3"><a href={`/hack/${event_id}`}>{title}</a></EventLink>
      <EventText variant="h3">{description}</EventText>
      
      <br />
      
      {
        Moment(new Date()).format("YYYY") === Moment(start_date).format('YYYY') && 
        <EventText variant="h3">
          {Moment(start_date).format('MMM Do')} - {Moment(end_date).format('MMM Do')}
        </EventText>      
      }

      {
        Moment(new Date()).format("YYYY") !== Moment(start_date).format('YYYY') &&
        <EventText variant="h3">
          {Moment(start_date).format('MMM Do YYYY')} - {Moment(end_date).format('MMM Do YYYY')}
        </EventText>
      }
      
      <br/>
    
      
      <EventGreyText variant="button">{location}</EventGreyText>
      
      <ProgressContainer
        container
        justifyContent="space-around"
        direction="column"
      >
        <BlankContainer container justifyContent="center" direction="row" gap="20px">
          {donationCurrent?.food > 0 && (
            <ProgressBarHolder container justifyContent="center">
              <Typography variant="h5" marginBottom="12%" fontWeight="bold">
                Food
              </Typography>
              <CircularProgressbar
                styles={{
                  path: {
                    stroke: "#003486",
                  },
                  trail: {
                    stroke: "#ffffff",
                  },
                  text: {
                    fill: "#003486",
                  },
                }}
                value={(donationCurrent.food / donationGoals.food) * 100}
                text={`${(
                  (donationCurrent.food / donationGoals.food) *
                  100
                ).toFixed(0)}%`}
              />
              <TypographyStyled variant="body1" sx={{ marginTop: "5%" }}>
                ${donationCurrent.food}/{donationGoals.food}
              </TypographyStyled>
            </ProgressBarHolder>
          )}

          {donationCurrent?.prize > 0 && (
          <ProgressBarHolder container justifyContent="center">
            <Typography variant="h5" marginBottom="12%" fontWeight="bold">
              Prize
            </Typography>
            <CircularProgressbar
              styles={{
                path: {
                  stroke: "#003486",
                },
                trail: {
                  stroke: "#ffffff",
                },
                text: {
                  fill: "#003486",
                },
              }}
              value={(donationCurrent.prize / donationGoals.prize) * 100}
              text={`${(
                (donationCurrent.prize / donationGoals.prize) *
                100
              ).toFixed(0)}%`}
            />
            <TypographyStyled variant="body1" sx={{ marginTop: "5%" }}>
              ${donationCurrent?.prize}/{donationGoals?.prize}
            </TypographyStyled>
          </ProgressBarHolder>
          )}

          {donationCurrent?.swag > 0 && (
            <ProgressBarHolder container justifyContent="center">
              <Typography variant="h5" marginBottom="12%" fontWeight="bold">
                Swag
              </Typography>
              <CircularProgressbar
                styles={{
                  path: {
                    stroke: "#003486",
                  },
                  trail: {
                    stroke: "#ffffff",
                  },
                  text: {
                    fill: "#003486",
                  },
                }}
                value={(donationCurrent?.swag / donationGoals?.swag) * 100}
                text={`${(
                  (donationCurrent?.swag / donationGoals?.swag) *
                  100
                ).toFixed(0)}%`}
              />
              <TypographyStyled variant="body1" sx={{ marginTop: "5%" }}>
                ${donationCurrent.swag}/{donationGoals.swag}
              </TypographyStyled>
            </ProgressBarHolder>
          )}
        </BlankContainer>

        <ThankYouContainer>
          <TypographyStyled variant="h6">
            {donationCurrent?.thank_you?.length > 0
              ? `Special thanks to: ${donationCurrent?.thank_you} for donating!`
              : ""}
          </TypographyStyled>
        </ThankYouContainer>
      </ProgressContainer>

      <ButtonContainer
        container
        direction="row"
        justifyContent="space-around"
        gap="5px"
      >
        {
          
            eventLinks?.map((alink) => {
              const isExternal = alink?.link?.startsWith('http');
              return (
                <Link href={alink?.link} target={isExternal ? '_blank' : '_self'} onClick={(e) => {
                  if (isExternal) {
                    e.preventDefault();
                    window.open(alink?.link, '_blank');
                  }
                }}>
                  <EventButton>{alink?.name}</EventButton>
                </Link>
              );
            })
       }
      </ButtonContainer>
      </Link>
    </EventCards>
    
  );
}

export default EventFeature;
