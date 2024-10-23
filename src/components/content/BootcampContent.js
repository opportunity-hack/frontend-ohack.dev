// components/content/BootcampContent.jsx
import { Typography, Box } from "@mui/material";
import { LinkStyled } from "../../styles/nonprofit/styles";

const style = { fontSize: "14px" };

const BootcampContent = () => (
  <>
    <Typography variant="body1" style={style} paragraph>
      While bootcamps provide excellent foundational knowledge, real-world
      project experience is what truly sets candidates apart. At Opportunity
      Hack, we help bootcamp graduates bridge the gap between learning and
      practical application through meaningful nonprofit projects.
    </Typography>

    <Typography variant="h4" gutterBottom>
      Why Nonprofit Projects Are Perfect for Bootcamp Grads
    </Typography>

    <Box component="ul" sx={{ listStyle: "disc", pl: 4, mb: 3 }}>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Real Requirements, Real Users:</strong> Work with actual
          stakeholders who have concrete needs. Learn to gather requirements,
          manage expectations, and deliver solutions that solve real problems.
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Full Development Lifecycle:</strong> Experience the complete
          software development process from requirements gathering to deployment
          and maintenance - something bootcamp projects rarely cover.
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Code Review Experience:</strong> Get feedback from experienced
          developers through our mentorship program. Learn best practices and
          improve your code quality.
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Portfolio Differentiation:</strong> Stand out with projects
          that solve real problems for real organizations, not just tutorial
          projects that every bootcamp grad has.
        </Typography>
      </li>
    </Box>

    <Typography variant="h4" gutterBottom>
      Getting Started
    </Typography>

    <Box component="ol" sx={{ pl: 4, mb: 3 }}>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <LinkStyled href="/signup">Join our Slack community</LinkStyled> and
          introduce yourself in #introductions
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Browse our{" "}
          <LinkStyled href="/nonprofits">current projects</LinkStyled> and find
          one matching your tech stack
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Attend our weekly{" "}
          <LinkStyled href="/office-hours">office hours</LinkStyled> to connect
          with mentors
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Join project discussions and start contributing code
        </Typography>
      </li>
    </Box>

    <Typography variant="h4" gutterBottom>
      Success Tips
    </Typography>

    <Box component="ul" sx={{ listStyle: "disc", pl: 4, mb: 3 }}>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Start with small, manageable tasks to build confidence
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Document your learning journey - it's valuable for job interviews
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Don't be afraid to ask questions in our supportive community
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Focus on writing clean, well-documented code that others can maintain
        </Typography>
      </li>
    </Box>
  </>
);

export default BootcampContent;
