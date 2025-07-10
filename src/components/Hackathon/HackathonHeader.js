import React from "react";
import { Typography, Paper, Grid, Chip, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Moment from "moment";
import ReactMarkdown from "react-markdown";

const HeaderContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(5),
  marginBottom: theme.spacing(3),
  backgroundImage: "linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)",
  color: theme.palette.getContrastText("#8fd3f4"),
  minHeight: '220px', // Fixed height to prevent layout shift
  display: 'flex',
  flexDirection: 'column',
}));

const EventTitle = styled(Typography)(({ theme }) => ({
  fontWeight: "bold",
  marginBottom: theme.spacing(2),
  fontSize: {
    xs: '1.75rem',
    sm: '2.25rem',
    md: '2.5rem'
  },
  lineHeight: 1.2
}));

const EventInfo = styled(Grid)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const EventChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: "rgba(255, 255, 255, 0.7)",
  color: theme.palette.getContrastText("rgba(255, 255, 255, 0.7)"),
  fontSize: "0.875rem",
  height: '32px',
  '& .MuiChip-icon': {
    color: theme.palette.primary.main
  }
}));

const DescriptionContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  '& p': {
    marginBottom: theme.spacing(1.5),
    fontSize: '1rem',
    lineHeight: 1.6
  }
}));

const HackathonHeader = ({
  title,
  startDate,
  endDate,
  location,
  description,
}) => {
  const formatDate = (date) => Moment(date).format("MMM Do YYYY");
  const formatDateISO = (date) => Moment(date).format("YYYY-MM-DD");

  return (
    <HeaderContainer 
      elevation={3} 
      component="header" 
      role="banner"
      itemScope
      itemType="https://schema.org/Event"
    >
      <EventTitle 
        variant="h2" 
        component="h1" 
        mt={5}
        itemProp="name"
      >
        {title}
      </EventTitle>

      <EventInfo container spacing={2} alignItems="center">
        <Grid item>
          <EventChip
            icon={<CalendarTodayIcon />}
            label={
              <span>
                <time 
                  dateTime={formatDateISO(startDate)} 
                  itemProp="startDate"
                >
                  {formatDate(startDate)}
                </time>
                {" - "}
                <time 
                  dateTime={formatDateISO(endDate)} 
                  itemProp="endDate"
                >
                  {formatDate(endDate)}
                </time>
              </span>
            }
            aria-label={`Event dates: ${formatDate(startDate)} to ${formatDate(endDate)}`}
          />
        </Grid>
        <Grid item>
          <EventChip
            icon={<LocationOnIcon />}
            label={<span itemProp="location">{location}</span>}
            aria-label={`Event location: ${location}`}
          />
        </Grid>
      </EventInfo>

      <DescriptionContainer itemProp="description">
        <Typography 
          component="div" 
          className="event-description"
          role="article"
          aria-label="Event description"
        >
          <ReactMarkdown>{description}</ReactMarkdown>
        </Typography>
      </DescriptionContainer>
    </HeaderContainer>
  );
};

export default HackathonHeader;
