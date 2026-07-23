import React from "react";
import { Grid, Stack, TextField, Typography } from "@mui/material";
import SectionContainer from "../SectionContainer";

// Inline donations editor: every change autosaves through the parent admin
// hook. Replaces the standalone DonationManagement component (which had its
// own "Update Donation Data" button — no longer needed).
const DonationsSection = ({ admin }) => {
  const { hackathon, setField } = admin;
  const current = hackathon.donation_current || { food: "0", prize: "0", swag: "0", thank_you: "" };
  const goals = hackathon.donation_goals || { food: "0", prize: "0", swag: "0" };

  const setCurrent = (key, value) => setField("donation_current", { ...current, [key]: value });
  const setGoal = (key, value) => setField("donation_goals", { ...goals, [key]: value });

  return (
    <SectionContainer
      title="Funding"
      description="Track raised vs. target funds. Public funding widgets read from these numbers. Edits autosave — no separate save click needed."
    >
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Raised so far</Typography>
          <Stack spacing={2}>
            <TextField
              label="Food (USD)"
              type="number"
              fullWidth
              value={current.food ?? "0"}
              onChange={(e) => setCurrent("food", e.target.value)}
            />
            <TextField
              label="Prize (USD)"
              type="number"
              fullWidth
              value={current.prize ?? "0"}
              onChange={(e) => setCurrent("prize", e.target.value)}
            />
            <TextField
              label="Swag (USD)"
              type="number"
              fullWidth
              value={current.swag ?? "0"}
              onChange={(e) => setCurrent("swag", e.target.value)}
            />
            <TextField
              label="Thank-you message"
              fullWidth
              multiline
              rows={3}
              value={current.thank_you ?? ""}
              onChange={(e) => setCurrent("thank_you", e.target.value)}
              helperText="Public message displayed alongside the funding totals."
            />
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Goals</Typography>
          <Stack spacing={2}>
            <TextField
              label="Food goal (USD)"
              type="number"
              fullWidth
              value={goals.food ?? "0"}
              onChange={(e) => setGoal("food", e.target.value)}
            />
            <TextField
              label="Prize goal (USD)"
              type="number"
              fullWidth
              value={goals.prize ?? "0"}
              onChange={(e) => setGoal("prize", e.target.value)}
            />
            <TextField
              label="Swag goal (USD)"
              type="number"
              fullWidth
              value={goals.swag ?? "0"}
              onChange={(e) => setGoal("swag", e.target.value)}
            />
          </Stack>
        </Grid>
      </Grid>
    </SectionContainer>
  );
};

export default DonationsSection;
