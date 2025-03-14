import React, { useState, useEffect } from "react";
import useHackathonEvents from "../../hooks/use-hackathon-events";
import { EmptyGrid, OuterGrid, MoreNewsStyle, HackathonGrid, NewsContainer, NewsSection, NewsSectionTitle } from "./styles";
import EventFeature from "./EventFeature";
import { SectionTitle } from "./styles";
import Link from "next/link";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import dynamic from "next/dynamic";
import { Skeleton, Typography, Box } from "@mui/material"; // Import Skeleton component

const News = dynamic(() => import("../../components/News/News"), {
  ssr: true,
});

function HackathonList() {
  const { hackathons, loading: hackathonsLoading } =
    useHackathonEvents("current");
  const [newsData, setNewsData] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    setNewsLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/news?limit=3`)
      .then((response) => response.json())
      .then((data) => {
        setNewsData(data.text || null);
        setNewsLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setNewsLoading(false);
      });
  }, []);

  const renderEventSkeleton = () => (
    <Skeleton
      variant="rectangular"
      width="100%"
      height={400} // Match the fixed height of EventCards
      style={{ marginBottom: "20px" }}
    />
  );    

  return (
    <OuterGrid
      container
      alignItems="center"
      direction="column"
      textAlign="center"
    >
      <SectionTitle variant="h2" component="h2">Upcoming and Current Events</SectionTitle>
      
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

        <NewsSection>
          <NewsSectionTitle>Latest Updates</NewsSectionTitle>
          <NewsContainer>
            {newsLoading ? (
              <News newsData={[]} frontpage={"true"} loading={true} />
            ) : (
              <News newsData={newsData} frontpage={"true"} loading={false} />
            )}
          </NewsContainer>
        </NewsSection>
      </EmptyGrid>
    </OuterGrid>
  );
}

export default HackathonList;
