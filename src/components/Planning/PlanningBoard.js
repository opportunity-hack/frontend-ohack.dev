import { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputBase,
  Stack,
  Typography,
} from "@mui/material";
import { Add, Close } from "@mui/icons-material";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import PlanningList from "./PlanningList";
import PlanningCard from "./PlanningCard";

// LexoRank-style: place a card between two existing positions
function positionBetween(before, after) {
  if (!before && !after) return "p0500";
  if (!before) return `p${(parseInt(after.slice(1)) / 2).toFixed(0).padStart(4, "0")}`;
  if (!after) return `p${(parseInt(before.slice(1)) + 1000).toFixed(0).padStart(4, "0")}`;
  const mid = Math.round((parseInt(before.slice(1)) + parseInt(after.slice(1))) / 2);
  return `p${mid.toFixed(0).padStart(4, "0")}`;
}

export default function PlanningBoard({
  board,
  canWrite,
  onCardClick,
  createCard,
  updateCard,
  moveCard,
  createList,
}) {
  const [activeCard, setActiveCard] = useState(null);
  const [addingList, setAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  if (!board) return <CircularProgress />;

  const { lists = [], cards = [], labels = [], users = {} } = board;

  const sortedLists = [...lists].sort((a, b) =>
    (a.position || "").localeCompare(b.position || "")
  );

  function cardsForList(listId) {
    return cards
      .filter((c) => c.list_id === listId && !c.archived)
      .sort((a, b) => (a.position || "").localeCompare(b.position || ""));
  }

  function handleDragStart(event) {
    const card = cards.find((c) => c.id === event.active.id);
    setActiveCard(card || null);
  }

  function handleDragEnd(event) {
    setActiveCard(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Determine target list: over.id is either a card or a list
    const overCard = cards.find((c) => c.id === over.id);
    const targetListId = overCard ? overCard.list_id : over.id;
    const sourceCard = cards.find((c) => c.id === active.id);
    if (!sourceCard) return;

    const targetCards = cardsForList(targetListId);
    const overIndex = targetCards.findIndex((c) => c.id === over.id);
    const prevCard = targetCards[overIndex - 1];
    const nextCard = targetCards[overIndex];
    const newPosition = positionBetween(prevCard?.position, nextCard?.position);

    moveCard(active.id, targetListId, newPosition, sourceCard.updated_at);
  }

  async function handleAddList() {
    const title = newListTitle.trim();
    if (!title) return;
    await createList(title);
    setNewListTitle("");
    setAddingList(false);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Box
        sx={{
          // Edge-to-edge horizontal scroll. Padding lives INSIDE the scroll
          // container so first/last lists have breathing room without
          // truncating the scroll surface (Trello pattern).
          height: "100%",
          display: "flex",
          flexDirection: "row",
          gap: 1.5,
          overflowX: "auto",
          overflowY: "hidden",
          px: 2,
          pb: 1.5,
          pt: 1,
          alignItems: "flex-start",
          // Visible custom scrollbar — prevents "looks like nothing scrolls"
          "&::-webkit-scrollbar": { height: 12 },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.25)"
                : "rgba(255,255,255,0.4)",
            borderRadius: 6,
            "&:hover": {
              bgcolor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.4)"
                  : "rgba(255,255,255,0.6)",
            },
          },
          "&::-webkit-scrollbar-track": { bgcolor: "rgba(0,0,0,0.15)" },
        }}
      >
        {sortedLists.map((list) => (
          <PlanningList
            key={list.id}
            list={list}
            cards={cardsForList(list.id)}
            labels={labels}
            users={users}
            canWrite={canWrite}
            onCardClick={onCardClick}
            onCreateCard={createCard}
          />
        ))}

        {canWrite && (
          <Box sx={{ minWidth: 272 }}>
            {addingList ? (
              <Box
                sx={{
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark" ? "#2a2f38" : "#ebecf0",
                  borderRadius: 2,
                  p: 1,
                }}
              >
                <InputBase
                  autoFocus
                  fullWidth
                  placeholder="List title…"
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddList();
                    if (e.key === "Escape") setAddingList(false);
                  }}
                  sx={{
                    bgcolor: "background.paper",
                    color: "text.primary",
                    borderRadius: 1,
                    p: 1,
                    mb: 0.5,
                    border: "1px solid",
                    borderColor: "primary.main",
                  }}
                />
                <Stack direction="row" spacing={1}>
                  <Button size="small" variant="contained" onClick={handleAddList}>
                    Add list
                  </Button>
                  <IconButton size="small" onClick={() => setAddingList(false)}>
                    <Close />
                  </IconButton>
                </Stack>
              </Box>
            ) : (
              <Box
                onClick={() => setAddingList(true)}
                sx={{
                  bgcolor: "rgba(255,255,255,0.24)",
                  borderRadius: 2,
                  p: 1.5,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.4)" },
                }}
              >
                <Add sx={{ mr: 1 }} />
                <Typography variant="body2">Add a list</Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>

      <DragOverlay>
        {activeCard && (
          <PlanningCard card={activeCard} labels={labels} users={users} canWrite={false} />
        )}
      </DragOverlay>
    </DndContext>
  );
}
