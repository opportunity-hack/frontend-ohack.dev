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
        // Handle availability as a comma-separated string
        if (volunteer?.availability) {
          // More careful splitting to handle "Monday, May 12:" format
          // We need to split on ", " but only when it's followed by a time/emoji pattern
          // Use a more sophisticated split that looks for the pattern: ", [Weekday] [Month] [Day]:"
          
          const slots = [];
          let currentSlot = "";
          const parts = volunteer.availability.split(", ");
          
          for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            
            // Check if this part starts a new time slot (contains weekday pattern or emoji)
            const startsNewSlot = /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|\w+ \w+ \d+:|🌅|☀️|🏙️|🌆|🌃|🌙)/.test(part);
            
            if (startsNewSlot && currentSlot) {
              // We found a new slot, save the current one
              slots.push(currentSlot.trim());
              currentSlot = part;
            } else if (currentSlot) {
              // Continue building current slot
              currentSlot += ", " + part;
            } else {
              // First slot
              currentSlot = part;
            }
          }
          
          // Don't forget the last slot
          if (currentSlot) {
            slots.push(currentSlot.trim());
          }
          
          console.log("Raw availability:", volunteer.availability);
          console.log("Carefully split slots:", slots);
          
          slots.forEach((slot) => {
            if (slot) {
              // Filter out slots that don't contain time information (emojis and time periods)
              const hasTimeInfo = /🌅|☀️|🏙️|🌆|🌃|🌙/.test(slot) && 
                                  /(Early Morning|Morning|Afternoon|Evening|Night|Late Night)/.test(slot);
              
              if (hasTimeInfo) {
                console.log("Processing slot:", slot); // Debug log
                console.log("Slot will be stored as key:", slot); // Debug what gets stored
                
                // If this is the first time we've seen this slot, initialize counters
                if (!totalCounts[slot]) {
                  totalCounts[slot] = 0;
                  inPersonCounts[slot] = 0;
                  remoteCounts[slot] = 0;
                  console.log("Created new slot key:", slot); // Debug new keys
                }
                
                // Increment counters
                totalCounts[slot]++;
                
                if (volunteer.isInPerson) {
                  inPersonCounts[slot]++;
                } else {
                  remoteCounts[slot]++;
                }
              }
            }
          });
        }
      }
    });

    console.log("Final totalCounts keys:", Object.keys(totalCounts)); // Debug final keys
    
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
      // Handle both formats:
      // "Friday Oct 10: 🌅 Early Morning (7am - 9am PST)"
      // "Monday, May 12: 🌅 Early Morning (7am - 9am PST)"
      // "May 12: 🌅 Early Morning (7am - 9am PST)" (missing day name)
      
      // Extract the full date part before the colon
      const fullDayA = a.split(":")[0]?.trim(); // "Friday Oct 10" or "Monday, May 12" or "May 12"
      const fullDayB = b.split(":")[0]?.trim(); // "Friday Oct 10" or "Monday, May 12" or "May 12"
      
      console.log("Sorting comparison:", fullDayA, "vs", fullDayB); // Debug log
      
      // Extract date parts for comparison - handle both formats properly
      // Pattern 1: "Monday, May 12" (with comma)
      // Pattern 2: "Friday Oct 10" (no comma)
      // Pattern 3: "May 12" (missing day name)
      let dayMatchA = fullDayA.match(/(\w+),\s+(\w+)\s+(\d+)/) || // "Monday, May 12"
                      fullDayA.match(/(\w+)\s+(\w+)\s+(\d+)/) ||   // "Friday Oct 10"
                      fullDayA.match(/(\w+)\s+(\d+)/);             // "May 12"
                      
      let dayMatchB = fullDayB.match(/(\w+),\s+(\w+)\s+(\d+)/) || // "Monday, May 12"
                      fullDayB.match(/(\w+)\s+(\w+)\s+(\d+)/) ||   // "Friday Oct 10"
                      fullDayB.match(/(\w+)\s+(\d+)/);             // "May 12"
      
      if (dayMatchA && dayMatchB) {
        // Determine the format and extract month/date accordingly
        let monthA, monthB, dateA, dateB;
        
        if (dayMatchA.length === 4) {
          // Format: "Monday, May 12" or "Friday Oct 10"
          monthA = dayMatchA[2];
          dateA = parseInt(dayMatchA[3], 10);
        } else {
          // Format: "May 12"
          monthA = dayMatchA[1];
          dateA = parseInt(dayMatchA[2], 10);
        }
        
        if (dayMatchB.length === 4) {
          // Format: "Monday, May 12" or "Friday Oct 10"
          monthB = dayMatchB[2];
          dateB = parseInt(dayMatchB[3], 10);
        } else {
          // Format: "May 12"
          monthB = dayMatchB[1];
          dateB = parseInt(dayMatchB[2], 10);
        }
        
        // Define month order based on calendar year
        const monthOrder = {
          "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6,
          "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12,
          // Handle common abbreviations
          "January": 1, "February": 2, "March": 3, "April": 4, "June": 6,
          "July": 7, "August": 8, "September": 9, "October": 10, "November": 11, "December": 12
        };
        
        const monthOrderA = monthOrder[monthA] || 0;
        const monthOrderB = monthOrder[monthB] || 0;
        
        // First compare by month
        if (monthOrderA !== monthOrderB) {
          return monthOrderA - monthOrderB;
        }
        
        // Then compare by day number
        if (!isNaN(dateA) && !isNaN(dateB) && dateA !== dateB) {
          return dateA - dateB;
        }
      }
      
      // If dates are the same, compare by day of week (if available)
      const dayA = a.split(/[,:]/)[0]?.trim().split(" ")[0]; // "Friday" or "Monday"
      const dayB = b.split(/[,:]/)[0]?.trim().split(" ")[0]; // "Friday" or "Monday"
      
      const dayOrderA = dayOrder[dayA] || 99;
      const dayOrderB = dayOrder[dayB] || 99;
      
      if (dayOrderA !== dayOrderB) {
        return dayOrderA - dayOrderB;
      }
      
      // Finally, if everything else is the same, sort by time period
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
