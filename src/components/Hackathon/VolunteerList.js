import React from "react";
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Box,
  Link,
  Tooltip
} from "@mui/material";
import { styled } from "@mui/material/styles";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import WorkIcon from "@mui/icons-material/Work";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import Moment from "moment";

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
  width: "60%",
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
  backgroundColor: isavailablenow ? theme.palette.info.main : theme.palette.success.light,
  color: isavailablenow ? theme.palette.success.contrastText : theme.palette.text.primary,
  '&:hover': {
    backgroundColor: isavailablenow ? theme.palette.success.dark : theme.palette.success.main,
  },
}));

const VolunteerList = ({ volunteers, type }) => {
  const isCurrentlyAvailable = (timeSpan) => {
    if (!timeSpan) return false;

    const now = Moment(new Date(), 'America/Los_Angeles'); // Everything is going to be in PST - we don't want to get the user's local time

    timeSpan = timeSpan.replace(/.*?\(/g, '');
    timeSpan = timeSpan.replace(/\)/g, '');
    timeSpan = timeSpan.replace(/PST/g, '');
    timeSpan = timeSpan.replace(/p\s/g, 'pm');
    timeSpan = timeSpan.replace(/a\s/g, 'am');

    const [startTime, endTime] = timeSpan.split('-');    
    const startMoment = Moment(`${startTime}`, 'h:mma', 'America/Los_Angeles');
    const endMoment = Moment(`${endTime}`, 'h:mma', 'America/Los_Angeles');
    
    return now.isBetween(startMoment, endMoment);
  };

  const renderAvailability = (availability) => {
    if (!availability) return null;
    const availabilityArray = availability.split(', ');
    return (
      <Box mt={2}>
        <Typography variant="subtitle2" gutterBottom>
          Available Times:
        </Typography>
        {availabilityArray.map((time, index) => {
          const isAvailableNow = isCurrentlyAvailable(time);
          return (
            <Tooltip title={isAvailableNow ? <span style={{fontSize: "14px"}}>Available now (during the hackathon)!</span> : time} key={index}>
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
  };

  const renderVolunteerCard = (volunteer) => {
    const isMentor = type === "mentor";
    const isSelected = volunteer.isSelected;
    const googleDriveImage = volunteer.photoUrl?.includes("drive.google.com");
    let imageToDisplay = "https://cdn.ohack.dev/ohack.dev/logos/OpportunityHack_2Letter_Black.png"
    if(volunteer.photoUrl && !googleDriveImage){
      imageToDisplay = volunteer.photoUrl
    }

    if( !isSelected ) return null;

    return (
      <Grid item xs={12} sm={6} md={4} key={volunteer.name}>
        <VolunteerCard>
          <VolunteerMediaContainer>
            <VolunteerMedia
              key={volunteer.name}              
              image={imageToDisplay}
              title={volunteer.name}
            />
            {volunteer.isInPerson && <InPersonBadge>In-Person</InPersonBadge>}
          </VolunteerMediaContainer>
          <VolunteerContent>
            <Typography gutterBottom variant="h5" component="div">
              {volunteer.name}
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
            <Typography variant="subtitle1" color="text.secondary">
              {isMentor ? volunteer.company : volunteer.companyName}
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
              {isMentor && (
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
            <Typography variant="body2" paragraph sx={{ mt: 2 }}>
              {volunteer.shortBio || volunteer.shortBiography}
            </Typography>
            {isMentor && (
              <>
                <Typography variant="body2" paragraph>
                  <strong>Expertise:</strong> {volunteer.expertise}
                </Typography>
                {volunteer.softwareEngineeringSpecifics && (
                  <Typography variant="body2" paragraph>
                    <strong>Software Specifics:</strong>{" "}
                    {volunteer.softwareEngineeringSpecifics}
                  </Typography>
                )}
              </>
            )}
            {!isMentor && (
              <Typography variant="body2" paragraph>
                <strong>Why volunteering:</strong> {volunteer.whyJudge}
              </Typography>
            )}
            {isMentor && renderAvailability(volunteer.availability)}
          </VolunteerContent>
        </VolunteerCard>
      </Grid>
    );
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Our Amazing {type === "mentor" ? "Mentors" : "Judges"}
      </Typography>
      <Grid container spacing={3}>
        {volunteers && volunteers.map(renderVolunteerCard)}
      </Grid>
    </Box>
  );
};

export default VolunteerList;
