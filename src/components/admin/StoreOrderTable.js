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

const statusColorMap = {
  new: "warning",
  processing: "info",
  shipped: "primary",
  delivered: "success",
  cancelled: "error",
};

const columns = [
  { id: "timestamp", label: "Date", minWidth: 100 },
  { id: "id", label: "Order ID", minWidth: 100 },
  { id: "customerName", label: "Customer", minWidth: 120 },
  { id: "customerEmail", label: "Email", minWidth: 140 },
  { id: "itemCount", label: "Items", minWidth: 60 },
  { id: "total", label: "Total", minWidth: 80 },
  { id: "status", label: "Status", minWidth: 100 },
  { id: "trackingNumber", label: "Tracking", minWidth: 100 },
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

const getCellValue = (order, columnId) => {
  switch (columnId) {
    case "itemCount":
      return (order.items || []).length;
    case "id":
      return (order.id || "").substring(0, 8);
    default:
      return order[columnId];
  }
};

const StoreOrderTable = ({
  orders,
  orderBy,
  order,
  onRequestSort,
  onViewOrder,
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
            <StyledTableCell style={{ minWidth: 80 }}>Actions</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + 1} align="center">
                No orders found.
              </TableCell>
            </TableRow>
          ) : (
            orders.map((ord) => (
              <StyledTableRow key={ord.id}>
                {columns.map((column) => (
                  <StyledTableCell key={column.id} data-label={column.label}>
                    {column.id === "status" ? (
                      <Chip
                        label={ord.status || "new"}
                        color={statusColorMap[ord.status] || "warning"}
                        size="small"
                        sx={{ textTransform: "capitalize" }}
                      />
                    ) : column.id === "timestamp" ? (
                      formatDate(ord.timestamp)
                    ) : column.id === "total" ? (
                      `$${(ord.total || 0).toFixed(2)}`
                    ) : column.id === "trackingNumber" ? (
                      ord.trackingNumber ? (
                        <Tooltip title={`${ord.trackingCarrier || ""} ${ord.trackingNumber}`}>
                          <Chip
                            label={ord.trackingCarrier || "Tracked"}
                            size="small"
                            variant="outlined"
                            color="success"
                          />
                        </Tooltip>
                      ) : (
                        "-"
                      )
                    ) : (
                      <Tooltip title={String(getCellValue(ord, column.id) || "")}>
                        <span>
                          {String(getCellValue(ord, column.id) || "-").length > 25
                            ? String(getCellValue(ord, column.id) || "").substring(0, 25) + "..."
                            : getCellValue(ord, column.id) || "-"}
                        </span>
                      </Tooltip>
                    )}
                  </StyledTableCell>
                ))}
                <StyledTableCell data-label="Actions">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => onViewOrder(ord)}
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

export default StoreOrderTable;
