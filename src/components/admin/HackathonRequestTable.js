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
  Box,
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

const statusColorMap = {
  pending: "warning",
  approved: "success",
  rejected: "error",
  "in-progress": "info",
  completed: "success",
};

const columns = [
  { id: "companyName", label: "Organization", minWidth: 140 },
  { id: "contactName", label: "Contact", minWidth: 120 },
  { id: "contactEmail", label: "Email", minWidth: 160 },
  { id: "organizationType", label: "Type", minWidth: 100 },
  { id: "employeeCount", label: "Participants", minWidth: 100 },
  { id: "eventFormat", label: "Format", minWidth: 90 },
  { id: "location", label: "Location", minWidth: 120 },
  { id: "expectedHackathonDate", label: "Hackathon Date", minWidth: 120 },
  { id: "status", label: "Status", minWidth: 100 },
  { id: "created", label: "Submitted", minWidth: 120 },
];

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const HackathonRequestTable = ({
  requests,
  orderBy,
  order,
  onRequestSort,
  onViewRequest,
}) => {
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
          {requests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + 1} align="center">
                No hackathon requests found.
              </TableCell>
            </TableRow>
          ) : (
            requests.map((req) => (
              <StyledTableRow key={req.id}>
                {columns.map((column) => (
                  <StyledTableCell key={column.id} data-label={column.label}>
                    {column.id === "status" ? (
                      <Chip
                        label={(req.status || "pending").replace("-", " ")}
                        color={statusColorMap[req.status] || "default"}
                        size="small"
                        sx={{ textTransform: "capitalize" }}
                      />
                    ) : column.id === "created" ||
                      column.id === "expectedHackathonDate" ? (
                      formatDate(req[column.id])
                    ) : column.id === "organizationType" ? (
                      <Chip
                        label={req[column.id] || "-"}
                        size="small"
                        variant="outlined"
                        sx={{ textTransform: "capitalize" }}
                      />
                    ) : column.id === "employeeCount" ? (
                      req[column.id] ? `~${req[column.id]}` : "-"
                    ) : (
                      <Tooltip title={req[column.id] || ""}>
                        <span>
                          {(req[column.id] || "-").toString().length > 30
                            ? (req[column.id] || "").toString().substring(0, 30) + "..."
                            : req[column.id] || "-"}
                        </span>
                      </Tooltip>
                    )}
                  </StyledTableCell>
                ))}
                <StyledTableCell data-label="Actions">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => onViewRequest(req)}
                  >
                    View
                  </Button>
                </StyledTableCell>
              </StyledTableRow>
            ))
          )}
        </TableBody>
      </Table>
    </StyledTableContainer>
  );
};

export default HackathonRequestTable;
