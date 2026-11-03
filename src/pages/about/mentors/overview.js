import React from "react";
import { VideoGuidePage } from "../judges/overview";

import {
  AccessTimeRounded,
  DashboardRounded,
  EventRounded,
  GroupsRounded,
  HelpOutlineRounded,
  SchoolRounded,
  SupportRounded,
} from "@mui/icons-material";

// /about/mentors/overview — "What it means to be a mentor" video guide.
// Presentation lives in the shared VideoGuidePage template; this file only
// owns the config + the route's own SEO (getStaticProps below).
const MENTOR_GUIDE = {
  gaAction: "click_mentors_overview",
  back: { href: "/about/mentors", label: "Back to the mentor guide" },
  eyebrow: "Video guide · 8 minutes",
  title: "What it means to be a mentor at",
  italic: "Opportunity Hack.",
  lead: "Watch this guide to understand what mentoring really means at Opportunity Hack: your role, the types of mentors we need, and best practices for supporting teams building life-changing technology solutions.",
  video: {
    id: "CllTEbzdQJY",
    title:
      "What it Means to be a Mentor with Opportunity Hack - Complete 8 Minute Overview Video",
    meta: "Published September 22nd 2025 · Duration: 8 minutes · Watch in full for the complete picture",
  },
  share: {
    buttonLabel: "Share this video",
    title: "What it Means to be a Mentor at Opportunity Hack",
    text: "Learn what it means to mentor at Opportunity Hack - guiding teams building life-changing tech solutions for nonprofits!",
  },
  primaryCta: {
    href: "/about/mentors#upcoming-events",
    label: "Find events to mentor",
    track: "apply_after_video",
  },
  highlightsTitle: "What you'll learn",
  highlights: [
    {
      icon: SchoolRounded,
      title: "Your role",
      description:
        "Understand what mentoring means at Opportunity Hack and how you can make the biggest impact guiding teams through their nonprofit tech solutions.",
      tag: "Foundation knowledge",
    },
    {
      icon: GroupsRounded,
      title: "Types of mentors",
      description:
        "Learn about the different mentoring specializations, from technical and product mentors to UX/design and presentation coaches.",
      tag: "Find your fit",
    },
    {
      icon: SupportRounded,
      title: "Best practices & check-ins",
      description:
        "Discover proven mentoring strategies, communication techniques, and how to effectively support teams throughout the hackathon journey.",
      tag: "Practical guide",
    },
  ],
  cta: {
    eyebrow: "Next step",
    title: "Ready to become a mentor?",
    body: "Now that you understand what mentoring means at Opportunity Hack, apply to mentor at our upcoming hackathons and guide teams building technology solutions that transform nonprofit organizations worldwide.",
    primary: {
      href: "/about/mentors#upcoming-events",
      label: "Find events to mentor",
      track: "find_events_cta",
    },
    secondary: {
      href: "https://mentor.ohack.dev/",
      label: "Visit the mentor portal",
      track: "mentor_portal_cta",
    },
  },
  resourcesTitle: "Additional resources for mentors",
  resources: [
    {
      href: "/about/mentors#upcoming-events",
      icon: EventRounded,
      label: "Find events to mentor",
      track: "find_events",
    },
    {
      href: "https://mentor.ohack.dev/",
      icon: DashboardRounded,
      label: "Mentor portal",
      track: "mentor_portal",
    },
    {
      href: "/volunteer/track",
      icon: AccessTimeRounded,
      label: "Track your time",
      track: "time_tracking",
    },
    {
      href: "/about/mentors#types-of-mentors",
      icon: HelpOutlineRounded,
      label: "Mentor types guide",
      track: "mentor_types",
    },
  ],
};

const MentorOverview = () => <VideoGuidePage config={MENTOR_GUIDE} />;

export default MentorOverview;

