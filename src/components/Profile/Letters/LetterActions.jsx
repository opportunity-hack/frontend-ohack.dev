import React, { useState } from "react";
import PropTypes from "prop-types";
import Link from "next/link";
import { useAuthInfo } from "@propelauth/react";
import { Box, Button, Typography } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import LinkIcon from "@mui/icons-material/Link";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";

import lettersApi, { letterFilename, saveBlob } from "../../../lib/lettersApi";
import { trackEvent } from "../../../lib/ga";
import {
  LETTER_STATES,
  letterRowState,
  reasonText,
  roleLabel,
  verifyUrl,
} from "./letterStates";

/**
 * One participation-letter row for one (event, role): not eligible (disabled +
 * reason), eligible ("Get your letter" opens LetterDialog), issued (download +
 * copy verification link) or revoked (short notice + contact link).
 */
function LetterActions({ row, onRequest, certificateUrl }) {
  const { accessToken } = useAuthInfo();
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const state = letterRowState(row);
  const label = `${roleLabel(row.role)} letter`;

  const download = async () => {
    setBusy(true);
    setError("");
    try {
      const { blob } = await lettersApi.pdf(row.letter_id, accessToken);
      saveBlob(blob, letterFilename(row.letter_id));
      trackEvent({
        action: "letter_download",
        params: { event_id: row.event_id, role: row.role, source: "profile" },
      });
    } catch (err) {
      setError(err.message || "Could not download the letter.");
    } finally {
      setBusy(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(verifyUrl(row.letter_id));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy. The link is " + verifyUrl(row.letter_id));
    }
  };

  return (
    <Box
      data-testid={`letter-actions-${row.event_id}-${row.role}`}
      data-state={state}
      sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
        <DescriptionOutlinedIcon fontSize="small" sx={{ color: "#1B3A6B" }} />
        <Typography variant="body2" sx={{ fontWeight: 600, mr: 1 }}>
          {label}
        </Typography>
        {state === LETTER_STATES.ELIGIBLE && (
          <Button size="small" variant="contained" onClick={() => onRequest(row)}>
            Get your letter
          </Button>
        )}
        {state === LETTER_STATES.NOT_ELIGIBLE && (
          <Button size="small" variant="outlined" disabled>
            Get your letter
          </Button>
        )}
        {state === LETTER_STATES.ISSUED && (
          <>
            <Button
              size="small"
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={download}
              disabled={busy}
            >
              {busy ? "Downloading…" : "Download letter"}
            </Button>
            <Button size="small" variant="outlined" startIcon={<LinkIcon />} onClick={copyLink}>
              {copied ? "Copied" : "Copy verification link"}
            </Button>
          </>
        )}
        {certificateUrl && (
          <Button
            size="small"
            variant="text"
            startIcon={<WorkspacePremiumIcon />}
            href={certificateUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            View certificate
          </Button>
        )}
      </Box>
      {state === LETTER_STATES.NOT_ELIGIBLE && (
        <Typography variant="body2" color="text.secondary">
          {reasonText(row.reason)}
        </Typography>
      )}
      {state === LETTER_STATES.REVOKED && (
        <Typography variant="body2" color="text.secondary">
          This letter was revoked.{" "}
          <Link href="/contact" style={{ color: "#1B3A6B" }}>
            Contact us
          </Link>{" "}
          if you have questions.
        </Typography>
      )}
      {error && (
        <Typography variant="body2" color="error" role="alert">
          {error}
        </Typography>
      )}
    </Box>
  );
}

LetterActions.propTypes = {
  row: PropTypes.shape({
    event_id: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    eligible: PropTypes.bool,
    reason: PropTypes.string,
    letter_id: PropTypes.string,
    status: PropTypes.string,
  }).isRequired,
  onRequest: PropTypes.func.isRequired,
  certificateUrl: PropTypes.string,
};

export default LetterActions;
