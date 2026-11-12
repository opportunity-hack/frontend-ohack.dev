import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { DragIndicator as DragIcon, PlayArrow as PlayIcon } from "@mui/icons-material";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useAuthInfo } from "@propelauth/react";
import {
  giveawayErrorMessage,
  resetGiveawayDraw,
  sortedPrizes,
  startGiveawayDraw,
  undoGiveawayResult,
} from "../../../lib/giveawayApi";
import { eligibleForPrize, generateSeed } from "../../../lib/giveawayDraw";
import { trackEvent, EventCategory } from "../../../lib/ga";
import ExportCsvButton from "../ExportCsvButton";
import DrawStage, { winnerRows } from "./DrawStage";

const sectionSx = { p: { xs: 2, md: 3 }, mb: 3, border: "1px solid", borderColor: "divider" };
const orderKey = (id) => `ohack.giveawayDrawOrder.${id}`;

function readOrder(giveawayId, prizes) {
  const ids = prizes.map((p) => p.id);
  try {
    const saved = JSON.parse(window.localStorage.getItem(orderKey(giveawayId)) || "null");
    if (Array.isArray(saved)) {
      const kept = saved.filter((id) => ids.includes(id));
      return [...kept, ...ids.filter((id) => !kept.includes(id))];
    }
  } catch {
    // private window / blocked storage: fall back to sort_order
  }
  return ids;
}

const formatWhen = (iso) => {
  const d = iso ? new Date(iso) : null;
  return d && !Number.isNaN(d.getTime())
    ? d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    : "";
};

const WINNER_COLUMNS = [
  { key: "prize", label: "Prize" },
  { key: "winner", label: "Winner" },
  { key: "email", label: "Email" },
  { key: "profile", label: "Profile" },
];

