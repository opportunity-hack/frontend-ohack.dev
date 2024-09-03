import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import Head from "next/head";
import { CircularProgress, Container, Grid } from "@mui/material";
import HackathonHeader from "../../components/Hackathon/HackathonHeader";
import { Typography, Button } from "@mui/material";
import VolunteerList from '../../components/Hackathon/VolunteerList';
import TableOfContents from '../../components/Hackathon/TableOfContents';
import Script from 'next/script';


// Dynamically import components for better code splitting
const DonationProgress = dynamic(
  () => import("../../components/Hackathon/DonationProgress"),
  { ssr: false }
);
const EventLinks = dynamic(
  () => import("../../components/Hackathon/EventLinks"),
  { ssr: false }
);
const NonprofitList = dynamic(
  () => import("../../components/Hackathon/NonprofitList"),
  { ssr: false }
);
const EventCountdown = dynamic(
  () => import("../../components/Hackathon/EventCountdown"),
  { ssr: true }
);
const EventConstraints = dynamic(
  () => import("../../components/Hackathon/EventConstraints"),
  { ssr: false }
);
const InteractiveFAQ = dynamic(
  () => import("../../components/Hackathon/InteractiveFAQ"),
  { ssr: false }
);



const faqData = [
    {
      question: "What is Opportunity Hack?",
      answer:
        "Opportunity Hack is a hackathon focused on creating technology solutions for social good. We bring together software engineers, product managers, UX designers, and project managers to develop innovative solutions for nonprofits around the world.",
      icon: "💡",
    },
    {
      question: "What makes Opportunity Hack unique?",
      answer: (
        <>
          <Typography variant="body1" paragraph>
            Opportunity Hack stands out in several ways:
          </Typography>
          <Typography component="ol">
            <li>
              <strong>Real-world impact:</strong> We focus on creating lasting
              solutions for nonprofits, not just demo projects.
            </li>
            <li>
              <strong>Open-ended challenges:</strong> Unlike hackathons with
              predefined ideas, we present open-ended problems from nonprofits,
              encouraging truly innovative and tailored solutions.
            </li>
            <li>
              <strong>Code-centric approach:</strong> We minimize workshops to
              maximize coding time, emphasizing hands-on learning and
              development.
            </li>
            <li>
              <strong>Professional leadership:</strong> Our events are run by
              industry professionals passionate about coding for social good,
              not by students.
            </li>
            <li>
              <strong>Long-term support:</strong> We provide resources and
              mentorship for teams to continue development post-event.
            </li>
            <li>
              <strong>Recognition system:</strong> Our 'Hearts' system
              acknowledges ongoing volunteer contributions.
            </li>
            <li>
              <strong>Year-round community:</strong> We foster a strong network
              of socially-conscious technologists through continuous engagement.
            </li>
          </Typography>
          <Typography variant="body1" paragraph>
            This unique approach ensures meaningful projects, practical
            learning, and sustained impact in the nonprofit sector.
          </Typography>
        </>
      ),
      icon: "🌟",
    },
    {
      question: "When and where does Opportunity Hack take place?",
      answer:
        "Opportunity Hack hosts multiple events throughout the year, both in-person and virtually. Check our website for upcoming event dates and locations.",
      icon: "🗓️",
    },
    {
      question: "Who can participate?",
      answer:
        "Anyone passionate about using technology for social good can participate, including students, professionals, and hobbyists. We welcome participants of all skill levels, from beginners to experts.",
      icon: "👥",
    },
    {
      question: "Do I need to be a programmer to participate?",
      answer:
        "No! While coding skills are valuable, we also need designers, project managers, and individuals with domain expertise in various nonprofit sectors.",
      icon: "🖥️",
    },
    {
      question: "How do teams form?",
      answer:
        "Teams usually form at the beginning of the event. You can come with a pre-formed team or join one at the hackathon. We encourage diverse teams with a mix of skills.",
      icon: "🤝",
    },
    {
      question: "What should I bring?",
      answer:
        "For in-person events, bring your laptop, charger, and any other devices you might need. For virtual events, ensure you have a stable internet connection.",
      icon: "🎒",
    },
    {
      question: "Are there any costs involved?",
      answer: (
        <>
          Participation in Opportunity Hack is typically free for hackers. We
          provide meals, snacks, and drinks (thanks to sponsor funding) during
          in-person events.
          <br />
          <br />
          <Button variant="contained" color="primary" href="/sponsor">
            More about sponsorship
          </Button>
        </>
      ),
      icon: "💰",
    },
    {
      question: "What kind of projects can I work on?",
      answer:
        "Projects are focused on solving real-world problems for nonprofits. These can range from developing new websites or mobile apps to creating data analysis tools or improving existing systems.",
      icon: "🚀",
    },
    {
      question: "How long does the hackathon last?",
      answer:
        "The duration can vary, they are normally over a weekend, but our main events usually start Saturday morning and end Sunday evening.",
      icon: "⏱️",
    },
    {
      question: "What's the most common question mentors receive?",
      answer: (
        <>
          <Typography variant="body1" paragraph>
            One of the most common questions mentors receive is: "How do we
            scope our project to be achievable within the hackathon timeframe?"
          </Typography>
          <Typography variant="body1" paragraph>
            Mentors typically advise teams to:
          </Typography>
          <Typography component="ul">
            <li>Focus on a core, MVP (Minimum Viable Product) feature set</li>
            <li>Break the project into smaller, manageable tasks</li>
            <li>Prioritize functionality over perfect design initially</li>
            <li>
              Consider using existing libraries or APIs to speed up development
            </li>
            <li>
              Plan for a demo-ready product, not a fully polished solution
            </li>
            <li>Build your solution based on the judging criteria</li>
            <li>
              Start your demo pitches early, like Sunday morning to give you 3
              hours to build your video
            </li>
          </Typography>
          <Typography variant="body1">
            Remember, the goal is to create a working prototype that
            demonstrates your solution's potential impact for the nonprofit.
          </Typography>
        </>
      ),
      icon: "🌵",
    },
    {
      question: "What happens after the hackathon?",
      answer: (
        <>
          We encourage teams to continue working with nonprofits to implement
          and maintain their solutions. Opportunity Hack provides ongoing
          support through mentorship and resources. If your team has won a
          prize, we will also send prize money for completion of the project
          after nonprofit signoff.
          <br />
          <br />
          <Button variant="contained" color="primary" href="/about/completion">
            Learn More About Completion
          </Button>
        </>
      ),
      icon: "🌱",
    },
    {
      question: "How can I prepare for Opportunity Hack?",
      answer:
        "Familiarize yourself with common web and mobile development technologies. Review our past projects for inspiration. Come with an open mind and ready to learn!",
      icon: "📚",
    },
    {
      question: "Is there a code of conduct?",
      answer:
        "Yes, we have a code of conduct that all participants must adhere to, ensuring a safe and inclusive environment for everyone.",
      icon: "📜",
    },
    {
      question: "How can I stay updated about future events?",
      answer:
        "Follow us on social media and join our Slack community for the latest updates and announcements.",
      icon: "📢",
    },
  ];

