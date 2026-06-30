import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Chip,
  Stack,
  Rating,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  LinearProgress,
  Tooltip as MuiTooltip,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  FormatQuote as QuoteIcon,
  WarningAmber as WarningIcon,
} from "@mui/icons-material";
import {
  ComposedChart,
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
  aggregate,
  formatAnswer,
  elapsedHourSeries,
  eventDurationHours,
  collectFreeText,
  extractThemes,
  redFlags,
  gist,
  QUESTIONS_BY_ID,
  QUESTION_ORDER,
  ROLE_LABEL,
  qLabel,
} from "./surveyAnalytics";
import CrossEventSurveys from "./CrossEventSurveys";

const API = process.env.NEXT_PUBLIC_API_SERVER_URL;

const fmtDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d) ? "" : d.toLocaleString();
};

// ------------------------------------------------------------------- pieces
const ScaleBars = ({ dist, count }) => (
  <Box sx={{ mt: 1 }}>
    {[5, 4, 3, 2, 1].map((n) => {
      const c = dist[n] || 0;
      const pct = count ? Math.round((c / count) * 100) : 0;
      return (
        <Box key={n} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <Typography variant="caption" sx={{ width: 16, textAlign: "right" }}>{n}</Typography>
          <Box sx={{ flexGrow: 1 }}>
            <LinearProgress
              variant="determinate"
              value={pct}
              sx={{ height: 10, borderRadius: 1, bgcolor: "grey.100" }}
            />
          </Box>
          <Typography variant="caption" sx={{ width: 56 }}>
            {c} ({pct}%)
          </Typography>
        </Box>
      );
    })}
  </Box>
);

