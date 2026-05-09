import { useState } from "react";
import {
  Box,
  IconButton,
  InputBase,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Add, Close } from "@mui/icons-material";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import PlanningCard from "./PlanningCard";

export default function PlanningList({
  list,
  cards = [],
  labels = [],
  users = {},
  canWrite,
  onCardClick,
  onCreateCard,
}) {
  const [addingCard, setAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");

  const { setNodeRef, isOver } = useDroppable({ id: list.id });

  const handleAddCard = async () => {
    const title = newCardTitle.trim();
    if (!title) return;
    await onCreateCard(list.id, title);
    setNewCardTitle("");
    setAddingCard(false);
  };

  return (
    <Paper
      elevation={1}
      sx={{
        bgcolor: (theme) =>
          theme.palette.mode === "dark" ? "#2a2f38" : "#ebecf0",
        color: "text.primary",
        borderRadius: 2,
        p: 1,
        minWidth: 272,
        maxWidth: 272,
        display: "flex",
        flexDirection: "column",
        maxHeight: "100%",
        outline: isOver ? "2px solid" : "none",
        outlineColor: "primary.main",
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, px: 0.5 }}>
        {list.title}
        <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
          {cards.length}
        </Typography>
      </Typography>

      <Box ref={setNodeRef} sx={{ flex: 1, overflowY: "auto", pb: 1 }}>
        <SortableContext
          items={cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((card) => (
            <PlanningCard
              key={card.id}
              card={card}
              labels={labels}
              users={users}
              canWrite={canWrite}
              onClick={onCardClick}
            />
          ))}
        </SortableContext>
      </Box>

      {canWrite && (
        <>
          {addingCard ? (
            <Box>
              <InputBase
                autoFocus
                multiline
                fullWidth
                placeholder="Card title…"
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddCard();
                  }
                  if (e.key === "Escape") setAddingCard(false);
                }}
                sx={{
                  bgcolor: "background.paper",
                  color: "text.primary",
                  borderRadius: 1,
                  p: 1,
                  mb: 0.5,
                  border: "1px solid",
                  borderColor: "primary.main",
                  fontSize: "0.875rem",
                }}
              />
              <Stack direction="row" spacing={1}>
                <IconButton size="small" onClick={handleAddCard} color="primary">
                  <Add />
                </IconButton>
                <IconButton size="small" onClick={() => setAddingCard(false)}>
                  <Close />
                </IconButton>
              </Stack>
            </Box>
          ) : (
            <Box
              onClick={() => setAddingCard(true)}
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                color: "text.secondary",
                "&:hover": { color: "text.primary" },
                p: 0.5,
                borderRadius: 1,
              }}
            >
              <Add fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="caption">Add a card</Typography>
            </Box>
          )}
        </>
      )}
    </Paper>
  );
}
