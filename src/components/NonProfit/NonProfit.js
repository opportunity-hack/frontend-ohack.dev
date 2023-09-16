import React from 'react';
import { useState } from 'react';

import useNonprofit from '../../hooks/use-nonprofit';

import Head from 'next/head';
// import ProblemStatement from "../../components/problem-statement";
import ProblemStatement from '../../components/ProblemStatement/ProblemStatement';

import LanguageIcon from '@mui/icons-material/Language';
import TagIcon from '@mui/icons-material/Tag';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import Typography from '@mui/material/Typography';
import { Grid } from '@mui/material';

import { useAuth0 } from '@auth0/auth0-react';
import { Puff } from 'react-loading-icons';
import { Parallax } from 'react-parallax';

import Avatar from '@mui/material/Avatar';
import { red } from '@mui/material/colors';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

import ReactMarkdown from 'react-markdown'
import LoginOrRegister from '../LoginOrRegister/LoginOrRegister';


import {
  // CardContainer,
  ChannelChip,
  // ContentContainer,
  DescriptionStyled,
  // DetailsContainer,
  LayoutContainer,
  LinkStyled,
  ProjectsChip,
  ProjectsContainer,
  ProjectsGrid,
  // SlackTooltip,
  TitleBanner,
  TitleChipContainer,
  TitleContainer,
  TitleStyled,
} from '../../styles/nonprofit/styles';

/*
const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));
*/




export default function NonProfit(props) {
  const {
    nonprofit_id
  } = props;
  const { user } = useAuth0();

  
  const [checked, setChecked] = useState([]);
  const [message, setMessage] = useState('');

  const { handle_npo_problem_statement_edit, nonprofit } =
    useNonprofit(nonprofit_id);

  var slack_details = '';
  // var slack_details_plain = '';

  if (nonprofit.slack_channel && nonprofit.slack_channel !== '') {
    // TODO: Use?
    // slack_details_plain = nonprofit.slack_channel;
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
  } else {
    slack_details = '';
  }

  const onComplete = (amessage) => {
    setMessage(amessage);
  };

  const handleSubmit = async () => {
    handle_npo_problem_statement_edit(nonprofit_id, checked, onComplete);
  };

  const problemStatements = () => {
    if (nonprofit.id === null) {
      return (
        <Grid container justifyContent='center'>
          <Puff stroke='#0000FF' />
        </Grid>
      );
    } else {
      if (nonprofit?.problem_statements?.length === 0) {
        return <div>Working on it!</div>;
      } else {        
        return nonprofit?.problem_statements?.map((ps) => {
          return (
            <ProblemStatement
              key={ps.id}
              problem_statement_id={ps}
              user={user}
              npo_id={nonprofit_id}
            />
          );
        });
      }
    }
  };

  var description = '';

  function getTwoLetters(str) {
    if (typeof str === 'string' && str === '') {
      if (str.includes(' ')) {
        const strArr = str.split(' ');
        return strArr[0].charAt(0) + strArr[1].charAt(0);
      } else {
        return str.charAt(0);
      }
    }
  }

  // TODO: Use?
  /* 
  function getWordStr(str) {
    return str.split(/\s+/).slice(0, 50).join(' ');
  }
  */

  if (nonprofit.description != null) {
    description = nonprofit.description;    
  }



  var loginCallToAction = <LoginOrRegister
    introText={"Whoa there - you need to login or create an account first."}
    previousPage={"/nonprofit/" + nonprofit_id}
    />
  

  // More on meta tags
  // https://medium.com/slack-developer-blog/everything-you-ever-wanted-to-know-about-unfurling-but-were-afraid-to-ask-or-how-to-make-your-e64b4bb9254
  
  var image = '/npo_placeholder.png';
  if (nonprofit.image !== undefined) {
    image = nonprofit.image;
  }

  var projectCount = 0;
  nonprofit.problem_statements?.length > 0 ? projectCount = nonprofit.problem_statements?.length : projectCount = 0;

  return (
    <LayoutContainer key={nonprofit_id} container>
    <Head>
      <title>{nonprofit.name} | Opportunity Hack</title>
      <meta
        name='description'
        content={`${nonprofit.name} - ${nonprofit.problem_statements?.length} projects.`}
      />
      <meta property='og:title' content={`${nonprofit.name} | Opportunity Hack`} />
      <meta
        property='og:description'
        content={`${nonprofit.name} - ${nonprofit.problem_statements?.length} projects.`}
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
        content={`${nonprofit.name} - ${nonprofit.problem_statements?.length} projects.`}
      />
      <meta name='twitter:image' content={image} />
      <meta name="twitter:creator" content="@opportunityhack" />
    </Head>

      <TitleBanner>
        <Parallax bgImage={image} strength={300}></Parallax>
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
                  label={`
             ${projectCount} project${
                    nonprofit.problem_statements?.length !== 1 ? 's' : ''
                  } available`}
                />                
              </TitleChipContainer>
            </Grid>
            
            <Grid item>
              {description ? (
                <Typography style={{fontSize:"13px"}}>{description}</Typography>
              ) : (
                ''
              )}

              {nonprofit.website ? (
                <DescriptionStyled>
                  <LanguageIcon /> {' '}
                  <LinkStyled href={nonprofit.website} target='_blank' rel='noreferrer'>
                    {nonprofit.website}
                  </LinkStyled>
                </DescriptionStyled>
              ) : (
                ''
              )}

              {nonprofit.contact_people ? (
                <DescriptionStyled>
                  Point of Contact: {nonprofit.contact_people}
                </DescriptionStyled>
              ) : (
                ''
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
                  </Tooltip></LinkStyled>{' '}
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
          <Grid container justifyContent='center' alignItems='center'>
            <Puff stroke='#0000FF' />
          </Grid>
        )}
      </TitleContainer>

      <ProjectsContainer>
        {!user && loginCallToAction}
        <h3>Projects</h3>
        <ProjectsGrid container>{problemStatements()}</ProjectsGrid>
      </ProjectsContainer>
    </LayoutContainer>
  );
}


