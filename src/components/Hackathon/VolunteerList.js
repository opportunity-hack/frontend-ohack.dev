import React from "react";
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Box,
  Paper,
  Link,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Stack,
  Divider,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import WorkIcon from "@mui/icons-material/Work";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import CodeIcon from "@mui/icons-material/Code";
import BugReportIcon from "@mui/icons-material/BugReport";
import ForumIcon from "@mui/icons-material/Forum";
import DesignServicesIcon from "@mui/icons-material/DesignServices";
import Moment from "moment";
import NextLink from "next/link";
import ShareVolunteer from "./ShareVolunteer";
import { useEffect } from "react";
import MentorAvailability from "./MentorAvailability";
import GroupIcon from "@mui/icons-material/Group";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import FavoriteIcon from "@mui/icons-material/Favorite";
import GitHubIcon from "@mui/icons-material/GitHub";
import LaunchIcon from "@mui/icons-material/Launch";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const ArtifactList = styled(List)({
  padding: 0,
});

const ArtifactListItem = styled(ListItem)({
  padding: "4px 0",
});

const VolunteerCard = styled(Card)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  transition: "transform 0.3s ease-in-out",
  "&:hover": {
    transform: "scale(1.03)",
  },
}));

const VolunteerMediaContainer = styled(Box)({
  position: "relative",
  width: "50%",
  margin: "16px auto 0",
});

const VolunteerMedia = styled(CardMedia)({
  paddingTop: "100%" // 1:1 Aspect Ratio
});

const InPersonBadge = styled(Box)(({ theme }) => ({
  position: "absolute",
  bottom: 0,
  right: 0,
  backgroundColor: theme.palette.success.main,
  color: theme.palette.success.contrastText,
  padding: "4px 8px",
  borderRadius: "12px",
  fontSize: "0.75rem",
  fontWeight: "bold",
}));

const RemoteBadge = styled(Box)(({ theme }) => ({
  position: "absolute",
  bottom: 0,
  right: 0,
  backgroundColor: theme.palette.info.main,
  color: theme.palette.success.contrastText,
  padding: "4px 8px",
  borderRadius: "12px",
  fontSize: "0.75rem",
  fontWeight: "bold",
}));

const HeadingContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  marginBottom: "16px",
});

const StyledLink = styled(Link)(({ theme }) => ({
  marginLeft: theme.spacing(2),
  fontSize: "1rem",
  fontWeight: "normal",
  textDecoration: "none",
  "&:hover": {
    textDecoration: "underline",
  },
}));

const VolunteerContent = styled(CardContent)({
  flexGrow: 1,
});

const ChipContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(0.5),
  marginTop: theme.spacing(1),
}));

const AvailabilityChip = styled(Chip)(
  ({ theme, isavailablenow, timeofdaycolor }) => ({
    margin: theme.spacing(0.5),
    backgroundColor: isavailablenow
      ? theme.palette.info.main
      : timeofdaycolor || theme.palette.success.light,
    color: theme.palette.getContrastText(
      isavailablenow
        ? theme.palette.info.main
        : timeofdaycolor || theme.palette.success.light,
    ),
    boxShadow: isavailablenow ? theme.shadows[2] : "none",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: isavailablenow
        ? theme.palette.info.dark
        : timeofdaycolor
          ? alpha(timeofdaycolor, 0.8)
          : theme.palette.success.main,
      transform: "translateY(-2px)",
      boxShadow: theme.shadows[3],
    },
  }),
);

const AvailableMentorsSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
}));

const AvailableMentorChip = styled(Chip)(({ theme, isInPerson }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: isInPerson
    ? theme.palette.success.main
    : theme.palette.info.main,
  color: theme.palette.success.contrastText,
  "&:hover": {
    backgroundColor: theme.palette.success.dark,
  },
}));

const AvailabilitySection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: alpha(theme.palette.primary.main, 0.05),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
}));

const AvailableNowBanner = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.success.main,
  color: theme.palette.success.contrastText,
  padding: theme.spacing(1, 2),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  fontWeight: 600,
}));

