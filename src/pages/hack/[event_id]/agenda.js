import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  Button,
  useMediaQuery,
  useTheme,
  Link
} from "@mui/material";
import { styled } from '@mui/material/styles';
import { format, differenceInMilliseconds, differenceInHours } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import PrintIcon from '@mui/icons-material/Print';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EventIcon from '@mui/icons-material/Event';
import QRCodeIcon from '@mui/icons-material/QrCode';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { QRCodeSVG } from 'qrcode.react';

// Styled components
const AgendaContainer = styled(Container)(({ theme }) => ({
  marginTop: '10px', // Account for navbar spacing
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  '@media print': {
    marginTop: '0px', // Remove margin for print
    padding: theme.spacing(1),
    paddingTop: theme.spacing(2),
    maxWidth: 'none',
    width: '100%',
  }
}));

const PrintOnlySection = styled(Box)(({ theme }) => ({
  display: 'none',
  '@media print': {
    display: 'block',
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    border: '2px solid #333',
    borderRadius: theme.spacing(1),
    textAlign: 'center',
    backgroundColor: '#f5f5f5'
  }
}));

const NoPrintSection = styled(Box)(({ theme }) => ({
  '@media print': {
    display: 'none'
  }
}));

const HackathonHeader = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(3),
  marginTop: theme.spacing(5),
  marginBottom: theme.spacing(3),
  textAlign: 'center',
  '@media print': {
    background: '#333 !important',
    color: 'white !important',
    WebkitPrintColorAdjust: 'exact',
    colorAdjust: 'exact',
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  }
}));

const EventCard = styled(Card)(({ theme, isPast, isCurrent, isUpcoming }) => ({
  marginBottom: theme.spacing(2),
  border: isCurrent ? `2px solid ${theme.palette.primary.main}` : '1px solid transparent',
  backgroundColor: isPast
    ? theme.palette.grey[50]
    : isCurrent
      ? theme.palette.primary.light + '10'
      : theme.palette.background.paper,
  opacity: isPast ? 0.7 : 1,
  '@media print': {
    border: isCurrent ? '2px solid #333' : '1px solid #ddd',
    backgroundColor: isPast ? '#f9f9f9' : isCurrent ? '#f0f0f0' : 'white',
    WebkitPrintColorAdjust: 'exact',
    colorAdjust: 'exact',
    pageBreakInside: 'avoid',
    marginBottom: theme.spacing(1)
  }
}));

