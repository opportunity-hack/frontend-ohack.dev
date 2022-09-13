
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';

import { useState } from "react";

export default function LinkedProblemStatementsToEvents({ problemStatementId, events, all_events, onChange  }){
    const getEventsAsString = (anEventObject) => {
        return anEventObject.start_date + " " + anEventObject.type + " " + anEventObject.location + "|" + anEventObject.id;
    }

    const [eventState, setEventState] = useState(events.map(event => {
        return getEventsAsString(event);
    }));

    

    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8;
    const MenuProps = {
        PaperProps: {
            style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                width: 250,
            },
        },
    };

    const handleChange = (event) => {
        const { target: { value } } = event;
        const result = typeof value === 'string' ? value.split(',') : value;
        setEventState(result);
        onChange(problemStatementId, result);        
    };

    const formProblemStatementSelectionId = `form-problem-list-label-${problemStatementId}`;
    const problemStatementSelectionId = `problem-list-label-${problemStatementId}`;
    const problemStatementSelectId = `select-problem-list-label-${problemStatementId}`;

    return (
        <FormControl key={formProblemStatementSelectionId} id={formProblemStatementSelectionId} sx={{ m: 1, width: 300 }}>
            <InputLabel key={problemStatementSelectionId} id={problemStatementSelectionId}>Events</InputLabel>
            <Select
                labelId={problemStatementSelectionId}
                id={problemStatementSelectId}
                key={problemStatementSelectId}
                multiple
                value={eventState}
                onChange={handleChange}
                input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
                renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {                            
                            selected.map((value) => (
                                <Chip key={value} label={value} />
                            ))
                        }
                    </Box>
                )}
                MenuProps={MenuProps}
            >
                {all_events.map((event) => (
                    <MenuItem
                        key={getEventsAsString(event)}
                        value={getEventsAsString(event)}
                    >
                        {getEventsAsString(event)}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );

};