import React, { useState } from "react";
import {
  Popover,
  Box,
  Button,
  Chip,
  Stack,
  Typography,
  Alert,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { FaKey, FaSyncAlt, FaEye, FaEyeSlash, FaCopy } from "react-icons/fa";

/**
 * Status chip config shared by the Teams table column and this popover.
 * `missing` = approval's best-effort mint failed (or the team predates the
 * feature) — the admin fix is "Provision". There is no persisted error state
 * on the backend: a failed mint deletes the doc, so missing IS the error.
 */
export const GATEWAY_STATUS_CHIP = {
  active: { label: "Active", color: "success" },
  pending: { label: "Minting…", color: "warning" },
  missing: { label: "No key", color: "warning" },
};

export function gatewayStatusFor(team, statuses) {
  if (!team) return null;
  if ((team.status || "IN_REVIEW") === "IN_REVIEW") return "not_approved";
  const entry = statuses?.[team.id];
  return entry?.status || "missing";
}

function formatWhen(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function copyText(text) {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => {});
  }
}

/**
 * Admin actions on one team's AI gateway key. Everything the admin does
 * reports inline (Alert) — the embedded Teams section has no snackbar
 * provider, so notistack calls there are swallowed.
 *
 * `api`: { reveal(teamId), rotate(teamId), provision(teamId) } → promises.
 * `onStatusChange(teamId, patch)` lets the host merge the new metadata into
 * its statuses map (ONE setState, no refetch).
 * Mount with `key={team?.id}` so local state resets when the team changes.
 */
