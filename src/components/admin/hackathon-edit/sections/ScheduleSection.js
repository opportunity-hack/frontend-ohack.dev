import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  ExpandLess as CollapseIcon,
  ExpandMore as ExpandIcon,
  RocketLaunch as KickoffIcon,
  School as WorkshopIcon,
  Restaurant as LunchIcon,
  Gavel as JudgingIcon,
  EmojiEvents as AwardsIcon,
  Coffee as CoffeeIcon,
  Stop as EndIcon,
  ViewAgenda as TimelineViewIcon,
  ViewList as ListViewIcon,
} from "@mui/icons-material";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import dynamic from "next/dynamic";
import { format, parseISO } from "date-fns";
import SectionContainer from "../SectionContainer";
import { DEFAULT_EVENT_TIMEZONE } from "../../../../lib/timezoneUtils";

const TimezoneSelect = dynamic(() => import("react-timezone-select"), { ssr: false });
const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

// ISO formatter that bakes a chosen timezone offset into the saved string,
// matching the existing CountdownManagement save format expected by the
// backend and the public countdown component.
const toIsoWithTimezone = (date, timezone) => {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";
  const pad = (n) => n.toString().padStart(2, "0");
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZoneName: "short",
  });
  const parts = formatter.formatToParts(d).reduce((acc, p) => {
    acc[p.type] = p.value;
    return acc;
  }, {});
  const tzPart = formatter.formatToParts(d).find((p) => p.type === "timeZoneName");
  let offset = "+0000";
  if (tzPart) {
    const m = tzPart.value.match(/([+-])(\d{2}):?(\d{2})/);
    if (m) offset = `${m[1]}${m[2]}${m[3]}`;
    else {
      const tz = d.getTimezoneOffset();
      const sign = tz <= 0 ? "+" : "-";
      offset = `${sign}${pad(Math.abs(Math.floor(tz / 60)))}${pad(Math.abs(tz % 60))}`;
    }
  }
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}${offset}`;
};

const safeParse = (value) => {
  if (!value) return null;
  try {
    const d = parseISO(value);
    if (!isNaN(d.getTime())) return d;
  } catch {}
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

const formatDayHeader = (date, timezone) =>
  date.toLocaleDateString("en-US", { timeZone: timezone, weekday: "long", month: "short", day: "numeric" });

const formatTimeOfDay = (date, timezone) =>
  date.toLocaleTimeString("en-US", { timeZone: timezone, hour: "numeric", minute: "2-digit" });

const PRESETS = [
  { key: "kickoff", label: "Kickoff", icon: KickoffIcon, addHours: 0 },
  { key: "workshop", label: "Workshop", icon: WorkshopIcon, addHours: 1 },
  { key: "coffee", label: "Coffee break", icon: CoffeeIcon, addHours: 3 },
  { key: "lunch", label: "Lunch", icon: LunchIcon, addHours: 5 },
  { key: "judging", label: "Judging starts", icon: JudgingIcon, fromEnd: -6 },
  { key: "awards", label: "Awards", icon: AwardsIcon, fromEnd: -1 },
  { key: "end", label: "Wrap-up", icon: EndIcon, fromEnd: 0 },
];

const buildPresetTime = (preset, eventStart, eventEnd) => {
  const base = preset.fromEnd != null ? eventEnd : eventStart;
  if (!base) return new Date();
  const d = new Date(base);
  if (preset.fromEnd != null) d.setHours(d.getHours() + preset.fromEnd);
  else d.setHours(d.getHours() + (preset.addHours || 0));
  return d;
};

const CountdownCard = ({ countdown, index, timezone, dragHandleProps, onUpdate, onDelete, eventStart, eventEnd }) => {
  const [expanded, setExpanded] = useState(false);
  const time = safeParse(countdown.time);

  const update = (field, value) => onUpdate({ ...countdown, [field]: value });

  return (
    <Card variant="outlined" sx={{ mb: 1.5 }}>
      <CardContent sx={{ pb: "16px !important" }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box {...dragHandleProps} sx={{ cursor: "grab", display: "flex" }}>
            <DragIcon color="action" fontSize="small" />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <TextField
              value={countdown.name || ""}
              onChange={(e) => update("name", e.target.value)}
              variant="standard"
              placeholder={`Countdown ${index + 1}`}
              fullWidth
              InputProps={{ disableUnderline: !countdown.name, sx: { fontWeight: 600, fontSize: "1rem" } }}
            />
            <Typography variant="caption" color="text.secondary">
              {time ? `${formatDayHeader(time, timezone)} · ${formatTimeOfDay(time, timezone)}` : "No time set"}
            </Typography>
          </Box>
          <Tooltip title={expanded ? "Hide details" : "Edit details"}>
            <IconButton size="small" onClick={() => setExpanded((v) => !v)}>
              {expanded ? <CollapseIcon fontSize="small" /> : <ExpandIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={onDelete}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        {expanded && (
          <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
            <Stack spacing={2}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Time"
                  value={time}
                  onChange={(d) => update("time", d ? toIsoWithTimezone(d, timezone) : "")}
                  minDateTime={eventStart}
                  maxDateTime={eventEnd}
                  slotProps={{ textField: { size: "small", fullWidth: true } }}
                />
              </LocalizationProvider>
              <TextField
                label="Description"
                multiline
                rows={3}
                fullWidth
                size="small"
                value={countdown.description || ""}
                onChange={(e) => update("description", e.target.value)}
                helperText="Markdown supported."
              />
              {countdown.description && (
                <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "grey.50" }}>
                  <Typography variant="caption" color="text.secondary">Preview</Typography>
                  <Box sx={{ "& p": { my: 0.5 } }}>
                    <ReactMarkdown>{countdown.description}</ReactMarkdown>
                  </Box>
                </Paper>
              )}
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const ScheduleSection = ({ admin }) => {
  const { hackathon, setField, markSectionDirty, dirtySections, commitSection, discardSection, saveState } = admin;
  const countdowns = hackathon.countdowns || [];
  const dirty = dirtySections.has("schedule");
  const saving = saveState.status === "saving";
  const eventTimezone = hackathon.timezone || DEFAULT_EVENT_TIMEZONE;
  const [view, setView] = useState("timeline");
  const [timezone, setTimezone] = useState(eventTimezone);

  const eventStart = useMemo(
    () => (hackathon.start_date ? new Date(`${hackathon.start_date}T00:00:00`) : null),
    [hackathon.start_date]
  );
  const eventEnd = useMemo(
    () => (hackathon.end_date ? new Date(`${hackathon.end_date}T23:59:59`) : null),
    [hackathon.end_date]
  );

  const updateAll = (next) => {
    setField("countdowns", next);
    markSectionDirty("schedule", true);
  };

  const updateOne = (index, value) => updateAll(countdowns.map((c, i) => (i === index ? value : c)));
  const removeOne = (index) => updateAll(countdowns.filter((_, i) => i !== index));

  const addPreset = (preset) => {
    const time = buildPresetTime(preset, eventStart, eventEnd);
    updateAll([
      ...countdowns,
      {
        id: newId(),
        name: preset.label,
        description: "",
        time: toIsoWithTimezone(time, timezone),
      },
    ]);
  };

  const addBlank = () => {
    const time = eventStart || new Date();
    updateAll([
      ...countdowns,
      { id: newId(), name: "", description: "", time: toIsoWithTimezone(time, timezone) },
    ]);
  };

  // Group by day for timeline view (preserves user-defined order within day
  // and sorts groups by date).
  const grouped = useMemo(() => {
    const groups = new Map();
    countdowns.forEach((c, idx) => {
      const d = safeParse(c.time);
      const key = d ? format(d, "yyyy-MM-dd") : "no-date";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push({ ...c, _origIndex: idx });
    });
    return Array.from(groups.entries())
      .map(([key, items]) => ({
        key,
        date: key === "no-date" ? null : new Date(`${key}T00:00:00`),
        items: items.sort((a, b) => {
          const da = safeParse(a.time);
          const db = safeParse(b.time);
          if (!da) return 1;
          if (!db) return -1;
          return da - db;
        }),
      }))
      .sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return a.date - b.date;
      });
  }, [countdowns]);

  const onListDragEnd = (result) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;
    const next = Array.from(countdowns);
    const [moved] = next.splice(result.source.index, 1);
    next.splice(result.destination.index, 0, moved);
    updateAll(next);
  };

  return (
    <SectionContainer
      title="Schedule"
      description="Countdowns shown publicly on the hackathon page. Pick presets to seed common moments — Kickoff, Lunch, Judging, Awards. Edits are explicit-save."
      actions={
        <Tabs value={view} onChange={(_, v) => setView(v)} sx={{ minHeight: 0 }}>
          <Tab value="timeline" icon={<TimelineViewIcon fontSize="small" />} iconPosition="start" label="Timeline" sx={{ minHeight: 0, py: 0.5 }} />
          <Tab value="list" icon={<ListViewIcon fontSize="small" />} iconPosition="start" label="List" sx={{ minHeight: 0, py: 0.5 }} />
        </Tabs>
      }
      dirty={dirty}
      saving={saving}
      onSave={() => commitSection("schedule")}
      onDiscard={() => discardSection("schedule")}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Display timezone</Typography>
        <Box sx={{ maxWidth: 360 }}>
          <TimezoneSelect
            value={{ value: timezone, label: timezone }}
            onChange={(tz) => setTimezone(tz.value)}
          />
        </Box>
        <Typography variant="caption" color="text.secondary">
          Times you set are saved with this timezone offset. Defaults to the event's timezone ({eventTimezone}).
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }}>
        <Chip label="Quick add" size="small" />
      </Divider>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
        {PRESETS.map((preset) => (
          <Button
            key={preset.key}
            size="small"
            variant="outlined"
            startIcon={<preset.icon fontSize="small" />}
            onClick={() => addPreset(preset)}
          >
            {preset.label}
          </Button>
        ))}
        <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={addBlank}>
          Custom
        </Button>
      </Box>

      {countdowns.length === 0 && (
        <Alert severity="info">
          No countdowns yet. Quick-add a Kickoff to get started, or use Custom for a one-off.
        </Alert>
      )}

      {view === "timeline" && countdowns.length > 0 && (
        <Stack spacing={3}>
          {grouped.map((group) => (
            <Box key={group.key}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "primary.main" }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {group.date ? formatDayHeader(group.date, timezone) : "No date set"}
                </Typography>
                <Box sx={{ flex: 1, height: 1, bgcolor: "divider", ml: 1 }} />
              </Stack>
              <Box sx={{ pl: 2, borderLeft: "2px solid", borderColor: "primary.light" }}>
                {group.items.map((item) => (
                  <CountdownCard
                    key={item.id || item._origIndex}
                    countdown={item}
                    index={item._origIndex}
                    timezone={timezone}
                    onUpdate={(v) => updateOne(item._origIndex, v)}
                    onDelete={() => removeOne(item._origIndex)}
                    dragHandleProps={{}}
                    eventStart={eventStart}
                    eventEnd={eventEnd}
                  />
                ))}
              </Box>
            </Box>
          ))}
          <Typography variant="caption" color="text.secondary">
            Switch to List view to drag-reorder.
          </Typography>
        </Stack>
      )}

      {view === "list" && countdowns.length > 0 && (
        <DragDropContext onDragEnd={onListDragEnd}>
          <Droppable droppableId="countdowns">
            {(provided) => (
              <Box {...provided.droppableProps} ref={provided.innerRef}>
                {countdowns.map((c, idx) => (
                  <Draggable key={c.id || idx} draggableId={String(c.id || `c-${idx}`)} index={idx}>
                    {(p) => (
                      <Box ref={p.innerRef} {...p.draggableProps}>
                        <CountdownCard
                          countdown={c}
                          index={idx}
                          timezone={timezone}
                          onUpdate={(v) => updateOne(idx, v)}
                          onDelete={() => removeOne(idx)}
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
    </SectionContainer>
  );
};

export default ScheduleSection;
