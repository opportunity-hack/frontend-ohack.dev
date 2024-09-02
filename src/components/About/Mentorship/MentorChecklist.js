import React, { useState, useEffect, use } from "react";
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

const MentorChecklist = () => {
  const [currentSection, setCurrentSection] = useState("");
  const [checklist, setChecklist] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    initFacebookPixel();
  }, []);

  const trackOnClickButtonClickWithGoogleAndFacebook = (eventName) => (e) => {
    trackEvent(eventName);    
  };

  useEffect(() => {
    const storedChecklist = localStorage.getItem("mentorChecklist");
    if (storedChecklist) {
      setChecklist(JSON.parse(storedChecklist));
    } else {
      const initialChecklist = {
        before: [
          { text: "Review the judging criteria thoroughly", checked: false },
          {
            text: "Familiarize yourself with the hackathon schedule",
            checked: false,
          },
          { text: "Set up and test your Slack account", checked: false },
          {
            text: "Review any provided materials on mentoring best practices",
            checked: false,
          },          
          {
            text: "Block off your mentoring time in your calendar",
            checked: false,
          },
        ],
        early: [
          { text: "Join the #mentor-hangout Slack channel", checked: false },
          { text: "Introduce yourself in the channel", checked: false },
          {
            text: "Review the list of teams and their project ideas",
            checked: false,
          },
          {
            text: "Join assigned team's Slack channel (if applicable)",
            checked: false,
          },
          { text: "Help teams refine their project scope", checked: false },
        ],
        during: [
          { text: "Stay primarily with your chosen team(s)", checked: false },
          {
            text: "Regularly check in with your primary team(s) via their Slack channel",
            checked: false,
          },
          {
            text: "Ask for quick demos to understand their progress",
            checked: false,
          },
          {
            text: "Use Slack Huddles for screen sharing when providing remote assistance",
            checked: false,
          },
          {
            text: "Provide constructive feedback and encouragement",
            checked: false,
          },
        ],
        wrapping: [
          {
            text: "Help teams prepare for their final presentations",
            checked: false,
          },
          { text: "Encourage teams to practice their pitches", checked: false },
          {
            text: "Remind teams to complete their DevPost submissions",
            checked: false,
          },
          { text: "Offer final feedback and encouragement", checked: false },
        ],
        after: [
          {
            text: "Provide any final feedback to the organizing team",
            checked: false,
          },
          {
            text: "Reflect on your mentoring experience and note any suggestions for improvement",
            checked: false,
          },
        ],
      };
      setChecklist(initialChecklist);
      localStorage.setItem("mentorChecklist", JSON.stringify(initialChecklist));
    }

    const storedExpandedSections = localStorage.getItem("expandedSections");
    if (storedExpandedSections) {
      setExpandedSections(JSON.parse(storedExpandedSections));
    } else {
      const initialExpandedSections = {
        before: true,
        early: true,
        during: true,
        wrapping: true,
        after: true,
      };
      setExpandedSections(initialExpandedSections);
      localStorage.setItem(
        "expandedSections",
        JSON.stringify(initialExpandedSections)
      );
    }
  }, []);

  useEffect(() => {
    const updateCurrentSection = () => {
      const now = Moment();
      // TODO: Update these dynamically for each hackathon and consider adding it into the hackathon page instead
      
      const hackathonStart = Moment(
        "2024-10-12 09:00:00",
        "YYYY-MM-DD HH:mm:ss",
        "America/Los_Angeles"
      );
      const hackathonEnd = Moment("2024-10-13 15:00:00", "YYYY-MM-DD HH:mm:ss", "America/Los_Angeles");

      if (now.isBefore(hackathonStart)) {
        setCurrentSection("before");
      } else if (
        now.isBetween(hackathonStart, hackathonStart.clone().add(6, "hours"))
      ) {
        setCurrentSection("early");
      } else if (
        now.isBetween(
          hackathonStart.clone().add(6, "hours"),
          hackathonEnd.clone().subtract(3, "hours")
        )
      ) {
        setCurrentSection("during");
      } else if (
        now.isBetween(hackathonEnd.clone().subtract(3, "hours"), hackathonEnd)
      ) {
        setCurrentSection("wrapping");
      } else {
        setCurrentSection("after");
      }
    };

    updateCurrentSection();
    const interval = setInterval(updateCurrentSection, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const totalTasks = Object.values(checklist).flat().length;
    const completedTasks = Object.values(checklist)
      .flat()
      .filter((task) => task.checked).length;
    setProgress((completedTasks / totalTasks) * 100);
  }, [checklist]);

  const handleToggle = (section, index) => {
    const updatedChecklist = {
      ...checklist,
      [section]: checklist[section].map((item, i) =>
        i === index ? { ...item, checked: !item.checked } : item
      ),
    };
    setChecklist(updatedChecklist);
    localStorage.setItem("mentorChecklist", JSON.stringify(updatedChecklist));
  };

  const handleResetChecklist = () => {
    const resetChecklist = Object.fromEntries(
      Object.entries(checklist).map(([key, value]) => [
        key,
        value.map((item) => ({ ...item, checked: false })),
      ])
    );
    setChecklist(resetChecklist);
    localStorage.setItem("mentorChecklist", JSON.stringify(resetChecklist));
  };

  const toggleSection = (section) => {
    const updatedExpandedSections = {
      ...expandedSections,
      [section]: !expandedSections[section],
    };
    setExpandedSections(updatedExpandedSections);
    localStorage.setItem(
      "expandedSections",
      JSON.stringify(updatedExpandedSections)
    );
  };

  const renderSection = (title, items, section) => (
    <Box key={section}>
      <SectionTitle
        variant="h6"
        active={currentSection === section}
        onClick={() => toggleSection(section)}
      >
        <Box sx={{ display: 'flex' }}>
          {currentSection === section ? (
            <CircularProgress size={15} thickness={1} color="secondary" />
          ) : (
            ""
          )}
        {title}
        </Box>
        {expandedSections[section] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </SectionTitle>
      <Collapse in={expandedSections[section]}>
        <List dense>
          {items.map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={item.checked}
                  onChange={() => handleToggle(section, index)}
                  disableRipple
                />
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{ fontSize: "14px" }}
                primary={item.text}
              />
            </ListItem>
          ))}
        </List>
      </Collapse>
    </Box>
  );

  return (
    <ChecklistContainer elevation={3}>
      <Typography variant="h5" gutterBottom>
        Mentor Checklist
      </Typography>
      {
        // Add a button to track time here
      }
      <Box sx={{ flexGrow: 1, margin: 2 }}>
        <Button
          onClick={trackOnClickButtonClickWithGoogleAndFacebook("track_volunteer_time")}
          variant="contained"
          size="large"
          color="secondary"
          href="/volunteer/track"
        >
          Track your volunteer time here
        </Button>
      </Box>

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
                ? "Throughout the Hackathon"
                : section === "wrapping"
                  ? "Wrapping Up (The Last 3 Hours)"
                  : "After the Event",
          items,
          section
        )
      )}
      <Box mt={2}>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleResetChecklist}
        >
          Reset Checklist
        </Button>
      </Box>
    </ChecklistContainer>
  );
};

export default MentorChecklist;
