// src/data/why-content.js
import InternshipContent from "../components/content/InternshipContent";
import BootcampContent from "../components/content/BootcampContent";
import CareerTransitionContent from "../components/content/CareerTransitionContent";
import RemoteWorkContent from "../components/content/RemoteWorkContent";
import TeamLeadershipContent from "../components/content/TeamLeadershipContent";
import SeniorDeveloperContent from "../components/content/SeniorDeveloperContent";
import OpenSourceContent from "../components/content/OpenSourceContent";
import CodingForGoodContent from "../components/content/CodingForGoodContent";
import FindNonprofitProjectContent from "../components/content/FindNonprofitProjectContent";
import ExperienceAfterLayoffContent from "../components/content/ExperienceAfterLayoffContent";

export const whyPages = {
  "open-source-contribution": {
    title: "Build Your Open Source Portfolio with Purpose",
    subtitle:
      "Contribute to meaningful open source projects that help nonprofits succeed while building a standout GitHub profile",
    Content: OpenSourceContent,
    description:
      "Make impactful open source contributions while helping nonprofits achieve their mission. Build a standout GitHub portfolio with real-world projects that matter.",
    image: "https://cdn.ohack.dev/ohack.dev/2023_hackathon_1.webp",
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
      { name: "robots", content: "index, follow" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Build Your Open Source Portfolio with Purpose",
      description:
        "Make impactful open source contributions while helping nonprofits achieve their mission. Build a standout GitHub portfolio with real-world projects that matter.",
      image: "https://cdn.ohack.dev/ohack.dev/2023_hackathon_1.webp",
      author: { "@type": "Organization", name: "Opportunity Hack" },
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
    image: "https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp",
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
      { name: "robots", content: "index, follow" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline:
        "Senior Developers: Create Lasting Impact Through Tech Leadership",
      description:
        "Make a lasting impact as a senior developer - mentor rising talent, architect sustainable solutions, and help nonprofits succeed through technology leadership.",
      image: "https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp",
      author: { "@type": "Organization", name: "Opportunity Hack" },
    },
    highlights: [
      "Mentor rising developers",
      "Architect sustainable solutions",
      "Lead technical teams",
      "Create lasting social impact",
    ],
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
        slug: "coding-for-good-how-to-use-your-programming-skills-to-make-a-difference-in-the-world",
        title: "Coding for Good: How to Use Your Programming Skills",
      },
    ],
    slug: "internship-success-build-portfolio-through-nonprofit-projects",
    metaTags: [
      { name: "robots", content: "index, follow" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline:
        "Stand Out for Summer Internships: Building Your Portfolio with Real Nonprofit Projects",
      description:
        "Build a standout internship application by contributing to nonprofit tech projects. Get real experience, grow your network, and make an impact that hiring managers notice.",
      image: "https://cdn.ohack.dev/ohack.dev/2023_hackathon_3.webp",
      author: { "@type": "Organization", name: "Opportunity Hack" },
    },
    highlights: [
      "Build a compelling portfolio",
      "Gain real-world experience",
      "Network with professionals",
      "Make meaningful contributions",
    ],
  },
  "bootcamp-projects-real-world-experience": {
    title: "Bootcamp Success: Build Real Projects That Matter",
    subtitle:
      "Take your bootcamp learning to the next level by working on actual nonprofit projects that solve real problems.",
    Content: BootcampContent,
    description:
      "Enhance your bootcamp experience with meaningful nonprofit projects. Build a portfolio that demonstrates real-world problem-solving skills.",
    image: "https://cdn.ohack.dev/ohack.dev/2023_hackathon_4.webp",
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
        slug: "open-source-contribution",
        title: "Build Your Open Source Portfolio",
      },
      {
        slug: "coding-for-good-how-to-use-your-programming-skills-to-make-a-difference-in-the-world",
        title: "Code for Social Impact",
      },
    ],
    slug: "bootcamp-projects-real-world-experience",
    metaTags: [
      { name: "robots", content: "index, follow" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Bootcamp Success: Build Real Projects That Matter",
      description:
        "Enhance your bootcamp experience with meaningful nonprofit projects. Build a portfolio that demonstrates real-world problem-solving skills.",
      image: "https://cdn.ohack.dev/ohack.dev/2023_hackathon_4.webp",
      author: { "@type": "Organization", name: "Opportunity Hack" },
    },
    highlights: [
      "Work on real-world projects",
      "Apply bootcamp skills",
      "Build your portfolio",
      "Make a difference",
    ],
  },
  "career-transition-tech-nonprofit": {
    title: "Transitioning to Tech? Start with Nonprofit Projects",
    subtitle:
      "Build your tech portfolio and gain real experience while making a difference through nonprofit projects.",
    Content: CareerTransitionContent,
    description:
      "Make your career transition to tech meaningful by contributing to nonprofit projects. Gain experience, build your portfolio, and network with tech professionals.",
    image: "https://cdn.ohack.dev/ohack.dev/2023_hackathon_5.webp",
    keywords: [
      "career change",
      "tech transition",
      "nonprofit technology",
      "portfolio building",
      "software development",
      "career switch",
    ],
    relatedLinks: [
      {
        slug: "bootcamp-projects-real-world-experience",
        title: "Bootcamp Project Success",
      },
      {
        slug: "remote-work-experience-nonprofit",
        title: "Gain Remote Work Experience",
      },
    ],
    slug: "career-transition-tech-nonprofit",
    metaTags: [
      { name: "robots", content: "index, follow" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Transitioning to Tech? Start with Nonprofit Projects",
      description:
        "Make your career transition to tech meaningful by contributing to nonprofit projects. Gain experience, build your portfolio, and network with tech professionals.",
      image: "https://cdn.ohack.dev/ohack.dev/2023_hackathon_5.webp",
      author: { "@type": "Organization", name: "Opportunity Hack" },
    },
    highlights: [
      "Build a tech portfolio",
      "Gain real experience",
      "Network with professionals",
      "Learn modern technologies",
    ],
  },
  "remote-work-experience-nonprofit": {
    title: "Gain Remote Work Experience Through Nonprofit Projects",
    subtitle:
      "Build your remote work portfolio and collaboration skills while contributing to meaningful nonprofit projects.",
    Content: RemoteWorkContent,
    description:
      "Develop essential remote work skills through nonprofit tech projects. Learn collaboration tools, async communication, and project management.",
    image: "https://cdn.ohack.dev/ohack.dev/2023_hackathon_6.webp",
    keywords: [
      "remote work",
      "virtual collaboration",
      "nonprofit tech",
      "distributed teams",
      "remote development",
      "async communication",
    ],
    relatedLinks: [
      { slug: "career-transition-tech-nonprofit", title: "Transition to Tech" },
      {
        slug: "team-leadership-nonprofit-projects",
        title: "Lead Technical Teams",
      },
    ],
    slug: "remote-work-experience-nonprofit",
    metaTags: [
      { name: "robots", content: "index, follow" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Gain Remote Work Experience Through Nonprofit Projects",
      description:
        "Develop essential remote work skills through nonprofit tech projects. Learn collaboration tools, async communication, and project management.",
      image: "https://cdn.ohack.dev/ohack.dev/2023_hackathon_6.webp",
      author: { "@type": "Organization", name: "Opportunity Hack" },
    },
    highlights: [
      "Master remote collaboration",
      "Learn async communication",
      "Build distributed team skills",
      "Manage remote projects",
    ],
  },
  "team-leadership-nonprofit-projects": {
    title: "Develop Leadership Skills Through Nonprofit Tech Projects",
    subtitle:
      "Lead technical teams and build management experience while working on impactful nonprofit projects.",
    Content: TeamLeadershipContent,
    description:
      "Gain practical leadership experience by leading technical teams on nonprofit projects. Develop project management, mentoring, and team coordination skills.",
    image: "https://cdn.ohack.dev/ohack.dev/2024_hackathon_1.webp",
    keywords: [
      "team leadership",
      "project management",
      "technical leadership",
      "nonprofit tech",
      "mentoring",
      "team coordination",
    ],
    relatedLinks: [
      {
        slug: "remote-work-experience-nonprofit",
        title: "Remote Work Success",
      },
      {
        slug: "senior-developer-impact",
        title: "Create Lasting Impact Through Tech Leadership",
      },
    ],
    slug: "team-leadership-nonprofit-projects",
    metaTags: [
      { name: "robots", content: "index, follow" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Develop Leadership Skills Through Nonprofit Tech Projects",
      description:
        "Gain practical leadership experience by leading technical teams on nonprofit projects. Develop project management, mentoring, and team coordination skills.",
      image: "https://cdn.ohack.dev/ohack.dev/2024_hackathon_1.webp",
      author: { "@type": "Organization", name: "Opportunity Hack" },
    },
    highlights: [
      "Lead technical teams",
      "Develop management skills",
      "Mentor team members",
      "Drive project success",
    ],
  },
  "coding-for-good-how-to-use-your-programming-skills-to-make-a-difference-in-the-world":
    {
      title:
        "Coding for Good: How to Use Your Programming Skills to Make a Difference",
      subtitle:
        "Learn how to leverage your technical skills to create positive social impact through coding",
      Content: CodingForGoodContent,
      description:
        "Discover how to use your programming skills to address social issues and make a meaningful impact in your community through technology.",
      image: "https://cdn.ohack.dev/ohack.dev/2024_hackathon_2.webp",
      keywords: [
        "social impact coding",
        "tech for good",
        "nonprofit technology",
        "coding skills",
        "social change",
        "technical volunteering",
        "community impact",
        "software for nonprofits",
      ],
      relatedLinks: [
        {
          slug: "open-source-contribution",
          title: "Contribute to Open Source Projects",
        },
        {
          slug: "team-leadership-nonprofit-projects",
          title: "Lead Technical Teams",
        },
      ],
      slug: "coding-for-good-how-to-use-your-programming-skills-to-make-a-difference-in-the-world",
      metaTags: [
        { name: "robots", content: "index, follow" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Article",
        headline:
          "Coding for Good: How to Use Your Programming Skills to Make a Difference",
        description:
          "Discover how to use your programming skills to address social issues and make a meaningful impact in your community through technology.",
        image: "https://cdn.ohack.dev/ohack.dev/2024_hackathon_2.webp",
        author: { "@type": "Organization", name: "Opportunity Hack" },
      },
      highlights: [
        "Create social impact",
        "Address community needs",
        "Build meaningful solutions",
        "Drive positive change",
      ],
    },
  "how-to-find-and-work-on-nonprofit-projects-that-match-your-coding-interests-and-expertise":
    {
      title: "Find the Right Nonprofit Project for Your Skills",
      subtitle:
        "A practical guide to finding and contributing to nonprofit tech projects that match your interests and expertise",
      Content: FindNonprofitProjectContent,
      description:
        "Learn how to find, evaluate, and contribute to nonprofit technology projects that align with your skills and interests. Get practical tips for successful project selection and contribution.",
      image: "https://cdn.ohack.dev/ohack.dev/2024_hackathon_3.webp",
      keywords: [
        "Laid Off? Help a nonprofit",
        "tech volunteering",
        "Tech Skills for Good",
        "coding skills",
        "volunteer coding",
        "Code for Good",
        "Volunteer Software Engineering Near me",
        "Skill-based volunteering",
        "nonprofit technology",
        "volunteer developer",
      ],
      relatedLinks: [
        {
          slug: "open-source-contribution",
          title: "Contributing to Open Source Projects",
        },
        {
          slug: "remote-work-experience-nonprofit",
          title: "Working on Remote Teams",
        },
      ],
      slug: "how-to-find-and-work-on-nonprofit-projects-that-match-your-coding-interests-and-expertise",
      metaTags: [
        { name: "robots", content: "index, follow" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Find the Right Nonprofit Project for Your Skills",
        description:
          "Learn how to find, evaluate, and contribute to nonprofit technology projects that align with your skills and interests. Get practical tips for successful project selection and contribution.",
        image: "https://cdn.ohack.dev/ohack.dev/2024_hackathon_3.webp",
        author: { "@type": "Organization", name: "Opportunity Hack" },
      },
      highlights: [
        "Match skills to projects",
        "Evaluate project fit",
        "Contribute effectively",
        "Make meaningful impact",
      ],
    },
    "how-to-get-experience-coding-when-laid-off": {
      title: "Laid Off? Help a Nonprofit",
      subtitle:
        "Use your tech skills for good by contributing to nonprofit projects and building your portfolio",
      Content: ExperienceAfterLayoffContent,
      description:
        "Make a positive impact and build your tech portfolio by contributing to nonprofit projects. Learn how to find and work on projects that match your skills and interests.",
      image: "https://cdn.ohack.dev/ohack.dev/2024_hackathon_3.webp",
      keywords: [
        "Laid Off? Help a nonprofit",
        "tech volunteering",
        "Tech Skills for Good",
        "coding skills",
        "volunteer coding",
        "Code for Good",
        "Volunteer Software Engineering Near me",
        "Skill-based volunteering",
        "nonprofit technology",
        "volunteer developer",
      ],
      relatedLinks: [
        {
          slug: "open-source-contribution",
          title: "Contributing to Open Source Projects",
        },
        {
          slug: "remote-work-experience-nonprofit",
          title: "Working on Remote Teams",
        },
      ],
      slug: "how-to-get-experience-coding-when-laid-off",
      metaTags: [
        { name: "robots", content: "index, follow" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Laid Off? Help a Nonprofit",
        description:
          "Make a positive impact and build your tech portfolio by contributing to nonprofit projects. Learn how to find and work on projects that match your skills and interests.",
        image: "https://cdn.ohack.dev/ohack.dev/2024_hackathon_3.webp",
        author: { "@type": "Organization", name: "Opportunity Hack" },
      },
      highlights: [
        "Match skills to projects",
        "Evaluate project fit",
        "Contribute effectively",
        "Make meaningful impact",
      ],
    },

};