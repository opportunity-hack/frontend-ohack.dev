// components/content/OpenSourceContent.jsx
import { Typography, Box } from '@mui/material';
import { LinkStyled } from '../../styles/nonprofit/styles';

const style = { fontSize: '14px' };

const OpenSourceContent = () => (
  <>
    <Typography variant="body1" style={style} paragraph>
      Build a meaningful open source portfolio while helping nonprofits succeed.
      At Opportunity Hack, you'll work on real-world projects that demonstrate
      your skills and make a tangible difference in communities.
    </Typography>

    <Typography variant="h4" gutterBottom>
      Why Our Open Source Projects Stand Out
    </Typography>

    <Box component="ul" sx={{ listStyle: "disc", pl: 4, mb: 3 }}>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Real-World Impact:</strong> Your code directly helps
          nonprofits serve their communities better
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Complete Project Lifecycle:</strong> Experience everything
          from requirements gathering to deployment
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Active Maintenance:</strong> Projects continue to evolve with
          nonprofit needs, providing ongoing contribution opportunities
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Structured Mentorship:</strong> Get guidance from experienced
          developers through code reviews and pair programming
        </Typography>
      </li>
    </Box>

    <Typography variant="h4" gutterBottom>
      Build Your GitHub Portfolio
    </Typography>

    <Box component="ul" sx={{ listStyle: "disc", pl: 4, mb: 3 }}>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Quality Contributions:</strong> Work on substantive features
          that showcase your skills
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Code Review Experience:</strong> Learn best practices through
          collaborative review processes
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Documentation:</strong> Build technical writing skills through
          project documentation
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Collaboration History:</strong> Show your ability to work on
          team projects
        </Typography>
      </li>
    </Box>

    <Typography variant="h4" gutterBottom>
      Current Tech Stack Opportunities
    </Typography>

    <Box component="ul" sx={{ listStyle: "disc", pl: 4, mb: 3 }}>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Frontend:</strong> React, Next.js, Material-UI, Tailwind CSS
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Backend:</strong> Node.js, Python, Java Spring Boot
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Data:</strong> PostgreSQL, MongoDB, Firebase
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>DevOps:</strong> GitHub Actions, AWS, Google Cloud
        </Typography>
      </li>
    </Box>

    <Typography variant="h4" gutterBottom>
      Start Contributing Today
    </Typography>

    <Box component="ol" sx={{ pl: 4, mb: 3 }}>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Browse our <LinkStyled href="/nonprofits">active projects</LinkStyled>{" "}
          and find one that matches your skills
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Join the discussion in{" "}
          <LinkStyled href="/signup">our Slack community</LinkStyled>
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Check out our{" "}
          <LinkStyled href="https://github.com/opportunity-hack">
            GitHub organization
          </LinkStyled>{" "}
          and existing codebases
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Attend our <LinkStyled href="/office-hours">office hours</LinkStyled>{" "}
          to discuss contribution opportunities
        </Typography>
      </li>
    </Box>

    <Typography variant="h4" gutterBottom>
      Featured Project Needs
    </Typography>

    <Box component="ul" sx={{ listStyle: "disc", pl: 4, mb: 3 }}>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Accessibility Improvements:</strong> Making applications WCAG
          compliant
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>API Development:</strong> Building integrations with common
          nonprofit tools
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Mobile Responsiveness:</strong> Enhancing applications for
          mobile users
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Performance Optimization:</strong> Improving application speed
          and efficiency
        </Typography>
      </li>
    </Box>

    <Typography variant="body1" style={style} paragraph>
      <strong>Note:</strong> All our projects are open source under the MIT
      license, allowing you to showcase your work freely in your portfolio.
    </Typography>
  </>
);

export default OpenSourceContent;