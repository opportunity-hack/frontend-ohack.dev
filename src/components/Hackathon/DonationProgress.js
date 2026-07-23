import React from "react";
import { Box } from "@mui/material";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Link from "next/link";
import SponsorMinimal from "../Sponsors/SponsorMinimal";

// Refined for the event page (inside <RefinedRoot>): calm card, navy progress
// rings, refined CTA, and a desaturated sponsor strip.
const DonationProgress = ({ donationGoals = {}, donationCurrent = {} }) => {
  const pct = (current, goal) => {
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
    <Box className="ohx-card" sx={{ p: { xs: 3, md: 3.5 }, height: "100%", minHeight: 400, display: "flex", flexDirection: "column" }}>
      <span className="ohx-eyebrow">Support the event</span>
      <h2 className="ohx-display" style={{ fontSize: "1.4rem", marginTop: 8, marginBottom: 20 }}>Donation progress</h2>

      <div style={{ display: "flex", gap: 16, justifyContent: "space-around", flexWrap: "wrap" }}>
        {categories.map((category) => (
          <div key={category.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <span className="ohx-eyebrow" style={{ fontSize: "0.62rem" }}>{category.name}</span>
            <div style={{ width: 92, height: 92 }}>
              <CircularProgressbar
                value={pct(donationCurrent[category.key], donationGoals[category.key])}
                text={`${pct(donationCurrent[category.key], donationGoals[category.key]).toFixed(0)}%`}
                styles={buildStyles({
                  textSize: "22px",
                  pathColor: "#1B3A6B",
                  textColor: "#16181D",
                  trailColor: "#EDE8DC",
                })}
              />
            </div>
            <span className="ohx-faint" style={{ fontSize: "0.82rem" }}>
              ${fmt(donationCurrent[category.key])} / ${fmt(donationGoals[category.key])}
            </span>
          </div>
        ))}
      </div>

      {donationCurrent?.thank_you?.length > 0 && (
        <p className="ohx-muted" style={{ marginTop: "auto", paddingTop: 16, fontSize: "0.9rem", fontStyle: "italic" }}>
          Special thanks to {donationCurrent.thank_you} for donating!
        </p>
      )}

      <div style={{ marginTop: donationCurrent?.thank_you?.length > 0 ? 12 : "auto", paddingTop: 16 }}>
        <Link href="/sponsor" className="ohx-btn ohx-btn--primary">Become a sponsor →</Link>
      </div>

      <Box className="ohx-sponsors" sx={{ mt: 2 }}>
        <SponsorMinimal />
      </Box>
    </Box>
  );
};

export default DonationProgress;
