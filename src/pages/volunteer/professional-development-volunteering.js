import React from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import {
  Group as GroupIcon,
  Campaign as CampaignIcon,
  Analytics as AnalyticsIcon,
  Cloud as CloudIcon,
  EmojiEvents as TrophyIcon,
  Business as BusinessIcon,
  School as SchoolIcon,
} from "@mui/icons-material";
import { RefinedRoot, Eyebrow, Arrow } from "../../components/design/refined";

// Canonical host is www.ohack.dev (the old page pointed at
// www.opportunityhack.org, which isn't where this page lives).
const CANONICAL =
  "https://www.ohack.dev/volunteer/professional-development-volunteering";
const HERO_PHOTO =
  "https://cdn.ohack.dev/hackathons/2025_fall/photos/1781122606757_IMG_9788.JPG";

const SOFT_SKILLS = [
  {
    skill: "Analytical Thinking",
    salaryBoost: "15-20%",
    description:
      "Problem decomposition, data interpretation, evidence-based decision making",
    demandRank: "#1 Most Critical Skill",
    icon: <AnalyticsIcon fontSize="inherit" />,
  },
  {
    skill: "Leadership & Project Management",
    salaryBoost: "112%",
    description: "Team coordination, resource management, strategic planning",
    demandRank: "PMP: $122K median vs $93K",
    icon: <GroupIcon fontSize="inherit" />,
  },
  {
    skill: "Communication & Emotional Intelligence",
    salaryBoost: "$1,300/EQ point",
    description:
      "Technical writing, stakeholder management, cross-functional collaboration",
    demandRank: "90% of top performers have high EQ",
    icon: <CampaignIcon fontSize="inherit" />,
  },
  {
    skill: "Technology Integration",
    salaryBoost: "17.7%",
    description:
      "AI workflow design, cloud platform knowledge, digital transformation",
    demandRank: "DevOps: $120K-$200K salaries",
    icon: <CloudIcon fontSize="inherit" />,
  },
];

const VOLUNTEER_SKILLS = [
  {
    category: "Project Management",
    skills: [
      "Agile methodology",
      "Resource planning",
      "Timeline management",
      "Risk assessment",
    ],
    realWorldValue:
      "PMP certification equivalent experience worth $30,000+ salary increase",
  },
  {
    category: "Technical Leadership",
    skills: [
      "Architecture decisions",
      "Code reviews",
      "Mentoring developers",
      "Technology selection",
    ],
    realWorldValue:
      "Senior developer pathway with $25,000+ annual advancement potential",
  },
  {
    category: "Business Analysis",
    skills: [
      "Requirements gathering",
      "Stakeholder management",
      "Process optimization",
      "ROI analysis",
    ],
    realWorldValue:
      "Business analyst roles starting at $75,000-$95,000 annually",
  },
  {
    category: "Communication & Training",
    skills: [
      "Technical documentation",
      "User training",
      "Presentation skills",
      "Cross-team collaboration",
    ],
    realWorldValue:
      "Technical writing roles at $91,670 median, up to $130,000+ specialized",
  },
];

const CAREER_STATS = [
  {
    label: "Salary Premium",
    value: "20-50%",
    subtext: "For combined technical + soft skills",
  },
  {
    label: "Career Advancement",
    value: "2-4x faster",
    subtext: "Compared to technical-only professionals",
  },
  {
    label: "EQ Salary Impact",
    value: "$29,000",
    subtext: "Higher annual earnings for high-EQ professionals",
  },
  {
    label: "Top Performer Rate",
    value: "90%",
    subtext: "Have high emotional intelligence",
  },
];

const CERTIFICATION_ROI = [
  {
    certification: "AWS Solutions Architect",
    cost: "$150-$400",
    salaryIncrease: "$15,000-$30,000",
    paybackTime: "1-3 months",
    avgSalary: "$155,597",
  },
  {
    certification: "Project Management (PMP)",
    cost: "$2,555-$3,305",
    salaryIncrease: "22% increase",
    paybackTime: "6 months",
    avgSalary: "$122,000",
  },
  {
    certification: "Cybersecurity (CISSP)",
    cost: "$749-$1,200",
    salaryIncrease: "$25,000-$35,000",
    paybackTime: "2-4 months",
    avgSalary: "$168,060",
  },
];

