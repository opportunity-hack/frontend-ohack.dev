import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import Moment from "moment";
import { Box, Slider } from "@mui/material";
import { initFacebookPixel, trackEvent } from "../../../lib/ga";
import useHackathonEvents from "../../../hooks/use-hackathon-events";
import { RefinedRoot, RefinedFonts, Eyebrow, Arrow } from "../../../components/design/refined";

const JUDGING_CONSTANTS = { DEFAULT_SCORE: 3 };

const SCORE_DESCRIPTIONS = {
  1: "Poor — significantly below expectations",
  2: "Fair — below expectations",
  3: "Good — meets expectations",
  4: "Very good — exceeds expectations",
  5: "Excellent — significantly exceeds expectations",
};

const FAQ_DATA = [
  {
    id: "attendance",
    question: "Do I need to be there the entire weekend?",
    answer: "Nope! But here's the key detail: <strong>please arrive by 2pm on the final day</strong>. Judging starts promptly at 3pm, so arriving by 2pm gives you time to find parking, grab a coffee, meet the other judges, and get situated before things kick off. 🎯<br/><br/>Beyond that, you've got flexibility:<br/>• Check the hackathon schedule to understand the overall flow<br/>• Feel free to drop by earlier and chat with participants<br/>• Just keep individual team interactions to about 3 minutes max before judging - these hackers are in the zone!<br/><br/>One important note: unless your company is sponsoring, please don't recruit or ask for resumes during the event (save that for after!). ⏰",
  },
  {
    id: "in-person-judging",
    question: "Why do you require judges to be in-person for in-person hackathons?",
    answer: "Great question! Here's why in-person judging matters so much to us: 🏛️<br/><br/><strong>Live demos tell the full story.</strong> Watching a team demo their product in real-time — with all the nerves, live debugging, and spontaneous pivots — reveals far more than a polished screen share ever could. You see the real product, not the highlight reel.<br/><br/><strong>You can feel the team dynamics.</strong> Being in the room lets you observe how teammates collaborate, support each other, and handle pressure. These soft skills matter enormously for social impact work.<br/><br/><strong>Conversations go deeper.</strong> Face-to-face Q&A creates natural back-and-forth dialogue. You can ask a team to pull up their code, test the app yourself, or dig into their architecture — all in real time.<br/><br/><strong>Fairness across all teams.</strong> When every judge evaluates every team under the same conditions — same room, same energy, same time constraints — the playing field is truly level.<br/><br/><strong>You become part of the experience.</strong> Judges who are physically present absorb the energy of the event. You see the sleep-deprived dedication, the last-minute breakthroughs, and the pride when teams present. That context makes your feedback more meaningful and your scores more informed.<br/><br/><strong>What about virtual hackathons?</strong> We typically run online-only hackathons during the summer, and virtual judging works great for those! But when teams have committed to building together in-person for an entire weekend, having judges physically present honors that commitment and ensures the most authentic evaluation possible. 💻🤝",
  },
  {
    id: "prepare",
    question: "What do judges need to do to prepare?",
    answer: "Great question! Here's your judge prep checklist: 📋<br/><br/>• Review this page thoroughly (you're already crushing it!)<br/>• Watch our orientation video and confirm you've watched it<br/>• If it's a weekend hackathon, you can start reviewing projects as early as Sunday morning on both DevPost and GitHub<br/>• Find the links for teams you'll be judging at the judge dashboard<br/><br/>Pro tip: Come caffeinated and ready to be amazed by what these teams build! ☕",
    actionButton: { text: "Go to Judge Dashboard", href: "/judge" },
  },
  {
    id: "travel",
    question: "What are the travel details? Where should I stay and how do I get there?",
    answer: "All the logistics you need are on the specific hackathon event page! 🗺️<br/><br/>Each event has its own travel guide, recommended hotels, parking info, and local tips. We've got you covered with all the details to make your judging experience smooth.",
  },
  {
    id: "communication",
    question: "How do I communicate with you?",
    answer: "We'll hook you up with a private Slack channel just for judges! 💬<br/><br/>You'll get the invite in your welcome email about 3 weeks before the event. It's where you can ask questions, coordinate with other judges, and get real-time updates. Judge headquarters - but with more emoji and definitely more fun.",
  },
  {
    id: "response-time",
    question: "How quickly will I hear back about my application?",
    answer: "We aim to get back to you within a week! 📬<br/><br/>Because we get so many amazing judge applications (seriously, you all rock!), we review them in batches weekly. You'll get an email either confirming your spot or respectfully declining.<br/><br/>If we're at capacity for judging, definitely consider mentoring instead - it's remote-friendly and equally impactful!",
    actionButton: { text: "Learn About Mentoring", href: "/about/mentors" },
  },
  {
    id: "process",
    question: "Can you tell me more about the overall Opportunity Hack process?",
    answer: "Absolutely! 🎬<br/><br/>Here's the TL;DR: We typically run one major in-person hackathon each year around October (perfect timing for internship season and fall graduation). It's a well-oiled machine designed to create maximum impact for nonprofits while giving participants an incredible experience.",
    actionButton: { text: "See Our Process", href: "/about/process" },
  },
  {
    id: "participants",
    question: "Is the hackathon only for students?",
    answer: "Not at all! We welcome everyone. 🌟<br/><br/>We've seen bootcamp grads, seasoned professionals, high schoolers, and college students all collaborating beautifully. In Arizona specifically, about 70% are students from ASU, University of Arizona, GCU, UAT, Maricopa Community Colleges, and other local schools.<br/><br/>The diversity of backgrounds and experience levels is what makes the magic happen!",
  },
];

