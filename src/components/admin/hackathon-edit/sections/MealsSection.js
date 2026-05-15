import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  ContentCopy as CloneIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Restaurant as MealIcon,
  Visibility as PreviewIcon,
  VisibilityOff as PreviewOffIcon,
  WbSunny as MorningIcon,
  RestaurantMenu as LunchIcon,
  NightsStay as DinnerIcon,
  Coffee as SnackIcon,
} from "@mui/icons-material";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, parseISO } from "date-fns";
import SectionContainer from "../SectionContainer";

// Kept in sync with backend `ALLOWED_DIETARY_TAGS` in validators.py.
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

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const blankItem = () => ({ id: newId(), name: "", description: "", dietary_tags: [] });
const blankMeal = (overrides = {}) => ({
  id: newId(),
  name: "",
  time: "",
  catering_provided: true,
  dietary_tags: [],
  items: [blankItem()],
  ...overrides,
});

// Try to parse a meal time. Accepts ISO strings (preferred) and falls back to
// free-text. Returns null when unparseable so we can show the legacy free-text
// fallback for older data.
const parseMealTime = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  try {
    const d = parseISO(value);
    if (!isNaN(d.getTime())) return d;
  } catch {}
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

const formatMealTime = (value) => {
  const d = parseMealTime(value);
  if (d) return format(d, "EEE MMM d, h:mm a");
  return value || "Time not set";
};

const QUICK_ADD = [
  { label: "Friday Dinner", icon: DinnerIcon, hint: "Friday at 7:00 PM" },
  { label: "Saturday Breakfast", icon: MorningIcon },
  { label: "Saturday Lunch", icon: LunchIcon },
  { label: "Saturday Dinner", icon: DinnerIcon },
  { label: "Sunday Breakfast", icon: MorningIcon },
  { label: "Sunday Lunch", icon: LunchIcon },
  { label: "Snacks", icon: SnackIcon },
];

