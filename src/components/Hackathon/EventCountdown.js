import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, Chip, Divider, useMediaQuery } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import Moment from 'moment';
import ReactMarkdown from 'react-markdown';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';

const TimelineContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
}));

const EventItem = styled(Box)(({ theme, past }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderLeft: `4px solid ${past ? theme.palette.grey[400] : theme.palette.primary.main}`,
  backgroundColor: past ? theme.palette.grey[100] : theme.palette.background.paper,
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: past ? theme.palette.grey[200] : theme.palette.action.hover,
  },
}));

const EventTitle = styled(Typography)(({ theme, past }) => ({
  fontWeight: 'bold',
  color: past ? theme.palette.text.secondary : theme.palette.text.primary,
}));

const EventTime = styled(Typography)(({ theme }) => ({
  fontSize: '0.9rem',
  color: theme.palette.text.secondary,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
}));

const EventDescription = styled(Typography)(({ theme, past }) => ({
  marginTop: theme.spacing(1),
  a: {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  color: past ? theme.palette.text.secondary : theme.palette.text.primary,
}));

const MainCountdown = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.primary.light,
  borderRadius: theme.shape.borderRadius,
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
}));

const CountdownUnits = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
}));

const TimeUnit = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minWidth: '60px',
}));

const TimeValue = styled(Typography)(({ theme }) => ({
  fontSize: '1.2rem',
  fontWeight: 'bold',
  [theme.breakpoints.up('sm')]: {
    fontSize: '1.5rem',
  },
}));

const TimeLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.7rem',
  [theme.breakpoints.up('sm')]: {
    fontSize: '0.8rem',
  },
}));

const NextEventInfo = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  [theme.breakpoints.up('md')]: {
    textAlign: 'left',
  },
}));


const EventCountdown = ({ countdowns }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [nextEvent, setNextEvent] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Moment();
      const upcoming = countdowns.find(event => Moment(event.time).isAfter(now));
      
      if (upcoming) {
        setNextEvent(upcoming);
        const eventTime = Moment(upcoming.time);
        const duration = Moment.duration(eventTime.diff(now));
        
        setTimeLeft({
          months: duration.months(),
          days: duration.days(),
          hours: duration.hours(),
          minutes: duration.minutes(),
          seconds: duration.seconds(),
        });
      } else {
        setNextEvent(null);
        setTimeLeft(null);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [countdowns]);

  const renderMainCountdown = () => {
    if (!nextEvent || !timeLeft) return null;

    const timeUnits = ['months', 'days', 'hours', 'minutes', 'seconds'];
    const visibleUnits = timeUnits.filter(unit => timeLeft[unit] > 0 || unit === 'seconds');

    return (
      <MainCountdown>
        <NextEventInfo>
          <Typography variant="h6" gutterBottom={isMobile}>Next: {nextEvent.name}</Typography>
          <Typography variant="body2" display="flex" alignItems="center" justifyContent={isMobile ? 'center' : 'flex-start'}>
            <AccessTimeIcon fontSize="small" style={{ marginRight: '4px' }} />
            {Moment(nextEvent.time).format('ddd MMM Do, h:mm a')}
          </Typography>
        </NextEventInfo>
        <CountdownUnits>
          {visibleUnits.slice(0, 4).map(unit => (
            <TimeUnit key={unit}>
              <TimeValue>{timeLeft[unit]}</TimeValue>
              <TimeLabel>{unit}</TimeLabel>
            </TimeUnit>
          ))}
        </CountdownUnits>
      </MainCountdown>
    );
  };

  const renderEventItem = (event) => {
    const isPast = Moment(event.time).isBefore(Moment());
    const isCurrent = nextEvent && event.name === nextEvent.name;

    return (
      <EventItem key={event.name} past={isPast}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <EventTitle variant="h6" past={isPast}>
            {event.name}
          </EventTitle>
          <Chip 
            icon={isPast ? <CheckCircleIcon /> : (isCurrent ? <AccessTimeIcon /> : <PendingIcon />)} 
            label={isPast ? 'Completed' : (isCurrent ? 'Current' : 'Upcoming')}
            color={isPast ? 'default' : (isCurrent ? 'primary' : 'secondary')}
            size="small"
          />
        </Box>
        <EventTime>
          <AccessTimeIcon fontSize="small" />
          {Moment(event.time).format('ddd MMM Do, h:mm a')}
        </EventTime>
        <EventDescription past={isPast}>
          <ReactMarkdown>{event.description}</ReactMarkdown>
        </EventDescription>
      </EventItem>
    );
  };

  return (
    <TimelineContainer elevation={2}>
      <Typography variant="h5" gutterBottom>
        Event Timeline
      </Typography>
      {renderMainCountdown()}
      <Divider style={{ margin: '20px 0' }} />
      {countdowns.map(renderEventItem)}
    </TimelineContainer>
  );
};

export default EventCountdown;