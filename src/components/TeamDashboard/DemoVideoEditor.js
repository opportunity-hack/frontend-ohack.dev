import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DashboardSection from "./DashboardSection";
import LiteVideoThumbnail from "../VideoDisplay/LiteVideoThumbnail";
import VideoDisplay from "../VideoDisplay/VideoDisplay";
import {
  saveTeamDemoVideo,
  isSubmissionsClosed,
  isNotTeamMember,
} from "../../lib/teamDashboardApi";
import {
  formatDeadlineMoment,
  getEventTimezone,
} from "../../lib/timezoneUtils";
import { trackEvent, EventCategory } from "../../lib/ga";
import {
  isSupportedVideoUrl,
  describeVideoUrlProblem,
  youtubeIdFromUrl,
  DEMO_VIDEO_HOSTS_LABEL,
} from "../../lib/videoLinks";
import {
  DEMO_VIDEO_INTRO,
  JUDGING_CRITERIA_LINK_TEXT,
  JUDGING_CRITERIA_HREF,
  EXAMPLE_TEAM_LEAD_IN,
  EXAMPLE_TEAM_LINK_TEXT,
  EXAMPLE_TEAM_HREF,
  EASY_STEPS_HEADING,
  EASY_STEPS,
  DEMO_VIDEO_FIELD_HELP,
  CHECK_IT_PLAYS_NOTE,
  UNAVAILABLE_WARNING,
  HOSTING_DISCLOSURE_SUMMARY,
  RECORDING_TOOLS_HEADING,
  RECORDING_TOOLS,
  RECORDING_TOOLS_FOOTNOTE,
  HOSTING_HEADING,
  HOSTING_OPTIONS,
  HOSTING_FOOTNOTE,
} from "./demoVideoGuide";

const SETTLE_MS = 600;
const OEMBED_TIMEOUT_MS = 5000;

