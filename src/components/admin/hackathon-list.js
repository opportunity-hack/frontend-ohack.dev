
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

import { useState } from "react";
import LinkedProblemStatementsToEvents from './problem-statement-event-link'
import useHackathonEvents from '../../hooks/use-hackathon-events';
import { Puff } from 'react-loading-icons'


export default function AdminHackathonList({ hackathons, problem_statements }) {
    const [message, setMessage] = useState("");

    const [problemStatementToEventMap, setProblemStatementToEventMap] = useState([]);

    const { handle_problem_statement_to_event_link_update } = useHackathonEvents();

    console.log("Creating problem statement defaults...");


    const handleChange = (problemStatementId, events) => {
        setMessage(<p>Saving... <Puff stroke="#0000FF" /> <Puff stroke="#0000FF" /></p>);
        console.log(problemStatementId, events);
        var old = problemStatementToEventMap;
        old[problemStatementId] = events;
        setProblemStatementToEventMap(old);
        
        var toSend = {}
        toSend[problemStatementId] = events;
        handle_problem_statement_to_event_link_update(toSend, onComplete);        
    };

    const onComplete = (amessage) => {
        setMessage(amessage);
    }

    return (
        <div className="content-layout">
        <h1 className="content__title">Hackathon Events</h1>
        {message}                 
        <div className="checklist-box-list">               
            <List>
                {
                    problem_statements.map(problem_statement => {
                        const labelId = `checkbox-list-label-${problem_statement.id}`;                        

                        return(
                            <ListItemButton key={labelId} dense>
                                <ListItemText primaryTypographyProps={{ fontSize: '5px' }} id={labelId} primary={`${problem_statement.id}`} />
                                <ListItemText primaryTypographyProps={{ fontSize: '10px' }} id={labelId} primary={`${problem_statement.title}`} />
                                <ListItemText primaryTypographyProps={{ fontSize: '10px' }} id={labelId} primary={`${problem_statement.status}`} />                                
                                <LinkedProblemStatementsToEvents problemStatementId={problem_statement.id} events={problem_statement.events} all_events={hackathons} onChange={handleChange} />
                                
                            </ListItemButton>                        
                        )
                    })
                }
            </List>                        
        </div>
        </div>
    );
};