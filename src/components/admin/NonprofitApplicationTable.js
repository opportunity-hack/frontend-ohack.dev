import React, { useState } from "react";
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
  Tooltip,
  Typography,
  Box,
  Link,
} from "@mui/material";
import { styled } from "@mui/system";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";

const NAVY = "#1B3A6B";
const HAIRLINE = "rgba(22, 24, 29, 0.12)";

// Reviewer-first column plan: legacy duplicate fields are merged per row
// (name/contactName, organization/charityName, idea/technicalProblem) so the
// Idea column can take roughly half the table width as a readable text block.
const COLUMNS = [
  { id: "organization", label: "Organization", sortable: true, width: "17%" },
  { id: "name", label: "Contact", sortable: true, width: "17%" },
  { id: "idea", label: "Idea", sortable: false, width: "46%" },
  { id: "timestamp", label: "Submitted", sortable: true, width: "11%" },
  { id: "actions", label: "Actions", sortable: false, width: "9%" },
];

// Rough threshold where a 3-line clamp starts truncating; beyond it we offer
// the expanded reading panel.
const CLAMP_CHAR_THRESHOLD = 220;

const StyledTableContainer = styled(TableContainer)({
  width: "100%",
  overflowX: "auto",
  border: `1px solid ${HAIRLINE}`,
  borderRadius: 8,
  boxShadow: "none",
});

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
}));

const HeadCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.07em",
  textTransform: "uppercase",
  color: theme.palette.text.secondary,
  backgroundColor: "#fafafa",
  borderBottom: `1px solid ${HAIRLINE}`,
  whiteSpace: "nowrap",
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(2),
  verticalAlign: "top",
  borderBottom: `1px solid ${HAIRLINE}`,
  [theme.breakpoints.down("md")]: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    borderBottom: "none",
    padding: theme.spacing(1, 2),
    "&:before": {
      content: "attr(data-label)",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.07em",
      textTransform: "uppercase",
      color: theme.palette.text.secondary,
      marginBottom: theme.spacing(0.5),
    },
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:hover": {
    backgroundColor: "rgba(27, 58, 107, 0.03)",
  },
  [theme.breakpoints.down("md")]: {
    display: "flex",
    flexDirection: "column",
    borderBottom: `1px solid ${theme.palette.divider}`,
    paddingBottom: theme.spacing(1),
  },
}));

const DetailRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: "rgba(27, 58, 107, 0.025)",
  [theme.breakpoints.down("md")]: {
    display: "flex",
    flexDirection: "column",
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

// Merged-field accessors shared with the page's sort logic.
export const applicationOrganization = (application) =>
  application.organization || application.charityName || "";

export const applicationContactName = (application) =>
  application.name || application.contactName || "";

export const applicationIdeaText = (application) =>
  application.idea || application.technicalProblem || "";

const applicationKey = (application) =>
  application.id || application.email || applicationOrganization(application);

const formatSubmittedDate = (timestamp) => {
  if (!timestamp) return null;
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const relativeAge = (timestamp) => {
  if (!timestamp) return null;
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return null;
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) return null;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 31) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return null;
};

const NonprofitStatus = ({ value }) => (
  <Box
    component="span"
    sx={{
      display: "inline-flex",
      alignItems: "center",
      gap: 0.75,
      fontSize: 12.5,
      fontWeight: 500,
      color: value ? "#1e6b3a" : "#8a5a00",
    }}
  >
    <Box
      component="span"
      sx={{
        width: 7,
        height: 7,
        borderRadius: "50%",
        flexShrink: 0,
        backgroundColor: value ? "#2e7d32" : "#ed6c02",
      }}
    />
    {value ? "Nonprofit" : "Not a nonprofit"}
  </Box>
);

const DetailBlock = ({ label, text }) => {
  if (!text) return null;
  return (
    <Box sx={{ mb: 2, "&:last-child": { mb: 0 } }}>
      <Typography
        sx={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          color: "text.secondary",
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: 15,
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word",
          maxWidth: "72ch",
        }}
      >
        {text}
      </Typography>
    </Box>
  );
};

