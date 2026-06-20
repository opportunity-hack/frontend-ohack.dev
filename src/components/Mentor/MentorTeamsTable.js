import React, { useMemo, useState } from "react";
import NextLink from "next/link";
import { Avatar, AvatarGroup, Box, Tooltip, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { FaSlack, FaGithub, FaExternalLinkAlt, FaVideo, FaHeart } from "react-icons/fa";
import {
  isWinningStatus,
  getWinningStatus,
} from "../../constants/teamStatus";
import { statusLabel } from "../Teams/teamPageData";
import {
  MENTOR_COVERAGE_ITEMS,
  MENTOR_COVERAGE_TOTAL,
  relativeTime,
} from "../Teams/mentorCoverage";

// ---- derive one team's mentor-relevant signals from the raw team doc -------
function deriveTeam(team, nonprofitMap) {
  const checklist = team?.mentor_checklist || {};
  const coverage = MENTOR_COVERAGE_ITEMS.reduce(
    (acc, it) => acc + (checklist[it.slug]?.done ? 1 : 0),
    0
  );
  const openFlags =
    team?.mentor_open_flag_count != null
      ? Number(team.mentor_open_flag_count)
      : Array.isArray(team?.mentor_flags)
        ? team.mentor_flags.filter((f) => !f.resolved_at).length
        : 0;
  const lastTouchedAt = team?.mentor_last_touched_at || null;
  const isActive = team?.active === "True" || team?.active === true;
  const winning = isWinningStatus(team?.status);
  const members = Array.isArray(team?.users) ? team.users : [];
  const needsAttention = openFlags > 0 || (isActive && !lastTouchedAt);

  return {
    id: team?.id,
    name: team?.name || "Unnamed Team",
    teamNumber: team?.team_number,
    status: team?.status,
    statusText: winning ? getWinningStatus(team.status)?.label : statusLabel(team?.status),
    winning,
    isActive,
    nonprofitName: team?.selected_nonprofit_id
      ? nonprofitMap[team.selected_nonprofit_id] || null
      : null,
    members,
    memberCount: members.length,
    coverage,
    openFlags,
    lastTouchedAt,
    lastTouchedBy: team?.mentor_last_touched_by_name || null,
    needsAttention,
    slackChannel: team?.slack_channel || null,
    githubUrl: (() => {
      const g = Array.isArray(team?.github_links) ? team.github_links[0] : null;
      if (!g) return null;
      return typeof g === "string" ? g : g.link || null;
    })(),
    devpostUrl: team?.devpost_link || null,
    demoUrl: team?.demo_video_url || null,
  };
}

const FILTERS = [
  { key: "all", label: "All teams" },
  { key: "attention", label: "Needs attention" },
  { key: "active", label: "Active" },
  { key: "winning", label: "Winning" },
];

const SORTS = [
  { key: "attention", label: "Needs attention" },
  { key: "name", label: "Team name" },
  { key: "members", label: "Most members" },
  { key: "touch", label: "Recently touched" },
];

// ---- small shared bits -----------------------------------------------------
function StatusTag({ d }) {
  if (!d.isActive) {
    return (
      <span className="ohx-tag" style={{ gap: 6, display: "inline-flex", alignItems: "center" }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--faint)" }} />
        Inactive
      </span>
    );
  }
  if (!d.status || d.status === "INACTIVE") {
    return <span className="ohx-tag">Active</span>;
  }
  return (
    <span className={`ohx-tag${d.winning ? " ohx-tag--accent" : ""}`}>
      {d.winning ? `🏆 ${d.statusText}` : d.statusText}
    </span>
  );
}

function CoverageCell({ d }) {
  const full = d.coverage === MENTOR_COVERAGE_TOTAL;
  return (
    <span
      className={`ohx-tag${full ? " ohx-tag--accent" : ""}`}
      title={`${d.coverage} of ${MENTOR_COVERAGE_TOTAL} coverage items checked`}
    >
      {d.coverage}/{MENTOR_COVERAGE_TOTAL}
    </span>
  );
}

function FlagsCell({ d }) {
  if (d.openFlags > 0) {
    return (
      <span className="ohx-tag ohx-tag--accent" title="Open mentor flags">
        ⚑ {d.openFlags}
      </span>
    );
  }
  return <Box component="span" sx={{ color: "var(--faint)" }}>—</Box>;
}

function Members({ d }) {
  if (d.memberCount === 0) {
    return <Box component="span" sx={{ color: "var(--faint)" }}>—</Box>;
  }
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
      <AvatarGroup
        max={4}
        sx={{
          "& .MuiAvatar-root": {
            width: 26,
            height: 26,
            fontSize: 12,
            border: "1px solid var(--line)",
          },
        }}
      >
        {d.members.map((u, i) => {
          const name = typeof u === "object" ? u.name || u.nickname : null;
          const img = typeof u === "object" ? u.profile_image : null;
          return (
            <Tooltip key={(typeof u === "object" && u.id) || i} title={name || "Team member"}>
              <Avatar src={img} alt={name || "member"}>
                {(name || "?")[0]}
              </Avatar>
            </Tooltip>
          );
        })}
      </AvatarGroup>
      <Box component="span" sx={{ color: "var(--muted)", fontSize: "0.82rem" }}>
        {d.memberCount}
      </Box>
    </Box>
  );
}

