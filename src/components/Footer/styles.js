import styled from "@emotion/styled";
import { Grid, Typography, Link } from "@mui/material";

export const FooterContainer = styled(Grid)`
  background-color: ${(props) => props.theme.palette.primary.main};
  color: white;
  padding: 3rem 1rem;
  min-height: 500px;
`;

export const InnerContainer = styled(Grid)`
  max-width: 1200px;
  margin: 0 auto;
`;

export const TextContainer = styled(Grid)`
  padding: 1rem;
  display: flex;
  flex-direction: column;
`;

export const StyledText = styled(Typography)`
  font-weight: bold;
  font-size: 1.5rem; /* Increased from 1.25rem */
  margin-bottom: 1rem;
  color: white;
`;

export const MutedText = styled(Typography)`
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem; /* Increased from 0.875rem */
  margin-bottom: 1rem;
  
  p {
    margin-top: 0;
    line-height: 1.5;
  }
`;

export const StyledLink = styled(Link)`
  color: white;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  font-size: 1rem; /* Increased font size */
  
  &:hover {
    text-decoration: underline;
  }
  
  svg {
    margin-left: 4px;
    font-size: 1rem;
  }
`;

export const LinkList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 1rem;
`;

export const LinkListItem = styled.li`
  margin-bottom: 1.2rem; /* Increased spacing between items */
  display: flex;
  align-items: center;
  font-size: 1rem;
  
  svg {
    margin-left: 4px;
    font-size: 1.1rem;
  }
`;

export const IconLink = styled.a`
  color: white;
  margin-right: 1rem;
  font-size: 1.6rem; /* Increased from 1.5rem */
  
  &:hover {
    opacity: 0.8;
  }
`;

export const Hashtag = styled.span`
  color: rgba(255, 255, 255, 0.8);
  display: inline-block;
  font-size: 1rem; /* Increased from default */
`;
