import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";

// MUI Components
import Tooltip from "@mui/material/Tooltip";
import BuildIcon from "@mui/icons-material/Build";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import TagIcon from "@mui/icons-material/Tag";
import Switch from "@mui/material/Switch";
import Stack from "@mui/material/Stack";
import FormControlLabel from "@mui/material/FormControlLabel";
import { styled } from "@mui/material/styles";
import SupportIcon from "@mui/icons-material/Support";
import ArticleIcon from "@mui/icons-material/Article";
import DeveloperModeIcon from "@mui/icons-material/DeveloperMode";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import EventIcon from "@mui/icons-material/Event";
import CodeIcon from "@mui/icons-material/Code";
import useMediaQuery from "@mui/material/useMediaQuery";
import Link from "next/link";
import Grid from "@mui/material/Grid";
import Collapse from "@mui/material/Collapse";
import { useTheme } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GitHubIcon from "@mui/icons-material/GitHub";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ReactMarkdown from "react-markdown";

// Imported Components
import useProfileApi from "../../hooks/use-profile-api";
import ProjectProgress from "../ProjectProgress/ProjectProgress";
import SkillSet from "../skill-set";
import CopyToClipboardButton from "../buttons/CopyToClipboardButton";
import useProblemstatements from "../../hooks/use-problem-statements";
import useHackathonEvents from "../../hooks/use-hackathon-events";
import useProjectNonprofit from "../../hooks/use-project-nonprofit";
import { useRedirectFunctions } from "@propelauth/react";
import { trackEvent, initFacebookPixel } from "../../lib/ga";
import {
  isPausedStatus,
  isLiveStatus,
  acceptsNewHelpers,
} from "../../lib/projectStatus";
import Events from "../Events/Events";
import ReferenceItem from "../ReferenceItem/ReferenceItem";
import { HelpDialog, UnhelpDialog } from "../HelpDialog/HelpDialog";
import HelpersRoster from "./HelpersRoster";
import {
  normalizeHelpers,
  countHelpers,
  findCurrentUserHelper,
  upsertHelper,
  removeHelper,
} from "./helpersData";

// Navy-branded help toggle switch — hoisted so it isn't re-created on every render
const MaterialUISwitch = styled(Switch)({
  width: 70,
  height: 38,
  padding: 7,
  "& .MuiSwitch-switchBase": {
    margin: 1,
    padding: 0,
    transform: "translateX(6px)",
    "&.Mui-checked": {
      color: "#fff",
      transform: "translateX(26px)",
      "& .MuiSwitch-thumb:before": {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          "#fff"
        )}" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>')`,
      },
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor: "#1B3A6B",
      },
    },
  },
  "& .MuiSwitch-thumb": {
    backgroundColor: "#fff",
    width: 32,
    height: 32,
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    "&:before": {
      content: "''",
      position: "absolute",
      width: "100%",
      height: "100%",
      left: 0,
      top: 0,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
        "#64748b"
      )}" d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/></svg>')`,
    },
  },
  "& .MuiSwitch-track": {
    opacity: 1,
    backgroundColor: "#E7E1D4",
    borderRadius: 20,
  },
});

// --- Code & Tasks helpers (module scope — see SectionBlock remount lesson) ---
const normalizeRepoLink = (link) =>
  (link || "").trim().replace(/\/+$/, "").toLowerCase();

