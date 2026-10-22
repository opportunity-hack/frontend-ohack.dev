import React from "react";
import SuccessStoryLayout from "../../../components/SuccessStories/SuccessStoryLayout";

const story = {
  slug: "matthews-crossing-data-automation",
  nonprofit: "Matthews Crossing Food Bank",
  years: "2016 & 2018",
  headline: "Matthews Crossing: revolutionizing food bank operations",
  lead: "Over two Opportunity Hack events, volunteers replaced hours of manual data entry with an automated data management and reporting system — and showed what the same approach could save 1,600 other food banks.",
  meta: {
    title:
      "Matthews Crossing: Automated Data Management | Opportunity Hack Success Story",
    ogTitle:
      "Matthews Crossing: Revolutionizing Food Bank Operations | Opportunity Hack",
    description:
      "Discover how Opportunity Hack volunteers developed an automated data management system to streamline operations for Matthews Crossing Food Bank.",
    ogDescription:
      "See how tech volunteers created an automated data management system for Matthews Crossing, streamlining food bank operations and improving efficiency.",
    keywords:
      "Opportunity Hack, food bank, data management, nonprofit technology, hackathon success story",
    image: "https://cdn.ohack.dev/nonprofit_images/matthews_crossing.webp",
  },
  facts: [
    { label: "Nonprofit", value: "Matthews Crossing Food Bank" },
    {
      label: "Tech volunteers",
      value: "James Rowley and Mark Omo (2016, 2018)",
    },
    {
      label: "Sponsors",
      value:
        "PayPal, TechShop Chandler, Avnet, GoDaddy, Repay, MDI Group, Splunk, Galvanize, InfusionSoft",
    },
    {
      label: "Technologies",
      value:
        "PHP, Python, JavaScript, HTML/CSS, CSV data processing, Excel report generation, data visualization tools, two-factor authentication",
    },
  ],
  challenge: {
    intro: "Matthews Crossing Food Bank faced several operational challenges:",
    items: [
      "Time-consuming manual data entry and reporting processes",
      "Difficulty in generating timely and accurate reports for decision-making",
      "Need for a more efficient system to manage large volumes of donation data",
    ],
  },
  solution: {
    intro:
      "Over two Opportunity Hack events, the volunteer team developed a comprehensive data management system:",
    items: [
      "Automated data import and classification from Food Bank Manager",
      "Streamlined report generation and data visualization",
      "Secure user authentication with two-factor authentication",
      "Integration with PayPal for lower-fee donation processing",
    ],
  },
  resources: [
    {
      label: "GitHub repository",
      href: "https://github.com/opportunity-hack/Food-Bank-Data-Manager",
      note: "Explore the project's code and development history",
    },
    {
      label: "DevPost project (2016)",
      href: "https://devpost.com/software/matthews-crossing-data-manager",
      note: "View the initial project submission and details",
    },
    {
      label: "DevPost project (2018)",
      href: "https://devpost.com/software/matthews-crossing-data-manager-oj4ica",
      note: "See the project's evolution and improvements",
    },
  ],
  impact: {
    items: [
      "Saved an estimated 5 hours per month for key staff on manual data entry and reporting",
      "Potential to save over $150,000 in volunteer time across 1,600 food banks using similar systems",
      "Improved data accuracy and enabled more timely decision-making",
    ],
  },
};

export default function MatthewsCrossingSuccessStory() {
  return <SuccessStoryLayout story={story} />;
}
