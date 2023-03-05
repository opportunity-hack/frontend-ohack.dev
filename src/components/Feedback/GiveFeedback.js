import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

import AuthenticationButton from "../../components/buttons/authentication-button";

import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { useRouter } from 'next/router'

import Head from 'next/head';

export default function GiveFeedback() {
    const { user } = useAuth0();
    const router = useRouter()
    const { userid } = router.query;

    const marks = [
        {
            value: 0,
            label: 'Low',
        },
        {
            value: 25,
            label: 'Medium',
        },
        {
            value: 50,
            label: 'High',
        }        
    ];

    const marks_good_great = [
        {
            value: 0,
            label: 'Good',
        },
        {
            value: 25,
            label: 'Great',
        },
        {
            value: 50,
            label: 'Best',
        }
    ];

  


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

    /*
        This page allows a logged-in user to provide feedback for another person
    */

    return (
        <div className="content-layout">
        <Head>
            <title>Feedback for {userid} - Opportunity Hack Developer Portal</title>
        </Head>
            <h1 className="content__title">Provide Feedback Profile</h1>
            <div className="content__body">
                <div className="profile-grid">
                    <div className="profile__header">
                        <img src={user.picture} alt="Profile" className="profile__avatar" />

                        <div className="profile__headline">
                            <h2 className="profile__title">Hi {user.name}</h2>
                            <h4 className="profile__subtitle">You are providing feedback for {userid}</h4>
                        </div>
                    </div>
                    

                    <div className="profile__details">
                        <h2 className="profile__title">How do you know {userid}?</h2>
                        <FormGroup>
                            <FormControlLabel control={<Switch />} label="I mentored this person" />
                            <FormControlLabel control={<Switch />} label="I was on their team" />
                        </FormGroup>

                        <h1 className="profile__title">The What</h1>
                        <h3 className="profile__title">Code Quality</h3>
                        <ul>
                            <li>Unit Tests
                                <Box sx={{ width: 300 }}>
                                    <Slider
                                        aria-label="Custom marks"
                                        defaultValue={25}
                                        step={25}
                                        min={0}
                                        max={50}
                                        valueLabelDisplay="off"
                                        marks={marks}
                                    />
                                </Box>
                            </li>
                            <li>Test Coverage
                                <Box sx={{ width: 300 }}>
                                    <Slider
                                        aria-label="Custom marks"
                                        defaultValue={25}
                                        step={25}
                                        min={0}
                                        max={50}
                                        valueLabelDisplay="off"
                                        marks={marks}
                                    />
                                </Box>
                            </li>
                            <li>Reliability <Box sx={{ width: 300 }}>
                                <Slider
                                    aria-label="Custom marks"
                                    defaultValue={25}                                    
                                    step={25}
                                    min={0}
                                    max={50}
                                    valueLabelDisplay="off"
                                    marks={marks}
                                />
                            </Box>
                            </li>
                            <li>...</li>
                        </ul>
                        <h1 className="profile__title">The How</h1>
                        <h3 className="profile__title">Communication</h3>
                        <Box
                            component="form"
                            sx={{
                                '& .MuiTextField-root': { m: 1, width: '25ch' },
                            }}
                            noValidate
                            autoComplete="off"
                        >
                            <TextField
                                id="outlined-textarea"
                                label="Multiline Placeholder"
                                placeholder="Placeholder"
                                multiline
                            />
                        </Box>
                        <ul>
                            <li># of Slacks per day
                                <Box sx={{ width: 300 }}>
                                    <Slider
                                        aria-label="Custom marks"
                                        defaultValue={25}
                                        step={25}
                                        min={0}
                                        max={50}
                                        valueLabelDisplay="off"
                                        marks={marks_good_great}
                                    />
                                </Box>
                            </li>
                            <li># of Standups per week
                                <Box sx={{ width: 300 }}>
                                    <Slider
                                        aria-label="Custom marks"
                                        defaultValue={0}
                                        step={25}
                                        min={0}
                                        max={50}
                                        valueLabelDisplay="off"
                                        marks={marks_good_great}
                                    />
                                </Box>
                            </li>
                            <li>...</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
