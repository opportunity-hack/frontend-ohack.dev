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
import { styled } from "@mui/material/styles";
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

const AvailabilityChip = styled(Chip)(({ theme, isavailablenow }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: isavailablenow
    ? theme.palette.info.main
    : theme.palette.success.light,
  color: isavailablenow
    ? theme.palette.success.contrastText
    : theme.palette.text.primary,
  "&:hover": {
    backgroundColor: isavailablenow
      ? theme.palette.success.dark
      : theme.palette.success.main,
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
  
  
const getAvailabilityCounts = (volunteers) => {
  const counts = {
    Saturday: {},
    Sunday: {}
  };
  
  if (!Array.isArray(volunteers)) return counts;
  
  volunteers.forEach(volunteer => {
    if (volunteer?.availability) {
      volunteer.availability.split(", ").forEach(slot => {
        if (slot.includes("Saturday") || slot.includes("Sunday")) {
          const parts = slot.split(" (");
          if (parts.length >= 2) {
            const day = parts[0];
            const cleanTime = parts[1].replace(")", "") || "";
            if (!counts[day]) counts[day] = {};
            counts[day][cleanTime] = (counts[day][cleanTime] || 0) + 1;
          }
        }
      });
    }
  });
  return counts;
};

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
        if (volunteer?.availability && volunteer?.isSelected) {
          const availabilityArray = volunteer.availability.split(", ");
          return availabilityArray.some(isCurrentlyAvailable);
        }
        return false;
      }
      );
      setAvailableMentors(currentlyAvailable);

    }
  }, [volunteers, type]);


  const isCurrentlyAvailable = (timeSpan) => {
    if (!timeSpan || typeof timeSpan !== 'string') return false;
    
    const now = Moment(new Date(), "America/Los_Angeles"); // Everything is going to be in PST - we don't want to get the user's local time
    const nowDay = now.format("dddd");

    // Get the day which is either Saturday or Sunday within the string
    const dayMatch = timeSpan.match(/(Saturday|Sunday)/g);
    const isDayMatch = dayMatch && dayMatch.length > 0 && dayMatch[0] === nowDay;
    
    if (!isDayMatch) return false;

    // Safe string manipulation with proper error checking
    let timeRange = timeSpan;
    try {
      // Extract the time portion from the string
      const timeMatch = timeSpan.match(/\((.*?)\)/);
      if (!timeMatch || !timeMatch[1]) return false;
      
      timeRange = timeMatch[1];
      timeRange = timeRange.replace(/PST/g, "").trim();
      timeRange = timeRange.replace(/p\s/g, "pm");
      timeRange = timeRange.replace(/a\s/g, "am");

      const timeParts = timeRange.split("-");
      if (timeParts.length !== 2) return false;

      let [startTime, endTime] = timeParts;
      // Add :59 to the end time to make it inclusive of the entire hour
      endTime = endTime.trim().replace(/(\d+)([ap]m)$/, "$1:59$2");
      startTime = startTime.trim();

      const startMoment = Moment(startTime, "h:mma", "America/Los_Angeles");
      const endMoment = Moment(endTime, "h:mma", "America/Los_Angeles");

      if (!startMoment.isValid() || !endMoment.isValid()) return false;

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
      const availabilityArray = availability.split(", ").filter(Boolean);
      if (availabilityArray.length === 0) return null;
      
      return (
        <Box mt={2}>
          <Typography variant="subtitle2" gutterBottom>
            Available Times:
          </Typography>
          {availabilityArray.map((time, index) => {
            const isAvailableNow = isCurrentlyAvailable(time);
            return (
              <Tooltip
                title={
                  isAvailableNow ? (
                    <span style={{ fontSize: "14px" }}>
                      Available now (during the hackathon)!
                    </span>
                  ) : (
                    time
                  )
                }
                key={index}
              >
                <AvailabilityChip
                  icon={<AccessTimeIcon />}
                  label={time}
                  size="small"
                  isavailablenow={isAvailableNow ? 1 : 0}
                />
              </Tooltip>
            );
          })}
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
