import React, { memo } from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Autocomplete,
  TextField
} from '@mui/material';
import { FaUserAlt, FaPlus, FaTrash } from 'react-icons/fa';

/**
 * Component for managing team members
 */
const TeamMemberManager = memo(({
  teamMembers,
  memberInput,
  handleAddTeamMember,
  handleRemoveTeamMember,
  setMemberInput,  
  slackUsers,
  error
}) => {
  console.log("Slack Users:", slackUsers);
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Team Members
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Add the other members of your team. This will help us track who is working together.
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {slackUsers?.length 
          ? `${slackUsers.length} active Slack users available for selection`
          : "Loading Slack users..."}
      </Typography>
      
      <Box display="flex" alignItems="center" mb={2}>
        <Autocomplete
          freeSolo
          options={slackUsers || []}
          getOptionLabel={(option) => typeof option === 'string' ? option : option.real_name || option.name || ''}
          value={memberInput}
          onChange={(_, newValue) => {
            setMemberInput(newValue);            
          }}
          onInputChange={(_, newInputValue) => {            
            setMemberInput(newInputValue);
          }}
          fullWidth
          renderInput={(params) => (
            <TextField
              {...params}
              label="Team member's name or Slack handle"
              variant="outlined"
              size="small"
              error={!!error && error.includes("team member")}
              helperText={error && error.includes("team member") ? error : ""}
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <FaUserAlt style={{ marginRight: 8 }} />
                    {params.InputProps.startAdornment}
                  </>
                ),
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTeamMember();
                }
              }}
            />
          )}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddTeamMember}
          startIcon={<FaPlus />}
          sx={{ ml: 2, whiteSpace: 'nowrap' }}
        >
          Add Member
        </Button>
      </Box>
      
      {teamMembers.length > 0 ? (
        <List>
          {teamMembers.map((member, index) => (
            <ListItem
              key={index}
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="remove"
                  onClick={() => handleRemoveTeamMember(index)}
                  color="error"
                  size="small"
                >
                  <FaTrash />
                </IconButton>
              }
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1
              }}
            >
              <ListItemText 
                primary={typeof member === 'string' ? member : (member.real_name || member.name || '')}
                secondary="Team Member"
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mt: 1 }}>
          No team members added yet.
        </Typography>
      )}
    </Box>
  );
});

TeamMemberManager.displayName = 'TeamMemberManager';

export default TeamMemberManager;