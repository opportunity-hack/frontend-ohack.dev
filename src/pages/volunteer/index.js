import React, { useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import Moment from "moment";
import { Box } from "@mui/material";
import { initFacebookPixel, trackEvent } from '../../lib/ga';
import {
  CodeRounded, AssignmentRounded, BrushRounded, BarChartRounded, AccountTreeRounded,
  PeopleRounded, EngineeringRounded, VolunteerActivismRounded, LabelImportantRounded, PersonRounded, WorkRounded,
} from "@mui/icons-material";
import useHackathonEvents from '../../hooks/use-hackathon-events';
import { RefinedRoot, RefinedFonts, Eyebrow, Stat, Arrow } from '../../components/design/refined';

function Disclosure({ summary, defaultOpen, onOpen, children }) {
  return (
    <details
      open={defaultOpen}
      onToggle={(e) => { if (e.currentTarget.open && onOpen) onOpen(); }}
      style={{ marginTop: 14 }}
    >
      <summary style={{ listStyle: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, color: "var(--brand)", fontWeight: 600, fontSize: "0.9rem" }}>
        {summary}
      </summary>
      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
    </details>
  );
}

const VolunteerPage = () => {
  const { hackathons: upcomingEvents, loading: loadingEvents } = useHackathonEvents("current");

  useEffect(() => {
    initFacebookPixel();
  }, []);

  const track = (action, label) => {
    trackEvent({ action: `volunteer_${action}`, params: { event_label: label, page: 'volunteer' } });
  };

  const roleTypes = {
    hacker: {
      title: "Hacker",
      emoji: "🚀",
      subtitle: "Build Solutions",
      description: "You're a developer, designer, or technical creator who wants to build technology solutions for nonprofits.",
      color: "primary",
      roles: [
        {
          title: "Software Engineers",
          icon: <CodeRounded />,
          description: "Frontend, backend, full-stack developers who can build web apps, mobile apps, and APIs.",
          skills: ["React", "Python", "Java", "Node.js", "Mobile development"]
        },
        {
          title: "UX/UI Designers",
          icon: <BrushRounded />,
          description: "Create user-friendly interfaces and improve user experience for nonprofit solutions.",
          skills: ["Figma", "Adobe Creative Suite", "User research", "Prototyping", "Visual design"]
        },
        {
          title: "Data Scientists",
          icon: <BarChartRounded />,
          description: "Analyze nonprofit data, create visualizations, and develop predictive models.",
          skills: ["Python", "R", "SQL", "Tableau", "Machine Learning", "Statistics"]
        },
        {
          title: "DevOps Engineers",
          icon: <AccountTreeRounded />,
          description: "Deploy and maintain solutions in the cloud so nonprofits can actually use them.",
          skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Cloud architecture"]
        }
      ]
    },
    mentor: {
      title: "Mentor",
      emoji: "🎯",
      subtitle: "Guide Teams",
      description: "You're an experienced professional who can guide teams, provide technical expertise, and help make strategic decisions.",
      color: "secondary",
      roles: [
        {
          title: "Engineers",
          icon: <EngineeringRounded />,
          description: "Guide technical architecture decisions, code reviews, and best practices.",
          skills: ["2+ years experience", "System design", "Code review", "Technical leadership"]
        },
        {
          title: "Product Managers",
          icon: <AssignmentRounded />,
          description: "Help define project scope, prioritize features, and ensure product-market fit.",
          skills: ["Product strategy", "User stories", "Roadmap planning", "Stakeholder management"]
        },
        {
          title: "Industry Experts",
          icon: <WorkRounded />,
          description: "Share domain expertise in nonprofit work, business strategy, or specific industries.",
          skills: ["Domain expertise", "Strategic thinking", "Business development", "Nonprofit experience"]
        },
        {
          title: "Engineering Managers",
          icon: <PeopleRounded />,
          description: "Lead teams, ensure project delivery, and maintain team morale and productivity.",
          skills: ["Team leadership", "Project management", "Agile methodologies", "People management"]
        }
      ]
    },
    volunteer: {
      title: "Volunteer",
      emoji: "🤝",
      subtitle: "Support Events",
      description: "You want to help make our hackathons and events successful through logistics, coordination, and community building.",
      color: "success",
      roles: [
        {
          title: "Event Coordinators",
          icon: <LabelImportantRounded />,
          description: "Help with event planning, logistics, and coordination. Virtual or in-person.",
          skills: ["Organization", "Communication", "Event planning", "Problem solving"]
        },
        {
          title: "Registration & Check-in",
          icon: <PersonRounded />,
          description: "Welcome participants, manage registration, and help with onboarding.",
          skills: ["Customer service", "Organization", "People skills", "Attention to detail"]
        },
        {
          title: "Marketing & Social Media",
          icon: <PeopleRounded />,
          description: "Promote events, create content, and build our community presence.",
          skills: ["Social media", "Content creation", "Marketing", "Community building"]
        },
        {
          title: "General Support",
          icon: <VolunteerActivismRounded />,
          description: "Assist with various event needs, food service, setup, and participant support.",
          skills: ["Flexibility", "Teamwork", "Positive attitude", "Willingness to help"]
        }
      ]
    },
    judge: {
      title: "Judge",
      emoji: "⚖️",
      subtitle: "Evaluate Solutions",
      description: "You're an experienced professional who can evaluate team solutions, provide constructive feedback, and help select winning projects.",
      color: "warning",
      roles: [
        {
          title: "Technical Judges",
          icon: <EngineeringRounded />,
          description: "Evaluate technical implementation, code quality, architecture, and feasibility of solutions.",
          skills: ["Software engineering", "System architecture", "Code review", "Technical leadership"]
        },
        {
          title: "Product Judges",
          icon: <AssignmentRounded />,
          description: "Assess user experience, market fit, and overall product viability for nonprofit use.",
          skills: ["Product management", "UX evaluation", "Market analysis", "User research"]
        },
        {
          title: "Nonprofit Sector Judges",
          icon: <VolunteerActivismRounded />,
          description: "Evaluate solutions based on nonprofit needs, impact potential, and sector expertise.",
          skills: ["Nonprofit experience", "Social impact", "Sector knowledge", "Mission alignment"]
        },
        {
          title: "Industry Expert Judges",
          icon: <WorkRounded />,
          description: "Bring domain-specific expertise to evaluate solutions in specialized areas.",
          skills: ["Domain expertise", "Industry knowledge", "Strategic thinking", "Innovation assessment"]
        }
      ]
    }
  };

  const impactStats = [
    { value: "10+", label: "Years of Impact" },
    { value: "300+", label: "Nonprofits Helped" },
    { value: "5,000+", label: "Volunteers" },
    { value: "4", label: "Ways to Contribute" },
  ];

  const formatEventDate = (startDate, endDate) => {
    const start = Moment(startDate);
    const end = Moment(endDate);

    if (start.format('YYYY-MM-DD') === end.format('YYYY-MM-DD')) {
      return start.format('dddd, MMMM Do YYYY');
    }

    return `${start.format('MMM D')} - ${end.format('MMM D, YYYY')}`;
  };

  const ROLE_GUIDE = { judge: ["/about/judges", "Read the complete Judge Guide"], mentor: ["/about/mentors", "Read the complete Mentor Guide"] };

  return (
    <>
      <Head>
        <RefinedFonts />
      </Head>
      <RefinedRoot>
        {/* HERO */}
        <section className="ohx-wrap" style={{ paddingTop: "clamp(104px, 13vh, 156px)", paddingBottom: "clamp(28px, 5vh, 44px)" }}>
          <Eyebrow><span className="rise" style={{ display: "inline-block" }}>Volunteer</span></Eyebrow>
          <h1 className="ohx-display rise" style={{ marginTop: 18, maxWidth: "16ch", animationDelay: "60ms" }}>
            Use your skills <span className="ohx-italic">for good.</span>
          </h1>
          <p className="ohx-lead rise" style={{ marginTop: 22, animationDelay: "150ms", maxWidth: "60ch" }}>
            Join Opportunity Hack as a hacker, mentor, volunteer, or judge — and help build technology
            solutions that nonprofits actually use.
          </p>
          <div className="rise" style={{ marginTop: 30, display: "flex", flexWrap: "wrap", gap: 14, animationDelay: "230ms" }}>
            <a href="#upcoming-events" className="ohx-btn ohx-btn--primary" onClick={(e) => { e.preventDefault(); track("hero_cta", "find_event"); document.getElementById("upcoming-events")?.scrollIntoView({ behavior: "smooth" }); }}>Find an event <Arrow /></a>
            <a href="#roles" className="ohx-btn ohx-btn--ghost" onClick={(e) => { e.preventDefault(); track("hero_cta", "explore_roles"); document.getElementById("roles")?.scrollIntoView({ behavior: "smooth" }); }}>Explore roles</a>
          </div>
          <hr className="ohx-rule rise" style={{ marginTop: 48, animationDelay: "320ms" }} />
          <div className="rise" style={{ marginTop: 26, display: "flex", flexWrap: "wrap", gap: "clamp(32px, 6vw, 80px)", animationDelay: "380ms" }}>
            {impactStats.map((s) => <Stat key={s.label} value={s.value} label={s.label} />)}
          </div>
        </section>

        {/* HERO IMAGE */}
        <section className="ohx-wrap" style={{ paddingBottom: "clamp(32px, 6vh, 56px)" }}>
          <div className="rise" style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", borderRadius: 10, overflow: "hidden", border: "1px solid var(--line)" }}>
            <Image src="https://cdn.ohack.dev/ohack.dev/2024_hackathon_2.webp" alt="Hackers, mentors, volunteers, and judges collaborating at an Opportunity Hack event" fill sizes="(max-width: 1120px) 100vw, 1120px" style={{ objectFit: "cover" }} priority />
          </div>
        </section>

        {/* UPCOMING EVENTS */}
        <section id="upcoming-events" style={{ background: "var(--surface-2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", scrollMarginTop: 90 }}>
          <div className="ohx-wrap" style={{ paddingTop: "clamp(48px, 7vh, 80px)", paddingBottom: "clamp(48px, 7vh, 80px)" }}>
            <Eyebrow>Find upcoming events</Eyebrow>
            <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 10 }}>Ready to jump in?</h2>
            <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 28, maxWidth: "56ch" }}>
              Our upcoming hackathons — where you can hack, mentor, volunteer, or judge.
            </p>
            <Box sx={{ minHeight: { xs: 0, md: 180 } }}>
              {loadingEvents ? (
                <p className="ohx-faint">Loading events…</p>
              ) : upcomingEvents && upcomingEvents.length > 0 ? (
                <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
                  {upcomingEvents.map((event) => (
                    <div key={event.event_id} className="ohx-card" style={{ padding: "24px", background: "var(--surface)" }}>
                      <h3 className="ohx-display" style={{ fontSize: "1.2rem" }}>{event.title}</h3>
                      <p className="ohx-faint" style={{ margin: "10px 0 0", fontSize: "0.85rem" }}>{event.location}</p>
                      <p className="ohx-faint" style={{ margin: "4px 0 0", fontSize: "0.85rem" }}>{formatEventDate(event.start_date, event.end_date)}</p>
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18, alignItems: "center" }}>
                        <Link href={`/hack/${event.event_id}/hacker-application`} className="ohx-btn ohx-btn--primary" style={{ fontSize: "0.88rem", padding: "0.65em 1em" }} onClick={() => track("event_apply", `hacker_${event.event_id}`)}>Apply as hacker</Link>
                        <Link href={`/hack/${event.event_id}/mentor-application`} className="ohx-link" style={{ fontSize: "0.85rem" }} onClick={() => track("event_apply", `mentor_${event.event_id}`)}>Mentor</Link>
                        <Link href={`/hack/${event.event_id}/volunteer-application`} className="ohx-link" style={{ fontSize: "0.85rem" }} onClick={() => track("event_apply", `volunteer_${event.event_id}`)}>Volunteer</Link>
                        <Link href={`/hack/${event.event_id}/judge-application`} className="ohx-link" style={{ fontSize: "0.85rem" }} onClick={() => track("event_apply", `judge_${event.event_id}`)}>Judge</Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="ohx-card" style={{ padding: "32px 28px", background: "var(--surface)" }}>
                  <p className="ohx-muted" style={{ margin: 0 }}>No upcoming events scheduled. Check back soon.</p>
                  <Link href="/hack" className="ohx-link" style={{ marginTop: 12 }}>View all hackathons <Arrow /></Link>
                </div>
              )}
            </Box>
            <div style={{ marginTop: 24, display: "flex", gap: 20, flexWrap: "wrap" }}>
              <Link href="/hack" className="ohx-link" onClick={() => track("events_cta", "view_all_hackathons")}>All hackathons <Arrow /></Link>
              <Link href="/signup" className="ohx-link" onClick={() => track("events_cta", "join_slack")}>Join our Slack <Arrow /></Link>
            </div>
          </div>
        </section>

        {/* CHOOSE YOUR ROLE */}
        <section id="roles" className="ohx-wrap" style={{ paddingTop: "clamp(48px, 7vh, 80px)", paddingBottom: "clamp(32px, 5vh, 56px)", scrollMarginTop: 90 }}>
          <Eyebrow>Choose your role</Eyebrow>
          <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 10 }}>Find your fit</h2>
          <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 28, maxWidth: "56ch" }}>
            Expand any role to see specializations.
          </p>
          <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
            {Object.entries(roleTypes).map(([key, roleType]) => (
              <div key={key} className="ohx-card" style={{ padding: "26px", borderLeft: "3px solid var(--brand)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: "1.6rem", lineHeight: 1 }} aria-hidden="true">{roleType.emoji}</span>
                  <div>
                    <h3 className="ohx-display" style={{ fontSize: "1.3rem" }}>{roleType.title}</h3>
                    <span className="ohx-tag" style={{ marginTop: 6 }}>{roleType.subtitle}</span>
                  </div>
                </div>
                <p className="ohx-muted" style={{ margin: "14px 0 0", fontSize: "0.95rem", lineHeight: 1.55 }}>{roleType.description}</p>
                {ROLE_GUIDE[key] && (
                  <Link href={ROLE_GUIDE[key][0]} className="ohx-link" style={{ marginTop: 12, fontSize: "0.88rem" }} onClick={() => track("guide_link", `${key}_guide`)}>
                    {ROLE_GUIDE[key][1]} <Arrow />
                  </Link>
                )}
                <Disclosure summary={`View specializations (${roleType.roles.length})`} onOpen={() => track("role_expand", key)}>
                  {roleType.roles.map((role) => (
                    <div key={role.title} style={{ padding: "14px 16px", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--line)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ color: "var(--brand)", display: "inline-flex" }}>{role.icon}</span>
                        <span className="ohx-display" style={{ fontSize: "1rem" }}>{role.title}</span>
                      </div>
                      <p className="ohx-muted" style={{ margin: "8px 0 10px", fontSize: "0.88rem", lineHeight: 1.5 }}>{role.description}</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {role.skills.map((s) => <span key={s} className="ohx-tag" style={{ fontSize: "0.72rem" }}>{s}</span>)}
                      </div>
                    </div>
                  ))}
                </Disclosure>
              </div>
            ))}
          </div>
        </section>

        {/* ADDITIONAL RESOURCES */}
        <section className="ohx-wrap" style={{ paddingBottom: "clamp(40px, 6vh, 64px)" }}>
          <Eyebrow>More ways to support</Eyebrow>
          <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 24 }}>Adjacent paths</h2>
          <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            {[
              ["/about/judges", "Become a judge", "become_judge"],
              ["/sponsor", "Sponsor us", "sponsor"],
              ["/about/success-stories", "Success stories", "success_stories"],
              ["/nonprofits", "View projects", "view_projects"],
            ].map(([href, label, tr]) => (
              <Link key={href} href={href} className="ohx-card ohx-card--hover" style={{ padding: "18px 20px", textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }} onClick={() => track("resource_link", tr)}>
                <span style={{ fontWeight: 500 }}>{label}</span>
                <span className="ohx-faint">→</span>
              </Link>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section style={{ background: "var(--brand)", color: "#fff" }}>
          <div className="ohx-wrap" style={{ paddingTop: "clamp(48px, 7vh, 88px)", paddingBottom: "clamp(48px, 7vh, 88px)", textAlign: "center" }}>
            <h2 className="ohx-display" style={{ color: "#fff" }}>Ready to make a difference?</h2>
            <p style={{ margin: "14px auto 28px", maxWidth: "50ch", color: "rgba(255,255,255,0.85)", fontSize: "1.05rem" }}>
              Join thousands of volunteers using their skills for social good.
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/hack" className="ohx-btn" style={{ background: "#fff", color: "var(--brand)" }} onClick={() => track("final_cta", "find_event")}>Find an event <Arrow /></Link>
              <Link href="/signup" className="ohx-btn ohx-btn--ghost" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.5)" }} onClick={() => track("final_cta", "join_slack")}>Join Slack</Link>
              <Link href="/onboarding" className="ohx-btn ohx-btn--ghost" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.5)" }} onClick={() => track("final_cta", "start_onboarding")}>Start onboarding</Link>
            </div>
          </div>
        </section>
      </RefinedRoot>
    </>
  );
};

