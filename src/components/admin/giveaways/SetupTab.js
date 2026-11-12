import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  Alert,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  ContentCopy as DuplicateIcon,
  DeleteOutline as DeleteIcon,
  DragIndicator as DragIcon,
  UploadFile as UploadIcon,
} from "@mui/icons-material";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useAuthInfo } from "@propelauth/react";
import useHackathonEvents from "../../../hooks/use-hackathon-events";
import {
  GIVEAWAY_TIMEZONE,
  formatGiveawayClose,
  giveawayErrorMessage,
  updateAdminGiveaway,
  uploadPrizeImage,
} from "../../../lib/giveawayApi";
import { safeParse, toIsoWithTimezone } from "../../../lib/timezoneUtils";
import PrizeOption, { prizeGridSx } from "../../Profile/Giveaways/PrizeOption";
import { trackEvent, EventCategory } from "../../../lib/ga";
import {
  LIMITS,
  STATUS_OPTIONS,
  blankPrize,
  buildSavePayload,
  draftFromGiveaway,
  hasErrors,
  isDraftDirty,
  validateDraft,
} from "./giveawaySetup";

const sectionSx = { p: { xs: 2, md: 3 }, mb: 3, border: "1px solid", borderColor: "divider" };

function PrizeImageField({ prize, giveawayId, orgId, onChange, onError }) {
  const { accessToken } = useAuthInfo();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const onFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      onChange(await uploadPrizeImage(giveawayId, file, { token: accessToken, orgId }));
    } catch (err) {
      onError(giveawayErrorMessage(err, "Image upload failed."));
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Box
        sx={{
          width: 64,
          height: 64,
          flexShrink: 0,
          borderRadius: 1,
          bgcolor: "grey.100",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        {prize.image_url ? (
          <img src={prize.image_url} alt="" width={64} height={64} style={{ objectFit: "cover" }} />
        ) : (
          <Typography variant="caption" color="text.secondary">No image</Typography>
        )}
      </Box>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={onFile} />
      <Button size="small" startIcon={<UploadIcon />} onClick={() => inputRef.current?.click()} disabled={uploading}>
        {uploading ? "Uploading…" : prize.image_url ? "Replace" : "Upload image"}
      </Button>
      {prize.image_url && (
        <Button size="small" color="inherit" onClick={() => onChange("")}>
          Remove
        </Button>
      )}
    </Box>
  );
}

PrizeImageField.propTypes = {
  prize: PropTypes.object.isRequired,
  giveawayId: PropTypes.string.isRequired,
  orgId: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

function PrizeRow({ prize, errors, locked, giveawayId, orgId, dragHandleProps, onUpdate, onDuplicate, onRemove, onImageError }) {
  const e = errors || {};
  const set = (field) => (event) => onUpdate({ ...prize, [field]: event.target.value });
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 1.5, display: "flex", gap: 1.5, alignItems: "flex-start" }}>
      <Box {...dragHandleProps} sx={{ pt: 1, color: "text.secondary", cursor: "grab" }} aria-label="Drag to reorder">
        <DragIcon />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0, display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", md: "2fr 100px" } }}>
        <TextField
          label="Prize name"
          size="small"
          required
          value={prize.name}
          onChange={set("name")}
          error={Boolean(e.name)}
          helperText={e.name || `${(prize.name || "").length}/${LIMITS.prizeName}`}
          inputProps={{ maxLength: LIMITS.prizeName + 10 }}
        />
        <TextField
          label="Quantity"
          size="small"
          type="number"
          value={prize.quantity}
          onChange={(ev) => onUpdate({ ...prize, quantity: ev.target.value === "" ? "" : Number(ev.target.value) })}
          error={Boolean(e.quantity)}
          helperText={e.quantity || "winners"}
          inputProps={{ min: 1, max: 50 }}
        />
        <TextField
          label="Short description"
          size="small"
          multiline
          minRows={1}
          value={prize.description}
          onChange={set("description")}
          error={Boolean(e.description)}
          helperText={e.description || `${(prize.description || "").length}/${LIMITS.prizeDescription}`}
          sx={{ gridColumn: { md: "1 / -1" } }}
        />
        <TextField
          label="Product link (optional)"
          size="small"
          value={prize.product_url}
          onChange={set("product_url")}
          error={Boolean(e.product_url)}
          helperText={e.product_url || "Shown as “View product ↗”"}
          sx={{ gridColumn: { md: "1 / -1" } }}
        />
        <Box sx={{ gridColumn: { md: "1 / -1" } }}>
          <PrizeImageField
            prize={prize}
            giveawayId={giveawayId}
            orgId={orgId}
            onChange={(url) => onUpdate({ ...prize, image_url: url })}
            onError={onImageError}
          />
        </Box>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Tooltip title="Duplicate">
          <IconButton size="small" onClick={onDuplicate} aria-label="Duplicate prize">
            <DuplicateIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={locked ? "This prize already has a winner" : "Delete"}>
          <span>
            <IconButton size="small" onClick={onRemove} disabled={locked} aria-label="Delete prize">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Paper>
  );
}

