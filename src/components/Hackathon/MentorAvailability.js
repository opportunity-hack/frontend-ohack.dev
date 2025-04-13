import React, { useMemo } from "react";
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  useMediaQuery,
  Box,
  Button
} from "@mui/material";
import { styled } from "@mui/system";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: "bold",
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
}));

const MentorAvailability = ({ volunteers }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  const availabilityCount = useMemo(() => {
    // Initialize with empty counts
    const totalCounts = {};
    const inPersonCounts = {};
    const remoteCounts = {};

    // Process each volunteer
    volunteers.forEach((volunteer) => {
      if (volunteer.isSelected && volunteer.volunteer_type === "mentor") {
        // Handle new format where availability is a comma-separated string of displayText values
        if (volunteer?.availability) {
          // Use regex pattern to correctly split availability string with new format
          // New format: "Friday Oct 10: 🌅 Early Morning (7am - 9am PST)"
          const availabilityPattern = /([A-Za-z]+\s+[A-Za-z]+\s+\d+:\s+[^,]+)/g;
          
          // Try to match with regex first
          const matches = volunteer.availability.match(availabilityPattern);
          
          // If regex doesn't work, fall back to comma split
          const availabilityArray = matches || volunteer.availability.split(", ");
          
          // If availableArray exists in the new format directly
          const useAvailableDays = Array.isArray(volunteer.availableDays) && volunteer.availableDays.length > 0;
          
          // Use the appropriate array
          const slotsToProcess = useAvailableDays ? volunteer.availableDays : availabilityArray;
          
          console.log("Mentor Availability array:", slotsToProcess);
          
          slotsToProcess.forEach((slot) => {
            if (slot) {
              // For availableDays format, convert to display format
              let displaySlot = slot;
              
              if (useAvailableDays) {
                // Convert "Friday Oct 10-Early Morning" to display format
                const parts = slot.split('-');
                if (parts.length > 1) {
                  const day = parts[0]; // "Friday Oct 10"
                  const timeOfDay = parts[1]; // "Early Morning"
                  
                  // Map time of day to emoji
                  const emojiMap = {
                    "Early Morning": "🌅",
                    "Morning": "☀️",
                    "Afternoon": "🏙️",
                    "Evening": "🌆",
                    "Night": "🌃",
                    "Late Night": "🌙"
                  };
                  
                  const emoji = emojiMap[timeOfDay] || "";
                  displaySlot = `${day}: ${emoji} ${timeOfDay}`;
                }
              }
              
              // If this is the first time we've seen this slot, initialize counters
              if (!totalCounts[displaySlot]) {
                totalCounts[displaySlot] = 0;
                inPersonCounts[displaySlot] = 0;
                remoteCounts[displaySlot] = 0;
              }
              
              // Increment counters
              totalCounts[displaySlot]++;
              
              if (volunteer.isInPerson) {
                inPersonCounts[displaySlot]++;
              } else {
                remoteCounts[displaySlot]++;
              }
            }
          });
        }
      }
    });

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

    // Sort the slots by date and time for better display
    const sortedSlots = Object.keys(totalCounts).sort((a, b) => {
      // First extract day and time period
      // New format: "Friday Oct 10: 🌅 Early Morning" (no comma after day)
      // Old format: "Saturday, May 4: 🌅 Early Morning"
      
      // Extract the day name (before the first space)
      const dayA = a.split(" ")[0]?.trim(); // "Friday" or "Saturday"
      const dayB = b.split(" ")[0]?.trim(); // "Friday" or "Saturday"
      
      // Compare days of the week
      const dayOrderA = dayOrder[dayA] || 99;
      const dayOrderB = dayOrder[dayB] || 99;
      
      if (dayOrderA !== dayOrderB) {
        return dayOrderA - dayOrderB;
      }
      
      // For different days with same weekday but different dates
      // If they have the same day of week, compare the date values
      const fullDayA = a.split(":")[0]?.trim(); // "Friday Oct 10" or "Saturday, May 4"
      const fullDayB = b.split(":")[0]?.trim(); // "Friday Oct 10" or "Saturday, May 4"
      
      if (fullDayA !== fullDayB) {
        // Try to extract the date part, assuming format is "Day Month Number"
        const dayMatchA = fullDayA.match(/(\w+)\s+(\w+)\s+(\d+)/);
        const dayMatchB = fullDayB.match(/(\w+)\s+(\w+)\s+(\d+)/);
        
        if (dayMatchA && dayMatchB) {
          // Compare month names if available
          const monthA = dayMatchA[2];
          const monthB = dayMatchB[2];
          
          // Define month order
          const monthOrder = {
            "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6,
            "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12
          };
          
          const monthOrderA = monthOrder[monthA] || 0;
          const monthOrderB = monthOrder[monthB] || 0;
          
          if (monthOrderA !== monthOrderB) {
            return monthOrderA - monthOrderB;
          }
          
          // Compare day numbers if available
          const dateA = parseInt(dayMatchA[3], 10);
          const dateB = parseInt(dayMatchB[3], 10);
          
          if (!isNaN(dateA) && !isNaN(dateB)) {
            return dateA - dateB;
          }
        }
      }
      
      // If days are the same, parse time period
      const timePeriodRegexA = a.match(/🌅\s+(Early Morning)|☀️\s+(Morning)|🏙️\s+(Afternoon)|🌆\s+(Evening)|🌃\s+(Night)|🌙\s+(Late Night)/);
      const timePeriodRegexB = b.match(/🌅\s+(Early Morning)|☀️\s+(Morning)|🏙️\s+(Afternoon)|🌆\s+(Evening)|🌃\s+(Night)|🌙\s+(Late Night)/);
      
      const timePeriodA = timePeriodRegexA ? 
        (timePeriodRegexA[1] || timePeriodRegexA[2] || timePeriodRegexA[3] || 
         timePeriodRegexA[4] || timePeriodRegexA[5] || timePeriodRegexA[6]) : "";
      
      const timePeriodB = timePeriodRegexB ? 
        (timePeriodRegexB[1] || timePeriodRegexB[2] || timePeriodRegexB[3] || 
         timePeriodRegexB[4] || timePeriodRegexB[5] || timePeriodRegexB[6]) : "";
      
      const timeOrderA = timeOfDayOrder[timePeriodA] || 99;
      const timeOrderB = timeOfDayOrder[timePeriodB] || 99;
      
      return timeOrderA - timeOrderB;
    });

    // Return totalCounts, remoteCounts, inPersonCounts, and sortedSlots
    return {
      totalCounts,
      remoteCounts,
      inPersonCounts,
      sortedSlots
    };
  }, [volunteers]);

  return (
    <StyledPaper elevation={3}>
      <Typography variant="h5" gutterBottom>
        Mentor Availability
      </Typography>
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
      <TableContainer>
        <Table size={isMobile ? "small" : "medium"}>
          <TableHead>
            <TableRow>
              <StyledTableCell>Timeslot</StyledTableCell>
              <StyledTableCell align="right">Total Available Mentors</StyledTableCell>
              <StyledTableCell align="right">In-Person</StyledTableCell>
              <StyledTableCell align="right">Remote</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {availabilityCount.sortedSlots && availabilityCount.sortedSlots.map((slot) => (
              <TableRow key={slot}>
                <TableCell component="th" scope="row">
                  {slot}
                </TableCell>
                <TableCell align="right">{availabilityCount.totalCounts[slot]}</TableCell>
                <TableCell align="right">{availabilityCount.inPersonCounts[slot]}</TableCell>
                <TableCell align="right">{availabilityCount.remoteCounts[slot]}</TableCell>
              </TableRow>
            ))}
            {(!availabilityCount.sortedSlots || availabilityCount.sortedSlots.length === 0) && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No mentor availability data yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </StyledPaper>
  );
};

export default MentorAvailability;
