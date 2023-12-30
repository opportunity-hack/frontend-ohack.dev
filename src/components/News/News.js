import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import {
  ButtonStyled,
  ButtonBasicStyle,
  ButtonGoldStyle,
  GridStyled,
  TextStyled,
  TitleStyled,
  TitleContainer,
  CaptionContainer,
  ButtonContainers,
  TextMuted,
  TitleStyledCenter,
  SpanText,
  EventCards,
  StyledLink,
  BlankContainer,
  TextNewsDescription,
  BackgroundGrid,
} from './styles';
import { CalendarToday } from '@mui/icons-material';
import { Typography } from '@mui/material';
import Link from 'next/link';

function News() {
  const [news, setNews] = useState(
    [
    {
      id: 1,
      title: 'Meta Rayban Smart Glasses',
      description: (
        <TextNewsDescription>
          We are giving away a pair of Meta Rayban Smart Glasses if you like, comment, subscribe to either our Instagram or Threads post OR test our new Equestian Volunteer System
          <br />
            <Grid container direction="column" spacing={1} style={{ marginTop: '10px' }}>
            <Grid item>
              <Link href="https://www.instagram.com/p/C1J-GqgPx7Z/" target="_blank">
                <StyledLink>Instagram Post</StyledLink>
              </Link>
              </Grid>
              <Grid item>
              <Link href="https://www.threads.net/@opportunityhack/post/C1JLummL4EU" target="_blank">
                <StyledLink>Threads Post</StyledLink>
              </Link>
            </Grid>
          </Grid>
        </TextNewsDescription>
      ),
      date: '2023-12-29',
    },
    {
      id: 2,
      title: 'Help Test our Equestrian Volunteering System',
      description: <TextNewsDescription>
        We are looking for volunteers to help us test our new Equestrian Volunteering System.
        <Grid container direction="column" spacing={1} style={{ marginTop: '10px' }}>
          <Grid item>
        <Link href="https://opportunity-hack.slack.com/archives/C1Q6YHXQU/p1703282192049909" target="_blank">
          <StyledLink>Slack post in #general</StyledLink>          
        </Link>
        </Grid>
        <Grid item>
        <Link href="https://www.threads.net/@opportunityhack/post/C1a8YAmryBd" target="_blank">
          <StyledLink>Threads post</StyledLink>
        </Link>
        </Grid>

        </Grid>
      </TextNewsDescription>,      
      date: '2023-12-12',
    },
    {
      id: 3,
      title: 'Cyber Security Questions for High Schoolers',
      description: <TextNewsDescription>
        Any information security experts? We need some help answering questions for high schoolers.
        <Grid container direction="column" spacing={1} style={{ marginTop: '10px' }}>
          <Grid item>
        <Link href="https://opportunity-hack.slack.com/archives/C05USEJ6ENR/p1696304444946079" target="_blank">
          <StyledLink>Slack post in #mentoring-high-school</StyledLink>
        </Link>
        </Grid>
        <Grid item>
        <Link href="https://www.threads.net/@opportunityhack/post/C0nNZgmpbem" target="_blank">
          <StyledLink>Threads post</StyledLink>
        </Link>
        </Grid>
        </Grid>
      </TextNewsDescription>,
      date: '2023-12-08',
    }
  ]
  );

  useEffect(() => {
    // Fetch news data from API or database
    // and set it to the news state
  }, []);

  const handleAddNews = () => {
    // Logic to add news
    // Update the news state with the new news item
  };

  return (
    <EventCards container direction='row' style={{ margin: '1px', padding: '1px' }}>      
      {/* Render news items */}
      {news.map((newsItem) => (
        <BlankContainer xs={12} md={12} lg={12} key={newsItem.id}>
          <TitleContainer container>
            <Grid item xs={12} md={12} lg={12}>
              <TitleStyled variant="h1">{newsItem.title}</TitleStyled>
            </Grid>
            <Grid item xs={12} md={12} lg={12}>
              <TextMuted>
                <CalendarToday style={{ marginRight: '5px' }} />
                {newsItem.date}
              </TextMuted>
            </Grid>
          </TitleContainer>
          <CaptionContainer>
            {newsItem.description}
          </CaptionContainer>
        </BlankContainer>
      ))}
    </EventCards>
  );

}
export default News;
