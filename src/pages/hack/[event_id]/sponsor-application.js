import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import ReCaptchaProvider from "../../../components/ReCaptchaProvider";
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
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Tooltip,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  FormGroup,
  useTheme,
  useMediaQuery,
  Link,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import InfoIcon from "@mui/icons-material/Info";
import UploadPhoto from "../../../components/UploadPhoto";
import Head from "next/head";
import Script from "next/script";
import { useEnv } from "../../../context/env.context";
import VolunteerCheckInQR from "../../../components/VolunteerCheckInQR";
import ApplicationNav from "../../../components/ApplicationNav/ApplicationNav";
import FormPersistenceControls from "../../../components/FormPersistenceControls";
import { useFormPersistence } from "../../../hooks/use-form-persistence";
import { useRecaptcha } from "../../../hooks/use-recaptcha";
import GiveButterWidget from "../../../components/GiveButterWidget";
import ReactMarkdown from "react-markdown";
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

// Sponsorship tiers - aligned with /sponsor page
const sponsorshipTiers = [
  {
    name: "Visionary",
    amount: "$10,000+",
    color: "#E1BEE7",
    benefits: [
      "Logo on website for 2 years",
      "6 social media promotion posts",
      "Booth at Sponsor Fair",
      "5-minute Opening/Closing Ceremony presentation",
      "3 judging panel seats",
      "Unlimited mentorship opportunities",
      "2 branded prize categories",
      "Premium logo on event t-shirts",
      "Access to participant resumes",
      "1-hour sponsored workshop/tech talk",
      "Pre, during & post-event recruiting/interviews",
    ],
  },
  {
    name: "Transformer",
    amount: "$5,000+",
    color: "#FFECB3",
    benefits: [
      "Logo on website for 1 year",
      "4 social media promotion posts",
      "Booth at Sponsor Fair",
      "2-minute Opening/Closing Ceremony presentation",
      "2 judging panel seats",
      "Unlimited mentorship opportunities",
      "1 branded prize category",
      "Large logo on event t-shirts",
      "Access to participant resumes",
      "30-minute sponsored workshop/tech talk",
      "During & post-event recruiting/interviews",
    ],
  },
  {
    name: "Changemaker",
    amount: "$2,500+",
    color: "#BBDEFB",
    benefits: [
      "Logo on website for 6 months",
      "2 social media promotion posts",
      "Booth at Sponsor Fair",
      "1-minute Opening/Closing Ceremony presentation",
      "1 judging panel seat",
      "Unlimited mentorship opportunities",
      "Medium logo on event t-shirts",
      "Post-event recruiting/interviews",
    ],
  },
  {
    name: "Innovator",
    amount: "$1,000+",
    color: "#C8E6C9",
    benefits: [
      "Logo on website for 3 months",
      "1 social media promotion post",
      "1 judging panel seat",
      "Unlimited mentorship opportunities",
      "Small logo on event t-shirts",
    ],
  },
  {
    name: "Custom Sponsorship",
    amount: "Contact Us",
    color: "#F5F5F5",
    benefits: [
      "Tailored package to meet your organization's specific goals and budget",
      "Flexible combination of benefits from all tiers",
      "Unique partnership opportunities based on your needs",
    ],
  },
];

// Volunteer role options
const volunteerRoleOptions = [
  {
    value: "mentoring",
    label: "Mentoring",
    description: "Assist teams with technical guidance and expertise",
  },
  {
    value: "judging",
    label: "Judging",
    description: "Evaluate final projects and provide feedback",
  },
  {
    value: "workshop",
    label: "Technical Workshop",
    description: "Host a workshop on a specific technology or skill",
  },
  {
    value: "prizes",
    label: "Prize Donation",
    description: "Provide prizes for winning teams or special categories",
  },
  {
    value: "other",
    label: "Other",
    description: "Other ways you'd like to contribute",
  },
];

// Helper function to extract sponsorship tier from details string
const getSponsorshipTierFromDetails = (details) => {
  if (!details) return "";

  const tierNames = sponsorshipTiers.map((tier) => tier.name);

  for (const tier of tierNames) {
    if (details.includes(tier)) return tier;
  }

  return "Custom Sponsorship"; // Default to custom if no match
};

