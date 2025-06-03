import React, { useMemo } from "react";
import {
  Typography,
  Paper,
  useTheme,
  useMediaQuery,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Divider,
  Stack
} from "@mui/material";
import { styled } from "@mui/system";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const DateCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
}));

const TimeSlotChip = styled(Chip)(({ theme, available }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: available > 0 ? theme.palette.success.light : theme.palette.grey[200],
  color: available > 0 ? theme.palette.success.contrastText : theme.palette.text.secondary,
  '&:hover': {
    backgroundColor: available > 0 ? theme.palette.success.main : theme.palette.grey[300],
  }
}));

const MentorAvailability = ({ volunteers }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  const availabilityData = useMemo(() => {
    // Group data by date
    const dateGroups = {};

    // Define time periods in order
    const timePeriods = [
      { emoji: '🌅', name: 'Early Morning', key: 'earlyMorning' },
      { emoji: '☀️', name: 'Morning', key: 'morning' },
      { emoji: '🏙️', name: 'Afternoon', key: 'afternoon' },
      { emoji: '🌆', name: 'Evening', key: 'evening' },
      { emoji: '🌃', name: 'Night', key: 'night' },
      { emoji: '🌙', name: 'Late Night', key: 'lateNight' }
    ];

    // Process each volunteer
    volunteers.forEach((volunteer) => {
      if (volunteer.isSelected && volunteer.volunteer_type === "mentor") {
        if (volunteer?.availability) {
          const slots = [];
          let currentSlot = "";
          const parts = volunteer.availability.split(", ");
          
          for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const startsNewSlot = /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|\w+ \w+ \d+:|🌅|☀️|🏙️|🌆|🌃|🌙)/.test(part);
            
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
          
          slots.forEach((slot) => {
            if (slot) {
              const hasTimeInfo = /🌅|☀️|🏙️|🌆|🌃|🌙/.test(slot) && 
                                  /(Early Morning|Morning|Afternoon|Evening|Night|Late Night)/.test(slot);
              
              if (hasTimeInfo) {
                // Extract date part (everything before the colon)
                const datePart = slot.split(":")[0]?.trim();
                
                // Extract time period
                const timePeriodMatch = slot.match(/🌅\s+(Early Morning)|☀️\s+(Morning)|🏙️\s+(Afternoon)|🌆\s+(Evening)|🌃\s+(Night)|🌙\s+(Late Night)/);
                const timePeriod = timePeriodMatch ? 
                  (timePeriodMatch[1] || timePeriodMatch[2] || timePeriodMatch[3] || 
                   timePeriodMatch[4] || timePeriodMatch[5] || timePeriodMatch[6]) : "";
                
                if (datePart && timePeriod) {
                  if (!dateGroups[datePart]) {
                    dateGroups[datePart] = {};
                    timePeriods.forEach(period => {
                      dateGroups[datePart][period.key] = {
                        total: 0,
                        inPerson: 0,
                        remote: 0,
                        name: period.name,
                        emoji: period.emoji
                      };
                    });
                  }
                  
                  // Map time period to key
                  const periodKey = timePeriods.find(p => p.name === timePeriod)?.key;
                  if (periodKey && dateGroups[datePart][periodKey]) {
                    dateGroups[datePart][periodKey].total++;
                    if (volunteer.isInPerson) {
                      dateGroups[datePart][periodKey].inPerson++;
                    } else {
                      dateGroups[datePart][periodKey].remote++;
                    }
                  }
                }
              }
            }
          });
        }
      }
    });

    // Sort dates
    const sortedDates = Object.keys(dateGroups).sort((a, b) => {
      // ...existing sorting logic...
      const fullDayA = a.trim();
      const fullDayB = b.trim();
      
      let dayMatchA = fullDayA.match(/(\w+),\s+(\w+)\s+(\d+)/) || 
                      fullDayA.match(/(\w+)\s+(\w+)\s+(\d+)/) ||   
                      fullDayA.match(/(\w+)\s+(\d+)/);             
                      
      let dayMatchB = fullDayB.match(/(\w+),\s+(\w+)\s+(\d+)/) || 
                      fullDayB.match(/(\w+)\s+(\w+)\s+(\d+)/) ||   
                      fullDayB.match(/(\w+)\s+(\d+)/);             
      
      if (dayMatchA && dayMatchB) {
        let monthA, monthB, dateA, dateB;
        
        if (dayMatchA.length === 4) {
          monthA = dayMatchA[2];
          dateA = parseInt(dayMatchA[3], 10);
        } else {
          monthA = dayMatchA[1];
          dateA = parseInt(dayMatchA[2], 10);
        }
        
        if (dayMatchB.length === 4) {
          monthB = dayMatchB[2];
          dateB = parseInt(dayMatchB[3], 10);
        } else {
          monthB = dayMatchB[1];
          dateB = parseInt(dayMatchB[2], 10);
        }
        
        const monthOrder = {
          "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6,
          "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12,
          "January": 1, "February": 2, "March": 3, "April": 4, "June": 6,
          "July": 7, "August": 8, "September": 9, "October": 10, "November": 11, "December": 12
        };
        
        const monthOrderA = monthOrder[monthA] || 0;
        const monthOrderB = monthOrder[monthB] || 0;
        
        if (monthOrderA !== monthOrderB) {
          return monthOrderA - monthOrderB;
        }
        
        if (!isNaN(dateA) && !isNaN(dateB) && dateA !== dateB) {
          return dateA - dateB;
        }
      }
      
      return a.localeCompare(b);
    });

    return { dateGroups, sortedDates, timePeriods };
  }, [volunteers]);

  const { dateGroups, sortedDates, timePeriods } = availabilityData;

  // Calculate total mentors across all slots
  const totalMentors = useMemo(() => {
    const uniqueMentors = new Set();
    volunteers.forEach((volunteer) => {
      if (volunteer.isSelected && volunteer.volunteer_type === "mentor" && volunteer?.availability) {
        uniqueMentors.add(volunteer.id || volunteer.email || volunteer.name);
      }
    });
    return uniqueMentors.size;
  }, [volunteers]);

  return (
    <StyledPaper elevation={3}>
      <Typography variant="h5" gutterBottom>
        Mentor Availability
      </Typography>
      
      {totalMentors > 0 && (
        <Box sx={{ mb: 2, p: 2, backgroundColor: theme.palette.info.light, borderRadius: 1 }}>
          <Typography variant="h6" color="info.contrastText">
            📊 {totalMentors} Total Mentors Available
          </Typography>
        </Box>
      )}

      <Box sx={{ textAlign: "center", mt: 3, mb: 3 }}>
        <Button
          variant="contained"
          color="warning"
          href="https://opportunity-hack.slack.com/archives/C01E5CGDQ74"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ padding: theme.spacing(2, 4), fontSize: "1.2rem" }}
        >
          Join #ask-a-mentor Slack Channel
        </Button>
      </Box>

      {sortedDates.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No mentor availability data yet
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {sortedDates.map((date) => {
            const dayData = dateGroups[date];
            const hasAnyAvailability = timePeriods.some(period => dayData[period.key].total > 0);
            
            if (!hasAnyAvailability) return null;
            
            return (
              <DateCard key={date} elevation={1}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    {date}
                  </Typography>
                  
                  <Grid container spacing={1} alignItems="center">
                    {timePeriods.map((period) => {
                      const slotData = dayData[period.key];
                      if (slotData.total === 0) return null;
                      
                      return (
                        <Grid item key={period.key}>
                          <TimeSlotChip
                            icon={<span>{period.emoji}</span>}
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography variant="caption" component="span">
                                  {isMobile ? period.name.split(' ')[0] : period.name}
                                </Typography>
                                <Typography variant="caption" component="span" sx={{ fontWeight: 'bold' }}>
                                  ({slotData.total})
                                </Typography>
                                {!isMobile && (slotData.inPerson > 0 || slotData.remote > 0) && (
                                  <Typography variant="caption" component="span" sx={{ ml: 0.5, opacity: 0.8 }}>
                                    {slotData.inPerson > 0 && `👥${slotData.inPerson}`}
                                    {slotData.inPerson > 0 && slotData.remote > 0 && ' '}
                                    {slotData.remote > 0 && `💻${slotData.remote}`}
                                  </Typography>
                                )}
                              </Box>
                            }
                            available={slotData.total}
                            clickable
                            size={isMobile ? "small" : "medium"}
                          />
                        </Grid>
                      );
                    })}
                  </Grid>
                  
                  {!isMobile && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Legend: 👥 In-Person • 💻 Remote • (Total Available)
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total slots: {timePeriods.reduce((sum, period) => sum + dayData[period.key].total, 0)}
                        </Typography>
                      </Box>
                    </>
                  )}
                </CardContent>
              </DateCard>
            );
          })}
        </Stack>
      )}
    </StyledPaper>
  );
};

export default MentorAvailability;
