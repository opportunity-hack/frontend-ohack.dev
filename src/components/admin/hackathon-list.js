
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

import Button from '@mui/material/Button';
import SaveIcon from '@mui/icons-material/Save';

import '../../styles/admin.styles.css';
import { useState } from "react";
import { LinkedProblemStatements } from './problemstatement-link'
import { useHackathonEvents } from '../../hooks/use-hackathon-events';
import { Puff } from 'react-loading-icons'


export const HackathonList = ({ hackathons, problem_statements }) => {
    const [message, setMessage] = useState("");

    const [hackathonToProblemStatements, sethackathonToProblemStatements] = useState([]);

    const { handle_event_problem_statement_link_update } = useHackathonEvents();

    var existingEvents = {}
    problem_statements.map(ps => {
        if( ps.events )
        {
            return ps.events.map( event => {
                var eventList = [];
                const strToAdd = ps.title + "|" + ps.id;
                if (event.id in existingEvents)
                {
                    eventList = existingEvents[event.id];
                }
                eventList.push(strToAdd);
            
                existingEvents[event.id] = eventList;

                return null;
            } )
        }
        else {
            return null;
        }
    });        

    const handleChange = (hackathonId, problemStatements) => {
        console.log(hackathonId, problemStatements);
        var old = hackathonToProblemStatements;
        old[hackathonId] = problemStatements;
        sethackathonToProblemStatements(old);
    };

    const onComplete = (amessage) => {
        setMessage(amessage);
    }

    const handleSubmit = async () => {
        onComplete(<p>Saving... <Puff stroke="#0000FF" /> <Puff stroke="#0000FF" /></p>)
        console.log("Submit");
        console.log(hackathonToProblemStatements);

        // TODO: Make POST call to save this list of Problem Statements linked with this Event/Hackathon
        const hackathonEventToProblem = Object.keys(hackathonToProblemStatements).map( key => {            
            
            // Format should be problem -> [eventid1, eventid2,...]
            console.log("====key");
            console.log(key);
            const problems = hackathonToProblemStatements[key];

            const problemIds = problems.map( p => {
                return p.split("|")[1];
            });

            console.log("====list");
            console.log(problemIds);
            const problemIdSet = new Set(problemIds);
            let result = {};
            result[key] = [...problemIdSet];
            return result;                    
        });

        console.log("====final");
        console.log(hackathonEventToProblem);
        handle_event_problem_statement_link_update(hackathonEventToProblem, onComplete);
    };

    return (
        <div className="content-layout">
        <h1 className="content__title">Hackathon Events</h1>
        <div className="checklist-box-list">                    
            <List>
                {
                    hackathons.map((hackathon) => {
                        const labelId = `checkbox-list-label-${hackathon.id}`;
                        
                        // We need to use the title and id for now
                        // const default_selected = ["Horse Volunteer Scheduling"];                      

                        const default_selected = hackathon.id in existingEvents ? existingEvents[hackathon.id] : [];
                        console.log("++");
                        console.log(default_selected);

                        return (                        
                            <ListItemButton key={labelId}  dense>                                
                                <ListItemText primaryTypographyProps={{ fontSize: '10px' }} id={labelId} primary={`${hackathon.id}`} />
                                <ListItemText primaryTypographyProps={{ fontSize: '10px' }} id={labelId} primary={`${hackathon.type}`} />
                                <ListItemText primaryTypographyProps={{ fontSize: '10px' }} id={labelId} primary={`${hackathon.location}`} />
                                <ListItemText primaryTypographyProps={{ fontSize: '10px' }} id={labelId} primary={`${hackathon.start_date}`} />
                                
                                
                                <LinkedProblemStatements problemStatements={problem_statements} hackathonId={hackathon.id} onChange={handleChange} defaultSelected={default_selected} />
                            </ListItemButton>                        
                        );
                    })
                }
            </List>
            <Button onClick={handleSubmit} variant="contained" endIcon={<SaveIcon />}>
                Save
            </Button>
            {message}
        </div>
        </div>
    );
};