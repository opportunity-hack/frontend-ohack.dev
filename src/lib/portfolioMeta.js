/**
 * portfolioMeta — single source of truth for how a public portfolio unfurls.
 *
 * Used by BOTH the SSR pages (/u/[slug], /profile/[userid]) and the editor's
 * PortfolioPreviewCard, so what users preview is exactly what social scrapers
 * see. Pure functions only — no fetching, no window.
 */

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ohack.dev";
export const FALLBACK_OG_IMAGE = "https://cdn.ohack.dev/ohack.dev/2024_hackathon_2.webp";
export const DEFAULT_AVATAR = "https://i.imgur.com/RdOsE7s.png";

export const ROLE_LABELS = {
  hacker_in_school: "Hacker (In School)",
  hacker_pro: "Hacker (Professional)",
  mentor: "Mentor",
  volunteer: "Volunteer",
  judge: "Judge",
  nonprofit: "Nonprofit",
  sponsor: "Sponsor",
  organizer: "Organizer",
};

function clamp(text, max = 160) {
  if (!text) return text;
  const clean = String(text).replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 3)}...` : clean;
}

export function canonicalPathForProfile(profile, fallbackParam) {
  if (profile?.profile_slug) return `/u/${profile.profile_slug}`;
  const id = profile?.id || fallbackParam;
  return id ? `/profile/${id}` : "/";
}

export function buildTitle(profile) {
  const name = profile?.name || "Community member";
  if (profile?.headline) return `${name} — ${clamp(profile.headline, 80)} | Opportunity Hack`;
  const role = ROLE_LABELS[profile?.role] || profile?.role;
  if (role && profile?.company) return `${name} — ${role} at ${profile.company} | Opportunity Hack`;
  if (role) return `${name} — ${role} | Opportunity Hack`;
  return `${name} — Opportunity Hack Developer Portal`;
}

export function buildDescription(profile) {
  if (!profile) return "View this Opportunity Hack community member's portfolio.";
  if (profile.bio) return clamp(profile.bio, 160);
  if (profile.why) return clamp(profile.why, 160);
  const name = profile.name || "Community member";
  const role = ROLE_LABELS[profile.role] || profile.role;
  if (role && profile.company) return `${name} — ${role} at ${profile.company}. Opportunity Hack community member.`;
  if (role) return `${name} — ${role}. Opportunity Hack community member.`;
  if (profile.company) return `${name} from ${profile.company}. Opportunity Hack community member.`;
  return `${name}'s portfolio of nonprofit software work with Opportunity Hack.`;
}

function firstYouTubeThumb(teams) {
  for (const team of teams || []) {
    const url = team?.demo_video_url || "";
    const m = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (m) return `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg`;
  }
  return null;
}

/**
 * og:image ladder — best landscape image available wins:
 *   certificate PNG (landscape, on our CDN) → YouTube demo thumbnail →
 *   avatar as a small `summary` card → site fallback photo.
 * Returns { image, card } where card is the twitter:card type.
 */
export function buildOgImage(profile) {
  const ytThumb = firstYouTubeThumb(profile?.teams);
  if (ytThumb) return { image: ytThumb, card: "summary_large_image" };

  // Certificate PNGs are square (1024×1024) — crisp in a summary card,
  // cropped badly in a large one.
  const certUrl = profile?.certificates?.github_certificates?.[0]?.certificate_url;
  if (certUrl) return { image: certUrl.replace(/([^:])\/\//g, "$1/"), card: "summary" };

  if (profile?.profile_image && profile.profile_image !== DEFAULT_AVATAR) {
    // Square avatar renders badly in a large card — use the small summary card
    return { image: profile.profile_image, card: "summary" };
  }
  return { image: FALLBACK_OG_IMAGE, card: "summary_large_image" };
}

export function buildRobotsContent(profile) {
  // Default-private-first: only explicitly public portfolios are indexable.
  return profile?.profile_visibility === "public" ? "index, follow" : "noindex, nofollow";
}

/** JSON-LD Person node — only emitted for public (indexable) portfolios. */
export function buildPersonJsonLd(profile, canonicalUrl) {
  if (!profile || profile.profile_visibility !== "public") return null;

  const sameAs = [];
  if (profile.github) sameAs.push(`https://github.com/${profile.github}`);
  if (profile.linkedin_url) sameAs.push(profile.linkedin_url);
  if (profile.instagram_url) sameAs.push(profile.instagram_url);
  for (const link of profile.portfolio_links || []) {
    if (link?.url) sameAs.push(link.url);
  }

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    url: canonicalUrl,
    memberOf: {
      "@type": "Organization",
      name: "Opportunity Hack",
      url: "https://www.ohack.dev",
    },
  };
  if (profile.profile_image) person.image = profile.profile_image;
  if (profile.headline) person.description = clamp(profile.headline, 120);
  const role = ROLE_LABELS[profile.role] || profile.role;
  if (role) person.jobTitle = role;
  if (profile.company) person.worksFor = { "@type": "Organization", name: profile.company };
  if (Array.isArray(profile.expertise) && profile.expertise.length) person.knowsAbout = profile.expertise;
  if (sameAs.length) person.sameAs = sameAs;
  return person;
}

/**
 * The full openGraphData array (the shape _app.js spreads into <Head>) for a
 * portfolio page. `robots` rides along as a name-meta.
 */
export function buildProfileOpenGraph(profile, canonicalUrl) {
  const title = buildTitle(profile);
  const description = buildDescription(profile);
  const { image, card } = buildOgImage(profile);

  const tags = [
    { name: "description", content: description, key: "desc" },
    { name: "robots", content: buildRobotsContent(profile), key: "robots" },
    { property: "og:type", content: "profile", key: "ogtype" },
    { property: "og:title", content: title, key: "ogtitle" },
    { property: "og:description", content: description, key: "ogdesc" },
    { property: "og:image", content: image, key: "ogimage" },
    { property: "og:url", content: canonicalUrl, key: "ogurl" },
    { property: "og:site_name", content: "Opportunity Hack Developer Portal", key: "ogsitename" },
    { name: "twitter:card", content: card, key: "twcard" },
    { name: "twitter:title", content: title, key: "twtitle" },
    { name: "twitter:description", content: description, key: "twdesc" },
    { name: "twitter:image", content: image, key: "twimage" },
    { name: "twitter:domain", content: "ohack.dev", key: "twdomain" },
  ];
  if (profile?.profile_slug) {
    tags.push({ property: "profile:username", content: profile.profile_slug, key: "ogusername" });
  }
  return tags;
}
