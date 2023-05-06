import { 
  Grid, 
  Button, 
  Link, 
  Typography, 
  //Drawer,
   Box 
} from "@mui/material";
import { styled } from "@mui/material";

export const LogoContainer = styled(Grid)({
  width: "150px",
  height: "32px",
  "@media (min-width: 768px)": {  
    width: "120px",
    height: "72px"
  },
  "@media (min-width: 992px)": {
    width: "90px",
    height: "63px"
  }
});

export const NavbarContainer = styled(Grid)({
  justifyContent: "center",
  height: "9rem",
  width: "100%",
  background: "transparent",
  position: "absolute",
  zIndex: 300,
});

export const Navbar = styled(Grid)((props) => ({
  justifyContent: "space-between",
  alignItems: "center",
  width: "75%",

  [props.theme.breakpoints.down("md")]: {
    width: "90%",
  },
}));

export const NavbarList = styled("ul")({
  listStyle: "none",
  display: "flex",
  alignItems: "center",
  padding: 0,
  position: "relative",
});

export const NavbarListItem = styled("li")((props) => ({
  display: "inline-block",
  padding: "0 2rem",

  [props.theme.breakpoints.down("lg")]: {
    padding: "0 1.5rem",
  },
}));

export const NavbarLink = styled(Link)({
  textDecoration: "none",
  fontSize: "1.6rem",
  fontWeight: 700,
  letterSpacing: "0em",
  color: "#333333",
  transitionDuration: "0.3s",
  
  "&:hover": {
    color: "#6a6a6a",
  },
});

export const LoginButton = styled(Button)({
  borderRadius: "2rem",
  paddingLeft: "1.5rem",
  paddingRight: "1.5rem",
  fontWeight: 600,
  fontSize: "1.5rem",
  textTransform: "unset !important",
  backgroundColor: "#003486",
});

export const ProfileContainer = styled(Grid)({});

export const Profile = styled(Grid)({
  userSelect: "none",
  fontSize: "1.4rem",
  alignItems: "center",
  justifyContent: "space-between",
  width: "110%",
  borderRadius: "5rem",
  backgroundColor: "#ffffff2e",
  padding: "0.5rem 0.75rem",
  transition: "all 0.5s",
  cursor: "pointer",
});

export const ProfileAvatar = styled("img")({
  borderRadius: "10rem",
});

export const ArrowPath = styled("path")({
  transition: "0.2s ease-in-out",
});

export const DropdownContainer = styled(Grid)((props) => ({
  position: "absolute",
  right: "1rem",
  top: "4.5rem",
  borderRadius: "7px",
  backgroundColor: "white",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
  // border: "0.1px solid #949494a9",
  maxWidth: "14rem",
  width: "90%",
  fontSize: "1.4rem",
  zIndex: 50,
  "&::after": {
    content: "''",
    display: "block",
    position: "absolute",
    width: 0,
    height: 0,
    border: "7px solid transparent",
    borderBottom: "7px solid white",
    top: -14,
    right: 10,
  },
  // "&::before": {
  //   content: "''",
  //   display: "block",
  //   position: "absolute",
  //   width: 0,
  //   height: 0,
  //   border: "7px solid transparent",
  //   borderBottom: "7px solid white",
  //   top: -14,
  //   right: 10,
  // },

  [props.theme.breakpoints.down("md")]: {
    right: "5rem",
  },
}));

export const DropdownList = styled("ul")({
  listStyle: "none",
  padding: 0,
  borderRadius: "1rem",
  cursor: "default",
});

export const DropdownListItem = styled("li")({
  padding: "0.75rem 1.5rem",
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  color: "#2c2c2c",
  transition: "0.25s",
  "&:hover": {
    color: "#494949",
    backgroundColor: "#fafafa",
  },
});

export const DropdownDivider = styled("div")({
  borderBottom: "1px solid #9494944a",
});

export const DetailListItem = styled("li")({
  padding: "0.75rem 1.5rem",
});

export const DetailTypography = styled(Typography)({
  fontWeight: 600,
  display: "block",
});

export const DrawerContainer = styled(Box)({
  width: "20rem",

  "& span": {
    fontSize: "1.5rem",
  },
});

export const LogoText = styled(Typography)({
  position: "absolute",
  bottom: "1rem",
  left: "1rem",
  color: "gray",
});
