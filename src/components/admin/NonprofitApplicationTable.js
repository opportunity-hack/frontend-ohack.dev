import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Button,
  Chip,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/system";

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  width: "100%",
  overflowX: "auto",
  "& .MuiTable-root": {
    minWidth: "100%",
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  [theme.breakpoints.down("md")]: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    borderBottom: "none",
    padding: theme.spacing(1, 2),
    "&:before": {
      content: "attr(data-label)",
      fontWeight: "bold",
      marginBottom: theme.spacing(0.5),
    },
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  [theme.breakpoints.down("md")]: {
    display: "flex",
    flexDirection: "column",
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const NonprofitApplicationTable = ({
  applications,
  orderBy,
  order,
  onRequestSort,
  onEditApplication,
}) => {
  const columns = [
    { id: "name", label: "Name", minWidth: 120 },
    { id: "organization", label: "Organization", minWidth: 150 },
    { id: "email", label: "Email", minWidth: 150 },
    { id: "isNonProfit", label: "Is Nonprofit", minWidth: 100 },
    { id: "timestamp", label: "Timestamp", minWidth: 120 },
    { id: "notes", label: "Notes", minWidth: 150 },
  ];

  return (
    <StyledTableContainer component={Paper}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <StyledTableCell
                key={column.id}
                style={{ minWidth: column.minWidth }}
              >
                <TableSortLabel
                  active={orderBy === column.id}
                  direction={orderBy === column.id ? order : "asc"}
                  onClick={() => onRequestSort(column.id)}
                >
                  {column.label}
                </TableSortLabel>
              </StyledTableCell>
            ))}
            <StyledTableCell style={{ minWidth: 100 }}>Actions</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {applications.map((application) => (
            <StyledTableRow key={application.id || application.email}>
              {columns.map((column) => (
                <StyledTableCell key={column.id} data-label={column.label}>
                  {column.id === "isNonProfit" ? (
                    <Chip
                      label={application[column.id] ? "Yes" : "No"}
                      color={application[column.id] ? "success" : "error"}
                    />
                  ) : column.id === "notes" ? (
                    <Tooltip title={application[column.id] || "No notes"}>
                      <span>
                        {(application[column.id] || "").substring(0, 50)}...
                      </span>
                    </Tooltip>
                  ) : (
                    application[column.id] || "-"
                  )}
                </StyledTableCell>
              ))}
              <StyledTableCell data-label="Actions">
                <Button onClick={() => onEditApplication(application)}>
                  Edit
                </Button>
              </StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </StyledTableContainer>
  );
};

export default NonprofitApplicationTable;
