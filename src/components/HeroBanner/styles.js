import { 
  Grid, 
  Button, 
  Typography, 
  // Box 
} from "@mui/material";
import { styled, keyframes, css } from "@mui/material";

// Button
export const ButtonStyled = styled(Button)({
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

export const ButtonGoldStyle = styled(Button)({
  borderRadius: "2rem",
  paddingLeft: "1.5rem",
  paddingRight: "1.5rem",
  fontWeight: 600,
  fontSize: "15px",
  textTransform: "unset !important",
  backgroundColor: "#FFD700",
  color: "#000000",
  minWidth: "25rem",

  "&:hover": {
    backgroundColor: `var(--blue)`,
  },
});

export const ButtonBasicStyle = styled(Button)({
  borderRadius: "2rem",
  paddingLeft: "1.5rem",
  paddingRight: "1.5rem",
  fontWeight: 600,
  fontSize: "15px",
  textTransform: "unset !important",
  backgroundColor: "#E0E0E0",
  color: "#000000",
  minWidth: "25rem",

  "&:hover": {
    backgroundColor: `var(--blue)`,
  },
});

// Grid
export const GridStyled = styled(Grid)((props) => ({
  padding: "8rem 6rem 6rem 6rem",
  height: "100%",
  width: "80%",
  margin: "auto",

  [props.theme.breakpoints.down("lg")]: {
    padding: "8rem 0rem 6rem 0rem",
  },

  [props.theme.breakpoints.down("md")]: {
    width: "100%",
  },
}));

export const BlankContainer = styled(Grid)({
  display: "flex",
  flexDirection: "column",
  position: "relative",
});

export const TitleContainer = styled(Grid)((props) => ({
  padding: "6rem 5% 0px 0px",
  marginTop: "5rem",

  [props.theme.breakpoints.down("md")]: {
    padding: props.right === "true" ? "15% 5% 5% 5%" : "3rem 10px 0 10px",
    justifyContent: "center",
    textAlign: "center",
  },
}));

export const CaptionContainer = styled(Grid)((props) => ({
  color: "#425466",
  maxWidth: "390px",

  [props.theme.breakpoints.down("md")]: {
    display: "flex",
    minWidth: "100%",
    justifyContent: "center",
    textAlign: "center",
  },
}));

export const ButtonContainers = styled(Grid)((props) => ({
  display: "flex",
  flexDirection: "column",
  width: "auto",
  gap: "1rem",
}));

// Typography
export const TitleStyled = styled(Typography)((props) => ({
  fontSize: "4vw",
  lineHeight: "5vw",
  fontWeight: "700",
  color: "#333333",
  textShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
  letterSpacing: "-0.3rem",

  [props.theme.breakpoints.down("md")]: {
    fontSize: "8vw",
    lineHeight: "8.25vw",
  },
}));

export const TextStyled = styled(Typography)({
  fontSize: "1.5rem",
  margin: "2rem 0rem 1rem 0rem",
  width: "100%",
});

export const SpanText = styled("span") ((props) => ({
  color: `var(--blue)`,
  fontSize: "6.5vw",
  "& .Typewriter": {
    marginTop: "10px",
  },

  [props.theme.breakpoints.down("md")]: {
    fontSize: "10vw",
    lineHeight: "8.25vw",
  },
}));

export const BackgroundGrid = styled(Grid)({
  position: "absolute",
  width: "100%",
  height: "70rem",
  top: "-20rem",
  transform: "skewY(-10deg)",
  background: "linear-gradient(to bottom right, #58cffb 23%, #CCCCFF 89%)",
  zIndex: "-100",
});

const offset = keyframes`
  100% {
    stroke-dashoffset: 0;
  }
`
const fadeIn = keyframes`
  100% {
    opacity: 1;
  }
`

export const AnimatedLine = styled("path")`
  animation: ${offset} 5s 3.75s forwards infinite, ${fadeIn} 0.75s 3.25s forwards;
  opacity: 0;
  stroke-width: 18;
  stroke-linecap: square;
  stroke-dasharray: 10,43,10;
  stroke-dashoffset: 1010;
`

const animatedIcon = css`
  stroke-width: 10;
  stroke-linecap: round;
  stroke-linejoin: round;
  animation: ${offset} 3s forwards;
`

export const AnimatedHeart = styled("path")`
  ${animatedIcon};
  stroke-dasharray: 1130;
  stroke-dashoffset: 1130;
`

export const AnimatedLaptop = styled("path")`
${animatedIcon};
  stroke-dasharray: 2090;
  stroke-dashoffset: 2090;
`

export const AnimatedBulb = styled("path")`
  ${animatedIcon};
  stroke-dasharray: 1600;
  stroke-dashoffset: 1600;
`
