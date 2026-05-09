import { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Archive, AttachFile, Close, Delete, PersonAdd, PersonRemove } from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import PlanningPublicNotice from "./PlanningPublicNotice";
import PlanningCardKindRenderer from "./PlanningCardKindRenderer";
import { CARD_STATUSES, statusMeta } from "../../lib/planningStatus";

const API = process.env.NEXT_PUBLIC_API_SERVER_URL;
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

function slugifyFilename(name) {
  const ext = name.split(".").pop().toLowerCase();
  const base = name
    .slice(0, name.lastIndexOf("."))
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
  return `${base}.${ext}`;
}

export default function PlanningCardDialog({
  card: initialCard,
  comments: initialComments = [],
  labels = [],
  users = {},
  myId = null,
  canWrite,
  canComment,
  eventId,
  onClose,
  onUpdate,
  onArchive,
  onCreateComment,
  onDeleteComment,
  onCreateLabel,
}) {
  const [card, setCard] = useState(initialCard);
  const [comments, setComments] = useState(initialComments);
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(initialCard.title);
  const [description, setDescription] = useState(initialCard.description || "");
  const [editingDesc, setEditingDesc] = useState(false);
  const [commentBody, setCommentBody] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Sync updates back
  useEffect(() => { setCard(initialCard); }, [initialCard]);
  useEffect(() => { setComments(initialComments); }, [initialComments]);

  async function saveTitle() {
    const t = title.trim();
    if (t && t !== card.title) {
      const result = await onUpdate({ title: t });
      if (result?.conflict) {
        alert("Another editor updated this card. Please reload.");
      }
    }
    setEditingTitle(false);
  }

  async function saveDescription() {
    if (description !== card.description) {
      await onUpdate({ description });
    }
    setEditingDesc(false);
  }

  async function handleChecklistToggle(clIdx, itemIdx, done) {
    const updated = card.checklists.map((cl, ci) =>
      ci !== clIdx
        ? cl
        : {
            ...cl,
            items: cl.items.map((it, ii) =>
              ii !== itemIdx ? it : { ...it, done }
            ),
          }
    );
    await onUpdate({ checklists: updated });
    setCard((prev) => ({ ...prev, checklists: updated }));
  }

  async function handleCommentSubmit() {
    if (!commentBody.trim()) return;
    setSubmittingComment(true);
    const result = await onCreateComment(commentBody.trim());
    if (result?.ok) {
      setComments((prev) => [...prev, result.data]);
      setCommentBody("");
    }
    setSubmittingComment(false);
  }

  async function handleFileUpload(file) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setUploadError("Only PNG, JPG, WebP, and GIF images are supported in v1.");
      return;
    }
    if (file.size > MAX_ATTACHMENT_BYTES) {
      setUploadError("File too large (max 10 MB).");
      return;
    }
    if ((card.attachments || []).length >= 20) {
      setUploadError("Maximum 20 attachments per card.");
      return;
    }

    setUploading(true);
    setUploadError("");
    const form = new FormData();
    form.append("file", file);
    form.append("directory", `hackathons/${eventId}/planning/cards/${card.id}`);
    form.append("filename", slugifyFilename(file.name));

    try {
      const res = await fetch(`${API}/api/messages/upload-image`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      const newAttachment = {
        id: crypto.randomUUID(),
        url,
        name: file.name,
        size: file.size,
        content_type: file.type,
        uploaded_at: new Date().toISOString(),
      };
      const updatedAttachments = [...(card.attachments || []), newAttachment];
      await onUpdate({ attachments: updatedAttachments });
      setCard((prev) => ({ ...prev, attachments: updatedAttachments }));
    } catch (e) {
      setUploadError(e.message);
    } finally {
      setUploading(false);
    }
  }

  const cardLabels = (card.labels || [])
    .map((lid) => labels.find((l) => l.id === lid))
    .filter(Boolean);

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle sx={{ pr: 6 }}>
        {editingTitle && canWrite ? (
          <TextField
            autoFocus
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => { if (e.key === "Enter") saveTitle(); }}
            size="small"
          />
        ) : (
          <Typography
            variant="h6"
            onClick={() => canWrite && setEditingTitle(true)}
            sx={{ cursor: canWrite ? "pointer" : "default" }}
          >
            {card.title}
          </Typography>
        )}
        {cardLabels.map((l) => (
          <Chip
            key={l.id}
            label={l.name}
            size="small"
            sx={{ bgcolor: l.color, ml: 0.5 }}
          />
        ))}
        <IconButton onClick={onClose} size="small" sx={{ position: "absolute", top: 8, right: 8 }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <PlanningPublicNotice />

        {/* Status + Assignees row — primary metadata, prominent placement */}
        <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
          {/* Status selector */}
          <Box sx={{ minWidth: 200 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
              Status
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {CARD_STATUSES.map((s) => {
                const selected = card.status === s.id;
                return (
                  <Chip
                    key={s.id}
                    label={s.label}
                    size="small"
                    clickable={canWrite}
                    onClick={canWrite ? () => onUpdate({ status: selected ? null : s.id }) : undefined}
                    sx={{
                      bgcolor: selected ? s.color : "transparent",
                      color: selected ? "#fff" : "text.primary",
                      border: "1px solid",
                      borderColor: selected ? s.color : "divider",
                      fontWeight: selected ? 600 : 400,
                      "&:hover": canWrite
                        ? { bgcolor: selected ? s.color : "action.hover", opacity: selected ? 0.85 : 1 }
                        : {},
                    }}
                  />
                );
              })}
              {!canWrite && !card.status && (
                <Typography variant="caption" color="text.secondary">
                  No status set
                </Typography>
              )}
            </Stack>
          </Box>

          {/* Assignees */}
          <Box sx={{ minWidth: 200, flex: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
              Assignees
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <AvatarGroup
                max={6}
                sx={{ "& .MuiAvatar-root": { width: 32, height: 32, fontSize: "0.85rem" } }}
              >
                {(card.assignees || []).map((id) => {
                  const profile = users[id] || {};
                  return (
                    <Tooltip key={id} title={profile.name || "Unknown"}>
                      <Avatar src={profile.profile_image} alt={profile.name || ""}>
                        {(profile.name || "?").charAt(0).toUpperCase()}
                      </Avatar>
                    </Tooltip>
                  );
                })}
              </AvatarGroup>
              {(card.assignees || []).length === 0 && (
                <Typography variant="caption" color="text.secondary">
                  Nobody owns this card yet
                </Typography>
              )}
              {/* Self-assign button — gated to editors since the backend PATCH requires write perm */}
              {myId && canWrite && (() => {
                const isMe = (card.assignees || []).includes(myId);
                return (
                  <Button
                    size="small"
                    variant={isMe ? "outlined" : "contained"}
                    color={isMe ? "inherit" : "primary"}
                    startIcon={isMe ? <PersonRemove fontSize="small" /> : <PersonAdd fontSize="small" />}
                    onClick={() => {
                      const next = isMe
                        ? (card.assignees || []).filter((id) => id !== myId)
                        : [...(card.assignees || []), myId];
                      onUpdate({ assignees: next });
                    }}
                  >
                    {isMe ? "Unassign me" : "Assign me"}
                  </Button>
                );
              })()}
            </Stack>
          </Box>
        </Stack>

        {/* Live data strip for non-freetext kinds */}
        {card.kind && card.kind !== "freetext" && (
          <Box sx={{ mb: 2 }}>
            <PlanningCardKindRenderer card={card} eventId={eventId} />
          </Box>
        )}

        {/* Description */}
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
          Description
        </Typography>
        {editingDesc && canWrite ? (
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={saveDescription}
            sx={{ mb: 2 }}
          />
        ) : (
          <Box
            onClick={() => canWrite && setEditingDesc(true)}
            sx={{
              mb: 2,
              p: 1,
              borderRadius: 1,
              minHeight: 60,
              cursor: canWrite ? "pointer" : "default",
              bgcolor: "action.hover",
              "&:hover": canWrite ? { bgcolor: "action.selected" } : {},
            }}
          >
            {card.description ? (
              <ReactMarkdown>{card.description}</ReactMarkdown>
            ) : (
              <Typography color="text.secondary" variant="body2">
                {canWrite ? "Click to add a description…" : "No description."}
              </Typography>
            )}
          </Box>
        )}

        {/* Checklists */}
        {(card.checklists || []).map((cl, clIdx) => (
          <Box key={cl.id || clIdx} sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              ☑ {cl.title}
              <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                {cl.items.filter((i) => i.done).length}/{cl.items.length}
              </Typography>
            </Typography>
            <LinearProgress
              variant="determinate"
              value={cl.items.length > 0 ? (cl.items.filter((i) => i.done).length / cl.items.length) * 100 : 0}
              sx={{ mb: 1, borderRadius: 1 }}
            />
            {cl.items.map((item, itemIdx) => (
              <FormControlLabel
                key={item.id || itemIdx}
                control={
                  <Checkbox
                    size="small"
                    checked={!!item.done}
                    disabled={!canWrite}
                    onChange={(e) => handleChecklistToggle(clIdx, itemIdx, e.target.checked)}
                  />
                }
                label={item.text}
                sx={{ display: "block" }}
              />
            ))}
          </Box>
        ))}

        {/* Budget */}
        {card.budget && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
              Budget
            </Typography>
            <Chip
              label={`$${(card.budget.amount_cents / 100).toFixed(0)} · ${card.budget.bucket} · ${card.budget.state}`}
              size="small"
              color={card.budget.state === "paid" ? "success" : card.budget.state === "committed" ? "warning" : "default"}
            />
            {card.budget.vendor && (
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                {card.budget.vendor}
              </Typography>
            )}
          </Box>
        )}

        {/* Attachments */}
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
          Attachments ({(card.attachments || []).length})
        </Typography>
        {(card.attachments || []).map((att) => (
          <Box key={att.id} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <AttachFile fontSize="small" />
            <a href={att.url} target="_blank" rel="noopener noreferrer">
              {att.name}
            </a>
            <Typography variant="caption" color="text.secondary">
              ({Math.round(att.size / 1024)} KB)
            </Typography>
          </Box>
        ))}
        {canWrite && (
          <Box sx={{ mt: 1 }}>
            <PlanningPublicNotice />
            {uploadError && <Alert severity="error" sx={{ mb: 1 }}>{uploadError}</Alert>}
            <Button
              variant="outlined"
              size="small"
              component="label"
              startIcon={<AttachFile />}
              disabled={uploading}
            >
              {uploading ? "Uploading…" : "Attach image"}
              <input
                type="file"
                hidden
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              />
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              PNG, JPG, WebP, GIF only (v1). Max 10 MB.
            </Typography>
          </Box>
        )}

        {/* Comments */}
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Comments ({comments.length})
        </Typography>
        {comments.filter((c) => !c.deleted_at && c.body !== "[deleted]").map((c) => (
          <Box
            key={c.id}
            sx={{ mb: 1, pl: 1, borderLeft: "2px solid", borderColor: "divider" }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary">
                {(c.author?.name || c.author?.user_id || "Someone").trim()} ·{" "}
                {new Date(c.created_at).toLocaleString()}
              </Typography>
              {canWrite && (
                <Tooltip title="Delete comment">
                  <IconButton size="small" onClick={() => onDeleteComment(c.id)}>
                    <Delete fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
              {c.body}
            </Typography>
          </Box>
        ))}
        {canComment && (
          <Box sx={{ mt: 1 }}>
            <PlanningPublicNotice collapsible />
            <Stack direction="row" spacing={1} alignItems="flex-end">
              <TextField
                fullWidth
                multiline
                minRows={2}
                placeholder="Add a comment…"
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                size="small"
              />
              <Button
                variant="contained"
                size="small"
                onClick={handleCommentSubmit}
                disabled={submittingComment || !commentBody.trim()}
              >
                Post
              </Button>
            </Stack>
          </Box>
        )}

        {/* Archive */}
        {canWrite && (
          <>
            <Divider sx={{ my: 2 }} />
            <Button
              startIcon={<Archive />}
              color="error"
              size="small"
              onClick={onArchive}
            >
              Archive card
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
