// Create page
import React, { useEffect } from 'react';
import Link from 'next/link';
import { Stack } from '@mui/material';
import { Typography } from '@mui/material';
import Head from 'next/head';
import { useEnv } from '../../context/env.context';
import Image from 'next/image';
import ReactPixel from 'react-facebook-pixel';
import * as ga from '../../lib/ga';
import { InstagramEmbed } from 'react-social-media-embed';
import { Grid } from '@mui/material';
import LoginOrRegister from '../LoginOrRegister/LoginOrRegister';
import InsertInvitationIcon from '@mui/icons-material/InsertInvitation';


import {
    InnerContainer,
    LayoutContainer,
    SlackSignupContainer,    
    SlackLink,    
    ButtonStyled
} from "./styles";

export default function OfficeHours({ previousPage }) {    
        
    const style = { fontSize: '14px' };

    const options = {
        autoConfig: true, // set pixel's autoConfig. More info: https://developers.facebook.com/docs/facebook-pixel/advanced/
        debug: false, // enable logs
    };
    const advancedMatching = undefined; // { em: 'some@email.com' }; // optional, more info: https://developers.facebook.com/docs/facebook-pixel/advanced/advanced-matching
    
    useEffect(() => {
       if (typeof window !== 'undefined') {
      ReactPixel.init(process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID, advancedMatching, options);
    }
    }, []);


    
    return (
        <LayoutContainer container>
            <InnerContainer container>
                <Head>
                    <title>Office Hours - Opportunity Hack Developer Portal</title>
                </Head>
                <SlackSignupContainer>                                            
                        <Typography variant="h1">Office Hours</Typography>
                        <Typography variant="body1" style={style}>
                        We provide weekly office hours using a <SlackLink target="_blank" href="https://opportunity-hack.slack.com/archives/C1Q6YHXQU">Slack huddle in #general</SlackLink> for anyone volunteering to write code for any nonprofit we support at Opportunity Hack.
                        <br/><br/>
                        We know that it's hard to find time to volunteer, so we're here to help you get started and make the most of your time.
                        </Typography>
                        
                        <Typography variant="h4" mt={3} >Grab a Google Calendar Invite</Typography>
                        <Typography variant="body1" mb={2}>We alternate between 10am and 2pm PST each Friday</Typography>
                        
                        <Stack spacing={1} direction="row" mt={2} alignContent="start" justifyContent="start" justifyItems="start" textAlign="start">
                            <Typography variant="body1" style={style}>10am to 11am PST Fridays</Typography>
                            <Link
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://calendar.google.com/calendar/event?action=TEMPLATE&tmeid=Y29zajRwaG02Z3BqYWI5bTZvbzNnYjlrNzBwajRiYjFjY3JtOGI5a2M0b20ycDlnY2xnbTRlMW9jOF8yMDI0MDQxMlQxNzAwMDBaIGNfMTVjNmYyNWRkYzYxMTA4MWExYzU5ZWY5MTdjNjQ3ZmI0OGE1OGFlNzE2OTE2YzU3OTJlZWRlNmEyMjM2ZWQxMEBn&tmsrc=c_15c6f25ddc611081a1c59ef917c647fb48a58ae716916c5792eede6a2236ed10%40group.calendar.google.com&scp=ALL" >
                            <ButtonStyled                    
                                variant="contained"
                                color="secondary"><InsertInvitationIcon/>                      
                                &nbsp;Add to Google Calendar
                            </ButtonStyled>                                    
                        </Link>                            
                        </Stack>                        

                        <Stack spacing={1} direction="row" mt={2} alignContent="start" justifyContent="start" justifyItems="start" textAlign="start">
                            <Typography variant="body1" style={style}>2pm to 3pm PST Fridays</Typography>
                            <Link
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://calendar.google.com/calendar/event?action=TEMPLATE&tmeid=Y3BoMzBwajRjcGltYWI5a2Nvc202YjlrNzBwbTRiOW9jNWkzYWI5aTZrcmppZHBnY2tvMzRwOW42NF8yMDI0MDQwNVQyMTAwMDBaIGNfMTVjNmYyNWRkYzYxMTA4MWExYzU5ZWY5MTdjNjQ3ZmI0OGE1OGFlNzE2OTE2YzU3OTJlZWRlNmEyMjM2ZWQxMEBn&tmsrc=c_15c6f25ddc611081a1c59ef917c647fb48a58ae716916c5792eede6a2236ed10%40group.calendar.google.com&scp=ALL" >
                            <ButtonStyled                                        
                                variant="contained"
                                color="secondary"><InsertInvitationIcon/>                     
                                &nbsp;Add to Google Calendar
                            </ButtonStyled>                                    
                        </Link>                            
                        </Stack>
                                                
                                
                    <InstagramEmbed url="https://www.instagram.com/p/CqFz5PWB9Og/" maxWidth={328} height={500} style={{
                        marginTop: '30px',
                        maxWidth: '328px',
                    }} />                                                

                    <LoginOrRegister introText="Ready to join?" previousPage={"/office-hours"} />                                                               
                </SlackSignupContainer>
            </InnerContainer>
        </LayoutContainer>        
    )
}