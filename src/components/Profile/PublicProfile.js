import React from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { Box, CircularProgress, Avatar } from "@mui/material";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";

import usePublicProfile from "../../hooks/use-public-profile";
import HackathonsSection from "./Sections/HackathonsSection";
import BadgesSection from "./Sections/BadgesSection";
import PraisesSection from "./Sections/PraisesSection";
import FeedbackSection from "./Sections/FeedbackSection";
import HeartsExplainer from "./Sections/HeartsExplainer";
import LinkedInShareButton from "../share/LinkedInShareButton";
import HelpUsBuildOHack from "../HelpUsBuildOHack/HelpUsBuildOHack";
import { RefinedRoot, RefinedFonts, Eyebrow, Arrow } from "../design/refined";

const educationLabels = {
  in_college: "In College",
  bootcamp: "Bootcamp",
  post_college: "Post-College",
  in_high_school: "In High School",
  in_middle_school: "In Middle School",
};

const roleLabels = {
  hacker_in_school: "Hacker (In School)",
  hacker_pro: "Hacker (Professional)",
  mentor: "Mentor",
  volunteer: "Volunteer",
  judge: "Judge",
  nonprofit: "Nonprofit",
  sponsor: "Sponsor",
  organizer: "Organizer",
};

// Refined section frame (eyebrow + heading + body in one quiet card)
function PanelSection({ eyebrow, title, children }) {
  return (
    <section className="ohx-card" style={{ padding: "26px 26px 24px", marginBottom: 20 }}>
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

const PublicProfile = () => {
  const router = useRouter();
  const { userid } = router.query;

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
  } = usePublicProfile(userid);

  const profilePath = userid ? `/profile/${userid}` : "/";
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

  return (
    <>
      <Head>
        <title>Profile for {profile?.name || userid} — Opportunity Hack Developer Portal</title>
        <RefinedFonts />
      </Head>

      <RefinedRoot>
        {/* HEADER */}
        <section className="ohx-wrap" style={{ paddingTop: "clamp(100px, 12vh, 148px)", paddingBottom: "clamp(28px, 5vh, 44px)" }}>
          <Eyebrow><span className="rise" style={{ display: "inline-block" }}>Community profile</span></Eyebrow>
          <div className="rise" style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 20, animationDelay: "60ms" }}>
            <div style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap" }}>
              <Avatar
                src={profile?.profile_image || "https://i.imgur.com/RdOsE7s.png"}
                alt={profile?.name}
                sx={{ width: { xs: 84, sm: 104 }, height: { xs: 84, sm: 104 }, border: "1px solid var(--line)" }}
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <h1 className="ohx-display" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>{profile?.name || "Anonymous user"}</h1>
                  <VerifiedUserIcon sx={{ color: "#1B3A6B", fontSize: 24 }} />
                </div>
                <p className="ohx-muted" style={{ margin: "6px 0 0" }}>{profile?.nickname || "Community member"}</p>
                {profile?.role && isPublic("role") && (
                  <span className="ohx-tag" style={{ marginTop: 12, display: "inline-flex" }}>{roleLabels[profile.role] || profile.role}</span>
                )}
              </div>
            </div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Link href={feedbackUrl} className="ohx-btn ohx-btn--primary">Send feedback <Arrow /></Link>
              <LinkedInShareButton variant="profile" url={profilePath} label={`Share ${profile?.name || "this profile"} to LinkedIn`} />
            </div>
          </div>
        </section>

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

                {(aboutFields.length > 0 || (isPublic("expertise") && profile?.expertise?.length > 0)) && (
                  <PanelSection title="About">
                    <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
                      {aboutFields}
                    </div>
                    {isPublic("expertise") && profile?.expertise?.length > 0 && (
                      <div style={{ marginTop: aboutFields.length ? 20 : 0 }}>
                        <span className="ohx-eyebrow" style={{ fontSize: "0.62rem" }}>Areas of expertise</span>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                          {profile.expertise.map((s) => <span key={s} className="ohx-tag">{s}</span>)}
                        </div>
                      </div>
                    )}
                  </PanelSection>
                )}

                {isPublic("badges") && badges?.length > 0 && (
                  <PanelSection title="Achievements & badges">
                    <BadgesSection badges={badges} mode="public" profileUrl={profilePath} />
                  </PanelSection>
                )}

                {isPublic("hackathon_history") && hackathons?.length > 0 && (
                  <PanelSection title="Hackathon history">
                    <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 16, fontSize: "0.95rem" }}>
                      Participation, mentoring, and judging at Opportunity Hack events.
                    </p>
                    <HackathonsSection hackathons={hackathons} mode="public" profileUrl={profilePath} />
                  </PanelSection>
                )}

                {isPublic("praises") && (praisesCount > 0 || praisesRecent?.length > 0) && (
                  <PanelSection title="Praises received">
                    <PraisesSection userId={userid} initialPraises={praisesRecent || []} initialCount={praisesCount || 0} />
                  </PanelSection>
                )}

                {(isPublic("what") || isPublic("how")) && (
                  <PanelSection title="Community feedback">
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
                  <hr className="ohx-rule" />
                  <p className="ohx-muted" style={{ margin: "18px 0", fontSize: "0.92rem" }}>Want to get involved with Opportunity Hack?</p>
                  <Link href="/volunteer" className="ohx-btn ohx-btn--primary" style={{ width: "100%", justifyContent: "center", marginBottom: 12 }}>Become a volunteer <Arrow /></Link>
                  <Link href="/projects" className="ohx-link" style={{ fontSize: "0.9rem" }}>View current projects <Arrow /></Link>
                </div>
              </aside>
          </Box>

          <Box sx={{ mt: 5 }}>
            <HelpUsBuildOHack github_link="https://github.com/opportunity-hack/frontend-ohack.dev/issues/195" github_name="Issue #195" />
          </Box>
        </section>
      </RefinedRoot>
    </>
  );
};

export default PublicProfile;
