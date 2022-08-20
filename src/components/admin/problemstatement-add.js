import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useEnv } from "../../context/env.context";
import axios from "axios";

import '../../styles/admin.styles.css';

import { AuthenticationButton } from "../buttons/authentication-button";

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

import { useState } from "react";


import Button from '@mui/material/Button';
import SaveIcon from '@mui/icons-material/Save';



export const AddProblemStatement = () => {
    const { apiServerUrl } = useEnv();
    const { getAccessTokenSilently, user } = useAuth0();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("");
    
    const [referenceTitle, setReferenceTitle] = useState("");
    const [referenceLink, setReferenceLink] = useState("");

    const [githubTitle, setGithubTitle] = useState("");
    const [githubLink, setGithubLink] = useState("");

    const [first_thought_of, setFirstThoughtof] = useState("");

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
            setMessage("New Problem Statement has been added");
            console.log(data);
            return data;
        } catch (error) {
            setMessage("Error adding Problem Statement");
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
        
        const references = {}
        references["name"] = referenceTitle
        references["link"] = referenceLink
        
        const github = {}
        github["name"] = githubTitle
        github["link"] = githubLink


        const config = {
            url: `${apiServerUrl}/api/messages/problem_statement`,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            data: {
                title: title,
                description: description,
                status: status,
                references: references,
                github: github,
                first_thought_of: first_thought_of
            }
        };

        const data = await makeRequest({ config, authenticated: true });
        return data;
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
            <h1 className="content__title">Add a project (problem statement)</h1>

            <Box
                component="form"
                sx={{
                    '& .MuiTextField-root': { m: 1, width: '25ch' },
                }}
                noValidate
                autoComplete="off"
            >
                <TextField
                    label="Title"
                    color="secondary"
                    onChange={(e) => setTitle(e.target.value)}
                />

                <TextField
                    label="First Thought Of (Year)"
                    color="primary"
                    onChange={(e) => setFirstThoughtof(e.target.value)}
                />

                <TextField
                    id="outlined-textarea"
                    label="Description"
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add the description of the nonprofit here"
                    multiline
                />

                <TextField
                    label="Status"
                    color="secondary"
                    onChange={(e) => setStatus(e.target.value)}
                />


                <TextField
                    label="Reference Title"
                    color="primary"
                    onChange={(e) => setReferenceTitle(e.target.value)}
                />

                <TextField
                    label="Reference Link"
                    color="primary"
                    onChange={(e) => setReferenceLink(e.target.value)}
                />

                <TextField
                    label="Github Title"
                    color="primary"
                    onChange={(e) => setGithubTitle(e.target.value)}
                />

                <TextField
                    label="Github Link"
                    color="primary"
                    onChange={(e) => setGithubLink(e.target.value)}
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
