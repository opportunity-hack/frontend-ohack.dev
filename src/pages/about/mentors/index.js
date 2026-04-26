import dynamic from "next/dynamic";
import Link from "next/link";
import {
    Container,
    Box,
    Typography,
    Paper,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Button,
} from "@mui/material";
import { ExpandMoreRounded, GavelRounded, GroupsRounded } from "@mui/icons-material";

const Mentorship = dynamic(
    () => import("../../../components/About/Mentorship/Mentorship"),
    {
        ssr: false,
    }
);

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
            <Mentorship />
            <Container maxWidth="lg">
                <Box sx={{ padding: "2rem", mb: 5 }}>
                    <Typography variant="h2" component="h2" gutterBottom>
                        Frequently Asked Questions for Hackathon Mentors
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            mb: 4,
                            maxWidth: "700px",
                            fontSize: "18px",
                            color: "text.secondary",
                        }}
                    >
                        Common questions from technology professionals considering a
                        mentor role at Opportunity Hack.
                    </Typography>

                    {FAQ_DATA.map((item, idx) => (
                        <Accordion key={idx} sx={{ mb: 1 }}>
                            <AccordionSummary expandIcon={<ExpandMoreRounded />}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {item.question}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography
                                    variant="body1"
                                    sx={{ fontSize: "16px", lineHeight: 1.7 }}
                                >
                                    {item.answer}
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                    ))}

                    <Paper
                        elevation={0}
                        sx={{
                            mt: 5,
                            p: 4,
                            textAlign: "center",
                            bgcolor: "grey.50",
                            borderRadius: 2,
                        }}
                    >
                        <Typography variant="h5" component="h3" gutterBottom>
                            Ready to Mentor?
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                mb: 3,
                                maxWidth: "600px",
                                mx: "auto",
                                color: "text.secondary",
                            }}
                        >
                            Apply through any active event above, or browse adjacent
                            ways to volunteer your senior expertise.
                        </Typography>
                        <Box
                            sx={{
                                display: "flex",
                                gap: 2,
                                justifyContent: "center",
                                flexWrap: "wrap",
                            }}
                        >
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                component={Link}
                                href="/hack"
                                startIcon={<GroupsRounded />}
                            >
                                See Upcoming Hackathons
                            </Button>
                            <Button
                                variant="outlined"
                                color="primary"
                                size="large"
                                component={Link}
                                href="/hackathon-judge-opportunities"
                                startIcon={<GavelRounded />}
                            >
                                Apply to Judge Instead
                            </Button>
                        </Box>
                    </Paper>
                </Box>
            </Container>
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