const criteriaInfo = [
  {
    category: "scope",
    name: "Scope of solution",
    maxPoints: 10,
    subCriteria: [
      { name: "Impact on community — how many people and nonprofits benefit?", key: "scopeImpact" },
      { name: "Complexity of problem solved — how hard was this versus what already exists?", key: "scopeComplexity" },
    ],
  },
  {
    category: "documentation",
    name: "Documentation",
    maxPoints: 10,
    subCriteria: [
      { name: "Code and UX documentation — clear how to use the solution", key: "documentationCode" },
      { name: "Ease of understanding — straightforward design", key: "documentationEase" },
    ],
  },
  {
    category: "polish",
    name: "Polish",
    maxPoints: 10,
    subCriteria: [
      { name: "Work remaining — minimal work left for an MVP", key: "polishWorkRemaining" },
      { name: "Can use today — deployed and shippable now", key: "polishCanUseToday" },
    ],
  },
  {
    category: "security",
    name: "Security",
    maxPoints: 10,
    subCriteria: [
      { name: "Data protection — hard to access data thanks to security controls", key: "securityData" },
      { name: "Role-based security — admin versus public access (where applicable)", key: "securityRole" },
    ],
  },
];

const specialCategory = {
  name: "Accessibility",
  maxPoints: 5,
  description:
    "Accessibility matters when building software. This special-category prize recognizes teams that excel at the four W3C accessibility principles: perceivable, operable, understandable, and robust. Winners typically achieve a Lighthouse accessibility score above 95.",
  key: "accessibility",
  reference: "https://www.w3.org/WAI/fundamentals/accessibility-principles/",
};

const trackClick = (buttonName) => trackEvent("click_judges", buttonName);

const scrollTo = (id) =>
  setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 100);

