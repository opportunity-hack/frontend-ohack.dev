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
  Avatar,
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

const VolunteerTable = ({ volunteers, type, orderBy, order, onRequestSort, onEditVolunteer }) => {
  const columns = type === 'mentors' ? [
    { id: 'name', label: 'Name', minWidth: 120 },
    { id: 'expertise', label: 'Expertise', minWidth: 150 },
    { id: 'company', label: 'Company', minWidth: 120 },
    { id: 'isInPerson', label: 'In Person', minWidth: 100 },
    { id: 'isSelected', label: 'Selected', minWidth: 100 },
  ] : [
    { id: 'name', label: 'Name', minWidth: 120 },
    { id: 'title', label: 'Title', minWidth: 150 },
    { id: 'companyName', label: 'Company', minWidth: 120 },
    { id: 'isInPerson', label: 'In Person', minWidth: 100 },
    { id: 'isSelected', label: 'Selected', minWidth: 100 },
  ];

  return (
    <StyledTableContainer component={Paper}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <StyledTableCell style={{ minWidth: 80 }}>Photo</StyledTableCell>
            {columns.map((column) => (
              <StyledTableCell key={column.id} style={{ minWidth: column.minWidth }}>
                <TableSortLabel
                  active={orderBy === column.id}
                  direction={orderBy === column.id ? order : 'asc'}
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
          {volunteers.map((volunteer) => (
            <StyledTableRow key={volunteer.name}>
              <StyledTableCell>
                <Avatar 
                  src={volunteer.photoUrl} 
                  alt={volunteer.name}
                  key={`${volunteer.name}-${volunteer.photoUrl}`}
                />
              </StyledTableCell>
              {columns.map((column) => (
                <StyledTableCell key={column.id} data-label={column.label}>
                  {column.id === 'isInPerson' || column.id === 'isSelected' ? 
                    (volunteer[column.id] ? 'Yes' : 'No') : 
                    volunteer[column.id]}
                </StyledTableCell>
              ))}
              <StyledTableCell data-label="Actions">
                <Button onClick={() => onEditVolunteer(volunteer)}>
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

export default VolunteerTable;
