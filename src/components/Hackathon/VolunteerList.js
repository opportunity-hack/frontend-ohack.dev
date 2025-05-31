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
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import WorkIcon from "@mui/icons-material/Work";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import CodeIcon from '@mui/icons-material/Code';
import BugReportIcon from '@mui/icons-material/BugReport';
import ForumIcon from '@mui/icons-material/Forum';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import Moment from "moment";
import NextLink from "next/link";
import ShareVolunteer from "./ShareVolunteer";
import { useEffect } from "react";
import MentorAvailability from './MentorAvailability';


const ArtifactList = styled(List)({
  padding: 0,
});

const ArtifactListItem = styled(ListItem)({
  padding: '4px 0',
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

const AvailabilityChip = styled(Chip)(({ theme, isavailablenow, timeofdaycolor }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: isavailablenow
    ? theme.palette.info.main
    : timeofdaycolor || theme.palette.success.light,
  color: theme.palette.getContrastText(
    isavailablenow 
      ? theme.palette.info.main 
      : timeofdaycolor || theme.palette.success.light
  ),
  boxShadow: isavailablenow ? theme.shadows[2] : 'none',
  transition: 'all 0.2s ease-in-out',
  "&:hover": {
    backgroundColor: isavailablenow
      ? theme.palette.info.dark
      : timeofdaycolor ? alpha(timeofdaycolor, 0.8) : theme.palette.success.main,
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[3],
  },
}));

const AvailableMentorsSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
}));

const AvailableMentorChip = styled(Chip)(({ theme, isInPerson }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: isInPerson ? theme.palette.success.main : theme.palette.info.main,
  color: theme.palette.success.contrastText,
  '&:hover': {
    backgroundColor: theme.palette.success.dark,
  },
}));

