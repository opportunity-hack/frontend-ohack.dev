import React, { useState, useEffect } from 'react';
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
  Collapse
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import Moment from 'moment';
import ReactMarkdown from 'react-markdown';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';

const TimelineContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  overflow: 'hidden',
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(3),
  },
}));

const CountdownCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: theme.palette.primary.contrastText,
  marginBottom: theme.spacing(3),
  overflow: 'visible',
}));

const CountdownGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))',
  gap: theme.spacing(1),
  maxWidth: '320px',
  margin: '0 auto',
  [theme.breakpoints.up('sm')]: {
    gap: theme.spacing(2),
    maxWidth: '400px',
  },
}));

const TimeUnit = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(1),
  backgroundColor: 'rgba(255, 255, 255, 0.15)',
  borderRadius: theme.shape.borderRadius,
  backdropFilter: 'blur(10px)',
}));

const TimeValue = styled(Typography)(({ theme }) => ({
  fontSize: '1.2rem',
  fontWeight: 'bold',
  lineHeight: 1,
  [theme.breakpoints.up('sm')]: {
    fontSize: '1.8rem',
  },
}));

const TimeLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.7rem',
  opacity: 0.9,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  [theme.breakpoints.up('sm')]: {
    fontSize: '0.8rem',
  },
}));

const TimelineWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  paddingLeft: theme.spacing(3),
  [theme.breakpoints.up('md')]: {
    paddingLeft: theme.spacing(4),
  },
}));

const TimelineLine = styled(Box)(({ theme }) => ({
  position: 'absolute',
  left: '14px',
  top: '20px',
  bottom: '20px',
  width: '2px',
  backgroundColor: theme.palette.divider,
  [theme.breakpoints.up('md')]: {
    left: '18px',
  },
}));

const EventCard = styled(Card)(({ theme, past, current }) => ({
  position: 'relative',
  marginBottom: theme.spacing(2),
  marginLeft: theme.spacing(2),
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  border: current ? `2px solid ${theme.palette.primary.main}` : '1px solid transparent',
  backgroundColor: past 
    ? theme.palette.grey[50] 
    : current 
      ? theme.palette.primary.light + '10'
      : theme.palette.background.paper,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
  [theme.breakpoints.up('md')]: {
    marginLeft: theme.spacing(3),
  },
}));

const EventDot = styled(Box)(({ theme, past, current }) => ({
  position: 'absolute',
  left: past ? '-37px' : current ? '-39px' : '-37px',
  top: '20px',
  width: past ? '12px' : current ? '16px' : '12px',
  height: past ? '12px' : current ? '16px' : '12px',
  borderRadius: '50%',
  backgroundColor: past 
    ? theme.palette.success.main 
    : current 
      ? theme.palette.primary.main 
      : theme.palette.grey[400],
  border: `3px solid ${theme.palette.background.default}`,
  zIndex: 2,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  [theme.breakpoints.up('md')]: {
    left: past ? '-41px' : current ? '-43px' : '-41px',
  },
}));

const EventProgress = styled(LinearProgress)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: '3px',
  borderRadius: '3px 3px 0 0',
}));

