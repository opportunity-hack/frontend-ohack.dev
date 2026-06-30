import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useAuthInfo } from '@propelauth/react';
import {
  Box,
  CircularProgress,
  Alert,
  Chip,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
} from '@mui/material';
import Head from 'next/head';
import NextLink from 'next/link';
import { useEnv } from '../../../context/env.context';
import LoginOrRegister from '../../../components/LoginOrRegister/LoginOrRegister2';
import axios from 'axios';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import HourglassFullIcon from '@mui/icons-material/HourglassFull';
import SlackIcon from '@mui/icons-material/Chat';
import InfoIcon from '@mui/icons-material/Info';
import { RefinedFonts, RefinedRoot, Eyebrow } from '../../../components/design/refined';
import TeamBreadcrumbs from '../../../components/Teams/TeamBreadcrumbs';
import MentorTeamsTable from '../../../components/Mentor/MentorTeamsTable';
import SurveyCTA from '../../../components/Survey/SurveyCTA';

const MentorCheckinPage = () => {
  const router = useRouter();
  const { event_id } = router.query;
  const { isLoggedIn, user, accessToken } = useAuthInfo();
  const { apiServerUrl, slackSignupUrl } = useEnv();

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
  const [slackNotificationSent, setSlackNotificationSent] = useState(null);
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [currentActiveSlot, setCurrentActiveSlot] = useState(null);
  const [showPreviousSlots, setShowPreviousSlots] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmCheckoutDialogOpen, setConfirmCheckoutDialogOpen] = useState(false);
  // One-stop-shop: all teams for this event (from the single-event endpoint,
  // which returns full team docs incl. mentor_* fields + enriched users[]).
  const [teams, setTeams] = useState([]);
  const [nonprofits, setNonprofits] = useState([]);

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

  // Helper function to compare Month/Day only
  const compareDatesDayMonthOnly = (date1, date2) => {
    const month1 = date1.getMonth();
    const day1 = date1.getDate();
    const month2 = date2.getMonth();
    const day2 = date2.getDate();

    if (month1 === month2 && day1 === day2) {
      return 0;
    } else if (month1 < month2 || (month1 === month2 && day1 < day2)) {
      return -1;
    } else {
      return 1;
    }
  };

  // Compare month and day of Date to current time
  const isDateInThePast = (date1) => {
    const currDate = new Date();
    return compareDatesDayMonthOnly(date1, currDate) >= 0;
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

        // Capture all teams + nonprofits for the one-stop-shop table.
        setTeams(Array.isArray(eventData.teams) ? eventData.teams : []);
        setNonprofits(Array.isArray(eventData.nonprofits) ? eventData.nonprofits : []);

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
                  }

                  // If we still don't have a dayName but have a datePart, try to extract dayName
                  if (!dayName && datePart) {
                    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    if (dayNames.includes(datePart)) {
                      dayName = datePart;
                    } else {
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
                  const dayOrder = {
                    "Sunday": 0, "Monday": 1, "Tuesday": 2, "Wednesday": 3,
                    "Thursday": 4, "Friday": 5, "Saturday": 6
                  };

                  const datePatternA = a.date.match(/([A-Za-z]+)\s+(\d+)/);
                  const datePatternB = b.date.match(/([A-Za-z]+)\s+(\d+)/);

                  if (datePatternA && datePatternB) {
                    const monthOrder = {
                      "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6,
                      "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12
                    };

                    const monthOrderA = monthOrder[datePatternA[1]] || 0;
                    const monthOrderB = monthOrder[datePatternB[1]] || 0;

                    if (monthOrderA !== monthOrderB) {
                      return monthOrderA - monthOrderB;
                    }

                    const dayA = parseInt(datePatternA[2], 10);
                    const dayB = parseInt(datePatternB[2], 10);

                    if (dayA !== dayB) {
                      return dayA - dayB;
                    }
                  } else {
                    const dayOrderA = dayOrder[a.dayName] || 99;
                    const dayOrderB = dayOrder[b.dayName] || 99;

                    if (dayOrderA !== dayOrderB) {
                      return dayOrderA - dayOrderB;
                    }
                  }

                  const timeOrderMap = {
                    "Early Morning": 1, "Morning": 2, "Afternoon": 3,
                    "Evening": 4, "Night": 5, "Late Night": 6
                  };

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
                  const slotsByDay = {};
                  sortedSlots.forEach(slot => {
                    if (!slotsByDay[slot.dayName]) {
                      slotsByDay[slot.dayName] = [];
                    }
                    slotsByDay[slot.dayName].push(slot);
                  });

                  const result = [];
                  Object.entries(slotsByDay).forEach(([dayName, daySlots]) => {
                    const hasSpecificTimeSlots = daySlots.some(slot => slot.time && slot.time.trim() !== '');

                    if (hasSpecificTimeSlots) {
                      daySlots.forEach(slot => {
                        if (slot.time && slot.time.trim() !== '') {
                          result.push(slot);
                        }
                      });
                    } else {
                      result.push(daySlots[0]);
                    }
                  });

                  return result.sort((a, b) => {
                    const dayOrder = {
                      "Sunday": 0, "Monday": 1, "Tuesday": 2, "Wednesday": 3,
                      "Thursday": 4, "Friday": 5, "Saturday": 6
                    };

                    const dayOrderA = dayOrder[a.dayName] || 99;
                    const dayOrderB = dayOrder[b.dayName] || 99;

                    if (dayOrderA !== dayOrderB) {
                      return dayOrderA - dayOrderB;
                    }

                    if (a.time && !b.time) return -1;
                    if (!a.time && b.time) return 1;

                    if (a.time && b.time) {
                      const timeOrderMap = {
                        "Early Morning": 1, "Morning": 2, "Afternoon": 3,
                        "Evening": 4, "Night": 5, "Late Night": 6
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

                setAvailabilitySlots(filteredSlots);

                // Check if any slot is current
                const currentSlot = filteredSlots.find(slot => isCurrentTimeSlot(slot));
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

    const sortedGroups = {};

    const sortedDateKeys = Object.keys(groups).sort((a, b) => {
      const datePatternA = a.match(/([A-Za-z]+)\s+(\d+)/);
      const datePatternB = b.match(/([A-Za-z]+)\s+(\d+)/);

      if (datePatternA && datePatternB) {
        const monthOrder = {
          "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6,
          "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12
        };

        const monthOrderA = monthOrder[datePatternA[1]] || 0;
        const monthOrderB = monthOrder[datePatternB[1]] || 0;

        if (monthOrderA !== monthOrderB) {
          return monthOrderA - monthOrderB;
        }

        const dayA = parseInt(datePatternA[2], 10);
        const dayB = parseInt(datePatternB[2], 10);
        return dayA - dayB;
      }

      return a.localeCompare(b);
    });

    sortedDateKeys.forEach(key => {
      sortedGroups[key] = groups[key];
    });

    return sortedGroups;
  }, [availabilitySlots]);

  // Handle check-in confirmation
  const handleCheckinClick = () => {
    setConfirmDialogOpen(true);
  };

  const handleConfirmCheckin = async () => {
    setConfirmDialogOpen(false);

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
        const notified = response.data.slackNotificationSent;
        setSlackNotificationSent(notified);
        if (notified) {
          setSnackbarMessage('Checked in! Teams in #ask-a-mentor on Slack have been notified you are available.');
        } else {
          setSnackbarMessage('Checked in! See below for how to be announced in #ask-a-mentor.');
        }
        setSnackbarOpen(true);
      }
    } catch (err) {
      console.error('Error checking in:', err);
      setError('Failed to check in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelCheckin = () => {
    setConfirmDialogOpen(false);
  };

  // Handle check-out
  const handleCheckoutClick = () => {
    setConfirmCheckoutDialogOpen(true);
  };

  const handleConfirmCheckout = async () => {
    setConfirmCheckoutDialogOpen(false);

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
        setSnackbarMessage('Checked out successfully! Teams have been notified in #ask-a-mentor that you are no longer available.');
        setSnackbarOpen(true);
      }
    } catch (err) {
      console.error('Error checking out:', err);
      setError('Failed to check out. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelCheckout = () => {
    setConfirmCheckoutDialogOpen(false);
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
  const canonicalUrl = `https://www.ohack.dev/hack/${event_id}/mentor-checkin`;

  // Refined mentor profile card
  const renderMentorProfile = (mentor) => {
    if (!mentor) return null;

    return (
      <Box className="ohx-card" sx={{ p: { xs: 2, md: 2.5 } }}>
        <Box className="ohx-eyebrow" sx={{ mb: 1.5 }}>Your profile</Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1.5 }}>
          <Box sx={{ fontWeight: 600, color: 'var(--ink)' }}>{mentor.name}</Box>
          <Box sx={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{mentor.email}</Box>
          {mentor.company && (
            <Box sx={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{mentor.company}</Box>
          )}
        </Box>

        {mentor.expertise && (
          <>
            <Box sx={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, color: 'var(--faint)', mb: 0.75 }}>
              Expertise
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: mentor.engineeringSpecifics ? 1.5 : 0 }}>
              {mentor.expertise.split(', ').map((skill, index) => (
                <span key={index} className="ohx-tag">{skill}</span>
              ))}
            </Box>
          </>
        )}

        {mentor.engineeringSpecifics && (
          <>
            <Box sx={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, color: 'var(--faint)', mb: 0.75 }}>
              Software specialties
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {mentor.engineeringSpecifics.map((specialty, index) => (
                <span key={index} className="ohx-tag ohx-tag--accent">{specialty}</span>
              ))}
            </Box>
          </>
        )}
      </Box>
    );
  };

  // ---- Refined shell wrapper for the simple gate states ----
  const Shell = ({ children, maxWidth = 1200 }) => (
    <RefinedRoot>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <RefinedFonts />
      </Head>
      <Box className="ohx-wrap" sx={{ maxWidth, pt: 'clamp(96px, 12vh, 150px)', pb: { xs: 8, md: 12 } }}>
        {children}
      </Box>
    </RefinedRoot>
  );

  // If user is not logged in, show login prompt
  if (!isLoggedIn) {
    return (
      <Shell maxWidth={760}>
        <Eyebrow>Mentors</Eyebrow>
        <Box component="h1" className="ohx-display" sx={{ mt: 1.5, mb: 2, fontSize: 'clamp(2.2rem, 5vw, 3.4rem)' }}>
          Mentor check-in
        </Box>
        <Box className="ohx-lead" sx={{ mb: 3 }}>
          Log in to check in, see which teams need help, and jump into a team's mentor panel.
        </Box>
        <LoginOrRegister
          introText="You need to be logged in to check in as a mentor."
          previousPage={`/hack/${event_id}/mentor-checkin`}
        />
      </Shell>
    );
  }

  // If loading, show loading state
  if (isLoading) {
    return (
      <Shell maxWidth={760}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, minHeight: '40vh' }}>
          <CircularProgress sx={{ color: 'var(--brand)' }} />
          <Box sx={{ color: 'var(--muted)' }}>Loading mentor check-in…</Box>
        </Box>
      </Shell>
    );
  }

  // If user is not a registered mentor, show application prompt
  if (!mentorData) {
    return (
      <Shell maxWidth={760}>
        <TeamBreadcrumbs
          items={[{ name: eventData?.name || event_id, href: `/hack/${event_id}` }]}
          current="Mentor check-in"
        />
        <Eyebrow>Mentors</Eyebrow>
        <Box component="h1" className="ohx-display" sx={{ mt: 1.5, mb: 2, fontSize: 'clamp(2.2rem, 5vw, 3.4rem)' }}>
          Mentor check-in
        </Box>
        <Alert severity="warning" sx={{ mb: 3 }}>
          You are not registered as a mentor for this event.
        </Alert>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <NextLink href={`/hack/${event_id}/mentor-application`} className="ohx-btn ohx-btn--primary">
            Apply to be a mentor
          </NextLink>
          <NextLink href={`/hack/${event_id}`} className="ohx-btn ohx-btn--ghost">
            Back to event
          </NextLink>
        </Box>
      </Shell>
    );
  }

  const eventName = eventData?.name || event_id;

  return (
    <RefinedRoot>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta
          name="keywords"
          content="hackathon mentor, mentor check-in, tech for good, nonprofit hackathon, opportunity hack, mentorship, volunteer, tech mentoring"
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={eventData?.image || "https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp"} />
        <RefinedFonts />
      </Head>

      <Box className="ohx-wrap" sx={{ maxWidth: 1200, pt: 'clamp(96px, 12vh, 150px)', pb: { xs: 8, md: 12 } }}>
        <TeamBreadcrumbs
          items={[{ name: eventName, href: `/hack/${event_id}` }]}
          current="Mentor check-in"
        />

        {/* Masthead */}
        <Box component="header" className="rise" sx={{ mb: { xs: 4, md: 5 } }}>
          <Eyebrow>
            {eventName}
            {eventData?.formattedStartDate ? ` · ${eventData.formattedStartDate}` : ''}
          </Eyebrow>
          <Box component="h1" className="ohx-display" sx={{ mt: 1.5, mb: 2, fontSize: 'clamp(2.2rem, 5.4vw, 4rem)' }}>
            Mentor check-in
          </Box>
          <Box className="ohx-lead">
            Tell teams you're available, scan who needs help, and jump straight into a team's mentor panel — all in one place.
          </Box>
          <hr className="ohx-rule" style={{ marginTop: 24 }} />
        </Box>

        <SurveyCTA
          eventId={event_id}
          startDate={eventData?.startDate}
          endDate={eventData?.endDate}
        />

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
        {slackNotificationSent === false && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <strong>Your check-in was not announced in #ask-a-mentor</strong> because we could not find a
            Slack account matching your application email. To be reachable by teams:{' '}
            <a href={slackSignupUrl} target="_blank" rel="noopener noreferrer">
              join our Slack workspace
            </a>{' '}
            using the same email address, then check in again.
          </Alert>
        )}

        {/* Check-in band — the primary action */}
        <Box
          className="ohx-card"
          sx={{
            p: { xs: 2.5, md: 3 },
            mb: { xs: 4, md: 5 },
            borderLeft: `3px solid ${checkedIn ? '#3a7d44' : 'var(--brand)'}`,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { md: 'center' },
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
            {checkedIn
              ? <CheckCircleOutlineIcon sx={{ fontSize: 38, color: '#3a7d44' }} />
              : <CancelOutlinedIcon sx={{ fontSize: 38, color: 'var(--faint)' }} />}
            <Box>
              <Box className="ohx-display" sx={{ fontSize: '1.3rem', color: 'var(--ink)' }}>
                {checkedIn ? 'You are checked in' : 'You are not checked in'}
              </Box>
              <Box sx={{ color: 'var(--muted)', fontSize: '0.92rem', mt: 0.25, maxWidth: '52ch' }}>
                {checkedIn
                  ? 'Teams have been notified in #ask-a-mentor that you are available.'
                  : 'Checking in posts to #ask-a-mentor so teams know you can help.'}
              </Box>
            </Box>
          </Box>
          <Box
            component="button"
            type="button"
            onClick={checkedIn ? handleCheckoutClick : handleCheckinClick}
            disabled={isSubmitting}
            className={`ohx-btn ${checkedIn ? 'ohx-btn--ghost' : 'ohx-btn--primary'}`}
            sx={{ flexShrink: 0, opacity: isSubmitting ? 0.7 : 1 }}
          >
            {isSubmitting ? <CircularProgress size={18} sx={{ color: 'inherit' }} /> : <SlackIcon sx={{ fontSize: 18 }} />}
            {checkedIn ? 'Check out & notify teams' : 'Check in & notify teams'}
          </Box>
        </Box>

        {/* ===== The one-stop-shop: all teams ===== */}
        <Box component="section" sx={{ mb: { xs: 5, md: 6 } }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, flexWrap: 'wrap', mb: 0.5 }}>
            <Box component="h2" className="ohx-display" sx={{ fontSize: 'clamp(1.5rem, 2.8vw, 2rem)', color: 'var(--ink)', m: 0 }}>
              Teams at a glance
            </Box>
            <Box className="ohx-tag">{teams.length} team{teams.length === 1 ? '' : 's'}</Box>
          </Box>
          <Box className="ohx-muted" sx={{ mb: 2.5, maxWidth: '70ch' }}>
            Every team for this event with mentor coverage, open flags, and last-touch so you can find who needs help. Open a team's mentor panel to mark coverage, raise a flag, or leave a note.
          </Box>
          <MentorTeamsTable teams={teams} eventId={event_id} nonprofits={nonprofits} />
        </Box>

        {/* ===== Secondary: your shift (availability) + profile ===== */}
        <Box
          component="section"
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: { xs: 3, md: 4 },
            mb: { xs: 5, md: 6 },
          }}
        >
          <Box>
            <Box component="h2" className="ohx-display" sx={{ fontSize: '1.4rem', color: 'var(--ink)', mb: 2 }}>
              Your availability
            </Box>

            {Object.keys(groupedAvailabilitySlots).length > 0 ? (
              <Box>
                {!showPreviousSlots && Object.entries(groupedAvailabilitySlots).filter(([date]) => isDateInThePast(new Date(date))).length > 0 && (
                  <Box
                    component="button"
                    type="button"
                    onClick={() => setShowPreviousSlots(true)}
                    className="ohx-link"
                    sx={{ background: 'none', border: 'none', cursor: 'pointer', p: 0, mb: 1.5, fontSize: '0.88rem' }}
                  >
                    Show previous slots
                  </Box>
                )}
                {Object.entries(groupedAvailabilitySlots)
                  .filter(([date]) => showPreviousSlots || isDateInThePast(new Date(date)))
                  .map(([date, slots]) => (
                    <Box key={date} className="ohx-card" sx={{ mb: 2, overflow: 'hidden' }}>
                      <Box sx={{ px: 2, py: 1.25, borderBottom: '1px solid var(--line)', bgcolor: 'var(--surface-2)' }}>
                        <Box sx={{ fontWeight: 600, color: 'var(--ink)' }}>{date}</Box>
                      </Box>
                      <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {slots.map((slot) => {
                          const isCurrent = currentActiveSlot && currentActiveSlot.displayText === slot.displayText;
                          return (
                            <Box
                              key={slot.id}
                              sx={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                px: 1.25, py: 1, borderRadius: '6px',
                                borderLeft: isCurrent ? '3px solid #3a7d44' : '3px solid transparent',
                                bgcolor: isCurrent ? 'rgba(58,125,68,0.08)' : 'transparent',
                              }}
                            >
                              <Box sx={{ color: 'var(--ink)', fontSize: '0.9rem' }}>{slot.timePeriod}</Box>
                              {isCurrent && (
                                <Chip icon={<HourglassFullIcon />} label="Now" color="success" size="small" sx={{ height: 24 }} />
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  ))}
                {!currentActiveSlot && (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    None of your registered time slots are active right now. You can still check in if you're available outside your scheduled times.
                  </Alert>
                )}
              </Box>
            ) : (
              <Alert severity="warning">
                No availability slots found. Please update your mentor application with your availability.
              </Alert>
            )}

            <Box sx={{ mt: 2.5 }}>
              <NextLink href={`/hack/${event_id}/mentor-application`} className="ohx-btn ohx-btn--ghost">
                Update mentor application
              </NextLink>
            </Box>
          </Box>

          <Box>
            <Box component="h2" className="ohx-display" sx={{ fontSize: '1.4rem', color: 'var(--ink)', mb: 2 }}>
              You
            </Box>
            {renderMentorProfile(mentorData)}
          </Box>
        </Box>

        {/* ===== Guidelines (condensed) ===== */}
        <Box component="section" className="ohx-card" sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Box component="h2" className="ohx-display" sx={{ fontSize: '1.4rem', color: 'var(--ink)', mb: 2 }}>
            Mentor guidelines
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: { xs: 3, sm: 4 } }}>
            <Box>
              <Box className="ohx-eyebrow" sx={{ mb: 1, color: '#3a7d44' }}>Do</Box>
              <Box component="ul" sx={{ m: 0, pl: 2.5, color: 'var(--muted)', '& li': { mb: 0.75, lineHeight: 1.5 } }}>
                <li>Check in so teams see you're available in <strong>#ask-a-mentor</strong></li>
                <li>Use the table above to find teams with open flags or no recent touch</li>
                <li>Provide guidance rather than writing their code</li>
                <li>Help teams scope and prioritize features</li>
                <li>Check out when you leave</li>
              </Box>
            </Box>
            <Box>
              <Box className="ohx-eyebrow" sx={{ mb: 1, color: 'var(--accent)' }}>Don't</Box>
              <Box component="ul" sx={{ m: 0, pl: 2.5, color: 'var(--muted)', '& li': { mb: 0.75, lineHeight: 1.5 } }}>
                <li>Take over implementation of code or design</li>
                <li>Favor certain teams over others</li>
                <li>Spend the whole event with a single team</li>
                <li>Impose your ideas on teams</li>
                <li>Forget to check out</li>
              </Box>
            </Box>
          </Box>
          <hr className="ohx-rule" style={{ margin: '24px 0' }} />
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ color: 'var(--muted)', maxWidth: '60ch' }}>
              New to mentoring, or want tips on running a great shift? Our mentor resources cover roles, best practices, and team-pairing approaches.
            </Box>
            <NextLink href="/about/mentors" className="ohx-btn ohx-btn--ghost">
              Mentor resources
            </NextLink>
          </Box>
        </Box>
      </Box>

      {/* Check-in Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancelCheckin}
        aria-labelledby="checkin-confirm-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="checkin-confirm-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SlackIcon color="primary" />
          Confirm mentor check-in
        </DialogTitle>
        <DialogContent>
          <DialogContentText>Are you ready to check in as a mentor? This will:</DialogContentText>
          <Box sx={{ mt: 2, pl: 2 }}>
            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <SlackIcon sx={{ fontSize: 16, color: 'primary.main' }} />
              <span>Send a message to <strong>#ask-a-mentor</strong> on Slack</span>
            </Box>
            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon sx={{ fontSize: 16, color: 'primary.main' }} />
              <span>Notify teams that you are available to help</span>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 16, color: 'primary.main' }} />
              <span>Mark you as "Available" in the mentor system</span>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={handleCancelCheckin} color="inherit">Cancel</Button>
          <Button onClick={handleConfirmCheckin} variant="contained" color="success" startIcon={<SlackIcon />} disabled={isSubmitting}>
            {isSubmitting ? 'Checking in…' : 'Check in & send notification'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Check-out Confirmation Dialog */}
      <Dialog
        open={confirmCheckoutDialogOpen}
        onClose={handleCancelCheckout}
        aria-labelledby="checkout-confirm-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="checkout-confirm-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SlackIcon color="error" />
          Confirm mentor check-out
        </DialogTitle>
        <DialogContent>
          <DialogContentText>Are you ready to check out as a mentor? This will:</DialogContentText>
          <Box sx={{ mt: 2, pl: 2 }}>
            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <SlackIcon sx={{ fontSize: 16, color: 'error.main' }} />
              <span>Send a message to <strong>#ask-a-mentor</strong> on Slack</span>
            </Box>
            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon sx={{ fontSize: 16, color: 'error.main' }} />
              <span>Notify teams that you are no longer available</span>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CancelOutlinedIcon sx={{ fontSize: 16, color: 'error.main' }} />
              <span>Mark you as "Unavailable" in the mentor system</span>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={handleCancelCheckout} color="inherit">Cancel</Button>
          <Button onClick={handleConfirmCheckout} variant="contained" color="error" startIcon={<SlackIcon />} disabled={isSubmitting}>
            {isSubmitting ? 'Checking out…' : 'Check out & send notification'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </RefinedRoot>
  );
};

export default MentorCheckinPage;
