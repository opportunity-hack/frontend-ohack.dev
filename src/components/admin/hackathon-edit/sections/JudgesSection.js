import React from "react";
import { Box, Stack, TextField, Typography } from "@mui/material";
import SectionContainer from "../SectionContainer";

const JudgesSection = ({ admin }) => {
  const { hackathon, setConstraint } = admin;
  const constraints = hackathon.constraints || {};

  const judgingStart = constraints.judge_judging_start_time || "";
  const judgingEnd = constraints.judge_judging_end_time || "";
  const windowInverted =
    judgingStart && judgingEnd && judgingEnd <= judgingStart;

  return (
    <SectionContainer
      title="Judges"
      description="Settings specific to judges. The Judge application toggle and external URL live under Participants."
    >
      <Stack spacing={3} sx={{ maxWidth: 480 }}>
        <div>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            Venue arrival time
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            What time judges should arrive at the venue (in the event timezone).
            Shown on the judge application's Availability step. Leave blank to
            use the default copy.
          </Typography>
          <TextField
            type="time"
            value={constraints.judge_venue_arrival_time || ""}
            onChange={(e) =>
              setConstraint("judge_venue_arrival_time", e.target.value || null)
            }
            InputLabelProps={{ shrink: true }}
            sx={{ width: 200 }}
          />
        </div>
        <div>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            Judging window (final day)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            When judging starts and ends on the last day (in the event
            timezone). Drives the schedule copy and the availability commitment
            question on the judge application. Leave blank to use the defaults
            (3:00 PM – 5:30 PM).
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Starts"
              type="time"
              value={judgingStart}
              onChange={(e) =>
                setConstraint(
                  "judge_judging_start_time",
                  e.target.value || null,
                )
              }
              InputLabelProps={{ shrink: true }}
              sx={{ width: 200 }}
            />
            <TextField
              label="Ends"
              type="time"
              value={judgingEnd}
              onChange={(e) =>
                setConstraint("judge_judging_end_time", e.target.value || null)
              }
              InputLabelProps={{ shrink: true }}
              sx={{ width: 200 }}
              error={Boolean(windowInverted)}
              helperText={
                windowInverted ? "End time should be after the start time" : ""
              }
            />
          </Box>
        </div>
      </Stack>
    </SectionContainer>
  );
};

export default JudgesSection;
