import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { 
  useAuthInfo, 
  RequiredAuthProvider,
  RedirectToLogin
} from '@propelauth/react';
import {
  Typography,
  Container,
  Box,
  TextField,
  Button,
  FormControlLabel,
  CircularProgress,
  Checkbox,
  FormControl,
  FormHelperText,
  Select,
  MenuItem,
  Paper,
  Divider,
  Alert,
  Link,
  OutlinedInput,
  ListItemText,
  InputLabel,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Radio,
  RadioGroup,
  useTheme,
  useMediaQuery
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Head from 'next/head';
import Script from 'next/script';
import { useEnv } from '../../../context/env.context';
import ApplicationNav from '../../../components/ApplicationNav/ApplicationNav';
import Breadcrumbs from '../../../components/Breadcrumbs/Breadcrumbs';
import InfoIcon from '@mui/icons-material/Info';
import FormPersistenceControls from '../../../components/FormPersistenceControls';
import { useFormPersistence } from '../../../hooks/use-form-persistence';
import { useRecaptcha } from '../../../hooks/use-recaptcha';
import GiveButterWidget from '../../../components/GiveButterWidget';

const VolunteerApplicationComponent = () => {
  const router = useRouter();
  const { event_id } = router.query;
  const { isLoggedIn, user, accessToken } = useAuthInfo();
  const { apiServerUrl } = useEnv();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Form navigation state
  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [eventData, setEventData] = useState(null);
  
  // reCAPTCHA integration
  const { 
    initializeRecaptcha, 
    getRecaptchaToken, 
    isLoading: recaptchaLoading, 
    error: recaptchaError,
    setError: setRecaptchaError 
  } = useRecaptcha();
  
  // Photo upload state
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  
  // Available time slots (will be populated from event data)
  const [availabilityOptions, setAvailabilityOptions] = useState([]);
  // State for organizing time slots by date and month
  const [availabilityByDate, setAvailabilityByDate] = useState({});
  const [availabilityByMonth, setAvailabilityByMonth] = useState({});
  // State for selected dates and months
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedMonths, setSelectedMonths] = useState([]);
  // Search/filter for dates
  const [dateFilter, setDateFilter] = useState("");
  const [viewMode, setViewMode] = useState("month"); // "month" or "date"
  // State for expanded date in accordion
  const [expandedDate, setExpandedDate] = useState(null);
  
  // Store refs for data loading
  const initialLoadRef = useRef(false);
  const formInitializedRef = useRef(false);
  const confirmationShownRef = useRef(false);
  
  // Handle file selection for photo upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file is too large. Please choose an image under 5MB.');
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Selected file is not an image. Please select an image file.');
      return;
    }
    
    setPhotoFile(file);
    setError(''); // Clear any previous errors
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
      // Update the form data with the image data URL
      setFormData(prev => ({
        ...prev,
        photoUrl: reader.result
      }));
    };
    reader.onerror = () => {
      setError('Failed to read the selected file. Please try again.');
    };
    reader.readAsDataURL(file);
  };
  
  // Initial form state
  const initialFormData = {
    timestamp: new Date().toISOString(),
    email: '',
    name: '',
    pronouns: '',
    bio: '',
    company: '',
    title: '',
    linkedin: '',    
    portfolio: '',
    country: '',
    state: '',
    inPerson: '',
    experienceLevel: '',
    volunteerType: [],
    otherVolunteerType: '',
    skills: [],
    otherSkills: '',
    socialCauses: [],
    otherSocialCause: '',
    motivation: '',
    previousExperience: '',
    codeOfConduct: false,
    additionalInfo: '',
    event_id: event_id || '',
    isSelected: false,
    photoUrl: '', // Add field for photo URL
    availableDays: [] // Add field for available days/time slots
  };
  
  // Use form persistence hook
  const {
    formData,
    setFormData,
    formRef,
    handleFormChange,
    handleMultiSelectChange,
    loadFromLocalStorage,
    saveToLocalStorage,
    clearSavedData,
    loadPreviousSubmission,
    previouslySubmitted,
    setPreviouslySubmitted,
    notification,
    closeNotification,
    isLoading,
    setIsLoading
  } = useFormPersistence({
    formType: 'volunteer',
    eventId: event_id || '',
    userId: user?.userId || '',
    initialFormData,
    apiServerUrl: apiServerUrl || '',
    accessToken: accessToken || ''
  });
  
  // Experience level options
  const experienceLevelOptions = [
    'First-time volunteer',
    'Some volunteering experience (1-3 events)',
    'Experienced volunteer (4+ events)'
  ];

  // Volunteer type options
  const volunteerTypeOptions = [
    "Check-in/Registration",
    "Cleanup Crew",
    "Food Service",
    "Presentation Pitch Support",    
    "Marketing/Communications",
    "Photography/Videography",
    "Other",
  ];
  
 
  // Social causes options
  const socialCausesOptions = [
    'Education',
    'Healthcare',
    'Environment',
    'Economic Opportunity',
    'Community Development',
    'Accessibility/Inclusion',
    'Homelessness',
    'Food Security',
    'Mental Health',
    'Disaster Relief',
    'Animal Welfare',
    'Technology Access',
    'Youth Development',
    'Arts & Culture',
    'Civil Rights',
    'Other'
  ];

  // Set up form with event_id
  useEffect(() => {
    if (event_id && !formInitializedRef.current) {
      formInitializedRef.current = true;
      setFormData(prev => ({
        ...prev,
        event_id: event_id
      }));
    }
  }, [event_id, setFormData]);
  
  // Custom implementation for multi-select changes
  const customHandleMultiSelectChange = useCallback((event, fieldName) => {
    handleMultiSelectChange(event, fieldName);
    
    // Clear otherVolunteerType when Other is removed from volunteerType
    if (fieldName === 'volunteerType' && !event.target.value.includes('Other')) {
      setFormData(prev => ({
        ...prev,
        otherVolunteerType: ''
      }));
    }
    
    // Clear otherSkills when Other is removed from skills
    if (fieldName === 'skills' && !event.target.value.includes('Other')) {
      setFormData(prev => ({
        ...prev,
        otherSkills: ''
      }));
    }
    
    // Clear otherSocialCause when Other is removed from socialCauses
    if (fieldName === 'socialCauses' && !event.target.value.includes('Other')) {
      setFormData(prev => ({
        ...prev,
        otherSocialCause: ''
      }));
    }
  }, [handleMultiSelectChange, setFormData]);
  
  // Function to generate time slots based on event dates
  const generateTimeSlots = (startDate, endDate) => {
    if (!startDate || !endDate) return [];
    
    // Parse dates more carefully to avoid timezone issues
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T23:59:59');

    console.log('Availability Start Date:', start);
    console.log('Availability End Date:', end);
    
    // Time blocks with icons and descriptions
    const timeBlocks = [
      { time: '7am - 9am', label: 'Early Morning', icon: '🌅', energy: 'Fresh minds ready to help!' },
      { time: '9am - 12pm', label: 'Morning', icon: '☀️', energy: 'Peak productivity time!' },
      { time: '1pm - 3pm', label: 'Afternoon', icon: '🏙️', energy: 'Post-lunch activities' },
      { time: '4pm - 7pm', label: 'Evening', icon: '🌆', energy: 'Steady focus time' },
      { time: '8pm - 11pm', label: 'Night', icon: '🌃', energy: 'Winding down sessions' },
      { time: '11pm - 2am', label: 'Late Night', icon: '🌙', energy: 'For the night owls!' }
    ];
    
    const slots = [];
    
    // Loop through each day between start and end dates (inclusive)
    for (let day = new Date(start); day <= end; ) {
      const dayDate = new Date(day);
      const dateString = dayDate.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'short', 
        day: 'numeric'
      });
      
      // Add each time block for this day
      timeBlocks.forEach(block => {
        console.log("Availability Adding time slot:", dateString, block);
        slots.push({
          id: `${dateString}-${block.label}`,
          date: dateString,
          time: block.time,
          label: block.label,
          icon: block.icon,
          energy: block.energy,
          displayText: `${dateString}: ${block.icon} ${block.label} (${block.time} PST)`
        });
      });
      
      // Move to next day
      day.setDate(day.getDate() + 1);
    }
        
    return slots;
  };
  
  // Handle manual form save
  const handleManualSave = useCallback(() => {
    saveToLocalStorage();
  }, [saveToLocalStorage]);
  
  // Fetch event data and initialize form
  useEffect(() => {
    // Initialize reCAPTCHA when component mounts
    initializeRecaptcha();
    
    if (!event_id || !apiServerUrl || initialLoadRef.current) return;
    initialLoadRef.current = true;
    
    const fetchEventData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch event data from the API
        const response = await fetch(`${apiServerUrl}/api/messages/hackathon/${event_id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch event data: ${response.status} ${response.statusText}`);
        }
        
        const eventData = await response.json();
        
        if (!eventData || !eventData.start_date || !eventData.end_date) {
          throw new Error('Invalid event data received');
        }
        
        // Format dates for display
        const startDate = new Date(eventData.start_date);
        const endDate = new Date(eventData.end_date);
        const formattedStartDate = startDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        const formattedEndDate = endDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        // Check if event is in the past (with 1-day buffer)
        const now = new Date();
        const oneDayBuffer = 24 * 60 * 60 * 1000; // 1 day in milliseconds
        const isEventPast = new Date(endDate.getTime() + oneDayBuffer) < now;
        
        setEventData({
          name: eventData.title || `Opportunity Hack - ${event_id}`,
          description: eventData.description || "Annual hackathon for nonprofits",
          date: new Date(eventData.start_date).getFullYear().toString(),
          startDate: eventData.start_date,
          endDate: eventData.end_date,
          formattedStartDate,
          formattedEndDate,
          location: eventData.location || "Tempe, Arizona",
          image: eventData.image_url || "https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp",
          isEventPast
        });
        
        // Generate time slots based on event dates
        const slots = generateTimeSlots(eventData.start_date, eventData.end_date);
        console.log("Availability Generated time slots:", slots);
        setAvailabilityOptions(slots);
        
        // Organize time slots by date
        const slotsByDate = slots.reduce((grouped, slot) => {
          if (!grouped[slot.date]) {
            grouped[slot.date] = [];
          }
          grouped[slot.date].push(slot);
          return grouped;
        }, {});
        setAvailabilityByDate(slotsByDate);
        
        // Organize slots by month
        const slotsByMonth = {};
        Object.entries(slotsByDate).forEach(([date, slots]) => {
          // Extract month from date string (e.g. "Monday, Jan 1" → "Jan")
          const monthMatch = date.match(/[A-Z][a-z]{2}\s\d+/);
          if (monthMatch) {
            const monthPart = monthMatch[0].split(' ')[0]; // Get "Jan" from "Jan 1"
            if (!slotsByMonth[monthPart]) {
              slotsByMonth[monthPart] = {};
            }
            slotsByMonth[monthPart][date] = slots;
          }
        });
        setAvailabilityByMonth(slotsByMonth);
        
        // Set initial view mode based on number of days
        const dayCount = Object.keys(slotsByDate).length;
        if (dayCount > 14) {
          setViewMode("month");
          // Initialize with all months selected
          setSelectedMonths(Object.keys(slotsByMonth));
        } else {
          setViewMode("date");
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching event data:', err);
        setError('Failed to load event data. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [event_id, apiServerUrl, setIsLoading, initializeRecaptcha]);

  // Handle user data and application loading - separate from event loading
  useEffect(() => {
    const loadUserAndFormData = async () => {
      // Skip if already initialized, event_id missing, user not loaded yet, or availability options not loaded
      if (!event_id || !formInitializedRef.current || !availabilityOptions.length) return;

      try {
        // Pre-fill with user information if available
        if (user) {
          setFormData((prev) => ({
            ...prev,
            email: user.email || prev.email,
            name:
              user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.username || prev.name,
          }));

          // Try to load previous submission if logged in and have access token
          if (accessToken) {
            try {
              const prevData = await loadPreviousSubmission();

              if (prevData && !confirmationShownRef.current) {
                confirmationShownRef.current = true;
                // If the user has submitted before, ask if they want to load it
                if (
                  window.confirm(
                    "We found a previous application. Would you like to load it for editing?"
                  )
                ) {
                  // Transform API data to match our form structure
                  const parsePreviousArrayField = (field, fallback = []) => {
                    if (Array.isArray(prevData[field])) return prevData[field];
                    if (
                      typeof prevData[field] === "string" &&
                      prevData[field]
                    ) {
                      return prevData[field]
                        .split(",")
                        .map((item) => item.trim());
                    }
                    return fallback;
                  };

                  // Match saved availability to slot IDs for time slot selection
                  const availabilityText = prevData.availability || "";
                  console.log("Availability text:", availabilityText);
                  const matchedSlotIds = availabilityOptions
                    .filter((slot) =>
                      availabilityText.includes(slot.displayText)
                    )
                    .map((slot) => slot.id);

                  console.log("Availability Options:", availabilityOptions);
                  console.log("Availability Matched slot IDs:", matchedSlotIds);
                  // Extract unique dates from matched slots
                  const matchedDates = [
                    ...new Set(
                      matchedSlotIds
                        .map((id) => {
                          const slot = availabilityOptions.find(
                            (s) => s.id === id
                          );
                          return slot ? slot.date : null;
                        })
                        .filter(Boolean)
                    ),
                  ];

                  // Extract unique months from matched dates
                  const matchedMonths = [
                    ...new Set(
                      matchedDates
                        .map((date) => {
                          const monthMatch = date.match(/[A-Z][a-z]{2}\s\d+/);
                          return monthMatch
                            ? monthMatch[0].split(" ")[0]
                            : null;
                        })
                        .filter(Boolean)
                    ),
                  ];

                  const transformedData = {
                    ...initialFormData,
                    email: prevData.email || user.email || "",
                    name:
                      prevData.name ||
                      (user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.username || ""),
                    pronouns: prevData.pronouns || "",
                    bio: prevData.bio || prevData.shortBio || "",
                    company: prevData.company || prevData.companyName || "",
                    title: prevData.title || "",
                    linkedin:
                      prevData.linkedin || prevData.linkedinProfile || "",
                    portfolio: prevData.portfolio || "",
                    country: prevData.country || "",
                    state: prevData.state || "",
                    inPerson:
                      prevData.inPerson || (prevData.isInPerson ? "Yes" : "No"),
                    experienceLevel: prevData.experienceLevel || "",
                    volunteerType: parsePreviousArrayField("volunteerType"),
                    otherVolunteerType: prevData.otherVolunteerType || "",
                    skills: parsePreviousArrayField("skills"),
                    otherSkills: prevData.otherSkills || "",
                    socialCauses: parsePreviousArrayField("socialCauses"),
                    otherSocialCause: prevData.otherSocialCause || "",
                    motivation: prevData.motivation || "",
                    previousExperience: prevData.previousExperience || "",
                    codeOfConduct:
                      prevData.codeOfConduct ||
                      prevData.agreedToCodeOfConduct ||
                      false,
                    additionalInfo:
                      prevData.additionalInfo || prevData.comments || "",
                    event_id: event_id,
                    availableDays: matchedSlotIds,
                  };

                  // Update selected dates and months state
                  setSelectedDates(matchedDates);
                  setSelectedMonths(matchedMonths);

                  setFormData(transformedData);
                  setPreviouslySubmitted(true);
                  return;
                }
              }
            } catch (err) {
              console.error("Error loading previous submission:", err);
              // Fail silently and continue to try localStorage
            }
          }
        }

        // If no previous submission loaded, try to load from localStorage
        const loadedFromLocal = loadFromLocalStorage();

        // Handle manual save after the component is loaded
        if (!loadedFromLocal) {
          setTimeout(() => {
            saveToLocalStorage();
          }, 1000);
        }
      } catch (err) {
        console.error("Error initializing form:", err);
      }
    };

    loadUserAndFormData();
  }, [user, accessToken, event_id, availabilityOptions.length]);
  
  // Validation functions
  const validateBasicInfo = () => {
    const requiredFields = ['email', 'name', 'company'];
    
    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(`Please fill out the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field`);
        return false;
      }
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    setError('');
    return true;
  };
  
  const validateSkillsInfo = () => {
    // Validate volunteer types
    if (!formData.volunteerType || formData.volunteerType.length === 0) {
      setError('Please select at least one volunteer type');
      return false;
    }
    
    // Check for "Other" volunteer type
    if (formData.volunteerType.includes('Other') && !formData.otherVolunteerType) {
      setError('Please specify your other volunteer type');
      return false;
    }
    
    
    setError('');
    return true;
  };
  
  const validateAvailabilityInfo = () => {
    const requiredFields = ['country', 'state'];
    
    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(`Please fill out the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field`);
        return false;
      }
    }
    
    if (!formData.availableDays || formData.availableDays.length === 0) {
      setError('Please select at least one available time slot');
      return false;
    }
    
    setError('');
    return true;
  };
  
  const validateInterestsInfo = () => {
    // Validate social causes
    if (!formData.socialCauses || formData.socialCauses.length === 0) {
      setError('Please select at least one social cause you are interested in');
      return false;
    }
    
    // Check for "Other" social cause
    if (formData.socialCauses.includes('Other') && !formData.otherSocialCause) {
      setError('Please specify your other social cause interest');
      return false;
    }
    
    // Validate motivation
    if (!formData.motivation) {
      setError('Please share your motivation for volunteering with Opportunity Hack');
      return false;
    }
    
    setError('');
    return true;
  };

  const validateForm = () => {
    return (
      validateBasicInfo() &&
      validateSkillsInfo() &&
      validateAvailabilityInfo() &&
      validateInterestsInfo() &&
      formData.codeOfConduct
    );
  };

  // Accordion change handler for date selection
  const handleAccordionChange = (date) => (event, isExpanded) => {
    setExpandedDate(isExpanded ? date : null);
  };
  
  // Handle month selection
  const handleMonthToggle = (month) => {
    if (selectedMonths.includes(month)) {
      // If month is already selected, remove it
      setSelectedMonths(prev => prev.filter(m => m !== month));
      
      // Remove all dates from this month from selected dates
      const datesInMonth = Object.keys(availabilityByMonth[month] || {});
      setSelectedDates(prev => prev.filter(date => !datesInMonth.includes(date)));
      
      // Remove all time slots for this month from form data
      const slotIdsToRemove = [];
      datesInMonth.forEach(date => {
        const slotsForDate = availabilityByDate[date] || [];
        slotIdsToRemove.push(...slotsForDate.map(slot => slot.id));
      });
      
      setFormData(prev => ({
        ...prev,
        availableDays: prev.availableDays.filter(id => !slotIdsToRemove.includes(id))
      }));
    } else {
      // Add the month to selected months
      setSelectedMonths(prev => [...prev, month]);
      
      // Add all dates from this month to selected dates
      const datesInMonth = Object.keys(availabilityByMonth[month] || {});
      setSelectedDates(prev => [...new Set([...prev, ...datesInMonth])]);
    }
  };
  
  // Handle date filter change
  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value.toLowerCase());
  };
  
  // Filter dates based on search term
  const getFilteredDates = () => {
    if (!dateFilter) {
      return Object.keys(availabilityByDate);
    }
    return Object.keys(availabilityByDate).filter(
      date => date.toLowerCase().includes(dateFilter)
    );
  };
  
  // Handle date selection for time slots
  const handleDateToggle = (date) => {
    if (selectedDates.includes(date)) {
      // If date is already selected, remove it and also remove all time slots for this date
      const slotsForDate = availabilityByDate[date] || [];
      const slotIdsToRemove = slotsForDate.map(slot => slot.id);
      
      setSelectedDates(prev => prev.filter(d => d !== date));
      setFormData(prev => ({
        ...prev,
        availableDays: prev.availableDays.filter(id => !slotIdsToRemove.includes(id))
      }));
      
      // Check if we need to update selectedMonths
      const monthMatch = date.match(/[A-Z][a-z]{2}\s\d+/);
      if (monthMatch) {
        const month = monthMatch[0].split(' ')[0];
        const datesInMonth = Object.keys(availabilityByMonth[month] || {});
        const noMoreSelectedDatesInMonth = !datesInMonth.some(
          d => d !== date && selectedDates.includes(d)
        );
        
        if (noMoreSelectedDatesInMonth) {
          setSelectedMonths(prev => prev.filter(m => m !== month));
        }
      }
    } else {
      // Add the date to selected dates
      setSelectedDates(prev => [...prev, date]);
      
      // Make sure the month is selected as well
      const monthMatch = date.match(/[A-Z][a-z]{2}\s\d+/);
      if (monthMatch) {
        const month = monthMatch[0].split(' ')[0];
        if (!selectedMonths.includes(month)) {
          setSelectedMonths(prev => [...prev, month]);
        }
      }
    }
  };
  
  // Handle selecting all time slots for a specific date
  const handleSelectAllSlotsForDate = (date) => {
    const slotsForDate = availabilityByDate[date] || [];
    const slotIds = slotsForDate.map(slot => slot.id);
    
    // Add all slot IDs for this date to the availableDays array, avoiding duplicates
    setFormData(prev => {
      const existingIds = new Set(prev.availableDays);
      const newIds = slotIds.filter(id => !existingIds.has(id));
      return {
        ...prev,
        availableDays: [...prev.availableDays, ...newIds]
      };
    });
  };
  
  // Handle selecting all time slots for a specific month
  const handleSelectAllSlotsForMonth = (month) => {
    const datesInMonth = Object.keys(availabilityByMonth[month] || {});
    let allSlotIds = [];
    
    datesInMonth.forEach(date => {
      const slotsForDate = availabilityByDate[date] || [];
      allSlotIds.push(...slotsForDate.map(slot => slot.id));
    });
    
    // Add all slot IDs for this month to the availableDays array, avoiding duplicates
    setFormData(prev => {
      const existingIds = new Set(prev.availableDays);
      const newIds = allSlotIds.filter(id => !existingIds.has(id));
      return {
        ...prev,
        availableDays: [...prev.availableDays, ...newIds]
      };
    });
    
    // Make sure all dates in this month are selected
    setSelectedDates(prev => [...new Set([...prev, ...datesInMonth])]);
  };

  const handleNext = () => {
    if (activeStep === 0 && !validateBasicInfo()) return;
    if (activeStep === 1 && !validateSkillsInfo()) return;
    if (activeStep === 2 && !validateAvailabilityInfo()) return;
    if (activeStep === 3 && !validateInterestsInfo()) return;
    
    // Save progress when moving between steps
    handleManualSave();
    
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    // Save progress when moving between steps
    handleManualSave();
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!formData.codeOfConduct) {
      setError('You must agree to the code of conduct');
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      // Get reCAPTCHA token
      const recaptchaToken = await getRecaptchaToken();
      
      // If we couldn't get a token and we're in production, show error
      if (!recaptchaToken && process.env.NODE_ENV === 'production') {
        setError('Failed to verify you are human. Please refresh the page and try again.');
        return;
      }
      
      // Update timestamp before submission
      const submissionData = {
        ...formData,
        timestamp: new Date().toISOString(),
        // Process volunteerType with otherVolunteerType if needed
        volunteerType: formData.volunteerType.includes('Other') 
          ? [...formData.volunteerType.filter(t => t !== 'Other'), formData.otherVolunteerType].join(', ')
          : formData.volunteerType.join(', '),
        // Process skills with otherSkills if needed  
        skills: formData.skills.includes('Other')
          ? [...formData.skills.filter(s => s !== 'Other'), formData.otherSkills].join(', ')
          : formData.skills.join(', '),
        // Process socialCauses with otherSocialCause if needed
        socialCauses: formData.socialCauses.includes('Other')
          ? [...formData.socialCauses.filter(c => c !== 'Other'), formData.otherSocialCause].join(', ')
          : formData.socialCauses.join(', '),
        // Convert boolean values
        isInPerson: formData.inPerson === "Yes",
        // Add type information
        type: 'volunteers',
        volunteer_type: 'volunteer',
        agreedToCodeOfConduct: formData.codeOfConduct,
        linkedinProfile: formData.linkedin,
        shortBio: formData.bio,
        photoUrl: photoPreview || formData.photoUrl || '',
        // Map available days to their display text
        availability: formData.availableDays
          .map(
            (dayId) =>
              availabilityOptions.find((option) => option.id === dayId)
                ?.displayText || dayId
          )
          .join(", "),
        // Add reCAPTCHA token
        recaptchaToken
      };
      
      if (apiServerUrl) {
        // Submit to API
        const submitEndpoint = previouslySubmitted 
          ? `${apiServerUrl}/api/volunteer/application/${event_id}/update` 
          : `${apiServerUrl}/api/volunteer/application/${event_id}/submit`;
        
        const response = await fetch(submitEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(submissionData)
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          if (errorData?.error?.includes('recaptcha')) {
            throw new Error('reCAPTCHA verification failed. Please refresh the page and try again.');
          }
          throw new Error(`Failed to submit application: ${response.status}`);
        }
      } else {
        // In a test environment, log the data and simulate API delay
        console.log('Submitting volunteer application:', submissionData);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      // Clear saved form data after successful submission only if they are logged in
      // This is to prevent data loss for users who are not logged in where we don't have their login id
      if (isLoggedIn) {
        clearSavedData();
      }
      
      setSuccess(true);
    } catch (err) {
      console.error('Error submitting application:', err);
      setError('Failed to submit your application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Define steps for stepper
  const steps = ['Basic Info', 'Skills & Experience', 'Availability', 'Interests', 'Review'];

  // Render basic information form
  const renderBasicInfoForm = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
        Basic Information
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <TextField
          label="Email Address"
          name="email"
          type="email"
          required
          fullWidth
          value={formData.email || ''}
          onChange={handleFormChange}
          sx={{ mb: 3 }}
        />
        
        <TextField
          label="Your Name"
          name="name"
          required
          fullWidth
          value={formData.name || ''}
          onChange={handleFormChange}
          sx={{ mb: 3 }}
        />
        
        <TextField
          label="Your Pronouns (Optional)"
          name="pronouns"
          fullWidth
          value={formData.pronouns || ''}
          onChange={handleFormChange}
          sx={{ mb: 3 }}
        />
        
        <TextField
          label="Company or Organization"
          name="company"
          required
          fullWidth
          value={formData.company || ''}
          onChange={handleFormChange}
          sx={{ mb: 3 }}
        />
        
        <TextField
          label="Job Title"
          name="title"
          fullWidth
          value={formData.title || ''}
          onChange={handleFormChange}
          sx={{ mb: 3 }}
        />
        
        <TextField
          label="Short bio"
          name="bio"
          multiline
          rows={3}
          fullWidth
          value={formData.bio || ''}
          onChange={handleFormChange}
          helperText="Tell us a bit about yourself (aim for 100-200 words)"
          sx={{ mb: 3 }}
        />
        
        <Box sx={{ mb: 3 }}>
          <InputLabel htmlFor="photo-upload" sx={{ mb: 1 }}>
            Your Profile Photo (Optional)
          </InputLabel>
          <Button
            component="label"
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            sx={{ mb: 1 }}
          >
            Upload Photo
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              hidden
              onChange={handleFileChange}
            />
          </Button>
          <FormHelperText>Please upload a professional photo of yourself</FormHelperText>
          
          {photoPreview && (
            <Box sx={{ mt: 2, maxWidth: 200 }}>
              <img 
                src={photoPreview} 
                alt="Preview" 
                style={{ width: '100%', borderRadius: '4px' }} 
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
  
  // Render skills and experience form
  const renderSkillsAndExperienceForm = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
        Skills & Experience
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth required sx={{ mb: formData.volunteerType?.includes('Other') ? 1 : 3 }}>
          <InputLabel id="volunteer-type-label">How would you like to volunteer?</InputLabel>
          <Select
            labelId="volunteer-type-label"
            id="volunteer-type"
            multiple
            value={formData.volunteerType || []}
            onChange={(e) => customHandleMultiSelectChange(e, 'volunteerType')}
            input={<OutlinedInput label="How would you like to volunteer?" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
          >
            {volunteerTypeOptions.map((option) => (
              <MenuItem key={option} value={option}>
                <Checkbox checked={(formData.volunteerType || []).indexOf(option) > -1} />
                <ListItemText primary={option} />
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>Select all that apply</FormHelperText>
        </FormControl>
        
        {formData.volunteerType?.includes('Other') && (
          <TextField
            label="Please specify how you'd like to volunteer"
            name="otherVolunteerType"
            required
            fullWidth
            value={formData.otherVolunteerType || ''}
            onChange={handleFormChange}
            helperText="Tell us about your specific role or interest"
            sx={{ mb: 3 }}
          />
        )}
        
        
        
        <TextField
          label="Previous Experience (Optional)"
          name="previousExperience"
          multiline
          rows={3}
          fullWidth
          value={formData.previousExperience || ''}
          onChange={handleFormChange}
          helperText="Share any relevant volunteer or professional experience"
          sx={{ mb: 3 }}
        />
        
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="experience-level-label">Volunteer Experience Level</InputLabel>
          <Select
            labelId="experience-level-label"
            id="experience-level"
            name="experienceLevel"
            value={formData.experienceLevel || ''}
            onChange={handleFormChange}
            label="Volunteer Experience Level"
          >
            {experienceLevelOptions.map(option => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
          <FormHelperText>How much experience do you have with volunteering?</FormHelperText>
        </FormControl>
        
        <TextField
          label="LinkedIn Profile (Optional)"
          name="linkedin"
          type="url"
          fullWidth
          value={formData.linkedin || ''}
          onChange={handleFormChange}
          sx={{ mb: 3 }}
          placeholder="https://linkedin.com/in/yourprofile"
        />              

        <TextField
          label="Portfolio/Personal Website (Optional)"
          name="portfolio"
          type="url"
          fullWidth
          value={formData.portfolio || ''}
          onChange={handleFormChange}
          sx={{ mb: 3 }}
          placeholder="https://yourwebsite.com"
        />
      </Box>
    </Box>
  );
  
  // Helper function to determine if event is virtual/global
  const isVirtualEvent = () => {
    if (!eventData?.location) return false;
    const location = eventData.location.toLowerCase();
    return location.includes('global') || 
           location.includes('virtual') || 
           location.includes('online') ||
           location.includes('remote');
  };

  // Render availability form with time slots selection
  const renderAvailabilityForm = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
        Availability & Location
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        {/* Conditionally show in-person attendance field only for physical events */}
        {!isVirtualEvent() && (
          <FormControl required component="fieldset" sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Are you joining us in-person or virtually?
            </Typography>
            <RadioGroup
              name="inPerson"
              value={formData.inPerson || ''}
              onChange={handleFormChange}
            >
              <FormControlLabel value="Yes" control={<Radio />} label="Yes, I'll attend in person" />
              <FormControlLabel value="No" control={<Radio />} label="No, I'll participate virtually" />
            </RadioGroup>
          </FormControl>
        )}
        
        <TextField
          label={isVirtualEvent() ? "Which country will you be volunteering from?" : 
                 (formData.inPerson === "Yes" ? "Which country are you traveling from?" : "Which country will you be volunteering from?")}
          name="country"
          required
          fullWidth
          value={formData.country || ''}
          onChange={handleFormChange}
          sx={{ mb: 3 }}
        />
        
        <TextField
          label={isVirtualEvent() ? "State/Province (where you'll be volunteering from)" : 
                 (formData.inPerson === "Yes" ? "State/Province (where you're traveling from)" : "State/Province (where you'll be volunteering from)")}
          name="state"
          required
          fullWidth
          value={formData.state || ''}
          onChange={handleFormChange}
          sx={{ mb: 3 }}
        />

        <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
          When can you volunteer? (Select all that apply)
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Select the dates you are available. For each date, pick the time slots you can volunteer. For long hackathons, use the filter to quickly find your dates.
        </Typography>

        {/* Date filter/search */}
        <TextField
          label="Filter dates"
          variant="outlined"
          fullWidth
          value={dateFilter}
          onChange={handleDateFilterChange}
          placeholder="Type to filter dates (e.g., 'Monday' or 'Jan')"
          sx={{ mb: 2 }}
        />

        {/* Accordion for each date */}
        {getFilteredDates().length === 0 ? (
          <Alert severity="info">No dates match your filter.</Alert>
        ) : (
          <Box>
            {getFilteredDates().map((date) => (
              <Accordion
                key={date}
                expanded={expandedDate === date}
                onChange={handleAccordionChange(date)}
                sx={{ mb: 2 }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`panel-${date}-content`}
                  id={`panel-${date}-header`}
                  sx={{ bgcolor: selectedDates.includes(date) ? 'primary.light' : 'background.paper', color: selectedDates.includes(date) ? 'white' : 'text.primary' }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Chip
                      label={date}
                      color={selectedDates.includes(date) ? 'primary' : 'default'}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDateToggle(date);
                      }}
                      sx={{ mr: 2 }}
                    />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', flexGrow: 1 }}>{date}</Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectAllSlotsForDate(date);
                      }}
                      sx={{ ml: 2 }}
                    >
                      Select All Slots
                    </Button>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {/* Time slots for this date */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                    {availabilityByDate[date]?.map((slot) => (
                      <Paper
                        key={slot.id}
                        elevation={formData.availableDays.includes(slot.id) ? 8 : 1}
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          bgcolor: formData.availableDays.includes(slot.id) ? 'primary.light' : 'background.paper',
                          color: formData.availableDays.includes(slot.id) ? 'white' : 'text.primary',
                          borderRadius: 2,
                          '&:hover': {
                            bgcolor: formData.availableDays.includes(slot.id) ? 'primary.main' : 'action.hover',
                            transform: 'translateY(-4px)',
                            boxShadow: 6
                          }
                        }}
                        onClick={() => {
                          const newAvailability = formData.availableDays.includes(slot.id)
                            ? formData.availableDays.filter(id => id !== slot.id)
                            : [...formData.availableDays, slot.id];
                          setFormData(prev => ({
                            ...prev,
                            availableDays: newAvailability
                          }));
                        }}
                      >
                        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                          <Typography variant="body1" sx={{ mb: 1, fontWeight: 'bold' }}>
                            {slot.icon} {slot.label}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {slot.time}
                          </Typography>
                          <Typography variant="caption" sx={{ mt: 'auto', fontStyle: 'italic' }}>
                            {slot.energy}
                          </Typography>
                          {formData.availableDays.includes(slot.id) && (
                            <Chip label="Selected!" color="success" size="small" sx={{ alignSelf: 'flex-start', mt: 1 }} />
                          )}
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}

        {/* Selected slots summary (sticky on desktop, top on mobile) */}
        <Box sx={{
          position: isMobile ? 'static' : 'sticky',
          top: isMobile ? undefined : 80,
          zIndex: 10,
          mt: 3,
          p: 2,
          bgcolor: 'success.light',
          color: 'white',
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          minHeight: 56
        }}>
          <Typography variant="subtitle1">
            You've selected {formData.availableDays.length} time slot{formData.availableDays.length !== 1 ? 's' : ''}
            {selectedDates.length > 0 && ` across ${selectedDates.length} day${selectedDates.length !== 1 ? 's' : ''}`}!
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {formData.availableDays.map(slotId => {
              const slot = availabilityOptions.find(opt => opt.id === slotId);
              return (
                <Chip
                  key={slotId}
                  label={`${slot?.icon} ${slot?.date} ${slot?.label}`}
                  onDelete={() => {
                    setFormData(prev => ({
                      ...prev,
                      availableDays: prev.availableDays.filter(id => id !== slotId)
                    }));
                  }}
                  color="primary"
                  sx={{ mb: 1 }}
                />
              );
            })}
          </Box>
          {formData.availableDays.length > 0 && (
            <Button
              variant="contained"
              color="warning"
              size="small"
              onClick={() => {
                setFormData(prev => ({ ...prev, availableDays: [] }));
                setSelectedDates([]);
              }}
              sx={{ mt: 2 }}
            >
              Clear All
            </Button>
          )}
        </Box>
        {formData.availableDays.length === 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Please select at least one time slot when you'll be available to volunteer.
          </Alert>
        )}
      </Box>
    </Box>
  );
  
  // Render interests form
  const renderInterestsForm = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
        Interests & Motivation
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth required sx={{ mb: formData.socialCauses?.includes('Other') ? 1 : 3 }}>
          <InputLabel id="social-causes-label">Social Causes You're Interested In</InputLabel>
          <Select
            labelId="social-causes-label"
            id="social-causes"
            multiple
            value={formData.socialCauses || []}
            onChange={(e) => customHandleMultiSelectChange(e, 'socialCauses')}
            input={<OutlinedInput label="Social Causes You're Interested In" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
          >
            {socialCausesOptions.map((option) => (
              <MenuItem key={option} value={option}>
                <Checkbox checked={(formData.socialCauses || []).indexOf(option) > -1} />
                <ListItemText primary={option} />
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>Select causes you're passionate about (select at least one)</FormHelperText>
        </FormControl>
        
        {formData.socialCauses?.includes('Other') && (
          <TextField
            label="Please specify your other social cause interest"
            name="otherSocialCause"
            required
            fullWidth
            value={formData.otherSocialCause || ''}
            onChange={handleFormChange}
            helperText="Tell us about your specific interest"
            sx={{ mb: 3 }}
          />
        )}
        
        <TextField
          label="What motivates you to volunteer with Opportunity Hack?"
          name="motivation"
          multiline
          rows={3}
          required
          fullWidth
          value={formData.motivation || ''}
          onChange={handleFormChange}
          helperText="Share your motivation for getting involved"
          sx={{ mb: 3 }}
        />
      </Box>
    </Box>
  );
  
  // Render review form
  const renderReviewForm = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
        Review & Submit
      </Typography>
      
      <TextField
        label="Any additional information or questions?"
        name="additionalInfo"
        multiline
        rows={4}
        fullWidth
        value={formData.additionalInfo || ''}
        onChange={handleFormChange}
        sx={{ mb: 4 }}
      />
      
      <FormControlLabel
        control={
          <Checkbox
            name="codeOfConduct"
            checked={formData.codeOfConduct || false}
            onChange={handleFormChange}
            color="primary"
            required
          />
        }
        label={
          <Typography variant="body2">
            I agree to the{" "}
            <Link
              href="/hack/code-of-conduct"
              target="_blank"
              rel="noopener noreferrer"
            >
              Code of Conduct
            </Link>
          </Typography>
        }
        sx={{ mb: 2 }}
      />
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          By submitting this form, you're expressing interest in volunteering with Opportunity Hack. 
          We'll review your application and send you further details about how you can contribute.
        </Typography>
      </Alert>
    </Box>
  );
  
  // Function to render the current step form
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderBasicInfoForm();
      case 1:
        return renderSkillsAndExperienceForm();
      case 2:
        return renderAvailabilityForm();
      case 3:
        return renderInterestsForm();
      case 4:
        return renderReviewForm();
      default:
        return 'Unknown step';
    }
  };
  
  // Enhanced SEO metadata and descriptions
  const pageTitle = eventData 
    ? `Volunteer for ${eventData.name} | Help Run a Tech for Good Hackathon`
    : "Volunteer for Opportunity Hack | Tech for Good Hackathon";
  const pageDescription = eventData
    ? `Join our volunteer team for ${eventData.name} in ${eventData.location} from ${eventData.formattedStartDate} to ${eventData.formattedEndDate}. Help run an impactful hackathon where developers create technology solutions for nonprofits. Volunteer as a mentor, judge, or event organizer.`
    : "Volunteer for Opportunity Hack hackathon! Help run events where developers create technology solutions for nonprofits. Join as a mentor, judge, or organizer and make a real impact in the tech for good community.";
  const canonicalUrl = `https://ohack.dev/hack/${event_id}/volunteer-application`;
  
  const imageUrl = "https://cdn.ohack.dev/ohack.dev/2024_hackathon_3.webp";
  
  // Structured data for volunteer application
  const structuredData = eventData ? {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": pageTitle,
    "description": pageDescription,
    "url": canonicalUrl,
    "mainEntity": {
      "@type": "Event",
      "name": eventData.name,
      "startDate": eventData.startDate,
      "endDate": eventData.endDate,
      "location": {
        "@type": "Place",
        "name": eventData.location
      },
      "organizer": {
        "@type": "Organization",
        "name": "Opportunity Hack",
        "url": "https://ohack.dev"
      }
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://ohack.dev/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Hackathons",
          "item": "https://ohack.dev/hack"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": eventData.name,
          "item": `https://ohack.dev/hack/${event_id}`
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": "Volunteer Application",
          "item": canonicalUrl
        }
      ]
    }
  } : null;

  // If form submitted successfully, show success message
  if (success) {
    return (
      <Container>
        <Head>
          <title>{pageTitle}</title>
          <meta name="description" content={pageDescription} />
          <link rel="canonical" href={canonicalUrl} />
        </Head>
        
        <Box my={8} textAlign="center">
          <Typography variant="h1" component="h1" sx={{ fontSize: '2.5rem', mb: 4, mt: 12 }}>
            Application Submitted!
          </Typography>
          
          <Alert severity="success" sx={{ mb: 4, mx: 'auto', maxWidth: 600 }}>
            Thank you for applying to volunteer with Opportunity Hack. We'll review your application and contact you with next steps soon.
          </Alert>
          
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
            <GiveButterWidget 
              context="success"
              userId={user?.userId}
              applicationType="volunteer"
              size="large"
              onDonationEvent={(eventData) => {
                // Track volunteer application donations
                console.log('Volunteer donation event:', eventData);
                // You can add additional tracking here
              }}
            />
          </Box>
          
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push(`/hack/${event_id}`)}
            sx={{ mt: 2 }}
          >
            Return to Hackathon Page
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta charSet="UTF-8" />
        <meta
          name="keywords"
          content={`hackathon volunteer, volunteer application, tech for good, nonprofit hackathon, opportunity hack, social good, volunteer, community service, ${eventData?.name || 'hackathon'}, ${eventData?.location || 'tech event'}, mentor, judge, event organizer`}
        />
        <meta name="author" content="Opportunity Hack" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph tags */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:alt" content="Volunteers helping at Opportunity Hack hackathon" />
        <meta property="og:site_name" content="Opportunity Hack" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@OpportunityHack" />
        <meta name="twitter:creator" content="@OpportunityHack" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={imageUrl} />
        <meta name="twitter:image:alt" content="Volunteers helping at Opportunity Hack hackathon" />

        {/* Additional SEO tags */}
        <meta name="application-name" content="Opportunity Hack" />
        <meta name="theme-color" content="#3f51b5" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Preconnect to optimize loading */}
        <link rel="preconnect" href="https://cdn.ohack.dev" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.ohack.dev" />
      </Head>

      {structuredData && (
        <Script
          id="volunteer-application-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}

      {/* Form persistence notification component */}
      <FormPersistenceControls
        onSave={handleManualSave}
        onRestore={loadFromLocalStorage}
        onClear={clearSavedData}
        notification={notification}
        onCloseNotification={closeNotification}
      />

      <Box ref={formRef}>                
        <Typography
          variant="h1"
          component="h1"
          sx={{ fontSize: "2.5rem", mb: 2, mt: 0 }}
        >
          Volunteer Application
        </Typography>

        {isLoading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {/* Header section with responsive layout */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'flex-start', md: 'flex-start' },
              gap: 2,
              mb: 3
            }}>
              {/* Event info */}
              <Box sx={{ flex: 1 }}>
                {eventData && (
                  <>
                    <Typography
                      variant="h2"
                      component="h2"
                      sx={{ fontSize: "1.75rem", mb: 1 }}
                    >
                      {eventData.name}
                    </Typography>
                    
                    <Typography 
                      variant="h3" 
                      component="h3" 
                      sx={{ 
                        fontSize: "1.25rem", 
                        mb: 1,
                        color: "text.secondary" 
                      }}
                    >
                      {eventData.location}
                    </Typography>
                    
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        mb: 1,
                        color: "text.secondary",
                        display: "flex",
                        alignItems: "center",
                        gap: 1
                      }}
                    >
                      <Box component="span" sx={{ display: "inline-flex", alignItems: "center" }}>
                        📆 {eventData.formattedStartDate}
                      </Box>
                      {eventData.formattedStartDate !== eventData.formattedEndDate && (
                        <>
                          <Box component="span" sx={{ mx: 0.5 }}>to</Box>
                          <Box component="span" sx={{ display: "inline-flex", alignItems: "center" }}>
                            {eventData.formattedEndDate}
                          </Box>
                        </>
                      )}
                    </Typography>
                  </>
                )}
              </Box>

              {/* Social proof image */}
              <Box 
                sx={{ 
                  width: { xs: '100%', sm: '180px', md: '220px' },
                  height: { xs: '140px', sm: '120px', md: '150px' },
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: 2,
                  flexShrink: 0,
                  alignSelf: { xs: 'center', md: 'flex-start' },
                  maxWidth: '100%',
                  mt: { xs: 0, md: 1 }
                }}
              >
                <img 
                  src="https://cdn.ohack.dev/ohack.dev/2024_hackathon_3.webp" 
                  alt="Volunteers helping at Opportunity Hack" 
                  style={{ 
                    width: '100%',
                    height: '100%',
                    display: 'block',
                    objectFit: 'cover'
                  }}
                />
              </Box>
            </Box>

            {/* Add ApplicationNav component */}
            {event_id && <ApplicationNav eventId={event_id} currentType="volunteer" />}
            
            <Box sx={{ mb: 4 }}>
              {eventData && eventData.isEventPast ? (
                <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
                  <Alert severity="warning" sx={{ mb: 3 }}>
                    <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                      This event has already ended
                    </Typography>
                    <Typography variant="body1">
                      Applications are no longer being accepted for volunteers as this hackathon has already concluded.
                      Please check our upcoming events for future volunteering opportunities.
                    </Typography>
                  </Alert>
                  <Box textAlign="center">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => router.push('/hack')}
                      sx={{ mt: 2 }}
                    >
                      View Upcoming Events
                    </Button>
                  </Box>
                </Paper>
              ) : (
                <>
                  <Stepper
                    activeStep={activeStep}
                    alternativeLabel={!isMobile}
                    orientation={isMobile ? "horizontal" : "horizontal"}
                    sx={{ 
                      mb: 4,
                      ...(isMobile && {
                        '& .MuiStepLabel-root': {
                          padding: '0 4px', // Reduce padding on mobile
                        },
                        '& .MuiStepLabel-labelContainer': {
                          width: 'auto', // Let the label container be as small as possible
                        },
                        '& .MuiStepLabel-label': {
                          fontSize: '0.7rem', // Smaller text on mobile
                          whiteSpace: 'nowrap', // Prevent text wrapping
                        },
                        '& .MuiSvgIcon-root': {
                          width: 20, // Smaller icons
                          height: 20,
                        },
                        overflowX: 'auto', // Allow horizontal scrolling if needed
                        '&::-webkit-scrollbar': {
                          display: 'none' // Hide scrollbar on webkit browsers
                        },
                        scrollbarWidth: 'none', // Hide scrollbar on Firefox
                      })
                    }}
                  >
                    {steps.map((label) => (
                      <Step key={label}>
                        <StepLabel>{isMobile ? (
                          // On mobile, show abbreviated labels or just the step number
                          activeStep === steps.indexOf(label) ? label : (steps.indexOf(label) + 1)
                        ) : (
                          // On desktop, show full labels
                          label
                        )}</StepLabel>
                      </Step>
                    ))}
                  </Stepper>

                  <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
                    <Typography variant="body1" paragraph>
                      Thank you for your interest in volunteering with Opportunity Hack! Volunteers play a crucial role
                      in the success of our events and help create a supportive environment for participants.
                    </Typography>
                    
                    {eventData && eventData.description && (
                      <Typography variant="body1" sx={{ mb: 3 }}>
                        <strong>About this event:</strong> {eventData.description}
                      </Typography>
                    )}
                    
                    <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 4 }}>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>What to expect as a volunteer:</strong>
                      </Typography>
                      <ul style={{ marginBottom: 0, paddingLeft: '1.5rem' }}>
                        <li>Support the organization and logistics of the hackathon</li>
                        <li>Help participants navigate the event and find resources</li>
                        <li>Contribute your skills to make the event a success</li>
                        <li>Connect with a community passionate about social impact</li>
                        <li>Gain experience and build your network</li>
                      </ul>
                    </Alert>
                    
                    {(error || recaptchaError) && (
                      <Alert severity="error" sx={{ mb: 4 }}>
                        {error || recaptchaError}
                      </Alert>
                    )}

                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                      {getStepContent(activeStep)}
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                        <Button
                          disabled={activeStep === 0 || submitting}
                          onClick={handleBack}
                          variant="outlined"
                        >
                          Back
                        </Button>
                        
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleNext}
                          disabled={submitting || recaptchaLoading}
                        >
                          {activeStep === steps.length - 1 ? (
                            submitting || recaptchaLoading ? <CircularProgress size={24} /> : 'Submit Application'
                          ) : (
                            'Next'
                          )}
                        </Button>
                      </Box>
                    </form>
                  </Paper>
                </>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
};

// Export the component with RequiredAuthProvider
const VolunteerApplicationPage = ({ seoMetadata }) => {
  const router = useRouter();
  const { event_id } = router.query;

  // Create the current URL for redirection
  const currentUrl = typeof window !== 'undefined' && event_id
    ? `${window.location.origin}/hack/${event_id}/volunteer-application`
    : null;

  return (
    <>
      {/* SEO metadata available to crawlers before authentication */}
      <Head>
        <title>{seoMetadata.title}</title>
        <meta name="description" content={seoMetadata.description} />
        <meta
          name="keywords"
          content="hackathon volunteer, volunteer application, tech for good, nonprofit hackathon, opportunity hack, volunteering, community service"
        />
        <link rel="canonical" href={seoMetadata.canonicalUrl} />

        {/* Open Graph tags */}
        <meta property="og:title" content={seoMetadata.title} />
        <meta property="og:description" content={seoMetadata.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={seoMetadata.canonicalUrl} />
        <meta property="og:image" content={seoMetadata.imageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Volunteers supporting teams at Opportunity Hack" />
        <meta property="og:site_name" content="Opportunity Hack" />

        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoMetadata.title} />
        <meta name="twitter:description" content={seoMetadata.description} />
        <meta name="twitter:image" content={seoMetadata.imageUrl} />
        <meta name="twitter:image:alt" content="Volunteers supporting teams at Opportunity Hack" />

        {/* Additional SEO meta tags */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Opportunity Hack" />
        <meta name="theme-color" content="#1976d2" />
      </Head>

      {/* Structured Data for SEO */}
      <Script
        id="volunteer-application-structured-data-seo"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": seoMetadata.title,
            "description": seoMetadata.description,
            "url": seoMetadata.canonicalUrl,
            "isPartOf": {
              "@type": "WebSite",
              "name": "Opportunity Hack",
              "url": "https://ohack.dev"
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://ohack.dev"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Hackathons",
                  "item": "https://ohack.dev/hack"
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": seoMetadata.eventName,
                  "item": `https://ohack.dev/hack/${event_id}`
                },
                {
                  "@type": "ListItem",
                  "position": 4,
                  "name": "Volunteer Application",
                  "item": seoMetadata.canonicalUrl
                }
              ]
            },
            "mainEntity": {
              "@type": "JobPosting",
              "title": `Volunteer for ${seoMetadata.eventName}`,
              "description": "Support teams and help organize our hackathon event focused on building tech solutions for nonprofits",
              "hiringOrganization": {
                "@type": "Organization",
                "name": "Opportunity Hack"
              },
              "jobLocation": {
                "@type": "Place",
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": seoMetadata.location.split(',')[0] || "Tempe",
                  "addressRegion": "Arizona",
                  "addressCountry": "US"
                }
              },
              "employmentType": "VOLUNTEER",
              "industry": "Technology for Social Good",
              "responsibilities": [
                "Assist with event setup and logistics",
                "Support participants during the hackathon",
                "Help with registration and check-in processes",
                "Provide general event support and assistance"
              ],
              "qualifications": [
                "Enthusiasm for social impact and nonprofit work",
                "Strong communication and interpersonal skills",
                "Ability to work in a fast-paced environment",
                "Willingness to help teams and participants"
              ]
            }
          })
        }}
      />

      <RequiredAuthProvider
        authUrl={process.env.NEXT_PUBLIC_REACT_APP_AUTH_URL}
        displayIfLoggedOut={
          <RedirectToLogin
            postLoginRedirectUrl={currentUrl || window.location.href}
          />
        }
      >
        <VolunteerApplicationComponent />
      </RequiredAuthProvider>
    </>
  );
};

