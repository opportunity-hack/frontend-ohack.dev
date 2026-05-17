import React from "react";
import dynamic from "next/dynamic";
import {
  Alert,
  Box,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import SectionContainer from "../../hackathon-edit/SectionContainer";
import ImageUpload from "../../ImageUpload";
import * as ga from "../../../../lib/ga";

// MDEditor pulls in a chunky bundle; load on the client and avoid SSR.
const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false, loading: () => <Box sx={{ minHeight: 400, bgcolor: "grey.50", borderRadius: 1 }} /> }
);

const ContentSection = ({ admin, accessToken, orgId, onSnack }) => {
  const { post, setField, markSectionDirty, dirtySections, commitSection, discardSection, saveState } = admin;
  if (!post) return null;

  const dirty = dirtySections.has("content");
  const isMarkdown = post.content_format === "markdown";

  const onFieldChange = (field) => (e) => {
    setField(field, e.target.value);
    markSectionDirty("content", true);
  };

  const onMarkdownChange = (value) => {
    setField("content_markdown", value || "");
    markSectionDirty("content", true);
  };

  const onFormatToggle = (e) => {
    setField("content_format", e.target.checked ? "markdown" : "html");
    markSectionDirty("content", true);
  };

  const onImageChange = (url) => {
    setField("featured_image", url);
    setField("image", url);
    markSectionDirty("content", true);
  };

  const handleSave = async () => {
    const res = await commitSection("content");
    if (res?.ok) {
      onSnack?.("Content saved", "success");
      ga.trackStructuredEvent(ga.EventCategory.ADMIN, "admin_blog_edit_save", "content", null, {
        post_id: post.id,
      });
    } else if (res?.error) {
      onSnack?.(`Save failed: ${res.error}`, "error");
    }
  };

  const handleDiscard = () => {
    discardSection("content");
    onSnack?.("Reverted content changes", "info");
  };

  return (
    <SectionContainer
      title="Content"
      description="Headline, body, and featured image. Click Save to publish your changes."
      dirty={dirty}
      saving={saveState.status === "saving"}
      onSave={handleSave}
      onDiscard={handleDiscard}
    >
      <Stack spacing={3}>
        <TextField
          label="Title"
          value={post.title || ""}
          onChange={onFieldChange("title")}
          fullWidth
          required
          inputProps={{ maxLength: 200 }}
          helperText="Used in the page title and the SEO title (unless you override it)"
        />

        <ImageUpload
          label="Featured image"
          value={post.featured_image || ""}
          onChange={onImageChange}
          directory={`news/${post.id || "drafts"}`}
          accessToken={accessToken}
          orgId={orgId}
          helperText="Used as the hero image and the social-share image (unless overridden in SEO)"
        />

        <Box>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="subtitle1">Body</Typography>
            <FormControlLabel
              control={<Switch checked={isMarkdown} onChange={onFormatToggle} />}
              label={isMarkdown ? "Markdown" : "Plain text (legacy)"}
            />
          </Stack>

          {isMarkdown ? (
            <Box data-color-mode="light">
              <MDEditor
                value={post.content_markdown || ""}
                onChange={onMarkdownChange}
                height={520}
                preview="live"
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                {(post.content_markdown || "").length.toLocaleString()} characters · GFM markdown supported
              </Typography>
            </Box>
          ) : (
            <>
              <TextField
                label="Description (plain text / HTML)"
                value={post.description || ""}
                onChange={onFieldChange("description")}
                fullWidth
                multiline
                minRows={10}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                {(post.description || "").length.toLocaleString()} characters
              </Typography>
              <Alert severity="info" sx={{ mt: 2 }}>
                Tip: switch to Markdown for a better authoring experience — headers, lists, links, and images render nicely on the public page.
              </Alert>
            </>
          )}
        </Box>

        {isMarkdown && (post.description || "").length > 0 && (
          <Alert severity="info">
            The legacy <code>description</code> field still has content. It will continue to be used as a short excerpt and in the SEO description fallback. Edit it by toggling back to Plain text.
          </Alert>
        )}
      </Stack>
    </SectionContainer>
  );
};

export default ContentSection;
