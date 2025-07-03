import React, { useState, useEffect, useCallback } from "react";
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

import { 
  Typography, 
  Box, 
  Grid, 
  Chip, 
  Card, 
  CardContent, 
  LinearProgress, 
  Skeleton,
  Tooltip,
  useTheme
} from "@mui/material";
import Moment from 'moment';
import Link from 'next/link';
import { useAuthInfo } from '@propelauth/react';
import ImpactMetrics from '../ImpactMetrics';


function EventFeature(props) {
  // TODO: Fix unused variable warning here
  console.log("EventFeature props:", props);
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
    id,
    rawEventLinks,        
    donationGoals,
    donationCurrent,    
  } = props;

  
  // TODO: Is the schema on the backend wrong? Or is the schema here wrong?
  const eventLinks = typeof rawEventLinks === 'string' ? [rawEventLinks] : rawEventLinks
  
  

  return (
    <EventCards container direction="column">      
      <Link href={`/hack/${event_id}`} passHref>
        <div style={{ cursor: 'pointer', width: '100%' }}>
          <EventLink variant="h3">{title}</EventLink>
          <EventText variant="h3">{description}</EventText>
          
          <br />
          
          {
            Moment(new Date()).format("YYYY") === Moment(start_date).format('YYYY') && 
            <EventText variant="h3">
              {Moment(start_date).format('MMM Do')} to {Moment(end_date).format('MMM Do YYYY')}
            </EventText>      
          }

          {
            Moment(new Date()).format("YYYY") !== Moment(start_date).format('YYYY') &&
            <EventText variant="h3">
              {Moment(start_date).format('MMM Do YYYY')} to {Moment(end_date).format('MMM Do YYYY')}
            </EventText>
          }
          
          <br/>
        
          <EventGreyText variant="button">{location}</EventGreyText>                    
          
          {/* Only render the donation progress if there is data */}
          {(donationCurrent?.food > 0 || donationCurrent?.prize > 0 || donationCurrent?.swag > 0) && (
            <ProgressContainer
              container
              justifyContent="space-around"
              direction="column"
              style={{ height: '160px' }} // Fixed height to prevent layout shifts
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
          )}
          {/* Empty placeholder with fixed height when no donation data */}
          {!donationCurrent?.food && !donationCurrent?.prize && !donationCurrent?.swag && (
            <div style={{ height: '20px' }} /> // Small spacer when no donation data
          )}

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
                  <Link
                  key={alink?.name} 
                  prefetch={false} href={alink?.link} target={isExternal ? '_blank' : '_self'} onClick={(e) => {
                    if (isExternal) {
                      e.preventDefault();
                      window.open(alink?.link, '_blank');
                    }
                  }}>
                    <EventButton color={alink.color} variant={alink.variant}>
                      {alink?.name}
                    </EventButton>
                  </Link>
                );
              })
            }
          </ButtonContainer>
        
          {/* Impact Metrics Section */}
          <ImpactMetrics 
              event_id={event_id} 
              eventData={{ start_date, end_date, location, title, id }} 
            />
        </div>
      </Link>
    </EventCards>
  );
}

export default EventFeature;
