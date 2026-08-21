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
  InputAdornment,
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
  MenuBook as CatalogIcon,
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
import MenuCatalogPicker from "../catalog/MenuCatalogPicker";
import MealSchedule, {
  MEALS_MODE_MENU,
  MEALS_MODE_SCHEDULE,
  MEALS_NOTE_MAX_LENGTH,
  getMealsMode,
} from "../../../ApplicationForm/MealSchedule";
import {
  computeAllMealsCostCents,
  computeItemCostCents,
  computeMealCostCents,
  formatUSD,
} from "../catalog/formatCurrency";

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

// Default surcharge assumptions sourced from the Fat Freddy's quote
// (8.6% AZ tax, ~10% gratuity, $45 flat delivery, 2.9% credit-card
// surcharge). Used only for the "with fees" toggle.
const DEFAULT_SURCHARGES = {
  tax_pct: 8.6,
  gratuity_pct: 10,
  delivery_cents: 4500,
  card_surcharge_pct: 2.9,
};

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
  { label: "Friday Dinner", icon: DinnerIcon },
  { label: "Saturday Breakfast", icon: MorningIcon },
  { label: "Saturday Lunch", icon: LunchIcon },
  { label: "Saturday Dinner", icon: DinnerIcon },
  { label: "Sunday Breakfast", icon: MorningIcon },
  { label: "Sunday Lunch", icon: LunchIcon },
  { label: "Snacks", icon: SnackIcon },
];

