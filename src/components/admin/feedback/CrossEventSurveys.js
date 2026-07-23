import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Chip,
  Stack,
  Alert,
  Rating,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import {
  TrendingUp as UpIcon,
  TrendingDown as DownIcon,
} from "@mui/icons-material";
import {
  ComposedChart,
  LineChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import {
  parseTs,
  elapsedHourSeries,
  eventDurationHours,
  SERIES_COLORS,
} from "./surveyAnalytics";

const API = process.env.NEXT_PUBLIC_API_SERVER_URL;
const LOW_N = 5; // events with fewer responses are flagged as small-sample

const KpiCard = ({ label, children }) => (
  <Card variant="outlined" sx={{ height: "100%" }}>
    <CardContent>
      <Typography variant="overline" color="text.secondary">{label}</Typography>
      {children}
    </CardContent>
  </Card>
);

const shortTitle = (t, n = 20) => (t && t.length > n ? `${t.slice(0, n - 1)}…` : t || "");

const CrossEventSurveys = ({ accessToken, orgId, onError }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [overlaySeries, setOverlaySeries] = useState({}); // event_id -> [{hour, avgRating}]
  const pending = useRef(new Set());

  const headers = useMemo(
    () => ({ authorization: `Bearer ${accessToken}`, "content-type": "application/json", "X-Org-Id": orgId }),
    [accessToken, orgId]
  );

  // Cross-event aggregate (one server-side scan).
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/surveys/overview`, { headers });
        if (!res.ok) throw new Error("overview");
        const json = await res.json();
        if (!active) return;
        setData(json);
      } catch (e) {
        if (active) onError?.("Failed to load the cross-event survey overview.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [headers, onError]);

  const events = data?.events || [];
  const totals = data?.totals || {};

  const eventsById = useMemo(
    () => Object.fromEntries(events.map((e) => [e.event_id, e])),
    [events]
  );
  const titleFor = useCallback((id) => eventsById[id]?.title || id, [eventsById]);

  // Default the overlay to the most-recent events that have live responses.
  useEffect(() => {
    if (!data) return;
    const liveEvents = events.filter((e) => (e.by_mode?.live || 0) > 0);
    setSelectedIds(liveEvents.slice(-3).map((e) => e.event_id));
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch live responses for any newly-selected event (only the handful chosen).
  const fetchEventSeries = useCallback(async (ev) => {
    const res = await fetch(`${API}/api/surveys/${ev.event_id}/responses?mode=live`, { headers });
    if (!res.ok) return [];
    const json = await res.json();
    return elapsedHourSeries(json.responses || [], ev.start_date, {
      liveOnly: true,
      maxHours: eventDurationHours(ev.start_date, ev.end_date),
    });
  }, [headers]);

  useEffect(() => {
    let active = true;
    const missing = selectedIds.filter((id) => !overlaySeries[id] && !pending.current.has(id) && eventsById[id]);
    if (!missing.length) return;
    missing.forEach((id) => pending.current.add(id));
    (async () => {
      const results = await Promise.all(
        missing.map((id) => fetchEventSeries(eventsById[id]).then((s) => [id, s]).catch(() => [id, []]))
      );
      missing.forEach((id) => pending.current.delete(id));
      if (!active) return;
      setOverlaySeries((prev) => {
        const next = { ...prev };
        results.forEach(([id, s]) => { next[id] = s; });
        return next;
      });
    })();
    return () => { active = false; };
  }, [selectedIds, eventsById, overlaySeries, fetchEventSeries]);

  // ----------------------------------------------------------------- derived
  const macroData = useMemo(
    () => events.map((e) => ({
      label: shortTitle(e.title || e.event_id),
      date: e.start_date || "",
      count: e.count,
      rating: e.overall_rating?.average ?? null,
      wouldReturn: e.would_return?.average ?? null,
      lowN: e.count < LOW_N,
    })),
    [events]
  );

  const ratedEvents = useMemo(
    () => events.filter((e) => e.overall_rating?.average != null),
    [events]
  );
  const latest = ratedEvents[ratedEvents.length - 1];
  const prior = ratedEvents[ratedEvents.length - 2];
  const latestDelta = latest && prior
    ? +(latest.overall_rating.average - prior.overall_rating.average).toFixed(2)
    : null;
  const best = useMemo(
    () => ratedEvents.reduce((b, e) => (!b || e.overall_rating.average > b.overall_rating.average ? e : b), null),
    [ratedEvents]
  );
  const worst = useMemo(
    () => ratedEvents.reduce((w, e) => (!w || e.overall_rating.average < w.overall_rating.average ? e : w), null),
    [ratedEvents]
  );

  // Merge selected events' elapsed series into one chart dataset keyed by hour.
  const overlayData = useMemo(() => {
    const ids = selectedIds.filter((id) => overlaySeries[id]?.length);
    let maxH = 0;
    ids.forEach((id) => overlaySeries[id].forEach((b) => { if (b.hour > maxH) maxH = b.hour; }));
    const byHour = ids.map((id) => Object.fromEntries(overlaySeries[id].map((b) => [b.hour, b.avgRating])));
    const rows = [];
    for (let h = 0; h <= maxH; h++) {
      const row = { hour: h };
      ids.forEach((id, i) => { row[id] = byHour[i][h] ?? null; });
      rows.push(row);
    }
    return rows;
  }, [selectedIds, overlaySeries]);

  if (loading) {
    return <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box>;
  }
  if (!events.length) {
    return <Alert severity="info">No survey responses recorded for any event yet.</Alert>;
  }

  const liveOptions = events.filter((e) => (e.by_mode?.live || 0) > 0);

  return (
    <Box>
      {/* ------------------------------------------------------------ KPI band */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="Total responses">
            <Typography variant="h4">{totals.responses || 0}</Typography>
            <Typography variant="caption" color="text.secondary">across {totals.events || 0} events</Typography>
          </KpiCard>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="Latest event rating">
            <Stack direction="row" spacing={1} alignItems="baseline">
              <Typography variant="h4">{latest ? latest.overall_rating.average.toFixed(2) : "—"}</Typography>
              {latestDelta != null && latestDelta !== 0 && (
                <Stack direction="row" alignItems="center" sx={{ color: latestDelta > 0 ? "success.main" : "error.main" }}>
                  {latestDelta > 0 ? <UpIcon fontSize="small" /> : <DownIcon fontSize="small" />}
                  <Typography variant="caption">{Math.abs(latestDelta).toFixed(2)}</Typography>
                </Stack>
              )}
            </Stack>
            <Typography variant="caption" color="text.secondary" noWrap>{latest ? shortTitle(latest.title, 24) : "—"}</Typography>
          </KpiCard>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="Best-rated event">
            <Typography variant="h4">{best ? best.overall_rating.average.toFixed(2) : "—"}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap>{best ? shortTitle(best.title, 24) : "—"}</Typography>
          </KpiCard>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="Lowest-rated event">
            <Typography variant="h4">{worst ? worst.overall_rating.average.toFixed(2) : "—"}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap>{worst ? shortTitle(worst.title, 24) : "—"}</Typography>
          </KpiCard>
        </Grid>
      </Grid>

      {/* ------------------------------------------------ calendar macro-trend */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Feedback across events (over time)</Typography>
          <Box sx={{ height: 340 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={macroData} margin={{ top: 16, right: 8, bottom: 24, left: -8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={60} />
                <YAxis yAxisId="left" domain={[0, 5]} tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} allowDecimals={false} />
                <RTooltip />
                <Legend />
                <Bar yAxisId="right" dataKey="count" name="Responses" barSize={26} radius={[3, 3, 0, 0]}>
                  {macroData.map((d, i) => (
                    <Cell key={i} fill={d.lowN ? "#cfd8dc" : "#90caf9"} />
                  ))}
                </Bar>
                <Line yAxisId="left" type="monotone" dataKey="rating" name="Avg overall rating" stroke="#5e35b1" strokeWidth={2} connectNulls dot={{ r: 3 }} />
                <Line yAxisId="left" type="monotone" dataKey="wouldReturn" name="Avg would return" stroke="#2e7d32" strokeWidth={2} strokeDasharray="5 3" connectNulls dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Each point is one event, ordered by date. Lines = avg overall rating (solid) &amp; would-return (dashed); bars = response volume (grey = small sample, n&lt;{LOW_N}).
          </Typography>
        </CardContent>
      </Card>

      {/* --------------------------------------------------- elapsed overlay */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
            <Typography variant="h6">During-event feedback shape (overlay)</Typography>
            <FormControl size="small" sx={{ minWidth: 260, maxWidth: 360 }}>
              <InputLabel id="overlay-events-label">Events to compare</InputLabel>
              <Select
                labelId="overlay-events-label"
                multiple
                value={selectedIds}
                onChange={(e) => setSelectedIds(typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value)}
                input={<OutlinedInput label="Events to compare" />}
                renderValue={(sel) => sel.map((id) => shortTitle(titleFor(id), 14)).join(", ")}
              >
                {liveOptions.map((e) => (
                  <MenuItem key={e.event_id} value={e.event_id}>
                    <Checkbox checked={selectedIds.indexOf(e.event_id) > -1} />
                    <ListItemText primary={e.title || e.event_id} secondary={`${e.by_mode?.live || 0} live · ${e.start_date || ""}`} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {liveOptions.length === 0 ? (
            <Alert severity="info">No events have live (during-event) responses to overlay yet.</Alert>
          ) : overlayData.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress size={28} /></Box>
          ) : (
            <>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={overlayData} margin={{ top: 16, right: 8, bottom: 4, left: -8 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="hour" tick={{ fontSize: 11 }} unit="h" />
                    <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} allowDecimals={false} />
                    <RTooltip labelFormatter={(h) => `Hour ${h} since kickoff`} />
                    <Legend />
                    <ReferenceLine x={24} stroke="#bdbdbd" strokeDasharray="4 3" label={{ value: "Day 2", position: "top", fontSize: 10, fill: "#9e9e9e" }} />
                    <ReferenceLine x={48} stroke="#bdbdbd" strokeDasharray="4 3" label={{ value: "Day 3", position: "top", fontSize: 10, fill: "#9e9e9e" }} />
                    {selectedIds.filter((id) => overlaySeries[id]?.length).map((id, i) => (
                      <Line key={id} type="monotone" dataKey={id} name={shortTitle(titleFor(id), 22)} stroke={SERIES_COLORS[i % SERIES_COLORS.length]} strokeWidth={2} connectNulls dot={false} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Avg overall rating by hours since each event&apos;s kickoff (live responses only) — compare the shape of feedback across events.
              </Typography>
            </>
          )}
        </CardContent>
      </Card>

      {/* ---------------------------------------------------- per-event table */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>Per-event summary</Typography>
          <Box sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Event</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Responses</TableCell>
                  <TableCell align="right">Avg rating</TableCell>
                  <TableCell align="right">Would return</TableCell>
                  <TableCell>Live / Post</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[...events].reverse().map((e) => (
                  <TableRow key={e.event_id} hover>
                    <TableCell>{e.title || e.event_id}</TableCell>
                    <TableCell>{e.start_date || "—"}</TableCell>
                    <TableCell align="right">
                      {e.count}{e.count < LOW_N && <Chip size="small" label="low n" sx={{ ml: 0.5, height: 18 }} />}
                    </TableCell>
                    <TableCell align="right">
                      {e.overall_rating?.average != null ? (
                        <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="flex-end">
                          <span>{e.overall_rating.average.toFixed(2)}</span>
                          <Rating readOnly size="small" precision={0.1} value={e.overall_rating.average} />
                        </Stack>
                      ) : "—"}
                    </TableCell>
                    <TableCell align="right">{e.would_return?.average != null ? e.would_return.average.toFixed(2) : "—"}</TableCell>
                    <TableCell>{e.by_mode?.live || 0} / {e.by_mode?.post || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CrossEventSurveys;
