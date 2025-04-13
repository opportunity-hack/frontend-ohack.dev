import React from "react";
import { Typography, Paper, Grid, Chip } from "@mui/material";
import { styled } from "@mui/material/styles";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Moment from "moment";
import ReactMarkdown from "react-markdown";

const HeaderContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(10),
  marginBottom: theme.spacing(3),
  backgroundImage: "linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)",
  color: theme.palette.getContrastText("#8fd3f4"),
}));

const EventTitle = styled(Typography)(({ theme }) => ({
  fontWeight: "bold",
  marginBottom: theme.spacing(2),
}));

const EventInfo = styled(Grid)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const EventChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: "rgba(255, 255, 255, 0.7)",
  color: theme.palette.getContrastText("rgba(255, 255, 255, 0.7)"),
}));

const HackathonHeader = ({
  title,
  startDate,
  endDate,
  location,
  description,
}) => {
  const formatDate = (date) => Moment(date).format("MMM Do YYYY");

  return (
    <HeaderContainer elevation={3}>
      <EventTitle variant="h3" component="h1">
        {title}
      </EventTitle>

      <EventInfo container spacing={2} alignItems="center">
        <Grid item>
          <EventChip
            icon={<CalendarTodayIcon />}
            label={`${formatDate(startDate)} - ${formatDate(endDate)}`}
            style={{ fontSize: "14px" }}
          />
        </Grid>
        <Grid item>
          <EventChip
            icon={<LocationOnIcon />}
            label={location}
            style={{ fontSize: "14px" }}
          />
        </Grid>
      </EventInfo>

      <Typography variant="body1" paragraph>
        <ReactMarkdown>{description}</ReactMarkdown>
      </Typography>
    </HeaderContainer>
  );
};

export default HackathonHeader;
