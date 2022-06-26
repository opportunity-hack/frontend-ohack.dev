import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useEnv } from "../../context/env.context";
import axios from "axios";

import './admin.styles.css';

import { AuthenticationButton } from "../../components/buttons/authentication-button";
import { useParams } from "react-router-dom";

import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

import { useState } from "react";


import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';


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



export const AddNonProfit = () => {    
    const { apiServerUrl } = useEnv();
    const { getAccessTokenSilently, user } = useAuth0();

    const [checked, setChecked] = useState([0]);

    const [npoName, setNpoName] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [description, setDescription] = useState("");
    const [slack_channel, setSlackChannel] = useState("");
    const [website, setWebsite] = useState("");
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

            console.log(options.config);
            const response = await axios(options.config);
            const { data } = response;
            setMessage("New NPO has been added");
            console.log(data);
            return data;
        } catch (error) {
            setMessage("Error adding NPO");
            console.log(error);
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
            url: `${apiServerUrl}/api/messages/npo`,
            method: "POST",  
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },         
            data: {
                name: name,
                email: email,
                npoName: npoName,
                description: description,
                website: website,
                slack_channel: slack_channel
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
            <h1 className="content__title">Add a nonprofit</h1>
            
            <Box
                component="form"
                sx={{
                    '& .MuiTextField-root': { m: 1, width: '25ch' },
                }}
                noValidate
                autoComplete="off"
            >
                <TextField 
                    label="Name of Nonprofit" 
                    color="secondary" 
                    onChange={(e) => setNpoName(e.target.value)}
                    />

                <TextField
                    label="Slack Channel"
                    color="secondary"
                    onChange={(e) => setSlackChannel(e.target.value)}
                />


                <TextField
                    label="Website"
                    color="secondary"
                    onChange={(e) => setWebsite(e.target.value)}
                />

                <TextField
                    id="outlined-textarea"
                    label="Description"
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add the description of the nonprofit here"
                    multiline
                />
                        

                <TextField 
                    label="Primary Contact Name" 
                    color="primary" 
                    onChange={(e) => setName(e.target.value)}
                    />

                <TextField 
                    label="Primary Contact Email" 
                    color="primary" 
                    onChange={(e) => setEmail(e.target.value)}
                    />
            </Box> 
                    
            <div className="checklist-box-list">
                <List sx={{ width: '100%', maxWidth: 360 }}>
                    {[0, 1, 2, 3].map((value) => {
                        const labelId = `checkbox-list-label-${value}`;

                        return (
                            <ListItem
                                key={value}
                                secondaryAction={
                                    <IconButton edge="end" aria-label="comments">
                                        <CommentIcon className="checklist-box" />
                                    </IconButton>
                                }
                                disablePadding
                            >
                                <ListItemButton role={undefined} onClick={handleToggle(value)} dense>
                                    <ListItemIcon>
                                        <Checkbox
                                            className="checklist-box"
                                            edge="start"
                                            checked={checked.indexOf(value) !== -1}
                                            tabIndex={-1}
                                            disableRipple
                                            inputProps={{ 'aria-labelledby': labelId }}
                                        />
                                    </ListItemIcon>

                                    <ListItemText className="checklist-box-text" id={labelId} primary={`Line item ${value + 1}`} />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
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
