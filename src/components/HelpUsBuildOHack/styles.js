import {
  Grid,
  Button,
  Typography,
  CircularProgress,
  Chip,
} from "@mui/material";
import { styled } from "@mui/material";


// help-us-build-ohack__title
export const HelpUsBuildOHackTitle = styled(Typography)({
    // Align center
    textAlign: "center",
    fontSize: "1.5rem",
    fontWeight: "600",
});

// help-us-build-ohack__description
export const HelpUsBuildOHackDescription = styled(Typography)({
    textAlign: "center",
    fontSize: "1.2rem",
    fontWeight: "400",
});

// help-us-build-ohack__link
export const HelpUsBuildOHackLink = styled(Button)({
    textTransform: "unset !important",
    backgroundColor: "#003486",
    color: "#ffffff",
    minWidth: "120px",
    borderRadius: "20px",
    marginTop: "3%",
    paddingLeft: "20px",
    paddingRight: "20px",
    fontSize: "15px",

    "&:hover": {
        backgroundColor: `var(--blue)`,
    },
});

// help-us-build-ohack
export const HelpUsBuildOHackContainer = styled(Grid)({    
    width: "400px",
    marginBottom: "5%",
    marginTop: "5%",
    padding: "2%",
    backgroundColor: "#f5f5f5",
    borderRadius: "20px",
    boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.75)",
    
});

// help-us-build-ohack__body
export const HelpUsBuildOHackBody = styled(Grid)({
    marginTop: "5%",
});
