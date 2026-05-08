import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AttachFile,
  CalendarToday,
  CheckBox,
  Comment,
} from "@mui/icons-material";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function DueDateChip({ dueDate }) {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const now = new Date();
  const overdue = due < now;
  return (
    <Chip
      icon={<CalendarToday />}
      label={due.toLocaleDateString()}
      size="small"
      color={overdue ? "error" : "default"}
      sx={{ fontSize: "0.7rem" }}
    />
  );
}

function BudgetChip({ budget }) {
  if (!budget) return null;
  const amount = (budget.amount_cents / 100).toFixed(0);
  const color = budget.state === "paid" ? "success" : budget.state === "committed" ? "warning" : "default";
  return (
    <Chip
      label={`$${amount} · ${budget.bucket} · ${budget.state}`}
      size="small"
      color={color}
      sx={{ fontSize: "0.7rem" }}
    />
  );
}

export default function PlanningCard({ card, labels = [], canWrite, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id, disabled: !canWrite });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const cardLabels = (card.labels || [])
    .map((lid) => labels.find((l) => l.id === lid))
    .filter(Boolean);

  const checklistTotal = (card.checklists || []).reduce(
    (sum, cl) => sum + (cl.items || []).length,
    0
  );
  const checklistDone = (card.checklists || []).reduce(
    (sum, cl) => sum + (cl.items || []).filter((i) => i.done).length,
    0
  );

  return (
    <Box ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        variant="outlined"
        onClick={() => onClick && onClick(card)}
        sx={{
          mb: 1,
          cursor: canWrite ? "grab" : "pointer",
          "&:hover": { boxShadow: 2 },
        }}
      >
        {cardLabels.length > 0 && (
          <Box sx={{ display: "flex", gap: 0.5, p: 0.5, flexWrap: "wrap" }}>
            {cardLabels.map((label) => (
              <Box
                key={label.id}
                sx={{
                  width: 32,
                  height: 8,
                  borderRadius: 1,
                  bgcolor: label.color,
                }}
              />
            ))}
          </Box>
        )}
        <CardContent sx={{ py: 1, "&:last-child": { pb: 1 } }}>
          <Typography variant="body2" sx={{ mb: 1, wordBreak: "break-word" }}>
            {card.title}
          </Typography>

          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            <DueDateChip dueDate={card.due_date} />
            <BudgetChip budget={card.budget} />

            {checklistTotal > 0 && (
              <Chip
                icon={<CheckBox />}
                label={`${checklistDone}/${checklistTotal}`}
                size="small"
                color={checklistDone === checklistTotal ? "success" : "default"}
                sx={{ fontSize: "0.7rem" }}
              />
            )}

            {card.comment_count > 0 && (
              <Chip
                icon={<Comment />}
                label={card.comment_count}
                size="small"
                sx={{ fontSize: "0.7rem" }}
              />
            )}

            {(card.attachments || []).length > 0 && (
              <Chip
                icon={<AttachFile />}
                label={(card.attachments || []).length}
                size="small"
                sx={{ fontSize: "0.7rem" }}
              />
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
