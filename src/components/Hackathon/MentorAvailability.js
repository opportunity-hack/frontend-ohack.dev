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
  FormControlLabel,
  Avatar,
  Tooltip,
  Badge
} from "@mui/material";
import { styled } from "@mui/system";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PersonIcon from '@mui/icons-material/Person';
import ComputerIcon from '@mui/icons-material/Computer';
import GroupsIcon from '@mui/icons-material/Groups';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

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

const MentorCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(1),
  '&:hover': {
    boxShadow: theme.shadows[2],
  }
}));

const TimeSlotSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1.5),
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
}));

const MentorAvailability = ({ volunteers }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [expandedDates, setExpandedDates] = useState(new Set());
  const [showPastDates, setShowPastDates] = useState(false);
  const [compactView, setCompactView] = useState(true);

  // Helper function to extract expertise from volunteer data
  const extractExpertise = (volunteer) => {
    const expertise = [];
    
    // Check various fields for expertise information
    if (volunteer.skills) expertise.push(...volunteer.skills.split(',').map(s => s.trim()));
    if (volunteer.expertise) expertise.push(...volunteer.expertise.split(',').map(s => s.trim()));
    if (volunteer.technologies) expertise.push(...volunteer.technologies.split(',').map(s => s.trim()));
    if (volunteer.programming_languages) expertise.push(...volunteer.programming_languages.split(',').map(s => s.trim()));
    
    // Remove duplicates and empty strings
    return [...new Set(expertise.filter(e => e && e.length > 0))];
  };

  // Helper function to get mentor initials for avatar
  const getMentorInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

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
          const mentorExpertise = extractExpertise(volunteer);
          const isCheckedIn = volunteer.checkedIn === true;
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
                        checkedIn: 0,
                        mentors: new Set(),
                        mentorList: [],
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
                    isInPerson: volunteer.isInPerson,
                    expertise: mentorExpertise,
                    email: volunteer.email,
                    company: volunteer.company,
                    isCheckedIn: isCheckedIn
                  });
                  
                  // Map time period to key
                  const periodKey = timePeriods.find(p => p.name === timePeriod)?.key;
                  if (periodKey && dateGroups[datePart][periodKey]) {
                    dateGroups[datePart][periodKey].total++;
                    dateGroups[datePart][periodKey].mentors.add(mentorId);
                    dateGroups[datePart][periodKey].mentorList.push({
                      id: mentorId,
                      name: volunteer.name,
                      isInPerson: volunteer.isInPerson,
                      expertise: mentorExpertise,
                      email: volunteer.email,
                      company: volunteer.company,
                      isCheckedIn: isCheckedIn
                    });
                    if (volunteer.isInPerson) {
                      dateGroups[datePart][periodKey].inPerson++;
                    } else {
                      dateGroups[datePart][periodKey].remote++;
                    }
                    if (isCheckedIn) {
                      dateGroups[datePart][periodKey].checkedIn++;
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
          dateB = parseInt(dayMatchA[2], 10);
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

  const renderMentorCard = (mentor) => (
    <MentorCard key={mentor.id} variant="outlined">
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              mentor.isCheckedIn ? (
                <CheckCircleIcon 
                  sx={{ 
                    color: theme.palette.success.main, 
                    fontSize: '16px',
                    backgroundColor: 'white',
                    borderRadius: '50%'
                  }} 
                />
              ) : null
            }
          >
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: mentor.isInPerson ? theme.palette.primary.main : theme.palette.secondary.main,
                fontSize: '0.875rem'
              }}
            >
              {getMentorInitials(mentor.name)}
            </Avatar>
          </Badge>
          
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {mentor.name}
                {mentor.isCheckedIn && (
                  <Chip
                    label="Checked In"
                    size="small"
                    color="success"
                    variant="filled"
                    sx={{ ml: 1, fontSize: '0.6rem', height: '18px' }}
                  />
                )}
              </Typography>
              <Tooltip title={mentor.isInPerson ? "Available In-Person" : "Available Remote"}>
                <Chip
                  icon={mentor.isInPerson ? <GroupsIcon /> : <ComputerIcon />}
                  label={mentor.isInPerson ? "In-Person" : "Remote"}
                  size="small"
                  color={mentor.isInPerson ? "primary" : "secondary"}
                  variant="outlined"
                />
              </Tooltip>
            </Box>
            
            {mentor.company && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                {mentor.company}
              </Typography>
            )}
            
            {mentor.expertise && mentor.expertise.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {mentor.expertise.slice(0, isMobile ? 2 : 4).map((skill, idx) => (
                  <Chip
                    key={idx}
                    label={skill}
                    size="small"
                    variant="outlined"
                    sx={{ 
                      fontSize: '0.65rem',
                      height: '20px',
                      '& .MuiChip-label': { px: 1 }
                    }}
                  />
                ))}
                {mentor.expertise.length > (isMobile ? 2 : 4) && (
                  <Tooltip title={mentor.expertise.slice(isMobile ? 2 : 4).join(', ')}>
                    <Chip
                      label={`+${mentor.expertise.length - (isMobile ? 2 : 4)}`}
                      size="small"
                      variant="filled"
                      color="info"
                      sx={{ 
                        fontSize: '0.65rem',
                        height: '20px',
                        '& .MuiChip-label': { px: 1 }
                      }}
                    />
                  </Tooltip>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>
    </MentorCard>
  );

  return (
    <StyledPaper elevation={3}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500, color: "var(--ink, #16181D)" }}>
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
        <Box sx={{ mb: 2, p: 1.5, backgroundColor: "var(--surface-2, #F4F1E9)", border: "1px solid var(--line, #E7E1D4)", borderLeft: "3px solid var(--accent, #E2552E)", borderRadius: 2 }}>
          <Typography variant="body1" sx={{ color: "var(--ink, #16181D)", fontWeight: 600 }}>
            {totalMentors} total mentors available
          </Typography>
        </Box>
      )}

      <Box sx={{ textAlign: "center", mt: 2, mb: 2 }}>
        <Button
          variant="contained"
          disableElevation
          href="https://opportunity-hack.slack.com/archives/C01E5CGDQ74"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ padding: theme.spacing(1.1, 3), textTransform: "none", fontWeight: 600, borderRadius: "5px", backgroundColor: "var(--brand, #1B3A6B)", color: "#fff", boxShadow: "none", "&:hover": { backgroundColor: "#16315a", boxShadow: "none" } }}
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
            const checkedInCount = Array.from(dayData.uniqueMentors).filter(mentorId => 
              dayData.mentorDetails.get(mentorId)?.isCheckedIn
            ).length;
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
                      {checkedInCount > 0 && (
                        <Chip 
                          icon={<CheckCircleIcon />}
                          label={`${checkedInCount} checked in`} 
                          size="small" 
                          color="success" 
                          variant="outlined"
                        />
                      )}
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
                                        {slotData.checkedIn > 0 && ` ✅${slotData.checkedIn}`}
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
                    // Enhanced expanded view with mentor details
                    <Box>
                      {timePeriods.map((period) => {
                        const slotData = dayData[period.key];
                        if (slotData.mentorList.length === 0) return null;
                        
                        return (
                          <TimeSlotSection key={period.key}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <span>{period.emoji}</span>
                                {period.name}
                              </Typography>
                              <Chip
                                label={`${slotData.mentors.size} mentor${slotData.mentors.size !== 1 ? 's' : ''}`}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                              {slotData.checkedIn > 0 && (
                                <Chip
                                  icon={<CheckCircleIcon />}
                                  label={`${slotData.checkedIn} checked in`}
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                />
                              )}
                              {slotData.inPerson > 0 && (
                                <Chip
                                  icon={<GroupsIcon />}
                                  label={`${slotData.inPerson} in-person`}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              )}
                              {slotData.remote > 0 && (
                                <Chip
                                  icon={<ComputerIcon />}
                                  label={`${slotData.remote} remote`}
                                  size="small"
                                  color="secondary"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                            
                            <Grid container spacing={1}>
                              {slotData.mentorList.map((mentor, idx) => (
                                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={`${mentor.id}-${idx}`}>
                                  {renderMentorCard(mentor)}
                                </Grid>
                              ))}
                            </Grid>
                          </TimeSlotSection>
                        );
                      })}
                    </Box>
                  )}
                  
                  <Collapse in={isExpanded}>
                    <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Legend: 👥 In-Person • 💻 Remote • ✅ Checked In • Numbers show unique mentors • "s" = total slots
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
