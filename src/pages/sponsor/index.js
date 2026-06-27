import React, { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { Box, Skeleton } from "@mui/material";
import { initFacebookPixel, trackEvent } from "../../lib/ga";
import SponsorshipSlider from "../../components/Hackathon/SponsorshipSlider";
import useHackathonEvents from "../../hooks/use-hackathon-events";
import { RefinedRoot, RefinedFonts, Eyebrow, Arrow } from "../../components/design/refined";

const { sponsorLevels, sponsors, calculateSupport } = require("../../data/sponsorData");

const getContactLink = () => "/contact";

const benefitsData = [
  { benefit: "Logo on website", innovator: "3 months", changemaker: "6 months", transformer: "1 year", visionary: "2 years" },
  { benefit: "Social media promotion", innovator: "1 post", changemaker: "2 posts", transformer: "4 posts", visionary: "6 posts" },
  { benefit: "Booth at Sponsor Fair", innovator: "—", changemaker: "Yes", transformer: "Yes", visionary: "Yes" },
  { benefit: "Opening/closing ceremony", innovator: "—", changemaker: "1 min", transformer: "2 min", visionary: "5 min" },
  { benefit: "Judging panel seats", innovator: "1", changemaker: "1", transformer: "2", visionary: "3", learn: "/about/judges" },
  { benefit: "Mentorship opportunities", innovator: "Unlimited", changemaker: "Unlimited", transformer: "Unlimited", visionary: "Unlimited", learn: "/about/mentors" },
  { benefit: "Branded prize category", innovator: "—", changemaker: "—", transformer: "1", visionary: "2" },
  { benefit: "Logo on event t-shirts", innovator: "Small", changemaker: "Medium", transformer: "Large", visionary: "Premium" },
  { benefit: "Access to participant resumes", innovator: "—", changemaker: "—", transformer: "Yes", visionary: "Yes" },
  { benefit: "Sponsored workshop/tech talk", innovator: "—", changemaker: "—", transformer: "30 min", visionary: "1 hour" },
  { benefit: "Recruiting/interviews", innovator: "—", changemaker: "Post-event", transformer: "During & post", visionary: "Pre, during & post" },
];

const whySponsor = [
  { title: "Drive social innovation", description: "Your support enables tech solutions that address real challenges nonprofits face, amplifying their impact." },
  { title: "Engage passionate talent", description: "Connect with skilled developers and innovators committed to using technology for social good." },
  { title: "Showcase your CSR", description: "Demonstrate your company's commitment to social causes and technology-driven solutions for nonprofits." },
  { title: "Foster partnerships", description: "Build relationships with nonprofits, tech communities, and socially-conscious people creating change." },
];

const successStories = [
  { name: "Matthews Crossing Food Bank", text: "Streamlined donation tracking, saving hundreds of volunteer hours annually.", href: "/about/success-stories#matthews-crossing" },
  { name: "Zuri's Circle", text: "An event management system that increased volunteer engagement by 40%.", href: "/about/success-stories#zuris-circle" },
  { name: "Vidyodaya", text: "A modern, user-friendly website that boosted online visibility and donations.", href: "/about/success-stories#vidyodaya" },
];

const engagement = [
  { title: "Sponsor Fair", description: "Showcase your brand and interact directly with participants at our dedicated Sponsor Fair." },
  { title: "Tech talks & workshops", description: "Present your latest technologies and share expertise through talks and hands-on workshops." },
  { title: "Branded challenges", description: "Create a custom challenge using your technologies, with dedicated prizes for the best solutions." },
];

export default function SponsorIndexList() {
  const [selectedAmount, setSelectedAmount] = useState(0);
  const { hackathons, loading: hackathonsLoading } = useHackathonEvents("current");

  useEffect(() => {
    initFacebookPixel();
  }, []);

  const gaButton = (category, action) => trackEvent(category, action);
  const hasEvents = hackathons && hackathons.length > 0;

  const scrollToOpps = (e) => {
    if (e) e.preventDefault();
    document.getElementById("current-opportunities")?.scrollIntoView({ behavior: "smooth" });
  };

  // Current sponsors within a tier (grayscale logos / be-first prompt)
  const tierSponsors = (level, nextMin) =>
    sponsors.filter((s) => {
      const t = calculateSupport(s.hours, s.donations);
      return t >= level.minSupport && (nextMin ? t < nextMin : true);
    });

  return (
    <>
      <Head>
        <title>Hackathon Sponsorship — Sponsor Tech for Good | Opportunity Hack</title>
        <meta name="description" content="Sponsor Opportunity Hack and reach 500+ skilled engineers passionate about social good. 501(c)(3) tax-deductible. Sponsorship tiers from $500. Connect your brand with developers building free software for nonprofits." />
        <meta name="keywords" content="hackathon sponsorship, companies sponsoring hackathons, tech for good sponsorship, corporate social responsibility, nonprofit tech, 501c3" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.ohack.dev/sponsor" />
        <meta property="og:title" content="Hackathon Sponsorship — Sponsor Tech for Good | Opportunity Hack" />
        <meta property="og:description" content="Sponsor Opportunity Hack and reach 500+ skilled engineers passionate about social good. 501(c)(3) tax-deductible. Sponsorship tiers from $500. Connect your brand with developers building free software for nonprofits." />
        <meta property="og:image" content="https://cdn.ohack.dev/ohack.dev/2023_hackathon_4.webp" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://www.ohack.dev/sponsor" />
        <meta property="twitter:title" content="Hackathon Sponsorship — Sponsor Tech for Good | Opportunity Hack" />
        <meta property="twitter:description" content="Sponsor Opportunity Hack and reach 500+ skilled engineers passionate about social good. 501(c)(3) tax-deductible. Sponsorship tiers from $500." />
        <meta property="twitter:image" content="https://cdn.ohack.dev/ohack.dev/2023_hackathon_4.webp" />
        <link rel="canonical" href="https://www.ohack.dev/sponsor" />
        <meta name="robots" content="index, follow" />
        <RefinedFonts />
      </Head>

      <RefinedRoot>
        {/* HERO */}
        <section className="ohx-wrap" style={{ paddingTop: "clamp(104px, 13vh, 156px)", paddingBottom: "clamp(28px, 5vh, 48px)" }}>
          <Eyebrow><span className="rise" style={{ display: "inline-block" }}>Sponsor · partner</span></Eyebrow>
          <h1 className="ohx-display rise" style={{ marginTop: 18, maxWidth: "16ch", animationDelay: "60ms" }}>
            Power technology <span className="ohx-italic">for nonprofits.</span>
          </h1>
          <p className="ohx-lead rise" style={{ marginTop: 22, animationDelay: "150ms", maxWidth: "60ch" }}>
            Your sponsorship fuels creativity, supports nonprofits, and connects you with passionate tech
            talent dedicated to making a difference.
          </p>
          <div className="rise" style={{ marginTop: 30, display: "flex", flexWrap: "wrap", gap: 14, animationDelay: "230ms" }}>
            {hasEvents ? (
              <a href="#current-opportunities" className="ohx-btn ohx-btn--primary" onClick={scrollToOpps}>View opportunities <Arrow /></a>
            ) : (
              <Link href={getContactLink()} className="ohx-btn ohx-btn--primary">Contact us about sponsorship <Arrow /></Link>
            )}
            <a href="#sponsorship-levels" className="ohx-btn ohx-btn--ghost" onClick={(e) => { e.preventDefault(); document.getElementById("sponsorship-levels")?.scrollIntoView({ behavior: "smooth" }); }}>See levels &amp; benefits</a>
          </div>
          <p className="ohx-muted rise" style={{ marginTop: 18, fontSize: "0.95rem", animationDelay: "300ms" }}>
            Hiring engineers, PMs, or designers?{" "}
            <Link href="/recruit-tech-talent" className="ohx-link">Recruit tech talent at Opportunity Hack <Arrow /></Link>
          </p>
        </section>

        {/* CURRENT OPPORTUNITIES */}
        <section id="current-opportunities" style={{ background: "var(--surface-2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", scrollMarginTop: 90 }}>
          <div className="ohx-wrap" style={{ paddingTop: "clamp(48px, 7vh, 80px)", paddingBottom: "clamp(48px, 7vh, 80px)" }}>
            <Eyebrow>Current sponsorship opportunities</Eyebrow>
            <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 10 }}>Sponsor an upcoming hackathon</h2>
            <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 28, maxWidth: "62ch" }}>
              Make a direct impact on nonprofits and the tech community. For the data behind 12 years of OHack, see our{" "}
              <Link href="/12-years-of-social-good" className="ohx-link">12-Year Field Report</Link>.
            </p>
            <Box sx={{ minHeight: { xs: 0, md: 200 } }}>
              {hackathonsLoading ? (
                <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
                  {[0, 1].map((i) => <Skeleton key={i} variant="rectangular" height={240} sx={{ borderRadius: "8px" }} />)}
                </div>
              ) : hasEvents ? (
                <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
                  {hackathons.map((event) => {
                    const s = new Date(event.start_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
                    const e = new Date(event.end_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
                    return (
                      <div key={event.event_id} className="ohx-card" style={{ background: "var(--surface)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                        {event.image_url && (
                          <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9" }}>
                            <Image src={event.image_url} alt={event.title} fill sizes="(max-width: 700px) 100vw, 360px" style={{ objectFit: "cover" }} />
                          </div>
                        )}
                        <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", flex: 1 }}>
                          <h3 className="ohx-display" style={{ fontSize: "1.25rem" }}>{event.title}</h3>
                          <p className="ohx-faint" style={{ margin: "8px 0 0", fontSize: "0.85rem" }}>{s}{s !== e ? ` – ${e}` : ""}{event.location ? ` · ${event.location}` : ""}</p>
                          <p className="ohx-muted" style={{ margin: "12px 0 0", fontSize: "0.93rem", lineHeight: 1.5 }}>
                            {event.description || "Join us for this impactful hackathon where technology meets social good."}
                          </p>
                          {event.nonprofits?.length > 0 && (
                            <p className="ohx-faint" style={{ margin: "10px 0 0", fontSize: "0.85rem" }}>Benefiting {event.nonprofits.length} nonprofit{event.nonprofits.length !== 1 ? "s" : ""}</p>
                          )}
                          <div style={{ marginTop: "auto", paddingTop: 18 }}>
                            <Link href={`/hack/${event.event_id}/sponsor-application`} className="ohx-btn ohx-btn--primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => gaButton("button_sponsor_application", `sponsor_${event.event_id}`)}>
                              Apply to sponsor this event
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="ohx-card" style={{ padding: "36px 28px", background: "var(--surface)", textAlign: "center" }}>
                  <p className="ohx-muted" style={{ margin: "0 0 18px" }}>No active hackathons right now — we&apos;re planning the next one.</p>
                  <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                    <Link href="/hack" className="ohx-btn ohx-btn--primary">View past events</Link>
                    <Link href={getContactLink()} className="ohx-btn ohx-btn--ghost">Contact us about future sponsorship</Link>
                  </div>
                </div>
              )}
            </Box>
            <div style={{ marginTop: 24 }}>
              <Link href={getContactLink()} className="ohx-link" onClick={() => gaButton("button_general_contact", "general_sponsor_contact")}>Questions? Contact us <Arrow /></Link>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section className="ohx-wrap" style={{ paddingTop: "clamp(48px, 7vh, 80px)", paddingBottom: "clamp(32px, 5vh, 56px)" }}>
          <Eyebrow>About Opportunity Hack</Eyebrow>
          <div style={{ marginTop: 18, display: "grid", gap: "clamp(28px, 5vw, 56px)", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", alignItems: "center" }}>
            <div>
              <p className="ohx-muted" style={{ marginTop: 0, lineHeight: 1.65 }}>
                A premier hackathon bringing together talented students and professionals to build innovative
                solutions for nonprofits. Local Arizona companies — see our{" "}
                <Link href="/hackathons/arizona" className="ohx-link">Arizona hackathons page</Link> for the
                local-philanthropy angle.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: "18px 0 0", display: "flex", flexDirection: "column", gap: 8 }}>
                {["Over 300 participants", "25 projects submitted", "Local and online judges", "Top teams won cash prizes and follow-up projects"].map((t) => (
                  <li key={t} style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                    <span style={{ color: "var(--accent)", fontWeight: 700 }}>—</span>
                    <span className="ohx-muted" style={{ fontSize: "0.96rem" }}>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ position: "relative", width: "100%", aspectRatio: "4 / 3", borderRadius: 10, overflow: "hidden", border: "1px solid var(--line)" }}>
              <Image src="https://cdn.ohack.dev/ohack.dev/2023_hackathon_4.webp" alt="Opportunity Hack 2023 participants" fill sizes="(max-width: 700px) 100vw, 540px" style={{ objectFit: "cover" }} />
            </div>
          </div>
        </section>

        {/* MENTORS */}
        <section className="ohx-wrap" style={{ paddingBottom: "clamp(32px, 5vh, 56px)" }}>
          <Eyebrow>Our mentors</Eyebrow>
          <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 10 }}>High-caliber talent in the room</h2>
          <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 24, maxWidth: "60ch" }}>
            Our 2023 event drew 30+ mentors from leading tech companies and universities.
          </p>
          <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            {[
              { t: "Tech giants", d: "Meta, Spotify, PayPal, eBay" },
              { t: "Innovative companies", d: "Honeywell, World Wide Technology, Pixee" },
              { t: "Academic institutions", d: "Arizona State University, Rutgers, University of Toronto" },
            ].map((c) => (
              <div key={c.t} className="ohx-card" style={{ padding: "22px 24px" }}>
                <span className="ohx-eyebrow">{c.t}</span>
                <p style={{ margin: "10px 0 0", fontWeight: 500 }}>{c.d}</p>
              </div>
            ))}
          </div>
          <p className="ohx-muted" style={{ marginTop: 18, maxWidth: "70ch", fontSize: "0.95rem" }}>
            Expertise spans front-end and back-end, mobile, data science and ML, cloud (AWS / GCP / Azure),
            UX/UI, product and program management, and DevOps. As a sponsor you can bring your own mentors or
            engage with these — a unique networking and recruitment opportunity.
          </p>
        </section>

        {/* SPONSORSHIP LEVELS */}
        <section id="sponsorship-levels" style={{ background: "var(--surface-2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", scrollMarginTop: 90 }}>
          <div className="ohx-wrap" style={{ paddingTop: "clamp(48px, 7vh, 80px)", paddingBottom: "clamp(48px, 7vh, 80px)" }}>
            <Eyebrow>Sponsorship levels &amp; benefits</Eyebrow>
            <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 28 }}>Find your level</h2>
            <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" }}>
              {sponsorLevels.map((level, index) => {
                const list = tierSponsors(level, sponsorLevels[index + 1]?.minSupport);
                return (
                  <div key={level.name} className="ohx-card" style={{ background: "var(--surface)", padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                    <div style={{ height: 4, background: level.color }} />
                    <div style={{ padding: "22px 22px 24px", display: "flex", flexDirection: "column", flex: 1 }}>
                      <h3 className="ohx-display" style={{ fontSize: "1.3rem" }}>{level.name}</h3>
                      <p className="ohx-faint" style={{ margin: "6px 0 16px", fontSize: "0.85rem" }}>${level.minSupport}+ in support or equivalent volunteer hours</p>
                      <span className="ohx-eyebrow" style={{ fontSize: "0.62rem" }}>Current sponsors</span>
                      <div className="ohx-sponsors" style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", flex: 1 }}>
                        {list.length > 0 ? (
                          list.map((s) => (
                            <a key={s.name} href={s.website} target="_blank" rel="noopener noreferrer" title={s.name} style={{ display: "inline-flex" }}>
                              <Image src={s.logo} alt={s.name} width={72} height={32} style={{ width: "auto", height: 28, objectFit: "contain" }} />
                            </a>
                          ))
                        ) : (
                          <p className="ohx-faint" style={{ margin: 0, fontSize: "0.85rem" }}>Be the first {level.name} sponsor.</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Benefits table */}
            <h3 className="ohx-display" style={{ fontSize: "1.4rem", marginTop: 44, marginBottom: 18 }}>What each level includes</h3>
            <div style={{ overflowX: "auto", border: "1px solid var(--line)", borderRadius: 8, background: "var(--surface)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem", minWidth: 560 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "12px 16px", borderBottom: "1px solid var(--line)", fontFamily: "var(--body)", fontWeight: 600, color: "var(--muted)" }}>Benefit</th>
                    {sponsorLevels.map((l) => (
                      <th key={l.name} style={{ padding: "12px 14px", borderBottom: "1px solid var(--line)", borderLeft: "1px solid var(--line)", fontFamily: "var(--display)", fontWeight: 500 }}>
                        {l.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {benefitsData.map((row) => (
                    <tr key={row.benefit}>
                      <td style={{ padding: "11px 16px", borderTop: "1px solid var(--line)" }}>
                        {row.benefit}
                        {row.learn && (
                          <>{" "}<Link href={row.learn} className="ohx-link" style={{ fontSize: "0.78rem" }}>learn more</Link></>
                        )}
                      </td>
                      {["innovator", "changemaker", "transformer", "visionary"].map((k) => (
                        <td key={k} style={{ padding: "11px 14px", textAlign: "center", borderTop: "1px solid var(--line)", borderLeft: "1px solid var(--line)", color: row[k] === "—" ? "var(--faint)" : "var(--ink)" }}>
                          {row[k]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculator */}
            <h3 className="ohx-display" style={{ fontSize: "1.4rem", marginTop: 44, marginBottom: 16 }}>Calculate your sponsorship</h3>
            <div className="ohx-card" style={{ background: "var(--surface)", padding: "24px 26px" }}>
              <SponsorshipSlider sponsorLevels={sponsorLevels} isMobile={false} setSelectedAmount={setSelectedAmount} />
              <div style={{ marginTop: 18 }}>
                {selectedAmount > 0 && <p className="ohx-muted" style={{ margin: "0 0 10px" }}>Donate ${selectedAmount}:</p>}
                <a className="ohx-btn ohx-btn--primary" href="https://givebutter.com/a5MSes" target="_blank" rel="noopener noreferrer" onClick={() => gaButton("button_donate", "donate")}>
                  Donate here <Arrow />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* WHY SPONSOR */}
        <section className="ohx-wrap" style={{ paddingTop: "clamp(48px, 7vh, 80px)", paddingBottom: "clamp(32px, 5vh, 56px)" }}>
          <Eyebrow>Why sponsor</Eyebrow>
          <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 28 }}>What you&apos;re part of</h2>
          <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            {whySponsor.map((c) => (
              <div key={c.title} className="ohx-card" style={{ padding: "24px" }}>
                <h3 className="ohx-display" style={{ fontSize: "1.15rem" }}>{c.title}</h3>
                <p className="ohx-muted" style={{ margin: "10px 0 0", fontSize: "0.95rem", lineHeight: 1.55 }}>{c.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SUCCESS STORIES */}
        <section className="ohx-wrap" style={{ paddingBottom: "clamp(32px, 5vh, 56px)" }}>
          <Eyebrow>Success stories</Eyebrow>
          <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 10 }}>Where sponsorship goes</h2>
          <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 28, maxWidth: "56ch" }}>
            Our hackathons have led to lasting solutions for nonprofits.
          </p>
          <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            {successStories.map((s) => (
              <Link key={s.name} href={s.href} className="ohx-card ohx-card--hover" style={{ padding: "24px", textDecoration: "none", color: "inherit", display: "block" }}>
                <h3 className="ohx-display" style={{ fontSize: "1.15rem" }}>{s.name}</h3>
                <p className="ohx-muted" style={{ margin: "10px 0 14px", fontSize: "0.95rem", lineHeight: 1.55 }}>{s.text}</p>
                <span className="ohx-link" style={{ fontSize: "0.88rem" }}>Read more <Arrow /></span>
              </Link>
            ))}
          </div>
          <div style={{ marginTop: 24 }}>
            <Link href="/about/success-stories" className="ohx-link">Explore all success stories <Arrow /></Link>
          </div>
        </section>

        {/* ENGAGEMENT */}
        <section className="ohx-wrap" style={{ paddingBottom: "clamp(40px, 6vh, 64px)" }}>
          <Eyebrow>Engagement opportunities</Eyebrow>
          <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 28 }}>Ways to show up</h2>
          <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            {engagement.map((c) => (
              <div key={c.title} className="ohx-card" style={{ padding: "24px" }}>
                <h3 className="ohx-display" style={{ fontSize: "1.15rem" }}>{c.title}</h3>
                <p className="ohx-muted" style={{ margin: "10px 0 0", fontSize: "0.95rem", lineHeight: 1.55 }}>{c.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section style={{ background: "var(--brand)", color: "#fff" }}>
          <div className="ohx-wrap" style={{ paddingTop: "clamp(48px, 7vh, 88px)", paddingBottom: "clamp(48px, 7vh, 88px)", textAlign: "center" }}>
            <h2 className="ohx-display" style={{ color: "#fff" }}>Ready to make a difference?</h2>
            <p style={{ margin: "14px auto 28px", maxWidth: "52ch", color: "rgba(255,255,255,0.85)", fontSize: "1.05rem" }}>
              Your sponsorship can change lives and empower nonprofits through innovative tech solutions.
            </p>
            {hasEvents ? (
              <a href="#current-opportunities" className="ohx-btn" style={{ background: "#fff", color: "var(--brand)" }} onClick={scrollToOpps}>View current opportunities <Arrow /></a>
            ) : (
              <Link href={getContactLink()} className="ohx-btn" style={{ background: "#fff", color: "var(--brand)" }}>Contact us about sponsorship <Arrow /></Link>
            )}
          </div>
        </section>
      </RefinedRoot>
    </>
  );
}
