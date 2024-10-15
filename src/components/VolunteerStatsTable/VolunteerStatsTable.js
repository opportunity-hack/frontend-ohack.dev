// components/VolunteerStatsTable/VolunteerStatsTable.js
import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import moment from "moment";

const roundToOneDecimal = (number) => {
  return isNaN(number) ? 0 : parseFloat(number.toFixed(2));
};

const VolunteerStatsTable = ({ volunteerStats }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const groupedStats = volunteerStats.reduce((acc, stat) => {
    const date = moment.utc(stat.timestamp).format("YYYY-MM-DD");
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(stat);
    return acc;
  }, {});

  return (
    <TableContainer component={Paper} sx={{ mt: 2, overflowX: "auto" }}>
      <Table aria-label="volunteer statistics table">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell align="right">Committed Hours</TableCell>
            <TableCell align="right">Actively Tracked Hours</TableCell>
            <TableCell>Reason</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(groupedStats).map(([date, stats]) => (
            <React.Fragment key={date}>
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {moment(date).format("MMMM Do YYYY")}
                  </Typography>
                </TableCell>
              </TableRow>
              {stats.map((stat, index) => (
                <TableRow key={`${date}-${index}`}>
                  <TableCell>
                    {moment
                      .utc(stat.timestamp)
                      .format(isMobile ? "HH:mm" : "h:mm:ss a")}
                  </TableCell>
                  <TableCell align="right">
                    {roundToOneDecimal(stat.commitmentHours)}
                  </TableCell>
                  <TableCell align="right">
                    {roundToOneDecimal(stat.finalHours)}
                  </TableCell>
                  <TableCell>{stat.reason}</TableCell>
                </TableRow>
              ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default VolunteerStatsTable;
