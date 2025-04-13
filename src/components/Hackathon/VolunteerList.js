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
  paddingTop: "100%", // 1:1 Aspect Ratio  
  borderRadius: "50%",
    
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
      // Determine if currently available for each volunteer.availability that is a list of available times
      const currentlyAvailable = volunteers.filter((volunteer) => {
        if (volunteer?.isSelected) {
          // Check if we have the new availableDays array format
          if (Array.isArray(volunteer.availableDays) && volunteer.availableDays.length > 0) {
            // Use the new array format
            return volunteer.availableDays.some(slot => {
              // Convert from "Friday Oct 10-Early Morning" to displayable format
              const parts = slot.split('-');
              if (parts.length < 2) return false;
              
              const day = parts[0]; // "Friday Oct 10"
              const timeOfDay = parts[1]; // "Early Morning"
              
              // Create a displayable format with time information for checking availability
              // We need to include the time range for isCurrentlyAvailable to work
              const timeRanges = {
                "Early Morning": "(7am - 9am PST)",
                "Morning": "(9am - 12pm PST)",
                "Afternoon": "(1pm - 3pm PST)",
                "Evening": "(5pm - 8pm PST)",
                "Night": "(8pm - 11pm PST)",
                "Late Night": "(11pm - 2am PST)"
              };
              
              const displaySlot = `${day}: ${timeOfDay} ${timeRanges[timeOfDay] || ""}`;
              return isCurrentlyAvailable(displaySlot);
            });
          } else if (volunteer?.availability) {
            // Fall back to old comma-split method
            const availabilityPattern = /([A-Za-z]+\s+[A-Za-z]+\s+\d+:\s+[^,]+)/g;
            const matches = volunteer.availability.match(availabilityPattern);
            const availabilityArray = matches || volunteer.availability.split(", ");
            
            return availabilityArray.some(isCurrentlyAvailable);
          }
        }
        return false;
      });
      
      setAvailableMentors(currentlyAvailable);
    }
  }, [volunteers, type]);


  const isCurrentlyAvailable = (timeSpan) => {
    if (!timeSpan || typeof timeSpan !== 'string') return false;
    
    const now = Moment(new Date(), "America/Los_Angeles"); // Everything is going to be in PST - we don't want to get the user's local time
    const nowDay = now.format("dddd");

    // New format example: "Friday Oct 10: 🌅 Early Morning (7am - 9am PST)"
    // Old format example: "Friday, Oct 10: 🌅 Early Morning (7am - 9am PST)" (with comma)
    // Extract the day name from the date part
    const datePart = timeSpan.split(":")[0]; // "Friday Oct 10" or "Friday, Oct 10" or similar
    
    if (!datePart) return false;
    
    // Extract the day name (first word) whether it has a comma or not
    const dayName = datePart.split(" ")[0].trim(); // "Friday"
    const isDayMatch = dayName === nowDay;
    
    if (!isDayMatch) return false;

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
      // First check if we have availableDays property in the volunteer
      const availabilityArray = [];
      
      // New format: "Friday Oct 10: 🌅 Early Morning (7am - 9am PST), Friday Oct 10: ☀️ Morning..."
      // Old format: "Friday, Oct 10: 🌅 Early Morning (7am - 9am PST), Friday, Oct 10: ☀️ Morning..."
      // Handle both formats with a flexible pattern
      const availabilityPattern = /([A-Za-z]+\s+[A-Za-z]+\s+\d+:\s+[^,]+)/g;
      
      // Try to match with regex first
      const matches = availability.match(availabilityPattern);
      
      // If regex doesn't work, fall back to comma split
      const extractedSlots = matches || availability.split(", ");
      
      // Use the slots
      availabilityArray.push(...extractedSlots);
      
      console.log("Volunteer Availability array:", availabilityArray);
      if (availabilityArray.length === 0) return null;
      
      // Extract date part (assuming all entries have the same date)
      const firstSlot = availabilityArray[0];
      const colonIndex = firstSlot.indexOf(":");
      
      if (colonIndex === -1) {
        // Legacy format fallback
        return (
          <Box mt={2}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {availabilityArray.map((time, index) => (
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
      
      // Get the date part, like "Friday, Oct 10"
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
      const processedSlots = availabilityArray.map(slot => {
        console.log("Processing slot:", slot);
        const slotColonIndex = slot.indexOf(":");
        if (slotColonIndex === -1) return { 
          display: slot, 
          timeOfDay: null, 
          originalSlot: slot,
          dayName: null,
          dayOrder: 99,
          sortOrder: 99
        };
        
        // Extract day name from the date part - handle both formats (with or without comma)
        const slotDatePart = slot.substring(0, slotColonIndex).trim();
        // Get first word as the day name, regardless of comma
        const dayName = slotDatePart.split(" ")[0].trim(); // "Friday", "Saturday", etc.
        
        // Get everything after the colon, which should be like " 🌅 Early Morning (7am - 9am PST)"
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
          sortOrder: timeOfDay ? timeOfDayOrder[timeOfDay] || 99 : 99
        };
      });
      
      // Sort the slots first by day of week, then by time of day
      const sortedSlots = [...processedSlots].sort((a, b) => {
        // First sort by day
        if (a.dayOrder !== b.dayOrder) {
          return a.dayOrder - b.dayOrder;
        }
        // Then sort by time period
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