// Server-side props for SEO metadata (available to crawlers before auth)
export async function getServerSideProps(context) {
  const { event_id } = context.params;
  
  // Default metadata for SEO
  let seoMetadata = {
    title: "Volunteer at Opportunity Hack | Support Tech for Good",
    description: "Apply to volunteer at our hackathon event. Help support teams building tech solutions for nonprofits and make a difference in your community.",
    eventName: "Opportunity Hack",
    location: "Tempe, Arizona",
    canonicalUrl: `https://ohack.dev/hack/${event_id}/volunteer-application`,
    imageUrl: "https://cdn.ohack.dev/ohack.dev/2024_hackathon_1.webp"
  };

  // Try to fetch event data for better SEO
  try {
    const apiServerUrl = process.env.NEXT_PUBLIC_REACT_APP_API_SERVER_URL;
    if (apiServerUrl) {
      const response = await fetch(`${apiServerUrl}/api/messages/hackathon/${event_id}`);
      
      if (response.ok) {
        const eventData = await response.json();
        
        if (eventData && eventData.title) {
          seoMetadata = {
            title: `Volunteer at ${eventData.title} | Support Tech for Good`,
            description: `Apply to volunteer at ${eventData.title} in ${eventData.location || 'Tempe, Arizona'}. Help support teams building innovative tech solutions for nonprofits.`,
            eventName: eventData.title,
            location: eventData.location || 'Tempe, Arizona',
            canonicalUrl: `https://ohack.dev/hack/${event_id}/volunteer-application`,
            imageUrl: eventData.image_url || "https://cdn.ohack.dev/ohack.dev/2024_hackathon_1.webp"
          };
        }
      }
    }
  } catch (error) {
    console.error('Failed to fetch event data for SEO:', error);
    // Continue with default metadata
  }

  return {
    props: {
      seoMetadata
    }
  };
}

export default VolunteerApplicationPage;