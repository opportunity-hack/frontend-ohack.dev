import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Head from 'next/head';
import { LayoutContainer } from '../../styles/nonprofit/styles';
import { TitleContainer } from '../../styles/nonprofit/styles';
import Typography from '@mui/material/Typography';

import ReactPixel from 'react-facebook-pixel';
import * as ga from '../../lib/ga';

import axios from 'axios';



export default function Unsubscribe({email_address}) {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState(email_address);
    const [status, setStatus] = useState(''); // 'success' or 'error'

    const options = {
        autoConfig: true, // set pixel's autoConfig. More info: https://developers.facebook.com/docs/facebook-pixel/advanced/
        debug: false, // enable logs
    };
    var advancedMatching = null;
    if (email_address && email_address !== '') {
        advancedMatching = { em: email_address };
    }
    ReactPixel.init(process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID, advancedMatching, options);


    const handleClickOpen = () => {
        setStatus('');
        setOpen(true);

        ga.event({
            action: 'UnsubscribeOpened',
            params: {
                email: email_address,
            },
        });

        ReactPixel.track('UnsubscribeOpened', {
            value: 0.00,
            currency: 'USD',            
        });

    };

    const handleClose = () => {
        setOpen(false);
    };

    

    const handleUnsubscribe = () => {
        ga.event({
            action: 'Unsubscribe',
            params: {
                email: email_address,
            },
        });

        ReactPixel.track('Unsubscribe', {
            value: 0.00,
            currency: 'USD',
        });


        axios.post(`${process.env.NEXT_PUBLIC_API_NODEJS_SERVER_URL}/api/unsubscribe`, {
            email: email,
        })
            .then((response) => {
                console.log(response);
                setStatus('Success! You have been unsubscribed from our newsletter.');
                setEmail('');
                setOpen(false);
            })
            .catch((error) => {
                console.log(error);
                setStatus('Error! There was a problem unsubscribing you from our newsletter.');                
                setOpen(false);
            });

    };

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    
    return (
        <LayoutContainer key="unsubscribe" container>
            <Head>
                <title>Unsubscribe :( | Opportunity Hack</title>
                <meta
                    name='description'
                    content="Don't go! You'll miss out on our latest updates."
                />
                <meta property='og:title' content="Unsubscribe :( | Opportunity Hack" />
                <meta
                    property='og:description'
                    content="Don't go! You'll miss out on our latest updates."
                />
                
                <meta property='og:url' content="https://ohack.dev/unsubscribe" />
                
                <meta property='twitter:domain' content='ohack.dev' />                
            </Head>
            <TitleContainer container>
            <h1>Unsubscribe from our newsletter</h1>
            <p>Don't go! You'll miss out on our latest updates.</p>
            <p>Click the button below and enter your email address below to unsubscribe.</p>
            <p>Thanks for your interest in Opportunity Hack!</p>
            <p>~ The Opportunity Hack Team</p>
            <br /><br />
            <Button variant="outlined" color="secondary" onClick={handleClickOpen}>
                    Unsubscribe {email_address}
            </Button>
            <Typography variant="h6" textAlign="center" component="div" sx={{ flexGrow: 1 }}>
                {status}
            </Typography>
            </TitleContainer>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Unsubscribe from newsletter?"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to unsubscribe from our newsletter? You'll miss out on our latest updates.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="email"
                        label="Email Address"
                        type="email"
                        fullWidth
                        value={email}
                        onChange={handleEmailChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        No, I'll stay
                    </Button>
                    <Button onClick={handleUnsubscribe} color="secondary" autoFocus>
                        Yes, Unsubscribe me
                    </Button>
                </DialogActions>
            </Dialog>
        </LayoutContainer>

    );
}
