import React, { useState, useEffect, useCallback, useRef } from "react";
import { Typography, Box, Alert, Skeleton, Button } from "@mui/material";
import axios from "axios";
import {
  useAuthInfo,
  RequiredAuthProvider,
  RedirectToLogin,
} from "@propelauth/react";
import Head from "next/head";
import { useRouter } from "next/router";

// Import components
import TeamDetailsForm from "../../../components/TeamCreation/TeamDetailsForm";
import GitHubInfoForm from "../../../components/TeamCreation/GitHubInfoForm";
import ProjectSelectionStep from "../../../components/TeamCreation/ProjectSelectionStep";
import TeammatesStep from "../../../components/TeamCreation/TeammatesStep";
import ConfirmationSummary from "../../../components/TeamCreation/ConfirmationSummary";
import { RefinedRoot } from "../../../components/design/refined";
import SurveyCTA from "../../../components/Survey/SurveyCTA";
import TeamMasthead from "../../../components/TeamDashboard/TeamMasthead";
import TeamSwitcher from "../../../components/TeamDashboard/TeamSwitcher";
import TeamDashboard from "../../../components/TeamDashboard/TeamDashboard";
import CreateTeamFlow from "../../../components/TeamDashboard/CreateTeamFlow";
import {
  ApplicationLoadingPanel,
  NoApplicationPanel,
  AwaitingConfirmationPanel,
  TeamCreationDisabledPanel,
} from "../../../components/TeamDashboard/GatingPanels";
import { trackEvent, EventCategory } from "../../../lib/ga";
import useAuthedResource from "../../../hooks/use-authed-resource";
import useTeamProjectOptions from "../../../hooks/use-team-project-options";
import {
  moveProject,
  pruneRanked,
  rankingError,
  rankingLimits,
  rankingsPayload,
  toggleProject,
} from "../../../lib/projectRanking";
import { queueTeam } from "../../../lib/teamProjectApi";
import { isPendingReview } from "../../../constants/teamStatus";
import {
  savePendingTeammates,
  splitTeammates,
  teammateName,
} from "../../../lib/teamInvite";

const steps = [
  "Team details",
  "GitHub",
  "Choose projects",
  "Teammates & notes",
  "Confirm",
];
// Step indexes — every activeStep comparison goes through these.
const STEP_DETAILS = 0;
const STEP_GITHUB = 1;
const STEP_PROJECTS = 2;
const STEP_TEAMMATES = 3;
const STEP_CONFIRM = 4;

// Shared "Find Teammates" CTA — used in both the existing-team and no-team cases
const FindTeammatesCTA = ({ eventId, teamFindingEnabled, heading, body }) => (
  <Box
    sx={{
      mt: 3,
      p: 3,
      bgcolor: "var(--surface-2, #F4F1E9)",
      borderRadius: 2,
      border: "1px solid var(--line, #E7E1D4)",
      display: "flex",
      flexDirection: { xs: "column", sm: "row" },
      alignItems: "center",
      justifyContent: "space-between",
      gap: 2,
    }}
  >
    <Box>
      <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600 }}>
        {heading}
      </Typography>
      <Typography variant="body1" sx={{ color: "var(--muted, #5B6270)" }}>
        {body}
      </Typography>
    </Box>
    <Button
      variant="contained"
      href={teamFindingEnabled ? `/hack/${eventId}/findteam` : undefined}
      disabled={!teamFindingEnabled}
      component={teamFindingEnabled ? "a" : "button"}
      size="large"
      sx={{
        px: 3,
        py: 1.2,
        whiteSpace: "nowrap",
        minWidth: { xs: "100%", sm: "auto" },
        fontWeight: 600,
        bgcolor: "var(--brand, #1B3A6B)",
        "&:hover": { bgcolor: "var(--brand-ink, #0E2547)" },
        opacity: teamFindingEnabled ? 1 : 0.6,
        cursor: teamFindingEnabled ? "pointer" : "not-allowed",
      }}
    >
      {teamFindingEnabled ? "Find Teammates" : "Find Teammates (Closed)"}
    </Button>
  </Box>
);

