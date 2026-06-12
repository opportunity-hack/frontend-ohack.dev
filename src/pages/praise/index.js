import React, { useEffect } from "react";
import Head from "next/head";
import { Box } from "@mui/material";
import PraiseBoard from "../../components/Praise/PraiseBoard";
import ScrollTracker from "../../components/ScrollTracker";
import * as ga from "../../lib/ga";
import { RefinedRoot, RefinedFonts, Eyebrow, Arrow } from "../../components/design/refined";

const PraisePage = () => {
  useEffect(() => {
    ga.trackJourneyStep("community_engagement", "view_praise_board", {
      page_type: "community_content",
      content_section: "praise",
      has_interactive_elements: true,
    });
    ga.trackContentEngagement("community_feature", "praise_board", ga.EventAction.VIEW, {
      entry_source: document.referrer || "direct",
    });
  }, []);

  const handleSlackClick = () => {
    ga.trackContentEngagement("cta_click", "slack_praise_instruction", ga.EventAction.CLICK);
    window.open("https://app.slack.com/client/T1Q7936BH", "_blank");
  };

  return (
    <>
      <Head>
        <title>Community Praise Board | Opportunity Hack</title>
        <meta name="description" content="View praises and recognition for the outstanding contributions of our community members. Celebrate the positive impact of Opportunity Hack volunteers and mentors." />
        <meta name="keywords" content="Opportunity Hack, community praise, recognition, tech volunteers, nonprofit tech, community appreciation, kudos" />
        <meta property="og:title" content="OHack Community Praise Board" />
        <meta property="og:description" content="Celebrating the amazing contributions of our OHack community members." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.ohack.dev/praise" />
        <meta property="og:image" content="https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://www.ohack.dev/praise" />
        <RefinedFonts />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Community Praise Board",
            "description": "View praises and recognition for the outstanding contributions of our community members at Opportunity Hack.",
            "url": "https://www.ohack.dev/praise",
            "mainEntity": { "@type": "ItemList", "itemListElement": [ { "@type": "ListItem", "position": 1, "name": "Community Praises" } ] }
          }
        `}</script>
      </Head>

      <ScrollTracker pageType="praise_board" />

      <RefinedRoot>
        {/* HERO */}
        <section className="ohx-wrap" style={{ paddingTop: "clamp(104px, 13vh, 156px)", paddingBottom: "clamp(24px, 4vh, 40px)" }}>
          <Eyebrow><span className="rise" style={{ display: "inline-block" }}>Community · recognition</span></Eyebrow>
          <h1 className="ohx-display rise" style={{ marginTop: 18, maxWidth: "15ch", animationDelay: "60ms" }}>
            The praise <span className="ohx-italic">board.</span>
          </h1>
          <p className="ohx-lead rise" style={{ marginTop: 22, animationDelay: "150ms", maxWidth: "56ch" }}>
            Where our community celebrates each other — recognizing the people who show up, help out, and make
            Opportunity Hack what it is.
          </p>
          <div className="rise" style={{ marginTop: 28, display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", animationDelay: "230ms" }}>
            <button type="button" className="ohx-btn ohx-btn--primary" onClick={handleSlackClick}>
              Send praise on Slack <Arrow />
            </button>
            <span className="ohx-faint" style={{ fontSize: "0.9rem" }}>
              Use the <strong style={{ color: "var(--ink)", fontWeight: 600 }}>/praise</strong> command in Slack to recognize someone.
            </span>
          </div>
        </section>

        {/* HOW TO */}
        <section className="ohx-wrap" style={{ paddingBottom: "clamp(28px, 5vh, 48px)" }}>
          <div className="ohx-card" style={{ padding: "22px 24px", borderLeft: "3px solid var(--accent)" }}>
            <span className="ohx-eyebrow">How to send praise</span>
            <p className="ohx-muted" style={{ margin: "8px 0 0", fontSize: "0.96rem", lineHeight: 1.6 }}>
              Join our Slack community and type <strong style={{ color: "var(--ink)" }}>/praise</strong> to recognize
              someone&apos;s great work — it shows up here for everyone to see.
            </p>
          </div>
        </section>

        {/* BOARD */}
        <section className="ohx-wrap" style={{ paddingBottom: "clamp(40px, 6vh, 72px)" }}>
          <PraiseBoard />
        </section>

        {/* FOOTER CTA */}
        <section style={{ background: "var(--surface-2)", borderTop: "1px solid var(--line)" }}>
          <div className="ohx-wrap" style={{ paddingTop: "clamp(48px, 7vh, 80px)", paddingBottom: "clamp(48px, 7vh, 80px)", textAlign: "center" }}>
            <h2 className="ohx-display" style={{ marginBottom: 12 }}>Keep the positivity flowing</h2>
            <p className="ohx-muted" style={{ margin: "0 auto 28px", maxWidth: "48ch" }}>
              Our community thrives on mutual appreciation. Jump in and recognize someone today.
            </p>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
              <button type="button" className="ohx-btn ohx-btn--primary" onClick={handleSlackClick}>
                Join our Slack <Arrow />
              </button>
              <span className="ohx-faint" style={{ fontSize: "0.9rem" }}>
                Use <strong style={{ color: "var(--ink)", fontWeight: 600 }}>/praise</strong> to spread the love.
              </span>
            </Box>
          </div>
        </section>
      </RefinedRoot>
    </>
  );
};

export default PraisePage;
