// components/content/RemoteWorkContent.js
import { Typography, Box } from '@mui/material';
import { LinkStyled } from '../../styles/nonprofit/styles';

const style = { fontSize: '14px' };

const RemoteWorkContent = () => (
  <>
    <Typography variant="body1" style={style} paragraph>
      Remote work requires a unique skill set that goes beyond coding. At
      Opportunity Hack, our distributed teams and asynchronous workflow provide
      the perfect environment to develop and demonstrate remote work
      capabilities.
    </Typography>

    <Typography variant="h4" gutterBottom>
      Essential Remote Work Skills You'll Gain
    </Typography>

    <Box component="ul" sx={{ listStyle: "disc", pl: 4, mb: 3 }}>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Asynchronous Communication:</strong> Learn to collaborate
          effectively across time zones using Slack, GitHub, and async
          documentation.
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Virtual Collaboration:</strong> Master remote pair
          programming, code reviews, and distributed team coordination using
          industry-standard tools.
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Documentation Excellence:</strong> Develop clear technical
          documentation, meeting notes, and process guides that enable async
          teamwork.
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Project Management:</strong> Use Agile methodologies in a
          remote context with tools like GitHub Projects and Slack standups.
        </Typography>
      </li>
    </Box>

    <Typography variant="h4" gutterBottom>
      Proven Remote Work Experience
    </Typography>

    <Box component="ul" sx={{ listStyle: "disc", pl: 4, mb: 3 }}>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Portfolio of Remote Contributions:</strong> Build a GitHub
          profile showing consistent remote collaboration
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Real Distributed Teams:</strong> Work with volunteers and
          nonprofits across multiple time zones
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Measurable Impact:</strong> Track and document your remote
          contributions and their outcomes
        </Typography>
      </li>
    </Box>

    <Typography variant="h4" gutterBottom>
      Get Started with Remote Work
    </Typography>

    <Box component="ol" sx={{ pl: 4, mb: 3 }}>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Join our <LinkStyled href="/signup">Slack community</LinkStyled> and
          introduce yourself
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Attend virtual{" "}
          <LinkStyled href="/office-hours">office hours</LinkStyled> to meet
          mentors
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Pick a <LinkStyled href="/nonprofits">project</LinkStyled> that
          interests you
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Start contributing through async collaboration
        </Typography>
      </li>
    </Box>
  </>
);

export default RemoteWorkContent;