const VolunteerList = ({ event_id, type }) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [volunteers, setVolunteers] = React.useState([]);
  const [availableMentors, setAvailableMentors] = React.useState([]);
  
  


  useEffect(() => {
    // Call API to get data based on type
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${event_id}/${type}`);
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
    if (type === "mentor" && Array.isArray(volunteers) && volunteers.length > 0) {
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
            const startsNewSlot = /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|\w+ \w+ \d+:|🌅|☀️|🏙️|🌆|🌃|🌙)/.test(part);
            
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
    if (!timeSpan || typeof timeSpan !== 'string') return false;
    
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

      let [startTime, endTime] = timeParts.map(t => t.trim());
      
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
    if (!artifacts || !Array.isArray(artifacts) || artifacts.length === 0) return null;
    
    return (
      <Box mt={2}>
        <Typography variant="subtitle2" gutterBottom>
          Contributions:
        </Typography>
        <ArtifactList>
          {artifacts.map((artifact, index) => (
            <ArtifactListItem key={index}>
              <ListItemIcon>
                {artifact?.type === 'pull_request' && <CodeIcon />}
                {artifact?.type === 'issue' && <BugReportIcon />}
                {artifact?.type === 'coordination' && <ForumIcon />}
                {artifact?.type === 'user_experience' && <DesignServicesIcon />}
                {artifact?.type === 'standup' && <AccessTimeIcon />}
                {!artifact?.type && <CodeIcon />} {/* Default icon */}
              </ListItemIcon>
              <ListItemText
                primary={artifact?.label || "Contribution"}
                secondary={
                  <>
                    {artifact?.comment || ""}
                    {artifact?.url && Array.isArray(artifact.url) && artifact.url.length > 0 && (
                      <Link href={artifact.url[0]} target="_blank" rel="noopener noreferrer">
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

  const renderAvailability = (availability) => {
    if (!availability || typeof availability !== 'string') return null;
    
    try {
      // Use the same careful splitting logic from MentorAvailability.js
      const slots = [];
      let currentSlot = "";
      const parts = availability.split(", ");
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        
        // Check if this part starts a new time slot (contains weekday pattern or emoji)
        const startsNewSlot = /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|\w+ \w+ \d+:|🌅|☀️|🏙️|🌆|🌃|🌙)/.test(part);
        
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
      
      console.log("Volunteer Availability raw:", availability);
      console.log("Volunteer Availability carefully split:", slots);
      
      if (slots.length === 0) return null;
      
      // Extract date part (assuming all entries have the same date)
      const firstSlot = slots[0];
      const colonIndex = firstSlot.indexOf(":");
      
      if (colonIndex === -1) {
        // Legacy format fallback
        return (
          <Box mt={2}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {slots.map((time, index) => (
                <AvailabilityChip
                  key={index}
                  icon={<AccessTimeIcon />}
                  label={time}
                  size="small"
                  isavailablenow={isCurrentlyAvailable(time) ? 1 : 0}
                />
              ))}
            </Box>
          </Box>
        );
      }
      
      // Get the date part, like "Friday, Oct 10" or "Friday Oct 10"
      const datePart = firstSlot.substring(0, colonIndex).trim();
      
      // Define colors for different time periods
      const timeOfDayColors = {
        "Early Morning": "#9FC5E8", // Light blue
        "Morning": "#FFD966",       // Light yellow
        "Afternoon": "#93C47D",     // Light green
        "Evening": "#B4A7D6",       // Light purple
        "Night": "#8E7CC3",         // Medium purple
        "Late Night": "#674EA7"     // Dark purple
      };
      
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
      
      // Define time period order for sorting
      const timeOfDayOrder = {
        "Early Morning": 1,
        "Morning": 2,
        "Afternoon": 3,
        "Evening": 4,
        "Night": 5,
        "Late Night": 6
      };
      
      // Process the time slots
      const processedSlots = slots.map(slot => {
        console.log("Processing slot:", slot);
        const slotColonIndex = slot.indexOf(":");
        if (slotColonIndex === -1) return { 
          display: slot, 
          timeOfDay: null, 
          originalSlot: slot,
          dayName: null,
          dayOrder: 99,
          sortOrder: 99,
          month: null,
          date: null
        };
        
        // Extract day name from the date part - handle both formats (with or without comma)
        const slotDatePart = slot.substring(0, slotColonIndex).trim();
        
        // Parse both formats to extract day name, month, and date
        let dayName, month, date;
        
        // Handle "Monday, May 12" format (with comma)
        const commaMatch = slotDatePart.match(/(\w+),\s+(\w+)\s+(\d+)/);
        if (commaMatch) {
          dayName = commaMatch[1]; // "Monday"
          month = commaMatch[2]; // "May"
          date = parseInt(commaMatch[3], 10); // 12
        } else {
          // Handle "Friday Oct 10" format (no comma)
          const noCommaMatch = slotDatePart.match(/(\w+)\s+(\w+)\s+(\d+)/);
          if (noCommaMatch) {
            dayName = noCommaMatch[1]; // "Friday"
            month = noCommaMatch[2]; // "Oct"
            date = parseInt(noCommaMatch[3], 10); // 10
          }
        }
        
        // Get everything after the colon, which should be like " 🌅 Early Morning (7am - 9am)"
        let timeInfo = slot.substring(slotColonIndex + 1).trim();
        
        // Remove PST to save space
        if (timeInfo.includes(" PST)")) {
          timeInfo = timeInfo.replace(" PST)", ")");
        }
        
        let emoji = "", timeOfDay = "", timeRange = "", display = timeInfo;
        
        // Extract emoji, time label, and time range
        const emojiTimeMatch = /([^\s]+)\s+([^(]+)\s*(\([^)]+\))/u.exec(timeInfo);
        
        if (emojiTimeMatch) {
          emoji = emojiTimeMatch[1]; // 🌅
          timeOfDay = emojiTimeMatch[2].trim(); // Early Morning
          timeRange = emojiTimeMatch[3]; // (7am - 9am)
          
          // Create integrated display with date, emoji and time
          // For new format: Extract "Oct 10" from "Friday Oct 10"
          // For old format: Extract "Oct 10" from "Friday, Oct 10"
          let dateOnly = slotDatePart;
          
          // For old format with comma
          if (slotDatePart.includes(",")) {
            const dateParts = slotDatePart.split(","); // ["Friday", " Oct 10"]
            dateOnly = dateParts.length > 1 ? dateParts[1].trim() : slotDatePart;
          } else {
            // For new format without comma - extract everything after the first word
            const dateParts = slotDatePart.split(" ");
            if (dateParts.length > 1) {
              // Remove the first word (day name) and keep the rest
              dateOnly = dateParts.slice(1).join(" ");
            }
          }
          
          display = `${dateOnly} · ${timeRange}`;
        }
        
        return { 
          display, 
          emoji,
          timeOfDay, 
          timeRange,
          originalSlot: slot, 
          color: timeOfDayColors[timeOfDay] || null,
          dayName,
          dayOrder: dayOrder[dayName] || 99,
          sortOrder: timeOfDay ? timeOfDayOrder[timeOfDay] || 99 : 99,
          month,
          date
        };
      });
      
      // Sort the slots by calendar date first, then by time of day
      const sortedSlots = [...processedSlots].sort((a, b) => {
        // Define month order for calendar sorting
        const monthOrder = {
          "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6,
          "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12,
          "January": 1, "February": 2, "March": 3, "April": 4, "June": 6,
          "July": 7, "August": 8, "September": 9, "October": 10, "November": 11, "December": 12
        };
        
        // First compare by month
        const monthOrderA = monthOrder[a.month] || 0;
        const monthOrderB = monthOrder[b.month] || 0;
        
        if (monthOrderA !== monthOrderB) {
          return monthOrderA - monthOrderB;
        }
        
        // Then compare by day of month
        if (a.date !== b.date) {
          return (a.date || 0) - (b.date || 0);
        }
        
        // Finally, compare by time period
        return a.sortOrder - b.sortOrder;
      });
      
      return (
        <Box mt={2}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, justifyContent: 'flex-start' }}>
            {sortedSlots.map((slot, index) => (
              <Tooltip
                key={index}
                title={isCurrentlyAvailable(slot.originalSlot) ? 
                  "Available now (during the hackathon)!" : 
                  slot.originalSlot}
              >
                <AvailabilityChip
                  icon={slot.emoji ? 
                    <span style={{ fontSize: '1.0rem', marginRight: '3px' }}>{slot.emoji}</span> : 
                    <AccessTimeIcon />}
                  label={slot.originalSlot}
                  size="medium"
                  isavailablenow={isCurrentlyAvailable(slot.originalSlot) ? 1 : 0}
                  timeofdaycolor={slot.color}
                  sx={{ 
                    fontWeight: 500,
                    '& .MuiChip-label': { 
                      paddingLeft: slot.emoji ? 0 : undefined 
                    }
                  }}
                />
              </Tooltip>
            ))}
          </Box>
        </Box>
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
    const isSelected = !!volunteer.isSelected;
    
    // Skip rendering if not selected
    if (!isSelected) return null;    

    // Safely handle photo URL
    let imageToDisplay = "https://cdn.ohack.dev/ohack.dev/logos/OpportunityHack_2Letter_Black.png";
    if (volunteer.photoUrl && typeof volunteer.photoUrl === 'string') {
      const googleDriveImage = volunteer.photoUrl.includes("drive.google.com");
      if (!googleDriveImage) {
        imageToDisplay = volunteer.photoUrl;
      }
    }

    return (
      <Grid item xs={12} sm={6} md={4} key={volunteer.name || `volunteer-${Math.random().toString(36)}`} id={`mentor-${volunteer.name || "unknown"}`}>
        <VolunteerCard>
          <VolunteerMediaContainer>
            <VolunteerMedia
              image={imageToDisplay}
              title={volunteer.name || "Volunteer"}
            />
            {volunteer.isInPerson ? <InPersonBadge>In-Person</InPersonBadge> : <RemoteBadge>Remote</RemoteBadge>}
          </VolunteerMediaContainer>
          <VolunteerContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
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
              {isMentor ? (volunteer.company || "") : (volunteer.companyName || "")}
              {!isMentor && volunteer.title && ` - ${volunteer.title}`}
            </Typography>
            <ChipContainer>
              {volunteer.company && (
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
              {isMentor && typeof volunteer.participationCount !== 'undefined' && (
                <Chip
                  icon={<VolunteerActivismIcon />}
                  label={volunteer.participationCount}
                  size="small"
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
            </ChipContainer>
            <Typography variant="body1" paragraph sx={{ mt: 2 }}>
              {volunteer.shortBio || volunteer.shortBiography || ""}
            </Typography>
            {isMentor && (
              <>
                <Typography variant="body1" paragraph>
                  <strong>Expertise:</strong> {volunteer.expertise || "Not specified"}
                </Typography>
                {volunteer.softwareEngineeringSpecifics && (
                  <Typography variant="body1" paragraph>
                    <strong>Software Specifics:</strong>{" "}
                    {volunteer.softwareEngineeringSpecifics}
                  </Typography>
                )}
              </>
            )}
            {(isJudge && volunteer.background) && (
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
            {isMentor && renderAvailability(volunteer.availability)}
            {isVolunteer && renderArtifacts(volunteer.artifacts)}
          </VolunteerContent>
        </VolunteerCard>
      </Grid>
    );
  };

  const scrollToMentor = (mentorName) => {
    const element = document.getElementById(`mentor-${mentorName}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };
 

  if( loading ) 
  {
    return(<Skeleton marginTop={5} variant="rect" width={210} height={300} />);
  }

  return (
  <Box sx={{ mt: 4 }}>
    <HeadingContainer>
      <Typography variant="h4">
        Our Amazing {type === "mentor" ? "Mentors" : type === "judge" ? "Judges" : "Volunteers"}
      </Typography>
      <NextLink
        href={type === "mentor" ? "/about/mentors" : type === "judge" ? "/about/judges" : "/volunteer"}
        passHref
      >
        <StyledLink color="secondary">(Learn more)</StyledLink>
      </NextLink>
    </HeadingContainer>    

    {type === "mentor" && <MentorAvailability volunteers={volunteers} /> }

    {type === "mentor" && Array.isArray(availableMentors) && availableMentors.length > 0 && (
      <AvailableMentorsSection>
        <Typography variant="h6" gutterBottom>
          Currently Available Mentors:
        </Typography>
        {availableMentors.map((mentor) => (
          <Tooltip            
            title={<span style={{ fontSize: "14px" }}>{
              mentor?.isInPerson
                ? "Available now (in-person)"
                : "Available now (remote)"            
            }</span>}
            key={mentor?.name || `mentor-${Math.random().toString(36)}`}
          >
          <AvailableMentorChip
            key={mentor?.name || `mentor-chip-${Math.random().toString(36)}`}
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
      {Array.isArray(volunteers) && volunteers.map((volunteer) => renderVolunteerCard(volunteer))}
    </Grid>
  </Box>
);
};

export default VolunteerList;