const WHY_OHACK = [
  {
    icon: <BusinessIcon fontSize="inherit" />,
    title: "Real Business Impact",
    body: "Lead projects with measurable outcomes for real nonprofits. Build a portfolio of business impact that demonstrates ROI to employers.",
  },
  {
    icon: <SchoolIcon fontSize="inherit" />,
    title: "Expert Mentorship",
    body: "Work with senior professionals from top companies. Get career guidance, skill feedback, and professional references.",
  },
  {
    icon: <TrophyIcon fontSize="inherit" />,
    title: "Accelerated Learning",
    body: "Compress years of learning into intensive weekend experiences. Apply skills immediately in a high-pressure, collaborative environment.",
  },
];

const SUCCESS_METRICS = [
  {
    value: "94%",
    label: "Career Advancement",
    body: "Of volunteers report faster promotion or job opportunities within 12 months",
  },
  {
    value: "$18K",
    label: "Average Salary Increase",
    body: "Annual compensation improvement within 18 months of volunteering",
  },
  {
    value: "87%",
    label: "Leadership Roles",
    body: "Move into team lead or management positions within 2 years",
  },
];

const SUCCESS_STORIES = [
  {
    name: "Alex, Project Manager",
    quote:
      "Led 4 hackathon projects as volunteer PM. Earned PMP certification and promoted to Senior PM within 8 months.",
    path: "Non-profit → Tech company PM",
  },
  {
    name: "Maria, Business Analyst",
    quote:
      "Mentored teams in requirements gathering. Transitioned from customer service to BA role at Fortune 500 company.",
    path: "Customer service → Business Analyst",
  },
  {
    name: "David, Team Lead",
    quote:
      "Coordinated cross-functional teams in 6 hackathons. Promoted to Engineering Team Lead with 8 direct reports.",
    path: "Developer → Engineering Team Lead",
  },
];

const card = {
  background: "var(--surface)",
  border: "1px solid var(--line)",
  borderRadius: 10,
  padding: "26px 24px",
};

const iconWrap = {
  fontSize: 26,
  color: "var(--brand)",
  display: "inline-flex",
  marginBottom: 14,
};

const bandStyle = {
  background: "var(--surface-2)",
  borderTop: "1px solid var(--line)",
  borderBottom: "1px solid var(--line)",
};

const sectionPad = {
  paddingTop: "clamp(48px, 8vh, 88px)",
  paddingBottom: "clamp(48px, 8vh, 88px)",
};

