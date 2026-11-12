import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from "@mui/material";
import ExportCsvButton from "../ExportCsvButton";
import { entryCoversPrize, sortedPrizes } from "../../../lib/giveawayApi";

// Search, prize filter and sort here are DISPLAY ONLY. The draw reads the full
// entry list from useAdminGiveaway — never these rows (the old page built the
// draw pool from the filtered table, so typing in the search box removed
// people from the draw).

export const INITIAL_VISIBLE_ROWS = 100;

export function picksLabel(entry, prizesById) {
  if (entry.all_prizes) return "Everything";
  return (entry.prize_ids || []).map((id) => prizesById[id]?.name || "Removed prize").join(", ");
}

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

export default function EntriesTab({ giveaway, entries }) {
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
      </Box>
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
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
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
    </Box>
  );
}

EntriesTab.propTypes = {
  giveaway: PropTypes.object.isRequired,
  entries: PropTypes.arrayOf(PropTypes.object).isRequired,
};
