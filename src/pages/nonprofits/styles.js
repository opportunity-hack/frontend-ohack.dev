import { Grid, Button, Link, Typography } from "@mui/material";
import { styled as styling } from "@mui/material";

export const ContentContainer = styling(Grid) ({
    justifyContent: "center",
    paddingTop: "9rem",
})

export const InnerContainer = styling(Grid) ({
    width: "75%"
})

export const NonProfitContainer = styling(Grid) ({
    padding: "4rem 0rem",
})

export const NonProfitGrid = styling(Grid) ({
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    columnGap: "2.5rem",
    rowGap: "2.5rem",
})