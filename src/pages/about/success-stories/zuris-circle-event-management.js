import React from "react";
import SuccessStoryLayout from "../../../components/SuccessStories/SuccessStoryLayout";

const story = {
  slug: "zuris-circle-event-management",
  nonprofit: "Zuri's Circle",
  years: "2019",
  headline:
    "Zuri's Circle: transforming event management and community engagement",
  lead: "A Peoria nonprofit serving families, the elderly and the homeless got a digital sign-in, automated follow-ups and machine-learning sentiment analysis of event feedback — all built in one hackathon.",
  meta: {
    title:
      "Zuri's Circle: Revolutionizing Event Management | Opportunity Hack Success Story",
    ogTitle: "Zuri's Circle: Transforming Event Management | Opportunity Hack",
    description:
      "Discover how Opportunity Hack volunteers developed an innovative event management and feedback analysis system for Zuri's Circle, enhancing community engagement.",
    ogDescription:
      "See how tech volunteers created an automated event registration and feedback analysis system for Zuri's Circle, revolutionizing their community engagement.",
    keywords:
      "Opportunity Hack, Zuri's Circle, event management, nonprofit technology, hackathon success story",
    image: "https://cdn.ohack.dev/nonprofit_images/Zuris_Circle_2019.webp",
  },
  facts: [
    { label: "Nonprofit", value: "Zuri's Circle" },
    {
      label: "Tech volunteers",
      value: "Trevor Moore, Jordan Riley, and Carter Rice (2019)",
    },
    {
      label: "Sponsors",
      value:
        "PayPal, GoDaddy, Repay, MDI Group, Splunk, Galvanize, InfusionSoft",
    },
    {
      label: "Technologies",
      value:
        "ASP.NET Core 3.0, ML.NET, MongoDB, React, Redux, Material UI, Chart.js, Azure, Heroku",
    },
  ],
  challenge: {
    intro:
      "Zuri's Circle, a Peoria-based nonprofit helping families, the elderly, and the homeless, faced challenges in their event management:",
    items: [
      "Inefficient manual email collection at events",
      "Difficulty in timely follow-ups with participants",
      "Lack of systematic feedback analysis for event improvement",
    ],
  },
  solution: {
    intro:
      'The Opportunity Hack team developed "Zuri\'s Dashboard," a comprehensive event management system:',
    items: [
      "Digital sign-in system for accurate participant data collection",
      "Automated email communication for event follow-ups",
      "Machine learning-powered sentiment analysis for feedback evaluation",
    ],
  },
  resources: [
    {
      label: "GitHub repository",
      href: "https://github.com/opportunity-hack/event-registration",
      note: "Explore the project's code and development history",
    },
    {
      label: "DevPost project (2019)",
      href: "https://devpost.com/software/zuri-s-dashboard",
      note: "View the project submission and details",
    },
  ],
  impact: {
    text: "Zuri's Dashboard significantly improved Zuri's Circle's ability to engage with their community, streamline event management, and gain valuable insights from participant feedback. This technology allows the organization to focus more on their mission of providing relief to families, the elderly, and the homeless.",
  },
};

export default function ZurisCircleSuccessStory() {
  return <SuccessStoryLayout story={story} />;
}
