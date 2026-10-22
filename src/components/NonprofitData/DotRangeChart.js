import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// Dot-range (dumbbell) chart in the style of data-journalism graphics:
// each row shows the median as a solid dot and the middle 50% of values
// (25th to 75th percentile) as a thick bar, labeled directly so the
// reader never has to hunt through a legend. Built with plain HTML/CSS
// positioning so it stays crisp and readable at any width.
//
// Layout: on sm+ screens the label sits left of the track and the median
// value right of it. On phones that squeezes the track to ~130px and the
// axis labels collide, so rows stack instead: a header line (label left,
// median right) with the track at full width underneath, and a 3-tick
// axis (start / middle / end) whose labels can never overlap.
//
// rows: [{ label, sublabel, n, p25, median, p75 }]
// max: shared scale maximum (defaults to the largest p75, rounded up)

const formatK = (value) => {
  if (!value) return '$0';
  return `$${Math.round(value / 1000)}K`;
};

const niceMax = (value) => {
  const step = 50000;
  return Math.max(step, Math.ceil(value / step) * step);
};

const Track = ({ row, scaleMax }) => {
  const left = Math.min(100, ((row.p25 || 0) / scaleMax) * 100);
  const width = Math.max(1.5, ((row.p75 - row.p25) / scaleMax) * 100);
  const medianLeft = Math.min(100, ((row.median || 0) / scaleMax) * 100);
  return (
    <Box sx={{ position: 'relative', flexGrow: 1, height: 28, minWidth: 0 }}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: 2,
          bgcolor: 'action.hover',
          transform: 'translateY(-50%)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: `${left}%`,
          width: `${width}%`,
          height: 10,
          bgcolor: 'primary.light',
          borderRadius: 5,
          transform: 'translateY(-50%)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: `${medianLeft}%`,
          width: 16,
          height: 16,
          bgcolor: 'primary.dark',
          border: '2.5px solid #fff',
          borderRadius: '50%',
          boxShadow: '0 1px 3px rgba(0,0,0,0.35)',
          transform: 'translate(-50%, -50%)',
          zIndex: 1,
        }}
      />
    </Box>
  );
};

const Axis = ({ scaleMax, fractions }) => {
  const ticks = fractions.map((f) => Math.round(scaleMax * f));
  return (
    <Box sx={{ position: 'relative', flexGrow: 1, height: 18 }}>
      {ticks.map((tick, i) => (
        <Typography
          key={tick}
          variant="caption"
          color="text.secondary"
          sx={{
            position: 'absolute',
            left: `${fractions[i] * 100}%`,
            transform: i === 0 ? 'none' : i === ticks.length - 1 ? 'translateX(-100%)' : 'translateX(-50%)',
            whiteSpace: 'nowrap',
          }}
        >
          {formatK(tick)}
        </Typography>
      ))}
    </Box>
  );
};

const DotRangeChart = ({ rows, max }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const scaleMax = max || niceMax(Math.max(...rows.map((r) => r.p75 || 0), 0));
  const fractions = isMobile ? [0, 0.5, 1] : [0, 0.25, 0.5, 0.75, 1];

  return (
    <Box>
      {rows.map((row) => (
        isMobile ? (
          <Box
            key={row.label}
            sx={{ py: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 2 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                  {row.label}
                </Typography>
                {row.sublabel && (
                  <Typography variant="caption" color="text.secondary">
                    {row.sublabel}
                  </Typography>
                )}
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                {formatK(row.median)}
                <Typography component="span" variant="caption" color="text.secondary">
                  {' '}(n={row.n})
                </Typography>
              </Typography>
            </Box>
            <Track row={row} scaleMax={scaleMax} />
          </Box>
        ) : (
          <Box
            key={row.label}
            sx={{
              display: 'flex',
              alignItems: 'center',
              py: 1.25,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ width: 210, flexShrink: 0, pr: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                {row.label}
              </Typography>
              {row.sublabel && (
                <Typography variant="caption" color="text.secondary">
                  {row.sublabel}
                </Typography>
              )}
            </Box>
            <Track row={row} scaleMax={scaleMax} />
            <Box sx={{ width: 130, flexShrink: 0, pl: 2, textAlign: 'right' }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {formatK(row.median)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                n={row.n}
              </Typography>
            </Box>
          </Box>
        )
      ))}
      {isMobile ? (
        <Box sx={{ pt: 0.5 }}>
          <Axis scaleMax={scaleMax} fractions={fractions} />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', ml: '210px', mr: '130px', pt: 0.5 }}>
          <Axis scaleMax={scaleMax} fractions={fractions} />
        </Box>
      )}
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
        Dot = median pay. Bar = middle 50% of people (25th to 75th percentile).
      </Typography>
    </Box>
  );
};

export default DotRangeChart;
