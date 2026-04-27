import React from "react";
import {
  Box,
  Button,
  Card,
  Chip,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  RestaurantMenu as MenuIconSvg,
} from "@mui/icons-material";

export const ALLOWED_DIETARY_TAGS = [
  "vegetarian",
  "vegan",
  "halal",
  "kosher",
  "gluten-free",
  "dairy-free",
  "nut-free",
  "pescatarian",
];

const newId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const blankItem = () => ({
  id: newId(),
  name: "",
  description: "",
  dietary_tags: [],
});

const blankMeal = () => ({
  id: newId(),
  name: "",
  time: "",
  catering_provided: true,
  dietary_tags: [],
  items: [blankItem()],
});

const MealManagement = ({ meals = [], onChange }) => {
  const updateMeal = (index, field, value) => {
    const next = meals.map((m, i) =>
      i === index ? { ...m, [field]: value } : m,
    );
    onChange(next);
  };

  const addMeal = () => onChange([...meals, blankMeal()]);

  const removeMeal = (index) =>
    onChange(meals.filter((_, i) => i !== index));

  const updateItem = (mealIndex, itemIndex, field, value) => {
    const next = meals.map((m, mi) => {
      if (mi !== mealIndex) return m;
      const items = (m.items || []).map((item, ii) =>
        ii === itemIndex ? { ...item, [field]: value } : item,
      );
      return { ...m, items };
    });
    onChange(next);
  };

  const addItem = (mealIndex) => {
    const next = meals.map((m, mi) =>
      mi === mealIndex ? { ...m, items: [...(m.items || []), blankItem()] } : m,
    );
    onChange(next);
  };

  const removeItem = (mealIndex, itemIndex) => {
    const next = meals.map((m, mi) => {
      if (mi !== mealIndex) return m;
      return {
        ...m,
        items: (m.items || []).filter((_, ii) => ii !== itemIndex),
      };
    });
    onChange(next);
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Configure meals served at the in-person event. Hackers will see a
        restaurant-style menu and pick one item per slot. Selections are
        captured at application submit so the catering team has exact orders.
      </Typography>

      {meals.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          No meals configured. Add a meal slot to get started.
        </Typography>
      )}

      {meals.map((meal, index) => (
        <Card key={meal.id || index} variant="outlined" sx={{ mb: 3, p: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              <MenuIconSvg fontSize="small" sx={{ mr: 1, verticalAlign: "middle" }} />
              Meal Slot {index + 1}
            </Typography>
            <IconButton
              size="small"
              color="error"
              onClick={() => removeMeal(index)}
              aria-label="Remove meal slot"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>

          <TextField
            label="Slot Name"
            placeholder="Friday Dinner"
            fullWidth
            value={meal.name || ""}
            onChange={(e) => updateMeal(index, "name", e.target.value)}
            margin="dense"
          />
          <TextField
            label="Time (free text or ISO datetime)"
            placeholder="Fri, Nov 14, 7:00 PM"
            fullWidth
            value={meal.time || ""}
            onChange={(e) => updateMeal(index, "time", e.target.value)}
            margin="dense"
          />
          <FormControlLabel
            control={
              <Switch
                checked={meal.catering_provided !== false}
                onChange={(e) =>
                  updateMeal(index, "catering_provided", e.target.checked)
                }
              />
            }
            label="Catering provided for this slot"
          />

          <FormControl fullWidth margin="dense">
            <InputLabel>Slot-level dietary conformance</InputLabel>
            <Select
              multiple
              value={meal.dietary_tags || []}
              onChange={(e) =>
                updateMeal(index, "dietary_tags", e.target.value)
              }
              input={<OutlinedInput label="Slot-level dietary conformance" />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((v) => (
                    <Chip key={v} label={v} size="small" />
                  ))}
                </Box>
              )}
            >
              {ALLOWED_DIETARY_TAGS.map((tag) => (
                <MenuItem key={tag} value={tag}>
                  {tag}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {meal.catering_provided !== false && (
            <Box sx={{ mt: 2, pl: 2, borderLeft: "3px solid #e0e0e0" }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Menu items
              </Typography>
              {(meal.items || []).map((item, itemIndex) => (
                <Box
                  key={item.id || itemIndex}
                  sx={{
                    mb: 2,
                    pb: 2,
                    borderBottom:
                      itemIndex < (meal.items || []).length - 1
                        ? "1px solid #f0f0f0"
                        : "none",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Item {itemIndex + 1}
                    </Typography>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => removeItem(index, itemIndex)}
                      aria-label="Remove item"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <TextField
                    label="Name"
                    placeholder="Margherita Pizza"
                    fullWidth
                    value={item.name || ""}
                    onChange={(e) =>
                      updateItem(index, itemIndex, "name", e.target.value)
                    }
                    margin="dense"
                  />
                  <TextField
                    label="Description"
                    placeholder="Tomato, fresh mozzarella, basil"
                    fullWidth
                    multiline
                    rows={2}
                    value={item.description || ""}
                    onChange={(e) =>
                      updateItem(
                        index,
                        itemIndex,
                        "description",
                        e.target.value,
                      )
                    }
                    margin="dense"
                  />
                  <FormControl fullWidth margin="dense">
                    <InputLabel>Dietary tags</InputLabel>
                    <Select
                      multiple
                      value={item.dietary_tags || []}
                      onChange={(e) =>
                        updateItem(
                          index,
                          itemIndex,
                          "dietary_tags",
                          e.target.value,
                        )
                      }
                      input={<OutlinedInput label="Dietary tags" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {selected.map((v) => (
                            <Chip key={v} label={v} size="small" />
                          ))}
                        </Box>
                      )}
                    >
                      {ALLOWED_DIETARY_TAGS.map((tag) => (
                        <MenuItem key={tag} value={tag}>
                          {tag}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              ))}
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => addItem(index)}
                variant="outlined"
              >
                Add Item
              </Button>
            </Box>
          )}
        </Card>
      ))}

      <Button
        startIcon={<AddIcon />}
        onClick={addMeal}
        variant="contained"
        size="small"
      >
        Add Meal Slot
      </Button>
    </Box>
  );
};

export default MealManagement;
