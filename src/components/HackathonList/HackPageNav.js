import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { trackEvent } from '../../lib/ga';

// Sections in scroll order. `id` is the in-page anchor; `label` is the chip
// text. Add new sections here when new top-level blocks land on /hack.
const SECTIONS = [
  { id: 'upcoming-events', label: 'Upcoming' },
  { id: 'since-2013', label: 'Since 2013' },
  { id: 'previous-events', label: 'Past Events' },
  { id: 'about-events', label: 'About' },
];

const NavChip = styled('button')(({ theme, $active }) => ({
  appearance: 'none',
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: '0.8rem',
  fontWeight: 600,
  padding: '6px 12px',
  borderRadius: 999,
  whiteSpace: 'nowrap',
  background: $active ? theme.palette.primary.main : 'transparent',
  color: $active ? theme.palette.common.white : theme.palette.text.primary,
  transition: 'background 120ms ease, color 120ms ease, transform 120ms ease',
  '&:hover': {
    background: $active
      ? theme.palette.primary.dark
      : alpha(theme.palette.primary.main, 0.12),
  },
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.dark}`,
    outlineOffset: 2,
  },
}));

// Page-level table of contents. Appears once the hero is scrolled past so
// it doesn't compete with the hero. Desktop: vertical pill stack fixed on
// the left edge. Mobile: horizontal scrollable pill bar fixed below the
// NavBar. Both use `position: fixed` (not sticky) so they stay anchored to
// the viewport regardless of where they live in the document.
function HackPageNav() {
  const [visible, setVisible] = useState(false);
  const [activeId, setActiveId] = useState(SECTIONS[0].id);

  // Show once the hero has scrolled out of view. Driven by a scroll
  // listener (more reliable than IntersectionObserver + rootMargin for a
  // gate-on-scroll-position behavior) — when the hero's bottom edge passes
  // above the NavBar line (~80px), the page TOC takes over.
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    let ticking = false;
    const compute = () => {
      ticking = false;
      const hero = document.querySelector('h1');
      if (!hero) return;
      const heroBottom = hero.getBoundingClientRect().bottom;
      setVisible((prev) => {
        const next = heroBottom < 60;
        return prev !== next ? next : prev;
      });
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(compute);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Track which section is currently in view to highlight the matching
  // chip. Uses the same rAF-throttled scroll listener pattern that the
  // year rail used to before we ripped it out — but at this granularity
  // (4 sections, not 13 years) the scroll race conditions don't bite.
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    let ticking = false;
    const compute = () => {
      ticking = false;
      const anchorY = 160;
      let bestId = null;
      let bestTop = -Infinity;
      SECTIONS.forEach(({ id }) => {
        const node = document.getElementById(id);
        if (!node) return;
        const top = node.getBoundingClientRect().top;
        if (top <= anchorY && top > bestTop) {
          bestTop = top;
          bestId = id;
        }
      });
      if (bestId) setActiveId((prev) => (prev !== bestId ? bestId : prev));
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(compute);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const jump = (id) => {
    trackEvent({
      action: 'hack_page_nav_jump',
      params: { event_label: id, page: 'hack' },
    });
    const node = document.getElementById(id);
    node?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      {/* Desktop: fixed left rail, vertical pill stack */}
      <Box
        component="nav"
        aria-label="Page sections"
        sx={{
          display: visible ? { xs: 'none', md: 'flex' } : 'none',
          position: 'fixed',
          left: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10,
          flexDirection: 'column',
          gap: 0.5,
          bgcolor: 'background.paper',
          p: 1,
          borderRadius: 3,
          boxShadow: 3,
          maxWidth: 140,
        }}
      >
        {SECTIONS.map(({ id, label }) => (
          <NavChip
            key={id}
            type="button"
            $active={activeId === id}
            aria-current={activeId === id ? 'true' : undefined}
            onClick={() => jump(id)}
          >
            {label}
          </NavChip>
        ))}
      </Box>

      {/* Mobile: fixed top bar, horizontal scrollable */}
      <Box
        component="nav"
        aria-label="Page sections"
        sx={{
          display: visible ? { xs: 'flex', md: 'none' } : 'none',
          position: 'fixed',
          top: 64,
          left: 0,
          right: 0,
          zIndex: 10,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          overflowX: 'auto',
          gap: 0.5,
          px: 1,
          py: 0.5,
          // Inertia scrolling on iOS
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {SECTIONS.map(({ id, label }) => (
          <NavChip
            key={id}
            type="button"
            $active={activeId === id}
            aria-current={activeId === id ? 'true' : undefined}
            onClick={() => jump(id)}
          >
            {label}
          </NavChip>
        ))}
      </Box>
    </>
  );
}

export default HackPageNav;
