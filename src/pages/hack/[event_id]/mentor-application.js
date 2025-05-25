import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuthInfo, RequiredAuthProvider, RedirectToLogin } from '@propelauth/react';
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
  useTheme,
  useMediaQuery,
  RadioGroup,  
} from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Head from 'next/head';
import Script from 'next/script';
import { useEnv } from '../../../context/env.context';
import LoginOrRegister from '../../../components/LoginOrRegister/LoginOrRegister';
import ApplicationNav from '../../../components/ApplicationNav/ApplicationNav';
import Breadcrumbs from '../../../components/Breadcrumbs/Breadcrumbs';
import InfoIcon from '@mui/icons-material/Info';
import FormPersistenceControls from '../../../components/FormPersistenceControls';
import { useFormPersistence } from '../../../hooks/use-form-persistence';
import { useRecaptcha } from '../../../hooks/use-recaptcha';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import RadioIcon from '@mui/material/Radio';

const MentorApplicationComponent = () => {
  const router = useRouter();
  const { event_id } = router.query;
  const { isLoggedIn, user, accessToken } = useAuthInfo();
  const { apiServerUrl } = useEnv();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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
  
  // Prevent duplicate confirmation dialogs
  const confirmationShownRef = useRef(false);
  
  // Form navigation state
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [eventData, setEventData] = useState(null);
  // Add missing submitting state
  const [submitting, setSubmitting] = useState(false);
  
  // Initial form state
  const initialFormData = {
    timestamp: new Date().toISOString(),
    email: '',
    name: '',
    pronouns: '',
    company: '',
    bio: '',
    picture: '',
    linkedin: '',
    inPerson: '',
    expertise: [], // Changed from string to array
    otherExpertise: '', // New field for "Other" option
    participationCount: '',
    engineeringSpecifics: [],
    availableDays: [],
    country: '',
    state: '',
    codeOfConduct: false,
    comments: '',
    shirtSize: '',
    agreedToCodeOfConduct: false,
    linkedinProfile: '',
    shortBio: '',
    photoUrl: '',
    event_id: '',
    isSelected: false
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
    formType: 'mentor',
    eventId: event_id,
    userId: user?.userId,
    initialFormData,
    apiServerUrl,
    accessToken
  });
  
  // Available engineering specifics options
  const engineeringOptions = [
    'Front-end (CSS/JS, Node, Angular, React, etc)',
    'Back-end (Java, Python, Ruby, etc)',
    'AWS',
    'Google Cloud',
    'Heroku',
    'Data Science & Machine Learning',
    'Data Analysis',
    'Mobile (iOS, Android)',
    'GitHub ninja'
  ];
  
  // Common expertise areas for mentors
  const expertiseOptions = [
    "Software Development",
    "Product Management",
    "UX/UI Design",
    "Data Science & Analytics",
    "Cloud Architecture",
    "DevOps",
    "Mobile Development",
    "Nonprofit Technology",
    "Entrepreneurship",
    "Digital Marketing",
    "Project Management",
    "Business Strategy",
    "Cybersecurity",
    "Database Management",
    "AI/Machine Learning",
    "Other" // Option to specify custom expertise
  ];
  
  // Function to generate time slots based on event dates - moved outside useEffect to avoid recreating on each render
  const generateTimeSlots = (startDate, endDate) => {
    if (!startDate || !endDate) return [];
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Time blocks with icons and descriptions
    const timeBlocks = [
      { time: '7am - 9am', label: 'Early Morning', icon: '🌅', energy: 'Fresh minds ready to help!' },
      { time: '9am - 12pm', label: 'Morning', icon: '☀️', energy: 'Peak productivity time!' },
      { time: '1pm - 3pm', label: 'Afternoon', icon: '🏙️', energy: 'Post-lunch problem solving' },
      { time: '4pm - 7pm', label: 'Evening', icon: '🌆', energy: 'Steady focus time' },
      { time: '8pm - 11pm', label: 'Night', icon: '🌃', energy: 'Late night debugging sessions' },
      { time: '11pm - 2am', label: 'Late Night', icon: '🌙', energy: 'For the night owls!' }
    ];
    
    const slots = [];
    
    // Loop through each day between start and end dates
    for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
      const dayDate = new Date(day);
      const dateString = dayDate.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'short', 
        day: 'numeric'
      });
      
      // Add each time block for this day
      timeBlocks.forEach(block => {
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
    }
    
    return slots;
  };
  
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
  // New: State for expanded date in accordion (moved it up here to be with other hooks)
  const [expandedDate, setExpandedDate] = useState(null);

  // fetch event data from the backend API and initialize reCAPTCHA
  useEffect(() => {
    // Initialize reCAPTCHA when component mounts
    initializeRecaptcha();
    
    if (!event_id || !apiServerUrl) return;

    const fetchEventData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch event data from the actual API
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
        
        
        
        // Initialize formData with user information and event ID
        if (user) {
          setFormData(prev => ({
            ...prev,
            email: user.email || '',
            name: user.firstName && user.lastName 
              ? `${user.firstName} ${user.lastName}` 
              : user.username || '',
            event_id: event_id
          }));
          
          // Check for previous submission
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
              const availabilityText = prevData.availability || "";

              // Get the already generated slots, not regenerate them
              const matchedSlotIds = slots
                .filter((slot) => availabilityText.includes(slot.displayText))
                .map((slot) => slot.id);

              const transformedData = {
                ...formData,
                email: prevData.email || formData.email,
                name: prevData.name || formData.name,
                pronouns: prevData.pronouns || "",
                company: prevData.company || "",
                bio: prevData.shortBio || prevData.bio || "",
                picture: prevData.photoUrl || prevData.picture || "",
                linkedin: prevData.linkedinProfile || prevData.linkedin || "",
                inPerson: prevData.isInPerson ? "Yes!" : "No, I'll be virtual",
                expertise: (prevData.expertise || "")
                  .split(", ")
                  .filter(Boolean),
                participationCount: prevData.participationCount || "",
                engineeringSpecifics: (
                  prevData.softwareEngineeringSpecifics || ""
                )
                  .split(", ")
                  .filter(Boolean),
                availableDays: matchedSlotIds,
                country: prevData.country || "",
                state: prevData.state || "",
                codeOfConduct: prevData.agreedToCodeOfConduct || false,
                comments: prevData.additionalInfo || prevData.comments || "",
                shirtSize: prevData.shirtSize || "",
                event_id: event_id,
              };

              setFormData(transformedData);
            }

            // Initialize selected dates based on previously selected slots            
            const availabilityText = prevData.availability || "";
            const matchedSlotIds = slots
              .filter((slot) => availabilityText.includes(slot.displayText))
              .map((slot) => slot.id);

            // Extract unique dates from matched slots
            const matchedDates = [
              ...new Set(
                matchedSlotIds
                  .map((id) => {
                    const slot = slots.find((s) => s.id === id);
                    return slot ? slot.date : null;
                  })
                  .filter(Boolean)
              ),
            ];

            setSelectedDates(matchedDates);

            // Extract unique months from matched dates
            const matchedMonths = [
              ...new Set(
                matchedDates
                  .map((date) => {
                    const monthMatch = date.match(/[A-Z][a-z]{2}\s\d+/);
                    return monthMatch ? monthMatch[0].split(" ")[0] : null;
                  })
                  .filter(Boolean)
              ),
            ];

            setSelectedMonths(matchedMonths);
          
          } else {
            // If no previous submission, try to load from localStorage
            loadFromLocalStorage();
          }
        } else {
          setFormData(prev => ({
            ...prev,
            event_id: event_id
          }));
          
          // Try loading from localStorage for non-logged-in users
          loadFromLocalStorage();
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching event data:', err);
        setError('Failed to load event data. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [event_id, user, apiServerUrl, loadPreviousSubmission, loadFromLocalStorage, setFormData, initializeRecaptcha]);
  
  // Now define the custom implementation that uses handleMultiSelectChange
  const customHandleMultiSelectChange = (event, fieldName) => {
    handleMultiSelectChange(event, fieldName);
    
    // Clear otherExpertise when Other is removed from expertise
    if (fieldName === 'expertise' && !event.target.value.includes('Other')) {
      setFormData(prev => ({
        ...prev,
        otherExpertise: ''
      }));
    }
  };
  
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
        picture: reader.result
      }));
    };
    reader.onerror = () => {
      setError('Failed to read the selected file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  // Extend handleFormChange to handle otherExpertise field
  const handleChange = (e) => {
    handleFormChange(e);
    
    // Clear otherExpertise when expertise doesn't include "Other"
    const { name, value } = e.target;
    if (name === 'expertise' && !value.includes('Other')) {
      setFormData(prev => ({
        ...prev,
        otherExpertise: ''
      }));
    }
  };
  
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
  
  const validateSkillsAndExperience = () => {
    // Validate expertise field
    if (!formData.expertise || formData.expertise.length === 0) {
      setError('Please select at least one area of expertise');
      return false;
    }
    
    // Validate otherExpertise if "Other" is selected
    if (formData.expertise.includes('Other') && !formData.otherExpertise) {
      setError('Please specify your custom area of expertise');
      return false;
    }
    
    // Validate array fields
    if (!formData.engineeringSpecifics || formData.engineeringSpecifics.length === 0) {
      setError('Please select at least one engineering specific');
      return false;
    }
    
    setError('');
    return true;
  };
  
  const validateAvailability = () => {
    const requiredFields = ['inPerson', 'participationCount', 'country', 'state'];
    
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

  const validateForm = () => {
    return (
      validateBasicInfo() &&
      validateSkillsAndExperience() &&
      validateAvailability() &&
      formData.codeOfConduct
    );
  };

  const handleNext = () => {
    if (activeStep === 0 && !validateBasicInfo()) return;
    if (activeStep === 1 && !validateSkillsAndExperience()) return;
    if (activeStep === 2 && !validateAvailability()) return;
    
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  // Toggle between month view and date view
  const toggleViewMode = () => {
    setViewMode(prev => prev === "month" ? "date" : "month");
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
  
  // Handle quick filters
  const applyQuickFilter = (filterType) => {
    const allDates = Object.keys(availabilityByDate);
    let filteredDates = [];
    
    switch (filterType) {
      case 'weekdays':
        filteredDates = allDates.filter(date => 
          !date.includes('Saturday') && !date.includes('Sunday')
        );
        break;
      case 'weekends':
        filteredDates = allDates.filter(date => 
          date.includes('Saturday') || date.includes('Sunday')
        );
        break;
      case 'all':
        filteredDates = allDates;
        break;
      case 'none':
        filteredDates = [];
        break;
      default:
        return;
    }
    
    setSelectedDates(filteredDates);
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
      if (!recaptchaToken && process.env.NODE_ENV === "production") {
        setError(
          "Failed to verify you are human. Please refresh the page and try again."
        );
        return;
      }

      // Update timestamp before submission
      const submissionData = {
        ...formData,
        timestamp: new Date().toISOString(),
        // Process expertise - combine selected expertise with otherExpertise if present
        expertise: formData.expertise.includes("Other")
          ? [
              ...formData.expertise.filter((e) => e !== "Other"),
              formData.otherExpertise,
            ].join(", ")
          : formData.expertise.join(", "),
        // Convert array values to strings for API submission
        softwareEngineeringSpecifics: formData.engineeringSpecifics.join(", "),
        // Map available days to their display text
        availability: formData.availableDays
          .map(
            (dayId) =>
              availabilityOptions.find((option) => option.id === dayId)
                ?.displayText || dayId
          )
          .join(", "),
        isInPerson: formData.inPerson === "Yes!",
        volunteer_type: "mentor",
        agreedToCodeOfConduct: formData.codeOfConduct,
        linkedinProfile: formData.linkedin,
        shortBio: formData.bio,
        photoUrl: formData.picture,
        type: "mentors",
        additionalInfo: formData.comments,
        // Add reCAPTCHA token
        recaptchaToken,
      };

      if (apiServerUrl) {
        // Submit to API
        const submitEndpoint = previouslySubmitted
          ? `${apiServerUrl}/api/mentor/application/${event_id}/update`
          : `${apiServerUrl}/api/mentor/application/${event_id}/submit`;

        const response = await fetch(submitEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(submissionData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          if (errorData?.error?.includes("recaptcha")) {
            throw new Error(
              "reCAPTCHA verification failed. Please refresh the page and try again."
            );
          }
          throw new Error(`Failed to submit application: ${response.status}`);
        }
      } else {
        // In a test environment, log the data and simulate API delay
        console.log("Submitting mentor application:", submissionData);
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      // Clear saved form data after successful submission only if they are logged in
      // This is to prevent data loss for users who are not logged in where we don't have their login id
      if (isLoggedIn) {
        clearSavedData();
      }

      setSuccess(true);
    } catch (err) {
      console.error('Error submitting application:', err);
      setError(err.message || 'Failed to submit your application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // SEO metadata and descriptions
  const pageTitle = eventData 
    ? `Mentor at ${eventData.name} | Guide Tech for Good Developers in ${eventData.location}`
    : "Mentor at Opportunity Hack | Guide Tech for Good Developers";
  const pageDescription = eventData
    ? `Mentor developers at ${eventData.name} in ${eventData.location} from ${eventData.formattedStartDate} to ${eventData.formattedEndDate}. Share your expertise and guide teams creating technology solutions for nonprofits. Join industry experts making a real impact through mentorship.`
    : "Mentor developers at Opportunity Hack hackathon! Share your expertise and guide teams creating technology solutions for nonprofits. Join industry experts making a real impact through mentorship and tech for good.";
  const canonicalUrl = `https://ohack.dev/hack/${event_id}/mentor-application`;
  
  const seoImageUrl = "https://cdn.ohack.dev/ohack.dev/2023_hackathon_1.webp";

  // Define steps for stepper (moved up before the conditional content render)
  const steps = ['Basic Info', 'Skills & Experience', 'Availability', 'Finish'];
  
  // Accordion change handler (moved up from inside renderAvailabilityForm)
  const handleAccordionChange = (date) => (event, isExpanded) => {
    setExpandedDate(isExpanded ? date : null);
  };

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
          value={formData.email}
          onChange={handleChange}
          sx={{ mb: 3 }}
        />
        
        <TextField
          label="Your Name"
          name="name"
          required
          fullWidth
          value={formData.name}
          onChange={handleChange}
          sx={{ mb: 3 }}
        />
        
        <TextField
          label="Your Pronouns (Optional)"
          name="pronouns"
          fullWidth
          value={formData.pronouns}
          onChange={handleChange}
          sx={{ mb: 3 }}
        />
        
        <TextField
          label="What company are you working for?"
          name="company"
          required
          fullWidth
          value={formData.company}
          onChange={handleChange}
          sx={{ mb: 3 }}
        />
        
        <TextField
          label="Short bio (Optional)"
          name="bio"
          multiline
          rows={3}
          fullWidth
          value={formData.bio}
          onChange={handleChange}
          helperText="Tell us a bit about yourself and your professional background"
          sx={{ mb: 3 }}
        />
      </Box>
    </Box>
  );
  
  // Render skills and experience form
  const renderSkillsAndExperienceForm = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
        Profile & Experience
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Box sx={{ mb: 3 }}>
          <InputLabel htmlFor="photo-upload" sx={{ mb: 1 }}>
            A photo of you we can use on the website (Optional)
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
        
        <TextField
          label="LinkedIn Profile (Optional)"
          name="linkedin"
          type="url"
          fullWidth
          value={formData.linkedin}
          onChange={handleChange}
          sx={{ mb: 3 }}
        />
        
        <FormControl fullWidth required sx={{ mb: formData.expertise.includes('Other') ? 1 : 3 }}>
          <InputLabel id="expertise-label">What kind of brain power can you help supply us with?</InputLabel>
          <Select
            labelId="expertise-label"
            id="expertise"
            multiple
            value={formData.expertise}
            onChange={(e) => customHandleMultiSelectChange(e, 'expertise')}
            input={<OutlinedInput label="What kind of brain power can you help supply us with?" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
          >
            {expertiseOptions.map((option) => (
              <MenuItem key={option} value={option}>
                <Checkbox checked={formData.expertise.indexOf(option) > -1} />
                <ListItemText primary={option} />
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>Select all areas where you can mentor teams (select at least one)</FormHelperText>
        </FormControl>
        
        {/* Conditional text field that appears when "Other" is selected */}
        {formData.expertise.includes('Other') && (
          <TextField
            label="Please specify your expertise"
            name="otherExpertise"
            required
            fullWidth
            value={formData.otherExpertise}
            onChange={handleChange}
            helperText="Tell us about your specific area of expertise"
            sx={{ mb: 3 }}
          />
        )}
        
        <FormControl fullWidth required sx={{ mb: 3 }}>
          <InputLabel id="engineering-specifics-label">Software Engineering Specifics</InputLabel>
          <Select
            labelId="engineering-specifics-label"
            id="engineering-specifics"
            multiple
            value={formData.engineeringSpecifics}
            onChange={(e) => customHandleMultiSelectChange(e, 'engineeringSpecifics')}
            input={<OutlinedInput label="Software Engineering Specifics" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
          >
            {engineeringOptions.map((option) => (
              <MenuItem key={option} value={option}>
                <Checkbox checked={formData.engineeringSpecifics.indexOf(option) > -1} />
                <ListItemText primary={option} />
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>Select the technologies and areas you can mentor in</FormHelperText>
        </FormControl>
        
        <FormControl fullWidth required sx={{ mb: 3 }}>
          <InputLabel id="participation-count-label">How many times have you participated in Opportunity Hack?</InputLabel>
          <Select
            labelId="participation-count-label"
            id="participation-count"
            name="participationCount"
            value={formData.participationCount}
            onChange={handleChange}
            label="How many times have you participated in Opportunity Hack?"
          >
            <MenuItem value="This is my first year! 👆">This is my first year! 👆</MenuItem>
            <MenuItem value="This will be the 2nd time ✌️">This will be the 2nd time ✌️</MenuItem>
            <MenuItem value="This will be the 3rd time ☘️">This will be the 3rd time ☘️</MenuItem>
            <MenuItem value="I've been here 4+ times 🔥">I've been here 4+ times 🔥</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
  
  // --- Availability Step: Date & Slot Selection Refactor ---
  // Render availability form (replace the old date/slot selection section)
  const renderAvailabilityForm = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
        When can you help mentor? (Select all that apply)
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Select the dates you are available. For each date, pick the time slots
        you can mentor. For long hackathons, use the filter to quickly find your
        dates.
      </Typography>

      {/* Add in-person attendance field */}
      <FormControl required component="fieldset" sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Will you be attending in person at ASU in Tempe, Arizona?
        </Typography>
        <RadioGroup
          name="inPerson"
          value={formData.inPerson}
          onChange={handleChange}
        >
          <FormControlLabel
            value="Yes!"
            control={<RadioIcon />}
            label="Yes! I'll be there in person"
          />
          <FormControlLabel
            value="No, I'll be virtual"
            control={<RadioIcon />}
            label="No, I'll be joining virtually"
          />
        </RadioGroup>
      </FormControl>

      {/* Add location fields */}
      <FormControl fullWidth required sx={{ mb: 3 }}>
        <InputLabel id="country-label">Country</InputLabel>
        <Select
          labelId="country-label"
          id="country"
          name="country"
          value={formData.country}
          onChange={handleChange}
          label="Country"
        >
          <MenuItem value="United States">United States</MenuItem>
          <MenuItem value="Canada">Canada</MenuItem>
          <MenuItem value="India">India</MenuItem>
          <MenuItem value="United Kingdom">United Kingdom</MenuItem>
          <MenuItem value="Australia">Australia</MenuItem>
          <MenuItem value="Other">Other</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth required sx={{ mb: 3 }}>
        <InputLabel id="state-label">State/Province/Region</InputLabel>
        <Select
          labelId="state-label"
          id="state"
          name="state"
          value={formData.state}
          onChange={handleChange}
          label="State/Province/Region"
        >
          <MenuItem value="Alabama">Alabama</MenuItem>
          <MenuItem value="Alaska">Alaska</MenuItem>
          <MenuItem value="Arizona">Arizona</MenuItem>
          <MenuItem value="Arkansas">Arkansas</MenuItem>
          <MenuItem value="California">California</MenuItem>
          <MenuItem value="Colorado">Colorado</MenuItem>
          <MenuItem value="Connecticut">Connecticut</MenuItem>
          <MenuItem value="Delaware">Delaware</MenuItem>
          <MenuItem value="Florida">Florida</MenuItem>
          <MenuItem value="Georgia">Georgia</MenuItem>
          <MenuItem value="Hawaii">Hawaii</MenuItem>
          <MenuItem value="Idaho">Idaho</MenuItem>
          <MenuItem value="Illinois">Illinois</MenuItem>
          <MenuItem value="Indiana">Indiana</MenuItem>
          <MenuItem value="Iowa">Iowa</MenuItem>
          <MenuItem value="Kansas">Kansas</MenuItem>
          <MenuItem value="Kentucky">Kentucky</MenuItem>
          <MenuItem value="Louisiana">Louisiana</MenuItem>
          <MenuItem value="Maine">Maine</MenuItem>
          <MenuItem value="Maryland">Maryland</MenuItem>
          <MenuItem value="Massachusetts">Massachusetts</MenuItem>
          <MenuItem value="Michigan">Michigan</MenuItem>
          <MenuItem value="Minnesota">Minnesota</MenuItem>
          <MenuItem value="Mississippi">Mississippi</MenuItem>
          <MenuItem value="Missouri">Missouri</MenuItem>
          <MenuItem value="Montana">Montana</MenuItem>
          <MenuItem value="Nebraska">Nebraska</MenuItem>
          <MenuItem value="Nevada">Nevada</MenuItem>
          <MenuItem value="New Hampshire">New Hampshire</MenuItem>
          <MenuItem value="New Jersey">New Jersey</MenuItem>
          <MenuItem value="New Mexico">New Mexico</MenuItem>
          <MenuItem value="New York">New York</MenuItem>
          <MenuItem value="North Carolina">North Carolina</MenuItem>
          <MenuItem value="North Dakota">North Dakota</MenuItem>
          <MenuItem value="Ohio">Ohio</MenuItem>
          <MenuItem value="Oklahoma">Oklahoma</MenuItem>
          <MenuItem value="Oregon">Oregon</MenuItem>
          <MenuItem value="Pennsylvania">Pennsylvania</MenuItem>
          <MenuItem value="Rhode Island">Rhode Island</MenuItem>
          <MenuItem value="South Carolina">South Carolina</MenuItem>
          <MenuItem value="South Dakota">South Dakota</MenuItem>
          <MenuItem value="Tennessee">Tennessee</MenuItem>
          <MenuItem value="Texas">Texas</MenuItem>
          <MenuItem value="Utah">Utah</MenuItem>
          <MenuItem value="Vermont">Vermont</MenuItem>
          <MenuItem value="Virginia">Virginia</MenuItem>
          <MenuItem value="Washington">Washington</MenuItem>
          <MenuItem value="West Virginia">West Virginia</MenuItem>
          <MenuItem value="Wisconsin">Wisconsin</MenuItem>
          <MenuItem value="Wyoming">Wyoming</MenuItem>
          <MenuItem value="Other">Other (Outside US)</MenuItem>
        </Select>
      </FormControl>

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
                sx={{
                  bgcolor: selectedDates.includes(date)
                    ? "primary.light"
                    : "background.paper",
                  color: selectedDates.includes(date)
                    ? "white"
                    : "text.primary",
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", width: "100%" }}
                >
                  <Chip
                    label={date}
                    color={selectedDates.includes(date) ? "primary" : "default"}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDateToggle(date);
                    }}
                    sx={{ mr: 2 }}
                  />
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: "bold", flexGrow: 1 }}
                  >
                    {date}
                  </Typography>
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
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "1fr 1fr",
                      md: "1fr 1fr 1fr",
                    },
                    gap: 2,
                  }}
                >
                  {availabilityByDate[date]?.map((slot) => (
                    <Paper
                      key={slot.id}
                      elevation={
                        formData.availableDays.includes(slot.id) ? 8 : 1
                      }
                      sx={{
                        p: 2,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        bgcolor: formData.availableDays.includes(slot.id)
                          ? "primary.light"
                          : "background.paper",
                        color: formData.availableDays.includes(slot.id)
                          ? "white"
                          : "text.primary",
                        borderRadius: 2,
                        "&:hover": {
                          bgcolor: formData.availableDays.includes(slot.id)
                            ? "primary.main"
                            : "action.hover",
                          transform: "translateY(-4px)",
                          boxShadow: 6,
                        },
                      }}
                      onClick={() => {
                        const newAvailability = formData.availableDays.includes(
                          slot.id
                        )
                          ? formData.availableDays.filter(
                              (id) => id !== slot.id
                            )
                          : [...formData.availableDays, slot.id];
                        setFormData((prev) => ({
                          ...prev,
                          availableDays: newAvailability,
                        }));
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          height: "100%",
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{ mb: 1, fontWeight: "bold" }}
                        >
                          {slot.icon} {slot.label}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {slot.time}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ mt: "auto", fontStyle: "italic" }}
                        >
                          {slot.energy}
                        </Typography>
                        {formData.availableDays.includes(slot.id) && (
                          <Chip
                            label="Selected!"
                            color="success"
                            size="small"
                            sx={{ alignSelf: "flex-start", mt: 1 }}
                          />
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
      <Box
        sx={{
          position: isMobile ? "static" : "sticky",
          top: isMobile ? undefined : 80,
          zIndex: 10,
          mt: 3,
          p: 2,
          bgcolor: "success.light",
          color: "white",
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          minHeight: 56,
        }}
      >
        <Typography variant="subtitle1">
          You've selected {formData.availableDays.length} time slot
          {formData.availableDays.length !== 1 ? "s" : ""}
          {selectedDates.length > 0 &&
            ` across ${selectedDates.length} day${selectedDates.length !== 1 ? "s" : ""}`}
          !
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
          {formData.availableDays.map((slotId) => {
            const slot = availabilityOptions.find((opt) => opt.id === slotId);
            return (
              <Chip
                key={slotId}
                label={`${slot?.icon} ${slot?.date} ${slot?.label}`}
                onDelete={() => {
                  setFormData((prev) => ({
                    ...prev,
                    availableDays: prev.availableDays.filter(
                      (id) => id !== slotId
                    ),
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
              setFormData((prev) => ({ ...prev, availableDays: [] }));
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
          Please select at least one time slot when you'll be available to
          mentor.
        </Alert>
      )}
    </Box>
  );
  
  // Render review form
  const renderReviewForm = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
        Review & Submit
      </Typography>
      
      <TextField
        label="Any questions or comments for us?"
        name="comments"
        multiline
        rows={4}
        fullWidth
        value={formData.comments}
        onChange={handleChange}
        sx={{ mb: 4 }}
      />
      
      <FormControlLabel
        control={
          <Checkbox
            name="codeOfConduct"
            checked={formData.codeOfConduct}
            onChange={handleChange}
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
          By submitting this form, you're expressing interest in mentoring at Opportunity Hack. 
          Our team will review your application and reach out to match you with teams based on your expertise and availability.
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
        return renderReviewForm();
      default:
        return 'Unknown step';
    }
  };

  // If form submitted successfully, show success message
  const renderSuccessMessage = () => {
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
            Thank you for applying to be a mentor at Opportunity Hack. We'll review your application and contact you soon.
          </Alert>
          
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
  };
  
  // Structured data for mentor application
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
          "name": "Mentor Application",
          "item": canonicalUrl
        }
      ]
    }
  } : null;

  const renderApplicationForm = () => {
    return (
      <Container>
        <Head>
          <title>{pageTitle}</title>
          <meta name="description" content={pageDescription} />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta charSet="UTF-8" />
          <meta
            name="keywords"
            content={`hackathon mentor, mentor application, tech for good, nonprofit hackathon, opportunity hack, mentorship, volunteer, tech mentoring, ${eventData?.name || 'hackathon'}, ${eventData?.location || 'tech event'}, industry expert, developer guidance`}
          />
          <meta name="author" content="Opportunity Hack" />
          <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
          <link rel="canonical" href={canonicalUrl} />

          {/* Open Graph tags */}
          <meta property="og:title" content={pageTitle} />
          <meta property="og:description" content={pageDescription} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={canonicalUrl} />
          <meta property="og:image" content={seoImageUrl} />
          <meta property="og:image:alt" content="Mentors guiding developers at Opportunity Hack hackathon" />
          <meta property="og:site_name" content="Opportunity Hack" />
          <meta property="og:locale" content="en_US" />

          {/* Twitter Card tags */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@OpportunityHack" />
          <meta name="twitter:creator" content="@OpportunityHack" />
          <meta name="twitter:title" content={pageTitle} />
          <meta name="twitter:description" content={pageDescription} />
          <meta name="twitter:image" content={seoImageUrl} />
          <meta name="twitter:image:alt" content="Mentors guiding developers at Opportunity Hack hackathon" />

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
            id="mentor-application-structured-data"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
        )}

        {/* Form persistence notification component */}
        <FormPersistenceControls
          onSave={saveToLocalStorage}
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
            Mentor Application
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
                    src="https://cdn.ohack.dev/ohack.dev/2023_hackathon_1.webp" 
                    alt="Mentors guiding teams at Opportunity Hack" 
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
              <ApplicationNav eventId={event_id} currentType="mentor" />

              <Box sx={{ mb: 4 }}>
                {eventData && eventData.isEventPast ? (
                  <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
                    <Alert severity="warning" sx={{ mb: 3 }}>
                      <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                        This event has already ended
                      </Typography>
                      <Typography variant="body1">
                        Applications are no longer being accepted for mentors as this hackathon has already concluded.
                        Please check our upcoming events for future mentoring opportunities.
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
                        Thank you for your interest in mentoring at Opportunity Hack! Mentors play a crucial role in guiding teams
                        and helping them create impactful solutions for nonprofits.
                      </Typography>
                      
                      {eventData && eventData.description && (
                        <Typography variant="body1" sx={{ mb: 3 }}>
                          <strong>About this event:</strong> {eventData.description}
                        </Typography>
                      )}
                      
                      <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 4 }}>
                        <Typography variant="body1" paragraph>
                          <strong>Want to learn more about mentoring at Opportunity Hack?</strong> Check out our{' '}
                          <Link 
                            href="/about/mentors" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            sx={{ fontWeight: 'bold' }}
                          >
                            Mentors Guide
                          </Link>{' '}
                          to understand the role, expectations, and impact you'll make.
                        </Typography>
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

  // Main return - after all hooks have been called
  return success ? renderSuccessMessage() : renderApplicationForm();
};

// Create a new component that uses RequiredAuthProvider
const MentorApplicationPage = () => {
  const router = useRouter();
  const { event_id } = router.query;

  // Create the current URL for redirection
  const currentUrl = typeof window !== 'undefined' && event_id
    ? `${window.location.origin}/hack/${event_id}/mentor-application`
    : null;

  return (
    <RequiredAuthProvider
      authUrl={process.env.NEXT_PUBLIC_REACT_APP_AUTH_URL}
      displayIfLoggedOut={
        <RedirectToLogin
          postLoginRedirectUrl={currentUrl || window.location.href}
        />
      }
    >
      <MentorApplicationComponent />
    </RequiredAuthProvider>
  );
};

export default MentorApplicationPage;