const SponsorApplicationComponent = () => {
  const router = useRouter();
  const { event_id } = router.query;
  const { isLoggedIn, user, accessToken } = useAuthInfo();
  const { apiServerUrl } = useEnv();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Add the initialization ref at the top level
  const initializationRef = useRef(false);

  // Scroll target so step navigation lands on the step fields, not the page hero
  const stepContentRef = useRef(null);

  // Initial form state
  const initialFormData = {
    timestamp: new Date().toISOString(),
    email: "",
    company: "",
    useLogo: "Yes",
    phoneNumber: "",
    sponsorshipTier: "",
    customSponsorship: "",
    sponsorshipDetails: "",
    volunteerRoles: [],
    otherVolunteerRole: "",
    volunteerCount: "",
    volunteerHours: "",
    name: "",
    title: "",
    preferredContact: "email",
    howHeard: "",
    additionalNotes: "",
    event_id: event_id || "",
    isSelected: false,
  };

  // Form navigation state
  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [eventData, setEventData] = useState(null);
  // Store volunteer ID for QR code generation
  const [volunteerId, setVolunteerId] = useState(null);
  const [isSelected, setIsSelected] = useState(false);
  // Use ref to store uploaded logo URL to avoid race conditions
  const uploadedLogoUrlRef = useRef("");
  const [error, setError] = useState("");

  // Prevent duplicate confirmation dialogs
  const confirmationShownRef = useRef(false);

  // reCAPTCHA integration
  const {
    initializeRecaptcha,
    getRecaptchaToken,
    isLoading: recaptchaLoading,
    error: recaptchaError,
    setError: setRecaptchaError,
  } = useRecaptcha();

  // Steps for stepper
  const steps = ["Company Info", "Sponsorship", "Volunteering", "Finish"];

  // Form persistence hook - keeping dependencies minimal
  const hookConfig = {
    formType: "sponsor",
    eventId: event_id || "",
    userId: user?.userId || "",
    initialFormData,
    apiServerUrl: apiServerUrl || "",
    accessToken: accessToken || "",
  };

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
  } = useFormPersistence(hookConfig);

  // Fetch event data once when event_id is available
  useEffect(() => {
    // Initialize reCAPTCHA when component mounts
    initializeRecaptcha();

    if (!event_id || !apiServerUrl) return;

    const fetchEventData = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(
          `${apiServerUrl}/api/messages/hackathon/${event_id}`,
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch event data: ${response.status} ${response.statusText}`,
          );
        }

        const data = await response.json();

        if (!data || !data.start_date || !data.end_date) {
          throw new Error("Invalid event data received");
        }

        // Format dates for display
        const startDate = new Date(data.start_date);
        const endDate = new Date(data.end_date);

        // Use UTC methods to avoid timezone conversion issues
        const formattedStartDate = new Date(
          data.start_date + "T00:00:00Z",
        ).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: "UTC",
        });
        const formattedEndDate = new Date(
          data.end_date + "T00:00:00Z",
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
          name: data.title || `Opportunity Hack - ${event_id}`,
          description: data.description || "Annual hackathon for nonprofits",
          date: new Date(data.start_date).getFullYear().toString(),
          startDate: data.start_date,
          endDate: data.end_date,
          formattedStartDate,
          formattedEndDate,
          location: data.location || "Tempe, Arizona",
          image:
            data.image_url ||
            "https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp",
          isEventPast,
        });
      } catch (err) {
        console.error("Error fetching event data:", err);
        setError("Failed to load event data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [event_id, apiServerUrl, initializeRecaptcha]);

  // Update form data with event_id once it's available
  useEffect(() => {
    if (!event_id) return;

    setFormData((prev) => {
      // Only update if the event_id has changed to avoid loops
      if (prev.event_id !== event_id) {
        return { ...prev, event_id };
      }
      return prev;
    });
  }, [event_id, setFormData]);

  // Initialize form data once when dependencies are ready
  useEffect(() => {
    // Skip if any dependencies are missing or if loading is in progress
    if (!event_id || !user || isLoading || initializationRef.current) return;

    // Initialize form data once
    const initFormData = async () => {
      try {
        initializationRef.current = true;

        // Pre-fill with user information if logged in
        setFormData((prevData) => ({
          ...prevData,
          email: user.email || prevData.email,
          name:
            user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : user.username || prevData.name,
        }));

        // Check for previous submission if user is logged in with access token
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
                const volunteerRolesArray = prevData.volunteerType
                  ? prevData.volunteerType.split(", ").map((role) => {
                      // Check if this is a custom role or a predefined one
                      const matchedPredefined = volunteerRoleOptions.find(
                        (opt) => opt.label.toLowerCase() === role.toLowerCase(),
                      );

                      if (matchedPredefined) return matchedPredefined.value;
                      return "other"; // If no match, assume it's a custom role
                    })
                  : [];

                // Extract "other" role if present
                let otherRole = "";
                if (
                  prevData.volunteerType &&
                  !volunteerRoleOptions.some((opt) =>
                    prevData.volunteerType.includes(opt.label),
                  )
                ) {
                  otherRole = prevData.volunteerType;
                }

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
                  company: prevData.company || prevData.companyName || "",
                  useLogo: prevData.useLogo || "Yes",
                  phoneNumber: prevData.phoneNumber || "",
                  sponsorshipTier: getSponsorshipTierFromDetails(
                    prevData.sponsorshipTypes || "",
                  ),
                  customSponsorship:
                    prevData.sponsorshipTier === "Custom Sponsorship"
                      ? prevData.sponsorshipDetails || ""
                      : "",
                  sponsorshipDetails: prevData.sponsorshipDetails || "",
                  volunteerRoles: volunteerRolesArray,
                  otherVolunteerRole: otherRole,
                  volunteerCount: prevData.volunteerCount || "",
                  volunteerHours: prevData.volunteerHours || "",
                  title: prevData.title || "",
                  preferredContact: prevData.preferredContact || "email",
                  howHeard: prevData.howHeard || "",
                  additionalNotes:
                    prevData.additionalNotes || prevData.otherInvolvement || "",
                  event_id,
                };

                setFormData(transformedData);

                // If there's a logo URL, set it in the ref
                if (prevData.photoUrl || prevData.logoUrl) {
                  uploadedLogoUrlRef.current =
                    prevData.photoUrl || prevData.logoUrl;
                }

                return;
              }
            }
          } catch (err) {
            console.error("Error loading previous submission:", err);
          }
        }

        // If no previous submission or user declined to load it, try localStorage
        loadFromLocalStorage();
      } catch (err) {
        console.error("Error initializing form data:", err);
      }
    };

    initFormData();
  }, [
    user,
    accessToken,
    event_id,
    loadPreviousSubmission,
    loadFromLocalStorage,
    setFormData,
    isLoading,
  ]);

  // Handle checkbox changes separately to avoid re-renders with form data
  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;

      if (type === "checkbox") {
        // Handle checkbox for volunteer roles
        if (name.startsWith("volunteerRole-")) {
          const role = name.replace("volunteerRole-", "");

          setFormData((prev) => {
            const updatedRoles = checked
              ? [...prev.volunteerRoles, role]
              : prev.volunteerRoles.filter((r) => r !== role);

            return {
              ...prev,
              volunteerRoles: updatedRoles,
            };
          });
        } else {
          handleFormChange(e);
        }
      } else {
        handleFormChange(e);
      }
    },
    [handleFormChange, setFormData],
  );

  const handleLogoUpload = useCallback(
    (logoUrl) => {
      // Store in ref to avoid race conditions
      uploadedLogoUrlRef.current = logoUrl;
      // Update form data
      setFormData((prev) => ({
        ...prev,
        photoUrl: logoUrl,
        logoUrl: logoUrl,
      }));
      console.log("Logo URL saved to form and ref:", logoUrl);
    },
    [setFormData],
  );

  const handleLogoError = useCallback(
    (errorMessage) => {
      setError(errorMessage);
      // Clear the uploaded logo URL
      uploadedLogoUrlRef.current = "";
      setFormData((prev) => ({
        ...prev,
        photoUrl: "",
        logoUrl: "",
      }));
    },
    [setFormData],
  );

  // Validation functions
  const validateCompanyInfo = useCallback(() => {
    if (!formData.email) {
      setError("Please enter your email address");
      return false;
    }

    if (!formData.company) {
      setError("Please enter your company name");
      return false;
    }

    if (!formData.name) {
      setError("Please enter your name");
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    // Phone number validation (if provided)
    if (formData.phoneNumber) {
      const phoneRegex =
        /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
      if (!phoneRegex.test(formData.phoneNumber)) {
        setError("Please enter a valid phone number");
        return false;
      }
    }

    setError("");
    return true;
  }, [formData]);

  const validateSponsorshipInfo = useCallback(() => {
    if (!formData.sponsorshipTier) {
      setError("Please select a sponsorship tier");
      return false;
    }

    if (
      formData.sponsorshipTier === "Custom Sponsorship" &&
      !formData.customSponsorship
    ) {
      setError("Please provide details for your custom sponsorship");
      return false;
    }

    setError("");
    return true;
  }, [formData]);

  const validateVolunteerInfo = useCallback(() => {
    // Volunteer info is optional, so just check for valid numbers
    if (
      formData.volunteerCount &&
      (isNaN(formData.volunteerCount) || parseInt(formData.volunteerCount) < 0)
    ) {
      setError("Please enter a valid number of volunteers");
      return false;
    }

    if (
      formData.volunteerHours &&
      (isNaN(formData.volunteerHours) || parseInt(formData.volunteerHours) < 0)
    ) {
      setError("Please enter a valid number of volunteer hours");
      return false;
    }

    if (
      formData.volunteerRoles.includes("other") &&
      !formData.otherVolunteerRole
    ) {
      setError("Please specify your other volunteer role");
      return false;
    }

    setError("");
    return true;
  }, [formData]);

  const validateForm = useCallback(() => {
    return (
      validateCompanyInfo() &&
      validateSponsorshipInfo() &&
      validateVolunteerInfo()
    );
  }, [validateCompanyInfo, validateSponsorshipInfo, validateVolunteerInfo]);

  // Form submission - Define this BEFORE handleNext
  const handleSubmit = useCallback(
    async (e) => {
      if (e) e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setSubmitting(true);
      setError("");

      try {
        // Get reCAPTCHA token
        const recaptchaToken = await getRecaptchaToken();

        // Handling token retrieval failure
        if (!recaptchaToken && process.env.NODE_ENV === "production") {
          setError(
            "Failed to verify you are human. Please refresh the page and try again.",
          );
          return;
        }

        // Prepare submission data
        const sponsorshipDetails =
          formData.sponsorshipTier === "Custom Sponsorship"
            ? formData.customSponsorship
            : formData.sponsorshipDetails;

        const volunteerType =
          formData.volunteerRoles.length > 0
            ? formData.volunteerRoles
                .map((role) => {
                  if (role === "other") return formData.otherVolunteerRole;
                  return (
                    volunteerRoleOptions.find((option) => option.value === role)
                      ?.label || role
                  );
                })
                .join(", ")
            : "";

        // Combine data for API submission
        const submissionData = {
          timestamp: new Date().toISOString(),
          email: formData.email,
          company: formData.company,
          companyName: formData.company, // Add mapping for companyName
          useLogo: formData.useLogo,
          phoneNumber: formData.phoneNumber,
          sponsorshipTypes: `${formData.sponsorshipTier} - ${sponsorshipDetails}`,
          otherInvolvement: formData.additionalNotes,
          volunteerType,
          volunteerCount: formData.volunteerCount,
          volunteerHours: formData.volunteerHours,
          name: formData.name,
          title: formData.title,
          event_id,
          preferredContact: formData.preferredContact,
          howHeard: formData.howHeard,
          logoFile: uploadedLogoUrlRef.current ? "uploaded" : null,
          photoUrl:
            uploadedLogoUrlRef.current ||
            formData.logoUrl ||
            formData.photoUrl ||
            "", // Map logo to photoUrl for consistency
          type: "sponsors",
          volunteer_type: "sponsor",
          isSelected: false,
          logoUrl:
            uploadedLogoUrlRef.current ||
            formData.logoUrl ||
            formData.photoUrl ||
            "",
          recaptchaToken,
        };

        if (apiServerUrl && accessToken) {
          // Submit to API
          const submitEndpoint = previouslySubmitted
            ? `${apiServerUrl}/api/sponsor/application/${event_id}/update`
            : `${apiServerUrl}/api/sponsor/application/${event_id}/submit`;

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
            throw new Error(
              `Failed to submit application: ${response.status}${errorData ? ` - ${errorData.message}` : ""}`,
            );
          }

          // Extract volunteer ID from response for QR code generation
          const responseData = await response.json().catch(() => null);
          if (responseData?.volunteer_id || responseData?.id) {
            setVolunteerId(responseData.volunteer_id || responseData.id);
          }
        } else {
          // In a test environment or when API isn't available
          console.log("Submitting sponsor application:", submissionData);
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
        // Scroll to top of form to show "Application Submitted!" message
        if (formRef?.current) {
          formRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      } catch (err) {
        console.error("Error submitting application:", err);
        setError(
          `Failed to submit your application. ${err.message || "Please try again."}`,
        );
      } finally {
        setSubmitting(false);
      }
    },
    [
      formData,
      validateForm,
      apiServerUrl,
      accessToken,
      event_id,
      previouslySubmitted,
      clearSavedData,
      getRecaptchaToken,
    ],
  );

  // Navigation handlers - Now define these AFTER handleSubmit
  const handleNext = useCallback(() => {
    if (activeStep === 0 && !validateCompanyInfo()) return;
    if (activeStep === 1 && !validateSponsorshipInfo()) return;
    if (activeStep === 2 && !validateVolunteerInfo()) return;

    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep((prev) => prev + 1);
      // Bring the new step's fields into view (not the page hero)
      requestAnimationFrame(() => {
        stepContentRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  }, [
    activeStep,
    steps.length,
    validateCompanyInfo,
    validateSponsorshipInfo,
    validateVolunteerInfo,
    handleSubmit,
  ]);

  const handleBack = useCallback(() => {
    setActiveStep((prev) => Math.max(0, prev - 1));
    // Bring the new step's fields into view (not the page hero)
    requestAnimationFrame(() => {
      stepContentRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, []);

  // Company Information Form
  const renderBasicInfoForm = useCallback(
    () => (
      <Box>
        <Box sx={{ mb: 3 }}>
          <Eyebrow>Step 1</Eyebrow>
          <Typography component="h2" sx={stepTitleSx}>
            Company information
          </Typography>
          <Typography variant="body1" sx={stepLeadSx}>
            Tell us about your organization so we can route your application and
            follow up with the right person.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Email Address"
              name="email"
              type="email"
              required
              fullWidth
              value={formData.email || ""}
              onChange={handleChange}
              error={typeof error === "string" && error.includes("email")}
              sx={refinedFieldSx}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Phone Number (Optional)"
              name="phoneNumber"
              fullWidth
              value={formData.phoneNumber || ""}
              onChange={handleChange}
              error={typeof error === "string" && error.includes("phone")}
              helperText="We'll only call if urgent"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Format: (123) 456-7890">
                      <IconButton edge="end">
                        <HelpOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
              sx={refinedFieldSx}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              label="Company Name"
              name="company"
              required
              fullWidth
              value={formData.company || ""}
              onChange={handleChange}
              error={typeof error === "string" && error.includes("company")}
              sx={refinedFieldSx}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Your Name"
              name="name"
              required
              fullWidth
              value={formData.name || ""}
              onChange={handleChange}
              error={typeof error === "string" && error.includes("name")}
              sx={refinedFieldSx}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Your Title"
              name="title"
              fullWidth
              value={formData.title || ""}
              onChange={handleChange}
              placeholder="e.g., Director of Community Engagement"
              sx={refinedFieldSx}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth sx={refinedFieldSx}>
              <InputLabel>Preferred Contact Method</InputLabel>
              <Select
                name="preferredContact"
                value={formData.preferredContact || "email"}
                onChange={handleChange}
                label="Preferred Contact Method"
                MenuProps={refinedSelectMenuProps}
              >
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="phone">Phone</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="How did you hear about us?"
              name="howHeard"
              fullWidth
              value={formData.howHeard || ""}
              onChange={handleChange}
              placeholder="e.g., Social media, referral, etc."
              sx={refinedFieldSx}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box sx={{ mt: 1, mb: 1 }}>
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ color: "var(--ink)", fontWeight: 600 }}
              >
                Company Logo (Optional)
              </Typography>

              <FormControl fullWidth sx={{ ...refinedFieldSx, mb: 1 }}>
                <Select
                  name="useLogo"
                  value={formData.useLogo || "Yes"}
                  onChange={handleChange}
                  displayEmpty
                  MenuProps={refinedSelectMenuProps}
                >
                  <MenuItem value="Yes">Yes, you can use our logo</MenuItem>
                  <MenuItem value="No">No, please don't use our logo</MenuItem>
                  <MenuItem value="Not sure">Not sure yet</MenuItem>
                </Select>
                <FormHelperText>
                  Can we use your company logo for promotional materials?
                </FormHelperText>
              </FormControl>

              {formData.useLogo === "Yes" && (
                <Box sx={{ mt: 2 }}>
                  <UploadPhoto
                    value={formData.logoUrl || formData.photoUrl || ""}
                    onChange={handleLogoUpload}
                    onError={handleLogoError}
                    label="Upload Company Logo"
                    helperText="Recommended: High-resolution PNG or SVG with transparent background"
                    directory="sponsors"
                    apiServerUrl={apiServerUrl}
                    accessToken={accessToken}
                    orgId={user?.orgId}
                    userId={user?.userId}
                    accept="image/*"
                    allowedTypes={[
                      "image/jpeg",
                      "image/jpg",
                      "image/png",
                      "image/gif",
                      "image/svg+xml",
                    ]}
                    sx={refinedFieldSx}
                  />
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
    ),
    [formData, error, handleChange],
  );

  // Sponsorship Form
  const renderSponsorshipForm = useCallback(
    () => (
      <Box>
        <Box sx={{ mb: 3 }}>
          <Eyebrow>Step 2</Eyebrow>
          <Typography component="h2" sx={stepTitleSx}>
            Choose your sponsorship level
          </Typography>
          <Typography variant="body1" sx={stepLeadSx}>
            Select the tier that fits your organization's goals. Every level
            puts your engineers in the room to mentor, judge, and meet the
            builders you might want to hire.
          </Typography>
        </Box>

        {/* Value Proposition Alert */}
        <Alert severity="info" sx={{ ...infoAlertSx, mb: 3 }}>
          <Typography variant="body2">
            <strong>💡 Maximum Impact:</strong> Higher tiers provide
            exponentially more value through extended website presence, social
            media reach, and direct access to top tech talent for recruiting.
          </Typography>
        </Alert>

        <Grid container spacing={3}>
          {sponsorshipTiers.map((tier) => {
            const isTierSelected = formData.sponsorshipTier === tier.name;
            const isPopular = tier.name === "Transformer"; // Mark Transformer as popular choice
            const isCustom = tier.name === "Custom Sponsorship";

            return (
              <Grid size={{ xs: 12, md: isCustom ? 12 : 6 }} key={tier.name}>
                <Box
                  onClick={() =>
                    handleChange({
                      target: { name: "sponsorshipTier", value: tier.name },
                    })
                  }
                  className="ohx-card"
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    p: { xs: 2.5, md: 3 },
                    cursor: "pointer",
                    borderWidth: isTierSelected ? 2 : 1,
                    borderStyle: "solid",
                    borderColor: isTierSelected
                      ? "var(--brand)"
                      : "var(--line)",
                    backgroundColor: isTierSelected
                      ? "rgba(27,58,107,0.05)"
                      : "var(--surface)",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography
                      component="h3"
                      sx={{ ...stepTitleSx, fontSize: "1.3rem", mb: 0 }}
                    >
                      {tier.name}
                    </Typography>
                    <Chip
                      label={tier.amount}
                      sx={{
                        ...refinedChipSx,
                        fontWeight: 700,
                        ...(isTierSelected && {
                          bgcolor: "var(--brand)",
                          color: "#fff",
                          borderColor: "var(--brand)",
                        }),
                      }}
                    />
                  </Box>

                  {/* Popular Badge */}
                  {isPopular && (
                    <span
                      className="ohx-tag ohx-tag--accent"
                      style={{ marginTop: 12, alignSelf: "flex-start" }}
                    >
                      ⭐ Most popular
                    </span>
                  )}

                  <Box component="hr" className="ohx-rule" sx={{ my: 2.25 }} />

                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, color: "var(--ink)", mb: 1 }}
                  >
                    Your Benefits & Impact:
                  </Typography>

                  <Box
                    component="ul"
                    sx={{
                      paddingLeft: "20px",
                      margin: 0,
                      mb: 2,
                      "& li": {
                        marginBottom: "8px",
                        "&::marker": {
                          color: "var(--brand)",
                        },
                      },
                    }}
                  >
                    {tier.benefits.map((benefit, idx) => (
                      <li key={idx}>
                        <Typography
                          variant="body2"
                          sx={{ lineHeight: 1.55, color: "var(--muted)" }}
                        >
                          {benefit}
                        </Typography>
                      </li>
                    ))}
                  </Box>

                  {/* Social Proof for Higher Tiers */}
                  {tier.name === "Visionary" && (
                    <Box
                      sx={{
                        mt: "auto",
                        p: 1.5,
                        borderRadius: 2,
                        border: "1px solid var(--line)",
                        backgroundColor: "var(--surface-2)",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ fontStyle: "italic", color: "var(--muted)" }}
                      >
                        "As a Visionary sponsor, we've hired 3 amazing
                        developers directly from Opportunity Hack events." -
                        PayPal Employee
                      </Typography>
                    </Box>
                  )}

                  {tier.name === "Transformer" && (
                    <Box
                      sx={{
                        mt: "auto",
                        p: 1.5,
                        borderRadius: 2,
                        border: "1px solid var(--line)",
                        backgroundColor: "var(--surface-2)",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ fontStyle: "italic", color: "var(--muted)" }}
                      >
                        🔥 Perfect balance of visibility and value - chosen by
                        60% of our returning sponsors
                      </Typography>
                    </Box>
                  )}

                  <Button
                    fullWidth
                    variant={isTierSelected ? "contained" : "outlined"}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChange({
                        target: { name: "sponsorshipTier", value: tier.name },
                      });
                    }}
                    sx={{
                      mt: 2,
                      ...(isTierSelected ? primaryButtonSx : ghostButtonSx),
                    }}
                  >
                    {isTierSelected ? "✓ Selected" : `Choose ${tier.name}`}
                  </Button>
                </Box>
              </Grid>
            );
          })}
        </Grid>

        {formData.sponsorshipTier === "Custom Sponsorship" && (
          <Box sx={{ mt: 4 }}>
            <Alert severity="success" sx={{ ...successAlertSx, mb: 2 }}>
              <Typography variant="body2">
                <strong>Custom Sponsorship Selected!</strong> We'll work with
                you to create a tailored package that maximizes your impact and
                ROI.
              </Typography>
            </Alert>
            <TextField
              label="Describe your custom sponsorship vision"
              name="customSponsorship"
              multiline
              rows={4}
              fullWidth
              value={formData.customSponsorship || ""}
              onChange={handleChange}
              error={typeof error === "string" && error.includes("custom")}
              helperText="Share your budget range, specific goals, target audience, or unique partnership ideas. The more details you provide, the better we can tailor your sponsorship package."
              sx={{ ...refinedFieldSx, mb: 2 }}
            />
          </Box>
        )}

        <Box sx={{ mt: 4 }}>
          <TextField
            label="Additional Partnership Goals & Details (Optional)"
            name="sponsorshipDetails"
            multiline
            rows={3}
            fullWidth
            value={formData.sponsorshipDetails || ""}
            onChange={handleChange}
            helperText="Any specific recruitment needs, technical areas of interest, or special requests for your sponsorship experience"
            sx={refinedFieldSx}
          />
        </Box>

        {/* Benefits Summary for Selected Tier */}
        {formData.sponsorshipTier &&
          formData.sponsorshipTier !== "Custom Sponsorship" && (
            <Box sx={{ ...emphasisPanelSx, mt: 3 }}>
              <Typography
                component="h3"
                sx={{ ...stepTitleSx, fontSize: "1.2rem", mb: 1 }}
              >
                🎯 {formData.sponsorshipTier} Sponsorship
              </Typography>
              <Typography sx={{ color: "var(--muted)", lineHeight: 1.7 }}>
                Thank you for choosing the {formData.sponsorshipTier} tier! Your
                sponsorship will directly enable us to provide better resources
                for participants, attract more high-quality talent, and create
                more impactful solutions for nonprofits.
              </Typography>
            </Box>
          )}
      </Box>
    ),
    [formData, error, handleChange],
  );

  // Volunteering Form
  const renderVolunteeringForm = useCallback(
    () => (
      <Box>
        <Box sx={{ mb: 3 }}>
          <Eyebrow>Step 3</Eyebrow>
          <Typography component="h2" sx={stepTitleSx}>
            Volunteering opportunities
          </Typography>
          <Typography variant="body1" sx={stepLeadSx}>
            Many sponsors also contribute through volunteering. If you're
            interested in getting your team involved, let us know how you'd like
            to help.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography
            variant="subtitle1"
            gutterBottom
            sx={{ color: "var(--ink)", fontWeight: 600 }}
          >
            How would you like to volunteer? (Select all that apply)
          </Typography>

          <FormGroup>
            {volunteerRoleOptions.map((role) => (
              <FormControlLabel
                key={role.value}
                control={
                  <Checkbox
                    checked={
                      formData.volunteerRoles?.includes(role.value) || false
                    }
                    onChange={handleChange}
                    name={`volunteerRole-${role.value}`}
                    sx={refinedChoiceSx}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ color: "var(--ink)" }}>
                      {role.label}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "var(--muted)" }}
                    >
                      {role.description}
                    </Typography>
                  </Box>
                }
              />
            ))}
          </FormGroup>

          {formData.volunteerRoles?.includes("other") && (
            <TextField
              label="Specify other volunteer role"
              name="otherVolunteerRole"
              fullWidth
              value={formData.otherVolunteerRole || ""}
              onChange={handleChange}
              error={
                typeof error === "string" && error.includes("other volunteer")
              }
              sx={{ ...refinedFieldSx, mt: 2 }}
            />
          )}
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="How many people do you expect to volunteer?"
              name="volunteerCount"
              type="number"
              fullWidth
              value={formData.volunteerCount || ""}
              onChange={handleChange}
              error={typeof error === "string" && error.includes("volunteers")}
              InputProps={{
                inputProps: { min: 0 },
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Estimate of how many employees will participate">
                      <IconButton edge="end">
                        <HelpOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
              sx={refinedFieldSx}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="How many hours total do you expect to volunteer?"
              name="volunteerHours"
              type="number"
              fullWidth
              value={formData.volunteerHours || ""}
              onChange={handleChange}
              error={typeof error === "string" && error.includes("hours")}
              InputProps={{
                inputProps: { min: 0 },
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Total hours across all volunteers">
                      <IconButton edge="end">
                        <HelpOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
              sx={refinedFieldSx}
            />
          </Grid>
        </Grid>
      </Box>
    ),
    [formData, error, handleChange],
  );

  // Final Review Form
  const renderReviewForm = useCallback(
    () => (
      <Box>
        <Box sx={{ mb: 3 }}>
          <Eyebrow>Step 4</Eyebrow>
          <Typography component="h2" sx={stepTitleSx}>
            Review and submit
          </Typography>
          <Typography variant="body1" sx={stepLeadSx}>
            One last look before you send it. Confirm the details below, add any
            final notes, and submit for our team to follow up.
          </Typography>
        </Box>

        <Box className="ohx-card" sx={{ p: 3, mb: 3 }}>
          <Typography
            variant="subtitle1"
            gutterBottom
            sx={{ fontWeight: 700, color: "var(--ink)" }}
          >
            Company Information
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 4 }}>
              <Typography variant="body2" sx={{ color: "var(--muted)" }}>
                Company:
              </Typography>
            </Grid>
            <Grid size={{ xs: 8 }}>
              <Typography variant="body2" sx={{ color: "var(--ink)" }}>
                {formData.company || "Not provided"}
              </Typography>
            </Grid>

            <Grid size={{ xs: 4 }}>
              <Typography variant="body2" sx={{ color: "var(--muted)" }}>
                Contact:
              </Typography>
            </Grid>
            <Grid size={{ xs: 8 }}>
              <Typography variant="body2" sx={{ color: "var(--ink)" }}>
                {formData.name || "Not provided"}
              </Typography>
            </Grid>

            <Grid size={{ xs: 4 }}>
              <Typography variant="body2" sx={{ color: "var(--muted)" }}>
                Title:
              </Typography>
            </Grid>
            <Grid size={{ xs: 8 }}>
              <Typography variant="body2" sx={{ color: "var(--ink)" }}>
                {formData.title || "Not provided"}
              </Typography>
            </Grid>

            <Grid size={{ xs: 4 }}>
              <Typography variant="body2" sx={{ color: "var(--muted)" }}>
                Email:
              </Typography>
            </Grid>
            <Grid size={{ xs: 8 }}>
              <Typography variant="body2" sx={{ color: "var(--ink)" }}>
                {formData.email || "Not provided"}
              </Typography>
            </Grid>

            <Grid size={{ xs: 4 }}>
              <Typography variant="body2" sx={{ color: "var(--muted)" }}>
                Phone:
              </Typography>
            </Grid>
            <Grid size={{ xs: 8 }}>
              <Typography variant="body2" sx={{ color: "var(--ink)" }}>
                {formData.phoneNumber || "Not provided"}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Box className="ohx-card" sx={{ p: 3, mb: 3 }}>
          <Typography
            variant="subtitle1"
            gutterBottom
            sx={{ fontWeight: 700, color: "var(--ink)" }}
          >
            Sponsorship Details
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 4 }}>
              <Typography variant="body2" sx={{ color: "var(--muted)" }}>
                Sponsorship Tier:
              </Typography>
            </Grid>
            <Grid size={{ xs: 8 }}>
              <Typography variant="body2" sx={{ color: "var(--ink)" }}>
                {formData.sponsorshipTier || "Not selected"}
              </Typography>
            </Grid>

            {formData.sponsorshipTier === "Custom Sponsorship" && (
              <>
                <Grid size={{ xs: 4 }}>
                  <Typography variant="body2" sx={{ color: "var(--muted)" }}>
                    Custom Details:
                  </Typography>
                </Grid>
                <Grid size={{ xs: 8 }}>
                  <Typography variant="body2" sx={{ color: "var(--ink)" }}>
                    {formData.customSponsorship || "Not provided"}
                  </Typography>
                </Grid>
              </>
            )}

            {formData.sponsorshipDetails && (
              <>
                <Grid size={{ xs: 4 }}>
                  <Typography variant="body2" sx={{ color: "var(--muted)" }}>
                    Additional Details:
                  </Typography>
                </Grid>
                <Grid size={{ xs: 8 }}>
                  <Typography variant="body2" sx={{ color: "var(--ink)" }}>
                    {formData.sponsorshipDetails}
                  </Typography>
                </Grid>
              </>
            )}

            <Grid size={{ xs: 4 }}>
              <Typography variant="body2" sx={{ color: "var(--muted)" }}>
                Logo Usage:
              </Typography>
            </Grid>
            <Grid size={{ xs: 8 }}>
              <Typography variant="body2" sx={{ color: "var(--ink)" }}>
                {formData.useLogo || "Not specified"}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {(formData.volunteerRoles?.length > 0 ||
          formData.volunteerCount ||
          formData.volunteerHours) && (
          <Box className="ohx-card" sx={{ p: 3, mb: 3 }}>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ fontWeight: 700, color: "var(--ink)" }}
            >
              Volunteering Information
            </Typography>

            <Grid container spacing={2}>
              {formData.volunteerRoles?.length > 0 && (
                <>
                  <Grid size={{ xs: 4 }}>
                    <Typography variant="body2" sx={{ color: "var(--muted)" }}>
                      Volunteer Roles:
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 8 }}>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {formData.volunteerRoles.map((role) => (
                        <Chip
                          key={role}
                          label={
                            role === "other"
                              ? formData.otherVolunteerRole
                              : volunteerRoleOptions.find(
                                  (opt) => opt.value === role,
                                )?.label
                          }
                          size="small"
                          sx={{ ...refinedChipSx, mb: 1, mr: 1 }}
                        />
                      ))}
                    </Box>
                  </Grid>
                </>
              )}

              {formData.volunteerCount && (
                <>
                  <Grid size={{ xs: 4 }}>
                    <Typography variant="body2" sx={{ color: "var(--muted)" }}>
                      Volunteer Count:
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 8 }}>
                    <Typography variant="body2" sx={{ color: "var(--ink)" }}>
                      {formData.volunteerCount} people
                    </Typography>
                  </Grid>
                </>
              )}

              {formData.volunteerHours && (
                <>
                  <Grid size={{ xs: 4 }}>
                    <Typography variant="body2" sx={{ color: "var(--muted)" }}>
                      Volunteer Hours:
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 8 }}>
                    <Typography variant="body2" sx={{ color: "var(--ink)" }}>
                      {formData.volunteerHours} hours
                    </Typography>
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        )}

        <TextField
          label="Any additional notes or questions?"
          name="additionalNotes"
          multiline
          rows={3}
          fullWidth
          value={formData.additionalNotes || ""}
          onChange={handleChange}
          sx={{ ...refinedFieldSx, mb: 1 }}
        />

        <Alert severity="info" sx={{ ...infoAlertSx, mb: 3 }}>
          <Typography variant="body2">
            By submitting this form, you're expressing interest in sponsoring
            Opportunity Hack. Our team will contact you within 2-3 business days
            to discuss next steps and finalize details.
          </Typography>
        </Alert>
      </Box>
    ),
    [formData, handleChange],
  );

  // Function to render the current step form
  const getStepContent = useCallback(
    (step) => {
      switch (step) {
        case 0:
          return renderBasicInfoForm();
        case 1:
          return renderSponsorshipForm();
        case 2:
          return renderVolunteeringForm();
        case 3:
          return renderReviewForm();
        default:
          return "Unknown step";
      }
    },
    [
      renderBasicInfoForm,
      renderSponsorshipForm,
      renderVolunteeringForm,
      renderReviewForm,
    ],
  );

  // Enhanced SEO metadata and descriptions
  const pageTitle = eventData
    ? `Sponsor ${eventData.name} | Support Tech for Good Hackathon in ${eventData.location}`
    : "Sponsor Opportunity Hack | Support Tech for Good Hackathon";
  const pageDescription = eventData
    ? `Sponsor ${eventData.name} in ${eventData.location} from ${eventData.formattedStartDate} to ${eventData.formattedEndDate}. Support developers creating technology solutions for nonprofits. Join leading companies making a real impact through tech sponsorship. Multiple sponsorship tiers available.`
    : "Sponsor Opportunity Hack hackathon! Support developers creating technology solutions for nonprofits. Join leading companies making a real impact through tech sponsorship. Choose from multiple sponsorship tiers to fit your budget and goals.";
  const canonicalUrl = `https://www.ohack.dev/hack/${event_id}/sponsor-application`;

  const imageUrl = "https://cdn.ohack.dev/ohack.dev/2023_hackathon_5.webp";

  // Structured data for sponsor application
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
          sponsor: {
            "@type": "Organization",
            name: "Corporate Sponsors",
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
              name: "Sponsor Application",
              item: canonicalUrl,
            },
          ],
        },
      }
    : null;

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
                Thank you for your interest in sponsoring Opportunity Hack.
              </p>
            </div>

            <Box className="ohx-card" sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
              <Alert severity="success" sx={{ ...successAlertSx, mb: 4 }}>
                <Typography variant="body1">
                  Thank you for your interest in sponsoring Opportunity Hack.
                  Our team will review your application and contact you within
                  2-3 business days.
                </Typography>
              </Alert>

              <Box sx={{ mb: 4, display: "flex", justifyContent: "center" }}>
                <GiveButterWidget
                  context="success"
                  userId={user?.userId}
                  applicationType="sponsor"
                  size="large"
                  onDonationEvent={(eventData) => {
                    // Track sponsor application donations
                    console.log("Sponsor donation event:", eventData);
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
  };

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
            content={`hackathon sponsor, sponsorship application, tech for good, nonprofit hackathon, opportunity hack, corporate sponsorship, volunteer, tech sponsorship, ${eventData?.name || "hackathon"}, ${eventData?.location || "tech event"}, corporate social responsibility, tech investment, brand visibility`}
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
            content="Sponsors engaging with participants at Opportunity Hack hackathon"
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
            content="Sponsors engaging with participants at Opportunity Hack hackathon"
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
            id="sponsor-application-structured-data"
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
                    ? `${eventData.name} · sponsor application`
                    : "Sponsor application"}
                </Eyebrow>
                <h1 className="ohx-display" style={{ marginTop: 8 }}>
                  Fund the weekend that{" "}
                  <span className="ohx-italic">ships real software.</span>
                </h1>
                <p className="ohx-lead" style={{ marginTop: 16 }}>
                  Your sponsorship covers the venue, food, and support behind a
                  weekend where volunteer engineers turn ideas into working
                  software for nonprofits — and puts your own team in the room
                  to mentor, judge, and meet the builders you'd want to hire.
                  This application covers your company details, sponsorship
                  tier, and how you'd like to get involved.
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
                    <Stat
                      value={String(sponsorshipTiers.length)}
                      label="sponsorship tiers"
                    />
                  </Box>
                  <Box className="ohx-card" sx={{ p: 2.5 }}>
                    <Stat value="2-3 days" label="response time" />
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
                    src="https://cdn.ohack.dev/ohack.dev/2023_hackathon_5.webp"
                    alt="Sponsors engaging with participants at Opportunity Hack"
                    fill
                    sizes="(max-width: 1200px) 100vw, 320px"
                    style={{ objectFit: "cover" }}
                  />
                </Box>
                <Typography
                  variant="body1"
                  sx={{ color: "var(--muted)", lineHeight: 1.7, mb: 1.5 }}
                >
                  The sponsors who get the most out of Opportunity Hack send
                  engineers to mentor and judge, not just a logo. That's where
                  the best conversations — and the best candidates — show up.
                </Typography>
                <Link
                  href="/sponsor"
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
                  Read the sponsor guide <Arrow />
                </Link>
              </Box>
            </Box>

            <Box sx={{ mb: 2.5 }}>
              <ApplicationNav eventId={event_id} currentType="sponsor" />
            </Box>

            {Boolean(volunteerId) && isSelected && (
              <Box className="ohx-card" sx={{ p: 3, mb: 3, maxWidth: 560 }}>
                <Eyebrow>Check-in</Eyebrow>
                <VolunteerCheckInQR
                  eventId={event_id}
                  volunteerId={volunteerId}
                  isSelected={isSelected}
                  volunteerType="sponsor"
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
                        Applications are no longer being accepted for sponsors
                        as this hackathon has already concluded. Please check
                        our upcoming events for future sponsorship
                        opportunities.
                      </Typography>
                    </Alert>

                    <Box
                      sx={{ mb: 4, display: "flex", justifyContent: "center" }}
                    >
                      <GiveButterWidget
                        context="event-ended"
                        userId={user?.userId}
                        applicationType="sponsor"
                        size="large"
                        onDonationEvent={(eventData) => {
                          // Track sponsor application donations when event ended
                          console.log(
                            "Event ended sponsor donation event:",
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
                    <Alert
                      severity="info"
                      icon={<InfoIcon />}
                      sx={{ ...infoAlertSx, mb: 4 }}
                    >
                      <Typography variant="body1">
                        By sponsoring Opportunity Hack, you help develop
                        real-world tech solutions for nonprofits while
                        connecting with top talent. Your support directly
                        impacts communities in need.
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Link
                          href="/sponsor"
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            ...refinedInlineLinkSx,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          Learn more about sponsor benefits and impact{" "}
                          <InfoIcon fontSize="small" />
                        </Link>
                      </Box>
                    </Alert>

                    <Box
                      className="ohx-card"
                      sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}
                    >
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
                                "Submit"
                              )
                            ) : (
                              "Next"
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
const SponsorApplicationPage = ({ seoMetadata }) => {
  const router = useRouter();
  const { event_id } = router.query;

  // Create the current URL for redirection
  const currentUrl =
    typeof window !== "undefined" && event_id
      ? `${window.location.origin}/hack/${event_id}/sponsor-application`
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
          content="hackathon sponsor, sponsor application, tech for good, nonprofit hackathon, opportunity hack, corporate sponsorship, social impact"
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
          content="Sponsors supporting tech for good at Opportunity Hack"
        />
        <meta property="og:site_name" content="Opportunity Hack" />

        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoMetadata.title} />
        <meta name="twitter:description" content={seoMetadata.description} />
        <meta name="twitter:image" content={seoMetadata.imageUrl} />
        <meta
          name="twitter:image:alt"
          content="Sponsors supporting tech for good at Opportunity Hack"
        />

        {/* Additional SEO meta tags */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Opportunity Hack" />
        <meta name="theme-color" content="#1B3A6B" />
      </Head>

      {/* Structured Data for SEO */}
      <Script
        id="sponsor-application-structured-data-seo"
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
                  name: "Sponsor Application",
                  item: seoMetadata.canonicalUrl,
                },
              ],
            },
            mainEntity: {
              "@type": "Event",
              name: seoMetadata.eventName,
              description:
                "Support our hackathon to help innovators build tech solutions for nonprofits and social good",
              eventAttendanceMode:
                "https://schema.org/MixedEventAttendanceMode",
              eventStatus: "https://schema.org/EventScheduled",
              location: {
                "@type": "Place",
                address: {
                  "@type": "PostalAddress",
                  addressLocality:
                    seoMetadata.location.split(",")[0] || "Tempe",
                  addressRegion: "Arizona",
                  addressCountry: "US",
                },
              },
              organizer: {
                "@type": "Organization",
                name: "Opportunity Hack",
                url: "https://www.ohack.dev",
              },
              sponsor: {
                "@type": "Organization",
                name: "Corporate Sponsors",
                description: "Companies supporting tech for good innovation",
              },
              offers: {
                "@type": "Offer",
                name: "Sponsorship Opportunities",
                description:
                  "Various sponsorship tiers available to support tech for good initiatives",
                url: seoMetadata.canonicalUrl,
                category: "Corporate Partnership",
              },
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
        <SponsorApplicationComponent />
      </RequiredAuthProvider>
    </>
  );
};

// Server-side props for SEO metadata (available to crawlers before auth)
export async function getServerSideProps(context) {
  const { event_id } = context.params;

  // Default metadata for SEO
  let seoMetadata = {
    title: "Sponsor Opportunity Hack | Support Tech for Good Innovation",
    description:
      "Partner with us to sponsor our hackathon. Support innovators building tech solutions for nonprofits and showcase your company's commitment to social impact.",
    eventName: "Opportunity Hack",
    location: "Tempe, Arizona",
    canonicalUrl: `https://www.ohack.dev/hack/${event_id}/sponsor-application`,
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
            title: `Sponsor ${eventData.title} | Support Tech for Good Innovation`,
            description: `Partner with us to sponsor ${eventData.title} in ${eventData.location || "Tempe, Arizona"}. Support innovators building tech solutions for nonprofits and social good.`,
            eventName: eventData.title,
            location: eventData.location || "Tempe, Arizona",
            canonicalUrl: `https://www.ohack.dev/hack/${event_id}/sponsor-application`,
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

export default function SponsorApplicationPageWithRecaptcha(props) {
  return (
    <ReCaptchaProvider>
      <SponsorApplicationPage {...props} />
    </ReCaptchaProvider>
  );
}
