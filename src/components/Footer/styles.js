import { styled } from '@mui/system';
import { Grid, Box } from '@mui/material';
import Link from 'next/link';

// Define high contrast colors for accessibility
const highContrastTheme = {
  background: "#1A1A2E", // Darker blue background
  textPrimary: "#FFFFFF", // Bright white for text
  textSecondary: "#E0E0E0", // Light gray with sufficient contrast
  accentColor: "#FFEB3B", // Bright yellow for accent/hover
  linkHoverBackground: "rgba(255, 255, 255, 0.1)" // Subtle hover effect
};

export const FooterContainer = styled(Grid)(() => ({
  width: "100%",
  backgroundColor: highContrastTheme.background,
  color: highContrastTheme.textPrimary,
  paddingTop: "3rem",
  paddingBottom: "3rem",
  marginTop: 0,
  marginBottom: 0,
}));

export const InnerContainer = styled(Grid)(() => ({
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "0 1.5rem",
}));

export const TextContainer = styled(Grid)(() => ({
  padding: "0 1rem",
  marginBottom: "2rem",
}));

export const MutedText = styled('div')(() => ({
  fontSize: "1.05rem", // Slightly larger for better readability
  color: highContrastTheme.textSecondary,
  lineHeight: 1.6,
  marginTop: "0.5rem",
}));

export const StyledLink = styled(Link)(() => ({
  color: highContrastTheme.textPrimary,
  textDecoration: "none",
  fontWeight: 500,
  transition: "all 0.2s ease",
  '&:hover, &:focus': {
    color: highContrastTheme.accentColor,
    textDecoration: "underline",
  },
  // Ensure proper focus indicators for keyboard navigation
  '&:focus-visible': {
    outline: `2px solid ${highContrastTheme.accentColor}`,
    outlineOffset: '2px',
  }
}));

export const LinkList = styled('ul')(() => ({
  listStyle: "none",
  padding: 0,
  margin: 0,
}));

export const LinkListItem = styled('li')(() => ({
  fontSize: "1.05rem",
  marginBottom: "1rem",
  color: highContrastTheme.textPrimary,
  display: "flex",
  alignItems: "center",
  
  '& svg': {
    marginLeft: "0.5rem",
    fontSize: "1rem",
    color: highContrastTheme.textPrimary,
  },
  
  '&:hover': {
    '& svg': {
      color: highContrastTheme.accentColor,
    }
  }
}));

export const StyledText = styled('div')(() => ({
  fontSize: "1.2rem",
  fontWeight: 600,
  color: highContrastTheme.textPrimary,
}));

export const IconLink = styled('a')(() => ({
  color: highContrastTheme.textPrimary,
  fontSize: "1.5rem",
  marginRight: "1rem",
  transition: "color 0.2s ease",
  '&:hover': {
    color: highContrastTheme.accentColor,
  },
  // Ensure proper focus indicators for keyboard navigation
  '&:focus-visible': {
    outline: `2px solid ${highContrastTheme.accentColor}`,
    outlineOffset: '2px',
  }
}));

export const Hashtag = styled('span')(() => ({
  color: highContrastTheme.textPrimary,
  backgroundColor: "rgba(255, 255, 255, 0.2)",
  borderRadius: "5px",
  padding: "0.35rem 0.6rem",
  marginBottom: "0.5rem",
  display: "inline-block",
  fontSize: "0.9rem",
  fontWeight: 500,
  '&:hover': {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  }
}));
