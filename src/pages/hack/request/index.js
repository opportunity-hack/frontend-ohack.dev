import React, { useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  SchoolRounded,
  BusinessRounded,
  Diversity3Rounded,
  FavoriteBorderRounded,
  GroupsRounded,
  HandshakeRounded,
  AutoStoriesRounded,
} from "@mui/icons-material";
import HackathonRequestForm from "../../../components/HackathonRequest";
import { initFacebookPixel, event as gaEvent } from "../../../lib/ga";
import {
  RefinedRoot,
  RefinedFonts,
  Eyebrow,
  Stat,
  Arrow,
} from "../../../components/design/refined";

const STATS = [
  { value: "50+", label: "Events hosted" },
  { value: "300+", label: "Nonprofit solutions" },
  { value: "Since 2013", label: "Code for good" },
];

// Sets expectations up front — especially for first-time student organizers
// who worry the form is a commitment. It isn't; it starts a conversation.
const HOW_IT_WORKS = [
  {
    title: "Tell us about your event",
    desc: "Fill out the short form below — about five minutes. No budget or nonprofits lined up yet? That's completely fine.",
  },
  {
    title: "We hop on a quick call",
    desc: "We'll reach out to talk through your goals, your timeline, and where you'd like a hand.",
  },
  {
    title: "We help you run it",
    desc: "Mentors, judges, our nonprofit network, and a battle-tested playbook — so you're never figuring it out alone.",
  },
];

const BENEFITS = [
  {
    icon: <FavoriteBorderRounded />,
    title: "Real, lasting impact",
    desc: "Your participants build software nonprofits actually deploy — not throwaway demos.",
  },
  {
    icon: <GroupsRounded />,
    title: "Community & leadership",
    desc: "Bring your campus or team together and give organizers a standout thing to lead.",
  },
  {
    icon: <HandshakeRounded />,
    title: "Nonprofit connections",
    desc: "Tap our vetted network, or bring your own causes — we help you scope real projects.",
  },
  {
    icon: <AutoStoriesRounded />,
    title: "We bring the playbook",
    desc: "Twelve years of running these. You get the templates, judging rubric, and hands-on support.",
  },
];

