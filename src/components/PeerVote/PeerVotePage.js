import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import NextLink from "next/link";
import dynamic from "next/dynamic";
import { useAuthInfo } from "@propelauth/react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Skeleton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { Shell } from "../Teams/RefinedTeamShell";
import { Eyebrow } from "../design/refined";
import TeamBreadcrumbs from "../Teams/TeamBreadcrumbs";
import VideoDisplay from "../VideoDisplay/VideoDisplay";
import PeerVoteSlateCard from "./PeerVoteSlateCard";
import { togglePick, canSubmit, slateLinks } from "./peerVoteState";
import { formatDeadline } from "../Teams/projectMeta";
import { getEventTimezone } from "../../lib/timezoneUtils";
import useCountdown from "../../hooks/use-countdown";
import {
  getPeerVoteSlate,
  submitPeerVoteBallot,
  isNotFound,
  ApiError,
} from "../../lib/teamDashboardApi";
import { trackEvent } from "../../lib/ga";

// Code-split confetti (canvas-heavy, only ever needed on the post-submit
// success path) — the whole page is already ssr:false from vote.js, so this
// dynamic() is purely for bundle splitting, not an SSR guard.
const Confetti = dynamic(() => import("react-confetti"), {
  ssr: false,
  loading: () => null,
});

const DEFAULT_SLATE_SIZE = 5;
const DEFAULT_MAX_PICKS = 2;

// --- Small shared presentational pieces (module-scope — see the codebase's
// repeated "SectionBlock remount" lesson: components with their own state or
// that are toggled by fast-changing parent state must not be redefined on
// every render). ---

function BackToEventLink({ eventId }) {
  return (
    <NextLink href={`/hack/${eventId}`} className="ohx-btn ohx-btn--ghost">
      ← Back to event
    </NextLink>
  );
}

function StatusCard({ eyebrow, title, children, actions }) {
  return (
    <Box className="ohx-card rise" sx={{ p: { xs: 3, md: 4 } }}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <Box
        component="h2"
        className="ohx-display"
        sx={{ fontSize: "1.4rem", mt: 1, mb: 1.5 }}
      >
        {title}
      </Box>
      <Box className="ohx-muted" sx={{ lineHeight: 1.6, maxWidth: "56ch" }}>
        {children}
      </Box>
      {actions && (
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mt: 3 }}>
          {actions}
        </Box>
      )}
    </Box>
  );
}

function LoadingSlate({ slateSize = DEFAULT_SLATE_SIZE }) {
  return (
    <Box
      aria-hidden="true"
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "20px",
      }}
    >
      {Array.from({ length: slateSize }).map((_, i) => (
        <Skeleton
          key={`slate-skeleton-${i}`}
          variant="rounded"
          height={320}
          sx={{ borderRadius: 2 }}
        />
      ))}
    </Box>
  );
}

function ErrorState({ onRetry, eventId }) {
  return (
    <StatusCard
      eyebrow="Hackers' Choice"
      title="Something went wrong"
      actions={
        <>
          <Box
            component="button"
            type="button"
            className="ohx-btn ohx-btn--primary"
            onClick={onRetry}
          >
            Try again
          </Box>
          <BackToEventLink eventId={eventId} />
        </>
      }
    >
      We couldn&apos;t load your ballot. Check your connection and try again.
    </StatusCard>
  );
}

function DisabledState({ eventId }) {
  return (
    <StatusCard
      eyebrow="Hackers' Choice"
      title="Voting isn't set up for this event yet."
      actions={<BackToEventLink eventId={eventId} />}
    >
      Check back closer to the event, or ask an organizer in Slack.
    </StatusCard>
  );
}

function NotEligibleState({ eventId, eventTitle, reason }) {
  return (
    <StatusCard
      eyebrow="Hackers' Choice"
      title="This vote is for registered hackers."
      actions={<BackToEventLink eventId={eventId} />}
    >
      Only hackers who registered for {eventTitle} can vote. If you&apos;re on a
      team and see this, ask an organizer in Slack.
      {reason === "own_team_not_submitted" && (
        <Box sx={{ mt: 1.5 }}>
          Submit your team&apos;s project to unlock voting.
        </Box>
      )}
    </StatusCard>
  );
}

