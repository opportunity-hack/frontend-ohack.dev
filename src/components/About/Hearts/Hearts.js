import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import GavelRounded from "@mui/icons-material/GavelRounded";
import SchoolRounded from "@mui/icons-material/SchoolRounded";
import { RefinedRoot, Eyebrow, Stat, Arrow } from "../../design/refined";
import { CtaBand } from "../../design/RefinedPage";
import RewardStructure from "./RewardStructure";
import { initFacebookPixel, trackEvent } from "../../../lib/ga";
import { TIERS, HEART_CATEGORIES } from "../../../lib/heartTiers";

/*
 * /about/hearts — public explainer for the Hearts recognition system.
 * Civic-editorial design: one <h1>, alternating paper / --surface-2 bands,
 * hairline cards, navy primary + terracotta accent only. Tiers and heart
 * categories come from src/lib/heartTiers.js (single source of truth, shared
 * with the profile Hearts tab and /community-champions) — never re-list them
 * here. Page title/description/OG come from the page's getStaticProps via
 * _app.js, so this component renders no <Head>.
 *
 * All subcomponents are module-scope (defining them inside the render body
 * remounts them on every render).
 */

// Browser-only embed; module-scope so the dynamic component isn't re-created
// on every render. Reserved height keeps CLS at zero while it loads.
const InstagramEmbed = dynamic(
  () => import("react-social-media-embed").then((mod) => mod.InstagramEmbed),
  {
    ssr: false,
    loading: () => <div style={{ minHeight: 480 }} aria-hidden="true" />,
  },
);

const track = (button) =>
  trackEvent({ action: "click_hearts", params: { button } });

const STEPS = [
  {
    title: "Choose a project",
    text: "Browse open-source projects for nonprofits and pick one that matches your skills.",
  },
  {
    title: "Contribute",
    text: "Write code, design interfaces, gather requirements, or manage tasks. Every role counts.",
  },
  {
    title: "Earn hearts",
    text: "The more impactful your contribution, the more hearts you earn per category.",
  },
  {
    title: "Level up",
    text: "Advance from Bronze to Diamond, unlocking rewards and recognition along the way.",
  },
];

const EVENT_ROLES = [
  {
    href: "/about/judges",
    title: "Judging",
    body: "Score projects at an event and earn 1 heart per 3-hour block.",
    Icon: GavelRounded,
    ga: "judges",
  },
  {
    href: "/about/mentors",
    title: "Mentoring",
    body: "Guide a team through the weekend and earn 1 heart per 3-hour block.",
    Icon: SchoolRounded,
    ga: "mentors",
  },
];

const REFERENCES = [
  {
    href: "https://docs.google.com/document/d/1J-1o5YOpdt4slyd_PxitNN0gZe7UcI1GjyTbhTem2qU/edit?usp=sharing",
    label: "Original RFC",
    ga: "original_rfc",
  },
  {
    href: "https://github.com/opportunity-hack/frontend-ohack.dev/issues/8",
    label: "GitHub issue #8",
    ga: "github_issue_8",
  },
  {
    href: "https://github.com/opportunity-hack/frontend-ohack.dev/issues/7",
    label: "GitHub issue #7",
    ga: "github_issue_7",
  },
];

const CERTIFICATE_IMG =
  "https://cdn.ohack.dev//certificates/certificate_4186886b2aca11a005b826c8e878e904e1e8224857771c21c12e05d83bbbe9e5.png";
const EVENT_PHOTO = "https://cdn.ohack.dev/ohack.dev/2024_hackathon_2.webp";

const sectionPad = {
  paddingTop: "clamp(48px, 8vh, 88px)",
  paddingBottom: "clamp(48px, 8vh, 88px)",
};
const band = {
  background: "var(--surface-2)",
  borderTop: "1px solid var(--line)",
  borderBottom: "1px solid var(--line)",
};

function TierDot({ color, size = 10 }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        border: "1px solid rgba(0,0,0,0.15)",
        display: "inline-block",
        flexShrink: 0,
      }}
    />
  );
}

