import {
  Button,
  Grid,
  Typography,
  css,
  keyframes,
  styled,  
} from "@mui/material";

// Primary CTA — bold, filled, prominent
export const ButtonPrimary = styled(Button)((props) => ({
  borderRadius: "2rem",
  paddingLeft: "2rem",
  paddingRight: "2rem",
  fontWeight: 700,
  fontSize: "16px",
  textTransform: "unset !important",
  backgroundColor: "var(--color3)",
  color: "#ffffff",
  minHeight: "48px",
  whiteSpace: "nowrap",
  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  transition: "transform 0.2s, box-shadow 0.2s",
  width: "100%",
  maxWidth: "320px",
  boxSizing: "border-box",

  [props.theme.breakpoints.down("md")]: {
    maxWidth: "100%",
  },

  "&:hover": {
    backgroundColor: "var(--color3)",
    transform: "translateY(-1px)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  },
}));

// Secondary — outlined, medium emphasis
export const ButtonSecondary = styled(Button)((props) => ({
  borderRadius: "2rem",
  paddingLeft: "1.5rem",
  paddingRight: "1.5rem",
  fontWeight: 600,
  fontSize: "14px",
  textTransform: "unset !important",
  backgroundColor: "transparent",
  color: "var(--color3)",
  border: "2px solid var(--color3)",
  minHeight: "44px",
  whiteSpace: "nowrap",
  transition: "background-color 0.2s, color 0.2s",
  boxSizing: "border-box",
  flex: "1 1 auto",

  [props.theme.breakpoints.down("md")]: {
    width: "100%",
  },

  "&:hover": {
    backgroundColor: "var(--color3)",
    color: "#ffffff",
    border: "2px solid var(--color3)",
  },
}));

// Tertiary — text-like, subtle, small
export const ButtonTertiary = styled(Button)((props) => ({
  borderRadius: "1rem",
  paddingLeft: "0.75rem",
  paddingRight: "0.75rem",
  fontWeight: 500,
  fontSize: "13px",
  textTransform: "unset !important",
  backgroundColor: "transparent",
  color: "#555555",
  minHeight: "36px",
  whiteSpace: "nowrap",
  transition: "color 0.2s, background-color 0.2s",

  "&:hover": {
    backgroundColor: "rgba(0,0,0,0.04)",
    color: "var(--color3)",
  },
}));

// Grid
export const GridStyled = styled(Grid)((props) => ({
  padding: "0.5rem 0",
  height: "100%",
  width: "100%",
  margin: "auto",
  justifyContent: "center",
}));

export const BlankContainer = styled(Grid)({
  display: "flex",
  flexDirection: "column",
  position: "relative",
  alignItems: "center",
  justifyContent: "center",
});

export const TitleContainer = styled(Grid)((props) => ({
  padding: "0.5rem 2% 0px 0px",
  marginTop: "0rem",
  minHeight: '120px',
  alignItems: "center",
  justifyContent: "center",

  [props.theme.breakpoints.down("md")]: {
    padding: props.right === "true" ? "10% 5% 5% 5%" : "2rem 2px 0 10px",
    justifyContent: "center",
    textAlign: "center",
    minHeight: '180px',
  },
}));

export const CaptionContainer = styled(Grid)((props) => ({
  color: "#425466",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
}));

export const ButtonContainers = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100%",
  maxWidth: "480px",
  margin: "0 auto",
  gap: "0.625rem",
});

export const ButtonRow = styled("div")((props) => ({
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  gap: "0.5rem",
  justifyContent: "center",
  width: "100%",

  [props.theme.breakpoints.down("md")]: {
    flexDirection: "column",
    alignItems: "stretch",
  },
}));

// Row that stays horizontal on all screen sizes (for small text-like buttons)
export const ButtonRowInline = styled("div")({
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  gap: "0.25rem",
  justifyContent: "center",
});


export const TitleStyled = styled(Typography)(({ theme }) => ({
  fontDisplay: "swap",
  fontSize: "clamp(17px, 2.5vw, 20px)",
  lineHeight: 1.15,
  fontWeight: 300,
  color: "#333333",
  textShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
  letterSpacing: "-0.03em",
  textAlign: "center",
  maxWidth: "100%",
  margin: "0 auto",
  padding: "8px 14px",

  "& .highlight": {
    color: theme.palette.primary.main,
    display: "inline",
    fontWeight: 600,
  },

  [theme.breakpoints.down("md")]: {
    fontSize: "clamp(15px, 5vw, 19px)",
  },
}));

export const TextStyled = styled(Typography)({
  fontDisplay: "swap",
  fontSize: "1.5rem",  
  marginTop: "0.8rem",
  marginBottom: "0.8rem",
  width: "100%",
  textAlign: "center",
  
});

export const SpanText = styled("span") ((props) => ({
  fontDisplay: "swap",
  color: `var(--blue)`,
  fontSize: "1em",  
  "& .Typewriter": {
    marginTop: "4px",
  },

  [props.theme.breakpoints.down("md")]: {
    fontSize: "4vw",
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