function LinkIcons({ d, eventId }) {
  const icon = { fontSize: 15 };
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.1, flexWrap: "wrap" }}>
      {d.slackChannel && (
        <Tooltip title={`#${d.slackChannel}`}>
          <Box
            component="a"
            href={`https://opportunity-hack.slack.com/app_redirect?channel=${d.slackChannel}`}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: "var(--accent)", display: "inline-flex" }}
          >
            <FaSlack style={icon} />
          </Box>
        </Tooltip>
      )}
      {d.githubUrl && (
        <Tooltip title="GitHub repository">
          <Box component="a" href={d.githubUrl} target="_blank" rel="noopener noreferrer" sx={{ color: "var(--ink)", display: "inline-flex" }}>
            <FaGithub style={icon} />
          </Box>
        </Tooltip>
      )}
      {d.devpostUrl && (
        <Tooltip title="DevPost submission">
          <Box component="a" href={d.devpostUrl} target="_blank" rel="noopener noreferrer" sx={{ color: "var(--muted)", display: "inline-flex" }}>
            <FaExternalLinkAlt style={icon} />
          </Box>
        </Tooltip>
      )}
      {d.demoUrl && (
        <Tooltip title="Demo video">
          <Box component="a" href={d.demoUrl} target="_blank" rel="noopener noreferrer" sx={{ color: "var(--muted)", display: "inline-flex" }}>
            <FaVideo style={icon} />
          </Box>
        </Tooltip>
      )}
      <NextLink href={`/hack/${eventId}/team/${d.id}/mentor`} className="ohx-link" style={{ fontSize: "0.82rem" }}>
        Mentor →
      </NextLink>
    </Box>
  );
}

