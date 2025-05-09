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
        <Typography variant="h3" component="h1" gutterBottom>
          Introduce Yourself
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Share your background and interests with the community
        </Typography>
        <Divider sx={{ mt: 2, mb: 3 }} />
      </Box>

      {/* Introduction guidance */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Why Introductions Matter
        </Typography>
        <Typography variant="body1" paragraph>
          Sharing a bit about yourself helps community members get to know you, find common interests, 
          and creates opportunities for collaboration. A good introduction can help you:
        </Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <IntroCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Find Collaborators
                </Typography>
                <Typography variant="body2">
                  Connect with others who share your interests or complementary skills
                </Typography>
              </CardContent>
            </IntroCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <IntroCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Get Mentorship
                </Typography>
                <Typography variant="body2">
                  Identify experienced members who can help guide your contributions
                </Typography>
              </CardContent>
            </IntroCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <IntroCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Showcase Expertise
                </Typography>
                <Typography variant="body2">
                  Let others know what you're skilled at and how you can contribute
                </Typography>
              </CardContent>
            </IntroCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <IntroCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Feel Welcome
                </Typography>
                <Typography variant="body2">
                  Breaking the ice makes it easier to participate in community discussions
                </Typography>
              </CardContent>
            </IntroCard>
          </Grid>
        </Grid>
      </Paper>

      {/* Introduction builder form */}
      <Typography variant="h4" gutterBottom>
        Create Your Introduction
      </Typography>
      <Typography variant="body1" paragraph>
        Fill out the form below to generate an introduction that you can share in our #introductions Slack channel.
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
              required
            />
            
            <TextField
              label="Role/Title"
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="Software Engineer, Student, etc."
              fullWidth
            />
            
            <TextField
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City, Country"
              fullWidth
            />
            
            <TextField
              label="Professional Background"
              name="background"
              value={formData.background}
              onChange={handleChange}
              placeholder="Brief description of your background"
              multiline
              rows={2}
              fullWidth
            />
            
            {/* Experience level selection */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Development Experience Level
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {experienceLevels.map((level) => (
                  <Chip
                    key={level}
                    label={level}
                    clickable
                    color={selectedExperience === level ? 'primary' : 'default'}
                    onClick={() => handleExperienceSelect(level)}
                    sx={{ marginBottom: 1 }}
                  />
                ))}
              </Stack>
            </Box>
            
            {/* Skills selection */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Skills (select all that apply)
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxHeight: '150px', overflowY: 'auto' }}>
                {skillsList.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    clickable
                    size="small"
                    color={formData.skills.includes(skill) ? 'primary' : 'default'}
                    onClick={() => handleSkillToggle(skill)}
                    sx={{ marginBottom: 1 }}
                  />
                ))}
              </Box>
            </Box>
            
            <TextField
              label="Interests"
              name="interests"
              value={formData.interests}
              onChange={handleChange}
              placeholder="What tech or nonprofit causes interest you?"
              multiline
              rows={2}
              fullWidth
            />
            
            <TextField
              label="Goals for Opportunity Hack"
              name="goals"
              value={formData.goals}
              onChange={handleChange}
              placeholder="What do you hope to gain or contribute?"
              multiline
              rows={2}
              fullWidth
            />
            
            <TextField
              label="Fun Fact (optional)"
              name="funFact"
              value={formData.funFact}
              onChange={handleChange}
              placeholder="Share something interesting about yourself"
              fullWidth
            />
            
            <TextField
              label="Contact Info"
              name="contactInfo"
              value={formData.contactInfo}
              onChange={handleChange}
              placeholder="Email, GitHub, LinkedIn, etc."
              fullWidth
            />
          </Stack>
        </Grid>
        
        {/* Right side - preview and share */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" gutterBottom>
              Preview
            </Typography>
            
            <IntroTemplate>
              <Tooltip title="Copy to clipboard">
                <IconButton 
                  onClick={copyToClipboard} 
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                  color={copied ? "success" : "default"}
                >
                  {copied ? <CheckCircleIcon /> : <ContentCopyIcon />}
                </IconButton>
              </Tooltip>
              
              <Box sx={{ whiteSpace: 'pre-wrap', pr: 4 }}>
                {generateIntroduction()}
              </Box>
            </IntroTemplate>
            
            <Box sx={{ mt: 'auto', pt: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={formData.shareOnSlack} 
                    onChange={handleShareChange}
                    color="primary"
                  />
                }
                label="I'm ready to share this in the #introductions channel"
              />
              
              <Box sx={{ mt: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth
                  size="large"
                  onClick={copyToClipboard}
                  startIcon={<ContentCopyIcon />}
                >
                  Copy Introduction
                </Button>
                
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Paste your introduction in the{' '}
                    <strong>#introductions</strong> channel on our{' '}
                    <a href={slackSignupUrl} target="_blank" rel="noopener noreferrer">
                      Slack workspace
                    </a>.
                  </Typography>
                </Alert>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Tips section */}
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Introduction Tips
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Do's
              </Typography>
              <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
                <li>Be authentic and approachable</li>
                <li>Share your experience level honestly</li>
                <li>Mention specific skills and interests</li>
                <li>Include your learning goals</li>
                <li>Add a personal touch with a fun fact</li>
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Don'ts
              </Typography>
              <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
                <li>Don't share sensitive personal information</li>
                <li>Avoid being too formal or impersonal</li>
                <li>Don't downplay your skills or experience</li>
                <li>Keep it reasonably concise</li>
                <li>Avoid technical jargon that might not be familiar to all</li>
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Success Snackbar for copy action */}
      <Snackbar
        open={copied}
        autoHideDuration={3000}
        onClose={() => setCopied(false)}
        message="Introduction copied to clipboard!"
      />
    </Box>
  );
};

export default IntroductionPrompt;