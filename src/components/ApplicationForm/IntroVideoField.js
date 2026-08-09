import React, { useRef, useState } from "react";
import {
  Box,
  Button,
  LinearProgress,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  refinedFieldSx,
  ghostButtonSx,
  refinedInlineLinkSx,
} from "./refinedStyles";

// "Tell us about you" video for application forms (judge today; designed to be
// dropped into the mentor/hacker forms later). A controlled field: the chosen
// video URL lives in the parent's formData (so useFormPersistence autosave and
// the application submit payload pick it up for free) — this component only
// handles acquiring that URL, via either:
//   1. Direct upload — reuses the portfolio bio-video signed-URL mint
//      (POST /api/users/profile/bio-video/upload-url → XHR PUT to GCS). That
//      endpoint only mints a URL under users/<db_id>/ on the CDN; we
//      deliberately NEVER call the POST /api/users/profile/bio-video finalize
//      step, so the applicant's public profile is untouched.
//   2. Pasting a YouTube / Vimeo / Loom link (allowlist mirrors the backend's
//      ALLOWED_VIDEO_LINK_HOSTS in users_service.py — keep in sync).
// Styling assumes the parent page is wrapped in <RefinedRoot> (all application
// forms are), matching the shared refinedStyles constants.

const MAX_BYTES = 100 * 1024 * 1024; // keep in sync with backend MAX_BIO_VIDEO_BYTES
const CONTENT_TYPES = {
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
};
const ALLOWED_LINK_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "youtu.be",
  "vimeo.com",
  "player.vimeo.com",
  "www.vimeo.com",
  "loom.com",
  "www.loom.com",
]);

