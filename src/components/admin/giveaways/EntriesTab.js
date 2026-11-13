import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { DeleteOutline as DeleteIcon } from "@mui/icons-material";
import { useAuthInfo } from "@propelauth/react";
import ExportCsvButton from "../ExportCsvButton";
import {
  entryCoversPrize,
  giveawayErrorMessage,
  removeGiveawayEntries,
  sortedPrizes,
} from "../../../lib/giveawayApi";

// Search, prize filter and sort here are DISPLAY ONLY. The draw reads the full
// entry list from useAdminGiveaway — never these rows (the old page built the
// draw pool from the filtered table, so typing in the search box removed
// people from the draw).

export const INITIAL_VISIBLE_ROWS = 100;

export function picksLabel(entry, prizesById) {
  if (entry.all_prizes) return "Everything";
  return (entry.prize_ids || []).map((id) => prizesById[id]?.name || "Removed prize").join(", ");
}

/** The entry's Firestore doc id (the admin list sends it as `id`). */
export const entryDocId = (entry, giveawayId) => entry.id || `${giveawayId}__${entry.user_id}`;

export function filterEntries(entries, { query, prizeId }) {
  const q = (query || "").trim().toLowerCase();
  return (entries || []).filter((e) => {
    if (prizeId && !entryCoversPrize(e, prizeId)) return false;
    if (!q) return true;
    const u = e.user || {};
    return [u.name, u.nickname, u.github, u.email, e.user_id].some((v) =>
      String(v || "").toLowerCase().includes(q),
    );
  });
}

const SORTERS = {
  name: (e) => (e.user?.name || "").toLowerCase(),
  entries: (e) => Number(e.entries) || 0,
  updated: (e) => e.updated_at || "",
};

const formatWhen = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
};

// Typed confirm for "Remove all" — it can't be undone.
export const REMOVE_ALL_CONFIRM = "REMOVE";

