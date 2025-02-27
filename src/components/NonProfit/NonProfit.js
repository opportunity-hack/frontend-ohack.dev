import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import useNonprofit from '../../hooks/use-nonprofit';
import Head from 'next/head';
import Image from 'next/image';
import { useAuthInfo } from '@propelauth/react';
import { Puff } from 'react-loading-icons';


// Icons and MUI components
import LanguageIcon from '@mui/icons-material/Language';
import TagIcon from '@mui/icons-material/Tag';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Grid } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { red } from '@mui/material/colors';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

// Analytics
import * as ga from '../../lib/ga';
import { useFeatureValue } from "@growthbook/growthbook-react";
import ReactPixel from 'react-facebook-pixel';

import {
  ChannelChip,
  DescriptionStyled,
  LayoutContainer,
  LinkStyled,
  ProjectsChip,
  ProjectsContainer,
  ProjectsGrid,
  TitleBanner,
  TitleChipContainer,
  TitleContainer,
  TitleStyled,
  ApplyButtonContainer,
  ApplyButton
} from '../../styles/nonprofit/styles';

// Lazy loaded components
const ProblemStatement = lazy(() => import('../../components/ProblemStatement/ProblemStatement'));
const LoginOrRegister = lazy(() => import('../LoginOrRegister/LoginOrRegister'));


// Loading placeholder component
const LoadingPlaceholder = () => (
  <Grid container justifyContent='center'>
    <Puff stroke='#0000FF' />
  </Grid>
);

