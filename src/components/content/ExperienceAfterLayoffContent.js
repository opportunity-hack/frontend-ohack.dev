// components/content/ExperienceAfterLayoffContent.jsx
import { Typography, Box } from "@mui/material";
import { LinkStyled } from "../../styles/nonprofit/styles";

const style = { fontSize: "14px" };

const ExperienceAfterLayoffContent = () => (
  <>
    <Typography variant="body1" style={style} paragraph>
      Being laid off can be a challenging experience, but it also presents an
      opportunity to use your tech skills for good. By contributing to nonprofit
      projects, you can make a positive impact while building your portfolio.
    </Typography>

    <Typography variant="h4" gutterBottom>
      Why Nonprofit Projects Are Ideal After a Layoff
    </Typography>

    <Box component="ul" sx={{ listStyle: "disc", pl: 4, mb: 3 }}>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Gain Real-World Experience:</strong> Work on actual projects
          that solve real problems for nonprofits. This experience is invaluable
          and can help you stay sharp and relevant in the tech industry.
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Expand Your Network:</strong> Connect with other tech
          professionals, nonprofit leaders, and volunteers. These connections
          can lead to job opportunities and collaborations in the future.
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Build Your Portfolio:</strong> Showcase your work on
          meaningful projects in your portfolio. This demonstrates your ability
          to apply your skills to real-world challenges and makes you stand out
          to potential employers.
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <strong>Stay Motivated:</strong> Working on projects that make a
          difference can be incredibly fulfilling and help you stay motivated
          during your job search.
        </Typography>
      </li>
    </Box>

    <Typography variant="h4" gutterBottom>
      How to Get Started
    </Typography>

    <Box component="ol" sx={{ pl: 4, mb: 3 }}>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Complete your{" "}
          <LinkStyled href="/profile">developer profile</LinkStyled> to
          highlight your skills and interests.
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Join our <LinkStyled href="/signup">Slack community</LinkStyled> and
          connect with others in the #laid-off-support channel.
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Browse our <LinkStyled href="/projects">project listings</LinkStyled>{" "}
          to find opportunities that match your skills and interests.
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Start contributing to a project and make a difference!
        </Typography>
      </li>
    </Box>
  </>
);

export default ExperienceAfterLayoffContent;
