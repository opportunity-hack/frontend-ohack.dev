// Career Shadow host guide: the one-day job shadow checklist a Meta software
// engineer uses to host University of Arizona Science Shadows students.
// Static content page. All program facts come from the UA College of Science
// Science Shadows page (science.arizona.edu/science-shadows-job-shadow-program)
// and the UA Career Center Job Shadow Program page for employers.
import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { RefinedFonts, Stat } from "../../components/design/refined";
import {
  RefinedPage,
  PageMasthead,
  Prose,
  CtaBand,
} from "../../components/design/RefinedPage";
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

const sectionStyle = {
  paddingTop: "clamp(40px, 6vh, 72px)",
  paddingBottom: "clamp(40px, 6vh, 72px)",
};

const sunkenSectionStyle = {
  ...sectionStyle,
  background: "var(--surface-2)",
  borderTop: "1px solid var(--line)",
  borderBottom: "1px solid var(--line)",
};

function ChecklistGroup({ group, checked, onToggle }) {
  return (
    <div className="ohx-card" style={{ padding: "22px 24px" }}>
      <h3
        className="ohx-display"
        style={{ fontSize: 22, margin: "0 0 6px" }}
      >
        {group.title}
      </h3>
      <ul
        style={{
          listStyle: "none",
          margin: "12px 0 0",
          padding: 0,
          display: "grid",
          gap: 10,
        }}
      >
        {group.items.map((item, i) => {
          const key = `${group.id}-${i}`;
          const isChecked = checked.has(key);
          return (
            <li key={key}>
              <label
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  cursor: "pointer",
                  lineHeight: 1.55,
                  color: isChecked
                    ? "var(--muted)"
                    : "var(--ink)",
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
                  {item}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
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
        <meta property="og:site_name" content="Opportunity Hack" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={PAGE_TITLE} />
        <meta name="twitter:description" content={PAGE_DESCRIPTION} />
        <meta name="twitter:creator" content="@opportunityhack" />
        <meta name="twitter:site" content="@opportunityhack" />
        <RefinedFonts />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(howToJsonLd),
          }}
        />
      </Head>

      <RefinedPage>
        <PageMasthead
          eyebrow="Career Shadow · A host guide"
          title="Host a job shadow."
          italic="In one day."
          lead="One day with a working professional can change what a student thinks is possible. This is the exact checklist a Meta software engineer uses to host University of Arizona Science Shadows students. Copy it."
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px 22px",
              alignItems: "center",
              marginTop: 22,
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
          <div
            className="ohx-rule"
            style={{ marginTop: 28, display: "flex", flexWrap: "wrap" }}
          >
            <Stat value="4" label="shadow days hosted since 2024" />
            <Stat value="2-3" label="students per day" />
            <Stat value="8 AM-4:30 PM" label="a full shadow day" />
          </div>
        </PageMasthead>
      </RefinedPage>

      <section className="ohx-wrap" style={sectionStyle}>
        <p className="ohx-eyebrow">What a shadow day is</p>
        <h2 className="ohx-display" style={{ maxWidth: "24ch" }}>
          One day inside a real workplace.
        </h2>
        <Prose>
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

      <section
        className="ohx-wrap"
        style={sunkenSectionStyle}
        id="sign-up"
      >
        <p className="ohx-eyebrow">Sign up to host</p>
        <h2 className="ohx-display" style={{ maxWidth: "24ch" }}>
          Four steps to your first shadow.
        </h2>
        <Prose>
          <ol>
            <li>
              <strong>Fill out the Host Interest Form.</strong> Describe the
              shadow you want to offer: what students will see, how many you
              can host, and any qualifications you need.{" "}
              <a
                className="ohx-link"
                href={HOST_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick("host_interest_form_steps")}
              >
                Host Interest Form
              </a>
            </li>
            <li>
              <strong>The program team reviews it.</strong> Once approved,
              your shadow is posted to Handshake and students can find and
              apply for it.
            </li>
            <li>
              <strong>Students apply.</strong> The team reviews applicants by
              career interest, major, and preference, then connects you with
              your students.
            </li>
            <li>
              <strong>Run the day.</strong> You set the agenda. The checklist
              below is the one on this page.
            </li>
          </ol>
          <p>
            Questions about the program? Contact Lyndsey Edmonds, Director of
            the College of Science Career Center, at{" "}
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
            For the Winter 2026-27 session, student applications run November
            2-22, 2026, and shadows take place December 18, 2026 to January
            12, 2027. Check the{" "}
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
      </section>

      <section className="ohx-wrap" style={sectionStyle} id="checklist">
        <p className="ohx-eyebrow">The checklist</p>
        <h2 className="ohx-display" style={{ maxWidth: "24ch" }}>
          The host checklist, start to finish.
        </h2>
        <p className="ohx-lead" style={{ maxWidth: "60ch" }}>
          This is the working checklist behind four shadow days. Check items
          off as you go, or copy the whole list into your own notes.
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px 22px",
            alignItems: "center",
            margin: "18px 0 26px",
          }}
        >
          <button
            type="button"
            className="ohx-btn ohx-btn--ghost"
            onClick={copyChecklist}
          >
            {copied ? "Copied to clipboard" : "Copy the checklist"}
          </button>
          <span className="ohx-muted" style={{ fontSize: 14 }}>
            {checked.size} of {totalItems} done
          </span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 20,
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
        </div>
        <Prose style={{ marginTop: 26 }}>
          <p>
            Times in the day plan are a starting point. Move them to fit your
            day. The one part to protect is the 3:30 PM session: go over the
            classes each student is taking and how they relate to the jobs
            they know about or want. Students get the most from that
            conversation when it is about their actual classes, not generic
            career advice.
          </p>
        </Prose>
      </section>

      <section
        className="ohx-wrap"
        style={sunkenSectionStyle}
      >
        <p className="ohx-eyebrow">Who wrote this</p>
        <h2 className="ohx-display" style={{ maxWidth: "24ch" }}>
          Tested on real shadow days.
        </h2>
        <Prose>
          <p>
            Greg Vannoni is a software engineer at Meta Reality Labs, on the
            Health Insights team. He hosted Science Shadows students in May
            2024 in Menlo Park and virtually, in January 2025 in Menlo Park,
            and in January 2026 in Bellevue. He is also president of
            Opportunity Hack.
          </p>
          <p>
            Every item on this page comes from those days: the briefing doc he
            sends students, the agenda he runs, and the follow-up he does
            after. Nothing here is theory.
          </p>
        </Prose>
        <div style={{ marginTop: 28 }}>
          <DonateCard placement="career_shadow">
            Opportunity Hack is a nonprofit. Donations fund the hackathons and
            the free software we build for nonprofits. If this guide helps you
            host a shadow, consider a gift to keep the work going.
          </DonateCard>
        </div>
      </section>

      <RefinedPage>
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
      </RefinedPage>
    </>
  );
}
