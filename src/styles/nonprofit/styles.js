import {
  Grid,
  Typography,
  Chip,
  Link,
  Button,
  // TODO: Are we planning to do anything thematically with Tooltip?
  // Tooltip
} from "@mui/material";
import { styled as styling } from "@mui/material";

export const MoreNewsStyle = styling(Button)({
  borderRadius: "12px",
  paddingLeft: "10.8px",
  paddingRight: "10.8px",
  fontWeight: 600,
  fontSize: "12px",
  textTransform: "unset !important",
  backgroundColor: "#E0E0E0",
  color: "#000000",

  "&:hover": {
    backgroundColor: `var(--blue)`,
  },
});

export const ApplyButton = styling(Button)({
  borderRadius: "24px",
  paddingLeft: "18px",
  paddingRight: "18px",
  fontWeight: 600,
  fontSize: "15px",
  textTransform: "unset !important",
  backgroundColor: "#FFD700",
  color: "#000000",
  minWidth: "300px",

  "&:hover": {
    backgroundColor: `var(--blue)`,
  },
});

export const ApplyButtonContainer = styling(Grid)({
  paddingTop: "12px",
});

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
  flexDirection: "column",

  [props.theme.breakpoints.down("md")]: {
    padding: "42px 7.5%",
  },
}));

export const DetailsContainer = styling(Grid)({
  paddingRight: "72px",
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
  paddingBottom: "12px",
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
  padding: "12px 0",
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
    width: "99%",
  },
}));

export const ProjectsGrid = styling(Grid)({
  display: "grid",
  // gridTemplateColumns: "1fr 1fr",

  columnGap: "42px",
  rowGap: "42px",
});