export default function EntriesTab({ giveaway, entries, orgId, onEntriesChanged, onSnack }) {
  const { accessToken } = useAuthInfo();
  // A started draw ranks the list it loaded at Start, and a recorded winner
  // must keep their entry — the backend refuses removals until a reset.
  const drawStarted = Boolean(giveaway.draw?.seed);
  const accepting = giveaway.accepting_entries ?? giveaway.status === "open";
  // `null` | {kind: "one", entry} | {kind: "all"}
  const [removing, setRemoving] = useState(null);
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);
  const [removeError, setRemoveError] = useState("");
  const prizes = useMemo(() => sortedPrizes(giveaway), [giveaway]);
  const prizesById = useMemo(() => Object.fromEntries(prizes.map((p) => [p.id, p])), [prizes]);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [prizeId, setPrizeId] = useState(null);
  const [sort, setSort] = useState({ key: "entries", dir: "desc" });
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_ROWS);

  useEffect(() => setVisibleCount(INITIAL_VISIBLE_ROWS), [deferredQuery, prizeId, sort]);

  const totalEntries = useMemo(
    () => (entries || []).reduce((sum, e) => sum + (Number(e.entries) || 0), 0),
    [entries],
  );
  const perPrize = useMemo(
    () => prizes.map((p) => ({ prize: p, count: (entries || []).filter((e) => entryCoversPrize(e, p.id)).length })),
    [prizes, entries],
  );

  const rows = useMemo(() => {
    const filtered = filterEntries(entries, { query: deferredQuery, prizeId });
    const key = SORTERS[sort.key];
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const x = key(a);
      const y = key(b);
      if (x < y) return -dir;
      if (x > y) return dir;
      return String(a.user_id).localeCompare(String(b.user_id));
    });
  }, [entries, deferredQuery, prizeId, sort]);

  const csvColumns = useMemo(
    () => [
      { key: "name", label: "Name", get: (e) => e.user?.name || "" },
      { key: "email", label: "Email", get: (e) => e.user?.email || "" },
      { key: "github", label: "GitHub", get: (e) => e.user?.github || "" },
      { key: "entries", label: "Entries" },
      { key: "profile_entries", label: "Profile entries", get: (e) => e.breakdown?.profile_entries ?? "" },
      { key: "github_entries", label: "GitHub entries", get: (e) => e.breakdown?.github_entries ?? "" },
      { key: "picks", label: "Picks", get: (e) => picksLabel(e, prizesById) },
      { key: "updated_at", label: "Updated" },
      { key: "profile", label: "Profile", get: (e) => `https://www.ohack.dev/profile/${e.user_id}` },
    ],
    [prizesById],
  );

  const closeRemove = () => {
    if (busy) return;
    setRemoving(null);
    setConfirmText("");
    setRemoveError("");
  };

  const confirmRemove = async () => {
    if (!removing) return;
    setBusy(true);
    setRemoveError("");
    const body =
      removing.kind === "all" ? { all: true } : { entry_ids: [entryDocId(removing.entry, giveaway.id)] };
    try {
      const out = await removeGiveawayEntries(giveaway.id, body, { token: accessToken, orgId });
      onEntriesChanged?.(out?.entries || []);
      const n = out?.removed ?? 0;
      let message = "That entry was already gone.";
      if (removing.kind === "all") message = `Removed ${n} ${n === 1 ? "entry" : "entries"}.`;
      else if (n) message = `Removed ${removing.entry.user?.name || "the"}${removing.entry.user?.name ? "'s" : ""} entry.`;
      onSnack?.(message);
      setRemoving(null);
      setConfirmText("");
    } catch (err) {
      setRemoveError(giveawayErrorMessage(err, "Couldn't remove entries. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const toggleSort = (key) =>
    setSort((s) => ({ key, dir: s.key === key && s.dir === "desc" ? "asc" : "desc" }));

  return (
    <Box>
      <Typography sx={{ mb: 1.5 }}>
        <strong>{(entries || []).length}</strong> {(entries || []).length === 1 ? "person" : "people"} ·{" "}
        <strong>{totalEntries.toLocaleString()}</strong> entries
      </Typography>
      {perPrize.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
          <Chip
            label="All prizes"
            variant={prizeId ? "outlined" : "filled"}
            color={prizeId ? "default" : "primary"}
            onClick={() => setPrizeId(null)}
          />
          {perPrize.map(({ prize, count }) => (
            <Chip
              key={prize.id}
              label={`${prize.name} ${count}`}
              variant={prizeId === prize.id ? "filled" : "outlined"}
              color={prizeId === prize.id ? "primary" : "default"}
              onClick={() => setPrizeId(prizeId === prize.id ? null : prize.id)}
              aria-pressed={prizeId === prize.id}
            />
          ))}
        </Box>
      )}
      <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2, flexWrap: "wrap" }}>
        <TextField
          size="small"
          label="Search name, GitHub or email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ flex: 1, minWidth: 240 }}
        />
        <ExportCsvButton
          rows={rows}
          columns={csvColumns}
          filenameParts={["giveaway-entries", giveaway.id]}
          table="giveaway_entries"
        />
        {onEntriesChanged && (
          <Button
            color="error"
            variant="outlined"
            onClick={() => setRemoving({ kind: "all" })}
            disabled={drawStarted || (entries || []).length === 0}
          >
            Remove all entries…
          </Button>
        )}
      </Box>
      {drawStarted && onEntriesChanged && (
        <Alert severity="info" sx={{ mb: 2 }}>
          The draw has started, so entries can&apos;t be removed. Reset the draw on the Draw tab first.
        </Alert>
      )}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Search and filters only change this table — the draw always uses every entry.
      </Typography>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel active={sort.key === "name"} direction={sort.key === "name" ? sort.dir : "asc"} onClick={() => toggleSort("name")}>
                  Person
                </TableSortLabel>
              </TableCell>
              <TableCell>GitHub</TableCell>
              <TableCell align="right">
                <TableSortLabel active={sort.key === "entries"} direction={sort.key === "entries" ? sort.dir : "desc"} onClick={() => toggleSort("entries")}>
                  Entries
                </TableSortLabel>
              </TableCell>
              <TableCell>Picks</TableCell>
              <TableCell>
                <TableSortLabel active={sort.key === "updated"} direction={sort.key === "updated" ? sort.dir : "desc"} onClick={() => toggleSort("updated")}>
                  Updated
                </TableSortLabel>
              </TableCell>
              {onEntriesChanged && (
                <TableCell align="right">
                  <Box component="span" sx={visuallyHidden}>Actions</Box>
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.slice(0, visibleCount).map((e) => (
              <TableRow key={e.user_id} hover>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar src={e.user?.profile_image || undefined} alt="" sx={{ width: 32, height: 32 }}>
                      {(e.user?.name || "?").charAt(0)}
                    </Avatar>
                    <a href={`/profile/${e.user_id}`} target="_blank" rel="noopener noreferrer">
                      {e.user?.name || e.user_id}
                    </a>
                  </Box>
                </TableCell>
                <TableCell>
                  {e.user?.github ? (
                    <a href={`https://github.com/${e.user.github}`} target="_blank" rel="noopener noreferrer">
                      {e.user.github}
                    </a>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell align="right">
                  <Typography component="span" sx={{ fontWeight: 600 }}>{e.entries}</Typography>
                  <Typography component="span" variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    {e.breakdown?.profile_entries ?? 0} profile · {e.breakdown?.github_entries ?? 0} GitHub
                  </Typography>
                </TableCell>
                <TableCell sx={{ maxWidth: 320 }}>{picksLabel(e, prizesById)}</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{formatWhen(e.updated_at)}</TableCell>
                {onEntriesChanged && (
                  <TableCell align="right" sx={{ width: 56 }}>
                    <Tooltip title={drawStarted ? "Reset the draw to remove entries" : "Remove entry"}>
                      <span>
                        <IconButton
                          size="small"
                          aria-label={`Remove ${e.user?.name || e.user_id}'s entry`}
                          onClick={() => setRemoving({ kind: "one", entry: e })}
                          disabled={drawStarted}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={onEntriesChanged ? 6 : 5}>
                  <Typography color="text.secondary" sx={{ py: 2 }}>
                    {(entries || []).length === 0 ? "No one has entered yet." : "No entries match."}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {rows.length > visibleCount && (
        <Box sx={{ display: "flex", gap: 1, justifyContent: "center", mt: 2 }}>
          <Button onClick={() => setVisibleCount((n) => n + INITIAL_VISIBLE_ROWS)}>
            Show {Math.min(INITIAL_VISIBLE_ROWS, rows.length - visibleCount)} more
          </Button>
          <Button onClick={() => setVisibleCount(rows.length)}>Show all {rows.length}</Button>
        </Box>
      )}

      <Dialog open={Boolean(removing)} onClose={closeRemove} maxWidth="xs" fullWidth>
        <DialogTitle>
          {removing?.kind === "all"
            ? `Remove all ${(entries || []).length} entries?`
            : `Remove ${removing?.entry?.user?.name || "this person"}'s entry?`}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: removing?.kind === "all" ? 2 : 0 }}>
            {removing?.kind === "all"
              ? "Everyone is taken out of this giveaway's draw."
              : "They're taken out of this giveaway's draw."}{" "}
            Nobody is notified.{" "}
            {accepting
              ? "Entries are still open, so people can enter again from their profile."
              : "Entries are closed, so they can't enter again."}
          </Typography>
          {removing?.kind === "all" && (
            <TextField
              fullWidth
              size="small"
              label={`Type "${REMOVE_ALL_CONFIRM}" to confirm`}
              value={confirmText}
              onChange={(ev) => setConfirmText(ev.target.value)}
            />
          )}
          {removeError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {removeError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRemove} disabled={busy}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={confirmRemove}
            disabled={busy || (removing?.kind === "all" && confirmText !== REMOVE_ALL_CONFIRM)}
          >
            {removing?.kind === "all" ? "Remove all" : "Remove entry"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

EntriesTab.propTypes = {
  giveaway: PropTypes.object.isRequired,
  entries: PropTypes.arrayOf(PropTypes.object).isRequired,
  orgId: PropTypes.string,
  /** Receives the fresh entry list after a removal; omit for a read-only table. */
  onEntriesChanged: PropTypes.func,
  onSnack: PropTypes.func,
};
