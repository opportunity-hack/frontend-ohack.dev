import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useEnv } from "../../context/env.context";
import axios from "axios";

import AuthenticationButton from "../buttons/authentication-button";

import Box from '@mui/material/Box';

import { useState, useMemo } from "react";

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SaveIcon from '@mui/icons-material/Save';
import Tooltip from '@mui/material/Tooltip';


export default function LinkAndName({ _link, _name, onComplete }) {
    const { user } = useAuth0();

    const [link, setLink] = useState(_link);
    const [name, setName] = useState(_name);

    return(
        <Box
            key={link}
            sx={{
                display: 'flex',
                flexDirection: 'row',
                p: 1,
                m: 1,
                bgcolor: 'background.paper',
                '& > :not(style)': { m: 1, width: '25ch' },
            }}
        >
            <TextField
                id="outlined-basic"
                label="Link"
                variant="outlined"
                value={link}
                onChange={(event) => setLink(event.target.value)}
            />
            <TextField
                id="outlined-basic"
                label="Name"
                variant="outlined"
                value={name}
                onChange={(event) => setName(event.target.value)}
            />
            <Tooltip title="Save">
                <Button
                    variant="contained"
                    onClick={() => {
                        axios.post(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/link-and-name`,
                            {
                                link: link,
                                name: name,
                            },
                            {
                                headers: {
                                    Authorization: `Bearer ${user.sub}`,
                                },
                            }
                        );
                        onComplete("Saved");
                    }}
                >
                    <SaveIcon />
                </Button>
            </Tooltip>
        </Box>
    );
    
};