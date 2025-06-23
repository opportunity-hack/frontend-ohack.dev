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

export const ButtonBasicStyle = styling(Button)({
  borderRadius: "2rem",
  paddingLeft: "1.5rem",
  paddingRight: "1.5rem",
  fontWeight: 600,
  fontSize: "15px",
  textTransform: "unset !important",
  backgroundColor: "#E0E0E0",
  color: "#000000",
  minWidth: "25rem",

  "&:hover": {
    backgroundColor: `var(--blue)`,
  },
});

export const MoreNewsStyle = styling(Button)({
  borderRadius: "1rem",
  paddingLeft: "0.9rem",
  paddingRight: "0.9rem",
  fontWeight: 600,  
  fontSize: "12px",
  textTransform: "unset !important",
  backgroundColor: "#E0E0E0",
  color: "#000000",
  

  "&:hover": {
    backgroundColor: `var(--blue)`,
  },
});

export const LayoutContainer = styling(Grid)({
  justifyContent: "center",
  alignContent: "center",
  paddingTop: "9rem",    
  backgroundColor: "white",
  
  width: "95%",
});

export const ContentContainer = styling(Grid)({
  flexDirection: "column",
  // width: "75%",
});

export const TitleBanner = styling(Grid)({
  width: "100%",
  height: "20rem",
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
  padding: "3.5rem 12.5%",
  borderBottom: "1px solid #e7e7e7",
  flexDirection: "column",

  [props.theme.breakpoints.down("md")]: {
    padding: "3.5rem 7.5%",
  },
}));

export const DetailsContainer = styling(Grid)({
  paddingRight: "6rem",
});

export const CardContainer = styling(Grid)({
  backgroundColor: "white",
  padding: "3rem",
});

export const TitleStyled = styling(Typography)({
  fontWeight: "500",
  alignItems: "center",
  display: "flex",
  paddingBottom: "1rem",
});

export const TitleChipContainer = styling(Grid)((props) => ({
  display: "flex",
  alignItems: "center",
  paddingBottom: "1rem",
  //   flexDirection: "column",

  [props.theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
}));

export const ProjectsChip = styling(Chip)((props) => ({
  fontSize: "1.25rem",
  marginLeft: "3rem",
  letterSpacing: "0.05rem",
  padding: "0 0.5rem 0 1rem",

  [props.theme.breakpoints.down("sm")]: {
    marginLeft: "0",
  },
}));

export const DescriptionStyled = styling(Typography)({
  fontSize: "1.25rem",
  padding: "1rem 0",
});

export const ChannelChip = styling(Chip)({
  padding: "0",
  fontSize: "1.25rem",
  fontWeight: 500,
  height: "2.25rem",
  borderRadius: "0.5rem",
  backgroundColor: "white",
  "& span": {
    padding: "0 0.4rem",
  },
});
export const LinkStyled = styling(Link)({
  textDecoration: "none",
});

export const ProjectsContainer = styling(Grid)((props) => ({
  width: "100%",
  justifyContent: "center",
  padding: "0 0",
  
  
  [props.theme.breakpoints.down("md")]: {
    width: "99%"  
  },
}));

export const ProjectsGrid = styling(Grid)({
  display: "grid",  
  // gridTemplateColumns: "1fr 1fr",
  
  columnGap: "3.5rem",
  rowGap: "3.5rem",
});