const isRawVideoUrl = (url) => /\.(mp4|webm|mov)(\?|#|$)/i.test(url);

const isAllowedLink = (url) => {
  try {
    const parsed = new URL(url);
    return (
      (parsed.protocol === "https:" || parsed.protocol === "http:") &&
      ALLOWED_LINK_HOSTS.has(parsed.hostname.toLowerCase())
    );
  } catch (e) {
    return false;
  }
};

export default function IntroVideoField({
  value,
  onChange,
  accessToken,
  apiServerUrl = process.env.NEXT_PUBLIC_API_SERVER_URL,
  label = "Tell us about you — a short video introduction",
  helperText = "1–2 minutes is plenty: who you are, what you do, and why you're applying. Upload a video file or paste a YouTube, Vimeo, or Loom link.",
  required = false,
  error = "",
  onVideoAdded, // optional (method: "upload" | "link") => void, for analytics
}) {
  const [linkDraft, setLinkDraft] = useState("");
  const [progress, setProgress] = useState(null); // null | 0..100
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState("");
  const fileInputRef = useRef(null);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    setLocalError("");

    const ext = (file.name.split(".").pop() || "").toLowerCase();
    const contentType = CONTENT_TYPES[ext] || file.type;
    if (!Object.values(CONTENT_TYPES).includes(contentType)) {
      setLocalError("Please choose an .mp4, .webm, or .mov file");
      return;
    }
    if (file.size > MAX_BYTES) {
      setLocalError(
        "Video must be under 100MB — trim it, or upload to YouTube and paste the link instead",
      );
      return;
    }

    setBusy(true);
    setProgress(0);
    try {
      const urlRes = await fetch(
        `${apiServerUrl}/api/users/profile/bio-video/upload-url`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            content_type: contentType,
            content_length: file.size,
          }),
        },
      );
      const urlData = await urlRes.json().catch(() => ({}));
      if (!urlRes.ok) {
        setLocalError(urlData.error || "Could not start the upload");
        return;
      }

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", urlData.upload_url);
        // GCS verifies these against the signed headers
        for (const [header, headerValue] of Object.entries(
          urlData.required_headers || {},
        )) {
          xhr.setRequestHeader(header, headerValue);
        }
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable)
            setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () =>
          xhr.status >= 200 && xhr.status < 300
            ? resolve()
            : reject(new Error(`Upload failed (${xhr.status})`));
        xhr.onerror = () =>
          reject(new Error("Upload failed — check your connection"));
        xhr.send(file);
      });

      onChange(urlData.final_url);
      if (onVideoAdded) onVideoAdded("upload");
    } catch (err) {
      setLocalError(err.message || "Upload failed");
    } finally {
      setProgress(null);
      setBusy(false);
    }
  };

  const handleLinkSave = () => {
    const url = linkDraft.trim();
    if (!url) return;
    if (!isAllowedLink(url)) {
      setLocalError(
        "That doesn't look like a YouTube, Vimeo, or Loom link — or upload the video file directly",
      );
      return;
    }
    setLocalError("");
    setLinkDraft("");
    onChange(url);
    if (onVideoAdded) onVideoAdded("link");
  };

  const shownError = localError || error;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        component="label"
        sx={{
          display: "block",
          fontWeight: 600,
          color: "var(--ink)",
          mb: 0.5,
        }}
      >
        {label}
        {required ? " *" : ""}
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: "var(--muted)", lineHeight: 1.6, mb: 1.5 }}
      >
        {helperText} Only our review team watches this — it isn't published
        anywhere.
      </Typography>

      <Box
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: 2,
          border: shownError ? "1px solid #b04a36" : "1px solid var(--line)",
          backgroundColor: "var(--surface-2)",
        }}
      >
        {value ? (
          <Box>
            {isRawVideoUrl(value) ? (
              /* eslint-disable-next-line jsx-a11y/media-has-caption */
              <video
                src={value}
                controls
                preload="metadata"
                playsInline
                style={{
                  width: "100%",
                  maxWidth: 480,
                  borderRadius: 6,
                  background: "#000",
                  aspectRatio: "16 / 9",
                }}
              />
            ) : (
              <Typography
                variant="body2"
                sx={{ color: "var(--muted)", wordBreak: "break-all" }}
              >
                Your video:{" "}
                <Link
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={refinedInlineLinkSx}
                >
                  {value}
                </Link>
              </Typography>
            )}
            <Box sx={{ display: "flex", gap: 1.5, mt: 1.5, flexWrap: "wrap" }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => fileInputRef.current?.click()}
                disabled={busy}
                sx={ghostButtonSx}
              >
                Replace with an upload
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<DeleteOutlineIcon />}
                onClick={() => {
                  setLocalError("");
                  onChange("");
                }}
                disabled={busy}
                sx={ghostButtonSx}
              >
                Remove
              </Button>
            </Box>
          </Box>
        ) : (
          <Box>
            <Button
              variant="outlined"
              startIcon={<VideocamIcon />}
              onClick={() => fileInputRef.current?.click()}
              disabled={busy}
              sx={ghostButtonSx}
            >
              Upload a video (max 100MB)
            </Button>
            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                alignItems: "flex-start",
                mt: 2,
                flexWrap: "wrap",
              }}
            >
              <TextField
                size="small"
                label="…or paste a YouTube / Vimeo / Loom link"
                value={linkDraft}
                onChange={(e) => setLinkDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleLinkSave();
                  }
                }}
                sx={{
                  ...refinedFieldSx,
                  mb: 0,
                  minWidth: 260,
                  flex: "1 1 260px",
                }}
              />
              <Button
                variant="outlined"
                onClick={handleLinkSave}
                disabled={busy || !linkDraft.trim()}
                sx={{ ...ghostButtonSx, mt: 0.25 }}
              >
                Use this link
              </Button>
            </Box>
          </Box>
        )}

        {progress !== null && (
          <Box sx={{ mt: 1.5, maxWidth: 480 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                borderRadius: 1,
                backgroundColor: "var(--line)",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: "var(--brand)",
                },
              }}
            />
            <Typography variant="body2" sx={{ color: "var(--muted)", mt: 0.5 }}>
              Uploading… {progress}%
            </Typography>
          </Box>
        )}
      </Box>

      {shownError && (
        <Typography variant="body2" sx={{ color: "#b04a36", mt: 0.75 }}>
          {shownError}
        </Typography>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".mp4,.webm,.mov,video/mp4,video/webm,video/quicktime"
        style={{ display: "none" }}
        onChange={handleFile}
      />
    </Box>
  );
}
