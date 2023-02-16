import React from "react";
import Button from '@mui/material/Button';

export default function LinkedInButton(){
    /**
     * Using the Signup feature requires you to enable
     * the Auth0 New Universal Login Experience in your tenant.
     * Learn more: https://auth0.com/docs/universal-login/new-experience
     */
    return (
        <Button disabled variant="contained">Share to LinkedIn</Button>        
    );
};
