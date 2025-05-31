import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  TextField,
  Button,
  Rating,
  Chip,
  Divider,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  Checkbox,
  FormGroup,
  CircularProgress,
  Snackbar,
  Alert,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Fade
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import StarIcon from '@mui/icons-material/Star';
import HelpIcon from '@mui/icons-material/Help';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import InsightsIcon from '@mui/icons-material/Insights';
import { trackEvent } from '../../lib/ga';

// Styled components
const RatingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
}));

const StyledRating = styled(Rating)(({ theme }) => ({
  '& .MuiRating-iconFilled': {
    color: theme.palette.primary.main,
  },
}));

const TopicChip = styled(Chip)(({ theme, selected }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: selected ? theme.palette.primary.main : theme.palette.background.paper,
  color: selected ? theme.palette.primary.contrastText : theme.palette.text.primary,
  border: `1px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
  '&:hover': {
    backgroundColor: selected ? theme.palette.primary.dark : theme.palette.action.hover,
  },
  '& .MuiChip-label': {
    fontSize: '1.1rem',
    padding: '8px 12px'
  }
}));

/**
 * FeedbackSection component
 * Collects feedback from users about their onboarding experience
 */
const FeedbackSection = () => {
  // Form state
  const [overallRating, setOverallRating] = useState(0);
  const [usefulTopics, setUsefulTopics] = useState([]);
  const [missingTopics, setMissingTopics] = useState('');
  const [easeOfUnderstanding, setEaseOfUnderstanding] = useState('');
  const [improvements, setImprovements] = useState('');
  const [additionalFeedback, setAdditionalFeedback] = useState('');
  const [contactForFollowup, setContactForFollowup] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  
  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Available topics for feedback
  const topicOptions = [
    'Mission Overview', 
    'Community Channels', 
    'Introduction Guide', 
    'Slack Tutorial', 
    'Buddy System', 
    'FAQ Section'
  ];

  // Toggle a topic in the useful topics array
  const handleTopicToggle = (topic) => {
    if (usefulTopics.includes(topic)) {
      setUsefulTopics(usefulTopics.filter(t => t !== topic));
    } else {
      setUsefulTopics([...usefulTopics, topic]);
    }
  };

  // Show a snackbar message
  const showMessage = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setShowSnackbar(true);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Validate the form
    if (overallRating === 0) {
      showMessage('Please provide an overall rating before submitting.', 'error');
      setSubmitting(false);
      return;
    }

    if (contactForFollowup && (!email || !firstName)) {
      showMessage('Please provide your name and email if you would like us to follow up.', 'error');
      setSubmitting(false);
      return;
    }

    // Prepare feedback data
    const feedbackData = {
      overallRating,
      usefulTopics,
      missingTopics,
      easeOfUnderstanding,
      improvements,
      additionalFeedback,
      contactForFollowup: contactForFollowup ? { firstName, email } : false
    };

    // In a real implementation, this would send data to your backend
    console.log('Submitting feedback:', feedbackData);
    
    // Track feedback submission event
    trackEvent({
      action: 'onboarding_feedback_submitted',
      params: {
        rating: overallRating,
        topics_count: usefulTopics.length
      }
    });

    // Simulate API call with a timeout
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      showMessage('Thank you for your feedback! It helps us improve the onboarding experience.');
      
      // Reset form after a delay if needed
      // setTimeout(() => {
      //   resetForm();
      // }, 5000);
    }, 1500);
  };

  // Reset the form
  const resetForm = () => {
    setOverallRating(0);
    setUsefulTopics([]);
    setMissingTopics('');
    setEaseOfUnderstanding('');
    setImprovements('');
    setAdditionalFeedback('');
    setContactForFollowup(false);
    setFirstName('');
    setEmail('');
    setSubmitted(false);
  };

  return (
    <Box>
      {/* Header */}
      <Box mb={3} textAlign="center">
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontSize: '2.5rem' }}>
          Your Feedback Matters
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" sx={{ fontSize: '1.3rem' }}>
          Help us improve the onboarding experience for future members
        </Typography>
        <Divider sx={{ mt: 2, mb: 3 }} />
      </Box>

      {/* Why feedback matters */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <InsightsIcon fontSize="large" color="primary" sx={{ mt: 1, fontSize: '2.5rem' }} />
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontSize: '1.8rem' }}>
              Why Your Feedback Is Valuable
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontSize: '1.2rem' }}>
              Your insights help us create a better experience for new community members. 
              By sharing what worked well and what could be improved, you're directly 
              contributing to the growth and development of our community.
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Feedback form or thank you message */}
      {submitted ? (
        <Fade in={submitted}>
          <Card sx={{ mb: 4, p: 2, borderRadius: 2, border: '1px solid', borderColor: 'success.main' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <EmojiEventsIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h4" gutterBottom sx={{ fontSize: '2rem' }}>
                Thank You!
              </Typography>
              <Typography variant="body1" paragraph sx={{ fontSize: '1.2rem' }}>
                Your feedback has been submitted successfully and will help us improve the onboarding experience.
              </Typography>
              <Typography variant="body1" paragraph sx={{ fontSize: '1.2rem' }}>
                {contactForFollowup ? 
                  `We'll be in touch with you soon at ${email} to discuss your feedback further.` : 
                  'If you have any additional thoughts, feel free to share them in our Slack community.'}
              </Typography>
              <Button 
                variant="outlined" 
                color="primary"
                onClick={resetForm}
                sx={{ mt: 2, fontSize: '1.1rem', py: 1.5, px: 3 }}
              >
                Provide Additional Feedback
              </Button>
            </CardContent>
          </Card>
        </Fade>
      ) : (
        <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              {/* Overall rating */}
              <Grid item xs={12}>
                <RatingContainer>
                  <Box sx={{ mr: 2 }}>
                    <Typography variant="h6" id="overall-rating-label" sx={{ fontSize: '1.4rem' }}>
                      Overall Experience
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ fontSize: '1.1rem' }}>
                      How would you rate your onboarding experience?
                    </Typography>
                  </Box>
                  <StyledRating
                    name="overall-rating"
                    value={overallRating}
                    onChange={(event, newValue) => {
                      setOverallRating(newValue);
                    }}
                    precision={1}
                    icon={<StarIcon sx={{ fontSize: '2.5rem' }} />}
                    emptyIcon={<StarIcon sx={{ fontSize: '2.5rem' }} />}
                    aria-labelledby="overall-rating-label"
                    size="large"
                  />
                </RatingContainer>
              </Grid>

              {/* Most useful topics */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ fontSize: '1.4rem' }}>
                  Most Useful Content
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph sx={{ fontSize: '1.1rem' }}>
                  Which sections of the onboarding were most helpful to you? (Select all that apply)
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                  {topicOptions.map((topic) => (
                    <TopicChip
                      key={topic}
                      label={topic}
                      clickable
                      selected={usefulTopics.includes(topic)}
                      onClick={() => handleTopicToggle(topic)}
                    />
                  ))}
                </Box>
              </Grid>

              {/* Missing topics */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="What topics were missing or should be covered better?"
                  placeholder="E.g., 'More information about project workflow' or 'Details about technical requirements'"
                  multiline
                  rows={2}
                  value={missingTopics}
                  onChange={(e) => setMissingTopics(e.target.value)}
                  InputProps={{
                    style: { fontSize: '1.1rem' }
                  }}
                  InputLabelProps={{
                    style: { fontSize: '1.1rem' }
                  }}
                />
              </Grid>

              {/* Ease of understanding */}
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">
                    <Typography variant="h6" gutterBottom sx={{ fontSize: '1.4rem' }}>
                      Clarity & Understanding
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ fontSize: '1.1rem' }}>
                      How easy was it to understand the information presented?
                    </Typography>
                  </FormLabel>
                  <RadioGroup
                    name="ease-of-understanding"
                    value={easeOfUnderstanding}
                    onChange={(e) => setEaseOfUnderstanding(e.target.value)}
                  >
                    <Grid container spacing={1}>
                      <Grid item xs={12} sm={6}>
                        <FormControlLabel 
                          value="Very easy" 
                          control={<Radio />} 
                          label="Very easy to understand"
                          sx={{ '& .MuiFormControlLabel-label': { fontSize: '1.1rem' } }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControlLabel 
                          value="Mostly clear" 
                          control={<Radio />} 
                          label="Mostly clear with some questions"
                          sx={{ '& .MuiFormControlLabel-label': { fontSize: '1.1rem' } }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControlLabel 
                          value="Somewhat confusing" 
                          control={<Radio />} 
                          label="Somewhat confusing"
                          sx={{ '& .MuiFormControlLabel-label': { fontSize: '1.1rem' } }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControlLabel 
                          value="Very difficult" 
                          control={<Radio />} 
                          label="Very difficult to understand"
                          sx={{ '& .MuiFormControlLabel-label': { fontSize: '1.1rem' } }}
                        />
                      </Grid>
                    </Grid>
                  </RadioGroup>
                </FormControl>
              </Grid>

              {/* Suggestions for improvement */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="How could we improve the onboarding experience?"
                  placeholder="Please share any suggestions for making the onboarding better"
                  multiline
                  rows={3}
                  value={improvements}
                  onChange={(e) => setImprovements(e.target.value)}
                  InputProps={{
                    style: { fontSize: '1.1rem' }
                  }}
                  InputLabelProps={{
                    style: { fontSize: '1.1rem' }
                  }}
                />
              </Grid>

              {/* Additional feedback */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Additional Comments (Optional)"
                  placeholder="Any other thoughts or feedback you'd like to share"
                  multiline
                  rows={3}
                  value={additionalFeedback}
                  onChange={(e) => setAdditionalFeedback(e.target.value)}
                  InputProps={{
                    style: { fontSize: '1.1rem' }
                  }}
                  InputLabelProps={{
                    style: { fontSize: '1.1rem' }
                  }}
                />
              </Grid>

              {/* Contact for follow-up */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={contactForFollowup}
                      onChange={(e) => setContactForFollowup(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="I'm willing to discuss my feedback further"
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '1.1rem' } }}
                />
                
                {contactForFollowup && (
                  <Fade in={contactForFollowup}>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="First Name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required={contactForFollowup}
                          InputProps={{
                            style: { fontSize: '1.1rem' }
                          }}
                          InputLabelProps={{
                            style: { fontSize: '1.1rem' }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required={contactForFollowup}
                          InputProps={{
                            style: { fontSize: '1.1rem' }
                          }}
                          InputLabelProps={{
                            style: { fontSize: '1.1rem' }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Fade>
                )}
              </Grid>

              {/* Submit button */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={submitting}
                  startIcon={submitting ? <CircularProgress size={24} /> : null}
                  sx={{ 
                    py: 1.5, 
                    px: 4,
                    fontSize: '1.2rem',
                    '& .MuiButton-startIcon': {
                      '& .MuiCircularProgress-root': {
                        fontSize: '1.2rem'
                      }
                    }
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      )}

      {/* How we use feedback */}
      <Box mb={4}>
        <Typography variant="h5" gutterBottom sx={{ fontSize: '1.8rem' }}>
          How We Use Your Feedback
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ThumbUpIcon color="primary" sx={{ mr: 1, fontSize: '2rem' }} />
                  <Typography variant="h6" sx={{ fontSize: '1.4rem' }}>
                    Identify Strengths
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontSize: '1.1rem' }}>
                  We analyze what's working well to ensure we maintain the most helpful aspects of our onboarding process.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ThumbDownIcon color="error" sx={{ mr: 1, fontSize: '2rem' }} />
                  <Typography variant="h6" sx={{ fontSize: '1.4rem' }}>
                    Address Pain Points
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontSize: '1.1rem' }}>
                  We identify areas where new members struggle and prioritize improvements to make the experience smoother.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <HelpIcon color="info" sx={{ mr: 1, fontSize: '2rem' }} />
                  <Typography variant="h6" sx={{ fontSize: '1.4rem' }}>
                    Add Missing Content
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontSize: '1.1rem' }}>
                  We regularly update our onboarding with new information based on questions and feedback from members like you.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Feedback stats */}
      <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Tooltip title="Based on feedback from members who completed onboarding in the last 3 months">
            <IconButton size="small" sx={{ mr: 1 }}>
              <HelpIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Typography variant="h6" sx={{ fontSize: '1.4rem' }}>
            Onboarding Improvements from Member Feedback
          </Typography>
        </Box>
        <Typography variant="body2" component="ul" sx={{ fontSize: '1.1rem', '& li': { mb: 1 } }}>
          <li>Added more detailed Slack channel descriptions based on new member confusion</li>
          <li>Created step-by-step guides for common technical setup questions</li>
          <li>Improved the buddy matching system to connect new members faster</li>
          <li>Expanded FAQ section with questions frequently asked by new members</li>
          <li>Added more visual examples and screenshots to improve clarity</li>
        </Typography>
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSnackbar(false)} 
          severity={snackbarSeverity}
          sx={{ 
            width: '100%',
            '& .MuiAlert-message': { fontSize: '1.1rem' }
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FeedbackSection;