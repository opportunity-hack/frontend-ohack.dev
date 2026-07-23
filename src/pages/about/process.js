import React, { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Box } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RateReviewIcon from '@mui/icons-material/RateReview';
import GroupIcon from '@mui/icons-material/Group';
import BuildIcon from '@mui/icons-material/Build';
import CodeIcon from '@mui/icons-material/Code';
import TimelineIcon from '@mui/icons-material/Timeline';
import { initFacebookPixel, trackEvent } from '../../lib/ga';
import dynamic from "next/dynamic";
import { RefinedRoot, RefinedFonts, Eyebrow, Arrow } from '../../components/design/refined';

const MermaidDiagram = dynamic(() => import("../../components/MermaidDiagram"), {
  ssr: false,
  loading: () => <p style={{ color: "var(--faint, #8A8F9A)" }}>Loading diagram…</p>,
});

const chart = `
                graph LR
                A[Nonprofit Application] --> B[Application Review]
                B --> C[Nonprofit Selection]
                C --> D[Problem Refinement]
                D --> E[Hackathon Event]
                E --> F[Project Continuation]
                F --> G[Long-term Impact]
              `;

const STEPS = [
  { n: "01", title: "Nonprofit application", icon: <AssignmentIcon fontSize="small" />, content: "Nonprofits submit their ideas and challenges through our online form.", list: ["Share your organization's mission and vision", "Describe the specific technical challenges you face", "Explain how solving them will amplify your impact", "No tech expertise required — we're here to help"], link: { text: "Apply now", href: "/nonprofits/apply" } },
  { n: "02", title: "Application review", icon: <RateReviewIcon fontSize="small" />, content: "Our team carefully evaluates each application to ensure a good fit.", list: ["Weekly review of new nonprofit applications", "Follow-up questions via email or Slack for clarity", "Assessment of feasibility and potential impact", "Consideration of available volunteer skills"] },
  { n: "03", title: "Nonprofit selection", icon: <GroupIcon fontSize="small" />, content: "We choose diverse projects that benefit most from our hackathon model.", list: ["Notification sent to selected nonprofits", "A warm welcome to the Opportunity Hack community", "Access to our collaborative Slack workspace", "Initial briefing on the process and expectations"] },
  { n: "04", title: "Problem refinement", icon: <BuildIcon fontSize="small" />, content: "We work closely with nonprofits to define clear, impactful goals.", list: ["One-on-one sessions with experienced mentors", "Clarifying scope, goals, and success criteria", "Guidance on a 3-minute pitch video", "Preliminary matching with skills and tech"] },
  { n: "05", title: "Hackathon event", icon: <CodeIcon fontSize="small" />, content: "The main event — volunteers collaborate intensively on nonprofit projects.", list: ["Kickoff with inspiring nonprofit pitches", "Team formation based on skills and interests", "48 hours of focused development and prototyping", "Final presentations and judging by industry experts"] },
  { n: "06", title: "Project continuation", icon: <TimelineIcon fontSize="small" />, content: "We ensure projects have a path forward after the hackathon ends.", list: ["Winning teams invited to continue development", "~3 months of additional refinement and implementation", "Regular check-ins and progress updates", "Documentation and open-sourcing for wider benefit"] },
];

const FAQS = [
  { q: "How can sponsors support Opportunity Hack?", a: (<>Sponsors make Opportunity Hack possible — through funding, mentorship, technology resources, or hosting events. Your support directly enables nonprofits to leverage cutting-edge technology for social good. <Link href="/sponsor" className="ohx-link">Learn about sponsorship</Link>.</>) },
  { q: "What skills are needed to participate as a hacker?", a: "We welcome a diverse range of skills — software developers, UX/UI designers, data scientists, project managers, and anyone passionate about using technology for social impact. Whether you're a seasoned pro or just starting out, there's a place for you." },
  { q: "How can nonprofits prepare for the hackathon?", a: "Clearly define your challenges and goals. We'll guide you through the process, but it helps to think about your technical pain points, data you can share, and the impact a solution would have. Don't worry about the technical details — that's where our volunteers come in." },
  { q: "Is the code developed during Opportunity Hack open source?", a: "Yes — all code is open-source under the MIT License. This allows maximum collaboration, transparency, and the potential for solutions to benefit multiple organizations facing similar challenges." },
  { q: "What happens if our project isn't completed during the hackathon?", a: "The hackathon is just the beginning. While we aim for working prototypes during the event, winning teams are invited to continue development for ~3 months — for further refinement, testing, and implementation." },
];

