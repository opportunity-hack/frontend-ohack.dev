import React, { memo } from 'react';
import { TextField } from '@mui/material';

/**
 * Component for additional comments
 */
const CommentsSection = memo(({ comments, setComments }) => {
  return (
    <TextField
      label="Additional Comments (Optional)"
      variant="outlined"
      fullWidth
      multiline
      rows={3}
      value={comments}
      onChange={(e) => setComments(e.target.value)}
      sx={{ mt: 3 }}
      helperText="Add any additional information about your team or preferences that might be helpful."
    />
  );
});

CommentsSection.displayName = 'CommentsSection';

export default CommentsSection;