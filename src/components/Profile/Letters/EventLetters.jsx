import React from "react";
import PropTypes from "prop-types";
import { Box, Divider, Paper, Typography } from "@mui/material";

import LetterActions from "./LetterActions";

/** Every letter row for one event (one per role), under a hairline rule —
 * rendered inside a Volunteer History hackathon card. */
export function EventLetterList({ rows, onRequest, certificateFor }) {
  if (!rows || rows.length === 0) return null;
  return (
    <>
      <Divider />
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          Participation letter
        </Typography>
        {rows.map((row) => (
          <LetterActions
            key={`${row.event_id}-${row.role}`}
            row={row}
            onRequest={onRequest}
            certificateUrl={certificateFor ? certificateFor(row) : null}
          />
        ))}
      </Box>
    </>
  );
}

EventLetterList.propTypes = {
  rows: PropTypes.array,
  onRequest: PropTypes.func.isRequired,
  certificateFor: PropTypes.func,
};

/** Letter rows for events that aren't in the attendance list (a judge who
 * scored but never checked in, an admin exception for an older event). */
export function OtherEventLetters({ groups, onRequest, certificateFor }) {
  if (!groups || groups.length === 0) return null;
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
      {groups.map((group) => (
        <Paper key={group.event_id} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.3, mb: 1.5 }}>
            <a href={`/hack/${group.event_id}`} style={{ color: "inherit", textDecoration: "none" }}>
              {group.event_title}
            </a>
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {group.rows.map((row) => (
              <LetterActions
            key={`${row.event_id}-${row.role}`}
            row={row}
            onRequest={onRequest}
            certificateUrl={certificateFor ? certificateFor(row) : null}
          />
            ))}
          </Box>
        </Paper>
      ))}
    </Box>
  );
}

OtherEventLetters.propTypes = {
  groups: PropTypes.array,
  onRequest: PropTypes.func.isRequired,
  certificateFor: PropTypes.func,
};
