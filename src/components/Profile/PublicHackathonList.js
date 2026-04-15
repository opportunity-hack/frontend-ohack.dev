import React from "react";
import { Box, Typography, Paper, Chip } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import GroupsIcon from "@mui/icons-material/Groups";

/**
 * Public-facing hackathon history component
 * Shows hackathon participation without internal management features
 * Suitable for public profile viewing
 */
export default function PublicHackathonList({ hackathons }) {
  if (!hackathons || hackathons.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
        No hackathon participation recorded yet
      </Typography>
    );
  }

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateString; // Return original if parsing fails
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {hackathons.map((hackathon, index) => (
        <Paper 
          key={hackathon.id || index} 
          variant="outlined"
          sx={{ 
            p: 3,
            borderRadius: 2,
            backgroundColor: 'action.hover',
            '&:hover': {
              backgroundColor: 'action.selected',
            }
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Date and Location */}
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarTodayIcon fontSize="small" color="primary" />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {formatDate(hackathon.start_date)}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnIcon fontSize="small" color="secondary" />
                <Typography variant="body1">
                  {hackathon.location}
                </Typography>
              </Box>
            </Box>

            {/* Nonprofits served */}
            {hackathon.nonprofits && hackathon.nonprofits.length > 0 && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <GroupsIcon fontSize="small" color="success" />
                  <Typography variant="subtitle2" color="text.secondary">
                    Nonprofits Served:
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {hackathon.nonprofits.map((nonprofit, npIndex) => (
                    <Chip
                      key={npIndex}
                      label={nonprofit}
                      size="small"
                      variant="outlined"
                      color="success"
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* DevPost link if available */}
            {hackathon?.devpost_url && (
              <Box>
                <Typography 
                  component="a" 
                  href={hackathon?.devpost_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="body2"
                  color="primary"
                  sx={{ 
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  View Project Details →
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      ))}
      
      {/* Participation summary */}
      <Box sx={{ 
        mt: 2, 
        p: 2, 
        backgroundColor: 'secondary.light',
        borderRadius: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <GroupsIcon color="secondary" fontSize="small" />
        <Typography variant="body2" color="secondary.main" sx={{ fontWeight: 500 }}>
          {hackathons.length} Hackathon{hackathons.length !== 1 ? 's' : ''} Participated
        </Typography>
      </Box>
    </Box>
  );
}