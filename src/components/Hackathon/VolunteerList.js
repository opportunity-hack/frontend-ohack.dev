import React from "react";
import {
  Grid,
  Typography,
  Chip,
  Box,
  Avatar,
  Link,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Stack,
  Divider,
  Collapse,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
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
import { getTimezoneAbbreviation, DEFAULT_EVENT_TIMEZONE } from "../../lib/timezoneUtils";
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
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import TableRowsIcon from "@mui/icons-material/TableRows";

// Field configuration for data-driven rendering
const FIELD_CONFIG = {
  company: {
    fields: ['company', 'schoolOrganization', 'companyName'],
    type: 'chip',
    icon: WorkIcon,
    label: 'Organization'
  },
  bio: {
    fields: ['shortBio', 'shortBiography'],
    type: 'expandable_text',
    maxLength: 150
  },
  expertise: {
    fields: ['expertise', 'background'],
    type: 'text',
    label: 'Expertise'
  },
  softwareSpecifics: {
    fields: ['softwareEngineeringSpecifics'],
    type: 'text',
    label: 'Software Specifics'
  },
  whyJudge: {
    fields: ['whyJudge'],
    type: 'expandable_text',
    label: 'Why volunteering',
    maxLength: 150
  },
  primaryRoles: {
    fields: ['primaryRoles'],
    type: 'text',
    label: 'Primary Skills'
  },
  skills: {
    fields: ['skills'],
    type: 'text',
    label: 'Technical Skills'
  },
  socialCauses: {
    fields: ['socialCauses'],
    type: 'chip_list',
    icon: FavoriteIcon,
    label: 'Passionate About',
    maxItems: 3,
    color: 'secondary',
    variant: 'outlined'
  },
  location: {
    fields: ['state'],
    type: 'chip',
    icon: LocationOnIcon
  },
  participationCount: {
    fields: ['participationCount'],
    type: 'chip',
    icons: {
      mentor: VolunteerActivismIcon,
      hacker: EmojiEventsIcon
    }
  },
  teamStatus: {
    fields: ['teamStatus'],
    type: 'team_status_chip',
    icon: GroupIcon
  },
  linkedinProfile: {
    fields: ['linkedinProfile'],
    type: 'link_chip',
    icon: LinkedInIcon,
    label: 'LinkedIn'
  },
  github: {
    fields: ['github'],
    type: 'link_chip',
    icon: GitHubIcon,
    label: 'GitHub'
  },
  portfolio: {
    fields: ['portfolio'],
    type: 'link_chip',
    icon: LaunchIcon,
    label: 'Portfolio'
  },
  availability: {
    fields: ['availability'],
    type: 'availability',
    allowedTypes: ['mentor', 'volunteer']
  },  
  artifacts: {
    fields: ['artifacts'],
    type: 'artifacts',
    requiredType: 'volunteer'
  }
};

const TYPE_CONFIG = {
  mentor:    { label: "Mentors",    learnMoreHref: "/about/mentors" },
  judge:     { label: "Judges",     learnMoreHref: "/about/judges" },
  hacker:    { label: "Hackers",    learnMoreHref: "/hack" },
  volunteer: { label: "Volunteers", learnMoreHref: "/volunteer" },
};

const ArtifactList = styled(List)({
  padding: 0,
});

const ArtifactListItem = styled(ListItem)({
  padding: "4px 0",
});

// Card with avatar, name, key info visible at a glance; details expand below
const PersonCard = styled(Box)(({ theme, isExpanded }) => ({
  display: "flex",
  flexDirection: "column",
  borderRadius: theme.shape.borderRadius * 2,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  transition: "border-color 0.2s, box-shadow 0.2s",
  overflow: "hidden",
  height: "100%",
  "&:hover": {
    borderColor: theme.palette.primary.light,
    boxShadow: theme.shadows[2],
  },
  ...(isExpanded && {
    borderColor: theme.palette.primary.main,
    boxShadow: theme.shadows[3],
  }),
}));

const CardTopSection = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: theme.spacing(2, 1.5, 1),
  cursor: "pointer",
  textAlign: "center",
}));

const PersonAvatar = styled(Avatar)(({ theme }) => ({
  width: 56,
  height: 56,
  marginBottom: theme.spacing(1),
  border: `2px solid ${theme.palette.background.paper}`,
  boxShadow: theme.shadows[2],
}));

const ExpandedContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 1.5, 1.5),
  borderTop: `1px solid ${theme.palette.divider}`,
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
  height: 'auto',
  minHeight: '32px',
  padding: theme.spacing(0.5),
  backgroundColor: isInPerson
    ? theme.palette.success.main
    : theme.palette.info.main,
  color: theme.palette.success.contrastText,
  '& .MuiChip-label': {
    padding: theme.spacing(0.5, 1),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    lineHeight: 1.2,
  },
  "&:hover": {
    backgroundColor: isInPerson 
      ? theme.palette.success.dark
      : theme.palette.info.dark,
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const MentorName = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '0.875rem',
  lineHeight: 1.1,
  marginBottom: theme.spacing(0.25),
}));

const MentorExpertise = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  opacity: 0.9,
  lineHeight: 1.1,
  fontWeight: 400,
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

const ExpandableText = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
}));

const ReadMoreButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(0.5, 1),
  marginTop: theme.spacing(0.5),
  fontSize: '0.75rem',
  textTransform: 'none',
  fontWeight: 500,
  minHeight: 'auto',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
}));

// Utility functions for field-based rendering
const getFieldValue = (volunteer, fieldConfig) => {
  if (!volunteer || !fieldConfig?.fields) return null;
  
  for (const field of fieldConfig.fields) {
    if (volunteer[field] != null && volunteer[field] !== '') {
      return volunteer[field];
    }
  }
  return null;
};

const shouldRenderField = (volunteer, fieldKey, type) => {
  const fieldConfig = FIELD_CONFIG[fieldKey];
  if (!fieldConfig) return false;
  
  // Check if field has a type requirement (legacy)
  if (fieldConfig.requiredType && fieldConfig.requiredType !== type) {
    return false;
  }
  
  // Check if field has allowed types (new approach)
  if (fieldConfig.allowedTypes && !fieldConfig.allowedTypes.includes(type)) {
    return false;
  }
  
  const value = getFieldValue(volunteer, fieldConfig);
  return value != null && value !== '';
};