// "ok" | "unavailable" | "unknown". A failed request is never a "no": network
// errors, timeouts and server-side (5xx/429) answers are "unknown".
// Sends only the pasted video URL to YouTube — no user or team identifiers.
async function checkYoutubeAvailability(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OEMBED_TIMEOUT_MS);
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`,
      { signal: controller.signal },
    );
    if (res.ok) return "ok";
    if (res.status >= 500 || res.status === 429) return "unknown";
    return "unavailable";
  } catch {
    return "unknown";
  } finally {
    clearTimeout(timer);
  }
}

// Bold the word "Unlisted" wherever the copy mentions it.
function withEmphasis(text) {
  return text.split(/(Unlisted)/).map((part, i) =>
    part === "Unlisted" ? <strong key={i}>{part}</strong> : part,
  );
}

function absoluteUrl(url) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function EasySteps() {
  return (
    <Box sx={{ mb: 2.5 }}>
      <div className="ohx-eyebrow" style={{ marginBottom: 8 }}>
        {EASY_STEPS_HEADING}
      </div>
      <ol
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {EASY_STEPS.map((step, i) => (
          <li
            key={step.id}
            style={{ display: "flex", gap: 12, alignItems: "baseline" }}
          >
            <span
              aria-hidden="true"
              className="ohx-display"
              style={{
                flexShrink: 0,
                width: 20,
                color: "var(--accent)",
                fontWeight: 600,
                fontSize: "1.05rem",
              }}
            >
              {i + 1}
            </span>
            <div>
              <div>{withEmphasis(step.text)}</div>
              {step.note && (
                <div
                  style={{
                    color: "var(--muted)",
                    fontSize: "0.9rem",
                    marginTop: 2,
                  }}
                >
                  {step.note}
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Box>
  );
}

function GuideList({ heading, items, footnote }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div className="ohx-eyebrow" style={{ marginBottom: 6 }}>
        {heading}
      </div>
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {items.map((item) => (
          <li key={item.name} style={{ marginBottom: 4 }}>
            <strong>{item.name}</strong> — {item.text}
          </li>
        ))}
      </ul>
      {footnote && (
        <div
          style={{ color: "var(--muted)", fontSize: "0.9rem", marginTop: 6 }}
        >
          {footnote}
        </div>
      )}
    </div>
  );
}

function HostingGuide({ onOpen }) {
  return (
    <details
      style={{ marginTop: 20 }}
      onToggle={(e) => {
        if (e.currentTarget.open) onOpen?.();
      }}
    >
      <summary style={{ cursor: "pointer", fontWeight: 600 }}>
        {HOSTING_DISCLOSURE_SUMMARY}
      </summary>
      <div style={{ marginTop: 12, maxWidth: "46em" }}>
        <GuideList
          heading={RECORDING_TOOLS_HEADING}
          items={RECORDING_TOOLS}
          footnote={RECORDING_TOOLS_FOOTNOTE}
        />
        <GuideList
          heading={HOSTING_HEADING}
          items={HOSTING_OPTIONS}
          footnote={HOSTING_FOOTNOTE}
        />
      </div>
    </details>
  );
}

/**
 * Demo video link. The 320×180 frame is always reserved (`LiteVideoThumbnail`
 * or an empty placeholder of the same size) so saving a video doesn't shift
 * the layout.
 */
export default function DemoVideoEditor({
  team,
  event,
  accessToken,
  onTeamUpdated,
  onNotify,
}) {
  const [value, setValue] = useState(team?.demo_video_url || "");
  // A teammate may save this link from their own dashboard; follow the saved
  // value while this input is untouched (never over something being typed).
  const valueRef = useRef(value);
  valueRef.current = value;
  const seededRef = useRef(team?.demo_video_url || "");
  const savedValue = team?.demo_video_url || "";
  useEffect(() => {
    if (valueRef.current.trim() === seededRef.current.trim()) {
      setValue(savedValue);
    }
    seededRef.current = savedValue;
  }, [savedValue]);
  const [saving, setSaving] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  const [availability, setAvailability] = useState("unknown");

  const trimmedValue = value.trim();
  const problem = describeVideoUrlProblem(value);
  const showError = Boolean(trimmedValue) && !isSupportedVideoUrl(value);

  // Latest-request-wins: a stale oEmbed answer never overwrites a newer one.
  const requestIdRef = useRef(0);
  const mountedRef = useRef(true);
  const warnedUrlsRef = useRef(new Set());
  const helpOpenedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const runAvailabilityCheck = useCallback(
    async (url) => {
      const requestId = ++requestIdRef.current;
      const result = await checkYoutubeAvailability(url);
      if (!mountedRef.current || requestId !== requestIdRef.current) return;
      setAvailability(result);
      if (result === "unavailable" && !warnedUrlsRef.current.has(url)) {
        warnedUrlsRef.current.add(url);
        trackEvent({
          action: "team_demo_video_unavailable_warning",
          params: {
            event_category: EventCategory.ENGAGEMENT,
            event_label: team?.id,
          },
        });
      }
    },
    [team?.id],
  );

  // Check a valid YouTube link once the field settles.
  useEffect(() => {
    requestIdRef.current += 1; // invalidate any in-flight answer
    setAvailability("unknown");
    if (!trimmedValue || !youtubeIdFromUrl(trimmedValue)) return undefined;
    const timer = setTimeout(() => runAvailabilityCheck(trimmedValue), SETTLE_MS);
    return () => clearTimeout(timer);
  }, [trimmedValue, runAvailabilityCheck]);

  const handleSave = async () => {
    const url = value.trim();
    if (!url || !isSupportedVideoUrl(url)) {
      onNotify?.(
        describeVideoUrlProblem(url) ||
          `Please enter a ${DEMO_VIDEO_HOSTS_LABEL} video link.`,
        "error",
      );
      return;
    }
    setSaving(true);
    try {
      await saveTeamDemoVideo(team.id, url, accessToken);
      onTeamUpdated?.(team.id, { demo_video_url: url });
      if (youtubeIdFromUrl(url)) runAvailabilityCheck(url);
      onNotify?.(
        "Demo video saved! Judges and visitors will see it on your project page.",
        "success",
      );
      trackEvent({
        action: "team_demo_video_saved",
        params: {
          event_category: EventCategory.ENGAGEMENT,
          event_label: team?.id,
        },
      });
    } catch (err) {
      if (isSubmissionsClosed(err)) {
        onNotify?.(
          err.body?.late_until
            ? `Submissions are closed, but late submissions are open until ${formatDeadlineMoment(err.body.late_until, getEventTimezone(event))}.`
            : "Submissions are closed for this event.",
          "error",
        );
      } else if (isNotTeamMember(err)) {
        onNotify?.(
          "You're not a member of this team, so this can't be saved.",
          "error",
        );
      } else {
        onNotify?.("Failed to update demo video. Please try again.", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardSection
      id="demo"
      eyebrow="Show what you built"
      title="Demo video"
    >
      <Box sx={{ color: "var(--muted)", mb: 2, maxWidth: "40em" }}>
        {DEMO_VIDEO_INTRO}{" "}
        <a
          href={JUDGING_CRITERIA_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="ohx-link"
        >
          {JUDGING_CRITERIA_LINK_TEXT}
        </a>
        . {EXAMPLE_TEAM_LEAD_IN}{" "}
        <a
          href={EXAMPLE_TEAM_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="ohx-link"
        >
          {EXAMPLE_TEAM_LINK_TEXT}
        </a>
        .
      </Box>
      <EasySteps />
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "flex-start",
        }}
      >
        <Box sx={{ width: 320, height: 180, flexShrink: 0 }}>
          {isSupportedVideoUrl(team?.demo_video_url) ? (
            <LiteVideoThumbnail
              url={team.demo_video_url}
              width={320}
              height={180}
              onClick={() => setVideoOpen(true)}
            />
          ) : (
            <Box
              sx={{
                width: 320,
                height: 180,
                borderRadius: 1,
                border: "1px dashed var(--line, #E7E1D4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--faint)",
                fontSize: "0.85rem",
                bgcolor: "var(--surface-2, #F4F1E9)",
              }}
            >
              No video yet
            </Box>
          )}
        </Box>
        <Box sx={{ flex: 1, minWidth: 240 }}>
          <TextField
            fullWidth
            label="Demo video URL"
            placeholder="https://youtu.be/..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            error={!!showError}
            helperText={showError ? problem : DEMO_VIDEO_FIELD_HELP}
            sx={{ mb: 1.5 }}
          />
          {availability === "unavailable" && (
            <div
              role="status"
              style={{
                background: "var(--surface-2, #F4F1E9)",
                borderLeft: "3px solid var(--accent)",
                borderRadius: 6,
                padding: "10px 12px",
                marginBottom: 12,
                fontSize: "0.92rem",
              }}
            >
              <div>{withEmphasis(UNAVAILABLE_WARNING)}</div>
              <button
                type="button"
                className="ohx-link"
                onClick={() => runAvailabilityCheck(trimmedValue)}
                style={{
                  background: "none",
                  border: 0,
                  padding: 0,
                  marginTop: 4,
                  cursor: "pointer",
                  font: "inherit",
                }}
              >
                Check again
              </button>
            </div>
          )}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 2,
            }}
          >
            <button
              type="button"
              className="ohx-btn ohx-btn--primary"
              onClick={handleSave}
              disabled={saving || !value.trim()}
            >
              {saving ? "Saving…" : "Save video"}
            </button>
            {team?.demo_video_url && (
              <a
                className="ohx-link"
                href={absoluteUrl(team.demo_video_url)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackEvent({
                    action: "team_demo_video_check_click",
                    params: {
                      event_category: EventCategory.ENGAGEMENT,
                      event_label: team?.id,
                    },
                  })
                }
              >
                Check it plays ↗
              </a>
            )}
          </Box>
          {team?.demo_video_url && (
            <Box sx={{ color: "var(--muted)", fontSize: "0.9rem", mt: 1 }}>
              {CHECK_IT_PLAYS_NOTE}
            </Box>
          )}
        </Box>
      </Box>

      <HostingGuide
        onOpen={() => {
          if (helpOpenedRef.current) return;
          helpOpenedRef.current = true;
          trackEvent({
            action: "team_demo_video_help_open",
            params: { event_category: EventCategory.ENGAGEMENT },
          });
        }}
      />

      <Dialog
        open={videoOpen}
        onClose={() => setVideoOpen(false)}
        maxWidth="md"
        fullWidth
        aria-label="Demo video"
      >
        <DialogContent dividers sx={{ position: "relative" }}>
          <IconButton
            aria-label="Close demo video"
            onClick={() => setVideoOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8, zIndex: 1 }}
          >
            <CloseIcon />
          </IconButton>
          {videoOpen && team?.demo_video_url && (
            <VideoDisplay url={team.demo_video_url} title="Demo video" />
          )}
        </DialogContent>
      </Dialog>
    </DashboardSection>
  );
}