const AgendaPage = ({ eventData }) => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { event_id } = router.query;
  const [currentTime, setCurrentTime] = useState(new Date());

  const event = eventData;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  if (!event) {
    return (
      <AgendaContainer>
        <Typography variant="h4" align="center">
          Event not found
        </Typography>
      </AgendaContainer>
    );
  }

  // Get event details with fallbacks and stub data
  // NOTE: See docs/agenda-data-structure.md for complete field specifications
  const eventTitle = event.title || `Hackathon Event ${event_id}`;
  const eventLocation = event.location || "Virtual/TBA";

  // Parse location to extract venue name and address if combined
  const parseLocation = (locationStr) => {
    if (!locationStr || locationStr === "Virtual/TBA") return { venue: "Virtual/TBA", address: "" };

    // Check if location contains " - " separator indicating venue - address format
    if (locationStr.includes(" - ")) {
      const parts = locationStr.split(" - ");
      return { venue: parts[0].trim(), address: parts[1].trim() };
    }

    // Otherwise treat the whole string as venue
    return { venue: locationStr, address: "" };
  };

  const { venue: eventVenue, address: eventAddress } = parseLocation(eventLocation);

  // Stub fields - can be added to event data object:
  const eventDescription = event.description || "Join us for an exciting hackathon focused on creating technology solutions for nonprofits.";
  const eventWebsite = event.website || `https://ohack.dev/hack/${event_id}`;
  const eventHashtag = event.hashtag || "#OpportunityHack";

  // Additional fields that could be added:
  // const eventParkingInfo = event.venue_details?.parking_info;
  // const eventWifiInfo = event.venue_details?.wifi_info;
  // const eventCapacity = event.venue_details?.capacity;
  // const eventSponsors = event.sponsors || [];
  // const eventOrganizers = event.organizers || [];

  const eventStartDate = event.start_date ? new Date(event.start_date) : null;
  const eventEndDate = event.end_date ? new Date(event.end_date) : null;

  // Format event schedule/countdowns
  const sortedEvents = event.countdowns
    ? [...event.countdowns].sort((a, b) =>
        differenceInMilliseconds(new Date(a.time), new Date(b.time))
      )
    : [];

  // Determine event status
  const getEventStatus = (eventTime) => {
    const now = currentTime;
    const eventDate = new Date(eventTime);
    const hoursDiff = differenceInHours(eventDate, now);

    if (hoursDiff < -2) return { status: 'past', label: 'Completed', color: 'success' };
    if (hoursDiff <= 2 && hoursDiff >= -2) return { status: 'current', label: 'In Progress', color: 'primary' };
    return { status: 'upcoming', label: 'Upcoming', color: 'default' };
  };

  const handlePrint = () => {
    window.print();
  };

  const agendaUrl = `https://ohack.dev/hack/${event_id}/agenda`;

  return (
    <>
      <Head>
        <title>{eventTitle} - Event Agenda | Opportunity Hack</title>
        <meta name="description" content={`Complete agenda for ${eventTitle} hackathon in ${eventLocation}`} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={agendaUrl} />

        {/* Print-specific styles */}
        <style jsx>{`
          @media print {
            body {
              font-family: 'Times New Roman', serif;
              line-height: 1.4;
              font-size: 12px;
            }
            @page {
              margin: 0.5in;
              size: letter;
            }
            h1, h2, h3, h4, h5, h6 {
              page-break-after: avoid;
              margin-bottom: 8px;
            }
            .MuiPaper-root {
              box-shadow: none !important;
            }
          }
        `}</style>
      </Head>

      <AgendaContainer maxWidth="lg">
        {/* Print-only QR Code and URL section */}
        <PrintOnlySection>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            View Latest Agenda Online
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 5, justifyContent: 'center', gap: 2, mb: 1 }}>
            <QRCodeSVG
              value={agendaUrl}
              size={64}
              level="M"
              includeMargin={true}
            />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                Scan QR code or visit:
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {agendaUrl}
              </Typography>
            </Box>
          </Box>
          <Typography variant="caption" color="text.secondary">
            This printed agenda may not reflect real-time updates. Check online for latest information.
          </Typography>
        </PrintOnlySection>

        {/* Header */}
        <HackathonHeader elevation={3}>
          <Typography variant={isMobile ? "h4" : "h3"} component="h1" fontWeight="bold" gutterBottom>
            {eventTitle}
          </Typography>
          <Typography variant={isMobile ? "h6" : "h5"} sx={{ opacity: 0.9, mb: 2 }}>
            Event Agenda & Schedule
          </Typography>

          <Grid container spacing={2} justifyContent="center" sx={{ mt: 2 }}>
            <Grid item>
              <Chip
                icon={<LocationOnIcon />}
                label={eventLocation}
                sx={{
                  color: 'inherit',
                  borderColor: 'currentColor',
                  '@media print': { color: 'white !important', borderColor: 'white !important' }
                }}
                variant="outlined"
              />
            </Grid>
            {eventStartDate && (
              <Grid item>
                <Chip
                  icon={<CalendarTodayIcon />}
                  label={`${format(eventStartDate, 'MMM dd')}${eventEndDate ? ` - ${format(eventEndDate, 'MMM dd, yyyy')}` : ''}`}
                  sx={{
                    color: 'inherit',
                    borderColor: 'currentColor',
                    '@media print': { color: 'white !important', borderColor: 'white !important' }
                  }}
                  variant="outlined"
                />
              </Grid>
            )}
          </Grid>
        </HackathonHeader>

        {/* Navigation and action buttons - hidden during print */}
        <NoPrintSection>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push(`/hack/${event_id}`)}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: 3,
                py: 1,
              }}
            >
              Back to Event
            </Button>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: 3,
                py: 1,
              }}
            >
              Print Agenda
            </Button>
          </Box>
        </NoPrintSection>

        <Grid container spacing={3}>
          {/* Event Information */}
          <Grid item xs={12} md={4}>
            <Paper sx={{
              p: 2,
              height: 'fit-content',
              '@media print': {
                pageBreakInside: 'avoid',
                p: 1.5
              }
            }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EventIcon color="primary" />
                Event Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                <Typography variant="body1">{eventVenue}</Typography>
                {eventAddress && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {eventAddress}
                  </Typography>
                )}
              </Box>

              {eventStartDate && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Dates</Typography>
                  <Typography variant="body2">
                    {format(eventStartDate, 'MMMM dd, yyyy')}
                    {eventEndDate && ` - ${format(eventEndDate, 'MMMM dd, yyyy')}`}
                  </Typography>
                </Box>
              )}

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Website</Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  {eventWebsite}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Contact</Typography>
                <Link href="/contact" sx={{ display: 'inline-block' }}>
                  <Button variant="outlined" size="small" sx={{ textTransform: 'none' }}>
                    Contact Us
                  </Button>
                </Link>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Social Media</Typography>
                <Typography variant="body2">{eventHashtag}</Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>About This Event</Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                  {eventDescription}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Schedule/Timeline */}
          <Grid item xs={12} md={8}>
            <Paper sx={{
              p: 2,
              '@media print': {
                pageBreakInside: 'avoid',
                p: 1.5
              }
            }}>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon color="primary" />
                Event Schedule
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {sortedEvents.length > 0 ? (
                <Box>
                  {sortedEvents.map((item, index) => {
                    const eventTime = new Date(item.time);
                    const { status, label, color } = getEventStatus(item.time);

                    // Enhanced event data fields (see docs/agenda-data-structure.md):
                    // const eventLocation = item.location; // e.g., "Main Lobby"
                    // const eventRoom = item.room; // e.g., "CIDSE 101"
                    // const eventDuration = item.duration_minutes; // e.g., 60
                    // const eventType = item.event_type; // e.g., "presentation"
                    // const eventPresenters = item.presenters; // e.g., ["John Doe"]
                    // const eventCapacity = item.capacity; // e.g., 300
                    // const eventRequirements = item.requirements; // e.g., "Bring ID"
                    // const eventMaterials = item.materials; // e.g., [{name, url}]
                    // const eventLiveStream = item.live_stream_url;
                    // const eventTags = item.tags; // e.g., ["mandatory", "keynote"]

                    return (
                      <EventCard
                        key={`${item.name}-${index}`}
                        isPast={status === 'past'}
                        isCurrent={status === 'current'}
                        isUpcoming={status === 'upcoming'}
                        elevation={status === 'current' ? 3 : 1}
                      >
                        <CardContent sx={{ p: 1.5, '@media print': { p: 1 } }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: status === 'current' ? 'bold' : 'medium',
                                  color: status === 'past' ? 'text.secondary' : 'text.primary',
                                  fontSize: isMobile ? '1rem' : '1.1rem'
                                }}
                              >
                                {item.name}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}
                              >
                                <AccessTimeIcon fontSize="small" />
                                {format(eventTime, 'EEEE, MMMM do \'at\' h:mm a')}
                              </Typography>
                            </Box>
                            <NoPrintSection>
                              <Chip
                                label={label}
                                color={color}
                                size="small"
                                variant={status === 'current' ? 'filled' : 'outlined'}
                              />
                            </NoPrintSection>
                          </Box>

                          {item.description && (
                            <Box sx={{ mt: 2, pt: 1, borderTop: 1, borderColor: 'divider' }}>
                              <Typography
                                variant="body2"
                                component="div"
                                sx={{
                                  color: status === 'past' ? 'text.secondary' : 'text.primary',
                                  '& a': {
                                    color: theme.palette.primary.main,
                                    textDecoration: 'none',
                                    '&:hover': { textDecoration: 'underline' }
                                  }
                                }}
                              >
                                <ReactMarkdown>{item.description}</ReactMarkdown>
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </EventCard>
                    );
                  })}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Schedule Coming Soon
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    The detailed event schedule will be posted here closer to the event date.
                    Check back soon or visit the main event page for updates.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Footer for print */}
        <PrintOnlySection sx={{ mt: 4, textAlign: 'center', borderTop: '1px solid #ddd', pt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Printed from {agendaUrl} • {format(currentTime, 'MMMM dd, yyyy \'at\' h:mm a')}
          </Typography>
        </PrintOnlySection>
      </AgendaContainer>
    </>
  );
};

export async function getStaticProps({ params }) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${params.event_id}`
    );
    const data = await res.json();
    return {
      props: {
        eventData: data,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error("Error fetching hackathon data:", error);
    return {
      props: {
        eventData: null,
      },
      revalidate: 60
    };
  }
}

export async function getStaticPaths() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/all`);
    const hackathons = await res.json();

    const paths = hackathons.map((event) => ({
      params: {
        event_id: event.event_id || event.id || event._id || "unknown-event",
      },
    }));

    return {
      paths,
      fallback: true,
    };
  } catch (error) {
    console.error("Error fetching hackathon paths:", error);
    return {
      paths: [],
      fallback: true,
    };
  }
}

export default AgendaPage;