import React from "react";
import { useEffect, useState } from "react";
import { Box, Typography, Chip, Link, useMediaQuery, useTheme, Button } from "@mui/material";
import {
  sponsorLevels,
  sponsors,
  calculateSupport,
} from "../../data/sponsorData";
import { initFacebookPixel, trackEvent } from "../../lib/ga";
import Image from "next/image";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const SponsorMinimal = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [showAll, setShowAll] = useState(false);
  
  useEffect(() => {
    initFacebookPixel();
  }, []);

  const allTopSponsors = sponsors
    .sort(
      (a, b) =>
        calculateSupport(b.hours, b.donations) -
        calculateSupport(a.hours, a.donations)
    )
    .slice(0, 10);
  
  // Show only 3 on mobile, all on desktop, unless expanded
  const displayCount = isMobile && !showAll ? 3 : 10;
  const topSponsors = allTopSponsors.slice(0, displayCount);
  const hasMore = allTopSponsors.length > displayCount;

  // Helper function to get the highest level for a sponsor
  const getSponsorLevel = (sponsor) => {
    const support = calculateSupport(sponsor.hours, sponsor.donations);
    return sponsorLevels
      .slice()
      .reverse()
      .find((level) => support >= level.minSupport);
  };

  const gaButton = async (action, actionName) => {
    trackEvent(action, { action_name: actionName });
  };

  return (
    <Box
      sx={{
        mt: { xs: 1, md: 2 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography 
        variant="subtitle2" 
        sx={{ 
          mb: { xs: 0.5, md: 1 },
          fontSize: { xs: '0.875rem', md: '1rem' },
          fontWeight: 500
        }}
      >
        Our Sponsors
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: { xs: 1, md: 2 },
          position: 'relative',
        }}
      >
        {topSponsors.map((sponsor, index) => {
          const level = getSponsorLevel(sponsor);
          return (
            <Box
              key={sponsor.name}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: { xs: 60, md: 80 },
              }}
            >
              <Box
                sx={{
                  width: { xs: 40, md: 60 },
                  height: { xs: 40, md: 60 },
                  borderRadius: "50%",
                  overflow: "hidden",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "white",
                  mb: { xs: 0.5, md: 1 },
                  border: '2px solid',
                  borderColor: level.color || '#e0e0e0',
                }}
              >
                {sponsor.logo ? (
                  <Image
                    src={sponsor.logo}
                    alt={sponsor.name}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                    }}
                    width={isMobile ? 40 : 60}
                    height={isMobile ? 40 : 60}
                  />
                ) : (
                  <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                    {sponsor.name.charAt(0)}
                  </Typography>
                )}
              </Box>
              <Typography
                variant="caption"
                align="center"
                sx={{ 
                  minHeight: { xs: 20, md: 40 }, 
                  display: "flex", 
                  alignItems: "center",
                  fontSize: { xs: '0.7rem', md: '0.875rem' },
                  lineHeight: 1.2
                }}
              >
                {sponsor.name}
              </Typography>
              {!isMobile && (
                <Chip
                  label={level.name}
                  size="small"
                  sx={{ backgroundColor: level.color, mt: 0.5, fontSize: '0.7rem' }}
                />
              )}
            </Box>
          );
        })}
        
        {/* Show "+X more" indicator on mobile when collapsed */}
        {isMobile && hasMore && !showAll && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: 60,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#f0f0f0",
                border: '2px dashed #999',
                mb: 0.5,
                cursor: 'pointer',
              }}
              onClick={() => setShowAll(true)}
            >
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#666' }}>
                +{allTopSponsors.length - 3}
              </Typography>
            </Box>
            <Typography
              variant="caption"
              align="center"
              sx={{ 
                fontSize: '0.7rem',
                lineHeight: 1.2,
                color: '#666'
              }}
            >
              more
            </Typography>
          </Box>
        )}
      </Box>
      
      {/* Show/Hide button for mobile */}
      {isMobile && allTopSponsors.length > 3 && (
        <Button
          size="small"
          onClick={() => setShowAll(!showAll)}
          startIcon={showAll ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{ 
            mt: 1, 
            fontSize: '0.75rem',
            textTransform: 'none',
            color: 'primary.main'
          }}
        >
          {showAll ? 'Show less' : `Show all ${allTopSponsors.length} sponsors`}
        </Button>
      )}
      
      <Link
        href="/sponsor"
        onClick={() =>
          gaButton("button_view_all_sponsors", "View all sponsors")
        }
        sx={{ mt: { xs: 0.5, md: 1 } }}
      >
        <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
          View all sponsors
        </Typography>
      </Link>
    </Box>
  );
};

export default SponsorMinimal;
