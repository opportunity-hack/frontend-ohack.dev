import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import ReCaptchaProvider from "../../../components/ReCaptchaProvider";
import { initFacebookPixel, trackEvent } from "../../../lib/ga";
import {
  useAuthInfo,
  RequiredAuthProvider,
  RedirectToLogin,
} from "@propelauth/react";
import {
  Typography,
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
import Head from "next/head";
import Script from "next/script";
import { useEnv } from "../../../context/env.context";
import VolunteerCheckInQR from "../../../components/VolunteerCheckInQR";
import ApplicationNav from "../../../components/ApplicationNav/ApplicationNav";
import InfoIcon from "@mui/icons-material/Info";
import FormPersistenceControls from "../../../components/FormPersistenceControls";
import { useFormPersistence } from "../../../hooks/use-form-persistence";
import { useRecaptcha } from "../../../hooks/use-recaptcha";
import GiveButterWidget from "../../../components/GiveButterWidget";
import {
  RefinedRoot,
  RefinedFonts,
  Eyebrow,
  Arrow,
  Stat,
} from "../../../components/design/refined";
import {
  OHackParticipationSelect,
  PronounsPicker,
} from "../../../components/ApplicationForm";
import UploadPhoto from "../../../components/UploadPhoto";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import RadioIcon from "@mui/material/Radio";
import ReactMarkdown from "react-markdown";
import {
  getEventTimezone,
  getTimezoneAbbreviation,
} from "../../../lib/timezoneUtils";

const refinedFieldSx = {
  mb: 3,
  "& .MuiInputBase-root": {
    bgcolor: "var(--surface)",
    color: "var(--ink)",
    borderRadius: 2,
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "var(--line)",
  },
  "& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#d5cdbd",
  },
  "& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "var(--brand)",
  },
  "& .MuiInputLabel-root": {
    color: "var(--muted)",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "var(--brand)",
  },
  "& .MuiFormHelperText-root": {
    color: "var(--muted)",
  },
  "& textarea, & input": {
    color: "var(--ink)",
  },
};

const refinedChoiceSx = {
  color: "var(--line)",
  "&.Mui-checked": {
    color: "var(--brand)",
  },
};

const refinedChipSx = {
  border: "1px solid var(--line)",
  bgcolor: "var(--surface-2)",
  color: "var(--ink)",
  fontWeight: 500,
  "& .MuiChip-deleteIcon": {
    color: "var(--muted)",
  },
};

const refinedAlertSx = {
  borderRadius: 2,
  border: "1px solid var(--line)",
  bgcolor: "var(--surface-2)",
  color: "var(--ink)",
  "& .MuiAlert-icon": {
    color: "var(--brand)",
    mt: 0.25,
  },
  "& .MuiAlert-message": {
    width: "100%",
  },
};

const refinedInlineLinkSx = {
  color: "var(--brand)",
  fontWeight: 600,
  textDecorationColor: "#d5cdbd",
  "&:hover": {
    color: "var(--brand-ink)",
  },
};

const refinedCardSx = {
  border: "1px solid var(--line)",
  borderRadius: 2,
  backgroundColor: "var(--surface)",
  boxShadow: "none",
};

const refinedSelectMenuProps = {
  PaperProps: {
    sx: {
      mt: 1,
      borderRadius: 2,
      border: "1px solid var(--line)",
      boxShadow: "0 18px 40px -28px rgba(22,24,29,0.45)",
    },
  },
};

const stepTitleSx = {
  fontFamily: "var(--display,'Fraunces',Georgia,serif)",
  fontSize: { xs: "1.65rem", sm: "2rem" },
  fontWeight: 500,
  letterSpacing: "-0.015em",
  color: "var(--ink)",
  mb: 1,
};

const stepLeadSx = {
  color: "var(--muted)",
  maxWidth: "44rem",
  mb: 3,
  lineHeight: 1.7,
};

const eventMarkdownSx = {
  color: "var(--muted)",
  lineHeight: 1.75,
  mt: 2,
  "& p": {
    my: 1.5,
  },
  "& h1, & h2, & h3, & h4": {
    fontFamily: "var(--display,'Fraunces',Georgia,serif)",
    fontWeight: 500,
    letterSpacing: "-0.015em",
    color: "var(--ink)",
    mt: 3,
    mb: 1,
  },
  "& h1": {
    fontSize: "1.4rem",
  },
  "& h2": {
    fontSize: "1.25rem",
  },
  "& h3, & h4": {
    fontSize: "1.1rem",
  },
  "& ul, & ol": {
    my: 1.5,
    pl: 3,
  },
  "& li": {
    mb: 0.6,
  },
  "& a": {
    color: "var(--brand)",
    fontWeight: 600,
    textDecorationColor: "#d5cdbd",
  },
  "& a:hover": {
    color: "var(--brand-ink)",
  },
  "& strong": {
    color: "var(--ink)",
  },
  "& code": {
    bgcolor: "var(--surface-2)",
    px: 0.5,
    py: 0.1,
    borderRadius: 0.75,
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: "0.95em",
  },
};

const infoAlertSx = {
  ...refinedAlertSx,
};

const warningAlertSx = {
  ...refinedAlertSx,
  borderColor: "#e7d1aa",
  bgcolor: "#faf3e5",
  "& .MuiAlert-icon": {
    color: "#9b5d05",
    mt: 0.25,
  },
};

const successAlertSx = {
  ...refinedAlertSx,
  borderColor: "#c5dbc7",
  bgcolor: "#edf7f0",
  "& .MuiAlert-icon": {
    color: "#2f6e50",
    mt: 0.25,
  },
};

const errorAlertSx = {
  ...refinedAlertSx,
  borderColor: "#e4c0ba",
  bgcolor: "#f9efed",
  "& .MuiAlert-icon": {
    color: "#b04a36",
    mt: 0.25,
  },
};

const emphasisPanelSx = {
  p: { xs: 2.5, md: 3 },
  borderRadius: 2,
  border: "1px solid var(--line)",
  backgroundColor: "var(--surface-2)",
};

const primaryButtonSx = {
  backgroundColor: "var(--brand)",
  color: "#fff",
  fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
  fontWeight: 600,
  textTransform: "none",
  borderRadius: "5px",
  px: 2.75,
  py: 1.15,
  boxShadow: "none",
  "&:hover": {
    backgroundColor: "#16315a",
    boxShadow: "none",
  },
  "&.Mui-disabled": {
    backgroundColor: "rgba(27,58,107,0.35)",
    color: "rgba(255,255,255,0.72)",
  },
};

const ghostButtonSx = {
  borderColor: "var(--line)",
  color: "var(--ink)",
  fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
  fontWeight: 600,
  textTransform: "none",
  borderRadius: "5px",
  px: 2.5,
  py: 1.05,
  boxShadow: "none",
  "&:hover": {
    borderColor: "var(--ink)",
    backgroundColor: "rgba(0,0,0,0.02)",
    boxShadow: "none",
  },
};

const mentorStepperSx = {
  "& .MuiStepLabel-label": {
    fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
    fontSize: "0.92rem",
    fontWeight: 500,
    mt: 1,
    color: "#5B6270",
  },
  "& .MuiStepLabel-label.Mui-active": {
    color: "#1B3A6B",
    fontWeight: 700,
  },
  "& .MuiStepLabel-label.Mui-completed": {
    color: "#16181D",
  },
  "& .MuiStepIcon-root": {
    color: "#E7E1D4",
    width: 28,
    height: 28,
  },
  "& .MuiStepIcon-root.Mui-active": {
    color: "#1B3A6B",
  },
  "& .MuiStepIcon-root.Mui-completed": {
    color: "#1B3A6B",
  },
  "& .MuiStepIcon-text": {
    fill: "#fff",
  },
  "& .MuiStepConnector-line": {
    borderColor: "#E7E1D4",
  },
};

