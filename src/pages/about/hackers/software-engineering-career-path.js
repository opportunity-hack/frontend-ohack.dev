import React, { useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  AnalyticsRounded,
  PeopleAltRounded,
  PsychologyRounded,
  LightbulbRounded,
} from "@mui/icons-material";
import { initFacebookPixel, trackEvent } from "../../../lib/ga";
import { serializeJsonLd } from "../../../lib/jsonLd";
import {
  RefinedRoot,
  Eyebrow,
  Arrow,
} from "../../../components/design/refined";
import { BackLink } from "../../../components/design/RefinedPage";

const CANONICAL =
  "https://www.ohack.dev/about/hackers/software-engineering-career-path";
const OG_IMAGE = "https://cdn.ohack.dev/ohack.dev/2024_hackathon_1.webp";

const trackClick = (button) => {
  trackEvent({ action: "click_career_path", params: { button } });
};

const CAREER_PATHS = [
  {
    title: "Solution Architect",
    salary: "$120,000 - $220,000",
    skills: [
      "System Design",
      "Business Analysis",
      "Technical Strategy",
      "Stakeholder Management",
    ],
    demand: 96,
    aiResistance: "High",
    aiResistant:
      "Requires deep understanding of business context and complex problem-solving",
  },
  {
    title: "Product Engineer",
    salary: "$110,000 - $200,000",
    skills: [
      "User Research",
      "Technical Vision",
      "Cross-functional Collaboration",
      "Data Analysis",
    ],
    demand: 93,
    aiResistance: "High",
    aiResistant:
      "Combines technical skills with human empathy and market insight",
  },
  {
    title: "Technical Lead",
    salary: "$130,000 - $250,000",
    skills: [
      "Team Leadership",
      "Architecture",
      "Mentoring",
      "Strategic Planning",
    ],
    demand: 89,
    aiResistance: "Very high",
    aiResistant: "Leadership and complex decision-making cannot be automated",
  },
  {
    title: "DevOps / Platform Engineer",
    salary: "$115,000 - $210,000",
    skills: [
      "Infrastructure",
      "Automation",
      "Security",
      "Performance Optimization",
    ],
    demand: 91,
    aiResistance: "High",
    aiResistant: "Requires understanding complex, unique organizational needs",
  },
];

const LEARNING_PATH = [
  {
    n: "01",
    phase: "Foundation + analytics",
    duration: "4-6 months",
    skills: [
      "Programming Fundamentals",
      "Data Analysis",
      "SQL",
      "Problem Decomposition",
    ],
    description:
      "Build coding skills while developing analytical thinking that AI cannot replace.",
    icon: <AnalyticsRounded fontSize="small" />,
  },
  {
    n: "02",
    phase: "User-centered development",
    duration: "4-6 months",
    skills: [
      "User Research",
      "Design Thinking",
      "A/B Testing",
      "Stakeholder Interviews",
    ],
    description:
      "Learn to understand human needs and translate them into technical solutions.",
    icon: <PeopleAltRounded fontSize="small" />,
  },
  {
    n: "03",
    phase: "Systems thinking",
    duration: "4-6 months",
    skills: [
      "Architecture",
      "Business Logic",
      "Integration",
      "Performance Analysis",
    ],
    description:
      "Develop the ability to see the big picture and design complex, interconnected systems.",
    icon: <PsychologyRounded fontSize="small" />,
  },
  {
    n: "04",
    phase: "Leadership & innovation",
    duration: "Ongoing",
    skills: [
      "Team Collaboration",
      "Technical Communication",
      "Creative Problem Solving",
      "Mentoring",
    ],
    description:
      "Build uniquely human skills that make you irreplaceable in any tech organization.",
    icon: <LightbulbRounded fontSize="small" />,
  },
];

const TECH_STATS = [
  {
    label: "Jobs requiring human judgment",
    value: "2.1M+",
    subtext: "Roles AI cannot fully replace",
  },
  {
    label: "Analytical thinking demand",
    value: "69%",
    subtext: "Of employers rank this as the #1 skill",
  },
  {
    label: "Leadership salary premium",
    value: "112%",
    subtext: "Above average compensation",
  },
  {
    label: "High-EQ annual bonus",
    value: "$29,000",
    subtext: "Compared to low-EQ professionals",
  },
];

