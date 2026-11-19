// Career Shadow host guide: the one-day job shadow checklist a Meta software
// engineer uses to host University of Arizona Science Shadows students.
// Static content page. All program facts come from the UA College of Science
// Science Shadows page (science.arizona.edu/science-shadows-job-shadow-program)
// and the UA Career Center Job Shadow Program page for employers.
import React, { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Box from "@mui/material/Box";
import { RefinedRoot, Eyebrow, Stat } from "../../components/design/refined";
import { Prose, CtaBand } from "../../components/design/RefinedPage";
import { DonateCard } from "../../components/design/DonateNudge";
import { serializeJsonLd } from "../../lib/jsonLd";
import { trackEvent } from "../../lib/ga";

const PAGE_TITLE =
  "How to Host a Job Shadow: A One-Day Checklist for Employers | Opportunity Hack";
const PAGE_DESCRIPTION =
  "Host a college job shadow in one day. A tested checklist and agenda from a Meta software engineer who hosted University of Arizona Science Shadows students, plus the host signup form.";
const CANONICAL_URL = "https://www.ohack.dev/career-shadow";
const HOST_FORM_URL =
  "https://uarizona.co1.qualtrics.com/jfe/form/SV_1zVxrgNQE9W5rIW";
const PROGRAM_URL =
  "https://science.arizona.edu/science-shadows-job-shadow-program";
const LINKEDIN_URL = "https://www.linkedin.com/in/gregvannoni/";
const OG_IMAGE = "https://www.ohack.dev/images/career-shadow/og.jpg";
const PHOTO_MENLO_PARK = "/images/career-shadow/menlo-park-2024.jpg";
const PHOTO_BELLEVUE = "/images/career-shadow/bellevue-2026.jpg";
const STUDENT_PROGRAM_URL =
  "https://career.arizona.edu/experiences/job-shadow-program/";

// GA action + button names for this page.
const trackClick = (button) => {
  trackEvent({ action: "click_career_shadow", params: { button } });
};

// The checklist. Keep the copy text in sync with the items below: the copy
// button builds plain text from this same data.
const CHECKLIST = [
  {
    id: "before",
    title: "Before the day",
    items: [
      "Pick a date, a place, and a format: in person at your office, or virtual on Zoom.",
      "Fill out the Host Interest Form and wait for approval.",
      "Get your students: name, email, phone, LinkedIn, degree, graduation date, interests, classes they are taking, and jobs they know about or want.",
      "Add every student to the WhatsApp group.",
      "Confirm travel and hotel bookings, if students travel in.",
      "If your workplace needs it, add students as visitors and send the NDA before the day.",
      "Send each student the briefing doc at least a few days before the day.",
    ],
  },
  {
    id: "briefing",
    title: "The briefing doc",
    items: [
      "At a glance: date, location, format, meetup point, and your contact.",
      "One block per student: contact, degree, graduation, interests, classes, jobs of interest, WhatsApp joined, travel booked, hotel booked, and your prep note for that student.",
      "Travel: airport options, rideshare, hotel, and a meetup point with a building placeholder, not a hard-coded building name.",
      "Before you arrive: dress code, food, stay-with-host rule, photo rules, and visitor and NDA notes for in person; connection test and Zoom links for virtual.",
      "Agenda with times and a Questions / Notes column students can add to.",
    ],
  },
  {
    id: "day",
    title: "On the day",
    items: [
      "8:00-8:30 AM: Questions. Talk about the day and the company.",
      "8:30-9:00 AM: Company, mission, products, and your background.",
      "9:00-10:00 AM: Meet people from your teams. Students ask questions.",
      "11:00-11:30 AM: Break.",
      "11:30 AM-1:00 PM: Lunch.",
      "1:00-2:00 PM: How your software architecture works.",
      "2:00-3:00 PM: Testing, monitoring, and what school does not teach.",
      "3:00-3:30 PM: Meet another set of staff.",
      "3:30-4:00 PM: Your classes and the jobs they lead to. Go over the classes each student is taking and how they relate to the jobs they know about or want.",
      "4:00-4:30 PM: Deeper dive into topics the students picked, then wrap up.",
    ],
  },
  {
    id: "after",
    title: "After the day",
    items: [
      "Send follow-up links and reading.",
      "Connect on LinkedIn.",
      "Tell the program team how it went.",
    ],
  },
];

const checklistPlainText = () =>
  [
    "Career Shadow host checklist",
    "",
    ...CHECKLIST.flatMap((group) => [
      `${group.title.toUpperCase()}`,
      ...group.items.map((item) => `[ ] ${item}`),
      "",
    ]),
    "Sign up to host: " + HOST_FORM_URL,
    "Program: " + PROGRAM_URL,
  ].join("\n");

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to host a college job shadow in one day",
  description: PAGE_DESCRIPTION,
  url: CANONICAL_URL,
  step: [
    {
      "@type": "HowToStep",
      name: "Sign up to host",
      text: "Fill out the University of Arizona Science Shadows Host Interest Form. The program team reviews it and posts your shadow to Handshake.",
    },
    {
      "@type": "HowToStep",
      name: "Plan the day",
      text: "Pick a date, a place, and a format, in person or virtual. Work through the host checklist: students, WhatsApp group, travel, visitor registration, and the briefing doc.",
    },
    {
      "@type": "HowToStep",
      name: "Brief the students",
      text: "Send each student a briefing doc with the plan for the day, the meetup point, and what to bring.",
    },
    {
      "@type": "HowToStep",
      name: "Run the day",
      text: "Follow the agenda: introductions, meet the team, lunch, architecture, testing and monitoring, then the classes and jobs session.",
    },
    {
      "@type": "HowToStep",
      name: "Follow up",
      text: "Send follow-up links, connect on LinkedIn, and tell the program team how it went.",
    },
  ],
};

