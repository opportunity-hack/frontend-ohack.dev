// src/data/why-content.js
import InternshipContent from "../components/content/InternshipContent";
import BootcampContent from "../components/content/BootcampContent";
import CareerTransitionContent from "../components/content/CareerTransitionContent";
import RemoteWorkContent from "../components/content/RemoteWorkContent";
import TeamLeadershipContent from "../components/content/TeamLeadershipContent";
import SeniorDeveloperContent from "../components/content/SeniorDeveloperContent";
import OpenSourceContent from "../components/content/OpenSourceContent";

export const whyPages = {
  "open-source-contribution": {
    title: "Build Your Open Source Portfolio with Purpose",
    subtitle:
      "Contribute to meaningful open source projects that help nonprofits succeed while building a standout GitHub profile",
    Content: OpenSourceContent,
    description:
      "Make impactful open source contributions while helping nonprofits achieve their mission. Build a standout GitHub portfolio with real-world projects that matter.",
    image: "https://cdn.ohack.dev/ohack.dev/2023_hackathon_3.webp",
    keywords: [
      "open source",
      "github portfolio",
      "code contribution",
      "social good",
      "nonprofit technology",
      "software development",
      "code review",
      "technical contribution",
      "MIT license",
      "React development",
      "Node.js",
      "Python",
      "collaborative coding",
      "version control",
    ],
    relatedLinks: [
      {
        slug: "bootcamp-projects-real-world-experience",
        title: "Build Real Projects That Matter",
      },
      {
        slug: "remote-work-experience-nonprofit",
        title: "Collaborate on Distributed Teams",
      },
    ],
    slug: "open-source-contribution",
    metaTags: [
      {
        name: "robots",
        content: "index, follow",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Build Your Open Source Portfolio with Purpose",
      description:
        "Make impactful open source contributions while helping nonprofits achieve their mission. Build a standout GitHub portfolio with real-world projects that matter.",
      image: "https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp",
      author: {
        "@type": "Organization",
        name: "Opportunity Hack",
      },
      keywords: [
        "open source contribution",
        "github portfolio",
        "nonprofit technology",
        "code collaboration",
        "software development",
        "social impact coding",
      ],
    },
    highlights: [
      "Build a meaningful GitHub portfolio",
      "Work on real-world nonprofit projects",
      "Get mentorship from experienced developers",
      "Learn modern tech stacks and best practices",
    ],
  },
  "senior-developer-impact": {
    title: "Senior Developers: Create Lasting Impact Through Tech Leadership",
    subtitle:
      "Use your expertise to mentor rising developers and build sustainable solutions for nonprofits",
    Content: SeniorDeveloperContent,
    description:
      "Make a lasting impact as a senior developer - mentor rising talent, architect sustainable solutions, and help nonprofits succeed through technology leadership.",
    image: "https://cdn.ohack.dev/ohack.dev/2023_hackathon_1.webp",
    keywords: [
      "senior developer",
      "tech leadership",
      "software architecture",
      "mentorship",
      "code review",
      "technical guidance",
      "nonprofit technology",
      "tech volunteering",
      "DevOps",
      "security compliance",
      "software development",
      "technical decision making",
    ],
    relatedLinks: [
      {
        slug: "team-leadership-nonprofit-projects",
        title: "Lead Technical Teams for Nonprofits",
      },
      {
        slug: "remote-work-experience-nonprofit",
        title: "Lead Distributed Teams",
      },
    ],
    slug: "senior-developer-impact",
    metaTags: [
      {
        name: "robots",
        content: "index, follow",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline:
        "Senior Developers: Create Lasting Impact Through Tech Leadership",
      description:
        "Make a lasting impact as a senior developer - mentor rising talent, architect sustainable solutions, and help nonprofits succeed through technology leadership.",
      image: "https://cdn.ohack.dev/ohack.dev/2023_hackathon_6.webp",
      author: {
        "@type": "Organization",
        name: "Opportunity Hack",
      },
    },
  },

  "internship-success-build-portfolio-through-nonprofit-projects": {
    title:
      "Stand Out for Summer Internships: Building Your Portfolio with Real Nonprofit Projects",
    subtitle:
      "Looking to land that dream tech internship? Learn how working on real nonprofit projects can help you develop a standout portfolio, gain practical experience, and demonstrate initiative to potential employers.",
    Content: InternshipContent,
    description:
      "Build a standout internship application by contributing to nonprofit tech projects. Get real experience, grow your network, and make an impact that hiring managers notice.",
    image: "https://cdn.ohack.dev/ohack.dev/2023_hackathon_3.webp",
    keywords: [
      "tech internship",
      "portfolio building",
      "nonprofit projects",
      "software engineering internship",
      "coding experience",
      "student developer",
    ],
    relatedLinks: [
      {
        slug: "coding-for-good-how-to-use-your-programming-skills",
        title: "Coding for Good: How to Use Your Programming Skills",
      },
      {
        slug: "why-you-should-join-opportunity-hack",
        title: "Why You Should Join Opportunity Hack",
      },
    ],
    slug: "internship-success-build-portfolio-through-nonprofit-projects",
  },

  "bootcamp-projects-real-world-experience": {
    title: "Bootcamp Success: Build Real Projects That Matter",
    subtitle:
      "Take your bootcamp learning to the next level by working on actual nonprofit projects that solve real problems.",
    Content: BootcampContent,
    description:
      "Enhance your bootcamp experience with meaningful nonprofit projects. Build a portfolio that demonstrates real-world problem-solving skills.",
    image: "https://cdn.ohack.dev/ohack.dev/2023_hackathon_1.webp",
    keywords: [
      "coding bootcamp",
      "real projects",
      "portfolio development",
      "nonprofit tech",
      "coding practice",
      "bootcamp experience",
    ],
    relatedLinks: [
      {
        slug: "internship-success-build-portfolio",
        title: "Build Your Internship Portfolio",
      },
      { slug: "coding-for-good", title: "Code for Social Impact" },
    ],
    slug: "bootcamp-projects-real-world-experience",
  },

  "career-transition-tech-nonprofit": {
    title: "Transitioning to Tech? Start with Nonprofit Projects",
    subtitle:
      "Build your tech portfolio and gain real experience while making a difference through nonprofit projects.",
    Content: CareerTransitionContent,
    description:
      "Make your career transition to tech meaningful by contributing to nonprofit projects. Gain experience, build your portfolio, and network with tech professionals.",
    image: "https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp",
    keywords: [
      "career change",
      "tech transition",
      "nonprofit technology",
      "portfolio building",
      "software development",
      "career switch",
    ],
    relatedLinks: [
      { slug: "bootcamp-projects", title: "Bootcamp Project Success" },
      { slug: "remote-work-experience", title: "Gain Remote Work Experience" },
    ],
    slug: "career-transition-tech-nonprofit",
  },

  "remote-work-experience-nonprofit": {
    title: "Gain Remote Work Experience Through Nonprofit Projects",
    subtitle:
      "Build your remote work portfolio and collaboration skills while contributing to meaningful nonprofit projects.",
    Content: RemoteWorkContent,
    description:
      "Develop essential remote work skills through nonprofit tech projects. Learn collaboration tools, async communication, and project management.",
    image: "https://cdn.ohack.dev/ohack.dev/2023_hackathon_4.webp",
    keywords: [
      "remote work",
      "virtual collaboration",
      "nonprofit tech",
      "distributed teams",
      "remote development",
      "async communication",
    ],
    relatedLinks: [
      { slug: "career-transition", title: "Transition to Tech" },
      { slug: "team-leadership", title: "Lead Technical Teams" },
    ],
    slug: "remote-work-experience-nonprofit",
  },

  "team-leadership-nonprofit-projects": {
    title: "Develop Leadership Skills Through Nonprofit Tech Projects",
    subtitle:
      "Lead technical teams and build management experience while working on impactful nonprofit projects.",
    Content: TeamLeadershipContent,
    description:
      "Gain practical leadership experience by leading technical teams on nonprofit projects. Develop project management, mentoring, and team coordination skills.",
    image: "https://cdn.ohack.dev/ohack.dev/2023_hackathon_5.webp",
    keywords: [
      "team leadership",
      "project management",
      "technical leadership",
      "nonprofit tech",
      "mentoring",
      "team coordination",
    ],
    relatedLinks: [
      { slug: "remote-work-experience", title: "Remote Work Success" },
      { slug: "career-growth", title: "Accelerate Your Tech Career" },
    ],
    slug: "team-leadership-nonprofit-projects",
  },
};
