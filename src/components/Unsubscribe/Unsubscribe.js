import React from 'react';
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



export default function Unsubscribe() {
    const [open, setOpen] = React.useState(false);
    const [email, setEmail] = React.useState('');

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleUnsubscribe = () => {
        // Handle the unsubscribe logic here
        console.log(`Unsubscribed: ${email}`);
        setEmail('');
        setOpen(false);
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
                Unsubscribe
            </Button>
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