const ProfessionalDevelopmentVolunteering = () => {
  return (
    <>
      <Head>
        <title>
          Professional Development Volunteering 2026 - Build Career Skills |
          Opportunity Hack
        </title>
        <meta
          name="description"
          content="Accelerate your career with volunteer experience that builds essential soft skills. Gain leadership, project management, and communication skills employers value most."
        />
        <meta
          name="keywords"
          content="professional development volunteering, soft skills development, leadership volunteer opportunities, career advancement volunteering, volunteer experience resume"
        />
        <meta name="robots" content="index, follow" />
        <meta
          property="og:title"
          content="Professional Development Volunteering - Build Career-Accelerating Skills"
        />
        <meta
          property="og:description"
          content="Develop high-value soft skills through meaningful volunteer work. Leadership, project management, and communication experience that employers reward with 20-50% salary premiums."
        />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={CANONICAL} />
        <meta property="og:image" content={HERO_PHOTO} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Professional Development Volunteering 2026"
        />
        <meta
          name="twitter:description"
          content="Build career-accelerating soft skills through volunteer experience. Leadership and project management opportunities with measurable ROI."
        />
        <meta name="twitter:image" content={HERO_PHOTO} />
        <link rel="canonical" href={CANONICAL} />
      </Head>

      <RefinedRoot>
        {/* ---------------- HERO ---------------- */}
        <section
          className="ohx-wrap"
          style={{
            paddingTop: "clamp(104px, 13vh, 156px)",
            paddingBottom: "clamp(28px, 5vh, 48px)",
          }}
        >
          <Eyebrow>
            <span className="rise" style={{ display: "inline-block" }}>
              Volunteer · professional development
            </span>
          </Eyebrow>
          <h1
            className="ohx-display rise"
            style={{ marginTop: 18, maxWidth: "18ch", animationDelay: "60ms" }}
          >
            Professional development volunteering that{" "}
            <span className="ohx-italic">employers reward.</span>
          </h1>
          <p
            className="ohx-lead rise"
            style={{ marginTop: 22, animationDelay: "150ms", maxWidth: "62ch" }}
          >
            Build career-accelerating soft skills that employers reward with
            20-50% salary premiums. Lead real projects for real nonprofits and
            come away with leadership, project management, and communication
            experience you can point to.
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
            <Link href="/hack" className="ohx-btn ohx-btn--primary">
              Volunteer at the next event <Arrow />
            </Link>
            <Link
              href="/about/hackers/software-engineering-career-path"
              className="ohx-btn ohx-btn--ghost"
            >
              AI-proof career skills
            </Link>
          </div>

          <hr
            className="ohx-rule rise"
            style={{ marginTop: 52, animationDelay: "300ms" }}
          />
          <div
            className="rise"
            style={{
              marginTop: 28,
              display: "grid",
              gap: "24px clamp(28px, 6vw, 64px)",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              animationDelay: "360ms",
            }}
          >
            {CAREER_STATS.map((stat) => (
              <div
                key={stat.label}
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <span
                  className="ohx-display"
                  style={{
                    fontSize: "clamp(18px,2.4vw,25px)",
                    fontWeight: 500,
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </span>
                <span
                  className="ohx-eyebrow"
                  style={{ letterSpacing: "0.14em", fontSize: "8px" }}
                >
                  {stat.label}
                </span>
                <span
                  className="ohx-faint"
                  style={{ fontSize: "0.82rem", lineHeight: 1.4 }}
                >
                  {stat.subtext}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- HERO PHOTO ---------------- */}
        <section
          className="ohx-wrap"
          style={{ paddingBottom: "clamp(32px, 6vh, 56px)" }}
        >
          <figure
            className="rise"
            style={{ margin: 0, animationDelay: "420ms" }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "16 / 9",
                borderRadius: 10,
                overflow: "hidden",
                border: "1px solid var(--line)",
                background: "var(--surface-2)",
              }}
            >
              <Image
                src={HERO_PHOTO}
                alt="Volunteers collaborating in teams at an Opportunity Hack hackathon"
                fill
                priority
                sizes="(max-width: 1120px) 100vw, 1120px"
                style={{ objectFit: "cover" }}
              />
            </div>
            <figcaption
              className="ohx-faint"
              style={{ marginTop: 10, fontSize: "0.82rem" }}
            >
              Opportunity Hack · Fall 2025 · Arizona State University. Teams
              scope, build, and ship for a nonprofit in one weekend.
            </figcaption>
          </figure>
        </section>

        {/* ---------------- MOST VALUABLE SOFT SKILLS ---------------- */}
        <section style={bandStyle}>
          <div className="ohx-wrap" style={sectionPad}>
            <Eyebrow>Most valuable soft skills for 2026</Eyebrow>
            <h2
              className="ohx-display"
              style={{ marginTop: 8, marginBottom: 10 }}
            >
              The skills that move your salary
            </h2>
            <p
              className="ohx-muted"
              style={{ marginTop: 0, marginBottom: 32, maxWidth: "64ch" }}
            >
              Technical skills get you in the door. These four are what
              employers pay a premium for once you&apos;re in.
            </p>
            <div
              style={{
                display: "grid",
                gap: 20,
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              }}
            >
              {SOFT_SKILLS.map((s) => (
                <div key={s.skill} style={card}>
                  <span style={iconWrap}>{s.icon}</span>
                  <h3
                    className="ohx-display"
                    style={{ fontSize: "1.2rem", margin: "0 0 6px" }}
                  >
                    {s.skill}
                  </h3>
                  <p
                    className="ohx-display"
                    style={{
                      margin: "0 0 10px",
                      fontSize: "1.3rem",
                      color: "var(--brand)",
                    }}
                  >
                    {s.salaryBoost}{" "}
                    <span
                      className="ohx-faint"
                      style={{
                        fontFamily: "var(--body)",
                        fontSize: "0.85rem",
                      }}
                    >
                      salary boost
                    </span>
                  </p>
                  <p
                    className="ohx-muted"
                    style={{
                      margin: "0 0 14px",
                      fontSize: "0.95rem",
                      lineHeight: 1.55,
                    }}
                  >
                    {s.description}
                  </p>
                  <span className="ohx-tag">{s.demandRank}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- SKILLS YOU'LL DEVELOP ---------------- */}
        <section className="ohx-wrap" style={sectionPad}>
          <Eyebrow>Skills you&apos;ll develop through Opportunity Hack</Eyebrow>
          <h2
            className="ohx-display"
            style={{ marginTop: 8, marginBottom: 10 }}
          >
            What a weekend of volunteering actually teaches
          </h2>
          <p
            className="ohx-muted"
            style={{ marginTop: 0, marginBottom: 32, maxWidth: "64ch" }}
          >
            Every hackathon team runs like a small product team, so you practice
            the whole job, not just the coding.
          </p>
          <div
            style={{
              display: "grid",
              gap: 20,
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            }}
          >
            {VOLUNTEER_SKILLS.map((group) => (
              <div key={group.category} style={card}>
                <h3
                  className="ohx-display"
                  style={{ fontSize: "1.2rem", margin: "0 0 12px" }}
                >
                  {group.category}
                </h3>
                <ul
                  style={{
                    margin: 0,
                    padding: 0,
                    listStyle: "none",
                    display: "grid",
                    gap: 6,
                  }}
                >
                  {group.skills.map((skill) => (
                    <li
                      key={skill}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "baseline",
                        fontSize: "0.95rem",
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{ color: "var(--accent)", fontWeight: 700 }}
                      >
                        ·
                      </span>
                      {skill}
                    </li>
                  ))}
                </ul>
                <hr className="ohx-rule" style={{ margin: "16px 0 12px" }} />
                <span className="ohx-eyebrow">Real-world value</span>
                <p
                  className="ohx-muted"
                  style={{
                    margin: "6px 0 0",
                    fontSize: "0.92rem",
                    lineHeight: 1.55,
                  }}
                >
                  {group.realWorldValue}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- CERTIFICATION ROI ---------------- */}
        <section style={bandStyle}>
          <div className="ohx-wrap" style={sectionPad}>
            <Eyebrow>Strategic certification ROI</Eyebrow>
            <h2
              className="ohx-display"
              style={{ marginTop: 8, marginBottom: 10 }}
            >
              Pair volunteer experience with a certification
            </h2>
            <p
              className="ohx-muted"
              style={{ marginTop: 0, marginBottom: 32, maxWidth: "64ch" }}
            >
              Combine volunteer experience with strategic certifications for
              maximum career impact.
            </p>
            <div
              style={{
                display: "grid",
                gap: 20,
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              }}
            >
              {CERTIFICATION_ROI.map((cert) => (
                <div key={cert.certification} style={card}>
                  <h3
                    className="ohx-display"
                    style={{ fontSize: "1.2rem", margin: "0 0 14px" }}
                  >
                    {cert.certification}
                  </h3>
                  <dl
                    style={{
                      margin: 0,
                      display: "grid",
                      gridTemplateColumns: "auto 1fr",
                      gap: "6px 14px",
                      fontSize: "0.92rem",
                    }}
                  >
                    <dt className="ohx-faint">Investment</dt>
                    <dd style={{ margin: 0, fontWeight: 600 }}>{cert.cost}</dd>
                    <dt className="ohx-faint">Salary increase</dt>
                    <dd style={{ margin: 0, fontWeight: 600 }}>
                      {cert.salaryIncrease}
                    </dd>
                    <dt className="ohx-faint">Payback</dt>
                    <dd style={{ margin: 0, fontWeight: 600 }}>
                      {cert.paybackTime}
                    </dd>
                  </dl>
                  <hr className="ohx-rule" style={{ margin: "16px 0 12px" }} />
                  <p
                    className="ohx-display"
                    style={{
                      margin: 0,
                      fontSize: "1.5rem",
                      color: "var(--brand)",
                    }}
                  >
                    {cert.avgSalary}{" "}
                    <span
                      className="ohx-faint"
                      style={{
                        fontFamily: "var(--body)",
                        fontSize: "0.85rem",
                      }}
                    >
                      avg salary
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- WHY OPPORTUNITY HACK ---------------- */}
        <section className="ohx-wrap" style={sectionPad}>
          <Eyebrow>Why Opportunity Hack accelerates your career</Eyebrow>
          <h2
            className="ohx-display"
            style={{ marginTop: 8, marginBottom: 32 }}
          >
            Real stakes, senior mentors, compressed time
          </h2>
          <div
            style={{
              display: "grid",
              gap: 20,
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            }}
          >
            {WHY_OHACK.map((w) => (
              <div key={w.title} style={card}>
                <span style={iconWrap}>{w.icon}</span>
                <h3
                  className="ohx-display"
                  style={{ fontSize: "1.2rem", margin: "0 0 8px" }}
                >
                  {w.title}
                </h3>
                <p
                  className="ohx-muted"
                  style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.55 }}
                >
                  {w.body}
                </p>
              </div>
            ))}
          </div>

          <h3
            className="ohx-display"
            style={{ fontSize: "1.3rem", marginTop: 44, marginBottom: 16 }}
          >
            Volunteer success metrics
          </h3>
          <div
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            }}
          >
            {SUCCESS_METRICS.map((m) => (
              <div
                key={m.label}
                style={{
                  ...card,
                  background: "var(--surface-2)",
                  padding: "22px 22px",
                }}
              >
                <p
                  className="ohx-display"
                  style={{
                    margin: 0,
                    fontSize: "2rem",
                    lineHeight: 1,
                    color: "var(--brand)",
                  }}
                >
                  {m.value}
                </p>
                <p
                  style={{
                    margin: "10px 0 4px",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                  }}
                >
                  {m.label}
                </p>
                <p
                  className="ohx-muted"
                  style={{ margin: 0, fontSize: "0.88rem", lineHeight: 1.5 }}
                >
                  {m.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- SUCCESS STORIES ---------------- */}
        <section style={bandStyle}>
          <div className="ohx-wrap" style={sectionPad}>
            <Eyebrow>Volunteer success stories</Eyebrow>
            <h2
              className="ohx-display"
              style={{ marginTop: 8, marginBottom: 32 }}
            >
              Where volunteering took them
            </h2>
            <div
              style={{
                display: "grid",
                gap: 20,
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              }}
            >
              {SUCCESS_STORIES.map((s) => (
                <figure key={s.name} style={{ ...card, margin: 0 }}>
                  <blockquote
                    style={{
                      margin: 0,
                      padding: "2px 0 2px 16px",
                      borderLeft: "2px solid var(--accent)",
                      fontSize: "0.98rem",
                      lineHeight: 1.6,
                    }}
                  >
                    &ldquo;{s.quote}&rdquo;
                  </blockquote>
                  <figcaption style={{ marginTop: 16 }}>
                    <span
                      className="ohx-display"
                      style={{ display: "block", fontSize: "1.05rem" }}
                    >
                      {s.name}
                    </span>
                    <span
                      className="ohx-tag"
                      style={{ marginTop: 8, display: "inline-flex" }}
                    >
                      {s.path}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- FINAL CTA ---------------- */}
        <section className="ohx-wrap" style={sectionPad}>
          <div
            className="ohx-card"
            style={{
              padding: "clamp(28px, 5vw, 48px)",
              background: "var(--brand)",
              borderColor: "var(--brand)",
              color: "#fff",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 24,
            }}
          >
            <div style={{ maxWidth: "58ch" }}>
              <p
                className="ohx-eyebrow"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                Ready to accelerate your career?
              </p>
              <h2
                className="ohx-display"
                style={{ marginTop: 8, color: "#fff" }}
              >
                Build the skills employers reward
              </h2>
              <p
                style={{
                  margin: "12px 0 0",
                  fontSize: "0.98rem",
                  lineHeight: 1.6,
                  color: "rgba(255,255,255,0.85)",
                }}
              >
                Join professionals who are building career-defining skills
                through meaningful volunteer work. Develop leadership, project
                management, and communication abilities that employers reward.
              </p>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                alignItems: "flex-start",
              }}
            >
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link
                  href="/hack"
                  className="ohx-btn"
                  style={{ background: "#fff", color: "var(--brand)" }}
                >
                  Volunteer at the next event <Arrow />
                </Link>
                <Link
                  href="/about/hackers/software-engineering-career-path"
                  className="ohx-btn ohx-btn--ghost"
                  style={{
                    color: "#fff",
                    borderColor: "rgba(255,255,255,0.5)",
                  }}
                >
                  AI-proof career skills
                </Link>
              </div>
              <Link
                href="/about"
                className="ohx-link"
                style={{
                  color: "#fff",
                  fontSize: "0.92rem",
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.8), rgba(255,255,255,0.8))",
                }}
              >
                Learn more about us <Arrow />
              </Link>
            </div>
          </div>
        </section>
      </RefinedRoot>
    </>
  );
};

export default ProfessionalDevelopmentVolunteering;
