import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

import '../../styles/admin.styles.css';

import { AuthenticationButton } from "../buttons/authentication-button";

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

import { useState } from "react";

import { useNonprofit } from "../../hooks/use-nonprofit";


import Button from '@mui/material/Button';
import SaveIcon from '@mui/icons-material/Save';
import { AdminProblemStatementList } from "./problemstatement-list";



export const EditNonProfit = () => {           
    const {  user } = useAuth0();

    const { handle_npo_problem_statement_edit } = useNonprofit();

    const [checked, setChecked] = useState([]);

    const [npoName, setNpoName] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [description, setDescription] = useState("");
    const [slack_channel, setSlackChannel] = useState("");
    const [website, setWebsite] = useState("");
    const [message, setMessage] = useState("");
    
    
    const onComplete = (amessage) =>
    {
        setMessage(amessage);
    }

    const handleSubmit = async () => {
        return handle_npo_problem_statement_edit(name, email, npoName, description, website, slack_channel, checked, onComplete)
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

           

            <div>
                <Button onClick={handleSubmit} variant="contained" endIcon={<SaveIcon />}>
                    Save
                </Button>
                {message}
            </div>

        </div>
    );
    
};