const VolunteerList = ({ event_id, type, eventTimezone }) => {
  const volTz = eventTimezone || DEFAULT_EVENT_TIMEZONE;
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [volunteers, setVolunteers] = React.useState([]);
  const [availableMentors, setAvailableMentors] = React.useState([]);
  const [expandedAvailability, setExpandedAvailability] = React.useState({});
  const [expandedBios, setExpandedBios] = React.useState({});
  const [viewMode, setViewMode] = React.useState("cards");

  // Field rendering functions
  const renderFieldChip = (value, fieldConfig) => {
    if (!value) return null;
    const IconComponent = fieldConfig.icon;
    return (
      <Chip
        icon={IconComponent ? <IconComponent /> : null}
        label={value}
        size="small"
      />
    );
  };

  const renderFieldText = (value, fieldConfig) => {
    if (!value) return null;
    return (
      <Typography variant="body2" paragraph sx={{ mb: 1.5 }}>
        <strong>{fieldConfig.label}:</strong> {value}
      </Typography>
    );
  };

  const renderChipList = (value, fieldConfig) => {
    if (!value) return null;
    
    const items = Array.isArray(value) ? value : value.split(",").map(c => c.trim());
    const maxItems = fieldConfig.maxItems || 3;
    const IconComponent = fieldConfig.icon;
    
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>{fieldConfig.label}:</strong>
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {items.slice(0, maxItems).map((item, index) => (
            <Chip
              key={index}
              icon={IconComponent ? <IconComponent /> : null}
              label={item}
              size="small"
              color={fieldConfig.color || "primary"}
              variant={fieldConfig.variant || "filled"}
            />
          ))}
        </Box>
      </Box>
    );
  };

  const renderTeamStatusChip = (value) => {
    if (!value) return null;
    
    const getTeamLabel = (status) => {
      switch (status) {
        case "I have a team": return "Has Team";
        case "I'm looking for team members": return "Seeking Members";
        case "I'd like to be matched with a team": return "Looking for Team";
        default: return "Solo";
      }
    };
    
    const getTeamColor = (status) => {
      return status === "I have a team" ? "success" : "primary";
    };
    
    return (
      <Chip
        icon={<GroupIcon />}
        label={getTeamLabel(value)}
        size="small"
        color={getTeamColor(value)}
      />
    );
  };

  const renderLinkChip = (value, fieldConfig) => {
    if (!value) return null;
    const IconComponent = fieldConfig.icon;
    
    return (
      <Link href={value} target="_blank" rel="noopener noreferrer">
        <Chip
          icon={IconComponent ? <IconComponent /> : null}
          label={fieldConfig.label}
          size="small"
          clickable
        />
      </Link>
    );
  };

  const renderField = (volunteer, fieldKey, type) => {
    if (!shouldRenderField(volunteer, fieldKey, type)) return null;
    
    const fieldConfig = FIELD_CONFIG[fieldKey];
    const value = getFieldValue(volunteer, fieldConfig);
    
    switch (fieldConfig.type) {
      case 'chip':
        // Handle participation count with different icons based on type
        if (fieldKey === 'participationCount' && fieldConfig.icons) {
          const IconComponent = fieldConfig.icons[type] || fieldConfig.icons.mentor;
          return (
            <Chip
              icon={<IconComponent />}
              label={value}
              size="small"
            />
          );
        }
        return renderFieldChip(value, fieldConfig);
        
      case 'text':
        // Handle array values by joining them
        const displayValue = Array.isArray(value) ? value.join(", ") : value;
        return renderFieldText(displayValue, fieldConfig);
        
      case 'expandable_text':
        return renderExpandableText(value, volunteer.name, fieldKey, fieldConfig.label);
        
      case 'chip_list':
        return renderChipList(value, fieldConfig);
        
      case 'team_status_chip':
        return renderTeamStatusChip(value);
        
      case 'link_chip':
        return renderLinkChip(value, fieldConfig);
        
      case 'availability':
        return renderAvailability(value, volunteer.name);
        
      case 'artifacts':
        return renderArtifacts(value);
        
      default:
        return null;
    }
  };

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

    const now = Moment(new Date(), volTz); // Use event timezone to match stored availability slots
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

      let timeRange = timeMatch[1]; // "7am - 9am PST" or other tz abbr
      timeRange = timeRange.replace(/\s+[A-Z]{2,5}$/, "").trim(); // strip trailing tz abbreviation

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

      const startMoment = Moment(startTime, "h:mma", volTz);
      const endMoment = Moment(endTime, "h:mma", volTz);

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

  const toggleBioExpanded = (volunteerName, field) => {
    const key = `${volunteerName}-${field}`;
    setExpandedBios(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const renderExpandableText = (text, volunteerName, field, label) => {
    if (!text || typeof text !== 'string') return null;
    
    const MAX_LENGTH = 150;
    const key = `${volunteerName}-${field}`;
    const isExpanded = expandedBios[key] || false;
    const needsTruncation = text.length > MAX_LENGTH;
    
    if (!needsTruncation) {
      return (
        <Typography variant="body2" paragraph sx={{ mb: 1.5 }}>
          {label && <strong>{label}:</strong>} {text}
        </Typography>
      );
    }

    // Find the last complete word within MAX_LENGTH characters
    let truncateAt = MAX_LENGTH;
    while (truncateAt > 0 && text[truncateAt] !== ' ') {
      truncateAt--;
    }
    
    // If we couldn't find a space, fall back to character limit
    if (truncateAt === 0) {
      truncateAt = MAX_LENGTH;
    }

    const previewText = text.substring(0, truncateAt).trim();
    const remainingText = text.substring(truncateAt).trim();

    return (
      <ExpandableText>
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          {label && <strong>{label}:</strong>} {previewText}
          {!isExpanded && '...'}
          {isExpanded && ` ${remainingText}`}
        </Typography>
        
        <ReadMoreButton
          size="small"
          onClick={() => toggleBioExpanded(volunteerName, field)}
          endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          color="primary"
          variant="text"
        >
          {isExpanded ? 'Show Less' : 'Read More'}
        </ReadMoreButton>
      </ExpandableText>
    );
  };

  // Helper function to detect if availability is volunteer format vs mentor format
  const detectAvailabilityFormat = (availability) => {
    if (!availability || typeof availability !== "string") return 'unknown';

    // Volunteer format has dash separator and tends to have event names
    // Example: "Friday, Oct 10: Doors Open & Registration - 🍕 Food Service (8:00am - 11:00am)"
    const volunteerPattern = /\w+,\s+\w+\s+\d+:\s+[^-]+-\s+[🍕🧹📸🎤🎯🔧💻📋🎨🔒🎵🏃‍♂️🛠️📊🎪🎭🎬🎮🎲]/;
    
    // Mentor format typically has emoji at the start of the time portion without dash separator
    // Example: "Friday Oct 10: 🌅 Early Morning (7am - 9am PST)"
    const mentorPattern = /\w+\s+\w+\s+\d+:\s+[🌅☀️🏙️🌆🌃🌙]\s+/;
    
    // Additional check: volunteer format often contains dash separators
    const hasDashSeparator = availability.includes(' - ');

    if (hasDashSeparator && volunteerPattern.test(availability)) {
      return 'volunteer';
    } else if (mentorPattern.test(availability)) {
      return 'mentor';
    }

    if (hasDashSeparator) {
      return 'volunteer';
    }

    return 'mentor';
  };

  // Helper function to parse volunteer availability format
  const parseVolunteerAvailability = (availability) => {
    try {
      // Split by comma followed by space and day name pattern
      // Example input: "Friday, Oct 10: Doors Open & Registration - 🍕 Food Service (8:00am - 11:00am), Friday, Oct 10: Nonprofit Pitches - 🧹 Cleanup Crew (10:00am - 12:00pm)"
      const parts = availability.split(/,\s+(?=\w+,\s+\w+\s+\d+:)/);
      
      return parts.map((slot, index) => {
        // Parse format: "Friday, Oct 10: Doors Open & Registration - 🍕 Food Service (8:00am - 11:00am)"
        // More flexible regex to capture various emoji patterns
        const match = slot.match(/^(\w+,\s+\w+\s+\d+):\s+([^-]+?)\s*-\s*([🍕🧹📸🎤🎯🔧💻📋🎨🔒🎵🏃‍♂️🛠️📊🎪🎭🎬🎮🎲])\s+([^(]+?)\s*\(([^)]+)\)/);
        
        if (match) {
          const [, dateStr, eventName, emoji, role, timeRange] = match;

          // Create short date format (e.g., "Oct 10" from "Friday, Oct 10")
          const shortDate = dateStr.split(',')[1]?.trim() || dateStr; // "Oct 10"
          const dayName = dateStr.split(',')[0]?.trim() || ''; // "Friday"
          
          return {
            original: slot.trim(),
            dateStr: dateStr.trim(),
            shortDate,
            dayName,
            eventName: eventName.trim(),
            emoji,
            role: role.trim(),
            timeRange: timeRange.replace(/\s*(am|pm)\s*-\s*/i, '$1 - ').replace(/\s+[A-Za-z]{2,5}$/g, '').trim(),
            isCurrentlyAvailable: false, // Volunteers don't have "currently available" concept
            sortKey: dateStr + eventName
          };
        }
        
        // Fallback parsing if regex doesn't match - try to extract basic info
        const basicMatch = slot.match(/^([^:]+):\s*(.+)/);
        if (basicMatch) {
          const [, dateStr, rest] = basicMatch;
          return {
            original: slot.trim(),
            dateStr: dateStr.trim(),
            shortDate: dateStr.trim(),
            dayName: '',
            eventName: rest.trim(),
            emoji: '📋',            
            timeRange: '',
            isCurrentlyAvailable: false,
            sortKey: slot.trim()
          };
        }
        
        // Last resort fallback
        return {
          original: slot.trim(),
          dateStr: slot.trim(),
          shortDate: slot.trim(),
          dayName: '',
          eventName: slot.trim(),
          emoji: '📋',          
          timeRange: '',
          isCurrentlyAvailable: false,
          sortKey: slot.trim()
        };
      }).filter(slot => slot.original); // Remove empty slots
      
    } catch (error) {
      console.error('Error parsing volunteer availability:', error);
      return [];
    }
  };

  // Helper function to render volunteer availability
  const renderVolunteerAvailability = (availability, volunteerName) => {
    const slots = parseVolunteerAvailability(availability);

    if (slots.length === 0) {
      // Fallback: show the raw availability string if parsing fails
      return (
        <AvailabilitySection>
          <Typography variant="subtitle2" color="primary" sx={{ mb: 2 }}>
            📅 Volunteer Schedule
          </Typography>
          <Typography variant="body2" sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            {availability}
          </Typography>
        </AvailabilitySection>
      );
    }

    // Group slots by date for better organization
    const slotsByDate = slots.reduce((acc, slot) => {
      const date = slot.shortDate;
      if (!acc[date]) acc[date] = [];
      acc[date].push(slot);
      return acc;
    }, {});

    const isExpanded = expandedAvailability[volunteerName] || false;
    const totalSlots = slots.length;
    const shouldShowExpanded = totalSlots > 4;

    // Count how many date groups we're showing when collapsed
    const dateGroups = Object.keys(slotsByDate);
    const visibleDateGroups = isExpanded ? dateGroups.length : Math.min(dateGroups.length, 2);
    const hiddenDateGroups = dateGroups.length - visibleDateGroups;

    return (
      <AvailabilitySection>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle2" color="primary">
            📅 Volunteer Schedule ({totalSlots} shifts)
          </Typography>
          {shouldShowExpanded && hiddenDateGroups > 0 && (
            <Typography variant="caption" color="text.secondary">
              {isExpanded ? 'Showing all shifts' : `Showing first few of ${totalSlots} shifts`}
            </Typography>
          )}
        </Box>

        <Stack spacing={1}>
          {Object.entries(slotsByDate).map(([date, dateSlots], index) => {
            const shouldHideDate = shouldShowExpanded && !isExpanded && index >= 2;
            if (shouldHideDate) return null;

            return (
              <Box key={date}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                  {dateSlots[0].dayName ? `${dateSlots[0].dayName}, ${date}` : date}
                </Typography>
                <Stack spacing={0.1} sx={{ ml: 2 }}>
                  {dateSlots.map((slot, slotIndex) => (
                    <Box key={slotIndex} sx={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      p: 1.1, 
                      borderRadius: 1,
                      backgroundColor: 'grey.50',
                      border: '1px solid',
                      borderColor: 'grey.200',
                      '&:hover': {
                        backgroundColor: 'grey.100'
                      }
                    }}>
                      <Typography component="span" sx={{ fontSize: '1.0em', mr: 1.5, mt: 0.0 }}>
                        {slot.emoji}
                      </Typography>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.3 }}>
                          {slot.eventName || 'Event'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2, display: 'block' }}>                          
                          {slot.timeRange && ` • ${slot.timeRange}`}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Box>
            );
          })}
        </Stack>

        {shouldShowExpanded && hiddenDateGroups > 0 && (
          <ExpandButton onClick={() => toggleExpanded(volunteerName)} sx={{ mt: 2 }}>
            <Typography variant="body2" color="primary" sx={{ mr: 1 }}>
              {isExpanded
                ? 'Show Less'
                : `Show All ${totalSlots} Volunteer Shifts`
              }
            </Typography>
            {isExpanded ? <ExpandLessIcon color="primary" /> : <ExpandMoreIcon color="primary" />}
          </ExpandButton>
        )}

        <Divider sx={{ my: 1.5 }} />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
          📋 Volunteer commitments • Times shown as registered
        </Typography>
      </AvailabilitySection>
    );
  };

  // Helper function to render mentor availability (extracted from original logic)
  const renderMentorAvailability = (availability, volunteerName) => {
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
        const timeRange = timeRangeMatch ? timeRangeMatch[1].replace(/\s+[A-Z]{2,5}$/, '') : "";
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
              🟢 = Available Now • All times in {getTimezoneAbbreviation(new Date(), volTz)} • Click "Show More" to see all slots
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
      console.error("Error rendering mentor availability:", error);
      return null;
    }
  };

  // Main availability router - detects format and routes to appropriate renderer
  const renderAvailability = (availability, volunteerName) => {
    if (!availability || typeof availability !== "string") return null;

    const format = detectAvailabilityFormat(availability);
    
    switch (format) {
      case 'volunteer':
        return renderVolunteerAvailability(availability, volunteerName);
      case 'mentor':
      default:
        return renderMentorAvailability(availability, volunteerName);
    }
  };

  const [expandedCards, setExpandedCards] = React.useState({});

  const toggleCardExpanded = (volunteerName) => {
    setExpandedCards(prev => ({
      ...prev,
      [volunteerName]: !prev[volunteerName]
    }));
  };

  const getVolunteerImage = (volunteer) => {
    let imageToDisplay =
      "https://cdn.ohack.dev/ohack.dev/logos/OpportunityHack_2Letter_Black.png";
    if (volunteer.photoUrl && typeof volunteer.photoUrl === "string") {
      const googleDriveImage = volunteer.photoUrl.includes("drive.google.com");
      if (!googleDriveImage) {
        imageToDisplay = volunteer.photoUrl;
      }
    }
    return imageToDisplay;
  };

  // Get a short subtitle for the compact card header
  const getCompactSubtitle = (volunteer) => {
    const parts = [];
    const company = getFieldValue(volunteer, FIELD_CONFIG.company);
    if (company) parts.push(company);
    if (volunteer.title && !volunteer.experienceLevel) parts.push(volunteer.title);
    if (volunteer.experienceLevel) parts.push(volunteer.experienceLevel);
    const expertise = getFieldValue(volunteer, FIELD_CONFIG.expertise);
    if (!parts.length && expertise) {
      const short = Array.isArray(expertise) ? expertise.slice(0, 2).join(", ") : expertise.split(/[,;]/).slice(0, 2).join(", ");
      parts.push(short);
    }
    return parts.join(" · ");
  };

  const renderVolunteerCard = (volunteer) => {
    if (!volunteer) return null;
    if (!volunteer.isSelected) return null;

    const name = volunteer.name || "Volunteer";
    const isExpanded = expandedCards[name] || false;
    const imageUrl = getVolunteerImage(volunteer);
    const subtitle = getCompactSubtitle(volunteer);
    const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

    // Gather visible-at-a-glance chips (location, in-person badge, team status)
    const hasLocation = shouldRenderField(volunteer, 'location', type);
    const hasTeamStatus = shouldRenderField(volunteer, 'teamStatus', type);

    return (
      <Grid
        size={{ xs: 6, sm: 4, md: 3 }}
        key={name}
        id={`mentor-${name}`}
      >
        <PersonCard isExpanded={isExpanded}>
          {/* Always-visible top section: avatar, name, subtitle, key badges */}
          <CardTopSection onClick={() => toggleCardExpanded(name)}>
            <Box sx={{ position: "relative", display: "inline-flex" }}>
              <PersonAvatar src={imageUrl} alt={name}>
                {initials}
              </PersonAvatar>
              {volunteer.isInPerson !== undefined && (
                <Tooltip title={volunteer.isInPerson ? "In-Person" : "Remote"}>
                  <Chip
                    label={volunteer.isInPerson ? "In-Person" : "Remote"}
                    size="small"
                    color={volunteer.isInPerson ? "success" : "info"}
                    sx={{
                      position: "absolute",
                      bottom: -4,
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontSize: "0.65rem",
                      height: 18,
                      "& .MuiChip-label": { px: 0.75 },
                    }}
                  />
                </Tooltip>
              )}
            </Box>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                lineHeight: 1.3,
                mt: 0.5,
                wordBreak: "break-word",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {name}
            </Typography>
            {subtitle && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  lineHeight: 1.3,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  wordBreak: "break-word",
                }}
              >
                {subtitle}
              </Typography>
            )}
            {/* Quick-glance chips visible without expanding */}
            {(hasLocation || hasTeamStatus) && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.75, justifyContent: "center" }}>
                {renderField(volunteer, 'location', type)}
                {renderField(volunteer, 'teamStatus', type)}
              </Box>
            )}
          </CardTopSection>

          {/* Expand/collapse toggle */}
          <Box
            onClick={() => toggleCardExpanded(name)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              py: 0.5,
              cursor: "pointer",
              color: "text.secondary",
              "&:hover": { color: "primary.main" },
            }}
          >
            {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </Box>

          {/* Expanded detail section */}
          <Collapse in={isExpanded}>
            <ExpandedContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
                  {volunteer.pronouns && (
                    <Chip icon={<PersonIcon />} label={volunteer.pronouns} size="small" />
                  )}
                </Box>
                <ShareVolunteer volunteer={volunteer} type={type} />
              </Box>
              <ChipContainer>
                {renderField(volunteer, 'participationCount', type)}
                {renderField(volunteer, 'linkedinProfile', type)}
                {renderField(volunteer, 'github', type)}
                {renderField(volunteer, 'portfolio', type)}
              </ChipContainer>
              {renderField(volunteer, 'bio', type)}
              {renderField(volunteer, 'expertise', type)}
              {renderField(volunteer, 'softwareSpecifics', type)}
              {renderField(volunteer, 'whyJudge', type)}
              {renderField(volunteer, 'primaryRoles', type)}
              {renderField(volunteer, 'skills', type)}
              {renderField(volunteer, 'socialCauses', type)}
              {renderField(volunteer, 'availability', type)}
              {renderField(volunteer, 'artifacts', type)}
            </ExpandedContent>
          </Collapse>
        </PersonCard>
      </Grid>
    );
  };

  const renderTableView = () => {
    const selected = Array.isArray(volunteers)
      ? volunteers.filter((v) => v && v.isSelected)
      : [];

    if (selected.length === 0) return null;

    const showTeamStatus = type === "hacker";

    return (
      <TableContainer
        sx={{
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          overflow: "auto",
        }}
      >
        <Table size="small" sx={{ minWidth: 600 }}>
          <TableHead>
            <TableRow sx={{ "& th": { fontWeight: 700, whiteSpace: "nowrap" } }}>
              <TableCell>Name</TableCell>
              <TableCell>Organization</TableCell>
              <TableCell>Expertise</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Format</TableCell>
              {showTeamStatus && <TableCell>Team Status</TableCell>}
              <TableCell>Links</TableCell>
              <TableCell sx={{ width: 40 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {selected.map((volunteer) => {
              const name = volunteer.name || "Volunteer";
              const isExpanded = expandedCards[name] || false;
              const imageUrl = getVolunteerImage(volunteer);
              const initials = name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              const company = getFieldValue(volunteer, FIELD_CONFIG.company);
              const expertise = getFieldValue(volunteer, FIELD_CONFIG.expertise);
              const expertiseDisplay = expertise
                ? Array.isArray(expertise)
                  ? expertise.slice(0, 2).join(", ")
                  : expertise.split(/[,;]/).slice(0, 2).join(", ")
                : null;
              const location = getFieldValue(volunteer, FIELD_CONFIG.location);
              const teamStatus = getFieldValue(volunteer, FIELD_CONFIG.teamStatus);

              const getTeamLabel = (status) => {
                switch (status) {
                  case "I have a team": return "Has Team";
                  case "I'm looking for team members": return "Seeking Members";
                  case "I'd like to be matched with a team": return "Looking for Team";
                  default: return "Solo";
                }
              };

              return (
                <React.Fragment key={name}>
                  <TableRow
                    hover
                    onClick={() => toggleCardExpanded(name)}
                    sx={{
                      cursor: "pointer",
                      "& td": { borderBottom: isExpanded ? "none" : undefined },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar
                          src={imageUrl}
                          alt={name}
                          sx={{ width: 32, height: 32, fontSize: "0.8rem" }}
                        >
                          {initials}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {company || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {expertiseDisplay || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {location ? (
                        <Chip
                          icon={<LocationOnIcon />}
                          label={location}
                          size="small"
                        />
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {volunteer.isInPerson !== undefined && (
                        <Chip
                          label={volunteer.isInPerson ? "In-Person" : "Remote"}
                          size="small"
                          color={volunteer.isInPerson ? "success" : "info"}
                        />
                      )}
                    </TableCell>
                    {showTeamStatus && (
                      <TableCell>
                        {teamStatus ? (
                          <Chip
                            icon={<GroupIcon />}
                            label={getTeamLabel(teamStatus)}
                            size="small"
                            color={teamStatus === "I have a team" ? "success" : "primary"}
                          />
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        {getFieldValue(volunteer, FIELD_CONFIG.linkedinProfile) && (
                          <Tooltip title="LinkedIn">
                            <Link
                              href={getFieldValue(volunteer, FIELD_CONFIG.linkedinProfile)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <LinkedInIcon fontSize="small" />
                            </Link>
                          </Tooltip>
                        )}
                        {getFieldValue(volunteer, FIELD_CONFIG.github) && (
                          <Tooltip title="GitHub">
                            <Link
                              href={getFieldValue(volunteer, FIELD_CONFIG.github)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <GitHubIcon fontSize="small" />
                            </Link>
                          </Tooltip>
                        )}
                        {getFieldValue(volunteer, FIELD_CONFIG.portfolio) && (
                          <Tooltip title="Portfolio">
                            <Link
                              href={getFieldValue(volunteer, FIELD_CONFIG.portfolio)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <LaunchIcon fontSize="small" />
                            </Link>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {isExpanded ? (
                        <ExpandLessIcon fontSize="small" color="action" />
                      ) : (
                        <ExpandMoreIcon fontSize="small" color="action" />
                      )}
                    </TableCell>
                  </TableRow>

                  {/* Expanded detail row */}
                  <TableRow>
                    <TableCell
                      colSpan={showTeamStatus ? 8 : 7}
                      sx={{ py: 0, borderBottom: isExpanded ? undefined : "none" }}
                    >
                      <Collapse in={isExpanded}>
                        <Box sx={{ py: 2, px: 1 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5, flexWrap: "wrap" }}>
                            {volunteer.pronouns && (
                              <Chip icon={<PersonIcon />} label={volunteer.pronouns} size="small" />
                            )}
                            {renderField(volunteer, "participationCount", type)}
                            <ShareVolunteer volunteer={volunteer} type={type} />
                          </Box>
                          {renderField(volunteer, "bio", type)}
                          {renderField(volunteer, "expertise", type)}
                          {renderField(volunteer, "softwareSpecifics", type)}
                          {renderField(volunteer, "whyJudge", type)}
                          {renderField(volunteer, "primaryRoles", type)}
                          {renderField(volunteer, "skills", type)}
                          {renderField(volunteer, "socialCauses", type)}
                          {renderField(volunteer, "availability", type)}
                          {renderField(volunteer, "artifacts", type)}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
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

  const { label: sectionLabel, learnMoreHref } = TYPE_CONFIG[type] || TYPE_CONFIG.volunteer;

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 1 }}>
        <HeadingContainer sx={{ mb: 0 }}>
          <Typography variant="h4">{sectionLabel}</Typography>
          <NextLink href={learnMoreHref} passHref>
            <StyledLink color="secondary" component="a" href={learnMoreHref}>
              (Learn more)
            </StyledLink>
          </NextLink>
        </HeadingContainer>

        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, v) => { if (v) setViewMode(v); }}
          size="small"
          aria-label="View mode"
        >
          <ToggleButton value="cards" aria-label="Card view">
            <Tooltip title="Card view">
              <ViewModuleIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="table" aria-label="Table view">
            <Tooltip title="Table view">
              <TableRowsIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {type === "mentor" && <MentorAvailability volunteers={volunteers} />}

      {type === "mentor" &&
        Array.isArray(availableMentors) &&
        availableMentors.length > 0 && (
          <AvailableMentorsSection>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span>🟢</span>
              Currently Available Mentors:
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                ({availableMentors.length} available now)
              </Typography>
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
              {availableMentors.map((mentor) => {
                // Extract expertise for display
                const expertise = getFieldValue(mentor, FIELD_CONFIG.expertise) || 
                                getFieldValue(mentor, FIELD_CONFIG.skills) ||
                                getFieldValue(mentor, FIELD_CONFIG.primaryRoles) ||
                                getFieldValue(mentor, FIELD_CONFIG.company) ||
                                'General Support';
                
                // Truncate expertise for chip display (show first 2-3 skills)
                const expertiseArray = Array.isArray(expertise) ? expertise : expertise.split(/[,;|]/).map(s => s.trim());
                const displayExpertise = expertiseArray.slice(0, 2).join(' • ');
                const fullExpertise = expertiseArray.join(' • ');
                
                const tooltipContent = (
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {mentor?.name || "Mentor"}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                      {mentor?.isInPerson ? "📍 Available now (in-person)" : "💻 Available now (remote)"}
                    </Typography>
                    {getFieldValue(mentor, FIELD_CONFIG.company) && (
                      <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                        🏢 {getFieldValue(mentor, FIELD_CONFIG.company)}
                      </Typography>
                    )}
                    <Typography variant="caption" sx={{ display: 'block' }}>
                      🎯 {fullExpertise}
                    </Typography>
                  </Box>
                );

                return (
                  <Tooltip
                    title={tooltipContent}
                    key={mentor?.name || `mentor-${Math.random().toString(36)}`}
                    arrow
                    placement="top"
                  >
                    <AvailableMentorChip
                      label={
                        <Box>
                          <MentorName component="div">
                            {mentor?.name || "Mentor"}
                          </MentorName>
                          <MentorExpertise component="div">
                            {displayExpertise}
                          </MentorExpertise>
                        </Box>
                      }
                      onClick={() => scrollToMentor(mentor?.name || "")}
                      isInPerson={!!mentor?.isInPerson}
                      clickable
                    />
                  </Tooltip>
                );
              })}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>
              💡 Click any mentor to scroll to their full profile below
            </Typography>
          </AvailableMentorsSection>
        )}

      {viewMode === "cards" ? (
        <Grid container spacing={2}>
          {Array.isArray(volunteers) &&
            volunteers.map((volunteer) => renderVolunteerCard(volunteer))}
        </Grid>
      ) : (
        renderTableView()
      )}
    </Box>
  );
};

export default VolunteerList;
