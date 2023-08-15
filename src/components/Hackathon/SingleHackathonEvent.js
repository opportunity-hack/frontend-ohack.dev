import React, { useState, useEffect } from "react";
import useHackathonEvents from "../../hooks/use-hackathon-events";
import { EmptyGrid, OuterGrid, TypographyStyled } from "./styles";
import { SectionTitle } from "./styles";
import EventFeatureExtended from "../HackathonList/EventFeatureExtended";

import { TitleContainer, LayoutContainer, ProjectsContainer} from '../../styles/nonprofit/styles';
import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Moment from 'moment';
import { EventText } from "../HackathonList/styles";
import { EventGreyText } from "./styles";



function SingleHackathonEvent( { event_id }) {
  const { handle_get_hackathon } = useHackathonEvents();
  const [event, setEvent] = useState(null);

    useEffect(() => {                
        handle_get_hackathon(event_id, (data) => {            
          setEvent(data);                        
        });
    }, []);

  const style = { fontSize: '15px' };

  return (        
        <LayoutContainer key="hackathons" container>    
        { event && <div>
          <TitleContainer style={{paddingBottom: '8px', paddingTop: '10px'}} container>  
              <Typography variant="h3" component="h1">
              {event.title}
              </Typography>
              {
                Moment(new Date()).format("YYYY") === Moment(event.start_date).format('YYYY') && 
                <EventText variant="h3">
                  {Moment(event.start_date).format('MMM Do')} - {Moment(event.end_date).format('MMM Do')}
                </EventText>      
              }

              {
                Moment(new Date()).format("YYYY") !== Moment(event.start_date).format('YYYY') &&
                <EventText variant="h3">
                  {Moment(event.start_date).format('MMM Do YYYY')} - {Moment(event.end_date).format('MMM Do YYYY')}
                </EventText>
              }                                                
              <EventGreyText variant="button">{event.location}</EventGreyText>

              <Typography variant="body1" style={style} paragraph>
              {event.description}
              </Typography>                
                            
          </TitleContainer>   

          <ProjectsContainer style={{marginTop: 20, width: '100%'}} >
          <EventFeatureExtended
              title={event.title}
              description={event.description}
              key={event.title}
              type={event.type}
              nonprofits={event.nonprofits}
              start_date={event.start_date}
              end_date={event.end_date}
              location={event.location}
              devpostUrl={event.devpost_url}
              rawEventLinks={event.links}
              icon={event.image_url}
              donationUrl={event.donation_url}
              donationGoals={event.donation_goals}
              donationCurrent={event.donation_current}                                 
              />                      
          </ProjectsContainer>    
            </div>}
    </LayoutContainer>
  
  );
}

export default SingleHackathonEvent;