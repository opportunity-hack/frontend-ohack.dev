import React, { useEffect, useRef, useState } from "react";
import { TextField, Radio, RadioGroup, FormControlLabel, Skeleton } from "@mui/material";
import { useAuthInfo } from "@propelauth/react";

import PrivacyToggle from "../../PrivacyToggle/PrivacyToggle";
import SlugClaimField from "./SlugClaimField";
import BioVideoUpload from "./BioVideoUpload";
import CustomLinksEditor from "./CustomLinksEditor";
import PortfolioPreviewCard from "./PortfolioPreviewCard";
import { trackEvent } from "../../../lib/ga";

const API = process.env.NEXT_PUBLIC_API_SERVER_URL;

function SectionCard({ title, hint, action, children }) {
  return (
    <div className="ohx-card" style={{ padding: 24, marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: hint ? 4 : 16 }}>
        <h3 className="ohx-display" style={{ fontSize: "1.2rem", margin: 0 }}>{title}</h3>
        {action}
      </div>
      {hint && <p className="ohx-muted" style={{ margin: "0 0 16px", fontSize: "0.9rem", maxWidth: "62ch" }}>{hint}</p>}
      {children}
    </div>
  );
}

// The sections a visitor can see on the public portfolio, with their privacy keys
const SECTION_TOGGLES = [
  { field: "bio", label: "Bio & headline" },
  { field: "bio_video_url", label: "Bio video" },
  { field: "portfolio_links", label: "My links" },
  { field: "teams", label: "Teams & demo videos" },
  { field: "certificates", label: "Certificates" },
  { field: "github_history", label: "GitHub contributions" },
  { field: "hearts", label: "Hearts & tier" },
  { field: "hackathon_history", label: "Hackathon history" },
  { field: "badges", label: "Badges" },
  { field: "praises", label: "Praises" },
];

/**
 * The Portfolio editor tab (Profile.js tab index 6, #portfolio).
 * Composition: visibility → preview → URL claim → headline/bio →
 * bio video → links → what-shows checklist.
 */
