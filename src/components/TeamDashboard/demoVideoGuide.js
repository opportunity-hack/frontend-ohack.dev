// Copy for the demo-video card. Data only — DemoVideoEditor maps over it and
// tests assert on it. Tone: gentle and encouraging, one recommended path.

export const DEMO_VIDEO_INTRO =
  "4 minutes or less. Show the problem, the demo, and who it helps.";

export const EASY_STEPS_HEADING = "The easiest way";

export const EASY_STEPS = [
  { id: "record", text: "Record your screen while one of you talks through it." },
  {
    id: "upload",
    text: "Upload it to YouTube and set Visibility to Unlisted.",
    note: "Unlisted means only people with the link can watch. Private videos can't be played by judges.",
  },
  { id: "paste", text: "Paste the link here and press Save." },
];

export const DEMO_VIDEO_FIELD_HELP =
  "YouTube, Loom, Vimeo or Google Drive links work.";

export const CHECK_IT_PLAYS_NOTE =
  "Open it in a private window — if it plays there, judges can watch it.";

export const UNAVAILABLE_WARNING =
  "YouTube says this video can't be played by others yet. In YouTube Studio set Visibility to Unlisted (not Private), then check again.";

export const HOSTING_DISCLOSURE_SUMMARY = "Free tools and other places to host";

export const RECORDING_TOOLS_HEADING = "Free ways to record";

export const RECORDING_TOOLS = [
  {
    name: "Mac",
    text: "Press Shift + Command + 5, choose Record, and turn on your microphone under Options.",
  },
  {
    name: "Windows 11",
    text: "Open Snipping Tool, switch to video, and turn on the microphone. (Windows + Shift + R)",
  },
  {
    name: "Loom",
    text: "Records your screen and your face, and gives you a link straight away — no upload step. The free plan allows videos up to 5 minutes.",
  },
  {
    name: "Zoom",
    text: "Start a meeting with your team, share your screen, and press Record. Handy when everyone wants to speak.",
  },
  {
    name: "OBS Studio",
    text: "Free on Mac, Windows and Linux. More setup, more control.",
  },
];

export const RECORDING_TOOLS_FOOTNOTE =
  "A phone video of a mobile app works too — upload it the same way.";

export const HOSTING_HEADING = "Where to put it";

export const HOSTING_OPTIONS = [
  {
    name: "YouTube (easiest)",
    text: "Upload, then set Visibility to Unlisted. Use Share → Copy link.",
  },
  {
    name: "Loom",
    text: "Paste the share link (loom.com/share/…). Nothing else to set.",
  },
  {
    name: "Google Drive",
    text: "Share → General access → Anyone with the link. School and work accounts sometimes block this — if it won't let you, use YouTube.",
  },
  { name: "Vimeo", text: "Public and Unlisted links both work." },
];

export const HOSTING_FOOTNOTE =
  "Uploading can take a while on event Wi-Fi. Starting 30 minutes before the deadline keeps it calm.";
