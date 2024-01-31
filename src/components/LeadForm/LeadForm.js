import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import ReactRecaptcha3 from 'react-google-recaptcha3';
import CheckIcon from '@mui/icons-material/Check';

const LeadForm = () => {
    const [email, setEmail] = useState('');
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');    
    const [submitted, setSubmitted] = useState(null);

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    const handleSubmit = (event) => {      
        event.preventDefault();  
        setOpen(true);
    };

    const handleNameChange = (event) => {
        setName(event.target.value);
    };

    const handleClose = () => {
        ReactRecaptcha3.getToken().then((token) => {                
                fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/lead` , {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, token }),
            })
            .then(response => {
                // Handle response
                if (response.ok) {                    
                    setSubmitted(true);                    
                } else {                    
                    setSubmitted(false);
                }
            })
            .catch(error => {
                setSubmitted(false);                
            });
        });


        setOpen(false);
    };

    useEffect(() => {     
        ReactRecaptcha3.init(process.env.NEXT_PUBLIC_GOOGLE_CAPTCHA_SITE_KEY).then(
        (status) => {
            // console.log(status); // Should log SUCCESS
        }
        );
    }, []);    

    return (
        <form onSubmit={handleSubmit}>
            <Grid container spacing={0.5} alignItems="center">
                <Grid item xs={7} sm={7} md={7}>
                    <TextField
                        label="Email Address"
                        variant="outlined"
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        inputProps={{ maxLength: 100 }}
                        fullWidth // Add fullWidth prop to make the TextField wider
                    />
                </Grid>
                <Grid item xs={5} sm={5} md={5}>
                    <Button
                        variant="contained"
                        color={submitted === true ? "success" : submitted === false ? "error" : "primary"}
                        type="submit"
                        endIcon={submitted === true ? <CheckIcon /> : null}
                    >
                        Subscribe to newsletter
                    </Button>
                </Grid>
            </Grid>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Hey! Also tell us your name</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Name"
                        variant="filled"
                        type="text"
                        value={name}
                        onChange={handleNameChange}
                        fullWidth                        
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleClose} color="success">
                        Ship it
                    </Button>
                </DialogActions>
            </Dialog>
        </form>
    );
};

export default LeadForm;
