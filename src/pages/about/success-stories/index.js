import React, { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { Box } from "@mui/material";
import { initFacebookPixel, trackEvent } from "../../../lib/ga";
import { RefinedRoot, RefinedFonts, Eyebrow, Arrow } from "../../../components/design/refined";

const successStories = [
  {
    key: "matthews-crossing",
    title: "Automated Data Management and Reporting System",
    nonprofit: "Matthews Crossing Food Bank",
    hacker: "James Rowley and Mark Omo (2016, 2018)",
    sponsor:
      "PayPal, TechShop Chandler, Avnet, GoDaddy, Repay, MDI Group, Splunk, Galvanize, InfusionSoft",
    image: "https://cdn.ohack.dev/nonprofit_images/matthews_crossing.webp",
    summary:
      "Developed a comprehensive data management system to automate donation tracking and reporting processes for food banks.",
    impact:
      "Saved an estimated 5 hours per month for key staff, with potential for $150,000 in time savings across 1,600 food banks that already use Food Bank Manager. Improved data accuracy and enabled more timely, insightful decision-making through automated visualizations and reports.",
    testimonial:
      "Matthews Crossing Data Manager has transformed our operations. It's allowed us to redirect valuable volunteer time from paperwork to serving our community. The automated reports and visualizations have given us new insights into our donations and operations, helping us make more informed decisions to better serve the 400,830 people in Maricopa County facing food insecurity where Matthew's Crossing serves about 80,000 people a year - having this solution opens the possibility to serving even more people.",
    caseStudyLink: "/about/success-stories/matthews-crossing-data-automation",
    presentations: [
      {
        title: "Hacker 2018 Solution Presentation",
        url: "https://cdn.ohack.dev/nonprofit_documents/Matthews%20Crossing%202018%20Solution%20Presentation.pdf",
        type: "pdf",
      },
      {
        title: "2018 Problem Presentation",
        url: "https://cdn.ohack.dev/nonprofit_documents/Matthews%20Crossing%202018%20Solution%20Presentation.pdf",
        type: "pdf",
      },
      {
        title: "2017 Problem Presentation",
        url: "https://cdn.ohack.dev/nonprofit_documents/OHack%202017%20-%20Nonprofit%20Presentation%20-%20Matthews%20Crossing.pdf",
        type: "pdf",
      },
    ],
    learnings: [
      "Demonstrated the importance of sustainable, user-friendly solutions for nonprofits with limited technical resources",
      "Highlighted the value of iterative development and returning to improve solutions over multiple years",
      "Showed the potential for tech solutions to significantly impact operational efficiency in nonprofits",
      "Emphasized the need for robust security measures in handling sensitive donation and personal data",
      "Illustrated the importance of open standards and interoperability in nonprofit tech solutions",
      "Revealed the power of data visualization in communicating impact and informing strategy",
      "Underscored the value of close collaboration between tech volunteers and nonprofits to understand and address real needs",
    ],
    technologiesUsed: [
      "PHP",
      "Python",
      "JavaScript",
      "HTML/CSS",
      "CSV data processing",
      "Excel report generation",
      "Data visualization tools",
      "Two-factor authentication",
    ],
    futureProspects:
      "The Matthews Crossing Data Manager has potential for wider adoption among food banks using similar systems. Future enhancements could include more advanced predictive analytics to forecast donation trends and needs, integration with other nonprofit management tools, and mobile applications for real-time data entry and reporting. The success of this project also opens doors for exploring other areas of Matthews Crossing's operations that could benefit from technological solutions, such as volunteer management or distribution logistics optimization.",
  },
  {
    key: "zuris-circle",
    title: "Event Registration and Feedback Analysis System",
    nonprofit: "Zuri's Circle",
    hacker: "Trevor Moore, Jordan Riley, and Carter Rice (2019)",
    sponsor:
      "PayPal, GoDaddy, Repay, MDI Group, Splunk, Galvanize, InfusionSoft",
    image: "https://cdn.ohack.dev/nonprofit_images/Zuris_Circle_2019.webp",
    summary:
      "Created an automated system for event registration, email management, and feedback analysis to improve participant engagement and event evaluation.",
    impact:
      "Streamlined event management process, improved communication with participants, and provided data-driven insights into event success through sentiment analysis.",
    testimonial:
      "Zuri's Dashboard has revolutionized how we interact with our community. It's not just about collecting emails anymore; it's about understanding our impact and continuously improving our services. This technology allows us to focus more on what truly matters - helping families, the elderly, and the homeless in our community.",
    caseStudyLink: "/about/success-stories/zuris-circle-event-management",
    presentations: [
      {
        title: "2019 Problem Presentation",
        url: "https://cdn.ohack.dev/nonprofit_documents/2019.AZ.Opportunity.Hack.-.Zuri.s.Circle.pdf",
        type: "pdf",
      },
    ],
    learnings: [
      "Highlighted the importance of user-friendly data collection systems for small nonprofits",
      "Demonstrated the value of automated communication in maintaining engagement",
      "Showed how machine learning can provide valuable insights from qualitative feedback",
      "Emphasized the need for cost-effective solutions in nonprofit technology",
      "Illustrated the power of cross-disciplinary teams in solving complex problems",
      "Revealed the potential of cloud-based solutions for scalability and accessibility",
      "Underscored the importance of data security and privacy in nonprofit operations",
    ],
    technologiesUsed: [
      "ASP.NET Core 3.0",
      "ML.NET",
      "MongoDB",
      "JSON Web Tokens",
      "Google OAuth 2.0",
      "Twilio / SendGrid",
      "React",
      "Redux",
      "Material UI",
      "Chart.js",
      "Azure",
      "Heroku",
    ],
    futureProspects:
      "Zuri's Dashboard has potential for expansion to include more customized communication features, enhanced analytics, and integration with other nonprofit management tools. Future developments could focus on mobile app development for easier on-site event registration, advanced predictive analytics for event planning, and expanded machine learning capabilities for more nuanced feedback analysis. The success of this project opens opportunities for Zuri's Circle to further leverage technology in areas such as resource allocation, volunteer management, and impact assessment.",
  },
  {
    key: "saving-one-life",
    title: "AI-Enhanced Adoption Process for Animal Rescue",
    nonprofit: "Saving One Life Animal Rescue and Sanctuary",
    hacker:
      "Emilee Spence and Justin Canode (2019), Karishma Joseph and Animesh Mohan (2020)",
    sponsor:
      "PayPal, Galvanize, Motion Recruitment, Tech Talent South, GoDaddy, Dick's Sporting Goods, Keap",
    image: "https://cdn.ohack.dev/nonprofit_images/saving_one_life.webp",
    summary:
      "Developed a multi-phase solution to streamline the adoption process, including an AI-powered compatibility scoring system and a risk assessment tool using social media analysis.",
    impact:
      "While not fully implemented, the project provided invaluable insights into the potential of AI in animal adoption processes. It allowed Saving One Life to explore various technological approaches without the time and money for initial concepts. The project revealed the complexity of using social media for risk assessment of potential animal adopters, a crucial insight that wouldn't have been uncovered without this collaborative effort.",
    testimonial:
      "Opportunity Hack brought together passionate volunteers who understood our mission. Their innovative approach to our adoption process challenges opened our eyes to the potential of technology in animal rescue operations. The exploration of multiple solutions helped us understand what paths could work for us, without the usual risks associated with technology adoption.",
    caseStudyLink: "/about/success-stories/saving-one-life-adoption-innovation",
    presentations: [
      {
        title: "2019 Problem Presentation",
        url: "https://cdn.ohack.dev/nonprofit_documents/3%20-%20SavingOneLife%20-%20OpportunityHack%20Arizona%202019.pdf",
        type: "pdf",
      },
    ],
    learnings: [
      "Demonstrated the potential of AI in matching pets with suitable adopters",
      "Highlighted the importance of data security and privacy in handling adopter information",
      "Showed the value of iterative development in complex nonprofit projects",
      "Emphasized the need for sustainable, long-term solutions in volunteer-driven organizations",
      "Revealed the benefits of exploring multiple technological approaches before committing resources to implementation",
      "Uncovered the unexpected complexity in using social media data for risk assessment of animal adopterst",
      "Illustrated the value of hackathons in providing low-risk environments for nonprofits to experiment with new technologies",
    ],
    technologiesUsed: [
      "Python",
      "Flask",
      "MongoDB",
      "Machine Learning algorithms",
      "Social Media APIs",
      "Data Analysis tools",
    ],
    futureProspects:
      "The project's foundation can be built upon to create a comprehensive, AI-driven adoption management system, potentially revolutionizing how animal rescues operate and increasing successful adoptions. The insights gained about social media analysis complexity can inform future attempts to assess adopter suitability, possibly leading to more nuanced and ethical approaches. This experience has equipped Saving One Life with the knowledge to make more informed decisions about technology adoption in the future, potentially saving time and resources in their digital transformation journey.",
  },
  {
    key: "vidyodaya",
    title: "Modernized Website for Tribal Education Nonprofit",
    nonprofit: "Vidyodaya",
    hacker:
      "Christian Bautista, Emily Adams, Marlon Del Rosario, Harry Henry Gebel (2020)",
    sponsor: "PayPal and Galvanize",
    image: "https://cdn.ohack.dev/nonprofit_images/vidyodaya.webp",
    summary:
      "Developed a modern, user-friendly website with improved navigation and admin functionality to better showcase Vidyodaya's mission of improving education for underprivileged Adivasi children.",
    impact:
      "The redesigned website significantly improved Vidyodaya's online presence, making it easier for visitors to find information and engage with the organization. The new admin functionality allows for easier content management, potentially increasing engagement with their audience.",
    testimonial:
      "Opportunity Hack brought together a talented team who understood our needs. Their redesign of our website has made it much more appealing and user-friendly, which we believe will help us better communicate our mission and engage with our community.",
    caseStudyLink: "/about/success-stories/vidyodaya-website-modernization",
    presentations: [
      {
        title: "2020 Fall Global Hackathon Presentation",
        url: "https://www.ohack.org/about/history/2020-fall-global-hackathon/2020-fall-non-profits#h.e11jkzh61o8i",
        type: "web",
      },
    ],
    learnings: [
      "Demonstrated the importance of user-friendly design in nonprofit websites",
      "Highlighted the value of secure admin functionality for content management",
      "Showed the benefits of responsive design for reaching a wider audience",
      "Emphasized the need for culturally appropriate elements in website design",
      "Revealed the potential of open-source technologies in creating cost-effective solutions for nonprofits",
      "Illustrated the importance of clear navigation in improving user experience",
      "Demonstrated the value of hackathons in providing rapid, high-quality solutions for nonprofits",
    ],
    technologiesUsed: [
      "HTML",
      "CSS",
      "JavaScript",
      "React",
      "Java",
      "Spring",
      "PostgreSQL",
      "OAuth 2.0",
      "Cloudinary",
    ],
    futureProspects:
      "The new website provides a solid foundation for Vidyodaya to expand their online presence. Future enhancements could include a newsletter signup, chat feature for visitor engagement, volunteer and donor dashboards, and full mobile responsiveness. The project has equipped Vidyodaya with a modern digital platform to better support their mission of improving education for Adivasi children.",
  },
  // ... other success stories
];

const trackButtonClick = (title) => {
  trackEvent({
    action: "click_success",
    params: {
      category: "Success Stories",
      label: title,
    },
  });
};

const trackPresentationClick = (title) => {
  trackEvent({
    action: "click_presentation",
    params: {
      category: "Success Stories",
      label: title,
    },
  });
};

export default function SuccessStories() {
  const router = useRouter();


  useEffect(() => {
    initFacebookPixel();
  }, []);

  useEffect(() => {
    // Check if there's a hash in the URL
    if (router.asPath.includes("#")) {
      const id = router.asPath.split("#")[1];
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [router.asPath]);

  return (
    <>
      <Head>
        <title>Opportunity Hack Success Stories: Tech Innovation for Social Good</title>
        <meta name="description" content="Discover how Opportunity Hack connects nonprofits with skilled tech volunteers to create innovative solutions. Read success stories of AI, blockchain, and IoT applications in various social causes." />
        <meta name="keywords" content="Opportunity Hack, nonprofit technology, hackathon success stories, tech for good, AI for animal rescue, social impact tech" />
        <meta property="og:title" content="Opportunity Hack: Transforming Nonprofits through Technology" />
        <meta property="og:description" content="See how developers, designers, and tech companies are making a real-world impact through Opportunity Hack. Join us in using technology for social good." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.ohack.dev/about/success-stories" />
        <meta property="og:image" content="https://www.ohack.dev/images/opportunity-hack-success-banner.jpg" />
        <RefinedFonts />
      </Head>

      <RefinedRoot>
        {/* HERO */}
        <section className="ohx-wrap" style={{ paddingTop: "clamp(104px, 13vh, 156px)", paddingBottom: "clamp(28px, 5vh, 48px)" }}>
          <Eyebrow><span className="rise" style={{ display: "inline-block" }}>Success stories</span></Eyebrow>
          <h1 className="ohx-display rise" style={{ marginTop: 18, maxWidth: "16ch", animationDelay: "60ms" }}>
            Real impact, <span className="ohx-italic">shipped.</span>
          </h1>
          <p className="ohx-lead rise" style={{ marginTop: 22, animationDelay: "150ms", maxWidth: "60ch" }}>
            How skilled tech volunteers and nonprofits team up at Opportunity Hack to build solutions that
            keep working long after the hackathon ends.
          </p>
        </section>

        {/* STORIES */}
        <section className="ohx-wrap" style={{ paddingBottom: "clamp(48px, 8vh, 88px)" }}>
          <div style={{ display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))" }}>
            {successStories.map((story, index) => (
              <article key={index} id={story.key} className="ohx-card rise" style={{ display: "flex", flexDirection: "column", overflow: "hidden", scrollMarginTop: 90, animationDelay: `${Math.min(index, 6) * 70}ms` }}>
                <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", background: "var(--surface-2)" }}>
                  <Image src={story.image} alt={story.title} fill sizes="(max-width: 700px) 100vw, 420px" style={{ objectFit: "cover" }} />
                </div>
                <div style={{ padding: "24px 24px 22px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <span className="ohx-tag" style={{ alignSelf: "flex-start" }}>{story.nonprofit}</span>
                  <h2 className="ohx-display" style={{ fontSize: "1.3rem", marginTop: 12 }}>{story.title}</h2>

                  <dl style={{ margin: "14px 0 0", display: "grid", gap: 6 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <dt className="ohx-eyebrow" style={{ fontSize: "0.6rem", minWidth: 76, paddingTop: 2 }}>Volunteers</dt>
                      <dd className="ohx-muted" style={{ margin: 0, fontSize: "0.88rem" }}>{story.hacker}</dd>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <dt className="ohx-eyebrow" style={{ fontSize: "0.6rem", minWidth: 76, paddingTop: 2 }}>Sponsors</dt>
                      <dd className="ohx-faint" style={{ margin: 0, fontSize: "0.82rem" }}>{story.sponsor}</dd>
                    </div>
                  </dl>

                  <p className="ohx-muted" style={{ margin: "16px 0 0", fontSize: "0.95rem", lineHeight: 1.55 }}>{story.summary}</p>

                  <div style={{ marginTop: 14, padding: "14px 16px", background: "var(--surface-2)", borderRadius: 8, borderLeft: "3px solid var(--accent)" }}>
                    <span className="ohx-eyebrow" style={{ fontSize: "0.6rem" }}>Impact</span>
                    <p className="ohx-muted" style={{ margin: "6px 0 0", fontSize: "0.9rem", lineHeight: 1.5 }}>{story.impact}</p>
                  </div>

                  <p className="ohx-display ohx-italic" style={{ margin: "18px 0 0", fontSize: "1.02rem", lineHeight: 1.45 }}>&ldquo;{story.testimonial}&rdquo;</p>

                  {story.learnings?.length > 0 && (
                    <ul style={{ listStyle: "none", padding: 0, margin: "18px 0 0", display: "flex", flexDirection: "column", gap: 8 }}>
                      {story.learnings.slice(0, 3).map((l, i) => (
                        <li key={i} style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                          <span style={{ color: "var(--accent)", fontWeight: 700 }}>—</span>
                          <span className="ohx-muted" style={{ fontSize: "0.88rem", lineHeight: 1.45 }}>{l}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {story.presentations?.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
                      {story.presentations.map((p, i) => (
                        <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" className="ohx-tag" style={{ textDecoration: "none" }} onClick={() => trackPresentationClick(p.title)}>
                          {p.type === "pdf" ? "PDF" : "Slides"} · {p.title}
                        </a>
                      ))}
                    </div>
                  )}

                  <div style={{ marginTop: "auto", paddingTop: 18 }}>
                    <Link href={story.caseStudyLink} className="ohx-link" style={{ fontSize: "0.9rem" }} onClick={() => trackButtonClick(story.title)}>
                      Read the full case study <Arrow />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* VIDEO */}
        <section style={{ background: "var(--surface-2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
          <div className="ohx-wrap" style={{ paddingTop: "clamp(48px, 7vh, 80px)", paddingBottom: "clamp(48px, 7vh, 80px)" }}>
            <div className="ohx-narrow" style={{ marginInline: "auto", textAlign: "center", marginBottom: 28 }}>
              <Eyebrow>Join the movement</Eyebrow>
              <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 12 }}>See it in two minutes</h2>
              <p className="ohx-muted" style={{ margin: 0 }}>How Opportunity Hack supports nonprofits through technology.</p>
            </div>
            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", maxWidth: 820, margin: "0 auto", borderRadius: 10, border: "1px solid var(--line)" }}>
              <iframe
                src="https://www.youtube.com/embed/_hpam2meMWY?si=XQfQ74uF21gwwWUM"
                title="Opportunity Hack: Transforming Nonprofits Through Technology"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="ohx-wrap" style={{ paddingTop: "clamp(48px, 8vh, 88px)", paddingBottom: "clamp(56px, 9vh, 104px)", textAlign: "center" }}>
          <Eyebrow>Ready to transform your nonprofit?</Eyebrow>
          <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 12 }}>Bring us your challenge</h2>
          <p className="ohx-muted" style={{ margin: "0 auto 28px", maxWidth: "56ch" }}>
            Join hundreds of nonprofits that have benefited from free tech solutions — submit your challenge and our volunteers will help.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/nonprofits/apply" className="ohx-btn ohx-btn--primary">Submit your challenge <Arrow /></Link>
            <Link href="/about/hackers" className="ohx-btn ohx-btn--ghost">Volunteer your skills</Link>
            <Link href="/sponsor" className="ohx-btn ohx-btn--ghost">Sponsor innovation</Link>
          </div>
          <p className="ohx-faint" style={{ marginTop: 18, fontSize: "0.85rem" }}>Applications reviewed regularly · Free for qualifying nonprofits</p>
        </section>
      </RefinedRoot>
    </>
  );
}
