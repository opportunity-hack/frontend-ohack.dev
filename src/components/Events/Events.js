import EventTeams from "../event-teams";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Stack from "@mui/material/Stack";
import { Grid, Typography } from "@mui/material";
import Link from "next/link";
import EventBusyIcon from '@mui/icons-material/EventBusy';
import Button from "@mui/material/Button";
import { EventLink } from "../HackathonList/styles";

export default function Events({
  events,
  teams,
  userDetails,
  user,
  problemStatementId,
  onTeamCreate,
  onTeamLeave,  
  onTeamJoin,
  isHelping,
}) {
  
  const isEventStartDateOlderThanToday = (event) => {
    return new Date(event.end_date) < new Date();
  }

  // Sort events by event.start_date with the newest on the top
  events.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));


  var eventsResult = "We haven't hacked on this yet!"
  if (events && events.length > 0) {       
    eventsResult = events.map((event) => {      
      var devPostPostfixString = "";      

      if (event.devpost_url && event.devpost_url.includes("devpost")) {
        devPostPostfixString = "on DevPost";
      }
      
      return (
        <Grid item key={event.id} style={{ marginTop: 10, padding: "2px" }}>

          { isEventStartDateOlderThanToday(event) && 
            <Link href={`/hack/${event.event_id}`}>
             <EventLink variant="h4" style={{ color: 'gray' }}>
              <EventBusyIcon/> Past Event: {event.location} {event.type}
            </EventLink>
            </Link>
          }
          { !isEventStartDateOlderThanToday(event) && 
            <Link href={`/hack/${event.event_id}`}>
            <EventLink variant="h3">
              {event.location} {event.type}
            </EventLink>
            </Link>
          }

          <Typography variant="body1" style={{ color: isEventStartDateOlderThanToday(event) ? "#C0C0C0" : "#222222" }}>
              {event.description}
           </Typography>

           

          <Typography variant="h5" style={{ color: isEventStartDateOlderThanToday(event) ? "#C0C0C0" : "#222222", marginBottom: "1rem" }}>
            {
              // Convert start_date to readible format
              new Date(event.start_date).toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            }
            <ArrowForwardIosIcon style={{ color: "gray" }} />{" "}

            {
              // Convert start_date to readible format
              new Date(event.end_date).toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            }
          </Typography>

            { 
            /* Can't tell if this is helpful or too noisy, so commenting this out for now
            
            // Print out links if they exist
            event.links && event.links.length > 0 && (
              <Grid container
              style={{ backgroundColor: "#f5f5f5" }} spacing={0} padding={1} direction="row" md={12} xs={12} marginTop={0.5} justifyContent="flex-start"  alignItems="center" alignContent="center" >
                {
                  <Grid item style={{  }}>
                    {event.links.map((link) => {
                      return (
                       
                          <Link href={link.link} target="_blank" rel="noreferrer">
                            <Button size="small" variant={link.variant} color={link.color}>
                              {link.name}
                            </Button>
                          </Link>
                       
                      );
                    })}
                  </Grid>
                }
              </Grid>
            )
            */
            }
          

           {
            // Print constraints if they exist
            event.constraints && (
              <Grid item direction="row" spacing={2} justifyContent="flex-start">
                {
                  // If constraints.max_teams_per_problem is not null, then display the max number of teams per problem
                  event.constraints.max_teams_per_problem && (
                    <Typography variant="body1" style={{marginBottom: 1, marginRight: 1}}>
                      <b>Max teams per problem: </b> {event.constraints.max_teams_per_problem}
                    </Typography>
                  )            
                }

                {
                  // If constraints.min_people_per_team is not null, then display the min number of people per team
                  event.constraints.min_people_per_team && (
                    <Typography variant="body1" style={{marginBottom: 1, marginRight:1, marginLeft:1}}>
                      <b>Minimum people per team: </b> {event.constraints.min_people_per_team}
                    </Typography>              
                  )
                }

                {
                  // If constraints.max_people_per_team is not null, then display the max number of people per team
                  event.constraints.max_people_per_team && (
                    <Typography variant="body1" style={{marginBottom: 1, marginLeft:1}}>
                      <b>Max people per team: </b> {event.constraints.max_people_per_team}
                    </Typography>
                  )
                }
              </Grid>
            )
           }

          <Stack direction="column" alignItems="flex-start" spacing={2}>            

            { event.devpost_url && <Link href={event.devpost_url} target="_blank" rel="noreferrer">
            {
              // If event.start_date is in the past then show the button as View on DevPost instead
              event.start_date < new Date().toISOString() ? (
                <Button variant="contained" color={isEventStartDateOlderThanToday ? "info" : "secondary"}>
                    View {devPostPostfixString}
                </Button>
              ) : (
                <Button variant="contained" color={isEventStartDateOlderThanToday ? "info" : "secondary"}>
                    Register {devPostPostfixString}
                </Button>
              )             
            }              
            </Link>
            }

            
            
            <EventTeams
              // The teams filtered for a given event
              teams={teams.filter((team) => event.teams.includes(team.id))} 
              user={user}
              isEventStartDateOlderThanToday={isEventStartDateOlderThanToday(event)}
              userDetails={userDetails}
              problemStatementId={problemStatementId}
              eventId={event.id}
              eventStringId={event.event_id}
              constraints={event.constraints}
              onTeamCreate={onTeamCreate}
              onTeamLeave={onTeamLeave}              
              onTeamJoin={onTeamJoin}
              isHelping={isHelping}
            />
          </Stack>
        </Grid>
      );
    });
  }

  return eventsResult;
}