const parseGithubRepo = (link) => {
  const match = /github\.com\/([^/]+)\/([^/#?]+)/i.exec(link || "");
  return match
    ? { org: match[1], repo: match[2].replace(/\.git$/i, "") }
    : null;
};

const repoNameFromLink = (link) => {
  const gh = parseGithubRepo(link);
  return gh ? gh.repo : link;
};

// One repository card: name, team attribution, live issue chips, top open
// issues, and the Code / Issues deep-links. Module scope so it never remounts
// on parent state ticks (issue data arriving, help toggle, etc.).
const RepoCard = ({ repo, issueData, onLinkClick }) => {
  const repoButtonStyle = {
    fontSize: "0.82rem",
    padding: "0.5em 0.9em",
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
  };

  return (
    <div
      className="ohx-card"
      style={{ padding: "14px 16px", height: "100%", boxSizing: "border-box" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: repo.builtBy.length > 0 ? 4 : 10,
        }}
      >
        <p
          style={{
            fontWeight: 600,
            fontSize: "0.95rem",
            margin: 0,
            color: "var(--ink)",
            overflowWrap: "anywhere",
          }}
        >
          {repo.name}
        </p>
        {issueData && (
          <span className="ohx-tag" style={{ fontSize: "0.7rem" }}>
            {issueData.open} open
            {issueData.closed > 0 ? ` · ${issueData.closed} closed` : ""}
          </span>
        )}
      </div>

      {repo.builtBy.length > 0 && (
        <p className="ohx-muted" style={{ fontSize: "0.8rem", margin: "0 0 10px" }}>
          Built by{" "}
          {repo.builtBy.map((b) => `${b.team} (${b.event})`).join(", ")}
        </p>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <a
          href={repo.link}
          target="_blank"
          rel="noopener noreferrer"
          className="ohx-btn ohx-btn--ghost"
          style={repoButtonStyle}
          onClick={() => onLinkClick?.("code", repo.link)}
        >
          <CodeIcon sx={{ fontSize: 13 }} /> Code
        </a>
        <a
          href={`${repo.link}/issues`}
          target="_blank"
          rel="noopener noreferrer"
          className="ohx-btn ohx-btn--ghost"
          style={repoButtonStyle}
          onClick={() => onLinkClick?.("issues", repo.link)}
        >
          <AssignmentIcon sx={{ fontSize: 13 }} /> Issues
        </a>
      </div>

      {issueData?.topOpen?.length > 0 && (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: "12px 0 0",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {issueData.topOpen.map((issue) => (
            <li
              key={issue.number}
              style={{
                fontSize: "0.85rem",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              <a
                className="ohx-link"
                href={`${repo.link}/issues/${issue.number}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onLinkClick?.("issue_detail", repo.link)}
              >
                #{issue.number} {issue.title}
              </a>
            </li>
          ))}
        </ul>
      )}

      {issueData && issueData.open === 0 && (
        <p className="ohx-muted" style={{ fontSize: "0.82rem", margin: "12px 0 0" }}>
          No open issues yet — that's your opening. Pull the code, run it, and
          write the first tickets like a product manager. Closed tickets are
          public credit for the work.
        </p>
      )}
    </div>
  );
};

export default function ProblemStatement({
  problem_statement_id,
  user,
  npo_id,
  headingLevel = "h1",
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { redirectToLoginPage } = useRedirectFunctions();
  const { problem_statement } = useProblemstatements(problem_statement_id);
  const { handle_get_hackathon_id } = useHackathonEvents();

  const { nonprofits: resolvedNonprofits } = useProjectNonprofit(
    problem_statement_id,
    npo_id
  );
  const effectiveNpoId = npo_id || resolvedNonprofits[0]?.id;

  const [hackathonEvents, setHackathonEvents] = useState([]);
  const [hackathonEventsLoaded, setHackathonEventsLoaded] = useState(false);
  const [hackathonEventsError, setHackathonEventsError] = useState(false);
  const [open, setOpen] = useState(false);
  const [openUnhelp, setOpenUnhelp] = useState(false);
  const [help_checked, setHelpedChecked] = useState("");
  const [helpingType, setHelpingType] = useState("");
  const [expanded, setExpanded] = useState("Events");
  const [tabValue, setTabValue] = useState("Events");
  const [expandedSection, setExpandedSection] = useState("references");
  const { profile, handle_help_toggle } = useProfileApi();
  // Who's helping (issue #359): seeded from the static `helping` array so the
  // counts render on the server, then replaced by ONE batched roster fetch
  // (names/avatars, deduped, oldest first). This replaced the old loop that
  // fetched a full profile per helper entry just to find the current user.
  const [helpers, setHelpers] = useState(() =>
    normalizeHelpers(problem_statement?.helping),
  );
  const [helpersLoading, setHelpersLoading] = useState(false);
  const [helpersEnriched, setHelpersEnriched] = useState(false);
  const helpersRequestRef = useRef(0);

  // Code & Tasks: lazy live GitHub issue data, keyed by normalized repo link
  const [codeSectionVisible, setCodeSectionVisible] = useState(false);
  const [repoIssueData, setRepoIssueData] = useState({});
  const issuesRequestedRef = useRef(new Set());
  const codeSectionRef = useRef(null);
  // Enriched event data (full team docs) for team-repo derivation — the
  // page's own event fetch uses the by-doc-id route whose teams[] are bare
  // id strings, so we need the enriched by-event_id getter for github_links
  const [teamRepoEvents, setTeamRepoEvents] = useState([]);
  const [teamRepoEventsChecked, setTeamRepoEventsChecked] = useState(false);

  const handleSectionToggle = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Initialize Facebook Pixel
  useEffect(() => {
    initFacebookPixel();
  }, []);

  useEffect(() => {
    if (problem_statement?.events?.length > 0) {
      const eventsData = [];
      const promises = [];

      problem_statement.events.forEach((id) => {
        const promise = new Promise((resolve, reject) => {
          handle_get_hackathon_id(id, (hackathonEvent) => {
            if (hackathonEvent) {
              eventsData.push(hackathonEvent);
              resolve(hackathonEvent);
            } else {
              reject("Error getting hackathon event");
            }
          });
        });
        promises.push(promise);
      });

      Promise.all(promises)
        .then(() => {
          setHackathonEvents(eventsData);
          setHackathonEventsLoaded(true);
        })
        .catch(() => {
          setHackathonEventsError(true);
        });
    }
  }, [problem_statement_id, problem_statement?.events]);

  const loadHelpers = useCallback(async (psId) => {
    if (!psId) return;
    const requestId = ++helpersRequestRef.current;
    setHelpersLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/problem-statements/${psId}/helpers`,
      );
      if (!response.ok) return; // older backend / 404 → keep the static fallback
      const data = await response.json();
      if (requestId !== helpersRequestRef.current) return;
      if (Array.isArray(data?.helpers)) {
        setHelpers(data.helpers);
        setHelpersEnriched(true);
      }
    } catch (error) {
      // Static fallback (counts without names) keeps rendering
    } finally {
      if (requestId === helpersRequestRef.current) setHelpersLoading(false);
    }
  }, []);

  // Key on the CONTENT of `helping`, not the array identity — the parent
  // re-creates the problem statement object on client refetches, which
  // otherwise re-fired this (two roster requests per page load).
  const helpingSignature = JSON.stringify(problem_statement?.helping || []);
  useEffect(() => {
    setHelpers(normalizeHelpers(JSON.parse(helpingSignature)));
    setHelpersEnriched(false);
    loadHelpers(problem_statement?.id);
  }, [problem_statement?.id, helpingSignature, loadHelpers]);

  // Reflect the signed-in user's own roster row in the toggle. Matches on the
  // db id first (own-profile payload carries `id`), OAuth user_id as fallback.
  useEffect(() => {
    if (!user || !profile?.id) return;
    const mine = findCurrentUserHelper(helpers, profile);
    if (mine) {
      setHelpedChecked("checked");
      setHelpingType(mine.type || "hacker");
    } else {
      setHelpedChecked("");
      setHelpingType("");
    }
  }, [helpers, user, profile]);

  // Fetch enriched event data (with full team docs) once the by-id events
  // have loaded and given us the event_id slugs. The enriched endpoint is
  // backend-cached (10-min TTL) and shared with the event page, so this is
  // usually a cache hit.
  useEffect(() => {
    if (!problem_statement) return undefined;
    if (!problem_statement.events?.length) {
      setTeamRepoEventsChecked(true);
      return undefined;
    }
    if (!hackathonEventsLoaded && !hackathonEventsError) return undefined;

    const slugs = [
      ...new Set(
        hackathonEvents.map((event) => event?.event_id).filter(Boolean)
      ),
    ];
    if (slugs.length === 0) {
      setTeamRepoEventsChecked(true);
      return undefined;
    }

    let cancelled = false;
    Promise.all(
      slugs.map(async (slug) => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${encodeURIComponent(slug)}`
          );
          if (!res.ok) return null;
          return await res.json();
        } catch (error) {
          return null;
        }
      })
    ).then((results) => {
      if (cancelled) return;
      setTeamRepoEvents(results.filter((r) => r && Array.isArray(r.teams)));
      setTeamRepoEventsChecked(true);
    });

    return () => {
      cancelled = true;
    };
  }, [
    problem_statement,
    hackathonEvents,
    hackathonEventsLoaded,
    hackathonEventsError,
  ]);

  // Merge repos from the problem statement itself with repos from the
  // hackathon teams that built it. Team linkage prefers the team's own
  // problem_statements list; the nonprofit fallback only applies to teams
  // with no problem_statements data (avoids claiming repos from a sibling
  // project of a multi-project nonprofit). Dedupe by normalized link — a
  // team repo matching a project-level repo just adds attribution.
  // Also groups the matched teams per event for the Events & Teams section.
  const { repos: codeRepos, teamsByEvent: projectTeamsByEvent } =
    useMemo(() => {
    if (!problem_statement) return { repos: [], teamsByEvent: {} };
    const map = new Map();
    const teamsByEvent = {};

    const rawGithub = problem_statement.github;
    const projectLevel = Array.isArray(rawGithub)
      ? rawGithub
      : typeof rawGithub === "string" && rawGithub.trim()
      ? [{ link: rawGithub.trim() }]
      : [];
    projectLevel.forEach((entry) => {
      const link = typeof entry === "string" ? entry : entry?.link;
      if (!link) return;
      const key = normalizeRepoLink(link);
      if (!map.has(key)) {
        map.set(key, {
          name:
            (typeof entry === "object" && entry?.name) ||
            repoNameFromLink(link),
          link,
          isProjectRepo: true,
          builtBy: [],
        });
      }
    });

    const npoIds = new Set(resolvedNonprofits.map((n) => n.id));
    teamRepoEvents.forEach((event) => {
      (event?.teams || []).forEach((team) => {
        if (!team) return;
        const psIds = (team.problem_statements || [])
          .map((p) => (typeof p === "string" ? p : p?.id))
          .filter(Boolean);
        const matches =
          psIds.length > 0
            ? psIds.includes(problem_statement.id)
            : team.selected_nonprofit_id &&
              npoIds.has(team.selected_nonprofit_id);
        if (!matches) return;
        if (event.event_id) {
          if (!teamsByEvent[event.event_id]) teamsByEvent[event.event_id] = [];
          teamsByEvent[event.event_id].push(team);
        }
        (team.github_links || []).forEach((gl) => {
          const link = typeof gl === "string" ? gl : gl?.link;
          if (!link) return;
          const key = normalizeRepoLink(link);
          const attribution = {
            team: team.name,
            event: event.title || event.event_id,
          };
          if (map.has(key)) {
            const existing = map.get(key);
            if (
              team.name &&
              !existing.builtBy.some((b) => b.team === team.name)
            ) {
              existing.builtBy.push(attribution);
            }
          } else {
            map.set(key, {
              name:
                (typeof gl === "object" && gl?.name) || repoNameFromLink(link),
              link,
              isProjectRepo: false,
              builtBy: team.name ? [attribution] : [],
            });
          }
        });
      });
    });

    return { repos: Array.from(map.values()), teamsByEvent };
  }, [problem_statement, teamRepoEvents, resolvedNonprofits]);

  // Only fetch issue data once the Code & Tasks section scrolls near
  // (same fire-once IntersectionObserver pattern as TeamList's TeamCard)
  useEffect(() => {
    if (codeSectionVisible) return undefined;
    const node = codeSectionRef.current;
    if (!node) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      setCodeSectionVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setCodeSectionVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [codeSectionVisible, problem_statement]);

  // Batched issue fetch through the backend proxy — dedupe via ref,
  // Promise.all, ONE setState (never per-repo setState)
  useEffect(() => {
    if (!codeSectionVisible || codeRepos.length === 0) return undefined;
    const pending = codeRepos.filter((repo) => {
      const gh = parseGithubRepo(repo.link);
      return gh && !issuesRequestedRef.current.has(normalizeRepoLink(repo.link));
    });
    if (pending.length === 0) return undefined;
    pending.forEach((repo) =>
      issuesRequestedRef.current.add(normalizeRepoLink(repo.link))
    );

    let cancelled = false;
    Promise.all(
      pending.map(async (repo) => {
        const gh = parseGithubRepo(repo.link);
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/github/issues?org=${encodeURIComponent(
              gh.org
            )}&repo=${encodeURIComponent(gh.repo)}&state=all`
          );
          if (!res.ok) return null;
          const data = await res.json();
          if (!data?.success || !Array.isArray(data.issues)) return null;
          const openIssues = data.issues.filter(
            (issue) => issue.state === "open"
          );
          return [
            normalizeRepoLink(repo.link),
            {
              open: openIssues.length,
              closed: data.issues.length - openIssues.length,
              topOpen: openIssues.slice(0, 5).map((issue) => ({
                number: issue.issue_number,
                title: issue.title,
              })),
            },
          ];
        } catch (error) {
          return null; // swallow — static links still render
        }
      })
    ).then((entries) => {
      if (cancelled) return;
      const valid = entries.filter(Boolean);
      if (valid.length > 0) {
        setRepoIssueData((prev) => ({
          ...prev,
          ...Object.fromEntries(valid),
        }));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [codeSectionVisible, codeRepos]);

  const handleChange = (panel) => (event, isExpanded) => {
    const params = {
      action_name: isExpanded ? "open" : "close",
      panel_id: panel,
      npo_id: effectiveNpoId,
      problem_statement_id: problem_statement?.id,
      problem_statement_title: problem_statement?.title,
      user_id: user?.userId,
    };
    trackEvent({ action: "problem_statement_accordion", params: params });
    setExpanded(isExpanded ? panel : false);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleClickOpen = (event) => {
    if (event.target.checked) {
      setOpen(true);
      trackEvent({
        action: "Helping Dialog Opened",
        params: {
          problem_statement_id: problem_statement?.id,
          problem_statement_title: problem_statement?.title,
          npo_id: effectiveNpoId,
          user_id: user?.userId,
        },
      });
    } else {
      setOpenUnhelp(true);
      trackEvent({
        action: "Not Helping Dialog Opened",
        params: {
          problem_statement_id: problem_statement?.id,
          problem_statement_title: problem_statement?.title,
          npo_id: effectiveNpoId,
          user_id: user?.userId,
        },
      });
    }
  };

  const handleClose = (helperType) => {
    trackEvent({
      action: "Helping: User Finalized Start Helping",
      params: {
        category: "Helping",
        label: "Helping",
        problem_statement_id: problem_statement?.id,
        problem_statement_title: problem_statement?.title,
        npo_id: effectiveNpoId,
        user_id: user?.userId,
        mentor_or_hacker: helperType,
      },
    });
    setOpen(false);
    setHelpedChecked("checked");
    setHelpingType(helperType);
    // Optimistic: show yourself in the roster immediately, then reconcile
    // with the server once the toggle has been written (cache is cleared
    // server-side on every toggle).
    setHelpers((prev) =>
      upsertHelper(prev, {
        db_id: profile?.id || null,
        user_id: profile?.user_id || null,
        name: profile?.name || null,
        nickname: profile?.nickname || null,
        profile_image: profile?.profile_image || null,
        type: helperType,
        since: new Date().toISOString(),
      }),
    );
    Promise.resolve(
      handle_help_toggle("helping", problem_statement.id, helperType, effectiveNpoId),
    )
      .catch(() => {})
      .then(() => loadHelpers(problem_statement.id));
  };

  const handleCancel = () => {
    trackEvent({
      action: "Helping: User Canceled Helping",
      params: {
        category: "Helping",
        label: "Helping",
        problem_statement_id: problem_statement?.id,
        problem_statement_title: problem_statement?.title,
        npo_id: effectiveNpoId,
        user_id: user?.userId,
      },
    });
    setOpen(false);
    setHelpedChecked("");
    setHelpingType("");
  };

  const handleCloseUnhelp = () => {
    trackEvent({
      action: "Helping: User Finalized Stop Helping",
      params: {
        category: "Helping",
        label: "Helping",
        problem_statement_id: problem_statement?.id,
        problem_statement_title: problem_statement?.title,
        npo_id: effectiveNpoId,
        user_id: user?.userId,
      },
    });
    setOpenUnhelp(false);
    setHelpedChecked("");
    setHelpingType("");
    setHelpers((prev) => removeHelper(prev, profile));
    Promise.resolve(
      handle_help_toggle("not_helping", problem_statement.id, "", effectiveNpoId),
    )
      .catch(() => {})
      .then(() => loadHelpers(problem_statement.id));
  };

  const handleCloseUnhelpCancel = () => {
    trackEvent({
      action: "Helping: User Canceled Stop Helping",
      params: { category: "Helping", label: "Helping" },
    });
    setOpenUnhelp(false);
  };

  function getWordStr(str) {
    if (str != null && str.length > 0 && typeof str === "string") {
      return str.split(/\s+/).slice(0, 30).join(" ");
    } else {
      return "";
    }
  }

  if (!problem_statement) {
    return (
      <div
        className="ohx-card"
        style={{ padding: "32px 24px", textAlign: "center", minHeight: 120 }}
      >
        <p className="ohx-muted" style={{ margin: 0 }}>
          Loading project…
        </p>
      </div>
    );
  }

  // One row per person — the raw `helping` array carries legacy duplicate
  // clicks, so counting it directly over-reports.
  const helperCounts = countHelpers(helpers);
  const countOfHackers = helperCounts.hacker;
  const countOfMentors = helperCounts.mentor;

  const totalContributors = countOfHackers + countOfMentors;
  const eventsCount = hackathonEvents.length;

  const getEngagementLevel = () => {
    if (totalContributors >= 10 || eventsCount >= 3) return "high";
    if (totalContributors >= 5 || eventsCount >= 2) return "medium";
    return "low";
  };

  const copyProjectLink = "project/" + problem_statement.id;

  // Live projects don't need new volunteers; maintenance-status projects still
  // do. Paused projects have no active need, so they don't recruit either.
  const isPaused = isPausedStatus(problem_statement.status);
  const offerHelpToggle = acceptsNewHelpers(problem_statement.status);

  // Code & Tasks tiers: project-level repos are canonical; team-built repos
  // from hackathons follow under their own quiet label
  const projectRepos = codeRepos.filter((repo) => repo.isProjectRepo);
  const teamRepos = codeRepos.filter((repo) => !repo.isProjectRepo);

  // Unique per problem statement — nonprofit pages render one
  // ProblemStatement per project, so a fixed id would collide
  const codeSectionId = `code-and-tasks-${problem_statement.id}`;

  const handleRepoLinkClick = (kind, repoLink) => {
    trackEvent({
      action: "project_repo_click",
      params: {
        kind,
        repo: repoLink,
        problem_statement_id: problem_statement?.id,
        npo_id: effectiveNpoId,
      },
    });
  };

  // Dynamic heading element driven by headingLevel prop
  const TitleTag = headingLevel;

  const renderStatus = () => {
    if (isPaused) {
      return (
        <Tooltip
          title="Work on this project is on hold — check the Slack channel before starting new work."
          arrow
          placement="top"
        >
          <span className="ohx-tag">
            <PauseCircleOutlineIcon
              sx={{ fontSize: 13, verticalAlign: "middle", mr: 0.5 }}
            />
            Paused
          </span>
        </Tooltip>
      );
    }
    if (isLiveStatus(problem_statement.status)) {
      const maintained = problem_statement.status === "maintenance";
      return (
        <span style={{ display: "inline-flex", gap: 6, flexWrap: "wrap" }}>
          <Tooltip
            title="This project is live and being used by the nonprofit!"
            arrow
            placement="top"
          >
            <span className="ohx-tag">
              <WorkspacePremiumIcon
                sx={{ fontSize: 13, verticalAlign: "middle", mr: 0.5 }}
              />
              Live
            </span>
          </Tooltip>
          {maintained && (
            <Tooltip
              title="Live and in maintenance — patches and small enhancements still welcome help."
              arrow
              placement="top"
            >
              <span className="ohx-tag ohx-tag--accent">
                <BuildIcon
                  sx={{ fontSize: 13, verticalAlign: "middle", mr: 0.5 }}
                />
                Welcomes Help
              </span>
            </Tooltip>
          )}
        </span>
      );
    }
    return (
      <Tooltip
        title="This project needs your help to reach completion!"
        arrow
        placement="top"
      >
        <span className="ohx-tag ohx-tag--accent">
          <BuildIcon sx={{ fontSize: 13, verticalAlign: "middle", mr: 0.5 }} />
          Needs Help
        </span>
      </Tooltip>
    );
  };

  const renderHelpToggle = () => {
    const labelBox = !user ? (
      <Box sx={{ ml: 2 }}>
        <Typography variant="body1" fontWeight={600} color="text.secondary">
          Sign in to help
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Join {totalContributors} contributors making impact
        </Typography>
      </Box>
    ) : (
      <Box sx={{ ml: 2 }}>
        <Typography variant="body1" fontWeight={600}>
          {help_checked === "checked" ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {helpingType === "hacker" ? (
                <DeveloperModeIcon sx={{ fontSize: 18 }} />
              ) : (
                <SupportIcon sx={{ fontSize: 18 }} />
              )}
              {helpingType === "hacker" ? "Hacking" : "Mentoring"}
            </Box>
          ) : (
            "Want to help?"
          )}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {help_checked === "checked"
            ? "You're part of the solution!"
            : "Join the community of changemakers"}
        </Typography>
      </Box>
    );

    return (
      <FormControlLabel
        sx={{
          m: 0,
          p: 2,
          border: "1px solid var(--line)",
          borderRadius: 2,
          background: "var(--surface)",
          width: "100%",
          boxSizing: "border-box",
        }}
        control={
          <Tooltip
            title={
              !user
                ? "Sign in to join this project and make an impact!"
                : help_checked === "checked"
                ? "You're helping! Click to stop"
                : "Join this project!"
            }
            arrow
            placement="top"
          >
            <MaterialUISwitch
              disabled={!user}
              checked={help_checked === "checked"}
              onChange={!user ? undefined : handleClickOpen}
            />
          </Tooltip>
        }
        label={labelBox}
        labelPlacement="end"
      />
    );
  };

  const renderCallToAction = () => {
    if (!user) {
      return (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            marginTop: 24,
          }}
        >
          <Link
            href={`/signup?previousPage=/nonprofit/${effectiveNpoId}`}
            className="ohx-btn ohx-btn--primary"
          >
            Join the Impact
          </Link>
          <button
            className="ohx-btn ohx-btn--ghost"
            onClick={() =>
              redirectToLoginPage({
                postLoginRedirectUrl: window.location.href,
              })
            }
          >
            Sign In
          </button>
        </div>
      );
    }

    return (
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 24 }}
      >
        {problem_statement.slack_channel && (
          <a
            href={`https://opportunity-hack.slack.com/app_redirect?channel=${problem_statement.slack_channel}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ohx-btn ohx-btn--primary"
          >
            <TagIcon sx={{ fontSize: 16 }} /> Join #
            {problem_statement.slack_channel}
          </a>
        )}
        <button
          className="ohx-btn ohx-btn--ghost"
          onClick={() => {
            navigator.share?.({
              title: problem_statement.title,
              text: `Check out this impactful project: ${problem_statement.title}`,
              url: window.location.href,
            }) || navigator.clipboard.writeText(window.location.href);
          }}
        >
          Share Project
        </button>
      </div>
    );
  };

  const sectionHeaderStyle = {
    padding: "14px 20px",
    background: "var(--surface-2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    userSelect: "none",
  };

  const renderSection = (id, icon, label, content) => (
    <div className="ohx-card" style={{ overflow: "hidden" }}>
      <div
        onClick={() => handleSectionToggle(id)}
        role="button"
        tabIndex={0}
        aria-expanded={expandedSection === id}
        aria-controls={`${id}-content`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleSectionToggle(id);
          }
        }}
        style={{
          ...sectionHeaderStyle,
          borderBottom:
            expandedSection === id ? "1px solid var(--line)" : "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {icon}
          <span
            style={{
              fontWeight: 600,
              fontSize: "0.95rem",
              color: "var(--ink)",
            }}
          >
            {label}
          </span>
        </div>
        <ExpandMoreIcon
          sx={{
            fontSize: 20,
            color: "var(--muted)",
            transform:
              expandedSection === id ? "rotate(180deg)" : "none",
            transition: "transform 0.25s",
          }}
        />
      </div>
      <Collapse in={expandedSection === id}>
        <div id={`${id}-content`} style={{ padding: "16px 20px" }}>
          {content}
        </div>
      </Collapse>
    </div>
  );

  const metricTiles = [
    {
      icon: <DeveloperModeIcon sx={{ fontSize: 20, color: "var(--accent)" }} />,
      count: countOfHackers,
      label: `Developer${countOfHackers === 1 ? "" : "s"}`,
    },
    {
      icon: <SupportIcon sx={{ fontSize: 20, color: "var(--accent)" }} />,
      count: countOfMentors,
      label: `Mentor${countOfMentors === 1 ? "" : "s"}`,
    },
    {
      icon: <EventIcon sx={{ fontSize: 20, color: "var(--muted)" }} />,
      count: eventsCount,
      label: `Event${eventsCount === 1 ? "" : "s"}`,
    },
  ];

  return (
    <div
      className="ohx-card"
      style={{ marginBottom: 32, overflow: "hidden" }}
    >
      {/* Header band */}
      <div
        style={{
          padding: isMobile ? "20px 18px 18px" : "28px 32px 24px",
          background: "var(--surface-2)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        {/* Top row: status + copy + since */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 14,
          }}
        >
          {renderStatus()}
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <CopyToClipboardButton location={copyProjectLink} />
            {problem_statement.first_thought_of && (
              <span className="ohx-tag">
                Since {problem_statement.first_thought_of}
              </span>
            )}
            {codeRepos.length > 0 && (
              <a
                href={`#${codeSectionId}`}
                className="ohx-tag"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <GitHubIcon
                  sx={{ fontSize: 13, verticalAlign: "middle", mr: 0.5 }}
                />
                {codeRepos.length} repo{codeRepos.length === 1 ? "" : "s"} ↓
              </a>
            )}
          </div>
        </div>

        {/* Title */}
        <TitleTag
          className="ohx-display"
          style={{
            fontSize: "clamp(1.3rem, 3vw, 1.9rem)",
            marginBottom: 12,
            lineHeight: 1.15,
          }}
        >
          {problem_statement.title}
        </TitleTag>

        {/* Nonprofit attribution — only on direct project page visits */}
        {!npo_id && resolvedNonprofits.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              marginBottom: 12,
            }}
          >
            {resolvedNonprofits.map((npo) => (
              <Link
                key={npo.id}
                href={`/nonprofit/${npo.id}`}
                className="ohx-tag"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                {npo.name}
              </Link>
            ))}
          </div>
        )}

        <SkillSet Skills={problem_statement.skills} />

        <div style={{ marginTop: 14 }}>
          <ProjectProgress state={problem_statement.status} />
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: isMobile ? "20px 18px" : "28px 32px" }}>
        {/* Metric tiles */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: isMobile ? 8 : 14,
            marginBottom: 28,
          }}
        >
          {metricTiles.map(({ icon, count, label }, i) => (
            <div
              key={i}
              style={{
                padding: "16px 10px",
                textAlign: "center",
                background: "var(--surface-2)",
                border: "1px solid var(--line)",
                borderRadius: 8,
              }}
            >
              <div style={{ marginBottom: 6 }}>{icon}</div>
              <div
                className="ohx-display"
                style={{
                  fontSize: "clamp(1.3rem, 2.4vw, 1.8rem)",
                  color: "var(--brand)",
                  lineHeight: 1,
                }}
              >
                {count}
              </div>
              <p className="ohx-eyebrow" style={{ marginTop: 4, fontSize: "0.66rem" }}>
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Who's helping — social proof right under the counts (issue #359).
            The "Want to help?" toggle lives in this panel's footer so the
            roster and the ask read as one unit; the toggle stays hidden on
            production/paused projects except for existing helpers. */}
        <HelpersRoster
          helpers={helpers}
          loading={helpersLoading}
          enriched={helpersEnriched}
          slackChannel={problem_statement.slack_channel}
          profile={profile}
          offerHelp={offerHelpToggle}
          helpToggle={
            offerHelpToggle || help_checked === "checked"
              ? renderHelpToggle()
              : null
          }
        />

        {/* Project description */}
        <div style={{ marginBottom: 28 }}>
          <p className="ohx-eyebrow" style={{ marginBottom: 10 }}>
            Project Description
          </p>
          <Box
            sx={{
              "& p": { marginBottom: 2 },
              "& ul, & ol": { paddingLeft: 3, marginBottom: 2 },
              "& h1, & h2, & h3, & h4, & h5, & h6": {
                marginTop: 2,
                marginBottom: 1,
                fontWeight: 600,
              },
              "& blockquote": {
                borderLeft: "4px solid var(--line)",
                paddingLeft: 2,
                marginLeft: 0,
                fontStyle: "italic",
                background: "var(--surface-2)",
                padding: 2,
                borderRadius: 1,
              },
              "& code": {
                background: "var(--surface-2)",
                padding: "2px 6px",
                borderRadius: 1,
                fontSize: "0.9em",
              },
              "& pre": {
                background: "var(--surface-2)",
                padding: 2,
                borderRadius: 1,
                overflow: "auto",
              },
            }}
          >
            <ReactMarkdown>{problem_statement.description}</ReactMarkdown>
          </Box>
        </div>

        {/* Code & Tasks — always visible, right after the problem: where the
            code lives and what work remains (GitHub Issues). Never collapse
            or hide this section — burying it was the discoverability bug. */}
        <div
          id={codeSectionId}
          ref={codeSectionRef}
          style={{ marginBottom: 28, scrollMarginTop: 96 }}
        >
          <p className="ohx-eyebrow" style={{ marginBottom: 10 }}>
            Code &amp; Tasks
          </p>
          {codeRepos.length > 0 ? (
            <>
              <p
                className="ohx-muted"
                style={{ fontSize: "0.9rem", marginBottom: 14 }}
              >
                The remaining work is tracked as public GitHub Issues. Open a
                repo, read the README, then pick an open issue — closed issues
                are public credit for your contribution.
              </p>
              {projectRepos.length > 0 && (
                <Grid container spacing={2}>
                  {projectRepos.map((repo) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={repo.link}>
                      <RepoCard
                        repo={repo}
                        issueData={repoIssueData[normalizeRepoLink(repo.link)]}
                        onLinkClick={handleRepoLinkClick}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
              {teamRepos.length > 0 && (
                <>
                  <p
                    className="ohx-eyebrow"
                    style={{
                      margin:
                        projectRepos.length > 0 ? "18px 0 10px" : "0 0 10px",
                      fontSize: "0.66rem",
                    }}
                  >
                    {projectRepos.length > 0
                      ? "More repos from hackathon teams"
                      : "Built by teams at our hackathons"}
                  </p>
                  <Grid container spacing={2}>
                    {teamRepos.map((repo) => (
                      <Grid size={{ xs: 12, sm: 6 }} key={repo.link}>
                        <RepoCard
                          repo={repo}
                          issueData={
                            repoIssueData[normalizeRepoLink(repo.link)]
                          }
                          onLinkClick={handleRepoLinkClick}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </>
              )}
            </>
          ) : (
            <div
              className="ohx-card"
              style={{ padding: "16px 20px", background: "var(--surface-2)" }}
            >
              {problem_statement.events?.length > 0 &&
              !teamRepoEventsChecked ? (
                <p className="ohx-muted" style={{ margin: 0 }}>
                  Checking hackathon teams for code repositories…
                </p>
              ) : (
                <>
                  <p
                    style={{
                      fontWeight: 600,
                      margin: "0 0 6px",
                      color: "var(--ink)",
                    }}
                  >
                    Where&rsquo;s the code?
                  </p>
                  <p
                    className="ohx-muted"
                    style={{ fontSize: "0.9rem", margin: "0 0 12px" }}
                  >
                    No repository is linked to this project yet. Code from
                    hackathon builds usually lives with the team that made it —
                    check the event page
                    {hackathonEvents.length === 1 ? "" : "s"} below, or ask in
                    the project&rsquo;s Slack channel.
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {hackathonEvents.map((event) => (
                      <Link
                        key={event.event_id}
                        href={`/hack/${event.event_id}`}
                        className="ohx-btn ohx-btn--ghost"
                        style={{ fontSize: "0.82rem", padding: "0.5em 0.9em" }}
                      >
                        <EventIcon sx={{ fontSize: 13, mr: 0.5 }} />
                        {event.title || event.event_id}
                      </Link>
                    ))}
                    {problem_statement.slack_channel && (
                      <a
                        href={`https://opportunity-hack.slack.com/app_redirect?channel=${problem_statement.slack_channel}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ohx-btn ohx-btn--ghost"
                        style={{ fontSize: "0.82rem", padding: "0.5em 0.9em" }}
                      >
                        <TagIcon sx={{ fontSize: 13 }} />
                        {problem_statement.slack_channel}
                      </a>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* CTA */}
        {renderCallToAction()}

        <hr className="ohx-rule" style={{ margin: "28px 0" }} />

        {/* Collapsible sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {problem_statement.references?.length > 0 &&
            renderSection(
              "references",
              <ArticleIcon sx={{ fontSize: 17, color: "var(--brand)" }} />,
              `Reference Documents (${problem_statement.references.length})`,
              <>
                <p
                  className="ohx-muted"
                  style={{ fontSize: "0.9rem", marginBottom: 14 }}
                >
                  Review these documents to understand the problem better.
                </p>
                <Stack spacing={2}>
                  {problem_statement.references.map((reference, index) => (
                    <ReferenceItem key={index} reference={reference} />
                  ))}
                </Stack>
              </>
            )}

          {renderSection(
            "events",
            <EventIcon sx={{ fontSize: 17, color: "var(--brand)" }} />,
            `Events & Teams (${eventsCount} event${eventsCount === 1 ? "" : "s"})`,
            hackathonEventsLoaded ? (
              <Events
                key={problem_statement.id}
                events={hackathonEvents}
                teamsByEvent={projectTeamsByEvent}
              />
            ) : (
              <p
                className="ohx-muted"
                style={{ textAlign: "center", padding: "20px 0", margin: 0 }}
              >
                Loading events…
              </p>
            )
          )}
        </div>
      </div>

      {/* Help dialogs */}
      <HelpDialog
        open={open}
        onClose={handleClose}
        onConfirm={handleClose}
        onHelp={handleClose}
        onCancel={handleCancel}
      />
      <UnhelpDialog
        open={openUnhelp}
        onClose={handleCloseUnhelp}
        onCancel={handleCloseUnhelpCancel}
      />
    </div>
  );
}
