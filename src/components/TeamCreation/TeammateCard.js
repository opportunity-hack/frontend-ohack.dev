import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Avatar,
  Chip,
  Button,
  Divider,
  Tooltip
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { BsChatDots, BsStar, BsStarFill } from "react-icons/bs";

// Styled components
const ProfileCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 20px rgba(0, 0, 0, 0.15)',
  },
}));

const MatchScore = styled(Box)(({ theme, score }) => ({
  position: 'absolute',
  top: 10,
  right: 10,
  width: 45,
  height: 45,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 
    score >= 80 ? theme.palette.success.main :
    score >= 60 ? theme.palette.success.light :
    score >= 40 ? theme.palette.warning.light :
    theme.palette.grey[400],
  color: '#fff',
  fontWeight: 'bold',
  fontSize: '0.9rem',
  border: '2px solid #fff',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
}));

const InterestChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  fontWeight: 500,
}));

const SkillChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
}));

/**
 * TeammateCard Component
 * 
 * Displays a potential teammate's profile with match score, interests, and skills
 * 
 * @param {Object} teammate - The teammate user object
 * @param {Number} matchScore - Calculated match score (0-100)
 * @param {Array} myInterests - Current user's interests for highlighting matches
 * @param {Array} mySkills - Current user's skills for highlighting matches
 * @param {Boolean} isFavorited - Whether this teammate is in favorites
 * @param {Function} onContact - Handler for contact button
 * @param {Function} onToggleFavorite - Handler for favorite toggle
 */
const TeammateCard = ({
  teammate,
  matchScore,
  myInterests = [],
  mySkills = [],
  isFavorited = false,
  onContact,
  onToggleFavorite
}) => {
  return (
    <ProfileCard>
      <CardContent sx={{ position: 'relative', flexGrow: 1 }}>
        <MatchScore score={matchScore}>
          {matchScore}%
        </MatchScore>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            src={teammate.picture}
            alt={teammate.name || 'User'}
            sx={{ width: 50, height: 50, mr: 2 }}
          />
          <Box>
            <Typography variant="h6" component="div">
              {teammate.name || 'Anonymous User'}
            </Typography>
            {teammate.github && (
              <Typography variant="body2" color="text.secondary">
                GitHub: {teammate.github}
              </Typography>
            )}
          </Box>
        </Box>
        
        <Divider sx={{ mb: 1.5 }} />
        
        {teammate.application?.team_formation && (
          <Box sx={{ mb: 1.5 }}>
            <Chip
              size="small"
              label={
                teammate.application.team_formation === 'looking_for_members'
                  ? 'Looking for Team Members'
                  : 'Want to be Matched'
              }
              color="primary"
              variant="outlined"
            />
          </Box>
        )}
        
        {teammate.application?.background && (
          <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 1.5 }}>
            {teammate.application.background.length > 100
              ? `${teammate.application.background.substring(0, 100)}...`
              : teammate.application.background}
          </Typography>
        )}
        
        {teammate.application?.interests?.length > 0 && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="subtitle2" gutterBottom>
              Interests:
            </Typography>
            <Box>
              {teammate.application.interests.slice(0, 3).map((interest) => (
                <InterestChip
                  key={interest}
                  label={interest}
                  size="small"
                  variant={myInterests.includes(interest) ? "filled" : "outlined"}
                  color={myInterests.includes(interest) ? "primary" : "default"}
                />
              ))}
              {teammate.application.interests.length > 3 && (
                <Tooltip title={teammate.application.interests.slice(3).join(', ')}>
                  <Chip
                    label={`+${teammate.application.interests.length - 3} more`}
                    size="small"
                    variant="outlined"
                  />
                </Tooltip>
              )}
            </Box>
          </Box>
        )}
        
        {teammate.application?.skills?.length > 0 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Skills:
            </Typography>
            <Box>
              {teammate.application.skills.slice(0, 3).map((skill) => (
                <SkillChip
                  key={skill}
                  label={skill}
                  size="small"
                  variant={mySkills.includes(skill) ? "filled" : "outlined"}
                />
              ))}
              {teammate.application.skills.length > 3 && (
                <Tooltip title={teammate.application.skills.slice(3).join(', ')}>
                  <Chip
                    label={`+${teammate.application.skills.length - 3} more`}
                    size="small"
                    variant="outlined"
                  />
                </Tooltip>
              )}
            </Box>
          </Box>
        )}
      </CardContent>
      
      <CardActions sx={{ pt: 0 }}>
        <Button
          size="small"
          startIcon={<BsChatDots />}
          onClick={() => onContact(teammate)}
        >
          Contact
        </Button>
        <Button
          size="small"
          startIcon={isFavorited ? <BsStarFill /> : <BsStar />}
          color={isFavorited ? "warning" : "primary"}
          onClick={() => onToggleFavorite(teammate.user_id)}
        >
          {isFavorited ? 'Favorited' : 'Favorite'}
        </Button>
      </CardActions>
    </ProfileCard>
  );
};

export default TeammateCard;