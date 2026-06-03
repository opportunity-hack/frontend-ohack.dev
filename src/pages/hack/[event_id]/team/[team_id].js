import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import NextLink from "next/link";
import dynamic from "next/dynamic";
import {
  Box,
  Grid,
  CircularProgress,
  Avatar,
  Skeleton,
} from "@mui/material";
import {
  GitHub as GitHubIcon,
  VideoLibrary as VideoIcon,
  Group as GroupIcon,
  Launch as LaunchIcon,
  Link as LinkIcon,
  CheckRounded as CheckRoundedIcon,
} from "@mui/icons-material";
import { FaSlack, FaHeart } from "react-icons/fa";
import { isWinningStatus } from "../../../../constants/teamStatus";
import { RefinedFonts, RefinedRoot, Eyebrow } from "../../../../components/design/refined";

const VideoDisplay = dynamic(
  () => import("../../../../components/VideoDisplay/VideoDisplay"),
  { ssr: false }
);

const MentorTeamPanel = dynamic(
  () => import("../../../../components/Teams/MentorTeamPanel"),
  {
    ssr: false,
    loading: () => <Skeleton variant="rectangular" height={420} sx={{ mb: 3, borderRadius: 1 }} />,
  }
);

const TeamCompletionChecklist = dynamic(
  () => import("../../../../components/Teams/TeamCompletionChecklist"),
  {
    ssr: false,
    loading: () => <Skeleton variant="rectangular" height={520} sx={{ mb: 3, borderRadius: 1 }} />,
  }
);

const COMPLETION_VISIBLE_STATUSES = new Set(["DEPLOYED", "NONPROFIT_SIGNOFF"]);
const SCROLL_OFFSET = 96; // clears the 64px fixed navbar + breathing room

// Lightweight refined shell used by loading / error / content states.
const Shell = ({ children, maxWidth = 1120 }) => (
  <RefinedRoot>
    <Head>
      <RefinedFonts />
    </Head>
    <Box
      className="ohx-wrap"
      sx={{ maxWidth, pt: "clamp(96px, 12vh, 150px)", pb: { xs: 8, md: 12 } }}
    >
      {children}
    </Box>
  </RefinedRoot>
);