const AI_PROOF_SKILLS = [
  {
    title: "Deep analytical thinking",
    description:
      "Master problem decomposition, data interpretation, and evidence-based decision making. Ranked #1 by 69% of employers and commands 15-20% salary premiums.",
    examples: [
      "User behavior analysis",
      "Performance bottleneck identification",
      "ROI calculations",
      "Pattern recognition",
    ],
  },
  {
    title: "Creative problem solving",
    description:
      "Develop the ability to find novel solutions to unprecedented challenges. Essential for AI/ML workflow design and human-AI collaboration roles earning 17.7% premiums.",
    examples: [
      "Innovative feature design",
      "Novel algorithmic approaches",
      "Resource optimization",
      "Cross-functional solutions",
    ],
  },
  {
    title: "Cross-functional communication",
    description:
      "Master technical writing and stakeholder management. Technical writers earn $91,670-$130,000+ annually, while high-EQ professionals earn $29,000 more per year.",
    examples: [
      "Technical presentations",
      "Requirement gathering",
      "Risk communication",
      "Executive reporting",
    ],
  },
  {
    title: "Systems architecture",
    description:
      "Learn to design complex systems balancing technical constraints and business needs. Cloud architects earn $155,597-$190,204 average salaries.",
    examples: [
      "Database design decisions",
      "Microservices architecture",
      "Integration planning",
      "Scalability assessment",
    ],
  },
];

const WHY_HACKATHONS = [
  {
    title: "Deep problem analysis",
    description:
      "Understand real nonprofit challenges, analyze user needs, and make data-driven decisions about technical solutions.",
    icon: <AnalyticsRounded />,
  },
  {
    title: "Creative solution design",
    description:
      "Develop innovative approaches to unique challenges that require human creativity and understanding of context.",
    icon: <LightbulbRounded />,
  },
  {
    title: "Leadership & communication",
    description:
      "Lead diverse teams, present technical solutions to stakeholders, and build consensus around complex decisions.",
    icon: <PeopleAltRounded />,
  },
];

const SUCCESS_STORIES = [
  {
    name: "Sarah",
    role: "Technical Product Manager",
    quote:
      "Hackathons taught me analytical thinking and stakeholder management. Earned PMP + AWS certs for a 112% leadership premium.",
    from: "$140,000",
    to: "$185,000",
  },
  {
    name: "Marcus",
    role: "Solutions Architect",
    quote:
      "Led 6 hackathon teams, mastered system design thinking. AWS certification + EQ development = rapid advancement.",
    from: "$95,000",
    to: "$165,000",
  },
  {
    name: "Jessica",
    role: "Engineering Lead",
    quote:
      "Developed high EQ through mentoring teams. Each EQ point = $1,300 salary increase. Now leading a 12-person engineering team.",
    from: "$110,000",
    to: "$180,000",
  },
];

const CERTIFICATIONS = [
  {
    name: "AWS Solutions Architect",
    costRoi: "Cost: $150-$400 · ROI: 1-3 months",
    headline: "$155,597 avg salary",
    note: "Cloud expertise + hackathon portfolio = unbeatable combination",
  },
  {
    name: "Project Management (PMP)",
    costRoi: "Cost: $2,555-$3,305 · ROI: 6 months",
    headline: "$122K vs $93K median",
    note: "29% salary increase + leadership pathway",
  },
  {
    name: "Cybersecurity (CISSP)",
    costRoi: "Cost: $749-$1,200 · ROI: 2-4 months",
    headline: "$168,060 avg salary",
    note: "3.5M unfilled cybersecurity roles worldwide",
  },
];

const EMERGING_SKILLS = [
  "MLOps Engineering (9.8x growth)",
  "AI Workflow Design (+17.7% salary)",
  "Human-AI Collaboration",
];

