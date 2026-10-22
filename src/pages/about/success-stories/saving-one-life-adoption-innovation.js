import React from "react";
import SuccessStoryLayout from "../../../components/SuccessStories/SuccessStoryLayout";

const story = {
  slug: "saving-one-life-adoption-innovation",
  nonprofit: "Saving One Life Animal Rescue and Sanctuary",
  years: "2019 & 2020",
  headline: "Saving One Life: innovating animal adoption with AI",
  lead: "Two hackathon teams gave an Arizona animal rescue a data-driven way to vet adopters and match pets to people — turning a slow manual process into a scored, searchable system.",
  meta: {
    title:
      "Saving One Life: AI-Enhanced Adoption Process | Opportunity Hack Success Story",
    ogTitle:
      "Saving One Life: Innovating Animal Adoption with AI | Opportunity Hack",
    description:
      "Discover how Opportunity Hack volunteers developed an AI-powered solution to streamline the adoption process for Saving One Life Animal Rescue and Sanctuary.",
    ogDescription:
      "See how tech volunteers created an AI-enhanced adoption process for Saving One Life, streamlining animal rescue operations and exploring innovative solutions.",
    keywords:
      "Opportunity Hack, animal rescue, AI adoption process, nonprofit technology, hackathon success story",
    image: "https://cdn.ohack.dev/nonprofit_images/saving_one_life.webp",
  },
  video: {
    label: "Final demo · Summer 2020",
    src: "https://www.youtube.com/embed/i_KQ0Z-0kkc",
    title: "Saving One Life Adoption Innovation Demo",
  },
  facts: [
    {
      label: "Nonprofit",
      value: "Saving One Life Animal Rescue and Sanctuary",
    },
    {
      label: "Tech volunteers",
      value:
        "Emilee Spence and Justin Canode (2019), Karishma Joseph and Animesh Mohan (2020)",
    },
    {
      label: "Sponsors",
      value:
        "PayPal, Galvanize, Motion Recruitment, Tech Talent South, GoDaddy, Dick's Sporting Goods, Keap",
    },
    {
      label: "Technologies",
      value:
        "Python, Flask, MongoDB, machine learning algorithms, social media APIs, data analysis tools",
    },
  ],
  challenge: {
    intro:
      "Saving One Life, an Arizona-based animal rescue, faced challenges in their adoption process:",
    items: [
      "Time-consuming manual vetting of potential adopters",
      "Difficulty in assessing adopter suitability efficiently",
      "Need for a more streamlined, data-driven adoption process",
    ],
  },
  solution: {
    intro:
      "Over two Opportunity Hack events, teams of volunteers developed a multi-phase solution to streamline the adoption process:",
    items: [
      "AI-powered compatibility scoring system to match pets with potential adopters",
      "Risk assessment tool using social media analysis to evaluate potential adopters",
      "Database system to efficiently manage adopter and animal information",
    ],
  },
  resources: [
    {
      label: "GitHub repository",
      href: "https://github.com/opportunity-hack/risk-scoring",
      note: "Explore the project's code and development history",
    },
    {
      label: "DevPost project (2019)",
      href: "https://devpost.com/software/sol-adoption-candidate-tracker",
      note: "View the initial project submission and details",
    },
  ],
};

export default function SavingOneLifeSuccessStory() {
  return <SuccessStoryLayout story={story} />;
}
