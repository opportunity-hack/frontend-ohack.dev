// components/content/CareerTransitionContent.jsx
import { Typography, Box } from "@mui/material";
import { LinkStyled } from "../../styles/nonprofit/styles";

const style = { fontSize: "14px" };

const CareerTransitionContent = () => (
  <>
    <Typography variant="body1" style={style} paragraph>
      Transitioning into tech can be challenging - you need experience to get a
      job, but need a job to get experience. Opportunity Hack bridges this gap
      by providing real development experience through nonprofit projects.
    </Typography>

    <Typography variant="h4" gutterBottom>
      Why Nonprofit Projects Are Perfect for Career Changers
    </Typography>

    <Box component="ul" sx={{ listStyle: "disc", pl: 4, mb: 3 }}>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Gain Production Experience:</strong> Build and deploy real
          applications that organizations depend on. Learn deployment, testing,
          and maintenance in a supportive environment.
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Work with Modern Tech Stacks:</strong> Practice with current
          technologies like React, Node.js, Python, and cloud services that
          employers demand.
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Build Your Network:</strong> Connect with experienced
          developers, product managers, and tech professionals who can provide
          references and job referrals.
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Show Initiative:</strong> Demonstrate to potential employers
          that you're proactive about learning and contributing to meaningful
          projects.
        </Typography>
      </li>
    </Box>

    <Typography variant="h4" gutterBottom>
      Leveraging Your Previous Experience
    </Typography>

    <Box component="ul" sx={{ listStyle: "disc", pl: 4, mb: 3 }}>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Project Management:</strong> Apply your existing
          organizational and planning skills to tech projects
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Communication:</strong> Use your professional experience to
          bridge the gap between technical and non-technical stakeholders
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Problem Solving:</strong> Your real-world experience brings
          valuable perspective to solution design
        </Typography>
      </li>
    </Box>

    <Typography variant="h4" gutterBottom>
      Getting Started
    </Typography>

    <Box component="ol" sx={{ pl: 4, mb: 3 }}>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Complete your{" "}
          <LinkStyled href="/profile">developer profile</LinkStyled>{" "}
          highlighting your transferable skills
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Join our <LinkStyled href="/signup">Slack community</LinkStyled> and
          the #career-changers channel
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Find a <LinkStyled href="/nonprofits">starter project</LinkStyled>{" "}
          that matches your current skill level
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Attend <LinkStyled href="/office-hours">office hours</LinkStyled> to
          get guidance from experienced developers
        </Typography>
      </li>
    </Box>

    <Typography variant="h4" gutterBottom>
      Building Your Portfolio
    </Typography>

    <Typography variant="body1" style={style} paragraph>
      Document your journey and contributions:
    </Typography>

    <Box component="ul" sx={{ listStyle: "disc", pl: 4, mb: 3 }}>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Maintain detailed documentation of your problem-solving process
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Create case studies of challenges overcome and solutions implemented
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Track metrics and impact of your contributions
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Build a GitHub portfolio showcasing your code quality and
          collaboration
        </Typography>
      </li>
    </Box>
  </>
);

export default CareerTransitionContent;
