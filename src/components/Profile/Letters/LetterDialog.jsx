import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useAuthInfo } from "@propelauth/react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  TextField,
  Typography,
} from "@mui/material";

import lettersApi, { letterFilename, saveBlob } from "../../../lib/lettersApi";
import { trackEvent } from "../../../lib/ga";
import { reasonText, roleLabel } from "./letterStates";

const PREVIEW_DEBOUNCE_MS = 600;
const MAX_NAME_LENGTH = 120;

/**
 * Confirm the name, optionally show the title/company line, see the
 * watermarked preview, then issue + download the signed letter. The letter
 * text itself is locked server-side; this dialog never edits it.
 *
 * Renders through a Portal, so it relies on the ThemeProvider above it
 * (Profile's scoped navy theme) — not on RefinedRoot classes.
 */
function LetterDialog({ open, row, nameDefault, titleLine, onClose, onIssued }) {
  const { accessToken } = useAuthInfo();
  const tokenRef = useRef(accessToken);
  tokenRef.current = accessToken;

  const [name, setName] = useState(nameDefault || "");
  const [showTitle, setShowTitle] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewError, setPreviewError] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setName(nameDefault || "");
      setShowTitle(false);
      setError("");
    }
  }, [open, nameDefault]);

  const trimmed = name.trim();

  // Debounced preview; each run revokes the previous object URL.
  useEffect(() => {
    if (!open || !row || !trimmed) return undefined;
    let cancelled = false;
    let url = null;
    const timer = setTimeout(async () => {
      setPreviewLoading(true);
      setPreviewError("");
      try {
        const { blob } = await lettersApi.preview(
          { eventId: row.event_id, role: row.role, name: trimmed, showTitleLine: showTitle },
          tokenRef.current,
        );
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      } catch (err) {
        if (!cancelled) {
          setPreviewUrl(null);
          setPreviewError(err.reason ? reasonText(err.reason) : err.message);
        }
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    }, PREVIEW_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (url) URL.revokeObjectURL(url);
    };
  }, [open, row, trimmed, showTitle]);

  const issue = async () => {
    if (!trimmed || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const result = await lettersApi.request(
        {
          event_id: row.event_id,
          role: row.role,
          name_on_letter: trimmed,
          show_title_line: showTitle,
        },
        tokenRef.current,
      );
      trackEvent({
        action: "letter_request",
        params: { event_id: row.event_id, role: row.role, created: Boolean(result.created) },
      });
      const { blob } = await lettersApi.pdf(result.letter_id, tokenRef.current);
      saveBlob(blob, letterFilename(result.letter_id));
      trackEvent({
        action: "letter_download",
        params: { event_id: row.event_id, role: row.role, source: "dialog" },
      });
      onIssued(result.letter_id);
    } catch (err) {
      setError(err.reason ? reasonText(err.reason) : err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!row) return null;

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        {roleLabel(row.role)} letter · {row.event_title}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "280px 1fr" } }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Your name as it should appear"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, MAX_NAME_LENGTH))}
              required
              fullWidth
              helperText="Saved to your profile for future letters."
              error={!trimmed}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={showTitle}
                  onChange={(e) => setShowTitle(e.target.checked)}
                  disabled={!titleLine}
                />
              }
              label={
                titleLine ? (
                  <span>
                    Show my title and company
                    <Typography variant="body2" color="text.secondary" component="span" display="block">
                      {titleLine}
                    </Typography>
                  </span>
                ) : (
                  <span>
                    Show my title and company
                    <Typography variant="body2" color="text.secondary" component="span" display="block">
                      Add your role and company on the Basic Info tab first.
                    </Typography>
                  </span>
                )
              }
            />
            <Typography variant="body2" color="text.secondary">
              The rest of the letter comes from event records and can&apos;t be edited. Once
              issued, the letter is signed and gets a public verification link.
            </Typography>
            {error && (
              <Alert severity="error" role="alert">
                {error}
              </Alert>
            )}
          </Box>
          <Box
            sx={{
              position: "relative",
              border: "1px solid #E7E1D4",
              borderRadius: 1,
              minHeight: { xs: 360, md: 560 },
              backgroundColor: "#F6F3EC",
            }}
          >
            {previewUrl && (
              <iframe
                title="Letter preview"
                src={`${previewUrl}#toolbar=0&view=FitH`}
                style={{ width: "100%", height: "100%", minHeight: 360, border: 0, position: "absolute", inset: 0 }}
              />
            )}
            {(previewLoading || (!previewUrl && !previewError)) && (
              <Box sx={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                {trimmed ? <CircularProgress size={28} /> : (
                  <Typography variant="body2" color="text.secondary">Enter your name to see a preview.</Typography>
                )}
              </Box>
            )}
            {previewError && !previewLoading && (
              <Box sx={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", p: 3 }}>
                <Typography variant="body2" color="text.secondary">{previewError}</Typography>
              </Box>
            )}
          </Box>
        </Box>
        {previewUrl && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            <a href={previewUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#1B3A6B" }}>
              Open the preview in a new tab
            </a>
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="contained" onClick={issue} disabled={!trimmed || submitting}>
          {submitting ? "Signing…" : "Download signed letter"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

LetterDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  row: PropTypes.object,
  nameDefault: PropTypes.string,
  titleLine: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onIssued: PropTypes.func.isRequired,
};

export default LetterDialog;
