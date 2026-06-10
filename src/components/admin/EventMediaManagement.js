import React, { useCallback, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ArrowDownward as ArrowDownIcon,
  ArrowUpward as ArrowUpIcon,
  Article as ArticleIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  AlternateEmail as ThreadsIcon,
  OpenInNew as OpenInNewIcon,
  Add as AddIcon,
} from "@mui/icons-material";

const PLATFORMS = [
  {
    value: "linkedin",
    label: "LinkedIn",
    host: "linkedin.com",
    icon: LinkedInIcon,
  },
  {
    value: "instagram",
    label: "Instagram",
    host: "instagram.com",
    icon: InstagramIcon,
  },
  {
    value: "threads",
    label: "Threads",
    host: "threads.net",
    icon: ThreadsIcon,
  },
  {
    value: "article",
    label: "News article",
    icon: ArticleIcon,
    placeholder: "https://www.ohack.dev/blog/...",
  },
];

const platformByValue = (value) => PLATFORMS.find((p) => p.value === value);

const isHostMatch = (urlString, platform) => {
  if (!urlString) return false;
  try {
    const u = new URL(urlString);
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      return false;
    }

    if (platform === "article") {
      return true;
    }

    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    if (platform === "threads") {
      return (
        host === "threads.net" ||
        host.endsWith(".threads.net") ||
        host === "threads.com" ||
        host.endsWith(".threads.com")
      );
    }
    const expected = platformByValue(platform)?.host;
    return !!expected && (host === expected || host.endsWith(`.${expected}`));
  } catch {
    return false;
  }
};

