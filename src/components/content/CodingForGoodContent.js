// components/content/CodingForGoodContent.jsx
import { Typography, Box } from "@mui/material";
import { LinkStyled } from "../../styles/nonprofit/styles";

const style = { fontSize: "14px" };

const CodingForGoodContent = () => (
  <>
    <Typography variant="body1" style={style} paragraph>
      Discover how coding for nonprofits can transform communities while advancing your career.
      Whether you're a seasoned developer or just starting out, your programming skills can help 
      nonprofits amplify their impact and better serve their communities through technology.
    </Typography>

    <Typography variant="h4" gutterBottom>
      Why Code for Nonprofits? 
    </Typography>

    <Typography variant="body1" style={style} paragraph>
      Coding nonprofits need talented developers to build solutions that matter. When you contribute 
      your technical skills to nonprofit organizations, you're not just writing code - you're creating 
      tools that feed families, educate children, and strengthen communities.
    </Typography>

    <Box component="ul" sx={{ listStyle: "disc", pl: 4, mb: 3 }}>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Real-World Impact:</strong> See your code directly improve lives and communities
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Portfolio Building:</strong> Develop impressive projects that showcase your skills to employers
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Network Growth:</strong> Connect with like-minded developers and nonprofit leaders
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Skill Development:</strong> Learn new technologies while solving unique challenges
        </Typography>
      </li>
    </Box>

    <Typography variant="h4" gutterBottom>
      High-Impact Coding Projects for Nonprofits
    </Typography>

    <Typography variant="body1" style={style} paragraph>
      Nonprofits need coding solutions across many areas. Here are the most requested types 
      of projects where your programming skills can make an immediate difference:
    </Typography>

    <Box component="ul" sx={{ listStyle: "disc", pl: 4, mb: 3 }}>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Donation Management Systems:</strong> Build platforms that help nonprofits track, 
          process, and acknowledge donations efficiently
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Volunteer Coordination Tools:</strong> Create systems for scheduling, tracking, 
          and managing volunteer activities and hours
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Client Service Platforms:</strong> Develop secure systems for managing client 
          information and tracking service delivery
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Impact Analytics Dashboards:</strong> Build tools to help nonprofits measure, 
          visualize, and communicate their community impact
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Mobile-First Applications:</strong> Create accessible mobile apps that bring 
          services directly to communities in need
        </Typography>
      </li>
    </Box>

    <Typography variant="h4" gutterBottom>
      How to Start Coding for Nonprofits Today
    </Typography>

    <Box component="ol" sx={{ pl: 4, mb: 3 }}>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Browse <LinkStyled href="/nonprofits">active nonprofit projects</LinkStyled> and find 
          causes that align with your values and interests
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <LinkStyled href="/signup">Join our developer community</LinkStyled> to connect with 
          nonprofits actively seeking coding help
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Attend our weekly <LinkStyled href="/office-hours">office hours</LinkStyled> to learn 
          about urgent coding needs and get matched with projects
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Start with a small contribution to understand the nonprofit's needs before taking on larger projects
        </Typography>
      </li>
    </Box>

    <Typography variant="h4" gutterBottom>
      Best Practices for Nonprofit Coding Projects
    </Typography>

    <Typography variant="body1" style={style} paragraph>
      Successful coding nonprofits projects require thoughtful planning and execution. Follow these 
      guidelines to ensure your contributions create lasting value:
    </Typography>

    <Box component="ul" sx={{ listStyle: "disc", pl: 4, mb: 3 }}>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Sustainability First:</strong> Build solutions that nonprofits can maintain 
          with limited technical resources
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Comprehensive Documentation:</strong> Write clear documentation for future 
          volunteers and nonprofit staff who will use your code
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Security & Privacy:</strong> Implement robust security measures to protect 
          sensitive donor and client information
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>User Experience Focus:</strong> Design with accessibility in mind, considering 
          diverse user groups and varying technical skills
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Budget-Conscious Development:</strong> Choose technologies and hosting solutions 
          that fit nonprofit budget constraints
        </Typography>
      </li>
    </Box>

    <Typography variant="h4" gutterBottom>
      Your Coding Impact on Nonprofits
    </Typography>

    <Typography variant="body1" style={style} paragraph>
      When you dedicate your coding skills to nonprofits, you become part of a movement that's 
      revolutionizing how social good organizations operate and serve their communities:
    </Typography>

    <Box component="ul" sx={{ listStyle: "disc", pl: 4, mb: 3 }}>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Amplify Nonprofit Efficiency:</strong> Help organizations serve more people 
          with limited resources through automation and optimization
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Create Lasting Solutions:</strong> Build technology that continues helping 
          communities long after your initial contribution
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Bridge the Digital Divide:</strong> Bring modern technology to nonprofits 
          that couldn't otherwise afford professional development services
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Mentor the Next Generation:</strong> Guide other developers interested in 
          using their skills for social good
        </Typography>
      </li>
    </Box>

    <Typography variant="body1" style={style} paragraph>
      Ready to start coding for nonprofits? Join thousands of developers who are using their 
      programming skills to create positive change in their communities. Your next commit could 
      help feed a family, educate a child, or strengthen an entire community.
    </Typography>
  </>
);

export default CodingForGoodContent;
