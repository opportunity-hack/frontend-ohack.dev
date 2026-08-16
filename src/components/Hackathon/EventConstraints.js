import { FONT_DISPLAY } from "../../styles/fonts";
import React from "react";
import { Box, Tooltip, IconButton } from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PeopleIcon from "@mui/icons-material/People";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

// Refined for the event page (inside <RefinedRoot>): a calm card with a
// Fraunces heading and quiet constraint rows.
const EventConstraints = ({ constraints }) => {
  if (!constraints || Object.keys(constraints).length === 0) return null;

  const maxTeamsExplanation = `
    This limits the number of teams that can initially help a given nonprofit.
    We ensure each nonprofit has at least one team before allowing additional teams to join.
    Signups are first-come, first-served. Once every nonprofit has at least 1 team,
    we allow more teams to help the same nonprofit. Teams should consider their top three
    nonprofit choices as they review problem statements to facilitate this process.
  `;

  const constraintItems = [
    {
      key: "max_teams_per_problem",
      label: "Max teams per problem",
      icon: <AssignmentIcon fontSize="small" />,
      explanation: maxTeamsExplanation,
    },
    {
      key: "min_people_per_team",
      label: "Min people per team",
      icon: <GroupIcon fontSize="small" />,
    },
    {
      key: "max_people_per_team",
      label: "Max people per team",
      icon: <PeopleIcon fontSize="small" />,
    },
  ];

  const visible = constraintItems.filter((i) => constraints[i.key] != null);

  return (
    <Box
      component="section"
      className="ohx-card"
      sx={{ p: { xs: 3, md: 4 }, my: { xs: 4, md: 5 } }}
    >
      <span className="ohx-eyebrow">Team formation</span>
      <h2
        className="ohx-display"
        style={{
          fontSize: "clamp(1.4rem, 2.4vw, 1.85rem)",
          marginTop: 8,
          marginBottom: 12,
        }}
      >
        How teams come together
      </h2>
      <p
        className="ohx-muted"
        style={{
          marginTop: 0,
          marginBottom: 24,
          maxWidth: "70ch",
          lineHeight: 1.65,
        }}
      >
        We want every nonprofit to have at least one team. After nonprofit
        pitches, teams form around the nonprofits they want to help — so come
        with your top three choices in mind. No team yet? That&apos;s fine; tell
        us who you want to work with and we&apos;ll pair you with people who
        share your interests.
      </p>
      {visible.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {visible.map((item) => (
            <div
              key={item.key}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 16px",
                background: "var(--surface-2)",
                border: "1px solid var(--line)",
                borderRadius: 8,
              }}
            >
              <span style={{ color: "var(--accent)", display: "inline-flex" }}>
                {item.icon}
              </span>
              <span style={{ fontSize: "0.95rem", color: "var(--muted)" }}>
                {item.label}:{" "}
                <strong
                  style={{
                    color: "var(--ink)",
                    fontFamily: FONT_DISPLAY,
                    fontSize: "1.05rem",
                  }}
                >
                  {constraints[item.key]}
                </strong>
              </span>
              {item.explanation && (
                <Tooltip
                  title={
                    <span style={{ fontSize: 14 }}>{item.explanation}</span>
                  }
                  placement="top"
                >
                  <IconButton
                    size="small"
                    sx={{ color: "var(--brand)", p: 0.25 }}
                  >
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </div>
          ))}
        </div>
      )}
    </Box>
  );
};

export default EventConstraints;
