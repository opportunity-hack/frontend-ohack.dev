import React, { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import {
  ForumRounded,
  SupportAgentRounded,
  EventAvailableRounded,
  Diversity3Rounded,
  SchoolRounded,
} from "@mui/icons-material";
import { initFacebookPixel, trackEvent } from "../../lib/ga";
import { useEnv } from "../../context/env.context";
import {
  RefinedRoot,
  RefinedFonts,
  Eyebrow,
  Stat,
  Arrow,
} from "../../components/design/refined";

const BENEFITS = [
  {
    icon: <ForumRounded />,
    title: "Meet your people",
    desc: "Connect with developers, designers, and data folks who care about social impact.",
  },
  {
    icon: <SupportAgentRounded />,
    title: "Get unstuck fast",
    desc: "Real-time help on your nonprofit project from people who've shipped before.",
  },
  {
    icon: <EventAvailableRounded />,
    title: "Never miss an event",
    desc: "Be first to hear about hackathons, workshops, and volunteer opportunities.",
  },
  {
    icon: <Diversity3Rounded />,
    title: "Build real things",
    desc: "Collaborate on solutions that nonprofits actually deploy and use.",
  },
  {
    icon: <SchoolRounded />,
    title: "Teach and learn",
    desc: "Share what you know — and pick up new skills from the community.",
  },
];

const STEPS = [
  {
    title: "Tap “Join on Slack”",
    desc: "It opens our community sign-up in a new tab.",
  },
  {
    title: "Sign in your way",
    desc: "Use Google, Apple, or your email address.",
  },
  {
    title: "Set up your profile",
    desc: "Add your name and an optional photo so people know who you are.",
  },
  {
    title: "Say hello",
    desc: "Introduce yourself in #introductions — and you’re in.",
  },
];

const STATS = [
  { value: "5,000+", label: "Members" },
  { value: "300+", label: "Nonprofits helped" },
  { value: "Since 2013", label: "Code for good" },
];

export default function Signup() {
  const router = useRouter();
  const previousPage = router.query.previousPage;
  const { slackSignupUrl } = useEnv();

  useEffect(() => {
    initFacebookPixel();
  }, []);

  const handleSignupClick = (label) => {
    trackEvent({
      action: "CompleteRegistration",
      params: { event_label: label, page: "signup" },
    });
  };

  return (
    <>
      <Head>
        <title>
          Join Opportunity Hack: Connect, Collaborate, and Code for Good
        </title>
        <meta
          name="description"
          content="Sign up for Opportunity Hack's community. Connect with developers, collaborate on nonprofit projects, and make a positive impact through technology."
        />
        <meta
          name="keywords"
          content="Opportunity Hack, community signup, tech volunteering, nonprofit coding, developer community, Slack"
        />
        <meta
          property="og:title"
          content="Join Opportunity Hack: Connect, Collaborate, and Code for Good"
        />
        <meta
          property="og:description"
          content="Sign up for Opportunity Hack's community. Connect with developers, collaborate on nonprofit projects, and make a positive impact through technology."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.ohack.dev/signup" />
        <meta
          property="og:image"
          content="https://cdn.ohack.dev/ohack.dev/2023_hackathon_3.webp"
        />
        <link rel="canonical" href="https://www.ohack.dev/signup" />
        <RefinedFonts />
      </Head>

      <RefinedRoot>
        {/* HERO */}
        <section
          className="ohx-wrap"
          style={{
            paddingTop: "clamp(104px, 13vh, 156px)",
            paddingBottom: "clamp(28px, 5vh, 44px)",
          }}
        >
          <Eyebrow>
            <span className="rise" style={{ display: "inline-block" }}>
              Join the community
            </span>
          </Eyebrow>
          <h1
            className="ohx-display rise"
            style={{ marginTop: 18, maxWidth: "15ch", animationDelay: "60ms" }}
          >
            Connect, collaborate, and{" "}
            <span className="ohx-italic">code for good.</span>
          </h1>
          <p
            className="ohx-lead rise"
            style={{ marginTop: 22, animationDelay: "150ms", maxWidth: "58ch" }}
          >
            Join our Slack community to build alongside developers who care, get
            help on your nonprofit projects, and hear about every upcoming
            hackathon.
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
            <a
              href={slackSignupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ohx-btn ohx-btn--primary"
              onClick={() => handleSignupClick("hero")}
            >
              Join on Slack <Arrow />
            </a>
            {previousPage ? (
              <Link href={previousPage} className="ohx-btn ohx-btn--ghost">
                Return to where you were
              </Link>
            ) : (
              <Link href="/hack" className="ohx-btn ohx-btn--ghost">
                See upcoming events
              </Link>
            )}
          </div>
          <hr
            className="ohx-rule rise"
            style={{ marginTop: 48, animationDelay: "320ms" }}
          />
          <div
            className="rise"
            style={{
              marginTop: 26,
              display: "flex",
              flexWrap: "wrap",
              gap: "clamp(32px, 6vw, 80px)",
              animationDelay: "380ms",
            }}
          >
            {STATS.map((s) => (
              <Stat key={s.label} value={s.value} label={s.label} />
            ))}
          </div>
        </section>

        {/* WHY JOIN */}
        <section
          style={{
            background: "var(--surface-2)",
            borderTop: "1px solid var(--line)",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <div
            className="ohx-wrap"
            style={{
              paddingTop: "clamp(48px, 7vh, 80px)",
              paddingBottom: "clamp(48px, 7vh, 80px)",
            }}
          >
            <Eyebrow>Why join</Eyebrow>
            <h2
              className="ohx-display"
              style={{ marginTop: 8, marginBottom: 10 }}
            >
              What you get
            </h2>
            <p
              className="ohx-muted"
              style={{ marginTop: 0, marginBottom: 28, maxWidth: "56ch" }}
            >
              A welcoming, year-round community of technologists using their
              skills for social good.
            </p>
            <div
              style={{
                display: "grid",
                gap: 20,
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              }}
            >
              {BENEFITS.map((b) => (
                <div
                  key={b.title}
                  className="ohx-card"
                  style={{ padding: "24px", background: "var(--surface)" }}
                >
                  <span
                    style={{
                      color: "var(--accent)",
                      display: "inline-flex",
                      fontSize: "1.8rem",
                    }}
                    aria-hidden="true"
                  >
                    {b.icon}
                  </span>
                  <h3
                    className="ohx-display"
                    style={{ fontSize: "1.2rem", marginTop: 14 }}
                  >
                    {b.title}
                  </h3>
                  <p
                    className="ohx-muted"
                    style={{
                      margin: "8px 0 0",
                      fontSize: "0.95rem",
                      lineHeight: 1.55,
                    }}
                  >
                    {b.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW TO JOIN */}
        <section
          className="ohx-wrap"
          style={{
            paddingTop: "clamp(48px, 7vh, 80px)",
            paddingBottom: "clamp(48px, 7vh, 80px)",
          }}
        >
          <Eyebrow>Getting started</Eyebrow>
          <h2
            className="ohx-display"
            style={{ marginTop: 8, marginBottom: 28 }}
          >
            How to join, in <span className="ohx-italic">four steps.</span>
          </h2>
          <div
            style={{
              display: "grid",
              gap: "clamp(28px, 5vw, 56px)",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              alignItems: "center",
            }}
          >
            <ol
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              {STEPS.map((step, i) => (
                <li
                  key={step.title}
                  style={{ display: "flex", gap: 16, alignItems: "flex-start" }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      flexShrink: 0,
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background: "var(--brand)",
                      color: "#fff",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--display)",
                      fontWeight: 600,
                      fontSize: "1.05rem",
                      marginTop: 2,
                    }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="ohx-display" style={{ fontSize: "1.15rem" }}>
                      {step.title}
                    </h3>
                    <p
                      className="ohx-muted"
                      style={{
                        margin: "4px 0 0",
                        fontSize: "0.95rem",
                        lineHeight: 1.55,
                      }}
                    >
                      {step.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <div
              style={{
                border: "1px solid var(--line)",
                borderRadius: 10,
                overflow: "hidden",
                background: "var(--surface)",
                lineHeight: 0,
              }}
            >
              <Image
                src="/join_slack_1.png"
                width={797}
                height={607}
                alt="The Opportunity Hack Slack sign-up screen, where you can sign in with Google, Apple, or email"
                style={{ width: "100%", height: "auto" }}
                sizes="(max-width: 760px) 100vw, 540px"
              />
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section style={{ background: "var(--brand)", color: "#fff" }}>
          <div
            className="ohx-wrap"
            style={{
              paddingTop: "clamp(48px, 7vh, 88px)",
              paddingBottom: "clamp(48px, 7vh, 88px)",
              textAlign: "center",
            }}
          >
            <h2 className="ohx-display" style={{ color: "#fff" }}>
              Ready to jump in?
            </h2>
            <p
              style={{
                margin: "14px auto 28px",
                maxWidth: "48ch",
                color: "rgba(255,255,255,0.85)",
                fontSize: "1.05rem",
              }}
            >
              It’s free, it takes a minute, and you’ll be welcomed by thousands
              of people who code for good.
            </p>
            <div
              style={{
                display: "flex",
                gap: 14,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <a
                href={slackSignupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ohx-btn"
                style={{ background: "#fff", color: "var(--brand)" }}
                onClick={() => handleSignupClick("final_cta")}
              >
                Join on Slack <Arrow />
              </a>
              <Link
                href="/volunteer"
                className="ohx-btn ohx-btn--ghost"
                style={{ color: "#fff", borderColor: "rgba(255,255,255,0.5)" }}
              >
                Explore ways to help
              </Link>
            </div>
          </div>
        </section>
      </RefinedRoot>
    </>
  );
}
