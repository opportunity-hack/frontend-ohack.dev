// profileFields.js
// The profile fields that earn giveaway entries (5 each). The BACKEND computes
// the real count from its twin, GIVEAWAY_PROFILE_FIELDS in
// backend-ohack.dev/api/giveaways/giveaways_service.py — keep the two lists in
// sync. The frontend only uses this list for the "still open on your profile"
// hint in the Giveaways tab.
export const profileFields = [
  { name: "role", label: "Role", type: "select" },
  { name: "github", label: "GitHub Username", type: "text" },
  { name: "expertise", label: "Areas of Expertise", type: "multiSelect" },
  { name: "education", label: "Level of Education", type: "select" },
  { name: "why", label: "Why are you here with us at OHack?", type: "text" },
  { name: "company", label: "Company", type: "text" },
  { name: "shirt_size", label: "Shirt Size", type: "select" },
  { name: "want_stickers", label: "Would you like stickers?", type: "checkbox" },
  { name: "street_address", label: "Street Address", type: "text" },
  { name: "street_address_2", label: "Apartment, suite, etc.", type: "text" },
  { name: "city", label: "City", type: "text" },
  { name: "state", label: "State/Province", type: "text" },
  { name: "postal_code", label: "Postal/ZIP Code", type: "text" },
  { name: "country", label: "Country", type: "select" },
  { name: "instagram_url", label: "Instagram Profile", type: "text" },
  { name: "linkedin_url", label: "LinkedIn Profile", type: "text" },
  { name: "propel_id", label: "Propel ID", type: "text" },
];
