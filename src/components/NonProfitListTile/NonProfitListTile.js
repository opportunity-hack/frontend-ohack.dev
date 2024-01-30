import React, {useEffect, useState} from 'react';
// import Link from 'next/link';
import TagIcon from '@mui/icons-material/Tag';
// import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';

import AddAlertIcon from '@mui/icons-material/AddAlert';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

import SupportIcon from '@mui/icons-material/Support';
import DeveloperModeIcon from '@mui/icons-material/DeveloperMode';
import Badge from '@mui/material/Badge';

import { useAuth0 } from '@auth0/auth0-react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import {
  CountDetailsText,
  NonProfitDescText,
  NonProfitName,
  TileLink,
} from './styles';
import { Chip } from '@mui/material';

export default function NonProfitListTile({
  onSelected,  
  npo,    
  needs_help_flag,
  production_flag,
  icon,
}) {
  const { user } = useAuth0();  
  
  const [productionProblemStatementCount, setProductionProblemStatementCount] = useState(0);
  const [needHelpProblemStatementCount, setNeedHelpProblemStatementCount] = useState(0);
  const [hackersCount, setHackersCount] = useState(0);
  const [mentorsCount, setMentorsCount] = useState(0);

  
  useEffect(() => {
    if (npo && npo.problem_statements) {

      var totalProductionCount = 0;
      var totalNeedsHelpCount = 0;            

      let hackerSet = new Set();
      let mentorSet = new Set();

      npo.problem_statements.forEach((problem_statement_id) => {
        fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/problem_statement/${problem_statement_id}`)
          .then((response) => response.json())
          .then((data) => {                        
            if( data.status === "production")
            {
              totalProductionCount++;
            }
            else {
              totalNeedsHelpCount++;
            }

            setProductionProblemStatementCount(totalProductionCount);
            setNeedHelpProblemStatementCount(totalNeedsHelpCount);
            
            // For data.helping, check if type is "hacker" or "mentor", then increase hackersCount or mentorsCount accordingly
            
            if (data.helping != null) {
              data.helping.forEach((helping) => {
                if (helping.type === 'hacker') {                  
                  hackerSet.add(helping.slack_user);
                } else if (helping.type === 'mentor') {                  
                  mentorSet.add(helping.slack_user);
                }
              });
            }
            setHackersCount(hackerSet.size);
            setMentorsCount(mentorSet.size);
            
          })
          .catch((error) => {
            // Handle the error
            console.error(error);
          });
      });

      


    }
  }, [npo]);

  var number_of_problem_statements_helping_with = 0;

  // Function to get the first 50 words of a string
  const getFirst50Words = (str) => {
    var output = str.split(/\s+/).slice(0, 50).join(' ');
    
    // If output ends with a comma, remove it
    if (output.endsWith(',')) {
      output = output.slice(0, -1);
    }

    // If longer than 50 words, also add ...
    if (str.split(/\s+/).length > 50) {
      return output + '...';
    }

    

    return output;
  };


  // TODO: add this to a lib. Preferrably slack related.
  const openCodeSample = (e, channel) => {
    e.preventDefault();
    window.open(
      `https://opportunity-hack.slack.com/app_redirect?channel=${channel}`,
      '_blank',
      'noopener noreferrer'
    );
  };

  var slackDetails = '';
  if (!npo || npo.slack_channel == null || npo.slack_channel === '') {
    slackDetails = (
      <Tooltip
        title={
          <span style={{ fontSize: '15px' }}>
            We don't have an official Slack channel, join this general one to
            get the dialog going.
          </span>
        }
      >
        <Button
          onClick={(event) => openCodeSample(event, 'npo-selection')}
          color='primary'
          startIcon={<TagIcon />}
          variant='outlined'
          size='medium'
        >
          npo-selection
        </Button>
      </Tooltip>
    );
  } else {
    slackDetails = (
      <Tooltip
        title={
          <span style={{ fontSize: '15px' }}>
            Join their dedicated channel in Slack
          </span>
        }
      >
        <Button
          onClick={(event) => openCodeSample(event, npo.slack_channel)}
          color={needHelpProblemStatementCount ? 'warning' : 'primary'}
          startIcon={<TagIcon />}
          variant='contained'
          size='large'
        >
          {npo.slack_channel}
        </Button>
      </Tooltip>
    );
  }

  if (
    npo.problem_statements != null &&
    user != null &&
    npo.problem_statements.length > 0
  ) {
    npo.problem_statements.forEach((ps) => {
      if (ps?.helping != null) {
        ps.helping.forEach((helping) => {
          if (helping.slack_user === user.sub) {
            number_of_problem_statements_helping_with++;
          }
        });
      }
    });
  }

  var helping_text = '';

  // TODO: Use ?
  // var helping_class = 'ohack-nonprofit-feature';
  
  if (number_of_problem_statements_helping_with > 0) {
    helping_text = (
      <center>
        <em>You're helping here!</em>
      </center>
    );
    // helping_class = 'ohack-nonprofit-feature-helping';
  }

  const displayCountDetails = () => {
    if (npo && npo.problem_statements && npo.problem_statements.length === 0) {
      return (
        <div>
          <CountDetailsText>No Projects Yet!</CountDetailsText>
        </div>
      );
    } else {
      return (
        <div>
          <CountDetailsText variant='h2'>
            {npo.problem_statements?.length} Project
            {npo.problem_statements?.length > 1 ? 's' : ''}
          </CountDetailsText>

          <Box
            sx={{
              flexGrow: 1,
              marginTop: 3,
              marginBottom: 2,
              color: '#383838',
            }}
          >
            <Grid container spacing={2} marginLeft='0px' marginTop='5px'>
              <Grid container direction='row' spacing={1.5}>
                <Grid item>
                  <Chip
                    icon={<AddAlertIcon color='warning' fontSize='medium' />}
                    color={
                      needHelpProblemStatementCount ? 'warning' : 'primary'
                    }
                    label={`${needHelpProblemStatementCount} Project${
                      needHelpProblemStatementCount === 1 ? '' : 's'
                    } 
                need${needHelpProblemStatementCount === 1 ? 's' : ''} help`}
                    style={{ fontSize: '1.5rem' }}
                  />
                </Grid>
                <Grid item>
                  <Chip
                    icon={
                      <WorkspacePremiumIcon color='success' fontSize='medium' />
                    }
                    color='success'
                    label={`${productionProblemStatementCount} Project${
                      productionProblemStatementCount === 1 ? '' : 's'
                    } 
                ${
                  productionProblemStatementCount === 1 ? 'is' : 'are'
                } live`}
                    style={{ fontSize: '1.5rem' }}
                  />
                </Grid>
                <Grid item>
                  <Chip
                    icon={<DeveloperModeIcon color='info' fontSize='medium' />}
                    color='info'
                    variant='outlined'
                    label={`${hackersCount} Hacker${
                      hackersCount === 1 ? '' : 's'
                    } 
                ${hackersCount === 1 ? 'is' : 'are'} working on this`}
                    style={{ fontSize: '1.5rem' }}
                  />
                </Grid>
                <Grid item>
                  <Chip
                    icon={<SupportIcon color='info' fontSize='medium' />}
                    color='info'
                    variant='outlined'
                    label={`${mentorsCount} Mentor${
                      mentorsCount === 1 ? '' : 's'
                    } 
                ${mentorsCount === 1 ? 'is' : 'are'} assigned`}
                    style={{ fontSize: '1.5rem' }}
                  />
                </Grid>
              </Grid>
              {/* <Grid item xs={6}>
                <Badge
                  showZero
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                  badgeContent={need_help_problem_statement_count}
                  color='error'
                >
                  <AddAlertIcon color='error' fontSize='large' />
                </Badge> 
              </Grid> */}
              {/* <Grid item xs={6}>
                <Badge
                  showZero
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                  badgeContent={hacker_count}
                  color='secondary'
                >
                  <DeveloperModeIcon fontSize='large' />
                </Badge>
                Hackers
              </Grid> */}
              {/* <Grid item xs={7}>
                <Badge
                  showZero
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                  badgeContent={in_production_problem_statement_count}
                  color='success'
                >
                  <WorkspacePremiumIcon color='success' fontSize='large' />
                </Badge>
                Live
              </Grid> */}
              {/* <Grid item xs={5}>
                <Badge
                  showZero
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                  badgeContent={mentor_count}
                  color='secondary'
                >
                  <SupportIcon fontSize='large' />
                </Badge>
                Mentors
              </Grid> */}
            </Grid>
          </Box>
        </div>
      );
    }
  };

  if ( (needs_help_flag && needHelpProblemStatementCount > 0) || (production_flag && productionProblemStatementCount > 0) ) {    
    return (
      <TileLink
        href={`/nonprofit/${npo.id}`}
        sx={{
          borderTop: `2px solid ${
            needHelpProblemStatementCount ? '#e65100' : '#66cefb'
          }`,
          '&:hover': {
            borderTop: `4px solid ${
              needHelpProblemStatementCount ? '#e65100' : '#66cefb'
            }`,
          },
        }}
      >
        {helping_text}

        <Grid container direction='row' justifyContent='space-between'>
          <NonProfitName variant='h3' flex='1'>
            {npo.name}
          </NonProfitName>
          {needHelpProblemStatementCount ? (
            <Badge
              showZero
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              badgeContent={needHelpProblemStatementCount}
              color='warning'
              style={{
                marginLeft: '2rem',
              }}
            >
              <AddAlertIcon color='warning' fontSize='large' />
            </Badge>
          ) : (
            ''
          )}
        </Grid>
        {displayCountDetails()}

        <NonProfitDescText>{npo.description ? getFirst50Words(npo.description) : "No description available."}</NonProfitDescText>
        <Grid
          container
          direction='row'
          justifyContent='center'
          alignItems='center'
          sx={{ marginTop: 2 }}
        >
          {slackDetails}
        </Grid>
      </TileLink>
    );
  }
  else {
    return "";
  }
}
