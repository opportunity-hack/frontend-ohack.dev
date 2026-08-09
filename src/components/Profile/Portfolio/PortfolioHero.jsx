import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar } from "@mui/material";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useAuthInfo } from "@propelauth/react";

import { Eyebrow, Arrow } from "../../design/refined";
import { ROLE_LABELS, DEFAULT_AVATAR } from "../../../lib/portfolioMeta";
import { getTierForHearts } from "../../../lib/heartTiers";
import ShareBar from "./ShareBar";
import CustomLinksRow from "./CustomLinksRow";

/**
 * Portfolio masthead: avatar, name, headline, repeat-participation +
 * hearts-tier tags, one primary CTA, quiet share row, and the user's own
 * links. Owner sees a client-only "edit your portfolio" banner.
 */
export default function PortfolioHero({
  profile,
  hackathons,
  isPublic,
  feedbackUrl,
  sharePath,
  heroTags,
}) {
  const { isLoggedIn, accessToken } = useAuthInfo();
  const [isOwner, setIsOwner] = useState(false);

  // Owner detection is a client-side enhancement only: compare the viewer's
  // own db id (authed endpoint) against this profile's id. Never SSR'd.
  useEffect(() => {
    if (!isLoggedIn || !accessToken || !profile?.id) return;
    let cancelled = false;
    fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/users/profile`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.id && data.id === profile.id) {
          setIsOwner(true);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, accessToken, profile?.id]);

  const name = profile?.name || "Anonymous user";
  const headline = profile?.headline;
  const role = isPublic("role") && profile?.role ? ROLE_LABELS[profile.role] || profile.role : null;

  const hackathonCount = Array.isArray(hackathons) ? hackathons.length : 0;
  const mentorCount = (hackathons || []).filter((h) => (h.roles || []).includes("Mentor")).length;
  const judgeCount = (hackathons || []).filter((h) => (h.roles || []).includes("Judge")).length;

  const heartsTotal = isPublic("hearts") ? profile?.hearts?.total || 0 : 0;
  const tier = heartsTotal > 0 ? getTierForHearts(heartsTotal) : null;

  return (
    <section className="ohx-wrap" style={{ paddingTop: "clamp(100px, 12vh, 148px)", paddingBottom: "clamp(28px, 5vh, 44px)" }}>
      <Eyebrow><span className="rise" style={{ display: "inline-block" }}>Opportunity Hack portfolio</span></Eyebrow>

      {isOwner && (
        <div className="rise ohx-card" style={{ marginTop: 16, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span className="ohx-muted" style={{ fontSize: "0.92rem" }}>This is you.</span>
          <Link href="/profile#portfolio" className="ohx-link" style={{ fontSize: "0.92rem" }}>
            Edit your portfolio <Arrow />
          </Link>
        </div>
      )}

      <div className="rise" style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 20, animationDelay: "60ms" }}>
        <div style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap" }}>
          <Avatar
            src={profile?.profile_image || DEFAULT_AVATAR}
            alt={name}
            sx={{ width: { xs: 84, sm: 104 }, height: { xs: 84, sm: 104 }, border: "1px solid var(--line)" }}
          />
          <div style={{ minWidth: 0, flex: "1 1 320px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <h1 className="ohx-display" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>{name}</h1>
              <VerifiedUserIcon sx={{ color: "#1B3A6B", fontSize: 24 }} />
            </div>
            {headline ? (
              <p className="ohx-lead" style={{ margin: "8px 0 0", fontSize: "1.08rem" }}>{headline}</p>
            ) : (
              <p className="ohx-muted" style={{ margin: "6px 0 0" }}>{profile?.nickname || "Community member"}</p>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
              {role && <span className="ohx-tag">{role}</span>}
              {hackathonCount > 0 && (
                <span className="ohx-tag ohx-tag--accent">
                  {hackathonCount}× hackathon{hackathonCount === 1 ? "" : "s"}
                </span>
              )}
              {mentorCount > 1 && <span className="ohx-tag">{mentorCount}× mentor</span>}
              {judgeCount > 1 && <span className="ohx-tag">{judgeCount}× judge</span>}
              {tier && (
                <a href="#community-feedback" className="ohx-tag" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <FavoriteIcon sx={{ fontSize: 13, color: "var(--accent)" }} />
                  {tier.name} · {heartsTotal} heart{heartsTotal === 1 ? "" : "s"}
                </a>
              )}
              {heroTags}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
          <Link href={feedbackUrl} className="ohx-btn ohx-btn--primary">Send feedback <Arrow /></Link>
          <ShareBar path={sharePath} name={name} />
        </div>

        {isPublic("portfolio_links") && <CustomLinksRow links={profile?.portfolio_links} />}
      </div>
    </section>
  );
}
