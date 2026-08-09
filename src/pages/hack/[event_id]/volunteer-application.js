import React, { useState, useEffect, useCallback, useRef } from "react";
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
  useMediaQuery,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Head from "next/head";
import Script from "next/script";
import { useEnv } from "../../../context/env.context";
import VolunteerCheckInQR from "../../../components/VolunteerCheckInQR";
import ApplicationNav from "../../../components/ApplicationNav/ApplicationNav";
import InfoIcon from "@mui/icons-material/Info";
import FormPersistenceControls from "../../../components/FormPersistenceControls";
import { useFormPersistence } from "../../../hooks/use-form-persistence";
import { useRecaptcha } from "../../../hooks/use-recaptcha";
import { PronounsPicker } from "../../../components/ApplicationForm";
import UploadPhoto from "../../../components/UploadPhoto";
import GiveButterWidget from "../../../components/GiveButterWidget";
import ReactMarkdown from "react-markdown";
import {
  getEventTimezone,
  getTimezoneAbbreviation,
} from "../../../lib/timezoneUtils";
import {
  RefinedRoot,
  RefinedFonts,
  Eyebrow,
  Arrow,
  Stat,
} from "../../../components/design/refined";
import {
  refinedFieldSx,
  refinedChoiceSx,
  refinedChipSx,
  refinedInlineLinkSx,
  refinedSelectMenuProps,
  stepTitleSx,
  stepLeadSx,
  eventMarkdownSx,
  infoAlertSx,
  warningAlertSx,
  successAlertSx,
  errorAlertSx,
  emphasisPanelSx,
  primaryButtonSx,
  ghostButtonSx,
  refinedStepperSx,
  refinedStepperMobileSx,
} from "../../../components/ApplicationForm/refinedStyles";