// Refined expandable used for FAQ + criteria
function Disclosure({ summary, children, defaultOpen = false }) {
  return (
    <details
      className="ohx-card"
      style={{ padding: "0", marginBottom: 12, overflow: "hidden" }}
      open={defaultOpen}
    >
      <summary
        style={{
          listStyle: "none",
          cursor: "pointer",
          padding: "18px 22px",
          fontFamily: "var(--display)",
          fontSize: "1.05rem",
          fontWeight: 500,
          color: "var(--ink)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        {summary}
        <span className="ohx-faint" style={{ fontSize: "1.4rem", lineHeight: 1, fontFamily: "var(--body)" }}>+</span>
      </summary>
      <div style={{ padding: "0 22px 22px" }}>{children}</div>
    </details>
  );
}

const AboutJudges = () => {
  const initialScores = {
    scopeImpact: 3, scopeComplexity: 3, documentationCode: 3, documentationEase: 3,
    polishWorkRemaining: 3, polishCanUseToday: 3, securityData: 3, securityRole: 3, accessibility: 3,
  };
  const [scores, setScores] = useState(initialScores);
  const [totalScore, setTotalScore] = useState(0);
  const { hackathons: upcomingEvents, loading: loadingEvents } = useHackathonEvents("current");

  useEffect(() => {
    initFacebookPixel();
  }, []);

  useEffect(() => {
    const main = Object.entries(scores)
      .filter(([k]) => k !== "accessibility")
      .reduce((sum, [, v]) => sum + v, 0);
    setTotalScore(main);
  }, [scores]);

  const handleScoreChange = (criterion) => (_, v) => setScores((p) => ({ ...p, [criterion]: v }));

  const formatEventDate = (startDate, endDate) => {
    const start = Moment(startDate);
    const end = Moment(endDate);
    if (start.format("YYYY-MM-DD") === end.format("YYYY-MM-DD")) return start.format("dddd, MMMM Do YYYY");
    return `${start.format("MMM D")} – ${end.format("MMM D, YYYY")}`;
  };

  const renderSlider = (sub) => (
    <div key={sub.key} style={{ width: "100%", marginTop: 18 }}>
      <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: 500 }}>{sub.name}</p>
      <Slider
        value={scores[sub.key]}
        valueLabelFormat={(v) => SCORE_DESCRIPTIONS[v] || ""}
        onChange={handleScoreChange(sub.key)}
        valueLabelDisplay="auto"
        step={1}
        marks
        min={1}
        max={5}
        sx={{ mt: 1, color: "#1B3A6B", "& .MuiSlider-valueLabel": { bgcolor: "#1B3A6B" } }}
      />
      <p className="ohx-faint" style={{ margin: 0, fontSize: "0.85rem" }}>
        Score: {scores[sub.key]} / 5
      </p>
    </div>
  );

  return (
    <>
      <Head>
        <RefinedFonts />
      </Head>
      <RefinedRoot>
        {/* HERO */}
        <section className="ohx-wrap" style={{ paddingTop: "clamp(104px, 13vh, 156px)", paddingBottom: "clamp(28px, 5vh, 48px)" }}>
          <Eyebrow><span className="rise" style={{ display: "inline-block" }}>Volunteer · judge</span></Eyebrow>
          <h1 className="ohx-display rise" style={{ marginTop: 18, maxWidth: "16ch", animationDelay: "60ms" }}>
            Judge solutions that <span className="ohx-italic">change lives.</span>
          </h1>
          <p className="ohx-lead rise" style={{ marginTop: 22, animationDelay: "150ms", maxWidth: "60ch" }}>
            Use your expertise to recognize the most impactful technology for nonprofits — evaluating
            projects on innovation, social impact, and technical excellence, and helping teams improve
            with constructive feedback.
          </p>
          <div className="rise" style={{ marginTop: 30, display: "flex", flexWrap: "wrap", gap: 14, animationDelay: "230ms" }}>
            <a href="#upcoming-events" className="ohx-btn ohx-btn--primary" onClick={() => scrollTo("upcoming-events")}>
              Find events to judge <Arrow />
            </a>
            <Link href="/volunteer" className="ohx-btn ohx-btn--ghost">Explore all roles</Link>
          </div>
        </section>

        {/* HERO IMAGE */}
        <section className="ohx-wrap" style={{ paddingBottom: "clamp(32px, 6vh, 56px)" }}>
          <div className="rise" style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", borderRadius: 10, overflow: "hidden", border: "1px solid var(--line)" }}>
            <Image src="https://cdn.ohack.dev/ohack.dev/judge_1.jpg" alt="Awards presentation after judges evaluated hackathon projects" fill sizes="(max-width: 1120px) 100vw, 1120px" style={{ objectFit: "cover" }} priority />
          </div>
        </section>

        {/* UPCOMING EVENTS */}
        <section id="upcoming-events" style={{ background: "var(--surface-2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", scrollMarginTop: 90 }}>
          <div className="ohx-wrap" style={{ paddingTop: "clamp(48px, 7vh, 80px)", paddingBottom: "clamp(48px, 7vh, 80px)" }}>
            <Eyebrow>Upcoming judging opportunities</Eyebrow>
            <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 10 }}>Where you can help next</h2>
            <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 28, maxWidth: "56ch" }}>
              Join one of our upcoming hackathons as a judge and help identify the most impactful nonprofit technology.
            </p>
            <Box sx={{ minHeight: { xs: 0, md: 180 } }}>
              {loadingEvents ? (
                <p className="ohx-faint">Loading events…</p>
              ) : upcomingEvents && upcomingEvents.length > 0 ? (
                <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
                  {upcomingEvents.map((event) => (
                    <div key={event.event_id} className="ohx-card" style={{ padding: "24px", background: "var(--surface)" }}>
                      <h3 className="ohx-display" style={{ fontSize: "1.25rem" }}>{event.title}</h3>
                      <p className="ohx-faint" style={{ margin: "10px 0 0", fontSize: "0.88rem" }}>{event.location}</p>
                      <p className="ohx-faint" style={{ margin: "4px 0 0", fontSize: "0.88rem" }}>{formatEventDate(event.start_date, event.end_date)}</p>
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
                        <Link href={`/hack/${event.event_id}/judge-application`} className="ohx-btn ohx-btn--primary" style={{ fontSize: "0.9rem", padding: "0.7em 1.1em" }} onClick={() => trackClick("judge_apply_upcoming")}>Apply to judge</Link>
                        <Link href={`/hack/${event.event_id}`} className="ohx-link" style={{ fontSize: "0.9rem" }}>Event details <Arrow /></Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="ohx-card" style={{ padding: "32px 28px", background: "var(--surface)" }}>
                  <p className="ohx-muted" style={{ margin: 0 }}>No upcoming events scheduled right now.</p>
                  <Link href="/hack" className="ohx-link" style={{ marginTop: 12 }}>View all hackathons <Arrow /></Link>
                </div>
              )}
            </Box>
            <div style={{ marginTop: 24, display: "flex", gap: 20, flexWrap: "wrap" }}>
              <Link href="/hack" className="ohx-link">All hackathons <Arrow /></Link>
              <Link href="/signup" className="ohx-link">Join our community <Arrow /></Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="judge-faq" className="ohx-wrap" style={{ paddingTop: "clamp(48px, 8vh, 88px)", paddingBottom: "clamp(40px, 6vh, 64px)", scrollMarginTop: 90 }}>
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 10 }}>Questions, answered</h2>
          <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 28, maxWidth: "56ch" }}>
            The most common questions from our judge community.
          </p>
          <div style={{ maxWidth: 820 }}>
            {FAQ_DATA.map((faq) => (
              <Disclosure key={faq.id} summary={faq.question}>
                <div
                  className="ohx-muted ohx-faq-answer"
                  style={{ fontSize: "0.96rem", lineHeight: 1.6 }}
                  dangerouslySetInnerHTML={{ __html: faq.answer }}
                />
                {faq.actionButton && (
                  <Link href={faq.actionButton.href} className="ohx-link" style={{ marginTop: 16, fontSize: "0.9rem" }} onClick={() => trackClick(`faq_${faq.id}_cta`)}>
                    {faq.actionButton.text} <Arrow />
                  </Link>
                )}
              </Disclosure>
            ))}
          </div>
          <div style={{ marginTop: 24 }}>
            <Link href="/contact" className="ohx-link" onClick={() => trackClick("faq_contact")}>Still have questions? Get in touch <Arrow /></Link>
          </div>
        </section>

        {/* WHY JUDGE */}
        <section className="ohx-wrap" style={{ paddingTop: "clamp(40px, 6vh, 64px)", paddingBottom: "clamp(40px, 6vh, 64px)" }}>
          <Eyebrow>Why become a judge</Eyebrow>
          <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 28 }}>What you get out of it</h2>
          <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
            {[
              { t: "Shape social impact", d: "Help identify solutions nonprofits will actually implement to help their communities." },
              { t: "Grow your profile", d: "Demonstrate expertise and community involvement — valuable for career growth and visa applications." },
              { t: "Build your network", d: "Connect with industry leaders, innovative teams, and mission-driven nonprofits worldwide." },
            ].map((c, i) => (
              <div key={c.t} className="ohx-card rise" style={{ padding: "24px", animationDelay: `${i * 70}ms` }}>
                <h3 className="ohx-display" style={{ fontSize: "1.15rem" }}>{c.t}</h3>
                <p className="ohx-muted" style={{ margin: "10px 0 0", fontSize: "0.95rem", lineHeight: 1.55 }}>{c.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* HOW JUDGING WORKS */}
        <section className="ohx-wrap" style={{ paddingBottom: "clamp(40px, 6vh, 64px)" }}>
          <Eyebrow>How judging works</Eyebrow>
          <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 20 }}>Two stages, one fair process</h2>

          <div className="ohx-card" style={{ padding: "26px 28px", background: "var(--brand)", color: "#fff", marginBottom: 24, border: "none" }}>
            <h3 className="ohx-display" style={{ color: "#fff", fontSize: "1.3rem" }}>Watch the complete judging overview</h3>
            <p style={{ margin: "10px 0 18px", color: "rgba(255,255,255,0.85)", maxWidth: "60ch", fontSize: "0.97rem" }}>
              Real judges explain the scoring system, walk through live demo evaluations, and show exactly how we
              identify the most impactful nonprofit technology.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Link href="/about/judges/overview" className="ohx-btn" style={{ background: "#fff", color: "var(--brand)" }} onClick={() => trackClick("watch_judging_video")}>Watch the video <Arrow /></Link>
              <a href="#judging-criteria" className="ohx-btn ohx-btn--ghost" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.5)" }} onClick={() => scrollTo("judging-criteria")}>See scoring criteria</a>
            </div>
          </div>

          <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            <div className="ohx-card" style={{ padding: "24px" }}>
              <span className="ohx-tag">Stage 1 · Initial assessment</span>
              <h3 className="ohx-display" style={{ fontSize: "1.2rem", marginTop: 12 }}>Pitch videos</h3>
              <p className="ohx-muted" style={{ margin: "10px 0 0", fontSize: "0.95rem", lineHeight: 1.55 }}>
                Evaluate 4-minute pitch videos showing project demos and team presentations. In online hackathons,
                judges ask questions directly in each team&apos;s Slack channel during this round.
              </p>
            </div>
            <div className="ohx-card" style={{ padding: "24px" }}>
              <span className="ohx-tag ohx-tag--accent">Stage 2 · Final evaluation</span>
              <h3 className="ohx-display" style={{ fontSize: "1.2rem", marginTop: 12 }}>Live demos</h3>
              <p className="ohx-muted" style={{ margin: "10px 0 0", fontSize: "0.95rem", lineHeight: 1.55 }}>
                Interact with top teams, ask questions, and give direct feedback on their solutions.
              </p>
            </div>
          </div>
        </section>

        {/* CRITERIA + PRACTICE SCORING */}
        <section id="judging-criteria" style={{ background: "var(--surface-2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", scrollMarginTop: 90 }}>
          <div className="ohx-wrap" style={{ paddingTop: "clamp(48px, 7vh, 80px)", paddingBottom: "clamp(48px, 7vh, 80px)" }}>
            <Eyebrow>Judging criteria & practice scoring</Eyebrow>
            <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 10 }}>Try the scoring system</h2>
            <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 24, maxWidth: "60ch" }}>
              Each project is evaluated across four areas worth 10 points each. Practice with the sliders to get a feel for it.
            </p>
            <div style={{ maxWidth: 820 }}>
              {criteriaInfo.map((c) => (
                <Disclosure key={c.category} summary={`${c.name} · ${c.maxPoints} pts`}>
                  {c.subCriteria.map(renderSlider)}
                </Disclosure>
              ))}
            </div>

            <div className="ohx-card" style={{ padding: "24px 28px", background: "var(--surface)", marginTop: 8, textAlign: "center", maxWidth: 820 }}>
              <span className="ohx-eyebrow">Practice total</span>
              <p className="ohx-display" style={{ fontSize: "2rem", margin: "6px 0 0" }}>{totalScore}<span className="ohx-faint" style={{ fontSize: "1.1rem" }}> / 40</span></p>
            </div>
            <p style={{ marginTop: 20, fontSize: "0.95rem" }}>
              <Link href="/hackathon-judging-criteria" className="ohx-link">
                See the full judging criteria &amp; scorecard →
              </Link>
            </p>

            {/* Special category */}
            <h3 className="ohx-display" style={{ fontSize: "1.3rem", marginTop: 40, marginBottom: 12 }}>Special category prizes</h3>
            <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 18, maxWidth: "60ch" }}>
              Beyond the main criteria, we may offer special-category prizes for excellence in specific areas. These
              are judged separately and don&apos;t affect the main competition score.
            </p>
            <div style={{ maxWidth: 820 }}>
              <Disclosure summary={`${specialCategory.name} · ${specialCategory.maxPoints} pts (special prize)`}>
                <p className="ohx-muted" style={{ marginTop: 0, fontSize: "0.95rem", lineHeight: 1.6 }}>
                  {specialCategory.description}{" "}
                  <a href={specialCategory.reference} target="_blank" rel="noopener noreferrer" className="ohx-link">Learn more</a>
                </p>
                {renderSlider({ name: "Accessibility implementation — how well does it consider users with disabilities?", key: "accessibility" })}
              </Disclosure>
            </div>
          </div>
        </section>

        {/* SPONSORSHIP CALLOUT */}
        <section id="corporate-sponsorship" className="ohx-wrap" style={{ paddingTop: "clamp(40px, 6vh, 64px)", paddingBottom: "clamp(20px, 4vh, 40px)", scrollMarginTop: 90 }}>
          <div className="ohx-card" style={{ padding: "26px 28px", borderLeft: "3px solid var(--accent)" }}>
            <h3 className="ohx-display" style={{ fontSize: "1.2rem" }}>Corporate sponsorship opportunities</h3>
            <p className="ohx-muted" style={{ margin: "10px 0 16px", maxWidth: "64ch", fontSize: "0.96rem" }}>
              Companies can enhance their ESG profile and secure guaranteed judge positions through sponsorship.
              Learn how your organization can support our mission while gaining valuable exposure.
            </p>
            <Link href="/sponsor" className="ohx-link" onClick={() => trackClick("sponsorship_cta")}>Learn about corporate sponsorship <Arrow /></Link>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="ohx-wrap" style={{ paddingTop: "clamp(40px, 6vh, 72px)", paddingBottom: "clamp(56px, 9vh, 104px)", textAlign: "center" }}>
          <Eyebrow>Ready to make a difference?</Eyebrow>
          <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 12 }}>Help nurture the next solution</h2>
          <p className="ohx-muted" style={{ margin: "0 auto 28px", maxWidth: "54ch" }}>
            Join our community of judges identifying and nurturing technology that creates lasting social impact.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#upcoming-events" className="ohx-btn ohx-btn--primary" onClick={() => scrollTo("upcoming-events")}>Find events to judge <Arrow /></a>
            <Link href="/about/mentors" className="ohx-btn ohx-btn--ghost">Consider mentoring instead</Link>
          </div>
        </section>
      </RefinedRoot>
    </>
  );
};

