import React, { useMemo } from 'react';
import {
  Paper, Typography, Box, Grid, Chip, Tooltip, Stack, Divider, Alert,
} from '@mui/material';
import { styled, alpha, useTheme } from '@mui/material/styles';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const FunnelContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.08)} 0%, ${alpha(theme.palette.secondary.light, 0.08)} 100%)`,
  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
  borderRadius: theme.shape.borderRadius * 2,
}));

// Visual funnel "slice" that gets narrower for later stages.
// Width is a percentage; color is per stage.
const FunnelSlice = ({ widthPct, color, height = 84, value, pctOfTop, label, sublabel, icon }) => {
  const theme = useTheme();
  const bg = `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.7)} 100%)`;
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        position: 'relative',
        width: '100%',
      }}
    >
      <Box
        sx={{
          width: `${widthPct}%`,
          minWidth: 240,
          maxWidth: 760,
          minHeight: height,
          background: bg,
          color: theme.palette.getContrastText(color),
          borderRadius: 2,
          px: { xs: 2, md: 3 },
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          boxShadow: theme.shadows[2],
          transition: 'transform 120ms, box-shadow 120ms',
          '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.shadows[4] },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
          {icon}
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.15 }}>
              {label}
            </Typography>
            {sublabel && (
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {sublabel}
              </Typography>
            )}
          </Box>
        </Box>
        <Box sx={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1 }}>
            {value?.toLocaleString?.() ?? value ?? '—'}
          </Typography>
          {pctOfTop != null && (
            <Tooltip title="Share of the top of the funnel">
              <Typography variant="caption" sx={{ opacity: 0.9, mt: 0.25 }}>
                {pctOfTop}% of top
              </Typography>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Box>
  );
};

// Compact chip rendered BETWEEN slices to make the drop-off the headline.
const DropChip = ({ pct, color }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      my: 0.75,
    }}
  >
    <Chip
      icon={<TrendingDownIcon sx={{ fontSize: 16 }} />}
      label={`${pct}% from previous`}
      size="small"
      sx={{
        bgcolor: alpha(color, 0.15),
        color,
        border: `1px solid ${alpha(color, 0.4)}`,
        fontWeight: 600,
        height: 24,
      }}
    />
  </Box>
);

const formatPct = (numerator, denominator) => {
  if (!denominator || numerator == null) return null;
  return Math.round((numerator / denominator) * 100);
};

const BreakdownBlock = ({ title, data }) => {
  if (!data || typeof data !== 'object') return null;
  const entries = Object.entries(data)
    .filter(([k]) => k && k !== 'Unknown')
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  if (entries.length === 0) return null;
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {title}
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
        {entries.map(([k, v]) => (
          <Chip key={k} size="small" label={`${k}: ${v}`} sx={{ mb: 0.5 }} />
        ))}
      </Stack>
    </Box>
  );
};

const HackathonFunnel = ({ funnel, hasResults }) => {
  const theme = useTheme();

  const stages = useMemo(() => {
    const summary = funnel?.summary || {};
    const participation = funnel?.participation || {};
    const winners = funnel?.winners || {};

    const interested = summary.registered ?? null;
    const appliedHacker = participation.applied_as_hacker ?? null;
    const formedTeam = participation.formed_team ?? null;
    const started = summary.started_project ?? null;
    const submitted = summary.submitted_project ?? null;
    const wonPrize = winners.won_prize ?? 0;
    const founding = winners.founding_engineers ?? 0;

    // Width math: linear widths make the funnel useless when one stage is
    // 14x another (everything below "Interested" collapses to the floor).
    // Instead we (a) use log scaling so each stage stays distinguishable,
    // and (b) enforce a monotonic step-down so the bars still TAPER even
    // when two consecutive stages have similar magnitudes. The numeric
    // dropoff is told separately via the drop chips between rows.
    const candidates = [interested, appliedHacker, formedTeam, started, submitted, wonPrize, founding]
      .filter((v) => typeof v === 'number');
    const top = candidates.length ? Math.max(...candidates, 1) : 1;

    const MIN_WIDTH = 22;        // floor so the narrowest bar is still readable
    const MAX_WIDTH = 100;
    const STEP = 5;              // each stage must be ≥ STEP% narrower than the previous
    const logTop = Math.log1p(top);
    const widthForLog = (val) => {
      if (!Number.isFinite(val) || val <= 0 || logTop <= 0) return MIN_WIDTH;
      const norm = Math.log1p(val) / logTop;   // 0..1
      return MIN_WIDTH + norm * (MAX_WIDTH - MIN_WIDTH);
    };

    // For each stage, compute the "previous" stage value (the closest
    // earlier stage that has a count) so the % drop shown is meaningful
    // even when an upstream stage is missing.
    const stageDefs = [
      interested != null && {
        key: 'registered',
        label: 'Interested',
        sublabel: 'People who registered on DevPost',
        value: interested,
        color: theme.palette.info.main,
        icon: <HowToRegIcon fontSize="large" />,
      },
      appliedHacker != null && appliedHacker > 0 && {
        key: 'applied_hacker',
        label: 'Applied as a hacker',
        sublabel: 'People who filled out the OHack hacker application',
        value: appliedHacker,
        color: theme.palette.secondary.main,
        icon: <AssignmentIndIcon fontSize="large" />,
      },
      formedTeam != null && formedTeam > 0 && {
        key: 'formed_team',
        label: 'Formed a team',
        sublabel: 'People on a team in our system',
        value: formedTeam,
        color: theme.palette.info.dark,
        icon: <GroupAddIcon fontSize="large" />,
      },
      started != null && {
        key: 'started',
        label: 'Started a project',
        sublabel: 'People on a DevPost project (any state)',
        value: started,
        color: theme.palette.primary.main,
        icon: <RocketLaunchIcon fontSize="large" />,
      },
      submitted != null && {
        key: 'submitted',
        label: 'Submitted a project',
        sublabel: 'People on a submitted DevPost project',
        value: submitted,
        color: theme.palette.success.main,
        icon: <CloudUploadIcon fontSize="large" />,
      },
      hasResults && {
        key: 'won',
        label: 'Won a prize',
        sublabel: 'People on a top-placement or category-winning team',
        value: wonPrize,
        color: theme.palette.warning.main,
        icon: <EmojiEventsIcon fontSize="large" />,
      },
      hasResults && {
        key: 'founding',
        label: 'Founding Engineers (1st place)',
        sublabel: 'People on the 1st-place team',
        value: founding,
        color: theme.palette.error.main,
        icon: <StarIcon fontSize="large" />,
      },
    ].filter(Boolean);

    let prevValue = null;
    let prevWidth = MAX_WIDTH + STEP; // so the first stage isn't capped
    return stageDefs.map((s) => {
      const rawWidth = widthForLog(Math.max(s.value || 0, 1));
      // Cap so each stage is at least STEP% narrower than the previous one
      // (enforces visual taper even when two stages have close magnitudes).
      const cappedWidth = Math.min(rawWidth, prevWidth - STEP);
      const finalWidth = Math.max(cappedWidth, MIN_WIDTH);
      const out = {
        ...s,
        widthPct: finalWidth,
        pctOf: prevValue ? formatPct(s.value, prevValue) : null,
        pctOfTop: top ? formatPct(s.value, top) : null,
      };
      if (typeof s.value === 'number') prevValue = s.value;
      prevWidth = finalWidth;
      return out;
    });
  }, [funnel, hasResults, theme]);

  if (stages.length === 0) return null;

  const summary = funnel?.summary;

  return (
    <FunnelContainer elevation={2} id="funnel">
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
          The Hacker Funnel
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 760, mx: 'auto' }}>
          Every hackathon starts with people curious enough to register and ends with a small group who push all the way through.
          We track this funnel because the people who reach the bottom tend to share the traits we look for in high-performing
          engineers: <strong>grit, iteration, leadership, and the drive to land real impact</strong>.
        </Typography>
      </Box>

      <Box sx={{ mb: 1 }}>
        {stages.map((s, idx) => (
          <React.Fragment key={s.key}>
            {idx > 0 && s.pctOf != null && (
              <DropChip pct={s.pctOf} color={s.color} />
            )}
            <FunnelSlice
              widthPct={s.widthPct}
              color={s.color}
              icon={s.icon}
              label={s.label}
              sublabel={s.sublabel}
              value={s.value}
              pctOfTop={idx === 0 ? null : s.pctOfTop}
            />
          </React.Fragment>
        ))}
      </Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', textAlign: 'center', mb: 2 }}
      >
        Bar widths use a logarithmic scale so each stage stays readable — the
        chips above each row tell the real dropoff story.
      </Typography>

      {!hasResults && (
        <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
          Winners will appear here once judging is complete.
        </Alert>
      )}

      {summary && (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            How the field broke down
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <BreakdownBlock title="Where they came from" data={summary.country_breakdown} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <BreakdownBlock title="How they heard about us" data={summary.referral_breakdown} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <BreakdownBlock title="Team intent at signup" data={summary.teammate_intent_breakdown} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <BreakdownBlock title="Project status" data={summary.status_breakdown} />
            </Grid>
          </Grid>
          {summary.last_updated && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              Funnel data updated {new Date(summary.last_updated).toLocaleDateString()}
              {summary.source ? ` · source: ${summary.source}` : ''}
            </Typography>
          )}
        </>
      )}
    </FunnelContainer>
  );
};

export default HackathonFunnel;
