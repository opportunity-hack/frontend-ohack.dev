import {
  Grid,
  Button,
  Typography,
  CircularProgress,
  Chip,
} from "@mui/material";
import { styled } from "@mui/material";

// Grid
export const OuterGrid = styled(Grid)((props) => ({
  width: "85%",
  margin: "auto",
  marginBottom: "5%",

  [props.theme.breakpoints.down("md")]: {
    marginBottom: "15%",
  },
}));

export const EmptyGrid = styled(Grid)({
  gap: "30px",
  marginTop: "5%",
});

export const EventCards = styled(Grid)((props) => ({
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

export const ButtonContainer = styled(Grid)({
  width: "100%",
  // gap: "25px"
});

export const ProgressContainer = styled(Grid)({
  margin: "5% 0%",
});

export const ProgressBarHolder = styled(Grid)({
  width: "20%",
  height: "20%",
});

export const BlankContainer = styled(Grid)({});

export const ThankYouContainer = styled(Grid)({
  marginTop: "5%",
});

// Text
export const SectionTitle = styled(Typography)({
  fontSize: "3rem",
  fontWeight: "600",
});

export const EventTitle = styled(Typography)({
  // fontSize: "1.5rem",
  fontWeight: "bold",
});

export const EventText = styled(Typography)({
  fontSize: "1.5rem",
  textTransform: "none",
});

export const EventGreyText = styled(Typography)({
  color: "grey",
  fontSize: "1.2rem",
  textTransform: "none",
});

export const TypographyStyled = styled(Typography)({});

// Button
export const EventButton = styled(Button)({
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
export const ProgressIndicator = styled(CircularProgress)({});

// Chip
export const ChipStyled = styled(Chip)({});