const ItemCostRow = ({ item, headcount }) => {
  if (!item.price_cents) return null;
  const unit = item.unit || "per_person";
  const cost = computeItemCostCents(item, headcount);
  return (
    <Box sx={{ mt: 0.75, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
      <Chip
        label={`${formatUSD(item.price_cents)} ${unit === "per_person" ? "/ person" : unit === "each" ? "each" : "fixed"}`}
        size="small"
        variant="outlined"
        color="primary"
      />
      {cost > 0 && (
        <Typography variant="caption" color="text.secondary">
          ≈ <strong>{formatUSD(cost)}</strong> at {unit === "each" ? `qty ${item.quantity || 1}` : `${headcount} people`}
        </Typography>
      )}
      {item.vendor && (
        <Typography variant="caption" color="text.secondary">· {item.vendor}</Typography>
      )}
    </Box>
  );
};

const MealEditor = ({ meal, mealIndex, onUpdate, onRemove, onClone, onOpenCatalog, dragHandleProps, eventStart, eventEnd, headcount, scheduleOnly = false }) => {
  const updateField = (field, value) => onUpdate({ ...meal, [field]: value });
  const updateItem = (itemIndex, field, value) => {
    const items = (meal.items || []).map((it, i) => (i === itemIndex ? { ...it, [field]: value } : it));
    onUpdate({ ...meal, items });
  };
  const addItem = () => onUpdate({ ...meal, items: [...(meal.items || []), blankItem()] });
  const removeItem = (itemIndex) =>
    onUpdate({ ...meal, items: (meal.items || []).filter((_, i) => i !== itemIndex) });

  const parsedTime = parseMealTime(meal.time);
  const overriddenHeadcount = meal.headcount_override != null && meal.headcount_override !== ""
    ? Number(meal.headcount_override)
    : headcount;
  const mealCost = computeMealCostCents(meal, headcount);

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
          {!scheduleOnly && mealCost > 0 && (
            <Chip
              label={formatUSD(mealCost)}
              size="small"
              color="success"
              variant="outlined"
              sx={{ fontWeight: 700 }}
            />
          )}
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
          <Grid size={{ xs: 12, sm: scheduleOnly ? 6 : 5 }}>
            <TextField
              label="Name"
              fullWidth
              size="small"
              value={meal.name || ""}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Saturday Lunch"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: scheduleOnly ? 6 : 5 }}>
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
          </Grid>
          {!scheduleOnly && (
            <Grid size={{ xs: 12, sm: 2 }}>
              <TextField
                label="People eating"
                type="number"
                size="small"
                fullWidth
                value={meal.headcount_override ?? ""}
                onChange={(e) => updateField("headcount_override", e.target.value === "" ? null : Number(e.target.value))}
                placeholder={String(headcount || 0)}
                inputProps={{ min: 0 }}
                helperText={meal.headcount_override == null ? `default ${headcount}` : "override"}
              />
            </Grid>
          )}
        </Grid>

        {meal.time && !parsedTime && (
          <Typography variant="caption" color="warning.main" sx={{ display: "block", mt: 1 }}>
            Legacy free-text time — pick a real datetime above to upgrade.
          </Typography>
        )}

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

        {scheduleOnly && (meal.items || []).length > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
            {(meal.items || []).length} menu item{(meal.items || []).length === 1 ? "" : "s"} hidden
            while "Times only" is on — the items are kept and come back if you
            switch to full menus.
          </Typography>
        )}

        {!scheduleOnly && meal.catering_provided !== false && (
          <Box sx={{ mt: 2, pl: 2, borderLeft: "3px solid", borderColor: "primary.light" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle2">Menu options</Typography>
              <Stack direction="row" spacing={1}>
                <Button size="small" startIcon={<CatalogIcon />} variant="contained" color="primary" onClick={onOpenCatalog}>
                  Browse menu
                </Button>
                <Button size="small" startIcon={<AddIcon />} onClick={addItem} variant="outlined">
                  Blank item
                </Button>
              </Stack>
            </Stack>
            <Stack spacing={2}>
              {(meal.items || []).map((item, i) => (
                <Box key={item.id || i} sx={{ pb: 2, borderBottom: i < (meal.items.length - 1) ? "1px solid" : "none", borderColor: "divider" }}>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <TextField
                        label={`Item ${i + 1} name`}
                        size="small"
                        fullWidth
                        value={item.name || ""}
                        onChange={(e) => updateItem(i, "name", e.target.value)}
                      />
                      <TextField
                        label="Description"
                        size="small"
                        fullWidth
                        multiline
                        rows={2}
                        value={item.description || ""}
                        onChange={(e) => updateItem(i, "description", e.target.value)}
                        sx={{ mt: 1 }}
                      />
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 1 }}>
                        <TextField
                          label="Price"
                          type="number"
                          size="small"
                          value={item.price_cents != null ? (item.price_cents / 100).toString() : ""}
                          onChange={(e) => {
                            const dollars = parseFloat(e.target.value);
                            const cents = Number.isFinite(dollars) ? Math.round(dollars * 100) : null;
                            updateItem(i, "price_cents", cents);
                          }}
                          InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                          inputProps={{ min: 0, step: 0.25 }}
                          sx={{ width: 130 }}
                        />
                        <FormControl size="small" sx={{ minWidth: 130 }}>
                          <InputLabel>Unit</InputLabel>
                          <Select
                            label="Unit"
                            value={item.unit || "per_person"}
                            onChange={(e) => updateItem(i, "unit", e.target.value)}
                          >
                            <MenuItem value="per_person">per person</MenuItem>
                            <MenuItem value="each">each (qty)</MenuItem>
                            <MenuItem value="fixed">fixed total</MenuItem>
                          </Select>
                        </FormControl>
                        {item.unit === "each" && (
                          <TextField
                            label="Qty"
                            type="number"
                            size="small"
                            value={item.quantity ?? 1}
                            onChange={(e) => updateItem(i, "quantity", Math.max(0, parseInt(e.target.value, 10) || 0))}
                            inputProps={{ min: 0, step: 1 }}
                            sx={{ width: 90 }}
                          />
                        )}
                        <FormControl size="small" sx={{ flex: 1, minWidth: 200 }}>
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
                      </Stack>
                      <ItemCostRow item={item} headcount={overriddenHeadcount} />
                    </Box>
                    <IconButton size="small" color="error" onClick={() => removeItem(i)} aria-label="Remove item">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Box>
              ))}
              {(meal.items || []).length === 0 && (
                <Typography variant="caption" color="text.secondary">
                  No items yet. Click "Browse menu" to pick from Fat Freddy's, or add a blank item.
                </Typography>
              )}
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const HackerPreview = ({ meals, mealsMode = MEALS_MODE_MENU, note = "" }) => {
  if (!meals || meals.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 1 }}>
        Hackers won't see{" "}
        {mealsMode === MEALS_MODE_SCHEDULE
          ? "the meal schedule"
          : "a meal selector"}{" "}
        until you add at least one slot.
      </Alert>
    );
  }
  // Times-only mode renders the exact component the hacker application uses,
  // so the preview can't drift from reality.
  if (mealsMode === MEALS_MODE_SCHEDULE) {
    return <MealSchedule meals={meals} note={note} />;
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

const CostSummary = ({ meals, headcount }) => {
  const [showFees, setShowFees] = useState(true);
  const subtotal = computeAllMealsCostCents(meals, headcount);
  if (subtotal === 0) return null;

  const tax = Math.round((subtotal * DEFAULT_SURCHARGES.tax_pct) / 100);
  const gratuity = Math.round((subtotal * DEFAULT_SURCHARGES.gratuity_pct) / 100);
  const cardSurcharge = Math.round((subtotal * DEFAULT_SURCHARGES.card_surcharge_pct) / 100);
  const delivery = DEFAULT_SURCHARGES.delivery_cents;
  const grand = subtotal + tax + gratuity + cardSurcharge + delivery;

  return (
    <Paper variant="outlined" sx={{ p: 2, bgcolor: "success.50", borderColor: "success.light" }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between" alignItems={{ sm: "center" }}>
        <Box>
          <Typography variant="overline" color="text.secondary">Estimated cost</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "success.dark" }}>
            {formatUSD(showFees ? grand : subtotal)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {meals.length} meal slot{meals.length === 1 ? "" : "s"} · {headcount} people · {showFees ? "with" : "without"} typical fees
          </Typography>
        </Box>
        <FormControlLabel
          control={<Switch checked={showFees} onChange={(e) => setShowFees(e.target.checked)} />}
          label="Include taxes & fees"
        />
      </Stack>
      {showFees && (
        <Box sx={{ mt: 1.5, fontSize: "0.85rem" }}>
          <Stack spacing={0.25}>
            <CostLine label="Subtotal" value={subtotal} />
            <CostLine label={`Tax (${DEFAULT_SURCHARGES.tax_pct}%)`} value={tax} />
            <CostLine label={`Gratuity (~${DEFAULT_SURCHARGES.gratuity_pct}%)`} value={gratuity} />
            <CostLine label={`Card surcharge (${DEFAULT_SURCHARGES.card_surcharge_pct}%)`} value={cardSurcharge} />
            <CostLine label="Delivery (flat)" value={delivery} />
            <Divider sx={{ my: 0.5 }} />
            <CostLine label="Estimated total" value={grand} bold />
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1, fontStyle: "italic" }}>
            Surcharges based on Fat Freddy's quote (Phoenix, AZ). Adjust with the vendor.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

const CostLine = ({ label, value, bold }) => (
  <Stack direction="row" justifyContent="space-between" sx={{ fontWeight: bold ? 700 : 400 }}>
    <Box>{label}</Box>
    <Box>{formatUSD(value)}</Box>
  </Stack>
);

const MealsSection = ({ admin }) => {
  const { hackathon, setConstraint, markSectionDirty, dirtySections, commitSection, discardSection, saveState } = admin;
  const meals = hackathon.constraints?.meals || [];
  const headcount = hackathon.constraints?.meals_estimated_headcount ?? 50;
  const mealsMode = getMealsMode(hackathon.constraints);
  const scheduleOnly = mealsMode === MEALS_MODE_SCHEDULE;
  const mealsNote = hackathon.constraints?.meals_note || "";
  const dirty = dirtySections.has("meals");
  const saving = saveState.status === "saving";
  const [showPreview, setShowPreview] = useState(true);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [catalogTargetMeal, setCatalogTargetMeal] = useState(null);

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
  // Times-only slots start with no items — a leftover blank item would fail
  // the backend's validate_meals (items need a non-empty name) even though
  // the items editor is hidden in that mode.
  const addNew = (presetName) =>
    updateMeals([
      ...meals,
      blankMeal({
        ...(presetName ? { name: presetName } : {}),
        ...(scheduleOnly ? { items: [] } : {}),
      }),
    ]);

  const setMealsMode = (mode) => {
    setConstraint("meals_mode", mode);
    markSectionDirty("meals", true);
  };
  const setMealsNote = (note) => {
    setConstraint("meals_note", note);
    markSectionDirty("meals", true);
  };
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

  const setHeadcount = (value) => {
    setConstraint("meals_estimated_headcount", value);
    // headcount is purely an estimation aid — no need to mark dirty
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;
    const next = Array.from(meals);
    const [moved] = next.splice(result.source.index, 1);
    next.splice(result.destination.index, 0, moved);
    updateMeals(next);
  };

  const openCatalogFor = (mealIndex) => {
    setCatalogTargetMeal(mealIndex);
    setCatalogOpen(true);
  };

  const handleCatalogAdd = (newItems) => {
    if (catalogTargetMeal == null) return;
    const target = meals[catalogTargetMeal];
    if (!target) return;
    const updated = { ...target, items: [...(target.items || []), ...newItems] };
    updateOne(catalogTargetMeal, updated);
    setCatalogTargetMeal(null);
  };

  return (
    <SectionContainer
      title="Meals & Catering"
      description={
        scheduleOnly
          ? "Publish a simple meal schedule — hackers see the times, with nothing to pre-select. Drag to reorder."
          : "Configure meals, pick items from a vendor catalog (Fat Freddy's seeded), and see live cost estimates. Drag to reorder. Hackers pick one option per slot."
      }
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
      <Stack spacing={2.5} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            What hackers see
          </Typography>
          <ToggleButtonGroup
            value={mealsMode}
            exclusive
            size="small"
            onChange={(_, v) => v && setMealsMode(v)}
          >
            <ToggleButton value={MEALS_MODE_MENU}>
              Full menus — hackers pick items
            </ToggleButton>
            <ToggleButton value={MEALS_MODE_SCHEDULE}>
              Times only — just show the schedule
            </ToggleButton>
          </ToggleButtonGroup>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
            {scheduleOnly
              ? "The hacker application shows meal names and times only — no item selection."
              : "The hacker application asks each hacker to pick one item per meal slot."}
          </Typography>
        </Box>
        {scheduleOnly ? (
          <TextField
            label="Note shown to hackers (optional)"
            size="small"
            fullWidth
            multiline
            minRows={2}
            value={mealsNote}
            onChange={(e) => setMealsNote(e.target.value)}
            inputProps={{ maxLength: MEALS_NOTE_MAX_LENGTH }}
            placeholder="We'll provide breakfast, lunch, and dinner — vegetarian and vegan options at every meal."
            helperText={`Shown above the meal schedule on the hacker application (${mealsNote.length}/${MEALS_NOTE_MAX_LENGTH})`}
          />
        ) : (
          <>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
              <TextField
                label="Estimated headcount"
                type="number"
                size="small"
                value={headcount}
                onChange={(e) => setHeadcount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                inputProps={{ min: 0, step: 1 }}
                helperText="Used for cost estimates and per-meal defaults"
                sx={{ maxWidth: 220 }}
              />
              <Button
                size="medium"
                variant="outlined"
                startIcon={<CatalogIcon />}
                onClick={() => openCatalogFor(null)}
                disabled
                sx={{ visibility: "hidden" }}
              >
                Browse menu
              </Button>
            </Stack>
            <CostSummary meals={meals} headcount={headcount} />
          </>
        )}
      </Stack>

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
                              onOpenCatalog={() => openCatalogFor(index)}
                              dragHandleProps={p.dragHandleProps}
                              eventStart={eventStart}
                              eventEnd={eventEnd}
                              headcount={headcount}
                              scheduleOnly={scheduleOnly}
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
                {scheduleOnly
                  ? "Exactly how the meal schedule renders on the hacker application."
                  : "Roughly how the meal selector renders on the hacker application."}
              </Typography>
              <HackerPreview meals={meals} mealsMode={mealsMode} note={mealsNote} />
            </Box>
          </Grid>
        )}
      </Grid>

      <MenuCatalogPicker
        open={catalogOpen}
        onClose={() => {
          setCatalogOpen(false);
          setCatalogTargetMeal(null);
        }}
        onAddItems={handleCatalogAdd}
        headcount={
          catalogTargetMeal != null && meals[catalogTargetMeal]?.headcount_override != null && meals[catalogTargetMeal].headcount_override !== ""
            ? Number(meals[catalogTargetMeal].headcount_override)
            : headcount
        }
      />
    </SectionContainer>
  );
};

export default MealsSection;
