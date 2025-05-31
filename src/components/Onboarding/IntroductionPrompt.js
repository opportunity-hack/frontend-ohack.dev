import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField,
  Button,
  Chip,
  Stack,
  Grid,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  Checkbox,
  Alert,
  IconButton,
  Tooltip,
  Snackbar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuthInfo } from '@propelauth/react';
import { useEnv } from '../../context/env.context';

const IntroCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderLeft: `4px solid ${theme.palette.primary.main}`,
  backgroundColor: theme.palette.background.default
}));

const IntroTemplate = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.grey[50],
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  fontFamily: 'monospace',
  position: 'relative',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2)
}));

const skillsList = [
  'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue', 'Node.js', 'Express', 
  'Python', 'Django', 'Flask', 'Java', 'Spring', 'C#', '.NET', 'PHP', 'Laravel',
  'Ruby', 'Rails', 'Go', 'Rust', 'Swift', 'Kotlin', 'HTML/CSS', 'SQL', 'NoSQL',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'DevOps', 'CI/CD', 'GraphQL',
  'Mobile', 'UX/UI Design', 'Product Management', 'Data Science', 'Machine Learning',
  'Blockchain', 'Accessibility', 'Testing', 'Technical Writing'
];

const experienceLevels = [
  'Beginner', 'Intermediate', 'Advanced', 'Expert'
];

/**
 * IntroductionPrompt component
 * Helps new members craft and share their introduction to the community
 */