export default function CreateHackathon() {
  useEffect(() => {
    initFacebookPixel();
  }, []);

  // Submit handler unchanged — posts to the create-hackathon endpoint.
  const handleSubmit = async (formData) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/create-hackathon`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit");
      }

      gaEvent({
        action: "submit",
        category: "CreateHackathon",
        label: "form_submitted",
        value: formData.budget,
      });

      return true;
    } catch (error) {
      console.error("Error submitting hackathon request:", error);
      throw error;
    }
  };

  return (
    <>
      <Head>
        <title>
          Host Your Own Opportunity Hack | Hackathon for Social Good
        </title>
        <meta
          name="description"
          content="Run an Opportunity Hack at your college, company, or community group. Students, clubs, universities, and companies host hackathons that connect tech talent with nonprofits — and we help you every step of the way."
        />
        <meta
          name="keywords"
          content="host a hackathon, college hackathon, university hackathon, student hackathon, run a hackathon, social impact hackathon, hackathon for nonprofits, campus hackathon, corporate social responsibility, Opportunity Hack"
        />
        <meta
          property="og:title"
          content="Host Your Own Opportunity Hack | Hackathon for Social Good"
        />
        <meta
          property="og:description"
          content="Run an Opportunity Hack at your college, company, or community group. We bring the playbook, mentors, judges, and nonprofit network — you bring the people."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.ohack.dev/hack/request" />
        <meta
          property="og:image"
          content="https://cdn.ohack.dev/ohack.dev/2023_hackathon_3.webp"
        />
        <link rel="canonical" href="https://www.ohack.dev/hack/request" />
        <RefinedFonts />
      </Head>

      <RefinedRoot>
        {/* HERO — leads with the campus / student-organizer story */}
        <section
          className="ohx-wrap"
          style={{
            paddingTop: "clamp(104px, 13vh, 156px)",
            paddingBottom: "clamp(28px, 5vh, 44px)",
          }}
        >
          <Eyebrow>
            <span className="rise" style={{ display: "inline-block" }}>
              Host an Opportunity Hack
            </span>
          </Eyebrow>
          <h1
            className="ohx-display rise"
            style={{ marginTop: 18, maxWidth: "16ch", animationDelay: "60ms" }}
          >
            Bring a hackathon for good to{" "}
            <span className="ohx-italic">your campus.</span>
          </h1>
          <p
            className="ohx-lead rise"
            style={{ marginTop: 22, animationDelay: "150ms", maxWidth: "60ch" }}
          >
            Students, clubs, universities, companies, and community groups host
            Opportunity Hack events worldwide. You bring the people — we bring
            the mentors, judges, nonprofit projects, and the playbook to pull it
            off.
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
            <a href="#request-form" className="ohx-btn ohx-btn--primary">
              Start your request <Arrow />
            </a>
            <a href="#how-it-works" className="ohx-btn ohx-btn--ghost">
              See how it works
            </a>
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

        {/* HOW IT WORKS — calm expectation-setting band */}
        <section
          id="how-it-works"
          style={{
            scrollMarginTop: 96,
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
            <Eyebrow>How hosting works</Eyebrow>
            <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 10 }}>
              Three steps, and you're never alone.
            </h2>
            <p
              className="ohx-muted"
              style={{ marginTop: 0, marginBottom: 28, maxWidth: "56ch" }}
            >
              This form isn't a commitment — it's the start of a conversation.
              Here's what happens after you hit submit.
            </p>
            <ol
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "grid",
                gap: 20,
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              }}
            >
              {HOW_IT_WORKS.map((step, i) => (
                <li
                  key={step.title}
                  className="ohx-card"
                  style={{ padding: 24, background: "var(--surface)" }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background: "var(--brand)",
                      color: "#fff",
                      fontFamily: "var(--display)",
                      fontWeight: 600,
                      fontSize: "1.05rem",
                    }}
                  >
                    {i + 1}
                  </span>
                  <h3
                    className="ohx-display"
                    style={{ fontSize: "1.2rem", marginTop: 14 }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="ohx-muted"
                    style={{
                      margin: "8px 0 0",
                      fontSize: "0.95rem",
                      lineHeight: 1.55,
                    }}
                  >
                    {step.desc}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* WHY HOST — calm benefit cards */}
        <section
          className="ohx-wrap"
          style={{
            paddingTop: "clamp(48px, 7vh, 80px)",
            paddingBottom: "clamp(40px, 6vh, 64px)",
          }}
        >
          <Eyebrow>Why host</Eyebrow>
          <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 28 }}>
            What you and your people get.
          </h2>
          <div
            style={{
              display: "grid",
              gap: 20,
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            }}
          >
            {BENEFITS.map((b) => (
              <div key={b.title} className="ohx-card" style={{ padding: 24 }}>
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
        </section>

        {/* REQUEST FORM */}
        <section
          id="request-form"
          className="ohx-wrap"
          style={{
            scrollMarginTop: 80,
            paddingTop: "clamp(40px, 6vh, 64px)",
            paddingBottom: "clamp(48px, 7vh, 80px)",
          }}
        >
          <Eyebrow>Get started</Eyebrow>
          <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 10 }}>
            Tell us about your event.
          </h2>
          <p
            className="ohx-muted"
            style={{ marginTop: 0, marginBottom: 28, maxWidth: "56ch" }}
          >
            A few quick questions so we can tailor our support. There are no
            wrong answers — if you're unsure about something, leave it and we'll
            sort it out together on the call.
          </p>
          <HackathonRequestForm onSubmit={handleSubmit} />
        </section>

        {/* WHO HOSTS — lead with the student example */}
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
            <Eyebrow>Who hosts</Eyebrow>
            <h2
              className="ohx-display"
              style={{ marginTop: 8, marginBottom: 10 }}
            >
              You're in good company.
            </h2>
            <p
              className="ohx-muted"
              style={{ marginTop: 0, marginBottom: 28, maxWidth: "58ch" }}
            >
              From student-led campus events to company hack days, organizers of
              every size have run an Opportunity Hack since 2013.
            </p>
            <div
              style={{
                display: "grid",
                gap: 20,
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              }}
            >
              <div
                className="ohx-card"
                style={{ padding: 24, background: "var(--surface)" }}
              >
                <span
                  style={{ color: "var(--accent)", display: "inline-flex", fontSize: "1.7rem" }}
                  aria-hidden="true"
                >
                  <SchoolRounded fontSize="inherit" />
                </span>
                <h3
                  className="ohx-display"
                  style={{ fontSize: "1.15rem", marginTop: 12 }}
                >
                  Cal Poly Humboldt
                </h3>
                <p
                  className="ohx-muted"
                  style={{ margin: "8px 0 0", fontSize: "0.95rem", lineHeight: 1.55 }}
                >
                  The Computer Science Club ran a student-led Opportunity Hack,
                  building tech for local environmental nonprofits.
                </p>
              </div>

              <div
                className="ohx-card"
                style={{ padding: 24, background: "var(--surface)" }}
              >
                <span
                  style={{ color: "var(--accent)", display: "inline-flex", fontSize: "1.7rem" }}
                  aria-hidden="true"
                >
                  <BusinessRounded fontSize="inherit" />
                </span>
                <h3
                  className="ohx-display"
                  style={{ fontSize: "1.15rem", marginTop: 12 }}
                >
                  Companies
                </h3>
                <p
                  className="ohx-muted"
                  style={{ margin: "8px 0 0", fontSize: "0.95rem", lineHeight: 1.55 }}
                >
                  Tech teams turn a hack day into real social impact and a
                  meaningful way to engage their engineers.
                </p>
              </div>

              <div
                className="ohx-card"
                style={{ padding: 24, background: "var(--surface)" }}
              >
                <span
                  style={{ color: "var(--accent)", display: "inline-flex", fontSize: "1.7rem" }}
                  aria-hidden="true"
                >
                  <Diversity3Rounded fontSize="inherit" />
                </span>
                <h3
                  className="ohx-display"
                  style={{ fontSize: "1.15rem", marginTop: 12 }}
                >
                  Community groups
                </h3>
                <p
                  className="ohx-muted"
                  style={{ margin: "8px 0 0", fontSize: "0.95rem", lineHeight: 1.55 }}
                >
                  Local tech communities and innovation hubs bring diverse
                  talent together to support nonprofits in their region.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SOFT CTA — for people not ready to fill the form */}
        <section style={{ background: "var(--brand)", color: "#fff" }}>
          <div
            className="ohx-wrap"
            style={{
              paddingTop: "clamp(44px, 6vh, 72px)",
              paddingBottom: "clamp(44px, 6vh, 72px)",
              textAlign: "center",
            }}
          >
            <h2 className="ohx-display" style={{ color: "#fff" }}>
              Not ready to fill this out?
            </h2>
            <p
              style={{
                margin: "14px auto 28px",
                maxWidth: "50ch",
                color: "rgba(255,255,255,0.85)",
                fontSize: "1.05rem",
              }}
            >
              Have a question or just want to think out loud first? Come say hi
              in our Slack community — we're happy to help you scope it out.
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
                href="https://opportunity-hack.slack.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="ohx-btn"
                style={{ background: "#fff", color: "var(--brand)" }}
              >
                Chat with us on Slack <Arrow />
              </a>
              <Link
                href="/about"
                className="ohx-btn ohx-btn--ghost"
                style={{ color: "#fff", borderColor: "rgba(255,255,255,0.5)" }}
              >
                Learn about Opportunity Hack
              </Link>
            </div>
          </div>
        </section>
      </RefinedRoot>
    </>
  );
}
