import { FONT_DISPLAY } from "../../styles/fonts";
import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Box,
  Chip,
  useMediaQuery,
  Card,
  CardContent,
  LinearProgress,
  Fade,
  IconButton,
  Collapse,
  Button,
  Tooltip,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { useRouter } from "next/router";
import {
  isAfter,
  isBefore,
  differenceInMilliseconds,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
} from "date-fns";
import ReactMarkdown from "react-markdown";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import PrintIcon from "@mui/icons-material/Print";
import EventNoteIcon from "@mui/icons-material/EventNote";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {
  formatDualTimezone,
  getEventTimezone,
  DEFAULT_EVENT_TIMEZONE,
} from "../../lib/timezoneUtils";

const TimelineContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  backgroundColor: "#FFFFFF",
  border: "1px solid var(--line, #E7E1D4)",
  boxShadow: "none",
  borderRadius: 10,
  overflow: "hidden",
  [theme.breakpoints.up("md")]: {
    padding: theme.spacing(3),
  },
}));

const CountdownCard = styled(Card)(({ theme }) => ({
  background: "linear-gradient(135deg, #1B3A6B 0%, #16315a 100%)",
  color: "#fff",
  marginBottom: theme.spacing(3),
  borderRadius: 10,
  boxShadow: "none",
  overflow: "visible",
}));

const CountdownGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(60px, 1fr))",
  gap: theme.spacing(1),
  maxWidth: "320px",
  margin: "0 auto",
  [theme.breakpoints.up("sm")]: {
    gap: theme.spacing(2),
    maxWidth: "400px",
  },
}));

const TimeUnit = styled(Box)(({ theme }) => ({
  textAlign: "center",
  padding: theme.spacing(1),
  backgroundColor: "rgba(255, 255, 255, 0.15)",
  borderRadius: theme.shape.borderRadius,
  backdropFilter: "blur(10px)",
}));

const TimeValue = styled(Typography)(({ theme }) => ({
  fontSize: "1.2rem",
  fontWeight: "bold",
  lineHeight: 1,
  [theme.breakpoints.up("sm")]: {
    fontSize: "1.8rem",
  },
}));

const TimeLabel = styled(Typography)(({ theme }) => ({
  fontSize: "0.7rem",
  opacity: 0.9,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  [theme.breakpoints.up("sm")]: {
    fontSize: "0.8rem",
  },
}));

const TimelineWrapper = styled(Box)(({ theme }) => ({
  position: "relative",
  paddingLeft: theme.spacing(3),
  [theme.breakpoints.up("md")]: {
    paddingLeft: theme.spacing(4),
  },
}));

const TimelineLine = styled(Box)(({ theme }) => ({
  position: "absolute",
  left: "14px",
  top: "20px",
  bottom: "20px",
  width: "2px",
  backgroundColor: theme.palette.divider,
  [theme.breakpoints.up("md")]: {
    left: "18px",
  },
}));

const EventCard = styled(Card)(({ theme, past, current }) => ({
  position: "relative",
  marginBottom: theme.spacing(2),
  marginLeft: theme.spacing(2),
  transition: "all 0.3s ease",
  cursor: "pointer",
  border: current ? "2px solid #1B3A6B" : "1px solid var(--line, #E7E1D4)",
  boxShadow: "none",
  backgroundColor: past
    ? "#F4F1E9"
    : current
      ? "rgba(226,85,46,0.06)"
      : "#FFFFFF",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 14px 30px -22px rgba(22,24,29,0.5)",
  },
  [theme.breakpoints.up("md")]: {
    marginLeft: theme.spacing(3),
  },
}));

const EventDot = styled(Box)(({ theme, past, current }) => ({
  position: "absolute",
  left: past ? "-37px" : current ? "-39px" : "-37px",
  top: "20px",
  width: past ? "12px" : current ? "16px" : "12px",
  height: past ? "12px" : current ? "16px" : "12px",
  borderRadius: "50%",
  backgroundColor: past ? "#1B3A6B" : current ? "#E2552E" : "#C8C2B4",
  border: "3px solid #FFFFFF",
  zIndex: 2,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  [theme.breakpoints.up("md")]: {
    left: past ? "-41px" : current ? "-43px" : "-41px",
  },
}));

const EventProgress = styled(LinearProgress)(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: "3px",
  borderRadius: "3px 3px 0 0",
}));

