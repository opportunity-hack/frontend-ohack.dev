import React, { useState, useEffect } from "react";
import useHackathonEvents from "../../hooks/use-hackathon-events";
import EventFeatureExtended from "../HackathonList/EventFeatureExtended";

import { TitleContainer, LayoutContainer, ProjectsContainer} from '../../styles/nonprofit/styles';
import { Typography } from '@mui/material';
import Moment from 'moment';
import { EventText } from "../HackathonList/styles";
import { EventGreyText } from "./styles";
import Skeleton from '@mui/material/Skeleton';



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
        { 
          event ? ( <div>
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
              event_id={event_id}
              description={event.description}
              key={event.title}
              type={event.type}
              nonprofits={event.nonprofits}
              teams={event.teams}
              start_date={event.start_date}
              end_date={event.end_date}
              countdowns={event.countdowns}
              location={event.location}
              devpostUrl={event.devpost_url}
              rawEventLinks={event.links}
              icon={event.image_url}
              donationUrl={event.donation_url}
              donationGoals={event.donation_goals}
              donationCurrent={event.donation_current}      
              constraints={event.constraints}                           
              />                      
          </ProjectsContainer>    
            </div> ) : (
              <div>
             <Skeleton animation="wave" variant="text" width={310} height={250} />             
             <Skeleton animation="wave" variant="rectangular" width={310} height={118} />             
             
             <Skeleton animation="wave" variant="text" width={310} height={250} />   
             <Skeleton animation="wave" variant="rectangular" width={310} height={318} />
             </div>
            )
      }            
    </LayoutContainer>
  
  );
}

export default SingleHackathonEvent;