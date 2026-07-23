import React from "react";
import { Box, Stack, TextField, Typography, Grid, InputAdornment, Tooltip, IconButton } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import GitHubIcon from "@mui/icons-material/GitHub";
import dynamic from "next/dynamic";
import SectionContainer from "../SectionContainer";
import { DEFAULT_EVENT_TIMEZONE } from "../../../../lib/timezoneUtils";

const TimezoneSelect = dynamic(() => import("react-timezone-select"), { ssr: false });

// Normalize whatever the admin typed (full URL, @handle, trailing slash) into a
// bare GitHub org slug so we can build a clean github.com/<org> link.
const githubOrgSlug = (raw) => {
  if (!raw) return "";
  let s = String(raw).trim();
  s = s.replace(/^https?:\/\/(www\.)?github\.com\//i, "");
  s = s.replace(/^@/, "").replace(/\/.*$/, "").trim();
  return s;
};

const OverviewSection = ({ admin }) => {
  const { hackathon, setField, markSectionDirty, dirtySections, commitSection, discardSection, saveState } = admin;
  const dirty = dirtySections.has("overview-dates");
  const saving = saveState.status === "saving";

  const setDateField = (field, value) => {
    setField(field, value);
    markSectionDirty("overview-dates", true);
  };

  return (
    <SectionContainer
      title="Overview"
      description="The basics: what your hackathon is, when it happens, and where. Text edits autosave — date or timezone changes need an explicit Save because they ripple into countdowns and meals."
      dirty={dirty}
      saving={saving}
      onSave={() => commitSection("overview-dates")}
      onDiscard={() => discardSection("overview-dates")}
    >
      <Stack spacing={2}>
        <TextField
          label="Title"
          fullWidth
          value={hackathon.title || ""}
          onChange={(e) => setField("title", e.target.value)}
        />
        <TextField
          label="Description"
          fullWidth
          multiline
          rows={4}
          value={hackathon.description || ""}
          onChange={(e) => setField("description", e.target.value)}
          helperText="Markdown is supported on the public page."
        />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Start date"
              type="date"
              fullWidth
              value={hackathon.start_date || ""}
              onChange={(e) => setDateField("start_date", e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="End date"
              type="date"
              fullWidth
              value={hackathon.end_date || ""}
              onChange={(e) => setDateField("end_date", e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Event timezone</Typography>
          <TimezoneSelect
            value={{
              value: hackathon.timezone || DEFAULT_EVENT_TIMEZONE,
              label: hackathon.timezone || DEFAULT_EVENT_TIMEZONE,
            }}
            onChange={(tz) => setDateField("timezone", tz.value)}
          />
          <Typography variant="caption" color="text.secondary">
            Used as the default timezone for countdowns. Save when you change this.
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Location"
              fullWidth
              value={hackathon.location || ""}
              onChange={(e) => setField("location", e.target.value)}
              placeholder="ASU Tempe, Arizona"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Type"
              fullWidth
              value={hackathon.type || ""}
              onChange={(e) => setField("type", e.target.value)}
              placeholder="In-person / Virtual / Hybrid"
            />
          </Grid>
        </Grid>
        <TextField
          label="Hero image URL"
          fullWidth
          value={hackathon.image_url || ""}
          onChange={(e) => setField("image_url", e.target.value)}
          helperText="Shown at the top of the public event page."
        />
        <TextField
          label="Event ID (URL slug)"
          fullWidth
          value={hackathon.event_id || ""}
          disabled
          helperText="The URL identifier for this hackathon. Renaming requires re-creating the event."
        />
        <TextField
          label="GitHub organization"
          fullWidth
          value={hackathon.github_org || ""}
          onChange={(e) => setField("github_org", e.target.value)}
          placeholder="opportunity-hack"
          helperText={
            githubOrgSlug(hackathon.github_org)
              ? `Links to github.com/${githubOrgSlug(hackathon.github_org)}`
              : "Org slug used to link teams to GitHub (github.com/<org>) and scope repo lookups. Just the org name, not the full URL."
          }
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <GitHubIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: githubOrgSlug(hackathon.github_org) ? (
              <InputAdornment position="end">
                <Tooltip title={`Open github.com/${githubOrgSlug(hackathon.github_org)}`}>
                  <IconButton
                    edge="end"
                    size="small"
                    component="a"
                    href={`https://github.com/${githubOrgSlug(hackathon.github_org)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open GitHub organization in a new tab"
                  >
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ) : null,
          }}
        />
        <TextField
          label="Mentor Slack channel"
          fullWidth
          value={hackathon.mentor_slack_channel || ""}
          onChange={(e) => setField("mentor_slack_channel", e.target.value)}
          placeholder={`${hackathon.event_id || "your-event"}-mentors`.replace(/_/g, "-").toLowerCase()}
          helperText="Heartbeats for raised mentor flags get posted here. Defaults to <event_id>-mentors if empty."
        />
      </Stack>
    </SectionContainer>
  );
};

export default OverviewSection;
