import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Box,
  Chip,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { format } from 'date-fns';
import useHackathonEvents from '../../hooks/use-hackathon-events';
import { parseLocalDate, isValidDate } from '../../lib/dateUtils';
import ImpactMetrics from '../ImpactMetrics';
import {
  OuterGrid,
  SectionTitle,
  EventLink,
  PastEventText,
  PastEventLocation,
} from './styles';

// ---------------------------------------------------------------------------
// LazyMount — defer ImpactMetrics' per-card API fetches until the card is
// actually near the viewport. Same pattern as before, but the archive is now
// much longer so this is more load-bearing than ever.
// ---------------------------------------------------------------------------
function LazyMount({ children, rootMargin = '300px' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return undefined;
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [visible, rootMargin]);

  return <div ref={ref}>{visible ? children : null}</div>;
}

// ---------------------------------------------------------------------------
// PastEventCard — photo-led card. The image header gives the eye an anchor
// while scanning; without it, scrolling through 30+ events is a wall of text.
// ---------------------------------------------------------------------------
const CardShell = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  borderRadius: 12,
  overflow: 'hidden',
  backgroundColor: '#f0f8ff',
  boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
  transition: 'transform 160ms ease, box-shadow 160ms ease',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
  },
  '&:focus-within': {
    outline: `3px solid ${theme.palette.primary.main}`,
    outlineOffset: 2,
  },
}));

const PhotoFrame = styled(Box)({
  position: 'relative',
  width: '100%',
  aspectRatio: '16 / 9',
  backgroundColor: '#0a4f9e',
  overflow: 'hidden',
});

const YearBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 8,
  right: 8,
  zIndex: 2,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  padding: '4px 10px',
  borderRadius: 999,
  backgroundColor: alpha(theme.palette.common.black, 0.65),
  color: theme.palette.common.white,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: 0.4,
  backdropFilter: 'blur(4px)',
}));

// Gradient fallback for cards with no event photo. The year is the only
// distinctive thing we can show, so make it big.
function GradientFallback({ year }) {
  // Deterministic hue rotation per year so the wall doesn't feel monotone.
  const yearNum = parseInt(year, 10) || 2020;
  const hue = ((yearNum - 2013) * 37) % 360;
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(135deg, hsl(${hue}, 60%, 38%) 0%, hsl(${(hue + 40) % 360}, 65%, 22%) 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-hidden
    >
      <Typography
        sx={{
          color: 'rgba(255,255,255,0.92)',
          fontSize: { xs: 44, sm: 56 },
          fontWeight: 800,
          letterSpacing: 2,
          textShadow: '0 2px 12px rgba(0,0,0,0.25)',
        }}
      >
        {year}
      </Typography>
    </Box>
  );
}

