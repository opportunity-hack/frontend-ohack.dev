import React from "react";
import { VideoGuidePage } from "../about/judges/overview";

import {
  AssessmentRounded,
  ChecklistRounded,
  DashboardRounded,
  ScoreRounded,
  SpeedRounded,
  VideoLibraryRounded,
  VisibilityRounded,
} from "@mui/icons-material";

// /judge/overview — "How to use the judge dashboard" video tutorial.
// Presentation lives in the shared VideoGuidePage template; this file only
// owns the config + the route's own SEO (getStaticProps below).
const DASHBOARD_GUIDE = {
  gaAction: "click_judge_overview",
  back: { href: "/judge", label: "Back to the judge dashboard" },
  eyebrow: "Video tutorial · 8 minutes",
  title: "How to use the",
  italic: "judge dashboard.",
  lead: "Watch this tutorial to master our judging platform: how to navigate the dashboard, evaluate projects in both rounds, and provide meaningful feedback that helps teams improve their nonprofit technology solutions.",
  video: {
    id: "ZmciEvdre24",
    title:
      "How to Use the Judge Dashboard - Complete Opportunity Hack Tutorial Video",
    meta: "Updated September 8th 2025 · Duration: 8 minutes · Complete walkthrough of the judging tool",
  },
  share: {
    buttonLabel: "Share this tutorial",
    title: "How to Use the Judge Dashboard - Opportunity Hack",
    text: "Learn how to use our judging tool for evaluating hackathon projects!",
  },
  primaryCta: {
    href: "/judge",
    label: "Go to the judge dashboard",
    track: "goto_dashboard_after_video",
  },
  highlightsTitle: "What you'll master",
  highlights: [
    {
      icon: VideoLibraryRounded,
      title: "Dashboard walkthrough",
      description:
        "A complete tour of the judge dashboard interface, showing you exactly where to find teams, scoring forms, and progress tracking.",
      tag: "Step-by-step guide",
    },
    {
      icon: VisibilityRounded,
      title: "Round 1 & Round 2 details",
      description:
        "A deep dive into both judging rounds: how to review pitch videos, evaluate GitHub projects, and conduct live demo sessions.",
      tag: "Process details",
    },
    {
      icon: SpeedRounded,
      title: "Behind the scenes",
      description:
        "How we use our admin dashboard to streamline the judging process.",
      tag: "Backstage pass",
    },
  ],
  quickReference: {
    title: "The judging process at a glance",
    items: [
      {
        tag: "Round 1 · Initial evaluation",
        title: "Pitch videos and repositories",
        body: "Review 4-minute pitch videos and GitHub repositories. Score projects on scope, documentation, polish, and security using our 40-point system.",
      },
      {
        tag: "Round 2 · Final assessment",
        accent: true,
        title: "Top teams, re-evaluated",
        body: "Re-evaluate top teams based on their responses to Round 1 feedback, or conduct live demo sessions for in-person events.",
      },
    ],
  },
  cta: {
    eyebrow: "Next step",
    title: "Ready to start judging?",
    body: "Now that you know how to use the dashboard, access your judge assignments and start evaluating the innovative nonprofit technology solutions created by hackathon teams.",
    primary: {
      href: "/judge",
      label: "Start judging now",
      track: "start_judging_cta",
    },
    secondary: {
      href: "/hackathon-judging-criteria",
      label: "Review scoring criteria",
      track: "review_criteria_cta",
    },
  },
  resourcesTitle: "Judge resources & tools",
  resources: [
    {
      href: "/judge",
      icon: DashboardRounded,
      label: "Judge dashboard",
      track: "judge_dashboard",
    },
    {
      href: "/hackathon-judging-criteria",
      icon: ChecklistRounded,
      label: "Scoring criteria & rubric",
      track: "scoring_criteria",
    },
    {
      href: "/about/judges/overview",
      icon: ScoreRounded,
      label: "Judging process guide",
      track: "judging_process",
    },
    {
      href: "/about/judges#judge-faq",
      icon: AssessmentRounded,
      label: "Judge FAQ",
      track: "judge_faq",
    },
  ],
};

const JudgeDashboardOverview = () => (
  <VideoGuidePage config={DASHBOARD_GUIDE} />
);

export default JudgeDashboardOverview;

