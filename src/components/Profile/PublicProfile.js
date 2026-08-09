import React, { useState, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import { Box, CircularProgress, Dialog, DialogContent, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";

import usePublicProfile from "../../hooks/use-public-profile";
import HackathonsSection from "./Sections/HackathonsSection";
import BadgesSection from "./Sections/BadgesSection";
import PraisesSection from "./Sections/PraisesSection";
import FeedbackSection from "./Sections/FeedbackSection";
import HeartsExplainer from "./Sections/HeartsExplainer";
import PortfolioHero from "./Portfolio/PortfolioHero";
import BioVideoSection from "./Portfolio/BioVideoSection";
import TeamsShowcaseSection from "./Portfolio/TeamsShowcaseSection";
import GitHubStatsSection from "./Portfolio/GitHubStatsSection";
import CertificateWallSection from "./Portfolio/CertificateWallSection";
import VideoDisplay from "../VideoDisplay/VideoDisplay";
import { RefinedRoot, RefinedFonts, Eyebrow, Arrow } from "../design/refined";
import { canonicalPathForProfile } from "../../lib/portfolioMeta";

const educationLabels = {
  in_college: "In College",
  bootcamp: "Bootcamp",
  post_college: "Post-College",
  in_high_school: "In High School",
  in_middle_school: "In Middle School",
};

// Refined section frame (eyebrow + heading + body in one quiet card).
// Anchored ids make sections deep-linkable (#featured-work etc.).
function PanelSection({ id, eyebrow, title, children }) {
  return (
    <section id={id} className="ohx-card" style={{ padding: "26px 26px 24px", marginBottom: 20, scrollMarginTop: 96 }}>
      {eyebrow && <Eyebrow style={{ marginBottom: 6 }}>{eyebrow}</Eyebrow>}
      <h2 className="ohx-display" style={{ fontSize: "1.35rem", marginBottom: 18 }}>{title}</h2>
      {children}
    </section>
  );
}

function AboutRow({ icon, label, children }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      {icon && <span style={{ color: "var(--faint)", marginTop: 2, display: "inline-flex" }}>{icon}</span>}
      <div style={{ minWidth: 0 }}>
        <span className="ohx-eyebrow" style={{ fontSize: "0.62rem" }}>{label}</span>
        <div style={{ marginTop: 4 }}>{children}</div>
      </div>
    </div>
  );
}

/**
 * The public portfolio page body. Server-rendered on /u/[slug] and
 * /profile/[userid] (initialData comes from getServerSideProps); falls back
 * to client fetching when SSR had no data. Empty or private sections skip
 * silently — an employer-facing portfolio must read tight.
 */
const PublicProfile = ({ userid, initialData = null }) => {
  const {
    profile,
    badges,
    hackathons,
    praisesRecent,
    praisesCount,
    feedbackUrl,
    privacySettings,
    isLoading,
    error,
  } = usePublicProfile(userid, { initialData });

  // The single page-level video player (CWV rule: never an iframe per card)
  const [videoDialog, setVideoDialog] = useState(null);
  const openVideo = useCallback((url, title) => setVideoDialog({ url, title }), []);
  const closeVideo = useCallback(() => setVideoDialog(null), []);

  const sharePath = canonicalPathForProfile(profile, userid);
  const isPublic = (field) => privacySettings?.[field] === "public";

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress sx={{ color: "#1B3A6B" }} />
      </Box>
    );
  }

  const notice = (msg) => (
    <RefinedRoot>
      <section className="ohx-wrap" style={{ paddingTop: "clamp(120px, 16vh, 180px)", paddingBottom: 120 }}>
        <div className="ohx-card" style={{ padding: "32px 28px", maxWidth: 560 }}>
          <p className="ohx-muted" style={{ margin: 0 }}>{msg}</p>
          <Link href="/" className="ohx-link" style={{ marginTop: 14 }}>Back home <Arrow /></Link>
        </div>
      </section>
    </RefinedRoot>
  );

  if (error) return notice(`Failed to load profile: ${error}`);
  if (!profile) return notice("Profile not found or this user does not exist.");

  const aboutFields = [];
  if (isPublic("github") && profile?.github)
    aboutFields.push(
      <AboutRow key="gh" icon={<GitHubIcon fontSize="small" />} label="GitHub">
        <a className="ohx-link" href={`https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer">{profile.github}</a>
      </AboutRow>
    );
  if (isPublic("company") && profile?.company)
    aboutFields.push(<AboutRow key="co" label="Company"><span>{profile.company}</span></AboutRow>);
  if (isPublic("education") && profile?.education)
    aboutFields.push(<AboutRow key="ed" label="Education"><span>{educationLabels[profile.education] || profile.education}</span></AboutRow>);
  if (isPublic("linkedin_url") && profile?.linkedin_url)
    aboutFields.push(
      <AboutRow key="li" icon={<LinkedInIcon fontSize="small" />} label="LinkedIn">
        <a className="ohx-link" href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">View profile</a>
      </AboutRow>
    );
  if (isPublic("instagram_url") && profile?.instagram_url)
    aboutFields.push(
      <AboutRow key="ig" icon={<InstagramIcon fontSize="small" />} label="Instagram">
        <a className="ohx-link" href={profile.instagram_url} target="_blank" rel="noopener noreferrer">View profile</a>
      </AboutRow>
    );

  const showBio = isPublic("bio") && profile?.bio;
  const showBioVideo = isPublic("bio_video_url") && profile?.bio_video_url;
  const showAbout = showBio || showBioVideo || aboutFields.length > 0 || (isPublic("expertise") && profile?.expertise?.length > 0);
  const teams = isPublic("teams") ? profile?.teams || [] : [];
  const showGitHub = isPublic("github_history") && (profile?.github_history?.length > 0 || profile?.github);
  const showCertificates = isPublic("certificates") && profile?.certificates &&
    ((profile.certificates.github_certificates || []).length > 0 || (profile.certificates.heart_certificates || []).length > 0);

  return (
    <>
      <Head>
        <RefinedFonts />
      </Head>

      <RefinedRoot>
        <PortfolioHero
          profile={profile}
          hackathons={isPublic("hackathon_history") ? hackathons : []}
          isPublic={isPublic}
          feedbackUrl={feedbackUrl}
          sharePath={sharePath}
        />

        {/* BODY */}
        <section className="ohx-wrap" style={{ paddingBottom: "clamp(56px, 9vh, 104px)" }}>
          <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "minmax(0, 2fr) minmax(0, 1fr)" }, alignItems: "start" }}>
              {/* Main column */}
              <div style={{ minWidth: 0 }}>
                {profile?.why && isPublic("why") && (
                  <div className="ohx-card" style={{ padding: "26px", marginBottom: 20, borderLeft: "3px solid var(--accent)" }}>
                    <Eyebrow style={{ marginBottom: 10 }}>Why they&apos;re here</Eyebrow>
                    <p className="ohx-display" style={{ fontSize: "1.2rem", lineHeight: 1.4, fontStyle: "italic", margin: 0 }}>
                      &ldquo;{profile.why}&rdquo;
                    </p>
                  </div>
                )}

                {showAbout && (
                  <PanelSection id="about" title="About">
                    {showBio && (
                      <p style={{ marginTop: 0, marginBottom: showBioVideo || aboutFields.length ? 18 : 0, whiteSpace: "pre-line", lineHeight: 1.6 }}>
                        {profile.bio}
                      </p>
                    )}
                    {showBioVideo && (
                      <BioVideoSection url={profile.bio_video_url} name={profile?.name} />
                    )}
                    {aboutFields.length > 0 && (
                      <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", marginTop: showBio || showBioVideo ? 20 : 0 }}>
                        {aboutFields}
                      </div>
                    )}
                    {isPublic("expertise") && profile?.expertise?.length > 0 && (
                      <div style={{ marginTop: 20 }}>
                        <span className="ohx-eyebrow" style={{ fontSize: "0.62rem" }}>Areas of expertise</span>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                          {profile.expertise.map((s) => <span key={s} className="ohx-tag">{s}</span>)}
                        </div>
                      </div>
                    )}
                  </PanelSection>
                )}

                {teams.length > 0 && (
                  <PanelSection id="featured-work" title="Featured work">
                    <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 16, fontSize: "0.95rem" }}>
                      Hackathon teams, demo videos, and the code behind them.
                    </p>
                    <TeamsShowcaseSection teams={teams} onPlayVideo={openVideo} />
                  </PanelSection>
                )}

                {showGitHub && (
                  <PanelSection id="github" title="GitHub contributions">
                    <GitHubStatsSection username={profile?.github} initialHistory={profile?.github_history || null} />
                  </PanelSection>
                )}

                {showCertificates && (
                  <PanelSection id="certificates" title="Certificates">
                    <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 16, fontSize: "0.95rem" }}>
                      Verifiable recognition for shipped contributions.
                    </p>
                    <CertificateWallSection certificates={profile.certificates} />
                  </PanelSection>
                )}

                {isPublic("badges") && badges?.length > 0 && (
                  <PanelSection id="badges" title="Achievements & badges">
                    <BadgesSection badges={badges} mode="public" profileUrl={sharePath} />
                  </PanelSection>
                )}

                {isPublic("hackathon_history") && hackathons?.length > 0 && (
                  <PanelSection id="hackathons" title="Hackathon history">
                    <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 16, fontSize: "0.95rem" }}>
                      Participation, mentoring, and judging at Opportunity Hack events.
                    </p>
                    <HackathonsSection hackathons={hackathons} mode="public" profileUrl={sharePath} />
                  </PanelSection>
                )}

                {isPublic("praises") && (praisesCount > 0 || praisesRecent?.length > 0) && (
                  <PanelSection id="praise" title="Praises received">
                    <PraisesSection userId={profile?.id || userid} initialPraises={praisesRecent || []} initialCount={praisesCount || 0} />
                  </PanelSection>
                )}

                {(isPublic("what") || isPublic("how")) && (
                  <PanelSection id="community-feedback" title="Community feedback">
                    <HeartsExplainer compact />
                    <Box sx={{ mt: 2 }}>
                      <FeedbackSection history={profile?.history} feedbackUrl={feedbackUrl} userName={profile?.name} showWhat={isPublic("what")} showHow={isPublic("how")} />
                    </Box>
                  </PanelSection>
                )}
              </div>

              {/* Sidebar */}
              <aside style={{ minWidth: 0 }}>
                <div className="ohx-card" style={{ padding: "24px", position: "sticky", top: 90 }}>
                  <h2 className="ohx-display" style={{ fontSize: "1.15rem", marginBottom: 16 }}>Connect &amp; engage</h2>
                  <Link href={feedbackUrl} className="ohx-btn ohx-btn--ghost" style={{ width: "100%", justifyContent: "center", marginBottom: 18 }}>Send feedback</Link>
                  <Link href="/praise" className="ohx-btn ohx-btn--ghost" style={{ width: "100%", justifyContent: "center", marginBottom: 18 }}>Praise</Link>
                  <hr className="ohx-rule" />
                  <p className="ohx-muted" style={{ margin: "18px 0", fontSize: "0.92rem" }}>Want to get involved with Opportunity Hack?</p>
                  <Link href="/volunteer" className="ohx-btn ohx-btn--primary" style={{ width: "100%", justifyContent: "center", marginBottom: 12 }}>Become a volunteer <Arrow /></Link>
                  <Link href="/projects" className="ohx-link" style={{ display: "inline-flex", marginBottom: 8, fontSize: "0.9rem" }}>View current projects <Arrow /></Link>
                </div>
              </aside>
          </Box>
        </section>
      </RefinedRoot>

      {/* One page-level demo-video player — thumbnails everywhere are facades */}
      <Dialog open={Boolean(videoDialog)} onClose={closeVideo} maxWidth="md" fullWidth>
        <DialogContent sx={{ position: "relative", pt: 5 }}>
          <IconButton onClick={closeVideo} aria-label="Close video" sx={{ position: "absolute", top: 6, right: 6 }}>
            <CloseIcon />
          </IconButton>
          {videoDialog && <VideoDisplay url={videoDialog.url} title={videoDialog.title} />}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PublicProfile;