const ManageTeamComponent = () => {
  const authInfo = useAuthInfo();
  const { accessToken } = authInfo;
  // Token-rotation pattern: lazy/imperative fetches read the token through a
  // ref so a refocus rotation never re-runs them.
  const tokenRef = useRef(accessToken);
  tokenRef.current = accessToken;
  const [teamName, setTeamName] = useState("");
  const [slackChannel, setSlackChannel] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  // Ordered: [{nonprofitId, nonprofitName, projectId, title}] — #1 first.
  const [rankedProjects, setRankedProjects] = useState([]);
  // Sticky: the project options load the first time the projects step is
  // reached and stay loaded after that.
  const [projectsStepReached, setProjectsStepReached] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [event, setEvent] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [comments, setComments] = useState("");
  const [slackUsers, setSlackUsers] = useState([]);
  // "idle" | "loading" | "ready" | "error" — the picker says when the Slack
  // directory couldn't load instead of looking empty.
  const [slackUsersStatus, setSlackUsersStatus] = useState("idle");
  const [showNewTeamForm, setShowNewTeamForm] = useState(false);
  const [activeTeamId, setActiveTeamId] = useState(null);
  // "You've left …" — lives on the page because leaving unmounts the
  // dashboard that triggered it.
  const [leftNotice, setLeftNotice] = useState("");

  const [isValidatingGithub, setIsValidatingGithub] = useState(false);
  const [isGithubValid, setIsGithubValid] = useState(null);
  const [githubError, setGithubError] = useState("");

  const [isValidatingSlack, setIsValidatingSlack] = useState(false);
  const [isSlackValid, setIsSlackValid] = useState(null);
  const [slackError, setSlackError] = useState("");

  const router = useRouter();
  const { event_id } = router.query;

  // ---- authed resources (Class C, Nov 2026) ----
  // These three used to load from one effect keyed on the RAW accessToken, so
  // every tab refocus (PropelAuth rotates the token) re-fetched them: the team
  // hub flipped to its skeleton and unmounted TeamDashboard (wiping in-progress
  // editor drafts), and the profile refetch clobbered the GitHub username
  // being typed into the create form. useAuthedResource keys on token
  // PRESENCE, waits for auth, drops stale runs, and reports a failure as an
  // error (Retry card) instead of an empty result.
  const teamsResource = useAuthedResource(
    ["manageteam-my-teams", event_id],
    async ({ token }) => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/team/${event_id}/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (!response || !response.data) {
        throw new Error("Empty /me response");
      }
      return response.data.teams;
    },
    { enabled: Boolean(event_id) },
  );
  const applicationResource = useAuthedResource(
    ["manageteam-hacker-application", event_id],
    async ({ token }) => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/hacker/application/${event_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "X-Org-Id": authInfo?.userClass?.getOrgByName(
              "Opportunity Hack Org",
            )?.orgId,
          },
        },
      );
      return response.data && response.data.data ? response.data.data : null;
    },
    // The route answers 200 + data:null for "no application"; an older
    // backend's 404 means the same. Anything else is a real failure.
    { enabled: Boolean(event_id), treat404As: null },
  );
  const profileResource = useAuthedResource(
    ["manageteam-profile"],
    async ({ token }) => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/users/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      return response?.data || null;
    },
  );

  // Split error state (don't merge): teamsError comes ONLY from the /me fetch
  // and drives the hub's error card; formError is the create-team flow's.
  const isLoadingTeams =
    teamsResource.status === "loading" || teamsResource.status === "idle";
  const teamsError =
    teamsResource.status === "error"
      ? "Failed to fetch team details. Please try again later."
      : "";
  // During a reload (post-create, Retry) the hook keeps the last good list,
  // so hasExistingTeam doesn't flicker the create-form layout.
  const myTeams =
    teamsResource.status === "error" ? [] : (teamsResource.data ?? null);
  const setMyTeams = teamsResource.setData;
  const reloadMyTeams = teamsResource.reload;
  const refreshMyTeams = teamsResource.refresh;
  const fetchMyTeams = useCallback(() => reloadMyTeams(), [reloadMyTeams]);

  const isLoadingApplication =
    applicationResource.status === "loading" ||
    applicationResource.status === "idle";
  const applicationError = applicationResource.status === "error";
  const hackerApplication =
    applicationResource.status === "ready" ? applicationResource.data : null;

  // Prefill GitHub username + keep the full profile payload for TeamRoster's
  // "You" marker (own db id) — see Part 4 WS-B change #1. Applied once per
  // fetched payload (never on a token rotation, so typing isn't clobbered).
  const profile =
    profileResource.status === "ready" ? profileResource.data : null;
  useEffect(() => {
    if (profile?.github) setGithubUsername(profile.github);
  }, [profile]);

  // Refs to prevent double-fetching lazy data
  const slackFetchedRef = useRef(false);
  const gaViewFiredRef = useRef(false);
  // Double-submit guard: set synchronously on "Create team", cleared only
  // after the post-create reset (or a failure) finishes.
  const submittingRef = useRef(false);
  // Latest typed values — a debounced validation response for an older value
  // must never mark the current one valid.
  const latestSlackRef = useRef("");
  const latestGithubRef = useRef("");

  useEffect(() => {
    if (activeStep >= STEP_PROJECTS) setProjectsStepReached(true);
  }, [activeStep]);

  // The ONE project-options request (replaces the per-nonprofit +
  // per-project fetch waterfall). Lazy: only once the projects step is hit.
  const projectOptions = useTeamProjectOptions(event_id, {
    enabled: projectsStepReached,
  });
  const totalProjects = projectOptions.totalProjects;
  const limits = rankingLimits(totalProjects ?? 0);

  // A refetch (Retry, or after an invalid_rankings refusal) may drop
  // projects — keep only rankings that are still selectable.
  useEffect(() => {
    if (!projectOptions.nonprofits) return;
    setRankedProjects((prev) => {
      const next = pruneRanked(prev, projectOptions.nonprofits);
      const same =
        next.length === prev.length &&
        next.every((r, i) => r.projectId === prev[i].projectId);
      return same ? prev : next;
    });
  }, [projectOptions.nonprofits]);

  // The event payload is public — keyed on the event only.
  useEffect(() => {
    if (!event_id) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${event_id}`,
        );
        if (!cancelled && response && response.data) {
          setEvent(response.data);
        }
      } catch (err) {
        console.error("Error fetching event details:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [event_id]);

  // findteam.js hands off starred favorites via sessionStorage['team_members']
  // (bug #9) — read it once on mount, prefill the member picker, then clear
  // the key so a later visit doesn't replay it.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.sessionStorage.getItem("team_members");
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.length > 0) {
          setTeamMembers(
            arr
              .filter((u) => u && u.slack_user_id)
              .map((u) => ({
                id: u.slack_user_id,
                name: u.name,
                real_name: u.name,
              })),
          );
          setShowNewTeamForm(true);
        }
        window.sessionStorage.removeItem("team_members");
      }
    } catch (err) {
      console.error("Error reading findteam handoff:", err);
    }
  }, []);

  // Lazy Slack user fetch — only when user reaches the team-member step
  const fetchActiveSlackUsers = useCallback(async () => {
    setSlackUsersStatus("loading");
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/slack/users/active?active_days=365`,
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (response.data && response.data.users) {
        setSlackUsers(
          response.data.users.map((user) => ({
            id: user.id,
            name: user.name,
            real_name: user.real_name,
            tz: user.tz,
          })),
        );
      }
      setSlackUsersStatus("ready");
    } catch (err) {
      console.error("Error fetching active Slack users:", err);
      // Non-critical — teammates can still be added to the invite list.
      setSlackUsersStatus("error");
    }
  }, []);

  // Trigger the Slack user fetch lazily when the Teammates step is reached
  useEffect(() => {
    if (
      activeStep === STEP_TEAMMATES &&
      !slackFetchedRef.current &&
      accessToken
    ) {
      slackFetchedRef.current = true;
      fetchActiveSlackUsers();
    }
  }, [activeStep, Boolean(accessToken), fetchActiveSlackUsers]);

  const handleToggleProject = useCallback(
    (entry) =>
      setRankedProjects((prev) => toggleProject(prev, entry, limits.max)),
    [limits.max],
  );
  const handleMoveProject = useCallback(
    (from, to) => setRankedProjects((prev) => moveProject(prev, from, to)),
    [],
  );
  const handleRemoveProject = useCallback(
    (entry) =>
      setRankedProjects((prev) =>
        prev.filter((r) => r.projectId !== entry.projectId),
      ),
    [],
  );

  // Adds a Slack user object (on the team at creation) or a typed name (an
  // invite-list reminder — joins later from the team page). Returns an error
  // message for the field, or null.
  const handleAddTeamMember = useCallback(
    (member) => {
      const name = teammateName(member);
      if (!name) return null;
      const value = typeof member === "string" ? name : member;
      const duplicate = teamMembers.some((existing) =>
        typeof existing === "object" && typeof value === "object"
          ? existing.id === value.id
          : teammateName(existing).toLowerCase() === name.toLowerCase(),
      );
      if (duplicate) return `${name} is already on your list.`;
      setTeamMembers((prev) => [...prev, value]);
      return null;
    },
    [teamMembers],
  );

  const handleRemoveTeamMember = useCallback((index) => {
    setTeamMembers((prev) => {
      const newMembers = [...prev];
      newMembers.splice(index, 1);
      return newMembers;
    });
  }, []);

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  const validateGithubUsername = useCallback(
    debounce(async (username) => {
      setIsValidatingGithub(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/validate/github/${username}`,
        );
        if (latestGithubRef.current !== username) return;
        setIsGithubValid(Boolean(response.data.valid));
        setGithubError(
          response.data.valid
            ? "GitHub username exists"
            : response.data.message || "Invalid GitHub username",
        );
      } catch {
        if (latestGithubRef.current !== username) return;
        setIsGithubValid(false);
        setGithubError("Could not verify GitHub username");
      } finally {
        if (latestGithubRef.current === username) setIsValidatingGithub(false);
      }
    }, 400),
    [],
  );

  const validateSlackChannel = useCallback(
    debounce(async (channel) => {
      if (!channel.match(/^[a-z0-9-_]+$/)) {
        setIsSlackValid(false);
        setSlackError(
          "Use only lowercase letters, numbers, hyphens, and underscores",
        );
        setIsValidatingSlack(false);
        return;
      }
      setIsValidatingSlack(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/validate/slack/${channel}`,
        );
        if (latestSlackRef.current !== channel) return;
        if (response.data.exists) {
          setIsSlackValid(false);
          setSlackError(response.data.message || "Invalid Slack channel");
        } else {
          setIsSlackValid(Boolean(response.data.valid));
          setSlackError("Slack channel is available");
        }
      } catch {
        if (latestSlackRef.current !== channel) return;
        setIsSlackValid(false);
        setSlackError("Slack channel already exists or is invalid");
      } finally {
        if (latestSlackRef.current === channel) setIsValidatingSlack(false);
      }
    }, 400),
    [],
  );

  // Every edit resets validity to "not yet known" (null) — Next stays
  // disabled through the 400ms debounce instead of trusting a stale result.
  // Clearing the field also clears the old verdict.
  useEffect(() => {
    latestGithubRef.current = githubUsername.trim();
    setIsGithubValid(null);
    if (!githubUsername.trim()) {
      setGithubError("");
      setIsValidatingGithub(false);
      return;
    }
    validateGithubUsername(githubUsername.trim());
  }, [githubUsername, validateGithubUsername]);

  useEffect(() => {
    latestSlackRef.current = slackChannel;
    setIsSlackValid(null);
    if (!slackChannel.trim()) {
      setSlackError("");
      setIsValidatingSlack(false);
      return;
    }
    validateSlackChannel(slackChannel);
  }, [slackChannel, validateSlackChannel]);

  const validateDetailsStep = () => {
    if (!teamName.trim()) {
      setFormError("Team name is required.");
      return false;
    }
    if (!slackChannel.trim()) {
      setFormError("Slack channel is required.");
      return false;
    }
    if (!slackChannel.match(/^[a-z0-9-_]+$/)) {
      setFormError(
        "Invalid Slack channel name. Use only lowercase letters, numbers, hyphens, and underscores.",
      );
      return false;
    }
    if (isSlackValid === false) {
      setFormError(slackError || "Invalid Slack channel name.");
      return false;
    }
    if (isSlackValid !== true) {
      setFormError("Please wait for the Slack channel check to finish.");
      return false;
    }
    return true;
  };

  const validateGithubStep = () => {
    if (!githubUsername.trim()) {
      setFormError("GitHub username is required.");
      return false;
    }
    if (isGithubValid === false) {
      setFormError(githubError || "Invalid GitHub username.");
      return false;
    }
    if (isGithubValid !== true) {
      setFormError("Please wait for the GitHub username check to finish.");
      return false;
    }
    return true;
  };

  const validateProjectsStep = () => {
    const problem = rankingError(rankedProjects, totalProjects);
    if (problem) {
      setFormError(problem);
      return false;
    }
    return true;
  };

  const validateForm = () =>
    validateDetailsStep() && validateGithubStep() && validateProjectsStep();

  const validateCurrentStep = (step) => {
    switch (step) {
      case STEP_DETAILS:
        return validateDetailsStep();
      case STEP_GITHUB:
        return validateGithubStep();
      case STEP_PROJECTS:
        return validateProjectsStep();
      case STEP_CONFIRM:
        return validateForm();
      default:
        return true;
    }
  };

  const resetCreateForm = () => {
    setActiveStep(STEP_DETAILS);
    setTeamName("");
    setSlackChannel("");
    setIsSlackValid(null);
    setSlackError("");
    // Re-prefill from the profile (the effect only fires when it changes).
    setGithubUsername(profile?.github || "");
    setIsGithubValid(null);
    setGithubError("");
    setRankedProjects([]);
    setTeamMembers([]);
    setComments("");
    setShowNewTeamForm(false);
  };

  // Only the Confirm step's explicit "Create team" button calls this
  // (CreateTeamFlow's <form> submit means "Next").
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (submittingRef.current) return;
    if (!validateForm()) return;

    submittingRef.current = true;
    setLoading(true);
    setFormError("");

    try {
      await queueTeam(
        {
          name: teamName,
          slackChannel,
          eventId: event_id,
          nonprofitRankings: rankingsPayload(rankedProjects),
          teamMembers,
          githubUsername,
          comments,
        },
        { token: tokenRef.current },
      );
      // Typed names become the dashboard's "Still to join" reminder (local
      // only; keyed by the new team's Slack channel).
      savePendingTeammates(slackChannel, splitTeammates(teamMembers).joinLater);
      // Refetch teams so the dashboard shows the new IN_REVIEW team, THEN
      // reset — the button stays disabled until both are done.
      await fetchMyTeams();
      resetCreateForm();
      setTimeout(() => {
        const el = document.getElementById("team-hub");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      setFormError(
        err?.message || "An unexpected error occurred. Please try again.",
      );
      if (err?.code === "invalid_rankings") {
        // A ranked project was hidden or removed — reload the choices
        // (pruning drops the stale rows) and send the team back to review.
        projectOptions.reload();
        setActiveStep(STEP_PROJECTS);
      } else if (err?.code === "invalid_github_username") {
        setActiveStep(STEP_GITHUB);
      }
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  const handleNext = () => {
    if (validateCurrentStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
      setFormError("");
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setFormError("");
  };

  const isNextDisabled = () => {
    if (loading) return true;
    switch (activeStep) {
      case STEP_DETAILS:
        // null = still checking → not yet valid.
        return (
          !teamName.trim() ||
          !slackChannel.trim() ||
          !slackChannel.match(/^[a-z0-9-_]+$/) ||
          isValidatingSlack ||
          isSlackValid !== true
        );
      case STEP_GITHUB:
        return (
          !githubUsername.trim() || isValidatingGithub || isGithubValid !== true
        );
      case STEP_PROJECTS:
        return rankingError(rankedProjects, totalProjects) !== null;
      default:
        return false;
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case STEP_DETAILS:
        return (
          <TeamDetailsForm
            teamName={teamName}
            setTeamName={setTeamName}
            slackChannel={slackChannel}
            setSlackChannel={setSlackChannel}
            isValidatingSlack={isValidatingSlack}
            isSlackValid={isSlackValid}
            slackError={slackError}
          />
        );
      case STEP_GITHUB:
        return (
          <GitHubInfoForm
            githubUsername={githubUsername}
            setGithubUsername={setGithubUsername}
            isValidatingGithub={isValidatingGithub}
            isGithubValid={isGithubValid}
            githubError={githubError}
          />
        );
      case STEP_PROJECTS:
        return (
          <ProjectSelectionStep
            options={projectOptions}
            ranked={rankedProjects}
            limits={limits}
            onToggle={handleToggleProject}
            onMove={handleMoveProject}
            onRemove={handleRemoveProject}
          />
        );
      case STEP_TEAMMATES:
        return (
          <TeammatesStep
            teamMembers={teamMembers}
            onAddMember={handleAddTeamMember}
            onRemoveMember={handleRemoveTeamMember}
            slackUsers={slackUsers}
            slackUsersStatus={slackUsersStatus}
            slackChannel={slackChannel}
            eventId={event_id}
            comments={comments}
            setComments={setComments}
          />
        );
      case STEP_CONFIRM:
        return (
          <ConfirmationSummary
            teamName={teamName}
            slackChannel={slackChannel}
            githubUsername={githubUsername}
            rankedProjects={rankedProjects}
            teamMembers={teamMembers}
            comments={comments}
          />
        );
      default:
        return "Unknown step";
    }
  };

  // Callback for TeamDashboard's editors to update local team data after
  // project/DevPost/video/mentor-availability saves — no full refetch.
  const handleTeamUpdated = useCallback((teamId, partial) => {
    setMyTeams((prev) =>
      prev
        ? prev.map((t) => (t.id === teamId ? { ...t, ...partial } : t))
        : prev,
    );
  }, []);

  // Leave from the dashboard roster: drop the team locally (the dashboard
  // unmounts), switch to the next team, then let a background /me refresh
  // confirm it — refresh() keeps the data if that call fails.
  const handleLeftTeam = useCallback(
    (teamId, result) => {
      const left = (myTeams || []).find((t) => t.id === teamId);
      const remaining = (myTeams || []).filter((t) => t.id !== teamId);
      setMyTeams(remaining);
      setActiveTeamId(remaining[0]?.id ?? null);
      setLeftNotice(
        result?.noop
          ? "You weren't on that team anymore."
          : `You've left ${left?.name || "the team"}.`,
      );
      refreshMyTeams();
    },
    [myTeams, setMyTeams, refreshMyTeams],
  );

  const hasExistingTeam = myTeams && myTeams.length > 0;
  // Hidden while teams load (no flash) and whenever the create-team flow is
  // showing: no team yet, or the "Create another team" form is open.
  const showSurvey = !isLoadingTeams && hasExistingTeam && !showNewTeamForm;
  // Bug #8: the old check compared against "APPROVED"/"PROJECT_COMPLETE",
  // neither of which exists in TEAM_STATUS_OPTIONS, so it was always false.
  const hasApprovedTeam =
    myTeams &&
    myTeams.some((t) => !isPendingReview(t.status) && t.status !== "INACTIVE");
  const teamCreationEnabled =
    event?.constraints?.team_creation_enabled !== false;
  const teamFindingEnabled =
    event?.constraints?.team_find_a_team_enabled !== false;

  const activeTeam =
    (myTeams && myTeams.find((t) => t.id === activeTeamId)) ||
    myTeams?.[0] ||
    null;

  useEffect(() => {
    if (myTeams && myTeams.length > 0 && !activeTeamId) {
      setActiveTeamId(myTeams[0].id);
    }
  }, [myTeams, activeTeamId]);

  useEffect(() => {
    if (gaViewFiredRef.current || !activeTeam) return;
    gaViewFiredRef.current = true;
    trackEvent({
      action: "team_dashboard_view",
      params: {
        event_category: EventCategory.ENGAGEMENT,
        event_label: activeTeam.status,
      },
    });
  }, [activeTeam]);

  const pageTitle = hasApprovedTeam
    ? "Manage Your Hackathon Team - Opportunity Hack"
    : "Create or Manage Team - Opportunity Hack";

  return (
    <RefinedRoot>
      <Head>
        <title>{pageTitle}</title>
        <meta
          name="description"
          content={
            hasApprovedTeam
              ? "Manage your hackathon team, access resources, and coordinate with your teammates during the Opportunity Hack event."
              : "Create a new team or manage existing team applications for Opportunity Hack and start working on nonprofit projects."
          }
        />
        <meta name="robots" content="noindex" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://opportunity-hack.slack.com" />
        <link rel="preconnect" href="https://github.com" />
      </Head>

      <Box className="ohx-wrap" sx={{ pt: "clamp(88px, 9vh, 108px)", pb: 8 }}>
        <TeamMasthead
          eventId={event_id}
          eventTitle={event?.title}
          team={activeTeam}
          nonprofitName={
            event?.nonprofits?.find(
              (n) => n.id === activeTeam?.selected_nonprofit_id,
            )?.name
          }
          hasTeam={hasExistingTeam}
        />

        {/* The live/post-event survey only makes sense once you're on a
            team — never while the create-team flow is on screen. */}
        {showSurvey && (
          <SurveyCTA
            eventId={event_id}
            startDate={event?.start_date}
            endDate={event?.end_date}
            timezone={event?.timezone}
          />
        )}

        {leftNotice && (
          <Box
            role="status"
            className="ohx-card"
            sx={{
              p: 2,
              mb: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1.5,
              borderLeft: "3px solid var(--accent)",
            }}
          >
            <span>{leftNotice}</span>
            <button
              type="button"
              className="ohx-link"
              onClick={() => setLeftNotice("")}
              style={{
                background: "none",
                border: 0,
                padding: 0,
                cursor: "pointer",
              }}
            >
              Dismiss
            </button>
          </Box>
        )}

        {/* Team dashboard */}
        <div id="team-hub">
          {isLoadingTeams ? (
            <Skeleton
              variant="rectangular"
              height={320}
              sx={{ borderRadius: 2 }}
            />
          ) : teamsError ? (
            <Box className="ohx-card" sx={{ p: 4, textAlign: "center" }}>
              <Typography sx={{ color: "var(--muted)", mb: 2 }}>
                {teamsError}
              </Typography>
              <button
                type="button"
                className="ohx-btn ohx-btn--ghost"
                onClick={fetchMyTeams}
              >
                Retry
              </button>
            </Box>
          ) : hasExistingTeam ? (
            <>
              <TeamSwitcher
                teams={myTeams}
                activeId={activeTeam?.id}
                onChange={setActiveTeamId}
              />
              <TeamDashboard
                // Keyed by team id so switching the active team (TeamSwitcher)
                // remounts the subtree instead of leaving stale local state —
                // several editors (demo video, DevPost, mentor availability)
                // seed a text/toggle value from `team` only once via
                // `useState`, and TeamDashboard itself is otherwise never
                // unmounted across a switch. A remount here is exactly the
                // "active team changed" case `use-team-project.js`'s reseed
                // effect already special-cases — it never fires on an
                // `onTeamUpdated` merge of the *same* team, since that never
                // changes this key.
                key={activeTeam?.id}
                team={activeTeam}
                event={event}
                eventId={event_id}
                accessToken={accessToken}
                profile={profile}
                onTeamUpdated={handleTeamUpdated}
                onLeftTeam={handleLeftTeam}
                teamFindingEnabled={teamFindingEnabled}
              />
            </>
          ) : (
            <Box
              className="ohx-card"
              sx={{ p: 4, textAlign: "center", minHeight: 120 }}
            >
              <Typography sx={{ color: "var(--muted)" }}>
                You don&apos;t have a team yet for{" "}
                {event?.title || "this hackathon"}. Create one below, or find
                teammates first.
              </Typography>
            </Box>
          )}
        </div>

        {/* Application loading */}
        {isLoadingApplication && (
          <ApplicationLoadingPanel eventTitle={event?.title} />
        )}

        {/* Application status couldn't be read — never claim "apply first" */}
        {!isLoadingApplication && applicationError && (
          <Box
            className="ohx-card"
            role="alert"
            sx={{ p: 4, mt: 4, textAlign: "center" }}
          >
            <Typography sx={{ color: "var(--muted)", mb: 2 }}>
              We couldn&apos;t check your hacker application just now.
            </Typography>
            <button
              type="button"
              className="ohx-btn ohx-btn--ghost"
              onClick={() => applicationResource.reload()}
            >
              Retry
            </button>
          </Box>
        )}

        {/* No application */}
        {!isLoadingApplication && !applicationError && !hackerApplication && (
          <NoApplicationPanel eventId={event_id} eventTitle={event?.title} />
        )}

        {/* Application submitted but not yet confirmed */}
        {!isLoadingApplication &&
          hackerApplication &&
          hackerApplication.isSelected === false && (
            <AwaitingConfirmationPanel eventTitle={event?.title} />
          )}

        {/* Team creation content — only for confirmed hackers */}
        {!isLoadingApplication &&
          hackerApplication?.isSelected !== false &&
          hackerApplication && (
            <>
              {!teamCreationEnabled && <TeamCreationDisabledPanel />}

              {/* Existing team: a quiet disclosure around the create form */}
              {teamCreationEnabled && hasExistingTeam && (
                <Box sx={{ mt: 4 }}>
                  <Alert severity="info" icon={false} sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      {hasApprovedTeam
                        ? "You already have a team for this hackathon. Only create another one if Opportunity Hack staff asked you to."
                        : "You already have a team application in review. Please wait for it to be processed before creating another team."}
                    </Typography>
                  </Alert>

                  <FindTeammatesCTA
                    eventId={event_id}
                    teamFindingEnabled={teamFindingEnabled}
                    heading="Need additional teammates?"
                    body="You can find additional teammates with complementary skills before creating a new team."
                  />

                  <details
                    open={showNewTeamForm}
                    onToggle={(e) => setShowNewTeamForm(e.currentTarget.open)}
                    style={{ marginTop: 16 }}
                  >
                    <summary
                      className="ohx-btn ohx-btn--ghost"
                      style={{ display: "inline-flex", cursor: "pointer" }}
                    >
                      {showNewTeamForm
                        ? "Hide team creation form"
                        : "Create another team"}
                    </summary>
                    <CreateTeamFlow
                      steps={steps}
                      activeStep={activeStep}
                      loading={loading}
                      formError={formError}
                      isNextDisabled={isNextDisabled}
                      handleNext={handleNext}
                      handleBack={handleBack}
                      handleSubmit={handleSubmit}
                    >
                      {getStepContent(activeStep)}
                    </CreateTeamFlow>
                  </details>
                </Box>
              )}

              {/* No existing team: show find teammates + create form directly */}
              {teamCreationEnabled && !hasExistingTeam && (
                <Box sx={{ mt: 4 }}>
                  <FindTeammatesCTA
                    eventId={event_id}
                    teamFindingEnabled={teamFindingEnabled}
                    heading="Looking for teammates?"
                    body="Don't create a team alone! Find other participants with complementary skills and shared interests."
                  />
                  <CreateTeamFlow
                    steps={steps}
                    activeStep={activeStep}
                    loading={loading}
                    formError={formError}
                    isNextDisabled={isNextDisabled}
                    handleNext={handleNext}
                    handleBack={handleBack}
                    handleSubmit={handleSubmit}
                  >
                    {getStepContent(activeStep)}
                  </CreateTeamFlow>
                </Box>
              )}
            </>
          )}
      </Box>
    </RefinedRoot>
  );
};

const AuthenticatedTeam = () => {
  const { user } = useAuthInfo();
  return <ManageTeamComponent userClass={user} />;
};

const ManageTeam = () => {
  const router = useRouter();
  const { event_id } = router.query;

  const currentUrl =
    typeof window !== "undefined" && event_id
      ? `${window.location.origin}/hack/${event_id}/manageteam`
      : null;

  return (
    <RequiredAuthProvider
      authUrl={process.env.NEXT_PUBLIC_REACT_APP_AUTH_URL}
      displayIfLoggedOut={
        <RedirectToLogin
          postLoginRedirectUrl={
            currentUrl ||
            (typeof window !== "undefined" ? window.location.href : undefined)
          }
        />
      }
    >
      <AuthenticatedTeam />
    </RequiredAuthProvider>
  );
};

export default ManageTeam;
