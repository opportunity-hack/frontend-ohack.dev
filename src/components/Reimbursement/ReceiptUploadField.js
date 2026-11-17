import React, { useRef, useState } from "react";
import { Box, Button, LinearProgress, Link, Typography } from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  ghostButtonSx,
  refinedInlineLinkSx,
} from "../ApplicationForm/refinedStyles";
import { uploadReceipt } from "../../lib/reimbursementApi";
import {
  ACCEPTED_RECEIPT_TYPES,
  MAX_RECEIPT_BYTES,
  validateReceiptFile,
} from "../../lib/reimbursementValidation";

// Itemized receipt upload for the public reimbursement form. Same mint +
// XHR PUT flow as the jobs ResumeUploadField, except the mint endpoint here
// is PUBLIC: it takes a reCAPTCHA token in the body and no auth header.
// `value` is { file, blobPath, finalUrl, filename, contentType } or null.
// Styling assumes an ancestor <RefinedRoot>.

export default function ReceiptUploadField({
  value,
  onChange,
  getRecaptchaToken,
  error = "",
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

    const fileError = validateReceiptFile(file);
    if (fileError) {
      setLocalError(fileError);
      return;
    }

    setBusy(true);
    setProgress(0);
    try {
      const recaptchaToken = await getRecaptchaToken?.();
      const uploaded = await uploadReceipt(file, recaptchaToken, {
        onProgress: setProgress,
      });
      onChange({
        file,
        blobPath: uploaded.blobPath,
        finalUrl: uploaded.finalUrl,
        filename: file.name,
        contentType: file.type,
      });
    } catch (err) {
      setLocalError(err.message || "Upload failed");
    } finally {
      setProgress(null);
      setBusy(false);
    }
  };

  const shownError = localError || error;

  return (
    <Box>
      <Typography
        component="label"
        sx={{ display: "block", fontWeight: 600, color: "var(--ink)", mb: 0.5 }}
      >
        Itemized receipt *
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: "var(--muted)", lineHeight: 1.6, mb: 1.5 }}
      >
        A photo or scan of the itemized receipt. JPG, PNG, WebP or PDF, up to
        10MB. We need the line items, not just the total.
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
              Your receipt:{" "}
              {value.finalUrl ? (
                <Link
                  href={value.finalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={refinedInlineLinkSx}
                >
                  {value.filename}
                </Link>
              ) : (
                value.filename
              )}
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
                  onChange(null);
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
            Upload your receipt (image or PDF, max 10MB)
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
        accept={ACCEPTED_RECEIPT_TYPES.join(",")}
        style={{ display: "none" }}
        onChange={handleFile}
      />
    </Box>
  );
}
