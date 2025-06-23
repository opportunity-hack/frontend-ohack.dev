// components/content/FindNonprofitProjectContent.jsx
import { Typography, Box } from "@mui/material";
import { LinkStyled } from "../../styles/nonprofit/styles";

const style = { fontSize: "14px" };

const FindNonprofitProjectContent = () => (
  <>
    <Typography variant="body1" style={style} paragraph>
      Finding the right nonprofit project is crucial for a successful
      volunteering experience. Let's walk through how to assess projects, match
      them to your skills, and make meaningful contributions.
    </Typography>

    <Typography variant="h4" gutterBottom>
      Assess Your Skills and Interests
    </Typography>

    <Box component="ul" sx={{ listStyle: "disc", pl: 4, mb: 3 }}>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Technical Skills:</strong> List your programming languages,
          frameworks, and tools
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Learning Goals:</strong> Identify technologies or skills you
          want to develop
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Time Availability:</strong> Be realistic about your commitment
          level
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Cause Alignment:</strong> Consider which nonprofit causes
          you're passionate about
        </Typography>
      </li>
    </Box>

    <Typography variant="h4" gutterBottom>
      Project Evaluation Checklist
    </Typography>

    <Box component="ul" sx={{ listStyle: "disc", pl: 4, mb: 3 }}>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Tech Stack Match:</strong> Does the project use technologies
          you know or want to learn?
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Project Scope:</strong> Is the scope well-defined and
          achievable?
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Documentation:</strong> Are requirements and setup
          instructions clear?
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Mentorship:</strong> Is there technical guidance available?
        </Typography>
      </li>
    </Box>

    <Typography variant="h4" gutterBottom>
      Where to Find Projects
    </Typography>

    <Box component="ul" sx={{ listStyle: "disc", pl: 4, mb: 3 }}>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Browse our{" "}
          <LinkStyled href="/nonprofits">project directory</LinkStyled> by
          technology or cause
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Join <LinkStyled href="/signup">Slack discussions</LinkStyled> to
          learn about upcoming projects
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Attend <LinkStyled href="/office-hours">office hours</LinkStyled> to
          discuss available opportunities
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Check our{" "}
          <LinkStyled href="https://github.com/opportunity-hack">
            GitHub organization
          </LinkStyled>{" "}
          for active repositories
        </Typography>
      </li>
    </Box>

    <Typography variant="h4" gutterBottom>
      Project Types by Experience Level
    </Typography>

    <Box component="ul" sx={{ listStyle: "disc", pl: 4, mb: 3 }}>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Beginner Friendly:</strong>
          <ul>
            <li>Documentation improvements</li>
            <li>Bug fixes</li>
            <li>Frontend UI enhancements</li>
            <li>Testing and QA</li>
          </ul>
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Intermediate:</strong>
          <ul>
            <li>Feature development</li>
            <li>API integrations</li>
            <li>Database optimizations</li>
            <li>Mobile responsiveness</li>
          </ul>
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Advanced:</strong>
          <ul>
            <li>Architecture design</li>
            <li>Security implementations</li>
            <li>Performance optimization</li>
            <li>DevOps automation</li>
          </ul>
        </Typography>
      </li>
    </Box>

    <Typography variant="h4" gutterBottom>
      Getting Started Successfully
    </Typography>

    <Box component="ol" sx={{ pl: 4, mb: 3 }}>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Start Small:</strong> Begin with manageable tasks to build
          confidence
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Communicate Early:</strong> Engage with the team about your
          interests and availability
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Set Expectations:</strong> Be clear about your time commitment
          and learning goals
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Ask Questions:</strong> Don't hesitate to seek clarification
          or help
        </Typography>
      </li>
    </Box>

    <Typography variant="h4" gutterBottom>
      Red Flags to Watch For
    </Typography>

    <Box component="ul" sx={{ listStyle: "disc", pl: 4, mb: 3 }}>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Unclear or constantly changing requirements
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Lack of technical documentation or project structure
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          No responsive project maintainers or mentors
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Unrealistic deadlines or scope
        </Typography>
      </li>
    </Box>

    <Typography variant="h4" gutterBottom>
      Tips for Long-term Success
    </Typography>

    <Box component="ul" sx={{ listStyle: "disc", pl: 4, mb: 3 }}>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Document your contributions and learning journey
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Stay active in the community and help others
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Consider taking on leadership roles as you gain experience
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Share your experience to inspire others
        </Typography>
      </li>
    </Box>
  </>
);

export default FindNonprofitProjectContent;
