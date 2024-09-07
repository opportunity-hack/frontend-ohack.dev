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
  {
    name: "Readme",
    logo: "https://cdn.ohack.dev/ohack.dev/sponsors/readme.webp",
    hours: 10,
    donations: 0,
    website: "https://readme.com",
  },
  {
    name: "MX",
    logo: "https://cdn.ohack.dev/ohack.dev/sponsors/mx.webp",
    hours: 30,
    donations: 0,
    website: "https://mx.com",
  },
  {
    name: "Scooptacular",
    logo: "https://cdn.ohack.dev/ohack.dev/sponsors/scooptacular.webp",
    hours: 5,
    donations: 500,
    website: "https://scooptacular.net",
  },
  {
    name: "Shift Caffeine",
    logo: "https://cdn.ohack.dev/ohack.dev/sponsors/shift.webp",
    hours: 5,
    donations: 500,
    website: "https://shiftcaffeine.com",
  },
];

export const calculateSupport = (hours, donations) => hours * 100 + donations;