export const getStaticProps = async () => {
  const title =
    "How Our Hackathon Judging Dashboard Works (Video Walkthrough) | Opportunity Hack";
  const description =
    "See exactly how Opportunity Hack judges evaluate nonprofit technology projects — 8-minute video walkthrough of the scoring dashboard, Round 1 & 2 flow, and how to give teams meaningful feedback.";

  return {
    props: {
      title: "Hackathon Judging Dashboard Walkthrough — Opportunity Hack",
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
          content: "https://cdn.ohack.dev/ohack.dev/judge_1.jpg",
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
          content: "https://www.ohack.dev/judge/overview",
          key: "url",
        },
        {
          name: "og:url",
          property: "og:url",
          content: "https://www.ohack.dev/judge/overview",
          key: "ogurl",
        },
        {
          name: "og:video",
          property: "og:video",
          content: "https://www.youtube.com/watch?v=ZmciEvdre24",
          key: "ogvideo",
        },
        {
          name: "og:video:url",
          property: "og:video:url",
          content: "https://www.youtube.com/watch?v=ZmciEvdre24",
          key: "ogvideourl",
        },
        {
          name: "og:video:secure_url",
          property: "og:video:secure_url",
          content: "https://www.youtube.com/watch?v=ZmciEvdre24",
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
          content: "https://cdn.ohack.dev/ohack.dev/judge_1.jpg",
          key: "twitterimage",
        },
        {
          name: "twitter:player",
          property: "twitter:player",
          content: "https://www.youtube.com/embed/ZmciEvdre24",
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
              url: "https://cdn.ohack.dev/ohack.dev/judge_1.jpg",
            },
            sameAs: [
              "https://twitter.com/opportunityhack",
              "https://github.com/opportunity-hack",
            ],
          },
          {
            "@type": "VideoObject",
            "@id": "https://www.ohack.dev/judge/overview#main-video",
            name: title,
            description: description,
            thumbnailUrl: [
              "https://i.ytimg.com/vi/ZmciEvdre24/maxresdefault.jpg",
              "https://i.ytimg.com/vi/ZmciEvdre24/hqdefault.jpg",
            ],
            uploadDate: "2025-08-08T00:00:00.000Z",
            publishDate: "2025-08-08T00:00:00.000Z",
            contentUrl: "https://www.youtube.com/watch?v=ZmciEvdre24",
            embedUrl:
              "https://www.youtube.com/embed/ZmciEvdre24?rel=0&modestbranding=1&enablejsapi=1",
            playerType: "HTML5 Flash",
            duration: "PT15M",
            videoQuality: "hd720",
            inLanguage: "en-US",
            isFamilyFriendly: true,
            keywords: [
              "judge",
              "dashboard",
              "hackathon",
              "tutorial",
              "evaluation",
              "scoring",
              "nonprofit",
              "technology",
              "opportunity hack",
            ],
            interactionStatistic: {
              "@type": "InteractionCounter",
              interactionType: { "@type": "WatchAction" },
              userInteractionCount: 500,
            },
            publisher: {
              "@type": "Organization",
              name: "Opportunity Hack",
              url: "https://www.ohack.dev",
              logo: {
                "@type": "ImageObject",
                url: "https://cdn.ohack.dev/ohack.dev/judge_1.jpg",
              },
            },
            creator: {
              "@type": "Organization",
              name: "Opportunity Hack",
              url: "https://www.ohack.dev",
            },
          },
          {
            "@type": "WebPage",
            "@id": "https://www.ohack.dev/judge/overview#webpage",
            url: "https://www.ohack.dev/judge/overview",
            name: title,
            description: description,
            primaryImageOfPage: {
              "@type": "ImageObject",
              url: "https://i.ytimg.com/vi/ZmciEvdre24/maxresdefault.jpg",
            },
            isPartOf: {
              "@type": "WebSite",
              "@id": "https://www.ohack.dev/#website",
            },
            mainEntity: {
              "@type": "VideoObject",
              "@id": "https://www.ohack.dev/judge/overview#main-video",
            },
            mainContentOfPage: {
              "@type": "VideoObject",
              "@id": "https://www.ohack.dev/judge/overview#main-video",
            },
            specialty: "Video Tutorial",
            about: {
              "@type": "Thing",
              name: "Judge Dashboard Tutorial",
              description:
                "Video tutorial for using the judge dashboard at Opportunity Hack",
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
                name: "Judge Dashboard",
                item: "https://www.ohack.dev/judge",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: "Dashboard Overview",
                item: "https://www.ohack.dev/judge/overview",
              },
            ],
          },
        ],
      },
    },
  };
};
