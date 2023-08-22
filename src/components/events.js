import EventTeams from "./event-teams";
import EngineeringIcon from '@mui/icons-material/Engineering';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Stack from '@mui/material/Stack';

export default function Events({ events, user, problemStatementId, onTeamCreate, onTeamLeave, onTeamCreateComplete, onTeamJoin, isHelping }) {

    const eventsResult = events.map(event => {        
        return (
            <div key={event.id}>
                <h3><EngineeringIcon /> {event.location} {event.type}</h3>
                <h5>{event.start_date} <ArrowForwardIosIcon style={{ color: "gray" }} /> {event.end_date}</h5>                

                <Stack
                    direction="column"
                    alignItems="flex-start"
                    spacing={2}>
                    <a href={event.devpost_url}><button className="button button--primary button--compact">
                        Register on DevPost
                    </button></a>
                    
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

            </div>)

    });

    return( eventsResult )    
}