const NonProfit = React.memo(function NonProfit(props) {
  const nonprofit_cta_text = useFeatureValue("nonprofit_page_cta_text", "Hey there, it looks like there are no active projects with this organization. Let us know how we can help:");
  const { nonprofit_id } = props;
  const { user } = useAuthInfo();
  
  const [checked, setChecked] = useState([]);
  const [message, setMessage] = useState('');
  const [isPixelInitialized, setIsPixelInitialized] = useState(false);

  const { handle_npo_problem_statement_edit, nonprofit } = useNonprofit(nonprofit_id);
  
  // Initialize Facebook Pixel only once
  useEffect(() => {
    if (typeof window !== 'undefined' && !isPixelInitialized) {
      const options = {
        autoConfig: true,
        debug: false,
      };
      
      ReactPixel.init(process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID, undefined, options);
      setIsPixelInitialized(true);
    }
  }, [isPixelInitialized]);

  const gaButton = useCallback(async (action, actionName) => {
    ReactPixel.track(action, { action_name: actionName });
    
    ga.event({
      action: action,
      params: {
        action_name: actionName,
      },
    });
  }, []);

  const onComplete = useCallback((amessage) => {
    setMessage(amessage);
  }, []);

  const handleSubmit = useCallback(async () => {
    handle_npo_problem_statement_edit(nonprofit_id, checked, onComplete);
  }, [nonprofit_id, checked, handle_npo_problem_statement_edit, onComplete]);

  const nonProfitPageName = "from_nonprofit_page_" + nonprofit.id;
  const style = { fontSize: '14px' };
  
  function getTwoLetters(str) {
    if (typeof str === 'string' && str !== '') {
      if (str.includes(' ')) {
        const strArr = str.split(' ');
        return strArr[0].charAt(0) + strArr[1].charAt(0);
      } else {
        return str.charAt(0);
      }
    }
    return '';
  }

  let slack_details = '';
  if (nonprofit.slack_channel && nonprofit.slack_channel !== '') {
    slack_details = (
      <Typography>
        <Tooltip title='This is their dedicated channel in Slack'>
          <IconButton>
            <TagIcon />
          </IconButton>
        </Tooltip>
        {nonprofit.slack_channel}
      </Typography>
    );
  }

  let description = nonprofit.description ?? '';
  
  const loginCallToAction = (
    <Suspense fallback={<LoadingPlaceholder />}>
      <LoginOrRegister
        introText={"Whoa there - you need to login or create an account first."}
        previousPage={"/nonprofit/" + nonprofit_id}
      />
    </Suspense>
  );
  
  const image = nonprofit.image || '/npo_placeholder.png';
  const projectCount = nonprofit.problem_statements?.length || 0;

  // Preload the nonprofit image for better LCP
  useEffect(() => {
    if (nonprofit.image) {
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'image';
      preloadLink.href = nonprofit.image;
      document.head.appendChild(preloadLink);
      
      return () => {
        document.head.removeChild(preloadLink);
      };
    }
  }, [nonprofit.image]);
  
  const renderProblemStatements = () => {
    if (nonprofit.id === null) {
      return <LoadingPlaceholder />;
    } 
    
    if (!nonprofit.problem_statements || nonprofit.problem_statements.length === 0) {      
      return (
        <Grid container>
          <Grid item style={{ fontSize: "13px"}} xs={12}>
            <Typography style={style}>{nonprofit_cta_text}</Typography>
            <br/>
          </Grid>
          <ApplyButtonContainer>
            <ApplyButton 
              onClick={() => gaButton("click_apply", nonProfitPageName)} 
              href="/nonprofits/apply">
              Submit your project ideas!
            </ApplyButton>
          </ApplyButtonContainer>
        </Grid>
      );
    }
    
    return nonprofit.problem_statements.map((ps) => (
      <Suspense key={ps.id} fallback={<LoadingPlaceholder />}>
        <ProblemStatement
          problem_statement_id={ps}
          user={user}
          npo_id={nonprofit_id}
        />
      </Suspense>
    ));
  };

  return (
    <LayoutContainer key={nonprofit_id} container>
      <Head>
        <title>{nonprofit.name} | Opportunity Hack</title>
        <meta
          name='description'
          content={`${nonprofit.name} - ${projectCount} projects.`}
        />
        <meta property='og:title' content={`${nonprofit.name} | Opportunity Hack`} />
        <meta
          property='og:description'
          content={`${nonprofit.name} - ${projectCount} projects.`}
        />
        <meta property='og:image' content={image} />
        <meta property='og:url' content={`https://ohack.dev/nonprofit/${nonprofit_id}`} />
        <meta name='twitter:card' content='summary_large_image' />
        <meta property='twitter:domain' content='ohack.dev' />
        <meta
          property='twitter:url'
          content={`https://ohack.dev/nonprofit/${nonprofit_id}`}
        />
        <meta name='twitter:title' content={`${nonprofit.name} | Opportunity Hack`} />
        <meta
          name='twitter:description'
          content={`${nonprofit.name} - ${projectCount} projects.`}
        />
        <meta name='twitter:image' content={image} />
        <meta name="twitter:creator" content="@opportunityhack" />
        {/* Preload critical resources */}
        <link rel="preload" href={image} as="image" />
      </Head>

      <TitleBanner>
        {/* Replace Parallax with optimized Next.js Image */}
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <Image
            src={image}
            alt={`${nonprofit.name} banner`}
            layout="fill"
            objectFit="cover"
            priority={true}
            quality={75}
          />
        </div>
      </TitleBanner>
      
      <TitleContainer container>
        {nonprofit.id ? (
          <>
            <Grid item>
              <TitleChipContainer>
                <TitleStyled variant='h2' style={{paddingBottom: "0"}}>
                  <Avatar
                    sx={{ bgcolor: red[500] }}
                    aria-label='npo-avatar'
                    style={{ marginRight: '1.5rem' }}
                  >
                    {getTwoLetters(nonprofit.name)}
                  </Avatar>
                  {nonprofit.name}
                </TitleStyled>
                <ProjectsChip
                  color='default'
                  icon={<AccountTreeIcon />}
                  label={`${projectCount} project${projectCount !== 1 ? 's' : ''} available`}
                />                
              </TitleChipContainer>
            </Grid>
            
            <Grid item>
              {description && (
                <Typography style={{fontSize:"13px"}}>{description}</Typography>
              )}

              {nonprofit.website && (
                <DescriptionStyled>
                  <LanguageIcon /> {' '}
                  <LinkStyled href={nonprofit.website} target='_blank' rel='noreferrer'>
                    {nonprofit.website}
                  </LinkStyled>
                </DescriptionStyled>
              )}

              {nonprofit.contact_people && (
                <DescriptionStyled>
                  Point of Contact: {nonprofit.contact_people.map((person) => (
                    <LinkStyled 
                      mr={1} 
                      target="_blank" 
                      href={`https://opportunity-hack.slack.com/app_redirect?channel=${nonprofit.slack_channel}`} 
                      key={person}
                    >
                      {person}
                    </LinkStyled>                                            
                  ))}
                </DescriptionStyled>
              )}

              {nonprofit.slack_channel ? (
                <DescriptionStyled>
                  Looking to get involved? Join the{' '}
                  <LinkStyled href={`https://opportunity-hack.slack.com/app_redirect?channel=${nonprofit.slack_channel}`}>
                    <Tooltip
                      title={
                        <p style={{ fontSize: '1rem', margin: '0' }}>
                          This is their dedicated channel in Slack
                        </p>
                      }
                      arrow
                    >
                      <ChannelChip
                        label={`#${nonprofit.slack_channel}`}
                        variant='outlined'
                        style={{ cursor: 'pointer' }} 
                      />
                    </Tooltip>
                  </LinkStyled>{' '}
                  channel on{' '}
                  <LinkStyled href='https://slack.com/'>Slack</LinkStyled> to
                  join in on the discussion!
                </DescriptionStyled>
              ) : (
                <DescriptionStyled>
                  No Slack channels available.
                </DescriptionStyled>
              )}
            </Grid>
          </>
        ) : (
          <LoadingPlaceholder />
        )}
      </TitleContainer>

      <ProjectsContainer>
        {!user && loginCallToAction}
        <h3>Projects</h3>
        <ProjectsGrid container>
          {renderProblemStatements()}
        </ProjectsGrid>
      </ProjectsContainer>
    </LayoutContainer>    
  );
});

export default NonProfit;


