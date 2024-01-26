import Grid from '@mui/material/Grid';
import {  
  NewsLinkButton,
  SlackButton,  
  TitleStyled,
  TitleContainer,
  CaptionContainer,
  MoreNewsStyle,
  ButtonContainersSmall,
  TextMuted,  
  EventCards,
  BlankContainer,
} from './styles';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { CalendarToday, FileCopy } from '@mui/icons-material'; // Import the FileCopy icon
import { useState } from 'react';
import { Snackbar } from '@mui/material';
import { Alert } from '@mui/material';

import * as ga from '../../lib/ga';
import ReactPixel from 'react-facebook-pixel';
import React, { useEffect } from 'react';
import {Divider} from "@mui/material";

import Link from 'next/link';

function News( {newsData, frontPage} ) {

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text + " More at www.ohack.dev/blog"); // Copy the text to clipboard
    setSnackbarMessage('Text copied!');
    setSnackbarOpen(true);
    gaButton("button_copy",text);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const options = {
    autoConfig: true, // set pixel's autoConfig. More info: https://developers.facebook.com/docs/facebook-pixel/advanced/
    debug: false, // enable logs
  };
  const advancedMatching = undefined; // { em: 'someemail@.com' }; // optional
  
  const initializeReactPixel = async () => {
    ReactPixel.init(process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID, advancedMatching, options);
  };
  
  useEffect(() => {
    initializeReactPixel();
  }, []);
  
  const gaButton = async (action, actionName) => {
    console.log("gaButton", "action:", action, "actionName:", actionName);
    ReactPixel.track(action, { action_name: actionName });

    ga.event({ 
        action: "conversion",
        params: {
          send_to: "AW-11474351176/JCk6COG-q4kZEMjost8q"  
        }      
      });

    ga.event({
      action: action,
      params: {
        action_name: actionName,
      },
    });    
  };

  return (
    <EventCards container direction='row' frontPage={frontPage} style={{ margin: '1px', padding: '8px' }}>      
      { frontPage && <Link href="/blog">        
        <MoreNewsStyle>
          More news
          <ArrowForwardIcon/>
        </MoreNewsStyle>        
      </Link>
      }
      {/* Render news items */}
      {newsData?.map((newsItem) => (
        <BlankContainer xs={12} md={12} lg={12}  key={newsItem.id}>
          <TitleContainer container>
            <Grid item xs={12} md={12} lg={12}>
              <TitleStyled variant="h1">{newsItem.title}
                            
                <SlackButton onClick={() => gaButton("button_slack_post", newsItem.slack_permalink)} target="_blank" variant="outlined" >
                  <Link href={newsItem.slack_permalink} target='_blank'>
                    Slack post
                  </Link>
                </SlackButton>
              
                <FileCopy // Add the FileCopy icon button
                  onClick={() => handleCopy(`${newsItem.title} ${newsItem.description}`)} // Call handleCopy function on click
                  style={{ cursor: 'pointer', marginLeft: '5px' }}
                />
              </TitleStyled>
              
            </Grid>
            <Grid item xs={12} md={12} lg={12}>
              <TextMuted>
                <CalendarToday style={{ marginRight: '5px' }} />
                {newsItem.slack_ts_human_readable}
              </TextMuted>
            </Grid>
          </TitleContainer>
          <CaptionContainer>
            {newsItem.description}
          </CaptionContainer>
          {
            // If there are newsItem.links, render them as a button where name is the title, and url is the <Link> href attribute
            // Filter for links where name starts with #
            // 

          } 
          
          <ButtonContainersSmall style={{ justifyContent: 'center', justifyItems: 'center', textAlign: 'center' }}>
          {            
            newsItem.links && newsItem.links.filter((link) => !link.url.startsWith('#')).map((link) => (            
              <NewsLinkButton key={link.name} onClick={ ()=> gaButton("button_news", link.name+":"+link.url) } variant="contained" href={link.url} target="_blank">
                {link.name}
              </NewsLinkButton>
            
          ))}
          </ButtonContainersSmall>

          <ButtonContainersSmall style={{ marginTop: '10px', justifyContent: 'center', justifyItems: 'center', textAlign: 'center' }}>
          {            
            newsItem.links && newsItem.links.filter((link) => link.url.startsWith('#')).map((link) => (            
                <SlackButton 
                  key={link.name} 
                  onClick={ ()=> gaButton("button_slack", link.name+":"+link.url) } 
                  variant="outlined" 
                  size="small" 
                  href={`https://opportunity-hack.slack.com/app_redirect?channel=${link.name}`} 
                  target="_blank">
                #{link.name}
              </SlackButton>
            
          ))}
          </ButtonContainersSmall>    
            <Divider style={{ marginTop: '2em' }}/>
        </BlankContainer>         
      ))}

      { frontPage && <Link href="/blog">        
        <MoreNewsStyle>
          More news
          <ArrowForwardIcon/>
        </MoreNewsStyle>        
      </Link>
      }

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </EventCards>
  );

}
export default News;