export default function GatewayKeyAdminPopover({
  open,
  anchorEl,
  onClose,
  team,
  status, // entry from the statuses map, may be undefined
  api,
  onStatusChange,
}) {
  const [busy, setBusy] = useState(null); // "reveal" | "rotate" | "provision"
  const [revealed, setRevealed] = useState(null); // { key, spend }
  const [showKey, setShowKey] = useState(false);
  const [confirmRotate, setConfirmRotate] = useState(false);
  const [notice, setNotice] = useState(null); // { severity, text }

  const state = status?.status || "missing";
  const chip = GATEWAY_STATUS_CHIP[state] || GATEWAY_STATUS_CHIP.missing;

  const run = async (kind, fn, okText) => {
    setBusy(kind);
    setNotice(null);
    try {
      const data = await fn();
      if (okText) setNotice({ severity: "success", text: okText });
      return data;
    } catch (err) {
      setNotice({ severity: "error", text: err?.message || "Request failed" });
      return null;
    } finally {
      setBusy(null);
    }
  };

  const handleReveal = async () => {
    const data = await run("reveal", () => api.reveal(team.id));
    if (data?.key) {
      setRevealed({ key: data.key, spend: data.spend });
      setShowKey(true);
    }
  };

  const handleProvision = async () => {
    const data = await run(
      "provision",
      () => api.provision(team.id),
      "Key minted. The team sees it on their dashboard now.",
    );
    if (data) {
      setRevealed(null);
      onStatusChange?.(team.id, {
        status: "active",
        key_alias: data.key_alias,
        max_budget: data.max_budget,
        expires: data.expires,
        provisioned_at: new Date().toISOString(),
      });
    }
  };

  const handleRotate = async () => {
    setConfirmRotate(false);
    const data = await run(
      "rotate",
      () => api.rotate(team.id),
      "Rotated. The old key stopped working immediately; the team must copy the new one from their dashboard.",
    );
    setRevealed(null);
    setShowKey(false);
    if (data) {
      onStatusChange?.(team.id, {
        status: "active",
        key_alias: data.key_alias,
        rotated_at: new Date().toISOString(),
      });
    } else {
      // The backend deletes the doc when the re-mint fails after the delete,
      // so the truthful state is now "missing" until Provision succeeds.
      onStatusChange?.(team.id, { status: "missing" });
    }
  };

  if (!team) return null;

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
    >
      <Box sx={{ p: 2, width: 420, maxWidth: "90vw" }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <FaKey />
          <Typography variant="subtitle2" sx={{ flex: 1 }}>
            AI gateway key — {team.name}
          </Typography>
          <Chip size="small" label={chip.label} color={chip.color} variant="outlined" />
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {status?.key_alias ? (
            <>
              Alias <code>{status.key_alias}</code>
              {status.max_budget != null && <> · ${status.max_budget} lifetime budget</>}
              {status.expires && <> · expires {formatWhen(status.expires)}</>}
            </>
          ) : (
            "No key record for this team."
          )}
        </Typography>
        {(status?.provisioned_at || status?.rotated_at) && (
          <Typography variant="caption" color="text.secondary" component="div" sx={{ mb: 1 }}>
            {status.provisioned_at && <>Provisioned {formatWhen(status.provisioned_at)}</>}
            {status.rotated_at && <> · Rotated {formatWhen(status.rotated_at)}</>}
          </Typography>
        )}

        {notice && (
          <Alert severity={notice.severity} sx={{ mb: 1.5 }} onClose={() => setNotice(null)}>
            {notice.text}
          </Alert>
        )}

        {state === "active" && (
          <Box sx={{ mb: 1.5 }}>
            {revealed ? (
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <code style={{ fontSize: "0.8rem", wordBreak: "break-all" }}>
                  {showKey ? revealed.key : "•".repeat(28)}
                </code>
                <Button size="small" onClick={() => setShowKey((v) => !v)} startIcon={showKey ? <FaEyeSlash /> : <FaEye />}>
                  {showKey ? "Hide" : "Show"}
                </Button>
                <Button size="small" onClick={() => copyText(revealed.key)} startIcon={<FaCopy />}>
                  Copy
                </Button>
                {revealed.spend != null && (
                  <Typography variant="caption" color="text.secondary">
                    ${Number(revealed.spend).toFixed(2)} spent
                  </Typography>
                )}
              </Stack>
            ) : (
              <Button
                size="small"
                variant="outlined"
                onClick={handleReveal}
                disabled={busy !== null}
                startIcon={busy === "reveal" ? <CircularProgress size={12} /> : <FaEye />}
              >
                Reveal key
              </Button>
            )}
          </Box>
        )}

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {state !== "active" && (
            <Button
              size="small"
              variant="contained"
              onClick={handleProvision}
              disabled={busy !== null}
              startIcon={busy === "provision" ? <CircularProgress size={12} color="inherit" /> : <FaKey />}
            >
              {state === "pending" ? "Retry mint" : "Provision key"}
            </Button>
          )}
          {state === "active" && !confirmRotate && (
            <Tooltip title="Leaked or shared somewhere it shouldn't be? Rotating kills the old key instantly and mints a new one.">
              <span>
                <Button
                  size="small"
                  color="warning"
                  variant="outlined"
                  onClick={() => setConfirmRotate(true)}
                  disabled={busy !== null}
                  startIcon={<FaSyncAlt />}
                >
                  Rotate key
                </Button>
              </span>
            </Tooltip>
          )}
          {state === "active" && confirmRotate && (
            <Alert
              severity="warning"
              sx={{ width: "100%" }}
              action={
                <Stack direction="row" spacing={1}>
                  <Button size="small" onClick={() => setConfirmRotate(false)}>Cancel</Button>
                  <Button
                    size="small"
                    color="warning"
                    variant="contained"
                    onClick={handleRotate}
                    disabled={busy !== null}
                  >
                    {busy === "rotate" ? "Rotating…" : "Yes, rotate"}
                  </Button>
                </Stack>
              }
            >
              The current key stops working the moment you confirm. Anything the team has running on it will fail until they copy the new key from their dashboard.
            </Alert>
          )}
          <Box sx={{ flex: 1 }} />
          <Button size="small" onClick={onClose}>Close</Button>
        </Stack>
      </Box>
    </Popover>
  );
}