const sectionPad = {
  paddingTop: "clamp(44px, 7vh, 80px)",
  paddingBottom: "clamp(44px, 7vh, 80px)",
};

const sunkenBand = {
  background: "var(--surface-2)",
  borderTop: "1px solid var(--line)",
  borderBottom: "1px solid var(--line)",
};

const photoFrame = {
  position: "relative",
  width: "100%",
  borderRadius: 10,
  overflow: "hidden",
  border: "1px solid var(--line)",
  background: "var(--surface-2)",
};

const SIGNUP_STEPS = [
  {
    title: "Fill out the Host Interest Form",
    body: "Describe the shadow you want to offer: what students will see, how many you can host, and any qualifications you need.",
  },
  {
    title: "The program team reviews it",
    body: "Once approved, your shadow is posted to Handshake and students can find and apply for it.",
  },
  {
    title: "Students apply",
    body: "The team reviews applicants by career interest, major, and preference, then connects you with your students.",
  },
  {
    title: "Run the day",
    body: "You set the agenda. The checklist below is the one Greg uses.",
  },
];

// "8:00-8:30 AM: Questions." -> ["8:00-8:30 AM", "Questions."]
const splitTime = (item) => {
  const match = item.match(/^(\d.*?[AP]M): (.*)$/);
  return match ? [match[1], match[2]] : [null, item];
};