function NotEnoughSubmissionsState({ eventId }) {
  return (
    <StatusCard
      eyebrow="Hackers' Choice"
      title="Not enough submitted projects yet — check back later."
      actions={<BackToEventLink eventId={eventId} />}
    >
      Voting opens once enough teams have submitted their projects.
    </StatusCard>
  );
}

function ClosedState({ eventId }) {
  return (
    <StatusCard
      eyebrow="Hackers' Choice"
      title="Voting has closed."
      actions={
        <NextLink
          href={`/hack/${eventId}#results`}
          className="ohx-btn ohx-btn--primary"
        >
          See results →
        </NextLink>
      }
    >
      Winners are announced at the awards ceremony — check the event page
      afterwards.
    </StatusCard>
  );
}

function UpcomingState({ opensAt, tz, eventId }) {
  const countdown = useCountdown(opensAt);
  const opensLabel = formatDeadline(opensAt, tz);
  return (
    <StatusCard
      eyebrow="Hackers' Choice"
      title="Voting opens soon"
      actions={<BackToEventLink eventId={eventId} />}
    >
      {opensLabel ? `Voting opens ${opensLabel}.` : "Voting hasn't opened yet."}
      {countdown.mounted && !countdown.done && (
        <Box
          aria-live="polite"
          className="ohx-display"
          sx={{ fontSize: "1.6rem", color: "var(--ink)", mt: 2 }}
        >
          Opens in {countdown.days}d {countdown.hours}h {countdown.minutes}m
        </Box>
      )}
    </StatusCard>
  );
}

