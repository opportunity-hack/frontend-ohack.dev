import React from 'react';
import { 
  Box, 
  IconButton, 
  Alert, 
  Typography, 
  Snackbar,
  Tooltip
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';

export default function FormPersistenceControls({
  onSave,
  onRestore,
  onClear,
  notification,
  onCloseNotification,
  showAutoSaveMessage = true
}) {
  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all form data?')) {
      onClear();
    }
  };
  
  return (
    <>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        gap: 1, 
        mb: 2,
        flexWrap: 'wrap'
      }}>
        <Tooltip title="Save form progress">
          <IconButton 
            color="primary" 
            onClick={onSave} 
            size="small"
          >
            <SaveIcon /> 
          </IconButton>
        </Tooltip>
        <Tooltip title="Restore saved form">
          <IconButton 
            color="secondary" 
            onClick={onRestore} 
            size="small"
          >
            <RestoreIcon /> 
          </IconButton>
        </Tooltip>
        <Tooltip title="Clear form data">
          <IconButton 
            color="error" 
            onClick={handleClear} 
            size="small"
          >
            <DeleteSweepIcon /> 
          </IconButton>
        </Tooltip>
      </Box>
      
      {showAutoSaveMessage && (
        <Alert severity="success" icon={<SaveIcon />} sx={{ mb: 4 }}>
          <Typography variant="body2">
            <strong>Your form progress is automatically saved</strong> as you type. You can come back and continue later.
            Use the icons in the top right to manually save, restore, or clear your form data.
          </Typography>
        </Alert>
      )}
      
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={onCloseNotification}
        message={notification.message}
      />
    </>
  );
}