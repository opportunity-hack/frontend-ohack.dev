import React, { memo } from 'react';
import {
  TextField,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { FaGithub, FaCheck, FaTimes } from 'react-icons/fa';
import { styled } from '@mui/material/styles';

// Styled text field for consistent spacing
const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

/**
 * GitHub info form component (step 2)
 */
const GitHubInfoForm = memo(({
  githubUsername,
  setGithubUsername,
  isValidatingGithub,
  isGithubValid,
  githubError
}) => {
  return (
    <StyledTextField
      fullWidth
      label="Your GitHub username"
      value={githubUsername}
      onChange={(e) => setGithubUsername(e.target.value)}
      required
      error={isGithubValid === false}
      helperText={
        githubError ||
        "When organizers approve your team, we create its GitHub repo and add you as an admin."
      }
      InputProps={{
        startAdornment: <FaGithub style={{ marginRight: 8 }} />,
        endAdornment: (
          <InputAdornment position="end">
            {isValidatingGithub && <CircularProgress size={20} />}
            {!isValidatingGithub && isGithubValid === true && (
              <FaCheck color="green" />
            )}
            {!isValidatingGithub && isGithubValid === false && (
              <FaTimes color="red" />
            )}
          </InputAdornment>
        ),
      }}
    />
  );
});

GitHubInfoForm.displayName = 'GitHubInfoForm';

export default GitHubInfoForm;