function Disclosure({ summary, children }) {
  return (
    <details className="ohx-card" style={{ padding: 0, marginBottom: 12, overflow: "hidden" }}>
      <summary style={{ listStyle: "none", cursor: "pointer", padding: "18px 22px", fontFamily: "var(--display)", fontSize: "1.05rem", fontWeight: 500, color: "var(--ink)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        {summary}
        <span className="ohx-faint" style={{ fontSize: "1.4rem", lineHeight: 1, fontFamily: "var(--body)" }}>+</span>
      </summary>
      <div style={{ padding: "0 22px 22px" }}>
        <p className="ohx-muted" style={{ margin: 0, fontSize: "0.96rem", lineHeight: 1.65 }}>{children}</p>
      </div>
    </details>
  );
}

export default function OpportunityHackProcess() {
  useEffect(() => {
    initFacebookPixel();
  }, []);

  const trackButtonClick = (buttonName) => {
    trackEvent({ action: "click_process", params: { event_category: "button", event_label: buttonName } });
  };

  return (
    <>
      <Head>
        <title>Opportunity Hack Process: Empowering Nonprofits through Tech Innovation</title>
        <meta name="description" content="Discover how Opportunity Hack connects nonprofits with skilled volunteers to solve technological challenges. Learn about our unique hackathon process for social good." />
        <meta name="keywords" content="Opportunity Hack, nonprofit technology, hackathon, tech volunteers, social impact, open source, mentorship, software development, project management" />
        <meta property="og:title" content="Opportunity Hack: Bridging Nonprofits and Tech Innovators" />
        <meta property="og:description" content="Join Opportunity Hack to use your tech skills for social good. Whether you're a nonprofit, developer, designer, or sponsor, learn how you can make a difference." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.ohack.dev/about/process" />
        <meta property="og:image" content="https://www.ohack.dev/images/opportunity-hack-banner.jpg" />
        <RefinedFonts />
      </Head>

      <RefinedRoot>
        {/* HERO */}
        <section className="ohx-wrap" style={{ paddingTop: "clamp(104px, 13vh, 156px)", paddingBottom: "clamp(28px, 5vh, 44px)" }}>
          <Eyebrow><span className="rise" style={{ display: "inline-block" }}>How it works</span></Eyebrow>
          <h1 className="ohx-display rise" style={{ marginTop: 18, maxWidth: "16ch", animationDelay: "60ms" }}>
            Innovating <span className="ohx-italic">for nonprofits.</span>
          </h1>
          <p className="ohx-lead rise" style={{ marginTop: 22, animationDelay: "150ms", maxWidth: "60ch" }}>
            Opportunity Hack brings together nonprofits, developers, designers, and tech professionals to
            build solutions for social good. Here&apos;s how a project moves from idea to lasting impact.
          </p>
        </section>

        {/* FLOW DIAGRAM */}
        <section className="ohx-wrap" style={{ paddingBottom: "clamp(32px, 6vh, 56px)" }}>
          <div className="ohx-card" style={{ padding: "26px 24px" }}>
            <Eyebrow style={{ marginBottom: 8 }}>The journey</Eyebrow>
            <h2 className="ohx-display" style={{ fontSize: "1.4rem", marginBottom: 18 }}>Application to long-term impact</h2>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                overflowX: "auto",
                "& .mermaid": { width: "100%" },
                "& .mermaid svg": { width: "100%", height: "auto", maxWidth: 920 },
              }}
            >
              <MermaidDiagram chart={chart} />
            </Box>
          </div>
        </section>

        {/* PROCESS STEPS */}
        <section className="ohx-wrap" style={{ paddingBottom: "clamp(40px, 6vh, 64px)" }}>
          <Eyebrow>Step by step</Eyebrow>
          <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 28 }}>Six stages, start to finish</h2>
          <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
            {STEPS.map((s, i) => (
              <div key={s.n} className="ohx-card rise" style={{ padding: "26px", display: "flex", flexDirection: "column", animationDelay: `${Math.min(i, 5) * 60}ms` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                  <span className="ohx-display ohx-italic" style={{ fontSize: "1.5rem", lineHeight: 1 }}>{s.n}</span>
                  <span style={{ color: "var(--accent)", display: "inline-flex" }}>{s.icon}</span>
                </div>
                <h3 className="ohx-display" style={{ fontSize: "1.25rem" }}>{s.title}</h3>
                <p className="ohx-muted" style={{ margin: "10px 0 14px", fontSize: "0.96rem", lineHeight: 1.55 }}>{s.content}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  {s.list.map((item) => (
                    <li key={item} style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                      <span style={{ color: "var(--accent)", fontWeight: 700 }}>—</span>
                      <span className="ohx-muted" style={{ fontSize: "0.9rem", lineHeight: 1.5 }}>{item}</span>
                    </li>
                  ))}
                </ul>
                {s.link && (
                  <div style={{ marginTop: "auto", paddingTop: 18 }}>
                    <Link href={s.link.href} className="ohx-btn ohx-btn--primary" style={{ fontSize: "0.9rem", padding: "0.7em 1.1em" }} onClick={() => trackButtonClick(s.link.text)}>
                      {s.link.text} <Arrow />
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* TIMELINE */}
        <section className="ohx-wrap" style={{ paddingBottom: "clamp(40px, 6vh, 64px)" }}>
          <div className="ohx-card" style={{ padding: "26px 24px" }}>
            <Eyebrow style={{ marginBottom: 8 }}>Annual timeline</Eyebrow>
            <h2 className="ohx-display" style={{ fontSize: "1.4rem", marginBottom: 18 }}>A year at Opportunity Hack</h2>
            <Box sx={{ display: "flex", justifyContent: "center", overflowX: "auto" }}>
              <pre className="mermaid">
                {`
                gantt
                  title Opportunity Hack Timeline
                  dateFormat  YYYY-MM-DD
                  section Application
                  Nonprofit Applications    :a1, 2026-05-01, 2026-08-31
                  Weekly Application Review :a2, 2026-05-01, 2026-08-31
                  section Pre-Event
                  Nonprofit Notification    :2026-09-01, 7d
                  Problem Refinement        :2026-09-15, 14d
                  section Hackathon
                  Hackathon Event           :milestone, m1, 2026-10-11, 2d
                  section Post-Event
                  Project Continuation      :2026-10-12, 90d
              `}
              </pre>
            </Box>
          </div>
        </section>

        {/* FAQ */}
        <section className="ohx-wrap" style={{ paddingBottom: "clamp(40px, 6vh, 64px)" }}>
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 24 }}>Common questions</h2>
          <div style={{ maxWidth: 820 }}>
            {FAQS.map((faq, i) => (
              <Disclosure key={i} summary={faq.q}>{faq.a}</Disclosure>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: "var(--brand)", color: "#fff" }}>
          <div className="ohx-wrap" style={{ paddingTop: "clamp(48px, 7vh, 88px)", paddingBottom: "clamp(48px, 7vh, 88px)", textAlign: "center" }}>
            <h2 className="ohx-display" style={{ color: "#fff" }}>Ready to make a difference?</h2>
            <p style={{ margin: "14px auto 28px", maxWidth: "50ch", color: "rgba(255,255,255,0.85)", fontSize: "1.05rem" }}>
              Bring us your nonprofit&apos;s challenge — we&apos;ll match it with a team of builders.
            </p>
            <Link href="/nonprofits/apply" className="ohx-btn" style={{ background: "#fff", color: "var(--brand)" }} onClick={() => trackButtonClick("Apply Now")}>
              Apply now <Arrow />
            </Link>
          </div>
        </section>
      </RefinedRoot>
    </>
  );
}
