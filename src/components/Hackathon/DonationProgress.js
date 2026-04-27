import React from "react";
import { Grid, Typography, Paper, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import SponsorMinimal from "../Sponsors/SponsorMinimal";

const ProgressContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: "100%", // This ensures the container takes full height of its parent
  minHeight: "400px", // Adjust this value as needed
  display: "flex",
  flexDirection: "column",
}));

const ProgressItem = styled(Grid)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginBottom: theme.spacing(2),
}));

const StyledCircularProgressbar = styled(CircularProgressbar)({
  width: "100px",
  height: "100px",
});

const ThankYouContainer = styled(Typography)(({ theme }) => ({
  marginTop: "auto",
  paddingTop: theme.spacing(2),
}));

const DonationProgress = ({ donationGoals = {}, donationCurrent = {} }) => {
  const calculatePercentage = (current, goal) => {
    const c = Number(current) || 0;
    const g = Number(goal) || 0;
    return g > 0 ? Math.min((c / g) * 100, 100) : 0;
  };

  const fmt = (v) => Number(v) || 0;

  const categories = [
    { name: "Food", key: "food" },
    { name: "Prize", key: "prize" },
    { name: "Swag", key: "swag" },
  ];

  return (
    <ProgressContainer elevation={3}>
      <Typography variant="h5" gutterBottom>
        Donation Progress
      </Typography>
      <Grid container spacing={2} justifyContent="center">
        {categories.map((category) => (
          <ProgressItem item xs={4} key={category.key}>
            <Typography variant="subtitle1" gutterBottom>
              {category.name}
            </Typography>
            <StyledCircularProgressbar
              value={calculatePercentage(
                donationCurrent[category.key],
                donationGoals[category.key]
              )}
              text={`${calculatePercentage(donationCurrent[category.key], donationGoals[category.key]).toFixed(0)}%`}
              styles={buildStyles({
                textSize: "22px",
                pathColor: "#003486",
                textColor: "#003486",
              })}
            />
            <Typography variant="body1" style={{ marginTop: "8px" }}>
              ${fmt(donationCurrent[category.key])} / ${fmt(donationGoals[category.key])}
            </Typography>
          </ProgressItem>
        ))}
      </Grid>
      {donationCurrent && donationCurrent.thank_you && donationCurrent.thank_you.length > 0 && (
        <ThankYouContainer variant="body1">
          Special thanks to: {donationCurrent.thank_you} for donating!
        </ThankYouContainer>
      )}
      <Button
        variant="contained"
        color="primary"
        href="/sponsor"
        style={{ marginTop: "16px" }}
      >
        Become a Sponsor
      </Button>
      <SponsorMinimal />
    </ProgressContainer>
  );
};

export default DonationProgress;