export default VolunteerPage;


export const getStaticProps = async () => {
    const title = "Volunteer as a Developer, Mentor, or Judge | Opportunity Hack";
    const description = "Use your tech skills for social good. Volunteer with Opportunity Hack as a developer, mentor, or hackathon judge to help nonprofits build the software they need.";
    return {
        props: {
            title: title,
            description: description,
            openGraphData: [
                {
                    name: "title",
                    property: "title",
                    content: title,
                    key: "title"
                },
                {
                    name: "og:title",
                    property: "og:title",
                    content: title,
                    key: "ogtitle"
                },
                {
                    name: "author",
                    property: "author",
                    content: "Opportunity Hack",
                    key: "author"
                },
                {
                    name: "og:description",
                    property: "og:description",
                    content: description,
                    key: "ogdescription"
                },
                {
                    name: "image",
                    property: "og:image",
                    content: "https://cdn.ohack.dev/ohack.dev/2024_hackathon_2.webp",
                    key: "ognameimage"
                },
                {
                    property: "og:image:width",
                    content: "1200",
                    key: "ogimagewidth",
                },
                {
                    property: "og:image:height",
                    content: "630",
                    key: "ogimageheight",
                },
                {
                    name: "url",
                    property: "url",
                    content: "https://www.ohack.dev/volunteer",
                    key: "url"
                },
                {
                    name: "og:url",
                    property: "og:url",
                    content: "https://www.ohack.dev/volunteer",
                    key: "ogurl"
                },
                {
                    name: "twitter:card",
                    property: "twitter:card",
                    content: "summary_large_image",
                    key: "twittercard"
                },
                {
                    name: "twitter:site",
                    property: "twitter:site",
                    content: "@opportunityhack",
                    key: "twittersite"
                },
                {
                    name: "twitter:title",
                    property: "twitter:title",
                    content: title,
                    key: "twittertitle"
                },
                {
                    name: "twitter:description",
                    property: "twitter:description",
                    content: description,
                    key: "twitterdesc"
                },
                {
                    name: "twitter:image",
                    property: "twitter:image",
                    content: "https://cdn.ohack.dev/ohack.dev/2024_hackathon_2.webp",
                    key: "twitterimage"
                },
                {
                    name: "twitter:image:alt",
                    property: "twitter:image:alt",
                    content: "Volunteers, mentors, and hackers collaborating at an Opportunity Hack event to build technology solutions for nonprofits",
                    key: "twitterimagealt"
                },
                {
                    name: "twitter:creator",
                    property: "twitter:creator",
                    content: "@opportunityhack",
                    key: "twittercreator"
                }
            ],
            structuredData: {
                "@context": "https://schema.org",
                "@graph": [
                    {
                        "@type": "Organization",
                        "@id": "https://www.ohack.dev/#organization",
                        "name": "Opportunity Hack",
                        "url": "https://www.ohack.dev",
                        "logo": {
                            "@type": "ImageObject",
                            "url": "https://cdn.ohack.dev/ohack.dev/2024_hackathon_2.webp"
                        },
                        "sameAs": [
                            "https://twitter.com/opportunityhack",
                            "https://github.com/opportunity-hack"
                        ]
                    },
                    {
                        "@type": "WebPage",
                        "@id": "https://www.ohack.dev/volunteer#webpage",
                        "url": "https://www.ohack.dev/volunteer",
                        "name": title,
                        "description": description,
                        "isPartOf": {
                            "@type": "WebSite",
                            "@id": "https://www.ohack.dev/#website"
                        },
                        "about": {
                            "@type": "VolunteerEvent",
                            "name": "Opportunity Hack Volunteer Program",
                            "description": "Our volunteer program has opportunities for developers, mentors, and event supporters to contribute to nonprofit technology solutions"
                        }
                    },
                    {
                        "@type": "BreadcrumbList",
                        "itemListElement": [
                            {
                                "@type": "ListItem",
                                "position": 1,
                                "name": "Home",
                                "item": "https://www.ohack.dev"
                            },
                            {
                                "@type": "ListItem",
                                "position": 2,
                                "name": "Volunteer",
                                "item": "https://www.ohack.dev/volunteer"
                            }
                        ]
                    },
                    {
                        "@type": "ItemList",
                        "name": "Volunteer Opportunities",
                        "description": "Various ways to contribute to Opportunity Hack",
                        "itemListElement": [
                            {
                                "@type": "ListItem",
                                "position": 1,
                                "name": "Hacker - Build Solutions",
                                "description": "Developers and designers who build technology solutions for nonprofits"
                            },
                            {
                                "@type": "ListItem",
                                "position": 2,
                                "name": "Mentor - Guide Teams",
                                "description": "Experienced professionals who guide teams and provide technical expertise"
                            },
                            {
                                "@type": "ListItem",
                                "position": 3,
                                "name": "Volunteer - Support Events",
                                "description": "Event coordinators and support staff who help make hackathons successful"
                            },
                            {
                                "@type": "ListItem",
                                "position": 4,
                                "name": "Judge - Evaluate Solutions",
                                "description": "Judges who evaluate and provide feedback on technology solutions built during hackathons"
                            },
                            {
                                "@type": "ListItem",
                                "position": 5,
                                "name": "Sponsor - Support Our Mission",
                                "description": "Organizations and individuals who sponsor Opportunity Hack events and initiatives"
                            }
                        ]
                    }
                ]
            }
        },
    };
};
