import React, { memo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert
} from '@mui/material';
import { FaSlack, FaGithub, FaUserAlt } from 'react-icons/fa';

/**
 * Component for displaying confirmation summary before team creation
 */
const ConfirmationSummary = memo(({
  teamName,
  slackChannel,
  githubUsername,
  selectedNonprofits,
  teamMembers,
  comments
}) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Please confirm your team details:
      </Typography>
      
      <Card sx={{ mb: 3, p: 2 }}>
        <CardContent>
          <Box mb={2}>
            <Typography variant="subtitle1" fontWeight="bold" color="primary">Team Information</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">Team Name:</Typography>
                <Typography>{teamName}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">Slack Channel:</Typography>
                <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                  <FaSlack style={{ marginRight: 8 }} /> #{slackChannel}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">GitHub Username:</Typography>
                <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                  <FaGithub style={{ marginRight: 8 }} /> {githubUsername}
                </Typography>
              </Grid>
            </Grid>
          </Box>
          
          {teamMembers.length > 0 && (
            <Box mb={2}>
              <Typography variant="subtitle1" fontWeight="bold" color="primary">Team Members</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box display="flex" flexWrap="wrap" gap={1}>
                {teamMembers.map((member, index) => (
                  <Chip 
                    key={index} 
                    label={typeof member === 'string' ? member : (member.real_name || member.name || '')} 
                    icon={<FaUserAlt />} 
                    variant="outlined" 
                  />
                ))}
              </Box>
            </Box>
          )}
          
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" color="primary">Nonprofit Rankings</Typography>
            <Divider sx={{ mb: 2 }} />
            {selectedNonprofits.length > 0 ? (
              <List>
                {selectedNonprofits.slice(0, 3).map((nonprofit, index) => (
                  <ListItem key={index} sx={{ 
                    bgcolor: index === 0 ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
                    border: '1px solid',
                    borderColor: index === 0 ? 'primary.main' : 'divider',
                    borderRadius: 1,
                    mb: 1
                  }}>
                    <Chip 
                      label={`#${index + 1}`} 
                      color={index === 0 ? "primary" : "default"} 
                      size="small" 
                      sx={{ mr: 2 }} 
                    />
                    <ListItemText 
                      primary={nonprofit.name} 
                      secondary={index === 0 ? "Top Choice" : `Preference ${index + 1}`}
                    />
                  </ListItem>
                ))}
                {selectedNonprofits.length > 3 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    And {selectedNonprofits.length - 3} more ranked preferences...
                  </Typography>
                )}
              </List>
            ) : (
              <Typography variant="body2" color="error">No nonprofits ranked yet.</Typography>
            )}
          </Box>
          
          {comments && (
            <Box mt={2}>
              <Typography variant="subtitle1" fontWeight="bold" color="primary">Additional Comments</Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" sx={{ fontStyle: 'italic' }}>"{comments}"</Typography>
            </Box>
          )}
        </CardContent>
      </Card>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body1">
          After submission, your team will be created, and your nonprofit preferences will be recorded. 
          You'll get access to your team's Slack channel and GitHub repository.
        </Typography>
      </Alert>
    </Box>
  );
});

ConfirmationSummary.displayName = 'ConfirmationSummary';

export default ConfirmationSummary;