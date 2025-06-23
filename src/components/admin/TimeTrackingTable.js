import React, { useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Typography,
  Chip,
  Tooltip,
} from "@mui/material";
import moment from "moment";

const roundToOneDecimal = (number) => {
  return isNaN(number) ? 0 : parseFloat(number.toFixed(2));
};

const TimeTrackingTable = ({
  timeTrackingData,
  orderBy,
  order,
  onRequestSort,
  onRowClick,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const createSortHandler = (property) => () => {
    onRequestSort(property);
  };

  // Group data by user
  const userSummary = timeTrackingData.reduce((acc, record) => {
    const userId = record.userId || 'unknown';
    
    if (!acc[userId]) {
      acc[userId] = {
        userId,
        userName: record.userName || 'Unknown User',
        email: record.email || 'N/A',
        totalCommitted: 0,
        totalTracked: 0,
        sessions: [],
        lastActive: null,
      };
    }
    
    acc[userId].totalCommitted += record.commitmentHours || 0;
    acc[userId].totalTracked += record.finalHours || 0;
    acc[userId].sessions.push(record);
    
    // Track latest session
    const timestamp = moment(record.timestamp);
    if (!acc[userId].lastActive || timestamp.isAfter(acc[userId].lastActive)) {
      acc[userId].lastActive = timestamp;
    }
    
    return acc;
  }, {});

  // Convert to array for sorting and pagination
  const userSummaryArray = Object.values(userSummary);

  // Apply sorting
  const sortedData = userSummaryArray.sort((a, b) => {
    // Handle different data types
    if (orderBy === 'lastActive') {
      const dateA = a.lastActive || moment(0);
      const dateB = b.lastActive || moment(0);
      return (order === 'asc' ? dateA.diff(dateB) : dateB.diff(dateA));
    } else if (orderBy === 'totalCommitted' || orderBy === 'totalTracked') {
      return order === 'asc'
        ? a[orderBy] - b[orderBy]
        : b[orderBy] - a[orderBy];
    } else {
      // For string fields like name, email
      const valueA = (a[orderBy] || '').toString().toLowerCase();
      const valueB = (b[orderBy] || '').toString().toLowerCase();
      
      return order === 'asc'
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
  });

  // Apply pagination
  const paginatedData = sortedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Calculate efficiency percentage
  const getEfficiencyPercentage = (committed, tracked) => {
    if (committed === 0) return 0;
    return Math.min(100, Math.round((tracked / committed) * 100));
  };

  // Get color for efficiency chip
  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 80) return "success";
    if (efficiency >= 50) return "warning";
    return "error";
  };

  return (
    <Box>
      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "userName"}
                    direction={orderBy === "userName" ? order : "asc"}
                    onClick={createSortHandler("userName")}
                  >
                    Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "email"}
                    direction={orderBy === "email" ? order : "asc"}
                    onClick={createSortHandler("email")}
                  >
                    Email
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === "totalCommitted"}
                    direction={orderBy === "totalCommitted" ? order : "asc"}
                    onClick={createSortHandler("totalCommitted")}
                  >
                    Hours Committed
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === "totalTracked"}
                    direction={orderBy === "totalTracked" ? order : "asc"}
                    onClick={createSortHandler("totalTracked")}
                  >
                    Hours Tracked
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">Efficiency</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "lastActive"}
                    direction={orderBy === "lastActive" ? order : "asc"}
                    onClick={createSortHandler("lastActive")}
                  >
                    Last Active
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">Sessions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((user) => {
                const efficiency = getEfficiencyPercentage(
                  user.totalCommitted,
                  user.totalTracked
                );
                
                return (
                  <TableRow 
                    key={user.userId} 
                    hover
                    onClick={() => onRowClick && onRowClick(user)}
                    sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                  >
                    <TableCell>{user.userName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell align="right">
                      {roundToOneDecimal(user.totalCommitted)}
                    </TableCell>
                    <TableCell align="right">
                      {roundToOneDecimal(user.totalTracked)}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${efficiency}%`}
                        color={getEfficiencyColor(efficiency)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {user.lastActive
                        ? user.lastActive.format("MMM DD, YYYY")
                        : "N/A"}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip 
                        title={`${user.sessions.length} tracking sessions`}
                        arrow
                      >
                        <Chip
                          label={user.sessions.length}
                          color="primary"
                          size="small"
                        />
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
              {paginatedData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body1">
                      No time tracking data available
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={userSummaryArray.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default TimeTrackingTable;