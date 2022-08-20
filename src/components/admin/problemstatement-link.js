
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';

import '../../styles/admin.styles.css';
import { useState } from "react";

export const LinkedProblemStatements = ({ problemStatements, hackathonId, onChange, defaultSelected }) => {
    const [problemStatement, setProblemStatement] = useState(defaultSelected);

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
                    
        setProblemStatement(result);
        onChange(hackathonId, result);
    };

    const formProblemStatementSelectionId = `form-problem-list-label-${hackathonId}`;
    const problemStatementSelectionId = `problem-list-label-${hackathonId}`;
    const problemStatementSelectId = `select-problem-list-label-${hackathonId}`;

    return(
        <FormControl key={formProblemStatementSelectionId} id={formProblemStatementSelectionId} sx={{ m: 1, width: 300 }}>
            <InputLabel key={problemStatementSelectionId} id={problemStatementSelectionId}>Projects</InputLabel>
            <Select
                labelId={problemStatementSelectionId}
                id={problemStatementSelectId}
                key={problemStatementSelectId}
                multiple
                value={problemStatement}
                onChange={handleChange}
                input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
                renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                            <Chip key={value} label={value} />
                        ))}
                    </Box>
                )}
                MenuProps={MenuProps}
            >
                {problemStatements.map((ps) => (
                    <MenuItem
                        key={ps.id}                        
                        value={`${ps.title}|${ps.id}`}
                    >
                        {ps.title}|{ps.id}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );

};