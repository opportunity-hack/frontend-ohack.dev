import { Grid, Typography } from "@mui/material";
import { styled as styling } from "@mui/material";
import { Button } from "@mui/material";


export const ButtonStyled = styling(Button)({
    borderRadius: "2rem",
    paddingLeft: "1.5rem",
    paddingRight: "1.5rem",
    fontWeight: 600,
    fontSize: "15px",
    textTransform: "unset !important",
    backgroundColor: "#003486",
    color: "#ffffff",
    minWidth: "25rem",

    "&:hover": {
        backgroundColor: `var(--blue)`,
    },
});

export const SlackLink = styling("a")({
    textDecoration: "none",
    color: "blue",    
    textAlign: "center",        
    "&:hover": {
        backgroundColor: "#e0e0e0",
    }
});

export const ImageBorder = styling("div")({
    border: "1px solid black",    
    borderRadius: '5px', overflow: 'hidden'
    
});

export const LayoutContainer = styling(Grid)({
    justifyContent: "center",
    alignItems: "center",
    paddingTop: "9rem",
});

export const InnerContainer = styling(Grid)({
    width: "75%"

})

export const SlackSignupAvatar = styling("img")({
    borderRadius: "10rem",
});

export const SlackSignupContainer = styling(Grid)({
    padding: "2rem",
})

export const SlackSignupHeader = styling(Grid)({
    gap: "2rem",
})

export const SlackSignupHeadline = styling(Grid)({
    display: "flex",
    flexDirection: "column",
})

export const SlackSignupDetailText = styling(Typography)({
    color: "gray",
    fontSize: "1.4rem",
})

export const SlackSignupButton = styling(Button)({
    textDecoration: "none",
    fontSize: "1.5rem",
    textAlign: "center",
    marginTop: "1rem",
    alignContent: "center",
    alignItems: "center",
    justifyContent: "center",    
})