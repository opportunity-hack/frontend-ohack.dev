// Single source of truth for the per-event admin sidebar.
//
// Adding a new section: append here, then implement the matching component in
// ./sections/<name>Section.js. The page picks the component by `slug`.

import {
  Article as OverviewIcon,
  Schedule as ScheduleIcon,
  Restaurant as MealsIcon,
  PeopleAlt as ParticipantsIcon,
  Gavel as JudgesIcon,
  VolunteerActivism as NonprofitsIcon,
  PhotoLibrary as MediaIcon,
  Dashboard as PlanningIcon,
  AttachMoney as DonationsIcon,
  Link as LinksIcon,
  Badge as VolunteerAdminIcon,
  GroupWork as TeamsIcon,
  Balance as JudgingIcon,
  QrCodeScanner as CheckInIcon,
} from "@mui/icons-material";

// Sections are split into two groups visually (config vs. operations) but
// share a flat slug namespace. The "ops" sections (volunteer/teams/judging/
// check-in) replace the old standalone /admin/{slug} pages — those routes now
// redirect into here.
export const SECTIONS = [
  { slug: "overview", label: "Overview", icon: OverviewIcon, hint: "Title, dates, location, image", group: "config" },
  { slug: "schedule", label: "Schedule", icon: ScheduleIcon, hint: "Countdowns and event timeline", group: "config" },
  { slug: "meals", label: "Meals", icon: MealsIcon, hint: "Meal slots and menus for hackers", group: "config" },
  { slug: "participants", label: "Participants", icon: ParticipantsIcon, hint: "Applications, teams, screening", group: "config" },
  { slug: "judges", label: "Judges", icon: JudgesIcon, hint: "Judging settings and arrival time", group: "config" },
  { slug: "nonprofits", label: "Nonprofits", icon: NonprofitsIcon, hint: "Assigned organizations", group: "config" },
  { slug: "media", label: "Media", icon: MediaIcon, hint: "Photos and social posts", group: "config" },
  { slug: "planning", label: "Planning", icon: PlanningIcon, hint: "Planning board, Slack, editors", group: "config" },
  { slug: "donations", label: "Funding", icon: DonationsIcon, hint: "Donation totals and goals", group: "config" },
  { slug: "links", label: "Links", icon: LinksIcon, hint: "Buttons shown on the public event page", group: "config" },
  { slug: "volunteer", label: "Volunteer admin", icon: VolunteerAdminIcon, hint: "Mentors, judges, volunteers, hackers, sponsors", group: "ops" },
  { slug: "teams", label: "Teams", icon: TeamsIcon, hint: "Team rosters and nonprofit assignments", group: "ops" },
  { slug: "judging", label: "Judging", icon: JudgingIcon, hint: "Round 1, Round 2, and results", group: "ops" },
  { slug: "checkin", label: "Check-in", icon: CheckInIcon, hint: "QR scan and manual check-in at the event", group: "ops" },
];

export const DEFAULT_SECTION = "overview";

export const isValidSection = (slug) => SECTIONS.some((s) => s.slug === slug);
