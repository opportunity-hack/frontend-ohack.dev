import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  TextField,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  Add as AddIcon,
  Close as CloseIcon,
  Launch as LaunchIcon,
  Publish as PublishIcon,
  Drafts as DraftsIcon,
  Archive as ArchiveIcon,
} from "@mui/icons-material";
import SectionContainer from "../../hackathon-edit/SectionContainer";
import * as ga from "../../../../lib/ga";

const slugify = (raw) =>
  (raw || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const MetadataSection = ({ admin, onSnack }) => {
  const { post, setField, setStatus } = admin;
  const [tagDraft, setTagDraft] = useState("");

  if (!post) return null;

  const tags = Array.isArray(post.tags) ? post.tags : [];

  const onAuthorChange = (field) => (e) => {
    setField("author", { ...(post.author || {}), [field]: e.target.value });
  };

  const addTag = () => {
    const trimmed = tagDraft.trim().replace(/^#/, "");
    if (!trimmed) return;
    if (tags.includes(trimmed)) {
      setTagDraft("");
      return;
    }
    setField("tags", [...tags, trimmed]);
    setTagDraft("");
  };

  const removeTag = (t) => setField("tags", tags.filter((x) => x !== t));

  const handleStatusChange = async (_e, newStatus) => {
    if (!newStatus || newStatus === post.status) return;
    await setStatus(newStatus);
    onSnack?.(`Status: ${newStatus}`, "success");
    if (newStatus === "published") {
      ga.trackStructuredEvent(ga.EventCategory.ADMIN, "admin_blog_publish", post.id);
    } else if (newStatus === "draft") {
      ga.trackStructuredEvent(ga.EventCategory.ADMIN, "admin_blog_unpublish", post.id);
    } else if (newStatus === "archived") {
      ga.trackStructuredEvent(ga.EventCategory.ADMIN, "admin_blog_archive", post.id);
    }
  };

  const fillSlugFromTitle = () => {
    setField("slug", slugify(post.title));
  };

  const gaUrl = `https://analytics.google.com/analytics/web/#/p${process.env.NEXT_PUBLIC_GA_PROPERTY_ID || ""}/reports/explorer?params=_u..nav%3Dmaui&collectionId=user&reportId=lifecycle-engagement-pages-and-screens&_r.explorerCard..fieldRefs=%5B%7B%22fieldType%22%3A%22dimension%22%2C%22fieldName%22%3A%22pagePath%22%7D%5D&_r.explorerCard..segment_keep=true&_r.explorerCard..filters=%5B%7B%22type%22%3A2%2C%22fieldName%22%3A%22pagePath%22%2C%22evaluationType%22%3A1%2C%22expressionList%22%3A%5B%22%2Fblog%2F${post.id}%22%5D%2C%22complement%22%3Afalse%7D%5D`;

  return (
    <SectionContainer
      title="Metadata"
      description="Author, tags, status, and publish date. Saves automatically as you edit."
    >
      <Stack spacing={3}>
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Status</Typography>
          <ToggleButtonGroup
            value={post.status || "published"}
            exclusive
            onChange={handleStatusChange}
            size="small"
          >
            <ToggleButton value="draft" sx={{ gap: 0.5 }}>
              <DraftsIcon fontSize="small" /> Draft
            </ToggleButton>
            <ToggleButton value="published" sx={{ gap: 0.5 }}>
              <PublishIcon fontSize="small" /> Published
            </ToggleButton>
            <ToggleButton value="archived" sx={{ gap: 0.5 }}>
              <ArchiveIcon fontSize="small" /> Archived
            </ToggleButton>
          </ToggleButtonGroup>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
            Draft and Archived posts are hidden from the public blog. Status change saves immediately.
          </Typography>
        </Box>

        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Tags</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
            {tags.map((t) => (
              <Chip key={t} label={`#${t}`} onDelete={() => removeTag(t)} deleteIcon={<CloseIcon />} />
            ))}
            {tags.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No tags yet. Tags drive the related-posts widget and appear as chips on the public page.
              </Typography>
            )}
          </Stack>
          <Stack direction="row" spacing={1}>
            <TextField
              size="small"
              value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Add a tag and press Enter"
              fullWidth
            />
            <IconButton onClick={addTag} disabled={!tagDraft.trim()} aria-label="Add tag">
              <AddIcon />
            </IconButton>
          </Stack>
        </Box>

        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Author</Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Name"
              value={post.author?.name || ""}
              onChange={onAuthorChange("name")}
              fullWidth
            />
            <TextField
              label="Email"
              value={post.author?.email || ""}
              onChange={onAuthorChange("email")}
              fullWidth
            />
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
            Appears on the public page as "by Name" and in the article:author meta tag.
          </Typography>
        </Box>

        <Box>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Typography variant="subtitle1">Slug</Typography>
            <Button size="small" onClick={fillSlugFromTitle} disabled={!post.title}>
              Fill from title
            </Button>
          </Stack>
          <TextField
            value={post.slug || ""}
            onChange={(e) => setField("slug", e.target.value)}
            fullWidth
            placeholder={slugify(post.title) || "my-blog-post"}
            helperText="Stored for future use. URLs currently still use the post ID."
          />
        </Box>

        <TextField
          label="Published date / time"
          type="datetime-local"
          value={post.published_at ? toDatetimeLocal(post.published_at) : ""}
          onChange={(e) => setField("published_at", e.target.value ? new Date(e.target.value).toISOString() : "")}
          InputLabelProps={{ shrink: true }}
          helperText="Shown on the public page and used in article:published_time. Leave blank to use the Slack timestamp."
        />

        <Alert severity="info" icon={<LaunchIcon />} action={
          <Button
            size="small"
            color="inherit"
            href={`https://analytics.google.com/analytics/web/`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => ga.trackStructuredEvent(ga.EventCategory.ADMIN, "admin_blog_open_ga", post.id)}
          >
            Open GA4
          </Button>
        }>
          Per-post engagement metrics live in Google Analytics. Filter by <strong>pagePath = /blog/{post.id}</strong> to see views, scroll depth, share clicks, and external-link clicks for this post.
        </Alert>
      </Stack>
    </SectionContainer>
  );
};

// Convert ISO string to the value expected by <input type="datetime-local">
function toDatetimeLocal(iso) {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}

export default MetadataSection;