const VolunteerApplicationComponent = () => {
  const router = useRouter();
  const { event_id } = router.query;
  const { isLoggedIn, user, accessToken } = useAuthInfo();
  const { apiServerUrl } = useEnv();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Form navigation state
  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [eventData, setEventData] = useState(null);
  // Store volunteer ID for QR code generation
  const [volunteerId, setVolunteerId] = useState(null);
  const [isSelected, setIsSelected] = useState(false);

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

  // Scroll target so step navigation lands on the step fields, not the page hero
  const stepContentRef = useRef(null);

  // Available time slots (will be populated from event data)
  const [availabilityOptions, setAvailabilityOptions] = useState([]);
  // Add state for slot counts
  const [slotCounts, setSlotCounts] = useState({});
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

  const handlePhotoUpload = (photoUrl) => {
    // Store URL in both ref (for submission) and state (for form persistence)
    uploadedPhotoUrlRef.current = photoUrl;
    setFormData((prev) => ({
      ...prev,
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
      photoUrl: "",
    }));
  };

  // Initial form state
  const initialFormData = {
    timestamp: new Date().toISOString(),
    email: "",
    name: "",
    pronouns: "",
    bio: "",
    company: "",
    title: "",
    linkedin: "",
    portfolio: "",
    country: "",
    state: "",
    inPerson: "",
    experienceLevel: "",
    volunteerType: [],
    otherVolunteerType: "",
    skills: [],
    otherSkills: "",
    socialCauses: [],
    otherSocialCause: "",
    motivation: "",
    previousExperience: "",
    codeOfConduct: false,
    additionalInfo: "",
    event_id: event_id || "",
    isSelected: false,
    photoUrl: "", // Add field for photo URL
    availableDays: [], // Add field for available days/time slots
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
    formType: "volunteer",
    eventId: event_id || "",
    userId: user?.userId || "",
    initialFormData,
    apiServerUrl: apiServerUrl || "",
    accessToken: accessToken || "",
  });

  // Experience level options
  const experienceLevelOptions = [
    "First-time volunteer",
    "Some volunteering experience (1-3 events)",
    "Experienced volunteer (4+ events)",
  ];

  // Helper function to determine if event is virtual/global
  const isVirtualEvent = () => {
    // Check if location contains keywords indicating virtual or global participation
    if (!eventData?.location) return false;
    const location = eventData.location.toLowerCase();
    return (
      location.includes("global") ||
      location.includes("virtual") ||
      location.includes("online") ||
      location.includes("remote")
    );
  };

  // Volunteer type options - updated to be event-type aware
  const getVolunteerTypeOptions = () => {
    const isVirtual = isVirtualEvent();

    const baseOptions = ["Marketing/Communications", "Other"];

    const inPersonOptions = [
      "Check-in/Registration",
      "Cleanup Crew",
      "Food Service",
      "Presentation Pitch Support",
      "Photography/Videography",
      "Judging Support",
    ];

    const virtualOptions = [
      "Virtual Event Moderator",
      "Content Creation/Social Media",
    ];

    return isVirtual
      ? [...baseOptions, ...virtualOptions]
      : [...baseOptions, ...inPersonOptions];
  };

  // Social causes options
  const socialCausesOptions = [
    "Education",
    "Healthcare",
    "Environment",
    "Economic Opportunity",
    "Community Development",
    "Accessibility/Inclusion",
    "Homelessness",
    "Food Security",
    "Mental Health",
    "Disaster Relief",
    "Animal Welfare",
    "Technology Access",
    "Youth Development",
    "Arts & Culture",
    "Civil Rights",
    "Other",
  ];

  // Set up form with event_id
  useEffect(() => {
    initFacebookPixel();
  }, []);

  useEffect(() => {
    if (event_id && !formInitializedRef.current) {
      formInitializedRef.current = true;
      setFormData((prev) => ({
        ...prev,
        event_id: event_id,
      }));
    }
  }, [event_id, setFormData]);

  // Custom implementation for multi-select changes
  const customHandleMultiSelectChange = useCallback(
    (event, fieldName) => {
      handleMultiSelectChange(event, fieldName);

      // Clear otherVolunteerType when Other is removed from volunteerType
      if (
        fieldName === "volunteerType" &&
        !event.target.value.includes("Other")
      ) {
        setFormData((prev) => ({
          ...prev,
          otherVolunteerType: "",
        }));
      }

      // Clear otherSkills when Other is removed from skills
      if (fieldName === "skills" && !event.target.value.includes("Other")) {
        setFormData((prev) => ({
          ...prev,
          otherSkills: "",
        }));
      }

      // Clear otherSocialCause when Other is removed from socialCauses
      if (
        fieldName === "socialCauses" &&
        !event.target.value.includes("Other")
      ) {
        setFormData((prev) => ({
          ...prev,
          otherSocialCause: "",
        }));
      }
    },
    [handleMultiSelectChange, setFormData],
  );

  // Function to fetch volunteer slot counts
  const fetchSlotCounts = useCallback(
    async (eventId) => {
      if (!apiServerUrl || !eventId) return {};

      try {
        const response = await fetch(
          `${apiServerUrl}/api/volunteer/application_count_by_availability_timeslot/${eventId}`,
        );

        if (!response.ok) {
          console.warn(`Failed to fetch slot counts: ${response.status}`);
          return {};
        }

        const result = await response.json();
        return result.data || {};
      } catch (err) {
        console.error("Error fetching slot counts:", err);
        return {};
      }
    },
    [apiServerUrl],
  );

  // Function to generate time slots based on event dates
  const generateTimeSlots = (
    startDate,
    endDate,
    slotCountsData = {},
    eventTimezone,
  ) => {
    const tzAbbr = eventTimezone
      ? getTimezoneAbbreviation(new Date(startDate), eventTimezone)
      : "";
    if (!startDate || !endDate) return [];

    const start = new Date(startDate + "T00:00:00");
    const end = new Date(endDate + "T23:59:59");
    console.log("Availability Start Date:", start);
    console.log("Availability End Date:", end);
    // Calculate total event days between startDate and endDate
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    console.log("Total Event Days:", totalDays);

    // Determine if this is a virtual event - need to check eventData here
    const isVirtual = eventData?.location
      ? eventData.location.toLowerCase().includes("global") ||
        eventData.location.toLowerCase().includes("virtual") ||
        eventData.location.toLowerCase().includes("online") ||
        eventData.location.toLowerCase().includes("remote")
      : false;

    console.log(
      "Is Virtual Event:",
      isVirtual,
      "Location:",
      eventData?.location,
    );

    // Base volunteer roles available for both virtual and in-person events
    const baseVolunteerRoles = [
      // {
      //   name: 'Volunteer Product Manager (vPM)',
      //   description: 'Represent a nonprofit and answer questions about their problem statement',
      //   slotsNeeded: 8,
      //   icon: '🎯',
      //   availability: {
      //     // Available all days during active hacking periods
      //     days: 'all',
      //     periods: 'all',
      //     excludePeriods: ['setup','judging']
      //   }
      // }
    ];

    // In-person only volunteer roles
    const inPersonOnlyRoles = [
      {
        name: "Check-in Registration",
        description: "Help participants check in and get settled",
        slotsNeeded: 8,
        icon: "📋",
        availability: {
          // Only available on first day during setup and pitches periods
          days: [1],
          periods: ["setup"],
        },
      },
      {
        name: "Food Service",
        description: "Assist with meal coordination and service",
        slotsNeeded: 6,
        icon: "🍕",
        availability: {
          // Available all days during meal periods
          days: "all",
          periods: [
            "setup",
            "lunch1",
            "dinner1",
            "latenight",
            "morning2",
            "final",
          ],
          excludePeriods: [
            "pitches",
            "afternoon1",
            "evening1",
            "experts",
            "judging",
          ],
        },
      },
      {
        name: "Cleanup Crew",
        description:
          "Help maintain clean and organized spaces throughout the event",
        slotsNeeded: 6,
        icon: "🧹",
        availability: {
          // Available all days, all periods
          days: "all",
          periods: "all",
        },
      },
      {
        name: "Photography",
        description:
          "Capture moments and document the event with photos and videos",
        slotsNeeded: 6,
        icon: "📸",
        availability: {
          // Available all days but not during overnight periods
          days: "all",
          periods: "all",
          excludePeriods: ["latenight"], // Skip late night/overnight shifts
        },
      },
      {
        name: "Judging Support",
        description: "Help to ensure smooth judging process",
        slotsNeeded: 6,
        icon: "🏆",
        availability: {
          // Only available on last day during final periods
          days: [totalDays], // Last day only
          periods: ["judging"],
        },
      },
    ];

    // Virtual-only volunteer roles (currently just general support)
    const virtualOnlyRoles = [
      {
        name: "Virtual Event Moderator",
        description:
          "Moderate virtual sessions and facilitate online interactions",
        slotsNeeded: 2,
        icon: "🎤",
        availability: {
          // Available during key presentation and interaction periods
          days: "all",
          periods: ["setup", "pitches", "experts", "judging"],
          excludePeriods: [
            "afternoon1",
            "evening1",
            "latenight",
            "morning2",
            "final",
          ],
        },
      },
    ];

    // Combine roles based on event type
    const volunteerRolesConfig = isVirtual
      ? [...baseVolunteerRoles, ...virtualOnlyRoles]
      : [...baseVolunteerRoles, ...inPersonOnlyRoles];

    // Time blocks configuration with day assignments
    const timeBlocksConfig = [
      // Day 1 time blocks
      {
        time: "8:00am - 11:00am",
        label: "Doors Open & Registration",
        period: "setup",
        description:
          "Volunteers will need to assist with registration, breakfast prep, and area organization",
        day: 1,
        enabled: true,
      },
      {
        time: "10:00am - 12:00pm",
        label: "Nonprofit Pitches",
        period: "pitches",
        description: "Nonprofit presentations and team formation",
        day: 1,
        enabled: true,
      },
      {
        time: "12:00pm - 3:00pm",
        label: "Lunch",
        period: "lunch1",
        description:
          "Volunteers will assist with catered lunch prep, area organization, and snack prep",
        day: 1,
        enabled: true,
      },
      {
        time: "2:30pm - 5:00pm",
        label: "Afternoon Support",
        period: "afternoon1",
        description: "Afternoon hacking",
        day: 1,
        enabled: true,
      },
      {
        time: "4:00pm - 7:00pm",
        label: "Dinner & Evening",
        period: "dinner1",
        description:
          "Volunteers will assist with dinner prep, area organization, and ice cream",
        day: 1,
        enabled: true,
      },
      {
        time: "7:00pm - 11:00pm",
        label: "Evening Hacking",
        period: "evening1",
        description: "Evening hacking session support",
        day: 1,
        enabled: true,
      },
      {
        time: "11:30pm - 12:30am",
        label: "Midnight Run",
        period: "latenight",
        description: "Pizza setup, clean up, and snack refresh",
        day: 1,
        enabled: true,
      },

      // Day 2 time blocks
      {
        time: "8:00am - 11:00am",
        label: "Breakfast setup & clean-up",
        period: "morning2",
        description:
          "Volunteers will assist with meal setup, area organization, and snack prep",
        day: 2,
        enabled: true,
      },
      {
        time: "11:00am - 2:00pm",
        label: "Expert Hours",
        period: "experts",
        description: "Subject matter expert consultations",
        day: 2,
        enabled: true,
      },
      {
        time: "12:00pm - 3:00pm",
        label: "Lunch setup & cleanup",
        period: "final",
        description:
          "Volunteers will assist with lunch setup and clean up, area organization, and snack prep",
        day: 2,
        enabled: true,
      },
      {
        time: "3:00pm - 6:00pm",
        label: "Judging and cleanup",
        period: "judging",
        description:
          "Volunteers will assist with hacker communication, entertainment, and cleanup",
        day: 2,
        enabled: true,
      },

      // Generic multi-day blocks (for events longer than 2 days)
      {
        time: "8:00am - 11:00am",
        label: "Morning Session",
        period: "morning",
        description: "Morning activities and support",
        day: "multi",
        enabled: true,
      },
      {
        time: "11:00am - 2:00pm",
        label: "Midday Session",
        period: "midday",
        description: "Midday activities and lunch",
        day: "multi",
        enabled: true,
      },
      {
        time: "2:00pm - 5:00pm",
        label: "Afternoon Session",
        period: "afternoon",
        description: "Afternoon activities and support",
        day: "multi",
        enabled: true,
      },
      {
        time: "5:00pm - 8:00pm",
        label: "Evening Session",
        period: "evening",
        description: "Evening activities and dinner",
        day: "multi",
        enabled: true,
      },
    ];

    // Helper function to check if a role is available for a specific day and period
    const isRoleAvailableForPeriod = (role, dayNumber, period) => {
      const availability = role.availability;

      // Check day availability
      if (availability.days !== "all") {
        if (!availability.days.includes(dayNumber)) {
          return false;
        }
      }

      // Check period availability
      if (availability.periods !== "all") {
        if (!availability.periods.includes(period)) {
          return false;
        }
      }

      // Check excluded periods
      if (
        availability.excludePeriods &&
        availability.excludePeriods.includes(period)
      ) {
        return false;
      }

      return true;
    };

    const slots = [];

    // Loop through each day between start and end dates (inclusive)
    for (let day = new Date(start); day <= end; ) {
      const dayDate = new Date(day);
      const dateString = dayDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });

      // Determine which day number this is (1, 2, 3, etc.)
      const dayNumber =
        Math.floor((dayDate - start) / (1000 * 60 * 60 * 24)) + 1;
      let relevantTimeBlocks;

      if (dayNumber === 1) {
        // Day 1: All day 1 blocks
        relevantTimeBlocks = timeBlocksConfig.filter(
          (block) => block.day === 1 && block.enabled,
        );
      } else if (dayNumber === totalDays) {
        // Last day: All day 2 blocks (assuming 2-day event structure)
        relevantTimeBlocks = timeBlocksConfig.filter(
          (block) => block.day === 2 && block.enabled,
        );
      } else {
        // Middle days: Use multi-day blocks
        relevantTimeBlocks = timeBlocksConfig
          .filter((block) => block.day === "multi" && block.enabled)
          .map((block) => ({
            ...block,
            day: dayNumber, // Assign current day number
          }));
      }

      // Add slots for each time block and role combination
      relevantTimeBlocks.forEach((block) => {
        volunteerRolesConfig.forEach((role) => {
          // Check if this role is available for this day and period
          if (!isRoleAvailableForPeriod(role, dayNumber, block.period)) {
            return; // Skip this role for this time block
          }

          const slotId = `${dateString}-${block.label}-${role.name}`;
          const displayText = `${dateString}: ${block.label} - ${role.icon} ${role.name} (${block.time}${tzAbbr ? ` ${tzAbbr}` : ""})`;

          console.log("Display Text:", displayText);
          console.log("Slot ID:", slotId);

          // Get the actual count from API data, default to 0
          const slotsFilledCount = slotCountsData[slotId] || 0;
          console.log("Slots Filled Count:", slotsFilledCount);

          slots.push({
            id: slotId,
            date: dateString,
            roleName: role.name,
            roleDescription: role.description,
            roleIcon: role.icon,
            time: block.time,
            label: block.label,
            period: block.period,
            blockDescription: block.description,
            slotsNeeded: role.slotsNeeded,
            slotsFilledCount: slotsFilledCount, // Use actual count from API
            displayText: displayText,
            dayNumber: dayNumber,
            // Additional metadata for debugging/management
            roleConfig: role.availability,
            blockConfig: block,
          });
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

        // Fetch slot counts in parallel
        const slotCountsData = await fetchSlotCounts(event_id);
        console.log("Slot Counts Data:", slotCountsData);
        setSlotCounts(slotCountsData);

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

        // Generate time slots based on event dates with actual slot counts
        const eventTz = getEventTimezone(eventData);
        const slots = generateTimeSlots(
          eventData.start_date,
          eventData.end_date,
          slotCountsData,
          eventTz,
        );
        console.log("Availability Generated time slots:", slots);
        setAvailabilityOptions(slots);

        // Set default for in-person attendance if event is in-person
        const isVirtual = eventData.location
          ? eventData.location.toLowerCase().includes("global") ||
            eventData.location.toLowerCase().includes("virtual") ||
            eventData.location.toLowerCase().includes("online") ||
            eventData.location.toLowerCase().includes("remote")
          : false;

        if (!isVirtual) {
          setFormData((prev) => ({
            ...prev,
            inPerson: prev.inPerson || "Yes", // Default to 'Yes' for in-person events if not already set
          }));
        }

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
    apiServerUrl,
    setIsLoading,
    initializeRecaptcha,
    fetchSlotCounts,
  ]);

  // Handle user data and application loading - separate from event loading
  useEffect(() => {
    const loadUserAndFormData = async () => {
      // Skip if already initialized, event_id missing, user not loaded yet, or availability options not loaded
      if (
        !event_id ||
        !formInitializedRef.current ||
        !availabilityOptions.length
      )
        return;

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
                    "We found a previous application. Would you like to load it for editing?",
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
                      availabilityText.includes(slot.displayText),
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
                            (s) => s.id === id,
                          );
                          return slot ? slot.date : null;
                        })
                        .filter(Boolean),
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
                        .filter(Boolean),
                    ),
                  ];

                  setVolunteerId(prevData.id || null);
                  setIsSelected(prevData.isSelected || false);

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
    const requiredFields = ["email", "name"];

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

  // Enhanced validation for in-person events
  const validateAvailabilityInfo = () => {
    // Check for incompatible selection first
    if (!isVirtualEvent() && formData.inPerson === "No") {
      setError(
        'This is an in-person event. All volunteer roles require physical attendance. Please select "Yes" for in-person attendance or consider applying for our virtual events.',
      );
      return false;
    }

    const requiredFields = ["country", "state"];

    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(
          `Please fill out the ${field.replace(/([A-Z])/g, " $1").toLowerCase()} field`,
        );
        return false;
      }
    }

    // For in-person events, ensure user confirmed they will attend in person
    if (!isVirtualEvent() && formData.inPerson !== "Yes") {
      setError(
        'This is an in-person event. All volunteer roles require physical attendance. Please select "Yes" for in-person attendance or consider applying for our virtual events.',
      );
      return false;
    }

    if (!formData.availableDays || formData.availableDays.length === 0) {
      setError("Please select at least one available time slot");
      return false;
    }

    setError("");
    return true;
  };

  const validateAdditionalDetailsInfo = () => {
    // Validate social causes
    if (!formData.socialCauses || formData.socialCauses.length === 0) {
      setError("Please select at least one social cause you are interested in");
      return false;
    }

    // Check for "Other" social cause
    if (formData.socialCauses.includes("Other") && !formData.otherSocialCause) {
      setError("Please specify your other social cause interest");
      return false;
    }

    // Validate code of conduct
    if (!formData.codeOfConduct) {
      setError("You must agree to the code of conduct");
      return false;
    }

    setError("");
    return true;
  };

  const validateForm = () => {
    return (
      validateBasicInfo() &&
      validateAvailabilityInfo() &&
      validateAdditionalDetailsInfo() &&
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

  const handleNext = () => {
    if (activeStep === 0 && !validateAvailabilityInfo()) return;
    if (activeStep === 1 && !validateBasicInfo()) return;
    if (activeStep === 2 && !validateAdditionalDetailsInfo()) return;

    // Save progress when moving between steps
    handleManualSave();

    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep((prev) => prev + 1);
      trackEvent({
        action: "volunteer_app_step",
        params: {
          event_label: steps[activeStep + 1],
          step: activeStep + 2,
          event_id,
          page: "volunteer_application",
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
      action: "volunteer_app_step_back",
      params: {
        event_label: steps[activeStep - 1],
        step: activeStep,
        event_id,
        page: "volunteer_application",
      },
    });
    // Save progress when moving between steps
    handleManualSave();
    // Scroll to top of form for better UX
    if (formRef?.current) {
      formRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

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
        // Process volunteerType with otherVolunteerType if needed
        volunteerType: formData.volunteerType.includes("Other")
          ? [
              ...formData.volunteerType.filter((t) => t !== "Other"),
              formData.otherVolunteerType,
            ].join(", ")
          : formData.volunteerType.join(", "),
        // Process skills with otherSkills if needed
        skills: formData.skills.includes("Other")
          ? [
              ...formData.skills.filter((s) => s !== "Other"),
              formData.otherSkills,
            ].join(", ")
          : formData.skills.join(", "),
        // Process socialCauses with otherSocialCause if needed
        socialCauses: formData.socialCauses.includes("Other")
          ? [
              ...formData.socialCauses.filter((c) => c !== "Other"),
              formData.otherSocialCause,
            ].join(", ")
          : formData.socialCauses.join(", "),
        // Convert boolean values
        isInPerson: formData.inPerson === "Yes",
        // Add type information
        type: "volunteers",
        volunteer_type: "volunteer",
        agreedToCodeOfConduct: formData.codeOfConduct,
        linkedinProfile: formData.linkedin,
        shortBio: formData.bio,
        photoUrl: uploadedPhotoUrlRef.current || formData.photoUrl || "",
        // Map available days to their display text
        availability: formData.availableDays
          .map(
            (dayId) =>
              availabilityOptions.find((option) => option.id === dayId)
                ?.displayText || dayId,
          )
          .join(", "),
        // Add reCAPTCHA token
        recaptchaToken,
      };

      if (apiServerUrl) {
        // Submit to API
        const submitEndpoint = previouslySubmitted
          ? `${apiServerUrl}/api/volunteer/application/${event_id}/update`
          : `${apiServerUrl}/api/volunteer/application/${event_id}/submit`;

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
        }
      } else {
        // In a test environment, log the data and simulate API delay
        console.log("Submitting volunteer application:", submissionData);
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
        action: "volunteer_app_submit",
        params: {
          event_label: "success",
          event_id,
          page: "volunteer_application",
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
        action: "volunteer_app_submit_error",
        params: {
          event_label: err.message,
          event_id,
          page: "volunteer_application",
        },
      });
      setError("Failed to submit your application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Define steps for stepper
  const steps = [
    "Available Volunteer Slots",
    "Basic Info",
    "Additional Details",
  ];

  // Render basic information form
  const renderBasicInfoForm = () => (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Eyebrow>Step 2</Eyebrow>
        <Typography component="h2" sx={stepTitleSx}>
          Basic information
        </Typography>
        <Typography variant="body1" sx={stepLeadSx}>
          Tell us who you are so staff and fellow volunteers know who&apos;s on
          shift.
        </Typography>
      </Box>

      {/* Required fields */}
      <Box sx={{ mb: 3 }}>
        <TextField
          label="Email Address"
          name="email"
          type="email"
          required
          fullWidth
          value={formData.email || ""}
          onChange={handleFormChange}
          sx={refinedFieldSx}
        />

        <TextField
          label="Your Name"
          name="name"
          required
          fullWidth
          value={formData.name || ""}
          onChange={handleFormChange}
          sx={refinedFieldSx}
        />
      </Box>

      {/* Optional fields in collapsible section */}
      <Accordion
        elevation={0}
        sx={{
          mb: 3,
          border: "1px solid var(--line)",
          borderRadius: "8px !important",
          backgroundColor: "var(--surface)",
          boxShadow: "none",
          overflow: "hidden",
          "&:before": { display: "none" },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="optional-fields-content"
          id="optional-fields-header"
          sx={{
            bgcolor: "var(--surface)",
            color: "var(--ink)",
            "& .MuiAccordionSummary-expandIconWrapper": {
              color: "var(--brand)",
            },
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Optional information
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ pt: 1 }}>
            <PronounsPicker
              value={formData.pronouns || ""}
              onChange={(next) =>
                setFormData((prev) => ({ ...prev, pronouns: next }))
              }
              required={false}
            />

            <TextField
              label="Company or Organization (Optional)"
              name="company"
              fullWidth
              value={formData.company || ""}
              onChange={handleFormChange}
              sx={refinedFieldSx}
            />

            <TextField
              label="Job Title (Optional)"
              name="title"
              fullWidth
              value={formData.title || ""}
              onChange={handleFormChange}
              sx={refinedFieldSx}
            />

            <TextField
              label="Short bio (Optional)"
              name="bio"
              multiline
              rows={3}
              fullWidth
              value={formData.bio || ""}
              onChange={handleFormChange}
              helperText="Tell us a bit about yourself (aim for 100-200 words)"
              sx={refinedFieldSx}
            />

            <UploadPhoto
              value={formData.photoUrl || ""}
              onChange={handlePhotoUpload}
              onError={handlePhotoError}
              label="Your Profile Photo (Optional)"
              helperText="Please upload a professional photo of yourself, we'd like to add this to our website so people can see who is volunteering."
              directory="volunteers"
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
              value={formData.linkedin || ""}
              onChange={handleFormChange}
              sx={refinedFieldSx}
              placeholder="https://linkedin.com/in/yourprofile"
            />

            <TextField
              label="What motivates you to volunteer with Opportunity Hack? (Optional)"
              name="motivation"
              multiline
              rows={3}
              fullWidth
              value={formData.motivation || ""}
              onChange={handleFormChange}
              helperText="Share your motivation for getting involved"
              sx={{ ...refinedFieldSx, mb: 0 }}
            />
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );

  // Render combined additional details form
  const renderAdditionalDetailsForm = () => (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Eyebrow>Step 3</Eyebrow>
        <Typography component="h2" sx={stepTitleSx}>
          Additional details
        </Typography>
        <Typography variant="body1" sx={stepLeadSx}>
          A few more details on the causes you care about, plus the code of
          conduct, before you submit.
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth sx={refinedFieldSx}>
          <InputLabel id="experience-level-label">
            Volunteer Experience Level
          </InputLabel>
          <Select
            labelId="experience-level-label"
            id="experience-level"
            name="experienceLevel"
            value={formData.experienceLevel || ""}
            onChange={handleFormChange}
            label="Volunteer Experience Level"
            MenuProps={refinedSelectMenuProps}
          >
            {experienceLevelOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            How much experience do you have with volunteering?
          </FormHelperText>
        </FormControl>

        <FormControl
          fullWidth
          required
          sx={{
            ...refinedFieldSx,
            mb: formData.socialCauses?.includes("Other") ? 1 : 3,
          }}
        >
          <InputLabel id="social-causes-label">
            Social Causes You're Interested In
          </InputLabel>
          <Select
            labelId="social-causes-label"
            id="social-causes"
            multiple
            value={formData.socialCauses || []}
            onChange={(e) => customHandleMultiSelectChange(e, "socialCauses")}
            input={<OutlinedInput label="Social Causes You're Interested In" />}
            MenuProps={refinedSelectMenuProps}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} sx={refinedChipSx} />
                ))}
              </Box>
            )}
          >
            {socialCausesOptions.map((option) => (
              <MenuItem key={option} value={option}>
                <Checkbox
                  checked={(formData.socialCauses || []).indexOf(option) > -1}
                />
                <ListItemText primary={option} />
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            Select causes you're passionate about (select at least one)
          </FormHelperText>
        </FormControl>

        {formData.socialCauses?.includes("Other") && (
          <TextField
            label="Please specify your other social cause interest"
            name="otherSocialCause"
            required
            fullWidth
            value={formData.otherSocialCause || ""}
            onChange={handleFormChange}
            helperText="Tell us about your specific interest"
            sx={refinedFieldSx}
          />
        )}

        <TextField
          label="Any additional information or questions?"
          name="additionalInfo"
          multiline
          rows={4}
          fullWidth
          value={formData.additionalInfo || ""}
          onChange={handleFormChange}
          sx={{ ...refinedFieldSx, mb: 4 }}
        />

        <FormControlLabel
          control={
            <Checkbox
              name="codeOfConduct"
              checked={formData.codeOfConduct || false}
              onChange={handleFormChange}
              required
              sx={refinedChoiceSx}
            />
          }
          label={
            <Typography variant="body2">
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
          <Typography variant="body2">
            By submitting this form, you're expressing interest in volunteering
            with Opportunity Hack. We'll review your application and contact you
            with next steps soon.
          </Typography>
        </Alert>
      </Box>
    </Box>
  );

  // Render availability form with SignupGenius-style interface
  const renderAvailabilityForm = () => {
    // Group slots by date and time block for table structure
    const slotsByDate = availabilityOptions.reduce((grouped, slot) => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = {};
      }
      if (!grouped[slot.date][slot.label]) {
        grouped[slot.date][slot.label] = {
          timeBlock: slot,
          roles: [],
        };
      }
      grouped[slot.date][slot.label].roles.push(slot);
      return grouped;
    }, {});

    // Check for incompatible selection (virtual participation for in-person event)
    const hasIncompatibleSelection =
      !isVirtualEvent() && formData.inPerson === "No";

    return (
      <Box sx={{ mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Eyebrow>Step 1</Eyebrow>
          <Typography component="h2" sx={stepTitleSx}>
            Availability &amp; location
          </Typography>
          <Typography variant="body1" sx={stepLeadSx}>
            Pick every shift where you can help keep things moving — check-in,
            food, cleanup, photography, or judging support — and tell us where
            you&apos;ll be joining from.
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
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
                Are you joining us in-person or virtually?
              </Typography>
              <RadioGroup
                name="inPerson"
                value={formData.inPerson || ""}
                onChange={handleFormChange}
              >
                <FormControlLabel
                  value="Yes"
                  control={<Radio sx={refinedChoiceSx} />}
                  label="Yes, I'll attend in person"
                />
                <FormControlLabel
                  value="No"
                  control={<Radio sx={refinedChoiceSx} />}
                  label="No, I'll participate virtually"
                />
              </RadioGroup>
            </FormControl>
          )}

          {/* Show blocking alert for incompatible selection */}
          {hasIncompatibleSelection && (
            <Alert severity="warning" sx={{ ...warningAlertSx, mb: 4 }}>
              <Typography
                variant="h6"
                component="div"
                sx={{
                  mb: 2,
                  fontFamily: "var(--display,'Fraunces',Georgia,serif)",
                  fontWeight: 500,
                }}
              >
                Virtual Participation Not Available
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                This hackathon ({eventData?.name}) requires in-person attendance
                at {eventData?.location}. All volunteer roles need physical
                presence to support participants effectively.
              </Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                <strong>Your options:</strong>
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 1.5,
                }}
              >
                <Button
                  variant="contained"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, inPerson: "Yes" }));
                  }}
                  startIcon={<span>📍</span>}
                  sx={primaryButtonSx}
                >
                  Change to In-Person
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => router.push("/hack")}
                  startIcon={<span>🌐</span>}
                  sx={ghostButtonSx}
                >
                  Find Virtual Events
                </Button>
                <Button
                  variant="outlined"
                  onClick={() =>
                    router.push(`/hack/${event_id}/mentor-application`)
                  }
                  startIcon={<span>👥</span>}
                  sx={ghostButtonSx}
                >
                  Mentor Instead
                </Button>
              </Box>
            </Alert>
          )}

          {/* Only show the rest of the form if selection is compatible */}
          {!hasIncompatibleSelection && (
            <>
              <TextField
                label={
                  isVirtualEvent()
                    ? "Which country will you be volunteering from?"
                    : formData.inPerson === "Yes"
                      ? "Which country are you traveling from?"
                      : "Which country will you be volunteering from?"
                }
                name="country"
                required
                fullWidth
                value={formData.country || ""}
                onChange={handleFormChange}
                sx={refinedFieldSx}
              />

              <TextField
                label={
                  isVirtualEvent()
                    ? "State/Province (where you'll be volunteering from)"
                    : formData.inPerson === "Yes"
                      ? "State/Province (where you're traveling from)"
                      : "State/Province (where you'll be volunteering from)"
                }
                name="state"
                required
                fullWidth
                value={formData.state || ""}
                onChange={handleFormChange}
                sx={refinedFieldSx}
              />

              <Typography
                component="h3"
                sx={{
                  ...stepTitleSx,
                  fontSize: { xs: "1.2rem", sm: "1.4rem" },
                }}
              >
                Available volunteer slots
              </Typography>
              <Typography
                variant="body2"
                sx={{ ...stepLeadSx, fontSize: "0.98rem", mb: 2 }}
              >
                Choose the volunteer roles and time slots that work best for
                you. Each time block shows different volunteer opportunities
                during that period.
              </Typography>

              {/* Date filter/search */}
              <TextField
                label="Filter dates"
                variant="outlined"
                fullWidth
                value={dateFilter}
                onChange={handleDateFilterChange}
                placeholder="Type to filter dates (e.g., 'Monday' or 'Oct')"
                sx={{ ...refinedFieldSx, maxWidth: 400 }}
              />

              {/* SignupGenius-style table */}
              <Box className="ohx-card" sx={{ overflow: "hidden" }}>
                {Object.entries(slotsByDate)
                  .filter(
                    ([date]) =>
                      !dateFilter || date.toLowerCase().includes(dateFilter),
                  )
                  .map(([date, timeBlocks]) => (
                    <Box
                      key={date}
                      sx={{ borderBottom: "1px solid var(--line)" }}
                    >
                      {/* Date header */}
                      <Box
                        sx={{
                          bgcolor: "var(--brand)",
                          color: "#fff",
                          p: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: 1,
                        }}
                      >
                        <Typography
                          component="h4"
                          sx={{
                            fontFamily:
                              "var(--display,'Fraunces',Georgia,serif)",
                            fontWeight: 500,
                            fontSize: "1.15rem",
                          }}
                        >
                          {date}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.85 }}>
                          All times in{" "}
                          {getTimezoneAbbreviation(
                            new Date(),
                            getEventTimezone(eventData),
                          )}{" "}
                          (event timezone)
                        </Typography>
                      </Box>

                      {/* Time blocks and volunteer slots */}
                      <Box sx={{ bgcolor: "var(--surface)" }}>
                        {Object.entries(timeBlocks).map(
                          ([timeLabel, timeBlockData]) => (
                            <Box
                              key={timeLabel}
                              sx={{
                                borderBottom: "1px solid var(--line)",
                              }}
                            >
                              {/* Time block header */}
                              <Box
                                sx={{
                                  bgcolor: "var(--surface-2)",
                                  p: 2,
                                  borderBottom: "1px solid var(--line)",
                                }}
                              >
                                <Typography
                                  variant="subtitle1"
                                  sx={{
                                    fontWeight: 600,
                                    color: "var(--ink)",
                                    mb: 0.5,
                                  }}
                                >
                                  {timeBlockData.timeBlock.time}{" "}
                                  {getTimezoneAbbreviation(
                                    new Date(),
                                    getEventTimezone(eventData),
                                  )}{" "}
                                  - {timeBlockData.timeBlock.label}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "var(--muted)" }}
                                >
                                  {timeBlockData.timeBlock.blockDescription}
                                </Typography>
                              </Box>

                              {/* Volunteer roles for this time block */}
                              <Box
                                sx={{
                                  display: "grid",
                                  gridTemplateColumns: {
                                    xs: "1fr",
                                    sm: "1fr 1fr",
                                    lg: "1fr 1fr 1fr",
                                  },
                                  gap: 0,
                                }}
                              >
                                {timeBlockData.roles.map((slot) => {
                                  const isSelected =
                                    formData.availableDays.includes(slot.id);
                                  const slotsRemaining =
                                    slot.slotsNeeded - slot.slotsFilledCount;

                                  return (
                                    <Box
                                      key={slot.id}
                                      sx={{
                                        p: 2,
                                        borderRight: {
                                          xs: "none",
                                          sm: "1px solid var(--line)",
                                        },
                                        borderBottom: {
                                          xs: "1px solid var(--line)",
                                          lg: "none",
                                        },
                                        "&:hover": {
                                          bgcolor: "var(--surface-2)",
                                        },
                                        ...(isSelected && {
                                          bgcolor: "rgba(27,58,107,0.08)",
                                        }),
                                        display: "flex",
                                        flexDirection: "column",
                                        minHeight: 120,
                                      }}
                                    >
                                      {/* Role info */}
                                      <Box sx={{ flex: 1, mb: 2 }}>
                                        <Typography
                                          variant="subtitle2"
                                          sx={{
                                            fontWeight: 600,
                                            color: "var(--ink)",
                                            mb: 0.5,
                                          }}
                                        >
                                          {slot.roleIcon} {slot.roleName}
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            color: "var(--muted)",
                                            display: "block",
                                            mb: 1,
                                          }}
                                        >
                                          {slot.roleDescription}
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            color: "var(--muted)",
                                            display: "block",
                                          }}
                                        >
                                          {slot.slotsFilledCount} of{" "}
                                          {slot.slotsNeeded} slots filled
                                        </Typography>
                                      </Box>

                                      {/* Sign up button */}
                                      <Box sx={{ mt: "auto" }}>
                                        {slotsRemaining > 0 || isSelected ? (
                                          <Button
                                            size="small"
                                            fullWidth
                                            onClick={() => {
                                              const newAvailability = isSelected
                                                ? formData.availableDays.filter(
                                                    (id) => id !== slot.id,
                                                  )
                                                : [
                                                    ...formData.availableDays,
                                                    slot.id,
                                                  ];
                                              setFormData((prev) => ({
                                                ...prev,
                                                availableDays: newAvailability,
                                              }));
                                            }}
                                            sx={{
                                              ...(isSelected
                                                ? primaryButtonSx
                                                : ghostButtonSx),
                                              minWidth: 0,
                                              px: 1.4,
                                              py: 0.7,
                                              fontSize: "0.82rem",
                                            }}
                                          >
                                            {isSelected
                                              ? "✓ Remove Me"
                                              : "Sign Up"}
                                          </Button>
                                        ) : (
                                          <Button
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                            disabled
                                            sx={{
                                              minWidth: 0,
                                              px: 1.4,
                                              py: 0.7,
                                              fontSize: "0.82rem",
                                              textTransform: "none",
                                              borderRadius: "5px",
                                              color: "#b04a36",
                                              borderColor: "#e4c0ba",
                                            }}
                                          >
                                            Full
                                          </Button>
                                        )}
                                      </Box>
                                    </Box>
                                  );
                                })}
                              </Box>
                            </Box>
                          ),
                        )}
                      </Box>
                    </Box>
                  ))}
              </Box>

              {/* Selected slots summary */}
              {formData.availableDays.length > 0 && (
                <Box className="ohx-card" sx={{ mt: 3, p: 3 }}>
                  <Typography
                    component="h4"
                    sx={{
                      ...stepTitleSx,
                      fontSize: { xs: "1.1rem", sm: "1.25rem" },
                      mb: 2,
                    }}
                  >
                    Your Volunteer Commitments ({formData.availableDays.length}{" "}
                    slots)
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    {formData.availableDays.map((slotId) => {
                      const slot = availabilityOptions.find(
                        (opt) => opt.id === slotId,
                      );
                      return slot ? (
                        <Box
                          key={slotId}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            border: "1px solid var(--line)",
                            bgcolor: "var(--surface-2)",
                            p: 1,
                            borderRadius: 1.5,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ color: "var(--ink)" }}
                          >
                            {slot.date} - {slot.label}: {slot.roleIcon}{" "}
                            {slot.roleName}
                          </Typography>
                          <Button
                            size="small"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                availableDays: prev.availableDays.filter(
                                  (id) => id !== slotId,
                                ),
                              }));
                            }}
                            sx={{
                              color: "var(--muted)",
                              minWidth: "auto",
                              p: 0.5,
                              "&:hover": { color: "var(--ink)" },
                            }}
                          >
                            ✕
                          </Button>
                        </Box>
                      ) : null;
                    })}
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, availableDays: [] }));
                    }}
                    sx={{
                      ...ghostButtonSx,
                      mt: 2,
                      px: 1.6,
                      py: 0.7,
                      fontSize: "0.82rem",
                    }}
                  >
                    Clear All
                  </Button>
                </Box>
              )}

              {formData.availableDays.length === 0 &&
                !hasIncompatibleSelection && (
                  <Alert severity="info" sx={{ ...infoAlertSx, mt: 3 }}>
                    Please select at least one volunteer slot to continue.
                  </Alert>
                )}
            </>
          )}
        </Box>
      </Box>
    );
  };

  // Function to render the current step form
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderAvailabilityForm();
      case 1:
        return renderBasicInfoForm();
      case 2:
        return renderAdditionalDetailsForm();
      default:
        return "Unknown step";
    }
  };

  // Enhanced SEO metadata and descriptions
  const pageTitle = eventData
    ? `Volunteer for ${eventData.name} | Help Run a Tech for Good Hackathon`
    : "Volunteer for Opportunity Hack | Tech for Good Hackathon";
  const pageDescription = eventData
    ? `Join our volunteer team for ${eventData.name} in ${eventData.location} from ${eventData.formattedStartDate} to ${eventData.formattedEndDate}. Help run an impactful hackathon where developers create technology solutions for nonprofits. Volunteer as a mentor, judge, or event organizer.`
    : "Volunteer for Opportunity Hack hackathon! Help run events where developers create technology solutions for nonprofits. Join as a mentor, judge, or organizer and make a real impact in the tech for good community.";
  const canonicalUrl = `https://www.ohack.dev/hack/${event_id}/volunteer-application`;
  const imageUrl =
    eventData?.image || "https://cdn.ohack.dev/ohack.dev/2024_hackathon_1.webp";

  // Generate structured data for SEO
  const structuredData = eventData
    ? {
        "@context": "https://schema.org",
        "@type": "Event",
        name: `Volunteer for ${eventData.name}`,
        description: pageDescription,
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        location: {
          "@type": "Place",
          name: eventData.location,
          address: {
            "@type": "PostalAddress",
            addressLocality: eventData.location.split(",")[0] || "Tempe",
            addressRegion: "Arizona",
            addressCountry: "US",
          },
        },
        organizer: {
          "@type": "Organization",
          name: "Opportunity Hack",
          url: "https://www.ohack.dev",
        },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: isVirtualEvent()
          ? "https://schema.org/OnlineEventAttendanceMode"
          : "https://schema.org/OfflineEventAttendanceMode",
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
              name: "Volunteer Application",
              item: canonicalUrl,
            },
          ],
        },
      }
    : null;

  // If form submitted successfully, show success message
  const renderSuccessMessage = () => (
    <RefinedRoot>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="theme-color" content="#1B3A6B" />
        <RefinedFonts />
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
              Thanks for stepping up to help run the event. We&apos;ve got your
              application and our team will follow up soon.
            </p>
          </div>

          <Box className="ohx-card" sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
            <Alert severity="success" sx={{ ...successAlertSx, mb: 4 }}>
              <Typography variant="body1">
                Thank you for applying to volunteer with Opportunity Hack.
                We&apos;ll review your application and contact you with next
                steps soon.
              </Typography>
            </Alert>

            <Box sx={{ mb: 4, display: "flex", justifyContent: "center" }}>
              <GiveButterWidget
                context="success"
                userId={user?.userId}
                applicationType="volunteer"
                size="large"
                onDonationEvent={(eventData) => {
                  // Track volunteer application donations
                  console.log("Volunteer donation event:", eventData);
                  // You can add additional tracking here
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

  const renderApplicationForm = () => (
    <RefinedRoot>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta charSet="UTF-8" />
        <meta
          name="keywords"
          content={`hackathon volunteer, volunteer application, tech for good, nonprofit hackathon, opportunity hack, social good, volunteer, community service, ${eventData?.name || "hackathon"}, ${eventData?.location || "tech event"}, mentor, judge, event organizer`}
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
        <meta property="og:image" content={imageUrl} />
        <meta
          property="og:image:alt"
          content="Volunteers helping at Opportunity Hack hackathon"
        />
        <meta property="og:site_name" content="Opportunity Hack" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@OpportunityHack" />
        <meta name="twitter:creator" content="@OpportunityHack" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={imageUrl} />
        <meta
          name="twitter:image:alt"
          content="Volunteers helping at Opportunity Hack hackathon"
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
                  ? `${eventData.name} · volunteer application`
                  : "Volunteer application"}
              </Eyebrow>
              <h1 className="ohx-display" style={{ marginTop: 8 }}>
                Keep the event{" "}
                <span className="ohx-italic">running like clockwork.</span>
              </h1>
              <p className="ohx-lead" style={{ marginTop: 16 }}>
                Opportunity Hack volunteers are the operations crew — check-in,
                food, wayfinding, photography, judging logistics — so hackers
                and mentors can stay heads-down on the work. Pick the shifts
                that fit your schedule and we&apos;ll take it from there.
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
                  <Stat value="Flexible" label="shifts" />
                </Box>
              </Box>

              {eventData && (
                <Box className="ohx-card" sx={{ mt: 3, p: { xs: 2.5, md: 3 } }}>
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
                    {eventData.formattedStartDate !== eventData.formattedEndDate
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
                  src="https://cdn.ohack.dev/ohack.dev/2024_hackathon_3.webp"
                  alt="Volunteers helping at Opportunity Hack"
                  fill
                  sizes="(max-width: 1200px) 100vw, 320px"
                  style={{ objectFit: "cover" }}
                />
              </Box>
              <Typography
                variant="body1"
                sx={{ color: "var(--muted)", lineHeight: 1.7, mb: 1.5 }}
              >
                Volunteers show up early, stay flexible, and handle the
                logistics nobody else sees — so participants can focus on
                building.
              </Typography>
              <Link
                href="/volunteer"
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
                See how volunteering works <Arrow />
              </Link>
            </Box>
          </Box>

          {/* Add ApplicationNav component */}
          {event_id && (
            <Box sx={{ mb: 2.5 }}>
              <ApplicationNav eventId={event_id} currentType="volunteer" />
            </Box>
          )}

          {Boolean(volunteerId) && isSelected && (
            <Box className="ohx-card" sx={{ p: 3, mb: 3, maxWidth: 560 }}>
              <Eyebrow>Check-in</Eyebrow>
              <VolunteerCheckInQR
                eventId={event_id}
                volunteerId={volunteerId}
                isSelected={isSelected}
                volunteerType="volunteer"
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
                      Applications are no longer being accepted for volunteers
                      as this hackathon has already concluded. Please check our
                      upcoming events for future volunteering opportunities.
                    </Typography>
                  </Alert>

                  <Box
                    sx={{ mb: 4, display: "flex", justifyContent: "center" }}
                  >
                    <GiveButterWidget
                      context="event-ended"
                      userId={user?.userId}
                      applicationType="volunteer"
                      size="large"
                      onDonationEvent={(eventData) => {
                        // Track volunteer application donations when event ended
                        console.log(
                          "Event ended volunteer donation event:",
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
                      View Upcoming Events
                    </Button>
                  </Box>
                </Box>
              ) : (
                <>
                  <Box className="ohx-card" sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
                    <Stepper
                      activeStep={activeStep}
                      alternativeLabel={!isMobile}
                      orientation="horizontal"
                      sx={{
                        ...refinedStepperSx,
                        ...(isMobile && refinedStepperMobileSx),
                      }}
                    >
                      {steps.map((label) => (
                        <Step key={label}>
                          <StepLabel>
                            {isMobile
                              ? // On mobile, show abbreviated labels or just the step number
                                activeStep === steps.indexOf(label)
                                ? label
                                : steps.indexOf(label) + 1
                              : // On desktop, show full labels
                                label}
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
                      <Eyebrow>What to expect</Eyebrow>
                      <Typography
                        component="h2"
                        sx={{
                          ...stepTitleSx,
                          fontSize: { xs: "1.35rem", sm: "1.55rem" },
                          mt: 1,
                        }}
                      >
                        Volunteering with Opportunity Hack
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: "var(--muted)",
                          mb: 1.25,
                          lineHeight: 1.7,
                        }}
                      >
                        Volunteers play a crucial role in the success of our
                        events and help create a supportive environment for
                        participants. As a volunteer, you can expect to:
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
                          Support the organization and logistics of the
                          hackathon
                        </Typography>
                        <Typography
                          component="li"
                          variant="body1"
                          sx={{ mb: 0.75, lineHeight: 1.7 }}
                        >
                          Help participants navigate the event and find
                          resources
                        </Typography>
                        <Typography
                          component="li"
                          variant="body1"
                          sx={{ mb: 0.75, lineHeight: 1.7 }}
                        >
                          Contribute your skills to make the event a success
                        </Typography>
                        <Typography
                          component="li"
                          variant="body1"
                          sx={{ mb: 0.75, lineHeight: 1.7 }}
                        >
                          Connect with a community passionate about social
                          impact
                        </Typography>
                        <Typography
                          component="li"
                          variant="body1"
                          sx={{ lineHeight: 1.7 }}
                        >
                          Gain experience and build your network
                        </Typography>
                      </Box>
                    </Box>

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
                      <Box
                        ref={stepContentRef}
                        sx={{ scrollMarginTop: "96px" }}
                      >
                        {getStepContent(activeStep)}
                      </Box>

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

  // Main return - after all hooks have been called
  return success ? renderSuccessMessage() : renderApplicationForm();
};

// Export the component with RequiredAuthProvider
const VolunteerApplicationPage = ({ seoMetadata }) => {
  const router = useRouter();
  const { event_id } = router.query;

  // Create the current URL for redirection
  const currentUrl =
    typeof window !== "undefined" && event_id
      ? `${window.location.origin}/hack/${event_id}/volunteer-application`
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
        <meta
          property="og:image:alt"
          content="Volunteers supporting teams at Opportunity Hack"
        />
        <meta property="og:site_name" content="Opportunity Hack" />

        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoMetadata.title} />
        <meta name="twitter:description" content={seoMetadata.description} />
        <meta name="twitter:image" content={seoMetadata.imageUrl} />
        <meta
          name="twitter:image:alt"
          content="Volunteers supporting teams at Opportunity Hack"
        />

        {/* Additional SEO meta tags */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Opportunity Hack" />
        <meta name="theme-color" content="#1B3A6B" />
      </Head>

      {/* Structured Data for SEO */}
      <Script
        id="volunteer-application-structured-data-seo"
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
                  item: "https://www.ohack.dev",
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
                  name: "Volunteer Application",
                  item: seoMetadata.canonicalUrl,
                },
              ],
            },
            mainEntity: {
              "@type": "JobPosting",
              title: `Volunteer for ${seoMetadata.eventName}`,
              description:
                "Support teams and help organize our hackathon event focused on building tech solutions for nonprofits",
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
                "Assist with event setup and logistics",
                "Support participants during the hackathon",
                "Help with registration and check-in processes",
                "Provide general event support and assistance",
              ],
              qualifications: [
                "Enthusiasm for social impact and nonprofit work",
                "Strong communication and interpersonal skills",
                "Ability to work in a fast-paced environment",
                "Willingness to help teams and participants",
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
    description:
      "Apply to volunteer at our hackathon event. Help support teams building tech solutions for nonprofits and make a difference in your community.",
    eventName: "Opportunity Hack",
    location: "Tempe, Arizona",
    canonicalUrl: `https://www.ohack.dev/hack/${event_id}/volunteer-application`,
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
            title: `Volunteer at ${eventData.title} | Support Tech for Good`,
            description: `Apply to volunteer at ${eventData.title} in ${eventData.location || "Tempe, Arizona"}. Help support teams building innovative tech solutions for nonprofits.`,
            eventName: eventData.title,
            location: eventData.location || "Tempe, Arizona",
            canonicalUrl: `https://www.ohack.dev/hack/${event_id}/volunteer-application`,
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

export default function VolunteerApplicationPageWithRecaptcha(props) {
  return (
    <ReCaptchaProvider>
      <VolunteerApplicationPage {...props} />
    </ReCaptchaProvider>
  );
}
