import { Grid, Button, Typography } from "@mui/material";
import { styled as styling } from "@mui/material";

// Grid
export const OuterGrid = styling(Grid)({
  width: "80%",
  margin: "auto",
  minHeight: "70vh",
});

export const EventCards = styling(Grid)({
  borderRadius: "20px",
  backgroundColor: "white",
  width: "auto",
  height: "auto",
  padding: "2%",
  marginTop: "3%",
  maxWidth: "45%"
});

// Text
export const SectionTitle = styling(Typography)({
  fontSize: "3rem",
  fontWeight: "600",
});

export const EventTitle = styling(Typography)({
  fontSize: "1.5rem",
  fontWeight: "bold",
});

export const EventText = styling(Typography)({
  fontSize: "1.5rem",
  textTransform: "none",
});

export const EventGreyText = styling(Typography)({
  color: "grey",
  fontSize: "1rem",
  textTransform: "none",
});

// Button
export const EventButton = styling(Button)({})