function ChecklistGroup({ group, checked, onToggle }) {
  return (
    <div className="ohx-card" style={{ padding: "22px 24px" }}>
      <h3 className="ohx-display" style={{ fontSize: 22, margin: 0 }}>
        {group.title}
      </h3>
      <ul
        style={{
          listStyle: "none",
          margin: "16px 0 0",
          padding: 0,
          display: "grid",
          gap: 12,
        }}
      >
        {group.items.map((item, i) => {
          const key = `${group.id}-${i}`;
          const isChecked = checked.has(key);
          const [time, text] = splitTime(item);
          return (
            <li key={key}>
              <label
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                  cursor: "pointer",
                  fontSize: 15.5,
                  lineHeight: 1.55,
                  color: isChecked ? "var(--muted)" : "var(--ink)",
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggle(key)}
                  style={{
                    marginTop: 3,
                    width: 18,
                    height: 18,
                    accentColor: "var(--brand)",
                    flex: "0 0 auto",
                    cursor: "pointer",
                  }}
                />
                <span
                  style={{
                    textDecoration: isChecked ? "line-through" : "none",
                  }}
                >
                  {time && (
                    <span
                      style={{
                        display: "block",
                        fontSize: 12.5,
                        fontWeight: 600,
                        letterSpacing: "0.04em",
                        color: isChecked ? "var(--muted)" : "var(--brand)",
                      }}
                    >
                      {time}
                    </span>
                  )}
                  {text}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Photo({ src, width, height, alt, caption, sizes, priority = false }) {
  return (
    <figure style={{ margin: 0 }}>
      <div style={photoFrame}>
        <Image
          src={src}
          width={width}
          height={height}
          alt={alt}
          sizes={sizes}
          priority={priority}
          style={{ display: "block", width: "100%", height: "auto" }}
        />
      </div>
      <figcaption
        className="ohx-faint"
        style={{ marginTop: 10, fontSize: 13 }}
      >
        {caption}
      </figcaption>
    </figure>
  );
}

export default function CareerShadowPage() {
  const [checked, setChecked] = useState(() => new Set());
  const [copied, setCopied] = useState(false);

  const toggle = (key) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const totalItems = CHECKLIST.reduce(
    (sum, group) => sum + group.items.length,
    0,
  );

  const copyChecklist = async () => {
    const text = checklistPlainText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // Clipboard API needs a secure context. Fall back to a textarea.
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      try {
        document.execCommand("copy");
        setCopied(true);
      } catch {
        // Leave the button as-is; the checklist is still on the page.
      }
      document.body.removeChild(el);
    }
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      <Head>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESCRIPTION} />
        <meta
          name="keywords"
          content="host a job shadow, college job shadow program, job shadow checklist, job shadow day template, host a job shadow student, University of Arizona Science Shadows, job shadow for employers"
        />
        <meta name="author" content="Opportunity Hack" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={CANONICAL_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta property="og:description" content={PAGE_DESCRIPTION} />
        <meta property="og:url" content={CANONICAL_URL} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Opportunity Hack" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={PAGE_TITLE} />
        <meta name="twitter:description" content={PAGE_DESCRIPTION} />
        <meta name="twitter:image" content={OG_IMAGE} />
        <meta name="twitter:creator" content="@opportunityhack" />
        <meta name="twitter:site" content="@opportunityhack" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(howToJsonLd),
          }}
        />
      </Head>

      <RefinedRoot>
        {/* ---------------- HERO ---------------- */}
        <section
          className="ohx-wrap"
          style={{
            paddingTop: "clamp(96px, 12vh, 140px)",
            paddingBottom: "clamp(40px, 6vh, 72px)",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1.25fr 0.75fr" },
              gap: { xs: "36px", md: "56px" },
              alignItems: "center",
            }}
          >
            <header>
              <Eyebrow>Career Shadow · A host guide</Eyebrow>
              <h1
                className="ohx-display"
                style={{ marginTop: 14, maxWidth: "14ch" }}
              >
                Host a job shadow.{" "}
                <span className="ohx-italic">In one day.</span>
              </h1>
              <p
                className="ohx-lead"
                style={{ marginTop: 18, maxWidth: "54ch" }}
              >
                One day with a working professional can change what a student
                thinks is possible. This is the exact checklist Greg Vannoni,
                a software engineer at Meta and President of Opportunity Hack,
                uses to host University of Arizona Science Shadows students.
                Copy it.
              </p>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "12px 22px",
                  alignItems: "center",
                  marginTop: 26,
                }}
              >
                <a
                  className="ohx-btn ohx-btn--primary"
                  href={HOST_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackClick("host_interest_form_hero")}
                >
                  Sign up to host
                </a>
                <Link href="#checklist" className="ohx-link">
                  Skip to the checklist <span aria-hidden="true">↓</span>
                </Link>
              </div>
              <hr className="ohx-rule" style={{ marginTop: 36 }} />
              <div
                style={{
                  marginTop: 24,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "20px clamp(28px, 5vw, 56px)",
                }}
              >
                <Stat value="4" label="shadow days hosted since 2024" />
                <Stat value="2-3" label="students per day" />
                <Stat value="8 AM-4:30 PM" label="a full shadow day" />
              </div>
            </header>
            <Box sx={{ maxWidth: { xs: 420, md: "none" } }}>
              <Photo
                src={PHOTO_MENLO_PARK}
                width={1200}
                height={1594}
                priority
                sizes="(max-width: 900px) 420px, 400px"
                alt="Greg Vannoni with a shadow day group in front of the Meta sign at 1 Hacker Way in Menlo Park"
                caption="Shadow day at Meta in Menlo Park, May 2024."
              />
            </Box>
          </Box>
        </section>

        {/* ---------------- WHO IS BEHIND THIS ---------------- */}
        <section style={sunkenBand} id="about-greg">
          <div className="ohx-wrap" style={sectionPad}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "280px 1fr" },
                gap: { xs: "28px", md: "56px" },
                alignItems: "center",
              }}
            >
              <Box sx={{ maxWidth: { xs: 280, md: "none" } }}>
                <Photo
                  src={PHOTO_BELLEVUE}
                  width={768}
                  height={1024}
                  sizes="280px"
                  alt="Greg Vannoni with two students in an office lobby in Bellevue"
                  caption="Shadow day in Bellevue, 2026."
                />
              </Box>
              <div>
                <Eyebrow>Who is behind this guide</Eyebrow>
                <h2
                  className="ohx-display"
                  style={{ marginTop: 10, maxWidth: "22ch" }}
                >
                  A nonprofit president with a day job.
                </h2>
                <Prose style={{ marginTop: 16 }}>
                  <p>
                    Greg Vannoni is the President of Opportunity Hack, the
                    nonprofit that runs this site. That is not his day job.
                    He works full time at Meta, where he was an engineering
                    manager and, since May 2026, a software engineer.
                  </p>
                  <p>
                    He hosted Science Shadows students in May 2024 in Menlo
                    Park and virtually, in January 2025 in Menlo Park, and in
                    January 2026 in Bellevue. Every item on this page comes
                    from those days: the briefing doc he sends students, the
                    agenda he runs, and the follow-up he does after. Nothing
                    here is theory.
                  </p>
                  <p>
                    <a
                      className="ohx-link"
                      href={LINKEDIN_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackClick("greg_linkedin")}
                    >
                      Greg on LinkedIn <span aria-hidden="true">→</span>
                    </a>
                  </p>
                </Prose>
              </div>
            </Box>
          </div>
        </section>

        {/* ---------------- WHAT A SHADOW DAY IS ---------------- */}
        <section className="ohx-wrap" style={sectionPad}>
          <Eyebrow>What a shadow day is</Eyebrow>
          <h2
            className="ohx-display"
            style={{ marginTop: 10, maxWidth: "24ch" }}
          >
            One day inside a real workplace.
          </h2>
          <Prose style={{ marginTop: 16 }}>
            <p>
              Science Shadows is the University of Arizona College of Science
              job shadow program. A student spends one day with a working
              professional, in person or virtual, to see what the job actually
              looks like and to ask the questions they cannot ask in class.
            </p>
            <p>
              Any professional can host. Shadows run in any industry, anywhere
              in the world, as long as the workplace is not a home office.
              Students cover their own travel. A shadow runs 2 to 8 hours. Most
              hosts take 1 to 3 students at a time.
            </p>
            <p>
              Students apply on Handshake by searching for{" "}
              <strong>Science Shadows</strong>. They can apply for up to five
              shadows per session and do one shadow per academic year. College
              of Science undergraduates get priority for placement.{" "}
              <a
                className="ohx-link"
                href={STUDENT_PROGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                How students apply
              </a>
            </p>
          </Prose>
        </section>

        {/* ---------------- SIGN UP ---------------- */}
        <section style={sunkenBand} id="sign-up">
          <div className="ohx-wrap" style={sectionPad}>
            <Eyebrow>Sign up to host</Eyebrow>
            <h2
              className="ohx-display"
              style={{ marginTop: 10, maxWidth: "24ch" }}
            >
              Four steps to your first shadow.
            </h2>
            <Box
              component="ol"
              sx={{
                listStyle: "none",
                m: "28px 0 0",
                p: 0,
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(4, 1fr)",
                },
                gap: "20px",
              }}
            >
              {SIGNUP_STEPS.map((step, i) => (
                <li
                  key={step.title}
                  className="ohx-card"
                  style={{ padding: "20px 22px" }}
                >
                  <span
                    className="ohx-display"
                    style={{ fontSize: 28, color: "var(--accent)" }}
                  >
                    {i + 1}
                  </span>
                  <h3
                    className="ohx-display"
                    style={{ fontSize: 19, marginTop: 10 }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="ohx-muted"
                    style={{ margin: "8px 0 0", fontSize: 14.5, lineHeight: 1.55 }}
                  >
                    {step.body}
                  </p>
                </li>
              ))}
            </Box>
            <div style={{ marginTop: 26 }}>
              <a
                className="ohx-btn ohx-btn--primary"
                href={HOST_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick("host_interest_form_steps")}
              >
                Open the Host Interest Form
              </a>
            </div>
            <Prose style={{ marginTop: 26 }}>
              <p>
                Questions about the program? Contact Lyndsey Edmonds, Director
                of the College of Science Career Center, at{" "}
                <a
                  className="ohx-link"
                  href="mailto:lyndseyedmonds@arizona.edu"
                >
                  lyndseyedmonds@arizona.edu
                </a>
                . The Science Shadows coordinator is Mitchell Rutherford, at{" "}
                <a
                  className="ohx-link"
                  href="mailto:mrutherford20@arizona.edu"
                >
                  mrutherford20@arizona.edu
                </a>
                .
              </p>
              <p>
                For the Winter 2026-27 session, student applications run
                November 2-22, 2026, and shadows take place December 18, 2026
                to January 12, 2027. Check the{" "}
                <a
                  className="ohx-link"
                  href={PROGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Science Shadows program page
                </a>{" "}
                for the current session dates.
              </p>
            </Prose>
          </div>
        </section>

        {/* ---------------- CHECKLIST ---------------- */}
        <section
          className="ohx-wrap"
          style={{ ...sectionPad, scrollMarginTop: 72 }}
          id="checklist"
        >
          <Eyebrow>The checklist</Eyebrow>
          <h2
            className="ohx-display"
            style={{ marginTop: 10, maxWidth: "24ch" }}
          >
            The host checklist, start to finish.
          </h2>
          <p className="ohx-lead" style={{ marginTop: 14, maxWidth: "60ch" }}>
            This is the working checklist behind four shadow days. Check items
            off as you go, or copy the whole list into your own notes.
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px 22px",
              alignItems: "center",
              margin: "22px 0 26px",
            }}
          >
            <button
              type="button"
              className="ohx-btn ohx-btn--ghost"
              onClick={copyChecklist}
            >
              {copied ? "Copied to clipboard" : "Copy the checklist"}
            </button>
            <span
              className="ohx-muted"
              style={{ fontSize: 14 }}
              role="status"
            >
              {checked.size} of {totalItems} done
            </span>
          </div>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
              gap: "20px",
              alignItems: "start",
            }}
          >
            {CHECKLIST.map((group) => (
              <ChecklistGroup
                key={group.id}
                group={group}
                checked={checked}
                onToggle={toggle}
              />
            ))}
          </Box>
          <Prose style={{ marginTop: 28 }}>
            <p>
              Times in the day plan are a starting point. Move them to fit your
              day. The one part to protect is the 3:30 PM session: go over the
              classes each student is taking and how they relate to the jobs
              they know about or want. Students get the most from that
              conversation when it is about their actual classes, not generic
              career advice.
            </p>
          </Prose>

          <div style={{ marginTop: 40 }}>
            <DonateCard placement="career_shadow">
              Opportunity Hack is a nonprofit. Donations fund the hackathons
              and the free software we build for nonprofits. If this guide
              helps you host a shadow, consider a gift to keep the work going.
            </DonateCard>
          </div>

          <CtaBand
            eyebrow="Ready when you are"
            title="Host a student. Change a career path."
            body="Fill out the Host Interest Form and the University of Arizona team will take it from there."
            primary={{
              label: "Sign up to host",
              href: HOST_FORM_URL,
              onClick: () => trackClick("host_interest_form_cta"),
            }}
            secondary={{
              label: "Science Shadows program page",
              href: PROGRAM_URL,
            }}
          />
        </section>
      </RefinedRoot>
    </>
  );
}
