import React, { useEffect } from "react";
import Moment from "moment";
import Link from "next/link";
import Image from "next/image";
import { Box } from "@mui/material";
import LoginOrRegister from "../../LoginOrRegister/LoginOrRegister";
import { initFacebookPixel, trackEvent } from "../../../lib/ga";
import useHackathonEvents from "../../../hooks/use-hackathon-events";
import { Eyebrow, Arrow } from "../../design/refined";

const track = (name) => trackEvent("click_mentors", name);

const mentorTypes = [
  { title: "Technical mentor", description: "Guide teams through technical challenges, architecture decisions, and implementation.", skills: ["Software engineering", "Full-stack", "Architecture", "Code review"] },
  { title: "Product mentor", description: "Help teams understand user needs, define scope, and prioritize features effectively.", skills: ["Product strategy", "User research", "Prioritization", "Market analysis"] },
  { title: "UX / design mentor", description: "Support teams in creating user-centered designs and improving the experience.", skills: ["UX design", "Prototyping", "Design systems", "User testing"] },
  { title: "Cloud & DevOps mentor", description: "Help teams deploy their solutions and implement scalable infrastructure.", skills: ["Cloud platforms", "CI/CD", "Infrastructure as code", "Deployment"] },
  { title: "Presentation mentor", description: "Guide teams in creating compelling presentations and effective pitches.", skills: ["Public speaking", "Storytelling", "Pitch development", "Communication"] },
  { title: "Project management mentor", description: "Help teams organize work, manage timelines, and coordinate effectively.", skills: ["Agile", "Coordination", "Timelines", "Risk"] },
];

const mentorGuidelines = [
  { title: "Team assignment & preferences", content: "You have flexibility in how you mentor. During application you can be matched to a team based on your expertise, pick your preferred team(s), or rotate between several. Tell us your preference and we'll accommodate your style and the teams' needs." },
  { title: "Nonprofit context understanding", content: "Each team works with a specific nonprofit partner. Take time to understand the nonprofit's mission, constraints, and real-world challenges — that context is crucial for guiding teams toward practical, implementable solutions." },
  { title: "Time commitment & availability", content: "We ask for a minimum 3-hour commitment, but the most effective mentors engage for 6-8 hours across the event. You can mentor remotely through Slack and video, or attend in person if the event is local to you." },
  { title: "Communication best practices", content: "Use team Slack channels for ongoing communication. Schedule regular check-ins (every 4-6 hours). Ask probing questions rather than giving direct answers — help teams discover solutions independently while guiding them when truly stuck." },
];

