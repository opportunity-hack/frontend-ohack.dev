import React, { memo } from 'react';
import {
  TextField,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { FaSlack, FaCheck, FaTimes } from 'react-icons/fa';
import { MdGroup } from 'react-icons/md';
import { styled } from '@mui/material/styles';

// Styled text field for consistent spacing
const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

/**
 * Team details form component (step 1)
 */
const TeamDetailsForm = memo(({
  teamName,
  setTeamName,
  slackChannel,
  setSlackChannel,
  isValidatingSlack,
  isSlackValid,
  slackError
}) => {
  return (
    <>
      <StyledTextField
        fullWidth
        label="Team Name"
        value={teamName}
        onChange={(e) => setTeamName(e.target.value)}
        required
        inputProps={{ maxLength: 50 }}
        helperText={`${teamName.length}/50 characters`}
        InputProps={{
          startAdornment: <MdGroup style={{ marginRight: 8 }} />,
        }}
      />
      <StyledTextField
        fullWidth
        label="Slack Channel (without #) - we will create it if it doesn't exist"
        value={slackChannel}
        onChange={(e) => setSlackChannel(e.target.value.toLowerCase())}
        required
        error={isSlackValid === false}
        helperText={
          slackError ||
          "Use lowercase letters, numbers, hyphens, and underscores only"
        }
        InputProps={{
          startAdornment: <FaSlack style={{ marginRight: 8 }} />,
          endAdornment: (
            <InputAdornment position="end">
              {isValidatingSlack && <CircularProgress size={20} />}
              {!isValidatingSlack && isSlackValid === true && (
                <FaCheck color="green" />
              )}
              {!isValidatingSlack && isSlackValid === false && (
                <FaTimes color="red" />
              )}
            </InputAdornment>
          ),
        }}
      />
    </>
  );
});

TeamDetailsForm.displayName = 'TeamDetailsForm';

export default TeamDetailsForm;