const MentorApplicationComponent = () => {
  const router = useRouter();
  const { event_id } = router.query;
  const { isLoggedIn, user, accessToken } = useAuthInfo();
  const { apiServerUrl } = useEnv();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // reCAPTCHA integration
  const {
    initializeRecaptcha,
    getRecaptchaToken,
    isLoading: recaptchaLoading,
    error: recaptchaError,
    setError: setRecaptchaError,
  } = useRecaptcha();

  // Use ref to store uploaded photo URL to avoid race conditions
  const uploadedPhotoUrlRef = useRef("");

  // Prevent duplicate confirmation dialogs
  const confirmationShownRef = useRef(false);

  // Form navigation state
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [eventData, setEventData] = useState(null);
  // Add missing submitting state
  const [submitting, setSubmitting] = useState(false);
  // Store volunteer ID for QR code generation
  const [volunteerId, setVolunteerId] = useState(null);
  const [isSelected, setIsSelected] = useState(false);

  // Initial form state
  const initialFormData = {
    timestamp: new Date().toISOString(),
    email: "",
    name: "",
    pronouns: "",
    company: "",
    bio: "",
    picture: "",
    linkedin: "",
    inPerson: "",
    expertise: [], // Changed from string to array
    otherExpertise: "", // New field for "Other" option
    participationCount: "",
    engineeringSpecifics: [],
    availableDays: [],
    country: "",
    state: "",
    codeOfConduct: false,
    proactiveHelpUnderstood: false,
    comments: "",
    shirtSize: "",
    agreedToCodeOfConduct: false,
    linkedinProfile: "",
    shortBio: "",
    photoUrl: "",
    event_id: "",
    isSelected: false,
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
    setIsLoading,
  } = useFormPersistence({
    formType: "mentor",
    eventId: event_id,
    userId: user?.userId,
    initialFormData,
    apiServerUrl,
    accessToken,
  });

  // Available engineering specifics options
  const engineeringOptions = [
    "Front-end (CSS/JS, Node, Angular, React, etc)",
    "Back-end (Java, Python, Ruby, etc)",
    "AWS",
    "Google Cloud",
    "Heroku",
    "Data Science & Machine Learning",
    "Data Analysis",
    "Mobile (iOS, Android)",
    "GitHub ninja",
  ];

  // Common expertise areas for mentors
  const expertiseOptions = [
    "Software Engineering",
    "Product Management (vPM)",
    "UX/UI Design",
    "Data Science & Analytics",
    "Cloud Architecture",
    "DevOps",
    "Nonprofit Technology",
    "Entrepreneurship",
    "Digital Marketing",
    "Project Management",
    "Business Strategy",
    "Cybersecurity",
    "Database Management",
    "Other", // Option to specify custom expertise
  ];

  // Function to generate time slots based on event dates - moved outside useEffect to avoid recreating on each render
  const generateTimeSlots = (startDate, endDate, eventTimezone) => {
    const tzAbbr = getTimezoneAbbreviation(new Date(startDate), eventTimezone);
    if (!startDate || !endDate) return [];

    // Parse dates more carefully to avoid timezone issues
    const start = new Date(startDate + "T00:00:00");
    const end = new Date(endDate + "T15:59:59");

    // Time blocks with icons and descriptions
    const timeBlocks = [
      {
        time: "7am - 9am",
        label: "Early Morning",
        icon: "🌅",
        energy: "Fresh minds ready to help!",
      },
      {
        time: "9am - 12pm",
        label: "Morning",
        icon: "☀️",
        energy: "Peak productivity time!",
      },
      {
        time: "1pm - 3pm",
        label: "Afternoon",
        icon: "🏙️",
        energy: "Post-lunch problem solving",
      },
      {
        time: "4pm - 7pm",
        label: "Evening",
        icon: "🌆",
        energy: "Steady focus time",
      },
      {
        time: "8pm - 11pm",
        label: "Night",
        icon: "🌃",
        energy: "Late night debugging sessions",
      },
      {
        time: "11pm - 2am",
        label: "Late Night",
        icon: "🌙",
        energy: "For the night owls!",
      },
    ];

    const slots = [];

    // Loop through each day between start and end dates (inclusive)
    for (let day = new Date(start); day <= end; ) {
      const dayDate = new Date(day);
      const dateString = dayDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });

      // Add each time block for this day
      timeBlocks.forEach((block) => {
        slots.push({
          id: `${dateString}-${block.label}`,
          date: dateString,
          time: block.time,
          label: block.label,
          icon: block.icon,
          energy: block.energy,
          displayText: `${dateString}: ${block.icon} ${block.label} (${block.time} ${tzAbbr})`,
        });
      });

      // Move to next day
      day.setDate(day.getDate() + 1);
    }

    // Remove the last 2 slots
    // This is to avoid showing slots that are too late for most people
    if (slots.length > 3) {
      slots.splice(-3, 3);
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
    initFacebookPixel();
    // Initialize reCAPTCHA when component mounts
    initializeRecaptcha();

    if (!event_id || !apiServerUrl) return;

    const fetchEventData = async () => {
      try {
        setIsLoading(true);

        // Fetch event data from the actual API
        const response = await fetch(
          `${apiServerUrl}/api/messages/hackathon/${event_id}`,
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch event data: ${response.status} ${response.statusText}`,
          );
        }

        const eventData = await response.json();

        if (!eventData || !eventData.start_date || !eventData.end_date) {
          throw new Error("Invalid event data received");
        }

        // Redirect to external application URL if configured
        const externalUrl =
          eventData.constraints?.application_mentor_external_url;
        if (externalUrl) {
          window.location.href = externalUrl;
          return;
        }

        // Format dates for display
        const startDate = new Date(eventData.start_date);
        const endDate = new Date(eventData.end_date);

        // Use UTC methods to avoid timezone conversion issues
        const formattedStartDate = new Date(
          eventData.start_date + "T00:00:00Z",
        ).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: "UTC",
        });
        const formattedEndDate = new Date(
          eventData.end_date + "T00:00:00Z",
        ).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: "UTC",
        });

        // Check if event is in the past (with 1-day buffer)
        const now = new Date();
        const oneDayBuffer = 24 * 60 * 60 * 1000; // 1 day in milliseconds
        const isEventPast = new Date(endDate.getTime() + oneDayBuffer) < now;

        setEventData({
          name: eventData.title || `Opportunity Hack - ${event_id}`,
          description:
            eventData.description || "Annual hackathon for nonprofits",
          date: new Date(eventData.start_date).getFullYear().toString(),
          startDate: eventData.start_date,
          endDate: eventData.end_date,
          formattedStartDate,
          formattedEndDate,
          location: eventData.location || "Tempe, Arizona",
          image:
            eventData.image_url ||
            "https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp",
          isEventPast,
          timezone: eventData.timezone,
        });

        // Generate time slots based on event dates
        const eventTz = getEventTimezone(eventData);
        const slots = generateTimeSlots(
          eventData.start_date,
          eventData.end_date,
          eventTz,
        );
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
            const monthPart = monthMatch[0].split(" ")[0]; // Get "Jan" from "Jan 1"
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
          setFormData((prev) => ({
            ...prev,
            email: user.email || "",
            name:
              user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.username || "",
            event_id: event_id,
          }));

          // Check for previous submission
          const prevData = await loadPreviousSubmission();
          if (prevData && !confirmationShownRef.current) {
            confirmationShownRef.current = true;

            // Set volunteer ID if we have previous submission data
            setVolunteerId(
              prevData.volunteer_id || prevData.id || user?.userId,
            );
            setIsSelected(prevData.isSelected || false);

            // If the user has submitted before, ask if they want to load it for editing?
            if (
              window.confirm(
                "We found a previous application. Would you like to load it for editing?",
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
                  .filter(Boolean),
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
                  .filter(Boolean),
              ),
            ];

            setSelectedMonths(matchedMonths);
          } else {
            // If no previous submission, try to load from localStorage
            loadFromLocalStorage();
          }
        } else {
          setFormData((prev) => ({
            ...prev,
            event_id: event_id,
          }));

          // Try loading from localStorage for non-logged-in users
          loadFromLocalStorage();
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching event data:", err);
        setError("Failed to load event data. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [
    event_id,
    user,
    apiServerUrl,
    loadPreviousSubmission,
    loadFromLocalStorage,
    setFormData,
    initializeRecaptcha,
  ]);

  // Now define the custom implementation that uses handleMultiSelectChange
  const customHandleMultiSelectChange = (event, fieldName) => {
    handleMultiSelectChange(event, fieldName);

    // Clear otherExpertise when Other is removed from expertise
    if (fieldName === "expertise" && !event.target.value.includes("Other")) {
      setFormData((prev) => ({
        ...prev,
        otherExpertise: "",
      }));
    }
  };

  // Handle file selection for photo upload
  const handlePhotoUpload = (photoUrl) => {
    // Store URL in both ref (for submission) and state (for form persistence)
    uploadedPhotoUrlRef.current = photoUrl;
    setFormData((prev) => ({
      ...prev,
      picture: photoUrl,
      photoUrl: photoUrl,
    }));
    console.log("Photo URL saved to form and ref:", photoUrl);
  };

  const handlePhotoError = (errorMessage) => {
    setError(errorMessage);
    // Clear the URLs on error
    uploadedPhotoUrlRef.current = "";
    setFormData((prev) => ({
      ...prev,
      picture: "",
      photoUrl: "",
    }));
  };

  // Extend handleFormChange to handle otherExpertise field
  const handleChange = (e) => {
    handleFormChange(e);

    // Clear otherExpertise when expertise doesn't include "Other"
    const { name, value } = e.target;
    if (name === "expertise" && !value.includes("Other")) {
      setFormData((prev) => ({
        ...prev,
        otherExpertise: "",
      }));
    }
  };

  const validateBasicInfo = () => {
    const requiredFields = ["email", "name", "company"];

    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(
          `Please fill out the ${field.replace(/([A-Z])/g, " $1").toLowerCase()} field`,
        );
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    setError("");
    return true;
  };

  const validateSkillsAndExperience = () => {
    // Validate expertise field
    if (!formData.expertise || formData.expertise.length === 0) {
      setError("Please select at least one area of expertise");
      return false;
    }

    // Validate otherExpertise if "Other" is selected
    if (formData.expertise.includes("Other") && !formData.otherExpertise) {
      setError("Please specify your custom area of expertise");
      return false;
    }

    // Only validate engineering specifics if Software Engineering is selected
    if (
      formData.expertise.includes("Software Engineering") &&
      (!formData.engineeringSpecifics ||
        formData.engineeringSpecifics.length === 0)
    ) {
      setError(
        "Please select at least one software engineering specific since you selected Software Engineering",
      );
      return false;
    }

    setError("");
    return true;
  };

  const validateAvailability = () => {
    const requiredFields = ["participationCount", "country", "state"];

    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(
          `Please fill out the ${field.replace(/([A-Z])/g, " $1").toLowerCase()} field`,
        );
        return false;
      }
    }

    if (!formData.availableDays || formData.availableDays.length === 0) {
      setError("Please select at least one available time slot");
      return false;
    }

    setError("");
    return true;
  };

  const validateForm = () => {
    return (
      validateBasicInfo() &&
      validateSkillsAndExperience() &&
      validateAvailability() &&
      formData.codeOfConduct &&
      formData.proactiveHelpUnderstood
    );
  };

  const handleNext = () => {
    if (activeStep === 0 && !validateBasicInfo()) return;
    if (activeStep === 1 && !validateSkillsAndExperience()) return;
    if (activeStep === 2 && !validateAvailability()) return;

    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep((prev) => prev + 1);
      trackEvent({
        action: "mentor_app_step",
        params: {
          event_label: steps[activeStep + 1],
          step: activeStep + 2,
          event_id,
          page: "mentor_application",
        },
      });
      // Scroll to top of form for better UX
      if (formRef?.current) {
        formRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    trackEvent({
      action: "mentor_app_step_back",
      params: {
        event_label: steps[activeStep - 1],
        step: activeStep,
        event_id,
        page: "mentor_application",
      },
    });
    // Scroll to top of form for better UX
    if (formRef?.current) {
      formRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // Toggle between month view and date view
  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "month" ? "date" : "month"));
  };

  // Handle month selection
  const handleMonthToggle = (month) => {
    if (selectedMonths.includes(month)) {
      // If month is already selected, remove it
      setSelectedMonths((prev) => prev.filter((m) => m !== month));

      // Remove all dates from this month from selected dates
      const datesInMonth = Object.keys(availabilityByMonth[month] || {});
      setSelectedDates((prev) =>
        prev.filter((date) => !datesInMonth.includes(date)),
      );

      // Remove all time slots for this month from form data
      const slotIdsToRemove = [];
      datesInMonth.forEach((date) => {
        const slotsForDate = availabilityByDate[date] || [];
        slotIdsToRemove.push(...slotsForDate.map((slot) => slot.id));
      });

      setFormData((prev) => ({
        ...prev,
        availableDays: prev.availableDays.filter(
          (id) => !slotIdsToRemove.includes(id),
        ),
      }));
    } else {
      // Add the month to selected months
      setSelectedMonths((prev) => [...prev, month]);

      // Add all dates from this month to selected dates
      const datesInMonth = Object.keys(availabilityByMonth[month] || {});
      setSelectedDates((prev) => [...new Set([...prev, ...datesInMonth])]);
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
    return Object.keys(availabilityByDate).filter((date) =>
      date.toLowerCase().includes(dateFilter),
    );
  };

  // Handle quick filters
  const applyQuickFilter = (filterType) => {
    const allDates = Object.keys(availabilityByDate);
    let filteredDates = [];

    switch (filterType) {
      case "weekdays":
        filteredDates = allDates.filter(
          (date) => !date.includes("Saturday") && !date.includes("Sunday"),
        );
        break;
      case "weekends":
        filteredDates = allDates.filter(
          (date) => date.includes("Saturday") || date.includes("Sunday"),
        );
        break;
      case "all":
        filteredDates = allDates;
        break;
      case "none":
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
      const slotIdsToRemove = slotsForDate.map((slot) => slot.id);

      setSelectedDates((prev) => prev.filter((d) => d !== date));
      setFormData((prev) => ({
        ...prev,
        availableDays: prev.availableDays.filter(
          (id) => !slotIdsToRemove.includes(id),
        ),
      }));

      // Check if we need to update selectedMonths
      const monthMatch = date.match(/[A-Z][a-z]{2}\s\d+/);
      if (monthMatch) {
        const month = monthMatch[0].split(" ")[0];
        const datesInMonth = Object.keys(availabilityByMonth[month] || {});
        const noMoreSelectedDatesInMonth = !datesInMonth.some(
          (d) => d !== date && selectedDates.includes(d),
        );

        if (noMoreSelectedDatesInMonth) {
          setSelectedMonths((prev) => prev.filter((m) => m !== month));
        }
      }
    } else {
      // Add the date to selected dates
      setSelectedDates((prev) => [...prev, date]);

      // Make sure the month is selected as well
      const monthMatch = date.match(/[A-Z][a-z]{2}\s\d+/);
      if (monthMatch) {
        const month = monthMatch[0].split(" ")[0];
        if (!selectedMonths.includes(month)) {
          setSelectedMonths((prev) => [...prev, month]);
        }
      }
    }
  };

  // Handle selecting all time slots for a specific date
  const handleSelectAllSlotsForDate = (date) => {
    const slotsForDate = availabilityByDate[date] || [];
    const slotIds = slotsForDate.map((slot) => slot.id);

    // Add all slot IDs for this date to the availableDays array, avoiding duplicates
    setFormData((prev) => {
      const existingIds = new Set(prev.availableDays);
      const newIds = slotIds.filter((id) => !existingIds.has(id));
      return {
        ...prev,
        availableDays: [...prev.availableDays, ...newIds],
      };
    });
  };

  // Handle selecting all time slots for a specific month
  const handleSelectAllSlotsForMonth = (month) => {
    const datesInMonth = Object.keys(availabilityByMonth[month] || {});
    let allSlotIds = [];

    datesInMonth.forEach((date) => {
      const slotsForDate = availabilityByDate[date] || [];
      allSlotIds.push(...slotsForDate.map((slot) => slot.id));
    });

    // Add all slot IDs for this month to the availableDays array, avoiding duplicates
    setFormData((prev) => {
      const existingIds = new Set(prev.availableDays);
      const newIds = allSlotIds.filter((id) => !existingIds.has(id));
      return {
        ...prev,
        availableDays: [...prev.availableDays, ...newIds],
      };
    });

    // Make sure all dates in this month are selected
    setSelectedDates((prev) => [...new Set([...prev, ...datesInMonth])]);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!formData.proactiveHelpUnderstood) {
      setError(
        "Please confirm you understand mentor certificates require proactive help.",
      );
      return;
    }

    if (!formData.codeOfConduct) {
      setError("You must agree to the code of conduct");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // Get reCAPTCHA token
      const recaptchaToken = await getRecaptchaToken();

      // If we couldn't get a token and we're in production, show error
      if (!recaptchaToken && process.env.NODE_ENV === "production") {
        setError(
          "Failed to verify you are human. Please refresh the page and try again.",
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
                ?.displayText || dayId,
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
              "reCAPTCHA verification failed. Please refresh the page and try again.",
            );
          }
          throw new Error(`Failed to submit application: ${response.status}`);
        }

        // Extract volunteer ID from response for QR code generation
        const responseData = await response.json().catch(() => null);
        if (responseData?.volunteer_id || responseData?.id) {
          setVolunteerId(responseData.volunteer_id || responseData.id);
        } else {
          // Fallback: use user ID if no specific volunteer ID is returned
          setVolunteerId(user?.userId);
        }
      } else {
        // In a test environment, log the data and simulate API delay
        console.log("Submitting mentor application:", submissionData);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        // In test environment, use user ID as volunteer ID
        setVolunteerId(user?.userId);
      }

      // Clear saved form data after successful submission only if they are logged in
      // This is to prevent data loss for users who are not logged in where we don't have their login id
      if (isLoggedIn) {
        clearSavedData();
      }

      setSuccess(true);
      trackEvent({
        action: "mentor_app_submit",
        params: {
          event_label: "success",
          event_id,
          page: "mentor_application",
        },
      });
      // Scroll to top of form to show "Application Submitted!" message
      if (formRef?.current) {
        formRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    } catch (err) {
      console.error("Error submitting application:", err);
      trackEvent({
        action: "mentor_app_submit_error",
        params: {
          event_label: err.message,
          event_id,
          page: "mentor_application",
        },
      });
      setError(
        err.message || "Failed to submit your application. Please try again.",
      );
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
  const canonicalUrl = `https://www.ohack.dev/hack/${event_id}/mentor-application`;

  const seoImageUrl = "https://cdn.ohack.dev/ohack.dev/2023_hackathon_1.webp";

  // Define steps for stepper (moved up before the conditional content render)
  const steps = ["Basic Info", "Skills & Experience", "Availability", "Finish"];

  // Accordion change handler (moved up from inside renderAvailabilityForm)
  const handleAccordionChange = (date) => (event, isExpanded) => {
    setExpandedDate(isExpanded ? date : null);
  };

  // Helper function to determine if event is virtual/global
  const isVirtualEvent = () => {
    if (!eventData?.location) return false;
    const location = eventData.location.toLowerCase();
    return (
      location.includes("global") ||
      location.includes("virtual") ||
      location.includes("online") ||
      location.includes("remote")
    );
  };

  // Render basic information form
  const renderBasicInfoForm = () => (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Eyebrow>Step 1</Eyebrow>
        <Typography component="h2" sx={stepTitleSx}>
          Basic information
        </Typography>
        <Typography variant="body1" sx={stepLeadSx}>
          Start with the essentials we need to identify your application and
          introduce you to teams.
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          label="Email Address"
          name="email"
          type="email"
          required
          fullWidth
          value={formData.email}
          onChange={handleChange}
          sx={refinedFieldSx}
        />

        <TextField
          label="Your Name"
          name="name"
          required
          fullWidth
          value={formData.name}
          onChange={handleChange}
          sx={refinedFieldSx}
        />

        <Box sx={{ mb: 3 }}>
          <PronounsPicker
            value={formData.pronouns}
            onChange={(next) =>
              setFormData((prev) => ({ ...prev, pronouns: next }))
            }
          />
        </Box>

        <TextField
          label="What company are you working for?"
          name="company"
          required
          fullWidth
          value={formData.company}
          onChange={handleChange}
          sx={refinedFieldSx}
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
          sx={refinedFieldSx}
        />
      </Box>
    </Box>
  );

  // Render skills and experience form
  const renderSkillsAndExperienceForm = () => (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Eyebrow>Step 2</Eyebrow>
        <Typography component="h2" sx={stepTitleSx}>
          Profile and experience
        </Typography>
        <Typography variant="body1" sx={stepLeadSx}>
          Show teams where you can unblock them fastest, whether that is
          software, product, design, data, or operational guidance.
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <UploadPhoto
          value={formData.picture || formData.photoUrl || ""}
          onChange={handlePhotoUpload}
          onError={handlePhotoError}
          label="A photo of you we can use on the website (Optional)"
          helperText="Please upload a professional photo of yourself"
          directory="mentors"
          apiServerUrl={apiServerUrl}
          accessToken={accessToken}
          orgId={user?.orgId}
          userId={user?.userId}
          sx={refinedFieldSx}
        />

        <TextField
          label="LinkedIn Profile (Optional)"
          name="linkedin"
          type="url"
          fullWidth
          value={formData.linkedin}
          onChange={handleChange}
          sx={refinedFieldSx}
        />

        <FormControl
          fullWidth
          required
          sx={{
            ...refinedFieldSx,
            mb: formData.expertise.includes("Other") ? 1 : 3,
          }}
        >
          <InputLabel id="expertise-label">
            What kind of brain power can you help supply us with?
          </InputLabel>
          <Select
            labelId="expertise-label"
            id="expertise"
            multiple
            value={formData.expertise}
            onChange={(e) => customHandleMultiSelectChange(e, "expertise")}
            MenuProps={refinedSelectMenuProps}
            input={
              <OutlinedInput label="What kind of brain power can you help supply us with?" />
            }
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} sx={refinedChipSx} />
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
          <FormHelperText>
            Select all areas where you can mentor teams (select at least one)
          </FormHelperText>
        </FormControl>

        {/* Conditional text field that appears when "Other" is selected */}
        {formData.expertise.includes("Other") && (
          <TextField
            label="Please specify your expertise"
            name="otherExpertise"
            required
            fullWidth
            value={formData.otherExpertise}
            onChange={handleChange}
            helperText="Tell us about your specific area of expertise"
            sx={refinedFieldSx}
          />
        )}

        {/* Conditional Software Engineering Specifics field that appears when "Software Engineering" is selected */}
        {formData.expertise.includes("Software Engineering") && (
          <FormControl fullWidth required sx={refinedFieldSx}>
            <InputLabel id="engineering-specifics-label">
              Software Engineering Specifics
            </InputLabel>
            <Select
              labelId="engineering-specifics-label"
              id="engineering-specifics"
              multiple
              value={formData.engineeringSpecifics}
              onChange={(e) =>
                customHandleMultiSelectChange(e, "engineeringSpecifics")
              }
              MenuProps={refinedSelectMenuProps}
              input={<OutlinedInput label="Software Engineering Specifics" />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} sx={refinedChipSx} />
                  ))}
                </Box>
              )}
            >
              {engineeringOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  <Checkbox
                    checked={formData.engineeringSpecifics.indexOf(option) > -1}
                  />
                  <ListItemText primary={option} />
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              Select the technologies and areas you can mentor in
            </FormHelperText>
          </FormControl>
        )}

        <OHackParticipationSelect
          value={formData.participationCount}
          onChange={handleChange}
          sx={refinedFieldSx}
        />
      </Box>
    </Box>
  );

  // --- Availability Step: Date & Slot Selection Refactor ---
  // Render availability form (replace the old date/slot selection section)
  const renderAvailabilityForm = () => (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Eyebrow>Step 3</Eyebrow>
        <Typography component="h2" sx={stepTitleSx}>
          Availability
        </Typography>
        <Typography variant="body1" sx={stepLeadSx}>
          Pick every block where you can proactively help. Teams rely on mentor
          consistency more than volume, so choose the windows you can actually
          honor.
        </Typography>
      </Box>
      <Typography
        variant="body2"
        sx={{ ...stepLeadSx, fontSize: "0.98rem", mb: 2 }}
      >
        Select the dates you are available. For each date, pick the time slots
        you can mentor. For long hackathons, use the filter to quickly find your
        dates. All times are in{" "}
        {getTimezoneAbbreviation(new Date(), getEventTimezone(eventData))}{" "}
        (event timezone).
      </Typography>

      {/* Conditionally show in-person attendance field only for physical events */}
      {!isVirtualEvent() && (
        <FormControl
          required
          component="fieldset"
          sx={{ ...emphasisPanelSx, mb: 3 }}
        >
          <Typography
            variant="subtitle1"
            gutterBottom
            sx={{ fontWeight: 600, color: "var(--ink)" }}
          >
            Will you be attending in person at{" "}
            {eventData?.location || "the event location"}?
          </Typography>
          <RadioGroup
            name="inPerson"
            value={formData.inPerson}
            onChange={handleChange}
          >
            <FormControlLabel
              value="Yes!"
              control={<RadioIcon sx={refinedChoiceSx} />}
              label="Yes! I'll be there in person"
            />
            <FormControlLabel
              value="No, I'll be virtual"
              control={<RadioIcon sx={refinedChoiceSx} />}
              label="No, I'll be joining virtually"
            />
          </RadioGroup>
        </FormControl>
      )}

      {/* Location fields - conditional labels and requirements */}
      <FormControl fullWidth required sx={refinedFieldSx}>
        <InputLabel id="country-label">
          {isVirtualEvent()
            ? "Which country will you be mentoring from?"
            : formData.inPerson === "Yes!"
              ? "Which country are you traveling from?"
              : "Which country will you be mentoring from?"}
        </InputLabel>
        <Select
          labelId="country-label"
          id="country"
          name="country"
          value={formData.country}
          onChange={handleChange}
          MenuProps={refinedSelectMenuProps}
          label={
            isVirtualEvent()
              ? "Which country will you be mentoring from?"
              : formData.inPerson === "Yes!"
                ? "Which country are you traveling from?"
                : "Which country will you be mentoring from?"
          }
        >
          <MenuItem value="United States">United States</MenuItem>
          <MenuItem value="Canada">Canada</MenuItem>
          <MenuItem value="India">India</MenuItem>
          <MenuItem value="United Kingdom">United Kingdom</MenuItem>
          <MenuItem value="Australia">Australia</MenuItem>
          <MenuItem value="Germany">Germany</MenuItem>
          <MenuItem value="France">France</MenuItem>
          <MenuItem value="Brazil">Brazil</MenuItem>
          <MenuItem value="Mexico">Mexico</MenuItem>
          <MenuItem value="Other">Other</MenuItem>
        </Select>
      </FormControl>

      {/* Only show state dropdown if country is United States */}
      {formData.country === "United States" && (
        <FormControl fullWidth required sx={refinedFieldSx}>
          <InputLabel id="state-label">
            {isVirtualEvent()
              ? "Which state will you be mentoring from?"
              : formData.inPerson === "Yes!"
                ? "Which state are you traveling from?"
                : "Which state will you be mentoring from?"}
          </InputLabel>
          <Select
            labelId="state-label"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            MenuProps={refinedSelectMenuProps}
            label={
              isVirtualEvent()
                ? "Which state will you be mentoring from?"
                : formData.inPerson === "Yes!"
                  ? "Which state are you traveling from?"
                  : "Which state will you be mentoring from?"
            }
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
          </Select>
        </FormControl>
      )}

      {/* If country is not US, show a simple text field for state/region */}
      {formData.country && formData.country !== "United States" && (
        <TextField
          label={
            isVirtualEvent()
              ? "State/Province/Region (where you'll be mentoring from)"
              : formData.inPerson === "Yes!"
                ? "State/Province/Region (where you're traveling from)"
                : "State/Province/Region (where you'll be mentoring from)"
          }
          name="state"
          required
          fullWidth
          value={formData.state}
          onChange={handleChange}
          sx={refinedFieldSx}
        />
      )}

      {/* Date filter/search */}
      <TextField
        label="Filter dates"
        variant="outlined"
        fullWidth
        value={dateFilter}
        onChange={handleDateFilterChange}
        placeholder="Type to filter dates (e.g., 'Monday' or 'Jan')"
        sx={refinedFieldSx}
      />

      {/* Accordion for each date */}
      {getFilteredDates().length === 0 ? (
        <Alert severity="info" sx={infoAlertSx}>
          No dates match your filter.
        </Alert>
      ) : (
        <Box>
          {getFilteredDates().map((date) => (
            <Accordion
              key={date}
              expanded={expandedDate === date}
              onChange={handleAccordionChange(date)}
              elevation={0}
              sx={{
                mb: 2,
                border: "1px solid var(--line)",
                borderRadius: "8px !important",
                backgroundColor: "var(--surface)",
                boxShadow: "none",
                overflow: "hidden",
                "&:before": {
                  display: "none",
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel-${date}-content`}
                id={`panel-${date}-header`}
                sx={{
                  bgcolor: selectedDates.includes(date)
                    ? "rgba(27,58,107,0.08)"
                    : "var(--surface)",
                  color: "var(--ink)",
                  borderBottom:
                    expandedDate === date ? "1px solid var(--line)" : "none",
                  "& .MuiAccordionSummary-expandIconWrapper": {
                    color: "var(--brand)",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    gap: 1.5,
                    flexWrap: { xs: "wrap", sm: "nowrap" },
                  }}
                >
                  <Chip
                    label={date}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDateToggle(date);
                    }}
                    sx={{
                      ...refinedChipSx,
                      mr: { sm: 0.5 },
                      bgcolor: selectedDates.includes(date)
                        ? "var(--brand)"
                        : "var(--surface-2)",
                      color: selectedDates.includes(date)
                        ? "#fff"
                        : "var(--muted)",
                      borderColor: selectedDates.includes(date)
                        ? "var(--brand)"
                        : "var(--line)",
                    }}
                  />
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, flexGrow: 1, color: "var(--ink)" }}
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
                    sx={{
                      ...ghostButtonSx,
                      minWidth: 0,
                      px: 1.6,
                      py: 0.7,
                      ml: { sm: 1.5 },
                      fontSize: "0.82rem",
                    }}
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
                      elevation={0}
                      sx={{
                        ...refinedCardSx,
                        p: 2.25,
                        cursor: "pointer",
                        transition:
                          "transform .22s ease, box-shadow .22s ease, border-color .22s ease, background-color .22s ease",
                        bgcolor: formData.availableDays.includes(slot.id)
                          ? "rgba(27,58,107,0.06)"
                          : "var(--surface)",
                        color: "var(--ink)",
                        borderColor: formData.availableDays.includes(slot.id)
                          ? "var(--brand)"
                          : "var(--line)",
                        "&:hover": {
                          bgcolor: formData.availableDays.includes(slot.id)
                            ? "rgba(27,58,107,0.08)"
                            : "var(--surface)",
                          transform: "translateY(-2px)",
                          borderColor: formData.availableDays.includes(slot.id)
                            ? "var(--brand)"
                            : "#d7cebc",
                          boxShadow: "0 18px 40px -28px rgba(22,24,29,0.45)",
                        },
                      }}
                      onClick={() => {
                        const newAvailability = formData.availableDays.includes(
                          slot.id,
                        )
                          ? formData.availableDays.filter(
                              (id) => id !== slot.id,
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
                          sx={{ mb: 1, fontWeight: 600, color: "var(--ink)" }}
                        >
                          {slot.icon} {slot.label}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ mb: 1, color: "var(--muted)" }}
                        >
                          {slot.time}{" "}
                          {getTimezoneAbbreviation(
                            new Date(),
                            getEventTimezone(eventData),
                          )}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            mt: "auto",
                            fontStyle: "italic",
                            color: "var(--muted)",
                          }}
                        >
                          {slot.energy}
                        </Typography>
                        {formData.availableDays.includes(slot.id) && (
                          <Chip
                            label="Selected"
                            size="small"
                            sx={{
                              ...refinedChipSx,
                              alignSelf: "flex-start",
                              mt: 1.25,
                              bgcolor: "var(--brand)",
                              color: "#fff",
                              borderColor: "var(--brand)",
                            }}
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
          p: 2.5,
          bgcolor: "var(--surface-2)",
          color: "var(--ink)",
          border: "1px solid var(--line)",
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
                      (id) => id !== slotId,
                    ),
                  }));
                }}
                sx={{
                  ...refinedChipSx,
                  mb: 1,
                  bgcolor: "var(--surface)",
                  color: "var(--ink)",
                }}
              />
            );
          })}
        </Box>
        {formData.availableDays.length > 0 && (
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              setFormData((prev) => ({ ...prev, availableDays: [] }));
              setSelectedDates([]);
            }}
            sx={{
              ...ghostButtonSx,
              mt: 1.5,
              px: 1.6,
              py: 0.7,
              fontSize: "0.82rem",
            }}
          >
            Clear All
          </Button>
        )}
      </Box>
      {formData.availableDays.length === 0 && (
        <Alert severity="warning" sx={{ ...warningAlertSx, mt: 2 }}>
          Please select at least one time slot when you'll be available to
          mentor.
        </Alert>
      )}
    </Box>
  );

  // Render review form
  const renderReviewForm = () => (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Eyebrow>Step 4</Eyebrow>
        <Typography component="h2" sx={stepTitleSx}>
          Review and submit
        </Typography>
        <Typography variant="body1" sx={stepLeadSx}>
          One last pass before you send it. Confirm the expectations, add any
          final context, and submit for staff review.
        </Typography>
      </Box>

      <TextField
        label="Any questions or comments for us?"
        name="comments"
        multiline
        rows={4}
        fullWidth
        value={formData.comments}
        onChange={handleChange}
        sx={refinedFieldSx}
      />

      <FormControlLabel
        control={
          <Checkbox
            name="proactiveHelpUnderstood"
            checked={!!formData.proactiveHelpUnderstood}
            onChange={handleChange}
            sx={refinedChoiceSx}
            required
          />
        }
        label={
          <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
            I understand mentor certificates are awarded for{" "}
            <strong>proactive help</strong> (Slack outreach, code review,
            presentation feedback) — not for showing up.
          </Typography>
        }
        sx={{ mb: 2, alignItems: "flex-start", color: "var(--ink)" }}
      />

      <FormControlLabel
        control={
          <Checkbox
            name="codeOfConduct"
            checked={formData.codeOfConduct}
            onChange={handleChange}
            sx={refinedChoiceSx}
            required
          />
        }
        label={
          <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
            I agree to the{" "}
            <Link
              href="/hack/code-of-conduct"
              target="_blank"
              rel="noopener noreferrer"
              sx={refinedInlineLinkSx}
            >
              Code of Conduct
            </Link>
          </Typography>
        }
        sx={{ mb: 2, color: "var(--ink)" }}
      />

      <Alert severity="info" sx={{ ...infoAlertSx, mb: 3 }}>
        <Typography variant="body1">
          Your application is <strong>pending review</strong> — our staff
          reviews every mentor application by hand, which can take up to a week.
          We'll email you once you're approved or if we have follow-up
          questions.
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
        return "Unknown step";
    }
  };

  // If form submitted successfully, show success message
  const renderSuccessMessage = () => {
    return (
      <RefinedRoot>
        <Head>
          <title>{pageTitle}</title>
          <meta name="description" content={pageDescription} />
          <link rel="canonical" href={canonicalUrl} />
          <meta name="theme-color" content="#1B3A6B" />
        </Head>

        <section
          className="ohx-wrap"
          style={{
            paddingTop: "clamp(100px, 12vh, 148px)",
            paddingBottom: "clamp(48px, 8vh, 96px)",
          }}
        >
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <Eyebrow>Application received</Eyebrow>
              <h1 className="ohx-display" style={{ marginTop: 8 }}>
                Application <span className="ohx-italic">submitted.</span>
              </h1>
              <p
                className="ohx-lead"
                style={{ margin: "16px auto 0", textAlign: "center" }}
              >
                Thanks for offering your time and expertise. We have your mentor
                application and our team will review it by hand.
              </p>
            </div>

            <Box className="ohx-card" sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
              <Alert severity="success" sx={{ ...successAlertSx, mb: 2 }}>
                <Typography variant="body1">
                  Thanks for applying to mentor at Opportunity Hack — we&apos;ve
                  received your application.
                </Typography>
              </Alert>

              <Alert severity="info" sx={{ ...infoAlertSx, mb: 4 }}>
                <Typography variant="body1">
                  <strong>Your application is pending review.</strong> Our staff
                  reviews every mentor application — this typically takes up to
                  a week. You&apos;ll get an email when you&apos;re approved or
                  if we have follow-up questions.
                </Typography>
              </Alert>

              {Boolean(volunteerId) && (
                <Box
                  sx={{
                    ...emphasisPanelSx,
                    mb: 4,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <VolunteerCheckInQR
                    eventId={event_id}
                    volunteerId={volunteerId}
                    isSelected={isSelected}
                    volunteerType="mentor"
                    name={formData.name}
                    isSubmitted={true}
                    qrSize={200}
                    sx={{ mx: "auto", maxWidth: 500 }}
                  />
                </Box>
              )}

              <Box sx={{ mb: 4, display: "flex", justifyContent: "center" }}>
                <GiveButterWidget
                  context="success"
                  userId={user?.userId}
                  applicationType="mentor"
                  size="large"
                  onDonationEvent={(eventData) => {
                    console.log("Mentor donation event:", eventData);
                  }}
                />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 1.5,
                  justifyContent: "center",
                }}
              >
                <Button
                  variant="contained"
                  onClick={() => router.push(`/hack/${event_id}`)}
                  sx={primaryButtonSx}
                >
                  Return to hackathon page
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => router.push("/hack")}
                  sx={ghostButtonSx}
                >
                  See upcoming events
                </Button>
              </Box>
            </Box>
          </div>
        </section>
      </RefinedRoot>
    );
  };

  // Structured data for mentor application
  const structuredData = eventData
    ? {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: pageTitle,
        description: pageDescription,
        url: canonicalUrl,
        mainEntity: {
          "@type": "Event",
          name: eventData.name,
          startDate: eventData.startDate,
          endDate: eventData.endDate,
          location: {
            "@type": "Place",
            name: eventData.location,
          },
          organizer: {
            "@type": "Organization",
            name: "Opportunity Hack",
            url: "https://www.ohack.dev",
          },
        },
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: "https://www.ohack.dev/",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Hackathons",
              item: "https://www.ohack.dev/hack",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: eventData.name,
              item: `https://www.ohack.dev/hack/${event_id}`,
            },
            {
              "@type": "ListItem",
              position: 4,
              name: "Mentor Application",
              item: canonicalUrl,
            },
          ],
        },
      }
    : null;

  const renderApplicationForm = () => {
    return (
      <RefinedRoot>
        <Head>
          <title>{pageTitle}</title>
          <meta name="description" content={pageDescription} />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <meta charSet="UTF-8" />
          <meta
            name="keywords"
            content={`hackathon mentor, mentor application, tech for good, nonprofit hackathon, opportunity hack, mentorship, volunteer, tech mentoring, ${eventData?.name || "hackathon"}, ${eventData?.location || "tech event"}, industry expert, developer guidance`}
          />
          <meta name="author" content="Opportunity Hack" />
          <meta
            name="robots"
            content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
          />
          <link rel="canonical" href={canonicalUrl} />

          {/* Open Graph tags */}
          <meta property="og:title" content={pageTitle} />
          <meta property="og:description" content={pageDescription} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={canonicalUrl} />
          <meta property="og:image" content={seoImageUrl} />
          <meta
            property="og:image:alt"
            content="Mentors guiding developers at Opportunity Hack hackathon"
          />
          <meta property="og:site_name" content="Opportunity Hack" />
          <meta property="og:locale" content="en_US" />

          {/* Twitter Card tags */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@OpportunityHack" />
          <meta name="twitter:creator" content="@OpportunityHack" />
          <meta name="twitter:title" content={pageTitle} />
          <meta name="twitter:description" content={pageDescription} />
          <meta name="twitter:image" content={seoImageUrl} />
          <meta
            name="twitter:image:alt"
            content="Mentors guiding developers at Opportunity Hack hackathon"
          />

          {/* Additional SEO tags */}
          <meta name="application-name" content="Opportunity Hack" />
          <meta name="theme-color" content="#1B3A6B" />
          <meta name="format-detection" content="telephone=no" />
          <RefinedFonts />

          {/* Preconnect to optimize loading */}
          <link
            rel="preconnect"
            href="https://cdn.ohack.dev"
            crossOrigin="anonymous"
          />
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

        <section
          className="ohx-wrap"
          style={{
            paddingTop: "clamp(100px, 12vh, 148px)",
            paddingBottom: "clamp(48px, 8vh, 96px)",
          }}
        >
          <Box ref={formRef}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  lg: "minmax(0, 1.1fr) 320px",
                },
                gap: { xs: 4, lg: 5 },
                alignItems: "start",
                mb: 4,
              }}
            >
              <Box>
                <Eyebrow>
                  {eventData
                    ? `${eventData.name} · mentor application`
                    : "Mentor application"}
                </Eyebrow>
                <h1 className="ohx-display" style={{ marginTop: 8 }}>
                  Guide teams to{" "}
                  <span className="ohx-italic">ship real impact.</span>
                </h1>
                <p className="ohx-lead" style={{ marginTop: 16 }}>
                  Opportunity Hack mentors help teams move through the parts
                  that usually stall: architecture, scope, polish, and
                  presentation. This application covers who you are, what you
                  can mentor, and when you can show up consistently.
                </p>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "repeat(2,minmax(0,1fr))",
                      sm: "repeat(3,minmax(0,1fr))",
                    },
                    gap: 2,
                    mt: 3,
                    maxWidth: 540,
                  }}
                >
                  <Box className="ohx-card" sx={{ p: 2.5 }}>
                    <Stat value={String(steps.length)} label="steps" />
                  </Box>
                  <Box className="ohx-card" sx={{ p: 2.5 }}>
                    <Stat value="Manual" label="review" />
                  </Box>
                  <Box className="ohx-card" sx={{ p: 2.5 }}>
                    <Stat value="Flexible" label="availability" />
                  </Box>
                </Box>

                {eventData && (
                  <Box
                    className="ohx-card"
                    sx={{ mt: 3, p: { xs: 2.5, md: 3 } }}
                  >
                    <Eyebrow>Event details</Eyebrow>
                    <Typography
                      component="h2"
                      sx={{
                        ...stepTitleSx,
                        fontSize: { xs: "1.4rem", sm: "1.7rem" },
                        mt: 1,
                      }}
                    >
                      {eventData.name}
                    </Typography>
                    <Typography sx={{ color: "var(--muted)", mb: 1 }}>
                      {eventData.location}
                    </Typography>
                    <Typography sx={{ color: "var(--muted)", lineHeight: 1.7 }}>
                      {eventData.formattedStartDate}
                      {eventData.formattedStartDate !==
                      eventData.formattedEndDate
                        ? ` to ${eventData.formattedEndDate}`
                        : ""}
                    </Typography>
                    {eventData.description && (
                      <Box sx={eventMarkdownSx}>
                        <ReactMarkdown>{eventData.description}</ReactMarkdown>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>

              <Box className="ohx-card" sx={{ p: 2.25 }}>
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "16 / 10",
                    borderRadius: 2,
                    overflow: "hidden",
                    border: "1px solid var(--line)",
                    mb: 2,
                  }}
                >
                  <Image
                    src="https://cdn.ohack.dev/ohack.dev/2023_hackathon_1.webp"
                    alt="Mentors guiding teams at Opportunity Hack"
                    fill
                    sizes="(max-width: 1200px) 100vw, 320px"
                    style={{ objectFit: "cover" }}
                  />
                </Box>
                <Typography
                  variant="body1"
                  sx={{ color: "var(--muted)", lineHeight: 1.7, mb: 1.5 }}
                >
                  The strongest mentors do not wait for a ping. They find stuck
                  teams, give concrete feedback, and stay present through pitch
                  prep.
                </Typography>
                <Link
                  href="/about/mentors"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    ...refinedInlineLinkSx,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.5,
                    "&:hover": {
                      ...refinedInlineLinkSx["&:hover"],
                      textDecoration: "underline",
                    },
                  }}
                >
                  Read the mentor guide <Arrow />
                </Link>
              </Box>
            </Box>

            <Box sx={{ mb: 2.5 }}>
              <ApplicationNav eventId={event_id} currentType="mentor" />
            </Box>

            {Boolean(volunteerId) && (
              <Box className="ohx-card" sx={{ p: 3, mb: 3, maxWidth: 560 }}>
                <Eyebrow>Check-in</Eyebrow>
                <VolunteerCheckInQR
                  eventId={event_id}
                  volunteerId={volunteerId}
                  isSelected={isSelected}
                  volunteerType="mentor"
                  name={formData.name}
                  isSubmitted={true}
                  qrSize={200}
                  sx={{ mx: "auto", maxWidth: 500 }}
                />
              </Box>
            )}

            {isLoading ? (
              <Box
                className="ohx-card"
                sx={{
                  minHeight: 240,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mt: 3,
                }}
              >
                <CircularProgress sx={{ color: "var(--brand)" }} />
              </Box>
            ) : (
              <Box sx={{ mt: 3 }}>
                {eventData && eventData.isEventPast ? (
                  <Box
                    className="ohx-card"
                    sx={{ p: { xs: 2.5, sm: 3.5 }, mb: 4 }}
                  >
                    <Alert severity="warning" sx={{ ...warningAlertSx, mb: 3 }}>
                      <Typography
                        variant="h6"
                        component="div"
                        sx={{
                          mb: 1,
                          fontFamily: "var(--display,'Fraunces',Georgia,serif)",
                          fontWeight: 500,
                        }}
                      >
                        This event has already ended
                      </Typography>
                      <Typography variant="body1">
                        Applications are no longer open for this mentor role.
                        Please check the upcoming hackathons for the next chance
                        to jump in.
                      </Typography>
                    </Alert>

                    <Box
                      sx={{ mb: 4, display: "flex", justifyContent: "center" }}
                    >
                      <GiveButterWidget
                        context="event-ended"
                        userId={user?.userId}
                        applicationType="mentor"
                        size="large"
                        onDonationEvent={(eventData) => {
                          console.log(
                            "Event ended mentor donation event:",
                            eventData,
                          );
                        }}
                      />
                    </Box>

                    <Box textAlign="center">
                      <Button
                        variant="contained"
                        onClick={() => router.push("/hack")}
                        sx={primaryButtonSx}
                      >
                        View upcoming events
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <>
                    <Box
                      className="ohx-card"
                      sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}
                    >
                      <Stepper
                        activeStep={activeStep}
                        alternativeLabel={!isMobile}
                        orientation="horizontal"
                        sx={{
                          ...mentorStepperSx,
                          ...(isMobile && {
                            overflowX: "auto",
                            "&::-webkit-scrollbar": {
                              display: "none",
                            },
                            scrollbarWidth: "none",
                            "& .MuiStep-root": {
                              minWidth: 92,
                            },
                            "& .MuiStepLabel-root": {
                              px: 0.5,
                            },
                            "& .MuiStepLabel-label": {
                              fontSize: "0.72rem",
                              whiteSpace: "nowrap",
                            },
                            "& .MuiSvgIcon-root": {
                              width: 20,
                              height: 20,
                            },
                          }),
                        }}
                      >
                        {steps.map((label) => (
                          <Step key={label}>
                            <StepLabel>
                              {isMobile
                                ? activeStep === steps.indexOf(label)
                                  ? label
                                  : steps.indexOf(label) + 1
                                : label}
                            </StepLabel>
                          </Step>
                        ))}
                      </Stepper>
                    </Box>

                    <Box
                      className="ohx-card"
                      sx={{ p: { xs: 2.5, sm: 3, md: 4 }, mb: 4 }}
                    >
                      <Box sx={{ ...emphasisPanelSx, mb: 3 }}>
                        <Eyebrow>What we expect</Eyebrow>
                        <Typography
                          component="h2"
                          sx={{
                            ...stepTitleSx,
                            fontSize: { xs: "1.35rem", sm: "1.55rem" },
                            mt: 1,
                          }}
                        >
                          Mentor with intention
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            color: "var(--muted)",
                            mb: 1.25,
                            lineHeight: 1.7,
                          }}
                        >
                          Mentor certificates are awarded for proactive help —
                          not attendance. To qualify, expect to:
                        </Typography>
                        <Box
                          component="ul"
                          sx={{ m: 0, pl: 3, color: "var(--ink)" }}
                        >
                          <Typography
                            component="li"
                            variant="body1"
                            sx={{ mb: 0.75, lineHeight: 1.7 }}
                          >
                            Reach out to teams in Slack proactively, especially
                            if you are remote.
                          </Typography>
                          <Typography
                            component="li"
                            variant="body1"
                            sx={{ mb: 0.75, lineHeight: 1.7 }}
                          >
                            Review code, suggest concrete improvements, and help
                            teams scope down to something finishable.
                          </Typography>
                          <Typography
                            component="li"
                            variant="body1"
                            sx={{ mb: 0.75, lineHeight: 1.7 }}
                          >
                            Sit with teams during presentation prep and give
                            actionable demo or pitch feedback.
                          </Typography>
                          <Typography
                            component="li"
                            variant="body1"
                            sx={{ lineHeight: 1.7 }}
                          >
                            Show up consistently — a quick check-in without
                            follow through is not enough.
                          </Typography>
                        </Box>
                      </Box>

                      <Alert
                        severity="info"
                        icon={<InfoIcon />}
                        sx={{ ...infoAlertSx, mb: 4 }}
                      >
                        <Typography variant="body1">
                          New to mentoring at Opportunity Hack? Review the{" "}
                          <Link
                            href="/about/mentors"
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={refinedInlineLinkSx}
                          >
                            mentor guide
                          </Link>{" "}
                          for the role, expectations, and the kind of help teams
                          remember.
                        </Typography>
                      </Alert>

                      {(error || recaptchaError) && (
                        <Alert severity="error" sx={{ ...errorAlertSx, mb: 4 }}>
                          {error || recaptchaError}
                        </Alert>
                      )}

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSubmit();
                        }}
                      >
                        {getStepContent(activeStep)}

                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: { xs: "column-reverse", sm: "row" },
                            justifyContent: "space-between",
                            gap: 1.5,
                            mt: 4,
                          }}
                        >
                          <Button
                            disabled={activeStep === 0 || submitting}
                            onClick={handleBack}
                            variant="outlined"
                            sx={{
                              ...ghostButtonSx,
                              opacity: activeStep === 0 ? 0.45 : 1,
                            }}
                          >
                            Back
                          </Button>

                          <Button
                            variant="contained"
                            onClick={handleNext}
                            disabled={submitting || recaptchaLoading}
                            sx={primaryButtonSx}
                            endIcon={
                              activeStep === steps.length - 1 ||
                              submitting ||
                              recaptchaLoading ? null : (
                                <Arrow />
                              )
                            }
                          >
                            {activeStep === steps.length - 1 ? (
                              submitting || recaptchaLoading ? (
                                <CircularProgress
                                  size={20}
                                  sx={{ color: "#fff" }}
                                />
                              ) : (
                                "Submit application"
                              )
                            ) : (
                              "Next step"
                            )}
                          </Button>
                        </Box>
                      </form>
                    </Box>
                  </>
                )}
              </Box>
            )}
          </Box>
        </section>
      </RefinedRoot>
    );
  };

  // Main return - after all hooks have been called
  return success ? renderSuccessMessage() : renderApplicationForm();
};