const ChoiceBars = ({ counts, total }) => {
  const rows = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return (
    <Box sx={{ mt: 1 }}>
      {rows.map(([opt, c]) => {
        const pct = total ? Math.round((c / total) * 100) : 0;
        return (
          <Box key={opt} sx={{ mb: 0.75 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2">{opt}</Typography>
              <Typography variant="caption" color="text.secondary">{c} ({pct}%)</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={pct}
              sx={{ height: 8, borderRadius: 1, bgcolor: "grey.100" }}
            />
          </Box>
        );
      })}
    </Box>
  );
};

const KpiCard = ({ label, children }) => (
  <Card variant="outlined" sx={{ height: "100%" }}>
    <CardContent>
      <Typography variant="overline" color="text.secondary">{label}</Typography>
      {children}
    </CardContent>
  </Card>
);

const ThemeChips = ({ themes, color }) => (
  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
    {themes.map((t) => (
      <MuiTooltip key={t.term} title={`${t.count} mentions`}>
        <Chip
          label={`${t.term} · ${t.count}`}
          variant="outlined"
          sx={{ borderColor: color, color, fontSize: `${Math.min(1.1, 0.75 + t.count * 0.08)}rem` }}
        />
      </MuiTooltip>
    ))}
  </Stack>
);

// -------------------------------------------------------------------- panel
const EventSurveysPanel = ({ accessToken, orgId, onError }) => {
  const [view, setView] = useState("single"); // "single" | "compare"
  const [hackathons, setHackathons] = useState([]);
  const [eventId, setEventId] = useState("");
  const [summary, setSummary] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [modeFilter, setModeFilter] = useState("all");

  const headers = useMemo(
    () => ({ authorization: `Bearer ${accessToken}`, "content-type": "application/json", "X-Org-Id": orgId }),
    [accessToken, orgId]
  );

  // Hackathon list for the selector (default to the most recent).
  useEffect(() => {
    let active = true;
    (async () => {
      setLoadingEvents(true);
      try {
        const res = await fetch(`${API}/api/messages/hackathons`, { headers });
        if (!res.ok) throw new Error("hackathons");
        const data = await res.json();
        const sorted = [...(data.hackathons || [])].sort(
          (a, b) => new Date(b.start_date) - new Date(a.start_date)
        );
        if (!active) return;
        setHackathons(sorted);
        if (sorted.length) setEventId(sorted[0].event_id || sorted[0].id);
      } catch (e) {
        if (active) onError?.("Failed to load hackathons.");
      } finally {
        if (active) setLoadingEvents(false);
      }
    })();
    return () => { active = false; };
  }, [headers, onError]);

  const loadEvent = useCallback(async (id) => {
    if (!id) return;
    setLoadingData(true);
    setSummary(null);
    setResponses([]);
    try {
      const [sumRes, respRes] = await Promise.all([
        fetch(`${API}/api/surveys/${id}/summary`, { headers }),
        fetch(`${API}/api/surveys/${id}/responses`, { headers }),
      ]);
      const sumJson = sumRes.ok ? await sumRes.json() : null;
      const respJson = respRes.ok ? await respRes.json() : null;
      setSummary(sumJson?.summary || null);
      setResponses(respJson?.responses || []);
    } catch (e) {
      onError?.("Failed to load survey responses.");
    } finally {
      setLoadingData(false);
    }
  }, [headers, onError]);

  useEffect(() => {
    if (view === "single" && eventId) loadEvent(eventId);
  }, [view, eventId, loadEvent]);

  const filtered = useMemo(
    () => (modeFilter === "all" ? responses : responses.filter((r) => r.mode === modeFilter)),
    [responses, modeFilter]
  );
  const agg = useMemo(() => aggregate(filtered), [filtered]);

  // Selected event metadata for the during-event pulse.
  const selectedEvent = useMemo(
    () => hackathons.find((h) => (h.event_id || h.id) === eventId),
    [hackathons, eventId]
  );
  const liveCount = useMemo(() => responses.filter((r) => r.mode === "live").length, [responses]);
  const pulseSeries = useMemo(
    () => elapsedHourSeries(responses, selectedEvent?.start_date, {
      liveOnly: true,
      maxHours: eventDurationHours(selectedEvent?.start_date, selectedEvent?.end_date),
    }),
    [responses, selectedEvent]
  );

  // Free-text themes (split positive vs improvement) + needs-attention.
  const freeText = useMemo(() => collectFreeText(filtered), [filtered]);
  const goingWellThemes = useMemo(() => extractThemes(freeText.positive), [freeText]);
  const toImproveThemes = useMemo(() => extractThemes(freeText.negative), [freeText]);
  const flags = useMemo(() => redFlags(filtered), [filtered]);

  // Questions that actually have data, in catalog order.
  const textBlocks = QUESTION_ORDER.filter((id) => agg.texts[id]?.length);
  const quantBlocks = QUESTION_ORDER.filter((id) => agg.scale[id] || agg.choice[id]);

  if (loadingEvents) {
    return <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <ToggleButtonGroup
        size="small"
        exclusive
        value={view}
        onChange={(_, v) => v && setView(v)}
        sx={{ mb: 3 }}
      >
        <ToggleButton value="single">Single event</ToggleButton>
        <ToggleButton value="compare">Compare events</ToggleButton>
      </ToggleButtonGroup>

      {view === "compare" ? (
        <CrossEventSurveys accessToken={accessToken} orgId={orgId} onError={onError} />
      ) : (
        <>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }} alignItems={{ sm: "center" }}>
            <FormControl sx={{ minWidth: 280 }} size="small">
              <InputLabel id="event-select-label">Event</InputLabel>
              <Select
                labelId="event-select-label"
                label="Event"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
              >
                {hackathons.map((h) => (
                  <MenuItem key={h.id || h.event_id} value={h.event_id || h.id}>
                    {h.title} ({h.start_date})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <ToggleButtonGroup
              size="small"
              exclusive
              value={modeFilter}
              onChange={(_, v) => v && setModeFilter(v)}
            >
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="live">Live</ToggleButton>
              <ToggleButton value="post">Post</ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          {loadingData ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box>
          ) : !responses.length ? (
            <Alert severity="info">No survey responses for this event yet.</Alert>
          ) : (
            <>
              {/* ---------------------------------------------------------- KPIs */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 6, md: 3 }}>
                  <KpiCard label="Responses">
                    <Typography variant="h4">{filtered.length}</Typography>
                    {summary && (
                      <Typography variant="caption" color="text.secondary">
                        {summary.by_mode?.live || 0} live · {summary.by_mode?.post || 0} post
                      </Typography>
                    )}
                  </KpiCard>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <KpiCard label="Avg overall rating">
                    {agg.scale.overall_rating?.count ? (
                      <>
                        <Typography variant="h4">
                          {(agg.scale.overall_rating.sum / agg.scale.overall_rating.count).toFixed(2)}
                        </Typography>
                        <Rating
                          readOnly
                          precision={0.1}
                          value={agg.scale.overall_rating.sum / agg.scale.overall_rating.count}
                          size="small"
                        />
                      </>
                    ) : (
                      <Typography variant="h4">—</Typography>
                    )}
                  </KpiCard>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <KpiCard label="Avg would return (post)">
                    <Typography variant="h4">
                      {agg.scale.would_return?.count
                        ? (agg.scale.would_return.sum / agg.scale.would_return.count).toFixed(2)
                        : "—"}
                    </Typography>
                    {agg.scale.would_return?.count ? (
                      <Typography variant="caption" color="text.secondary">/ 5</Typography>
                    ) : null}
                  </KpiCard>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <KpiCard label="By role">
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                      {Object.entries(
                        filtered.reduce((acc, r) => {
                          acc[r.role] = (acc[r.role] || 0) + 1;
                          return acc;
                        }, {})
                      ).map(([role, n]) => (
                        <Chip key={role} size="small" label={`${ROLE_LABEL[role] || role}: ${n}`} />
                      ))}
                    </Stack>
                  </KpiCard>
                </Grid>
              </Grid>

              {/* ------------------------------------------- during-event pulse */}
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>During-event pulse (live responses)</Typography>
                  {liveCount === 0 || pulseSeries.length === 0 ? (
                    <Alert severity="info">No live (during-event) responses for this event — the pulse needs feedback submitted while the event is running.</Alert>
                  ) : (
                    <>
                      <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={pulseSeries} margin={{ top: 16, right: 8, bottom: 0, left: -8 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="hour" tick={{ fontSize: 11 }} unit="h" />
                            <YAxis yAxisId="left" domain={[0, 5]} tick={{ fontSize: 11 }} allowDecimals={false} />
                            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} allowDecimals={false} />
                            <RTooltip labelFormatter={(h) => `Hour ${h} since kickoff`} />
                            <Legend />
                            <ReferenceLine yAxisId="left" x={24} stroke="#bdbdbd" strokeDasharray="4 3" label={{ value: "Day 2", position: "top", fontSize: 10, fill: "#9e9e9e" }} />
                            <ReferenceLine yAxisId="left" x={48} stroke="#bdbdbd" strokeDasharray="4 3" label={{ value: "Day 3", position: "top", fontSize: 10, fill: "#9e9e9e" }} />
                            <Bar yAxisId="right" dataKey="count" name="Responses" barSize={18} radius={[3, 3, 0, 0]}>
                              {pulseSeries.map((b) => (
                                <Cell key={b.hour} fill={b.lowN ? "#cfd8dc" : "#90caf9"} />
                              ))}
                            </Bar>
                            <Line yAxisId="left" type="monotone" dataKey="avgRating" name="Avg rating" stroke="#5e35b1" strokeWidth={2} connectNulls dot={{ r: 3 }} />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Hours since kickoff. Bars = live responses (grey = small sample, n&lt;3); line = avg rating. Dashed lines mark day boundaries.
                      </Typography>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* ----------------------------------------------- needs attention */}
              {flags.length > 0 && (
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <WarningIcon fontSize="small" color="warning" />
                      <Typography variant="subtitle2">Needs attention ({flags.length})</Typography>
                    </Stack>
                    <Stack divider={<Divider flexItem />} spacing={1}>
                      {flags.map((r) => (
                        <Box key={r.id}>
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                            <Chip size="small" color="primary" label={ROLE_LABEL[r.role] || r.role} />
                            <Chip size="small" variant="outlined" label={r.mode} />
                            {r.answers?.overall_rating != null && (
                              <Rating readOnly size="small" value={Number(r.answers.overall_rating)} />
                            )}
                            <Typography variant="caption" color="text.secondary">{fmtDate(r.created_at)}</Typography>
                          </Stack>
                          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                            {r.reasons.map((reason, i) => (
                              <Chip key={i} size="small" color="warning" variant="outlined" label={reason} />
                            ))}
                          </Stack>
                          {gist(r) && <Typography variant="body2" sx={{ mt: 0.5 }}>“{gist(r)}”</Typography>}
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {/* ------------------------------------------- free-text themes */}
              {(goingWellThemes.length > 0 || toImproveThemes.length > 0) && (
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Recurring themes</Typography>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="subtitle2" sx={{ color: "#2e7d32", mb: 1 }}>Going well</Typography>
                        {goingWellThemes.length ? (
                          <ThemeChips themes={goingWellThemes} color="#2e7d32" />
                        ) : (
                          <Typography variant="body2" color="text.secondary">No recurring terms yet.</Typography>
                        )}
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="subtitle2" sx={{ color: "#e65100", mb: 1 }}>To improve</Typography>
                        {toImproveThemes.length ? (
                          <ThemeChips themes={toImproveThemes} color="#e65100" />
                        ) : (
                          <Typography variant="body2" color="text.secondary">No recurring terms yet.</Typography>
                        )}
                      </Grid>
                    </Grid>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                      Simple term/phrase frequency (≥2 mentions). Read the verbatim quotes below for context.
                    </Typography>
                  </CardContent>
                </Card>
              )}

              {/* ------------------------------------------- qualitative (the gold) */}
              {textBlocks.length > 0 && (
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>What people said</Typography>
                    {textBlocks.map((id) => {
                      const q = QUESTIONS_BY_ID[id];
                      const entries = agg.texts[id];
                      return (
                        <Box key={id} sx={{ mb: 2.5 }}>
                          <Typography variant="subtitle2" color="primary" gutterBottom>
                            {qLabel(q)} <Typography component="span" variant="caption" color="text.secondary">({entries.length})</Typography>
                          </Typography>
                          <Stack spacing={1}>
                            {entries.map((e, i) => (
                              <Box key={i} sx={{ display: "flex", gap: 1, pl: 1, borderLeft: "3px solid", borderColor: "grey.200" }}>
                                <QuoteIcon fontSize="small" sx={{ color: "grey.400", mt: 0.3 }} />
                                <Typography variant="body2" sx={{ flexGrow: 1 }}>{e.text}</Typography>
                                {e.role && <Chip size="small" variant="outlined" label={ROLE_LABEL[e.role] || e.role} />}
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              {/* ----------------------------------------------- quantitative breakdown */}
              {quantBlocks.length > 0 && (
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Question breakdown</Typography>
                    <Grid container spacing={3}>
                      {quantBlocks.map((id) => {
                        const q = QUESTIONS_BY_ID[id];
                        const s = agg.scale[id];
                        const c = agg.choice[id];
                        return (
                          <Grid size={{ xs: 12, md: 6 }} key={id}>
                            <Typography variant="subtitle2" gutterBottom>{qLabel(q)}</Typography>
                            {s && (
                              <>
                                <Typography variant="caption" color="text.secondary">
                                  avg {(s.sum / s.count).toFixed(2)} · n={s.count}
                                </Typography>
                                <ScaleBars dist={s.dist} count={s.count} />
                              </>
                            )}
                            {c && <ChoiceBars counts={c.counts} total={c.total} />}
                          </Grid>
                        );
                      })}
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* ------------------------------------------------ individual responses */}
              <Typography variant="h6" gutterBottom>Individual responses ({filtered.length})</Typography>
              {filtered.map((r) => {
                const answered = Object.keys(r.answers || {})
                  .map((id) => QUESTIONS_BY_ID[id])
                  .filter(Boolean);
                return (
                  <Accordion key={r.id} disableGutters>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                        <Chip size="small" color="primary" label={ROLE_LABEL[r.role] || r.role} />
                        <Chip size="small" variant="outlined" label={r.mode} />
                        {r.answers?.overall_rating != null && (
                          <Rating readOnly size="small" value={Number(r.answers.overall_rating)} />
                        )}
                        <Typography variant="caption" color="text.secondary">
                          {r.is_anonymous ? "Anonymous" : r.email || "Logged-in"} · {fmtDate(r.created_at)}
                        </Typography>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack divider={<Divider flexItem />} spacing={1}>
                        {answered.map((q) => {
                          const formatted = formatAnswer(q, r.answers[q.id]);
                          if (formatted == null) return null;
                          return (
                            <Box key={q.id}>
                              <Typography variant="caption" color="text.secondary">{qLabel(q)}</Typography>
                              <Typography variant="body2">{formatted}</Typography>
                            </Box>
                          );
                        })}
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default EventSurveysPanel;