function SectionHeading({ eyebrow, title, italic, lead }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="ohx-display" style={{ marginTop: 8, maxWidth: "26ch" }}>
        {title}
        {italic && (
          <>
            {" "}
            <span className="ohx-italic">{italic}</span>
          </>
        )}
      </h2>
      {lead && (
        <p
          className="ohx-muted"
          style={{ margin: "10px 0 0", maxWidth: "64ch", lineHeight: 1.6 }}
        >
          {lead}
        </p>
      )}
    </div>
  );
}

function StepCard({ index, title, text }) {
  return (
    <li
      className="ohx-card"
      style={{ padding: "22px 24px", listStyle: "none" }}
    >
      <span
        className="ohx-display"
        style={{ fontSize: "1.9rem", lineHeight: 1, color: "var(--accent)" }}
      >
        {String(index).padStart(2, "0")}
      </span>
      <h3
        className="ohx-display"
        style={{ fontSize: "1.15rem", margin: "12px 0 6px" }}
      >
        {title}
      </h3>
      <p
        className="ohx-muted"
        style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.55 }}
      >
        {text}
      </p>
    </li>
  );
}

function TierRow({ tier, isLast }) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px 20px",
        padding: "16px 22px",
        borderBottom: isLast ? "none" : "1px solid var(--line)",
      }}
    >
      <div style={{ flex: "1 1 200px", minWidth: 170 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <TierDot color={tier.color} />
          <span
            className="ohx-display"
            style={{ fontSize: "1.15rem", fontWeight: 600 }}
          >
            {tier.name}
          </span>
        </div>
        <div
          className="ohx-muted"
          style={{ fontSize: "0.85rem", marginTop: 2 }}
        >
          from {tier.minHearts} hearts
        </div>
      </div>
      <ul
        style={{ listStyle: "none", margin: 0, padding: 0, flex: "2 1 260px" }}
      >
        {tier.rewards.map((r) => (
          <li
            key={r.hearts}
            style={{
              display: "flex",
              gap: 10,
              alignItems: "baseline",
              padding: "3px 0",
            }}
          >
            <span
              className="ohx-faint"
              style={{ fontSize: "0.8rem", minWidth: 38, whiteSpace: "nowrap" }}
            >
              {r.hearts} ♥
            </span>
            <span>{r.reward}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CategoryCard({ eyebrow, title, items }) {
  return (
    <div className="ohx-card" style={{ padding: "22px 24px" }}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h3
        className="ohx-display"
        style={{ fontSize: "1.2rem", margin: "6px 0 10px" }}
      >
        {title}
      </h3>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {items.map(([key, label, description], i) => (
          <li
            key={key}
            style={{
              padding: "9px 0",
              borderTop: i === 0 ? "none" : "1px solid var(--line)",
            }}
          >
            <div style={{ fontWeight: 600 }}>{label}</div>
            {description && (
              <div
                className="ohx-muted"
                style={{ fontSize: "0.88rem", lineHeight: 1.5 }}
              >
                {description}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function RoleTile({ href, title, body, Icon, ga }) {
  return (
    <Link
      href={href}
      className="ohx-card ohx-card--hover"
      onClick={() => track(ga)}
      style={{
        display: "flex",
        gap: 16,
        alignItems: "flex-start",
        padding: "20px 22px",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <Icon
        sx={{ fontSize: 26, color: "var(--accent)", flexShrink: 0, mt: "2px" }}
      />
      <span>
        <span
          className="ohx-display"
          style={{ display: "block", fontSize: "1.15rem" }}
        >
          {title}
        </span>
        <span
          className="ohx-muted"
          style={{
            display: "block",
            fontSize: "0.95rem",
            lineHeight: 1.55,
            marginTop: 4,
          }}
        >
          {body}
        </span>
        <span
          className="ohx-link"
          style={{ marginTop: 10, fontSize: "0.9rem" }}
        >
          Learn more <Arrow />
        </span>
      </span>
    </Link>
  );
}

const Hearts = () => {
  useEffect(() => {
    initFacebookPixel();
  }, []);

  return (
    <RefinedRoot>
      {/* ---------------- HERO ---------------- */}
      <section
        className="ohx-wrap"
        style={{
          paddingTop: "clamp(104px, 12vh, 140px)",
          paddingBottom: "clamp(40px, 6vh, 64px)",
        }}
      >
        <Eyebrow>Recognition &amp; rewards</Eyebrow>
        <h1
          className="ohx-display rise"
          style={{ marginTop: 18, maxWidth: "18ch", animationDelay: "60ms" }}
        >
          Hearts: recognition for{" "}
          <span className="ohx-italic">work that ships.</span>
        </h1>
        <p
          className="ohx-lead rise"
          style={{ marginTop: 22, maxWidth: "62ch", animationDelay: "150ms" }}
        >
          Contribute your skills to open-source projects for nonprofits, earn
          hearts for what you build and how you build it, and move through five
          tiers of recognition, from Bronze to Diamond.
        </p>
        <div
          className="rise"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 14,
            marginTop: 30,
            animationDelay: "240ms",
          }}
        >
          <Link
            href="/community-champions"
            className="ohx-btn ohx-btn--primary"
            onClick={() => track("community_champions")}
          >
            See community champions <Arrow />
          </Link>
          <Link
            href="/about/completion"
            className="ohx-btn ohx-btn--ghost"
            onClick={() => track("project_completion")}
          >
            Project completion guide
          </Link>
        </div>
        <hr
          className="ohx-rule rise"
          style={{ marginTop: 52, animationDelay: "300ms" }}
        />
        <div
          className="rise"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "20px 48px",
            marginTop: 26,
            animationDelay: "360ms",
          }}
        >
          <Stat value="5" label="Tiers, Bronze to Diamond" />
          <Stat value="2" label="Hearts to reach Bronze" />
          <Stat value="0.5–2" label="Hearts per category" />
          <Stat value="1" label="Heart per 3-hour block judging or mentoring" />
        </div>
      </section>

      {/* ---------------- HOW IT WORKS ---------------- */}
      <section className="ohx-wrap" style={sectionPad}>
        <SectionHeading
          eyebrow="How it works"
          title="Four steps from newcomer to"
          italic="community champion."
        />
        <ol
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 20,
            margin: 0,
            padding: 0,
          }}
        >
          {STEPS.map((step, i) => (
            <StepCard
              key={step.title}
              index={i + 1}
              title={step.title}
              text={step.text}
            />
          ))}
        </ol>
      </section>

      {/* ---------------- TIER LADDER ---------------- */}
      <section style={band}>
        <div className="ohx-wrap" style={sectionPad}>
          <SectionHeading
            eyebrow="Tiers & rewards"
            title="Five tiers,"
            italic="one path."
            lead="Hearts add up across projects and events. Each tier unlocks a reward and community recognition, and you keep everything you earned on the way up."
          />
          <div
            className="ohx-card"
            style={{ overflow: "hidden", maxWidth: 820 }}
          >
            {TIERS.map((tier, i) => (
              <TierRow
                key={tier.name}
                tier={tier}
                isLast={i === TIERS.length - 1}
              />
            ))}
          </div>
          <p
            className="ohx-muted"
            style={{ marginTop: 22, fontSize: "0.95rem" }}
          >
            <Link
              href="/community-champions"
              className="ohx-link"
              onClick={() => track("community_champions_tier")}
            >
              See who has reached each tier <Arrow />
            </Link>
          </p>
        </div>
      </section>

      {/* ---------------- CATEGORIES ---------------- */}
      <section className="ohx-wrap" style={sectionPad}>
        <SectionHeading
          eyebrow="Types of contributions"
          title="Two dimensions:"
          italic="what you build and how you work."
          lead="Hearts are awarded per category in each dimension, so a thorough contributor can earn hearts in several places from a single project."
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 20,
          }}
        >
          <CategoryCard
            eyebrow="What you build"
            title="Outcomes"
            items={HEART_CATEGORIES.what}
          />
          <CategoryCard
            eyebrow="How you work"
            title="Practices"
            items={HEART_CATEGORIES.how}
          />
        </div>
      </section>

      {/* ---------------- SCORING GUIDE ---------------- */}
      <section style={band}>
        <div className="ohx-wrap" style={sectionPad}>
          <RewardStructure />
        </div>
      </section>

      {/* ---------------- JUDGE / MENTOR ---------------- */}
      <section className="ohx-wrap" style={sectionPad}>
        <SectionHeading
          eyebrow="At events"
          title="Earn hearts as a judge or"
          italic="mentor."
          lead="Beyond hacking, you can earn 1 heart per 3-hour block by judging or mentoring at an Opportunity Hack event."
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
            maxWidth: 820,
          }}
        >
          {EVENT_ROLES.map((role) => (
            <RoleTile key={role.href} {...role} />
          ))}
        </div>
      </section>

      {/* ---------------- RECOGNITION IN ACTION ---------------- */}
      <section style={band}>
        <div className="ohx-wrap" style={sectionPad}>
          <SectionHeading
            eyebrow="Recognition in action"
            title="What a heart looks like"
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 20,
              alignItems: "start",
            }}
          >
            <figure className="ohx-card" style={{ margin: 0, padding: 16 }}>
              <Image
                src={CERTIFICATE_IMG}
                width={400}
                height={300}
                alt="Example Opportunity Hack hearts certificate"
                style={{ width: "100%", height: "auto", borderRadius: 4 }}
              />
              <figcaption
                className="ohx-faint"
                style={{ marginTop: 10, fontSize: "0.85rem" }}
              >
                Example hearts certificate, earned at the Bronze tier.
              </figcaption>
            </figure>
            <figure className="ohx-card" style={{ margin: 0, padding: 16 }}>
              <div
                style={{
                  position: "relative",
                  aspectRatio: "4 / 3",
                  borderRadius: 4,
                  overflow: "hidden",
                  background: "var(--surface-2)",
                }}
              >
                <Image
                  src={EVENT_PHOTO}
                  fill
                  sizes="(max-width: 640px) 100vw, 360px"
                  alt="Volunteers collaborating at Opportunity Hack 2024"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <figcaption
                className="ohx-faint"
                style={{ marginTop: 10, fontSize: "0.85rem" }}
              >
                Volunteers earning hearts at Opportunity Hack 2024.
              </figcaption>
            </figure>
            <figure className="ohx-card" style={{ margin: 0, padding: 16 }}>
              <div
                style={{ minHeight: 480, maxWidth: 400, marginInline: "auto" }}
              >
                <InstagramEmbed
                  url="https://www.instagram.com/p/CoupvGxuiLX/"
                  maxWidth={400}
                  height={480}
                />
              </div>
              <figcaption
                className="ohx-faint"
                style={{ marginTop: 10, fontSize: "0.85rem" }}
              >
                Shout-outs on Instagram, a Bronze-tier reward.
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* ---------------- REFERENCES + CTA ---------------- */}
      <section className="ohx-wrap" style={sectionPad}>
        <Eyebrow>Where this came from</Eyebrow>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px 24px",
            marginTop: 10,
          }}
        >
          {REFERENCES.map((ref) => (
            <a
              key={ref.href}
              href={ref.href}
              target="_blank"
              rel="noopener noreferrer"
              className="ohx-link"
              onClick={() => track(ref.ga)}
              style={{ fontSize: "0.95rem" }}
            >
              {ref.label} <Arrow />
            </a>
          ))}
        </div>
        <CtaBand
          eyebrow="Get started"
          title="Ready to start earning hearts?"
          body="Pick a nonprofit project, ship something real, and our team recognizes the work. Already contributing? Your hearts and tier live on your profile."
          primary={{ href: "/projects", label: "Browse open projects" }}
          secondary={{ href: "/profile#hearts", label: "Check your hearts" }}
        />
      </section>
    </RefinedRoot>
  );
};

export default Hearts;