const SECTION_PAD = {
  paddingTop: "clamp(48px, 7vh, 80px)",
  paddingBottom: "clamp(48px, 7vh, 80px)",
};
const BAND = {
  background: "var(--surface-2)",
  borderTop: "1px solid var(--line)",
  borderBottom: "1px solid var(--line)",
};
const TAG_ROW = { display: "flex", flexWrap: "wrap", gap: 6 };

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${CANONICAL}#webpage`,
      url: CANONICAL,
      name: "Software Engineering Career Path - AI-Proof Skills Guide",
      description:
        "Build AI-resistant software engineering skills through hands-on hackathons. Develop analytical thinking, creative problem-solving, and leadership abilities that make you irreplaceable.",
      isPartOf: { "@type": "WebSite", "@id": "https://www.ohack.dev/#website" },
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
          name: "Hackers",
          item: "https://www.ohack.dev/about/hackers",
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "Career path",
          item: CANONICAL,
        },
      ],
    },
  ],
};

// Module-scope presentational bits (no remounts on parent re-render).
const StatTile = ({ value, label, subtext }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    <span
      className="ohx-display"
      style={{
        fontSize: "clamp(22px, 3vw, 32px)",
        color: "var(--brand)",
        lineHeight: 1,
      }}
    >
      {value}
    </span>
    <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
    <span className="ohx-faint" style={{ fontSize: 12.5 }}>
      {subtext}
    </span>
  </div>
);

const DemandBar = ({ value }) => (
  <div style={{ marginTop: 16 }}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: 12.5,
        marginBottom: 6,
      }}
    >
      <span className="ohx-muted">Market demand</span>
      <span style={{ fontWeight: 600 }}>{value}%</span>
    </div>
    <div
      role="progressbar"
      aria-label="Market demand"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      style={{ height: 4, borderRadius: 2, background: "var(--line)" }}
    >
      <div
        style={{
          width: `${value}%`,
          height: "100%",
          borderRadius: 2,
          background: "var(--brand)",
        }}
      />
    </div>
  </div>
);

