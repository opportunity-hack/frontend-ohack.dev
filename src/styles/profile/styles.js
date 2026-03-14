import { Grid, Typography } from "@mui/material";
import { styled as styling } from "@mui/material";

export const LayoutContainer = styling(Grid)(({ theme }) => ({
    justifyContent: "center",
    alignItems: "center",
    paddingTop: "6rem",
    overflowX: "hidden",
    maxWidth: "100%",
    [theme.breakpoints.down("sm")]: {
        paddingTop: "2rem",
    },
}));

export const InnerContainer = styling(Grid)(({ theme }) => ({
    width: "95%",
    maxWidth: "100%",
    boxSizing: "border-box",
    overflowX: "hidden",
    [theme.breakpoints.down("sm")]: {
        width: "100%",
    },
}))

export const ProfileAvatar = styling("img")({
  borderRadius: "10rem",
});

export const ProfileContainer = styling(Grid)(({ theme }) => ({
  padding: "1rem",
  boxSizing: "border-box",
  maxWidth: "100%",
  [theme.breakpoints.down("sm")]: {
    padding: "0.5rem",
  },
}))

export const ProfileHeader = styling(Grid) ({
  gap: "1.5rem",
  flexWrap: "wrap",
})

export const ProfileHeadline = styling(Grid) ({
  display: "flex",
  flexDirection: "column",
})

export const ProfileDetailText = styling(Typography) ({
  color: "gray",
  fontSize: "1.4rem",
})

export const ProfileButton = styling(Typography) ({
  textDecoration: "none",
  fontSize: "1.5rem",
  textAlign: "center",
  marginTop: "1rem",
})