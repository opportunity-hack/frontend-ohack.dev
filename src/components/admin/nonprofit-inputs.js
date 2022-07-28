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

import { DeleteConfirmationButton } from './delete-confirm'
import '../../styles/admin.styles.css';


export const NonProfitInputs = ({ nonprofits, selected, onSelected, onDelete, default_selected }) => {    
    const [checkedNPO, setCheckedNPO] = useState(default_selected);


    const handleToggle = (value) => () => {
        const currentIndex = checkedNPO.indexOf(value);
        const newChecked = [...checkedNPO];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }
        setCheckedNPO(newChecked);
        onSelected(newChecked);
    };

    

    return (<List>
        {
            nonprofits.map((nonprofit) => {
                const labelId = `checkbox-list-label-${nonprofit.id}`;

                return (
                    <ListItem
                        key={nonprofit.id}
                        secondaryAction={
                            <Tooltip title={<span style={{ fontSize: "15px" }}>{nonprofit.description}</span>}>
                                <IconButton edge="end" aria-label="comments">
                                    <CommentIcon className="checklist-box" />                  
                                </IconButton>                                
                            </Tooltip>            
                        }
                        disablePadding>
                        
                        <ListItemButton role={undefined} onClick={handleToggle(nonprofit.id)} dense>
                            <ListItemIcon>
                                <Checkbox
                                    className="checklist-box"
                                    edge="start"
                                    checked={checkedNPO.indexOf(nonprofit.id) !== -1}
                                    tabIndex={-1}
                                    disableRipple
                                    inputProps={{ 'aria-labelledby': labelId }}
                                />
                            </ListItemIcon>

                            <ListItemText primaryTypographyProps={{ fontSize: '12px' }} id={labelId} primary={`${nonprofit.name}`} />
                            <ListItemText primaryTypographyProps={{ fontSize: '10px' }} id={labelId} primary={`${nonprofit.slack_channel}`} />
                           
                            <DeleteConfirmationButton/>
                            
                        </ListItemButton>
                    </ListItem>
                );
            })
        }
        </List>);
};