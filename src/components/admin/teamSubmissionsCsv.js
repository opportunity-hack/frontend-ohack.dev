/**
 * Pure CSV builder for the "Export submissions CSV" button on
 * `/admin/teams` (`TeamManagement.js`). No fetching, no DOM — the caller
 * turns the returned string into a Blob download.
 */

import { getSubmissionStatus, firstRepoUrl } from "../Teams/projectMeta";

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