const TimeSlotChip = styled(Chip)(({ theme, isAvailableNow }) => ({
  margin: theme.spacing(0.5, 0.5, 0.5, 0),
  backgroundColor: isAvailableNow 
    ? theme.palette.success.main
    : theme.palette.grey[100],
  color: isAvailableNow 
    ? theme.palette.success.contrastText 
    : theme.palette.text.primary,
  border: isAvailableNow 
    ? `2px solid ${theme.palette.success.dark}`
    : `1px solid ${theme.palette.grey[300]}`,
  fontWeight: isAvailableNow ? 600 : 400,
  boxShadow: isAvailableNow ? theme.shadows[3] : theme.shadows[1],
  '&:hover': {
    backgroundColor: isAvailableNow 
      ? theme.palette.success.dark
      : theme.palette.grey[200],
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
  '& .MuiChip-label': {
    fontSize: '0.8rem',
    paddingLeft: '8px',
    paddingRight: '8px',
  },
}));

const CompactTimeSlot = styled(Box)(({ theme, isAvailableNow }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: theme.spacing(0.5, 1),
  margin: theme.spacing(0.25),
  borderRadius: theme.shape.borderRadius,
  fontSize: '0.75rem',
  backgroundColor: isAvailableNow 
    ? theme.palette.success.main
    : theme.palette.grey[100],
  color: isAvailableNow 
    ? theme.palette.success.contrastText 
    : theme.palette.text.secondary,
  border: `1px solid ${isAvailableNow 
    ? theme.palette.success.dark 
    : theme.palette.grey[300]}`,
  fontWeight: isAvailableNow ? 600 : 400,
}));

const ExpandButton = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(1),
  marginTop: theme.spacing(1),
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
    transform: 'translateY(-1px)',
  },
}));

const ExpandableSection = styled(Box)(({ isExpanded }) => ({
  overflow: 'hidden',
  transition: 'max-height 0.3s ease-in-out, opacity 0.2s ease-in-out',
  maxHeight: isExpanded ? '400px' : '0px',
  opacity: isExpanded ? 1 : 0,
}));

