import React from "react";
import SuccessStoryLayout from "../../../components/SuccessStories/SuccessStoryLayout";

const story = {
  slug: "vidyodaya-website-modernization",
  nonprofit: "Vidyodaya",
  years: "2020",
  headline: "Vidyodaya: modernizing education outreach for Adivasi communities",
  lead: "A hackathon team rebuilt the website of a nonprofit improving education for Adivasi children in India — a modern, responsive site the staff can update themselves.",
  meta: {
    title:
      "Vidyodaya: Modernizing Education Outreach | Opportunity Hack Success Story",
    ogTitle: "Vidyodaya: Modernizing Education Outreach | Opportunity Hack",
    description:
      "Discover how Opportunity Hack volunteers developed a modern, user-friendly website for Vidyodaya, enhancing their mission to improve education for Adivasi children.",
    ogDescription:
      "See how tech volunteers created a modern, user-friendly website for Vidyodaya, revolutionizing their online presence and community engagement.",
    keywords:
      "Opportunity Hack, Vidyodaya, website modernization, nonprofit technology, hackathon success story",
    image: "https://cdn.ohack.dev/nonprofit_images/vidyodaya.webp",
  },
  video: {
    label: "Final demo · Fall 2020",
    src: "https://www.youtube.com/embed/03IeMq9qye4?si=aEdjB9nwQ-2GggBj",
    title: "Vidyodaya: Modernizing Education Outreach Demo",
  },
  facts: [
    { label: "Nonprofit", value: "Vidyodaya" },
    {
      label: "Tech volunteers",
      value:
        "Christian Bautista, Emily Adams, Marlon Del Rosario, Harry Henry Gebel (2020)",
    },
    { label: "Sponsors", value: "PayPal and Galvanize" },
    {
      label: "Technologies",
      value:
        "HTML, CSS, JavaScript, React, Java, Spring, PostgreSQL, OAuth 2.0, Cloudinary",
    },
  ],
  challenge: {
    intro:
      "Vidyodaya, a nonprofit focused on improving education for Adivasi children in India, faced challenges with their online presence:",
    items: [
      "Outdated website with poor navigation",
      "Difficulty in updating and managing content",
      "Lack of engagement with their target audience",
    ],
  },
  solution: {
    intro:
      "The Opportunity Hack team developed a modern, user-friendly website for Vidyodaya:",
    items: [
      "Redesigned interface with improved navigation and tribal elements",
      "Secure admin login system for easy content management",
      "Responsive design for better accessibility across devices",
    ],
  },
  resources: [
    {
      label: "GitHub repository",
      href: "https://github.com/2020-opportunity-hack/Team-02",
      note: "Explore the project's code and development history",
    },
    {
      label: "2020 Fall Global Hackathon presentation",
      href: "https://www.ohack.org/about/history/2020-fall-global-hackathon/2020-fall-non-profits#h.e11jkzh61o8i",
      note: "View the project presentation and details",
    },
  ],
  impact: {
    text: "The new website significantly improved Vidyodaya's online presence, making it easier for visitors to find information and engage with the organization. The admin functionality allows for easier content management, potentially increasing engagement with their audience and better showcasing their mission to improve education for Adivasi children.",
  },
};

export default function VidyodayaSuccessStory() {
  return <SuccessStoryLayout story={story} />;
}