export default AboutJudges;

export const getStaticProps = async () => {
  const title = "Judge Guide - Evaluate Tech Solutions for Social Impact | Opportunity Hack";
  const description =
    "Become an Opportunity Hack judge and evaluate innovative technology solutions that transform nonprofits. Use your expertise to identify projects creating real social impact worldwide.";
  const canonicalUrl = "https://www.ohack.dev/about/judges";
  return {
    props: {
      title: title,
      description: description,
      canonical: canonicalUrl,
      openGraphData: [
        { name: "title", property: "title", content: title, key: "title" },
        { name: "og:title", property: "og:title", content: title, key: "ogtitle" },
        { name: "author", property: "author", content: "Opportunity Hack", key: "author" },
        { name: "og:description", property: "og:description", content: description, key: "ogdescription" },
        { name: "image", property: "og:image", content: "https://cdn.ohack.dev/ohack.dev/judge_1.jpg", key: "ognameimage" },
        { property: "og:image:width", content: "1200", key: "ogimagewidth" },
        { property: "og:image:height", content: "630", key: "ogimageheight" },
        { name: "url", property: "url", content: "https://www.ohack.dev/about/judges", key: "url" },
        { name: "og:url", property: "og:url", content: "https://www.ohack.dev/about/judges", key: "ogurl" },
        { name: "twitter:card", property: "twitter:card", content: "summary_large_image", key: "twittercard" },
        { name: "twitter:site", property: "twitter:site", content: "@opportunityhack", key: "twittersite" },
        { name: "twitter:title", property: "twitter:title", content: title, key: "twittertitle" },
        { name: "twitter:description", property: "twitter:description", content: description, key: "twitterdesc" },
        { name: "twitter:image", property: "twitter:image", content: "https://cdn.ohack.dev/ohack.dev/judge_1.jpg", key: "twitterimage" },
        { name: "twitter:image:alt", property: "twitter:image:alt", content: "Judges evaluating hackathon projects and providing feedback to teams at Opportunity Hack", key: "twitterimagealt" },
        { name: "twitter:creator", property: "twitter:creator", content: "@opportunityhack", key: "twittercreator" },
      ],
      structuredData: {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebPage",
            "@id": canonicalUrl + "#webpage",
            url: canonicalUrl,
            name: title,
            description: description,
            isPartOf: { "@type": "WebSite", "@id": "https://www.ohack.dev/#website" },
            about: {
              "@type": "EducationalOrganization",
              name: "Opportunity Hack Judging Program",
              description: "Judges use their expertise as experienced professionals to give feedback to teams building technology solutions for nonprofits",
            },
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://www.ohack.dev" },
              { "@type": "ListItem", position: 2, name: "About", item: "https://www.ohack.dev/about" },
              { "@type": "ListItem", position: 3, name: "Judges", item: canonicalUrl },
            ],
          },
          {
            "@type": "FAQPage",
            mainEntity: FAQ_DATA.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          },
        ],
      },
    },
  };
};