const SoftwareEngineeringCareerPath = () => {
  useEffect(() => {
    initFacebookPixel();
  }, []);

  return (
    <>
      <Head>
        <title>
          Software Engineering Career Path - AI-Proof Skills Guide | Opportunity
          Hack
        </title>
        <meta
          name="description"
          content="Build AI-resistant software engineering skills through hands-on hackathons. Develop analytical thinking, creative problem-solving, and leadership abilities that make you irreplaceable."
        />
        <meta
          name="keywords"
          content="AI-proof software engineering, analytical thinking, creative problem solving, tech leadership, software engineering career, programming skills"
        />
        <meta
          property="og:title"
          content="Software Engineering Career Path - Build AI-Proof Skills"
        />
        <meta
          property="og:description"
          content="Develop uniquely human skills that AI cannot replace. Learn analytical thinking, creative problem-solving, and technical leadership through real-world hackathon projects."
        />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={CANONICAL} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Software Engineering Career Path - AI-Proof Skills Guide"
        />
        <meta
          name="twitter:description"
          content="Complete guide to becoming a software engineer. Learn programming, build projects, launch your career."
        />
        <meta name="twitter:image" content={OG_IMAGE} />
        <link rel="canonical" href={CANONICAL} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(STRUCTURED_DATA) }}
        />
      </Head>

      <RefinedRoot>
        {/* HERO */}
        <section
          className="ohx-wrap"
          style={{
            paddingTop: "clamp(104px, 13vh, 156px)",
            paddingBottom: "clamp(28px, 5vh, 48px)",
          }}
        >
          <div className="rise" style={{ marginBottom: 18 }}>
            <BackLink href="/about/hackers">Hacker guide</BackLink>
          </div>
          <Eyebrow>
            <span className="rise" style={{ display: "inline-block" }}>
              Hackers · career guide
            </span>
          </Eyebrow>
          <h1
            className="ohx-display rise"
            style={{ marginTop: 18, maxWidth: "17ch", animationDelay: "60ms" }}
          >
            Build the engineering skills{" "}
            <span className="ohx-italic">AI can&apos;t replace.</span>
          </h1>
          <p
            className="ohx-lead rise"
            style={{ marginTop: 22, animationDelay: "150ms", maxWidth: "62ch" }}
          >
            Yes, AI is changing the job market. But engineers with deep
            analytical thinking, creative problem-solving, and leadership skills
            are more valuable than ever. Hackathons for nonprofits are where you
            practice all three on real problems.
          </p>
          <div
            className="rise"
            style={{
              marginTop: 30,
              display: "flex",
              flexWrap: "wrap",
              gap: 14,
              animationDelay: "230ms",
            }}
          >
            <Link
              href="/hack"
              className="ohx-btn ohx-btn--primary"
              onClick={() => trackClick("hero_find_hackathon")}
            >
              Find a hackathon <Arrow />
            </Link>
            <Link
              href="/projects"
              className="ohx-btn ohx-btn--ghost"
              onClick={() => trackClick("hero_projects")}
            >
              See real projects
            </Link>
          </div>

          <hr className="ohx-rule" style={{ marginTop: 40 }} />
          <div
            className="rise"
            style={{
              marginTop: 26,
              display: "grid",
              gap: "clamp(20px, 4vw, 40px)",
              gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
              animationDelay: "360ms",
            }}
          >
            {TECH_STATS.map((s) => (
              <StatTile key={s.label} {...s} />
            ))}
          </div>
        </section>

        {/* AI-PROOF SKILLS */}
        <section style={BAND}>
          <div className="ohx-wrap" style={SECTION_PAD}>
            <Eyebrow>What you&apos;ll practice</Eyebrow>
            <h2
              className="ohx-display"
              style={{ marginTop: 8, marginBottom: 10 }}
            >
              Skills that compound while AI writes the boilerplate
            </h2>
            <p
              className="ohx-muted"
              style={{ marginTop: 0, marginBottom: 28, maxWidth: "64ch" }}
            >
              AI can generate code. It cannot replicate human judgment,
              creativity, or the ability to understand complex business and
              social contexts.
            </p>
            <div
              style={{
                display: "grid",
                gap: 18,
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              }}
            >
              {AI_PROOF_SKILLS.map((skill) => (
                <div
                  key={skill.title}
                  className="ohx-card"
                  style={{ padding: "24px 26px" }}
                >
                  <h3 className="ohx-display" style={{ fontSize: "1.2rem" }}>
                    {skill.title}
                  </h3>
                  <p
                    className="ohx-muted"
                    style={{
                      margin: "10px 0 16px",
                      fontSize: "0.95rem",
                      lineHeight: 1.6,
                    }}
                  >
                    {skill.description}
                  </p>
                  <p
                    className="ohx-eyebrow"
                    style={{ marginBottom: 8, letterSpacing: "0.14em" }}
                  >
                    You&apos;ll practice through
                  </p>
                  <div style={TAG_ROW}>
                    {skill.examples.map((example) => (
                      <span key={example} className="ohx-tag">
                        {example}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CAREER PATHS */}
        <section className="ohx-wrap" style={SECTION_PAD}>
          <Eyebrow>Where it leads</Eyebrow>
          <h2
            className="ohx-display"
            style={{ marginTop: 8, marginBottom: 10 }}
          >
            High-value career paths
          </h2>
          <p
            className="ohx-muted"
            style={{ marginTop: 0, marginBottom: 28, maxWidth: "62ch" }}
          >
            Focus on roles that require human judgment, creativity, and a deep
            understanding of business context.
          </p>
          <div
            style={{
              display: "grid",
              gap: 18,
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            }}
          >
            {CAREER_PATHS.map((path) => (
              <article
                key={path.title}
                className="ohx-card"
                style={{ padding: "24px 26px" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "baseline",
                    flexWrap: "wrap",
                  }}
                >
                  <h3 className="ohx-display" style={{ fontSize: "1.2rem" }}>
                    {path.title}
                  </h3>
                  <span className="ohx-tag ohx-tag--accent">
                    AI resistance · {path.aiResistance}
                  </span>
                </div>
                <p
                  className="ohx-display"
                  style={{
                    margin: "10px 0 0",
                    fontSize: "1.25rem",
                    color: "var(--brand)",
                  }}
                >
                  {path.salary}
                </p>
                <p
                  className="ohx-muted"
                  style={{
                    margin: "8px 0 0",
                    fontSize: "0.92rem",
                    lineHeight: 1.55,
                  }}
                >
                  {path.aiResistant}.
                </p>
                <DemandBar value={path.demand} />
                <div style={{ ...TAG_ROW, marginTop: 16 }}>
                  {path.skills.map((skill) => (
                    <span key={skill} className="ohx-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* LEARNING PATH */}
        <section style={BAND}>
          <div className="ohx-wrap" style={SECTION_PAD}>
            <Eyebrow>Strategic learning path</Eyebrow>
            <h2
              className="ohx-display"
              style={{ marginTop: 8, marginBottom: 10 }}
            >
              Four phases, roughly eighteen months
            </h2>
            <p
              className="ohx-muted"
              style={{ marginTop: 0, marginBottom: 28, maxWidth: "62ch" }}
            >
              Build technical skills alongside the uniquely human capabilities
              that make you indispensable.
            </p>
            <ol
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "grid",
                gap: 18,
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              }}
            >
              {LEARNING_PATH.map((phase) => (
                <li
                  key={phase.n}
                  className="ohx-card"
                  style={{ padding: "24px 26px", background: "var(--surface)" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      className="ohx-display ohx-italic"
                      style={{ fontSize: "1.6rem" }}
                    >
                      {phase.n}
                    </span>
                    <span
                      style={{ color: "var(--accent)", display: "inline-flex" }}
                      aria-hidden="true"
                    >
                      {phase.icon}
                    </span>
                  </div>
                  <h3
                    className="ohx-display"
                    style={{ fontSize: "1.15rem", marginTop: 8 }}
                  >
                    {phase.phase}
                  </h3>
                  <p
                    className="ohx-faint"
                    style={{ margin: "4px 0 0", fontSize: 12.5 }}
                  >
                    {phase.duration}
                  </p>
                  <p
                    className="ohx-muted"
                    style={{
                      margin: "12px 0 14px",
                      fontSize: "0.95rem",
                      lineHeight: 1.6,
                    }}
                  >
                    {phase.description}
                  </p>
                  <div style={TAG_ROW}>
                    {phase.skills.map((skill) => (
                      <span key={skill} className="ohx-tag">
                        {skill}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* WHY HACKATHONS */}
        <section className="ohx-wrap" style={SECTION_PAD}>
          <Eyebrow>Why hackathons</Eyebrow>
          <h2
            className="ohx-display"
            style={{ marginTop: 8, marginBottom: 10 }}
          >
            Tutorials teach syntax. Hackathons teach judgment.
          </h2>
          <p
            className="ohx-muted"
            style={{ marginTop: 0, marginBottom: 28, maxWidth: "66ch" }}
          >
            Unlike coding tutorials or AI-assisted development, hackathons force
            you to develop the human skills that make senior engineers
            irreplaceable.
          </p>
          <div
            style={{
              display: "grid",
              gap: 18,
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            }}
          >
            {WHY_HACKATHONS.map((item) => (
              <div
                key={item.title}
                className="ohx-card"
                style={{
                  padding: "22px 24px",
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    color: "var(--accent)",
                    display: "inline-flex",
                    marginTop: 2,
                  }}
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
                <div>
                  <h3 className="ohx-display" style={{ fontSize: "1.1rem" }}>
                    {item.title}
                  </h3>
                  <p
                    className="ohx-muted"
                    style={{
                      margin: "6px 0 0",
                      fontSize: "0.92rem",
                      lineHeight: 1.55,
                    }}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Success stories */}
          <div style={{ marginTop: 48 }}>
            <Eyebrow>From the community</Eyebrow>
            <h3
              className="ohx-display"
              style={{
                fontSize: "clamp(20px, 2.6vw, 26px)",
                marginTop: 8,
                marginBottom: 20,
              }}
            >
              Data-driven success stories
            </h3>
            <div
              style={{
                display: "grid",
                gap: 18,
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              }}
            >
              {SUCCESS_STORIES.map((story) => (
                <figure
                  key={story.name}
                  className="ohx-card"
                  style={{
                    margin: 0,
                    padding: "22px 24px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <blockquote
                    className="ohx-muted"
                    style={{
                      margin: 0,
                      fontSize: "0.95rem",
                      lineHeight: 1.6,
                      borderLeft: "2px solid var(--accent)",
                      paddingLeft: 14,
                    }}
                  >
                    &ldquo;{story.quote}&rdquo;
                  </blockquote>
                  <figcaption style={{ marginTop: 16 }}>
                    <span style={{ fontWeight: 600 }}>{story.name}</span>
                    <span className="ohx-faint">, {story.role}</span>
                    <p
                      className="ohx-display"
                      style={{
                        margin: "8px 0 0",
                        fontSize: "1.1rem",
                        color: "var(--brand)",
                      }}
                    >
                      {story.from} <span className="ohx-faint">→</span>{" "}
                      {story.to}
                    </p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* CERTIFICATIONS — navy band */}
        <section style={{ background: "var(--brand)", color: "#fff" }}>
          <div className="ohx-wrap" style={SECTION_PAD}>
            <p
              className="ohx-eyebrow"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              Strategic certifications
            </p>
            <h2
              className="ohx-display"
              style={{
                color: "#fff",
                marginTop: 8,
                marginBottom: 12,
                maxWidth: "22ch",
              }}
            >
              Pair hackathon experience with credentials that pay back fast
            </h2>
            <p
              style={{
                margin: "0 0 28px",
                maxWidth: "66ch",
                lineHeight: 1.65,
                color: "rgba(255,255,255,0.85)",
              }}
            >
              93% of IT professionals hold certifications. Combine hackathon
              experience with strategic credentials for 25-50% salary increases.
            </p>
            <div
              style={{
                display: "grid",
                gap: 18,
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              }}
            >
              {CERTIFICATIONS.map((cert) => (
                <div
                  key={cert.name}
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    borderRadius: 8,
                    padding: "20px 22px",
                  }}
                >
                  <h3
                    className="ohx-display"
                    style={{ color: "#fff", fontSize: "1.1rem" }}
                  >
                    {cert.name}
                  </h3>
                  <p
                    style={{
                      margin: "6px 0 0",
                      fontSize: 12.5,
                      color: "rgba(255,255,255,0.7)",
                    }}
                  >
                    {cert.costRoi}
                  </p>
                  <p
                    className="ohx-display"
                    style={{
                      margin: "14px 0 0",
                      fontSize: "1.3rem",
                      color: "#fff",
                    }}
                  >
                    {cert.headline}
                  </p>
                  <p
                    style={{
                      margin: "6px 0 0",
                      fontSize: "0.9rem",
                      color: "rgba(255,255,255,0.82)",
                      lineHeight: 1.5,
                    }}
                  >
                    {cert.note}
                  </p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 28 }}>
              <p
                className="ohx-eyebrow"
                style={{ color: "rgba(255,255,255,0.7)", marginBottom: 10 }}
              >
                Emerging high-value skills
              </p>
              <div style={TAG_ROW}>
                {EMERGING_SKILLS.map((skill) => (
                  <span
                    key={skill}
                    className="ohx-tag"
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      borderColor: "rgba(255,255,255,0.3)",
                      color: "#fff",
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section
          className="ohx-wrap"
          style={{
            ...SECTION_PAD,
            paddingBottom: "clamp(56px, 9vh, 104px)",
            textAlign: "center",
          }}
        >
          <Eyebrow>Next step</Eyebrow>
          <h2
            className="ohx-display"
            style={{
              marginTop: 8,
              marginBottom: 14,
              maxWidth: "22ch",
              marginInline: "auto",
            }}
          >
            Don&apos;t compete with AI. Complement it.
          </h2>
          <p
            className="ohx-muted"
            style={{ margin: "0 auto 28px", maxWidth: "56ch" }}
          >
            While AI generates code, you&apos;ll solve complex problems, lead
            teams, and make strategic decisions that shape the future of
            technology.
          </p>
          <div
            style={{
              display: "flex",
              gap: 14,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/hack"
              className="ohx-btn ohx-btn--primary"
              onClick={() => trackClick("final_find_hackathon")}
            >
              Build AI-proof skills at a hackathon <Arrow />
            </Link>
            <Link
              href="/volunteer/professional-development-volunteering"
              className="ohx-btn ohx-btn--ghost"
              onClick={() => trackClick("final_volunteer")}
            >
              Volunteer for career growth
            </Link>
            <Link
              href="/projects"
              className="ohx-btn ohx-btn--ghost"
              onClick={() => trackClick("final_projects")}
            >
              See real projects
            </Link>
          </div>
        </section>
      </RefinedRoot>
    </>
  );
};

export default SoftwareEngineeringCareerPath;
