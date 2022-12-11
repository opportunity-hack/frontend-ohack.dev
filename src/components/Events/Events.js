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
  const eventsResult = events.map((event) => {
    console.log(" == Events Render");
    return (
      <Grid key={event.id} style={{ padding: "0 1.5rem" }}>
        <Typography variant="h3">
          {event.location} {event.type}
        </Typography>
        <Typography variant="h5" style={{ color: "#808087", marginBottom: "1rem" }}>
          {event.start_date} <ArrowForwardIosIcon style={{ color: "gray" }} />{" "}
          {event.end_date}
        </Typography>

        <Stack direction="column" alignItems="flex-start" spacing={2}>
          <a href={event.devpost_url}>
            <button className="button button--primary button--compact">
              Register on DevPost
            </button>
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

  return eventsResult;
}
