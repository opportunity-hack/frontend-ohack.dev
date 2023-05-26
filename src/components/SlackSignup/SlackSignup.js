// Create page
import React from 'react';
import Link from 'next/link';
import axios from 'axios';
import { TextField } from '@mui/material';
import { Button } from '@mui/material';
import { Typography } from '@mui/material';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth0 } from '@auth0/auth0-react';
import { useEnv } from '../../context/env.context';
import Image from 'next/image';


import {
    InnerContainer,
    LayoutContainer,
    SlackSignupContainer,
    SlackSignupDetailText,
    SlackSignupHeader,
    SlackSignupHeadline,
    SlackLink,
    ImageBorder,
    ButtonStyled
} from "./styles";

export default function SlackSignup({ previousPage }) {    
    
    const { slackSignupUrl } = useEnv();
    
    return (
        <LayoutContainer container>
            <InnerContainer container>
                <Head>
                    <title>Slack Signup - Opportunity Hack Developer Portal</title>
                </Head>
                <SlackSignupContainer>
                    <SlackSignupHeader container>                        
                        <SlackSignupHeadline>
                            <Typography variant="h1">Slack Signup</Typography>
                        </SlackSignupHeadline>
                    </SlackSignupHeader>
                    <SlackSignupDetailText>
                        <Typography variant="h5">
                            Click the button to register for a Slack account and join the Opportunity Hack Slack workspace.
                        </Typography>
                    </SlackSignupDetailText>                    
                    <Link
                        target="_blank"
                        rel="noopener noreferrer"
                        href={slackSignupUrl} >
                        <ButtonStyled                    
                        href={`${slackSignupUrl}`}                            
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="contained"
                        color="primary">                        
                            Signup for Opportunity Hack Slack
                        </ButtonStyled>
                    </Link>
                    <br /><br />
                    <Typography variant="h2">Why Slack?</Typography>
                    <Typography variant="h5">
                        Slack is a great tool for communicating with your team and the rest of the Opportunity Hack community. We use Slack to share important information, answer questions, and provide support. We also use Slack to have meetings and share other important information.
                    </Typography>
                    <Typography variant="h2">What do you need to do?</Typography>
                    <Typography variant="h5">
                        <strong>Step 1:</strong> Click on the "Signup for Opportunity Hack Slack" button above to open the Slack signup page in a new tab.
                    </Typography>                    
                    <Typography variant="h5">
                        <strong>Step 2:</strong> Sign in with Google, Apple, or enter your email address and click on the "Next" button.
                    </Typography>
                    <Typography variant="h5">
                        <strong>Step 3:</strong> Fill in your details. You can use your real name or a nickname. You can also upload a profile picture if you want.
                    </Typography>
                    {previousPage && <Typography variant="h5">
                        <strong>Step 4:</strong> <Link href={previousPage}><SlackLink>Head back to the page you were on and sign in.</SlackLink></Link>
                    </Typography>
                    }                    
                    <br />
                    <ImageBorder><Image src="/join_slack_1.png" width={797} height={607} alt="Slack Signup 1" layout="responsive" /></ImageBorder>
                    
                                                                
                </SlackSignupContainer>
            </InnerContainer>
        </LayoutContainer>        
    )
}