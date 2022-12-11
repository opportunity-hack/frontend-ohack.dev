import { Grid, Button, Link, Typography, Drawer, Box } from "@mui/material";
import { styled as styling } from "@mui/material";

export const NavbarContainer = styling(Grid)({
  justifyContent: "center",
  height: "9rem",
  width: "100%",
  background: "transparent",
  position: "absolute",
  zIndex: 300,
});

export const Navbar = styling(Grid)((props) => ({
  justifyContent: "space-between",
  alignItems: "center",
  width: "75%",

  [props.theme.breakpoints.down("md")]: {
    width: "90%",
  },
}));

export const NavbarList = styling("ul")({
  listStyle: "none",
  display: "flex",
  alignItems: "center",
  padding: 0,
  position: "relative",
});

export const NavbarListItem = styling("li")((props) => ({
  display: "inline-block",
  padding: "0 2rem",

  [props.theme.breakpoints.down("lg")]: {
    padding: "0 1.5rem",
  },
}));

export const NavbarLink = styling(Link)({
  textDecoration: "none",
  fontSize: "1.6rem",
  fontWeight: 700,
  letterSpacing: "0em",
  color: "#333333",
  transitionDuration: "0.3s",
  // textShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  // textTransform: "uppercase",
  "&:hover": {
    color: "#6a6a6a",
  },
});

export const LoginButton = styling(Button)({
  borderRadius: "2rem",
  paddingLeft: "1.5rem",
  paddingRight: "1.5rem",
  fontWeight: 600,
  fontSize: "1.5rem",
  textTransform: "unset !important",
  backgroundColor: "#003486",
});

export const ProfileContainer = styling(Grid)({});

export const Profile = styling(Grid)({
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

export const ProfileAvatar = styling("img")({
  borderRadius: "10rem",
});

export const ArrowPath = styling("path")({
  transition: "0.2s ease-in-out",
});

export const DropdownContainer = styling(Grid)((props) => ({
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

export const DropdownList = styling("ul")({
  listStyle: "none",
  padding: 0,
  borderRadius: "1rem",
  cursor: "default",
});

export const DropdownListItem = styling("li")({
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

export const DropdownDivider = styling("div")({
  borderBottom: "1px solid #9494944a",
});

export const DetailListItem = styling("li")({
  padding: "0.75rem 1.5rem",
});

export const DetailTypography = styling(Typography)({
  fontWeight: 600,
  display: "block",
});

export const DrawerContainer = styling(Box)({
  width: "20rem",

  "& span": {
    fontSize: "1.5rem",
  },
});

export const LogoText = styling(Typography)({
  position: "absolute",
  bottom: "1rem",
  left: "1rem",
  color: "gray",
});
