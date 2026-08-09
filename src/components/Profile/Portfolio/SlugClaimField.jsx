import React, { useEffect, useRef, useState } from "react";
import { TextField, InputAdornment, CircularProgress, Button, Tooltip, IconButton } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const API = process.env.NEXT_PUBLIC_API_SERVER_URL;

// Mirror backend services/user_slug_service.py normalization
const normalize = (raw) => (raw || "").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 30);

/**
 * Claim / change the vanity portfolio URL (ohack.dev/u/<slug>).
 * Live availability check (500ms debounce) + an explicit Claim button —
 * slugs are semi-permanent (old ones stay as aliases), so no auto-save.
 */
export default function SlugClaimField({ accessToken, currentSlug, onClaimed }) {
  const [value, setValue] = useState(currentSlug || "");
  const [check, setCheck] = useState(null); // {available, valid, reason}
  const [checking, setChecking] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [message, setMessage] = useState(null); // {severity, text}
  const [copied, setCopied] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    setValue(currentSlug || "");
  }, [currentSlug]);

  const runCheck = (slug) => {
    if (!slug || slug === currentSlug) {
      setCheck(null);
      setChecking(false);
      return;
    }
    setChecking(true);
    fetch(`${API}/api/users/profile/slug/check/${encodeURIComponent(slug)}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setCheck(data))
      .catch(() => setCheck(null))
      .finally(() => setChecking(false));
  };

  const handleChange = (e) => {
    const slug = normalize(e.target.value);
    setValue(slug);
    setMessage(null);
    setCheck(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runCheck(slug), 500);
  };

  const handleClaim = async () => {
    setClaiming(true);
    setMessage(null);
    try {
      const res = await fetch(`${API}/api/users/profile/slug`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ slug: value }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMessage({ severity: "success", text: currentSlug ? "URL updated — your old link keeps working as an alias." : "URL claimed!" });
        setCheck(null);
        if (onClaimed) onClaimed(data.slug || value);
      } else {
        setMessage({ severity: "error", text: data.error || "Could not claim that URL" });
      }
    } catch (err) {
      setMessage({ severity: "error", text: "Network error — try again" });
    } finally {
      setClaiming(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`https://www.ohack.dev/u/${currentSlug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      /* no-op */
    }
  };

  const dirty = value && value !== currentSlug;
  const canClaim = dirty && !checking && check?.available;

  let helper = "3–30 characters: lowercase letters, numbers, hyphens.";
  if (checking) helper = "Checking availability…";
  else if (dirty && check) {
    helper = check.available ? "Available!" : check.reason || "Not available";
  } else if (currentSlug) {
    helper = "Changing your URL keeps the old one working as an alias (once per day).";
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
        <TextField
          label="Your portfolio URL"
          value={value}
          onChange={handleChange}
          size="small"
          sx={{ minWidth: 300, flex: "1 1 300px" }}
          helperText={helper}
          error={Boolean(dirty && check && !check.available)}
          InputProps={{
            startAdornment: <InputAdornment position="start">ohack.dev/u/</InputAdornment>,
            endAdornment: (
              <InputAdornment position="end">
                {checking ? (
                  <CircularProgress size={16} />
                ) : dirty && check ? (
                  check.available ? (
                    <CheckCircleIcon fontSize="small" color="success" />
                  ) : (
                    <CancelIcon fontSize="small" color="error" />
                  )
                ) : null}
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          onClick={handleClaim}
          disabled={!canClaim || claiming}
          sx={{ mt: 0.25, textTransform: "none", bgcolor: "var(--brand)", "&:hover": { bgcolor: "var(--brand-ink)" } }}
        >
          {claiming ? "Claiming…" : currentSlug ? "Change URL" : "Claim URL"}
        </Button>
      </div>

      {message && (
        <p style={{ margin: "10px 0 0", fontSize: "0.88rem", color: message.severity === "error" ? "#b3261e" : "#2e7d32" }}>
          {message.text}
        </p>
      )}

      {currentSlug && !dirty && (
        <p className="ohx-muted" style={{ margin: "10px 0 0", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 4 }}>
          Your portfolio lives at{" "}
          <a className="ohx-link" href={`/u/${currentSlug}`} target="_blank" rel="noopener noreferrer">
            ohack.dev/u/{currentSlug}
          </a>
          <Tooltip title={copied ? "Copied!" : "Copy link"}>
            <IconButton size="small" onClick={handleCopy} aria-label="Copy portfolio link">
              <ContentCopyIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
        </p>
      )}
    </div>
  );
}
