// profileFields.js
// The profile fields that earn giveaway entries (5 each). The BACKEND computes
// the real count from its twin, GIVEAWAY_PROFILE_FIELDS in
// backend-ohack.dev/api/giveaways/giveaways_service.py — keep the two lists in
// sync. The frontend only uses this list for the "still open on your profile"
// hint in the Giveaways tab.
//
// Scored: the basic profile, Instagram + LinkedIn, the mailing address (prizes
// ship to it) and the public-portfolio fields (/profile#portfolio). `tab` is the
// /profile tab slug the field lives on (the nudge links straight to it). Not scored: apartment/suite and company (a blank is often
// correct), the stickers preference, the system-set propel_id, and
// profile_visibility — portfolios are private-first, and entries must never
// pressure anyone into going public.
export const profileFields = [
  { name: "role", label: "Role", type: "select", tab: "basic" },
  { name: "github", label: "GitHub Username", type: "text", tab: "basic" },
  { name: "expertise", label: "Areas of Expertise", type: "multiSelect", tab: "basic" },
  { name: "education", label: "Level of Education", type: "select", tab: "basic" },
  { name: "why", label: "Why are you here with us at OHack?", type: "text", tab: "basic" },
  { name: "shirt_size", label: "Shirt Size", type: "select", tab: "swag" },
  { name: "linkedin_url", label: "LinkedIn Profile", type: "text", tab: "basic" },
  { name: "instagram_url", label: "Instagram Profile", type: "text", tab: "basic" },
  { name: "street_address", label: "Street Address", type: "text", tab: "swag" },
  { name: "city", label: "City", type: "text", tab: "swag" },
  { name: "state", label: "State/Province", type: "text", tab: "swag" },
  { name: "postal_code", label: "Postal/ZIP Code", type: "text", tab: "swag" },
  { name: "country", label: "Country", type: "select", tab: "swag" },
  { name: "profile_slug", label: "Portfolio link", type: "text", tab: "portfolio" },
  { name: "headline", label: "Portfolio headline", type: "text", tab: "portfolio" },
  { name: "bio", label: "Portfolio bio", type: "text", tab: "portfolio" },
  { name: "bio_video_url", label: "Bio video", type: "text", tab: "portfolio" },
  { name: "portfolio_links", label: "Portfolio links", type: "list", tab: "portfolio" },
];