const EventMediaManagement = ({
  eventId,
  accessToken,
  orgId,
  photos = [],
  onPhotosChange,
  socialPosts = [],
  onSocialPostsChange,
}) => {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    current: 0,
    total: 0,
  });
  const [uploadError, setUploadError] = useState("");

  const canUpload = !!eventId && !!accessToken && !!orgId;
  const directory = eventId ? `hackathons/${eventId}/photos` : "";

  const uploadOne = useCallback(
    async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("directory", directory);
      const timestamp = Date.now();
      const cleanFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      formData.append("filename", `${timestamp}_${cleanFilename}`);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/upload-image`,
        {
          method: "POST",
          body: formData,
          headers: {
            authorization: `Bearer ${accessToken}`,
            "X-Org-Id": orgId,
          },
        },
      );
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || `Upload failed for ${file.name}`);
      }
      return json.url;
    },
    [accessToken, orgId, directory],
  );

  const handleFiles = useCallback(
    async (fileList) => {
      const files = Array.from(fileList || []);
      if (!files.length) return;

      const allowed = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      const valid = files.filter((f) => {
        if (!allowed.includes(f.type)) {
          setUploadError(`${f.name}: not a supported image type`);
          return false;
        }
        if (f.size > 20 * 1024 * 1024) {
          setUploadError(`${f.name}: exceeds 20MB`);
          return false;
        }
        return true;
      });
      if (!valid.length) return;

      setUploadError("");
      setIsUploading(true);
      setUploadProgress({ current: 0, total: valid.length });

      const uploaded = [];
      for (let i = 0; i < valid.length; i++) {
        try {
          const url = await uploadOne(valid[i]);
          uploaded.push({ url, caption: "", credit: "" });
          setUploadProgress({ current: i + 1, total: valid.length });
        } catch (err) {
          setUploadError(err.message || "Upload failed");
        }
      }

      if (uploaded.length) {
        onPhotosChange([...(photos || []), ...uploaded]);
      }
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [uploadOne, onPhotosChange, photos],
  );

  const updatePhoto = (index, patch) => {
    const next = photos.map((p, i) => (i === index ? { ...p, ...patch } : p));
    onPhotosChange(next);
  };

  const removePhoto = (index) => {
    onPhotosChange(photos.filter((_, i) => i !== index));
  };

  const movePhoto = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= photos.length) return;
    const next = [...photos];
    [next[index], next[target]] = [next[target], next[index]];
    onPhotosChange(next);
  };

  const addSocialPost = () => {
    onSocialPostsChange([
      ...(socialPosts || []),
      { platform: "linkedin", url: "", caption: "" },
    ]);
  };

  const updateSocialPost = (index, patch) => {
    const next = socialPosts.map((p, i) =>
      i === index ? { ...p, ...patch } : p,
    );
    onSocialPostsChange(next);
  };

  const removeSocialPost = (index) => {
    onSocialPostsChange(socialPosts.filter((_, i) => i !== index));
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Event Photos
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Photos appear on <code>/hack/{eventId || "[event_id]"}/media</code> and
        a small teaser strip on the event page. Files are uploaded to{" "}
        <code>cdn.ohack.dev/hackathons/{eventId || "[event_id]"}/photos/</code>.
      </Typography>

      {!eventId && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Set the Event ID on the Basic Info tab and save before uploading
          photos.
        </Alert>
      )}

      {!!eventId && !accessToken && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Sign-in required for uploads.
        </Alert>
      )}

      <Paper
        variant="outlined"
        sx={{
          p: 3,
          mb: 2,
          borderStyle: "dashed",
          borderWidth: 2,
          textAlign: "center",
          opacity: canUpload ? 1 : 0.6,
          cursor: canUpload && !isUploading ? "pointer" : "not-allowed",
        }}
        onClick={() =>
          canUpload && !isUploading && fileInputRef.current?.click()
        }
        onDragOver={(e) => {
          if (canUpload && !isUploading) e.preventDefault();
        }}
        onDrop={(e) => {
          if (!canUpload || isUploading) return;
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          style={{ display: "none" }}
        />
        {isUploading ? (
          <Box>
            <CircularProgress size={32} sx={{ mb: 1 }} />
            <Typography variant="body2">
              Uploading {uploadProgress.current} of {uploadProgress.total}…
            </Typography>
            <LinearProgress
              variant="determinate"
              value={
                uploadProgress.total
                  ? (uploadProgress.current / uploadProgress.total) * 100
                  : 0
              }
              sx={{ mt: 1, maxWidth: 300, mx: "auto" }}
            />
          </Box>
        ) : (
          <Box>
            <ImageIcon sx={{ fontSize: 40, color: "text.secondary", mb: 1 }} />
            <Typography variant="body1" gutterBottom>
              Drop images here or click to browse
            </Typography>
            <Typography variant="body2" color="text.secondary">
              JPG, PNG, GIF, WebP up to 10MB each. You can select multiple at
              once.
            </Typography>
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              size="small"
              sx={{ mt: 2 }}
              disabled={!canUpload}
            >
              Choose Files
            </Button>
          </Box>
        )}
      </Paper>

      {uploadError && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setUploadError("")}
        >
          {uploadError}
        </Alert>
      )}

      {photos.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {photos.map((photo, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={`${photo.url}-${index}`}>
              <Card variant="outlined">
                <CardMedia
                  component="img"
                  image={photo.url}
                  alt={photo.caption || `Event photo ${index + 1}`}
                  sx={{ height: 160, objectFit: "cover" }}
                />
                <CardContent sx={{ pb: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Caption"
                    value={photo.caption || ""}
                    onChange={(e) =>
                      updatePhoto(index, { caption: e.target.value })
                    }
                    sx={{ mb: 1 }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Photo credit"
                    value={photo.credit || ""}
                    onChange={(e) =>
                      updatePhoto(index, { credit: e.target.value })
                    }
                  />
                  <Stack
                    direction="row"
                    spacing={0.5}
                    justifyContent="space-between"
                    sx={{ mt: 1 }}
                  >
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Move earlier">
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => movePhoto(index, -1)}
                            disabled={index === 0}
                          >
                            <ArrowUpIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Move later">
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => movePhoto(index, 1)}
                            disabled={index === photos.length - 1}
                          >
                            <ArrowDownIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                    <Tooltip title="Remove photo">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removePhoto(index)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle1" gutterBottom>
        Social Posts & News
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Link to LinkedIn, Instagram, or Threads posts, plus news articles about
        this event. Instagram posts embed inline; LinkedIn, Threads, and
        articles render as link cards.
      </Typography>

      <Stack spacing={2}>
        {socialPosts.map((post, index) => {
          const platform = platformByValue(post.platform) || PLATFORMS[0];
          const PlatformIcon = platform.icon;
          const urlValid = !post.url || isHostMatch(post.url, post.platform);
          return (
            <Paper variant="outlined" sx={{ p: 2 }} key={index}>
              <Grid container spacing={2} alignItems="flex-start">
                <Grid size={{ xs: 12, sm: 3 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Platform</InputLabel>
                    <Select
                      label="Platform"
                      value={post.platform}
                      onChange={(e) =>
                        updateSocialPost(index, { platform: e.target.value })
                      }
                    >
                      {PLATFORMS.map((p) => {
                        const Icon = p.icon;
                        return (
                          <MenuItem key={p.value} value={p.value}>
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <Icon fontSize="small" />
                              <span>{p.label}</span>
                            </Stack>
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 7 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label={
                      platform.value === "article" ? "Article URL" : "Post URL"
                    }
                    placeholder={
                      platform.placeholder || `https://www.${platform.host}/...`
                    }
                    value={post.url || ""}
                    onChange={(e) =>
                      updateSocialPost(index, { url: e.target.value })
                    }
                    error={!urlValid}
                    helperText={
                      !urlValid
                        ? platform.value === "article"
                          ? "Enter a full http(s) article URL"
                          : `URL host should match ${platform.label}`
                        : " "
                    }
                    InputProps={{
                      startAdornment: (
                        <PlatformIcon
                          sx={{ mr: 1, color: "text.secondary" }}
                          fontSize="small"
                        />
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Caption (optional)"
                    value={post.caption || ""}
                    onChange={(e) =>
                      updateSocialPost(index, { caption: e.target.value })
                    }
                    sx={{ mt: 1 }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <Stack
                    direction="row"
                    spacing={0.5}
                    justifyContent="flex-end"
                  >
                    {post.url && urlValid && (
                      <Tooltip title="Open link in new tab">
                        <IconButton
                          size="small"
                          component="a"
                          href={post.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Remove link">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeSocialPost(index)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          );
        })}
      </Stack>

      <Button
        startIcon={<AddIcon />}
        onClick={addSocialPost}
        sx={{ mt: 2 }}
        variant="outlined"
        size="small"
      >
        Add social or article link
      </Button>
    </Box>
  );
};

export default EventMediaManagement;
