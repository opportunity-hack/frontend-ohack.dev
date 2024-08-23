import React, { useEffect } from "react";
import {
  BlankContainer,
  ButtonContainer,  
  SectionTitle,
  ProgressBarHolder,
  ProgressContainer,
  ThankYouContainer,
  TypographyStyled,
  EventExtendedCard,  
  ExtendedEventButton
} from "./styles";

import { Grid, Button } from "@mui/material";
import SponsorMinimal from "../Sponsors/SponsorMinimal";

import { 
  CircularProgressbar
} from "react-circular-progressbar";

import { Typography } from "@mui/material";
import * as ga from "../../lib/ga";
import ReactPixel from 'react-facebook-pixel';
import NonProfitHackathonTile from "../NonProfitListTile/NonProfitHackathonTile";
import Countdown from "../Countdown/Countdown";

function EventFeatureExtended(props) {
  // TODO: Fix unused variable warning here
  const {
    title,
    description,
    type,
    teams,
    nonprofits,
    start_date,
    end_date,
    countdowns,
    location,
    devpostUrl,
    event_id,
    rawEventLinks,    
    donationUrl,    
    donationGoals,
    donationCurrent,
    icon,
    constraints,
  } = props;

  const options = {
    autoConfig: true, // set pixel's autoConfig. More info: https://developers.facebook.com/docs/facebook-pixel/advanced/
    debug: false, // enable logs
  };
  var advancedMatching = null; // { em: 'some@email.com' }; // optional, more info: https://developers.facebook.com/docs/facebook-pixel/advanced/advanced-matching
  
  useEffect(() => {
       if (typeof window !== 'undefined') {
      ReactPixel.init(process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID, advancedMatching, options);
    }
    }, []);

  const eventLinks = typeof rawEventLinks === 'string' ? [rawEventLinks] : rawEventLinks

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

  // Shuffle the nonprofits so that they are in a random order and check for null
  const nonprofitsShuffle = nonprofits?.sort(() => Math.random() - 0.5);


  return ( 
    <Grid container spacing={2} justifyContent="center" marginTop={1}>
    
      <EventExtendedCard xs={11} md={6} marginRight={0.5}>            
      <SectionTitle>Donor Funding</SectionTitle>
        <Button variant="contained" size="large" href={`/hack/${event_id}/sponsor`}>Be a sponsor</Button>
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
              { donationCurrent && donationCurrent.thank_you.length > 0 ? `Special thanks to: ${donationCurrent?.thank_you} for donating!` : ""}
            </TypographyStyled>
          </ThankYouContainer>
          <SponsorMinimal />
        </ProgressContainer>
      </EventExtendedCard>

      <EventExtendedCard xs={11}  md={5} marginLeft={0.5}>
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
              
    <EventExtendedCard xs={11}  md={11} marginTop={0.5}>      
      <SectionTitle>{nonprofits?.length} Nonprofit{ nonprofits?.length === 1 ? "" : "s"} </SectionTitle>        
        <Grid container justifyContent="flex-start">
        {
          // Check if there are constraints
          constraints && (
            // If constraints.max_teams_per_problem is not null, then display the max number of teams per problem
            constraints.max_teams_per_problem && (
              <Typography variant="body1" style={{marginBottom: 1, marginRight: 1}}>
                <b>Max teams per problem: </b> {constraints.max_teams_per_problem}
              </Typography>
            )            
          ) 
        }

        {
          constraints && (            
          // If constraints.min_people_per_team is not null, then display the min number of people per team
            constraints.min_people_per_team && (              
              <Typography variant="body1" style={{marginBottom: 1, marginRight:1, marginLeft:1}}>
                <b>Minimum people per team: </b> {constraints.min_people_per_team}
              </Typography>              
            )
          )          
        }

        {
          constraints && (
          // If constraints.max_people_per_team is not null, then display the max number of people per team
            constraints.max_people_per_team && (
              <Typography variant="body1" style={{marginBottom: 1, marginLeft:1}}>
                <b>Max people per team: </b> {constraints.max_people_per_team}
              </Typography>
            )
          )
        }

        
        </Grid>

        <Grid container spacing={2} justifyContent="center" marginTop={1}>          
        { 
          nonprofitsShuffle?.map((nonprofit) => {
            return <NonProfitHackathonTile eventId={event_id} npo={nonprofit} teams={teams}  />
          })
        } 
        </Grid>        
      </EventExtendedCard>

      <EventExtendedCard xs={11}  md={11} marginRight={0.5} marginTop={0.5}>
      <SectionTitle id="countdown">Countdown</SectionTitle>
      {
        countdowns && countdowns.length > 0 && (
          countdowns.map((countdown) => {
            return <Countdown details={countdown} />
          }
        ))

        // If no countdowns are provided, display a default countdown using end_date
        || <Countdown details={{name: title + " completion", time: end_date, description: description}} />
      }
      </EventExtendedCard>
    
  </Grid>    
  );
}

export default EventFeatureExtended;
