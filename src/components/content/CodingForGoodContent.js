// components/content/CodingForGoodContent.jsx
import { Typography, Box } from "@mui/material";
import { LinkStyled } from "../../styles/nonprofit/styles";

const style = { fontSize: "14px" };

const CodingForGoodContent = () => (
  <>
    <Typography variant="body1" style={style} paragraph>
      Your programming skills can be a powerful force for positive change.
      Whether you're a seasoned developer or just starting out, your technical
      expertise can help nonprofits amplify their impact and better serve their
      communities.
    </Typography>

    <Typography variant="h4" gutterBottom>
      High-Impact Areas for Developers
    </Typography>

    <Box component="ul" sx={{ listStyle: "disc", pl: 4, mb: 3 }}>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Process Automation:</strong> Help nonprofits save hundreds of
          hours by automating manual tasks
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Data Analytics:</strong> Build tools to help organizations
          understand and communicate their impact
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Mobile Access:</strong> Create applications that make services
          more accessible to communities
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Resource Management:</strong> Develop systems to help
          nonprofits manage volunteers and resources efficiently
        </Typography>
      </li>
    </Box>

    <Typography variant="h4" gutterBottom>
      Project Examples
    </Typography>

    <Box component="ul" sx={{ listStyle: "disc", pl: 4, mb: 3 }}>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Donation Management:</strong> Streamlining the process of
          tracking and acknowledging donations
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Volunteer Coordination:</strong> Systems for scheduling and
          managing volunteer activities
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Impact Tracking:</strong> Tools for measuring and reporting
          program outcomes
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Client Management:</strong> Secure systems for managing client
          information and services
        </Typography>
      </li>
    </Box>

    <Typography variant="h4" gutterBottom>
      Getting Started
    </Typography>

    <Box component="ol" sx={{ pl: 4, mb: 3 }}>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Explore our{" "}
          <LinkStyled href="/nonprofits">current projects</LinkStyled> to find
          causes you care about
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Join <LinkStyled href="/signup">our community</LinkStyled> to connect
          with nonprofits and other developers
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Attend <LinkStyled href="/office-hours">office hours</LinkStyled> to
          learn about immediate needs
        </Typography>
      </li>
    </Box>

    <Typography variant="h4" gutterBottom>
      Best Practices
    </Typography>

    <Box component="ul" sx={{ listStyle: "disc", pl: 4, mb: 3 }}>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Focus on sustainable solutions that nonprofits can maintain long-term
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Document everything thoroughly for future volunteers and nonprofit
          staff
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Consider accessibility and user experience for diverse user groups
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Build with security and data privacy as top priorities
        </Typography>
      </li>
    </Box>

    <Typography variant="h4" gutterBottom>
      Your Impact
    </Typography>

    <Box component="ul" sx={{ listStyle: "disc", pl: 4, mb: 3 }}>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Help nonprofits serve more people with limited resources
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Create lasting solutions that continue helping long after you're done
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Build technology that addresses real community needs
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Mentor others and help build a community of tech for good
        </Typography>
      </li>
    </Box>
  </>
);

export default CodingForGoodContent;
