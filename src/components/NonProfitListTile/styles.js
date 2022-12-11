import { Grid, Button, Link, Typography } from "@mui/material";
import { styled as styling } from "@mui/material";

export const TileLink = styling(Link)({
  padding: "4rem",
  textDecoration: "none",
  transition: "all 0.2s ease-out",
  backgroundColor: "#fafbfb",
  borderTop: "2px solid #66cefb",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.15)",
  "&:hover": {
    transform: "scale(1.025)",
    borderTop: "4px solid #66cefb",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
  },
});

export const NonProfitName = styling(Typography)({
  fontWeight: 600,
  letterSpacing: "-0.05rem",
  fontSize: "2.4rem",
});

export const CountDetailsText = styling(Typography)({
  marginTop: "0.75rem",
  fontSize: "1.75rem",
  fontWeight: 500,
  color: "gray",
});

export const NonProfitDescText = styling(Typography)({
  color: "#383838",
  margin: "3rem 0",
  fontWeight: "500",
  fontSize: "1.5rem",
  lineHeight: "2.5rem",
});
