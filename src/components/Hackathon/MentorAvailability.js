import React, { useMemo, useState } from "react";
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
  Stack,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel
} from "@mui/material";
import { styled } from "@mui/system";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const CompactDateCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
}));

const TimeSlotCell = styled(TableCell)(({ theme, available }) => ({
  padding: theme.spacing(0.5, 1),
  textAlign: 'center',
  backgroundColor: available > 0 ? theme.palette.success.light : theme.palette.grey[100],
  color: available > 0 ? theme.palette.success.contrastText : theme.palette.text.secondary,
  border: `1px solid ${theme.palette.divider}`,
  fontSize: '0.75rem',
  minWidth: '60px',
}));

const MentorAvailability = ({ volunteers }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [expandedDates, setExpandedDates] = useState(new Set());
  const [showPastDates, setShowPastDates] = useState(false);
  const [compactView, setCompactView] = useState(true);

  // Helper function to check if a date is in the past
  const isPastDate = (dateString) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Parse various date formats
      let dateToCheck;
      if (dateString.includes(',')) {
        // Format: "Monday, Jan 15" or "Jan 15"
        const cleanDate = dateString.replace(/^\w+,\s*/, '');
        dateToCheck = new Date(cleanDate + ', ' + today.getFullYear());
      } else {
        // Try direct parsing
        dateToCheck = new Date(dateString + ', ' + today.getFullYear());
      }
      
      return dateToCheck < today;
    } catch (error) {
      return false; // If parsing fails, don't filter out
    }
  };

  const toggleDateExpansion = (date) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDates(newExpanded);
  };
  
  const availabilityData = useMemo(() => {
    // Group data by date
    const dateGroups = {};

    // Define time periods in order
    const timePeriods = [
      { emoji: '🌅', name: 'Early Morning', key: 'earlyMorning', short: 'Early' },
      { emoji: '☀️', name: 'Morning', key: 'morning', short: 'Morn' },
      { emoji: '🏙️', name: 'Afternoon', key: 'afternoon', short: 'Aft' },
      { emoji: '🌆', name: 'Evening', key: 'evening', short: 'Eve' },
      { emoji: '🌃', name: 'Night', key: 'night', short: 'Night' },
      { emoji: '🌙', name: 'Late Night', key: 'lateNight', short: 'Late' }
    ];

    // Process each volunteer
    volunteers.forEach((volunteer) => {
      if (volunteer.isSelected && volunteer.volunteer_type === "mentor") {
        if (volunteer?.availability) {
          const mentorId = volunteer.id || volunteer.email || volunteer.name;
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
                    dateGroups[datePart] = {
                      uniqueMentors: new Set(),
                      mentorDetails: new Map(),
                    };
                    timePeriods.forEach(period => {
                      dateGroups[datePart][period.key] = {
                        total: 0,
                        inPerson: 0,
                        remote: 0,
                        mentors: new Set(),
                        name: period.name,
                        emoji: period.emoji,
                        short: period.short
                      };
                    });
                  }
                  
                  // Add mentor to the day's unique mentors
                  dateGroups[datePart].uniqueMentors.add(mentorId);
                  dateGroups[datePart].mentorDetails.set(mentorId, {
                    name: volunteer.name,
                    isInPerson: volunteer.isInPerson
                  });
                  
                  // Map time period to key
                  const periodKey = timePeriods.find(p => p.name === timePeriod)?.key;
                  if (periodKey && dateGroups[datePart][periodKey]) {
                    dateGroups[datePart][periodKey].total++;
                    dateGroups[datePart][periodKey].mentors.add(mentorId);
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

    // Filter past dates unless explicitly shown
    const filteredDates = showPastDates ? sortedDates : sortedDates.filter(date => !isPastDate(date));

    return { dateGroups, sortedDates: filteredDates, timePeriods };
  }, [volunteers, showPastDates]);

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          Mentor Availability
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={compactView}
                onChange={(e) => setCompactView(e.target.checked)}
                size="small"
              />
            }
            label="Compact"
            sx={{ mr: 1 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={showPastDates}
                onChange={(e) => setShowPastDates(e.target.checked)}
                size="small"
              />
            }
            label="Show Past"
          />
        </Box>
      </Box>
      
      {totalMentors > 0 && (
        <Box sx={{ mb: 2, p: 1.5, backgroundColor: theme.palette.info.light, borderRadius: 1 }}>
          <Typography variant="body1" color="info.contrastText">
            📊 {totalMentors} Total Mentors Available
          </Typography>
        </Box>
      )}

      <Box sx={{ textAlign: "center", mt: 2, mb: 2 }}>
        <Button
          variant="contained"
          color="warning"
          href="https://opportunity-hack.slack.com/archives/C01E5CGDQ74"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ padding: theme.spacing(1, 3) }}
        >
          Join #ask-a-mentor Slack
        </Button>
      </Box>

      {sortedDates.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="h6" color="text.secondary">
            {showPastDates ? 'No mentor availability data yet' : 'No upcoming mentor availability'}
          </Typography>
        </Box>
      ) : (
        <Stack spacing={compactView ? 0.5 : 1}>
          {sortedDates.map((date) => {
            const dayData = dateGroups[date];
            const hasAnyAvailability = timePeriods.some(period => dayData[period.key].total > 0);
            
            if (!hasAnyAvailability) return null;
            
            const isExpanded = expandedDates.has(date);
            const totalSlots = timePeriods.reduce((sum, period) => sum + dayData[period.key].total, 0);
            const uniqueMentorCount = dayData.uniqueMentors.size;
            const isPast = isPastDate(date);
            
            return (
              <CompactDateCard key={date} elevation={1} sx={{ opacity: isPast ? 0.7 : 1 }}>
                <CardContent sx={{ p: compactView ? 1.5 : 2, '&:last-child': { pb: compactView ? 1.5 : 2 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant={compactView ? "body1" : "h6"} color="primary">
                        {isPast && '⏰ '}{date}
                      </Typography>
                      <Chip 
                        label={`${uniqueMentorCount} mentor${uniqueMentorCount !== 1 ? 's' : ''}`} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                      {totalSlots !== uniqueMentorCount && (
                        <Chip 
                          label={`${totalSlots} slots`} 
                          size="small" 
                          color="secondary" 
                          variant="outlined"
                        />
                      )}
                    </Box>
                    <IconButton
                      onClick={() => toggleDateExpansion(date)}
                      size="small"
                    >
                      {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Box>
                  
                  {compactView ? (
                    // Compact horizontal view
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            {timePeriods.map((period) => (
                              <TableCell key={period.key} align="center" sx={{ p: 0.5, fontSize: '0.7rem' }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                  <span>{period.emoji}</span>
                                  <span>{isMobile ? period.short : period.name}</span>
                                </Box>
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            {timePeriods.map((period) => {
                              const slotData = dayData[period.key];
                              const uniqueInPeriod = slotData.mentors.size;
                              return (
                                <TimeSlotCell
                                  key={period.key}
                                  available={uniqueInPeriod}
                                >
                                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                                      {uniqueInPeriod || '-'}
                                    </Typography>
                                    {slotData.total > uniqueInPeriod && (
                                      <Typography variant="caption" sx={{ fontSize: '0.6rem', opacity: 0.6 }}>
                                        ({slotData.total} slots)
                                      </Typography>
                                    )}
                                    {uniqueInPeriod > 0 && !isMobile && (
                                      <Typography variant="caption" sx={{ fontSize: '0.6rem', opacity: 0.8 }}>
                                        {slotData.inPerson > 0 && `👥${slotData.inPerson}`}
                                        {slotData.inPerson > 0 && slotData.remote > 0 && ' '}
                                        {slotData.remote > 0 && `💻${slotData.remote}`}
                                      </Typography>
                                    )}
                                  </Box>
                                </TimeSlotCell>
                              );
                            })}
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    // Original chip view - showing unique mentors per period
                    <Grid container spacing={1} alignItems="center">
                      {timePeriods.map((period) => {
                        const slotData = dayData[period.key];
                        const uniqueInPeriod = slotData.mentors.size;
                        if (uniqueInPeriod === 0) return null;
                        
                        return (
                          <Grid item key={period.key}>
                            <Chip
                              icon={<span>{period.emoji}</span>}
                              label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Typography variant="caption" component="span">
                                    {isMobile ? period.short : period.name}
                                  </Typography>
                                  <Typography variant="caption" component="span" sx={{ fontWeight: 'bold' }}>
                                    ({uniqueInPeriod})
                                  </Typography>
                                  {slotData.total > uniqueInPeriod && (
                                    <Typography variant="caption" component="span" sx={{ opacity: 0.7 }}>
                                      •{slotData.total}s
                                    </Typography>
                                  )}
                                  {!isMobile && (slotData.inPerson > 0 || slotData.remote > 0) && (
                                    <Typography variant="caption" component="span" sx={{ ml: 0.5, opacity: 0.8 }}>
                                      {slotData.inPerson > 0 && `👥${slotData.inPerson}`}
                                      {slotData.inPerson > 0 && slotData.remote > 0 && ' '}
                                      {slotData.remote > 0 && `💻${slotData.remote}`}
                                    </Typography>
                                  )}
                                </Box>
                              }
                              sx={{ 
                                backgroundColor: theme.palette.success.light,
                                color: theme.palette.success.contrastText 
                              }}
                              size="small"
                            />
                          </Grid>
                        );
                      })}
                    </Grid>
                  )}
                  
                  <Collapse in={isExpanded}>
                    <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Legend: 👥 In-Person • 💻 Remote • Numbers show unique mentors • "s" = total slots
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Available mentors: {Array.from(dayData.uniqueMentors).map(mentorId => {
                          const details = dayData.mentorDetails.get(mentorId);
                          return details?.name || mentorId;
                        }).join(', ')}
                      </Typography>
                    </Box>
                  </Collapse>
                </CardContent>
              </CompactDateCard>
            );
          })}
        </Stack>
      )}
    </StyledPaper>
  );
};

export default MentorAvailability;