export default function PortfolioTab({
  profile,
  update_profile_metadata,
  privacySettings,
  togglePrivacySetting,
  privacyLoading,
  isLoading,
}) {
  const { accessToken } = useAuthInfo();

  const [slug, setSlug] = useState(profile?.profile_slug || null);
  const [visibility, setVisibility] = useState(profile?.profile_visibility || "private");
  const [visibilityError, setVisibilityError] = useState(null);
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [bioVideoUrl, setBioVideoUrl] = useState("");
  const headlineTimer = useRef(null);
  const bioTimer = useRef(null);

  useEffect(() => {
    if (!profile) return;
    setSlug(profile.profile_slug || null);
    setVisibility(profile.profile_visibility || "private");
    setHeadline(profile.headline || "");
    setBio(profile.bio || "");
    setBioVideoUrl(profile.bio_video_url || "");
  }, [profile]);

  const handleVisibilityChange = async (event) => {
    const next = event.target.value;
    const previous = visibility;
    setVisibility(next);
    setVisibilityError(null);
    try {
      const res = await fetch(`${API}/api/users/profile/visibility`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ visibility: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setVisibility(previous);
        setVisibilityError(data.error || "Could not update visibility");
        return;
      }
      trackEvent({ action: next === "public" ? "portfolio_set_public" : "portfolio_set_private", params: { page: "profile" } });
    } catch (err) {
      setVisibility(previous);
      setVisibilityError("Network error — try again");
    }
  };

  const handleHeadline = (event) => {
    const next = event.target.value.slice(0, 80);
    setHeadline(next);
    if (headlineTimer.current) clearTimeout(headlineTimer.current);
    headlineTimer.current = setTimeout(() => {
      update_profile_metadata({ headline: next }, () => {});
    }, 2000);
  };

  const handleBio = (event) => {
    const next = event.target.value.slice(0, 2000);
    setBio(next);
    if (bioTimer.current) clearTimeout(bioTimer.current);
    bioTimer.current = setTimeout(() => {
      update_profile_metadata({ bio: next }, () => {});
    }, 2000);
  };

  if (isLoading) {
    return <Skeleton variant="rectangular" height={400} />;
  }

  const previewProfile = { ...profile, headline, bio, bio_video_url: bioVideoUrl, profile_slug: slug };

  return (
    <div>
      <SectionCard
        title="Who can find your portfolio?"
        hint="Private is the default: your link works when you share it, but search engines are told to ignore it. Public lists you in our sitemap so Google can find you."
      >
        <RadioGroup value={visibility} onChange={handleVisibilityChange}>
          <FormControlLabel
            value="private"
            control={<Radio size="small" />}
            label={
              <span>
                <strong>Private</strong>
                <span className="ohx-muted" style={{ display: "block", fontSize: "0.85rem" }}>
                  Only people with your link see it. Not listed in search engines.
                </span>
              </span>
            }
            sx={{ mb: 1, alignItems: "flex-start" }}
          />
          <FormControlLabel
            value="public"
            control={<Radio size="small" />}
            disabled={!slug}
            label={
              <span>
                <strong>Public &amp; searchable</strong>
                <span className="ohx-muted" style={{ display: "block", fontSize: "0.85rem" }}>
                  {slug
                    ? "Anyone can find your portfolio — indexed by Google and listed in our sitemap."
                    : "Claim your URL below first, then you can go public."}
                </span>
              </span>
            }
            sx={{ alignItems: "flex-start" }}
          />
        </RadioGroup>
        <p style={{ margin: "12px 0 0", fontSize: "0.9rem" }}>
          Your portfolio is currently{" "}
          <strong>{visibility === "public" ? "public & searchable" : "private"}</strong>.
        </p>
        {visibilityError && (
          <p style={{ margin: "8px 0 0", fontSize: "0.88rem", color: "#b3261e" }}>{visibilityError}</p>
        )}
      </SectionCard>

      <SectionCard title="Share preview">
        <PortfolioPreviewCard profile={previewProfile} visibility={visibility} />
      </SectionCard>

      <SectionCard
        title="Your URL"
        hint="Claim a short, memorable link for your resume and social bios."
      >
        <SlugClaimField
          accessToken={accessToken}
          currentSlug={slug}
          onClaimed={(next) => {
            setSlug(next);
            trackEvent({ action: "portfolio_slug_claimed", params: { page: "profile" } });
          }}
        />
      </SectionCard>

      <SectionCard
        title="Headline & bio"
        hint="Your headline appears under your name and in the share preview; the bio opens your About section."
        action={
          <PrivacyToggle
            field="bio"
            isPrivate={privacySettings.bio !== "public"}
            onToggle={togglePrivacySetting}
            size="small"
            disabled={privacyLoading}
          />
        }
      >
        <TextField
          label="Headline"
          value={headline}
          onChange={handleHeadline}
          fullWidth
          size="small"
          placeholder="Full-stack developer building for nonprofits"
          helperText={`${headline.length}/80`}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Bio"
          value={bio}
          onChange={handleBio}
          fullWidth
          multiline
          minRows={4}
          placeholder="What you build, what you care about, and what you've shipped with Opportunity Hack."
          helperText={`${bio.length}/2000 — saves automatically`}
        />
      </SectionCard>

      <SectionCard
        title="Bio video"
        hint="A short intro video makes your portfolio personal — upload one to our CDN or paste a link."
        action={
          <PrivacyToggle
            field="bio_video_url"
            isPrivate={privacySettings.bio_video_url !== "public"}
            onToggle={togglePrivacySetting}
            size="small"
            disabled={privacyLoading}
          />
        }
      >
        <BioVideoUpload accessToken={accessToken} currentUrl={bioVideoUrl} onSaved={setBioVideoUrl} />
      </SectionCard>

      <SectionCard
        title="My links"
        hint="Up to 10 links shown in your portfolio hero."
        action={
          <PrivacyToggle
            field="portfolio_links"
            isPrivate={privacySettings.portfolio_links !== "public"}
            onToggle={togglePrivacySetting}
            size="small"
            disabled={privacyLoading}
          />
        }
      >
        <CustomLinksEditor
          initialLinks={profile?.portfolio_links || []}
          onSave={(links) => update_profile_metadata({ portfolio_links: links }, () => {})}
        />
      </SectionCard>

      <SectionCard
        title="What shows on your portfolio"
        hint="Each section is private until you turn it on — flip on what you want employers to see."
      >
        <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
          {SECTION_TOGGLES.map(({ field, label }) => (
            <div key={field} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, border: "1px solid var(--line)", borderRadius: 6, padding: "8px 12px" }}>
              <span style={{ fontSize: "0.92rem" }}>{label}</span>
              <PrivacyToggle
                field={field}
                isPrivate={privacySettings[field] !== "public"}
                onToggle={togglePrivacySetting}
                size="small"
                disabled={privacyLoading}
              />
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
