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
  paddingTop: "9rem",  
  backgroundColor: "white",
});

export const ContentContainer = styling(Grid)({
  flexDirection: "column",
  // width: "75%",
});

export const HeadlineDetails=styling(Grid)({

  border: '1px solid #e0e0e0', // Light border
  padding: '1rem',
  marginTop: '2rem' ,
  marginBottom: '2rem'


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

  [props.theme.breakpoints.down("md")]: {
    padding: "3.5rem 7.5%",
  },
}));

export const DetailsContainer = styling(Grid)({
  paddingRight: "0.5rem",
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
  letterSpacing: "0.05rem",
  padding: "0 0.5rem 0 1rem"  
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
  width: "75%",

  [props.theme.breakpoints.down("md")]: {
    width: "90%",
  },
}));

export const ProjectsGrid = styling(Grid)({
  display: "grid",
  // gridTemplateColumns: "1fr 1fr",
  columnGap: "3.5rem",
  rowGap: "3.5rem",
});
