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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { initFacebookPixel, trackEvent } from "../../../lib/ga";

const ChecklistContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: "normal",
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

const MentorChecklist = () => {
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
          link: { href: "/about/judges#judging-criteria", label: "See the judging criteria" },
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
            "Refresh your knowledge on effective mentoring techniques for hackathons. Review the judging criteria and the prizes for this event.",
          checked: false,
        },
        {
          title: "Study the problem statements and the software requirements document",
          details:
            "They are released the day before the hackathon. Find them on Slack and in your email. Watch the nonprofit pitch at kickoff too: the more of that context you absorb, the more effective you are as a mentor.",
          checked: false,
        },
        {
          title: "Block off your mentoring time in your calendar",
          details:
            "Check the countdown and timeline on the event page, sign up for the blocks you can make, and be there as long as you can. The longer you stay, the more teams you can help.",
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
          title: "Check whether a team wants support before you reach out",
          details:
            "Every team sets its own status: Open to mentors means they welcome you dropping in; Heads-down means they are focused, so hold off unless they ask in #ask-a-mentor. Some teams get overloaded with mentors reaching out, so respect what they chose.",
          checked: false,
        },
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
            "Offer insights on code quality, project direction, and presentation skills. If you can't get a response from a team, raise a flag on their mentor support panel and leave a public note there: what you observed, and what the team needs next. Another mentor can take ownership of the flag instead of duplicating your effort, and the next mentor on shift sees the full history.",
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
          title: "Remind teams about video submissions",
          details:
            "Ensure teams understand the submission process: code checked in to GitHub, demo video submitted on ohack.dev. DevPost is optional.",
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
      <SectionTitle variant="h6" onClick={() => toggleSection(section)}>
        <Box sx={{ display: "flex", alignItems: "center" }}>{title}</Box>
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
                secondary={
                  <>
                    {item.details}
                    {item.link && (
                      <>
                        {" "}
                        <Link href={item.link.href}>{item.link.label}</Link>
                      </>
                    )}
                  </>
                }
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