const VolunteerList = ({ event_id, type }) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [volunteers, setVolunteers] = React.useState([]);
  const [availableMentors, setAvailableMentors] = React.useState([]);
  const [expandedAvailability, setExpandedAvailability] = React.useState({});

  useEffect(() => {
    // Call API to get data based on type
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${event_id}/${type}`,
        );
        if (res.ok) {
          const data = await res.json();

          setVolunteers(data.data);
        } else {
          throw new Error("Failed to fetch volunteers");
        }
      } catch (error) {
        console.error("Error fetching volunteers:", error);
        setError("Failed to fetch volunteers. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [event_id, type]);

  useEffect(() => {
    if (
      type === "mentor" &&
      Array.isArray(volunteers) &&
      volunteers.length > 0
    ) {
      // Determine if currently available for each volunteer.availability
      const currentlyAvailable = volunteers.filter((volunteer) => {
        if (volunteer?.isSelected && volunteer?.availability) {
          // Use the same careful splitting logic as MentorAvailability.js
          const slots = [];
          let currentSlot = "";
          const parts = volunteer.availability.split(", ");

          for (let i = 0; i < parts.length; i++) {
            const part = parts[i];

            // Check if this part starts a new time slot (contains weekday pattern or emoji)
            const startsNewSlot =
              /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|\w+ \w+ \d+:|🌅|☀️|🏙️|🌆|🌃|🌙)/.test(
                part,
              );

            if (startsNewSlot && currentSlot) {
              // We found a new slot, save the current one
              slots.push(currentSlot.trim());
              currentSlot = part;
            } else if (currentSlot) {
              // Continue building current slot
              currentSlot += ", " + part;
            } else {
              // First slot
              currentSlot = part;
            }
          }

          // Don't forget the last slot
          if (currentSlot) {
            slots.push(currentSlot.trim());
          }

          return slots.some(isCurrentlyAvailable);
        }
        return false;
      });

      setAvailableMentors(currentlyAvailable);
    }
  }, [volunteers, type]);

  const isCurrentlyAvailable = (timeSpan) => {
    if (!timeSpan || typeof timeSpan !== "string") return false;

    const now = Moment(new Date(), "America/Los_Angeles"); // Everything is going to be in PST - we don't want to get the user's local time
    const nowDay = now.format("dddd"); // Day of week: "Friday"
    const nowDate = now.date(); // Day of month: 10

    // New format example: "Friday Oct 10: 🌅 Early Morning (7am - 9am PST)"
    // Old format example: "Monday, May 12: 🌅 Early Morning (7am - 9am PST)" (with comma)
    // Extract the day name and date from the date part
    const datePart = timeSpan.split(":")[0]; // "Friday Oct 10" or "Monday, May 12" or similar

    if (!datePart) return false;

    // Parse both formats to extract day name and date number
    let dayName, dateNumber;

    // Handle "Monday, May 12" format (with comma)
    const commaMatch = datePart.match(/(\w+),\s+\w+\s+(\d+)/);
    if (commaMatch) {
      dayName = commaMatch[1]; // "Monday"
      dateNumber = parseInt(commaMatch[2], 10); // 12
    } else {
      // Handle "Friday Oct 10" format (no comma)
      const noCommaMatch = datePart.match(/(\w+)\s+\w+\s+(\d+)/);
      if (noCommaMatch) {
        dayName = noCommaMatch[1]; // "Friday"
        dateNumber = parseInt(noCommaMatch[3], 10); // 10
      } else {
        return false; // Can't parse the date format
      }
    }

    // Check if both day of week and day of month match
    const isDayMatch = dayName === nowDay;
    const isDateMatch = dateNumber === nowDate;

    if (!isDayMatch || !isDateMatch) return false;

    // Safe string manipulation with proper error checking
    try {
      // Extract the time portion from the string - anything in parentheses
      const timeMatch = timeSpan.match(/\((.*?)\)/);
      if (!timeMatch || !timeMatch[1]) return false;

      let timeRange = timeMatch[1]; // "7am - 9am PST"
      timeRange = timeRange.replace(/PST/g, "").trim(); // "7am - 9am"

      const timeParts = timeRange.split("-");
      if (timeParts.length !== 2) return false;

      let [startTime, endTime] = timeParts.map((t) => t.trim());

      // Standardize format: ensure times have minutes
      if (!startTime.includes(":")) {
        startTime = startTime.replace(/(\d+)([ap]m)/, "$1:00$2");
      }

      // Add :59 to the end time to make it inclusive of the entire hour
      if (!endTime.includes(":")) {
        endTime = endTime.replace(/(\d+)([ap]m)/, "$1:59$2");
      } else {
        // Already has minutes, just replace with :59
        endTime = endTime.replace(/(\d+):(\d+)([ap]m)/, "$1:59$3");
      }

      const startMoment = Moment(startTime, "h:mma", "America/Los_Angeles");
      const endMoment = Moment(endTime, "h:mma", "America/Los_Angeles");

      if (!startMoment.isValid() || !endMoment.isValid()) {
        return false;
      }

      return now.isBetween(startMoment, endMoment);
    } catch (error) {
      console.error("Error parsing time span:", error, timeSpan);
      return false;
    }
  };

  const renderArtifacts = (artifacts) => {
    if (!artifacts || !Array.isArray(artifacts) || artifacts.length === 0)
      return null;

    return (
      <Box mt={2}>
        <Typography variant="subtitle2" gutterBottom>
          Contributions:
        </Typography>
        <ArtifactList>
          {artifacts.map((artifact, index) => (
            <ArtifactListItem key={index}>
              <ListItemIcon>
                {artifact?.type === "pull_request" && <CodeIcon />}
                {artifact?.type === "issue" && <BugReportIcon />}
                {artifact?.type === "coordination" && <ForumIcon />}
                {artifact?.type === "user_experience" && <DesignServicesIcon />}
                {artifact?.type === "standup" && <AccessTimeIcon />}
                {!artifact?.type && <CodeIcon />} {/* Default icon */}
              </ListItemIcon>
              <ListItemText
                primary={artifact?.label || "Contribution"}
                secondary={
                  <>
                    {artifact?.comment || ""}
                    {artifact?.url &&
                      Array.isArray(artifact.url) &&
                      artifact.url.length > 0 && (
                        <Link
                          href={artifact.url[0]}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {" "}
                          (Link)
                        </Link>
                      )}
                  </>
                }
              />
            </ArtifactListItem>
          ))}
        </ArtifactList>
      </Box>
    );
  };

  const toggleExpanded = (volunteerName) => {
    setExpandedAvailability(prev => ({
      ...prev,
      [volunteerName]: !prev[volunteerName]
    }));
  };

  const renderAvailability = (availability, volunteerName) => {
    if (!availability || typeof availability !== "string") return null;

    const isExpanded = expandedAvailability[volunteerName] || false;

    try {
      // Use the same careful splitting logic from MentorAvailability.js
      const slots = [];
      let currentSlot = "";
      const parts = availability.split(", ");

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const startsNewSlot =
          /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|\w+ \w+ \d+:|🌅|☀️|🏙️|🌆|🌃|🌙)/.test(part);

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

      if (slots.length === 0) return null;

      // Process and sort slots for better display
      const processedSlots = slots.map((slot) => {
        const slotIsCurrentlyAvailable = isCurrentlyAvailable(slot);
        
        // Extract readable parts
        const datePart = slot.split(":")[0]?.trim(); // "Friday Oct 10"
        const timePart = slot.split(":")[1]?.trim(); // "🌅 Early Morning (7am - 9am PST)"
        
        // Extract emoji and time period using Unicode escape sequences
        const emojiMatch = timePart?.match(/([\u{1F305}\u{2600}\u{1F3D9}\u{1F306}\u{1F303}\u{1F319}])/u);
        const timeRangeMatch = timePart?.match(/\(([^)]+)\)/);
        const periodMatch = timePart?.match(/[\u{1F305}\u{2600}\u{1F3D9}\u{1F306}\u{1F303}\u{1F319}]\s+([^(]+)/u);
        
        const emoji = emojiMatch ? emojiMatch[1] : "";
        const timeRange = timeRangeMatch ? timeRangeMatch[1].replace(' PST', '') : "";
        const period = periodMatch ? periodMatch[1].trim() : "";
        
        // Create short date format (e.g., "Oct 10" from "Friday Oct 10")
        const shortDate = datePart.split(' ').slice(-2).join(' ');
        
        return {
          original: slot,
          datePart,
          shortDate,
          emoji,
          period,
          timeRange,
          isCurrentlyAvailable: slotIsCurrentlyAvailable,
          // For sorting
          sortKey: datePart + period
        };
      }).sort((a, b) => {
        // Sort by date first, then by time period
        return a.sortKey.localeCompare(b.sortKey);
      });

      // Separate currently available from future slots
      const availableNow = processedSlots.filter(slot => slot.isCurrentlyAvailable);
      const futureSlots = processedSlots.filter(slot => !slot.isCurrentlyAvailable);

      // For many slots (>6), show expandable compact view
      if (processedSlots.length > 6) {
        const visibleFutureSlots = isExpanded ? futureSlots : futureSlots.slice(0, 3);
        
        return (
          <AvailabilitySection>
            {availableNow.length > 0 && (
              <AvailableNowBanner>
                <span>🟢</span>
                <Typography variant="body2" component="span">
                  Available RIGHT NOW!
                </Typography>
              </AvailableNowBanner>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" color="primary">
                📅 {processedSlots.length} Time Slots Available
              </Typography>
              {futureSlots.length > 3 && (
                <Typography variant="caption" color="text.secondary">
                  {isExpanded ? 'Showing all slots' : `${visibleFutureSlots.length} of ${futureSlots.length} shown`}
                </Typography>
              )}
            </Box>
            
            <Box sx={{ maxHeight: isExpanded ? '300px' : '120px', overflowY: 'auto', pr: 1 }}>
              <Stack spacing={0.5}>
                {/* Always show available now slots */}
                {availableNow.map((slot, index) => (
                  <Tooltip key={`now-${index}`} title="Available right now - perfect time to get help!">
                    <CompactTimeSlot isAvailableNow={true}>
                      <span style={{ marginRight: '6px' }}>{slot.emoji}</span>
                      <strong>{slot.shortDate} • {slot.timeRange}</strong>
                    </CompactTimeSlot>
                  </Tooltip>
                ))}
                
                {/* Show limited or all future slots based on expansion */}
                {visibleFutureSlots.map((slot, index) => (
                  <Tooltip key={`future-${index}`} title={slot.original}>
                    <CompactTimeSlot isAvailableNow={false}>
                      <span style={{ marginRight: '6px' }}>{slot.emoji}</span>
                      {slot.shortDate} • {slot.timeRange}
                    </CompactTimeSlot>
                  </Tooltip>
                ))}
              </Stack>
            </Box>
            
            {/* Expandable section for remaining slots */}
            {futureSlots.length > 3 && (
              <ExpandButton onClick={() => toggleExpanded(volunteerName)}>
                <Typography variant="body2" color="primary" sx={{ mr: 1 }}>
                  {isExpanded 
                    ? 'Show Less' 
                    : `Show ${futureSlots.length - 3} More Time Slots`
                  }
                </Typography>
                {isExpanded ? <ExpandLessIcon color="primary" /> : <ExpandMoreIcon color="primary" />}
              </ExpandButton>
            )}
            
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
              🟢 = Available Now • All times in PST • Click "Show More" to see all slots
            </Typography>
          </AvailabilitySection>
        );
      }

      // For fewer slots (≤6), show full detailed view as before
      return (
        <AvailabilitySection>
          {availableNow.length > 0 && (
            <AvailableNowBanner>
              <span>🟢</span>
              <Typography variant="body2" component="span">
                Available RIGHT NOW - Perfect time to ask for help!
              </Typography>
            </AvailableNowBanner>
          )}
          
          <Typography variant="subtitle2" color="primary" sx={{ mb: 2 }}>
            📅 When You Can Get Help
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {processedSlots.map((slot, index) => (
              <Tooltip
                key={index}
                title={
                  <Box>
                    <Typography variant="body2">{slot.original}</Typography>
                    {slot.isCurrentlyAvailable && (
                      <Typography variant="caption" color="success.light">
                        🟢 Available right now!
                      </Typography>
                    )}
                  </Box>
                }
              >
                <TimeSlotChip
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <span>{slot.emoji}</span>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Typography variant="caption" component="span" sx={{ lineHeight: 1, fontWeight: 600 }}>
                          {slot.shortDate}
                        </Typography>
                        <Typography variant="caption" component="span" sx={{ lineHeight: 1, opacity: 0.9 }}>
                          {slot.timeRange}
                        </Typography>
                      </Box>
                    </Box>
                  }
                  isAvailableNow={slot.isCurrentlyAvailable}
                  clickable
                  sx={{ 
                    height: 'auto',
                    '& .MuiChip-label': {
                      padding: '8px 12px',
                    }
                  }}
                />
              </Tooltip>
            ))}
          </Box>
          
          <Divider sx={{ my: 1.5 }} />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
            {availableNow.length > 0 
              ? "🟢 = Available Now • Click any slot to see details"
              : "Hover for full details • Check back during these times"
            }
          </Typography>
        </AvailabilitySection>
      );

    } catch (error) {
      console.error("Error rendering availability:", error);
      return null;
    }
  };

  const renderVolunteerCard = (volunteer) => {
    // Check if volunteer exists
    if (!volunteer) return null;

    const isMentor = type === "mentor";
    const isJudge = type === "judge";
    const isVolunteer = type === "volunteer";
    const isHacker = type === "hacker";
    const isSelected = !!volunteer.isSelected;

    // Skip rendering if not selected
    if (!isSelected) return null;

    // Safely handle photo URL
    let imageToDisplay =
      "https://cdn.ohack.dev/ohack.dev/logos/OpportunityHack_2Letter_Black.png";
    if (volunteer.photoUrl && typeof volunteer.photoUrl === "string") {
      const googleDriveImage = volunteer.photoUrl.includes("drive.google.com");
      if (!googleDriveImage) {
        imageToDisplay = volunteer.photoUrl;
      }
    }

    return (
      <Grid
        item
        xs={12}
        sm={6}
        md={4}
        key={volunteer.name || `volunteer-${Math.random().toString(36)}`}
        id={`mentor-${volunteer.name || "unknown"}`}
      >
        <VolunteerCard>
          <VolunteerMediaContainer>
            <VolunteerMedia
              image={imageToDisplay}
              title={volunteer.name || "Volunteer"}
            />
            {volunteer.isInPerson ? (
              <InPersonBadge>In-Person</InPersonBadge>
            ) : (
              <RemoteBadge>Remote</RemoteBadge>
            )}
          </VolunteerMediaContainer>
          <VolunteerContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography gutterBottom variant="h5" component="div">
                {volunteer.name || "Volunteer"}
                {volunteer.pronouns && (
                  <Tooltip title="Pronouns">
                    <Chip
                      icon={<PersonIcon />}
                      label={volunteer.pronouns}
                      size="small"
                      style={{ marginLeft: "8px" }}
                    />
                  </Tooltip>
                )}
              </Typography>
              <ShareVolunteer volunteer={volunteer} type={type} />
            </Box>
            <Typography variant="subtitle1" color="text.secondary">
              {isMentor
                ? volunteer.company || ""
                : isHacker
                  ? volunteer.schoolOrganization || ""
                  : volunteer.companyName || ""}
              {!isMentor &&
                !isHacker &&
                volunteer.title &&
                ` - ${volunteer.title}`}
              {isHacker &&
                volunteer.experienceLevel &&
                ` • ${volunteer.experienceLevel}`}
            </Typography>
            <ChipContainer>
              {volunteer.company && !isHacker && (
                <Chip
                  icon={<WorkIcon />}
                  label={volunteer.company}
                  size="small"
                />
              )}
              {volunteer.state && (
                <Chip
                  icon={<LocationOnIcon />}
                  label={volunteer.state}
                  size="small"
                />
              )}
              {isMentor &&
                typeof volunteer.participationCount !== "undefined" && (
                  <Chip
                    icon={<VolunteerActivismIcon />}
                    label={volunteer.participationCount}
                    size="small"
                  />
                )}
              {isHacker && volunteer.participationCount && (
                <Chip
                  icon={<EmojiEventsIcon />}
                  label={volunteer.participationCount}
                  size="small"
                />
              )}
              {isHacker && volunteer.teamStatus && (
                <Chip
                  icon={<GroupIcon />}
                  label={
                    volunteer.teamStatus === "I have a team"
                      ? "Has Team"
                      : volunteer.teamStatus === "I'm looking for team members"
                        ? "Seeking Members"
                        : volunteer.teamStatus ===
                            "I'd like to be matched with a team"
                          ? "Looking for Team"
                          : "Solo"
                  }
                  size="small"
                  color={
                    volunteer.teamStatus === "I have a team"
                      ? "success"
                      : "primary"
                  }
                />
              )}
              {volunteer.linkedinProfile && (
                <Link
                  href={volunteer.linkedinProfile}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Chip
                    icon={<LinkedInIcon />}
                    label="LinkedIn"
                    size="small"
                    clickable
                  />
                </Link>
              )}
              {isHacker && volunteer.github && (
                <Link
                  href={volunteer.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Chip
                    icon={<GitHubIcon />}
                    label="GitHub"
                    size="small"
                    clickable
                  />
                </Link>
              )}
              {isHacker && volunteer.portfolio && (
                <Link
                  href={volunteer.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Chip
                    icon={<LaunchIcon />}
                    label="Portfolio"
                    size="small"
                    clickable
                  />
                </Link>
              )}
            </ChipContainer>
            <Typography variant="body1" paragraph sx={{ mt: 2 }}>
              {volunteer.shortBio || volunteer.shortBiography || ""}
            </Typography>
            {isMentor && (
              <>
                <Typography variant="body1" paragraph>
                  <strong>Expertise:</strong>{" "}
                  {volunteer.expertise || "Not specified"}
                </Typography>
                {volunteer.softwareEngineeringSpecifics && (
                  <Typography variant="body1" paragraph>
                    <strong>Software Specifics:</strong>{" "}
                    {volunteer.softwareEngineeringSpecifics}
                  </Typography>
                )}
              </>
            )}
            {isJudge && volunteer.background && (
              <>
                <Typography variant="body1" paragraph>
                  <strong>Expertise:</strong> {volunteer.background}
                </Typography>
              </>
            )}
            {isJudge && volunteer.whyJudge && (
              <Typography variant="body1" paragraph>
                <strong>Why volunteering:</strong> {volunteer.whyJudge}
              </Typography>
            )}
            {isHacker && (
              <>
                {volunteer.primaryRoles && (
                  <Typography variant="body1" paragraph>
                    <strong>Primary Skills:</strong>{" "}
                    {Array.isArray(volunteer.primaryRoles)
                      ? volunteer.primaryRoles.join(", ")
                      : volunteer.primaryRoles}
                  </Typography>
                )}
                {volunteer.skills && (
                  <Typography variant="body1" paragraph>
                    <strong>Technical Skills:</strong>{" "}
                    {Array.isArray(volunteer.skills)
                      ? volunteer.skills.join(", ")
                      : volunteer.skills}
                  </Typography>
                )}
                {volunteer.socialCauses && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Passionate About:</strong>
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {(Array.isArray(volunteer.socialCauses)
                        ? volunteer.socialCauses
                        : volunteer.socialCauses.split(",").map((c) => c.trim())
                      )
                        .slice(0, 3)
                        .map((cause, index) => (
                          <Chip
                            key={index}
                            icon={<FavoriteIcon />}
                            label={cause}
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        ))}
                    </Box>
                  </Box>
                )}                
              </>
            )}
            {isMentor && renderAvailability(volunteer.availability, volunteer.name)}
            {isVolunteer && renderArtifacts(volunteer.artifacts)}
          </VolunteerContent>
        </VolunteerCard>
      </Grid>
    );
  };

  const scrollToMentor = (mentorName) => {
    const element = document.getElementById(`mentor-${mentorName}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  if (loading) {
    return <Skeleton marginTop={5} variant="rect" width={210} height={300} />;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <HeadingContainer>
        <Typography variant="h4">          
          {type === "mentor"
            ? "Mentors"
            : type === "judge"
              ? "Judges"
              : type === "hacker"
                ? "Hackers"
                : "Volunteers"}
        </Typography>
        <NextLink
          href={
            type === "mentor"
              ? "/about/mentors"
              : type === "judge"
                ? "/about/judges"
                : type === "hacker"
                  ? "/hack"
                  : "/volunteer"
          }
          passHref
        >
          <StyledLink color="secondary">(Learn more)</StyledLink>
        </NextLink>
      </HeadingContainer>

      {type === "mentor" && <MentorAvailability volunteers={volunteers} />}

      {type === "mentor" &&
        Array.isArray(availableMentors) &&
        availableMentors.length > 0 && (
          <AvailableMentorsSection>
            <Typography variant="h6" gutterBottom>
              Currently Available Mentors:
            </Typography>
            {availableMentors.map((mentor) => (
              <Tooltip
                title={
                  <span style={{ fontSize: "14px" }}>
                    {mentor?.isInPerson
                      ? "Available now (in-person)"
                      : "Available now (remote)"}
                  </span>
                }
                key={mentor?.name || `mentor-${Math.random().toString(36)}`}
              >
                <AvailableMentorChip
                  key={
                    mentor?.name || `mentor-chip-${Math.random().toString(36)}`
                  }
                  label={mentor?.name || "Mentor"}
                  onClick={() => scrollToMentor(mentor?.name || "")}
                  isInPerson={!!mentor?.isInPerson}
                  clickable
                />
              </Tooltip>
            ))}
          </AvailableMentorsSection>
        )}

      <Grid container spacing={3}>
        {Array.isArray(volunteers) &&
          volunteers.map((volunteer) => renderVolunteerCard(volunteer))}
      </Grid>
    </Box>
  );
};

export default VolunteerList;