const MealEditor = ({ meal, mealIndex, onUpdate, onRemove, onClone, dragHandleProps, eventStart, eventEnd }) => {
  const updateField = (field, value) => onUpdate({ ...meal, [field]: value });
  const updateItem = (itemIndex, field, value) => {
    const items = (meal.items || []).map((it, i) => (i === itemIndex ? { ...it, [field]: value } : it));
    onUpdate({ ...meal, items });
  };
  const addItem = () => onUpdate({ ...meal, items: [...(meal.items || []), blankItem()] });
  const removeItem = (itemIndex) =>
    onUpdate({ ...meal, items: (meal.items || []).filter((_, i) => i !== itemIndex) });

  const parsedTime = parseMealTime(meal.time);

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Box {...dragHandleProps} sx={{ cursor: "grab", display: "flex", alignItems: "center" }}>
            <DragIcon color="action" />
          </Box>
          <MealIcon color="primary" />
          <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
            {meal.name || `Meal ${mealIndex + 1}`}
          </Typography>
          <Tooltip title="Duplicate this meal">
            <IconButton size="small" onClick={onClone} aria-label="Duplicate meal">
              <CloneIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remove this meal">
            <IconButton size="small" color="error" onClick={onRemove} aria-label="Remove meal">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Name"
              fullWidth
              size="small"
              value={meal.name || ""}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Saturday Lunch"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Time"
                value={parsedTime}
                onChange={(d) => updateField("time", d ? d.toISOString() : "")}
                minDateTime={eventStart}
                maxDateTime={eventEnd}
                slotProps={{ textField: { size: "small", fullWidth: true } }}
              />
            </LocalizationProvider>
            {meal.time && !parsedTime && (
              <Typography variant="caption" color="warning.main">
                Legacy free-text time — pick a real datetime to upgrade.
              </Typography>
            )}
          </Grid>
        </Grid>

        <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={meal.catering_provided !== false}
                onChange={(e) => updateField("catering_provided", e.target.checked)}
              />
            }
            label="Catering provided"
          />
          <FormControl size="small" sx={{ flex: 1, minWidth: 200 }}>
            <InputLabel>Slot dietary conformance</InputLabel>
            <Select
              multiple
              value={meal.dietary_tags || []}
              onChange={(e) => updateField("dietary_tags", e.target.value)}
              input={<OutlinedInput label="Slot dietary conformance" />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((v) => (
                    <Chip key={v} label={v} size="small" />
                  ))}
                </Box>
              )}
            >
              {ALLOWED_DIETARY_TAGS.map((tag) => (
                <MenuItem key={tag} value={tag}>{tag}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {meal.catering_provided !== false && (
          <Box sx={{ mt: 2, pl: 2, borderLeft: "3px solid", borderColor: "primary.light" }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Menu options
            </Typography>
            <Stack spacing={2}>
              {(meal.items || []).map((item, i) => (
                <Box key={item.id || i} sx={{ pb: 2, borderBottom: i < (meal.items.length - 1) ? "1px solid" : "none", borderColor: "divider" }}>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <Box sx={{ flex: 1 }}>
                      <TextField
                        label={`Item ${i + 1} name`}
                        size="small"
                        fullWidth
                        value={item.name || ""}
                        onChange={(e) => updateItem(i, "name", e.target.value)}
                        placeholder="Margherita Pizza"
                      />
                      <TextField
                        label="Description"
                        size="small"
                        fullWidth
                        multiline
                        rows={2}
                        value={item.description || ""}
                        onChange={(e) => updateItem(i, "description", e.target.value)}
                        placeholder="Tomato, fresh mozzarella, basil"
                        sx={{ mt: 1 }}
                      />
                      <FormControl size="small" fullWidth sx={{ mt: 1 }}>
                        <InputLabel>Dietary tags</InputLabel>
                        <Select
                          multiple
                          value={item.dietary_tags || []}
                          onChange={(e) => updateItem(i, "dietary_tags", e.target.value)}
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
                            <MenuItem key={tag} value={tag}>{tag}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                    <IconButton size="small" color="error" onClick={() => removeItem(i)} aria-label="Remove item">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Box>
              ))}
              <Box>
                <Button size="small" startIcon={<AddIcon />} onClick={addItem} variant="outlined">
                  Add menu item
                </Button>
              </Box>
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// What hackers see at the bottom of the application form. Keep this rendering
// loose enough to remind the admin of the experience without depending on
// any of the live components.
const HackerPreview = ({ meals }) => {
  if (!meals || meals.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 1 }}>
        Hackers won't see a meal selector until you add at least one slot.
      </Alert>
    );
  }
  return (
    <Stack spacing={2}>
      {meals.map((meal) => (
        <Paper key={meal.id} variant="outlined" sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {meal.name || "(unnamed slot)"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatMealTime(meal.time)}
              </Typography>
            </Box>
            <Stack direction="row" spacing={0.5}>
              {(meal.dietary_tags || []).map((t) => (
                <Chip key={t} label={t} size="small" variant="outlined" />
              ))}
            </Stack>
          </Stack>
          {meal.catering_provided === false ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: "italic" }}>
              On your own (no catering provided)
            </Typography>
          ) : (
            <Stack spacing={1} sx={{ mt: 1.5 }}>
              {(meal.items || []).map((it) => (
                <Box key={it.id} sx={{ p: 1.25, border: "1px dashed", borderColor: "divider", borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{it.name || "(unnamed)"}</Typography>
                  {it.description && (
                    <Typography variant="caption" color="text.secondary">{it.description}</Typography>
                  )}
                  {(it.dietary_tags || []).length > 0 && (
                    <Box sx={{ mt: 0.5 }}>
                      {(it.dietary_tags || []).map((t) => (
                        <Chip key={t} label={t} size="small" sx={{ mr: 0.5 }} />
                      ))}
                    </Box>
                  )}
                </Box>
              ))}
            </Stack>
          )}
        </Paper>
      ))}
    </Stack>
  );
};

const MealsSection = ({ admin }) => {
  const { hackathon, setConstraint, markSectionDirty, dirtySections, commitSection, discardSection, saveState } = admin;
  const meals = hackathon.constraints?.meals || [];
  const dirty = dirtySections.has("meals");
  const saving = saveState.status === "saving";
  const [showPreview, setShowPreview] = useState(true);

  const eventStart = useMemo(
    () => (hackathon.start_date ? new Date(`${hackathon.start_date}T00:00:00`) : null),
    [hackathon.start_date]
  );
  const eventEnd = useMemo(
    () => (hackathon.end_date ? new Date(`${hackathon.end_date}T23:59:59`) : null),
    [hackathon.end_date]
  );

  const updateMeals = (next) => {
    setConstraint("meals", next);
    markSectionDirty("meals", true);
  };

  const updateOne = (index, value) =>
    updateMeals(meals.map((m, i) => (i === index ? value : m)));
  const removeOne = (index) => updateMeals(meals.filter((_, i) => i !== index));
  const addNew = (presetName) =>
    updateMeals([...meals, blankMeal(presetName ? { name: presetName } : {})]);
  const cloneOne = (index) => {
    const src = meals[index];
    const dup = {
      ...src,
      id: newId(),
      name: src.name ? `${src.name} (copy)` : "",
      items: (src.items || []).map((it) => ({ ...it, id: newId() })),
    };
    const next = [...meals];
    next.splice(index + 1, 0, dup);
    updateMeals(next);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;
    const next = Array.from(meals);
    const [moved] = next.splice(result.source.index, 1);
    next.splice(result.destination.index, 0, moved);
    updateMeals(next);
  };

  return (
    <SectionContainer
      title="Meals & Catering"
      description="Configure meals served at the in-person event. Hackers pick one option per slot, so the catering team has exact orders. Drag to reorder."
      actions={
        <ToggleButtonGroup
          value={showPreview ? "preview" : "edit"}
          exclusive
          size="small"
          onChange={(_, v) => v && setShowPreview(v === "preview")}
        >
          <ToggleButton value="edit"><PreviewOffIcon fontSize="small" sx={{ mr: 0.5 }} />Edit only</ToggleButton>
          <ToggleButton value="preview"><PreviewIcon fontSize="small" sx={{ mr: 0.5 }} />With preview</ToggleButton>
        </ToggleButtonGroup>
      }
      dirty={dirty}
      saving={saving}
      onSave={() => commitSection("meals")}
      onDiscard={() => discardSection("meals")}
    >
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: showPreview ? 7 : 12 }}>
          {meals.length === 0 ? (
            <Box sx={{ p: 3, border: "2px dashed", borderColor: "divider", borderRadius: 1, textAlign: "center" }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                No meals configured yet. Pick a quick-add preset below or build from scratch.
              </Typography>
            </Box>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="meals">
                {(provided) => (
                  <Box {...provided.droppableProps} ref={provided.innerRef}>
                    {meals.map((meal, index) => (
                      <Draggable key={meal.id || index} draggableId={String(meal.id || index)} index={index}>
                        {(p) => (
                          <Box ref={p.innerRef} {...p.draggableProps}>
                            <MealEditor
                              meal={meal}
                              mealIndex={index}
                              onUpdate={(v) => updateOne(index, v)}
                              onRemove={() => removeOne(index)}
                              onClone={() => cloneOne(index)}
                              dragHandleProps={p.dragHandleProps}
                              eventStart={eventStart}
                              eventEnd={eventEnd}
                            />
                          </Box>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </DragDropContext>
          )}

          <Divider sx={{ my: 2 }}>
            <Chip label="Quick add" size="small" />
          </Divider>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {QUICK_ADD.map(({ label, icon: Icon }) => (
              <Button
                key={label}
                size="small"
                variant="outlined"
                startIcon={<Icon fontSize="small" />}
                onClick={() => addNew(label)}
              >
                {label}
              </Button>
            ))}
            <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => addNew()}>
              Custom slot
            </Button>
          </Box>
        </Grid>

        {showPreview && (
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ position: { md: "sticky" }, top: { md: 80 } }}>
              <Typography variant="overline" color="text.secondary">Hacker preview</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                Roughly how the meal selector renders on the hacker application.
              </Typography>
              <HackerPreview meals={meals} />
            </Box>
          </Grid>
        )}
      </Grid>
    </SectionContainer>
  );
};

export default MealsSection;
