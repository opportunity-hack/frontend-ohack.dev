import React, { useState, useCallback } from "react";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Typography,
  Box,
  Container,
  Snackbar,
  CircularProgress,
  Slider,
  Tooltip,
  Paper,
  Grid,
  Stepper,
  Step,
  StepLabel,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  FormLabel,
  FormGroup,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import Alert from "@mui/material/Alert";
import InfoIcon from "@mui/icons-material/Info";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import BusinessIcon from "@mui/icons-material/Business";
import isAfter from "date-fns/isAfter";
import isBefore from "date-fns/isBefore";
import addDays from "date-fns/addDays";
import addMonths from "date-fns/addMonths";
import isValid from "date-fns/isValid";
import isFriday from "date-fns/isFriday";
import format from "date-fns/format";
import { debounce } from "lodash";
import * as ga from "../../lib/ga";

// Value label component for the slider
function ValueLabelComponent(props) {
  const { children, value } = props;

  return (
    <Tooltip
      enterTouchDelay={0}
      placement="top"
      title={`$${value.toLocaleString()}`}
    >
      {children}
    </Tooltip>
  );
}

// Calculate per-person budget
const calculatePerPersonBudget = (totalBudget, employeeCount) => {
  const countRanges = {
    "50": 50,
    "100": 100,    
    "200": 200,
    "300": 300,
    "500": 500,
    "1000+": 1000
  };
  const averageCount = countRanges[employeeCount] || 0;
  return averageCount ? Math.round(totalBudget / averageCount) : 0;
};

// Form steps
const steps = [
  'Your Information',
  'Event Details',
  'Nonprofit Engagement',
  'Responsibilities',
  'Budget & Support'
];