// Create a new component that uses RequiredAuthProvider
const MentorApplicationPage = ({ seoMetadata }) => {
  const router = useRouter();
  const { event_id } = router.query;

  // Create the current URL for redirection
  const currentUrl =
    typeof window !== "undefined" && event_id
      ? `${window.location.origin}/hack/${event_id}/mentor-application`
      : null;

  return (
    <>
      {/* SEO metadata available to crawlers before authentication */}
      <Head>
        <RefinedFonts />
        <title>{seoMetadata.title}</title>
        <meta name="description" content={seoMetadata.description} />
        <meta
          name="keywords"
          content="hackathon mentor, mentor application, tech for good, nonprofit hackathon, opportunity hack, mentoring, guidance, leadership"
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
        <meta
          property="og:image:alt"
          content="Mentors guiding teams at Opportunity Hack"
        />
        <meta property="og:site_name" content="Opportunity Hack" />

        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoMetadata.title} />
        <meta name="twitter:description" content={seoMetadata.description} />
        <meta name="twitter:image" content={seoMetadata.imageUrl} />
        <meta
          name="twitter:image:alt"
          content="Mentors guiding teams at Opportunity Hack"
        />

        {/* Additional SEO meta tags */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Opportunity Hack" />
        <meta name="theme-color" content="#1B3A6B" />
      </Head>

      {/* Structured Data for SEO */}
      <Script
        id="mentor-application-structured-data-seo"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: seoMetadata.title,
            description: seoMetadata.description,
            url: seoMetadata.canonicalUrl,
            isPartOf: {
              "@type": "WebSite",
              name: "Opportunity Hack",
              url: "https://www.ohack.dev",
            },
            breadcrumb: {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: "https://www.ohack.dev/",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Hackathons",
                  item: "https://www.ohack.dev/hack",
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: seoMetadata.eventName,
                  item: `https://www.ohack.dev/hack/${event_id}`,
                },
                {
                  "@type": "ListItem",
                  position: 4,
                  name: "Mentor Application",
                  item: seoMetadata.canonicalUrl,
                },
              ],
            },
            mainEntity: {
              "@type": "JobPosting",
              title: `Mentor for ${seoMetadata.eventName}`,
              description:
                "Guide and support teams building tech solutions for nonprofits during our hackathon event",
              hiringOrganization: {
                "@type": "Organization",
                name: "Opportunity Hack",
              },
              jobLocation: {
                "@type": "Place",
                address: {
                  "@type": "PostalAddress",
                  addressLocality:
                    seoMetadata.location.split(",")[0] || "Tempe",
                  addressRegion: "Arizona",
                  addressCountry: "US",
                },
              },
              employmentType: "VOLUNTEER",
              industry: "Technology for Social Good",
              responsibilities: [
                "Guide teams in technical decision-making",
                "Provide expertise in software development best practices",
                "Support teams in project scoping and execution",
                "Help troubleshoot technical challenges",
              ],
              qualifications: [
                "Professional experience in technology or related fields",
                "Strong communication and mentoring skills",
                "Passion for social impact and nonprofit work",
                "Ability to guide teams under time constraints",
              ],
            },
          }),
        }}
      />

      <RequiredAuthProvider
        authUrl={process.env.NEXT_PUBLIC_REACT_APP_AUTH_URL}
        displayIfLoggedOut={
          <RedirectToLogin
            postLoginRedirectUrl={
              currentUrl ||
              (typeof window !== "undefined" ? window.location.href : undefined)
            }
          />
        }
      >
        <MentorApplicationComponent />
      </RequiredAuthProvider>
    </>
  );
};

