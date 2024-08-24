export const sponsorLevels = [
  { name: "Innovator", color: "#C8E6C9", minSupport: 1000},
  { name: "Changemaker", color: "#BBDEFB", minSupport: 2500 },
  { name: "Transformer", color: "#FFECB3", minSupport: 5000},
  { name: "Visionary", color: "#E1BEE7", minSupport: 10000 },
];

export const sponsors = [
  {
    name: "Meta",
    logo: "https://cdn.ohack.dev/ohack.dev/sponsors/meta.webp",
    hours: 150,
    donations: 1000,
    website: "https://meta.com",
  },
  {
    name: "Spotify",
    logo: "https://cdn.ohack.dev/ohack.dev/sponsors/spotify.webp",
    hours: 150,
    donations: 0,
    website: "https://spotify.com",
  },
];

export const calculateSupport = (hours, donations) => hours * 100 + donations;
