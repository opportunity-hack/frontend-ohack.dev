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
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
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

const VolunteerList = ({ volunteers, type }) => {
  const isCurrentlyAvailable = (timeSpan) => {
    if (!timeSpan) return false;

    const now = Moment(new Date(), "America/Los_Angeles"); // Everything is going to be in PST - we don't want to get the user's local time

    timeSpan = timeSpan.replace(/.*?\(/g, "");
    timeSpan = timeSpan.replace(/\)/g, "");
    timeSpan = timeSpan.replace(/PST/g, "");
    timeSpan = timeSpan.replace(/p\s/g, "pm");
    timeSpan = timeSpan.replace(/a\s/g, "am");

    const [startTime, endTime] = timeSpan.split("-");
    const startMoment = Moment(`${startTime}`, "h:mma", "America/Los_Angeles");
    const endMoment = Moment(`${endTime}`, "h:mma", "America/Los_Angeles");

    return now.isBetween(startMoment, endMoment);
  };

  const renderArtifacts = (artifacts) => {
    if (!artifacts || artifacts.length === 0) return null;
    return (
      <Box mt={2}>
        <Typography variant="subtitle2" gutterBottom>
          Contributions:
        </Typography>
        <ArtifactList>
          {artifacts.map((artifact, index) => (
            <ArtifactListItem key={index}>
              <ListItemIcon>
                {artifact.type === 'pull_request' && <CodeIcon />}
                {artifact.type === 'issue' && <BugReportIcon />}
                {artifact.type === 'coordination' && <ForumIcon />}
                {artifact.type === 'user_experience' && <DesignServicesIcon />}
                {artifact.type === 'standup' && <AccessTimeIcon />}
              </ListItemIcon>
              <ListItemText
                primary={artifact.label}
                secondary={
                  <>
                    {artifact.comment}
                    {artifact.url && artifact.url.length > 0 && (
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
    if (!availability) return null;
    const availabilityArray = availability.split(", ");
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
  };

   const renderVolunteerCard = (volunteer) => {
    const isMentor = type === "mentor";
    const isJudge = type === "judge";
    const isVolunteer = type === "volunteer";
    const isSelected = volunteer.isSelected;
    const googleDriveImage = volunteer.photoUrl?.includes("drive.google.com");
    let imageToDisplay =
      "https://cdn.ohack.dev/ohack.dev/logos/OpportunityHack_2Letter_Black.png";
    if (volunteer.photoUrl && !googleDriveImage) {
      imageToDisplay = volunteer.photoUrl;
    }

    if (!isSelected) return null;

    return (
      <Grid item xs={12} sm={6} md={4} key={volunteer.name}>
        <VolunteerCard>
          <VolunteerMediaContainer>
            <VolunteerMedia
              key={volunteer.name}
              image={imageToDisplay}
              title={volunteer.name}
            />
            {volunteer.isInPerson ? <InPersonBadge>In-Person</InPersonBadge> : <RemoteBadge>Remote</RemoteBadge>}
          </VolunteerMediaContainer>
          <VolunteerContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
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
              <ShareVolunteer volunteer={volunteer} type={type} />
            </Box>
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
            <Typography variant="body1" paragraph sx={{ mt: 2 }}>
              {volunteer.shortBio || volunteer.shortBiography}
            </Typography>
            {isMentor && (
              <>
                <Typography variant="body1" paragraph>
                  <strong>Expertise:</strong> {volunteer.expertise}
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
            {isJudge && (
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
      <Grid container spacing={3}>
        {volunteers && volunteers.map(renderVolunteerCard)}
      </Grid>
    </Box>
  );
};

export default VolunteerList;
