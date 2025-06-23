// components/content/SeniorDeveloperContent.jsx
import { Typography, Box } from '@mui/material';
import { LinkStyled } from '../../styles/nonprofit/styles';

const style = { fontSize: '14px' };

const SeniorDeveloperContent = () => (
  <>
    <Typography variant="body1" style={style} paragraph>
      As a senior developer, your experience is invaluable. At Opportunity Hack,
      you can leverage your expertise to create lasting impact - mentoring
      rising developers, architecting sustainable solutions, and helping
      nonprofits achieve their missions through technology.
    </Typography>

    <Typography variant="h4" gutterBottom>
      Make High-Impact Technical Decisions
    </Typography>

    <Box component="ul" sx={{ listStyle: "disc", pl: 4, mb: 3 }}>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Architecture Design:</strong> Create scalable, maintainable
          solutions that nonprofits can sustain long-term
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Tech Stack Selection:</strong> Guide technology choices that
          balance nonprofit needs with volunteer capabilities
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Code Quality:</strong> Establish best practices, review code,
          and ensure production-ready solutions
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Security & Compliance:</strong> Implement secure solutions
          that protect sensitive nonprofit data
        </Typography>
      </li>
    </Box>

    <Typography variant="h4" gutterBottom>
      Mentor Rising Developers
    </Typography>

    <Box component="ul" sx={{ listStyle: "disc", pl: 4, mb: 3 }}>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Code Reviews:</strong> Provide constructive feedback that
          helps developers grow
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Technical Guidance:</strong> Share your experience through
          pair programming and architecture discussions
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Best Practices:</strong> Teach practical skills in testing,
          deployment, and production readiness
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Career Development:</strong> Help bootcamp grads and
          early-career developers navigate their tech journey
        </Typography>
      </li>
    </Box>

    <Typography variant="h4" gutterBottom>
      Leadership Growth Opportunities
    </Typography>

    <Box component="ul" sx={{ listStyle: "disc", pl: 4, mb: 3 }}>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Tech Lead:</strong> Lead development teams and make key
          technical decisions
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Project Leadership:</strong> Drive project success from
          requirements to deployment
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Cross-functional Collaboration:</strong> Work with product
          managers, designers, and nonprofit stakeholders
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Community Building:</strong> Help shape our technical
          community and mentorship programs
        </Typography>
      </li>
    </Box>

    <Typography variant="h4" gutterBottom>
      Start Making an Impact
    </Typography>

    <Box component="ol" sx={{ pl: 4, mb: 3 }}>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <LinkStyled href="/signup">Join our Slack community</LinkStyled> and
          introduce yourself in #senior-devs
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Lead discussions in our weekly{" "}
          <LinkStyled href="/office-hours">office hours</LinkStyled>
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Review <LinkStyled href="/nonprofits">available projects</LinkStyled>{" "}
          needing technical leadership
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Join our mentor network and start guiding rising developers
        </Typography>
      </li>
    </Box>

    <Typography variant="body1" style={style} paragraph>
      <strong>Looking for senior developers like you:</strong> We especially
      need experienced developers to help with:
    </Typography>

    <Box component="ul" sx={{ listStyle: "disc", pl: 4, mb: 3 }}>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Security and compliance reviews for nonprofit applications
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Architecture guidance for complex integrations
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          DevOps and deployment automation
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Mentoring bootcamp graduates and career transitioners
        </Typography>
      </li>
    </Box>
  </>
);

export default SeniorDeveloperContent;