const EventCountdown = ({ countdowns, eventId, eventTimezone }) => {
  const etz = eventTimezone || DEFAULT_EVENT_TIMEZONE;
  const [timeLeft, setTimeLeft] = useState(null);
  const [nextEvent, setNextEvent] = useState(null);
  const [expandedEvents, setExpandedEvents] = useState(new Set());
  const [progress, setProgress] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const router = useRouter();

  useEffect(() => {
    if (!countdowns?.length) return;

    const timer = setInterval(() => {
      const now = new Date();
      const sortedEvents = [...countdowns].sort((a, b) =>
        differenceInMilliseconds(new Date(a.time), new Date(b.time)),
      );

      // Find next upcoming event
      const upcoming = sortedEvents.find((event) =>
        isAfter(new Date(event.time), now),
      );

      setNextEvent(upcoming);

      // Auto-expand next event
      if (upcoming) {
        setExpandedEvents((prev) => {
          const newSet = new Set(prev);
          newSet.add(upcoming.name);
          return newSet;
        });
      }

      // Calculate overall progress - simple ratio of completed events
      const completedEvents = sortedEvents.filter((event) =>
        isBefore(new Date(event.time), now),
      ).length;
      const progressPercent = (completedEvents / sortedEvents.length) * 100;
      setProgress(progressPercent);

      // Calculate countdown to next event
      if (upcoming) {
        const eventTime = new Date(upcoming.time);
        const totalSeconds = differenceInSeconds(eventTime, now);

        setTimeLeft({
          days: differenceInDays(eventTime, now),
          hours: differenceInHours(eventTime, now) % 24,
          minutes: differenceInMinutes(eventTime, now) % 60,
          seconds: totalSeconds % 60,
        });
      } else {
        setTimeLeft(null);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [countdowns]);

  const toggleEventExpansion = (eventName) => {
    setExpandedEvents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(eventName)) {
        newSet.delete(eventName);
      } else {
        newSet.add(eventName);
      }
      return newSet;
    });
  };

  const handlePrintTimeline = () => {
    if (eventId) {
      window.open(`/hack/${eventId}/print-timeline`, "_blank");
    }
  };

  const renderCountdown = () => {
    if (!nextEvent || !timeLeft) return null;

    const timeUnits = [
      { value: timeLeft.days, label: "days" },
      { value: timeLeft.hours, label: "hours" },
      { value: timeLeft.minutes, label: "mins" },
      { value: timeLeft.seconds, label: "secs" },
    ].filter((unit) => unit.value > 0 || unit.label === "secs");

    return (
      <Fade in={true}>
        <CountdownCard elevation={6}>
          <CardContent sx={{ p: 3 }}>
            <Box textAlign="center" mb={3}>
              <Typography variant="h6" gutterBottom sx={{ opacity: 0.9 }}>
                Next Event
              </Typography>
              <Typography
                variant="h5"
                gutterBottom
                sx={{ fontFamily: FONT_DISPLAY, fontWeight: 500 }}
              >
                {nextEvent.name}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  opacity: 0.8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.5,
                }}
              >
                <AccessTimeIcon fontSize="small" />
                {(() => {
                  const tz = formatDualTimezone(nextEvent.time, etz);
                  return tz.isSameTimezone
                    ? `${tz.eventTime} ${tz.eventAbbr}`
                    : `${tz.eventTime} ${tz.eventAbbr} (${tz.userTime} ${tz.userAbbr} your time)`;
                })()}
              </Typography>
            </Box>
            <CountdownGrid>
              {timeUnits.slice(0, 4).map((unit) => (
                <TimeUnit key={unit.label}>
                  <TimeValue>{unit.value}</TimeValue>
                  <TimeLabel>{unit.label}</TimeLabel>
                </TimeUnit>
              ))}
            </CountdownGrid>
          </CardContent>
        </CountdownCard>
      </Fade>
    );
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const eventTime = new Date(event.time);

    if (nextEvent && event.name === nextEvent.name) {
      return {
        status: "next",
        icon: <PlayCircleOutlineIcon fontSize="small" />,
        label: "Up Next",
        color: "primary",
      };
    } else if (isBefore(eventTime, now)) {
      return {
        status: "past",
        icon: <CheckCircleIcon fontSize="small" />,
        label: "Completed",
        color: "success",
      };
    } else {
      return {
        status: "upcoming",
        icon: <PendingIcon fontSize="small" />,
        label: "Upcoming",
        color: "default",
      };
    }
  };

  const renderEvent = (event, index) => {
    const { status, icon, label, color } = getEventStatus(event);
    const isPast = status === "past";
    const isNext = status === "next";
    const isExpanded = expandedEvents.has(event.name);
    const eventTime = new Date(event.time);

    return (
      <Fade in={true} timeout={300 + index * 100} key={event.name}>
        <EventCard
          past={isPast}
          current={isNext}
          onClick={() => toggleEventExpansion(event.name)}
        >
          {isNext && <EventProgress variant="indeterminate" color="primary" />}
          <EventDot past={isPast} current={isNext}>
            {isPast && <CheckCircleIcon sx={{ fontSize: 8, color: "white" }} />}
            {isNext && (
              <PlayCircleOutlineIcon sx={{ fontSize: 10, color: "white" }} />
            )}
          </EventDot>

          <CardContent sx={{ pb: 1 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
              mb={1}
            >
              <Box flex={1}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    color: isPast ? "text.secondary" : "text.primary",
                    fontSize: isMobile ? "1rem" : "1.1rem",
                  }}
                >
                  {event.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    mt: 0.5,
                    flexWrap: "wrap",
                  }}
                >
                  <AccessTimeIcon fontSize="small" />
                  {(() => {
                    const tz = formatDualTimezone(eventTime, etz);
                    return tz.isSameTimezone
                      ? `${tz.eventTime} ${tz.eventAbbr}`
                      : `${tz.eventTime} ${tz.eventAbbr} (${tz.userTime} ${tz.userAbbr} your time)`;
                  })()}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip
                  icon={icon}
                  label={label}
                  color={color}
                  size="small"
                  variant={isNext ? "filled" : "outlined"}
                />
                <IconButton size="small">
                  {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
            </Box>

            <Collapse in={isExpanded} timeout={isNext ? "auto" : 300}>
              <Box mt={2} pt={1} borderTop={1} borderColor="divider">
                <Typography
                  variant="body2"
                  component="div"
                  sx={{
                    color: isPast ? "text.secondary" : "text.primary",
                    "& a": {
                      color: theme.palette.primary.main,
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" },
                    },
                  }}
                >
                  <ReactMarkdown>{event.description}</ReactMarkdown>
                </Typography>
              </Box>
            </Collapse>
          </CardContent>
        </EventCard>
      </Fade>
    );
  };

  if (!countdowns?.length) {
    return (
      <TimelineContainer elevation={2}>
        <Typography variant="h5" gutterBottom>
          Event Timeline
        </Typography>
        <Typography color="text.secondary">No events scheduled</Typography>
      </TimelineContainer>
    );
  }

  const sortedEvents = [...countdowns].sort((a, b) =>
    differenceInMilliseconds(new Date(a.time), new Date(b.time)),
  );

  const handleViewAgenda = () => {
    if (eventId) {
      window.open(`/hack/${eventId}/agenda`, "_blank");
    }
  };

  return (
    <TimelineContainer elevation={2}>
      <Box mb={3}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={2}
        >
          <Typography
            variant="h5"
            gutterBottom
            sx={{ fontFamily: FONT_DISPLAY, fontWeight: 500 }}
          >
            Event Timeline
          </Typography>
          <Tooltip title="View Full Agenda" arrow>
            <Button
              variant="outlined"
              size="small"
              onClick={handleViewAgenda}
              startIcon={<EventNoteIcon />}
              endIcon={<OpenInNewIcon sx={{ fontSize: "16px" }} />}
              sx={{
                minWidth: "auto",
                px: 2,
                py: 1,
                borderRadius: 2,
                textTransform: "none",
                fontSize: "0.8rem",
                color: "#1B3A6B",
                borderColor: "var(--line, #E7E1D4)",
                "&:hover": {
                  backgroundColor: "#1B3A6B",
                  color: "#fff",
                  borderColor: "#1B3A6B",
                },
              }}
            >
              {isMobile ? "" : "Agenda"}
            </Button>
          </Tooltip>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: "rgba(27,58,107,0.12)",
            "& .MuiLinearProgress-bar": { backgroundColor: "#1B3A6B" },
          }}
        />
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: "block" }}
        >
          Event Progress: {Math.round(progress)}%
        </Typography>
      </Box>

      {renderCountdown()}

      <TimelineWrapper>
        <TimelineLine />
        {sortedEvents.map(renderEvent)}
      </TimelineWrapper>
    </TimelineContainer>
  );
};

export default EventCountdown;
