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

const VolunteerChecklist = () => {
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
          title: "Find your QR code",
          details:
            "It is in your application confirmation email and on your application page. Screenshot it or bookmark the email so you have it at the door.",
          checked: false,
        },
        {
          title: "Confirm your slot",
          details:
            "Check which day, time, and role you signed up for. Registration opens at 8:00 AM on Saturday.",
          checked: false,
        },
        {
          title: "Know where to go",
          details:
            "ASU Tempe, Engineering Center G Wing, 501 E Tyler Mall. Check directions and parking on the ASU Tempe location page.",
          checked: false,
        },
        {
          title: "Join Slack",
          details:
            "Event updates and last-minute changes go to Slack. Join before the event so you do not miss them.",
          checked: false,
        },
        {
          title: "Pack your bag",
          details:
            "Bring your QR code, an ID, and your laptop and charger.",
          checked: false,
        },
        {
          title: "Track your volunteer time",
          details:
            "Bookmark the time tracker to log your hours for the event.",
          checked: false,
        },
      ],
      early: [
        {
          title: "Arrive before your slot starts",
          details:
            "Registration opens at 8:00 AM on Saturday and doors open at 9:00 AM. Give yourself time to check in and settle in.",
          checked: false,
        },
        {
          title: "Show your QR code at the registration desk",
          details:
            "A volunteer scans it for instant check-in. Bring your ID as backup in case the code does not scan.",
          checked: false,
        },
        {
          title: "Find your role lead",
          details:
            "Check in with the registration desk and ask who is leading your role for this shift.",
          checked: false,
        },
        {
          title: "Learn your role",
          details:
            "Check-in Registration greets arrivals and scans QR codes; Food Service helps with meals; Cleanup Crew keeps the space tidy; Photography captures the weekend; Judging Support helps judges and teams; Virtual Event Moderator keeps the online event running.",
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
          title: "Stay in your role's area until your shift ends",
          details:
            "Teams and attendees count on you being where your role needs you. If you need a break, tell your role lead first.",
          checked: false,
        },
        {
          title: "Point questions you cannot answer to the registration desk",
          details:
            "If a hacker, mentor, or judge asks something you do not know, send them to the registration desk or an organizer instead of guessing.",
          checked: false,
        },
        {
          title: "Help the registration desk stay fast",
          details:
            "During busy arrivals, keep the line moving: one volunteer greets, one scans QR codes, one points people to their team area.",
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
          title: "Check out when your shift ends",
          details:
            "Log your hours at the time tracker before you leave so your time is counted.",
          checked: false,
        },
        {
          title: "Hand off to the next shift",
          details:
            "Tell the volunteer taking over what is still open: unanswered questions, missing supplies, or anything the desk needs to know.",
          checked: false,
        },
        {
          title: "Help with cleanup if you can stay",
          details:
            "The last shift covers judging support and cleanup. Even an extra half hour helps the organizers close the event.",
          checked: false,
        },
      ],
      after: [
        {
          title: "Log your hours",
          details:
            "Log your time at the time tracker if you have not already.",
          checked: false,
        },
        {
          title: "Give feedback to the organizing team",
          details:
            "Share what worked at the registration desk and what would make the next event smoother for volunteers.",
          checked: false,
        },
        {
          title: "Stay connected for the next event",
          details:
            "Stay in Slack for future hackathons. We host multiple events a year and returning volunteers make each one better.",
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
        Volunteer Checklist
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
        When you arrive, show your QR code at the registration desk in the
        Engineering Center G Wing — a volunteer scans it for instant check-in.
        Your QR code is in your application confirmation email and on your
        application page, so screenshot it before you leave home. Bring your ID
        as backup. Remote mentors check in differently: they use the mentor
        check-in portal linked from the event page.
      </Typography>
      <Tooltip title={`${Math.round(progress)}% completed`} placement="top">
        <ProgressBar variant="determinate" value={progress} />
      </Tooltip>
      {Object.entries(checklist).map(([section, items]) =>
        renderSection(
          section === "before"
            ? "Before the Event"
            : section === "early"
              ? "Arriving (Registration)"
              : section === "during"
                ? "Throughout Your Shift"
                : section === "wrapping"
                  ? "Wrapping Up (End of Your Shift)"
                  : "After the Event",
          items,
          section
        )
      )}
    </ChecklistContainer>
  );
};

export default VolunteerChecklist;
