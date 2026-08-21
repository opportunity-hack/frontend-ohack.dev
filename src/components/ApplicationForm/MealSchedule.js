import React from "react";
import { Box, Chip, Paper, Typography } from "@mui/material";
import { format, parseISO } from "date-fns";

// How an event collects meals from hackers. Stored on the hackathon doc as
// `constraints.meals_mode`. Kept in sync with backend ALLOWED_MEALS_MODES in
// validators.py.
export const MEALS_MODE_MENU = "menu"; // hackers pick one item per slot
export const MEALS_MODE_SCHEDULE = "schedule"; // times-only, nothing to pick

// Max length for the optional `constraints.meals_note` intro line. Kept in
// sync with MAX_MEALS_NOTE_LENGTH in backend validators.py.
export const MEALS_NOTE_MAX_LENGTH = 500;

// Resolve the meals mode from a hackathon `constraints` object. Anything that
// isn't explicitly "schedule" (legacy docs, unknown values, missing key)
// resolves to the original full-menu behavior.
export const getMealsMode = (constraints) =>
  constraints?.meals_mode === MEALS_MODE_SCHEDULE
    ? MEALS_MODE_SCHEDULE
    : MEALS_MODE_MENU;

// Meal times are ISO strings when set through the admin DateTimePicker, but
// legacy meals carry free text ("Saturday around noon"). Format ISO nicely
// and pass free text through untouched.
export const formatMealTime = (value) => {
  if (!value) return "";
  try {
    const d = parseISO(value);
    if (!isNaN(d.getTime())) return format(d, "EEE MMM d, h:mm a");
  } catch {
    // fall through to the raw string
  }
  return value;
};

// Read-only meal schedule for events that publish meal times without menus
// (constraints.meals_mode === "schedule"). Mirrors MealMenu's card layout but
// asks nothing of the hacker.
const MealSchedule = ({ meals = [], note = "" }) => {
  if (!meals || meals.length === 0) return null;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
        Meal schedule
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Meals are served at the times below — there's nothing to pre-select.
      </Typography>
      {note && (
        <Typography variant="body1" sx={{ mb: 2 }}>
          {note}
        </Typography>
      )}

      {meals.map((meal) => (
        <Paper
          key={meal.id}
          variant="outlined"
          sx={{ p: 2, mb: 1.5, borderColor: "divider" }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {meal.name}
            </Typography>
            {meal.time && (
              <Typography variant="body2" color="text.secondary">
                {formatMealTime(meal.time)}
              </Typography>
            )}
          </Box>

          {Array.isArray(meal.dietary_tags) && meal.dietary_tags.length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
              {meal.dietary_tags.map((t) => (
                <Chip
                  key={t}
                  label={`✓ ${t} options available`}
                  size="small"
                  color="success"
                  variant="outlined"
                />
              ))}
            </Box>
          )}

          {meal.catering_provided === false && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1, fontStyle: "italic" }}
            >
              Catering isn't provided for this meal — please plan to bring or
              buy your own.
            </Typography>
          )}
        </Paper>
      ))}
    </Box>
  );
};

export default MealSchedule;
