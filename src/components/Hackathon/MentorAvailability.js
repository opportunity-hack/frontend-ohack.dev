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
          const availabilityArray = volunteer.availability.split(", ");
          
          availabilityArray.forEach((slot) => {
            // Extract the display text from the slot
            // Expected format: "Saturday, May 4: 🌅 Early Morning (7am - 9am PST)"
            if (slot) {
              // If this is the first time we've seen this slot, initialize counters
              if (!totalCounts[slot]) {
                totalCounts[slot] = 0;
                inPersonCounts[slot] = 0;
                remoteCounts[slot] = 0;
              }
              
              // Increment counters
              totalCounts[slot]++;
              
              if (volunteer.isInPerson) {
                inPersonCounts[slot]++;
              } else {
                remoteCounts[slot]++;
              }
            }
          });
        }
      }
    });

    // Sort the slots by date and time for better display
    const sortedSlots = Object.keys(totalCounts).sort((a, b) => {
      // First try to sort by date
      const dateA = a.split(":")[0]; // "Saturday, May 4"
      const dateB = b.split(":")[0];
      
      if (dateA !== dateB) {
        // If dates are different, compare them
        return dateA.localeCompare(dateB);
      }
      
      // If dates are the same, sort by time period
      const timePeriods = ["Early Morning", "Morning", "Afternoon", "Evening", "Night", "Late Night"];
      const timeA = a.match(/🌅|☀️|🏙️|🌆|🌃|🌙/) ? timePeriods[a.match(/🌅|☀️|🏙️|🌆|🌃|🌙/).index] : "";
      const timeB = b.match(/🌅|☀️|🏙️|🌆|🌃|🌙/) ? timePeriods[b.match(/🌅|☀️|🏙️|🌆|🌃|🌙/).index] : "";
      
      return timePeriods.indexOf(timeA) - timePeriods.indexOf(timeB);
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
