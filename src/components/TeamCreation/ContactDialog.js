import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Alert,
  Button,
  Paper,
  Avatar,
  Chip,
  Snackbar
} from "@mui/material";
import { FaSlack, FaHeart, FaLink } from "react-icons/fa";
import { BsStarFill } from "react-icons/bs";

/**
 * ContactDialog Component
 * 
 * Dialog for contacting potential teammates via Slack
 * 
 * @param {Boolean} open - Whether the dialog is open
 * @param {Function} onClose - Handler for dialog close
 * @param {Object} user - The user to contact
 * @param {Object} eventDetails - Details about the hackathon event
 * @param {Number} matchScore - Calculated match score
 * @param {Array} myInterests - Current user's interests 
 * @param {Array} mySkills - Current user's skills
 * @param {Boolean} isFavorited - Whether this user is in favorites
 * @param {Function} onToggleFavorite - Handler for favorite toggle
 */
const ContactDialog = ({
  open,
  onClose,
  user,
  eventDetails,
  matchScore,
  myInterests = [],
  mySkills = [],
  isFavorited = false,
  onToggleFavorite
}) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  if (!user) return null;

  // Generate suggested message
  const suggestedMessage = `Hi ${user.name?.split(' ')[0] || 'there'}! I found your profile on the Opportunity Hack team finder. I'm interested in collaborating for the ${eventDetails?.title || 'hackathon'}. Would you be open to chatting about potentially forming a team?`;

  // Copy message to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(suggestedMessage);
    setSnackbarOpen(true);
  };

  // Check for shared interests
  const hasSharedInterests = myInterests.some(interest => 
    user.application?.interests?.includes(interest)
  );

  // Check for complementary skills
  const hasComplementarySkills = mySkills.some(skill => 
    !user.application?.skills?.includes(skill)
  ) || user.application?.skills?.some(skill => !mySkills.includes(skill));

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Contact {user.name || 'Team Member'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              src={user.picture}
              alt={user.name}
              sx={{ width: 60, height: 60, mr: 2 }}
            />
            <Box>
              <Typography variant="h6">{user.name}</Typography>
              {user.github && (
                <Typography variant="body2" color="textSecondary">
                  GitHub: {user.github}
                </Typography>
              )}
            </Box>
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            To connect with this hacker, you can reach out via Slack. All Opportunity Hack participants are part of our Slack workspace.
          </Alert>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Contact Information:
            </Typography>
            <Button
              startIcon={<FaSlack />}
              variant="contained"
              color="primary"
              href="https://opportunity-hack.slack.com"
              target="_blank"
              rel="noopener noreferrer"
              fullWidth
              sx={{ mb: 2 }}
            >
              Open Slack
            </Button>

            <Typography variant="body2" paragraph>
              <strong>Suggested message:</strong>
            </Typography>
            <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography variant="body2">
                {suggestedMessage}
              </Typography>
            </Paper>
            <Button
              size="small"
              onClick={copyToClipboard}
              sx={{ mt: 1 }}
            >
              Copy to clipboard
            </Button>
          </Box>

          <Typography variant="subtitle1" gutterBottom>
            Why you should connect:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {hasSharedInterests && (
              <Chip 
                label="Shared Interests" 
                color="primary" 
                size="small" 
                icon={<FaHeart />} 
              />
            )}
            
            {hasComplementarySkills && (
              <Chip 
                label="Complementary Skills" 
                color="secondary" 
                size="small" 
                icon={<FaLink />} 
              />
            )}
            
            {matchScore >= 70 && (
              <Chip 
                label="High Match Score" 
                color="success" 
                size="small" 
                icon={<BsStarFill />} 
              />
            )}
          </Box>

          {/* Show common interests if any */}
          {hasSharedInterests && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Common interests:</strong>
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {myInterests.filter(interest => 
                  user.application?.interests?.includes(interest)
                ).map(interest => (
                  <Chip 
                    key={interest}
                    label={interest} 
                    size="small" 
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Show complementary skills */}
          {hasComplementarySkills && (
            <Box>
              <Typography variant="body2" gutterBottom>
                <strong>Their unique skills:</strong>
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                {user.application?.skills?.filter(skill => 
                  !mySkills.includes(skill)
                ).map(skill => (
                  <Chip 
                    key={skill}
                    label={skill} 
                    size="small" 
                    color="secondary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>
            Close
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              onToggleFavorite(user.user_id);
              onClose();
            }}
          >
            {isFavorited 
              ? 'Remove from Favorites' 
              : 'Add to Favorites'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message="Message copied to clipboard"
      />
    </>
  );
};

export default ContactDialog;