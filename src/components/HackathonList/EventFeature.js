import React from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import { Typography, Box, Chip, Card, CardContent } from "@mui/material";
import { format, getYear } from 'date-fns';
import Link from 'next/link';
import { parseLocalDate, isValidDate } from '../../lib/dateUtils';
import { stripMarkdown } from '../../lib/textUtils';
import ImpactMetrics from '../ImpactMetrics';

// Refined "civic editorial" tokens with fallbacks — /hack loads the webfonts
// but isn't wrapped in <RefinedRoot>, so colors come from these fallbacks.
const RX = {
  ink: 'var(--ink, #16181D)', muted: 'var(--muted, #5B6270)', faint: 'var(--faint, #8A8F9A)',
  line: 'var(--line, #E7E1D4)', brand: 'var(--brand, #1B3A6B)', accent: 'var(--accent, #E2552E)',
  surface: 'var(--surface, #FFFFFF)', surface2: 'var(--surface-2, #F4F1E9)',
  display: "'Fraunces', Georgia, serif", body: "'Hanken Grotesk', system-ui, sans-serif",
};

const DONATION_CATEGORIES = [
  { label: 'Food', key: 'food' },
  { label: 'Prize', key: 'prize' },
  { label: 'Swag', key: 'swag' },
];

function EventFeature(props) {
  const {
    title,
    description,
    type,
    nonprofits,
    start_date,
    end_date,
    location,
    devpostUrl,
    event_id,
    id,
    rawEventLinks,        
    donationGoals,
    donationCurrent,
    compact = false,    
  } = props;

  
  // TODO: Is the schema on the backend wrong? Or is the schema here wrong?
  const eventLinks = typeof rawEventLinks === 'string' ? [rawEventLinks] : rawEventLinks

  // Descriptions may contain Markdown. These cards are clamped teasers wrapped
  // in a single navigation <a>, so strip to clean plain text rather than render
  // Markdown (which would nest anchors and break the line-clamp).
  const descriptionText = stripMarkdown(description);
  
  

  // Compact card design for side-by-side layout
  if (compact) {
    return (
      <Card sx={{ 
        width: '100%',
        backgroundColor: '#f8f9fa',
        borderLeft: '4px solid #003486',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateX(4px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          backgroundColor: '#fff',
        }
      }}>
        <Link href={`/hack/${event_id}`} passHref>
          <CardContent sx={{ cursor: 'pointer', p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#003486', fontSize: '1.1rem' }}>
                {title}
              </Typography>
              {type && (
                <Chip 
                  label={type} 
                  size="small" 
                  sx={{ 
                    backgroundColor: type === 'In-Person' ? '#FFD700' : '#E0E0E0',
                    fontWeight: 500,
                    fontSize: '0.75rem'
                  }} 
                />
              )}
            </Box>
            
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#666', 
                mb: 1,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: 1.4
              }}
            >
              {descriptionText}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              {/* <Typography variant="caption" sx={{ color: '#333', fontWeight: 500 }}>
                📅 {Moment(start_date).format('MMM Do')} - {Moment(end_date).format('MMM Do')}
              </Typography> */}
              <Typography variant="caption" sx={{ color: '#666' }}>
                📍 {location}
              </Typography>
            </Box>
            
            {/* Show nonprofits count if available */}
            {nonprofits && nonprofits.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Chip 
                  label={`${nonprofits.length} ${nonprofits.length === 1 ? 'nonprofit' : 'nonprofits'}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              </Box>
            )}
          </CardContent>
        </Link>
      </Card>
    );
  }

  // Refined full card (civic-editorial). Not wrapped as one big anchor — the
  // title + a "View event" link handle navigation, so the inner event-link
  // buttons aren't nested inside another <a> (invalid HTML in the old version).
  const validDates = isValidDate(start_date) && isValidDate(end_date);
  const sameYear = validDates && getYear(new Date()) === getYear(parseLocalDate(start_date));
  const dateLabel = validDates
    ? `${format(parseLocalDate(start_date), sameYear ? 'MMM d' : 'MMM d, yyyy')} – ${format(parseLocalDate(end_date), 'MMM d, yyyy')}`
    : null;
  const hasDonations = donationCurrent?.food > 0 || donationCurrent?.prize > 0 || donationCurrent?.swag > 0;

  return (
    <Box
      sx={{
        backgroundColor: RX.surface,
        border: `1px solid ${RX.line}`,
        borderRadius: '12px',
        p: { xs: 2.5, md: 3 },
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minWidth: 0,
        overflowWrap: 'anywhere',
        transition: 'transform .2s ease, box-shadow .2s ease, border-color .2s ease',
        '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 18px 40px -28px rgba(22,24,29,0.45)', borderColor: '#d8d1c0' },
      }}
    >
      {/* Eyebrow row: date + type */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
        {dateLabel && (
          <span style={{ fontFamily: RX.body, textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: '0.7rem', fontWeight: 600, color: RX.muted }}>
            {dateLabel}
          </span>
        )}
        {type && (
          <Chip
            label={type}
            size="small"
            sx={{ backgroundColor: RX.surface2, color: RX.muted, border: `1px solid ${RX.line}`, fontWeight: 500, fontSize: '0.72rem', borderRadius: '999px' }}
          />
        )}
      </Box>

      {/* Title */}
      <Link href={`/hack/${event_id}`} style={{ textDecoration: 'none' }}>
        <Typography
          component="h3"
          sx={{ fontFamily: RX.display, fontWeight: 500, letterSpacing: '-0.01em', fontSize: { xs: '1.45rem', md: '1.7rem' }, lineHeight: 1.12, color: RX.ink, '&:hover': { color: RX.brand } }}
        >
          {title}
        </Typography>
      </Link>

      {/* Description */}
      {description && (
        <Typography sx={{ mt: 1.25, color: RX.muted, fontSize: '0.97rem', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {description}
        </Typography>
      )}

      {/* Meta */}
      <Typography sx={{ mt: 1.5, color: RX.faint, fontSize: '0.85rem' }}>
        {location || 'Location TBA'}
        {nonprofits?.length ? ` · ${nonprofits.length} nonprofit${nonprofits.length === 1 ? '' : 's'}` : ''}
      </Typography>

      {/* Donation progress (navy rings) */}
      {hasDonations && (
        <Box sx={{ mt: 2.5, pt: 2.5, borderTop: `1px solid ${RX.line}` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 2 }}>
            {DONATION_CATEGORIES.map(({ label, key }) => {
              if (!(donationCurrent?.[key] > 0)) return null;
              const goal = donationGoals?.[key] || 0;
              const pct = goal > 0 ? Math.min((donationCurrent[key] / goal) * 100, 100) : 0;
              return (
                <Box key={key} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75 }}>
                  <span style={{ fontFamily: RX.body, textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.62rem', fontWeight: 600, color: RX.muted }}>{label}</span>
                  <Box sx={{ width: 58, height: 58 }}>
                    <CircularProgressbar
                      value={pct}
                      text={`${pct.toFixed(0)}%`}
                      styles={{
                        path: { stroke: '#1B3A6B' },
                        trail: { stroke: '#EDE8DC' },
                        text: { fill: '#16181D', fontSize: '24px', fontWeight: 600 },
                      }}
                    />
                  </Box>
                  <span style={{ fontFamily: RX.body, fontSize: '0.72rem', color: RX.faint }}>
                    ${donationCurrent[key]}/{goal}
                  </span>
                </Box>
              );
            })}
          </Box>
          {donationCurrent?.thank_you?.length > 0 && (
            <Typography sx={{ mt: 1.5, fontSize: '0.8rem', textAlign: 'center', fontStyle: 'italic', color: RX.muted }}>
              Special thanks to {donationCurrent.thank_you} for donating!
            </Typography>
          )}
        </Box>
      )}

      {/* Event-link buttons — first is primary navy, rest are hairline ghost */}
      {eventLinks?.length > 0 && (
        <Box sx={{ mt: 2.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {eventLinks.map((alink, i) => {
            const isExternal = alink?.link?.startsWith('http');
            const primary = i === 0;
            return (
              <Link
                key={alink?.name || i}
                prefetch={false}
                href={alink?.link || '#'}
                target={isExternal ? '_blank' : '_self'}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                style={{
                  textDecoration: 'none',
                  fontFamily: RX.body,
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  padding: '0.55em 1em',
                  borderRadius: '6px',
                  border: `1px solid ${primary ? RX.brand : RX.line}`,
                  background: primary ? RX.brand : 'transparent',
                  color: primary ? '#fff' : RX.ink,
                }}
              >
                {alink?.name}
              </Link>
            );
          })}
        </Box>
      )}

      {/* View event affordance */}
      <Box sx={{ mt: eventLinks?.length > 0 ? 1.5 : 2.5 }}>
        <Link href={`/hack/${event_id}`} style={{ textDecoration: 'none', fontFamily: RX.body, fontWeight: 600, fontSize: '0.9rem', color: RX.brand }}>
          View event →
        </Link>
      </Box>

      {/* Impact Metrics */}
      <ImpactMetrics event_id={event_id} eventData={{ start_date, end_date, location, title, id }} />
    </Box>
  );
}

export default EventFeature;
