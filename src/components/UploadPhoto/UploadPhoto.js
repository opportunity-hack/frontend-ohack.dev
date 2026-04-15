import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  FormHelperText,
  InputLabel,
  CircularProgress,
  Typography,
  Alert
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Image from 'next/image';
import PropTypes from 'prop-types';

const UploadPhoto = ({
  value = '',
  onChange,
  onError,
  label = 'Upload Photo',
  helperText = 'Please upload a photo',
  required = false,
  disabled = false,
  directory = 'uploads',
  maxSize = 10 * 1024 * 1024, // 10MB default
  accept = 'image/*',
  allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  apiServerUrl,
  accessToken,
  orgId,
  userId,
  sx = {}
}) => {
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(value);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset previous errors
    setError('');
    if (onError) onError('');

    // Validate file size
    if (file.size > maxSize) {
      const errorMsg = `Image file is too large. Please choose an image under ${Math.round(maxSize / 1024 / 1024)}MB.`;
      setError(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      const errorMsg = `Please select a valid image file (${allowedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')})`;
      setError(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }

    setPhotoFile(file);
    setUploading(true);

    try {
      // Create preview immediately for better UX
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload to backend API
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('directory', directory);

      // Generate a meaningful filename
      const timestamp = Date.now();
      const cleanFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      uploadFormData.append('filename', `${timestamp}_${cleanFilename}`);

      const uploadResponse = await fetch(`${apiServerUrl}/api/messages/upload-image`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${accessToken}`,
          "X-Org-Id": orgId || userId || 'default',
          // Don't set Content-Type, let browser set it with boundary for FormData
        },
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
      }

      const uploadResult = await uploadResponse.json();

      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || 'No URL returned from upload');
      }

      // Call onChange with the uploaded URL
      if (onChange) {
        onChange(uploadResult.url);
      }

    } catch (err) {
      console.error('Error uploading image:', err);
      const errorMsg = `Failed to upload image: ${err.message}. Please try again.`;
      setError(errorMsg);
      if (onError) onError(errorMsg);
      
      // Clear the file and preview on error
      setPhotoFile(null);
      setPhotoPreview(value); // Reset to original value
    } finally {
      setUploading(false);
    }
  };

  // Clear the file input when component unmounts or resets
  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Effect to sync external value changes with preview
  React.useEffect(() => {
    if (value !== photoPreview) {
      setPhotoPreview(value);
    }
  }, [value, photoPreview]);

  // Effect to reset file input when upload completes successfully
  React.useEffect(() => {
    if (value && !uploading) {
      resetFileInput();
    }
  }, [value, uploading]);

  return (
    <Box sx={sx}>
      <InputLabel htmlFor="photo-upload" sx={{ mb: 1 }}>
        {label} {required && <span style={{ color: 'red' }}>*</span>}
      </InputLabel>
      
      <Button
        component="label"
        variant="outlined"
        startIcon={uploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
        disabled={uploading || disabled}
        sx={{ mb: 1 }}
      >
        {uploading ? 'Uploading...' : 'Upload Photo'}
        <input
          id="photo-upload"
          ref={fileInputRef}
          type="file"
          accept={accept}
          hidden
          onChange={handleFileChange}
          disabled={uploading || disabled}
        />
      </Button>

      <FormHelperText sx={{ mb: 2 }}>
        {uploading 
          ? "Uploading your photo..." 
          : error 
            ? error
            : helperText
        }
      </FormHelperText>

      {photoPreview && (
        <Box sx={{ mt: 2, maxWidth: 200 }}>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '200px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              overflow: 'hidden'
            }}
          >
            <Image
              src={photoPreview}
              alt="Preview"
              fill
              style={{
                objectFit: 'cover',
                borderRadius: '4px'
              }}
            />
          </Box>
          {value && !uploading && (
            <Typography 
              variant="caption" 
              color="success.main" 
              sx={{ display: 'block', mt: 1 }}
            >
              ✓ Photo uploaded successfully
            </Typography>
          )}
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

UploadPhoto.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onError: PropTypes.func,
  label: PropTypes.string,
  helperText: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  directory: PropTypes.string,
  maxSize: PropTypes.number,
  accept: PropTypes.string,
  allowedTypes: PropTypes.arrayOf(PropTypes.string),
  apiServerUrl: PropTypes.string.isRequired,
  accessToken: PropTypes.string.isRequired,
  orgId: PropTypes.string,
  userId: PropTypes.string,
  sx: PropTypes.object
};

export default UploadPhoto;