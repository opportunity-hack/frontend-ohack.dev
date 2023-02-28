import {
  Grid,
  Button,
  Typography,
  CircularProgress,
  Chip,
} from "@mui/material";
import { styled as styling } from "@mui/material";

// Grid
export const OuterGrid = styling(Grid)((props) => ({
  width: "85%",
  margin: "auto",
  marginBottom: "5%",

  [props.theme.breakpoints.down("md")]: {
    marginBottom: "15%",
  },
}));

export const EmptyGrid = styling(Grid)({
  gap: "30px",
  marginTop: "5%",
});

export const EventCards = styling(Grid)((props) => ({
  borderRadius: "20px",
  backgroundColor: "white",
  height: "auto",
  padding: "2%",
  maxWidth: "30%",
  boxShadow: "10px",
  backgroundColor: "#e6f7ff",
  borderRadius: "15px",
  // margin: "3% 2% 2% 0%",

  [props.theme.breakpoints.down("md")]: {
    maxWidth: "100%",
    width: "100%",
    marginTop: "3%",
  },
}));

export const ButtonContainer = styling(Grid)({
  width: "100%",
  // gap: "25px"
});

export const ProgressContainer = styling(Grid)({
  margin: "5% 0%",
});

export const ProgressBarHolder = styling(Grid)({
  width: "20%",
  height: "20%",
});

export const BlankContainer = styling(Grid)({});

export const ThankYouContainer = styling(Grid)({
  marginTop: "5%",
});

// Text
export const SectionTitle = styling(Typography)({
  fontSize: "3rem",
  fontWeight: "600",
});

export const EventTitle = styling(Typography)({
  // fontSize: "1.5rem",
  fontWeight: "bold",
});

export const EventText = styling(Typography)({
  fontSize: "1.5rem",
  textTransform: "none",
});

export const EventGreyText = styling(Typography)({
  color: "grey",
  fontSize: "1.2rem",
  textTransform: "none",
});

export const TypographyStyled = styling(Typography)({});

// Button
export const EventButton = styling(Button)({
  textTransform: "unset !important",
  backgroundColor: "#003486",
  color: "#ffffff",
  minWidth: "120px",
  borderRadius: "20px",
  marginTop: "3%",
  fontSize: "15px",

  "&:hover": {
    backgroundColor: `var(--blue)`,
  },
});

// Progress
export const ProgressIndicator = styling(CircularProgress)({});

// Chip
export const ChipStyled = styling(Chip)({});
