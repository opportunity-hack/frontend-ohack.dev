import React, { useRef } from "react";
import { Typography, Box, Grid, Button, Link } from "@mui/material";
import QRCode from "react-qr-code";

const FlierComponent = () => {
  const sponsorLogos = [
    "https://cdn.ohack.dev/ohack.dev/sponsors/meta.webp",
    "https://cdn.ohack.dev/ohack.dev/sponsors/spotify.webp",
  ];

  return (
    <>
      <Box
        sx={{
          width: "8.5in",
          height: "11in",
          p: 2,
          mt: 10,
          bgcolor: "#f0f0f0",
          color: "#333",
        }}
      >
        <Box
          sx={{
            bgcolor: "#fff",
            height: "100%",
            p: 2,
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <Typography
            variant="h1"
            align="center"
            sx={{
              mb: 2,
              color: "#0066cc",
              fontWeight: "bold",
              fontSize: "38px",
            }}
          >
            Opportunity Hack 2024
          </Typography>

          <Box
            sx={{
              height: "120px",
              marginBottom: "16px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <Box
              component="img"
              src="https://cdn.ohack.dev/ohack.dev/2023_hackathon_5.webp"
              alt="Opportunity Hack 2023"
              sx={{
                position: "absolute",
                top: "-180px",
                left: 0,
                width: "100%",
                height: "auto",
                objectFit: "cover",
              }}
            />
          </Box>

          <Typography
            variant="h3"
            align="center"
            sx={{ mb: 2, color: "#009933", fontSize: "36px" }}
          >
            Code for a Cause!
          </Typography>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <Typography variant="h5" sx={{ fontSize: "19px" }}>
                📅 Date: October 12-13, 2024
              </Typography>
              <Typography variant="h5" sx={{ fontSize: "19px" }}>
                📍 Location: Tempe, Arizona
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h5" sx={{ fontSize: "19px" }}>
                💻 48-hour hackathon
              </Typography>
              <Typography variant="h5" sx={{ fontSize: "19px" }}>
                🏆 Prizes for top projects
              </Typography>
            </Grid>
          </Grid>

          <Typography
            variant="body1"
            paragraph
            sx={{ fontSize: "16px", mb: 2 }}
          >
            Join us for an exciting weekend of coding, collaboration, and making
            a difference! Opportunity Hack brings together talented volunteers
            to solve real-world problems for non-profit organizations.
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "space-around", mb: 2 }}>
            <Box sx={{ textAlign: "left" }}>
              <Typography variant="h5" sx={{ fontSize: "19px", mb: 1 }}>
                For Hackers:
              </Typography>
              <Typography variant="body1" sx={{ fontSize: "16px" }}>
                • Solve meaningful challenges
                <br />
                • Network with professionals
                <br />
                • Learn new technologies
                <br />
                • Win prizes and recognition
                <br />• Build a portfolio for employment
              </Typography>
            </Box>
            <Box sx={{ textAlign: "left" }}>
              <Typography variant="h5" sx={{ fontSize: "19px", mb: 1 }}>
                For Non-Profits:
              </Typography>
              <Typography variant="body1" sx={{ fontSize: "16px" }}>
                • Get custom tech solutions
                <br />
                • Increase your impact
                <br />
                • Connect with tech talent
                <br />• Modernize your operations
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 4,
              mb: 2,
            }}
          >
            <Box>
              <Typography
                variant="h5"
                align="center"
                sx={{ mb: 1, fontSize: "19px" }}
              >
                Register Now
              </Typography>
              <Box sx={{ bgcolor: "white", p: 2, borderRadius: 2 }}>
                <QRCode value="https://hack.ohack.dev" size={120} />
              </Box>
            </Box>
            <Typography variant="h5" align="center" sx={{ fontSize: "19px" }}>
              Scan to visit
              <br />
              <Link
                href="https://hack.ohack.dev"
                target="_blank"
                rel="noopener noreferrer"
              >
                hack.ohack.dev
              </Link>
            </Typography>
          </Box>

          <Typography
            variant="body1"
            align="center"
            sx={{ fontSize: "16px", mb: 1 }}
          >
            Sponsored by:{" "}
            {sponsorLogos.map((logo, index) => (
              <img
                key={index}
                src={logo}
                alt="Opportunity Hack Sponsor"
                style={{ height: "40px", margin: "0 8px" }}
              />
            ))}
          </Typography>

          <Typography
            variant="h6"
            align="center"
            sx={{ mt: 0.2, fontStyle: "italic", fontSize: "20px" }}
          >
            "Be the change you wish to see in the world through code!"
          </Typography>

          <Typography
            variant="body1"
            align="center"
            sx={{ mt: 0.2, fontSize: "16px" }}
          >
            www.ohack.dev | @OpportunityHack | #OHack2024
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default FlierComponent;
