import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import useHackathonEvents from "../../hooks/use-hackathon-events";
import { EmptyGrid, OuterGrid, MoreNewsStyle, HackathonGrid } from "./styles";
import EventFeature from "./EventFeature";
import { SectionTitle } from "./styles";
import Link from "next/link";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import dynamic from "next/dynamic";
import { Skeleton, Typography, Box } from "@mui/material"; // Import Skeleton component

const News = dynamic(() => import("../../components/News/News"), {
  ssr: true,
});

function HackathonList({ compact = false }) {
  const router = useRouter();
  const { hackathons, loading: hackathonsLoading } =
    useHackathonEvents("current");
  const [newsData, setNewsData] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  
  // Prefetch hackathon event pages when component mounts
  useEffect(() => {
    if (hackathons && hackathons.length > 0) {
      // Prefetch all event pages to make navigation instant
      hackathons.forEach(event => {
        router.prefetch(`/hack/${event.event_id}`);
      });
    }
  }, [hackathons, router]);

  // Only fetch news for the compact sidebar variant — the full /hack page
  // routes users to /blog for the news feed instead of embedding it here,
  // which removes ~500-800px of vertical scroll between Upcoming Events
  // and the Previous Events archive.
  useEffect(() => {
    if (!compact) return undefined;
    let cancelled = false;
    setNewsLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/news?limit=3`)
      .then((response) => response.json())
      .then((data) => {
        if (cancelled) return;
        setNewsData(data.text || null);
        setNewsLoading(false);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error(error);
        setNewsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [compact]);

  const renderEventSkeleton = () => (
    <Skeleton
      variant="rectangular"
      width="100%"
      height={400} // Match the fixed height of EventCards
      style={{ marginBottom: "20px" }}
    />
  );    

  // Compact mode for side-by-side layout, regular mode for standalone
  if (compact) {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography 
          variant="h6" 
          component="h2" 
          sx={{ 
            mt: 2,
            mb: 1.5, 
            fontWeight: 500,
            color: 'text.primary',
            fontSize: { xs: '1.1rem', md: '1.25rem' }
          }}
        >
          Upcoming Events
        </Typography>
        
        {hackathonsLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {Array(2).fill(0).map((_, index) => (
              <Skeleton
                key={`compact-skeleton-${index}`}
                variant="rectangular"
                width="100%"
                height={150}
                sx={{ borderRadius: 2 }}
              />
            ))}
          </Box>
        ) : hackathons && hackathons.length > 0 ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2,
            overflowY: 'auto',
            maxHeight: { xs: 'none', lg: '550px' },
            pr: { lg: 1 }
          }}>
            {hackathons.map((event) => (
              <EventFeature
                id={event?.id}
                title={event?.title}
                event_id={event?.event_id}
                description={event?.description}
                key={event?.title || event?.event_id}
                type={event?.type}
                nonprofits={event?.nonprofits}
                start_date={event?.start_date}
                end_date={event?.end_date}
                location={event?.location}
                devpostUrl={event?.devpost_url}
                rawEventLinks={event?.links}
                icon={event?.image_url}
                donationUrl={event?.donation_url}
                donationGoals={event?.donation_goals}
                donationCurrent={event?.donation_current}
                compact={true}
              />
            ))}
          </Box>
        ) : (
          <Box sx={{ py: 3, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="body1" color="textSecondary">
              No upcoming events at the moment
            </Typography>
            <Link prefetch={false} href="/hack">
              <MoreNewsStyle sx={{ mt: 2 }}>
                View all events
                <ArrowForwardIcon sx={{ ml: 1, fontSize: 16 }} />
              </MoreNewsStyle>
            </Link>
          </Box>
        )}
        
        {/* Compact news section */}
        <Box sx={{ 
          mt: 3, 
          pt: 3, 
          borderTop: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 0.5, 
              fontWeight: 500,
              color: 'text.primary',
              fontSize: { xs: '1.1rem', md: '1.25rem' }
            }}
          >
            Latest News
          </Typography>
          {newsLoading ? (
            <Skeleton variant="rectangular" width="100%" height={100} />
          ) : (
            <News newsData={newsData?.slice(0, 2) || []} frontpage="true" loading={false} compact={true} />
          )}
        </Box>
      </Box>
    );
  }

  // Original full-width layout
  return (
    <OuterGrid
      container
      alignItems="center"
      direction="column"
      textAlign="center"
    >
      <SectionTitle variant="h2" component="h2" id="upcoming-events-heading">Upcoming and Current Events</SectionTitle>
      
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3, maxWidth: '800px' }}>
        Join our upcoming hackathons and make a difference! Work with nonprofits to solve real-world challenges using technology.
      </Typography>

      <EmptyGrid>
        {hackathonsLoading ? (
          <HackathonGrid>
            {Array(2).fill(0).map((_, index) => (
              <React.Fragment key={`event-skeleton-${index}`}>
                {renderEventSkeleton()}
              </React.Fragment>
            ))}
          </HackathonGrid>
        ) : hackathons && hackathons.length > 0 ? (
          <HackathonGrid>
            {hackathons.map((event) => (
              <EventFeature
                id={event?.id}
                title={event?.title}
                event_id={event?.event_id}
                description={event?.description}
                key={event?.title || event?.event_id}
                type={event?.type}
                nonprofits={event?.nonprofits}
                start_date={event?.start_date}
                end_date={event?.end_date}
                location={event?.location}
                devpostUrl={event?.devpost_url}
                rawEventLinks={event?.links}
                icon={event?.image_url}
                donationUrl={event?.donation_url}
                donationGoals={event?.donation_goals}
                donationCurrent={event?.donation_current}
              />
            ))}
          </HackathonGrid>
        ) : (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No upcoming events at the moment
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              Check back soon or view our past events below
            </Typography>
            <Link prefetch={false} href="#previous-events">
              <MoreNewsStyle>
                See previous hackathons
                <ArrowForwardIcon sx={{ ml: 1 }} />
              </MoreNewsStyle>
            </Link>
          </Box>
        )}

        {hackathons && hackathons.length > 0 && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link prefetch={false} href="/blog" style={{ textDecoration: 'none' }}>
              <MoreNewsStyle>
                Read latest updates from Opportunity Hack
                <ArrowForwardIcon sx={{ ml: 1, fontSize: 16 }} />
              </MoreNewsStyle>
            </Link>
          </Box>
        )}
      </EmptyGrid>
    </OuterGrid>
  );
}

export default HackathonList;
