import React from "react";
import {
  BlankContainer,
  ButtonContainer,
  EventButton,
  EventGreyText,
  EventText,
  EventTitle,
  SectionTitle,
  ProgressBarHolder,
  ProgressContainer,
  ThankYouContainer,
  TypographyStyled,
  EventExtendedCard,  
  ExtendedEventButton
} from "./styles";

import { Grid } from "@mui/material";
import { CountdownCircleTimer } from 'react-countdown-circle-timer'

import { 
  CircularProgressbar
  // buildStyles 
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Typography } from "@mui/material";
import * as ga from "../../lib/ga";
import ReactPixel from 'react-facebook-pixel';

function EventFeatureExtended(props) {
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

  const options = {
    autoConfig: true, // set pixel's autoConfig. More info: https://developers.facebook.com/docs/facebook-pixel/advanced/
    debug: false, // enable logs
  };
  var advancedMatching = null; // { em: 'some@email.com' }; // optional, more info: https://developers.facebook.com/docs/facebook-pixel/advanced/advanced-matching
  ReactPixel.init(process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID, advancedMatching, options);


  const minuteSeconds = 60;
  const hourSeconds = 3600;
  const daySeconds = 86400;

  const timerProps = {
    isPlaying: true,
    size: 120,
    strokeWidth: 6
  };

  const renderTime = (dimension, time) => {
    return (
      <div className="time-wrapper">
        <div className="time">{time}</div>
        <div>{dimension}</div>
      </div>
    );
  };

  const countdownSize = 70;

  const getTimeSeconds = (time) => (minuteSeconds - time) | 0;
  const getTimeMinutes = (time) => ((time % hourSeconds) / minuteSeconds) | 0;
  const getTimeHours = (time) => ((time % daySeconds) / hourSeconds) | 0;
  const getTimeDays = (time) => (time / daySeconds) | 0;

  const stratTime = Date.now() / 1000; // use UNIX timestamp in seconds
  
  // Parse the date time with Moment and convert to Date object

  // endTime is October 7th at 7am
  const endTime = new Date(start_date).getTime() / 1000;

  const remainingTime = endTime - stratTime;
  const days = Math.ceil(remainingTime / daySeconds);
  const daysDuration = days * daySeconds;


  console.log("donationCurrent", donationCurrent);
  console.log("donationGoals", donationGoals);
  // TODO: Is the schema on the backend wrong? Or is the schema here wrong?
  const eventLinks = typeof rawEventLinks === 'string' ? [rawEventLinks] : rawEventLinks
  console.log("eventLinks", eventLinks);

  const trackClick = (link, name) => {    
    ga.event({
      action: "eventClick",
      params: {
        event_category: "event",
        event_label: name,
        value: link,
      },
    });

    ReactPixel.trackCustom("ClickEvent", {
      event_category: "eventClick",
      event_label: name,
      value: link,
    });

  };  

  return ( 
    <Grid container spacing={2} justifyContent="center" marginTop={1}>
    
      <EventExtendedCard xs={10} md={5} marginRight={0.5}>            
      <SectionTitle>Donor Funding</SectionTitle>
        <ProgressContainer
          container
          justifyContent="space-around"
          direction="column"
        >
          <BlankContainer container justifyContent="center" direction="row" gap="20px">        
            {donationCurrent && donationCurrent.food > 0 && (
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

            {donationCurrent && donationCurrent.prize > 0 && (
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
                ${donationCurrent.prize}/{donationGoals.prize}
              </TypographyStyled>
            </ProgressBarHolder>
            )}

            {donationCurrent && donationCurrent.swag > 0 && (
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
                  value={(donationCurrent.swag / donationGoals.swag) * 100}
                  text={`${(
                    (donationCurrent.swag / donationGoals.swag) *
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
              {donationCurrent && donationCurrent.thank_you.length > 0
                ? `Special thanks to: ${donationCurrent?.thank_you} for donating!`
                : ""}
            </TypographyStyled>
          </ThankYouContainer>
        </ProgressContainer>
      </EventExtendedCard>

      <EventExtendedCard xs={10}  md={5} marginLeft={0.5}>
      <SectionTitle>Important Links</SectionTitle>
        <ButtonContainer
          container
          direction="column"
          justifyContent="space-around"
          gap="5px"        
        >
          {          
              eventLinks?.map((Link) => {
                return <ExtendedEventButton onClick={trackClick(Link?.link, Link?.name)} color={Link.color} variant={Link.variant} href={Link?.link}>{Link?.name}</ExtendedEventButton>;
              })
        }
        </ButtonContainer>                
      </EventExtendedCard>
    
    <EventExtendedCard xs={10}  md={5} marginRight={0.5} marginTop={0.5}>
      <SectionTitle>Hackathon Countdown</SectionTitle>
      <div style={{ display: 'flex', fontFamily: 'sans-serif', textAlign: 'center', paddingTop: '10px'}}>
      <CountdownCircleTimer
        {...timerProps}
        colors="#7E2E84"
        size={countdownSize}
        duration={daysDuration}
        initialRemainingTime={remainingTime}
      >
        {({ elapsedTime, color }) => (
          <span style={{ color }}>
            {renderTime("days", getTimeDays(daysDuration - elapsedTime))}
          </span>
        )}
      </CountdownCircleTimer>
      <CountdownCircleTimer
        {...timerProps}
        colors="#D14081"
        size={countdownSize}
        duration={daySeconds}
        initialRemainingTime={remainingTime % daySeconds}
        onComplete={(totalElapsedTime) => ({
          shouldRepeat: remainingTime - totalElapsedTime > hourSeconds
        })}
      >
        {({ elapsedTime, color }) => (
          <span style={{ color }}>
            {renderTime("hours", getTimeHours(daySeconds - elapsedTime))}
          </span>
        )}
      </CountdownCircleTimer>
      <CountdownCircleTimer
        {...timerProps}
        colors="#EF798A"
        duration={hourSeconds}
        size={countdownSize}
        initialRemainingTime={remainingTime % hourSeconds}
        onComplete={(totalElapsedTime) => ({
          shouldRepeat: remainingTime - totalElapsedTime > minuteSeconds
        })}
      >
        {({ elapsedTime, color }) => (
          <span style={{ color }}>
            {renderTime("minutes", getTimeMinutes(hourSeconds - elapsedTime))}
          </span>
        )}
      </CountdownCircleTimer>
      <CountdownCircleTimer
        {...timerProps}
        colors="#218380"
        size={countdownSize}
        duration={minuteSeconds}
        initialRemainingTime={remainingTime % minuteSeconds}
        onComplete={(totalElapsedTime) => ({
          shouldRepeat: remainingTime - totalElapsedTime > 0
        })}
      >
        {({ elapsedTime, color }) => (
          <span style={{ color }}>
            {renderTime("seconds", getTimeSeconds(elapsedTime))}
          </span>
        )}
      </CountdownCircleTimer>
      </div>
      </EventExtendedCard>
      <EventExtendedCard xs={10}  md={5} marginLeft={0.5} marginTop={0.5}>
      <SectionTitle>Nonprofits</SectionTitle>
        <Typography variant="body1" style={{fontSize: '15px'}}>Check back on September 1st</Typography>
      </EventExtendedCard>
    

    
    
  </Grid>    
  );
}

export default EventFeatureExtended;
