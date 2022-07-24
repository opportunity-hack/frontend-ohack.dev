import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useEnv } from "../../context/env.context";
import axios from "axios";

import '../../styles/admin.styles.css';

import { AuthenticationButton } from "../buttons/authentication-button";

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

import { useState } from "react";

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


export const AddHackathon = ({ problem_statements }) => {

    const { apiServerUrl } = useEnv();
    const { getAccessTokenSilently, user } = useAuth0();

    const [checked, setChecked] = useState([]);

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [location, setLocation] = useState("");
    const [devpost_url, setDevPostUrl] = useState("");



    const [message, setMessage] = useState("");

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

                // We send just the ID to the backend, it will convert this to an object
                // Ref: https://stackoverflow.com/a/59394211
                problem_statements: checked.map(item => {
                    return `${item}`
                })
            }
        };

        const data = await makeRequest({ config, authenticated: true });
        return data;
    };



    const handleToggle = (value) => () => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }
        setChecked(newChecked);
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
            <h1 className="content__title">Add a hackathon</h1>

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
               
            </Box>

            <div className="checklist-box-list">
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
