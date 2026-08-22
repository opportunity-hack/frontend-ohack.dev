import React, { useRef, useState } from "react";
import {
  Box,
  Button,
  LinearProgress,
  Link,
  Typography,
} from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  ghostButtonSx,
  refinedInlineLinkSx,
} from "../ApplicationForm/refinedStyles";

// Resume (PDF) upload for the volunteer job application form. A controlled
// field like IntroVideoField: the uploaded file's CDN URL lives in the
// parent's formData; this component only acquires it via the jobs signed-URL
// mint (POST /api/jobs/apply/resume-upload-url → XHR PUT to GCS). Requires a
// logged-in user (the endpoint resolves the caller's user doc to build the
// job_applications/<db_id>/ path the backend later verifies on submit).
// Styling assumes an ancestor <RefinedRoot>.

const MAX_BYTES = 10 * 1024 * 1024; // keep in sync with backend MAX_RESUME_BYTES
const CONTENT_TYPE = "application/pdf";

export default function ResumeUploadField({
  value,
  onChange,
  accessToken,
  apiServerUrl = process.env.NEXT_PUBLIC_API_SERVER_URL,
  label = "Your resume (PDF)",
  helperText = "One PDF, up to 10MB. We use it to understand your background before our call — polish matters less than honesty.",
  required = false,
  error = "",
  onUploaded, // optional () => void, for analytics
}) {
  const [progress, setProgress] = useState(null); // null | 0..100
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState("");
  const fileInputRef = useRef(null);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    setLocalError("");

    const isPdf =
      file.type === CONTENT_TYPE || /\.pdf$/i.test(file.name || "");
    if (!isPdf) {
      setLocalError("Please choose a PDF file");
      return;
    }
    if (file.size > MAX_BYTES) {
      setLocalError("Resume must be under 10MB");
      return;
    }

    setBusy(true);
    setProgress(0);
    try {
      const urlRes = await fetch(
        `${apiServerUrl}/api/jobs/apply/resume-upload-url`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            content_type: CONTENT_TYPE,
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
      if (onUploaded) onUploaded();
    } catch (err) {
      setLocalError(err.message || "Upload failed");
    } finally {
      setProgress(null);
      setBusy(false);
    }
  };

  const shownError = localError || error;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        component="label"
        sx={{ display: "block", fontWeight: 600, color: "var(--ink)", mb: 0.5 }}
      >
        {label}
        {required ? " *" : ""}
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: "var(--muted)", lineHeight: 1.6, mb: 1.5 }}
      >
        {helperText}
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
            <Typography
              variant="body2"
              sx={{ color: "var(--muted)", wordBreak: "break-all" }}
            >
              Your resume:{" "}
              <Link
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                sx={refinedInlineLinkSx}
              >
                View uploaded PDF
              </Link>
            </Typography>
            <Box sx={{ display: "flex", gap: 1.5, mt: 1.5, flexWrap: "wrap" }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => fileInputRef.current?.click()}
                disabled={busy}
                sx={ghostButtonSx}
              >
                Replace
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
          <Button
            variant="outlined"
            startIcon={<DescriptionOutlinedIcon />}
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
            sx={ghostButtonSx}
          >
            Upload your resume (PDF, max 10MB)
          </Button>
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
        accept=".pdf,application/pdf"
        style={{ display: "none" }}
        onChange={handleFile}
      />
    </Box>
  );
}