// Server-side props for SEO metadata (available to crawlers before auth)
export async function getServerSideProps(context) {
  const { event_id } = context.params;

  // Default metadata for SEO
  let seoMetadata = {
    title: "Mentor at Opportunity Hack | Guide Tech for Good Teams",
    description:
      "Apply to mentor teams at our hackathon. Guide developers building tech solutions for nonprofits and help create meaningful social impact.",
    eventName: "Opportunity Hack",
    location: "Tempe, Arizona",
    canonicalUrl: `https://www.ohack.dev/hack/${event_id}/mentor-application`,
    imageUrl: "https://cdn.ohack.dev/ohack.dev/2024_hackathon_1.webp",
  };

  // Try to fetch event data for better SEO
  try {
    const apiServerUrl = process.env.NEXT_PUBLIC_API_SERVER_URL;
    if (apiServerUrl) {
      const response = await fetch(
        `${apiServerUrl}/api/messages/hackathon/${event_id}`,
      );

      if (response.ok) {
        const eventData = await response.json();

        if (eventData && eventData.title) {
          seoMetadata = {
            title: `Mentor at ${eventData.title} | Guide Tech for Good Teams`,
            description: `Apply to mentor teams at ${eventData.title} in ${eventData.location || "Tempe, Arizona"}. Guide developers building innovative tech solutions for nonprofits.`,
            eventName: eventData.title,
            location: eventData.location || "Tempe, Arizona",
            canonicalUrl: `https://www.ohack.dev/hack/${event_id}/mentor-application`,
            imageUrl:
              eventData.image_url ||
              "https://cdn.ohack.dev/ohack.dev/2024_hackathon_1.webp",
          };
        }
      }
    }
  } catch (error) {
    console.error("Failed to fetch event data for SEO:", error);
    // Continue with default metadata
  }

  return {
    props: {
      seoMetadata,
    },
  };
}

export default function MentorApplicationPageWithRecaptcha(props) {
  return (
    <ReCaptchaProvider>
      <MentorApplicationPage {...props} />
    </ReCaptchaProvider>
  );
}
