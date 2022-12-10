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
    display: "flex",
    alignItems: "center",
    padding: 0,
})

export const NavbarListItem = styling("li") ({
    display: "inline-block",
    padding: "0 2rem",
    position: "relative",
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
    paddingLeft: "1.5rem",
    paddingRight: "1.5rem",
    fontWeight: 600,
    fontSize: "1.5rem",
    textTransform: "unset !important",
    backgroundColor: "#003486",
})

export const ProfileContainer = styling(Grid) ({
})

export const Profile = styling(Grid) ({
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
    cursor: "pointer"
})

export const ProfileAvatar = styling("img") ({
    borderRadius: "10rem",
})

export const ArrowPath = styling("path") ({
    transition: "0.3s ease-in-out",
})

export const DropdownContainer = styling(Grid) ({
    position: "absolute",
    right: 0,
    top: "5rem",
})

export const DropdownList = styling("ul") ({
    listStyle: "none",
    padding: 0,
})

export const DropdownListItem = styling("li") ({

})