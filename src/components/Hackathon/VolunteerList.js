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
  Badge,
  useMediaQuery,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import WorkIcon from "@mui/icons-material/Work";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import CodeIcon from "@mui/icons-material/Code";

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
  color: theme.palette.info.contrastText,
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

const AvailabilityChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: theme.palette.success.light,
}));

const VolunteerList = ({ volunteers, type }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const renderAvailability = (availability) => {
    if (!availability) return null;
    const availabilityArray = availability.split(", ");
    return (
      <Box mt={2}>
        <Typography variant="subtitle2" gutterBottom>
          Available Times:
        </Typography>
        {availabilityArray.map((time, index) => (
          <AvailabilityChip
            key={index}
            icon={<AccessTimeIcon />}
            label={time}
            size="small"
          />
        ))}
      </Box>
    );
  };

  const renderVolunteerCard = (volunteer) => {
    const isMentor = type === "mentor";
    const isInPerson =
      volunteer["Joining us in-person at ASU Tempe?"] === "Yes!";
    const pronouns = volunteer["Your pronouns (Optional)"];
    const softwareSpecifics = volunteer["Software Engineering Specifics"];

    return (
      <Grid item xs={12} sm={6} md={4} key={volunteer["Email Address"]}>
        <VolunteerCard>
          <VolunteerMediaContainer>
            <VolunteerMedia
              image={
                volunteer["Can you send us a picture of you? (Optional)"] ||
                "https://via.placeholder.com/150"
              }
              title={volunteer["Your Name"]}
            />
            {isInPerson && <InPersonBadge>In-Person</InPersonBadge>}
            {!isInPerson && <RemoteBadge>Remote</RemoteBadge>}
          </VolunteerMediaContainer>
          <VolunteerContent>
            <Typography gutterBottom variant="h5" component="div">
              {volunteer["Your Name"]}
              {pronouns && (
                <Tooltip title="Pronouns">
                  <Chip
                    icon={<PersonIcon />}
                    label={pronouns}
                    size="small"
                    style={{ marginLeft: "8px" }}
                  />
                </Tooltip>
              )}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {isMentor
                ? volunteer["What company are you working for?"]
                : volunteer["Your title"]}
            </Typography>
            <ChipContainer>
              {volunteer["What company are you working for?"] && (
                <Chip
                  icon={<WorkIcon />}
                  label={volunteer["What company are you working for?"]}
                  size="small"
                />
              )}
              {volunteer["Which state are you in?"] && (
                <Chip
                  icon={<LocationOnIcon />}
                  label={volunteer["Which state are you in?"]}
                  size="small"
                />
              )}
              {isMentor && (
                <Chip
                  icon={<VolunteerActivismIcon />}
                  label={`${volunteer["How many times have you participated in Opportunity Hack?"]}`}
                  size="small"
                />
              )}
              {volunteer["LinkedIn Profile (Optional)"] && (
                <Link
                  href={volunteer["LinkedIn Profile (Optional)"]}
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
              {isMentor
                ? volunteer["Short bio (Optional)"]
                : volunteer["A (short) biography - aim for 200 words"]}
            </Typography>
            {isMentor && (
              <>
                <Typography variant="body2" paragraph>
                  <strong>Expertise:</strong>{" "}
                  {
                    volunteer[
                      "What kind of brain power can you help supply us with?"
                    ]
                  }
                </Typography>
                {softwareSpecifics && (
                  <Typography variant="body2" paragraph>
                    <strong>Software Specifics:</strong> {softwareSpecifics}
                  </Typography>
                )}
              </>
            )}
            {!isMentor && (
              <Typography variant="body2" paragraph>
                <strong>Why volunteering:</strong>{" "}
                {
                  volunteer[
                    "Why do you want to be a judge for Opportunity Hack?"
                  ]
                }
              </Typography>
            )}
            {isMentor &&
              renderAvailability(
                volunteer["Which days will be you available?"]
              )}
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
        {volunteers.map(renderVolunteerCard)}
      </Grid>
    </Box>
  );
};

export default VolunteerList;
