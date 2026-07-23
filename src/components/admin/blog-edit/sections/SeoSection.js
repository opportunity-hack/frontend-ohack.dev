import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Add as AddIcon, Close as CloseIcon } from "@mui/icons-material";
import SectionContainer from "../../hackathon-edit/SectionContainer";
import * as ga from "../../../../lib/ga";

const CharCount = ({ value, max, idealMin = 0 }) => {
  const len = (value || "").length;
  let color = "text.secondary";
  if (len > max) color = "error.main";
  else if (len > max * 0.95) color = "warning.main";
  else if (len >= idealMin) color = "success.main";
  return (
    <Typography variant="caption" sx={{ color, ml: 1 }}>
      {len} / {max}
    </Typography>
  );
};

const SerpPreview = ({ title, description, url }) => (
  <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
    <Typography variant="overline" color="text.secondary">Google search result preview</Typography>
    <Box sx={{ mt: 1 }}>
      <Typography sx={{ color: "#202124", fontSize: "0.8rem" }}>{url}</Typography>
      <Typography sx={{ color: "#1a0dab", fontSize: "1.25rem", fontFamily: "arial, sans-serif", mb: 0.5, mt: 0.25 }}>
        {title || "(missing title)"}
      </Typography>
      <Typography sx={{ color: "#4d5156", fontSize: "0.9rem", fontFamily: "arial, sans-serif" }}>
        {description || "(missing description)"}
      </Typography>
    </Box>
  </Paper>
);

const SocialPreview = ({ title, description, image, url }) => (
  <Paper variant="outlined" sx={{ overflow: "hidden" }}>
    <Typography variant="overline" color="text.secondary" sx={{ display: "block", px: 2, pt: 1.5 }}>
      Social share preview (Twitter / LinkedIn)
    </Typography>
    <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, mt: 1 }}>
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          style={{
            width: 200,
            height: 120,
            objectFit: "cover",
            display: "block",
            flexShrink: 0,
          }}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <Box sx={{ width: 200, height: 120, bgcolor: "grey.200", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Typography variant="caption" color="text.secondary">No image</Typography>
        </Box>
      )}
      <Box sx={{ p: 2, minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase" }}>{(() => {
          try { return new URL(url).hostname; } catch { return "ohack.dev"; }
        })()}</Typography>
        <Typography sx={{ fontWeight: 600, mb: 0.5 }}>{title || "(missing title)"}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>{description || ""}</Typography>
      </Box>
    </Box>
  </Paper>
);

const SeoSection = ({ admin, onSnack }) => {
  const { post, setSeo, markSectionDirty, dirtySections, commitSection, discardSection, saveState } = admin;
  const [keywordDraft, setKeywordDraft] = useState("");

  if (!post) return null;

  const dirty = dirtySections.has("seo");
  const seo = post.seo || {};

  const onSeoChange = (field) => (e) => {
    setSeo(field, e.target.value);
    markSectionDirty("seo", true);
  };

  const addKeyword = () => {
    const trimmed = keywordDraft.trim();
    if (!trimmed) return;
    const current = Array.isArray(seo.keywords) ? seo.keywords : [];
    if (current.includes(trimmed)) {
      setKeywordDraft("");
      return;
    }
    setSeo("keywords", [...current, trimmed]);
    markSectionDirty("seo", true);
    setKeywordDraft("");
  };

  const removeKeyword = (kw) => {
    const next = (seo.keywords || []).filter((k) => k !== kw);
    setSeo("keywords", next);
    markSectionDirty("seo", true);
  };

  // Effective values shown on the public page when fields are blank.
  const effectiveTitle = seo.title || (post.title ? `OHack Blog: ${post.title}` : "");
  const effectiveDescription = seo.description || post.description || "";
  const effectiveImage = seo.og_image || post.featured_image || post.image || "";
  const effectiveUrl = seo.canonical || (post.id ? `https://ohack.dev/blog/${post.id}` : "https://ohack.dev/blog");

  const handleSave = async () => {
    const res = await commitSection("seo");
    if (res?.ok) {
      onSnack?.("SEO saved", "success");
      ga.trackStructuredEvent(ga.EventCategory.ADMIN, "admin_blog_edit_save", "seo", null, {
        post_id: post.id,
      });
    } else if (res?.error) {
      onSnack?.(`Save failed: ${res.error}`, "error");
    }
  };

  const handleDiscard = () => {
    discardSection("seo");
    onSnack?.("Reverted SEO changes", "info");
  };

  return (
    <SectionContainer
      title="Search engine optimization"
      description="Override the page's <title>, meta description, canonical URL, and social-share image. Blank fields fall back to derived values."
      dirty={dirty}
      saving={saveState.status === "saving"}
      onSave={handleSave}
      onDiscard={handleDiscard}
    >
      <Stack spacing={3}>
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline">
            <Typography variant="subtitle1">SEO title <Typography component="span" variant="caption" color="text.secondary">— shown in search results</Typography></Typography>
            <CharCount value={seo.title} max={60} idealMin={30} />
          </Stack>
          <TextField
            value={seo.title || ""}
            onChange={onSeoChange("title")}
            fullWidth
            placeholder={`OHack Blog: ${post.title || ""}`}
            helperText="Aim for 50–60 characters. Leave blank to use the post title with the OHack prefix."
          />
        </Box>

        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline">
            <Typography variant="subtitle1">Meta description</Typography>
            <CharCount value={seo.description} max={160} idealMin={120} />
          </Stack>
          <TextField
            value={seo.description || ""}
            onChange={onSeoChange("description")}
            fullWidth
            multiline
            minRows={2}
            placeholder={post.description?.slice(0, 160) || ""}
            helperText="Aim for 120–160 characters. Search engines may rewrite this if it's too short."
          />
        </Box>

        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Keywords</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
            {(seo.keywords || []).map((kw) => (
              <Chip
                key={kw}
                label={kw}
                onDelete={() => removeKeyword(kw)}
                deleteIcon={<CloseIcon />}
              />
            ))}
            {(seo.keywords || []).length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No custom keywords — tags and extracted hashtags will be used as a fallback.
              </Typography>
            )}
          </Stack>
          <Stack direction="row" spacing={1}>
            <TextField
              size="small"
              value={keywordDraft}
              onChange={(e) => setKeywordDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addKeyword();
                }
              }}
              placeholder="Add a keyword and press Enter"
              fullWidth
            />
            <IconButton onClick={addKeyword} disabled={!keywordDraft.trim()} aria-label="Add keyword">
              <AddIcon />
            </IconButton>
          </Stack>
        </Box>

        <TextField
          label="Canonical URL"
          value={seo.canonical || ""}
          onChange={onSeoChange("canonical")}
          fullWidth
          placeholder={`https://ohack.dev/blog/${post.id || ""}`}
          helperText="Override only if this post is published elsewhere first and should point to the original."
        />

        <TextField
          label="Social-share image URL (OG image)"
          value={seo.og_image || ""}
          onChange={onSeoChange("og_image")}
          fullWidth
          placeholder={post.featured_image || ""}
          helperText="Recommended 1200x630px. Leave blank to use the featured image."
        />

        {!post.title && (
          <Alert severity="warning">Add a post title in the Content section first — the SEO preview needs it.</Alert>
        )}

        <Stack spacing={2}>
          <SerpPreview title={effectiveTitle} description={effectiveDescription} url={effectiveUrl} />
          <SocialPreview
            title={effectiveTitle}
            description={effectiveDescription}
            image={effectiveImage}
            url={effectiveUrl}
          />
        </Stack>
      </Stack>
    </SectionContainer>
  );
};

export default SeoSection;