const HackathonRequestForm = ({ initialData, onSubmit, isEdit = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State management
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState(initialData || {
    // Basic information
    companyName: "",
    organizationType: "corporate", // corporate, university, community
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    
    // Event details
    employeeCount: "",
    participantType: [], // internal-staff, students, industry-professionals, mixed
    hackathonTheme: "", // social-impact, api-integration, internal-products, custom
    customTheme: "", // If they select custom theme
    expectedHackathonDate: null, // Expected hackathon date (at least 5 months in future)
    preferredDate: null, // Call date (Friday)
    alternateDate: null, // Alternate call date (Friday)
    location: "",
    eventFormat: "in-person", // in-person, virtual, hybrid
    
    // Nonprofit engagement
    hasNonprofitList: null, // yes, no, partial
    nonprofitDetails: "", // Details about nonprofits if they have a list
    hasWorkedWithNonprofitsBefore: null, // yes, no
    nonprofitSource: [], // options: own-list, ohack-support, open-call
    preferredNonprofitLocation: "", // local, global, specific-region
    specificRegion: "",
    
    // Responsibilities
    responsibilities: {
      venue: "requestor", // requestor, ohack, shared
      food: "requestor",
      prizes: "shared",
      judges: "shared",
      mentors: "shared",
      marketing: "requestor",
      nonprofitRecruitment: "shared",
      participantRecruitment: "requestor",
      postEventSupport: "shared",
    },
    
    // Support & budget
    budget: 15000,
    donationPercentage: 20, // Default suggested donation percentage
    additionalInfo: "",
    
    // Agreements
    agreeToContact: false,
    agreeToTimeline: false,
  });
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Track events with Google Analytics
  const trackEvent = useCallback(
    debounce((action, category, label, value) => {
      ga.event({
        action,
        category,
        label,
        value,
      });
    }, 500),
    []
  );

  // Validate call date is a Friday at least 1 week in advance and within 30 days
  const validateCallDate = (date) => {
    if (!date || !isValid(date)) return false;
    
    const today = new Date();
    const oneWeekFromNow = addDays(today, 7);
    const thirtyDaysFromNow = addDays(today, 30);
    
    return (
      isFriday(date) &&
      isAfter(date, oneWeekFromNow) &&
      isBefore(date, thirtyDaysFromNow)
    );
  };
  
  // Validate hackathon date is at least 2 months in the future
  const validateHackathonDate = (date) => {
    if (!date || !isValid(date)) return false;
    
    const today = new Date();
    const twoMonthsFromNow = addMonths(today, 2);
    
    return isAfter(date, twoMonthsFromNow);
  };

  // Validate email format
  const validateEmail = (email) => {
    // Pattern for standard email format
    const standardEmailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    // Pattern for "Name <email@example.com>" format
    const nameEmailPattern = /^[^<>]+<[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}>$/;
    
    return standardEmailPattern.test(email) || nameEmailPattern.test(email);
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    trackEvent("input", "HackathonRequestForm", `${name}_changed`);
    
    // Clear specific field error when user edits
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: checked }));
    trackEvent("input", "HackathonRequestForm", `${name}_changed`, checked ? 1 : 0);
    
    // Clear error when edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle multiple selection checkbox changes
  const handleMultiSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      const currentValues = prevData[name] || [];
      return {
        ...prevData,
        [name]: currentValues.includes(value)
          ? currentValues.filter(item => item !== value)
          : [...currentValues, value]
      };
    });
    trackEvent("input", "HackathonRequestForm", `${name}_changed`);
  };

  // Handle responsibility selection
  const handleResponsibilityChange = (area, value) => {
    setFormData((prevData) => ({
      ...prevData,
      responsibilities: {
        ...prevData.responsibilities,
        [area]: value
      }
    }));
    trackEvent("input", "HackathonRequestForm", `responsibility_${area}_changed`, value);
  };
  
  // Handle date changes
  const handleDateChange = (name, date) => {
    setFormData((prevData) => ({ ...prevData, [name]: date }));
    trackEvent("input", "HackathonRequestForm", `${name}_changed`);
    
    // Validate date selection
    if (name === 'preferredDate' || name === 'alternateDate') {
      const isValidCallDate = validateCallDate(date);
      setErrors((prev) => ({ 
        ...prev, 
        [name]: isValidCallDate ? undefined : "Please select a Friday at least 7 days from now and within 30 days"
      }));
    } else if (name === 'expectedHackathonDate') {
      const isValidHackathonDate = validateHackathonDate(date);
      setErrors((prev) => ({ 
        ...prev, 
        [name]: isValidHackathonDate ? undefined : "Hackathon date should be at least 2 months in the future to allow for proper planning"
      }));
    }
  };

  // Handle slider changes
  const handleSliderChange = (event, newValue) => {
    setFormData((prevData) => ({ ...prevData, budget: newValue }));
    trackEvent("input", "HackathonRequestForm", "budget_changed", newValue);
  };

  // Handle donation percentage change
  const handleDonationSliderChange = (event, newValue) => {
    setFormData((prevData) => ({ ...prevData, donationPercentage: newValue }));
    trackEvent("input", "HackathonRequestForm", "donation_percentage_changed", newValue);
  };

  // Validate the current step's fields
  const validateStep = () => {
    const newErrors = {};
    
    // Step 1 validation
    if (activeStep === 0) {
      if (!formData.companyName) newErrors.companyName = "Required";
      if (!formData.organizationType) newErrors.organizationType = "Required";
      if (!formData.contactName) newErrors.contactName = "Required";
      if (!formData.contactEmail) newErrors.contactEmail = "Required";
      else if (!validateEmail(formData.contactEmail)) 
        newErrors.contactEmail = "Please enter a valid email address (e.g., email@example.com or Name <email@example.com>)";
      if (!formData.contactPhone) newErrors.contactPhone = "Required";
    }
    
    // Step 2 validation
    else if (activeStep === 1) {
      if (!formData.employeeCount) newErrors.employeeCount = "Required";
      if (!formData.participantType || formData.participantType.length === 0) {
        newErrors.participantType = "Please select at least one participant type";
      }
      if (!formData.hackathonTheme) newErrors.hackathonTheme = "Required";
      if (formData.hackathonTheme === 'custom' && !formData.customTheme) {
        newErrors.customTheme = "Please describe your custom theme";
      }
      if (!formData.preferredDate) newErrors.preferredDate = "Required";
      if (formData.preferredDate && !validateCallDate(formData.preferredDate)) {
        newErrors.preferredDate = "Must be a Friday at least 7 days from now and within 30 days";
      }
      if (formData.alternateDate && !validateCallDate(formData.alternateDate)) {
        newErrors.alternateDate =
          "Must be a Friday at least 7 days from now and within 30 days";
      }
      if (!formData.location) newErrors.location = "Required";
      if (!formData.eventFormat) newErrors.eventFormat = "Required";
    }
    
    // Step 3 validation
    else if (activeStep === 2) {
      const isInternalFocused = formData.hackathonTheme === 'internal-products' && formData.organizationType === 'corporate';
      
      if (!isInternalFocused) {
        if (formData.hasNonprofitList === null) newErrors.hasNonprofitList = "Required";
        if (formData.hasNonprofitList !== 'yes' && (!formData.nonprofitSource || formData.nonprofitSource.length === 0)) {
          newErrors.nonprofitSource = "Please select at least one option";
        }
        if (!formData.preferredNonprofitLocation) newErrors.preferredNonprofitLocation = "Required";
        if (formData.preferredNonprofitLocation === "specific-region" && !formData.specificRegion) {
          newErrors.specificRegion = "Required";
        }
      }
    }
    
    // Step 5 validation
    else if (activeStep === 4) {
      if (!formData.budget || formData.budget < 5000) newErrors.budget = "Minimum budget is $5,000";
      if (!formData.agreeToContact) newErrors.agreeToContact = "Required";
      if (!formData.agreeToTimeline) newErrors.agreeToTimeline = "Required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Move to the next step
  const handleNext = () => {
    if (validateStep()) {
      if (activeStep === steps.length - 1) {
        handleSubmit();
      } else {
        setActiveStep((prevStep) => prevStep + 1);
        trackEvent("navigation", "HackathonRequestForm", `move_to_step_${activeStep + 1}`);
        window.scrollTo(0, 0);
      }
    }
  };

  // Move to the previous step
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    trackEvent("navigation", "HackathonRequestForm", `move_to_step_${activeStep - 1}`);
    window.scrollTo(0, 0);
  };

  // Submit the form
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      trackEvent(
        "submit",
        "HackathonRequestForm",
        isEdit ? "form_updated" : "form_submitted",
        formData.budget
      );
      setSnackbar({
        open: true,
        message: isEdit 
          ? "Your request has been updated successfully."
          : "Thank you for your interest! We'll be in touch soon to discuss how we can make your hackathon a success.",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "An error occurred. Please try again or contact us directly.",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate estimated donation amount
  const calculatedDonation = Math.round(formData.budget * (formData.donationPercentage / 100));

  // Get responsible party label
  const getResponsibilityLabel = (value) => {
    switch(value) {
      case 'requestor': return 'Your Organization';
      case 'ohack': return 'Opportunity Hack';
      case 'shared': return 'Shared Responsibility';
      default: return '';
    }
  };

  return (
    <>
      <Paper 
        elevation={2} 
        sx={{ 
          p: 4, 
          borderRadius: 2,
          mb: 8 
        }}
      >
        <Stepper 
          activeStep={activeStep} 
          alternativeLabel={!isMobile}
          orientation={isMobile ? 'vertical' : 'horizontal'}
          sx={{ mb: 4 }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {/* Step 1: Your Information */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="h5" component="h2" gutterBottom>
              Tell Us About Your Organization
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Organization Name"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  error={!!errors.companyName}
                  helperText={errors.companyName}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <FormLabel id="organization-type-label">Organization Type</FormLabel>
                  <RadioGroup
                    row
                    aria-labelledby="organization-type-label"
                    name="organizationType"
                    value={formData.organizationType}
                    onChange={handleChange}
                  >
                    <FormControlLabel 
                      value="corporate" 
                      control={<Radio />} 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <BusinessIcon sx={{ mr: 1 }} />
                          Corporate
                        </Box>
                      } 
                    />
                    <FormControlLabel 
                      value="university" 
                      control={<Radio />} 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <SchoolIcon sx={{ mr: 1 }} />
                          University/College
                        </Box>
                      } 
                    />
                    <FormControlLabel 
                      value="community" 
                      control={<Radio />} 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PeopleIcon sx={{ mr: 1 }} />
                          Community Group
                        </Box>
                      } 
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Contact Name"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  error={!!errors.contactName}
                  helperText={errors.contactName}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Contact Email"
                  name="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  error={!!errors.contactEmail}
                  helperText={errors.contactEmail}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Contact Phone"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  error={!!errors.contactPhone}
                  helperText={errors.contactPhone}
                  required
                />
              </Grid>
            </Grid>
          </Box>
        )}
        
        {/* Step 2: Event Details */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h5" component="h2" gutterBottom>
              Event Details
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="employee-count-label">Expected Participant Count</InputLabel>
                  <Select
                    labelId="employee-count-label"
                    name="employeeCount"
                    value={formData.employeeCount}
                    onChange={handleChange}
                    label="Expected Participant Count"
                    error={!!errors.employeeCount}
                    required
                  >
                    <MenuItem value="50">~50 participants</MenuItem>
                    <MenuItem value="100">~100 participants</MenuItem>
                    <MenuItem value="200">~200 participants</MenuItem>
                    <MenuItem value="300">~300 participants</MenuItem>
                    <MenuItem value="500">~500 participants</MenuItem>
                    <MenuItem value="1000+">1000+ participants</MenuItem>
                  </Select>
                  {errors.employeeCount && (
                    <Typography color="error" variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                      {errors.employeeCount}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl component="fieldset" fullWidth margin="normal" error={!!errors.participantType}>
                  <FormLabel component="legend">Who will participate in your hackathon?</FormLabel>
                  <Typography variant="body1" color="textSecondary" sx={{ mb: 2, fontWeight: 500 }}>
                    Select all that apply
                  </Typography>
                  <FormGroup row>
                    {/* Show internal staff option only for corporate organizations */}
                    {formData.organizationType === 'corporate' && (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.participantType.includes('internal-staff')}
                            onChange={() => handleMultiSelectChange({ target: { name: 'participantType', value: 'internal-staff' } })}
                          />
                        }
                        label="Internal staff (software engineers, product managers, designers)"
                      />
                    )}
                    
                    {/* Show students option for all organization types, with customized label based on type */}
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.participantType.includes('students')}
                          onChange={() => handleMultiSelectChange({ target: { name: 'participantType', value: 'students' } })}
                        />
                      }
                      label={formData.organizationType === 'university' 
                        ? "Students from your institution" 
                        : "Students from local universities"}
                    />
                    
                    {/* Show faculty option only for universities */}
                    {formData.organizationType === 'university' && (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.participantType.includes('faculty')}
                            onChange={() => handleMultiSelectChange({ target: { name: 'participantType', value: 'faculty' } })}
                          />
                        }
                        label="Faculty and staff members"
                      />
                    )}
                    
                    {/* Show community members for community organizations */}
                    {formData.organizationType === 'community' && (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.participantType.includes('community-members')}
                            onChange={() => handleMultiSelectChange({ target: { name: 'participantType', value: 'community-members' } })}
                          />
                        }
                        label="Community group members"
                      />
                    )}
                    
                    {/* Industry professionals option for all organizations */}
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.participantType.includes('industry-professionals')}
                          onChange={() => handleMultiSelectChange({ target: { name: 'participantType', value: 'industry-professionals' } })}
                        />
                      }
                      label="Industry professionals from the area"
                    />
                  </FormGroup>
                  {errors.participantType && (
                    <Typography color="error" variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                      {errors.participantType}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <FormLabel id="event-format-label">Event Format</FormLabel>
                  <RadioGroup
                    row
                    aria-labelledby="event-format-label"
                    name="eventFormat"
                    value={formData.eventFormat}
                    onChange={handleChange}
                  >
                    <FormControlLabel value="in-person" control={<Radio />} label="In-Person" />
                    <FormControlLabel value="virtual" control={<Radio />} label="Virtual" />
                    <FormControlLabel value="hybrid" control={<Radio />} 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography sx={{ mr: 0.5 }}>Hybrid</Typography>
                          <Tooltip
                            title="Based on our experience, hybrid events can be challenging to manage. We recommend choosing either in-person or virtual for the best participant experience."
                            placement="top"
                          >
                            <InfoIcon fontSize="small" color="warning" />
                          </Tooltip>
                        </Box>
                      } 
                    />
                  </RadioGroup>
                  {errors.eventFormat && (
                    <Typography color="error" variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                      {errors.eventFormat}
                    </Typography>
                  )}
                  {formData.eventFormat === 'hybrid' && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Hybrid events require additional coordination and resources. We recommend choosing either in-person or virtual for optimal engagement.
                      </Typography>
                    </Alert>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth component="fieldset" margin="normal">
                  <FormLabel component="legend">What theme or focus would you like for your hackathon?</FormLabel>
                  <RadioGroup
                    row
                    name="hackathonTheme"
                    value={formData.hackathonTheme}
                    onChange={handleChange}
                  >
                    <FormControlLabel 
                      value="social-impact" 
                      control={<Radio />} 
                      label="Social Impact (projects for nonprofits)"
                    />
                    
                    {/* API/Product integration only for corporate */}
                    {formData.organizationType === 'corporate' && (
                      <FormControlLabel 
                        value="api-integration" 
                        control={<Radio />} 
                        label="API/Product Integration (incorporating your company's products)"
                      />
                    )}
                    
                    {/* Internal products only for corporate */}
                    {formData.organizationType === 'corporate' && (
                      <FormControlLabel 
                        value="internal-products" 
                        control={<Radio />} 
                        label="Internal Products/Tools Improvement"
                      />
                    )}
                    
                    {/* Educational option for universities */}
                    {formData.organizationType === 'university' && (
                      <FormControlLabel 
                        value="educational" 
                        control={<Radio />} 
                        label="Educational (curriculum-aligned projects)"
                      />
                    )}
                    
                    {/* Local impact for community groups */}
                    {formData.organizationType === 'community' && (
                      <FormControlLabel 
                        value="local-impact" 
                        control={<Radio />} 
                        label="Local Community Impact"
                      />
                    )}
                    
                    <FormControlLabel 
                      value="custom" 
                      control={<Radio />} 
                      label="Custom Theme"
                    />
                  </RadioGroup>
                  {errors.hackathonTheme && (
                    <Typography color="error" variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                      {errors.hackathonTheme}
                    </Typography>
                  )}
                </FormControl>
                
                {formData.hackathonTheme === 'custom' && (
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Describe your custom theme"
                    name="customTheme"
                    value={formData.customTheme}
                    onChange={handleChange}
                    placeholder="E.g., 'AI for Social Good', 'Climate Tech Solutions', etc."
                    error={!!errors.customTheme}
                    helperText={errors.customTheme}
                  />
                )}
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>When would you like to host your hackathon?</Typography>
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    💡 We recommend planning at least 2 months in advance to ensure a successful event with proper preparation.
                  </Typography>
                </Alert>
                
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Expected Hackathon Date"
                    value={formData.expectedHackathonDate}
                    onChange={(date) => handleDateChange('expectedHackathonDate', date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        margin: "normal",
                        error: !!errors.expectedHackathonDate,
                        helperText: errors.expectedHackathonDate || "Plan for at least 2 months of preparation time"
                      }
                    }}
                    minDate={addMonths(new Date(), 2)}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Schedule a Planning Call</Typography>
                <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.light', borderRadius: 2, border: '1px solid', borderColor: 'primary.main' }}>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: 'primary.contrastText' }}>
                    📞 Please select a Friday for an initial planning call. Our team will confirm the call details after reviewing your request.
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Preferred Call Date (Friday)"
                    value={formData.preferredDate}
                    onChange={(date) => handleDateChange('preferredDate', date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        margin: "normal",
                        error: !!errors.preferredDate,
                        helperText: errors.preferredDate
                      }
                    }}
                    shouldDisableDate={(date) => !isFriday(date)}
                    minDate={addDays(new Date(), 7)}
                    maxDate={addDays(new Date(), 30)}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Alternate Call Date (Friday)"
                    value={formData.alternateDate}
                    onChange={(date) => handleDateChange('alternateDate', date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        margin: "normal",
                        error: !!errors.alternateDate,
                        helperText: errors.alternateDate
                      }
                    }}
                    shouldDisableDate={(date) => !isFriday(date)}
                    minDate={addDays(new Date(), 7)}
                    maxDate={addDays(new Date(), 30)}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Location (City, State/Province, Country)"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  error={!!errors.location}
                  helperText={errors.location}
                  required
                />
              </Grid>
            </Grid>
          </Box>
        )}
        
        {/* Step 3: Nonprofit Engagement */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h5" component="h2" gutterBottom>
              {(['internal-products', 'api-integration'].includes(formData.hackathonTheme) && formData.organizationType === 'corporate') 
                ? 'Internal Focus & Engagement' 
                : (formData.hackathonTheme === 'educational' && formData.organizationType === 'university')
                  ? 'Educational Focus & Engagement'
                  : 'Nonprofit Engagement'}
            </Typography>
            
            {(formData.hackathonTheme === 'internal-products' && formData.organizationType === 'corporate') && (
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  mb: 4,
                  bgcolor: theme.palette.info.light + '30',
                  border: `1px solid ${theme.palette.info.light}`,
                  borderRadius: 2
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <InfoIcon sx={{ color: theme.palette.info.main, mr: 2, mt: 0.5 }} />
                  <Typography variant="body1">
                    You've selected an internal product-focused hackathon. While this won't directly involve nonprofits, 
                    we can still help you organize an effective event that drives innovation within your organization.
                  </Typography>
                </Box>
              </Paper>
            )}
            
            {(formData.hackathonTheme === 'api-integration' && formData.organizationType === 'corporate') && (
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  mb: 4,
                  bgcolor: theme.palette.info.light + '30',
                  border: `1px solid ${theme.palette.info.light}`,
                  borderRadius: 2
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <InfoIcon sx={{ color: theme.palette.info.main, mr: 2, mt: 0.5 }} />
                  <Typography variant="body1">
                    You've selected an API/Product integration hackathon. You can choose to work with nonprofits who might 
                    benefit from your products, or focus on developers building with your APIs.
                  </Typography>
                </Box>
              </Paper>
            )}
            
            {(formData.hackathonTheme === 'educational' && formData.organizationType === 'university') && (
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  mb: 4,
                  bgcolor: theme.palette.info.light + '30',
                  border: `1px solid ${theme.palette.info.light}`,
                  borderRadius: 2
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <InfoIcon sx={{ color: theme.palette.info.main, mr: 2, mt: 0.5 }} />
                  <Typography variant="body1">
                    You've selected an educational hackathon. This can be aligned with curriculum goals while still 
                    supporting nonprofits, or can focus entirely on educational outcomes.
                  </Typography>
                </Box>
              </Paper>
            )}
            
            {!(['internal-products'].includes(formData.hackathonTheme) && formData.organizationType === 'corporate') ? (
              <>
                <Box sx={{ mb: 4 }}>
                  <FormControl fullWidth component="fieldset" margin="normal">
                    <FormLabel component="legend">Do you already have nonprofits/NGOs identified for this hackathon?</FormLabel>
                    <RadioGroup
                      row
                      name="hasNonprofitList"
                      value={formData.hasNonprofitList}
                      onChange={handleChange}
                    >
                      <FormControlLabel value="yes" control={<Radio />} label="Yes, we have a complete list" />
                      <FormControlLabel value="partial" control={<Radio />} label="We have some identified" />
                      <FormControlLabel value="no" control={<Radio />} label="No, we need help" />
                    </RadioGroup>
                    {errors.hasNonprofitList && (
                      <Typography color="error" variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                        {errors.hasNonprofitList}
                      </Typography>
                    )}
                  </FormControl>
                  
                  {(formData.hasNonprofitList === 'yes' || formData.hasNonprofitList === 'partial') && (
                    <>
                      <TextField
                        fullWidth
                        margin="normal"
                        label="Please list the nonprofits/NGOs you're considering"
                        name="nonprofitDetails"
                        multiline
                        rows={3}
                        value={formData.nonprofitDetails}
                        onChange={handleChange}
                        placeholder="Please provide the names of the nonprofits/NGOs you're planning to work with"
                      />
                      
                      <FormControl fullWidth component="fieldset" margin="normal" sx={{ mt: 2 }}>
                        <FormLabel component="legend">Have you worked with these nonprofits/NGOs before?</FormLabel>
                        <RadioGroup
                          row
                          name="hasWorkedWithNonprofitsBefore"
                          value={formData.hasWorkedWithNonprofitsBefore}
                          onChange={handleChange}
                        >
                          <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                          <FormControlLabel value="no" control={<Radio />} label="No, this would be our first collaboration" />
                        </RadioGroup>
                      </FormControl>
                    </>
                  )}
                </Box>
                
                <Box sx={{ mb: 4 }}>
                  {formData.hasNonprofitList !== 'yes' && (
                    <FormControl component="fieldset" fullWidth margin="normal" error={!!errors.nonprofitSource}>
                      <FormLabel component="legend">How would you like to source {formData.hasNonprofitList === 'partial' ? 'additional ' : ''}nonprofits for your hackathon?</FormLabel>
                      <FormGroup>
                        {formData.hasNonprofitList !== 'partial' && (
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formData.nonprofitSource.includes('own-list')}
                                onChange={() => handleMultiSelectChange({ target: { name: 'nonprofitSource', value: 'own-list' } })}
                              />
                            }
                            label="We'll provide our own nonprofit partners"
                          />
                        )}
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.nonprofitSource.includes('ohack-support')}
                              onChange={() => handleMultiSelectChange({ target: { name: 'nonprofitSource', value: 'ohack-support' } })}
                            />
                          }
                          label="We'd like Opportunity Hack to help identify nonprofits"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.nonprofitSource.includes('open-call')}
                              onChange={() => handleMultiSelectChange({ target: { name: 'nonprofitSource', value: 'open-call' } })}
                            />
                          }
                          label="We'd like to do an open call for nonprofit applications"
                        />
                      </FormGroup>
                      {errors.nonprofitSource && (
                        <Typography color="error" variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                          {errors.nonprofitSource}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                </Box>
                
                <Box>
                  <FormControl fullWidth component="fieldset" margin="normal">
                    <FormLabel component="legend">Preferred Nonprofit Location</FormLabel>
                    <RadioGroup
                      name="preferredNonprofitLocation"
                      value={formData.preferredNonprofitLocation}
                      onChange={handleChange}
                    >
                      <FormControlLabel value="local" control={<Radio />} label="Local to our event location" />
                      <FormControlLabel value="global" control={<Radio />} label="Global nonprofits welcome" />
                      <FormControlLabel value="specific-region" control={<Radio />} label="From a specific region" />
                    </RadioGroup>
                    {errors.preferredNonprofitLocation && (
                      <Typography color="error" variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                        {errors.preferredNonprofitLocation}
                      </Typography>
                    )}
                  </FormControl>
                  
                  {formData.preferredNonprofitLocation === 'specific-region' && (
                    <TextField
                      fullWidth
                      margin="normal"
                      label="Specify Region"
                      name="specificRegion"
                      value={formData.specificRegion}
                      onChange={handleChange}
                      error={!!errors.specificRegion}
                      helperText={errors.specificRegion || "E.g., Southeast Asia, East Africa, European Union, etc."}
                      required
                    />
                  )}
                </Box>
              </>
            ) : (
              <Box sx={{ mb: 4 }}>
                {formData.hackathonTheme === 'internal-products' && formData.organizationType === 'corporate' ? (
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Tell us about your internal hackathon goals"
                    name="additionalInfo"
                    multiline
                    rows={4}
                    value={formData.additionalInfo}
                    onChange={handleChange}
                    placeholder="Describe the specific internal products or tools you'd like to focus on during the hackathon, any particular challenges you're facing, or outcomes you hope to achieve..."
                  />
                ) : formData.hackathonTheme === 'api-integration' && formData.organizationType === 'corporate' ? (
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Tell us about your API/product integration goals"
                    name="additionalInfo"
                    multiline
                    rows={4}
                    value={formData.additionalInfo}
                    onChange={handleChange}
                    placeholder="Describe your APIs/products that you'd like participants to work with, integration opportunities, and potential use cases..."
                  />
                ) : formData.hackathonTheme === 'educational' && formData.organizationType === 'university' ? (
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Tell us about your educational goals"
                    name="additionalInfo"
                    multiline
                    rows={4}
                    value={formData.additionalInfo}
                    onChange={handleChange}
                    placeholder="Describe how the hackathon aligns with curriculum goals, skills you want students to develop, and any specific educational outcomes..."
                  />
                ) : (
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Tell us about your hackathon goals"
                    name="additionalInfo"
                    multiline
                    rows={4}
                    value={formData.additionalInfo}
                    onChange={handleChange}
                    placeholder="Describe your goals for this hackathon, any specific challenges you want to address, and desired outcomes..."
                  />
                )}
              </Box>
            )}
          </Box>
        )}
        
        {/* Step 4: Responsibilities */}
        {activeStep === 3 && (
          <Box>
            <Typography variant="h5" component="h2" gutterBottom>
              Division of Responsibilities
            </Typography>
            
            <Typography variant="body1" paragraph sx={{ mb: 3, fontWeight: 500 }}>
              Please indicate who will be responsible for each aspect of the hackathon.
              This helps us understand how to best support you.
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f9ff' }}>
                  <Typography variant="subtitle1" component="h3" gutterBottom fontWeight={600}>
                    Event Logistics
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>Venue & Equipment</Typography>
                    <RadioGroup
                      row
                      name="venue"
                      value={formData.responsibilities.venue}
                      onChange={(e) => handleResponsibilityChange('venue', e.target.value)}
                    >
                      <FormControlLabel value="requestor" control={<Radio size="small" />} label="Your Organization" />
                      <FormControlLabel value="shared" control={<Radio size="small" />} label="Shared" />
                      <FormControlLabel value="ohack" control={<Radio size="small" />} label="Opportunity Hack" />
                    </RadioGroup>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>Food & Refreshments</Typography>
                    <RadioGroup
                      row
                      name="food"
                      value={formData.responsibilities.food}
                      onChange={(e) => handleResponsibilityChange('food', e.target.value)}
                    >
                      <FormControlLabel value="requestor" control={<Radio size="small" />} label="Your Organization" />
                      <FormControlLabel value="shared" control={<Radio size="small" />} label="Shared" />
                      <FormControlLabel value="ohack" control={<Radio size="small" />} label="Opportunity Hack" />
                    </RadioGroup>
                  </Box>
                  
                  <Box>
                    <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>Prizes & Swag</Typography>
                    <RadioGroup
                      row
                      name="prizes"
                      value={formData.responsibilities.prizes}
                      onChange={(e) => handleResponsibilityChange('prizes', e.target.value)}
                    >
                      <FormControlLabel value="requestor" control={<Radio size="small" />} label="Your Organization" />
                      <FormControlLabel value="shared" control={<Radio size="small" />} label="Shared" />
                      <FormControlLabel value="ohack" control={<Radio size="small" />} label="Opportunity Hack" />
                    </RadioGroup>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f7f7ff' }}>
                  <Typography variant="subtitle1" component="h3" gutterBottom fontWeight={600}>
                    Event Personnel
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>Judges</Typography>
                    <RadioGroup
                      row
                      name="judges"
                      value={formData.responsibilities.judges}
                      onChange={(e) => handleResponsibilityChange('judges', e.target.value)}
                    >
                      <FormControlLabel value="requestor" control={<Radio size="small" />} label="Your Organization" />
                      <FormControlLabel value="shared" control={<Radio size="small" />} label="Shared" />
                      <FormControlLabel value="ohack" control={<Radio size="small" />} label="Opportunity Hack" />
                    </RadioGroup>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>Technical Mentors</Typography>
                    <RadioGroup
                      row
                      name="mentors"
                      value={formData.responsibilities.mentors}
                      onChange={(e) => handleResponsibilityChange('mentors', e.target.value)}
                    >
                      <FormControlLabel value="requestor" control={<Radio size="small" />} label="Your Organization" />
                      <FormControlLabel value="shared" control={<Radio size="small" />} label="Shared" />
                      <FormControlLabel value="ohack" control={<Radio size="small" />} label="Opportunity Hack" />
                    </RadioGroup>
                  </Box>
                  
                  <Box>
                    <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>Marketing & Communications</Typography>
                    <RadioGroup
                      row
                      name="marketing"
                      value={formData.responsibilities.marketing}
                      onChange={(e) => handleResponsibilityChange('marketing', e.target.value)}
                    >
                      <FormControlLabel value="requestor" control={<Radio size="small" />} label="Your Organization" />
                      <FormControlLabel value="shared" control={<Radio size="small" />} label="Shared" />
                      <FormControlLabel value="ohack" control={<Radio size="small" />} label="Opportunity Hack" />
                    </RadioGroup>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5fff5' }}>
                  <Typography variant="subtitle1" component="h3" gutterBottom fontWeight={600}>
                    Participant & Nonprofit Management
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: { xs: 2, md: 0 } }}>
                        <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>Nonprofit Recruitment & Onboarding</Typography>
                        <RadioGroup
                          row
                          name="nonprofitRecruitment"
                          value={formData.responsibilities.nonprofitRecruitment}
                          onChange={(e) => handleResponsibilityChange('nonprofitRecruitment', e.target.value)}
                        >
                          <FormControlLabel value="requestor" control={<Radio size="small" />} label="Your Organization" />
                          <FormControlLabel value="shared" control={<Radio size="small" />} label="Shared" />
                          <FormControlLabel value="ohack" control={<Radio size="small" />} label="Opportunity Hack" />
                        </RadioGroup>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Box>
                        <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>Participant Recruitment</Typography>
                        <RadioGroup
                          row
                          name="participantRecruitment"
                          value={formData.responsibilities.participantRecruitment}
                          onChange={(e) => handleResponsibilityChange('participantRecruitment', e.target.value)}
                        >
                          <FormControlLabel value="requestor" control={<Radio size="small" />} label="Your Organization" />
                          <FormControlLabel value="shared" control={<Radio size="small" />} label="Shared" />
                          <FormControlLabel value="ohack" control={<Radio size="small" />} label="Opportunity Hack" />
                        </RadioGroup>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#fff5f5' }}>
                  <Typography variant="subtitle1" component="h3" gutterBottom fontWeight={600}>
                    Post-Event Support
                  </Typography>
                  
                  <Box>
                    <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>Project Implementation & Follow-up</Typography>
                    <RadioGroup
                      row
                      name="postEventSupport"
                      value={formData.responsibilities.postEventSupport}
                      onChange={(e) => handleResponsibilityChange('postEventSupport', e.target.value)}
                    >
                      <FormControlLabel value="requestor" control={<Radio size="small" />} label="Your Organization" />
                      <FormControlLabel value="shared" control={<Radio size="small" />} label="Shared" />
                      <FormControlLabel value="ohack" control={<Radio size="small" />} label="Opportunity Hack" />
                    </RadioGroup>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                💡 Note: Final responsibilities will be agreed upon during our follow-up discussion.
              </Typography>
            </Alert>
          </Box>
        )}
        
        {/* Step 5: Budget & Support */}
        {activeStep === 4 && (
          <Box>
            <Typography variant="h5" component="h2" gutterBottom>
              Budget & Support
            </Typography>
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Estimated Event Budget
                <Tooltip
                  title={
                    <span style={{ fontSize: "1.2rem" }}>
                      This budget helps us tailor the event to your needs and
                      maximizes the social impact we can achieve together. It
                      covers event organization, travel, materials, and nonprofit support.
                    </span>
                  }
                >
                  <InfoIcon
                    fontSize="small"
                    sx={{ ml: 1, verticalAlign: "middle" }}
                  />
                </Tooltip>
              </Typography>
              
              <Slider
                value={formData.budget}
                onChange={handleSliderChange}
                valueLabelDisplay="auto"
                min={5000}
                max={50000}
                step={1000}
                marks={[
                  { value: 5000, label: "$5k" },
                  { value: 25000, label: "$25k" },
                  { value: 50000, label: "$50k" },
                ]}
                ValueLabelComponent={ValueLabelComponent}
                sx={{ mb: 2 }}
              />
              
              <Typography variant="body1" align="center" sx={{ fontWeight: 600 }}>
                Suggested budget: ${formData.budget.toLocaleString()}
              </Typography>
              
              {formData.employeeCount && (
                <Typography
                  variant="body2"
                  color="textSecondary"
                  align="center"
                  sx={{ mt: 1 }}
                >
                  Estimated per-participant cost: $
                  {calculatePerPersonBudget(
                    formData.budget,
                    formData.employeeCount
                  )}
                </Typography>
              )}
              
              <Paper 
                elevation={2}
                sx={{
                  mt: 3,
                  p: 3,
                  bgcolor: "#f8f9ff",
                  borderRadius: 2,
                  border: "2px solid #e3f2fd",
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                  💰 Typical Budget Breakdown:
                </Typography>
                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                  <Box component="li" sx={{ mb: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      $97 per participant - Meals and refreshments (36 hours of continuous hacking)
                    </Typography>
                  </Box>
                  <Box component="li" sx={{ mb: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      $19 per participant - Swag pack (shirt, hat, stickers)
                    </Typography>
                  </Box>
                  <Box component="li" sx={{ mb: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      Prizes for winning teams and special categories
                    </Typography>
                  </Box>
                  <Box component="li" sx={{ mb: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      Thank-you gifts for judges, mentors, and volunteers
                    </Typography>
                  </Box>
                  <Box component="li">
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      Marketing materials and promotional items
                    </Typography>
                  </Box>
                </Box>
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    ℹ️ Note: Event venue costs are not included and are typically provided by the host organization.
                  </Typography>
                </Alert>
              </Paper>
            </Box>
            
            <Box 
              sx={{
                p: 3,
                mb: 4,
                borderRadius: 2,
                bgcolor: theme.palette.primary.light + '20',
                border: `1px solid ${theme.palette.primary.light}`
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main }}>
                <FavoriteIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
                Support Our Mission
              </Typography>
              
              <Typography variant="body1" paragraph>
                Your contribution helps us sustain our nonprofit work, creating lasting technology
                solutions for organizations that serve communities in need.
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom>
                  Suggested donation: <strong>{formData.donationPercentage}%</strong> of your event budget (${calculatedDonation.toLocaleString()})
                </Typography>
                <Slider
                  value={formData.donationPercentage}
                  onChange={handleDonationSliderChange}
                  valueLabelDisplay="auto"
                  min={0}
                  max={50}
                  step={5}
                  marks={[
                    { value: 0, label: "0%" },
                    { value: 20, label: "20%" },
                    { value: 50, label: "50%" },
                  ]}
                />
              </Box>
              
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mb: 3,
                  bgcolor: theme.palette.background.paper,
                  border: '1px dashed ' + theme.palette.primary.main,
                  borderRadius: 2
                }}
              >
                <Typography variant="subtitle2" gutterBottom sx={{ color: theme.palette.primary.main }}>
                  Your Support Includes:
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', mb: 1 }}>
                      <CheckCircleIcon sx={{ color: theme.palette.success.main, mr: 1, fontSize: 20 }} />
                      <Typography variant="body2">Organizer travel to your location (if needed)</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', mb: 1 }}>
                      <CheckCircleIcon sx={{ color: theme.palette.success.main, mr: 1, fontSize: 20 }} />
                      <Typography variant="body2">Event coordination and planning assistance</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', mb: 1 }}>
                      <CheckCircleIcon sx={{ color: theme.palette.success.main, mr: 1, fontSize: 20 }} />
                      <Typography variant="body2">Marketing support for your event</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', mb: 1 }}>
                      <CheckCircleIcon sx={{ color: theme.palette.success.main, mr: 1, fontSize: 20 }} />
                      <Typography variant="body2">Access to our nonprofit network</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Your donation will directly fund:
                  </Typography>
                  <Typography variant="body2" component="ul" sx={{ pl: 2, mt: 1 }}>
                    <li>Technical support for participating nonprofits</li>
                    <li>Platform maintenance for project hosting</li>
                    <li>Educational resources for volunteers</li>                
                  </Typography>
                </Box>
                
                <Paper 
                  elevation={0} 
                  sx={{ 
                    px: 3, 
                    py: 2, 
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                    borderRadius: 2
                  }}
                >
                  <Typography variant="h6" style={{color: 'white'}} align="center">
                    ${calculatedDonation.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" align="center">
                    Estimated Donation
                  </Typography>
                </Paper>
              </Box>
            </Box>
            
            <TextField
              fullWidth
              margin="normal"
              label="Additional Information or Special Requests"
              name="additionalInfo"
              multiline
              rows={4}
              value={formData.additionalInfo}
              onChange={handleChange}
              placeholder="Tell us about your organization's social responsibility goals or any specific areas of impact you're interested in..."
            />
            
            <Paper 
              elevation={0}
              sx={{ 
                mt: 4, 
                p: 3, 
                bgcolor: 'grey.50',
                border: '2px solid',
                borderColor: 'primary.light',
                borderRadius: 2
              }}
            >
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                📋 Required Agreements
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.agreeToContact}
                      onChange={handleCheckboxChange}
                      name="agreeToContact"
                      size="large"
                    />
                  }
                  label={
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      I agree to be contacted by the Opportunity Hack team to discuss my request
                    </Typography>
                  }
                />
                {errors.agreeToContact && (
                  <Typography color="error" variant="body2" display="block" sx={{ mt: 1, fontWeight: 600 }}>
                    {errors.agreeToContact}
                  </Typography>
                )}
              </Box>
              
              <Box>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.agreeToTimeline}
                      onChange={handleCheckboxChange}
                      name="agreeToTimeline"
                      size="large"
                    />
                  }
                  label={
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      I understand that hackathons require at least 2 months of preparation time for optimal success
                    </Typography>
                  }
                />
                {errors.agreeToTimeline && (
                  <Typography color="error" variant="body2" display="block" sx={{ mt: 1, fontWeight: 600 }}>
                    {errors.agreeToTimeline}
                  </Typography>
                )}
              </Box>
            </Paper>
          </Box>
        )}
        
        {/* Navigation buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 5, gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0}
            size="large"
            sx={{ minWidth: 100 }}
          >
            Back
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            endIcon={activeStep === steps.length - 1 ? <CheckCircleIcon /> : <ArrowForwardIcon />}
            disabled={isSubmitting}
            size="large"
            sx={{ 
              minWidth: 160,
              fontWeight: 600,
              fontSize: '1.1rem',
              py: 1.5
            }}
          >
            {activeStep === steps.length - 1 ? (
              isSubmitting ? <CircularProgress size={24} color="inherit" /> : (isEdit ? "Update Request" : "Submit Request")
            ) : (
              "Continue"
            )}
          </Button>
        </Box>
      </Paper>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default HackathonRequestForm;