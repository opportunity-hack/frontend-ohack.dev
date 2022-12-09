import { Grid, Button, Link } from "@mui/material";
import { styled as styling } from "@mui/material"

export const NavbarContainer = styling(Grid) ({
    justifyContent: "center",
    height: "80px",
    width: "100%",
    background: "transparent",
    position: "absolute",
    zIndex: 300,
})

export const Navbar = styling(Grid) ({
    justifyContent: "space-between",
    alignItems: "center",
    width: "75%",
})

export const NavbarList = styling(Grid) ({
    width: "25%",
    justifyContent: "space-between",
    alignItems: "center"
})

export const NavbarLink = styling(Link) ({
    textDecoration: "none",
})

// NEWTODO: Update colors to constants
export const LoginButton = styling(Button) ({
    borderRadius: "2rem",
    paddingLeft: "1.5rem",
    paddingRight: "1.5rem",
    fontWeight: 600,
    fontSize: "15px",
    textTransform: "unset !important",
    backgroundColor: "#003486",
})

export const LogoutButton = styling(Button) ({
    borderRadius: "2rem",
    lineHeight: "1rem",
    padding: "1rem",
    fontWeight: 600,
    fontSize: "15px",
    textTransform: "unset !important"
})