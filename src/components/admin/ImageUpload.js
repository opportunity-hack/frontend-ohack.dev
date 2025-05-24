import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Avatar,
  Paper,
  Stack,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const DropZone = styled(Paper)(({ theme, isDragActive, hasImage }) => ({
  border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backgroundColor: isDragActive 
    ? theme.palette.action.hover 
    : hasImage 
      ? theme.palette.grey[50] 
      : 'transparent',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  }
}));

const ImagePreview = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '120px',
  height: '120px',
  margin: '0 auto',
  borderRadius: theme.spacing(1),
  overflow: 'hidden',
  boxShadow: theme.shadows[2],
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  }
}));

const ImageUpload = ({ 
  label = "Image", 
  value = "", 
  onChange, 
  helperText = "",
  required = false,
  error = false,
  directory = "nonprofits",
  accessToken,
  orgId
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(!!value);
  const fileInputRef = useRef(null);

  // Validate image URL
  const isValidImageUrl = (url) => {
    if (!url) return false;
    try {
      new URL(url);
      return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
    } catch {
      return false;
    }
  };

  // Handle file upload to backend
  const uploadToBackend = useCallback(async (file) => {
    // Validate authentication
    if (!accessToken || !orgId) {
      setUploadError("Authentication required for image upload");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('directory', directory);
      
      // Generate a meaningful filename based on the nonprofit context
      const timestamp = Date.now();
      const cleanFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      formData.append('filename', `${timestamp}_${cleanFilename}`);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/upload-image`,
        {
          method: "POST",
          body: formData,
          headers: {
            // Don't set Content-Type, let browser set it with boundary for FormData
            authorization: `Bearer ${accessToken}`,
            "X-Org-Id": orgId,
          },
        }
      );

      const result = await response.json();
      
      if (result.success) {
        onChange(result.url);
        setUploadProgress(100);
        // Reset progress after successful upload
        setTimeout(() => setUploadProgress(0), 1000);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  }, [onChange, directory, accessToken, orgId]);

  // Handle file selection
  const handleFileSelect = useCallback((file) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Please select a valid image file (JPG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size must be less than 10MB');
      return;
    }

    uploadToBackend(file);
  }, [uploadToBackend]);

  // Handle drag and drop
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  // Handle file input change
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // Handle URL input change
  const handleUrlChange = (e) => {
    const url = e.target.value;
    onChange(url);
    setUploadError("");
  };

  // Clear image
  const handleClear = () => {
    onChange("");
    setUploadError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const hasValidImage = value && (isValidImageUrl(value) || value.includes('cdn.ohack.dev'));
  const isAuthenticationAvailable = !!(accessToken && orgId);

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        {label} {required && <span style={{ color: 'red' }}>*</span>}
      </Typography>
      
      {/* Show image preview if we have a valid image */}
      {hasValidImage && (
        <Box sx={{ mb: 2 }}>
          <ImagePreview>
            <img src={value} alt="Preview" />
            <Box
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                backgroundColor: 'rgba(0,0,0,0.6)',
                borderRadius: '50%'
              }}
            >
              <Tooltip title="Remove image">
                <IconButton 
                  size="small" 
                  onClick={handleClear}
                  sx={{ color: 'white' }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </ImagePreview>
          <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1 }}>
            <Button
              size="small"
              startIcon={<EditIcon />}
              onClick={() => setShowUrlInput(!showUrlInput)}
            >
              {showUrlInput ? 'Hide URL' : 'Edit URL'}
            </Button>
          </Stack>
        </Box>
      )}

      {/* Authentication warning */}
      {!isAuthenticationAvailable && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Image upload requires authentication. URL input is still available.
        </Alert>
      )}

      {/* Upload area */}
      {!hasValidImage && isAuthenticationAvailable && (
        <DropZone
          isDragActive={dragActive}
          hasImage={hasValidImage}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />
          
          {isUploading ? (
            <Box>
              <CircularProgress size={40} sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Uploading image...
              </Typography>
              {uploadProgress > 0 && (
                <LinearProgress 
                  variant="determinate" 
                  value={uploadProgress} 
                  sx={{ mt: 1, maxWidth: 200, mx: 'auto' }}
                />
              )}
            </Box>
          ) : (
            <Box>
              <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body1" gutterBottom>
                Drop an image here or click to browse
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Supports JPG, PNG, GIF, WebP (max 10MB)
              </Typography>
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                sx={{ mt: 2 }}
                size="small"
              >
                Choose File
              </Button>
            </Box>
          )}
        </DropZone>
      )}

      {/* URL input field */}
      {(showUrlInput || !hasValidImage) && (
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Or enter image URL"
            value={value}
            onChange={handleUrlChange}
            error={error}
            helperText={helperText}
            placeholder="https://example.com/image.jpg"
          />
        </Box>
      )}

      {/* Error display */}
      {uploadError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {uploadError}
        </Alert>
      )}
      
      {/* Success message */}
      {!uploadError && hasValidImage && !isUploading && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Image successfully loaded!
        </Alert>
      )}
    </Box>
  );
};

export default ImageUpload;