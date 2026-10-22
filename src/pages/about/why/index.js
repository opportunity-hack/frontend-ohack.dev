import dynamic from "next/dynamic";
import Link from "next/link";
import Head from "next/head";
import { whyPages } from "../../../data/why-content";
import { serializeJsonLd } from "../../../lib/jsonLd";
import {
  RefinedPage,
  PageMasthead,
} from "../../../components/design/RefinedPage";
import { Eyebrow } from "../../../components/design/refined";

const LoginOrRegister = dynamic(
  () => import("../../../components/LoginOrRegister/LoginOrRegister2"),
  { ssr: false, loading: () => <div style={{ minHeight: 120 }} /> },
);

// Organized content by career stage/goal
const careerPathContent = [
  {
    title: "Early career",
    description: "Build your foundation in tech through real-world experience.",
    links: [
      {
        slug: "internship-success-build-portfolio-through-nonprofit-projects",
        title: "Stand out for summer internships",
      },
      {
        slug: "bootcamp-projects-real-world-experience",
        title: "Bootcamp success: build real projects",
      },
    ],
  },
  {
    title: "Career transition",
    description: "Make your move into tech meaningful and impactful.",
    links: [
      {
        slug: "career-transition-tech-nonprofit",
        title: "Transition to tech through nonprofit projects",
      },
      {
        slug: "remote-work-experience-nonprofit",
        title: "Gain remote work experience",
      },
      {
        slug: "how-to-get-experience-coding-when-laid-off",
        title: "Build your portfolio after a layoff",
      },
    ],
  },
  {
    title: "Leadership growth",
    description: "Develop leadership skills while making a difference.",
    links: [
      {
        slug: "team-leadership-nonprofit-projects",
        title: "Lead technical teams for nonprofits",
      },
      {
        slug: "senior-developer-impact",
        title: "Senior developers: create lasting impact",
      },
    ],
  },
];

// Additional pathways utilizing our complete content
const impactPathways = [
  {
    slug: "coding-for-good-how-to-use-your-programming-skills-to-make-a-difference-in-the-world",
    title: "Code for social impact",
    description:
      "Use your programming skills to create positive change in communities.",
  },
  {
    slug: "how-to-find-and-work-on-nonprofit-projects-that-match-your-coding-interests-and-expertise",
    title: "Find your perfect project",
    description:
      "Match your skills and interests with impactful nonprofit projects.",
  },
  {
    slug: "open-source-contribution",
    title: "Contribute to open source",
    description:
      "Make meaningful open source contributions that help nonprofits.",
  },
  {
    slug: "remote-work-experience-nonprofit",
    title: "Master remote collaboration",
    description:
      "Build essential remote work skills through nonprofit projects.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: careerPathContent.map((path) => ({
    "@type": "Question",
    name: `Why choose Opportunity Hack for ${path.title.toLowerCase()}?`,
    acceptedAnswer: { "@type": "Answer", text: path.description },
  })),
};

const Highlights = ({ slug }) => {
  const items = whyPages[slug]?.highlights?.slice(0, 2) || [];
  if (items.length === 0) return null;
  return (
    <span style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
      {items.map((h) => (
        <span key={h} className="ohx-tag">
          {h}
        </span>
      ))}
    </span>
  );
};

const CareerPathCard = ({ title, description, links }) => (
  <article
    className="ohx-card"
    style={{ padding: 22, display: "flex", flexDirection: "column", gap: 10 }}
  >
    <h2 className="ohx-display" style={{ fontSize: 22 }}>
      {title}
    </h2>
    <p
      style={{
        margin: 0,
        fontSize: 14.5,
        color: "var(--muted)",
        lineHeight: 1.55,
      }}
    >
      {description}
    </p>
    <ul
      style={{
        listStyle: "none",
        margin: "6px 0 0",
        padding: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {links.map((link) => (
        <li
          key={link.slug}
          style={{ borderTop: "1px solid var(--line)", padding: "12px 0" }}
        >
          <Link
            href={`/about/why/${link.slug}`}
            className="ohx-link"
            style={{ fontSize: 15 }}
          >
            {link.title}{" "}
            <span className="ohx-arrow" aria-hidden="true">
              →
            </span>
          </Link>
          <Highlights slug={link.slug} />
        </li>
      ))}
    </ul>
  </article>
);

export default function WhyIndex() {
  return (
    <>
      <Head>
        <title>
          Why Code with Opportunity Hack? | Build Skills, Make Impact
        </title>
        <meta
          name="description"
          content="Join Opportunity Hack to build real-world experience, transition careers, or grow leadership skills while creating technology that matters. Perfect for students, career changers, and tech leaders."
        />
        <meta
          name="keywords"
          content="tech volunteering, coding bootcamp projects, remote work experience, tech leadership, career transition, nonprofit technology, social impact coding"
        />
        <link rel="canonical" href="https://www.ohack.dev/about/why" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
        />
      </Head>

      <RefinedPage>
        <PageMasthead
          eyebrow="Why Opportunity Hack"
          title="Why code with Opportunity Hack?"
          italic="Build skills. Make impact."
          lead="Whether you're starting your journey in tech, making a career transition, or looking to grow as a leader, Opportunity Hack provides real-world experience building technology that makes a difference. Work on meaningful projects, learn from experienced mentors, and build a portfolio that stands out."
          style={{ marginTop: 0 }}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
            gap: 20,
            marginTop: 36,
          }}
        >
          {careerPathContent.map((content) => (
            <CareerPathCard key={content.title} {...content} />
          ))}
        </div>

        <section style={{ marginTop: 56 }} aria-labelledby="impact-heading">
          <Eyebrow>Make an impact</Eyebrow>
          <h2
            id="impact-heading"
            className="ohx-display"
            style={{ marginTop: 8 }}
          >
            Pick the path that fits you.
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
              gap: 16,
              marginTop: 20,
            }}
          >
            {impactPathways.map((pathway) => (
              <Link
                key={pathway.slug}
                href={`/about/why/${pathway.slug}`}
                className="ohx-card ohx-card--hover"
                style={{
                  padding: 20,
                  display: "block",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <h3 className="ohx-display" style={{ fontSize: 18 }}>
                  {pathway.title}
                </h3>
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: 14,
                    color: "var(--muted)",
                    lineHeight: 1.5,
                  }}
                >
                  {pathway.description}
                </p>
                <Highlights slug={pathway.slug} />
              </Link>
            ))}
          </div>
        </section>

        <div style={{ marginTop: 56, maxWidth: 720 }}>
          <LoginOrRegister
            introText="Ready to start building technology that matters?"
            previousPage="/about/why"
          />
        </div>
      </RefinedPage>
    </>
  );
}

export async function getStaticProps() {
  return {
    props: {
      openGraphData: [
        {
          property: "og:title",
          content:
            "Why Code with Opportunity Hack? | Build Skills, Make Impact",
          key: "ogtitle",
        },
        {
          property: "og:description",
          content:
            "Join Opportunity Hack to build real-world experience, transition careers, or grow leadership skills while creating technology that matters. Perfect for students, career changers, and tech leaders.",
          key: "ogdesc",
        },
        { property: "og:type", content: "website", key: "ogtype" },
        {
          property: "og:image",
          content: "https://cdn.ohack.dev/ohack.dev/2023_hackathon_1.webp",
          key: "ogimage",
        },
      ],
    },
    revalidate: 3600,
  };
}
