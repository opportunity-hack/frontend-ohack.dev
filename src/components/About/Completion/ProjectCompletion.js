import React, { useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { Box } from "@mui/material";
import { InstagramEmbed } from "react-social-media-embed";
import LoginOrRegister from "../../LoginOrRegister/LoginOrRegister";
import { initFacebookPixel, trackEvent } from "../../../lib/ga";
import { RefinedRoot, RefinedFonts, Eyebrow, Arrow } from "../../design/refined";

const track = (name) => trackEvent("click_project_completion_button", name);

const dod = [
  { t: "Deployed", d: "Code must be deployed to a production environment (AWS, fly.io, Google Cloud) so others can use it — not only on local machines." },
  { t: "Nonprofit signoff", d: "The nonprofit partner agrees the software meets their requirements and is usable for their needs.", link: { href: "https://docs.google.com/document/d/1_B5uRZ7bOwYRfhK9SiSQ9uYUhaU9jmmhyO9LhDvFY1Q/edit#bookmark=id.c05tj14rfvg6", label: "View example", track: "example_nonprofit_signoff" } },
  { t: "Login details for testing", d: "Provide any login credentials for the deployed app to facilitate testing. Share over Slack or email; they should be changeable after the project ends." },
  { t: "Code updated", d: "All code lives in the designated GitHub repository — including docs, README, and comments — in a single repository for easy access." },
  { t: "Tasks closed", d: "All GitHub tasks and issues are closed or addressed, if you're using them for project management." },
  { t: "Sensitive information security", d: "Environment variables and secrets stay out of GitHub. Share them securely via a separate document or password manager." },
  { t: "Documentation", d: "Comprehensive docs (video or written) explaining how to use, deploy, update, and configure the application." },
];

const info = [
  { t: "Open-source solution", d: "All code is open-sourced under the MIT license — free to use, modify, and distribute, even commercially." },
  { t: "Hosting costs", d: "Opportunity Hack covers initial hosting up to $15/month and up to $250 in one-time costs. Nonprofits may cover more as a project grows." },
  { t: "Ongoing support", d: "We offer quarterly check-ins for maintenance and updates, and try to find volunteers through our network for urgent needs in between." },
  { t: "Profit sharing", d: "If the solution generates profit, 50% is shared with the nonprofit — encouraging sustainability and continued development." },
];

const ProjectCompletion = () => {
  useEffect(() => {
    initFacebookPixel();
  }, []);

  return (
    <>
      <Head>
        <title>Definition of Done: Opportunity Hack Project Completion Checklist</title>
        <RefinedFonts />
      </Head>
      <RefinedRoot>
        {/* HERO */}
        <section className="ohx-wrap" style={{ paddingTop: "clamp(104px, 13vh, 156px)", paddingBottom: "clamp(28px, 5vh, 48px)" }}>
          <Eyebrow><span className="rise" style={{ display: "inline-block" }}>Definition of done</span></Eyebrow>
          <h1 className="ohx-display rise" style={{ marginTop: 18, maxWidth: "17ch", animationDelay: "60ms" }}>
            When a project is <span className="ohx-italic">truly finished.</span>
          </h1>
          <div style={{ marginTop: 22, display: "grid", gap: "clamp(28px, 5vw, 56px)", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", alignItems: "center" }}>
            <div>
              <p className="ohx-lead rise" style={{ animationDelay: "150ms", maxWidth: "56ch" }}>
                In software, the &ldquo;definition of done&rdquo; is the checklist a project must meet before it counts
                as complete. Here&apos;s ours — so teams and nonprofit partners stay aligned on expectations.
              </p>
              <div className="rise" style={{ marginTop: 24, animationDelay: "230ms" }}>
                <a className="ohx-btn ohx-btn--primary" href="https://www.instagram.com/p/CVicxFMPiqo/" target="_blank" rel="noopener noreferrer" onClick={() => track("example_statement_of_work_prize")}>
                  Example statement of work <Arrow />
                </a>
              </div>
              <div style={{ marginTop: 28, position: "relative", width: "100%", maxWidth: 420, aspectRatio: "1 / 1", borderRadius: 10, overflow: "hidden", border: "1px solid var(--line)" }}>
                <Image src="https://cdn.ohack.dev/ohack.dev/definition-of-done-65b90f271348b.webp" alt="A happy dog completing an Opportunity Hack project for social good" fill sizes="(max-width: 600px) 100vw, 420px" style={{ objectFit: "cover" }} />
              </div>
            </div>
            <Box sx={{ minHeight: 500, maxWidth: 360, mx: "auto", "& iframe": { borderRadius: "10px" } }}>
              <InstagramEmbed url="https://www.instagram.com/p/CoBFS8hvcnB/" maxWidth={360} height={500} />
            </Box>
          </div>
        </section>

        {/* DEFINITION OF DONE */}
        <section style={{ background: "var(--surface-2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
          <div className="ohx-wrap" style={{ paddingTop: "clamp(48px, 7vh, 80px)", paddingBottom: "clamp(48px, 7vh, 80px)" }}>
            <Eyebrow>Our definition of done</Eyebrow>
            <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 28 }}>The completion checklist</h2>
            <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
              {dod.map((c, i) => (
                <div key={c.t} className="ohx-card" style={{ padding: "24px", background: "var(--surface)" }}>
                  <div style={{ display: "flex", gap: 14, alignItems: "baseline" }}>
                    <span className="ohx-display ohx-italic" style={{ fontSize: "1.4rem", lineHeight: 1 }}>{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <h3 className="ohx-display" style={{ fontSize: "1.15rem" }}>{c.t}</h3>
                      <p className="ohx-muted" style={{ margin: "10px 0 0", fontSize: "0.95rem", lineHeight: 1.55 }}>{c.d}</p>
                      {c.link && (
                        <Link href={c.link.href} target="_blank" className="ohx-link" style={{ marginTop: 12, fontSize: "0.88rem" }} onClick={() => track(c.link.track)}>
                          {c.link.label} <Arrow />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* IMPORTANT INFO */}
        <section className="ohx-wrap" style={{ paddingTop: "clamp(48px, 7vh, 80px)", paddingBottom: "clamp(40px, 6vh, 64px)" }}>
          <Eyebrow>Good to know</Eyebrow>
          <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 10 }}>For teams &amp; nonprofits</h2>
          <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 28, maxWidth: "60ch" }}>
            How ownership, costs, and support work once a project ships.
          </p>
          <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            {info.map((c) => (
              <div key={c.t} className="ohx-card" style={{ padding: "24px" }}>
                <h3 className="ohx-display" style={{ fontSize: "1.15rem" }}>{c.t}</h3>
                <p className="ohx-muted" style={{ margin: "10px 0 0", fontSize: "0.95rem", lineHeight: 1.55 }}>{c.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="ohx-wrap" style={{ paddingBottom: "clamp(48px, 8vh, 96px)" }}>
          <LoginOrRegister introText="Ready to join us in creating impactful solutions?" previousPage={"/about/completion"} />
        </section>
      </RefinedRoot>
    </>
  );
};

export default ProjectCompletion;
