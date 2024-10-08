import React, { useMemo } from "react";
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
  Avatar,
  Typography,
  Chip,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/system";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

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

const SelectedChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.success.main,
  color: theme.palette.common.white,
}));

const NotSelectedChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.error.main,
  color: theme.palette.common.white,
}));

const VolunteerTable = ({
  volunteers,
  type,
  orderBy,
  order,
  onRequestSort,
  onEditVolunteer,
}) => {
  console.log("VolunteerTable", volunteers);
  const columns = useMemo(() => {
    const baseColumns = [
      { id: "id", label: "ID", minWidth: 100 }, // New column for ID
      { id: "name", label: "Name", minWidth: 120 },
      { id: "pronouns", label: "Pronouns", minWidth: 100 },
      { id: "company", label: "Company", minWidth: 120 },
      { id: "isInPerson", label: "In Person", minWidth: 100 },
      { id: "isSelected", label: "Selected", minWidth: 100 },
      { id: "slack_user_id", label: "SlackID", minWidth: 50 },
    ];

    if (type === "mentors") {
      return [
        ...baseColumns,
        { id: "expertise", label: "Expertise", minWidth: 150 },
        { id: "country", label: "Country", minWidth: 100 },
        { id: "state", label: "State", minWidth: 100 },
      ];
    } else if (type === "judges") {
      return [
        ...baseColumns,
        { id: "title", label: "Title", minWidth: 150 },
        { id: "background", label: "Background", minWidth: 150 },
      ];
    } else if (type === "volunteers") {
      return [
        ...baseColumns,
        { id: "artifacts", label: "Contributions", minWidth: 200 },
      ];
    }

    return baseColumns;
  }, [type]);

  const selectedCount = useMemo(() => {
    return volunteers.filter((volunteer) => volunteer.isSelected).length;
  }, [volunteers]);

  const renderCellContent = (volunteer, column) => {
    switch (column.id) {
      case "id":
        return volunteer.id || "N/A";
      case "isInPerson":
        return volunteer[column.id] ? "Yes" : "No";
      case "isSelected":
        return volunteer[column.id] ? (
          <SelectedChip
            icon={<CheckCircleIcon />}
            label="Selected"
            size="small"
          />
        ) : (
          <NotSelectedChip
            icon={<CancelIcon />}
            label="Not Selected"
            size="small"
          />
        );
      case "artifacts":
        return volunteer.artifacts?.map((artifact, index) => (
          <Tooltip key={index} title={artifact.comment}>
            <Chip label={artifact.label} size="small" style={{ margin: 2 }} />
          </Tooltip>
        ));
      default:
        return volunteer[column.id];
    }
  };

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Total {type}: {volunteers.length} | Selected: {selectedCount}
      </Typography>
      <StyledTableContainer component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <StyledTableCell style={{ minWidth: 50 }}>#</StyledTableCell>
              <StyledTableCell style={{ minWidth: 80 }}>Photo</StyledTableCell>
              <StyledTableCell style={{ minWidth: 100 }}>
                Actions
              </StyledTableCell>
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
            </TableRow>
          </TableHead>
          <TableBody>
            {volunteers.map((volunteer, index) => (
              <StyledTableRow
                key={volunteer.name}
                style={{
                  backgroundColor: volunteer.isSelected ? "#e8f5e9" : "inherit",
                }}
              >
                <StyledTableCell>{index + 1}</StyledTableCell>
                <StyledTableCell>
                  <Avatar
                    src={volunteer.photoUrl}
                    alt={volunteer.name}
                    key={`${volunteer.name}-${volunteer.photoUrl}`}
                  />
                </StyledTableCell>
                <StyledTableCell data-label="Actions">
                  <Button onClick={() => onEditVolunteer(volunteer)}>
                    Edit
                  </Button>
                </StyledTableCell>
                {columns.map((column) => (
                  <StyledTableCell key={column.id} data-label={column.label}>
                    {renderCellContent(volunteer, column)}
                  </StyledTableCell>
                ))}
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>
    </>
  );
};

export default VolunteerTable;