PrizeRow.propTypes = {
  prize: PropTypes.object.isRequired,
  errors: PropTypes.object,
  locked: PropTypes.bool,
  giveawayId: PropTypes.string.isRequired,
  orgId: PropTypes.string,
  dragHandleProps: PropTypes.object,
  onUpdate: PropTypes.func.isRequired,
  onDuplicate: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onImageError: PropTypes.func.isRequired,
};

export default function SetupTab({ giveaway, orgId, entriesCount, onSaved, onSnack }) {
  const { accessToken } = useAuthInfo();
  const { hackathons } = useHackathonEvents();
  // `baseline` is the last saved version this form knows about: the prop, or
  // the PATCH response right after a save.
  const [baseline, setBaseline] = useState(giveaway);
  const [draft, setDraft] = useState(() => draftFromGiveaway(giveaway));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const dirty = isDraftDirty(draft, baseline);
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

  // A refetch (or the draw tab moving the status) re-seeds the form only
  // when nothing is being edited here.
  useEffect(() => {
    if (dirtyRef.current) return;
    setBaseline(giveaway);
    setDraft(draftFromGiveaway(giveaway));
  }, [giveaway]);

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const errors = useMemo(() => validateDraft(draft), [draft]);
  const invalid = hasErrors(errors);
  const drawStarted = Boolean(giveaway?.draw_started);
  const wonPrizeIds = useMemo(
    () => new Set((giveaway?.draw?.results || []).filter((r) => r.outcome === "won").map((r) => r.prize_id)),
    [giveaway],
  );

  const setField = (field, value) => setDraft((d) => ({ ...d, [field]: value }));
  const setPrizes = (fn) => setDraft((d) => ({ ...d, prizes: fn(d.prizes) }));

  const onDragEnd = (result) => {
    if (!result.destination) return;
    setPrizes((prizes) => {
      const next = [...prizes];
      const [moved] = next.splice(result.source.index, 1);
      next.splice(result.destination.index, 0, moved);
      return next;
    });
  };

  const save = useCallback(async () => {
    setSaving(true);
    setSaveError("");
    try {
      const updated = await updateAdminGiveaway(giveaway.id, buildSavePayload(draft), {
        token: accessToken,
        orgId,
      });
      trackEvent({
        action: "admin_giveaway_save",
        params: { event_category: EventCategory.ADMIN, event_label: giveaway.id, value: draft.prizes.length },
      });
      setBaseline(updated);
      setDraft(draftFromGiveaway(updated));
      onSaved(updated);
      onSnack?.("Giveaway saved.", "success");
    } catch (err) {
      setSaveError(giveawayErrorMessage(err, "Couldn't save the giveaway."));
    } finally {
      setSaving(false);
    }
  }, [accessToken, orgId, draft, giveaway, onSaved, onSnack]);

  if (!draft) return null;

  const closesDate = safeParse(draft.closes_at);
  const eventOptions = [...(hackathons || [])].sort((a, b) =>
    String(b.start_date || "").localeCompare(String(a.start_date || "")),
  );

  return (
    <Box>
      <Box
        sx={{
          position: "sticky",
          top: 64,
          zIndex: 2,
          bgcolor: "background.paper",
          py: 2.25,
          minHeight: 64,
          mb: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="body2" color={dirty ? "warning.main" : "text.secondary"} sx={{ flex: 1 }}>
          {dirty ? "● Unsaved changes" : "All changes saved"}
          {invalid && dirty ? " — fix the highlighted fields to save" : ""}
        </Typography>
        {dirty && (
          <Button onClick={() => setDraft(draftFromGiveaway(baseline))} disabled={saving}>
            Discard
          </Button>
        )}
        <Button variant="contained" onClick={save} disabled={!dirty || invalid || saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </Box>
      {saveError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSaveError("")}>
          {saveError}
        </Alert>
      )}

      <Paper sx={sectionSx} elevation={0}>
        <Typography variant="h6" sx={{ mb: 2 }}>Giveaway</Typography>
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
          <TextField
            label="Title"
            required
            value={draft.title}
            onChange={(e) => setField("title", e.target.value)}
            error={Boolean(errors.title)}
            helperText={errors.title || `Shown on profiles. ${draft.title.length}/${LIMITS.title}`}
          />
          <FormControl>
            <InputLabel id="giveaway-event-label">Linked event (optional)</InputLabel>
            <Select
              labelId="giveaway-event-label"
              label="Linked event (optional)"
              value={draft.event_id || ""}
              onChange={(e) => setField("event_id", e.target.value)}
            >
              <MenuItem value="">None</MenuItem>
              {draft.event_id && !eventOptions.some((h) => h.event_id === draft.event_id) && (
                <MenuItem value={draft.event_id}>{draft.event_id}</MenuItem>
              )}
              {eventOptions.map((h) => (
                <MenuItem key={h.event_id || h.id} value={h.event_id}>
                  {h.title || h.event_id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Description"
            multiline
            minRows={2}
            value={draft.description}
            onChange={(e) => setField("description", e.target.value)}
            error={Boolean(errors.description)}
            helperText={errors.description || `${draft.description.length}/${LIMITS.description}`}
            sx={{ gridColumn: { md: "1 / -1" } }}
          />
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Entries close (Arizona time)"
              value={closesDate}
              onChange={(d) => setField("closes_at", d ? toIsoWithTimezone(d, GIVEAWAY_TIMEZONE) : null)}
              slotProps={{
                textField: {
                  helperText: draft.closes_at ? formatGiveawayClose(draft.closes_at) : "No closing time — close it by hand.",
                },
                actionBar: { actions: ["clear", "accept"] },
              }}
            />
          </LocalizationProvider>
          <FormControlLabel
            control={
              <Switch
                checked={draft.must_be_present}
                onChange={(e) => setField("must_be_present", e.target.checked)}
              />
            }
            label="Winners must be present at the drawing"
          />
        </Box>

        <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>Status</Typography>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={draft.status === "drawn" ? null : draft.status}
          onChange={(_, value) => value && setField("status", value)}
          disabled={drawStarted}
        >
          {STATUS_OPTIONS.map((o) => (
            <ToggleButton key={o.value} value={o.value}>{o.label}</ToggleButton>
          ))}
        </ToggleButtonGroup>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {drawStarted
            ? `The draw has started, so the status is locked${giveaway.status === "drawn" ? " (drawn)" : ""}. Reset the draw to change it.`
            : `${STATUS_OPTIONS.find((o) => o.value === draft.status)?.help || ""} ${entriesCount} ${entriesCount === 1 ? "person has" : "people have"} entered.`}
        </Typography>
      </Paper>

      <Paper sx={sectionSx} elevation={0}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 2 }}>
          <Typography variant="h6" sx={{ flex: 1 }}>Prizes</Typography>
          <Button startIcon={<AddIcon />} onClick={() => setPrizes((p) => [...p, blankPrize()])}>
            Add prize
          </Button>
        </Box>
        {draft.prizes.length === 0 && (
          <Typography color="text.secondary" sx={{ mb: 1 }}>
            No prizes yet. Without prizes, people simply enter the giveaway.
          </Typography>
        )}
        {errors.prizeCount && <Alert severity="error" sx={{ mb: 1 }}>{errors.prizeCount}</Alert>}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="giveaway-prizes">
            {(provided) => (
              <Box {...provided.droppableProps} ref={provided.innerRef}>
                {draft.prizes.map((prize, index) => (
                  <Draggable key={prize._key} draggableId={prize._key} index={index}>
                    {(p) => (
                      <Box ref={p.innerRef} {...p.draggableProps}>
                        <PrizeRow
                          prize={prize}
                          errors={errors.prizes[prize._key]}
                          locked={Boolean(prize.id && wonPrizeIds.has(prize.id))}
                          giveawayId={giveaway.id}
                          orgId={orgId}
                          dragHandleProps={p.dragHandleProps}
                          onUpdate={(next) => setPrizes((list) => list.map((x, i) => (i === index ? next : x)))}
                          onDuplicate={() =>
                            setPrizes((list) => {
                              const copy = { ...prize, id: undefined, _key: blankPrize()._key };
                              return [...list.slice(0, index + 1), copy, ...list.slice(index + 1)];
                            })
                          }
                          onRemove={() => setPrizes((list) => list.filter((_, i) => i !== index))}
                          onImageError={(msg) => setSaveError(msg)}
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
        {draft.prizes.length > 1 && (
          <Typography variant="body2" color="text.secondary">
            This order is how prizes appear on profiles and the default draw order — ending on the biggest prize works well.
          </Typography>
        )}
      </Paper>

      {draft.prizes.length > 0 && (
        <Paper sx={sectionSx} elevation={0}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>What hackers see</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Preview of the prize picker on /profile#giveaways.
          </Typography>
          <Box sx={prizeGridSx}>
            {draft.prizes.map((prize) => (
              <PrizeOption
                key={prize._key}
                prize={{ ...prize, quantity: Number(prize.quantity) || 1, name: prize.name || "Untitled prize" }}
                checked={false}
                onChange={() => {}}
              />
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
}

SetupTab.propTypes = {
  giveaway: PropTypes.object.isRequired,
  orgId: PropTypes.string,
  entriesCount: PropTypes.number,
  onSaved: PropTypes.func.isRequired,
  onSnack: PropTypes.func,
};
