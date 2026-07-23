import React from "react";
import {
  Alert,
  Box,
  Chip,
  FormControl,
  FormControlLabel,
  Paper,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";

const MealMenu = ({ meals = [], selections = {}, onChange }) => {
  if (!meals || meals.length === 0) return null;

  const update = (mealId, itemId) => {
    onChange({ ...selections, [mealId]: itemId });
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
        Meal selections
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Pick one item per meal so our catering team knows exactly what to
        order. Dietary tags are listed for each item.
      </Typography>

      {meals.map((meal) => (
        <Paper
          key={meal.id}
          variant="outlined"
          sx={{ p: 2.5, mb: 2.5, borderColor: "divider" }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              flexWrap: "wrap",
              mb: 1,
            }}
          >
            <Typography variant="h6" component="h4" sx={{ fontWeight: 600 }}>
              {meal.name}
            </Typography>
            {meal.time && (
              <Typography variant="body2" color="text.secondary">
                {meal.time}
              </Typography>
            )}
          </Box>

          {Array.isArray(meal.dietary_tags) && meal.dietary_tags.length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
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

          {meal.catering_provided === false ? (
            <Alert severity="info">
              <Typography variant="body1">
                Catering isn't provided for this meal — please plan to bring or
                buy your own.
              </Typography>
            </Alert>
          ) : (
            <FormControl component="fieldset" required fullWidth>
              <RadioGroup
                value={selections[meal.id] || ""}
                onChange={(e) => update(meal.id, e.target.value)}
              >
                {(meal.items || []).map((item) => (
                  <FormControlLabel
                    key={item.id}
                    value={item.id}
                    control={<Radio />}
                    sx={{
                      alignItems: "flex-start",
                      mb: 1.5,
                      mr: 0,
                      "& .MuiFormControlLabel-label": { width: "100%" },
                    }}
                    label={
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {item.name}
                        </Typography>
                        {item.description && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 0.5 }}
                          >
                            {item.description}
                          </Typography>
                        )}
                        {Array.isArray(item.dietary_tags) &&
                          item.dietary_tags.length > 0 && (
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.5,
                              }}
                            >
                              {item.dietary_tags.map((t) => (
                                <Chip
                                  key={t}
                                  label={t}
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          )}
                      </Box>
                    }
                  />
                ))}
              </RadioGroup>
            </FormControl>
          )}
        </Paper>
      ))}
    </Box>
  );
};

export default MealMenu;
