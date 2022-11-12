
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import CommentIcon from '@mui/icons-material/Comment';
import Tooltip from '@mui/material/Tooltip';

import { useState } from "react";
import useProblemstatements from "../../hooks/use-problem-statements";

export default function AdminProblemStatementList ({ selected, onSelected, default_selected } ) {
    const [checked, setChecked] = useState(default_selected);
    const { problem_statements } = useProblemstatements();

    const handleToggle = (value) => () => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }
        setChecked(newChecked);
        onSelected(newChecked);   
        
        console.log(checked);
    };

  
    

    return (<div className="checklist-box-list">
        <List>
            {
                problem_statements.map((problem_statement) => {
                    const labelId = `checkbox-list-label-${problem_statement.id}`;

                    return (
                        <ListItem
                            key={problem_statement.id}
                            secondaryAction={
                                <Tooltip title={<span style={{ fontSize: "15px" }}>{problem_statement.description}</span>} >
                                    <IconButton edge="end" aria-label="comments">
                                        <CommentIcon className="checklist-box" />
                                    </IconButton>
                                </Tooltip>

                            }
                            disablePadding
                        >
                            <ListItemButton role={undefined} onClick={handleToggle(problem_statement.id)} dense>
                                <ListItemIcon>
                                    <Checkbox
                                        className="checklist-box"
                                        edge="start"
                                        checked={checked.indexOf(problem_statement.id) !== -1}
                                        tabIndex={-1}
                                        disableRipple
                                        inputProps={{ 'aria-labelledby': labelId }}
                                    />
                                </ListItemIcon>

                                <ListItemText primaryTypographyProps={{ fontSize: '14px' }} id={labelId} primary={`${problem_statement.title}`} />
                                <ListItemText primaryTypographyProps={{ fontSize: '12px' }} id={labelId} primary={`${problem_statement.status}`} />
                                <ListItemText primaryTypographyProps={{ fontSize: '12px' }} id={labelId} primary={`${problem_statement.first_thought_of}`} />
                            </ListItemButton>
                        </ListItem>
                    );
                })
            }
        </List>
    </div>);
};