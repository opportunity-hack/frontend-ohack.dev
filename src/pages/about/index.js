import React, { Suspense, useEffect } from 'react';
import Head from 'next/head';
import { TitleContainer, LayoutContainer, ProjectsContainer } from '../../styles/nonprofit/styles';
import LoginOrRegister from '../../components/LoginOrRegister/LoginOrRegister2';
import { Typography } from '@mui/material';
import { initFacebookPixel, trackEvent } from "../../lib/ga";
import { cofounders, board_members, pledge } from '../../components/About/about-data';
import { 
  ActionButtons, 
  FoundersSection, 
  BoardSection, 
  BootcampSection, 
  PledgeSection,
  VideoSection 
} from '../../components/About/components';

// Video Schema markup
const videoSchema = {
  "@context": "https://schema.org",
  "@type": "VideoObject",
  name: "About Opportunity Hack",
  description:
    "Learn about Opportunity Hack's mission and impact in technology for social good",
  thumbnailUrl: "https://cdn.ohack.dev/ohack.dev/2024_hackathon_5.webp",
  uploadDate: "2023-01-01T08:00:00+08:00",
  duration: "PT2M30S",
  embedUrl: "https://www.youtube.com/embed/Ia_xsX-318E",
  interactionStatistic: {
    "@type": "InteractionCounter",
    interactionType: { "@type": "WatchAction" },
    userInteractionCount: 4913,
  },
};

const style = { fontSize: '15px' };

export default function AboutUsPage() {
  const gaButton = (action, actionName) => {
    trackEvent({ 
      action: action,
      params: { action_name: actionName }
    });
  };

  useEffect(() => {
    initFacebookPixel();
  }, []);

  return (
    <LayoutContainer key="mentorship" container>
      <Head>
        <title>Opportunity Hack: Coding for Social Good Since 2013</title>
        <meta property="og:title" content="Opportunity Hack - About Us" />
        <meta
          name="description"
          content={`Learn about Opportunity Hack, our founders, board members (${board_members.join(", ")}), and community pledge. Join us as we harness the power of code for social good.`}
        />
        <meta
          name="keywords"
          content="Opportunity Hack, social good, non-profit technology, tech volunteering, coding for good, social impact, inclusive society, sustainable change, effective altruism"
        />
        <meta
          property="og:image"
          content="https://cdn.ohack.dev/ohack.dev/2024_hackathon_5.webp"
        />
        <meta property="og:url" content="https://ohack.dev/about" />
        <link
          rel="preload"
          as="image"
          href="https://cdn.ohack.dev/ohack.dev/2024_hackathon_5.webp"
        />
        <script type="application/ld+json">
          {JSON.stringify(videoSchema)}
        </script>
        {board_members.map((member, i) => (
          <meta key={i} name="board_member" content={member} />
        ))}
      </Head>

      <TitleContainer container>
        <Typography variant="h2" component="h1">
          About Us
        </Typography>

        <Typography variant="body1" style={style} paragraph>
          Founded in 2013 as a part of eBay/PayPal Inc., Opportunity Hack was
          created to meet the technological needs of nonprofits. Our vision has
          since grown to harness the power of code for social good, fostering an
          inclusive society, and championing impactful, sustainable change.
        </Typography>

        <VideoSection />

        <Typography variant="h2">Why Opportunity Hack?</Typography>
        <Typography variant="body1" style={style} paragraph>
          🧑🏿‍💻 As computer science students or software engineers, we have a moral
          and ethical obligation to use our skills to make a positive impact on
          the world. One way to do this is by contributing to Opportunity Hack,
          a hackathon focused on creating technology solutions for social good.
          <br />
          <br />
          💡 By participating in Opportunity Hack, you have the opportunity to
          use your technical skills to make a real difference in the lives of
          others. In addition to the personal satisfaction of using your skills
          for good, participating in Opportunity Hack can also help you build
          your resume and portfolio. Demonstrating your ability to create
          technology solutions that have a positive impact on society can be a
          powerful way to stand out to potential employers and make a name for
          yourself in the industry.
          <br />
          <br />
          ❤️ But perhaps most importantly, contributing to Opportunity Hack can
          evoke a sense of purpose and fulfillment that is often missing from
          traditional software engineering jobs. By using your skills to help
          others, you can find meaning and satisfaction in your work that goes
          beyond just writing code.
          <br />
          <br />
          💻 So if you're looking for a way to make a difference with your
          skills, consider participating in Opportunity Hack. Not only will you
          be able to contribute to social good, but you'll also be able to build
          your skills, your resume, and your sense of purpose and fulfillment.
        </Typography>

        <ActionButtons gaButton={gaButton} />
      </TitleContainer>

      <ProjectsContainer mt={"50px"}>
        <Suspense fallback={<div>Loading sections...</div>}>
          <FoundersSection cofounders={cofounders} />
          <BoardSection board_members={board_members} />
          <BootcampSection />
          <PledgeSection pledge={pledge} />
          <ActionButtons gaButton={gaButton} />
        </Suspense>

        <LoginOrRegister
          introText="Ready to join us as a mentor?"
          previousPage="/about/mentors"
        />
      </ProjectsContainer>
    </LayoutContainer>
  );
}
