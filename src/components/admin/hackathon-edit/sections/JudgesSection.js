import React from "react";
import { Stack, TextField, Typography } from "@mui/material";
import SectionContainer from "../SectionContainer";

const JudgesSection = ({ admin }) => {
  const { hackathon, setConstraint } = admin;
  const constraints = hackathon.constraints || {};

  return (
    <SectionContainer
      title="Judges"
      description="Settings specific to judges. The Judge application toggle and external URL live under Participants."
    >
      <Stack spacing={3} sx={{ maxWidth: 480 }}>
        <div>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Venue arrival time</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            What time judges should arrive at the venue (in the event timezone). Shown on the judge application's Availability step. Leave blank to use the default copy.
          </Typography>
          <TextField
            type="time"
            value={constraints.judge_venue_arrival_time || ""}
            onChange={(e) => setConstraint("judge_venue_arrival_time", e.target.value || null)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 200 }}
          />
        </div>
      </Stack>
    </SectionContainer>
  );
};

export default JudgesSection;
