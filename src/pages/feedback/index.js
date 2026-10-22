import React from "react";
import Head from "next/head";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useAuthInfo } from "@propelauth/react";
import {
  RefinedPage,
  PageMasthead,
  CtaBand,
} from "../../components/design/RefinedPage";
import { Eyebrow } from "../../components/design/refined";

const LoginOrRegister = dynamic(
  () => import("../../components/LoginOrRegister/LoginOrRegister2"),
  {
    ssr: false,
    loading: () => <div style={{ minHeight: 120 }} />,
  },
);

const FEEDBACK_AREAS = [
  "Role-specific skills (coding, design, project management)",
  "Soft skills like communication and teamwork",
  "Overall performance and impact",
  "Areas of excellence and improvement",
  "Personalized growth recommendations",
];

const STEPS = [
  "Participate in an Opportunity Hack event",
  "Receive feedback from mentors, peers, and nonprofit partners",
  "Open your personal feedback dashboard",
  "Review the insights and set goals for improvement",
  "Track your progress across events",
];

const cardStyle = { padding: 22 };

export default function FeedbackPage() {
  const { user } = useAuthInfo();

  return (
    <>
      <Head>
        <title>Opportunity Hack Feedback System | Grow Your Tech Skills</title>
        <meta
          name="description"
          content="Discover how Opportunity Hack's unique feedback system helps developers, designers, and project managers grow their skills and advance their careers in tech."
        />
        <meta
          name="keywords"
          content="Opportunity Hack, feedback system, skill development, tech careers, software engineering, product management"
        />
        <meta
          property="og:title"
          content="Opportunity Hack Feedback System | Grow Your Tech Skills"
        />
        <meta
          property="og:description"
          content="Get personalized feedback on your tech skills and grow your career with Opportunity Hack's unique feedback system."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.ohack.dev/feedback" />
        <meta
          property="og:image"
          content="https://cdn.ohack.dev/ohack.dev/2024_hackathon_4.webp"
        />
        <link rel="canonical" href="https://www.ohack.dev/feedback" />
      </Head>

      <RefinedPage>
        <PageMasthead
          eyebrow="Feedback system"
          title="Grow your tech skills with"
          italic="personalized insights."
          lead="At Opportunity Hack, we believe in the power of feedback to drive personal and professional growth. Our feedback system sets us apart from other hackathons by giving participants detailed, actionable insights to help them excel in their tech careers."
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
          <section
            className="ohx-card"
            style={cardStyle}
            aria-labelledby="special-heading"
          >
            <Eyebrow>What you get feedback on</Eyebrow>
            <h2
              id="special-heading"
              className="ohx-display"
              style={{ fontSize: 22, marginTop: 8 }}
            >
              Specific, not generic.
            </h2>
            <ul
              style={{
                margin: "12px 0 0",
                paddingLeft: 20,
                fontSize: 15.5,
                lineHeight: 1.6,
              }}
            >
              {FEEDBACK_AREAS.map((area) => (
                <li key={area} style={{ marginBottom: 4 }}>
                  {area}
                </li>
              ))}
            </ul>
          </section>

          <section
            className="ohx-card"
            style={cardStyle}
            aria-labelledby="how-heading"
          >
            <Eyebrow>How it works</Eyebrow>
            <h2
              id="how-heading"
              className="ohx-display"
              style={{ fontSize: 22, marginTop: 8 }}
            >
              Five steps.
            </h2>
            <ol
              style={{
                margin: "12px 0 0",
                paddingLeft: 20,
                fontSize: 15.5,
                lineHeight: 1.6,
              }}
            >
              {STEPS.map((step) => (
                <li key={step} style={{ marginBottom: 4 }}>
                  {step}
                </li>
              ))}
            </ol>
          </section>
        </div>

        <section style={{ marginTop: 48 }} aria-labelledby="access-heading">
          <Eyebrow>Accessing and providing feedback</Eyebrow>
          <h2
            id="access-heading"
            className="ohx-display"
            style={{ marginTop: 8 }}
          >
            View yours, send theirs.
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
              gap: 20,
              marginTop: 20,
            }}
          >
            <div className="ohx-card" style={cardStyle}>
              <h3 className="ohx-display" style={{ fontSize: 19 }}>
                View your feedback
              </h3>
              <p
                style={{
                  margin: "6px 0 14px",
                  fontSize: 14.5,
                  color: "var(--muted)",
                  lineHeight: 1.55,
                }}
              >
                Everything people have shared about your work, with skill scores
                and comments, lives on your feedback dashboard.
              </p>
              <Link href="/myfeedback" className="ohx-btn ohx-btn--primary">
                Your feedback
              </Link>
            </div>
            <div className="ohx-card" style={cardStyle}>
              <h3 className="ohx-display" style={{ fontSize: 19 }}>
                Send feedback
              </h3>
              <p
                style={{
                  margin: "6px 0 14px",
                  fontSize: 14.5,
                  color: "var(--muted)",
                  lineHeight: 1.55,
                }}
              >
                To give feedback to someone you worked with, use the personal
                feedback link on your profile page.
              </p>
              <Link href="/profile" className="ohx-btn ohx-btn--ghost">
                Your profile
              </Link>
            </div>
          </div>
        </section>

        <section
          style={{ marginTop: 48, maxWidth: "70ch" }}
          aria-labelledby="why-heading"
        >
          <Eyebrow>Why it matters</Eyebrow>
          <h2 id="why-heading" className="ohx-display" style={{ marginTop: 8 }}>
            Continuous learning, from people who shipped with you.
          </h2>
          <p style={{ margin: "12px 0 0", fontSize: 16.5, lineHeight: 1.65 }}>
            In the fast-paced world of technology, continuous learning is key to
            success. Opportunity Hack's feedback system provides:
          </p>
          <ul
            style={{
              margin: "10px 0 0",
              paddingLeft: 20,
              fontSize: 15.5,
              lineHeight: 1.6,
            }}
          >
            <li>Real-world insights from industry professionals</li>
            <li>A holistic view of your technical and soft skills</li>
            <li>Actionable advice for career advancement</li>
            <li>A unique differentiator for your résumé and portfolio</li>
          </ul>
        </section>

        {user ? (
          <CtaBand
            eyebrow="Your dashboard"
            title="See what your teammates and mentors said."
            primary={{
              href: "/myfeedback",
              label: "View your feedback dashboard",
            }}
            secondary={{ href: "/hack", label: "Find upcoming events" }}
          />
        ) : (
          <div style={{ marginTop: 48, maxWidth: 720 }}>
            <h2 className="ohx-display" style={{ fontSize: 24 }}>
              Ready to start your growth journey?
            </h2>
            <div style={{ marginTop: 12 }}>
              <LoginOrRegister introText="Sign up or log in to access your personalized feedback and accelerate your tech career." />
            </div>
            <div style={{ marginTop: 20 }}>
              <Link href="/hack" className="ohx-link">
                Find upcoming events{" "}
                <span className="ohx-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </div>
          </div>
        )}
      </RefinedPage>
    </>
  );
}
