import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
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
  TextField,
  InputAdornment,
  Avatar,
  LinearProgress,
  Grid,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  ArrowForward as ArrowIcon,
} from "@mui/icons-material";

const API = process.env.NEXT_PUBLIC_API_SERVER_URL;

// Inside the feedback map, numeric values are 0-100 skill scores and string
// values (e.g. "Overall Performance", "Areas for Improvement") are free-text.
// `role` is metadata and rendered separately.
const fmtDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d) ? "" : d.toLocaleDateString();
};

const ScoreRow = ({ label, value }) => (
  <Box sx={{ mb: 0.75 }}>
    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
      <Typography variant="body2">{label}</Typography>
      <Typography variant="caption" color="text.secondary">{value}</Typography>
    </Box>
    <LinearProgress
      variant="determinate"
      value={Math.max(0, Math.min(100, Number(value) || 0))}
      sx={{ height: 8, borderRadius: 1, bgcolor: "grey.100" }}
    />
  </Box>
);

const Person = ({ person, fallback }) => (
  <Stack direction="row" spacing={1} alignItems="center">
    <Avatar src={person?.profile_image || undefined} sx={{ width: 24, height: 24, fontSize: 12 }}>
      {(person?.name || fallback || "?").charAt(0)}
    </Avatar>
    <Typography variant="body2">{person?.name || fallback}</Typography>
  </Stack>
);

const PeerFeedbackPanel = ({ accessToken, orgId, onError }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/admin/feedback/peer`, {
          headers: { authorization: `Bearer ${accessToken}`, "content-type": "application/json", "X-Org-Id": orgId },
        });
        if (!res.ok) throw new Error("peer feedback");
        const json = await res.json();
        if (active) setData(json);
      } catch (e) {
        if (active) onError?.("Failed to load peer feedback.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [accessToken, orgId, onError]);

  const items = data?.feedback || [];
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((f) => {
      const names = [f.receiver?.name, f.giver?.name, f.relationship, f.role]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return names.includes(q);
    });
  }, [items, search]);

  if (loading) {
    return <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box>;
  }
  if (!items.length) {
    return <Alert severity="info">No peer-to-peer feedback recorded yet.</Alert>;
  }

  const byRel = data?.summary?.by_relationship || {};
  const byRole = data?.summary?.by_role || {};

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined"><CardContent>
            <Typography variant="overline" color="text.secondary">Total</Typography>
            <Typography variant="h4">{items.length}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined"><CardContent>
            <Typography variant="overline" color="text.secondary">By relationship</Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
              {Object.entries(byRel).map(([k, n]) => <Chip key={k} size="small" label={`${k}: ${n}`} />)}
            </Stack>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined"><CardContent>
            <Typography variant="overline" color="text.secondary">By role</Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
              {Object.entries(byRole).map(([k, n]) => <Chip key={k} size="small" label={`${k}: ${n}`} />)}
            </Stack>
          </CardContent></Card>
        </Grid>
      </Grid>

      <TextField
        fullWidth
        size="small"
        placeholder="Search by name, relationship, or role…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
      />

      {filtered.map((f) => {
        const fb = f.feedback || {};
        const scores = Object.entries(fb).filter(
          ([k, v]) => k !== "role" && typeof v === "number"
        );
        const texts = Object.entries(fb).filter(
          ([k, v]) => k !== "role" && typeof v === "string" && v.trim()
        );
        return (
          <Accordion key={f.id} disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap sx={{ width: "100%" }}>
                <Person person={f.giver} fallback={f.is_anonymous ? "Anonymous" : "Unknown"} />
                <ArrowIcon fontSize="small" sx={{ color: "grey.400" }} />
                <Person person={f.receiver} fallback="Unknown" />
                {f.role && <Chip size="small" color="primary" variant="outlined" label={f.role} />}
                {f.relationship && <Chip size="small" label={f.relationship} />}
                <Box sx={{ flexGrow: 1 }} />
                <Typography variant="caption" color="text.secondary">{fmtDate(f.timestamp)}</Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack direction="row" spacing={1} sx={{ mb: 1.5 }} flexWrap="wrap" useFlexGap>
                {f.is_anonymous && <Chip size="small" color="warning" label="Anonymous" />}
                {f.confidence_level && <Chip size="small" variant="outlined" label={`Confidence: ${f.confidence_level}`} />}
                {f.duration && <Chip size="small" variant="outlined" label={`Knew for: ${f.duration}`} />}
              </Stack>
              <Grid container spacing={3}>
                {scores.length > 0 && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" gutterBottom>Skill scores</Typography>
                    {scores.map(([k, v]) => <ScoreRow key={k} label={k} value={v} />)}
                  </Grid>
                )}
                {texts.length > 0 && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Stack divider={<Divider flexItem />} spacing={1}>
                      {texts.map(([k, v]) => (
                        <Box key={k}>
                          <Typography variant="caption" color="text.secondary">{k}</Typography>
                          <Typography variant="body2">{v}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Grid>
                )}
              </Grid>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};

export default PeerFeedbackPanel;