function Disclosure({ summary, children }) {
  return (
    <details className="ohx-card" style={{ padding: 0, marginBottom: 12, overflow: "hidden" }}>
      <summary style={{ listStyle: "none", cursor: "pointer", padding: "18px 22px", fontFamily: "var(--display)", fontSize: "1.05rem", fontWeight: 500, color: "var(--ink)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        {summary}
        <span className="ohx-faint" style={{ fontSize: "1.4rem", lineHeight: 1, fontFamily: "var(--body)" }}>+</span>
      </summary>
      <div style={{ padding: "0 22px 22px" }}>
        <p className="ohx-muted" style={{ margin: 0, fontSize: "0.96rem", lineHeight: 1.6 }}>{children}</p>
      </div>
    </details>
  );
}

const Mentorship = () => {
  const { hackathons: upcomingEvents, loading: loadingEvents } = useHackathonEvents("current");

  useEffect(() => {
    initFacebookPixel();
  }, []);

  const formatEventDate = (s, e) => {
    const start = Moment(s);
    const end = Moment(e);
    if (start.format("YYYY-MM-DD") === end.format("YYYY-MM-DD")) return start.format("dddd, MMMM Do YYYY");
    return `${start.format("MMM D")} – ${end.format("MMM D, YYYY")}`;
  };

  const scrollTo = (id) => setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 100);

  return (
    <>
      {/* HERO */}
      <section className="ohx-wrap" style={{ paddingTop: "clamp(104px, 13vh, 156px)", paddingBottom: "clamp(28px, 5vh, 48px)" }}>
        <Eyebrow><span className="rise" style={{ display: "inline-block" }}>Volunteer · mentor</span></Eyebrow>
        <h1 className="ohx-display rise" style={{ marginTop: 18, maxWidth: "16ch", animationDelay: "60ms" }}>
          Guide teams building <span className="ohx-italic">for good.</span>
        </h1>
        <p className="ohx-lead rise" style={{ marginTop: 22, animationDelay: "150ms", maxWidth: "60ch" }}>
          Share your expertise to help teams build meaningful technology for nonprofits. You&apos;ll guide
          participants through technical challenges, strategic decisions, and product development — and help
          nonprofits achieve their missions through code.
        </p>
        <div className="rise" style={{ marginTop: 30, display: "flex", flexWrap: "wrap", gap: 14, animationDelay: "230ms" }}>
          <a href="#upcoming-events" className="ohx-btn ohx-btn--primary" onClick={() => { scrollTo("upcoming-events"); track("find_events_hero"); }}>Find events to mentor <Arrow /></a>
          <Link href="/volunteer" className="ohx-btn ohx-btn--ghost" onClick={() => track("explore_roles_hero")}>Explore all roles</Link>
        </div>

        <div className="ohx-card rise" style={{ marginTop: 28, padding: "22px 24px", borderLeft: "3px solid var(--accent)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, animationDelay: "300ms" }}>
          <div>
            <span className="ohx-eyebrow">New to mentoring at OHack?</span>
            <p className="ohx-muted" style={{ margin: "6px 0 0", fontSize: "0.95rem", maxWidth: "52ch" }}>
              Watch the complete overview to see what mentoring really means, the mentor types, and best practices.
            </p>
          </div>
          <Link href="/about/mentors/overview" className="ohx-btn ohx-btn--primary" style={{ fontSize: "0.9rem", padding: "0.7em 1.1em" }} onClick={() => track("watch_overview_video")}>Watch overview <Arrow /></Link>
        </div>
      </section>

      {/* HERO IMAGE */}
      <section className="ohx-wrap" style={{ paddingBottom: "clamp(32px, 6vh, 56px)" }}>
        <div className="rise" style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", borderRadius: 10, overflow: "hidden", border: "1px solid var(--line)" }}>
          <Image src="https://cdn.ohack.dev/ohack.dev/2024_hackathon_4.webp" alt="A mentor guiding a hackathon participant" fill sizes="(max-width: 1120px) 100vw, 1120px" style={{ objectFit: "cover" }} priority />
        </div>
      </section>

      {/* UPCOMING EVENTS */}
      <section id="upcoming-events" style={{ background: "var(--surface-2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", scrollMarginTop: 90 }}>
        <div className="ohx-wrap" style={{ paddingTop: "clamp(48px, 7vh, 80px)", paddingBottom: "clamp(48px, 7vh, 80px)" }}>
          <Eyebrow>Upcoming mentoring opportunities</Eyebrow>
          <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 10 }}>Where you can help next</h2>
          <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 28, maxWidth: "56ch" }}>
            Join an upcoming hackathon as a mentor and make a direct impact on nonprofit technology.
          </p>
          <Box sx={{ minHeight: { xs: 0, md: 180 } }}>
            {loadingEvents ? (
              <p className="ohx-faint">Loading events…</p>
            ) : upcomingEvents && upcomingEvents.length > 0 ? (
              <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
                {upcomingEvents.map((event) => (
                  <div key={event.event_id} className="ohx-card" style={{ padding: "24px", background: "var(--surface)" }}>
                    <h3 className="ohx-display" style={{ fontSize: "1.25rem" }}>{event.title}</h3>
                    <p className="ohx-faint" style={{ margin: "10px 0 0", fontSize: "0.88rem" }}>{event.location}</p>
                    <p className="ohx-faint" style={{ margin: "4px 0 0", fontSize: "0.88rem" }}>{formatEventDate(event.start_date, event.end_date)}</p>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18, alignItems: "center" }}>
                      <Link href={`/hack/${event.event_id}/mentor-application`} className="ohx-btn ohx-btn--primary" style={{ fontSize: "0.9rem", padding: "0.7em 1.1em" }} onClick={() => track("mentor_apply_upcoming")}>Apply to mentor</Link>
                      <Link href={`/hack/${event.event_id}/mentor-checkin`} className="ohx-link" style={{ fontSize: "0.9rem" }}>Check-in</Link>
                      <Link href={`/hack/${event.event_id}`} className="ohx-link" style={{ fontSize: "0.9rem" }}>Details <Arrow /></Link>
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

      {/* WHY MENTOR */}
      <section className="ohx-wrap" style={{ paddingTop: "clamp(48px, 7vh, 80px)", paddingBottom: "clamp(32px, 5vh, 56px)" }}>
        <Eyebrow>Why become a mentor</Eyebrow>
        <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 28 }}>More than volunteering</h2>
        <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
          {[
            { t: "Make real impact", d: "Guide teams creating solutions nonprofits actually implement to help their communities." },
            { t: "Develop leadership", d: "Sharpen your mentoring and leadership skills while helping the next generation of technologists." },
            { t: "Expand your network", d: "Connect with passionate developers, designers, and nonprofits from around the world." },
          ].map((c, i) => (
            <div key={c.t} className="ohx-card rise" style={{ padding: "24px", animationDelay: `${i * 70}ms` }}>
              <h3 className="ohx-display" style={{ fontSize: "1.15rem" }}>{c.t}</h3>
              <p className="ohx-muted" style={{ margin: "10px 0 0", fontSize: "0.95rem", lineHeight: 1.55 }}>{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MENTOR TYPES */}
      <section className="ohx-wrap" style={{ paddingBottom: "clamp(32px, 5vh, 56px)" }}>
        <Eyebrow>Types of mentors we need</Eyebrow>
        <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 10 }}>Bring whatever you know best</h2>
        <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 28, maxWidth: "60ch" }}>
          We welcome mentors from all technical backgrounds — pick the area that fits your expertise.
        </p>
        <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          {mentorTypes.map((m) => (
            <div key={m.title} className="ohx-card" style={{ padding: "24px" }}>
              <h3 className="ohx-display" style={{ fontSize: "1.15rem" }}>{m.title}</h3>
              <p className="ohx-muted" style={{ margin: "10px 0 14px", fontSize: "0.93rem", lineHeight: 1.55 }}>{m.description}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {m.skills.map((s) => <span key={s} className="ohx-tag">{s}</span>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* GUIDELINES */}
      <section className="ohx-wrap" style={{ paddingBottom: "clamp(32px, 5vh, 56px)" }}>
        <Eyebrow>Guidelines & best practices</Eyebrow>
        <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 10 }}>How to be a great mentor</h2>
        <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 22, maxWidth: "60ch" }}>
          The essentials for an effective experience — for you and your teams.{" "}
          <Link href="/about/mentors/overview" className="ohx-link" onClick={() => track("watch_overview_from_guidelines")}>Watch the overview video <Arrow /></Link>
        </p>
        <div style={{ maxWidth: 820 }}>
          {mentorGuidelines.map((g) => <Disclosure key={g.title} summary={g.title}>{g.content}</Disclosure>)}
        </div>
      </section>

      {/* SPONSORSHIP CALLOUT */}
      <section className="ohx-wrap" style={{ paddingBottom: "clamp(20px, 4vh, 40px)" }}>
        <div className="ohx-card" style={{ padding: "26px 28px", borderLeft: "3px solid var(--accent)" }}>
          <h3 className="ohx-display" style={{ fontSize: "1.2rem" }}>Your mentorship counts toward sponsorship</h3>
          <p className="ohx-muted" style={{ margin: "10px 0 16px", maxWidth: "64ch", fontSize: "0.96rem" }}>
            By tracking your volunteer hours as a mentor, you or your company can be recognized as an Opportunity Hack sponsor.
          </p>
          <Link href="/sponsor" className="ohx-link" onClick={() => track("sponsorship_cta")}>Learn about sponsorship recognition <Arrow /></Link>
        </div>
      </section>

      {/* CTA */}
      <section className="ohx-wrap" style={{ paddingTop: "clamp(20px, 4vh, 40px)", paddingBottom: "clamp(32px, 5vh, 56px)", textAlign: "center" }}>
        <Eyebrow>Ready to make a difference?</Eyebrow>
        <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 12 }}>Join our mentor community</h2>
        <p className="ohx-muted" style={{ margin: "0 auto 28px", maxWidth: "54ch" }}>
          Use your expertise to create technology that helps nonprofits change the world.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="#upcoming-events" className="ohx-btn ohx-btn--primary" onClick={() => scrollTo("upcoming-events")}>Find events to mentor <Arrow /></a>
          <Link href="/about/judges" className="ohx-btn ohx-btn--ghost">Consider judging instead</Link>
        </div>
      </section>

      <section className="ohx-wrap" style={{ paddingBottom: "clamp(24px, 4vh, 48px)" }}>
        <LoginOrRegister introText="Ready to join our mentor community?" previousPage={"/about/mentors"} />
      </section>
    </>
  );
};

export default Mentorship;
