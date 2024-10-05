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
console.log("volunteers", volunteers);
  const availabilityCount = useMemo(() => {
    const totalCounts = {
      "Oct 12th: Saturday Morning (9am - 12pm PST)": 0,
      "Saturday Afternoon (1p - 3p PST)": 0,
      "Saturday Evening (4p - 7p PST)": 0,
      "Saturday Night (8p - 11p PST)": 0,
      "Saturday Late Night (11p - 2am)": 0,
      "Oct 13th: Sunday Early Morning (7am - 9am)": 0,
      "Sunday Morning (9am - 12pm PST)": 0,
      "Sunday Afternoon (1p - 3p PST)": 0,
    };
    const inPersonCounts = { ...totalCounts };

    const remoteCounts = { ...totalCounts };

    volunteers.forEach((volunteer) => {
      if (volunteer.isSelected && volunteer.volunteer_type === "mentor") {
        volunteer.availability.split(", ").forEach((slot) => {
          if (totalCounts.hasOwnProperty(slot)) {
            totalCounts[slot]++;
          }
          if (volunteer.isInPerson) {
            inPersonCounts[slot]++;
          } else {
            remoteCounts[slot]++;
          }
        });
      }
    });

    // Return totalCounts, remoteCounts, inPersonCounts
    return {
      totalCounts: totalCounts,
      remoteCounts: remoteCounts,
      inPersonCounts: inPersonCounts
    }
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
            {Object.entries(availabilityCount.totalCounts).map(
              ([slot, totalCount]) => (
                <TableRow key={slot}>
                  <TableCell component="th" scope="row">
                    {slot}
                  </TableCell>
                  <TableCell align="right">{totalCount}</TableCell>
                  <TableCell align="right">{availabilityCount.inPersonCounts[slot]}</TableCell>
                  <TableCell align="right">{availabilityCount.remoteCounts[slot]}</TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </StyledPaper>
  );
};

export default MentorAvailability;
