import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useEnv } from "../../context/env.context";
import axios from "axios";

import '../../styles/admin.styles.css';

import { AuthenticationButton } from "../buttons/authentication-button";

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

import { useState, useMemo } from "react";

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import CommentIcon from '@mui/icons-material/Comment';

import Button from '@mui/material/Button';
import SaveIcon from '@mui/icons-material/Save';
import Tooltip from '@mui/material/Tooltip';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { NonProfitInputs } from './nonprofit-inputs';


export const AddHackathon = ({ nonprofits, teams }) => {    

    const { apiServerUrl } = useEnv();
    const { getAccessTokenSilently, user } = useAuth0();

    const [checkedNPO, setCheckedNPO] = useState([]);
    const [checkedTeam, setCheckedTeam] = useState([]);


    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [location, setLocation] = useState("");
    const [devpost_url, setDevPostUrl] = useState("");
    const [image_url, setImageUrl] = useState("");

    const [event_type, setEventType] = React.useState('web');

    const [message, setMessage] = useState("");

    // We don't want to render all 100+ nonprofits each time we have onChanged for typing in a text box
    // So here we use useMemo so that it's only re-rendered when we click on a nonprofit

    const onNonProfitDelete = (id) =>
    {
        console.log(id)
    };

    var nonProfitInputs = useMemo(() => (<NonProfitInputs
        nonprofits={nonprofits}
        selected={checkedNPO}
        onSelected={setCheckedNPO}
        onDelete={onNonProfitDelete}
        default_selected={[]}
    />), [checkedNPO, nonprofits]);


    const makeRequest = async (options) => {
        try {
            if (options.authenticated) {
                const token = await getAccessTokenSilently();

                options.config.headers = {
                    ...options.config.headers,
                    Authorization: `Bearer ${token}`,
                };
            }

            const response = await axios(options.config);
            const { data } = response;
            setMessage("New Hackathon has been added");

            return data;
        } catch (error) {
            setMessage("Error adding Hackathon");

            if (axios.isAxiosError(error) && error.response) {
                return error.response;
            }

            return error.message;
        }
    };

    const handleSubmit = async () => {
        if (!user)
            return null;

        const config = {
            url: `${apiServerUrl}/api/messages/hackathon`,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            data: {
                location: location,
                devpost_url: devpost_url,
                start_date: startDate,
                end_date: endDate,
                event_type: event_type,
                image_url: image_url,

                teams: checkedTeam.map(item => {
                    return `${item}`
                }),

                // We send just the ID to the backend, it will convert this to an object
                // Ref: https://stackoverflow.com/a/59394211
                nonprofits: checkedNPO.map(item => {
                    return `${item}`
                })
            }
        };

        const data = await makeRequest({ config, authenticated: true });
        return data;
    };

    const handleEventTypeChange = (event, newValue) => {
        setEventType(newValue);
    };


    const handleToggleTeam = (value) => () => {
        
        const currentIndex = checkedTeam.indexOf(value);
        const newChecked = [...checkedTeam];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }
        setCheckedTeam(newChecked);
    };

    if (!user) {
        return (
            <div className="content-layout">
                <h1 className="content__title">Please login</h1>
                <div className="content__body">
                    <AuthenticationButton />
                </div>
            </div>
        );
    }

  
    

    return (
        <div className="content-layout">
            <h1 className="content__title">Add an event</h1>

            <Box
                component="form"
                sx={{
                    '& .MuiTextField-root': { m: 1, width: '25ch' },
                }}
                noValidate
                autoComplete="off"
            >
                <TextField
                    label="Start Date"
                    color="secondary"                    
                    onChange={(e) => setStartDate(e.target.value)}
                />
                

                <TextField
                    label="End Date"
                    color="secondary"
                    onChange={(e) => setEndDate(e.target.value)}
                />

                <ToggleButtonGroup
                    color="secondary"
                    value={event_type}
                    exclusive
                    onChange={handleEventTypeChange}
                >
                    <ToggleButton value="hackathon">Hackathon</ToggleButton>
                    <ToggleButton value="internship">Internship</ToggleButton>
                    <ToggleButton value="capstone">Capstone</ToggleButton>
                </ToggleButtonGroup>


                <TextField
                    label="Location"
                    color="secondary"
                    onChange={(e) => setLocation(e.target.value)}
                />

                <TextField
                    label="DevPost URL"
                    color="secondary"
                    onChange={(e) => setDevPostUrl(e.target.value)}
                />

                <TextField
                    label="Image URL"
                    color="secondary"
                    onChange={(e) => setImageUrl(e.target.value)}
                />
               
            </Box>

            <h3 className="content__title">Link a nonprofit to a hackathon</h3>
            <div className="checklist-box-list">                
                {nonProfitInputs}
            </div>
            <h3 className="content__title">Link a team to a hackathon</h3>
            <div className="checklist-box-list">
                <List>
                    {
                        teams.map((team) => {
                            const labelId = `checkbox-list-label-${team.id}`;

                            return (
                                <ListItem
                                    key={team.id}
                                    secondaryAction={
                                        <Tooltip title={<span style={{ fontSize: "15px" }}>{team.slack_channel}</span>}>
                                            <IconButton edge="end" aria-label="comments">
                                                <CommentIcon className="checklist-box" />
                                            </IconButton>
                                        </Tooltip>

                                    }
                                    disablePadding
                                >
                                    <ListItemButton role={undefined} onClick={handleToggleTeam(team.id)} dense>
                                        <ListItemIcon>
                                            <Checkbox
                                                className="checklist-box"
                                                edge="start"
                                                checked={checkedTeam.indexOf(team.id) !== -1}
                                                tabIndex={-1}
                                                disableRipple
                                                inputProps={{ 'aria-labelledby': labelId }}
                                            />
                                        </ListItemIcon>

                                        <ListItemText primaryTypographyProps={{ fontSize: '12px' }} id={labelId} primary={`${team.name}`} />
                                        <ListItemText primaryTypographyProps={{ fontSize: '10px' }} id={labelId} primary={`${team.team_number}`} />
                                    </ListItemButton>
                                </ListItem>
                            );
                        })
                    }
                </List>
            </div>

            <div>
                <Button onClick={handleSubmit} variant="contained" endIcon={<SaveIcon />}>
                    Save
                </Button>
                {message}
            </div>

        </div>
    );
};
