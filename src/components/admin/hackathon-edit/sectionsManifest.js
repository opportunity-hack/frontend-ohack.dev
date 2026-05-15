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
} from "@mui/icons-material";

export const SECTIONS = [
  { slug: "overview", label: "Overview", icon: OverviewIcon, hint: "Title, dates, location, image" },
  { slug: "schedule", label: "Schedule", icon: ScheduleIcon, hint: "Countdowns and event timeline" },
  { slug: "meals", label: "Meals", icon: MealsIcon, hint: "Meal slots and menus for hackers" },
  { slug: "participants", label: "Participants", icon: ParticipantsIcon, hint: "Applications, teams, screening" },
  { slug: "judges", label: "Judges", icon: JudgesIcon, hint: "Judging settings and arrival time" },
  { slug: "nonprofits", label: "Nonprofits", icon: NonprofitsIcon, hint: "Assigned organizations" },
  { slug: "media", label: "Media", icon: MediaIcon, hint: "Photos and social posts" },
  { slug: "planning", label: "Planning", icon: PlanningIcon, hint: "Planning board, Slack, editors" },
  { slug: "donations", label: "Funding", icon: DonationsIcon, hint: "Donation totals and goals" },
  { slug: "links", label: "Links", icon: LinksIcon, hint: "Buttons shown on the public event page" },
];

export const DEFAULT_SECTION = "overview";

export const isValidSection = (slug) => SECTIONS.some((s) => s.slug === slug);