// Read-only row for the "Your picks" summary — deliberately NOT
// PeerVoteSlateCard (that component always renders a pick button; this is a
// review-only view of an already-submitted ballot).
function PickedProjectRow({ item, eventId }) {
  if (!item) return null;
  const { github, project } = slateLinks(item, eventId);
  return (
    <Box
      className="ohx-card"
      sx={{ p: 2, display: "flex", gap: 2, alignItems: "center" }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: 1,
          overflow: "hidden",
          flexShrink: 0,
          background: "var(--surface-2, #F4F1E9)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {item.project_thumbnail_url ? (
          <Box
            component="img"
            src={item.project_thumbnail_url}
            alt=""
            width={72}
            height={72}
            loading="lazy"
            decoding="async"
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Box
            className="ohx-display"
            sx={{ fontSize: 24, color: "var(--brand, #1B3A6B)" }}
          >
            {(item.name || "?").trim().charAt(0).toUpperCase()}
          </Box>
        )}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Box className="ohx-display" sx={{ fontSize: "1rem" }}>
          {item.name || "Unnamed team"}
        </Box>
        {item.project_tagline && (
          <Box className="ohx-muted" sx={{ fontSize: "0.85rem", mt: 0.25 }}>
            {item.project_tagline}
          </Box>
        )}
        {(github || project) && (
          <Box sx={{ display: "flex", gap: 1.5, mt: 0.5 }}>
            {github && (
              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                className="ohx-link"
                style={{ fontSize: "0.8rem" }}
              >
                GitHub ↗
              </a>
            )}
            {project && (
              <a
                href={project}
                target="_blank"
                rel="noopener noreferrer"
                className="ohx-link"
                style={{ fontSize: "0.8rem" }}
              >
                Project page ↗
              </a>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}

/**
 * The Hackers' Choice peer vote (client-only — `vote.js` loads this behind
 * `dynamic(ssr:false)` inside a `RequiredAuthProvider`). Fetches the voter's
 * assigned slate on mount, derives everything else from the backend's
 * `status` field (Part 3: GET /api/hackathons/<event_id>/peer-vote/slate),
 * and never shows tallies — only the admin results view does.
 */
export default function PeerVotePage() {
  const router = useRouter();
  const { event_id: eventId } = router.query;
  const { accessToken } = useAuthInfo();

  const [phase, setPhase] = useState("loading"); // 'loading' | 'loaded' | 'error'
  const [slateData, setSlateData] = useState(null);
  const [eventMeta, setEventMeta] = useState(null); // { title, timezone }
  const [mode, setMode] = useState("edit"); // 'view' | 'edit'
  const [picks, setPicks] = useState([]);
  const [watched, setWatched] = useState(() => new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [justVoted, setJustVoted] = useState(false);
  const [videoDialog, setVideoDialog] = useState({
    open: false,
    url: null,
    teamName: null,
  });
  const [shareCopied, setShareCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  // Token-rotation-stability pattern (see root CLAUDE.md): PropelAuth mints a
  // fresh accessToken on tab refocus. loadSlate reads through refs and has a
  // stable identity, so the mount effect keys on token *presence*, not
  // value, and the visibilitychange listener below doesn't refire on every
  // refocus — only while the page is showing the "upcoming" state.
  const tokenRef = useRef(accessToken);
  useEffect(() => {
    tokenRef.current = accessToken;
  }, [accessToken]);
  const eventIdRef = useRef(eventId);
  useEffect(() => {
    eventIdRef.current = eventId;
  }, [eventId]);
  const statusRef = useRef(null);

  const loadSlate = useCallback(async () => {
    const evId = eventIdRef.current;
    const token = tokenRef.current;
    if (!evId || !token) return;
    setPhase("loading");
    setSubmitError(null);
    try {
      const data = await getPeerVoteSlate(evId, token);
      setSlateData(data);
      statusRef.current = data.status;
      setPicks(Array.isArray(data.picks) ? data.picks : []);
      setMode(data.status === "voted" ? "view" : "edit");
      setPhase("loaded");
      trackEvent({
        action: "peer_vote_view",
        params: {
          event_label: data.status,
          event_id: evId,
          page: "hackers_choice_vote",
        },
      });
    } catch (err) {
      if (isNotFound(err)) {
        setSlateData({ status: "disabled" });
        statusRef.current = "disabled";
        setPhase("loaded");
        trackEvent({
          action: "peer_vote_view",
          params: {
            event_label: "disabled",
            event_id: evId,
            page: "hackers_choice_vote",
          },
        });
      } else {
        setPhase("error");
      }
    }
  }, []);

  useEffect(() => {
    // Deliberately keyed on token *presence*, not value — see the comment above.
    if (accessToken && eventId) loadSlate();
  }, [Boolean(accessToken), eventId, loadSlate]);

  // Re-check once voting might have opened while the tab was backgrounded.
  useEffect(() => {
    function handleVisibility() {
      if (typeof document === "undefined" || document.hidden) return;
      if (statusRef.current === "upcoming") loadSlate();
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [loadSlate]);

  // Best-effort event title/timezone for the masthead + deadline copy — the
  // slate endpoint itself carries neither. Public endpoint, no auth needed;
  // a failure just falls back to the event_id and the default timezone.
  useEffect(() => {
    if (!eventId) return undefined;
    let cancelled = false;
    fetch(
      `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${eventId}`,
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) {
          setEventMeta({
            title: data.title || null,
            timezone: getEventTimezone(data),
          });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const measure = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const handleToggle = useCallback(
    (teamId) => {
      setPicks((prev) =>
        togglePick(prev, teamId, slateData?.max_picks || DEFAULT_MAX_PICKS),
      );
    },
    [slateData?.max_picks],
  );

  const handleWatched = useCallback((teamId) => {
    setWatched((prev) => {
      const next = new Set(prev);
      if (next.has(teamId)) next.delete(teamId);
      else next.add(teamId);
      return next;
    });
  }, []);

  const handlePlayVideo = useCallback((url, teamName) => {
    setVideoDialog({ open: true, url, teamName: teamName || null });
  }, []);
  const handleCloseVideo = useCallback(() => {
    setVideoDialog((prev) => ({ ...prev, open: false }));
  }, []);

  const handleConfirmSubmit = async () => {
    setConfirmOpen(false);
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitPeerVoteBallot(eventIdRef.current, picks, tokenRef.current);
      setSlateData((prev) => ({ ...(prev || {}), status: "voted", picks }));
      statusRef.current = "voted";
      setMode("view");
      setJustVoted(true);
      setNotice(null);
      trackEvent({
        action: "peer_vote_submitted",
        params: {
          value: picks.length,
          event_id: eventIdRef.current,
          page: "hackers_choice_vote",
        },
      });
      const reducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!reducedMotion) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setNotice(
          "Voting is closed or one of your picks changed — we refreshed your slate.",
        );
        await loadSlate();
      } else {
        setSubmitError("Couldn't submit your picks — please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = useCallback(() => {
    const url = `https://www.ohack.dev/hack/${eventIdRef.current}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({ title: eventMeta?.title || eventIdRef.current, url })
        .catch(() => {});
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          setShareCopied(true);
          setTimeout(() => setShareCopied(false), 2000);
        })
        .catch(() => {});
    }
  }, [eventMeta]);

  const eventTitle = eventMeta?.title || eventId;
  const tz = eventMeta?.timezone;
  const status = slateData?.status || null;
  const slateItems = Array.isArray(slateData?.slate) ? slateData.slate : [];
  const slateSize = slateItems.length || DEFAULT_SLATE_SIZE;
  const maxPicks = slateData?.max_picks || DEFAULT_MAX_PICKS;
  const notEnoughSubmissions =
    status === "open" &&
    (slateData?.reason === "not_enough_submissions" || slateItems.length === 0);
  const inVotingFlow =
    phase === "loaded" &&
    !notEnoughSubmissions &&
    (status === "open" || status === "voted");
  const closesAtMs = slateData?.closes_at
    ? Date.parse(slateData.closes_at)
    : null;
  const stillWithinWindow = closesAtMs
    ? Date.now() < closesAtMs
    : status === "open";

  return (
    <Shell>
      <TeamBreadcrumbs
        items={[{ name: eventTitle, href: `/hack/${eventId}` }]}
        current="Hackers' Choice vote"
      />

      <Box component="header" className="rise" sx={{ mb: { xs: 3, md: 4 } }}>
        <Eyebrow>{eventTitle}</Eyebrow>
        <Box
          component="h1"
          className="ohx-display"
          sx={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)", mt: 1, mb: 1.5 }}
        >
          Hackers&apos; Choice
        </Box>
        <Box className="ohx-lead" sx={{ maxWidth: "60ch" }}>
          You&apos;ll see {slateSize} projects picked for you. Pick up to{" "}
          {maxPicks} you&apos;d be proud to have built. Every project gets seen
          roughly equally; you can&apos;t see or pick your own.
        </Box>
        <Box className="ohx-rule" sx={{ mt: 3 }} />
      </Box>

      {notice && (
        <Box
          role="status"
          className="ohx-card"
          sx={{
            p: 2,
            mb: 3,
            borderColor: "#f3d3c7",
            background: "var(--accent-soft, #FBE9E2)",
          }}
        >
          {notice}
        </Box>
      )}

      {phase === "loading" && <LoadingSlate slateSize={slateSize} />}
      {phase === "error" && (
        <ErrorState onRetry={loadSlate} eventId={eventId} />
      )}
      {phase === "loaded" && status === "disabled" && (
        <DisabledState eventId={eventId} />
      )}
      {phase === "loaded" && status === "not_eligible" && (
        <NotEligibleState
          eventId={eventId}
          eventTitle={eventTitle}
          reason={slateData?.reason}
        />
      )}
      {phase === "loaded" && status === "upcoming" && (
        <UpcomingState
          opensAt={slateData?.opens_at}
          tz={tz}
          eventId={eventId}
        />
      )}
      {phase === "loaded" && status === "closed" && (
        <ClosedState eventId={eventId} />
      )}
      {phase === "loaded" && status === "open" && notEnoughSubmissions && (
        <NotEnoughSubmissionsState eventId={eventId} />
      )}

      {inVotingFlow && mode === "view" && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <StatusCard
            eyebrow="Hackers' Choice"
            title={justVoted ? "Thanks — your picks are in." : "Your picks"}
          >
            {justVoted
              ? "Results are announced at the awards ceremony."
              : "You can change your picks until voting closes."}
          </StatusCard>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {picks.map((teamId) => (
              <PickedProjectRow
                key={teamId}
                item={slateItems.find((i) => i.team_id === teamId)}
                eventId={eventId}
              />
            ))}
          </Box>
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            {stillWithinWindow && (
              <Box
                component="button"
                type="button"
                className="ohx-btn ohx-btn--ghost"
                onClick={() => setMode("edit")}
              >
                Change picks
              </Box>
            )}
            <Box
              component="button"
              type="button"
              className="ohx-btn ohx-btn--ghost"
              onClick={handleShare}
            >
              {shareCopied ? "Link copied ✓" : "Share the event"}
            </Box>
            <BackToEventLink eventId={eventId} />
          </Box>
        </Box>
      )}

      {inVotingFlow && mode === "edit" && (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "20px",
              pb: 4,
            }}
          >
            {slateItems.map((item) => (
              <PeerVoteSlateCard
                key={item.team_id}
                item={item}
                eventId={eventId}
                selected={picks.includes(item.team_id)}
                disabled={picks.length >= maxPicks}
                watched={watched.has(item.team_id)}
                onToggle={handleToggle}
                onWatched={handleWatched}
                onPlayVideo={handlePlayVideo}
              />
            ))}
          </Box>

          {submitError && (
            <Box
              className="ohx-card"
              sx={{
                p: 2,
                mb: 2,
                borderColor: "#f3d3c7",
                background: "var(--accent-soft, #FBE9E2)",
              }}
            >
              {submitError}
            </Box>
          )}

          <Box
            sx={{
              position: "sticky",
              bottom: 0,
              background: "var(--paper, #FBFAF6)",
              borderTop: "1px solid var(--line, #E7E1D4)",
              py: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box sx={{ fontWeight: 600 }}>
              {picks.length} of {maxPicks} picked
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              {slateData?.closes_at && (
                <Box className="ohx-muted" sx={{ fontSize: "0.85rem" }}>
                  Closes {formatDeadline(slateData.closes_at, tz)}
                </Box>
              )}
              <Box
                component="button"
                type="button"
                className="ohx-btn ohx-btn--primary"
                disabled={!canSubmit(picks, maxPicks) || submitting}
                onClick={() => setConfirmOpen(true)}
                sx={{ opacity: canSubmit(picks, maxPicks) ? 1 : 0.5 }}
              >
                {submitting ? "Submitting…" : "Submit picks"}
              </Box>
            </Box>
          </Box>
        </>
      )}

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Submit your picks?</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
            {picks.map((teamId) => {
              const item = slateItems.find((i) => i.team_id === teamId);
              return <Box key={teamId}>{item?.name || teamId}</Box>;
            })}
          </Box>
          <Box className="ohx-muted" sx={{ fontSize: "0.9rem" }}>
            You can change them until voting closes.
          </Box>
        </DialogContent>
        <DialogActions>
          <Box
            component="button"
            type="button"
            className="ohx-btn ohx-btn--ghost"
            onClick={() => setConfirmOpen(false)}
          >
            Cancel
          </Box>
          <Box
            component="button"
            type="button"
            className="ohx-btn ohx-btn--primary"
            onClick={handleConfirmSubmit}
          >
            Submit picks
          </Box>
        </DialogActions>
      </Dialog>

      <Dialog
        open={videoDialog.open}
        onClose={handleCloseVideo}
        maxWidth="md"
        fullWidth
        aria-labelledby="peer-vote-video-title"
      >
        <DialogTitle id="peer-vote-video-title" sx={{ pr: 6 }}>
          {videoDialog.teamName
            ? `${videoDialog.teamName} demo`
            : "Project demo"}
          <IconButton
            aria-label="Close demo video"
            onClick={handleCloseVideo}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {videoDialog.url && (
            <VideoDisplay
              url={videoDialog.url}
              title={videoDialog.teamName || "Project demo"}
            />
          )}
        </DialogContent>
      </Dialog>

      {showConfetti && windowSize.width > 0 && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: (t) => t.zIndex.tooltip + 1,
          }}
        >
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            numberOfPieces={220}
            recycle={false}
            gravity={0.25}
          />
        </Box>
      )}
    </Shell>
  );
}
