    import { Grid, Button, Link } from "@mui/material";
import { styled as styling } from "@mui/material"

export const NavbarContainer = styling(Grid) ({
    justifyContent: "center",
    height: "8rem",
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

export const NavbarList = styling("ul") ({
    listStyle: "none",
    alignItems: "center",
    padding: 0,
})

export const NavbarListItem = styling("li") ({
    display: "inline-block",
    padding: "0 2rem",
})

export const NavbarLink = styling(Link) ({
    textDecoration: "none",
    fontSize: "1.5rem",
    fontWeight: 600,
    transitionDuration: "0.3s",
    "&:hover": {
        color: "#5c9bdb"
    },
})

// NEWTODO: Update colors to constants
export const LoginButton = styling(Button) ({
    borderRadius: "2rem",
    paddingLeft: "1.5rem",
    paddingRight: "1.5rem",
    fontWeight: 600,
    fontSize: "1.5rem",
    textTransform: "unset !important",
    backgroundColor: "#003486",
})

export const LogoutButton = styling(Button) ({
    borderRadius: "2rem",
    lineHeight: "1rem",
    padding: "1rem",
    fontWeight: 600,
    fontSize: "1.5px",
    textTransform: "unset !important"
})