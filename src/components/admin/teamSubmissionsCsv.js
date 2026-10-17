/**
 * Pure CSV builder for the "Export submissions CSV" button on
 * `/admin/teams` (`TeamManagement.js`). No fetching, no DOM — the caller
 * turns the returned string into a Blob download.
 */

import { getSubmissionStatus, firstRepoUrl } from "../Teams/projectMeta";
import { getStatusOption } from "../../constants/teamStatus";

const CSV_COLUMNS = [
  "name",
  "tagline",
  "submission_status",
  "submitted_at",
  "demo_video_url",
  "github_url",
  "devpost_link",
  "slack_channel",
  "members",
  "nonprofit",
];

/** RFC-4180 field escaping: quote whenever the value contains a comma, quote, or newline. */
function csvField(value) {
  const str = value == null ? "" : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function memberName(member) {
  if (typeof member === "string") return member;
  return member?.real_name || member?.name || "";
}

/**
 * Builds an RFC-4180 CSV string (with header row) summarizing each team's
 * project submission. `nonprofitMap` is the same `{id: name}` map the table
 * already builds for the Nonprofit column.
 */
export function buildSubmissionsCsv(teams, nonprofitMap = {}) {
  const rows = [CSV_COLUMNS];
  (teams || []).forEach((team) => {
    const members = Array.isArray(team.team_members)
      ? team.team_members.map(memberName).filter(Boolean)
      : [];
    const nonprofit = team.selected_nonprofit_id
      ? nonprofitMap[team.selected_nonprofit_id] || ""
      : "";
    rows.push([
      team.name || "",
      team.project_tagline || "",
      getSubmissionStatus(team) || "",
      team.project_submitted_at || "",
      team.demo_video_url || "",
      firstRepoUrl(team) || "",
      team.devpost_link || "",
      team.slack_channel || "",
      members.join("; "),
      nonprofit,
    ]);
  });
  return rows.map((row) => row.map(csvField).join(",")).join("\r\n");
}

// ---------------------------------------------------------------------------
// Full team export ("Export teams CSV") — every column the admin table shows
// plus the project write-up metadata. Shared `buildCsv` column spec; the
// caller passes the live nonprofit map and (optionally) gateway-key statuses.
// ---------------------------------------------------------------------------

const memberList = (team) => {
  if (Array.isArray(team?.team_members)) return team.team_members;
  if (Array.isArray(team?.users)) return team.users;
  return [];
};

const repoLinks = (team) =>
  (Array.isArray(team?.github_links) ? team.github_links : [])
    .map((r) => (typeof r === "string" ? r : r?.link || ""))
    .filter(Boolean);

export function teamExportColumns({ nonprofitMap = {}, gatewayKeyStatuses = null } = {}) {
  const cols = [
    { key: "name", label: "Team" },
    {
      key: "status",
      label: "Status",
      get: (t) => getStatusOption(t?.status || "IN_REVIEW")?.label || t?.status || "",
    },
    {
      key: "nonprofit",
      label: "Nonprofit",
      get: (t) =>
        t?.selected_nonprofit_id ? nonprofitMap[t.selected_nonprofit_id] || t.selected_nonprofit_id : "",
    },
    { key: "members", label: "Members", get: (t) => memberList(t).map(memberName).filter(Boolean) },
    { key: "member_count", label: "Member count", get: (t) => memberList(t).length },
    {
      key: "member_github",
      label: "Member GitHub",
      get: (t) => memberList(t).map((m) => (typeof m === "object" ? m?.github : "")).filter(Boolean),
    },
    { key: "slack_channel", label: "Slack channel" },
    { key: "github_links", label: "GitHub repos", get: repoLinks },
    { key: "devpost_link", label: "DevPost" },
    { key: "demo_video_url", label: "Demo video" },
    { key: "project_tagline", label: "Tagline" },
    { key: "project_submission_status", label: "Submission", get: (t) => getSubmissionStatus(t) || "" },
    { key: "project_submitted_at", label: "Submitted at" },
    { key: "project_built_with", label: "Built with" },
    { key: "awards", label: "Awards", get: (t) => (Array.isArray(t?.awards) ? t.awards : []) },
    { key: "mentor_help_wanted", label: "Open to mentors", get: (t) => t?.mentor_help_wanted !== false },
  ];
  if (gatewayKeyStatuses) {
    cols.push({ key: "ai_key", label: "AI key", get: (t) => gatewayKeyStatuses[t?.id]?.status || "" });
  }
  cols.push({ key: "created", label: "Created" }, { key: "id", label: "Id" });
  return cols;
}
