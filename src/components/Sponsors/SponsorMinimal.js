import React from "react";
import { useEffect } from "react";
import { Box, Typography, Chip, Link } from "@mui/material";
import {
  sponsorLevels,
  sponsors,
  calculateSupport,
} from "../../data/sponsorData";
import { initFacebookPixel, trackEvent } from "../../lib/ga";
import Image from "next/image";

const SponsorMinimal = () => {
  useEffect(() => {
    initFacebookPixel();
  }, []);

  const topSponsors = sponsors
    .sort(
      (a, b) =>
        calculateSupport(b.hours, b.donations) -
        calculateSupport(a.hours, a.donations)
    )
    .slice(0, 3);

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
        mt: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography variant="h6" gutterBottom>
        Our Sponsors
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        {topSponsors.map((sponsor) => {
          const level = getSponsorLevel(sponsor);
          return (
            <Box
              key={sponsor.name}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: 80,
              }}
            >
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  overflow: "hidden",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "white",
                  mb: 1,
                }}
              >
                <Image
                  src={sponsor.logo}
                  alt={sponsor.name}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                  width={60}
                  height={60}
                />
              </Box>
              <Typography
                variant="subtitle1"
                align="center"
                sx={{ minHeight: 40, display: "flex", alignItems: "center" }}
              >
                {sponsor.name}
              </Typography>
              <Chip
                label={level.name}
                size="small"
                sx={{ backgroundColor: level.color, mt: 0.5 }}
              />
            </Box>
          );
        })}
      </Box>
      <Link
        href="/sponsor"
        onClick={() =>
          gaButton("button_view_all_sponsors", "View all sponsors")
        }
        sx={{ mt: 1 }}
      >
        <Typography variant="body1">View all sponsors</Typography>
      </Link>
    </Box>
  );
};

export default SponsorMinimal;