const IntroductionPrompt = () => {
  const { user } = useAuthInfo();
  const { slackSignupUrl } = useEnv();
  const [formData, setFormData] = useState({
    name: user?.firstName ? `${user.firstName} ${user.lastName || ''}` : '',
    role: '',
    location: '',
    background: '',
    skills: [],
    interests: '',
    goals: '',
    funFact: '',
    contactInfo: user?.email || '',
    shareOnSlack: true
  });
  const [selectedExperience, setSelectedExperience] = useState('');
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleExperienceSelect = (level) => {
    setSelectedExperience(level);
  };

  const handleSkillToggle = (skill) => {
    const newSkills = [...formData.skills];
    const skillIndex = newSkills.indexOf(skill);
    
    if (skillIndex === -1) {
      newSkills.push(skill);
    } else {
      newSkills.splice(skillIndex, 1);
    }
    
    setFormData({
      ...formData,
      skills: newSkills
    });
  };

  const handleShareChange = (e) => {
    setFormData({
      ...formData,
      shareOnSlack: e.target.checked
    });
  };

  const generateIntroduction = () => {
    const { name, role, location, background, skills, interests, goals, funFact, contactInfo } = formData;
    let intro = `👋 *Hello Opportunity Hack community!*\n\n`;
    
    intro += `I'm ${name}${role ? ` working as a ${role}` : ''}${location ? ` from ${location}` : ''}.\n\n`;
    
    if (background) {
      intro += `*Background:* ${background}\n\n`;
    }
    
    if (skills.length > 0) {
      intro += `*Skills:* ${skills.join(', ')}\n\n`;
    }
    
    if (selectedExperience) {
      intro += `*Experience Level:* ${selectedExperience}\n\n`;
    }
    
    if (interests) {
      intro += `*Interests:* ${interests}\n\n`;
    }
    
    if (goals) {
      intro += `*Goals for Opportunity Hack:* ${goals}\n\n`;
    }
    
    if (funFact) {
      intro += `*Fun fact:* ${funFact}\n\n`;
    }
    
    if (contactInfo) {
      intro += `*Contact:* ${contactInfo}\n\n`;
    }
    
    intro += `Looking forward to collaborating with you all! 🚀`;
    
    return intro;
  };

  const copyToClipboard = () => {
    const introText = generateIntroduction();
    navigator.clipboard.writeText(introText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  return (
    <Box>
      {/* Header */}
      <Box mb={3} textAlign="center">
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontSize: '2.5rem' }}>
          Introduce Yourself
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" sx={{ fontSize: '1.7rem' }}>
          Share your background and interests with the community
        </Typography>
        <Divider sx={{ mt: 2, mb: 3 }} />
      </Box>

      {/* Introduction guidance */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ fontSize: '2.3rem' }}>
          Why Introductions Matter
        </Typography>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.3rem' }}>
          Sharing a bit about yourself helps community members get to know you, find common interests, 
          and creates opportunities for collaboration. A good introduction can help you:
        </Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <IntroCard>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontSize: '1.5rem' }}>
                  Find Collaborators
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.25rem' }}>
                  Connect with others who share your interests or complementary skills
                </Typography>
              </CardContent>
            </IntroCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <IntroCard>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontSize: '1.5rem' }}>
                  Get Mentorship
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.25rem' }}>
                  Identify experienced members who can help guide your contributions
                </Typography>
              </CardContent>
            </IntroCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <IntroCard>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontSize: '1.5rem' }}>
                  Showcase Expertise
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.25rem' }}>
                  Let others know what you're skilled at and how you can contribute
                </Typography>
              </CardContent>
            </IntroCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <IntroCard>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontSize: '1.5rem' }}>
                  Feel Welcome
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.25rem' }}>
                  Breaking the ice makes it easier to participate in community discussions
                </Typography>
              </CardContent>
            </IntroCard>
          </Grid>
        </Grid>
      </Paper>

      {/* Introduction builder form */}
      <Typography variant="h4" gutterBottom sx={{ fontSize: '2.5rem' }}>
        Create Your Introduction
      </Typography>
      <Typography variant="body1" paragraph sx={{ fontSize: '1.3rem' }}>
        Fill out the form below to generate an introduction that you can share in our <b>#introductions</b> Slack channel.
      </Typography>

      <Grid container spacing={3}>
        {/* Left side - form inputs */}
        <Grid item xs={12} md={6}>
          <Stack spacing={3}>
            <TextField
              label="Your Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ style: { fontSize: '1.2rem' } }}
              InputProps={{ style: { fontSize: '1.2rem' } }}
            />
            <TextField
              label="Your Role (e.g., Software Engineer, Student)"
              name="role"
              value={formData.role}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ style: { fontSize: '1.2rem' } }}
              InputProps={{ style: { fontSize: '1.2rem' } }}
            />
            <TextField
              label="Your Location (Optional)"
              name="location"
              value={formData.location}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ style: { fontSize: '1.2rem' } }}
              InputProps={{ style: { fontSize: '1.2rem' } }}
            />
            <TextField
              label="Tell us about your background (Optional)"
              name="background"
              value={formData.background}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              InputLabelProps={{ style: { fontSize: '1.2rem' } }}
              InputProps={{ style: { fontSize: '1.2rem' } }}
            />

            <Box>
              <Typography variant="subtitle1" gutterBottom sx={{ fontSize: '1.25rem' }}>
                Experience Level
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {experienceLevels.map((level) => (
                  <Chip
                    key={level}
                    label={level}
                    clickable
                    color={selectedExperience === level ? 'primary' : 'default'}
                    onClick={() => handleExperienceSelect(level)}
                    sx={{ fontSize: '1.1rem' }}
                  />
                ))}
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle1" gutterBottom sx={{ fontSize: '1.25rem' }}>
                Skills (Select relevant ones)
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={1}>
                {skillsList.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    clickable
                    color={formData.skills.includes(skill) ? 'primary' : 'default'}
                    onClick={() => handleSkillToggle(skill)}
                    sx={{ fontSize: '1.1rem', m: 0.5 }}
                  />
                ))}
              </Stack>
            </Box>

            <TextField
              label="Your Interests (e.g., Social Causes, Technologies)"
              name="interests"
              value={formData.interests}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
              InputLabelProps={{ style: { fontSize: '1.2rem' } }}
              InputProps={{ style: { fontSize: '1.2rem' } }}
            />
            <TextField
              label="Your Goals for Opportunity Hack"
              name="goals"
              value={formData.goals}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
              InputLabelProps={{ style: { fontSize: '1.2rem' } }}
              InputProps={{ style: { fontSize: '1.2rem' } }}
            />
            <TextField
              label="Fun Fact about you (Optional)"
              name="funFact"
              value={formData.funFact}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ style: { fontSize: '1.2rem' } }}
              InputProps={{ style: { fontSize: '1.2rem' } }}
            />
             <TextField
              label="Contact Info (e.g., email, LinkedIn) (Optional)"
              name="contactInfo"
              value={formData.contactInfo}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ style: { fontSize: '1.2rem' } }}
              InputProps={{ style: { fontSize: '1.2rem' } }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.shareOnSlack}
                  onChange={handleShareChange}
                  name="shareOnSlack"
                />
              }
              label={<Typography variant="body1" sx={{ fontSize: '1.5rem' }}>Include this information in my generated introduction</Typography>}
            />
          </Stack>
        </Grid>

        {/* Right side - generated introduction preview */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: '1.3rem' }}>
            Generated Introduction Preview:
          </Typography>
          <IntroTemplate elevation={0}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', fontSize: '1.2rem' }}>
              {generateIntroduction()}
            </Typography>
            <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
              <Tooltip title={copied ? 'Copied!' : 'Copy to Clipboard'} placement="top">
                <IconButton onClick={copyToClipboard} size="small" color={copied ? 'success' : 'default'}>
                  {copied ? <CheckCircleIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
              <Snackbar
                open={copied}
                autoHideDuration={3000}
                onClose={() => setCopied(false)}
                message="Copied to Clipboard!"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              />
            </Box>
          </IntroTemplate>
          <Alert severity="info" sx={{ mt: 2, fontSize: '1.1rem' }}>
            Copy the generated introduction above and paste it into the #introductions channel in our Slack workspace. 
            <Button href={slackSignupUrl} target="_blank" rel="noopener noreferrer" variant="text" sx={{ fontSize: '1rem' }}>
              Join our Slack here
            </Button>
             if you haven't already.
          </Alert>
        </Grid>
      </Grid>
    </Box>
  );
};

export default IntroductionPrompt;