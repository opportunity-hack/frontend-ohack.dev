import React, { useEffect, useRef, useState } from "react";
import { Button, LinearProgress, TextField } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const API = process.env.NEXT_PUBLIC_API_SERVER_URL;
const MAX_BYTES = 100 * 1024 * 1024; // keep in sync with backend MAX_BIO_VIDEO_BYTES
const CONTENT_TYPES = {
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
};

/**
 * Bio video: upload an mp4/webm/mov straight to our CDN (signed GCS URL —
 * bytes never touch the API), or paste a YouTube/Vimeo/Loom link.
 * XMLHttpRequest is used for the PUT because fetch has no upload progress.
 */
export default function BioVideoUpload({ accessToken, currentUrl, onSaved }) {
  const [videoUrl, setVideoUrl] = useState(currentUrl || "");
  const [linkDraft, setLinkDraft] = useState("");
  const [progress, setProgress] = useState(null); // null | 0..100
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setVideoUrl(currentUrl || "");
  }, [currentUrl]);

  const saveUrl = async (url) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/users/profile/bio-video`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ url }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not save the video");
        return false;
      }
      setVideoUrl(data.bio_video_url || "");
      setLinkDraft("");
      if (onSaved) onSaved(data.bio_video_url || "");
      return true;
    } catch (err) {
      setError("Network error — try again");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    setError(null);

    const ext = (file.name.split(".").pop() || "").toLowerCase();
    const contentType = CONTENT_TYPES[ext] || file.type;
    if (!Object.values(CONTENT_TYPES).includes(contentType)) {
      setError("Please choose an .mp4, .webm, or .mov file");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Video must be under 100MB — trim it or upload to YouTube and paste the link");
      return;
    }

    setBusy(true);
    setProgress(0);
    try {
      const urlRes = await fetch(`${API}/api/users/profile/bio-video/upload-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ content_type: contentType, content_length: file.size }),
      });
      const urlData = await urlRes.json().catch(() => ({}));
      if (!urlRes.ok) {
        setError(urlData.error || "Could not start the upload");
        return;
      }

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", urlData.upload_url);
        // GCS verifies these against the signed headers
        for (const [header, headerValue] of Object.entries(urlData.required_headers || {})) {
          xhr.setRequestHeader(header, headerValue);
        }
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status})`)));
        xhr.onerror = () => reject(new Error("Upload failed — check your connection"));
        xhr.send(file);
      });

      await saveUrl(urlData.final_url);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setProgress(null);
      setBusy(false);
    }
  };

  const handleLinkSave = () => {
    const url = linkDraft.trim();
    if (url) saveUrl(url);
  };

  return (
    <div>
      {videoUrl ? (
        <div>
          <div style={{ maxWidth: 480 }}>
            {/\.(mp4|webm|mov)(\?|#|$)/i.test(videoUrl) ? (
              /* eslint-disable-next-line jsx-a11y/media-has-caption */
              <video src={videoUrl} controls preload="metadata" playsInline style={{ width: "100%", borderRadius: 6, background: "#000", aspectRatio: "16 / 9" }} />
            ) : (
              <p className="ohx-muted" style={{ margin: 0, fontSize: "0.92rem" }}>
                Linked video: <a className="ohx-link" href={videoUrl} target="_blank" rel="noopener noreferrer">{videoUrl}</a>
              </p>
            )}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
            <Button size="small" variant="outlined" onClick={() => fileInputRef.current?.click()} disabled={busy} sx={{ textTransform: "none" }}>
              Replace video
            </Button>
            <Button size="small" color="error" startIcon={<DeleteOutlineIcon />} onClick={() => saveUrl(null)} disabled={busy} sx={{ textTransform: "none" }}>
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <Button
            variant="outlined"
            startIcon={<VideocamIcon />}
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
            sx={{ textTransform: "none" }}
          >
            Upload a video (max 100MB)
          </Button>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 14, flexWrap: "wrap" }}>
            <TextField
              size="small"
              label="…or paste a YouTube / Vimeo / Loom link"
              value={linkDraft}
              onChange={(e) => setLinkDraft(e.target.value)}
              sx={{ minWidth: 300, flex: "1 1 300px" }}
            />
            <Button variant="outlined" size="small" onClick={handleLinkSave} disabled={busy || !linkDraft.trim()} sx={{ textTransform: "none" }}>
              Save link
            </Button>
          </div>
        </div>
      )}

      {progress !== null && (
        <div style={{ marginTop: 12, maxWidth: 480 }}>
          <LinearProgress variant="determinate" value={progress} />
          <p className="ohx-muted" style={{ margin: "6px 0 0", fontSize: "0.85rem" }}>Uploading… {progress}%</p>
        </div>
      )}
      {error && <p style={{ margin: "10px 0 0", fontSize: "0.88rem", color: "#b3261e" }}>{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept=".mp4,.webm,.mov,video/mp4,video/webm,video/quicktime"
        style={{ display: "none" }}
        onChange={handleFile}
      />
    </div>
  );
}
