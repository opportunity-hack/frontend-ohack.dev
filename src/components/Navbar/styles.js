import { Grid, Button, Link } from "@mui/material";
import { styled as styling } from "@mui/material";
import shadows from "@mui/material/styles/shadows";

export const NavbarContainer = styling(Grid)({
  justifyContent: "center",
  height: "9rem",
  width: "100%",
  background: "transparent",
  position: "absolute",
  zIndex: 300,
});

export const Navbar = styling(Grid)({
  justifyContent: "space-between",
  alignItems: "center",
  width: "75%",
});

export const NavbarList = styling("ul")({
  listStyle: "none",
  display: "flex",
  alignItems: "center",
  padding: 0,
  position: "relative",
});

export const NavbarListItem = styling("li")({
  display: "inline-block",
  padding: "0 2rem",
});

export const NavbarLink = styling(Link)({
  textDecoration: "none",
  fontSize: "1.5rem",
  fontWeight: 600,
  transitionDuration: "0.3s",
  "&:hover": {
    color: "#5c9bdb",
  },
});

// NEWTODO: Update colors to constants
export const LoginButton = styling(Button)({
  borderRadius: "2rem",
  paddingLeft: "1.5rem",
  paddingRight: "1.5rem",
  fontWeight: 600,
  fontSize: "1.5rem",
  textTransform: "unset !important",
  backgroundColor: "#003486",
});

export const LogoutButton = styling(Button)({
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
  fontWeight: 600,
  color: "#1976d2",
  cursor: "pointer",
});

export const ProfileAvatar = styling("img")({
  borderRadius: "10rem",
});

export const ArrowPath = styling("path")({
  transition: "0.2s ease-in-out",
});

export const DropdownContainer = styling(Grid)({
  position: "absolute",
  right: "1rem",
  top: "4.5rem",
  borderRadius: "7px",
  backgroundColor: "white",
//   boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
  border: "0.1px solid #949494a9",
  maxWidth: "12.5rem",
  width: "90%",
  fontSize: "1.4rem",
  fontWeight: 600,
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
  "&::before": {
    content: "''",
    display: "block",
    position: "absolute",
    width: 0,
    height: 0,
    border: "7px solid transparent",
    borderBottom: "7px solid #949494a9",
    top: -15,
    right: 10,
  },
});

export const DropdownList = styling("ul")({
  listStyle: "none",
  padding: 0,
  borderRadius: "1rem",
});

export const DropdownListItem = styling("li")({
  padding: "0.75rem 1.5rem",
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  color: "#1976d2",
  "&:hover": {
    color: "#5c9bdb",
  },
});

export const DropdownDivider = styling("div")({
  borderBottom: "1px solid #9494944a",
});