export default function DrawTab({ giveaway, entries, orgId, onUpdated, onSnack }) {
  const { accessToken } = useAuthInfo();
  const prizes = useMemo(() => sortedPrizes(giveaway), [giveaway]);
  const prizesById = useMemo(() => Object.fromEntries(prizes.map((p) => [p.id, p])), [prizes]);
  const byId = useMemo(() => Object.fromEntries((entries || []).map((e) => [e.user_id, e])), [entries]);
  const draw = giveaway.draw || null;
  const started = Boolean(draw?.seed);
  const results = useMemo(() => draw?.results || [], [draw]);

  const [order, setOrder] = useState(() => prizes.map((p) => p.id));
  useEffect(() => {
    setOrder(readOrder(giveaway.id, prizes));
  }, [giveaway.id, prizes]);
  const [seed, setSeed] = useState(draw?.seed || "");
  useEffect(() => {
    if (draw?.seed) setSeed(draw.seed);
  }, [draw?.seed]);

  const [stageOpen, setStageOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const [resetText, setResetText] = useState("");
  const [undoingId, setUndoingId] = useState(null);

  const opts = { token: accessToken, orgId };
  const slots = prizes.reduce((n, p) => n + (Number(p.quantity) || 1), 0);
  const people = (entries || []).filter((e) => Number(e.entries) > 0);
  const totalEntries = people.reduce((n, e) => n + Number(e.entries), 0);
  const wonCount = results.filter((r) => r.outcome === "won").length;
  const rows = useMemo(() => winnerRows(order, prizesById, results, byId), [order, prizesById, results, byId]);

  const saveOrder = (next) => {
    setOrder(next);
    try {
      window.localStorage.setItem(orderKey(giveaway.id), JSON.stringify(next));
    } catch {
      // per-viewer convenience only
    }
  };

  const onDragEnd = (r) => {
    if (!r.destination) return;
    const next = [...order];
    const [moved] = next.splice(r.source.index, 1);
    next.splice(r.destination.index, 0, moved);
    saveOrder(next);
  };

  const start = async () => {
    setBusy(true);
    setError("");
    try {
      const updated = await startGiveawayDraw(giveaway.id, seed.trim(), opts);
      onUpdated(updated);
      trackEvent({
        action: "admin_giveaway_draw_start",
        params: { event_category: EventCategory.ADMIN, event_label: giveaway.id, value: people.length },
      });
      setStageOpen(true);
    } catch (err) {
      setError(giveawayErrorMessage(err, "Couldn't start the draw."));
    } finally {
      setBusy(false);
    }
  };

  const undo = async (resultId) => {
    setUndoingId(resultId);
    setError("");
    try {
      onUpdated(await undoGiveawayResult(giveaway.id, resultId, opts));
      onSnack?.("Result removed.");
    } catch (err) {
      setError(giveawayErrorMessage(err, "Couldn't undo that result."));
    } finally {
      setUndoingId(null);
    }
  };

  const reset = async () => {
    setBusy(true);
    setError("");
    try {
      onUpdated(await resetGiveawayDraw(giveaway.id, opts));
      setResetOpen(false);
      setResetText("");
      onSnack?.("Draw reset. Pick a seed and start again.");
    } catch (err) {
      setError(giveawayErrorMessage(err, "Couldn't reset the draw."));
    } finally {
      setBusy(false);
    }
  };

  if (prizes.length === 0) {
    return <Alert severity="info">Add at least one prize on the Setup tab to run a draw.</Alert>;
  }

  const enteredFor = (id) => eligibleForPrize(entries, id).length;
  const zeroPrizes = order.filter((id) => enteredFor(id) === 0);
  const seedValid = seed.trim().length > 0 && seed.trim().length <= 64;
  const isDraft = giveaway.status === "draft";

  let statusLine;
  if (giveaway.status === "open") statusLine = { severity: "warning", text: "Entries are still open. Starting the draw closes them." };
  else if (isDraft) statusLine = { severity: "error", text: "This giveaway is still a draft. Open it (Setup tab) so people can enter before you draw." };
  else if (giveaway.status === "drawn") statusLine = { severity: "success", text: "This giveaway has been drawn." };
  else statusLine = { severity: "success", text: "Entries are closed." };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Paper sx={sectionSx} elevation={0}>
        <Typography variant="h6" sx={{ mb: 1.5 }}>Before the show</Typography>
        <Alert severity={statusLine.severity} sx={{ mb: 2 }}>{statusLine.text}</Alert>
        <Typography sx={{ mb: 2 }}>
          <strong>{prizes.length}</strong> {prizes.length === 1 ? "prize" : "prizes"} · <strong>{slots}</strong>{" "}
          {slots === 1 ? "winner" : "winners"} to pick · <strong>{people.length}</strong> people ·{" "}
          <strong>{totalEntries.toLocaleString()}</strong> entries
          {started ? ` · ${wonCount} of ${slots} awarded so far` : ""}
        </Typography>
        {zeroPrizes.length > 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            No one entered for {zeroPrizes.map((id) => prizesById[id]?.name).join(", ")}. The stage will offer to skip{" "}
            {zeroPrizes.length === 1 ? "it" : "them"}.
          </Alert>
        )}

        <Typography variant="subtitle1" sx={{ mt: 1, mb: 0.5 }}>Draw order for tonight</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Drag to reorder. Ending on the biggest prize keeps the room until the end. Saved on this computer only.
        </Typography>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="giveaway-draw-order">
            {(provided) => (
              <Box {...provided.droppableProps} ref={provided.innerRef} sx={{ mb: 2 }}>
                {order.map((id, index) => {
                  const prize = prizesById[id];
                  const quantity = Number(prize?.quantity) || 1;
                  return (
                    <Draggable key={id} draggableId={id} index={index}>
                      {(p) => (
                        <Paper
                          ref={p.innerRef}
                          {...p.draggableProps}
                          variant="outlined"
                          sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 1.5, py: 1, mb: 1 }}
                        >
                          <Box {...p.dragHandleProps} sx={{ display: "flex", color: "text.secondary" }} aria-label="Drag to reorder">
                            <DragIcon />
                          </Box>
                          <Typography sx={{ width: 28, color: "text.secondary" }}>{index + 1}.</Typography>
                          <Typography sx={{ flex: 1 }}>
                            {prize?.name}
                            {quantity > 1 ? ` ×${quantity}` : ""}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {enteredFor(id)} entered
                          </Typography>
                        </Paper>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </DragDropContext>

        <Typography variant="subtitle1" sx={{ mb: 0.5 }}>Seed</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Read it out loud before the first prize. The same seed and the same entries always give the same winners.
        </Typography>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", flexWrap: "wrap", mb: 2 }}>
          <TextField
            size="small"
            label="Seed"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            disabled={started}
            error={Boolean(seed) && !seedValid}
            helperText={started ? "Locked while this draw is in progress." : "6 digits is easy to read aloud."}
            sx={{ width: 220 }}
          />
          {!started && (
            <Button onClick={() => setSeed(generateSeed())} sx={{ mt: 0.25 }}>
              Generate
            </Button>
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          {started ? (
            <Button variant="contained" size="large" startIcon={<PlayIcon />} onClick={() => setStageOpen(true)}>
              {giveaway.status === "drawn" ? "Show the winners" : "Resume the draw"}
            </Button>
          ) : (
            <Button
              variant="contained"
              size="large"
              startIcon={<PlayIcon />}
              onClick={start}
              disabled={busy || !seedValid || isDraft || people.length === 0}
            >
              {busy ? "Starting…" : "Start the draw"}
            </Button>
          )}
          {started && (
            <Button color="error" onClick={() => setResetOpen(true)} disabled={busy}>
              Reset draw…
            </Button>
          )}
        </Box>
      </Paper>

      {started && results.length > 0 && (
        <Paper sx={sectionSx} elevation={0}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1.5, gap: 2, flexWrap: "wrap" }}>
            <Typography variant="h6" sx={{ flex: 1 }}>Results so far</Typography>
            <ExportCsvButton
              rows={rows.filter((r) => r.winner)}
              columns={WINNER_COLUMNS}
              filenameParts={["giveaway-winners", giveaway.id]}
              table="giveaway_winners"
              label="Winners CSV"
            />
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Prize</TableCell>
                  <TableCell>Person</TableCell>
                  <TableCell>Outcome</TableCell>
                  <TableCell>When</TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((r) => {
                  const prize = prizesById[r.prize_id];
                  const quantity = Number(prize?.quantity) || 1;
                  return (
                    <TableRow key={r.id}>
                      <TableCell>
                        {prize?.name || "Removed prize"}
                        {quantity > 1 ? ` (${Number(r.slot) + 1} of ${quantity})` : ""}
                      </TableCell>
                      <TableCell>
                        <a href={`/profile/${r.user_id}`} target="_blank" rel="noopener noreferrer">
                          {r.name || r.user_id}
                        </a>
                      </TableCell>
                      <TableCell>{r.outcome === "won" ? "Won" : "Not here"}</TableCell>
                      <TableCell>{formatWhen(r.at)}</TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => undo(r.id)} disabled={undoingId === r.id}>
                          {undoingId === r.id ? "Undoing…" : "Undo"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Dialog open={resetOpen} onClose={busy ? undefined : () => setResetOpen(false)}>
        <DialogTitle>Reset this draw?</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            This clears the seed and every recorded result ({wonCount} {wonCount === 1 ? "winner" : "winners"}). Entries
            stay locked. Nobody is notified.
          </Typography>
          <TextField
            fullWidth
            size="small"
            label='Type "RESET" to confirm'
            value={resetText}
            onChange={(e) => setResetText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetOpen(false)} disabled={busy}>Cancel</Button>
          <Button color="error" variant="contained" onClick={reset} disabled={busy || resetText !== "RESET"}>
            Reset draw
          </Button>
        </DialogActions>
      </Dialog>

      {stageOpen && (
        <DrawStage
          giveaway={giveaway}
          entries={entries}
          drawOrder={order}
          orgId={orgId}
          onUpdated={onUpdated}
          onClose={() => setStageOpen(false)}
        />
      )}
    </Box>
  );
}

DrawTab.propTypes = {
  giveaway: PropTypes.object.isRequired,
  entries: PropTypes.arrayOf(PropTypes.object).isRequired,
  orgId: PropTypes.string,
  onUpdated: PropTypes.func.isRequired,
  onSnack: PropTypes.func,
};
