import { 
  Grid, 
  Button, 
  Typography, 
  Box 
} from "@mui/material";
import { styled, keyframes, css } from "@mui/material";

// Slack button that is smaller than the other buttons and simple
export const SlackButton = styled(Button)({
  marginLeft: "1rem",
  
  marginTop: "0.5rem",
  fontWeight: 200,
  padding: "0.5rem 0.9rem",
  fontSize: "12px",
  textTransform: "unset !important",  
  
  "&:hover": {
    backgroundColor: `var(--blue)`,
  },
});

// Slack button that is smaller than the other buttons and simple
export const NewsLinkButton = styled(Button)({
  marginLeft: "1rem",
  borderRadius: "2rem",  
  marginTop: "0.5rem",

  fontWeight: 200,
  fontSize: "12px",
  textTransform: "unset !important",  
  
  "&:hover": {
    backgroundColor: `var(--blue)`,
  },
});

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

export const StyledLink = styled(Button)({
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

export const StyledTextLink = styled(Button)({    
  fontWeight: 600,
  fontSize: "15px",
  margin: "0px",
  padding: "0px"

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

export const MoreNewsStyle = styled(Button)({
  borderRadius: "1rem",
  paddingLeft: "0.9rem",
  paddingRight: "0.9rem",
  fontWeight: 600,  
  fontSize: "12px",
  textTransform: "unset !important",
  backgroundColor: "#E0E0E0",
  color: "#000000",
  

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
  padding: '24px',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  marginBottom: '20px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  transition: 'transform 0.2s ease',
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  }
});

export const EventCards = styled(Grid)(({ frontpage }) => ({
  width: '100%',
  padding: frontpage ? '20px 0' : '20px',
  backgroundColor: 'transparent',
  boxShadow: 'none',
}));

export const TitleContainer = styled(Grid)({
  marginBottom: '16px',
});

export const CaptionContainer = styled(Box)({
  fontSize: '1.1rem',
  lineHeight: '1.6',
  color: '#424242',
  marginBottom: '20px',
});

export const ButtonContainers = styled(Grid)((props) => ({
  display: "flex",
  flexDirection: "column",
  width: "auto",
  gap: "1rem",
}));

export const ButtonContainersSmall = styled(Grid)({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '10px',
  justifyContent: 'flex-start',
  marginTop: '16px',
});

export const TitleStyledCenter = styled(Typography)((props) => ({
  fontSize: "1.9em",
  lineHeight: "1em",
  fontWeight: "400",
  color: "#333333",
  textShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
  letterSpacing: "-0.1rem",
  textAlign: "center",
  alignContent: "center",
  justifyContent: "center",
  justifyItems: "center",

  [props.theme.breakpoints.down("md")]: {
    fontSize: "8vw",
    lineHeight: "8.25vw",
  }
  ,
}));



// Typography
export const TitleStyled = styled(Typography)((props) => ({
  fontSize: "1.9em",
  lineHeight: "1em",
  fontWeight: "400",
  color: "#333333",
  textShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
  letterSpacing: "-0.1rem",

  [props.theme.breakpoints.down("md")]: {
    fontSize: "8vw",
    lineHeight: "8.25vw",
  },
}));

export const TextNewsDescription = styled(Typography)({
  fontSize: "1.5rem",
  marginTop: "0.8rem",
  marginBottom: "0.8rem",
  width: "100%",
});

export const TextStyled = styled(Typography)({
  fontSize: "1.8rem",  
  marginTop: "0.8rem",
  marginBottom: "0.8rem",  
});

export const TextMuted = styled(Typography)({
  fontSize: "1.5rem",
  color: "#425466",
  marginTop: "0.8rem",
  marginBottom: "0.8rem",
  width: "100%",
});

export const SpanText = styled("span") ((props) => ({
  color: `var(--blue)`,
  fontSize: "0.9em",
  "& .Typewriter": {
    marginTop: "4px",
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