export default function HackathonEvent({ eventData }) {
  const router = useRouter();
  const { event_id } = router.query;
  const [event, setEvent] = useState(eventData);
  const [loading, setLoading] = useState(!eventData);


  useEffect(() => {
    // Handle scrolling to the correct section when the page loads
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth' });
          }, 100); // Small delay to ensure the page has rendered
        }
      }
    }
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  if (!event) {
    return <div>Event not found</div>;
  }

  const metaDescription = event
    ? `${event.location} | ${event.start_date} to ${event.end_date} | ${event.description}`
    : "Join us for an exciting Opportunity Hack event!";
  const metaImage = event?.image_url || "https://cdn.ohack.dev/ohack.dev/2023_hackathon_4.webp";
  const metaTitle = event ? `Hackathon: ${event.title}` : "Opportunity Hack Event";
  const structuredData = event ? {
    "@context": "http://schema.org",
    "@type": "Event",
    "name": event.title,
    "description": event.description,
    "startDate": event.start_date,
    "endDate": event.end_date,
    "location": {
      "@type": "Place",
      "name": event.location,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": event.location
      }
    },
    "image": metaImage,
    "url": `https://ohack.dev/hack/${event_id}`,
    "organizer": {
      "@type": "Organization",
      "name": "Opportunity Hack",
      "url": "https://ohack.dev"
    }
  } : null;

  return (
    <>
      <Head>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />

        {/* Open Graph tags for social media sharing */}
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content={`https://ohack.dev/hack/${event_id}`}
        />
        <meta property="og:image" content={metaImage} />
        <meta property="og:site_name" content="Opportunity Hack" />

        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@OpportunityHack" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={metaImage} />

        {/* Additional SEO-friendly meta tags */}
        <meta
          name="keywords"
          content={`hackathon, ${event?.title || "opportunity hack"}, nonprofit, tech for good, ${event?.location || "various locations"}`}
        />
        <meta name="author" content="Opportunity Hack" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />

        {/* Canonical URL */}
        <link rel="canonical" href={`https://ohack.dev/hack/${event_id}`} />
      </Head>

      {structuredData && (
        <Script
          id="structured-data-script"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}

      <Container maxWidth="lg">
        <HackathonHeader
          title={event.title}
          startDate={event.start_date}
          endDate={event.end_date}
          location={event.location}
          description={event.description}
        />

        <TableOfContents />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <DonationProgress
              donationGoals={event.donation_goals}
              donationCurrent={event.donation_current}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <EventLinks links={event.links} />
          </Grid>
          <Grid item xs={12}>
            <EventConstraints constraints={event.constraints} />
          </Grid>
          <Grid item xs={12} md={6} id="countdown">
            <EventCountdown countdowns={event.countdowns} />
          </Grid>
          <Grid item xs={12} md={6} id="nonprofit">
            <NonprofitList
              nonprofits={event.nonprofits}
              teams={event.teams}
              eventId={event_id}
            />
          </Grid>
          <Grid item xs={12} id="mentor">
            <VolunteerList volunteers={event.mentors} type="mentor" />
          </Grid>
          <Grid item xs={12} id="judge">
            <VolunteerList volunteers={event.judges} type="judge" />
          </Grid>
          <Grid item xs={12} id="faq">
            <InteractiveFAQ faqData={faqData} title={`${event.title} FAQ`} />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${params.event_id}`
    );
    const data = await res.json();

    return {
      props: {
        eventData: data,
      },
    };
  } catch (error) {
    console.error("Error fetching hackathon data:", error);
    return {
      props: {
        eventData: null,
      },
    };
  }
}