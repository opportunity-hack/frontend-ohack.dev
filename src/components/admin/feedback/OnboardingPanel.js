import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Chip,
  Stack,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Rating,
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Tooltip as MuiTooltip,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ContentCopy as CopyIcon,
  TrendingUp as UpIcon,
  TrendingDown as DownIcon,
  WarningAmber as WarningIcon,
} from "@mui/icons-material";
import {
  ComposedChart,
  BarChart,
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
import moment from "moment";
import {
  EASE_ORDER,
  EASE_COLORS,
  CLEAR_EASE,
  CONFUSING_EASE,
  USEFUL_TOPICS,
  parseTs,
  bucketKeyFor,
  bucketByPeriod,
  extractThemes,
  parseDevice,
} from "./onboardingAnalytics";

const API = process.env.NEXT_PUBLIC_API_SERVER_URL;
const RANGE_DAYS = { "90d": 90, "12mo": 365, all: null };

const fmtDate = (iso) => {
  const d = parseTs(iso);
  return d ? d.toLocaleDateString() : "";
};
const gist = (it) => (it.missingTopics || it.improvements || it.additionalFeedback || "").trim();

const avgRatingBetween = (items, from, to) => {
  let sum = 0;
  let n = 0;
  for (const it of items) {
    if (typeof it.overallRating !== "number" || it.overallRating <= 0) continue;
    const d = parseTs(it.timestamp);
    if (!d) continue;
    const m = moment(d);
    if (m.isSameOrAfter(from) && m.isBefore(to)) {
      sum += it.overallRating;
      n += 1;
    }
  }
  return n ? sum / n : null;
};

const KpiCard = ({ label, children }) => (
  <Card variant="outlined" sx={{ height: "100%" }}>
    <CardContent>
      <Typography variant="overline" color="text.secondary">{label}</Typography>
      {children}
    </CardContent>
  </Card>
);

// Compact labeled bar (reused for rating / ease / topic distributions).
const StatBar = ({ label, value, total, color }) => {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <Box sx={{ mb: 0.75 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="body2">{label}</Typography>
        <Typography variant="caption" color="text.secondary">{value} ({pct}%)</Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{ height: 8, borderRadius: 1, bgcolor: "grey.100",
          "& .MuiLinearProgress-bar": color ? { bgcolor: color } : {} }}
      />
    </Box>
  );
};

const OnboardingPanel = ({ accessToken, orgId, onError }) => {
  const [data, setData] = useState(null);
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [granularity, setGranularity] = useState("month");
  const [range, setRange] = useState("all");
  const [easeFilter, setEaseFilter] = useState("all");

  const headers = useMemo(
    () => ({ authorization: `Bearer ${accessToken}`, "content-type": "application/json", "X-Org-Id": orgId }),
    [accessToken, orgId]
  );

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const [obRes, hackRes] = await Promise.all([
          fetch(`${API}/api/admin/feedback/onboarding`, { headers }),
          fetch(`${API}/api/messages/hackathons`, { headers }),
        ]);
        if (!obRes.ok) throw new Error("onboarding");
        const obJson = await obRes.json();
        const hackJson = hackRes.ok ? await hackRes.json() : { hackathons: [] };
        if (!active) return;
        setData(obJson);
        setHackathons(hackJson.hackathons || []);
      } catch (e) {
        if (active) onError?.("Failed to load onboarding feedback.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [headers, onError]);

  const allItems = data?.onboarding_feedback || [];

  // Single range control drives the whole dashboard.
  const items = useMemo(() => {
    const days = RANGE_DAYS[range];
    if (!days) return allItems;
    const cutoff = moment().subtract(days, "days");
    return allItems.filter((it) => {
      const d = parseTs(it.timestamp);
      return d && moment(d).isSameOrAfter(cutoff);
    });
  }, [allItems, range]);

  const buckets = useMemo(() => bucketByPeriod(items, granularity), [items, granularity]);

  // 100%-stacked clarity mix per bucket (proportions, not counts).
  const claritySeries = useMemo(
    () => buckets.map((b) => {
      const total = EASE_ORDER.reduce((s, e) => s + (b[e] || 0), 0);
      const row = { label: b.label, total };
      EASE_ORDER.forEach((e) => { row[e] = total ? Math.round(((b[e] || 0) / total) * 100) : 0; });
      return row;
    }),
    [buckets]
  );

  // Event markers aligned to the bucket they fall in.
  const eventMarkers = useMemo(() => {
    const keyToLabel = new Map(buckets.map((b) => [b.key, b.label]));
    const byLabel = {};
    hackathons.forEach((h) => {
      const d = parseTs(h.start_date);
      if (!d) return;
      const label = keyToLabel.get(bucketKeyFor(d, granularity));
      if (!label) return;
      (byLabel[label] = byLabel[label] || []).push(h.title);
    });
    return Object.entries(byLabel).map(([label, titles]) => ({
      label,
      title: titles.length > 1 ? `${titles.length} events` : titles[0],
    }));
  }, [hackathons, buckets, granularity]);

  // KPIs.
  const rated = items.filter((it) => typeof it.overallRating === "number" && it.overallRating > 0);
  const avgRating = rated.length ? rated.reduce((s, it) => s + it.overallRating, 0) / rated.length : null;
  const easeAnswered = items.filter((it) => it.easeOfUnderstanding);
  const clearN = easeAnswered.filter((it) => CLEAR_EASE.has(it.easeOfUnderstanding)).length;
  const clearPct = easeAnswered.length ? Math.round((clearN / easeAnswered.length) * 100) : null;
  const willingN = items.filter((it) => it.contact?.willing).length;
  const willingPct = items.length ? Math.round((willingN / items.length) * 100) : 0;

  const ratingDelta = useMemo(() => {
    const span = RANGE_DAYS[range] || 90;
    const cur = avgRatingBetween(allItems, moment().subtract(span, "days"), moment());
    const prev = avgRatingBetween(allItems, moment().subtract(2 * span, "days"), moment().subtract(span, "days"));
    return cur != null && prev != null ? +(cur - prev).toFixed(2) : null;
  }, [allItems, range]);

  // Distributions.
  const ratingDist = useMemo(() => {
    const d = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    rated.forEach((it) => { d[it.overallRating] = (d[it.overallRating] || 0) + 1; });
    return d;
  }, [rated]);
  const easeDist = useMemo(() => {
    const d = {};
    EASE_ORDER.forEach((e) => { d[e] = 0; });
    easeAnswered.forEach((it) => { d[it.easeOfUnderstanding] = (d[it.easeOfUnderstanding] || 0) + 1; });
    return d;
  }, [easeAnswered]);
  const topicFreq = useMemo(
    () => USEFUL_TOPICS.map((t) => ({ topic: t, count: items.filter((it) => (it.usefulTopics || []).includes(t)).length })),
    [items]
  );

  // Action lists.
  const followUps = useMemo(
    () => items.filter((it) => it.contact?.willing && it.contact?.email),
    [items]
  );
  const needsAttention = useMemo(
    () => items.filter(
      (it) => (typeof it.overallRating === "number" && it.overallRating > 0 && it.overallRating <= 2) ||
        CONFUSING_EASE.has(it.easeOfUnderstanding)
    ),
    [items]
  );
  const themes = useMemo(
    () => extractThemes(items.flatMap((it) => [it.missingTopics, it.improvements])),
    [items]
  );

  const responseList = useMemo(
    () => (easeFilter === "all" ? items : items.filter((it) => it.easeOfUnderstanding === easeFilter)),
    [items, easeFilter]
  );

  const copyEmails = useCallback(() => {
    const emails = followUps.map((f) => f.contact.email).filter(Boolean).join(", ");
    if (navigator.clipboard && emails) {
      navigator.clipboard.writeText(emails);
      onError?.(`Copied ${followUps.length} email${followUps.length === 1 ? "" : "s"}.`, "success");
    }
  }, [followUps, onError]);

  if (loading) {
    return <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box>;
  }
  if (!allItems.length) {
    return <Alert severity="info">No onboarding feedback recorded yet.</Alert>;
  }

  return (
    <Box>
      {/* range control (drives the whole dashboard) */}
      <Stack direction="row" spacing={1} sx={{ mb: 2 }} alignItems="center" flexWrap="wrap" useFlexGap>
        <Typography variant="caption" color="text.secondary">Window:</Typography>
        <ToggleButtonGroup size="small" exclusive value={range} onChange={(_, v) => v && setRange(v)}>
          <ToggleButton value="90d">90 days</ToggleButton>
          <ToggleButton value="12mo">12 months</ToggleButton>
          <ToggleButton value="all">All time</ToggleButton>
        </ToggleButtonGroup>
        <Box sx={{ flexGrow: 1 }} />
        <Typography variant="caption" color="text.secondary">
          {items.length} of {allItems.length} responses
        </Typography>
      </Stack>

      {/* ----------------------------------------------------------- KPI band */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="Responses">
            <Typography variant="h4">{items.length}</Typography>
            <Typography variant="caption" color="text.secondary">{willingN} open to follow-up</Typography>
          </KpiCard>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="Avg rating">
            <Stack direction="row" spacing={1} alignItems="baseline">
              <Typography variant="h4">{avgRating != null ? avgRating.toFixed(2) : "—"}</Typography>
              {ratingDelta != null && ratingDelta !== 0 && (
                <Stack direction="row" alignItems="center" sx={{ color: ratingDelta > 0 ? "success.main" : "error.main" }}>
                  {ratingDelta > 0 ? <UpIcon fontSize="small" /> : <DownIcon fontSize="small" />}
                  <Typography variant="caption">{Math.abs(ratingDelta).toFixed(2)}</Typography>
                </Stack>
              )}
            </Stack>
            {avgRating != null && <Rating readOnly precision={0.1} value={avgRating} size="small" />}
          </KpiCard>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="% clear">
            <Typography variant="h4">{clearPct != null ? `${clearPct}%` : "—"}</Typography>
            <Typography variant="caption" color="text.secondary">Very easy + Mostly clear</Typography>
          </KpiCard>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="% willing to follow up">
            <Typography variant="h4">{willingPct}%</Typography>
            <Typography variant="caption" color="text.secondary">{willingN} of {items.length}</Typography>
          </KpiCard>
        </Grid>
      </Grid>

      {/* --------------------------------------------------- trends over time */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
            <Typography variant="h6">Feedback over time</Typography>
            <ToggleButtonGroup size="small" exclusive value={granularity} onChange={(_, v) => v && setGranularity(v)}>
              <ToggleButton value="week">Weekly</ToggleButton>
              <ToggleButton value="month">Monthly</ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          {buckets.length === 0 ? (
            <Alert severity="info">No dated responses in this window.</Alert>
          ) : (
            <>
              <Box sx={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={buckets} margin={{ top: 16, right: 8, bottom: 0, left: -8 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                    <YAxis yAxisId="left" domain={[0, 5]} tick={{ fontSize: 11 }} allowDecimals={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} allowDecimals={false} />
                    <RTooltip />
                    <Legend />
                    <Bar yAxisId="right" dataKey="count" name="Responses" barSize={28} radius={[3, 3, 0, 0]}>
                      {buckets.map((b) => (
                        <Cell key={b.key} fill={b.lowN ? "#cfd8dc" : "#90caf9"} />
                      ))}
                    </Bar>
                    <Line yAxisId="left" type="monotone" dataKey="avgRating" name="Avg rating" stroke="#5e35b1" strokeWidth={2} connectNulls={false} dot={{ r: 3 }} />
                    {eventMarkers.map((m) => (
                      <ReferenceLine
                        key={m.label}
                        yAxisId="left"
                        x={m.label}
                        stroke="#7b1fa2"
                        strokeDasharray="4 3"
                        label={{ value: m.title, position: "top", fontSize: 9, fill: "#7b1fa2" }}
                      />
                    ))}
                  </ComposedChart>
                </ResponsiveContainer>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Bars = response volume (grey = small sample, n&lt;3 — interpret the rating with care). Dashed lines mark hackathon dates.
              </Typography>

              {/* clarity mix (proportions) */}
              <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>Clarity mix over time (% of responses by ease)</Typography>
              <Box sx={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={claritySeries} margin={{ top: 4, right: 8, bottom: 0, left: -8 }} stackOffset="expand">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
                    <RTooltip formatter={(v, name) => [`${v}%`, name]} />
                    <Legend />
                    {EASE_ORDER.map((e) => (
                      <Bar key={e} dataKey={e} name={e} stackId="ease" fill={EASE_COLORS[e]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* ---------------------------------------------------- snapshot distributions */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined" sx={{ height: "100%" }}><CardContent>
            <Typography variant="subtitle2" gutterBottom>Rating distribution</Typography>
            {[5, 4, 3, 2, 1].map((n) => (
              <StatBar key={n} label={`${n} ★`} value={ratingDist[n] || 0} total={rated.length} />
            ))}
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined" sx={{ height: "100%" }}><CardContent>
            <Typography variant="subtitle2" gutterBottom>Ease of understanding</Typography>
            {EASE_ORDER.map((e) => (
              <StatBar key={e} label={e} value={easeDist[e] || 0} total={easeAnswered.length} color={EASE_COLORS[e]} />
            ))}
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined" sx={{ height: "100%" }}><CardContent>
            <Typography variant="subtitle2" gutterBottom>Most-cited helpful resources</Typography>
            {topicFreq.map(({ topic, count }) => (
              <StatBar key={topic} label={topic} value={count} total={items.length} />
            ))}
          </CardContent></Card>
        </Grid>
      </Grid>

      {/* ----------------------------------------------------------- action lists */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ height: "100%" }}><CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle2">Follow-up queue ({followUps.length})</Typography>
              {followUps.length > 0 && (
                <Button size="small" startIcon={<CopyIcon />} onClick={copyEmails}>Copy emails</Button>
              )}
            </Stack>
            {followUps.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No one opted in for follow-up in this window.</Typography>
            ) : (
              <Stack divider={<Divider flexItem />} spacing={1}>
                {followUps.map((f) => (
                  <Box key={f.id}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{f.contact.firstName || "—"}</Typography>
                      <Typography variant="caption" color="text.secondary">{f.contact.email}</Typography>
                      {f.overallRating ? <Rating readOnly size="small" value={Number(f.overallRating)} /> : null}
                    </Stack>
                    {gist(f) && <Typography variant="caption" color="text.secondary">“{gist(f)}”</Typography>}
                  </Box>
                ))}
              </Stack>
            )}
          </CardContent></Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ height: "100%" }}><CardContent>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <WarningIcon fontSize="small" color="warning" />
              <Typography variant="subtitle2">Needs attention ({needsAttention.length})</Typography>
            </Stack>
            {needsAttention.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No low-rated or confusing responses. 🎉</Typography>
            ) : (
              <Stack divider={<Divider flexItem />} spacing={1}>
                {needsAttention.map((it) => (
                  <Box key={it.id}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                      {it.overallRating ? <Rating readOnly size="small" value={Number(it.overallRating)} /> : null}
                      {it.easeOfUnderstanding && (
                        <Chip size="small" label={it.easeOfUnderstanding}
                          sx={{ bgcolor: EASE_COLORS[it.easeOfUnderstanding], color: "#fff" }} />
                      )}
                      <Typography variant="caption" color="text.secondary">{fmtDate(it.timestamp)}</Typography>
                    </Stack>
                    {gist(it) && <Typography variant="body2">“{gist(it)}”</Typography>}
                  </Box>
                ))}
              </Stack>
            )}
          </CardContent></Card>
        </Grid>
      </Grid>

      {/* -------------------------------------------- free-text themes (keyword) */}
      {themes.length > 0 && (
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>Recurring words & phrases (missing topics + improvements)</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {themes.map((t) => (
                <MuiTooltip key={t.term} title={`${t.count} mentions`}>
                  <Chip label={`${t.term} · ${t.count}`} variant="outlined"
                    sx={{ fontSize: `${Math.min(1.1, 0.75 + t.count * 0.08)}rem` }} />
                </MuiTooltip>
              ))}
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
              Simple term/phrase frequency (≥2 mentions). Read the verbatim quotes above for context.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* ----------------------------------------------------- all responses */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
        <Typography variant="h6">All responses ({responseList.length})</Typography>
        <ToggleButtonGroup size="small" exclusive value={easeFilter} onChange={(_, v) => v && setEaseFilter(v)}>
          <ToggleButton value="all">All</ToggleButton>
          {EASE_ORDER.map((e) => (
            <ToggleButton key={e} value={e}>{e.split(" ")[0]}</ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>
      {responseList.map((it) => {
        const dev = parseDevice(it.userAgent);
        return (
          <Accordion key={it.id} disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap sx={{ width: "100%" }}>
                {it.overallRating ? <Rating readOnly size="small" value={Number(it.overallRating)} /> : <Chip size="small" label="unrated" />}
                {it.easeOfUnderstanding && (
                  <Chip size="small" label={it.easeOfUnderstanding}
                    sx={{ bgcolor: EASE_COLORS[it.easeOfUnderstanding], color: "#fff" }} />
                )}
                {it.contact?.willing && it.contact?.firstName && (
                  <Chip size="small" color="primary" variant="outlined" label={it.contact.firstName} />
                )}
                <Box sx={{ flexGrow: 1 }} />
                <Chip size="small" variant="outlined" label={dev.label} />
                <Typography variant="caption" color="text.secondary">{fmtDate(it.timestamp)}</Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              {it.usefulTopics?.length > 0 && (
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">Useful topics</Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                    {it.usefulTopics.map((t) => <Chip key={t} size="small" label={t} />)}
                  </Stack>
                </Box>
              )}
              <Stack divider={<Divider flexItem />} spacing={1}>
                {it.missingTopics && (
                  <Box><Typography variant="caption" color="text.secondary">Missing / wanted topics</Typography>
                    <Typography variant="body2">{it.missingTopics}</Typography></Box>
                )}
                {it.improvements && (
                  <Box><Typography variant="caption" color="text.secondary">Suggested improvements</Typography>
                    <Typography variant="body2">{it.improvements}</Typography></Box>
                )}
                {it.additionalFeedback && (
                  <Box><Typography variant="caption" color="text.secondary">Additional feedback</Typography>
                    <Typography variant="body2">{it.additionalFeedback}</Typography></Box>
                )}
                {it.contact?.willing && it.contact?.email && (
                  <Box><Typography variant="caption" color="text.secondary">Follow-up contact</Typography>
                    <Typography variant="body2">{it.contact.firstName} &lt;{it.contact.email}&gt;</Typography></Box>
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};

export default OnboardingPanel;
