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
  [theme.breakpoints.down("sm")]: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    borderBottom: "none",
    padding: "8px 16px",
    "&:before": {
      content: "attr(data-label)",
      fontWeight: "bold",
      marginBottom: "4px",
    },
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  [theme.breakpoints.down("sm")]: {
    display: "flex",
    flexDirection: "column",
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const VolunteerTable = ({
  volunteers,
  type,
  orderBy,
  order,
  onRequestSort,
  onEditVolunteer,
}) => {
  const columns =
    type === "mentors"
      ? [
          { id: "name", label: "Name" },
          { id: "expertise", label: "Expertise" },
          { id: "company", label: "Company" },
          { id: "isInPerson", label: "In Person" },
          { id: "isSelected", label: "Selected" },
        ]
      : [
          { id: "name", label: "Name" },
          { id: "title", label: "Title" },
          { id: "companyName", label: "Company" },
          { id: "isInPerson", label: "In Person" },
          { id: "isSelected", label: "Selected" },
        ];

  return (
    <StyledTableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <StyledTableCell>Photo</StyledTableCell>
            {columns.map((column) => (
              <StyledTableCell key={column.id}>
                <TableSortLabel
                  active={orderBy === column.id}
                  direction={orderBy === column.id ? order : "asc"}
                  onClick={() => onRequestSort(column.id)}
                >
                  {column.label}
                </TableSortLabel>
              </StyledTableCell>
            ))}
            <StyledTableCell>Actions</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {volunteers.map((volunteer) => (
            <StyledTableRow key={volunteer.id}>
              <StyledTableCell>
                <Avatar src={volunteer.photoUrl} alt={volunteer.name} />
              </StyledTableCell>
              {columns.map((column) => (
                <StyledTableCell key={column.id} data-label={column.label}>
                  {column.id === "isInPerson" || column.id === "isSelected"
                    ? volunteer[column.id]
                      ? "Yes"
                      : "No"
                    : volunteer[column.id]}
                </StyledTableCell>
              ))}
              <StyledTableCell data-label="Actions">
                <Button onClick={() => onEditVolunteer(volunteer)}>Edit</Button>
              </StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </StyledTableContainer>
  );
};

export default VolunteerTable;
