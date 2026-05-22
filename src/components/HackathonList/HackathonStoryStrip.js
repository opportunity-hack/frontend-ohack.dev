import React, { useEffect, useMemo, useState } from "react";
import NextLink from "next/link";
import {
  Box,
  Paper,
  Stack,
  Typography,
  Tooltip,
  Link,
  Alert,
  Skeleton,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import GroupsIcon from "@mui/icons-material/Groups";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { format } from "date-fns";
import useHackathonEvents from "../../hooks/use-hackathon-events";
import { useEnv } from "../../context/env.context";
import { parseLocalDate, isValidDate } from "../../lib/dateUtils";
import { trackEvent } from "../../lib/ga";

// Reserve vertical space up front to prevent CLS while the funnel fetches.
// Heights are tuned to match the rendered strip so the skeleton == final size.
const STRIP_MIN_HEIGHT = { xs: 420, md: 240 };

const StripPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(4),
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.10)} 0%, ${alpha(theme.palette.secondary.light, 0.10)} 100%)`,
  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
  borderRadius: theme.shape.borderRadius * 2,
}));

const YearDot = styled("button")(({ theme, $size, $active, $hasEvents }) => ({
  appearance: "none",
  border: "none",
  background: $hasEvents
    ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.75)} 100%)`
    : alpha(theme.palette.text.disabled, 0.25),
  width: $size,
  height: $size,
  borderRadius: "50%",
  cursor: $hasEvents ? "pointer" : "default",
  padding: 0,
  position: "relative",
  flexShrink: 0,
  boxShadow: $active ? `0 0 0 3px ${alpha(theme.palette.primary.main, 0.35)}` : "none",
  transition: "transform 120ms ease, box-shadow 120ms ease",
  "&:hover": $hasEvents
    ? {
        transform: "scale(1.15)",
        boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.25)}`,
      }
    : {},
  "&:focus-visible": {
    outline: `2px solid ${theme.palette.primary.dark}`,
    outlineOffset: 2,
  },
}));

function StatTile({ icon, value, label, loading }) {
  return (
    <Box
      sx={{
        flex: "1 1 150px",
        minWidth: 140,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 1,
        px: 1,
      }}
    >
      <Box sx={{ color: "primary.main", mb: 0.5, display: "flex" }}>{icon}</Box>
      {loading ? (
        <Skeleton variant="text" width={64} height={36} />
      ) : (
        <Typography variant="h5" fontWeight={800} color="primary.main" lineHeight={1.1}>
          {(value || 0).toLocaleString()}
        </Typography>
      )}
      <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ mt: 0.25 }}>
        {label}
      </Typography>
    </Box>
  );
}

function HackathonStoryStrip() {
  const { apiServerUrl } = useEnv();
  const { hackathons: pastEvents } = useHackathonEvents("previous");
  const { hackathons: currentEvents } = useHackathonEvents("current");

  const [funnel, setFunnel] = useState(null);
  const [funnelLoaded, setFunnelLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!apiServerUrl) return undefined;
    fetch(`${apiServerUrl}/api/messages/hackathons/funnel/aggregate`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled) {
          setFunnel(data);
          setFunnelLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) setFunnelLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [apiServerUrl]);

  // Year buckets across the whole archive. We render a continuous range from
  // the earliest event's year up through the current year so the sparkline
  // reads as a timeline even on years with zero events.
  const { yearMarkers, yearsActive, earliestYear } = useMemo(() => {
    const counts = {};
    (pastEvents || []).forEach((e) => {
      if (!e.start_date || !isValidDate(e.start_date)) return;
      const y = format(parseLocalDate(e.start_date), "yyyy");
      counts[y] = (counts[y] || 0) + 1;
    });
    (currentEvents || []).forEach((e) => {
      if (!e.start_date || !isValidDate(e.start_date)) return;
      const y = format(parseLocalDate(e.start_date), "yyyy");
      counts[y] = (counts[y] || 0) + 1;
    });
    const years = Object.keys(counts).map((y) => parseInt(y, 10));
    if (years.length === 0) {
      return { yearMarkers: [], yearsActive: 0, earliestYear: null };
    }
    const min = Math.min(...years);
    const max = Math.max(new Date().getFullYear(), Math.max(...years));
    const markers = [];
    for (let y = min; y <= max; y += 1) {
      markers.push({ year: y, count: counts[String(y)] || 0 });
    }
    return {
      yearMarkers: markers,
      yearsActive: Object.keys(counts).length,
      earliestYear: min,
    };
  }, [pastEvents, currentEvents]);

  const maxCount = useMemo(
    () => yearMarkers.reduce((m, y) => Math.max(m, y.count), 0),
    [yearMarkers]
  );

  const handleYearClick = (year, count) => {
    if (!count) return;
    trackEvent({
      action: "hack_story_strip_year_click",
      params: { event_label: String(year), page: "hack" },
    });
    // Ask the archive below to filter to this year. The archive owns scroll
    // (it scrolls after the filtered grid renders so we land on real content).
    window.dispatchEvent(
      new CustomEvent("ohack:archive-jump-year", { detail: { year } })
    );
  };

  const eventsTotal = funnel?.events_total ?? (pastEvents?.length || 0) + (currentEvents?.length || 0);
  const totalRegistered = funnel?.summary?.registered || 0;
  const totalSubmitted = funnel?.summary?.submitted_project_teams || 0;
  const eventsWithWinners = funnel?.events_with_winners || 0;

  const showStats = funnelLoaded;

  return (
    <Box
      id="since-2013"
      component="section"
      aria-labelledby="story-strip-heading"
      sx={{ minHeight: STRIP_MIN_HEIGHT, scrollMarginTop: 100 }}
    >
      <StripPaper variant="outlined">
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          alignItems={{ xs: "stretch", md: "center" }}
          justifyContent="space-between"
        >
          <Box sx={{ flex: { md: "0 0 auto" }, minWidth: { md: 220 } }}>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ letterSpacing: 1 }}
            >
              {earliestYear ? `Since ${earliestYear}` : "Since 2013"}
            </Typography>
            <Typography
              id="story-strip-heading"
              variant="h5"
              component="h2"
              sx={{ fontWeight: 700, lineHeight: 1.15, mb: 0.5 }}
            >
              {yearsActive ? `${yearsActive} years of hacking for good` : "Our hackathon story"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              The next event builds on every event before it. Jump to any year below.
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            useFlexGap
            sx={{ flex: 1, justifyContent: { xs: "flex-start", md: "center" } }}
          >
            <StatTile
              icon={<EventAvailableIcon />}
              value={eventsTotal}
              label="Hackathons"
              loading={!showStats}
            />
            <StatTile
              icon={<GroupsIcon />}
              value={totalRegistered}
              label="People registered"
              loading={!showStats}
            />
            <StatTile
              icon={<RocketLaunchIcon />}
              value={totalSubmitted}
              label="Projects shipped"
              loading={!showStats}
            />
            <StatTile
              icon={<EmojiEventsIcon />}
              value={eventsWithWinners}
              label="Events with winners"
              loading={!showStats}
            />
          </Stack>

          <Box
            sx={{
              flex: { md: "0 0 auto" },
              textAlign: { xs: "left", md: "right" },
              alignSelf: { md: "center" },
            }}
          >
            <Link
              component={NextLink}
              href="/hack/results"
              underline="hover"
              onClick={() =>
                trackEvent({
                  action: "hack_story_strip_view_results",
                  params: { page: "hack" },
                })
              }
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                fontWeight: 600,
                fontSize: "0.95rem",
              }}
            >
              Full impact report
              <ArrowForwardIcon fontSize="small" />
            </Link>
          </Box>
        </Stack>

        {yearMarkers.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
              sx={{
                overflowX: "auto",
                pb: 1,
                pt: 0.5,
                // Hide the scrollbar but keep horizontal scroll on mobile.
                scrollbarWidth: "thin",
              }}
              aria-label="Hackathon years"
            >
              {yearMarkers.map(({ year, count }) => {
                // Map count → dot size for at-a-glance density.
                const size = maxCount
                  ? 10 + Math.round((count / maxCount) * 18) // 10–28px
                  : 10;
                const labelText = count
                  ? `${year} · ${count} event${count === 1 ? "" : "s"}`
                  : `${year} · no events`;
                return (
                  <Stack
                    key={year}
                    direction="column"
                    alignItems="center"
                    spacing={0.5}
                    sx={{ flexShrink: 0, minWidth: 44 }}
                  >
                    <Tooltip title={labelText} arrow>
                      <YearDot
                        type="button"
                        $size={size}
                        $hasEvents={count > 0}
                        onClick={() => handleYearClick(year, count)}
                        aria-label={`Jump to ${year}${count ? "" : " (no events)"}`}
                        disabled={!count}
                      />
                    </Tooltip>
                    <Typography
                      variant="caption"
                      color={count ? "text.primary" : "text.disabled"}
                      sx={{ fontWeight: count ? 600 : 400, fontSize: "0.7rem" }}
                    >
                      {String(year).slice(2)}
                    </Typography>
                  </Stack>
                );
              })}
            </Stack>
          </Box>
        )}

        <Alert
          severity="info"
          icon={<LocationOnIcon fontSize="small" />}
          sx={{
            mt: 2,
            py: 0.5,
            "& .MuiAlert-message": { fontSize: "0.9rem", py: 0.5 },
          }}
        >
          Local to Arizona?{" "}
          <Link
            component={NextLink}
            href="/hackathons/arizona"
            underline="hover"
            sx={{ fontWeight: 600 }}
          >
            See ASU, Tempe, and Phoenix-area events →
          </Link>
        </Alert>
      </StripPaper>
    </Box>
  );
}

export default HackathonStoryStrip;
