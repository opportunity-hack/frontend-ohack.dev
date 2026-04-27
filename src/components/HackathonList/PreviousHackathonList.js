import React, { useState, useEffect, useRef } from 'react';
import useHackathonEvents from '../../hooks/use-hackathon-events';
import { 
  OuterGrid,
  SectionTitle,
  PastEventCard,
  PastEventGrid,
  EventLink,
  PastEventYear,
  PastEventText,
  PastEventLocation,
  ToggleButton
} from './styles';
import { Chip, Box, Typography, Pagination, Grid } from '@mui/material';
import Link from 'next/link';
import { format } from 'date-fns';
import { parseLocalDate } from '../../lib/dateUtils';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ImpactMetrics from '../ImpactMetrics';

// Render children only after the wrapper scrolls into view. Used to defer
// ImpactMetrics' per-card API fetches until the card is actually visible —
// keeps initial render cheap when surfacing the full historical archive.
function LazyMount({ children, rootMargin = '200px' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
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

function PreviousHackathonList() {
  const { hackathons } = useHackathonEvents("previous");
  const [currentPage, setCurrentPage] = useState(1);
  const [yearFilter, setYearFilter] = useState('All');
  const eventsPerPage = 8;

  // Count events per year so year chips can show density at a glance.
  const yearCounts = (hackathons || []).reduce((acc, event) => {
    const y = format(parseLocalDate(event.start_date), 'yyyy');
    acc[y] = (acc[y] || 0) + 1;
    return acc;
  }, {});
  const allYears = Object.keys(yearCounts).sort((a, b) => b - a);
  const totalEvents = hackathons ? hackathons.length : 0;

  // Filter hackathons by year if a filter is applied
  const filteredHackathons = hackathons ? hackathons.filter(event =>
    yearFilter === 'All' || format(parseLocalDate(event.start_date), 'yyyy') === yearFilter
  ) : [];

  // Calculate pagination
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredHackathons.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(filteredHackathons.length / eventsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    // Scroll to top of section
    document.getElementById('previous-events').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <OuterGrid
      container
      alignItems="center"
      direction="column"
      textAlign="center"
      id="previous-events"
    >
      <SectionTitle variant="h1">Previous Events</SectionTitle>

      <Typography
        variant="body1"
        color="textSecondary"
        sx={{ mb: 3, maxWidth: "800px" }}
      >
        Browse our archive of past hackathons. Since 2013, we've organized over
        20 events connecting tech talent with nonprofits to create lasting
        technology solutions.
      </Typography>

      {/* Year filter chips */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          justifyContent: "center",
          mb: 4,
        }}
      >
        <Chip
          label={totalEvents > 0 ? `All Years (${totalEvents})` : 'All Years'}
          color={yearFilter === "All" ? "primary" : "default"}
          onClick={() => {
            setYearFilter("All");
            setCurrentPage(1);
          }}
          sx={{ fontWeight: yearFilter === "All" ? "bold" : "normal" }}
        />
        {allYears.map((year) => (
          <Chip
            key={year}
            label={yearCounts[year] > 1 ? `${year} (${yearCounts[year]})` : year}
            color={yearFilter === year ? "primary" : "default"}
            onClick={() => {
              setYearFilter(year);
              setCurrentPage(1);
            }}
            sx={{ fontWeight: yearFilter === year ? "bold" : "normal" }}
          />
        ))}
      </Box>

      {/* Past events grid */}
      <PastEventGrid>
        {currentEvents.length > 0 ? (
          currentEvents.map((event) => (
            <PastEventCard key={event.event_id || event.title}>
              <Link href={`/hack/${event.event_id}`} passHref legacyBehavior>
                <a
                  style={{
                    display: "block",
                    textDecoration: "none",
                    color: "inherit",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                    }}
                  >
                    <PastEventYear>
                      <CalendarTodayIcon fontSize="small" sx={{ mr: 1 }} />
                      {format(parseLocalDate(event.start_date), "yyyy")}
                    </PastEventYear>

                    <EventLink variant="h5">{event.title}</EventLink>

                    <PastEventText>{event.description}</PastEventText>

                    {/* Impact Metrics — lazy-mounted to avoid N fetches per card on initial render */}
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
                        minimal={true}
                      />
                    </LazyMount>

                    <Box sx={{ mt: "auto", pt: 2 }}>
                      <PastEventLocation>
                        <LocationOnIcon fontSize="small" sx={{ mr: 1 }} />
                        {event.location}
                      </PastEventLocation>

                      <Grid container spacing={1} sx={{ mt: 2 }}>
                        {event.links && event.links.length > 0 && (
                          <Grid size={{ xs: 12 }}>
                            <ToggleButton
                              color="primary"
                              variant="outlined"
                              component="button"
                              fullWidth
                            >
                              View Details
                            </ToggleButton>
                          </Grid>
                        )}
                      </Grid>
                    </Box>
                  </Box>
                </a>
              </Link>
            </PastEventCard>
          ))
        ) : (
          <Typography variant="body1" color="textSecondary">
            No past events found matching your filter.
          </Typography>
        )}
      </PastEventGrid>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ mt: 4, mb: 2 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}

      {/* Total events count */}
      <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
        Showing {currentEvents.length} of {filteredHackathons.length} events
        {yearFilter !== "All" && ` from ${yearFilter}`}
      </Typography>
    </OuterGrid>
  );
}

export default PreviousHackathonList;
