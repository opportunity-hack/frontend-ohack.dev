import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useAuthInfo } from '@propelauth/react';
import {
  Typography,
  Container,
  Box,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  Chip,
  useTheme,
  useMediaQuery,
  Snackbar
} from '@mui/material';
import Head from 'next/head';
import { useEnv } from '../../../context/env.context';
import LoginOrRegister from '../../../components/LoginOrRegister/LoginOrRegister';
import axios from 'axios';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import HourglassFullIcon from '@mui/icons-material/HourglassFull';
import Link from 'next/link';

const MentorCheckinPage = () => {
  const router = useRouter();
  const { event_id } = router.query;
  const { isLoggedIn, user, accessToken } = useAuthInfo();
  const { apiServerUrl } = useEnv();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // State variables
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [eventData, setEventData] = useState(null);
  const [mentorData, setMentorData] = useState(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [currentActiveSlot, setCurrentActiveSlot] = useState(null);

  // Helper function to check if a time slot is current
  const isCurrentTimeSlot = (slot) => {    
    if (!slot || !slot.time) return false;

    const now = new Date();
    const month = slot.date.split(' ')[0];
    const day = parseInt(slot.date.split(' ')[1], 10);

    // Parse the time range directly from the time property
    const timeRange = slot.time;
    const [startTimeStr, endTimeStr] = timeRange.split(' - ');
    
    // Remove timezone from end time if present
    const cleanEndTimeStr = endTimeStr.replace(/\s+[A-Z]+$/, '');

    // Convert time strings to Date objects
    const startTime = parseTimeString(startTimeStr, month, day);
    const endTime = parseTimeString(cleanEndTimeStr, month, day);

    if (!startTime || !endTime) return false;
    
    console.log('Time range:', {
      now,
      startTime, 
      endTime, 
      isInRange: now >= startTime && now <= endTime
    });

    return now >= startTime && now <= endTime;
  };

  // Helper function to parse time strings
  const parseTimeString = (timeStr, month, day) => {
    // Handle if timeStr is undefined, return nothing
    if (!timeStr) return null;

    const [hours, minutes] = timeStr.split(":").map((num) => parseInt(num));
    const isPM = timeStr.includes("pm");

    const date = new Date();
    date.setMonth(getMonthNumber(month));
    date.setDate(day);
    date.setHours(isPM && hours !== 12 ? hours + 12 : hours);
    date.setMinutes(minutes || 0);
    date.setSeconds(0);

    return date;
  };

  // Convert month name to month number (0-based)
  const getMonthNumber = (monthName) => {
    const months = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    return months[monthName] || 0;
  };

  // Fetch event data and mentor data
  useEffect(() => {
    if (!event_id || !apiServerUrl) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch event data
        const eventResponse = await fetch(`${apiServerUrl}/api/messages/hackathon/${event_id}`);

        if (!eventResponse.ok) {
          throw new Error(`Failed to fetch event data: ${eventResponse.status}`);
        }

        const eventData = await eventResponse.json();

        console.log('Event data:', eventData);

        if (!eventData || !eventData.start_date || !eventData.end_date) {
          throw new Error('Invalid event data received');
        }

        // Format dates for display
        const startDate = new Date(eventData.start_date);
        const endDate = new Date(eventData.end_date);
        const formattedStartDate = startDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        const formattedEndDate = endDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        setEventData({
          id: event_id,
          name: eventData.title || `Opportunity Hack - ${event_id}`,
          description: eventData.description || "Annual hackathon for nonprofits",
          date: new Date(eventData.start_date).getFullYear().toString(),
          startDate: eventData.start_date,
          endDate: eventData.end_date,
          formattedStartDate,
          formattedEndDate,
          location: eventData.location || "Tempe, Arizona",
          image: eventData.image_url || "https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp"
        });

        // If user is logged in, fetch mentor data
        if (isLoggedIn && user && accessToken) {
          try {
            // Fetch mentor application data
            const mentorResponse = await axios({
              url: `${apiServerUrl}/api/mentor/application/${event_id}`,
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
              }
            });

            // Extract mentor data to a constant to simplify access
            const mentor = mentorResponse.data?.data;

            if (mentor) {
              console.log('Mentor data:', mentor);
              setMentorData(mentor);

              // Parse availability slots from the mentor data
              if (mentor.availability) {
                const availabilityText = mentor.availability;

                // Use the same regex pattern from MentorAvailability.js
                const availabilityPattern = /([A-Za-z]+\s+[A-Za-z]+\s+\d+:\s+[^,]+)/g;

                // Try to match with regex first
                const matches = availabilityText.match(availabilityPattern);

                // If regex doesn't work, fall back to comma split
                const availabilityArray = matches || availabilityText.split(", ");

                // Create slots and prepare for sorting
                const slots = availabilityArray.map(slotText => {
                  // Make sure slotText is properly cleaned and formatted
                  const cleanSlotText = slotText.trim();
                  
                  // Initialize with defaults
                  let dayName = '';
                  let datePart = '';
                  let timePart = '';
                  let timeRange = '';
                  
                  // Check if the format is like "Oct 11: ☀️ Morning (9am - 12pm PST)"
                  if (cleanSlotText.includes(':')) {
                    [datePart, timePart] = cleanSlotText.split(':').map(part => part?.trim());
                    
                    // Extract the time range from parentheses if available
                    const timeMatch = timePart ? timePart.match(/\((.*?)\)/) : null;
                    timeRange = timeMatch ? timeMatch[1] : '';
                    
                    // If datePart contains month and day (e.g., "Oct 11")
                    if (/[A-Za-z]+\s+\d+/.test(datePart)) {
                      // Try to extract the day of week from this date
                      const dateObj = new Date();
                      const monthName = datePart.split(' ')[0];
                      const day = parseInt(datePart.split(' ')[1], 10);
                      
                      // Set the month
                      const months = {
                        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
                        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
                      };
                      
                      dateObj.setMonth(months[monthName] || 0);
                      dateObj.setDate(day);
                      
                      // Get the day of week
                      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                      dayName = days[dateObj.getDay()];
                    }
                  } else {
                    // Format is likely just a day name like "Friday" or "Saturday"
                    datePart = cleanSlotText;
                    dayName = cleanSlotText;
                    
                    // For simple day names, we leave time and timePeriod empty
                    // This is expected behavior as these slots don't have specific times
                  }
                  
                  // If we still don't have a dayName but have a datePart, try to extract dayName
                  if (!dayName && datePart) {
                    // Check if datePart is already a day name
                    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    if (dayNames.includes(datePart)) {
                      dayName = datePart;
                    } else {
                      // Extract first word as a potential day name
                      dayName = datePart.split(' ')[0];
                    }
                  }

                  return {
                    id: `slot-${Math.random().toString(36).substr(2, 9)}`,
                    displayText: cleanSlotText,
                    date: datePart || '',
                    dayName: dayName || '',
                    time: timeRange || '',
                    timePeriod: timePart || '',
                    isCurrent: false
                  };
                });

                // Filter out any potentially empty slots
                const validSlots = slots.filter(slot => slot.displayText && slot.date);

                // Sort slots similar to MentorAvailability.js
                const sortedSlots = validSlots.sort((a, b) => {
                  // Define day of week order for sorting
                  const dayOrder = {
                    "Sunday": 0,
                    "Monday": 1,
                    "Tuesday": 2,
                    "Wednesday": 3,
                    "Thursday": 4,
                    "Friday": 5,
                    "Saturday": 6
                  };

                  // First try to sort by date if it's in "Mon DD" format
                  const datePatternA = a.date.match(/([A-Za-z]+)\s+(\d+)/);
                  const datePatternB = b.date.match(/([A-Za-z]+)\s+(\d+)/);
                  
                  if (datePatternA && datePatternB) {
                    // Get month number
                    const monthOrder = {
                      "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6,
                      "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12
                    };

                    const monthA = datePatternA[1];
                    const monthB = datePatternB[1];
                    const monthOrderA = monthOrder[monthA] || 0;
                    const monthOrderB = monthOrder[monthB] || 0;

                    if (monthOrderA !== monthOrderB) {
                      return monthOrderA - monthOrderB;
                    }

                    // Compare day numbers
                    const dayA = parseInt(datePatternA[2], 10);
                    const dayB = parseInt(datePatternB[2], 10);

                    if (dayA !== dayB) {
                      return dayA - dayB;
                    }
                    
                    // If dates are the same, continue to time period sorting
                  } else {
                    // If not in month/day format, try day of week
                    const dayOrderA = dayOrder[a.dayName] || 99;
                    const dayOrderB = dayOrder[b.dayName] || 99;

                    if (dayOrderA !== dayOrderB) {
                      return dayOrderA - dayOrderB;
                    }
                  }

                  // If same date or day, sort by time period
                  const timeOrderMap = {
                    "Early Morning": 1,
                    "Morning": 2,
                    "Afternoon": 3,
                    "Evening": 4,
                    "Night": 5,
                    "Late Night": 6
                  };

                  // Try to extract time period names
                  const timeA = a.timePeriod.match(/(?:🌅|☀️|🏙️|🌆|🌃|🌙)\s*(Early Morning|Morning|Afternoon|Evening|Night|Late Night)/);
                  const timeB = b.timePeriod.match(/(?:🌅|☀️|🏙️|🌆|🌃|🌙)\s*(Early Morning|Morning|Afternoon|Evening|Night|Late Night)/);

                  const timePeriodA = timeA ? timeA[1] : "";
                  const timePeriodB = timeB ? timeB[1] : "";

                  const timeOrderA = timeOrderMap[timePeriodA] || 99;
                  const timeOrderB = timeOrderMap[timePeriodB] || 99;

                  return timeOrderA - timeOrderB;
                });

                // Filter out general day entries (like "Friday") if we have more specific entries for the same day
                const filteredSlots = (() => {
                  // Group slots by day of week
                  const slotsByDay = {};
                  sortedSlots.forEach(slot => {
                    if (!slotsByDay[slot.dayName]) {
                      slotsByDay[slot.dayName] = [];
                    }
                    slotsByDay[slot.dayName].push(slot);
                  });
                  
                  // For each day, check if we have specific time slots and general day slots
                  const result = [];
                  Object.entries(slotsByDay).forEach(([dayName, daySlots]) => {
                    // Check if we have specific time slots for this day
                    const hasSpecificTimeSlots = daySlots.some(slot => slot.time && slot.time.trim() !== '');
                    
                    // If we have specific time slots, filter out general day entries
                    if (hasSpecificTimeSlots) {
                      // Add only the specific time slots
                      daySlots.forEach(slot => {
                        if (slot.time && slot.time.trim() !== '') {
                          result.push(slot);
                        }
                      });
                    } else {
                      // If we don't have specific time slots, just add the first general day entry
                      // to avoid duplicates like "Friday, Friday"
                      result.push(daySlots[0]);
                    }
                  });
                  
                  return result.sort((a, b) => {
                    // Re-sort to maintain the original sort order
                    const dayOrder = {
                      "Sunday": 0,
                      "Monday": 1,
                      "Tuesday": 2,
                      "Wednesday": 3,
                      "Thursday": 4,
                      "Friday": 5,
                      "Saturday": 6
                    };
                    
                    const dayOrderA = dayOrder[a.dayName] || 99;
                    const dayOrderB = dayOrder[b.dayName] || 99;
                    
                    if (dayOrderA !== dayOrderB) {
                      return dayOrderA - dayOrderB;
                    }
                    
                    // If same day, put specific time slots before general day slots
                    if (a.time && !b.time) return -1;
                    if (!a.time && b.time) return 1;
                    
                    // Then sort by time period if both have times
                    if (a.time && b.time) {
                      const timeOrderMap = {
                        "Early Morning": 1,
                        "Morning": 2,
                        "Afternoon": 3,
                        "Evening": 4,
                        "Night": 5,
                        "Late Night": 6
                      };
                      
                      const timeA = a.timePeriod.match(/(?:🌅|☀️|🏙️|🌆|🌃|🌙)\s*(Early Morning|Morning|Afternoon|Evening|Night|Late Night)/);
                      const timeB = b.timePeriod.match(/(?:🌅|☀️|🏙️|🌆|🌃|🌙)\s*(Early Morning|Morning|Afternoon|Evening|Night|Late Night)/);
                      
                      const timePeriodA = timeA ? timeA[1] : "";
                      const timePeriodB = timeB ? timeB[1] : "";
                      
                      const timeOrderA = timeOrderMap[timePeriodA] || 99;
                      const timeOrderB = timeOrderMap[timePeriodB] || 99;
                      
                      return timeOrderA - timeOrderB;
                    }
                    
                    return 0;
                  });
                })();

                console.log('Sorted availability slots:', filteredSlots);
                setAvailabilitySlots(filteredSlots);

                // Check if any slot is current
                const currentSlot = filteredSlots.find(slot => isCurrentTimeSlot(slot));
                console.log('aCurrent active slot:', currentSlot);
                if (currentSlot) {
                  setCurrentActiveSlot(currentSlot);
                }
              }

              // Check if mentor is already checked in
              const checkinStatusResponse = await axios({
                url: `${apiServerUrl}/api/mentor/checkin/${event_id}/status`,
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${accessToken}`
                }
              });

              console.log('Check-in status:', checkinStatusResponse.data.data);
              if (checkinStatusResponse.data && checkinStatusResponse.data.data.isCheckedIn) {
                setCheckedIn(true);
              }
            }
          } catch (err) {
            console.error('Error fetching mentor data:', err);
            // If 404, user is not a mentor
            if (err.response && err.response.status === 404) {
              setMentorData(null);
            } else {
              setError('Failed to load mentor data. Please try again later.');
            }
          }
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load event data. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [event_id, isLoggedIn, user, accessToken, apiServerUrl]);

  // Group slots by date for better display
  const groupedAvailabilitySlots = useMemo(() => {
    const groups = {};

    availabilitySlots.forEach(slot => {
      const date = slot.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(slot);
    });

    // Create a properly sorted version of the groups
    const sortedGroups = {};
    
    // Sort the date keys
    const sortedDateKeys = Object.keys(groups).sort((a, b) => {
      // Extract month and day from dates like "Oct 11"
      const datePatternA = a.match(/([A-Za-z]+)\s+(\d+)/);
      const datePatternB = b.match(/([A-Za-z]+)\s+(\d+)/);
      
      if (datePatternA && datePatternB) {
        // Get month number
        const monthOrder = {
          "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6,
          "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12
        };

        const monthA = datePatternA[1];
        const monthB = datePatternB[1];
        const monthOrderA = monthOrder[monthA] || 0;
        const monthOrderB = monthOrder[monthB] || 0;

        if (monthOrderA !== monthOrderB) {
          return monthOrderA - monthOrderB;
        }

        // Compare day numbers
        const dayA = parseInt(datePatternA[2], 10);
        const dayB = parseInt(datePatternB[2], 10);
        return dayA - dayB;
      }
      
      // Fallback to alphabetical sorting for dates that don't match the pattern
      return a.localeCompare(b);
    });
    
    // Reconstruct the object with sorted keys
    sortedDateKeys.forEach(key => {
      sortedGroups[key] = groups[key];
    });

    console.log('Grouped availability slots:', sortedGroups);
    return sortedGroups;
  }, [availabilitySlots]);

  // Handle check-in
  const handleCheckin = async () => {
    if (!isLoggedIn || !mentorData) {
      setError('You must be logged in as a registered mentor to check in.');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await axios({
        url: `${apiServerUrl}/api/mentor/checkin/${event_id}/in`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        data: {
          timeSlot: currentActiveSlot ? currentActiveSlot.displayText : 'Custom time slot'
        }
      });

      if (response.data) {
        setCheckedIn(true);
        setSuccess('You have successfully checked in as a mentor!');
        setSnackbarMessage('Checked in successfully! Teams have been notified that you are available.');
        setSnackbarOpen(true);
      }
    } catch (err) {
      console.error('Error checking in:', err);
      setError('Failed to check in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle check-out
  const handleCheckout = async () => {
    if (!isLoggedIn || !mentorData) {
      setError('You must be logged in as a registered mentor to check out.');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await axios({
        url: `${apiServerUrl}/api/mentor/checkin/${event_id}/out`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.data) {
        setCheckedIn(false);
        setSuccess('You have successfully checked out as a mentor.');
        setSnackbarMessage('Checked out successfully! Thanks for your support!');
        setSnackbarOpen(true);
      }
    } catch (err) {
      console.error('Error checking out:', err);
      setError('Failed to check out. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // SEO metadata and descriptions
  const pageTitle = eventData
    ? `Mentor Check-in for ${eventData.name} - Opportunity Hack`
    : "Mentor Check-in - Opportunity Hack";
  const pageDescription = eventData
    ? `Check in as a mentor for ${eventData.name} in ${eventData.location}. Help teams of technologists create solutions for nonprofits and make a real impact.`
    : "Check in as a mentor for our social good hackathon. Help teams of technologists create solutions for nonprofits and make a real impact.";
  const canonicalUrl = `https://ohack.dev/hack/${event_id}/mentor-checkin`;

  // Simplify how we display mentor profile data by creating a helper function
  const renderMentorProfile = (mentor) => {
    if (!mentor) return null;

    return (
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Typography variant="body1" sx={{ mb: 1 }}>
          <strong>Name:</strong> {mentor.name}
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          <strong>Email:</strong> {mentor.email}
        </Typography>
        {mentor.company && (
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Company:</strong> {mentor.company}
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Expertise:</strong>
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {mentor.expertise?.split(', ').map((skill, index) => (
            <Chip key={index} label={skill} size="small" />
          ))}
        </Box>

        {mentor.softwareEngineeringSpecifics && (
          <>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Software Specialties:</strong>
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {mentor.softwareEngineeringSpecifics.split(', ').map((specialty, index) => (
                <Chip key={index} label={specialty} size="small" color="primary" variant="outlined" />
              ))}
            </Box>
          </>
        )}
      </Paper>
    );
  };

  // If user is not logged in, show login prompt
  if (!isLoggedIn) {
    return (
      <Container>
        <Head>
          <title>{pageTitle}</title>
          <meta name="description" content={pageDescription} />
          <link rel="canonical" href={canonicalUrl} />
        </Head>

        <Box my={8} textAlign="center">
          <Typography variant="h1" component="h1" sx={{ fontSize: '2.5rem', mb: 4, mt: 12 }}>
            Mentor Check-in
          </Typography>

          <Alert severity="info" sx={{ mb: 4, mx: 'auto', maxWidth: 600 }}>
            Please log in to access the mentor check-in page.
          </Alert>

          <LoginOrRegister
            introText="You need to be logged in to check in as a mentor."
            previousPage={`/hack/${event_id}/mentor-checkin`}
          />
        </Box>
      </Container>
    );
  }

  // If loading, show loading state
  if (isLoading) {
    return (
      <Container>
        <Head>
          <title>{pageTitle}</title>
          <meta name="description" content={pageDescription} />
          <link rel="canonical" href={canonicalUrl} />
        </Head>

        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // If user is not a registered mentor, show application prompt
  if (!mentorData) {
    return (
      <Container>
        <Head>
          <title>{pageTitle}</title>
          <meta name="description" content={pageDescription} />
          <link rel="canonical" href={canonicalUrl} />
        </Head>

        <Box my={8} textAlign="center">
          <Typography variant="h1" component="h1" sx={{ fontSize: '2.5rem', mb: 4, mt: 12 }}>
            Mentor Check-in
          </Typography>

          <Alert severity="warning" sx={{ mb: 4, mx: 'auto', maxWidth: 600 }}>
            You are not registered as a mentor for this event.
          </Alert>

          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push(`/hack/${event_id}/mentor-application`)}
            sx={{ mt: 2 }}
          >
            Apply to be a Mentor
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta
          name="keywords"
          content="hackathon mentor, mentor check-in, tech for good, nonprofit hackathon, opportunity hack, mentorship, volunteer, tech mentoring"
        />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph tags */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta
          property="og:image"
          content={eventData?.image || "https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp"}
        />
      </Head>

      <Box sx={{ py: 4 }}>
        <Typography variant="h1" component="h1" sx={{ fontSize: '2.5rem', mb: 4 }}>
          Mentor Check-in
        </Typography>

        {eventData && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h2" component="h2" sx={{ fontSize: '1.75rem', mb: 1 }}>
              {eventData.name}
            </Typography>

            <Typography variant="h3" component="h3" sx={{ fontSize: '1.25rem', mb: 1, color: 'text.secondary' }}>
              {eventData.location}
            </Typography>

            <Typography
              variant="subtitle1"
              sx={{
                mb: 2,
                color: "text.secondary",
                display: "flex",
                alignItems: "center",
                gap: 1
              }}
            >
              <Box component="span" sx={{ display: "inline-flex", alignItems: "center" }}>
                📆 {eventData.formattedStartDate}
              </Box>
              {eventData.formattedStartDate !== eventData.formattedEndDate && (
                <>
                  <Box component="span" sx={{ mx: 0.5 }}>to</Box>
                  <Box component="span" sx={{ display: "inline-flex", alignItems: "center" }}>
                    {eventData.formattedEndDate}
                  </Box>
                </>
              )}
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 4 }}>
            {success}
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" component="h3" gutterBottom>
                Mentor Status
              </Typography>

              <Card
                elevation={3}
                sx={{
                  mb: 3,
                  backgroundColor: checkedIn ? 'success.light' : 'background.paper',
                  color: checkedIn ? 'white' : 'text.primary'
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {checkedIn ? (
                      <CheckCircleOutlineIcon sx={{ fontSize: 40, mr: 1 }} />
                    ) : (
                      <CancelOutlinedIcon sx={{ fontSize: 40, mr: 1 }} />
                    )}
                    <Typography variant="h6">
                      {checkedIn ? 'Currently Checked In' : 'Not Checked In'}
                    </Typography>
                  </Box>

                  <Typography variant="body1">
                    {checkedIn
                      ? 'You are currently available to mentor teams. Teams will be notified in Slack that you are available.'
                      : 'You are not currently checked in as a mentor. Check in to notify teams that you are available.'}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  {checkedIn ? (
                    <Button
                      variant="contained"
                      color="error"
                      onClick={handleCheckout}
                      disabled={isSubmitting}
                      startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                    >
                      Check Out
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handleCheckin}
                      disabled={isSubmitting}
                      startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                    >
                      Check In
                    </Button>
                  )}
                </CardActions>
              </Card>

              <Typography variant="h6" gutterBottom>
                Your Profile
              </Typography>

              {renderMentorProfile(mentorData)}
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h5" component="h3" gutterBottom>
                Your Availability
              </Typography>

              {Object.keys(groupedAvailabilitySlots).length > 0 ? (                
                <Box>
                  {Object.entries(groupedAvailabilitySlots).map(([date, slots]) => (
                    <Paper key={date} elevation={2} sx={{ mb: 3, overflow: 'hidden' }}>
                      <Box sx={{
                        bgcolor: 'primary.light',
                        color: 'primary.contrastText',
                        px: 2,
                        py: 1.5
                      }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {date}
                        </Typography>
                      </Box>

                      <Box sx={{ p: 1 }}>
                        {slots.map((slot) => {
                          const isCurrent = currentActiveSlot && currentActiveSlot.displayText === slot.displayText;
                          console.log('Slot:', slot, 'isCurrent:', isCurrent);
                          console.log('Current active slot:', currentActiveSlot);

                          return (
                            <Card
                              key={slot.id}
                              elevation={isCurrent ? 2 : 0}
                              sx={{
                                mb: 1,
                                borderLeft: isCurrent ? '4px solid green' : 'none',
                                bgcolor: isCurrent ? 'rgba(76, 175, 80, 0.08)' : 'background.paper'
                              }}
                            >
                              <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="body2">
                                    {slot.timePeriod}
                                  </Typography>
                                  {isCurrent && (
                                    <Chip
                                      icon={<HourglassFullIcon />}
                                      label="Current"
                                      color="success"
                                      size="small"
                                      sx={{ height: '24px', '& .MuiChip-label': { px: 1 } }}
                                    />
                                  )}
                                </Box>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </Box>
                    </Paper>
                  ))}

                  {!currentActiveSlot && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      None of your registered time slots are currently active. You can still check in if you're available to mentor outside your scheduled times.
                    </Alert>
                  )}
                </Box>
              ) : (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  No availability slots found. Please update your mentor application with your availability.
                </Alert>
              )}

              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Need to Change Your Availability?
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => router.push(`/hack/${event_id}/mentor-application`)}
                  sx={{ mr: 2 }}
                >
                  Update Mentor Application
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Mentor Guidelines
          </Typography>

          <Typography variant="body1" paragraph>
            As a mentor, your role is crucial in supporting teams and ensuring the success of this hackathon.
            Here are some key guidelines to keep in mind:
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Do:
                </Typography>
                <ul>
                  <li>Check in when you arrive to notify teams you're available</li>
                  <li>Be approachable and open to questions from all teams</li>
                  <li>Provide guidance rather than solutions</li>
                  <li>Share your expertise when asked</li>
                  <li>Help teams prioritize features and scope their projects</li>
                  <li>Check out when you leave so teams know you're no longer available</li>
                </ul>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Don't:
                </Typography>
                <ul>
                  <li>Take over implementation of code or design</li>
                  <li>Favor certain teams over others</li>
                  <li>Spend excessive time with a single team</li>
                  <li>Impose your ideas on teams</li>
                  <li>Forget to check out when you leave</li>
                </ul>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, p: 3, bgcolor: 'rgba(0, 0, 0, 0.03)', borderRadius: 2, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Want to learn more about being an effective mentor?
            </Typography>
            <Typography variant="body1" paragraph>
              Visit our comprehensive mentor resource page to discover different mentorship roles, best practices, and tips for making a meaningful impact.
            </Typography>
            <Button
              component={Link}
              href="/about/mentors"
              variant="contained"
              color="primary"
              sx={{ mt: 1 }}
            >
              Mentor Resources
            </Button>
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default MentorCheckinPage;