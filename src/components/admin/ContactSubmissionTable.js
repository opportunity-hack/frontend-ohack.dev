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
  Badge,
} from "@mui/material";
import { styled } from "@mui/system";
import MailOutlineIcon from "@mui/icons-material/MailOutline";

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
  new: "warning",
  responded: "success",
};

const columns = [
  { id: "timestamp", label: "Submitted", minWidth: 120 },
  { id: "name", label: "Name", minWidth: 140 },
  { id: "email", label: "Email", minWidth: 160 },
  { id: "organization", label: "Organization", minWidth: 140 },
  { id: "inquiryType", label: "Inquiry Type", minWidth: 120 },
  { id: "status", label: "Status", minWidth: 100 },
  { id: "emails", label: "Emails", minWidth: 80 },
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

const getCellValue = (submission, columnId) => {
  switch (columnId) {
    case "name":
      return `${submission.firstName || ""} ${submission.lastName || ""}`.trim() || "-";
    case "emails":
      return (submission.sent_emails || []).length;
    default:
      return submission[columnId];
  }
};

const ContactSubmissionTable = ({
  submissions,
  orderBy,
  order,
  onRequestSort,
  onViewSubmission,
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
          {submissions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + 1} align="center">
                No contact submissions found.
              </TableCell>
            </TableRow>
          ) : (
            submissions.map((sub) => (
              <StyledTableRow key={sub.id}>
                {columns.map((column) => (
                  <StyledTableCell key={column.id} data-label={column.label}>
                    {column.id === "status" ? (
                      <Chip
                        label={sub.status || "new"}
                        color={statusColorMap[sub.status] || "warning"}
                        size="small"
                        sx={{ textTransform: "capitalize" }}
                      />
                    ) : column.id === "timestamp" ? (
                      formatDate(sub.timestamp)
                    ) : column.id === "emails" ? (
                      (sub.sent_emails || []).length > 0 ? (
                        <Badge
                          badgeContent={(sub.sent_emails || []).length}
                          color="info"
                        >
                          <MailOutlineIcon fontSize="small" color="action" />
                        </Badge>
                      ) : (
                        "-"
                      )
                    ) : column.id === "inquiryType" ? (
                      <Chip
                        label={getCellValue(sub, column.id) || "-"}
                        size="small"
                        variant="outlined"
                        sx={{ textTransform: "capitalize" }}
                      />
                    ) : (
                      <Tooltip title={getCellValue(sub, column.id) || ""}>
                        <span>
                          {(getCellValue(sub, column.id) || "-").toString().length > 30
                            ? (getCellValue(sub, column.id) || "").toString().substring(0, 30) + "..."
                            : getCellValue(sub, column.id) || "-"}
                        </span>
                      </Tooltip>
                    )}
                  </StyledTableCell>
                ))}
                <StyledTableCell data-label="Actions">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => onViewSubmission(sub)}
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

export default ContactSubmissionTable;
