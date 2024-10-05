import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Paper,
  Button,
  LinearProgress,
  Tooltip,
  Collapse,
  Link,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Moment from "moment";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CircularProgress from "@mui/material/CircularProgress";
import { initFacebookPixel, trackEvent } from "../../../lib/ga";

const ChecklistContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const SectionTitle = styled(Typography)(({ theme, active }) => ({
  fontWeight: active ? "bold" : "normal",
  color: active ? theme.palette.primary.main : "inherit",
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1),
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  cursor: "pointer",
}));

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const MentorChecklist = ({ hackathonStart, hackathonEnd }) => {
  const [currentSection, setCurrentSection] = useState("");
  const [checklist, setChecklist] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    initFacebookPixel();
    initializeChecklist();
  }, []);

  const initializeChecklist = () => {
    const initialChecklist = {
      before: [
        {
          title: "Review the judging criteria thoroughly",
          details:
            "Understand the metrics teams will be evaluated on to provide targeted guidance.",
          checked: false,
        },
        {
          title: "Familiarize yourself with the hackathon schedule",
          details:
            "Know key timelines to align your mentoring with event milestones.",
          checked: false,
        },
        {
          title: "Set up and test your Slack account",
          details:
            "Ensure you can access the Opportunity Hack Slack workspace.",
          checked: false,
        },
        {
          title: "Review provided materials on mentoring best practices",
          details:
            "Refresh your knowledge on effective mentoring techniques for hackathons. Review the judging criteria, and peek at DevPost to understand prizes.",
          checked: false,
        },
        {
          title: "Block off your mentoring time in your calendar",
          details:
            "Commit to your 3-hour shift and any additional time you can offer.",
          checked: false,
        },
        {
          title: "Track your volunteer time",
          details:
            "Click the button above to log your volunteer hours for the event.",
          checked: false,
        },
      ],
      early: [
        {
          title: "Join the #ask-a-mentor Slack channel",
          details: "This is the main channel for mentor coordination.",
          checked: false,
        },
        {
          title:
            "Say hello in the #ask-a-mentor channel to let everyone know you're available",
          details:
            "Peoeple can look at our mentor section to learn more about you, but it's important to let them know you're available and maybe provide a short bio.",
          checked: false,
        },
        {
          title: "Review the list of teams and their project ideas",
          details:
            "Familiarize yourself with ongoing projects to offer targeted assistance.",
          checked: false,
        },
        {
          title: "Join team Slack channels",
          details:
            "Connect with teams working on projects relevant to your expertise. Find the Slack channels for each team in the README of their GitHub repository.",
          checked: false,
        },
        {
          title: "Help teams refine their project scope",
          details:
            "Guide teams to define achievable goals within the hackathon timeframe.",
          checked: false,
        },
        {
          title: "Track your volunteer time",
          details:
            "Click the button above to log your volunteer hours for the event.",
          checked: false,
        },
      ],
      during: [
        {
          title: "Regularly check team Slack channels",
          details:
            "Monitor discussions and offer help when needed. Find the Slack channels for each team in the README of their GitHub repos.",
          checked: false,
        },
        {
          title: "Review team GitHub repositories",
          details:
            "Understand project progress and offer code-level suggestions. Remember that they aren't trying to make a perfect project, just an MVP for the hackathon.",
          checked: false,
        },
        {
          title: "Use Slack Huddles for remote assistance",
          details:
            "Offer screen sharing and voice chat for in-depth problem-solving.  It's much easier to explain code in a call than in text. You can also use tools like Figma, Miro, Excalidraw for drawing, and Google Docs/Sheets or Slack Canvas for quick collaboration.",
          checked: false,
        },
        {
          title: "Provide constructive feedback",
          details:
            "Offer insights on code quality, project direction, and presentation skills. Use the private mentor Slack channel if you aren't able to get a response from a team.",
          checked: false,
        },
        {
          title: "Encourage teams to seek help",
          details: "Remind teams to utilize mentor resources when stuck.",
          checked: false,
        },
        {
          title: "Track your volunteer time",
          details:
            "Click the button above to log your volunteer hours for the event.",
          checked: false,
        },
      ],
      wrapping: [
        {
          title: "Help teams prepare final presentations",
          details:
            "Guide teams on highlighting their project's impact and technical achievements according to the judging criteria.",
          checked: false,
        },
        {
          title: "Encourage teams to practice their pitches",
          details:
            "Offer to be a test audience and provide feedback on presentations.",
          checked: false,
        },
        {
          title: "Remind teams about DevPost submissions",
          details:
            "Ensure teams understand the submission process and requirements.",
          checked: false,
        },
        {
          title: "Offer final feedback and encouragement",
          details: "Provide last-minute suggestions and boost team morale.",
          checked: false,
        },
        {
          title: "Track your volunteer time",
          details:
            "Click the button above to log your volunteer hours for the event.",
          checked: false,
        },
      ],
      after: [
        {
          title: "Provide feedback to the organizing team",
          details:
            "Share insights on the mentoring experience and event organization.",
          checked: false,
        },
        {
          title: "Ask for feedback",
          details:
            "Share your feedback link from your profile with your team to ask for feedback.",
          checked: false,
        },
        {
          title: "Reflect on your mentoring experience",
          details:
            "Note any suggestions for improving the mentoring process in future events. Consider posting about your experience on LinkedIn.",
          checked: false,
        },
        {
          title: "Stay connected with teams",
          details:
            "Offer to be a resource for teams continuing their projects post-hackathon.",
          checked: false,
        },
      ],
    };
    setChecklist(initialChecklist);
    setExpandedSections({
      before: true,
      early: true,
      during: true,
      wrapping: true,
      after: true,
    });
  };

  useEffect(() => {
    const updateCurrentSection = () => {
      const now = Moment();
      const start = Moment(hackathonStart);
      const end = Moment(hackathonEnd);
      
      if (now.isBefore(start)) {
        setCurrentSection("before");
      } else if (
        now.isBetween(start, start.clone().add(6, "hours"))
      ) {
        setCurrentSection("early");
      } else if (
        now.isBetween(
          start.clone().add(6, "hours"),
          end.clone().subtract(3, "hours")
        )
      ) {
        setCurrentSection("during");
      } else if (
        now.isBetween(end.clone().subtract(3, "hours"), end)
      ) {
        setCurrentSection("wrapping");
      } else {
        setCurrentSection("after");
      }
    };

    updateCurrentSection();
    const interval = setInterval(updateCurrentSection, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [hackathonStart, hackathonEnd]);

  useEffect(() => {
    const totalTasks = Object.values(checklist).flat().length;
    const completedTasks = Object.values(checklist)
      .flat()
      .filter((task) => task.checked).length;
    setProgress((completedTasks / totalTasks) * 100);
  }, [checklist]);

  const handleToggle = (section, index) => {
    setChecklist((prevChecklist) => ({
      ...prevChecklist,
      [section]: prevChecklist[section].map((item, i) =>
        i === index ? { ...item, checked: !item.checked } : item
      ),
    }));
  };

  const toggleSection = (section) => {
    setExpandedSections((prevSections) => ({
      ...prevSections,
      [section]: !prevSections[section],
    }));
  };

  const renderSection = (title, items, section) => (
    <Box key={section}>
      <SectionTitle
        variant="h6"
        active={currentSection === section}
        onClick={() => toggleSection(section)}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {currentSection === section && (
            <CircularProgress size={20} thickness={5} sx={{ marginRight: 1 }} />
          )}
          {title}
        </Box>
        {expandedSections[section] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </SectionTitle>
      <Collapse in={expandedSections[section]}>
        <List dense>
          {items.map((item, index) => (
            <ListItem key={index} alignItems="flex-start">
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={item.checked}
                  onChange={() => handleToggle(section, index)}
                  disableRipple
                />
              </ListItemIcon>
              <ListItemText
                primary={item.title}
                secondary={item.details}                
                primaryTypographyProps={{ fontWeight: "bold", fontSize: "16px" }}
                secondaryTypographyProps={{ style: { whiteSpace: "normal", fontSize: "14px" } }}
              />
            </ListItem>
          ))}
        </List>
      </Collapse>
    </Box>
  );

  const style = {
    fontSize: "14px"
  }

  return (
    <ChecklistContainer elevation={3}>
      <Typography variant="h5" gutterBottom>
        Mentor Checklist
      </Typography>
      <Box sx={{ flexGrow: 1, margin: 2 }}>
        <Button
          onClick={() => trackEvent("track_volunteer_time")}
          variant="contained"
          size="large"
          color="secondary"
          href="/volunteer/track"
        >
          Track your volunteer time here
        </Button>
      </Box>
      <Typography variant="body1" style={style} paragraph>
        Join the{" "}
        <Link
          href="https://opportunity-hack.slack.com/archives/C01E5CGDQ74"
          target="_blank"
          rel="noopener"
        >
          #ask-a-mentor Slack channel
        </Link>{" "}
        to handle reachouts from teams.  Once a team reaches out to you, you'll want to stay with them for the duration of the hackathon.  Having this shared context with the people in the team, the problem they are solving, and the tech they are using allows for less context switching and a more durable relationship that improves team productivity.
      </Typography>
      <Typography variant="body1" paragraph>
        Join the{" "}
        <Link
          href="https://opportunity-hack.slack.com/archives/C07JBKSPWP7"
          target="_blank"
          rel="noopener"
        >
          🔒 #2024-mentors
        </Link>{" "}
        private Slack channel for mentor-specific announcements.
      </Typography>

      <Typography variant="body1" paragraph>
        View team projects on GitHub:{" "}
        <Link
          href="https://github.com/2024-Arizona-Opportunity-Hack"
          target="_blank"
          rel="noopener"
        >
          2024 Arizona Opportunity Hack
        </Link>{" "}
        - this is where teams will be committing their open-source code. You can find the Slack channel for each team in the README of their GitHub repository.
      </Typography>
      <Typography variant="body1" paragraph>
        See DevPost:{" "}
        <Link
          href="https://opportunity-hack-2024-arizona.devpost.com/"
          target="_blank"
          rel="noopener"
        >
          2024 DevPost
        </Link>{" "}
        - this is what the teams will be submitting their projects to.
      </Typography>
      <Tooltip title={`${Math.round(progress)}% completed`} placement="top">
        <ProgressBar variant="determinate" value={progress} />
      </Tooltip>
      {Object.entries(checklist).map(([section, items]) =>
        renderSection(
          section === "before"
            ? "Before the Event"
            : section === "early"
              ? "Early Hours (First 4-6 hours)"
              : section === "during"
                ? "Throughout Your Shift"
                : section === "wrapping"
                  ? "Wrapping Up (The Last 3 Hours)"
                  : "After the Event",
          items,
          section
        )
      )}
    </ChecklistContainer>
  );
};

export default MentorChecklist;
