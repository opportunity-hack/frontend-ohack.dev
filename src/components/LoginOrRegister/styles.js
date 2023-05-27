import { Grid, Typography } from "@mui/material";
import { styled as styling } from "@mui/material";
import { Button } from "@mui/material";
import Link from "next/link";


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

export const ButtonStyledWithLink = styling(Link)({
    color: "#ffffff",
});