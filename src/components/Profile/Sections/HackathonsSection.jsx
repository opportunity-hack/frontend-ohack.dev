import React, { memo } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Stack,
  Divider,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import GroupsIcon from "@mui/icons-material/Groups";

import LinkedInShareButton from "../../share/LinkedInShareButton";

const ROLE_COLORS = {
  Hacker: "primary",
  Mentor: "secondary",
  Judge: "warning",
  Volunteer: "success",
};

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatRange(start, end) {
  if (!start && !end) return "";
  if (!end || end === start) return formatDate(start);
  return `${formatDate(start)} – ${formatDate(end)}`;
}

function nonprofitLabel(nonprofit) {
  if (!nonprofit) return "";
  if (typeof nonprofit === "string") return nonprofit;
  return nonprofit.name || nonprofit.title || nonprofit.id || "";
}

function HackathonCard({ hackathon, mode, profileUrl }) {
  const roles = hackathon.roles || [];
  const dateLabel = formatRange(hackathon.start_date, hackathon.end_date);
  const npos = (hackathon.nonprofits || [])
    .map(nonprofitLabel)
    .filter(Boolean);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 2,
        backgroundColor: "background.paper",
        transition: "background-color 0.2s",
        "&:hover": { backgroundColor: "action.hover" },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {hackathon.title && (
              <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                {hackathon.event_id ? (
                  <a
                    href={`/hack/${hackathon.event_id}`}
                    style={{ color: "inherit", textDecoration: "none" }}
                  >
                    {hackathon.title}
                  </a>
                ) : (
                  hackathon.title
                )}
              </Typography>
            )}
            {dateLabel && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                <CalendarTodayIcon fontSize="small" color="primary" />
                <Typography variant="body2">{dateLabel}</Typography>
              </Box>
            )}
            {hackathon.location && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                <LocationOnIcon fontSize="small" color="secondary" />
                <Typography variant="body2">{hackathon.location}</Typography>
              </Box>
            )}
          </Box>

          {mode === "public" && profileUrl && (
            <LinkedInShareButton
              variant="section"
              url={profileUrl}
              tooltip={`Share ${hackathon.title || "this hackathon"} on LinkedIn`}
            />
          )}
        </Box>

        {roles.length > 0 && (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {roles.map((role) => (
              <Chip
                key={role}
                label={role}
                size="small"
                color={ROLE_COLORS[role] || "default"}
                variant="filled"
              />
            ))}
          </Stack>
        )}

        {npos.length > 0 && (
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}>
              <GroupsIcon fontSize="small" color="success" />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Nonprofits served
              </Typography>
            </Box>
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              {npos.map((label, i) => (
                <Chip
                  key={`${label}-${i}`}
                  label={label}
                  size="small"
                  variant="outlined"
                  color="success"
                />
              ))}
            </Stack>
          </Box>
        )}

        {hackathon.devpost_url && (
          <>
            <Divider />
            <Typography
              component="a"
              href={hackathon.devpost_url}
              target="_blank"
              rel="noopener noreferrer"
              variant="body2"
              color="primary"
              sx={{
                textDecoration: "none",
                fontWeight: 500,
                "&:hover": { textDecoration: "underline" },
              }}
            >
              View project on DevPost →
            </Typography>
          </>
        )}
      </Box>
    </Paper>
  );
}

HackathonCard.propTypes = {
  hackathon: PropTypes.object.isRequired,
  mode: PropTypes.oneOf(["public", "private"]).isRequired,
  profileUrl: PropTypes.string,
};

function HackathonsSection({ hackathons, mode = "public", profileUrl }) {
  if (!hackathons || hackathons.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
        {mode === "private"
          ? "We don't see any hackathons in your history yet. Once you sign up and check in to one of our events, it'll show up here."
          : "No hackathon participation recorded yet."}
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {hackathons.map((h, i) => (
        <HackathonCard
          key={h.event_id || h.id || i}
          hackathon={h}
          mode={mode}
          profileUrl={profileUrl}
        />
      ))}
      <Box
        sx={{
          mt: 1,
          p: 1.5,
          backgroundColor: "background.paper",
          border: "1px solid",
          borderColor: "secondary.main",
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <GroupsIcon color="secondary" fontSize="small" />
        <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
          {hackathons.length} hackathon{hackathons.length === 1 ? "" : "s"} attended
        </Typography>
      </Box>
    </Box>
  );
}

HackathonsSection.propTypes = {
  hackathons: PropTypes.array,
  mode: PropTypes.oneOf(["public", "private"]),
  profileUrl: PropTypes.string,
};

export default memo(HackathonsSection);
