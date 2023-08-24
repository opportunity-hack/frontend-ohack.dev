import { Link, Typography } from "@mui/material";
import Card from "@mui/material/Card";
import { styled } from "@mui/material";

export const TileLink = styled(Link)({
  padding: "4rem",
  textDecoration: "none",
  transition: "all 0.2s ease-out",
  backgroundColor: "#fafbfb",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.15)",
  "&:hover": {
    transform: "scale(1.01)",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
  },
});

export const NonProfitHackathonTileLink = styled(Card)({
  padding: "0rem",
  margin: "0.2rem",
  
  maxWidth: 330,
  minHeight: 400,


  textDecoration: "none",
  transition: "all 0.2s ease-out",  
  boxShadow: "0 2px 4px rgba(24, 14, 14, 0.15)",
  "&:hover": {
    transform: "scale(1.01)",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
  },          
  backgroundColor: "#fafbfb",    
});

export const NonProfitName = styled(Typography)({
  fontWeight: 600,
  letterSpacing: "-0.05rem",
  fontSize: "2.4rem",
});

export const CountDetailsText = styled(Typography)({
  marginTop: "0.75rem",
  fontSize: "1.75rem",
  fontWeight: 500,
  color: "gray",
});

export const NonProfitDescText = styled(Typography)({
  color: "#383838",
  margin: "3rem 0",
  fontWeight: "500",
  fontSize: "1.5rem",
  lineHeight: "2.5rem",
});
