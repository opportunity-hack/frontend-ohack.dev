import React, { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  Autocomplete,
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DashboardSection from "./DashboardSection";
import { trackEvent, EventCategory } from "../../lib/ga";
import { STORY_LEAD } from "./copy";

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <Box
        sx={{
          minHeight: 360,
          bgcolor: "var(--surface-2, #F4F1E9)",
          borderRadius: 1,
        }}
      />
    ),
  },
);

const Confetti = dynamic(() => import("react-confetti"), {
  ssr: false,
  loading: () => null,
});

const TAGLINE_MAX = 140;
const BUILT_WITH_MAX = 25;
const LINKS_MAX = 10;

const SECTION_PROMPTS = [
  "## The nonprofit's problem",
  "## What we built",
  "## How it works",
  "## What we'd do next",
  "## What we learned",
];

/** Uploads a project image via the existing generic upload endpoint
 * (Part 3: `POST /api/messages/upload-image`, `directory=teams/<id>/project`
 * — no signed-URL mint for this). Returns the CDN URL. */
async function uploadProjectImage(teamId, file, accessToken) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("directory", `teams/${teamId}/project`);
  const timestamp = Date.now();
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  formData.append("filename", `${timestamp}_${cleanName}`);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/upload-image`,
    {
      method: "POST",
      body: formData,
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Upload failed");
  return json.url;
}

function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function SaveIndicator({ saveState }) {
  if (saveState.status === "saving")
    return <span style={{ color: "var(--muted)" }}>Saving…</span>;
  if (saveState.status === "saved")
    return <span style={{ color: "var(--muted)" }}>Saved just now</span>;
  if (saveState.status === "error")
    return (
      <span style={{ color: "var(--accent, #E2552E)" }}>
        Couldn&apos;t save — we&apos;ll retry on your next edit
      </span>
    );
  return null;
}

/**
 * Project tagline + story + built-with + links + thumbnail, with 1.5s
 * autosave (via `projectApi`) and a confirm-and-submit flow.
 */
export default function ProjectWriteupEditor({
  team,
  accessToken,
  projectApi,
  onNotify,
}) {
  const { draft, setField, saveState, submit } = projectApi;
  const [preview, setPreview] = useState("edit");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [closedNotice, setClosedNotice] = useState(null);

  const missingSections = useMemo(() => {
    const story = draft.project_story || "";
    return SECTION_PROMPTS.filter((h) => !story.includes(h));
  }, [draft.project_story]);

  const insertPrompts = useCallback(() => {
    const current = draft.project_story || "";
    const additions = missingSections.map((h) => `${h}\n\n`).join("");
    setField(
      "project_story",
      current ? `${current}\n\n${additions}` : additions,
    );
  }, [draft.project_story, missingSections, setField]);

  const handleThumbnailFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !team?.id) return;
    setUploading(true);
    try {
      const url = await uploadProjectImage(team.id, file, accessToken);
      setField("project_thumbnail_url", url);
    } catch {
      onNotify?.(
        "Couldn't upload that image. Try again or paste a URL instead.",
        "error",
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const addLink = () => {
    if ((draft.project_links || []).length >= LINKS_MAX) return;
    setField("project_links", [
      ...(draft.project_links || []),
      { label: "", url: "" },
    ]);
  };
  const updateLink = (idx, patch) => {
    const next = [...(draft.project_links || [])];
    next[idx] = { ...next[idx], ...patch };
    setField("project_links", next);
  };
  const removeLink = (idx) => {
    const next = [...(draft.project_links || [])];
    next.splice(idx, 1);
    setField("project_links", next);
  };

  const handleSubmit = async () => {
    setConfirmOpen(false);
    setSubmitting(true);
    setClosedNotice(null);
    try {
      const res = await submit();
      if (res.success) {
        if (!prefersReducedMotion()) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 4000);
        }
        onNotify?.(
          res.alreadySubmitted
            ? "Your project is already submitted."
            : "Project submitted!",
          "success",
        );
        trackEvent({
          action: "team_project_submitted",
          params: {
            event_category: EventCategory.ENGAGEMENT,
            event_label: res.team?.project_submission_status || "submitted",
          },
        });
      } else if (res.closed) {
        setClosedNotice({ deadline: res.deadline, lateUntil: res.lateUntil });
      } else if (res.incomplete) {
        onNotify?.("Add a tagline and story before submitting.", "error");
      } else {
        onNotify?.(
          res.error || "Couldn't submit your project. Please try again.",
          "error",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isUnavailable = saveState.status === "unavailable";

  return (
    <DashboardSection id="project" eyebrow="Your project" title="Project story">
      <Box sx={{ color: "var(--muted)", mb: 2, maxWidth: "40em" }}>
        {STORY_LEAD}
      </Box>

      {isUnavailable && (
        <Box className="ohx-tag" sx={{ mb: 2 }}>
          Project write-ups aren&apos;t available for this event yet.
        </Box>
      )}

      {saveState.status === "closed" && (
        <Box
          sx={{
            mb: 2,
            p: 1.5,
            borderRadius: 1,
            border: "1px solid #e7d1aa",
            bgcolor: "#faf3e5",
            color: "#5c4108",
            fontSize: "0.9rem",
          }}
        >
          Submissions closed
          {saveState.deadline
            ? ` ${new Date(saveState.deadline).toLocaleString()}`
            : ""}
          .
          {saveState.lateUntil
            ? " Late submissions are still open."
            : " Reach out in #ask-a-mentor if something went wrong."}
        </Box>
      )}

      {closedNotice && (
        <Box
          sx={{
            mb: 2,
            p: 1.5,
            borderRadius: 1,
            border: "1px solid #e7d1aa",
            bgcolor: "#faf3e5",
            color: "#5c4108",
            fontSize: "0.9rem",
          }}
        >
          Submissions closed
          {closedNotice.deadline
            ? ` ${new Date(closedNotice.deadline).toLocaleString()}`
            : ""}
          .
          {closedNotice.lateUntil
            ? " Late submissions are still open."
            : " Reach out in #ask-a-mentor if something went wrong."}
        </Box>
      )}

      <TextField
        fullWidth
        label="Tagline"
        placeholder="One sentence — what does this project do?"
        value={draft.project_tagline || ""}
        onChange={(e) =>
          setField("project_tagline", e.target.value.slice(0, TAGLINE_MAX))
        }
        helperText={`${(draft.project_tagline || "").length}/${TAGLINE_MAX}`}
        disabled={isUnavailable}
        sx={{ mb: 3 }}
      />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Box sx={{ fontWeight: 600 }}>Story</Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          {missingSections.length > 0 && (
            <button
              type="button"
              className="ohx-btn ohx-btn--ghost"
              onClick={insertPrompts}
            >
              Insert section prompts
            </button>
          )}
          <button
            type="button"
            className="ohx-btn ohx-btn--ghost"
            onClick={() => setPreview((p) => (p === "edit" ? "live" : "edit"))}
          >
            {preview === "edit" ? "Preview" : "Edit"}
          </button>
        </Box>
      </Box>
      <Box data-color-mode="light" sx={{ mb: 3 }}>
        <MDEditor
          value={draft.project_story || ""}
          onChange={(v) => setField("project_story", v || "")}
          height={360}
          preview={preview}
        />
      </Box>

      <Autocomplete
        multiple
        freeSolo
        options={[]}
        value={draft.project_built_with || []}
        onChange={(_, value) =>
          setField("project_built_with", value.slice(0, BUILT_WITH_MAX))
        }
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip label={option} {...getTagProps({ index })} key={option} />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Built with"
            placeholder="React, Flask, Firestore…"
          />
        )}
        sx={{ mb: 3 }}
        disabled={isUnavailable}
      />

      <Box sx={{ mb: 1, fontWeight: 600 }}>Links</Box>
      {(draft.project_links || []).map((link, idx) => (
        <Box
          key={idx}
          sx={{ display: "flex", gap: 1, mb: 1.5, alignItems: "flex-start" }}
        >
          <TextField
            label="Label"
            value={link.label || ""}
            onChange={(e) =>
              updateLink(idx, { label: e.target.value.slice(0, 40) })
            }
            sx={{ width: 180 }}
          />
          <TextField
            label="URL"
            value={link.url || ""}
            onChange={(e) => updateLink(idx, { url: e.target.value })}
            sx={{ flex: 1 }}
          />
          <IconButton
            onClick={() => removeLink(idx)}
            aria-label="Remove link"
            sx={{ mt: 1 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}
      {(draft.project_links || []).length < LINKS_MAX && (
        <button
          type="button"
          className="ohx-btn ohx-btn--ghost"
          onClick={addLink}
          style={{ marginBottom: 24 }}
        >
          + Add a link
        </button>
      )}

      <Box sx={{ mb: 1, fontWeight: 600 }}>Thumbnail</Box>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          alignItems: "flex-start",
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <Box
          sx={{
            width: 160,
            height: 90,
            borderRadius: 1,
            border: "1px solid var(--line, #E7E1D4)",
            overflow: "hidden",
            flexShrink: 0,
            bgcolor: "var(--surface-2, #F4F1E9)",
          }}
        >
          {draft.project_thumbnail_url && (
            <img
              src={draft.project_thumbnail_url}
              alt=""
              width={160}
              height={90}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}
        </Box>
        <Box>
          <input
            type="file"
            accept="image/*"
            onChange={handleThumbnailFile}
            disabled={uploading}
          />
          <TextField
            label="Or paste an image URL"
            value={draft.project_thumbnail_url || ""}
            onChange={(e) => setField("project_thumbnail_url", e.target.value)}
            sx={{ mt: 1.5, minWidth: 280 }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          pt: 2,
          borderTop: "1px solid var(--line, #E7E1D4)",
        }}
      >
        <Box sx={{ fontSize: "0.85rem" }}>
          <SaveIndicator saveState={saveState} />
        </Box>
        <button
          type="button"
          className="ohx-btn ohx-btn--primary"
          onClick={() => setConfirmOpen(true)}
          disabled={submitting || isUnavailable || !!team?.project_submitted_at}
        >
          {team?.project_submitted_at
            ? "Submitted ✓"
            : submitting
              ? "Submitting…"
              : "Submit project"}
        </button>
      </Box>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Submit your project?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You can keep editing until the deadline. Submitting tells judges and
            mentors it&apos;s ready.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <button
            type="button"
            className="ohx-btn ohx-btn--ghost"
            style={{ borderColor: "var(--line, #E7E1D4)" }}
            onClick={() => setConfirmOpen(false)}
          >
            Not yet
          </button>
          <button
            type="button"
            className="ohx-btn ohx-btn--primary"
            style={{ background: "var(--brand, #1B3A6B)" }}
            onClick={handleSubmit}
          >
            Submit
          </button>
        </DialogActions>
      </Dialog>

      {showConfetti && typeof window !== "undefined" && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: (t) => t.zIndex.tooltip + 1,
          }}
        >
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            numberOfPieces={250}
            recycle={false}
          />
        </Box>
      )}
    </DashboardSection>
  );
}
