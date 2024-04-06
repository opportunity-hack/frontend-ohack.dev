import { Grid, Typography } from "@mui/material";
import { styled as styling } from "@mui/material";

export const LayoutContainer = styling(Grid) ({
    justifyContent: "center",
    alignItems: "center",
    paddingTop: "6rem",
});

export const InnerContainer = styling(Grid) ({
    width: "95%"

})

export const ProfileAvatar = styling("img")({
  borderRadius: "10rem",
});

export const ProfileContainer = styling(Grid) ({
  padding: "1rem",
})

export const ProfileHeader = styling(Grid) ({
  gap: "1.5rem",
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