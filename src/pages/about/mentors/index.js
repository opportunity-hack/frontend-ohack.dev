import dynamic from "next/dynamic";
import Head from "next/head";
import Link from "next/link";
import { Box } from "@mui/material";
import { RefinedRoot, RefinedFonts, Eyebrow, Arrow } from "../../../components/design/refined";

const Mentorship = dynamic(
    () => import("../../../components/About/Mentorship/Mentorship"),
    {
        ssr: false,
    }
);

const MentorChecklist = dynamic(
    () => import("../../../components/About/Mentorship/MentorChecklist"),
    {
        ssr: false,
    }
);

const MentorTeamPanelDemo = dynamic(
    () => import("../../../components/Teams/MentorTeamPanelDemo"),
    {
        ssr: false,
    }
);

function Disclosure({ summary, children }) {
    return (
        <details className="ohx-card" style={{ padding: 0, marginBottom: 12, overflow: "hidden" }}>
            <summary style={{ listStyle: "none", cursor: "pointer", padding: "18px 22px", fontFamily: "var(--display)", fontSize: "1.05rem", fontWeight: 500, color: "var(--ink)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                {summary}
                <span className="ohx-faint" style={{ fontSize: "1.4rem", lineHeight: 1, fontFamily: "var(--body)" }}>+</span>
            </summary>
            <div style={{ padding: "0 22px 22px" }}>{children}</div>
        </details>
    );
}

// Visible FAQ content — the FAQPage JSON-LD in getStaticProps mirrors this
// array exactly. Visible UI ↔ schema parity is required for FAQ rich results.
const FAQ_DATA = [
    {
        question: "What does a mentor do at an Opportunity Hack hackathon?",
        answer:
            "Mentors guide hackathon teams during the build phase — answering technical questions, helping debug tricky bugs, advising on architecture and scope, reviewing code, and unblocking teams when they get stuck. A typical mentor circulates among 3-5 teams over the weekend, spending 30-60 minutes with each team across multiple touchpoints. Mentors do not score or judge projects; that role belongs to judges, who are intentionally separate.",
    },
    {
        question: "What's the time commitment to mentor a hackathon?",
        answer:
            "Plan on 8-16 hours over the hackathon weekend. A typical Saturday is 4-6 hours of in-event mentoring, Sunday is another 4-6 hours, plus a 30-minute Friday kickoff briefing. We use a shift signup so mentors can come and go — you do not need to be present continuously. For online events, mentor availability is asynchronous through Discord and the time investment is similar but more flexible.",
    },
    {
        question: "Can I earn a Heart Certificate for mentoring?",
        answer:
            "Yes — Opportunity Hack issues Heart Certificates to mentors who demonstrate genuine engagement during the event. The bar is proactive helpfulness: reaching out to teams directly on Slack (for virtual events) or in person, reviewing code, offering architecture or debugging advice, and following up when a team gets stuck. Simply posting in a general channel that you're available does not qualify. The same standard applies whether you're mentoring remotely or on-site — judges don't just check that you showed up; they look for evidence that teams actually benefited from your involvement. After the hackathon, mentors who met that bar can request their Heart Certificate through the organizer team.",
    },
    {
        question: "Do I need specific technical expertise to be a mentor?",
        answer:
            "No single stack is required. We recruit mentors across full-stack web (React, Next.js, Node, Python, Ruby), mobile (iOS, Android, React Native), data engineering and ML, security, design, product management, and DevOps. When you sign up, you list your areas of expertise and we route team questions to mentors with matching skills. Mentors are expected to know their own stack well; nobody is expected to know every stack.",
    },
    {
        question: "Is mentoring at a hackathon paid?",
        answer:
            "No — mentoring is a volunteer role. Many mentors use it for their employer's ESG / corporate-volunteer-time programs and we provide an attendance letter on request. Sponsor companies can also secure dedicated mentor slots for their teams as part of a sponsorship package — that is a popular professional-development perk and counts toward most ESG goals.",
    },
    {
        question: "Can I mentor a hackathon remotely?",
        answer:
            "Yes. We run online-only events during the summer where all mentoring is remote (Discord and Slack), and most in-person events also have a remote mentor track for our distributed volunteers. Roughly 30% of our mentor pool participates remotely. In-person mentoring tends to be higher-impact for first-time teams (the in-room presence helps), but remote mentoring works well for code-review, architecture discussions, and senior engineers who can't travel.",
    },
    {
        question: "What if I've never mentored a hackathon before?",
        answer:
            "First-time mentors are welcome. We pair new mentors with veterans for their first event so you can shadow before you mentor solo. Before each event we run a 30-minute orientation covering mentor expectations, the team-matching system, escalation paths for hard questions, and the boundary between mentoring (helping the team build) and doing (writing code for the team). After the orientation most first-timers feel ready to jump in.",
    },
    {
        question: "Can I keep working with a team after the hackathon ends?",
        answer:
            "Yes — through our Founding Engineer program. Mentors who want to continue with a project after the event can apply to become Founding Engineers. The Founding Engineer program is unpaid volunteer work that continues for weeks or months post-hackathon, helping the project ship to production, fix bugs, and train the nonprofit's staff. Many of our most experienced mentors started by signing up for one weekend and then continuing with a project they connected with.",
    },
    {
        question: "What's the difference between a mentor and a judge at an Opportunity Hack hackathon?",
        answer:
            "Mentors guide teams during the build phase and do not score projects. Judges arrive Sunday afternoon to evaluate completed projects and do not engage with teams during the build. The roles are intentionally separated to avoid conflict-of-interest. Many volunteers do both at different events; doing both at the same event isn't allowed. If you want to evaluate projects rather than guide their construction, see our Hackathon Judge Opportunities page.",
    },
];

export default function Mentors() {
    return (
        <>
            <Head>
                <RefinedFonts />
            </Head>
            <RefinedRoot>
                <Mentorship />

                {/* YOUR IMPACT, TRACKED */}
                <section style={{ background: "var(--surface-2)", borderTop: "1px solid var(--line)" }}>
                    <div className="ohx-wrap" style={{ paddingTop: "clamp(48px, 7vh, 80px)", paddingBottom: "clamp(48px, 7vh, 80px)" }}>
                        <Eyebrow>Your impact, tracked</Eyebrow>
                        <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 12 }}>A process we&apos;ve built over the years</h2>
                        <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 36, maxWidth: "72ch", lineHeight: 1.6 }}>
                            Mentoring at Opportunity Hack isn&apos;t ad-hoc. Every mentor gets a personal preparation
                            checklist <em>and</em> a per-team support panel other mentors can see live — so coverage is
                            even, nothing falls through the cracks, and your contributions are credited publicly to your name.
                        </p>

                        <h3 className="ohx-display" style={{ fontSize: "1.3rem", marginBottom: 8 }}>1. Your personal mentor checklist</h3>
                        <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 20, maxWidth: "70ch", fontSize: "0.96rem" }}>
                            Use this before, during, and after the event to stay on track. The current phase highlights
                            automatically based on the upcoming event&apos;s schedule.
                        </p>
                        <Box sx={{ mb: 6 }}><MentorChecklist /></Box>

                        <h3 className="ohx-display" style={{ fontSize: "1.3rem", marginBottom: 8 }}>2. What you&apos;ll see on every team&apos;s page</h3>
                        <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 20, maxWidth: "70ch", fontSize: "0.96rem" }}>
                            On <code>/hack/&lt;event&gt;/team/&lt;team_id&gt;</code>, every mentor sees a shared support panel:
                            open concerns owned by a specific mentor so others don&apos;t duplicate effort, a 6-item coverage
                            checklist with attribution, a 4-criterion judging-readiness rubric (worst rating wins, so you
                            coach the weakest area first), and a public notes feed. Live preview below.
                        </p>
                        <Box><MentorTeamPanelDemo /></Box>
                    </div>
                </section>

                {/* FAQ */}
                <section className="ohx-wrap" style={{ paddingTop: "clamp(48px, 7vh, 80px)", paddingBottom: "clamp(40px, 6vh, 64px)" }}>
                    <Eyebrow>FAQ for hackathon mentors</Eyebrow>
                    <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 28 }}>Questions, answered</h2>
                    <div style={{ maxWidth: 820 }}>
                        {FAQ_DATA.map((item, idx) => (
                            <Disclosure key={idx} summary={item.question}>
                                <p className="ohx-muted" style={{ margin: 0, fontSize: "0.96rem", lineHeight: 1.7 }}>{item.answer}</p>
                            </Disclosure>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="ohx-wrap" style={{ paddingBottom: "clamp(56px, 9vh, 104px)" }}>
                    <div className="ohx-card" style={{ padding: "clamp(32px, 5vw, 56px)", textAlign: "center", background: "var(--surface-2)" }}>
                        <h2 className="ohx-display" style={{ marginBottom: 12 }}>Ready to mentor?</h2>
                        <p className="ohx-muted" style={{ margin: "0 auto 28px", maxWidth: "54ch" }}>
                            Apply through any active event above, or browse adjacent ways to volunteer your senior expertise.
                        </p>
                        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                            <Link href="/hack" className="ohx-btn ohx-btn--primary">See upcoming hackathons <Arrow /></Link>
                            <Link href="/hackathon-judge-opportunities" className="ohx-btn ohx-btn--ghost">Apply to judge instead</Link>
                        </div>
                    </div>
                </section>
            </RefinedRoot>
        </>
    );
}

export const getStaticProps = async () => {
    const title = "Mentor Guide - Shape the Future of Tech for Good | Opportunity Hack";
    const description = "Become a mentor at Opportunity Hack and guide talented teams building life-changing technology solutions for nonprofits. Share your expertise, develop leadership skills, and create lasting social impact through code.";
    const canonicalUrl = "https://www.ohack.dev/about/mentors";
    return {
        props: {
            title: title,
            description: description,
            canonical: canonicalUrl,
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
                    content: "https://cdn.ohack.dev/ohack.dev/2024_hackathon_4.webp",
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
                    content: canonicalUrl,
                    key: "url"
                },
                {
                    name: "og:url",
                    property: "og:url",
                    content: canonicalUrl,
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
                    content: "https://cdn.ohack.dev/ohack.dev/2024_hackathon_4.webp",
                    key: "twitterimage"
                },
                {
                    name: "twitter:image:alt",
                    property: "twitter:image:alt",
                    content: "Mentor helping a participant at Opportunity Hack hackathon, demonstrating hands-on guidance and support",
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
                        "@type": "WebPage",
                        "@id": canonicalUrl + "#webpage",
                        "url": canonicalUrl,
                        "name": title,
                        "description": description,
                        "isPartOf": {
                            "@type": "WebSite",
                            "@id": "https://www.ohack.dev/#website"
                        },
                        "about": {
                            "@type": "EducationalOrganization",
                            "name": "Opportunity Hack Mentorship Program",
                            "description": "A mentorship program connecting experienced technologists with teams building solutions for nonprofits"
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
                                "name": "About",
                                "item": "https://www.ohack.dev/about"
                            },
                            {
                                "@type": "ListItem",
                                "position": 3,
                                "name": "Mentors",
                                "item": canonicalUrl
                            }
                        ]
                    },
                    {
                        "@type": "FAQPage",
                        "mainEntity": FAQ_DATA.map((faq) => ({
                            "@type": "Question",
                            "name": faq.question,
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": faq.answer,
                            },
                        })),
                    }
                ]
            }
        },
    };
};
