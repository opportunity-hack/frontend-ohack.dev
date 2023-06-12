import EventTeams from "../event-teams";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Stack from "@mui/material/Stack";
import { Grid, Typography } from "@mui/material";



export default function Events({
  events,
  user,
  problemStatementId,
  onTeamCreate,
  onTeamLeave,
  onTeamCreateComplete,
  onTeamJoin,
  isHelping,
}) {
  var eventsResult = "We haven't hacked on this yet!"

  if (events.length > 0) {    
    eventsResult = events.map((event) => {
      var devPostPostfixString = "on DevPost";

      if (event.devpost_url && !event.devpost_url.includes("devpost")) {
        devPostPostfixString = "";
      }

      console.log(" == Events Render");
      return (
        <Grid key={event.id} style={{ padding: "0 1.5rem" }}>
          <Typography variant="h3">
            {event.location} {event.type}
          </Typography>
          <Typography variant="h5" style={{ color: "#808087", marginBottom: "1rem" }}>
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

          <Stack direction="column" alignItems="flex-start" spacing={2}>

            <a href={event.devpost_url}>
            {
              // If event.start_date is in the past then show the button as View on DevPost instead
              event.start_date < new Date().toISOString() ? (
                <button className="button button--primary button--compact">
                    View {devPostPostfixString}
                </button>
              ) : (
                <button className="button button--primary button--compact">
                    Register {devPostPostfixString}
                </button>
              )             
            }
              
            </a>

            <EventTeams
              teams={event.teams}
              user={user}
              problemStatementId={problemStatementId}
              eventId={event.id}
              onTeamCreate={onTeamCreate}
              onTeamLeave={onTeamLeave}
              onTeamCreateComplete={onTeamCreateComplete}
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
