import React, { useState, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  Grid,
  Chip,
  OutlinedInput,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Alert,
  Autocomplete,
  RadioGroup,
  Radio,
  Divider
} from '@mui/material';
import {
  Save as SaveIcon,
  Close as CloseIcon,
  NavigateNext as NextIcon,
  NavigateBefore as BackIcon
} from '@mui/icons-material';

const ApplicationEditDialog = ({
  open,
  onClose,
  application,
  applicationType,
  onSave,
  isLoading = false
}) => {
  // Initialize form data with application data
  const [formData, setFormData] = useState(application || {});
  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState({});

  // Update form data when application prop changes
  React.useEffect(() => {
    if (application) {
      setFormData(application);
    }
  }, [application]);

  // Field configurations for different application types
  const getFieldConfig = useCallback((type) => {
    const configs = {
      hacker: {
        title: 'Edit Hacker Application',
        steps: ['Basic Info', 'Skills & Experience', 'Location & Demographics', 'Interests & Teams'],
        fields: {
          basicInfo: [
            { name: 'name', label: 'Full Name', type: 'text', required: true },
            { name: 'email', label: 'Email Address', type: 'email', required: true },
            { name: 'pronouns', label: 'Pronouns', type: 'text' },
            { 
              name: 'participantType', 
              label: 'Participant Type', 
              type: 'select', 
              required: true,
              options: ['Student', 'Professional', 'Educator', 'Community Member', 'Other']
            },
            { name: 'participantTypeOther', label: 'Other Participant Type', type: 'text', dependsOn: 'participantType', dependsValue: 'Other' },
            { name: 'schoolOrganization', label: 'School/Organization', type: 'text', required: true },
            { 
              name: 'experienceLevel', 
              label: 'Experience Level', 
              type: 'select', 
              required: true,
              options: ['First-time hacker', 'Some hackathon experience (1-3 events)', 'Experienced hacker (4+ events)']
            },
            { 
              name: 'primaryRoles', 
              label: 'Primary Roles', 
              type: 'multiselect', 
              required: true,
              options: [
                'Software Development - Frontend',
                'Software Development - Backend', 
                'Software Development - Mobile',
                'Software Development - Full Stack',
                'Design (UI/UX, Graphics)',
                'Data Science/Analytics',
                'Project Management',
                'Business Analysis',
                'Quality Assurance',
                'DevOps',
                'Other'
              ]
            },
            { name: 'otherRole', label: 'Other Role', type: 'text', dependsOn: 'primaryRoles', dependsValue: 'Other' }
          ],
          skillsExperience: [
            { 
              name: 'skills', 
              label: 'Technical Skills', 
              type: 'autocomplete', 
              required: true,
              options: [
                // Programming Languages
                'JavaScript/TypeScript', 'Python', 'Java', 'C#/.NET', 'Ruby', 'PHP', 'Go', 'Swift', 'Kotlin', 'C/C++', 'Rust', 'Scala', 'R', 'Perl',
                // Frontend
                'React', 'Angular', 'Vue.js', 'Next.js', 'HTML/CSS', 'Redux', 'Tailwind CSS', 'Bootstrap', 'Material UI', 'Web Components', 'Svelte', 'jQuery',
                // Backend
                'Node.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'Laravel', 'ASP.NET', 'Ruby on Rails', 'FastAPI', 'GraphQL', 'RESTful APIs', 'Serverless Architecture',
                // Mobile
                'React Native', 'Flutter', 'iOS Development', 'Android Development', 'Xamarin', 'Ionic',
                // Database
                'SQL Databases', 'PostgreSQL', 'MySQL/MariaDB', 'MongoDB', 'NoSQL Databases', 'Redis', 'Elasticsearch', 'DynamoDB', 'Firebase', 'ORM Tools',
                // DevOps & Cloud
                'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'CI/CD Pipelines', 'GitHub Actions', 'Jenkins', 'Terraform', 'Ansible',
                // Data Science & AI
                'Machine Learning', 'AI/NLP', 'Data Visualization', 'TensorFlow', 'PyTorch', 'Computer Vision', 'Pandas', 'NumPy', 'Big Data', 'Statistical Analysis',
                // Design & UX
                'UI Design', 'UX Research', 'Graphic Design', 'Figma', 'Adobe XD', 'Sketch', 'Wireframing', 'Prototyping',
                // Other
                'Blockchain', 'AR/VR', 'IoT', 'Game Development', 'Cybersecurity', 'Project Management', 'Agile/Scrum', 'Technical Writing', 'Accessibility', 'Other'
              ]
            },
            { name: 'otherSkills', label: 'Other Skills', type: 'text', dependsOn: 'skills', dependsValue: 'Other' },
            { name: 'bio', label: 'Bio', type: 'textarea', rows: 3 },
            { name: 'linkedin', label: 'LinkedIn Profile', type: 'url' },
            { name: 'github', label: 'GitHub Profile', type: 'url' },
            { name: 'portfolio', label: 'Portfolio/Website', type: 'url' },
            { 
              name: 'participationCount', 
              label: 'Opportunity Hack Participation', 
              type: 'select', 
              required: true,
              options: [
                'This is my first year! 👆',
                'This will be the 2nd time ✌️',
                'This will be the 3rd time ☘️',
                'I\'ve been here 4+ times 🔥'
              ]
            }
          ],
          locationDemographics: [
            { name: 'inPerson', label: 'Attendance Mode', type: 'radio', options: ['Yes', 'No'], labels: ['In-person', 'Virtual'] },
            { 
              name: 'arizonaResident', 
              label: 'Arizona Residency', 
              type: 'select', 
              required: true,
              options: ['Arizona Resident', 'Non-Arizona Resident']
            },
            { 
              name: 'county', 
              label: 'County', 
              type: 'select', 
              dependsOn: 'arizonaResident', 
              dependsValue: 'Arizona Resident',
              options: ['Apache', 'Cochise', 'Coconino', 'Gila', 'Graham', 'Greenlee', 'La Paz', 'Maricopa', 'Mohave', 'Navajo', 'Pima', 'Pinal', 'Santa Cruz', 'Yavapai', 'Yuma']
            },
            { name: 'country', label: 'Country', type: 'text', required: true },
            { name: 'state', label: 'State/Province', type: 'text', required: true },
            { 
              name: 'ageRange', 
              label: 'Age Range', 
              type: 'select', 
              required: true,
              options: ['Under 18', '18-24', '25-34', '35-44', '45-54', '55+']
            },
            { 
              name: 'referralSource', 
              label: 'How did you hear about us?', 
              type: 'select', 
              required: true,
              options: ['School/University', 'Employer', 'Social Media', 'Friend/Colleague', 'Previous Participant', 'Nonprofit Organization', 'Other']
            },
            { name: 'referralSourceOther', label: 'Other Referral Source', type: 'text', dependsOn: 'referralSource', dependsValue: 'Other' },
            { 
              name: 'shirtSize', 
              label: 'T-Shirt Size', 
              type: 'select',
              options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL']
            },
            { name: 'dietaryRestrictions', label: 'Dietary Restrictions', type: 'text' },
            { name: 'interestedInTaxCredit', label: 'Interested in Arizona tax credits', type: 'checkbox' }
          ],
          interestsTeams: [
            { 
              name: 'socialCauses', 
              label: 'Social Causes', 
              type: 'multiselect', 
              required: true,
              options: ['Education', 'Healthcare', 'Environment', 'Economic Opportunity', 'Community Development', 'Accessibility/Inclusion', 'Homelessness', 'Food Security', 'Mental Health', 'Disaster Relief', 'Animal Welfare', 'Other']
            },
            { name: 'otherSocialCause', label: 'Other Social Cause', type: 'text', dependsOn: 'socialCauses', dependsValue: 'Other' },
            { name: 'socialImpactExperience', label: 'Social Impact Experience', type: 'textarea', rows: 3 },
            { name: 'motivation', label: 'Motivation', type: 'textarea', rows: 3 },
            { 
              name: 'teamStatus', 
              label: 'Team Status', 
              type: 'select', 
              required: true,
              options: [
                'I have a complete team of 2-5 people',
                'I have a team and we\'d like to add more people', 
                'I don\'t have a team and I\'d like to be matched with people to form a team',
                'I would like to work alone and I\'m okay with not obtaining experience with working with others'
              ]
            },
            { name: 'teamCode', label: 'Team Name/Code', type: 'text', dependsOn: 'teamStatus', dependsValue: 'I have a complete team of 2-5 people' },
            { name: 'teamNeededSkills', label: 'Team Needed Skills', type: 'text' },
            { name: 'teamMatchingPreferredSize', label: 'Preferred Team Size', type: 'select', options: ['No preference', '2 people', '3 people', '4 people', '5 people', 'I prefer to work alone even if that disqualifies me from winning a prize'] },
            { name: 'teamMatchingPreferredSkills', label: 'Preferred Skills in Teammates', type: 'multiselect', options: ['Software Development - Frontend', 'Software Development - Backend', 'Software Development - Mobile', 'Software Development - Full Stack', 'Design (UI/UX, Graphics)', 'Data Science/Analytics', 'Project Management', 'Business Analysis', 'Quality Assurance', 'DevOps'] },
            { name: 'teamMatchingPreferredCauses', label: 'Preferred Causes in Team', type: 'multiselect', options: ['Education', 'Healthcare', 'Environment', 'Economic Opportunity', 'Community Development', 'Accessibility/Inclusion', 'Homelessness', 'Food Security', 'Mental Health', 'Disaster Relief', 'Animal Welfare'] },
            { 
              name: 'workshopInterests', 
              label: 'Workshop Interests', 
              type: 'multiselect',
              options: ['Pre-hackathon skill-building workshops', 'During-event technical sessions', 'Social impact design thinking', 'Git/GitHub workflow', 'Cloud deployment', 'UX/UI fundamentals', 'API integration', 'Database design', 'Mobile development', 'Machine learning basics']
            },
            { name: 'willContinue', label: 'Interested in continuing project after hackathon', type: 'checkbox' },
            { name: 'additionalInfo', label: 'Additional Information', type: 'textarea', rows: 4 },
            { name: 'codeOfConduct', label: 'Agreed to Code of Conduct', type: 'checkbox', required: true }
          ]
        }
      },
      mentor: {
        title: 'Edit Mentor Application',
        steps: ['Basic Info', 'Professional Details', 'Mentorship & Availability'],
        fields: {
          basicInfo: [
            { name: 'name', label: 'Full Name', type: 'text', required: true },
            { name: 'email', label: 'Email Address', type: 'email', required: true },
            { name: 'pronouns', label: 'Pronouns', type: 'text' },
            { name: 'company', label: 'Company', type: 'text', required: true },
            { name: 'title', label: 'Job Title', type: 'text', required: true }
          ],
          professionalDetails: [
            { name: 'expertise', label: 'Areas of Expertise', type: 'multiselect', required: true, options: ['Software Development', 'UI/UX Design', 'Data Science', 'Project Management', 'Business Strategy', 'Marketing', 'Product Management', 'DevOps', 'Other'] },
            { name: 'yearsExperience', label: 'Years of Experience', type: 'select', required: true, options: ['1-3 years', '4-7 years', '8-12 years', '13+ years'] },
            { name: 'bio', label: 'Professional Bio', type: 'textarea', rows: 4 },
            { name: 'linkedin', label: 'LinkedIn Profile', type: 'url' }
          ],
          mentorshipAvailability: [
            { name: 'mentorshipAreas', label: 'Preferred Mentorship Areas', type: 'multiselect', options: ['Technical Guidance', 'Project Planning', 'Team Dynamics', 'Presentation Skills', 'Career Advice', 'Industry Insights'] },
            { name: 'availability', label: 'Availability', type: 'multiselect', options: ['Friday Evening', 'Saturday Morning', 'Saturday Afternoon', 'Saturday Evening', 'Sunday Morning', 'Sunday Afternoon'] },
            { name: 'previousMentoring', label: 'Previous Mentoring Experience', type: 'textarea', rows: 3 },
            { name: 'additionalInfo', label: 'Additional Information', type: 'textarea', rows: 3 }
          ]
        }
      },
      judge: {
        title: 'Edit Judge Application',
        steps: ['Basic Info', 'Professional Details', 'Judging Experience'],
        fields: {
          basicInfo: [
            { name: 'name', label: 'Full Name', type: 'text', required: true },
            { name: 'email', label: 'Email Address', type: 'email', required: true },
            { name: 'pronouns', label: 'Pronouns', type: 'text' },
            { name: 'company', label: 'Company', type: 'text', required: true },
            { name: 'title', label: 'Job Title', type: 'text', required: true }
          ],
          professionalDetails: [
            { name: 'expertise', label: 'Areas of Expertise', type: 'multiselect', required: true, options: ['Software Development', 'UI/UX Design', 'Data Science', 'Business Strategy', 'Innovation', 'Social Impact', 'Product Management', 'Technical Architecture', 'Other'] },
            { name: 'yearsExperience', label: 'Years of Experience', type: 'select', required: true, options: ['3-5 years', '6-10 years', '11-15 years', '16+ years'] },
            { name: 'bio', label: 'Professional Bio', type: 'textarea', rows: 4 },
            { name: 'linkedin', label: 'LinkedIn Profile', type: 'url' }
          ],
          judgingExperience: [
            { name: 'judgingExperience', label: 'Previous Judging Experience', type: 'textarea', rows: 3 },
            { name: 'criteriaPreferences', label: 'Preferred Judging Criteria', type: 'multiselect', options: ['Technical Innovation', 'Social Impact', 'User Experience', 'Business Viability', 'Presentation Quality', 'Team Collaboration'] },
            { name: 'availability', label: 'Judging Availability', type: 'multiselect', options: ['Saturday Evening Presentations', 'Sunday Morning Presentations', 'Sunday Afternoon Final Judging'] },
            { name: 'additionalInfo', label: 'Additional Information', type: 'textarea', rows: 3 }
          ]
        }
      },
      volunteer: {
        title: 'Edit Volunteer Application',
        steps: ['Basic Info', 'Volunteer Details'],
        fields: {
          basicInfo: [
            { name: 'name', label: 'Full Name', type: 'text', required: true },
            { name: 'email', label: 'Email Address', type: 'email', required: true },
            { name: 'pronouns', label: 'Pronouns', type: 'text' }
          ],
          volunteerDetails: [
            { name: 'volunteerRole', label: 'Volunteer Role', type: 'select', required: true, options: ['Registration', 'Setup/Cleanup', 'Photography', 'Social Media', 'General Support'] },
            { name: 'skills', label: 'Relevant Skills', type: 'multiselect', options: ['Event Organization', 'Photography', 'Social Media', 'Customer Service', 'Technical Support'] },
            { name: 'availability', label: 'Availability', type: 'multiselect', options: ['Friday Setup', 'Saturday Full Day', 'Sunday Full Day', 'Sunday Cleanup'] },
            { name: 'previousVolunteering', label: 'Previous Volunteering Experience', type: 'textarea', rows: 3 },
            { name: 'motivation', label: 'Why do you want to volunteer?', type: 'textarea', rows: 3 },
            { name: 'additionalInfo', label: 'Additional Information', type: 'textarea', rows: 3 }
          ]
        }
      },
      sponsor: {
        title: 'Edit Sponsor Application',
        steps: ['Company Info', 'Sponsorship Details'],
        fields: {
          companyInfo: [
            { name: 'companyName', label: 'Company Name', type: 'text', required: true },
            { name: 'contactName', label: 'Contact Name', type: 'text', required: true },
            { name: 'email', label: 'Contact Email', type: 'email', required: true },
            { name: 'title', label: 'Contact Title', type: 'text' },
            { name: 'website', label: 'Company Website', type: 'url' }
          ],
          sponsorshipDetails: [
            { name: 'sponsorshipLevel', label: 'Sponsorship Level', type: 'select', required: true, options: ['Title Sponsor', 'Gold Sponsor', 'Silver Sponsor', 'Bronze Sponsor', 'In-Kind Sponsor'] },
            { name: 'industry', label: 'Industry', type: 'text' },
            { name: 'employeeCount', label: 'Employee Count', type: 'select', options: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'] },
            { name: 'bio', label: 'Company Description', type: 'textarea', rows: 4 },
            { name: 'specialRequests', label: 'Special Requirements/Requests', type: 'textarea', rows: 3 }
          ]
        }
      }
    };
    return configs[type] || configs.hacker;
  }, []);

  const config = useMemo(() => getFieldConfig(applicationType), [applicationType, getFieldConfig]);

  // Helper function to handle form field changes
  const handleFieldChange = useCallback((fieldName, value) => {
    setFormData(prev => {
      const newData = { ...prev, [fieldName]: value };
      
      // Handle dependent field clearing
      const field = Object.values(config.fields).flat().find(f => f.name === fieldName);
      if (field && field.options && !field.options.includes(value)) {
        // Clear dependent fields when parent value changes
        Object.values(config.fields).flat().forEach(f => {
          if (f.dependsOn === fieldName && f.dependsValue !== value) {
            newData[f.name] = f.type === 'multiselect' ? [] : '';
          }
        });
      }
      
      return newData;
    });
    
    // Clear any validation errors for this field
    setErrors(prev => ({ ...prev, [fieldName]: null }));
  }, [config.fields]);

  // Helper function to check if a field should be shown
  const shouldShowField = useCallback((field) => {
    if (!field.dependsOn) return true;
    
    const dependentValue = formData[field.dependsOn];
    if (field.type === 'multiselect' && Array.isArray(dependentValue)) {
      return dependentValue.includes(field.dependsValue);
    }
    return dependentValue === field.dependsValue;
  }, [formData]);

  // Helper function to get field value
  const getFieldValue = useCallback((fieldName) => {
    const value = formData[fieldName];
    if (value === undefined || value === null) {
      const field = Object.values(config.fields).flat().find(f => f.name === fieldName);
      if (field?.type === 'multiselect' || field?.type === 'autocomplete') {
        return [];
      }
      if (field?.type === 'checkbox') {
        return false;
      }
      return '';
    }
    
    // Handle string arrays from API (comma-separated)
    const field = Object.values(config.fields).flat().find(f => f.name === fieldName);
    if ((field?.type === 'multiselect' || field?.type === 'autocomplete') && typeof value === 'string') {
      return value.split(',').map(item => item.trim()).filter(Boolean);
    }
    
    return value;
  }, [formData, config.fields]);

  // Render individual form field
  const renderField = useCallback((field) => {
    if (!shouldShowField(field)) return null;
    
    const value = getFieldValue(field.name);
    const hasError = errors[field.name];
    
    const commonProps = {
      key: field.name,
      fullWidth: true,
      error: !!hasError,
      helperText: hasError,
      sx: { mb: 2 }
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
        return (
          <TextField
            {...commonProps}
            label={field.label}
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
          />
        );
        
      case 'textarea':
        return (
          <TextField
            {...commonProps}
            label={field.label}
            multiline
            rows={field.rows || 3}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
          />
        );
        
      case 'select':
        return (
          <FormControl {...commonProps} required={field.required}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              label={field.label}
            >
              {field.options.map(option => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
        
      case 'multiselect':
        return (
          <FormControl {...commonProps} required={field.required}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              multiple
              value={Array.isArray(value) ? value : []}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              input={<OutlinedInput label={field.label} />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((item) => (
                    <Chip key={item} label={item} size="small" />
                  ))}
                </Box>
              )}
            >
              {field.options.map((option) => (
                <MenuItem key={option} value={option}>
                  <Checkbox checked={(Array.isArray(value) ? value : []).indexOf(option) > -1} />
                  <ListItemText primary={option} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
        
      case 'autocomplete':
        return (
          <Autocomplete
            {...commonProps}
            multiple
            options={field.options}
            value={Array.isArray(value) ? value : []}
            onChange={(event, newValue) => handleFieldChange(field.name, newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label={field.label}
                required={field.required}
                error={!!hasError}
                helperText={hasError}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  key={option}
                  label={option}
                  {...getTagProps({ index })}
                  size="small"
                />
              ))
            }
            freeSolo
            filterSelectedOptions
          />
        );
        
      case 'radio':
        return (
          <FormControl {...commonProps} component="fieldset" required={field.required}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {field.label}
            </Typography>
            <RadioGroup
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
            >
              {field.options.map((option, index) => (
                <FormControlLabel
                  key={option}
                  value={option}
                  control={<Radio />}
                  label={field.labels ? field.labels[index] : option}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );
        
      case 'checkbox':
        return (
          <FormControlLabel
            key={field.name}
            control={
              <Checkbox
                checked={!!value}
                onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                required={field.required}
              />
            }
            label={field.label}
            sx={{ mb: 2, display: 'block' }}
          />
        );
        
      default:
        return null;
    }
  }, [shouldShowField, getFieldValue, errors, handleFieldChange]);

  // Navigation handlers
  const handleNext = () => {
    if (activeStep < config.steps.length - 1) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    }
  };

  // Save handler
  const handleSave = async () => {
    try {
      // Basic validation
      const newErrors = {};
      const currentStepFields = Object.values(config.fields)[activeStep] || [];
      
      currentStepFields.forEach(field => {
        if (field.required && shouldShowField(field)) {
          const value = getFieldValue(field.name);
          if (!value || (Array.isArray(value) && value.length === 0)) {
            newErrors[field.name] = `${field.label} is required`;
          }
        }
      });
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      
      // Process form data for API
      const processedData = { ...formData };
      
      // Convert arrays to comma-separated strings for API compatibility
      Object.values(config.fields).flat().forEach(field => {
        if ((field.type === 'multiselect' || field.type === 'autocomplete') && Array.isArray(processedData[field.name])) {
          processedData[field.name] = processedData[field.name].join(', ');
        }
      });
      
      await onSave(processedData);
      onClose();
    } catch (error) {
      console.error('Error saving application:', error);
      setErrors({ general: 'Failed to save application. Please try again.' });
    }
  };

  // Get current step fields
  const currentStepKey = Object.keys(config.fields)[activeStep];
  const currentStepFields = config.fields[currentStepKey] || [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh' }
      }}
    >
      <DialogTitle>
        <Typography variant="h6">{config.title}</Typography>
        <Typography variant="body2" color="text.secondary">
          Edit application details
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        {errors.general && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.general}
          </Alert>
        )}
        
        {/* Stepper */}
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
          {config.steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {/* Current step content */}
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {config.steps[activeStep]}
          </Typography>
          
          <Grid container spacing={2}>
            {currentStepFields.map((field) => (
              <Grid item xs={12} sm={field.type === 'textarea' ? 12 : 6} key={field.name}>
                {renderField(field)}
              </Grid>
            ))}
          </Grid>
        </Paper>
        
        {/* Application metadata */}
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Application Metadata
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Submitted: {formData.timestamp ? new Date(formData.timestamp).toLocaleString() : 'Unknown'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Status: {formData.isSelected ? 'Approved' : 'Pending'}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={onClose}
          startIcon={<CloseIcon />}
          disabled={isLoading}
        >
          Cancel
        </Button>
        
        <Box sx={{ flexGrow: 1 }} />
        
        {activeStep > 0 && (
          <Button
            onClick={handleBack}
            startIcon={<BackIcon />}
            disabled={isLoading}
          >
            Back
          </Button>
        )}
        
        {activeStep < config.steps.length - 1 ? (
          <Button
            onClick={handleNext}
            endIcon={<NextIcon />}
            variant="outlined"
            disabled={isLoading}
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSave}
            startIcon={<SaveIcon />}
            variant="contained"
            disabled={isLoading}
          >
            Save Changes
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ApplicationEditDialog;