const EventCountdown = ({ countdowns }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [nextEvent, setNextEvent] = useState(null);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [expandedEvents, setExpandedEvents] = useState(new Set());
  const [progress, setProgress] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (!countdowns?.length) return;

    const timer = setInterval(() => {
      const now = Moment();
      const sortedEvents = [...countdowns].sort((a, b) => Moment(a.time).diff(Moment(b.time)));
      
      // Find current event (happening now)
      const current = sortedEvents.find((event, index) => {
        const eventTime = Moment(event.time);
        const nextEventTime = sortedEvents[index + 1] ? Moment(sortedEvents[index + 1].time) : null;
        return eventTime.isBefore(now) && (!nextEventTime || nextEventTime.isAfter(now));
      });
      
      // Find next upcoming event
      const upcoming = sortedEvents.find(event => Moment(event.time).isAfter(now));
      
      setCurrentEvent(current);
      setNextEvent(upcoming);
      
      // Auto-expand current event
      if (current) {
        setExpandedEvents(prev => {
          const newSet = new Set(prev);
          newSet.add(current.name);
          return newSet;
        });
      }
      
      // Calculate overall progress - simple ratio of completed events
      const completedEvents = sortedEvents.filter(event => Moment(event.time).isBefore(now)).length;
      const progressPercent = (completedEvents / sortedEvents.length) * 100;
      setProgress(progressPercent);
      
      // Calculate countdown to next event
      if (upcoming) {
        const eventTime = Moment(upcoming.time);
        const duration = Moment.duration(eventTime.diff(now));
        
        setTimeLeft({
          days: Math.floor(duration.asDays()),
          hours: duration.hours(),
          minutes: duration.minutes(),
          seconds: duration.seconds(),
        });
      } else {
        setTimeLeft(null);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [countdowns]);

  const toggleEventExpansion = (eventName) => {
    setExpandedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventName)) {
        newSet.delete(eventName);
      } else {
        newSet.add(eventName);
      }
      return newSet;
    });
  };

  const renderCountdown = () => {
    if (!nextEvent || !timeLeft) return null;

    const timeUnits = [
      { value: timeLeft.days, label: 'days' },
      { value: timeLeft.hours, label: 'hours' },
      { value: timeLeft.minutes, label: 'mins' },
      { value: timeLeft.seconds, label: 'secs' },
    ].filter(unit => unit.value > 0 || unit.label === 'secs');

    return (
      <Fade in={true}>
        <CountdownCard elevation={6}>
          <CardContent sx={{ p: 3 }}>
            <Box textAlign="center" mb={3}>
              <Typography variant="h6" gutterBottom sx={{ opacity: 0.9 }}>
                Next Event
              </Typography>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {nextEvent.name}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                <AccessTimeIcon fontSize="small" />
                {Moment(nextEvent.time).format('ddd, MMM Do [at] h:mm A')}
              </Typography>
            </Box>
            <CountdownGrid>
              {timeUnits.slice(0, 4).map(unit => (
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
    const now = Moment();
    const eventTime = Moment(event.time);
    
    if (currentEvent && event.name === currentEvent.name) {
      return { status: 'current', icon: <PlayCircleOutlineIcon fontSize="small" />, label: 'In Progress', color: 'primary' };
    } else if (eventTime.isBefore(now)) {
      return { status: 'past', icon: <CheckCircleIcon fontSize="small" />, label: 'Completed', color: 'success' };
    } else {
      return { status: 'upcoming', icon: <PendingIcon fontSize="small" />, label: 'Upcoming', color: 'default' };
    }
  };

  const renderEvent = (event, index) => {
    const { status, icon, label, color } = getEventStatus(event);
    const isPast = status === 'past';
    const isCurrent = status === 'current';
    const isExpanded = expandedEvents.has(event.name);
    const eventTime = Moment(event.time);
    
    return (
      <Fade in={true} timeout={300 + index * 100} key={event.name}>
        <EventCard 
          past={isPast} 
          current={isCurrent}
          onClick={() => toggleEventExpansion(event.name)}
        >
          {isCurrent && <EventProgress variant="indeterminate" color="primary" />}
          <EventDot past={isPast} current={isCurrent}>
            {isPast && <CheckCircleIcon sx={{ fontSize: 8, color: 'white' }} />}
            {isCurrent && <PlayCircleOutlineIcon sx={{ fontSize: 10, color: 'white' }} />}
          </EventDot>
          
          <CardContent sx={{ pb: 1 }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
              <Box flex={1}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: isPast ? 'text.secondary' : 'text.primary',
                    fontSize: isMobile ? '1rem' : '1.1rem'
                  }}
                >
                  {event.name}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}
                >
                  <AccessTimeIcon fontSize="small" />
                  {eventTime.format('ddd, MMM Do [at] h:mm A')}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip 
                  icon={icon}
                  label={label}
                  color={color}
                  size="small"
                  variant={isCurrent ? 'filled' : 'outlined'}
                />
                <IconButton size="small">
                  {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
            </Box>
            
            <Collapse in={isExpanded} timeout={isCurrent ? 'auto' : 300}>
              <Box mt={2} pt={1} borderTop={1} borderColor="divider">
                <Typography 
                  variant="body2" 
                  component="div"
                  sx={{ 
                    color: isPast ? 'text.secondary' : 'text.primary',
                    '& a': {
                      color: theme.palette.primary.main,
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' }
                    }
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
        <Typography variant="h5" gutterBottom>Event Timeline</Typography>
        <Typography color="text.secondary">No events scheduled</Typography>
      </TimelineContainer>
    );
  }

  const sortedEvents = [...countdowns].sort((a, b) => Moment(a.time).diff(Moment(b.time)));

  return (
    <TimelineContainer elevation={2}>
      <Box mb={3}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Event Timeline
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ height: 6, borderRadius: 3 }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
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