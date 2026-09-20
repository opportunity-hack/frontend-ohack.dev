import React from "react";
import { Box, Tab, Tabs } from "@mui/material";
import { TEAM_STATUS_OPTIONS } from "../../constants/teamStatus";

function shortStatus(status) {
  return TEAM_STATUS_OPTIONS.find((o) => o.value === status)?.label || status;
}

export default function TeamSwitcher({ teams, activeId, onChange }) {
  if (!teams || teams.length <= 1) return null;

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ fontSize: "0.9rem", color: "var(--muted)", mb: 1 }}>
        You&apos;re on more than one team — pick the one you&apos;re working on.
      </Box>
      <Tabs
        value={activeId}
        onChange={(_, val) => onChange(val)}
        aria-label="Your teams"
        variant="scrollable"
        scrollButtons="auto"
        TabIndicatorProps={{
          style: { backgroundColor: "var(--brand, #1B3A6B)" },
        }}
      >
        {teams.map((team) => (
          <Tab
            key={team.id}
            value={team.id}
            sx={{ textTransform: "none" }}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <span>{team.name}</span>
                <span className="ohx-tag" style={{ fontSize: "0.7rem" }}>
                  {shortStatus(team.status)}
                </span>
              </Box>
            }
          />
        ))}
      </Tabs>
    </Box>
  );
}
