import {
  Grid,
  Button,
  Typography,
  CircularProgress,
  Chip,
  Box,
  Paper
} from "@mui/material";
import { styled } from "@mui/material";

// Grid
export const OuterGrid = styled(Grid)((props) => ({
  width: "85%",
  margin: "auto",
  marginBottom: "5%",

  [props.theme.breakpoints.down("md")]: {
    marginBottom: "15%",
  },
}));

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

export const EmptyGrid = styled(Grid)({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  marginTop: '2%',
});

export const HackathonGrid = styled(Grid)({
  width: '100%',
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 450px)', // Fixed width columns
  gap: '20px',
  marginBottom: '40px',
  justifyContent: 'center', // Center the grid itself
  
  '@media (max-width: 960px)': {
    gridTemplateColumns: 'minmax(300px, 450px)', // Single column for mobile
  },
});

// New grid for past events - more compact, showing more items at once
export const PastEventGrid = styled(Grid)({
  width: '100%',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '16px',
  marginTop: '20px',
  
  '@media (max-width: 600px)': {
    gridTemplateColumns: '1fr', // Single column on very small screens
  },
});

// Card design for past events - more compact than current events
export const PastEventCard = styled(Paper)({
  padding: '16px',
  height: '260px', // Fixed height for consistency
  borderRadius: '8px',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  cursor: 'pointer',
  backgroundColor: '#f0f8ff',
  
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
  },
});

export const PastEventYear = styled(Box)({
  color: '#0066cc',
  fontWeight: 'bold',
  fontSize: '0.9rem',
  marginBottom: '8px',
  display: 'flex',
  alignItems: 'center',
});

export const PastEventText = styled(Typography)({
  fontSize: '0.9rem',
  color: '#555',
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  marginTop: '8px',
  lineHeight: '1.4',
});

export const PastEventLocation = styled(Box)({
  color: '#555',
  fontSize: '0.85rem',
  marginTop: '8px',
  display: 'flex',
  alignItems: 'center',
});

export const ToggleButton = styled(Button)({
  borderRadius: '20px',
  textTransform: 'none',
  fontWeight: '500',
  fontSize: '0.85rem',
  padding: '6px 12px',
  
  '&:hover': {
    backgroundColor: '#e3f2fd',
  },
});

export const NewsSection = styled(Grid)({
  width: '100%',
  backgroundColor: '#f8f9fa',
  padding: '40px 0',
  marginTop: '20px',
  borderRadius: '20px',
});

export const NewsSectionTitle = styled(Typography)({
  fontSize: '2rem',
  fontWeight: '600',
  marginBottom: '30px',
  color: '#1a1a1a',
  borderBottom: '3px solid var(--blue)',
  display: 'inline-block',
  paddingBottom: '8px',
});

export const NewsContainer = styled(Grid)({
  width: '100%',
  maxWidth: '1600px',  // Even wider
  margin: '0 auto',
  padding: '0 20px',
  
  '@media (max-width: 960px)': {
    maxWidth: '100%',
    padding: '0 15px',
  }
});

export const EventCards = styled(Grid)((props) => ({
  height: '500px', // Set a fixed height to prevent layout shifts
  padding: '15px',
  width: '100%',
  backgroundColor: '#e6f7ff',
  borderRadius: '15px',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  overflow: 'auto', // Add scrolling for overflow content
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
  },

  [props.theme.breakpoints.down('md')]: {
    padding: '15px',
    height: '450px', // Slightly taller on mobile
  },
}));

export const EventExtendedCard = styled(Grid)((props) => ({
  height: "auto",
  padding: "2%",
  maxWidth: "50%",
  boxShadow: "10px",
  backgroundColor: "#e6f7ff",
  borderRadius: "15px",
  // margin: "3% 2% 2% 0%",

  [props.theme.breakpoints.down("md")]: {
    maxWidth: "100%",
    width: "100%",
    marginTop: "3%",
  },
}));

export const ButtonContainer = styled(Grid)({
  width: "100%",
  // gap: "25px"
});

export const ProgressContainer = styled(Grid)({
  margin: "5% 0%",
});

export const ProgressBarHolder = styled(Grid)({
  width: "20%",
  height: "20%",
});

export const BlankContainer = styled(Grid)({});

export const ThankYouContainer = styled(Grid)({
  marginTop: "5%",
});

// Text
export const SectionTitle = styled(Typography)({
  fontSize: "2.5rem",
  fontWeight: "600",
  marginBottom: "20px",
});

export const EventTitle = styled(Typography)({
  // fontSize: "1.5rem",
  fontWeight: "bold",
});

export const EventLink = styled(Typography)({
  fontSize: "1.25rem",  
  color: "#0066cc",
  textDecoration: "none", // Changed to none for cleaner look
  textTransform: "none",
  fontWeight: "bold",
  "&:hover": {
    color: "#003486",
    textDecoration: "underline",
  },
  marginBottom: "8px"
});

export const EventText = styled(Typography)({
  fontSize: '1.2rem',
  textTransform: 'none',
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  lineHeight: '1.5',
  maxHeight: '5.4rem', // 3 lines × 1.2rem font × 1.5 line height
  margin: 0,
  wordBreak: 'break-word',
});

export const EventGreyText = styled(Typography)({
  color: "#666666",
  fontSize: "1.5rem",
  textTransform: "none",
});

export const TypographyStyled = styled(Typography)({
  
  textDecoration: "none",
  textTransform: "none",
  fontSize: "1.2rem",
  
  "a": {
    color: "rgb(0, 0, 255)",
    textDecoration: "none",
  },

  "a:hover": {
    color: "#00BFFF",
    textDecoration: "underline",
  },
  
});

// Button
export const EventButton = styled(Button)({
  textTransform: "unset !important",
  
  
  minWidth: "120px",
  borderRadius: "20px",
  marginTop: "3%",
  fontSize: "15px",

  "&:hover": {
    backgroundColor: `var(--blue)`,
  },
});

export const ExtendedEventButton = styled(Button)({
  textTransform: "unset !important",

  borderRadius: "20px",
  marginTop: "3%",
  fontSize: "15px",

  "&:hover": {
    backgroundColor: `var(--blue)`,
  },
});

// Progress
export const ProgressIndicator = styled(CircularProgress)({});

// Chip
export const ChipStyled = styled(Chip)({});