const NonprofitApplicationTable = ({
  applications,
  orderBy,
  order,
  onRequestSort,
  onEditApplication,
}) => {
  const [expandedKeys, setExpandedKeys] = useState(() => new Set());

  const toggleExpanded = (key) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <StyledTableContainer component={Paper} elevation={0}>
      <Table
        sx={{ tableLayout: { md: "fixed" }, minWidth: { xs: 0, md: 900 } }}
      >
        <StyledTableHead>
          <TableRow>
            {COLUMNS.map((column) => (
              <HeadCell key={column.id} sx={{ width: column.width }}>
                {column.sortable ? (
                  <TableSortLabel
                    active={orderBy === column.id}
                    direction={orderBy === column.id ? order : "asc"}
                    onClick={() => onRequestSort(column.id)}
                    sx={{
                      "&.Mui-active": { color: NAVY },
                      "&.Mui-active .MuiTableSortLabel-icon": { color: NAVY },
                    }}
                  >
                    {column.label}
                  </TableSortLabel>
                ) : (
                  column.label
                )}
              </HeadCell>
            ))}
          </TableRow>
        </StyledTableHead>
        <TableBody>
          {applications.length === 0 && (
            <TableRow>
              <TableCell colSpan={COLUMNS.length} sx={{ py: 6 }}>
                <Typography align="center" color="text.secondary">
                  No applications match. Clear the search or refresh to see
                  every submission.
                </Typography>
              </TableCell>
            </TableRow>
          )}
          {applications.map((application) => {
            const key = applicationKey(application);
            const ideaText = applicationIdeaText(application);
            const hasSecondProblemField = Boolean(
              application.idea && application.technicalProblem
            );
            const extraDetail =
              hasSecondProblemField ||
              Boolean(application.solutionBenefits) ||
              Boolean(application.notes);
            const expandable =
              extraDetail ||
              ideaText.length > CLAMP_CHAR_THRESHOLD ||
              ideaText.includes("\n");
            const expanded = expandedKeys.has(key);
            const submittedDate = formatSubmittedDate(application.timestamp);
            const submittedAge = relativeAge(application.timestamp);
            const contactName = applicationContactName(application);

            return (
              <React.Fragment key={key}>
                <StyledTableRow>
                  <StyledTableCell data-label="Organization">
                    <Typography
                      sx={{
                        fontSize: 15,
                        fontWeight: 600,
                        lineHeight: 1.4,
                        overflowWrap: "break-word",
                      }}
                    >
                      {applicationOrganization(application) || "—"}
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <NonprofitStatus value={Boolean(application.isNonProfit)} />
                    </Box>
                  </StyledTableCell>

                  <StyledTableCell data-label="Contact">
                    <Typography sx={{ fontSize: 14.5, lineHeight: 1.4 }}>
                      {contactName || "—"}
                    </Typography>
                    {application.email && (
                      <Link
                        href={`mailto:${application.email}`}
                        sx={{
                          fontSize: 13,
                          color: NAVY,
                          textDecorationColor: "rgba(27, 58, 107, 0.35)",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {application.email}
                      </Link>
                    )}
                  </StyledTableCell>

                  <StyledTableCell data-label="Idea">
                    {ideaText ? (
                      <>
                        <Typography
                          onClick={
                            expandable ? () => toggleExpanded(key) : undefined
                          }
                          sx={{
                            fontSize: 15,
                            lineHeight: 1.55,
                            whiteSpace: "pre-line",
                            overflowWrap: "break-word",
                            cursor: expandable ? "pointer" : "default",
                            ...(expanded
                              ? {}
                              : {
                                  display: "-webkit-box",
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }),
                          }}
                        >
                          {ideaText}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            mt: 0.5,
                          }}
                        >
                          {expandable && (
                            <Button
                              size="small"
                              onClick={() => toggleExpanded(key)}
                              aria-expanded={expanded}
                              sx={{
                                p: 0,
                                minWidth: 0,
                                fontSize: 13,
                                fontWeight: 600,
                                color: NAVY,
                                textTransform: "none",
                                "&:hover": {
                                  backgroundColor: "transparent",
                                  textDecoration: "underline",
                                },
                              }}
                            >
                              {expanded ? "Show less" : "Show more"}
                            </Button>
                          )}
                          {application.notes && (
                            <Typography
                              component="span"
                              sx={{ fontSize: 12.5, color: "text.secondary" }}
                            >
                              Has notes
                            </Typography>
                          )}
                          {hasSecondProblemField && (
                            <Typography
                              component="span"
                              sx={{ fontSize: 12.5, color: "text.secondary" }}
                            >
                              + technical problem
                            </Typography>
                          )}
                        </Box>
                      </>
                    ) : (
                      <Typography sx={{ fontSize: 14, color: "text.disabled" }}>
                        No idea provided
                      </Typography>
                    )}
                  </StyledTableCell>

                  <StyledTableCell data-label="Submitted">
                    <Typography sx={{ fontSize: 14, whiteSpace: "nowrap" }}>
                      {submittedDate || "—"}
                    </Typography>
                    {submittedAge && (
                      <Typography
                        sx={{ fontSize: 12.5, color: "text.secondary" }}
                      >
                        {submittedAge}
                      </Typography>
                    )}
                  </StyledTableCell>

                  <StyledTableCell data-label="Actions">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => onEditApplication(application)}
                        sx={{
                          textTransform: "none",
                          color: NAVY,
                          borderColor: "rgba(27, 58, 107, 0.4)",
                          "&:hover": {
                            borderColor: NAVY,
                            backgroundColor: "rgba(27, 58, 107, 0.05)",
                          },
                        }}
                      >
                        Edit
                      </Button>
                      {application.email && (
                        <Tooltip title={`Email ${contactName || "applicant"}`}>
                          <Link
                            href={`mailto:${application.email}`}
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              color: "text.secondary",
                              p: 0.5,
                              "&:hover": { color: NAVY },
                            }}
                            aria-label={`Email ${application.email}`}
                          >
                            <EmailOutlinedIcon fontSize="small" />
                          </Link>
                        </Tooltip>
                      )}
                    </Box>
                  </StyledTableCell>
                </StyledTableRow>

                {expanded && extraDetail && (
                  <DetailRow>
                    <TableCell
                      colSpan={COLUMNS.length}
                      sx={{ py: 3, px: { xs: 2, md: 4 } }}
                    >
                      <Box
                        sx={{
                          borderLeft: `3px solid ${NAVY}`,
                          pl: { xs: 2, md: 3 },
                        }}
                      >
                        {/* The idea itself unclamps in the row above; this
                            panel only carries fields with no column. */}
                        {hasSecondProblemField && (
                          <DetailBlock
                            label="Technical problem"
                            text={application.technicalProblem}
                          />
                        )}
                        <DetailBlock
                          label="Solution benefits"
                          text={application.solutionBenefits}
                        />
                        <DetailBlock label="Notes" text={application.notes} />
                      </Box>
                    </TableCell>
                  </DetailRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </StyledTableContainer>
  );
};

export default NonprofitApplicationTable;