export default function TeamDetailPage({ teamData, eventData, problemStatementsData, nonprofitName: initialNonprofitName }) {
  const router = useRouter();
  const { event_id, team_id } = router.query;
  const [loading, setLoading] = useState(!teamData);
  const [team, setTeam] = useState(teamData || null);
  const [event, setEvent] = useState(eventData || null);
  const [error, setError] = useState(null);
  const [problemStatements, setProblemStatements] = useState(problemStatementsData || []);
  const [nonprofitName, setNonprofitName] = useState(initialNonprofitName || null);
  const [activeId, setActiveId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (!event_id || !team_id) return;

    // Always refetch team data on the client after hydration so that newly-added
    // team members (and other live mutations like checklist toggles) are reflected
    // immediately — ISR (revalidate: 60) + the backend's 10-min TTL on get_team
    // would otherwise show stale users[] for several minutes.
    const hadSsrData = !!(teamData && eventData);

    const fetchData = async () => {
      if (!hadSsrData) setLoading(true);
      try {
        const [teamRes, eventRes] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/team/${team_id}`
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${event_id}`
          ),
        ]);

        if (!teamRes.ok) {
          if (!hadSsrData) setError("Team not found");
          return;
        }

        const teamJson = await teamRes.json();
        const eventJson = eventRes.ok ? await eventRes.json() : null;

        const teamObj = teamJson.team || teamJson;
        setTeam(teamObj);
        if (eventJson) setEvent(eventJson);

        if (teamObj.problem_statements?.length > 0) {
          const psDetails = await fetchProblemStatementDetails(teamObj.problem_statements);
          setProblemStatements(psDetails);
        }

        if (teamObj.selected_nonprofit_id) {
          fetchNonprofitName(teamObj.selected_nonprofit_id);
        }
      } catch (err) {
        console.error("Error fetching team data:", err);
        if (!hadSsrData) setError("Failed to load team details");
      } finally {
        if (!hadSsrData) setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event_id, team_id]);

  const fetchNonprofitName = async (nonprofitId) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/npo/${nonprofitId}`
      );
      if (res.ok) {
        const data = await res.json();
        // API returns { nonprofits: { name, ... } }
        setNonprofitName(data.nonprofits?.name || data.name || null);
      }
    } catch (err) {
      console.error("Error fetching nonprofit:", err);
    }
  };

  // Sync the active TOC entry with scroll position. Queries the DOM directly so
  // it doesn't need the (conditionally-computed) section list — works for
  // whatever sections actually rendered.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const els = Array.from(document.querySelectorAll("[data-team-section]"));
    if (els.length === 0) return;
    setActiveId((cur) => cur || els[0].id);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: `-${SCROLL_OFFSET}px 0px -55% 0px`, threshold: 0 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [team, event, problemStatements]);

  // Honor a deep link (#section) once data has rendered.
  useEffect(() => {
    if (!team || typeof window === "undefined") return;
    const hash = window.location.hash?.slice(1);
    if (!hash) return;
    const el = document.getElementById(hash);
    if (el) requestAnimationFrame(() => el.scrollIntoView());
  }, [team]);

  const handleJump = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      window.history.replaceState(null, "", `#${id}`);
      setActiveId(id);
    }
  };

  const copySectionLink = (e, id) => {
    e.preventDefault();
    window.history.replaceState(null, "", `#${id}`);
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard
        .writeText(`${window.location.origin}${window.location.pathname}#${id}`)
        .catch(() => {});
    }
    setCopiedId(id);
    setActiveId(id);
    setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 1600);
  };

  if (loading) {
    return (
      <Shell maxWidth={760}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            minHeight: "40vh",
          }}
        >
          <CircularProgress sx={{ color: "var(--brand)" }} />
          <Box sx={{ color: "var(--muted)" }}>Loading team details…</Box>
        </Box>
      </Shell>
    );
  }

  if (error || !team) {
    return (
      <Shell maxWidth={760}>
        <Box
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            bgcolor: "var(--accent-soft)",
            border: "1px solid #f3d3c7",
            color: "#b23a18",
            fontWeight: 600,
          }}
        >
          {error || "Team not found"}
        </Box>
        <NextLink href={`/hack/${event_id}`} className="ohx-btn ohx-btn--ghost">
          ← Back to event
        </NextLink>
      </Shell>
    );
  }

  const teamName = team.name || "Unnamed Team";
  const eventName = event?.title || event?.event_id || event_id;
  const isActive = team.active === "True" || team.active === true;
  const hasGithubLinks = team.github_links?.length > 0;
  const memberCount = Array.isArray(team.users) ? team.users.length : 0;
  const showCompletionChecklist =
    isWinningStatus(team.status) || COMPLETION_VISIBLE_STATUSES.has(team.status);
  const eventHasStarted = (() => {
    if (!event?.start_date) return false;
    const start = new Date(event.start_date);
    return !Number.isNaN(start.getTime()) && start <= new Date();
  })();
  const hasLinks = !!(team.slack_channel || hasGithubLinks || team.devpost_link);
  const winning = isWinningStatus(team.status);

  // Build the TOC from the sections that actually render.
  const sections = [];
  if (eventHasStarted) sections.push({ id: "mentor-support", name: "Mentor support" });
  if (showCompletionChecklist) sections.push({ id: "completion", name: "Project completion" });
  if (hasLinks) sections.push({ id: "links", name: "Links & resources" });
  if (team.demo_video_url) sections.push({ id: "demo", name: "Demo video" });
  if (problemStatements.length > 0)
    sections.push({
      id: "problems",
      name: problemStatements.length > 1 ? "Problem statements" : "Problem statement",
    });
  sections.push({ id: "members", name: "Team members" });

  const pageTitle = `${teamName} | ${eventName} | Opportunity Hack`;
  const pageDescription = `Team ${teamName} participating in ${eventName}. ${memberCount} member${memberCount !== 1 ? "s" : ""}.`;

  // A section wrapper: anchor id + scroll offset + (optional) Fraunces heading
  // with a hover-reveal copy-link affordance.
  const SectionBlock = ({ id, title, icon, headed = true, children }) => (
    <Box
      component="section"
      id={id}
      data-team-section
      sx={{ scrollMarginTop: `${SCROLL_OFFSET}px`, mb: { xs: 4.5, md: 6 } }}
    >
      {headed && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 2.5,
            "&:hover .team-anchor": { opacity: 1 },
          }}
        >
          {icon}
          <Box
            component="h2"
            className="ohx-display"
            sx={{ fontSize: "clamp(1.4rem, 2.6vw, 1.9rem)", color: "var(--ink)", m: 0 }}
          >
            {title}
          </Box>
          <Box
            component="a"
            href={`#${id}`}
            onClick={(e) => copySectionLink(e, id)}
            className="team-anchor"
            aria-label={`Copy link to ${title}`}
            title="Copy link to this section"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              textDecoration: "none",
              color: copiedId === id ? "var(--brand)" : "var(--faint)",
              opacity: { xs: 1, md: 0 },
              transition: "opacity .2s ease, color .2s ease",
              "&:hover": { color: "var(--brand)" },
            }}
          >
            {copiedId === id ? (
              <CheckRoundedIcon sx={{ fontSize: 18 }} />
            ) : (
              <LinkIcon sx={{ fontSize: 18 }} />
            )}
          </Box>
        </Box>
      )}
      {children}
    </Box>
  );

  return (
    <RefinedRoot>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content={`https://ohack.dev/hack/${event_id}/team/${team_id}`}
        />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <RefinedFonts />
      </Head>

      <Box
        className="ohx-wrap"
        sx={{ maxWidth: 1120, pt: "clamp(96px, 12vh, 150px)", pb: { xs: 8, md: 12 } }}
      >
        {/* Back navigation */}
        <NextLink
          href={`/hack/${event_id}`}
          className="ohx-link"
          style={{ fontSize: "0.92rem", marginBottom: 24, display: "inline-flex" }}
        >
          ← Back to {eventName}
        </NextLink>

        {/* Masthead */}
        <Box component="header" className="rise" sx={{ mb: { xs: 4, md: 5 } }}>
          <Eyebrow>{eventName}</Eyebrow>
          <Box
            component="h1"
            className="ohx-display"
            sx={{ mt: 1.5, mb: 2, fontSize: "clamp(2.2rem, 5.4vw, 4rem)" }}
          >
            {teamName}
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
            <span
              className="ohx-tag"
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: isActive ? "#3a7d44" : "var(--faint)",
                }}
              />
              {isActive ? "Active" : "Inactive"}
            </span>
            {team.status && (
              <span className={`ohx-tag${winning ? " ohx-tag--accent" : ""}`}>
                {team.status}
              </span>
            )}
            <span className="ohx-tag">
              {memberCount} member{memberCount !== 1 ? "s" : ""}
            </span>
          </Box>

          {/* Meta line */}
          <Box
            sx={{
              mt: 2,
              display: "flex",
              flexWrap: "wrap",
              gap: { xs: 1, sm: 3 },
              color: "var(--muted)",
              fontSize: "0.92rem",
            }}
          >
            {(nonprofitName || team.selected_nonprofit_id) && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <FaHeart style={{ color: "var(--accent)", fontSize: 13 }} />
                <span>
                  <Box component="span" sx={{ color: "var(--ink)", fontWeight: 600 }}>
                    Nonprofit:
                  </Box>{" "}
                  {nonprofitName || team.selected_nonprofit_id}
                </span>
              </Box>
            )}
            {team.created && (
              <span>Created {new Date(team.created).toLocaleDateString()}</span>
            )}
          </Box>

          <hr className="ohx-rule" style={{ marginTop: 24 }} />
        </Box>

        {/* Two-column: content + sticky TOC rail (rail on the right on desktop,
            on top on mobile so it stays the first thing you can link from). */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row-reverse" },
            alignItems: "flex-start",
            gap: { xs: 3, md: 5 },
          }}
        >
          {/* TOC */}
          <Box
            component="nav"
            aria-label="On this page"
            className="ohx-card"
            sx={{
              flexShrink: 0,
              width: { xs: "100%", md: 232 },
              p: { xs: 1.5, md: 2.5 },
              position: { md: "sticky" },
              top: { md: `${SCROLL_OFFSET}px` },
              boxSizing: "border-box",
            }}
          >
            <Box
              className="ohx-eyebrow"
              sx={{ mb: { xs: 1, md: 1.5 }, px: { xs: 0.5, md: 0 } }}
            >
              On this page
            </Box>
            <Box
              component="ul"
              sx={{
                listStyle: "none",
                m: 0,
                p: 0,
                display: "flex",
                flexDirection: { xs: "row", md: "column" },
                gap: 0.5,
                overflowX: { xs: "auto", md: "visible" },
                WebkitOverflowScrolling: "touch",
              }}
            >
              {sections.map((s) => {
                const active = activeId === s.id;
                return (
                  <Box component="li" key={s.id} sx={{ flexShrink: 0 }}>
                    <Box
                      component="a"
                      href={`#${s.id}`}
                      onClick={(e) => handleJump(e, s.id)}
                      aria-current={active ? "true" : undefined}
                      sx={{
                        display: "block",
                        textDecoration: "none",
                        whiteSpace: "nowrap",
                        fontFamily: "var(--body)",
                        fontWeight: 600,
                        fontSize: "0.86rem",
                        lineHeight: 1.3,
                        borderRadius: "6px",
                        px: 1.25,
                        py: 0.85,
                        transition: "background-color .18s ease, color .18s ease",
                        color: active ? "#fff" : "var(--muted)",
                        backgroundColor: active ? "var(--brand)" : "transparent",
                        "&:hover": {
                          color: active ? "#fff" : "var(--ink)",
                          backgroundColor: active
                            ? "var(--brand)"
                            : "rgba(27,58,107,0.06)",
                        },
                      }}
                    >
                      {s.name}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Content column */}
          <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
            {/* Mentor Support — visible to everyone once the event has started */}
            {eventHasStarted && (
              <SectionBlock id="mentor-support" headed={false}>
                <MentorTeamPanel
                  team={team}
                  event={event}
                  eventId={event_id}
                  onTeamUpdate={(updated) => setTeam(updated)}
                />
              </SectionBlock>
            )}

            {/* Project Completion (winning teams only) */}
            {showCompletionChecklist && (
              <SectionBlock id="completion" headed={false}>
                <TeamCompletionChecklist
                  team={team}
                  eventId={event_id}
                  onTeamUpdate={(updated) => setTeam(updated)}
                />
              </SectionBlock>
            )}

            {/* Links & resources */}
            {hasLinks && (
              <SectionBlock
                id="links"
                title="Links & resources"
                icon={<LaunchIcon sx={{ color: "var(--accent)", fontSize: 24 }} />}
              >
                <Grid container spacing={2}>
                  {team.slack_channel && (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <Box
                        component="a"
                        href={`https://opportunity-hack.slack.com/app_redirect?channel=${team.slack_channel}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ohx-card ohx-card--hover"
                        sx={linkTileSx}
                      >
                        <FaSlack style={{ fontSize: 22, color: "var(--accent)" }} />
                        <Box sx={{ minWidth: 0 }}>
                          <Box sx={linkTileLabelSx}>Slack channel</Box>
                          <Box sx={linkTileValueSx}>#{team.slack_channel}</Box>
                        </Box>
                      </Box>
                    </Grid>
                  )}
                  {hasGithubLinks && (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <Box
                        component="a"
                        href={team.github_links[0].link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ohx-card ohx-card--hover"
                        sx={linkTileSx}
                      >
                        <GitHubIcon sx={{ fontSize: 22, color: "var(--ink)" }} />
                        <Box sx={{ minWidth: 0 }}>
                          <Box sx={linkTileLabelSx}>GitHub repository</Box>
                          <Box sx={linkTileValueSx}>View code</Box>
                        </Box>
                      </Box>
                    </Grid>
                  )}
                  {team.devpost_link && (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <Box
                        component="a"
                        href={team.devpost_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ohx-card ohx-card--hover"
                        sx={linkTileSx}
                      >
                        <LaunchIcon sx={{ fontSize: 22, color: "var(--accent)" }} />
                        <Box sx={{ minWidth: 0 }}>
                          <Box sx={linkTileLabelSx}>DevPost submission</Box>
                          <Box sx={linkTileValueSx}>View submission</Box>
                        </Box>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </SectionBlock>
            )}

            {/* Demo Video */}
            {team.demo_video_url && (
              <SectionBlock
                id="demo"
                title="Demo video"
                icon={<VideoIcon sx={{ color: "var(--accent)", fontSize: 24 }} />}
              >
                <Box className="ohx-card" sx={{ p: { xs: 1.5, md: 2 } }}>
                  <VideoDisplay url={team.demo_video_url} title={`${teamName} Demo`} />
                </Box>
              </SectionBlock>
            )}

            {/* Problem Statements */}
            {problemStatements.length > 0 && (
              <SectionBlock
                id="problems"
                title={
                  problemStatements.length > 1
                    ? "Problem statements"
                    : "Problem statement"
                }
                icon={<FaHeart style={{ color: "var(--accent)", fontSize: 18 }} />}
              >
                <Box className="ohx-card" sx={{ p: { xs: 2.5, md: 3.5 } }}>
                  {problemStatements.map((ps, index) => (
                    <Box
                      key={ps.id || index}
                      sx={{
                        mb:
                          index < problemStatements.length - 1 ? 3 : 0,
                        pb:
                          index < problemStatements.length - 1 ? 3 : 0,
                        borderBottom:
                          index < problemStatements.length - 1
                            ? "1px solid var(--line)"
                            : "none",
                      }}
                    >
                      <Box
                        className="ohx-display"
                        sx={{ fontSize: "1.2rem", color: "var(--ink)", mb: 0.5 }}
                      >
                        {ps.title || "Untitled Problem Statement"}
                      </Box>
                      {ps.description && (
                        <Box sx={{ color: "var(--muted)", lineHeight: 1.6 }}>
                          {ps.description.length > 300
                            ? `${ps.description.substring(0, 300)}…`
                            : ps.description}
                        </Box>
                      )}
                      {ps.id && (
                        <Box sx={{ mt: 1 }}>
                          <NextLink href={`/project/${ps.id}`} className="ohx-link">
                            View full project details
                            <span className="ohx-arrow" aria-hidden="true">
                              →
                            </span>
                          </NextLink>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              </SectionBlock>
            )}

            {/* Team Members */}
            <SectionBlock
              id="members"
              title={`Team members (${memberCount})`}
              icon={<GroupIcon sx={{ color: "var(--accent)", fontSize: 24 }} />}
            >
              <Box className="ohx-card" sx={{ p: { xs: 2.5, md: 3.5 } }}>
                {memberCount > 0 ? (
                  <Grid container spacing={2}>
                    {team.users.map((user, index) => {
                      const isObject = typeof user === "object" && user !== null;
                      const displayName = isObject
                        ? user.name || user.nickname || `Team member #${index + 1}`
                        : `Team member #${index + 1}`;
                      const profileImage = isObject ? user.profile_image : null;
                      const dbId = isObject ? user.id : user;
                      const key = dbId || `member-${index}`;

                      const tileInner = (
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            textAlign: "center",
                            p: 1.5,
                            borderRadius: 2,
                            transition: "background-color 150ms ease",
                            "&:hover": dbId
                              ? { backgroundColor: "var(--surface-2)" }
                              : {},
                          }}
                        >
                          <Avatar
                            src={profileImage}
                            alt={displayName}
                            sx={{
                              width: 60,
                              height: 60,
                              mb: 1,
                              border: "1px solid var(--line)",
                            }}
                          >
                            {displayName?.[0] || "?"}
                          </Avatar>
                          <Box
                            sx={{
                              fontSize: "0.9rem",
                              fontWeight: 600,
                              color: "var(--ink)",
                              maxWidth: "100%",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {displayName}
                          </Box>
                        </Box>
                      );

                      return (
                        <Grid size={{ xs: 6, sm: 4, md: 3 }} key={key}>
                          {dbId ? (
                            <NextLink
                              href={`/profile/${dbId}`}
                              style={{ textDecoration: "none", color: "inherit" }}
                            >
                              {tileInner}
                            </NextLink>
                          ) : (
                            tileInner
                          )}
                        </Grid>
                      );
                    })}
                  </Grid>
                ) : (
                  <Box sx={{ color: "var(--muted)" }}>
                    No members yet. Be the first to join!
                  </Box>
                )}
              </Box>
            </SectionBlock>

            {/* Actions */}
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              <NextLink
                href={`/hack/${event_id}/findteam`}
                className="ohx-btn ohx-btn--primary"
              >
                Find a team
              </NextLink>
              <NextLink
                href={`/hack/${event_id}`}
                className="ohx-btn ohx-btn--ghost"
              >
                View all teams
              </NextLink>
            </Box>
          </Box>
        </Box>
      </Box>
    </RefinedRoot>
  );
}

// Shared sx for the link tiles in the "Links & resources" section.
const linkTileSx = {
  display: "flex",
  alignItems: "center",
  gap: 1.25,
  p: 2,
  height: "100%",
  textDecoration: "none",
  boxSizing: "border-box",
};
const linkTileLabelSx = {
  fontFamily: "var(--body)",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  fontSize: "0.62rem",
  fontWeight: 600,
  color: "var(--muted)",
};
const linkTileValueSx = {
  fontWeight: 600,
  color: "var(--brand)",
  fontSize: "0.95rem",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

// Helper to fetch problem statement details from IDs
async function fetchProblemStatementDetails(problemStatementIds) {
  if (!problemStatementIds?.length) return [];

  const results = await Promise.all(
    problemStatementIds.map(async (psId) => {
      // Handle case where it's already an object
      if (typeof psId === "object" && psId !== null) {
        return psId;
      }
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/problem_statement/${psId}`
        );
        if (res.ok) {
          const data = await res.json();
          return { id: psId, title: data.title, description: data.description, ...data };
        }
      } catch (err) {
        console.error(`Error fetching problem statement ${psId}:`, err);
      }
      return { id: psId, title: null, description: null };
    })
  );

  return results;
}

export async function getStaticProps({ params }) {
  const { event_id, team_id } = params;

  try {
    const [teamRes, eventRes] = await Promise.all([
      fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/team/${team_id}`
      ),
      fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${event_id}`
      ),
    ]);

    const teamRaw = teamRes.ok ? await teamRes.json() : null;
    const eventData = eventRes.ok ? await eventRes.json() : null;

    // API returns { team: { ... } } wrapper
    const teamData = teamRaw?.team || teamRaw;

    if (!teamData) {
      return { notFound: true };
    }

    // Fetch problem statement details
    let problemStatementsData = [];
    if (teamData.problem_statements?.length > 0) {
      problemStatementsData = await fetchProblemStatementDetails(teamData.problem_statements);
    }

    // Fetch nonprofit name if team has selected_nonprofit_id
    let nonprofitName = null;
    if (teamData.selected_nonprofit_id) {
      try {
        const npoRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/npo/${teamData.selected_nonprofit_id}`
        );
        if (npoRes.ok) {
          const npoData = await npoRes.json();
          // API returns { nonprofits: { name, ... } }
          nonprofitName = npoData.nonprofits?.name || npoData.name || null;
        }
      } catch (err) {
        console.error("Error fetching nonprofit:", err);
      }
    }

    return {
      props: {
        teamData,
        eventData,
        problemStatementsData,
        nonprofitName,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error("Error fetching team data:", error);
    return {
      notFound: true,
    };
  }
}

export async function getStaticPaths() {
  // Use blocking fallback so pages are generated on first request
  return {
    paths: [],
    fallback: "blocking",
  };
}
