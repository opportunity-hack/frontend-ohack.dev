import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  Grid,
  Skeleton,
  Alert,
  Card,
  CardContent,
  Divider,
  Link,
  Tooltip,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { styled } from '@mui/material/styles';
import HackathonHeader from '../../../components/Hackathon/HackathonHeader';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PublicIcon from '@mui/icons-material/Public';
import SchoolIcon from '@mui/icons-material/School';
import FavoriteIcon from '@mui/icons-material/Favorite';
import GroupIcon from '@mui/icons-material/Group';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PeopleIcon from '@mui/icons-material/People';

const CensusContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(4),
}));

const TimeColumnHeader = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  fontWeight: 'bold',
  minWidth: '120px',
  position: 'sticky',
  left: 0,
  zIndex: 2,
}));

const PersonCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1),
  minWidth: '200px',
  '& .person-name': {
    fontWeight: 600,
    marginBottom: theme.spacing(0.5),
  },
  '& .person-details': {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
  },
}));

const HackerTableContainer = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(4),
  padding: theme.spacing(2),
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.25),
  fontSize: '0.75rem',
}));

// Reusable Role Table Component
const RoleTable = ({ role, people, timeSlots, renderPersonInfo, isPersonAvailableAtTime, emptyMessage, icon, color = 'primary' }) => {
  const roleTitle = role.charAt(0).toUpperCase() + role.slice(1);

  if (people.length === 0) {
    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {React.cloneElement(icon, { sx: { mr: 1, color: `${color}.main` } })}
          {roleTitle} (0)
        </Typography>
        <Alert severity="info">
          {emptyMessage || `No ${role} available for the selected time slots.`}
        </Alert>
      </Box>
    );
  }

  if (timeSlots.length === 0) {
    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {React.cloneElement(icon, { sx: { mr: 1, color: `${color}.main` } })}
          {roleTitle} ({people.length})
        </Typography>
        <Alert severity="info">
          No time slots selected to show {role} availability.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {React.cloneElement(icon, { sx: { mr: 1, color: `${color}.main` } })}
        {roleTitle} ({people.length})
      </Typography>

      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TimeColumnHeader>Time Slot</TimeColumnHeader>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: `${color}.light`, color: `${color}.contrastText` }}>
                Available {roleTitle}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {timeSlots.map((timeSlot, index) => {
              const availablePeople = people.filter(person => isPersonAvailableAtTime(person, timeSlot));

              return (
                <TableRow key={index}>
                  <TimeColumnHeader>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {timeSlot.replace(/[🌅☀️🏙️🌆🌃🌙]/g, '').replace(/\s*[A-Z]{2,5}\s*$/, '').trim()}
                    </Typography>
                  </TimeColumnHeader>

                  <PersonCell>
                    {availablePeople.length > 0 ? (
                      availablePeople.map((person, idx) => (
                        <Box key={idx} sx={{ mb: idx < availablePeople.length - 1 ? 2 : 0 }}>
                          {renderPersonInfo(person)}
                          {idx < availablePeople.length - 1 && <Divider sx={{ mt: 1 }} />}
                        </Box>
                      ))
                    ) : (
                      <Typography variant="caption" color="text.disabled">
                        No {role} available
                      </Typography>
                    )}
                  </PersonCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

// Hacker Table Component
const HackerTable = ({ hackers }) => {
  if (hackers.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        No hackers registered for this event yet.
      </Alert>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ mb: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Name</strong></TableCell>
            <TableCell><strong>Details</strong></TableCell>
            <TableCell><strong>Location</strong></TableCell>
            <TableCell><strong>Experience</strong></TableCell>
            <TableCell><strong>Team Status</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {hackers.map((hacker, index) => (
            <TableRow key={index}>
              <TableCell>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {hacker.name}
                  </Typography>
                  {hacker.pronouns && (
                    <StatusChip
                      icon={<PersonIcon />}
                      label={hacker.pronouns}
                      size="small"
                      color="default"
                    />
                  )}
                </Box>
              </TableCell>

              <TableCell>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {hacker.arizonaResident !== undefined && (
                    <StatusChip
                      label={hacker.arizonaResident ? "AZ Resident" : "Out of State"}
                      size="small"
                      color={hacker.arizonaResident ? "success" : "default"}
                    />
                  )}
                  {hacker.participantType && (
                    <StatusChip
                      label={hacker.participantType}
                      size="small"
                      color="primary"
                    />
                  )}
                  {hacker.participationCount && (
                    <StatusChip
                      icon={<EmojiEventsIcon />}
                      label={`${hacker.participationCount} events`}
                      size="small"
                      color="secondary"
                    />
                  )}
                </Box>
              </TableCell>

              <TableCell>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {hacker.state && (
                    <Typography variant="caption" color="text.secondary">
                      <LocationOnIcon fontSize="small" /> {hacker.state}
                      {hacker.country && hacker.country !== 'USA' && `, ${hacker.country}`}
                    </Typography>
                  )}
                  {hacker.schoolOrganization && (
                    <Typography variant="caption" color="text.secondary">
                      <SchoolIcon fontSize="small" /> {hacker.schoolOrganization}
                    </Typography>
                  )}
                </Box>
              </TableCell>

              <TableCell>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {hacker.skills && (
                    <Typography variant="caption" color="text.secondary">
                      💻 {Array.isArray(hacker.skills) ? hacker.skills.slice(0, 3).join(', ') : hacker.skills}
                    </Typography>
                  )}
                  {hacker.socialCauses && (
                    <Typography variant="caption" color="text.secondary">
                      <FavoriteIcon fontSize="small" /> {Array.isArray(hacker.socialCauses) ? hacker.socialCauses.slice(0, 2).join(', ') : hacker.socialCauses}
                    </Typography>
                  )}
                </Box>
              </TableCell>

              <TableCell>
                {hacker.teamStatus && (
                  <StatusChip
                    icon={<GroupIcon />}
                    label={hacker.teamStatus}
                    size="small"
                    color={hacker.teamStatus.includes('have a team') ? 'success' : 'primary'}
                  />
                )}
                {hacker.teamMatchingPreferredSize && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    Preferred size: {hacker.teamMatchingPreferredSize}
                  </Typography>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default function CensusPage() {
  const router = useRouter();
  const { event_id } = router.query;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [judges, setJudges] = useState([]);
  const [hackers, setHackers] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);

  // Filter and UI state
  const [selectedTimeSlots, setSelectedTimeSlots] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Fetch all data
  useEffect(() => {
    if (!event_id) return;

    const fetchAllData = async () => {
      try {
        setLoading(true);

        // Fetch event data and all participant types
        const [eventRes, mentorRes, volunteerRes, judgeRes, hackerRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${event_id}`),
          fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${event_id}/mentor`),
          fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${event_id}/volunteer`),
          fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${event_id}/judge`),
          fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${event_id}/hacker`)
        ]);

        const [eventData, mentorData, volunteerData, judgeData, hackerData] = await Promise.all([
          eventRes.json(),
          mentorRes.json(),
          volunteerRes.json(),
          judgeRes.json(),
          hackerRes.json()
        ]);

        setEventData(eventData);

        // Filter only selected participants
        const selectedMentors = mentorData.data?.filter(p => p.isSelected) || [];
        const selectedVolunteers = volunteerData.data?.filter(p => p.isSelected) || [];
        const selectedJudges = judgeData.data?.filter(p => p.isSelected) || [];
        const selectedHackers = hackerData.data?.filter(p => p.isSelected) || [];

        setMentors(selectedMentors);
        setVolunteers(selectedVolunteers);
        setJudges(selectedJudges);
        setHackers(selectedHackers);

        // Process availability data to create time slots
        const slots = processAvailabilityData(selectedMentors, selectedVolunteers, eventData);
        setTimeSlots(slots);

        // Initialize with all time slots selected by default
        setSelectedTimeSlots(new Set(slots));

      } catch (error) {
        console.error('Error fetching census data:', error);
        setError('Failed to fetch census data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [event_id]);

  // Process availability data from mentors and volunteers to create sorted time slots
  const processAvailabilityData = (mentors, volunteers, event) => {
    const allTimeSlots = new Set();

    // Process mentor availability
    mentors.forEach(mentor => {
      if (mentor.availability) {
        const slots = parseAvailabilitySlots(mentor.availability);
        slots.forEach(slot => allTimeSlots.add(slot));
      }
    });

    // Process volunteer availability
    volunteers.forEach(volunteer => {
      if (volunteer.availability) {
        const slots = parseAvailabilitySlots(volunteer.availability);
        slots.forEach(slot => allTimeSlots.add(slot));
      }
    });

    // Add judge time slot (last day 3pm-5:30pm)
    if (event?.end_date) {
      const lastDay = new Date(event.end_date);
      const dayName = lastDay.toLocaleDateString('en-US', { weekday: 'long' });
      const monthDay = lastDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      allTimeSlots.add(`${dayName} ${monthDay}: Judging (3:00pm - 5:30pm)`);
    }

    // Convert to array and sort
    const sortedSlots = Array.from(allTimeSlots).sort((a, b) => {
      return parseTimeForSort(a).localeCompare(parseTimeForSort(b));
    });

    return sortedSlots;
  };

  // Parse availability string into individual time slots
  const parseAvailabilitySlots = (availability) => {
    if (!availability || typeof availability !== 'string') return [];

    const slots = [];

    // Handle mentor format: "Friday Oct 10: 🌅 Early Morning (7am - 9am PST), Saturday Oct 11: ☀️ Morning (9am - 11am PST)"
    if (availability.includes('🌅') || availability.includes('☀️') || availability.includes('🏙️')) {
      let currentSlot = "";
      const parts = availability.split(", ");

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const startsNewSlot = /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|\w+ \w+ \d+:|🌅|☀️|🏙️|🌆|🌃|🌙)/.test(part);

        if (startsNewSlot && currentSlot) {
          slots.push(currentSlot.trim());
          currentSlot = part;
        } else if (currentSlot) {
          currentSlot += ", " + part;
        } else {
          currentSlot = part;
        }
      }
      if (currentSlot) {
        slots.push(currentSlot.trim());
      }
    }
    // Handle volunteer format: "Friday, Oct 10: Event Name - 🍕 Food Service (8:00am - 11:00am)"
    else {
      const parts = availability.split(/,\s+(?=\w+,\s+\w+\s+\d+:)/);
      slots.push(...parts.map(slot => slot.trim()));
    }

    return slots.filter(slot => slot.length > 0);
  };

  // Create a sortable string from time slot for chronological ordering
  const parseTimeForSort = (timeSlot) => {
    // Extract date and time information for sorting
    const dateMatch = timeSlot.match(/(\w+),?\s+(\w+)\s+(\d+)/);
    if (!dateMatch) return timeSlot;

    const [, dayName, month, day] = dateMatch;
    const timeMatch = timeSlot.match(/\((\d+):?(\d*)([ap]m)/);

    if (!timeMatch) return `${month} ${day.padStart(2, '0')} 00:00`;

    const [, hour, minute = '00', ampm] = timeMatch;
    let hour24 = parseInt(hour);
    if (ampm === 'pm' && hour24 !== 12) hour24 += 12;
    if (ampm === 'am' && hour24 === 12) hour24 = 0;

    return `${month} ${day.padStart(2, '0')} ${hour24.toString().padStart(2, '0')}:${minute.padStart(2, '0')}`;
  };

  // Check if a person is available during a specific time slot
  const isPersonAvailableAtTime = (person, timeSlot) => {
    if (!person.availability) return false;

    const normalizedTimeSlot = normalizeTimeSlot(timeSlot);
    const normalizedAvailability = normalizeTimeSlot(person.availability);

    return normalizedAvailability.includes(normalizedTimeSlot.split(':')[0]);
  };

  // Normalize time slot for comparison
  const normalizeTimeSlot = (slot) => {
    return slot.toLowerCase().replace(/[🌅☀️🏙️🌆🌃🌙🍕🧹📸🎤🎯🔧💻📋🎨🔒🎵🏃‍♂️🛠️📊🎪🎭🎬🎮🎲]/g, '').trim();
  };

  // Render person info for mentor
  const renderMentorInfo = (mentor) => (
    <Box className="person-details">
      <Typography className="person-name" variant="body2">
        {mentor.name}
        {mentor.pronouns && (
          <StatusChip
            icon={<PersonIcon />}
            label={mentor.pronouns}
            size="small"
            color="default"
          />
        )}
      </Typography>
      {mentor.inPerson !== undefined && (
        <StatusChip
          label={mentor.inPerson ? "In-Person" : "Remote"}
          size="small"
          color={mentor.inPerson ? "success" : "info"}
        />
      )}
      {mentor.company && (
        <Typography variant="caption" color="text.secondary">
          <WorkIcon fontSize="small" /> {mentor.company}
        </Typography>
      )}
      {mentor.state && (
        <Typography variant="caption" color="text.secondary">
          <LocationOnIcon fontSize="small" /> {mentor.state}
          {mentor.country && mentor.country !== 'USA' && `, ${mentor.country}`}
        </Typography>
      )}
      {mentor.expertise && (
        <Typography variant="caption" color="text.secondary">
          🎯 {Array.isArray(mentor.expertise) ? mentor.expertise.join(', ') : mentor.expertise}
        </Typography>
      )}
    </Box>
  );

  // Render person info for volunteer
  const renderVolunteerInfo = (volunteer) => {
    // Parse volunteer availability for this time slot
    const getVolunteerTask = (volunteer, timeSlot) => {
      if (!volunteer.availability) return '';

      const normalizedSlot = normalizeTimeSlot(timeSlot);
      const availabilitySlots = parseAvailabilitySlots(volunteer.availability);

      for (const slot of availabilitySlots) {
        if (normalizeTimeSlot(slot).includes(normalizedSlot.split(':')[0])) {
          // Extract the task/role from volunteer format
          const taskMatch = slot.match(/:\s*([^-]+?)\s*-\s*([🍕🧹📸🎤🎯🔧💻📋🎨🔒🎵🏃‍♂️🛠️📊🎪🎭🎬🎮🎲])\s*([^(]+)/);
          if (taskMatch) {
            const [, eventName, emoji, role] = taskMatch;
            return `${emoji} ${role.trim()}`;
          }
        }
      }
      return '';
    };

    return (
      <Box className="person-details">
        <Typography className="person-name" variant="body2">
          {volunteer.name}
          {volunteer.pronouns && (
            <StatusChip
              icon={<PersonIcon />}
              label={volunteer.pronouns}
              size="small"
              color="default"
            />
          )}
        </Typography>
        {volunteer.inPerson !== undefined && (
          <StatusChip
            label={volunteer.inPerson ? "In-Person" : "Remote"}
            size="small"
            color={volunteer.inPerson ? "success" : "info"}
          />
        )}
        {volunteer.experienceLevel && (
          <Typography variant="caption" color="text.secondary">
            📊 {volunteer.experienceLevel}
          </Typography>
        )}
        {volunteer.socialCauses && (
          <Typography variant="caption" color="text.secondary">
            <FavoriteIcon fontSize="small" /> {Array.isArray(volunteer.socialCauses) ? volunteer.socialCauses.slice(0, 2).join(', ') : volunteer.socialCauses}
          </Typography>
        )}
        {volunteer.otherSocialCause && (
          <Typography variant="caption" color="text.secondary">
            💡 {volunteer.otherSocialCause}
          </Typography>
        )}
      </Box>
    );
  };

  // Render person info for judge
  const renderJudgeInfo = (judge) => (
    <Box className="person-details">
      <Typography className="person-name" variant="body2">
        {judge.name}
        {judge.pronouns && (
          <StatusChip
            icon={<PersonIcon />}
            label={judge.pronouns}
            size="small"
            color="default"
          />
        )}
      </Typography>
      {judge.title && (
        <Typography variant="caption" color="text.secondary">
          <WorkIcon fontSize="small" /> {judge.title}
        </Typography>
      )}
      {judge.background && (
        <Typography variant="caption" color="text.secondary">
          🎯 {judge.background}
        </Typography>
      )}
      {judge.companyName && (
        <Typography variant="caption" color="text.secondary">
          🏢 {judge.companyName}
        </Typography>
      )}
      {judge.participationCount && (
        <StatusChip
          icon={<EmojiEventsIcon />}
          label={`${judge.participationCount} events`}
          size="small"
          color="primary"
        />
      )}
    </Box>
  );

  // Check if judge should be shown for a time slot (only last day 3pm-5:30pm)
  const isJudgeTimeSlot = (timeSlot) => {
    // Check if this is a judging time slot
    if (!timeSlot.includes('Judging')) return false;

    // Get the last day of the hackathon
    if (!eventData?.end_date) return false;

    const lastDay = new Date(eventData.end_date);
    const lastDayName = lastDay.toLocaleDateString('en-US', { weekday: 'long' });
    const lastMonthDay = lastDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Check if the time slot is for the last day and contains judging
    return timeSlot.includes(lastDayName) &&
           timeSlot.includes(lastMonthDay) &&
           timeSlot.includes('Judging') &&
           timeSlot.includes('3:00pm - 5:30pm');
  };

  // Filter management functions
  const handleTimeSlotToggle = (timeSlot) => {
    setSelectedTimeSlots(prev => {
      const newSet = new Set(prev);
      if (newSet.has(timeSlot)) {
        newSet.delete(timeSlot);
      } else {
        newSet.add(timeSlot);
      }
      return newSet;
    });
  };

  const handleSelectAllTimeSlots = () => {
    setSelectedTimeSlots(new Set(timeSlots));
  };

  const handleDeselectAllTimeSlots = () => {
    setSelectedTimeSlots(new Set());
  };

  const getFilteredTimeSlots = () => {
    return timeSlots.filter(slot => selectedTimeSlots.has(slot));
  };

  // Get role-specific data filtered by time slots
  const getFilteredData = (role) => {
    const filteredSlots = getFilteredTimeSlots();

    switch (role) {
      case 'mentors':
        return mentors.filter(person =>
          filteredSlots.some(slot => isPersonAvailableAtTime(person, slot))
        );
      case 'volunteers':
        return volunteers.filter(person =>
          filteredSlots.some(slot => isPersonAvailableAtTime(person, slot))
        );
      case 'judges':
        // Show judges only if judging time slots are selected
        const hasJudgingSlots = filteredSlots.some(slot => isJudgeTimeSlot(slot));
        return hasJudgingSlots ? judges : [];
      case 'hackers':
        return hackers; // Hackers are always shown
      default:
        return [];
    }
  };


  if (loading) {
    return (
      <CensusContainer maxWidth="xl">
        <Skeleton variant="rectangular" height={60} />
        <Skeleton variant="rectangular" height={400} sx={{ mt: 2 }} />
      </CensusContainer>
    );
  }

  if (error) {
    return (
      <CensusContainer maxWidth="xl">
        <Alert severity="error">{error}</Alert>
      </CensusContainer>
    );
  }

  return (
    <>
      <Head>
        <title>
          Census - {eventData?.title || 'Hackathon'} | Opportunity Hack
        </title>
        <meta name="description" content={`Availability census for ${eventData?.title || 'hackathon'} participants`} />
      </Head>

      <CensusContainer maxWidth="xl">
        {eventData && (
          <HackathonHeader
            title={`${eventData.title} - Participant Census`}
            startDate={eventData.start_date}
            endDate={eventData.end_date}
            location={eventData.location}
            description="When participants are available during the hackathon"
          />
        )}

        <Typography variant="h5" gutterBottom sx={{ mt: 3, mb: 2 }}>
          📊 Participant Census
        </Typography>

        <Typography variant="body2" color="text.secondary" paragraph>
          Interactive census showing when participants are available during the hackathon.
          Filter by time slots and view each role separately for better focus.
        </Typography>

        {/* Time Slot Filter */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">
              <AccessTimeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Time Slot Filter
            </Typography>
            <Box>
              <Button
                size="small"
                onClick={handleSelectAllTimeSlots}
                disabled={selectedTimeSlots.size === timeSlots.length}
                sx={{ mr: 1 }}
              >
                Select All
              </Button>
              <Button
                size="small"
                onClick={handleDeselectAllTimeSlots}
                disabled={selectedTimeSlots.size === 0}
                color="error"
              >
                Clear All
              </Button>
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Chip
              label={`${selectedTimeSlots.size} of ${timeSlots.length} time slots selected`}
              color={selectedTimeSlots.size > 0 ? 'primary' : 'default'}
              icon={<FilterListIcon />}
            />
          </Box>

          <Accordion expanded={showFilters} onChange={(_, expanded) => setShowFilters(expanded)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body2">
                {showFilters ? 'Hide' : 'Show'} Time Slot Selection
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormGroup>
                <Grid container spacing={1}>
                  {timeSlots.map((timeSlot) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={timeSlot}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedTimeSlots.has(timeSlot)}
                            onChange={() => handleTimeSlotToggle(timeSlot)}
                            size="small"
                          />
                        }
                        label={
                          <Typography variant="caption">
                            {timeSlot.replace(/[🌅☀️🏙️🌆🌃🌙]/g, '').replace(/\s*[A-Z]{2,5}\s*$/, '').trim()}
                          </Typography>
                        }
                      />
                    </Grid>
                  ))}
                </Grid>
              </FormGroup>
            </AccordionDetails>
          </Accordion>
        </Paper>

        {selectedTimeSlots.size === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              No time slots selected. Please select at least one time slot to view participant availability.
            </Typography>
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {/* Mentors Table */}
            <Grid size={{ xs: 12 }}>
              <RoleTable
                role="mentors"
                people={getFilteredData('mentors')}
                timeSlots={getFilteredTimeSlots()}
                renderPersonInfo={renderMentorInfo}
                isPersonAvailableAtTime={isPersonAvailableAtTime}
                icon={<PeopleIcon />}
                color="primary"
              />
            </Grid>

            {/* Volunteers Table */}
            <Grid size={{ xs: 12 }}>
              <RoleTable
                role="volunteers"
                people={getFilteredData('volunteers')}
                timeSlots={getFilteredTimeSlots()}
                renderPersonInfo={renderVolunteerInfo}
                isPersonAvailableAtTime={isPersonAvailableAtTime}
                icon={<WorkIcon />}
                color="secondary"
              />
            </Grid>

            {/* Judges Table - Smart Visibility */}
            {getFilteredTimeSlots().some(slot => isJudgeTimeSlot(slot)) && (
              <Grid size={{ xs: 12 }}>
                <RoleTable
                  role="judges"
                  people={getFilteredData('judges')}
                  timeSlots={getFilteredTimeSlots().filter(slot => isJudgeTimeSlot(slot))}
                  renderPersonInfo={renderJudgeInfo}
                  isPersonAvailableAtTime={() => true} // Judges are available during judging slots
                  emptyMessage="No judges available for judging time slots"
                  icon={<EmojiEventsIcon />}
                  color="success"
                />
              </Grid>
            )}

            {/* Hackers Table - Always Show */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <GroupIcon sx={{ mr: 1, color: 'info.main' }} />
                  Hackers ({hackers.length})
                </Typography>
                <HackerTable hackers={hackers} />
              </Box>
            </Grid>
          </Grid>
        )}


        <Box sx={{ mt: 4 }}>
          <Typography variant="caption" color="text.secondary">
            💡 This census shows real-time availability based on participant registrations.
            Times are shown as registered by participants and may be in different time zones.
          </Typography>
        </Box>
      </CensusContainer>
    </>
  );
}