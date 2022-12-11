import { Grid, Typography, Chip, Link } from '@mui/material'
import { styled as styling } from "@mui/material";

export const LayoutContainer = styling(Grid) ({
    justifyContent: "center",
    alignContent: "center",
    paddingTop: "9rem",
    backgroundColor: "white",
})

export const ContentContainer = styling(Grid) ({
    flexDirection: "column",
    // width: "75%",
})

export const TitleBanner = styling(Grid) ({
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
})

export const TitleContainer = styling(Grid) ({
    backgroundColor: "#f5f7f7",
    padding: "3.5rem 12.5%",
    borderBottom: "1px solid #e7e7e7",
})

export const DetailsContainer = styling(Grid) ({
    paddingRight: "6rem"
})

export const CardContainer = styling(Grid) ({
    backgroundColor: "white",
    padding: "3rem",
})

export const TitleStyled = styling(Typography) ({
    fontWeight: "500",
    alignItems: "center",
    display: "flex",
    paddingBottom: "1rem"
})

export const ProjectsChip = styling(Chip) ({
    fontSize: "1.25rem",
    marginLeft: "3rem",
    letterSpacing: "0.05rem",
    padding: "0 0.5rem 0 1rem",
})

export const DescriptionStyled = styling(Typography) ({
    fontSize: "1.25rem",
    padding: "1rem 0",
})

export const ChannelChip = styling(Chip) ({
    padding: "0",
    fontSize: "1.25rem",
    fontWeight: 500,
    height: "2.25rem",
    borderRadius: "0.5rem",
    backgroundColor: "white",
    "& span": {
        padding: "0 0.4rem",
    }
})

export const LinkStyled = styling(Link) ({
    textDecoration: "none",
})

export const ProjectsContainer = styling(Grid) ({
    width: "80%",

})