export const getStaticProps = async () => {
  const title =
    "What it Means to be a Mentor at Opportunity Hack - 8 Minute Video Guide";
  const description =
    "Watch this comprehensive 8-minute video guide explaining what mentoring means at Opportunity Hack. Learn about mentor roles, types of mentors needed, and best practices for guiding teams building life-changing tech solutions for nonprofits.";

  return {
    props: {
      title: "Video: What it Means to be a Mentor at Opportunity Hack",
      description: description,
      openGraphData: [
        {
          name: "title",
          property: "title",
          content: title,
          key: "title",
        },
        {
          name: "og:title",
          property: "og:title",
          content: title,
          key: "ogtitle",
        },
        {
          name: "author",
          property: "author",
          content: "Opportunity Hack",
          key: "author",
        },
        {
          name: "og:description",
          property: "og:description",
          content: description,
          key: "ogdescription",
        },
        {
          name: "image",
          property: "og:image",
          content: "https://cdn.ohack.dev/ohack.dev/2024_hackathon_4.webp",
          key: "ognameimage",
        },
        {
          property: "og:image:width",
          content: "1200",
          key: "ogimagewidth",
        },
        {
          property: "og:image:height",
          content: "630",
          key: "ogimageheight",
        },
        {
          name: "url",
          property: "url",
          content: "https://www.ohack.dev/about/mentors/overview",
          key: "url",
        },
        {
          name: "og:url",
          property: "og:url",
          content: "https://www.ohack.dev/about/mentors/overview",
          key: "ogurl",
        },
        {
          name: "og:video",
          property: "og:video",
          content: "https://www.youtube.com/watch?v=CllTEbzdQJY",
          key: "ogvideo",
        },
        {
          name: "og:video:url",
          property: "og:video:url",
          content: "https://www.youtube.com/watch?v=CllTEbzdQJY",
          key: "ogvideourl",
        },
        {
          name: "og:video:secure_url",
          property: "og:video:secure_url",
          content: "https://www.youtube.com/watch?v=CllTEbzdQJY",
          key: "ogvideosecureurl",
        },
        {
          name: "og:video:type",
          property: "og:video:type",
          content: "text/html",
          key: "ogvideotype",
        },
        {
          name: "og:video:width",
          property: "og:video:width",
          content: "1280",
          key: "ogvideowidth",
        },
        {
          name: "og:video:height",
          property: "og:video:height",
          content: "720",
          key: "ogvideoheight",
        },
        {
          name: "twitter:card",
          property: "twitter:card",
          content: "player",
          key: "twittercard",
        },
        {
          name: "twitter:site",
          property: "twitter:site",
          content: "@opportunityhack",
          key: "twittersite",
        },
        {
          name: "twitter:title",
          property: "twitter:title",
          content: title,
          key: "twittertitle",
        },
        {
          name: "twitter:description",
          property: "twitter:description",
          content: description,
          key: "twitterdesc",
        },
        {
          name: "twitter:image",
          property: "twitter:image",
          content: "https://cdn.ohack.dev/ohack.dev/2024_hackathon_4.webp",
          key: "twitterimage",
        },
        {
          name: "twitter:player",
          property: "twitter:player",
          content: "https://www.youtube.com/embed/CllTEbzdQJY",
          key: "twitterplayer",
        },
        {
          name: "twitter:player:width",
          property: "twitter:player:width",
          content: "1280",
          key: "twitterplayerwidth",
        },
        {
          name: "twitter:player:height",
          property: "twitter:player:height",
          content: "720",
          key: "twitterplayerheight",
        },
      ],
      structuredData: {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": "https://www.ohack.dev/#organization",
            name: "Opportunity Hack",
            url: "https://www.ohack.dev",
            logo: {
              "@type": "ImageObject",
              url: "https://cdn.ohack.dev/ohack.dev/2024_hackathon_4.webp",
            },
            sameAs: [
              "https://twitter.com/opportunityhack",
              "https://github.com/opportunity-hack",
            ],
          },
          {
            "@type": "VideoObject",
            name: title,
            description: description,
            thumbnailUrl:
              "https://cdn.ohack.dev/ohack.dev/2024_hackathon_4.webp",
            uploadDate: "2025-09-22",
            contentUrl: "https://www.youtube.com/watch?v=CllTEbzdQJY",
            embedUrl: "https://www.youtube.com/embed/CllTEbzdQJY",
            duration: "PT8M",
            publisher: {
              "@type": "Organization",
              name: "Opportunity Hack",
              logo: {
                "@type": "ImageObject",
                url: "https://cdn.ohack.dev/ohack.dev/2024_hackathon_4.webp",
              },
            },
          },
          {
            "@type": "WebPage",
            "@id": "https://www.ohack.dev/about/mentors/overview#webpage",
            url: "https://www.ohack.dev/about/mentors/overview",
            name: title,
            description: description,
            isPartOf: {
              "@type": "WebSite",
              "@id": "https://www.ohack.dev/#website",
            },
            mainEntity: {
              "@type": "VideoObject",
              "@id": "https://www.ohack.dev/about/mentors/overview#video",
            },
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://www.ohack.dev",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "About",
                item: "https://www.ohack.dev/about",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: "Mentors",
                item: "https://www.ohack.dev/about/mentors",
              },
              {
                "@type": "ListItem",
                position: 4,
                name: "Overview",
                item: "https://www.ohack.dev/about/mentors/overview",
              },
            ],
          },
        ],
      },
    },
  };
};