export default function MentorTeamsTable({ teams = [], eventId, nonprofits = [] }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("attention");

  const nonprofitMap = useMemo(() => {
    const m = {};
    (nonprofits || []).forEach((n) => {
      if (n?.id) m[n.id] = n.name;
    });
    return m;
  }, [nonprofits]);

  const derived = useMemo(
    () => teams.map((t) => deriveTeam(t, nonprofitMap)).filter((d) => d.id),
    [teams, nonprofitMap]
  );

  const attentionCount = useMemo(
    () => derived.filter((d) => d.needsAttention).length,
    [derived]
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = derived.filter((d) => {
      if (filter === "attention" && !d.needsAttention) return false;
      if (filter === "active" && !d.isActive) return false;
      if (filter === "winning" && !d.winning) return false;
      if (!q) return true;
      return (
        d.name.toLowerCase().includes(q) ||
        (d.nonprofitName || "").toLowerCase().includes(q) ||
        (d.slackChannel || "").toLowerCase().includes(q)
      );
    });

    const touchMs = (d) => (d.lastTouchedAt ? new Date(d.lastTouchedAt).getTime() : 0);
    list = [...list].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "members") return b.memberCount - a.memberCount || a.name.localeCompare(b.name);
      if (sortBy === "touch") return touchMs(b) - touchMs(a) || a.name.localeCompare(b.name);
      // "attention": flags desc, then never/oldest touch first, then name
      if (b.openFlags !== a.openFlags) return b.openFlags - a.openFlags;
      if (a.needsAttention !== b.needsAttention) return a.needsAttention ? -1 : 1;
      if (touchMs(a) !== touchMs(b)) return touchMs(a) - touchMs(b);
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [derived, query, filter, sortBy]);

  const inputSx = {
    fontFamily: "var(--body)",
    fontSize: "0.95rem",
    color: "var(--ink)",
    background: "var(--surface)",
    border: "1px solid var(--line)",
    borderRadius: "6px",
    padding: "0.6em 0.85em",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };

  const controls = (
    <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 1.5, alignItems: { md: "center" }, mb: 2.5 }}>
      <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
        <Box
          component="input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search teams, nonprofits, Slack channels…"
          aria-label="Search teams"
          sx={inputSx}
        />
      </Box>
      <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          const showCount = f.key === "attention" && attentionCount > 0;
          return (
            <Box
              key={f.key}
              component="button"
              type="button"
              onClick={() => setFilter(f.key)}
              aria-pressed={active}
              className="ohx-tag"
              sx={{
                cursor: "pointer",
                border: "1px solid",
                borderColor: active ? "var(--brand)" : "var(--line)",
                background: active ? "var(--brand)" : "var(--surface-2)",
                color: active ? "#fff" : "var(--muted)",
                fontWeight: 600,
              }}
            >
              {f.label}
              {showCount ? ` (${attentionCount})` : ""}
            </Box>
          );
        })}
      </Box>
      <Box
        component="select"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        aria-label="Sort teams"
        sx={{ ...inputSx, width: { xs: "100%", md: 200 }, cursor: "pointer" }}
      >
        {SORTS.map((s) => (
          <option key={s.key} value={s.key}>
            Sort: {s.label}
          </option>
        ))}
      </Box>
    </Box>
  );

  if (derived.length === 0) {
    return (
      <Box className="ohx-card" sx={{ p: { xs: 2.5, md: 3.5 }, color: "var(--muted)" }}>
        No teams have registered for this event yet.
      </Box>
    );
  }

  // ---- mobile: stacked cards ----
  if (isMobile) {
    return (
      <Box>
        {controls}
        <Box sx={{ color: "var(--muted)", fontSize: "0.85rem", mb: 1.5 }}>
          {rows.length} of {derived.length} teams
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {rows.map((d) => (
            <Box
              key={d.id}
              className="ohx-card"
              sx={{ p: 2, ...(d.openFlags > 0 ? { borderLeft: "3px solid var(--accent)" } : {}) }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, alignItems: "baseline" }}>
                <NextLink href={`/hack/${eventId}/team/${d.id}`} className="ohx-link" style={{ fontSize: "1.02rem", fontWeight: 600 }}>
                  {d.name}
                </NextLink>
                <StatusTag d={d} />
              </Box>
              {d.nonprofitName && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "var(--muted)", fontSize: "0.85rem", mt: 0.5 }}>
                  <FaHeart style={{ color: "var(--accent)", fontSize: 11 }} /> {d.nonprofitName}
                </Box>
              )}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center", mt: 1.25 }}>
                <CoverageCell d={d} />
                <FlagsCell d={d} />
                <span className="ohx-tag">
                  {d.lastTouchedAt ? `Touched ${relativeTime(d.lastTouchedAt)}` : "Never touched"}
                </span>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1.5 }}>
                <Members d={d} />
                <LinkIcons d={d} eventId={eventId} />
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  // ---- desktop: hairline table ----
  const thSx = {
    textAlign: "left",
    fontFamily: "var(--body)",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    fontSize: "0.64rem",
    fontWeight: 700,
    color: "var(--faint)",
    py: 1,
    px: 1.25,
    borderBottom: "1px solid var(--line)",
    whiteSpace: "nowrap",
  };
  const tdSx = {
    py: 1.25,
    px: 1.25,
    borderBottom: "1px solid var(--line)",
    verticalAlign: "middle",
    fontSize: "0.9rem",
    color: "var(--ink)",
  };

  return (
    <Box>
      {controls}
      <Box sx={{ color: "var(--muted)", fontSize: "0.85rem", mb: 1.5 }}>
        {rows.length} of {derived.length} teams
        {filter === "all" && attentionCount > 0 ? ` · ${attentionCount} need attention` : ""}
      </Box>
      <Box className="ohx-card" sx={{ overflowX: "auto", p: 0 }}>
        <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", minWidth: 880 }}>
          <Box component="thead">
            <Box component="tr">
              <Box component="th" sx={thSx}>Team</Box>
              <Box component="th" sx={thSx}>Status</Box>
              <Box component="th" sx={thSx}>Nonprofit</Box>
              <Box component="th" sx={thSx}>Members</Box>
              <Box component="th" sx={thSx}>Coverage</Box>
              <Box component="th" sx={thSx}>Flags</Box>
              <Box component="th" sx={thSx}>Last touch</Box>
              <Box component="th" sx={thSx}>Links</Box>
            </Box>
          </Box>
          <Box component="tbody">
            {rows.map((d) => (
              <Box
                component="tr"
                key={d.id}
                sx={{
                  opacity: d.isActive ? 1 : 0.6,
                  ...(d.openFlags > 0 ? { background: "var(--accent-soft)" } : {}),
                  "&:hover": { background: d.openFlags > 0 ? "var(--accent-soft)" : "var(--surface-2)" },
                }}
              >
                <Box component="td" sx={tdSx}>
                  <NextLink href={`/hack/${eventId}/team/${d.id}`} className="ohx-link" style={{ fontWeight: 600 }}>
                    {d.name}
                  </NextLink>
                  {d.teamNumber != null && (
                    <Box component="span" sx={{ color: "var(--faint)", fontSize: "0.78rem", ml: 0.75 }}>
                      #{d.teamNumber}
                    </Box>
                  )}
                </Box>
                <Box component="td" sx={tdSx}><StatusTag d={d} /></Box>
                <Box component="td" sx={{ ...tdSx, color: d.nonprofitName ? "var(--muted)" : "var(--faint)", maxWidth: 200 }}>
                  {d.nonprofitName || "—"}
                </Box>
                <Box component="td" sx={tdSx}><Members d={d} /></Box>
                <Box component="td" sx={tdSx}><CoverageCell d={d} /></Box>
                <Box component="td" sx={tdSx}><FlagsCell d={d} /></Box>
                <Box component="td" sx={{ ...tdSx, color: d.lastTouchedAt ? "var(--muted)" : "var(--faint)", whiteSpace: "nowrap" }}>
                  {d.lastTouchedAt ? (
                    <Tooltip title={d.lastTouchedBy ? `by ${d.lastTouchedBy}` : ""}>
                      <span>{relativeTime(d.lastTouchedAt)}</span>
                    </Tooltip>
                  ) : (
                    "Never"
                  )}
                </Box>
                <Box component="td" sx={tdSx}><LinkIcons d={d} eventId={eventId} /></Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
