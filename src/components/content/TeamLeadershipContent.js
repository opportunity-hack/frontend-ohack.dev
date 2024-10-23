// components/content/TeamLeadershipContent.js
import { Typography, Box } from "@mui/material";
import { LinkStyled } from "../../styles/nonprofit/styles";

const style = { fontSize: "14px" };

const TeamLeadershipContent = () => (
  <>
    <Typography variant="body1" style={style} paragraph>
      Technical leadership requires more than just coding skills. Leading
      nonprofit projects at Opportunity Hack provides hands-on experience
      managing teams, mentoring developers, and delivering impactful solutions.
    </Typography>

    <Typography variant="h4" gutterBottom>
      Leadership Skills You'll Develop
    </Typography>

    <Box component="ul" sx={{ listStyle: "disc", pl: 4, mb: 3 }}>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Technical Decision Making:</strong> Guide architecture
          choices, tech stack selection, and implementation strategies
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Team Mentoring:</strong> Support junior developers while
          managing project deliverables
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Stakeholder Management:</strong> Work directly with nonprofits
          to understand needs and manage expectations
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Project Planning:</strong> Break down complex problems into
          manageable tasks and timelines
        </Typography>
      </li>
    </Box>

    <Typography variant="h4" gutterBottom>
      Leadership Opportunities
    </Typography>

    <Box component="ul" sx={{ listStyle: "disc", pl: 4, mb: 3 }}>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Tech Lead:</strong> Guide technical decisions and mentor team
          members
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Project Lead:</strong> Manage project timeline, scope, and
          deliverables
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Mentor:</strong> Help newer developers grow their skills
        </Typography>
      </li>
    </Box>

    <Typography variant="h4" gutterBottom>
      Building Your Leadership Portfolio
    </Typography>

    <Box component="ul" sx={{ listStyle: "disc", pl: 4, mb: 3 }}>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Document team achievements and project outcomes
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Track mentorship impact and team growth
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Build case studies of technical decisions and their results
        </Typography>
      </li>
    </Box>

    <Typography variant="h4" gutterBottom>
      Start Leading Today
    </Typography>

    <Box component="ol" sx={{ pl: 4, mb: 3 }}>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <LinkStyled href="/profile">
            Complete your technical profile
          </LinkStyled>
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Join our <LinkStyled href="/signup">Slack community</LinkStyled> and
          the #team-leads channel
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Review <LinkStyled href="/nonprofits">available projects</LinkStyled>{" "}
          needing technical leadership
        </Typography>
      </li>
    </Box>
  </>
);

export default TeamLeadershipContent;
