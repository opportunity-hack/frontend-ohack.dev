import {
  Grid,
  Typography,
  Chip,
  Link,
  // TODO: Are we planning on doing anything with Tooltip thematically?
  // Tooltip
} from "@mui/material";
import { styled as styling } from "@mui/material";

export const LayoutContainer = styling(Grid)({
  justifyContent: "center",
  alignContent: "center",
  paddingTop: "108px",
  backgroundColor: "white",
});

export const ContentContainer = styling(Grid)({
  flexDirection: "column",
  // width: "75%",
});

export const HeadlineDetails = styling(Grid)({
  padding: "12px",
  marginTop: "24px",
  marginBottom: "24px",
  borderBottom: "2px solid #c0c0c0", // Slightly darker bottom border
  borderTop: "1px solid #e0e0e0",
  borderLeft: "1px solid #e0e0e0",
  borderRight: "1px solid #e0e0e0",
  width: "100vw",
});

export const TitleBanner = styling(Grid)({
  width: "100%",
  height: "240px",
  // backgroundAttachment: "fixed",
  // backgroundPosition: "center",
  // backgroundRepeat: "no-repeat",
  // backgroundSize: "cover",
  "& .react-parallax": {
    height: "100%",
    width: "100%",
  },
});

export const TitleContainer = styling(Grid)((props) => ({
  backgroundColor: "#f5f7f7",
  padding: "42px 12.5%",
  borderBottom: "1px solid #e7e7e7",

  [props.theme.breakpoints.down("md")]: {
    padding: "42px 7.5%",
  },
}));

export const DetailsContainer = styling(Grid)({
  paddingRight: "6px",
});

export const CardContainer = styling(Grid)({
  backgroundColor: "white",
  padding: "36px",
});

export const TitleStyled = styling(Typography)({
  fontWeight: "500",
  alignItems: "center",
  display: "flex",
  paddingBottom: "12px",
});

export const TitleChipContainer = styling(Grid)((props) => ({
  display: "flex",
  alignItems: "center",
  //   flexDirection: "column",

  [props.theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
}));

export const ProjectsChip = styling(Chip)((props) => ({
  fontSize: "15px",
  marginLeft: "36px",
  letterSpacing: "0.6px",
  padding: "0 6px 0 12px",

  [props.theme.breakpoints.down("sm")]: {
    marginLeft: "0",
  },
}));

export const DescriptionStyled = styling(Typography)({
  fontSize: "15px",
  letterSpacing: "0.6px",
  padding: "0 6px 0 12px",
});

export const ChannelChip = styling(Chip)({
  padding: "0",
  fontSize: "15px",
  fontWeight: 500,
  height: "27px",
  borderRadius: "6px",
  backgroundColor: "white",
  "& span": {
    padding: "0 4.8px",
  },
});
export const LinkStyled = styling(Link)({
  textDecoration: "none",
});

export const ProjectsContainer = styling(Grid)((props) => ({
  width: "75%",

  [props.theme.breakpoints.down("md")]: {
    width: "90%",
  },
}));

export const ProjectsGrid = styling(Grid)({
  display: "grid",
  // gridTemplateColumns: "1fr 1fr",
  columnGap: "42px",
  rowGap: "42px",
});
