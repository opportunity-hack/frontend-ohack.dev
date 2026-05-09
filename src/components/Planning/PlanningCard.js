import NextLink from "next/link";
import {
  AvatarGroup,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
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
import { statusMeta } from "../../lib/planningStatus";

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

function AssigneeAvatars({ assignees = [], users = {} }) {
  if (assignees.length === 0) return null;
  return (
    <AvatarGroup
      max={4}
      sx={{
        "& .MuiAvatar-root": {
          width: 24,
          height: 24,
          fontSize: "0.7rem",
          border: "2px solid",
          borderColor: "background.paper",
        },
      }}
    >
      {assignees.map((id) => {
        const profile = users[id] || {};
        const displayName = profile.name || profile.nickname || "Loading…";
        const initial = displayName.charAt(0).toUpperCase();
        // Prefer Firestore db_id (canonical /profile/{id} URL); skip the link
        // entirely if the user has no profile record yet (db_id missing).
        const profileHref = profile.db_id ? `/profile/${profile.db_id}` : null;
        const tooltipTitle = (
          <Box sx={{ p: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{displayName}</Typography>
            {profileHref && (
              <Typography variant="caption" color="inherit" sx={{ opacity: 0.8 }}>
                Click to view profile
              </Typography>
            )}
          </Box>
        );
        const avatarEl = (
          <Avatar src={profile.profile_image} alt={displayName}>
            {initial}
          </Avatar>
        );
        return (
          <Tooltip key={id} title={tooltipTitle} arrow>
            {profileHref ? (
              <Box
                component={NextLink}
                href={profileHref}
                onClick={(e) => e.stopPropagation()} // don't open the card dialog
                sx={{ display: "inline-flex", textDecoration: "none" }}
              >
                {avatarEl}
              </Box>
            ) : (
              avatarEl
            )}
          </Tooltip>
        );
      })}
    </AvatarGroup>
  );
}

export default function PlanningCard({ card, labels = [], users = {}, canWrite, onClick }) {
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

  const status = statusMeta(card.status);
  const isCompleted = card.status === "completed";

  return (
    <Box ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        variant="outlined"
        onClick={() => onClick && onClick(card)}
        sx={{
          mb: 1,
          cursor: canWrite ? "grab" : "pointer",
          position: "relative",
          overflow: "hidden",
          // Theme-aware: light => paper white, dark => paper from theme
          bgcolor: "background.paper",
          borderColor: "divider",
          opacity: isCompleted ? 0.75 : 1,
          "&:hover": { boxShadow: 2 },
        }}
      >
        {/* Status top bar — colored stripe à la Trello label bars */}
        {status && (
          <Tooltip title={`Status: ${status.label}`} placement="top">
            <Box
              sx={{
                height: 4,
                width: "100%",
                bgcolor: status.color,
              }}
            />
          </Tooltip>
        )}

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
          <Typography
            variant="body2"
            sx={{
              mb: 1,
              wordBreak: "break-word",
              textDecoration: isCompleted ? "line-through" : "none",
            }}
          >
            {card.title}
          </Typography>

          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap alignItems="center">
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

            {/* Push avatars to the far right */}
            <Box sx={{ flex: 1 }} />
            <AssigneeAvatars assignees={card.assignees} users={users} />
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