function PastEventCard({ event }) {
  const photo = event?.event_photos?.[0]?.url || null;
  const year = event?.start_date && isValidDate(event.start_date)
    ? format(parseLocalDate(event.start_date), 'yyyy')
    : '';

  return (
    <CardShell>
      <Link
        href={`/hack/${event.event_id}`}
        style={{
          textDecoration: 'none',
          color: 'inherit',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <PhotoFrame>
          {photo ? (
            <Image
              src={photo}
              alt={event.title || `${year} hackathon`}
              fill
              sizes="(max-width: 600px) 100vw, (max-width: 960px) 50vw, 33vw"
              style={{ objectFit: 'cover' }}
              loading="lazy"
            />
          ) : (
            <GradientFallback year={year} />
          )}
          <YearBadge>
            <CalendarTodayIcon sx={{ fontSize: 12 }} />
            {year}
          </YearBadge>
        </PhotoFrame>

        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', flex: 1 }}>
          <EventLink variant="subtitle1" sx={{ fontSize: '1rem', mb: 0.5 }}>
            {event.title}
          </EventLink>

          <PastEventText sx={{ mb: 1, flexGrow: 0 }}>
            {event.description}
          </PastEventText>

          <LazyMount>
            <ImpactMetrics
              event_id={event.event_id}
              eventData={{
                start_date: event.start_date,
                end_date: event.end_date,
                location: event.location,
                title: event.title,
                id: event.id,
              }}
              minimal
            />
          </LazyMount>

          {event.location && (
            <PastEventLocation sx={{ mt: 'auto', pt: 1 }}>
              <LocationOnIcon fontSize="small" sx={{ mr: 0.5 }} />
              {event.location}
            </PastEventLocation>
          )}
        </Box>
      </Link>
    </CardShell>
  );
}

// ---------------------------------------------------------------------------
// YearRail — sticky navigation. Vertical on desktop, horizontal on mobile.
// Active year is driven by IntersectionObserver in the parent, so it tracks
// scroll position without any click state.
// ---------------------------------------------------------------------------
const RailButton = styled('button')(({ theme, $active }) => ({
  appearance: 'none',
  border: 'none',
  background: $active ? theme.palette.primary.main : 'transparent',
  color: $active ? theme.palette.common.white : theme.palette.text.primary,
  fontWeight: $active ? 700 : 500,
  fontSize: '0.9rem',
  padding: '6px 12px',
  borderRadius: 999,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  transition: 'background 120ms ease, color 120ms ease, transform 120ms ease',
  '&:hover': {
    background: $active ? theme.palette.primary.dark : alpha(theme.palette.primary.main, 0.12),
  },
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.dark}`,
    outlineOffset: 2,
  },
}));

function YearRail({ years, activeYear, onYearClick }) {
  const handleClick = (year) => {
    if (onYearClick) onYearClick(year);
    const node = document.getElementById(`year-${year}`);
    node?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Box
      component="nav"
      aria-label="Jump to a year"
      sx={{
        position: 'sticky',
        // NavBar is 64px (per CLAUDE.md CWV hygiene); leave a small gap.
        top: { xs: 64, md: 84 },
        zIndex: 4,
        bgcolor: 'background.paper',
        py: { xs: 1, md: 0 },
        width: { xs: '100%', md: 108 },
        flexShrink: 0,
        borderRight: { md: '1px solid' },
        borderBottom: { xs: '1px solid', md: 'none' },
        borderColor: { xs: 'divider', md: 'divider' },
        alignSelf: { md: 'flex-start' },
        maxHeight: { md: 'calc(100vh - 100px)' },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'row', md: 'column' },
          gap: 0.5,
          overflowX: { xs: 'auto', md: 'visible' },
          overflowY: { md: 'auto' },
          py: 0.5,
          pr: { md: 1 },
          px: { xs: 1, md: 0 },
        }}
      >
        {years.map(({ year, count }) => (
          <RailButton
            key={year}
            type="button"
            $active={activeYear === year}
            onClick={() => handleClick(year)}
            aria-current={activeYear === year ? 'true' : undefined}
            aria-label={`Jump to ${year} — ${count} event${count === 1 ? '' : 's'}`}
          >
            {year}
            <Box
              component="span"
              sx={{
                ml: 0.75,
                fontSize: '0.7rem',
                opacity: 0.7,
                fontWeight: 600,
              }}
            >
              {count}
            </Box>
          </RailButton>
        ))}
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// YearSection — one block per year. The `id="year-{yyyy}"` anchor is what
// both the Story Strip sparkline and the YearRail above scroll to.
// scrollMarginTop accounts for NavBar (64px) + sticky rail (~50px mobile).
// ---------------------------------------------------------------------------
const YearHeading = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  fontSize: '1.75rem',
  lineHeight: 1,
  color: theme.palette.primary.dark,
}));

function YearSection({ year, events }) {
  return (
    <Box
      id={`year-${year}`}
      component="section"
      aria-labelledby={`year-${year}-heading`}
      sx={{
        mb: { xs: 5, md: 6 },
        scrollMarginTop: { xs: 130, md: 100 },
      }}
    >
      <Stack direction="row" alignItems="baseline" spacing={1.5} mb={2}>
        <YearHeading id={`year-${year}-heading`}>{year}</YearHeading>
        <Chip
          size="small"
          label={`${events.length} event${events.length === 1 ? '' : 's'}`}
          variant="outlined"
        />
      </Stack>

      <Grid container spacing={2}>
        {events.map((event) => (
          <Grid
            key={event.event_id || event.title}
            size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
          >
            <PastEventCard event={event} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// PreviousHackathonList — top-level. Groups events by year, renders every
// year on one continuous scroll, tracks the year currently in view, and
// exposes the YearRail + the Story Strip's sparkline as two ways to teleport.
// No pagination. No filter state. Just scroll.
// ---------------------------------------------------------------------------
function PreviousHackathonList() {
  const { hackathons } = useHackathonEvents('previous');

  // Group events by year, sort years desc, sort events within each year desc.
  const yearGroups = useMemo(() => {
    const map = new Map();
    (hackathons || []).forEach((event) => {
      if (!event?.start_date || !isValidDate(event.start_date)) return;
      const y = format(parseLocalDate(event.start_date), 'yyyy');
      if (!map.has(y)) map.set(y, []);
      map.get(y).push(event);
    });
    return Array.from(map.entries())
      .sort((a, b) => parseInt(b[0], 10) - parseInt(a[0], 10))
      .map(([year, events]) => ({
        year,
        events: events
          .slice()
          .sort(
            (a, b) =>
              parseLocalDate(b.start_date) - parseLocalDate(a.start_date)
          ),
      }));
  }, [hackathons]);

  const totalEvents = hackathons ? hackathons.length : 0;

  // Active year on the rail reflects the user's most recent click. We
  // intentionally don't drive it from scroll position — the click is the
  // user's stated intent, and the rail's job is to make that intent fast.
  // (Earlier attempts to follow scroll fought smooth-scroll race conditions
  // for marginal benefit; cutting it removes the bug class entirely.)
  const [activeYear, setActiveYear] = useState(null);

  // Seed the active year so the rail isn't blank on first paint.
  useEffect(() => {
    if (!activeYear && yearGroups.length) {
      setActiveYear(yearGroups[0].year);
    }
  }, [activeYear, yearGroups]);

  // ----- Listen for "jump to year" from the Story Strip above. The strip
  // emits the event; we own the scroll target lookup since we render the
  // year section anchors.
  // ---------------------------------------------------------------------
  useEffect(() => {
    const onJump = (e) => {
      const year = e?.detail?.year;
      if (!year) return;
      setActiveYear(String(year));
      const node = document.getElementById(`year-${year}`);
      node?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    window.addEventListener('ohack:archive-jump-year', onJump);
    return () =>
      window.removeEventListener('ohack:archive-jump-year', onJump);
  }, []);

  const handleRailClick = (year) => {
    setActiveYear(String(year));
  };

  const railYears = yearGroups.map((g) => ({
    year: g.year,
    count: g.events.length,
  }));

  return (
    <OuterGrid
      id="previous-events"
      container
      direction="column"
      sx={{ textAlign: 'left', scrollMarginTop: 100 }}
    >
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <SectionTitle variant="h2" component="h2">
          Previous Events
        </SectionTitle>
        <Typography
          variant="body1"
          color="textSecondary"
          sx={{ maxWidth: 800, mx: 'auto' }}
        >
          {totalEvents > 0
            ? `Browse all ${totalEvents} past hackathons. Use the year rail to jump to any year — every event is visible below.`
            : "Browse our archive of past hackathons."}
        </Typography>
      </Box>

      {yearGroups.length === 0 ? (
        <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', py: 6 }}>
          Loading past events…
        </Typography>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'flex-start',
            gap: { xs: 0, md: 3 },
            width: '100%',
          }}
        >
          <YearRail years={railYears} activeYear={activeYear} onYearClick={handleRailClick} />

          <Box sx={{ flex: 1, minWidth: 0, width: '100%', pt: { xs: 2, md: 0 } }}>
            {yearGroups.map(({ year, events }) => (
              <YearSection key={year} year={year} events={events} />
            ))}
          </Box>
        </Box>
      )}
    </OuterGrid>
  );
}

export default PreviousHackathonList;
