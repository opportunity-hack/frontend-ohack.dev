import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  TextField,
  Box,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import moment from "moment";

const roundToOneDecimal = (number) => {
  return isNaN(number) ? 0 : parseFloat(number.toFixed(2));
};

const TimeTrackingDetailDialog = ({ open, onClose, userData }) => {
  const [filterReason, setFilterReason] = useState("all");
  const [startDate, setStartDate] = useState(() => {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    return lastMonth;
  });
  const [endDate, setEndDate] = useState(new Date());

  if (!userData) return null;

  // Calculate total hours
  const totalCommitted = roundToOneDecimal(userData.totalCommitted);
  const totalTracked = roundToOneDecimal(userData.totalTracked);
  const efficiency = userData.totalCommitted 
    ? Math.min(100, Math.round((userData.totalTracked / userData.totalCommitted) * 100))
    : 0;

  // Get color for efficiency chip
  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 80) return "success";
    if (efficiency >= 50) return "warning";
    return "error";
  };

  // Get all unique reasons
  const allReasons = [...new Set(userData.sessions.map(session => session.reason))];

  // Filter sessions by date range and reason
  const filteredSessions = userData.sessions.filter(session => {
    const sessionDate = moment(session.timestamp);
    const isInDateRange = sessionDate.isBetween(startDate, endDate, 'day', '[]');
    const matchesReason = filterReason === 'all' || session.reason === filterReason;
    return isInDateRange && matchesReason;
  });

  // Sort sessions by date (newest first)
  const sortedSessions = [...filteredSessions].sort((a, b) => 
    moment(b.timestamp).valueOf() - moment(a.timestamp).valueOf()
  );

  // Prepare chart data
  const prepareChartData = () => {
    // Group sessions by day
    const sessionsByDay = sortedSessions.reduce((acc, session) => {
      const day = moment(session.timestamp).format('YYYY-MM-DD');
      
      if (!acc[day]) {
        acc[day] = {
          date: moment(day).format('MM/DD'),
          Committed: 0,
          Tracked: 0,
        };
      }
      
      acc[day].Committed += session.commitmentHours || 0;
      acc[day].Tracked += session.finalHours || 0;
      
      return acc;
    }, {});
    
    // Convert to array and sort by date
    return Object.values(sessionsByDay)
      .sort((a, b) => moment(a.date, 'MM/DD').diff(moment(b.date, 'MM/DD')))
      .map(day => ({
        ...day,
        Committed: roundToOneDecimal(day.Committed),
        Tracked: roundToOneDecimal(day.Tracked),
      }));
  };

  const chartData = prepareChartData();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Time Tracking Details - {userData.userName}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1">
                Email: {userData.email}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="subtitle1" sx={{ mr: 1 }}>
                  Efficiency:
                </Typography>
                <Chip
                  label={`${efficiency}%`}
                  color={getEfficiencyColor(efficiency)}
                />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1">
                  <strong>Total Committed Hours:</strong> {totalCommitted}
                </Typography>
                <Typography variant="body1">
                  <strong>Total Tracked Hours:</strong> {totalTracked}
                </Typography>
                <Typography variant="body1">
                  <strong>Total Sessions:</strong> {userData.sessions.length}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ mb: 3 }} />
            <Typography variant="h6" gutterBottom>
              Time Tracking History
            </Typography>
            
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={setStartDate}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={setEndDate}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Filter by Reason</InputLabel>
                    <Select
                      value={filterReason}
                      label="Filter by Reason"
                      onChange={(e) => setFilterReason(e.target.value)}
                    >
                      <MenuItem value="all">All Reasons</MenuItem>
                      {allReasons.map(reason => (
                        <MenuItem key={reason} value={reason}>
                          {reason.charAt(0).toUpperCase() + reason.slice(1).replace('_', ' ')}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </LocalizationProvider>
            
            {/* Chart */}
            {chartData.length > 0 && (
              <Box sx={{ height: 300, mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Volunteer Hours by Day
                </Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                  >
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Committed" fill="#8884d8" />
                    <Bar dataKey="Tracked" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
            
            {/* Sessions Table */}
            <Typography variant="subtitle1" gutterBottom>
              Session Details ({sortedSessions.length} sessions)
            </Typography>
            <TableContainer component={Paper} sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell align="right">Committed Hours</TableCell>
                    <TableCell align="right">Tracked Hours</TableCell>
                    <TableCell align="right">Efficiency</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedSessions.map((session, index) => {
                    const sessionEfficiency = session.commitmentHours
                      ? Math.min(100, Math.round((session.finalHours / session.commitmentHours) * 100))
                      : 0;
                      
                    return (
                      <TableRow key={index} hover>
                        <TableCell>
                          {moment(session.timestamp).format("MMM DD, YYYY HH:mm")}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={session.reason.replace('_', ' ')}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          {roundToOneDecimal(session.commitmentHours)}
                        </TableCell>
                        <TableCell align="right">
                          {roundToOneDecimal(session.finalHours)}
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`${sessionEfficiency}%`}
                            color={getEfficiencyColor(sessionEfficiency)}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {sortedSessions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No sessions found for the selected filters
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TimeTrackingDetailDialog;