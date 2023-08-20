import React from 'react';
// import Link from 'next/link';
import TagIcon from '@mui/icons-material/Tag';
// import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import Link from 'next/link';


import ProblemStatementChip from '../ProblemStatement/ProblemStatementChip';
import Typography from '@mui/material/Typography';

import { useAuth0 } from '@auth0/auth0-react';

import Grid from '@mui/material/Grid';
import {
  CountDetailsText,
  NonProfitHackathonTileLink,
} from './styles';
import { CardActionArea, CardActions, CardContent, CardMedia } from '@mui/material';
import TeamsChip from '../Teams/TeamsChip';


export default function NonProfitHackathonTile({ npo, teams }) {
  const { user } = useAuth0();
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
          variant='contained'
          size='large'
        >
          {npo.slack_channel}
        </Button>
      </Tooltip>
    );
  }

  const problemStatementChips = npo.problem_statements.map((ps) => {
    // If the team has this problem statement, then show it
    if (teams && teams.length > 0) {      
      const team = teams.find((t) => t.problem_statements.includes(ps));
      if (team) {
        return (
          <div>
          <ProblemStatementChip problem_statement_id={ps} />     
          <TeamsChip team_id={team.id} />
          </div>
        );
      }
    }

    return (
     <ProblemStatementChip problem_statement_id={ps} />     
    );
  }
  );


  return (
    <Link href={`/nonprofit/${npo.id}`}>
    <NonProfitHackathonTileLink>     
      <CardActionArea>
        <CardMedia referrerPolicy="no-referrer" component='img' height='140' image={npo.image} alt={npo.name} />
        <CardContent>          
          <Typography gutterBottom variant="h5" component="div">
            {npo.name}
          </Typography>          
          <Typography variant="body2" color="text.secondary">
            {npo.description ? getFirst50Words(npo.description) : "No description available."}
          </Typography>
          
          <CountDetailsText variant='h2'>
            {npo.problem_statements.length} Project{npo.problem_statements.length > 1 ? 's' : ''}
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
        sx={{ marginTop: 2 }}
      >
        {slackDetails}
      </Grid>
      </CardActions>
    </NonProfitHackathonTileLink>
    </Link>
  );

}
