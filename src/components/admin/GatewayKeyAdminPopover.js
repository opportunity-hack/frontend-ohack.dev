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
 * `missing` = approval's best-effort mint failed — the admin fix is
 * "Provision". Statuses come from the batch endpoint's `keys` array:
 * entry 0 is Key 1, entry 1 is Key 2.
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
  return entry?.keys?.[0]?.status || "missing";
}

/** Key 1 / Key 2 entry from a batch status record, or null when absent. */
function keyEntry(status, index) {
  return status?.keys?.[index] || null;
}

/** A copy of the status record's keys with one entry's fields replaced. */
function withKeyPatched(status, index, patch) {
  const keys = [...(status?.keys || [])];
  keys[index] = { ...(keys[index] || {}), ...patch };
  return { keys };
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
  const [busy, setBusy] = useState(null); // "reveal" | "rotate" | "rotate_key2" | "provision"
  const [revealed, setRevealed] = useState(null); // { key, spend }
  const [showKey, setShowKey] = useState(false);
  const [confirmRotate, setConfirmRotate] = useState(null); // null | "key1" | "key2"
  const [notice, setNotice] = useState(null); // { severity, text }

  const key1 = keyEntry(status, 0);
  const key2 = keyEntry(status, 1);
  const state = key1?.status || "missing";
  const chip = GATEWAY_STATUS_CHIP[state] || GATEWAY_STATUS_CHIP.missing;
  const key2State = key2?.status || "missing";
  const key2Chip =
    GATEWAY_STATUS_CHIP[key2State] || GATEWAY_STATUS_CHIP.missing;

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
    const key1Data = data?.keys?.[0];
    if (key1Data?.key) {
      setRevealed({ key: key1Data.key, spend: key1Data.spend });
      setShowKey(true);
    }
  };

  const handleProvision = async () => {
    const data = await run(
      "provision",
      () => api.provision(team.id),
      "Keys minted. The team sees them on their dashboard now.",
    );
    if (data?.keys) {
      setRevealed(null);
      onStatusChange?.(team.id, { keys: data.keys });
    }
  };

  // Key 2 only: Key 1 is already active, so only Key 2 is minted.
  const handleProvisionKey2 = async () => {
    const data = await run(
      "provision",
      () => api.provision(team.id),
      "Key 2 minted. The team sees it on their dashboard now.",
    );
    if (data?.keys) {
      onStatusChange?.(team.id, { keys: data.keys });
    }
  };

  const handleRotate = async (keyLabel) => {
    setConfirmRotate(null);
    const isKey2 = keyLabel === "key2";
    const data = await run(
      isKey2 ? "rotate_key2" : "rotate",
      () => api.rotate(team.id, keyLabel),
      isKey2
        ? "Key 2 rotated. The old Key 2 stopped working immediately; the team must copy the new one from their dashboard."
        : "Rotated. The old key stopped working immediately; the team must copy the new one from their dashboard.",
    );
    setRevealed(null);
    setShowKey(false);
    if (data?.keys) {
      onStatusChange?.(team.id, { keys: data.keys });
    } else {
      // The backend marks only the failed key missing, so downgrade just
      // that entry until Provision succeeds.
      onStatusChange?.(
        team.id,
        withKeyPatched(status, isKey2 ? 1 : 0, { status: "missing" }),
      );
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
          {key1?.key_alias ? (
            <>
              Alias <code>{key1.key_alias}</code>
              {key1.max_budget != null && <> · ${key1.max_budget} lifetime budget</>}
              {key1.expires && <> · expires {formatWhen(key1.expires)}</>}
            </>
          ) : (
            "No key record for this team."
          )}
        </Typography>
        {(key1?.provisioned_at || key1?.rotated_at) && (
          <Typography variant="caption" color="text.secondary" component="div" sx={{ mb: 1 }}>
            {key1.provisioned_at && <>Provisioned {formatWhen(key1.provisioned_at)}</>}
            {key1.rotated_at && <> · Rotated {formatWhen(key1.rotated_at)}</>}
          </Typography>
        )}

        <Box sx={{ mb: 1.5, borderTop: "1px solid var(--border, #e0e0e0)", pt: 1.5 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Typography variant="subtitle2" sx={{ flex: 1 }}>
              Key 2 - $20 frontier
            </Typography>
            <Chip size="small" label={key2Chip.label} color={key2Chip.color} variant="outlined" />
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {key2?.key_alias ? (
              <>
                Alias <code>{key2.key_alias}</code>
                {key2.max_budget != null && <> · ${key2.max_budget} lifetime budget</>}
              </>
            ) : key2State === "missing" ? (
              "Key 2 has not been minted for this team yet."
            ) : (
              "No Key 2 record for this team."
            )}
          </Typography>
          {key2State === "missing" && state === "active" && (
            <Button
              size="small"
              variant="contained"
              onClick={handleProvisionKey2}
              disabled={busy !== null}
              startIcon={busy === "provision" ? <CircularProgress size={12} color="inherit" /> : <FaKey />}
              sx={{ mb: 1 }}
            >
              Provision Key 2
            </Button>
          )}
          {key2State === "active" && confirmRotate !== "key2" && (
            <Tooltip title="Rotating kills the old Key 2 instantly and mints a new one. Key 1 is untouched.">
              <span>
                <Button
                  size="small"
                  color="warning"
                  variant="outlined"
                  onClick={() => setConfirmRotate("key2")}
                  disabled={busy !== null}
                  startIcon={<FaSyncAlt />}
                >
                  Rotate Key 2
                </Button>
              </span>
            </Tooltip>
          )}
          {key2State === "active" && confirmRotate === "key2" && (
            <Alert
              severity="warning"
              sx={{ width: "100%", mt: 1 }}
              action={
                <Stack direction="row" spacing={1}>
                  <Button size="small" onClick={() => setConfirmRotate(null)}>Cancel</Button>
                  <Button
                    size="small"
                    color="warning"
                    variant="contained"
                    onClick={() => handleRotate("key2")}
                    disabled={busy !== null}
                  >
                    {busy === "rotate_key2" ? "Rotating…" : "Yes, rotate Key 2"}
                  </Button>
                </Stack>
              }
            >
              The current Key 2 stops working the moment you confirm. Key 1 keeps working.
            </Alert>
          )}
        </Box>

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
          {state === "active" && confirmRotate !== "key1" && (
            <Tooltip title="Leaked or shared somewhere it shouldn't be? Rotating kills the old key instantly and mints a new one.">
              <span>
                <Button
                  size="small"
                  color="warning"
                  variant="outlined"
                  onClick={() => setConfirmRotate("key1")}
                  disabled={busy !== null}
                  startIcon={<FaSyncAlt />}
                >
                  Rotate key
                </Button>
              </span>
            </Tooltip>
          )}
          {state === "active" && confirmRotate === "key1" && (
            <Alert
              severity="warning"
              sx={{ width: "100%" }}
              action={
                <Stack direction="row" spacing={1}>
                  <Button size="small" onClick={() => setConfirmRotate(null)}>Cancel</Button>
                  <Button
                    size="small"
                    color="warning"
                    variant="contained"
                    onClick={() => handleRotate("key1")}
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
