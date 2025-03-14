import React, { useState } from 'react';
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
import Moment from 'moment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';

function PreviousHackathonList() {
  const { hackathons } = useHackathonEvents("previous");
  const [currentPage, setCurrentPage] = useState(1);
  const [yearFilter, setYearFilter] = useState('All');
  const eventsPerPage = 8;

  // Extract all unique years from hackathons for filter
  const allYears = hackathons ? [...new Set(hackathons.map(event => 
    Moment(event.start_date).format('YYYY')
  ))].sort((a, b) => b - a) : [];
  
  // Filter hackathons by year if a filter is applied
  const filteredHackathons = hackathons ? hackathons.filter(event => 
    yearFilter === 'All' || Moment(event.start_date).format('YYYY') === yearFilter
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
      alignItems='center'
      direction='column'
      textAlign='center'
      id="previous-events"
    >
      <SectionTitle variant='h1'>Previous Events</SectionTitle>
      
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3, maxWidth: '800px' }}>
        Browse our archive of past hackathons. Since 2013, we've organized over 20 events connecting tech talent with nonprofits to create lasting technology solutions.
      </Typography>
      
      {/* Year filter chips */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mb: 4 }}>
        <Chip 
          label="All Years" 
          color={yearFilter === 'All' ? 'primary' : 'default'}
          onClick={() => { setYearFilter('All'); setCurrentPage(1); }}
          sx={{ fontWeight: yearFilter === 'All' ? 'bold' : 'normal' }}
        />
        {allYears.map(year => (
          <Chip 
            key={year} 
            label={year} 
            color={yearFilter === year ? 'primary' : 'default'}
            onClick={() => { setYearFilter(year); setCurrentPage(1); }}
            sx={{ fontWeight: yearFilter === year ? 'bold' : 'normal' }}
          />
        ))}
      </Box>

      {/* Past events grid */}
      <PastEventGrid>
        {currentEvents.length > 0 ? (
          currentEvents.map((event) => (
            <PastEventCard key={event.event_id || event.title}>
              <Link href={`/hack/${event.event_id}`} passHref>
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <PastEventYear>
                    <CalendarTodayIcon fontSize="small" sx={{ mr: 1 }} />
                    {Moment(event.start_date).format('YYYY')}
                  </PastEventYear>
                  
                  <EventLink variant="h5">{event.title}</EventLink>
                  
                  <PastEventText>{event.description}</PastEventText>
                  
                  <Box sx={{ mt: 'auto', pt: 2 }}>
                    <PastEventLocation>
                      <LocationOnIcon fontSize="small" sx={{ mr: 1 }} />
                      {event.location}
                    </PastEventLocation>
                    
                    <Grid container spacing={1} sx={{ mt: 2 }}>
                      {event.links && event.links.length > 0 && (
                        <Grid item xs={12}>
                          <ToggleButton 
                            color="primary" 
                            variant="outlined"
                            component={Link}
                            href={`/hack/${event.event_id}`}
                            fullWidth
                          >
                            View Details
                          </ToggleButton>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </Box>
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
        {yearFilter !== 'All' && ` from ${yearFilter}`}
      </Typography>
    </OuterGrid>
  );
}

export default PreviousHackathonList;
