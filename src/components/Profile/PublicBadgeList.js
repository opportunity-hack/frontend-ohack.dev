import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

/**
 * Public-facing badge display component
 * Shows badges without privacy toggles or internal management features
 * Suitable for public profile viewing
 */
export default function PublicBadgeList({ badges }) {
  if (!badges || badges.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
        No badges earned yet
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {badges.map((badge, index) => (
          <Box 
            key={badge.id || index} 
            sx={{ 
              textAlign: 'center', 
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'action.hover',
              minWidth: 120,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1
            }}
          >
            <img 
              src={badge.image} 
              alt={badge.description || "Badge"} 
              style={{ 
                width: 60, 
                height: 60, 
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid',
                borderColor: 'rgba(0,0,0,0.1)'
              }} 
            />
            <Typography variant="caption" sx={{ fontWeight: 500, textAlign: 'center' }}>
              {badge.description}
            </Typography>
          </Box>
        ))}
      </Box>
      
      {/* Achievement summary */}
      <Box sx={{ 
        mt: 2, 
        p: 2, 
        backgroundColor: 'primary.light',
        borderRadius: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <EmojiEventsIcon color="primary" fontSize="small" />
        <Typography variant="body2" color="primary.main" sx={{ fontWeight: 500 }}>
          {badges.length} Achievement{badges.length !== 1 ? 's' : ''} Earned
        </Typography>
      </Box>
    </Box>
  );
}