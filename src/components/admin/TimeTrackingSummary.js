import React from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Divider,
  Chip,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import moment from "moment";

const roundToOneDecimal = (number) => {
  return isNaN(number) ? 0 : parseFloat(number.toFixed(2));
};

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe"];

const TimeTrackingSummary = ({ timeTrackingData }) => {
  // Calculate summary statistics
  const calculateStats = () => {
    const stats = {
      totalUsers: 0,
      totalSessions: timeTrackingData.length,
      totalCommittedHours: 0,
      totalTrackedHours: 0,
      averageEfficiency: 0,
      sessionsToday: 0,
      hoursToday: 0,
      reasonDistribution: {},
      activeUsers: new Set(),
      usersLastWeek: new Set(),
      usersLastMonth: new Set(),
    };

    // User tracking sets
    const userIds = new Set();
    const today = moment().startOf("day");
    const weekAgo = moment().subtract(7, "days").startOf("day");
    const monthAgo = moment().subtract(30, "days").startOf("day");

    timeTrackingData.forEach((session) => {
      // Add to total hours
      stats.totalCommittedHours += session.commitmentHours || 0;
      stats.totalTrackedHours += session.finalHours || 0;

      // Track unique users
      if (session.userId) {
        userIds.add(session.userId);
        
        const sessionDate = moment(session.timestamp);
        
        // Check if session was today
        if (sessionDate.isSame(today, "day")) {
          stats.sessionsToday++;
          stats.hoursToday += session.finalHours || 0;
        }
        
        // Check if user was active in last week/month
        if (sessionDate.isAfter(weekAgo)) {
          stats.usersLastWeek.add(session.userId);
        }
        
        if (sessionDate.isAfter(monthAgo)) {
          stats.usersLastMonth.add(session.userId);
        }
      }

      // Count by reason
      const reason = session.reason || "unknown";
      if (!stats.reasonDistribution[reason]) {
        stats.reasonDistribution[reason] = {
          name: reason.charAt(0).toUpperCase() + reason.slice(1).replace("_", " "),
          sessions: 0,
          hours: 0,
        };
      }
      stats.reasonDistribution[reason].sessions++;
      stats.reasonDistribution[reason].hours += session.finalHours || 0;
    });

    stats.totalUsers = userIds.size;
    stats.activeUsers = userIds;
    
    // Calculate average efficiency
    stats.averageEfficiency = 
      stats.totalCommittedHours > 0 
        ? Math.round((stats.totalTrackedHours / stats.totalCommittedHours) * 100) 
        : 0;

    return stats;
  };

  const stats = calculateStats();

  // Prepare pie chart data for volunteering reasons
  const reasonPieData = Object.values(stats.reasonDistribution)
    .map(reason => ({
      name: reason.name,
      value: roundToOneDecimal(reason.hours)
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Volunteer Time Tracking Summary
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Total Volunteers
                    </Typography>
                    <Typography variant="h4">
                      {stats.totalUsers}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Active last week: {stats.usersLastWeek.size}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Total Sessions
                    </Typography>
                    <Typography variant="h4">
                      {stats.totalSessions}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Today: {stats.sessionsToday}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Total Hours
                    </Typography>
                    <Typography variant="h4">
                      {roundToOneDecimal(stats.totalTrackedHours)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Committed: {roundToOneDecimal(stats.totalCommittedHours)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Avg. Efficiency
                    </Typography>
                    <Typography variant="h4">
                      {stats.averageEfficiency}%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Tracked vs Committed
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Volunteer Activity by Reason
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reasonPieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => 
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {reasonPieData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value} hours`, 'Hours']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Hours by Activity Type
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {Object.values(stats.reasonDistribution)
                    .sort((a, b) => b.hours - a.hours)
                    .map((reason, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body1">
                            {reason.name}
                          </Typography>
                          <Typography variant="body1" fontWeight="bold">
                            {roundToOneDecimal(reason.hours)} hours
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip 
                            size="small" 
                            label={`${reason.sessions} sessions`} 
                            color="primary" 
                            variant="outlined"
                          />
                          <Chip 
                            size="small" 
                            label={`Avg: ${roundToOneDecimal(reason.hours / reason.sessions)} hrs/session`} 
                            color="secondary" 
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    ))}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Activity Insights
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Active Volunteers
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label={`Last 7 days: ${stats.usersLastWeek.size}`} 
                  color="primary" 
                />
                <Chip 
                  label={`Last 30 days: ${stats.usersLastMonth.size}`} 
                  color="secondary" 
                />
                <Chip 
                  label={`All time: ${stats.totalUsers}`} 
                  variant="outlined" 
                />
              </Box>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Today's Activity
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                <strong>{stats.sessionsToday}</strong> sessions tracked
              </Typography>
              <Typography variant="body1">
                <strong>{roundToOneDecimal(stats.hoursToday)}</strong> hours logged
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                Volunteer Time Health
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                Average session duration: 
                <strong> 
                  {stats.totalSessions > 0 
                    ? roundToOneDecimal(stats.totalTrackedHours / stats.totalSessions) 
                    : 0} hours
                </strong>
              </Typography>
              <Typography variant="body1">
                Avg. sessions per volunteer: 
                <strong> 
                  {stats.totalUsers > 0 
                    ? roundToOneDecimal(stats.totalSessions / stats.totalUsers) 
                    : 0}
                </strong>
              </Typography>
              <Typography variant="body1">
                Avg. hours per volunteer: 
                <strong> 
                  {stats.totalUsers > 0 
                    ? roundToOneDecimal(stats.totalTrackedHours / stats.totalUsers) 
                    : 0}
                </strong>
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TimeTrackingSummary;