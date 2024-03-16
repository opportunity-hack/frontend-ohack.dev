import React from 'react';
// import Link from 'next/link';
import TagIcon from '@mui/icons-material/Tag';
// import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import Link from 'next/link';

import GroupsIcon from '@mui/icons-material/Groups';

import ProblemStatementChip from '../ProblemStatement/ProblemStatementChip';
import Typography from '@mui/material/Typography';

import { useAuthInfo } from '@propelauth/react'

import Grid from '@mui/material/Grid';
import {
  CountDetailsText,
  NonProfitHackathonTileLink,
} from './styles';
import { CardActionArea, CardActions, CardContent, CardMedia } from '@mui/material';
import TeamsChip from '../Teams/TeamsChip';


export default function NonProfitHackathonTile({ eventId, npo, teams }) {
  const { user } = useAuthInfo();
  var slackDetails = '';
    

  // Function to get the first 50 words of a string
  const getFirst50Words = (str) => {
    var output = str.split(/\s+/).slice(0, 30).join(' ');
    
    // If output ends with a comma, remove it
    if (output.endsWith(',')) {
      output = output.slice(0, -1);
    }

    // If longer than 50 words, also add ...
    if (str.split(/\s+/).length > 30) {
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
          color='primary'
          startIcon={<TagIcon />}
          variant='outlined'
          size='small'
          style={{ margin: 0}}
        >
          {npo.slack_channel}
        </Button>
      </Tooltip>
    );
  }

  const problemStatementChips = npo.problem_statements?.map((ps) => {
    
    // If the team has this problem statement, then show it
    if (teams && teams.length > 0) {
      // Get all teams that have this problem statement
      const teamsWithThisProblemStatement = teams.filter((t) =>
        t.problem_statements.includes(ps)
      );
      

      // Return ProblemStatementChip and TeamsChip
      if (teamsWithThisProblemStatement.length > 0) {
        return (
          <div>
            <Link href={`/nonprofit/${npo.id}#create-team-${eventId}-${ps}`}><Button style={{ marginLeft:2}} variant="contained" size="small">Join team</Button></Link>
            
          <ProblemStatementChip problem_statement_id={ps} />     
          {teamsWithThisProblemStatement.map((t) => {
            return <TeamsChip team_id={t.id} />;
          })}
          
          </div>
        );
      }
    }

    // Otherwise only return the problem statement chip
    return (
     <ProblemStatementChip problem_statement_id={ps} />     
    );
  }
  );

  const countOfTeams = npo.problem_statements?.map((ps) => {
    // If the team has this problem statement, then show it
    if (teams && teams.length > 0) {
      // Get all teams that have this problem statement
      const teamsWithThisProblemStatement = teams.filter((t) =>
        t.problem_statements.includes(ps)
      );

      // Return ProblemStatementChip and TeamsChip
      if (teamsWithThisProblemStatement.length > 0) {
        return teamsWithThisProblemStatement.length;
      }
    }

    return 0;
  }
  );
  // Sum up all of the team counts
  const sumOfTeamCountForEachProblemStatement = countOfTeams?.reduce((a, b) => a + b, 0);

  // If npo.image doesn't exist use a placeholder image 
  if (!npo.image) {
    npo.image = 'https://i.imgur.com/hTpVsAX.png';
  }

  return (
    <Link href={`/nonprofit/${npo.id}`}>
    <NonProfitHackathonTileLink>     
      <CardActionArea>
        <CardMedia referrerPolicy="no-referrer" component='img' height='140' image={npo.image} alt={npo.name} />
        <CardContent style={{margin:0, paddingTop:2}}>          
          <Typography gutterBottom variant="h5" component="div">
            {npo.name}
          </Typography>          
          <Typography variant="body2" color="text.secondary">
            {npo.description ? getFirst50Words(npo.description) : "No description available."}
          </Typography>
          
          <CountDetailsText variant='h2'>
            {npo.problem_statements?.length} Project{npo.problem_statements?.length > 1 ? 's' : ''}
          </CountDetailsText>
          <CountDetailsText variant='h5' style={{fontSize: '14px', margin: '1px 0px 8px 2px'}}>
            <GroupsIcon/> {sumOfTeamCountForEachProblemStatement} Team{ (sumOfTeamCountForEachProblemStatement === 0 || sumOfTeamCountForEachProblemStatement > 1) ? 's' : ''}            
          </CountDetailsText>
          {problemStatementChips}  
        </CardContent>        
      </CardActionArea>
      <CardActions>
      <Grid
        container
        direction='row'
        justifyContent='center'
        alignItems='center'
        sx={{ marginTop: 0 }}
      >
        {slackDetails}
      </Grid>
      </CardActions>
    </NonProfitHackathonTileLink>
    </Link>
  );

}
