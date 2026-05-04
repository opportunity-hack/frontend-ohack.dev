import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import ReCaptchaProvider from "../../../components/ReCaptchaProvider";
import { initFacebookPixel, trackEvent } from '../../../lib/ga';
import {
  useAuthInfo,
  RequiredAuthProvider,
  RedirectToLogin,
} from "@propelauth/react";
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
  useMediaQuery,
  Autocomplete,
} from "@mui/material";
import Head from "next/head";
import Script from "next/script";
import { useEnv } from "../../../context/env.context";
import VolunteerCheckInQR from "../../../components/VolunteerCheckInQR";
import ApplicationNav from "../../../components/ApplicationNav/ApplicationNav";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import InfoIcon from "@mui/icons-material/Info";
import SearchIcon from "@mui/icons-material/Search";
import FormPersistenceControls from "../../../components/FormPersistenceControls";
import { useFormPersistence } from "../../../hooks/use-form-persistence";
import { useRecaptcha } from "../../../hooks/use-recaptcha";
import GiveButterWidget from "../../../components/GiveButterWidget";
import UploadPhoto from "../../../components/UploadPhoto";
import useProfileApi from "../../../hooks/use-profile-api";
import {
  MealMenu,
  OHackParticipationSelect,
  PronounsPicker,
  ProfileAutofillNotice,
} from "../../../components/ApplicationForm";
import Moment from "moment";
import "moment-timezone";
import { getEventTimezone, getTimezoneAbbreviation, formatDualTimezone } from "../../../lib/timezoneUtils";

const HackerApplicationComponent = () => {
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
  const [profileAutofilled, setProfileAutofilled] = useState(false);
  const [eventTeams, setEventTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [teamSearch, setTeamSearch] = useState("");

  // Profile API integration — used to pre-fill LinkedIn/GitHub from the user's profile
  const { profile, isLoading: profileLoading } = useProfileApi();

  // reCAPTCHA integration
  const {
    initializeRecaptcha,
    getRecaptchaToken,
    isLoading: recaptchaLoading,
    error: recaptchaError,
    setError: setRecaptchaError,
  } = useRecaptcha();

  // Store refs for data loading
  const initialLoadRef = useRef(false);
  const formInitializedRef = useRef(false);
  const confirmationShownRef = useRef(false);

  // Use ref to store uploaded photo URL to avoid race conditions
  const uploadedPhotoUrlRef = useRef("");

  // Initial form state
  const initialFormData = {
    timestamp: new Date().toISOString(),
    email: "",
    name: "",
    pronouns: "",
    participantType: "", // Student, Professional, Educator, Community Member, Other
    participantTypeOther: "",
    schoolOrganization: "",
    experienceLevel: "",
    primaryRoles: [], // Array of selected roles
    otherRole: "",
    skills: [], // Technical skills
    otherSkills: "",
    bio: "",
    linkedin: "",
    github: "",
    portfolio: "",
    photoUrl: "",
    inPerson: "",
    shirtSize: "",
    participationCount: "",
    arizonaResident: "",
    county: "",
    ageRange: "",
    parentalPermission: false,
    referralSource: "",
    referralSourceOther: "",
    socialCauses: [], // Array of selected causes
    otherSocialCause: "",
    socialImpactExperience: "",
    motivation: "",
    teamStatus: "",
    teamCode: "",
    soloAcknowledged: false,
    teamNeededSkills: "",
    teamMatchingPreferences: {
      preferredSize: "",
      preferredSkills: [],
      preferredCauses: [],
    },
    workshopInterests: [],
    workshopInterestsOther: "",
    mealSelections: {},
    depositAmountCents: null,
    depositDisposition: "refund",
    stripePaymentIntentId: "",
    interestedInTaxCredit: false,
    willContinue: false,
    codeOfConduct: false,
    dietaryRestrictions: "",
    country: "",
    state: "",
    additionalInfo: "",
    requiredQuestionAnswers: [],
    event_id: event_id || "",
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
    formType: "hacker",
    eventId: event_id || "",
    userId: user?.userId || "",
    initialFormData,
    apiServerUrl: apiServerUrl || "",
    accessToken: accessToken || "",
  });

  // Add handler for skills autocomplete
  const handleSkillsChange = useCallback(
    (event, newValue) => {
      setFormData((prev) => ({
        ...prev,
        skills: newValue,
      }));

      // Clear otherSkills when "Other" is removed
      if (!newValue.includes("Other")) {
        setFormData((prev) => ({
          ...prev,
          otherSkills: "",
        }));
      }

      // Auto-save to localStorage after changes
      setTimeout(() => {
        saveToLocalStorage();
      }, 500);
    },
    [setFormData, saveToLocalStorage],
  );

  // Photo upload handlers
  const handlePhotoUpload = useCallback(
    (photoUrl) => {
      // Store in ref to avoid race conditions
      uploadedPhotoUrlRef.current = photoUrl;
      // Update form data
      setFormData((prev) => ({
        ...prev,
        photoUrl: photoUrl,
      }));
      console.log("Photo URL saved to form and ref:", photoUrl);
    },
    [setFormData],
  );

  const handlePhotoError = useCallback(
    (errorMessage) => {
      setError(errorMessage);
      // Clear the uploaded photo URL
      uploadedPhotoUrlRef.current = "";
      setFormData((prev) => ({
        ...prev,
        photoUrl: "",
      }));
    },
    [setFormData],
  );

  // Participant type options
  const participantTypeOptions = [
    "Student",
    "Professional",
    "Educator",
    "Community Member",
    "Other",
  ];

  // Experience level options
  const experienceLevelOptions = [
    "First-time hacker",
    "Some hackathon experience (1-3 events)",
    "Experienced hacker (4+ events)",
  ];

  // Primary role options
  const primaryRoleOptions = [
    "Software Development - Frontend",
    "Software Development - Backend",
    "Software Development - Mobile",
    "Software Development - Full Stack",
    "Design (UI/UX, Graphics)",
    "Data Science/Analytics",
    "Project Management",
    "Business Analysis",
    "Quality Assurance",
    "DevOps",
    "Other",
  ];

  // Technical skills options categorized
  const technicalSkillsOptions = {
    "Programming Languages": [
      "JavaScript/TypeScript",
      "Python",
      "Java",
      "C#/.NET",
      "Ruby",
      "PHP",
      "Go",
      "Swift",
      "Kotlin",
      "C/C++",
      "Rust",
      "Scala",
      "R",
      "Perl",
    ],
    "Frontend Development": [
      "React",
      "Angular",
      "Vue.js",
      "Next.js",
      "HTML/CSS",
      "Redux",
      "Tailwind CSS",
      "Bootstrap",
      "Material UI",
      "Web Components",
      "Svelte",
      "jQuery",
    ],
    "Backend Development": [
      "Node.js",
      "Express",
      "Django",
      "Flask",
      "Spring Boot",
      "Laravel",
      "ASP.NET",
      "Ruby on Rails",
      "FastAPI",
      "GraphQL",
      "RESTful APIs",
      "Serverless Architecture",
    ],
    "Mobile Development": [
      "React Native",
      "Flutter",
      "iOS Development",
      "Android Development",
      "Xamarin",
      "Ionic",
    ],
    "Database & Storage": [
      "SQL Databases",
      "PostgreSQL",
      "MySQL/MariaDB",
      "MongoDB",
      "NoSQL Databases",
      "Redis",
      "Elasticsearch",
      "DynamoDB",
      "Firebase",
      "ORM Tools",
    ],
    "DevOps & Cloud": [
      "AWS",
      "Azure",
      "Google Cloud",
      "Docker",
      "Kubernetes",
      "CI/CD Pipelines",
      "GitHub Actions",
      "Jenkins",
      "Terraform",
      "Ansible",
    ],
    "Data Science & AI": [
      "Machine Learning",
      "AI/NLP",
      "Data Visualization",
      "TensorFlow",
      "PyTorch",
      "Computer Vision",
      "Pandas",
      "NumPy",
      "Big Data",
      "Statistical Analysis",
    ],
    "Design & UX": [
      "UI Design",
      "UX Research",
      "Graphic Design",
      "Figma",
      "Adobe XD",
      "Sketch",
      "Wireframing",
      "Prototyping",
    ],
    "Other Skills": [
      "Blockchain",
      "AR/VR",
      "IoT",
      "Game Development",
      "Cybersecurity",
      "Project Management",
      "Agile/Scrum",
      "Technical Writing",
      "Accessibility",
      "Other",
    ],
  };

  // Create a flat list of all skills for the autocomplete component
  const allTechnicalSkills = Object.values(technicalSkillsOptions).flat();

  // Original technical skills list for backward compatibility
  const technicalSkillsOptionsFlat = allTechnicalSkills;

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
    "Other",
  ];

  // Workshop interest options
  const workshopOptions = [
    "Pre-hackathon skill-building workshops",
    "During-event technical sessions",
    "Social impact design thinking",
    "Git/GitHub workflow",
    "Cloud deployment (AWS, GCP, Azure)",
    "UX/UI fundamentals",
    "Frontend (React, Next.js)",
    "Backend & API integration",
    "Database design",
    "Mobile development",
    "AI / Machine learning basics",
    "DevOps & CI/CD",
    "Cybersecurity basics",
    "Accessibility",
    "Working with nonprofits — scoping & requirements",
    "Pitch & demo coaching",
    "Fundraising & grants for tech projects",
    "Other",
  ];

  // Arizona county options
  const arizonaCountyOptions = [
    "Apache",
    "Cochise",
    "Coconino",
    "Gila",
    "Graham",
    "Greenlee",
    "La Paz",
    "Maricopa",
    "Mohave",
    "Navajo",
    "Pima",
    "Pinal",
    "Santa Cruz",
    "Yavapai",
    "Yuma",
  ];

  // Age range options
  const ageRangeOptions = [
    "Under 18",
    "18-24",
    "25-34",
    "35-44",
    "45-54",
    "55+",
  ];

  // Referral source options
  const referralSourceOptions = [
    "School/University",
    "Employer",
    "Social Media",
    "Friend/Colleague",
    "Previous Participant",
    "Nonprofit Organization",
    "Other",
  ];

  // Team size preferences
  const teamSizeOptions = [
    "No preference",
    "2 people",
    "3 people",
    "4 people",
    "5 people",
    "I prefer to work alone even if that disqualifies me from winning a prize",
  ];

  // Set up form with event_id
  useEffect(() => { initFacebookPixel(); }, []);

  useEffect(() => {
    if (event_id && !formInitializedRef.current) {
      formInitializedRef.current = true;
      setFormData((prev) => ({
        ...prev,
        event_id: event_id,
      }));
    }
  }, [event_id, setFormData]);

  // Now define the custom implementation that uses handleMultiSelectChange
  const customHandleMultiSelectChange = useCallback(
    (event, fieldName) => {
      handleMultiSelectChange(event, fieldName);

      // Clear otherRole when Other is removed from primaryRoles
      if (
        fieldName === "primaryRoles" &&
        !event.target.value.includes("Other")
      ) {
        setFormData((prev) => ({
          ...prev,
          otherRole: "",
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

  // Handle change function that extends the basic formChange
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      // Clear in-person error when they change their selection
      if (name === "inPerson") {
        setInPersonError("");
      }

      // Custom handling for participant type to clear the "other" field when not needed
      if (name === "participantType" && value !== "Other") {
        setFormData((prev) => ({
          ...prev,
          participantTypeOther: "",
        }));
      }

      // Custom handling for referral source to clear the "other" field when not needed
      if (name === "referralSource" && value !== "Other") {
        setFormData((prev) => ({
          ...prev,
          referralSourceOther: "",
        }));
      }

      // Custom handling for Arizona residency to clear county when not an Arizona resident
      if (name === "arizonaResident" && value !== "Arizona Resident") {
        setFormData((prev) => ({
          ...prev,
          county: "",
        }));
      }

      // Custom handling for team status to clear team-specific fields when not needed
      if (name === "teamStatus") {
        if (value !== "I have a team") {
          setFormData((prev) => ({
            ...prev,
            teamCode: "",
          }));
        }

        if (
          value !== "I'm looking for team members" &&
          value !== "I'd like to be matched with a team"
        ) {
          setFormData((prev) => ({
            ...prev,
            teamMatchingPreferences: {
              preferredSize: "",
              preferredSkills: [],
              preferredCauses: [],
            },
          }));
        }
      }

      // Pass the event to the main handler
      handleFormChange(e);
    },
    [handleFormChange, setFormData],
  );

  // Handle team matching preferences changes
  const handleTeamMatchingChange = useCallback(
    (field, value) => {
      setFormData((prev) => ({
        ...prev,
        teamMatchingPreferences: {
          ...prev.teamMatchingPreferences,
          [field]: value,
        },
      }));

      // Auto-save to localStorage after changes
      setTimeout(() => {
        saveToLocalStorage();
      }, 500);
    },
    [setFormData, saveToLocalStorage],
  );

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
        const externalUrl = eventData.constraints?.application_hacker_external_url;
        if (externalUrl) {
          window.location.href = externalUrl;
          return;
        }

        // Format dates for display
        const eventTz = getEventTimezone(eventData);
        const startDate = Moment.tz(eventData.start_date, eventTz);
        const endDate = Moment.tz(eventData.end_date, eventTz);
        const formattedStartDate = startDate.format("dddd, MMMM Do, YYYY");
        const formattedEndDate = endDate.format("dddd, MMMM Do, YYYY");

        // Calculate application deadline: 3 days before start date at 8pm event time
        const applicationDeadline = startDate
          .clone()
          .subtract(3, "days")
          .hour(20) // 8 PM
          .minute(0)
          .second(0)
          .millisecond(0);

        // Check if event is in the past (with 1-day buffer for end date)
        const now = Moment().tz(eventTz);
        const isEventPast = endDate.clone().add(1, "day").isBefore(now);

        // Check if applications are closed (deadline has passed)
        const isApplicationsClosed = now.isAfter(applicationDeadline);

        // Check if event is online/virtual
        const isOnlineEvent = ["Virtual", "Global", "Online"].some((term) =>
          eventData.location?.toLowerCase().includes(term.toLowerCase()),
        );

        // Format application deadline for display
        const tzAbbr = getTimezoneAbbreviation(applicationDeadline.toDate(), eventTz);
        const formattedApplicationDeadline = applicationDeadline.format(
          "dddd, MMMM Do, YYYY [at] h:mm A",
        ) + ` ${tzAbbr}`;

        // Extract required questions from constraints
        const requiredQuestions =
          eventData.constraints?.hacker_required_questions?.questions || [];

        setEventData({
          name: eventData.title || `Opportunity Hack - ${event_id}`,
          description:
            eventData.description || "Annual hackathon for nonprofits",
          date: startDate.format("YYYY"),
          startDate: eventData.start_date,
          endDate: eventData.end_date,
          formattedStartDate,
          formattedEndDate,
          location: eventData.location || "Tempe, Arizona",
          image:
            eventData.image_url ||
            "https://cdn.ohack.dev/ohack.dev/2024_hackathon_1.webp",
          isEventPast,
          isApplicationsClosed,
          isOnlineEvent,
          applicationDeadline: applicationDeadline.toISOString(),
          formattedApplicationDeadline,
          daysUntilDeadline: Math.max(0, applicationDeadline.diff(now, "days")),
          hoursUntilDeadline: Math.max(
            0,
            applicationDeadline.diff(now, "hours"),
          ),
          requiredQuestions,
          constraints: eventData.constraints || {},
        });

        // Initialize requiredQuestionAnswers array to match questions
        if (requiredQuestions.length > 0) {
          setFormData((prev) => ({
            ...prev,
            requiredQuestionAnswers: new Array(requiredQuestions.length).fill(null),
          }));
        }

        // If it's an online event, automatically set inPerson to "No"
        if (isOnlineEvent) {
          setFormData((prev) => ({
            ...prev,
            inPerson: "Yes", // For online events, "Yes" means they'll participate online
          }));
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching event data:", err);
        setError("Failed to load event data. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [event_id, apiServerUrl, setIsLoading, initializeRecaptcha, setFormData]);

  // Fetch teams for this event so hackers can browse and pick the team they're on.
  useEffect(() => {
    if (!apiServerUrl || !event_id) return;
    let cancelled = false;
    const fetchTeams = async () => {
      setTeamsLoading(true);
      try {
        const res = await fetch(`${apiServerUrl}/api/messages/teams`);
        if (!res.ok) throw new Error(`Failed to load teams: ${res.status}`);
        const json = await res.json();
        const all = Array.isArray(json?.teams) ? json.teams : [];
        const filtered = all.filter(
          (t) =>
            t?.active !== false &&
            (t?.hackathon_event_id === event_id ||
              t?.eventId === event_id),
        );
        if (!cancelled) setEventTeams(filtered);
      } catch (err) {
        console.warn("Could not load teams for event browser:", err);
        if (!cancelled) setEventTeams([]);
      } finally {
        if (!cancelled) setTeamsLoading(false);
      }
    };
    fetchTeams();
    return () => {
      cancelled = true;
    };
  }, [apiServerUrl, event_id]);

  // Pre-fill LinkedIn and GitHub from the user's saved profile when fields are empty
  useEffect(() => {
    if (profileLoading || !profile) return;
    let didAutofill = false;
    setFormData((prev) => {
      const next = { ...prev };
      if (!prev.linkedin && profile.linkedin_url) {
        next.linkedin = profile.linkedin_url;
        didAutofill = true;
      }
      if (!prev.github && profile.github) {
        next.github = profile.github;
        didAutofill = true;
      }
      return didAutofill ? next : prev;
    });
    if (didAutofill) setProfileAutofilled(true);
  }, [profile, profileLoading, setFormData]);

  // Handle user data and application loading - separate from event loading
  useEffect(() => {
    const loadUserAndFormData = async () => {
      // Skip if already initialized, event_id missing, or user not loaded yet
      if (!event_id || !formInitializedRef.current) return;

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

                  const transformedData = {
                    ...initialFormData,
                    email: prevData.email || user.email || "",
                    name:
                      prevData.name ||
                      (user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.username || ""),
                    pronouns: prevData.pronouns || "",
                    participantType: prevData.participantType || "",
                    participantTypeOther: prevData.participantTypeOther || "",
                    schoolOrganization:
                      prevData.schoolOrganization ||
                      prevData.school ||
                      prevData.organization ||
                      "",
                    experienceLevel: prevData.experienceLevel || "",
                    primaryRoles: parsePreviousArrayField("primaryRoles"),
                    otherRole: prevData.otherRole || "",
                    skills: parsePreviousArrayField("skills"),
                    otherSkills: prevData.otherSkills || "",
                    bio: prevData.bio || prevData.shortBio || "",
                    linkedin:
                      prevData.linkedin || prevData.linkedinProfile || "",
                    github: prevData.github || "",
                    portfolio: prevData.portfolio || "",
                    photoUrl: prevData.photoUrl || "",
                    inPerson:
                      prevData.inPerson || (prevData.isInPerson ? "Yes" : "No"),
                    isSelected: prevData.isSelected || false,
                    shirtSize: prevData.shirtSize || "",
                    participationCount: prevData.participationCount || "",
                    arizonaResident: prevData.arizonaResident || "",
                    county: prevData.county || "",
                    ageRange: prevData.ageRange || "",
                    referralSource: prevData.referralSource || "",
                    referralSourceOther: prevData.referralSourceOther || "",
                    socialCauses: parsePreviousArrayField("socialCauses"),
                    otherSocialCause: prevData.otherSocialCause || "",
                    socialImpactExperience:
                      prevData.socialImpactExperience || "",
                    motivation: prevData.motivation || "",
                    teamStatus: prevData.teamStatus || "",
                    teamCode: prevData.teamCode || "",
                    teamNeededSkills: prevData.teamNeededSkills || "",
                    teamMatchingPreferences: {
                      preferredSize:
                        prevData.teamMatchingPreferences?.preferredSize || "",
                      preferredSkills: parsePreviousArrayField(
                        "teamMatchingPreferredSkills",
                      ),
                      preferredCauses: parsePreviousArrayField(
                        "teamMatchingPreferredCauses",
                      ),
                    },
                    workshopInterests:
                      parsePreviousArrayField("workshopInterests"),
                    interestedInTaxCredit:
                      prevData.interestedInTaxCredit || false,
                    willContinue: prevData.willContinue || false,
                    codeOfConduct:
                      prevData.codeOfConduct ||
                      prevData.agreedToCodeOfConduct ||
                      false,
                    dietaryRestrictions: prevData.dietaryRestrictions || "",
                    country: prevData.country || "",
                    state: prevData.state || "",
                    additionalInfo:
                      prevData.additionalInfo || prevData.comments || "",
                    event_id: event_id,
                  };
                  setIsSelected(prevData.isSelected || false);
                  setVolunteerId(prevData.id || null);
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
  }, [user, accessToken, event_id]);

  // Validation functions
  // Helper function to set error and scroll to top for better UX
  const setErrorAndScroll = (errorMessage) => {
    setError(errorMessage);
    if (formRef?.current) {
      formRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const validateBasicInfo = () => {
    // Validate required screening questions first
    const questions = eventData?.requiredQuestions || [];
    if (questions.length > 0) {
      const answers = formData.requiredQuestionAnswers || [];
      for (let i = 0; i < questions.length; i++) {
        if (answers[i] === null || answers[i] === undefined) {
          setErrorAndScroll(`Please answer the required question: "${questions[i].question}"`);
          return false;
        }
        if (answers[i] !== questions[i].required_answer) {
          setErrorAndScroll(questions[i].error || "You do not meet the eligibility requirements for this event.");
          return false;
        }
      }
    }

    const requiredFields = [
      "email",
      "name",
      "participantType",
      "schoolOrganization",
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        setErrorAndScroll(
          `Please fill out the ${field.replace(/([A-Z])/g, " $1").toLowerCase()} field`,
        );
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorAndScroll("Please enter a valid email address");
      return false;
    }

    // Check for "Other" participant type
    if (
      formData.participantType === "Other" &&
      !formData.participantTypeOther
    ) {
      setErrorAndScroll("Please specify your participant type");
      return false;
    }

    setError("");
    return true;
  };

  const validateSkillsInfo = () => {
    // Validate primary roles
    if (!formData.primaryRoles || formData.primaryRoles.length === 0) {
      setErrorAndScroll("Please select at least one primary role");
      return false;
    }

    // Check for "Other" role
    if (formData.primaryRoles.includes("Other") && !formData.otherRole) {
      setErrorAndScroll("Please specify your other role");
      return false;
    }

    // Validate skills
    if (!formData.skills || formData.skills.length === 0) {
      setErrorAndScroll("Please select at least one technical skill");
      return false;
    }

    // Check for "Other" skill
    if (formData.skills.includes("Other") && !formData.otherSkills) {
      setErrorAndScroll("Please specify your other technical skills");
      return false;
    }

    setError("");
    return true;
  };

  const [inPersonError, setInPersonError] = useState("");

  // For in-person events, auto-set the legacy `inPerson` field to "Yes" since we no longer show the radio.
  useEffect(() => {
    if (!eventData) return;
    if (!eventData.isOnlineEvent && formData.inPerson !== "Yes") {
      setFormData((prev) => ({ ...prev, inPerson: "Yes" }));
    }
  }, [eventData, formData.inPerson, setFormData]);

  // Validate location and demographics; under-18 attendees must confirm guardian permission.
  const validateLocationInfo = () => {
    // Clear any previous error
    setInPersonError("");

    const requiredFields = ["arizonaResident", "country", "state", "ageRange"];

    if (formData.ageRange === "Under 18" && !formData.parentalPermission) {
      setErrorAndScroll(
        "Please confirm you have parent or guardian permission to attend.",
      );
      return false;
    }

    for (const field of requiredFields) {
      if (!formData[field]) {
        setErrorAndScroll(
          `Please fill out the ${field.replace(/([A-Z])/g, " $1").toLowerCase()} field`,
        );
        return false;
      }
    }

    // Check for Arizona resident and county
    if (formData.arizonaResident === "Arizona Resident" && !formData.county) {
      setErrorAndScroll("Please select your county");
      return false;
    }

    // Check for referral source and "Other"
    if (!formData.referralSource) {
      setErrorAndScroll("Please indicate how you heard about Opportunity Hack");
      return false;
    }

    if (formData.referralSource === "Other" && !formData.referralSourceOther) {
      setErrorAndScroll("Please specify how you heard about Opportunity Hack");
      return false;
    }

    setError("");
    return true;
  };

  const validateInterestsInfo = () => {
    // Validate social causes
    if (!formData.socialCauses || formData.socialCauses.length === 0) {
      setErrorAndScroll(
        "Please select at least one social cause you are interested in",
      );
      return false;
    }

    // Check for "Other" social cause
    if (formData.socialCauses.includes("Other") && !formData.otherSocialCause) {
      setErrorAndScroll("Please specify your other social cause");
      return false;
    }

    // Validate team status
    if (!formData.teamStatus) {
      setErrorAndScroll("Please indicate your team status");
      return false;
    }

    // Specific validations based on team status
    if (formData.teamStatus === "I have a team" && !formData.teamCode) {
      setErrorAndScroll("Please enter your team code");
      return false;
    }

    if (
      formData.teamStatus === "I would like to work alone" &&
      !formData.soloAcknowledged
    ) {
      setErrorAndScroll(
        "Please confirm you understand the risks of working solo, or pick a team option.",
      );
      return false;
    }

    // Updated validation for team members - check the correct fields
    if (formData.teamStatus === "I'm looking for team members") {
      // Check team matching preferences instead of teamNeededSkills
      if (!formData.teamMatchingPreferences.preferredSize) {
        setErrorAndScroll("Please select your preferred team size");
        return false;
      }

      if (
        !formData.teamMatchingPreferences.preferredSkills ||
        formData.teamMatchingPreferences.preferredSkills.length === 0
      ) {
        setErrorAndScroll(
          "Please select at least one preferred skill set to work with",
        );
        return false;
      }
    }

    if (formData.teamStatus === "I'd like to be matched with a team") {
      // Check team matching preferences
      if (!formData.teamMatchingPreferences.preferredSize) {
        setErrorAndScroll("Please select your preferred team size");
        return false;
      }

      if (
        !formData.teamMatchingPreferences.preferredSkills ||
        formData.teamMatchingPreferences.preferredSkills.length === 0
      ) {
        setErrorAndScroll(
          "Please select at least one preferred skill set to work with",
        );
        return false;
      }
    }

    setError("");
    return true;
  };

  const validateForm = () => {
    return (
      validateBasicInfo() &&
      validateSkillsInfo() &&
      validateLocationInfo() &&
      validateInterestsInfo() &&
      formData.codeOfConduct
    );
  };

  const handleNext = () => {
    // Check if applications are closed before allowing progression
    if (eventData && eventData.isApplicationsClosed) {
      setErrorAndScroll(
        "Applications are closed. The hackathon has already started.",
      );
      return;
    }

    // Check if event has ended
    if (eventData && eventData.isEventPast) {
      setErrorAndScroll(
        "This event has already ended and applications are no longer accepted.",
      );
      return;
    }

    if (activeStep === 0 && !validateBasicInfo()) return;
    if (activeStep === 1 && !validateSkillsInfo()) return;
    if (activeStep === 2 && !validateLocationInfo()) return;
    if (activeStep === 3 && !validateInterestsInfo()) return;

    // Save progress when moving between steps
    handleManualSave();

    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep((prev) => prev + 1);
      trackEvent({ action: 'hacker_app_step', params: { event_label: steps[activeStep + 1], step: activeStep + 2, event_id, page: 'hacker_application' } });
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
    trackEvent({ action: 'hacker_app_step_back', params: { event_label: steps[activeStep - 1], step: activeStep, event_id, page: 'hacker_application' } });
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

  // handleSubmit function - Ensure backward compatibility
  const isDepositRequired = () =>
    !!eventData?.constraints?.hacker_deposit?.enabled;

  const startDepositCheckout = async () => {
    setSubmitting(true);
    setError("");
    try {
      const defaultCents =
        eventData?.constraints?.hacker_deposit?.default_amount_cents || 500;
      const amount =
        Number.isInteger(formData.depositAmountCents) &&
        formData.depositAmountCents > 0
          ? formData.depositAmountCents
          : defaultCents;
      const res = await fetch("/api/applications/hacker-deposit/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id,
          amount_cents: amount,
          disposition: formData.depositDisposition || "refund",
          hacker_email: formData.email,
        }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Failed to start deposit checkout");
      // Form data is already auto-saved to localStorage; redirect to Stripe.
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not start deposit checkout.");
      setSubmitting(false);
    }
  };

  // Resume the application after returning from Stripe Checkout
  useEffect(() => {
    const params =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : null;
    const sessionId = params?.get("deposit_session_id");
    const cancelled = params?.get("deposit_cancelled");
    if (cancelled) {
      setError(
        "Deposit checkout was cancelled. You can try again on the Review step.",
      );
      // Clean the URL so the message goes away on next refresh.
      const url = new URL(window.location.href);
      url.searchParams.delete("deposit_cancelled");
      window.history.replaceState({}, "", url.toString());
      return;
    }
    if (!sessionId || formData.stripePaymentIntentId) return;
    let cancelledFlag = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/applications/hacker-deposit/session?session_id=${encodeURIComponent(sessionId)}`,
        );
        const data = await res.json();
        if (cancelledFlag) return;
        if (data.payment_status === "paid" && data.payment_intent_id) {
          setFormData((prev) => ({
            ...prev,
            stripePaymentIntentId: data.payment_intent_id,
            depositAmountCents: data.amount_total ?? prev.depositAmountCents,
            depositDisposition:
              data.metadata?.disposition || prev.depositDisposition,
          }));
          setActiveStep(steps.length - 1);
          // Clean the URL.
          const url = new URL(window.location.href);
          url.searchParams.delete("deposit_session_id");
          window.history.replaceState({}, "", url.toString());
        } else {
          setError(
            "Deposit not completed. You can try again on the Review step.",
          );
        }
      } catch (err) {
        if (!cancelledFlag)
          setError("Could not verify deposit. Please try again.");
      }
    })();
    return () => {
      cancelledFlag = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event_id]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // Check if applications are closed
    if (eventData && eventData.isApplicationsClosed) {
      setError("Applications are closed. The hackathon has already started.");
      return;
    }

    // Check if event has ended
    if (eventData && eventData.isEventPast) {
      setError(
        "This event has already ended and applications are no longer accepted.",
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

    // If a deposit is required and not yet paid, route to Stripe Checkout first.
    if (isDepositRequired() && !formData.stripePaymentIntentId) {
      await startDepositCheckout();
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
        // Process data for API submission
        isInPerson: formData.inPerson === "Yes",
        // Process primaryRoles with otherRole if needed
        primaryRoles: formData.primaryRoles.includes("Other")
          ? [
              ...formData.primaryRoles.filter((r) => r !== "Other"),
              formData.otherRole,
            ].join(", ")
          : formData.primaryRoles.join(", "),
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
        // Process workshopInterests
        workshopInterests: formData.workshopInterests.join(", "),
        // Convert team matching preferences to strings for API
        teamMatchingPreferredSkills:
          formData.teamMatchingPreferences.preferredSkills.join(", "),
        teamMatchingPreferredCauses:
          formData.teamMatchingPreferences.preferredCauses.join(", "),
        teamMatchingPreferredSize:
          formData.teamMatchingPreferences.preferredSize,
        // Add required question answers for server-side validation
        requiredQuestionAnswers: formData.requiredQuestionAnswers || [],
        // Add reCAPTCHA token
        recaptchaToken,
        // Add type information
        type: "hackers",
        volunteer_type: "hacker",
        agreedToCodeOfConduct: formData.codeOfConduct,
        linkedinProfile: formData.linkedin,
        shortBio: formData.bio,
        photoUrl: uploadedPhotoUrlRef.current || formData.photoUrl || "",
        // Deposit + meal selections (when applicable)
        meal_selections: formData.mealSelections || {},
        parental_permission: !!formData.parentalPermission,
        workshop_interests_other: formData.workshopInterestsOther || "",
        deposit_amount_cents: formData.depositAmountCents || null,
        deposit_disposition: formData.stripePaymentIntentId
          ? formData.depositDisposition || "refund"
          : null,
        stripe_payment_intent_id: formData.stripePaymentIntentId || null,
      };

      if (apiServerUrl) {
        // Submit to API
        const submitEndpoint = previouslySubmitted
          ? `${apiServerUrl}/api/hacker/application/${event_id}/update`
          : `${apiServerUrl}/api/hacker/application/${event_id}/submit`;

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
        console.log("Submitting hacker application:", submissionData);
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
      trackEvent({ action: 'hacker_app_submit', params: { event_label: 'success', event_id, page: 'hacker_application' } });
      // Scroll to top of form to show "Application Submitted!" message
      if (formRef?.current) {
        formRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    } catch (err) {
      console.error("Error submitting application:", err);
      trackEvent({ action: 'hacker_app_submit_error', params: { event_label: err.message, event_id, page: 'hacker_application' } });
      setError("Failed to submit your application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Define steps for stepper
  const steps = [
    "Basic Info",
    "Skills & Experience",
    "Location & Demographics",
    "Interests & Teams",
    "Review",
  ];

  // Handler for required question answers
  const handleRequiredQuestionAnswer = (index, value) => {
    setFormData((prev) => {
      const newAnswers = [...(prev.requiredQuestionAnswers || [])];
      newAnswers[index] = value;
      return { ...prev, requiredQuestionAnswers: newAnswers };
    });
  };

  // Render required screening questions
  const renderRequiredQuestions = () => {
    const questions = eventData?.requiredQuestions || [];
    if (questions.length === 0) return null;

    return (
      <Box sx={{ mb: 4 }}>
        {questions.map((q, index) => {
          const answer = formData.requiredQuestionAnswers?.[index];
          const isWrongAnswer = answer !== null && answer !== undefined && answer !== q.required_answer;

          return (
            <Alert
              key={index}
              severity={isWrongAnswer ? "error" : "warning"}
              variant="outlined"
              sx={{ mb: 2, borderWidth: 2 }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                {q.question} <Box component="span" color="error.main">*</Box>
              </Typography>
              <RadioGroup
                value={answer === true ? "yes" : answer === false ? "no" : ""}
                onChange={(e) => handleRequiredQuestionAnswer(index, e.target.value === "yes")}
              >
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
              </RadioGroup>
              {isWrongAnswer && (
                <Typography color="error" variant="body2" sx={{ mt: 1, fontWeight: "bold" }}>
                  {q.error || "You do not meet the eligibility requirements for this event."}
                </Typography>
              )}
            </Alert>
          );
        })}
      </Box>
    );
  };

  // Render basic information form
  const renderBasicInfoForm = () => (
    <Box sx={{ mb: 4 }}>
      {renderRequiredQuestions()}

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
          value={formData.email || ""}
          onChange={handleChange}
          sx={{ mb: 3 }}
        />

        <TextField
          label="Your Name"
          name="name"
          required
          fullWidth
          value={formData.name || ""}
          onChange={handleChange}
          sx={{ mb: 3 }}
        />

        <PronounsPicker
          value={formData.pronouns || ""}
          onChange={(next) =>
            setFormData((prev) => ({ ...prev, pronouns: next }))
          }
          required={false}
        />

        <FormControl fullWidth required sx={{ mb: 3 }}>
          <InputLabel id="participant-type-label">Participant Type</InputLabel>
          <Select
            labelId="participant-type-label"
            id="participant-type"
            name="participantType"
            value={formData.participantType || ""}
            onChange={handleChange}
            label="Participant Type"
          >
            {participantTypeOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>Select what best describes you</FormHelperText>
        </FormControl>

        {formData.participantType === "Other" && (
          <TextField
            label="Please specify your participant type"
            name="participantTypeOther"
            required
            fullWidth
            value={formData.participantTypeOther || ""}
            onChange={handleChange}
            sx={{ mb: 3 }}
          />
        )}

        <TextField
          label="School or Organization"
          name="schoolOrganization"
          required
          fullWidth
          value={formData.schoolOrganization || ""}
          onChange={handleChange}
          sx={{ mb: 3 }}
          helperText="Your school, university, company, or organization"
        />

        <FormControl fullWidth required sx={{ mb: 3 }}>
          <InputLabel id="experience-level-label">
            Hackathon Experience Level
          </InputLabel>
          <Select
            labelId="experience-level-label"
            id="experience-level"
            name="experienceLevel"
            value={formData.experienceLevel || ""}
            onChange={handleChange}
            label="Hackathon Experience Level"
          >
            {experienceLevelOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            How much experience do you have with hackathons?
          </FormHelperText>
        </FormControl>

        <FormControl
          fullWidth
          required
          sx={{ mb: formData.primaryRoles?.includes("Other") ? 1 : 3 }}
        >
          <InputLabel id="primary-roles-label">
            Primary Role/Skill Set
          </InputLabel>
          <Select
            labelId="primary-roles-label"
            id="primary-roles"
            multiple
            value={formData.primaryRoles || []}
            onChange={(e) => customHandleMultiSelectChange(e, "primaryRoles")}
            input={<OutlinedInput label="Primary Role/Skill Set" />}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
          >
            {primaryRoleOptions.map((option) => (
              <MenuItem key={option} value={option}>
                <Checkbox
                  checked={(formData.primaryRoles || []).indexOf(option) > -1}
                />
                <ListItemText primary={option} />
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            Select your primary roles or skill sets (select at least one)
          </FormHelperText>
        </FormControl>

        {formData.primaryRoles?.includes("Other") && (
          <TextField
            label="Please specify your other role"
            name="otherRole"
            required
            fullWidth
            value={formData.otherRole || ""}
            onChange={handleChange}
            helperText="Tell us about your specific role or skill set"
            sx={{ mb: 3 }}
          />
        )}
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
        <FormControl
          fullWidth
          required
          sx={{ mb: formData.skills?.includes("Other") ? 1 : 3 }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Technical Skills{" "}
            <Box component="span" color="error.main">
              *
            </Box>
          </Typography>

          <Autocomplete
            multiple
            id="skills-autocomplete"
            options={allTechnicalSkills}
            value={formData.skills || []}
            onChange={handleSkillsChange}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="Search or select technical skills"
                helperText="Select your technical skills (select at least one)"
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip key={option} label={option} {...getTagProps({ index })} />
              ))
            }
            groupBy={(option) => {
              // Find the category for this skill
              for (const [category, skills] of Object.entries(
                technicalSkillsOptions,
              )) {
                if (skills.includes(option)) {
                  return category;
                }
              }
              return "Other Skills";
            }}
            renderGroup={(params) => (
              <li key={params.key}>
                <Box
                  sx={{
                    position: "sticky",
                    top: -8,
                    pt: 1,
                    pb: 1,
                    bgcolor: "background.paper",
                    zIndex: 1,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    component="div"
                    sx={{ fontWeight: "bold", pl: 2 }}
                  >
                    {params.group}
                  </Typography>
                </Box>
                <ul style={{ padding: 0 }}>{params.children}</ul>
              </li>
            )}
            freeSolo
            filterSelectedOptions
            sx={{
              "& .MuiAutocomplete-tag": {
                margin: "2px",
              },
            }}
          />
        </FormControl>

        {formData.skills?.includes("Other") && (
          <TextField
            label="Please specify your other technical skills"
            name="otherSkills"
            required
            fullWidth
            value={formData.otherSkills || ""}
            onChange={handleChange}
            helperText="Tell us about your other technical skills"
            sx={{ mb: 3 }}
          />
        )}

        <ProfileAutofillNotice show={profileAutofilled} />

        <TextField
          label="Short bio"
          name="bio"
          multiline
          rows={3}
          fullWidth
          value={formData.bio || ""}
          onChange={handleChange}
          helperText="We use your bio to help match you with a team — and we share it publicly on the hackathon page so people can find you and connect. Aim for 100–200 words."
          sx={{ mb: 3 }}
        />

        <TextField
          label="LinkedIn Profile (Optional)"
          name="linkedin"
          type="url"
          fullWidth
          value={formData.linkedin || ""}
          onChange={handleChange}
          sx={{ mb: 3 }}
          placeholder="https://linkedin.com/in/yourprofile"
          helperText={
            profileAutofilled && profile?.linkedin_url
              ? "Auto-filled from your profile — edit your profile to update everywhere."
              : undefined
          }
        />

        <TextField
          label="GitHub Profile (Optional)"
          name="github"
          type="url"
          fullWidth
          value={formData.github || ""}
          onChange={handleChange}
          sx={{ mb: 3 }}
          placeholder="https://github.com/yourusername"
          helperText={
            profileAutofilled && profile?.github
              ? "Auto-filled from your profile — edit your profile to update everywhere."
              : undefined
          }
        />

        <TextField
          label="Portfolio/Personal Website (Optional)"
          name="portfolio"
          type="url"
          fullWidth
          value={formData.portfolio || ""}
          onChange={handleChange}
          sx={{ mb: 3 }}
          placeholder="https://yourwebsite.com"
        />

        <UploadPhoto
          value={formData.photoUrl || ""}
          onChange={handlePhotoUpload}
          onError={handlePhotoError}
          label="Your Profile Photo (Optional)"
          helperText="Please upload a professional photo of yourself, we'd like to add this to our website so people can see who is participating."
          directory="hackers"
          apiServerUrl={apiServerUrl}
          accessToken={accessToken}
          orgId={user?.orgId}
          userId={user?.userId}
          sx={{ mb: 3 }}
        />

        <OHackParticipationSelect
          value={formData.participationCount}
          onChange={handleChange}
          sx={{ mb: 3 }}
        />
      </Box>
    </Box>
  );

  // Render location and demographics form
  const renderLocationDemographicsForm = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
        Location & Demographics
      </Typography>

      <Box sx={{ mb: 3 }}>
        {/* In-person events: confirm on-site attendance commitment */}
        {!eventData?.isOnlineEvent && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
              This is an in-person event
              {eventData?.location ? ` in ${eventData.location}` : ""}.
            </Typography>
            <Typography variant="body1">
              We ask hackers to be on-site for the entire hackathon. You're
              welcome to go home to sleep overnight if you prefer, but we expect
              you with us during the build, demos, and judging. Virtual
              participation isn't supported for this event.
            </Typography>
          </Alert>
        )}

        <FormControl fullWidth required sx={{ mb: 3 }}>
          <InputLabel id="arizona-resident-label">Arizona Residency</InputLabel>
          <Select
            labelId="arizona-resident-label"
            id="arizona-resident"
            name="arizonaResident"
            value={formData.arizonaResident || ""}
            onChange={handleChange}
            label="Arizona Residency"
          >
            <MenuItem value="Arizona Resident">Arizona Resident</MenuItem>
            <MenuItem value="Non-Arizona Resident">
              Non-Arizona Resident
            </MenuItem>
          </Select>
          <FormHelperText>
            This information helps with our QCO reporting requirements
          </FormHelperText>
        </FormControl>

        {formData.arizonaResident === "Arizona Resident" && (
          <FormControl fullWidth required sx={{ mb: 3 }}>
            <InputLabel id="county-label">County</InputLabel>
            <Select
              labelId="county-label"
              id="county"
              name="county"
              value={formData.county || ""}
              onChange={handleChange}
              label="County"
            >
              {arizonaCountyOptions.map((county) => (
                <MenuItem key={county} value={county}>
                  {county}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Select your county in Arizona</FormHelperText>
          </FormControl>
        )}

        <TextField
          label="Country"
          name="country"
          required
          fullWidth
          value={formData.country || ""}
          onChange={handleChange}
          sx={{ mb: 3 }}
        />

        <TextField
          label="State/Province"
          name="state"
          required
          fullWidth
          value={formData.state || ""}
          onChange={handleChange}
          sx={{ mb: 3 }}
        />

        <FormControl fullWidth required sx={{ mb: 3 }}>
          <InputLabel id="age-range-label">Age Range</InputLabel>
          <Select
            labelId="age-range-label"
            id="age-range"
            name="ageRange"
            value={formData.ageRange || ""}
            onChange={handleChange}
            label="Age Range"
          >
            {ageRangeOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            This helps us understand our participant demographics
          </FormHelperText>
        </FormControl>

        {formData.ageRange === "Under 18" && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  name="parentalPermission"
                  checked={!!formData.parentalPermission}
                  onChange={handleChange}
                  color="primary"
                  required
                />
              }
              label={
                <Typography variant="body1">
                  I confirm I have permission from a parent or legal guardian to
                  attend and participate in this hackathon.
                </Typography>
              }
              sx={{ alignItems: "flex-start" }}
            />
          </Alert>
        )}

        <FormControl
          fullWidth
          required
          sx={{ mb: formData.referralSource === "Other" ? 1 : 3 }}
        >
          <InputLabel id="referral-source-label">
            How did you hear about Opportunity Hack?
          </InputLabel>
          <Select
            labelId="referral-source-label"
            id="referral-source"
            name="referralSource"
            value={formData.referralSource || ""}
            onChange={handleChange}
            label="How did you hear about Opportunity Hack?"
          >
            {referralSourceOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {formData.referralSource === "Other" && (
          <TextField
            label="Please specify how you heard about us"
            name="referralSourceOther"
            required
            fullWidth
            value={formData.referralSourceOther || ""}
            onChange={handleChange}
            sx={{ mb: 3 }}
          />
        )}

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="shirt-size-label">T-Shirt Size (Optional)</InputLabel>
          <Select
            labelId="shirt-size-label"
            id="shirt-size"
            name="shirtSize"
            value={formData.shirtSize || ""}
            onChange={handleChange}
            label="T-Shirt Size (Optional)"
          >
            <MenuItem value="XS">XS</MenuItem>
            <MenuItem value="S">S</MenuItem>
            <MenuItem value="M">M</MenuItem>
            <MenuItem value="L">L</MenuItem>
            <MenuItem value="XL">XL</MenuItem>
            <MenuItem value="XXL">XXL</MenuItem>
            <MenuItem value="3XL">3XL</MenuItem>
            <MenuItem value="4XL">4XL</MenuItem>
          </Select>
          <FormHelperText>
            For people who complete the hackathon (subject to availability)
          </FormHelperText>
        </FormControl>

        {/* Only show dietary restrictions for non-online events */}
        {!eventData?.isOnlineEvent && (
          <TextField
            label="Dietary Restrictions (Optional)"
            name="dietaryRestrictions"
            fullWidth
            value={formData.dietaryRestrictions || ""}
            onChange={handleChange}
            sx={{ mb: 3 }}
            helperText="Please let us know about any dietary restrictions for in-person attendees"
          />
        )}

        {!eventData?.isOnlineEvent &&
          Array.isArray(eventData?.constraints?.meals) &&
          eventData.constraints.meals.length > 0 && (
            <MealMenu
              meals={eventData.constraints.meals}
              selections={formData.mealSelections || {}}
              onChange={(next) =>
                setFormData((prev) => ({ ...prev, mealSelections: next }))
              }
            />
          )}

        {formData.arizonaResident === "Arizona Resident" && (
          <FormControlLabel
            control={
              <Checkbox
                name="interestedInTaxCredit"
                checked={formData.interestedInTaxCredit || false}
                onChange={handleChange}
                color="primary"
              />
            }
            label="I'm interested in receiving information about Arizona tax credits for supporting Opportunity Hack"
            sx={{ mb: 2 }}
          />
        )}
      </Box>
    </Box>
  );

  // Render interests and team formation form
  const renderInterestsTeamsForm = () => {
    // Add handlers for the ranked causes
    const handleAddCause = (cause) => {
      if (!formData.socialCauses.includes(cause)) {
        // If adding "Other" option, show a prompt for the custom cause
        if (cause === "Other") {
          const customCause = window.prompt(
            "Please specify your other social cause interest:",
          );
          if (customCause && customCause.trim()) {
            setFormData((prev) => ({
              ...prev,
              socialCauses: [...prev.socialCauses, cause],
              otherSocialCause: customCause.trim(),
            }));
          } else {
            // If they cancel the prompt or enter nothing, don't add "Other"
            return;
          }
        } else {
          setFormData((prev) => ({
            ...prev,
            socialCauses: [...prev.socialCauses, cause],
          }));
        }

        // Auto-save to localStorage after changes
        setTimeout(() => {
          saveToLocalStorage();
        }, 500);
      }
    };

    const handleRemoveCause = (index) => {
      setFormData((prev) => {
        const newCauses = [...prev.socialCauses];
        const removedCause = newCauses[index];
        newCauses.splice(index, 1);

        // If we removed "Other", also clear the otherSocialCause field
        if (removedCause === "Other") {
          return {
            ...prev,
            socialCauses: newCauses,
            otherSocialCause: "",
          };
        }

        return {
          ...prev,
          socialCauses: newCauses,
        };
      });

      // Auto-save to localStorage after changes
      setTimeout(() => {
        saveToLocalStorage();
      }, 500);
    };

    // Function to edit the "Other" social cause
    const handleEditOtherCause = () => {
      const currentValue = formData.otherSocialCause || "";
      const newValue = window.prompt(
        "Edit your other social cause:",
        currentValue,
      );

      if (newValue !== null) {
        // Only update if they didn't press Cancel
        setFormData((prev) => ({
          ...prev,
          otherSocialCause: newValue.trim(),
        }));

        // Auto-save to localStorage after changes
        setTimeout(() => {
          saveToLocalStorage();
        }, 500);
      }
    };

    const handleMoveCause = (index, direction) => {
      if (
        (direction === "up" && index === 0) ||
        (direction === "down" && index === formData.socialCauses.length - 1)
      ) {
        return; // Can't move outside boundaries
      }

      const newIndex = direction === "up" ? index - 1 : index + 1;

      setFormData((prev) => {
        const newCauses = [...prev.socialCauses];
        const temp = newCauses[index];
        newCauses[index] = newCauses[newIndex];
        newCauses[newIndex] = temp;

        return {
          ...prev,
          socialCauses: newCauses,
        };
      });

      // Auto-save to localStorage after changes
      setTimeout(() => {
        saveToLocalStorage();
      }, 500);
    };

    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
          Interests & Team Formation
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            At Opportunity Hack, we believe in the power of diverse,
            well-matched teams. The information you provide below helps us
            connect hackers with complementary skills and shared interests in
            social causes. Our team-matching algorithm uses this data to create
            balanced teams that can effectively address nonprofit challenges.
          </Typography>
        </Alert>

        <Box sx={{ mb: 3 }}>
          {/* Replace the multi-select with ranked selection */}
          <Typography variant="subtitle1" gutterBottom>
            Social Causes You're Interested In{" "}
            <Box component="span" color="error.main">
              *
            </Box>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select and rank social causes by priority. Your top choices will be
            given more weight in team matching.
          </Typography>

          {/* Add causes section */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="social-causes-label">Add Social Causes</InputLabel>
            <Select
              labelId="social-causes-label"
              id="social-causes"
              value=""
              onChange={(e) => {
                if (e.target.value) handleAddCause(e.target.value);
              }}
              input={<OutlinedInput label="Add Social Causes" />}
            >
              {socialCausesOptions
                .filter((option) => !formData.socialCauses.includes(option))
                .map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
            </Select>
            <FormHelperText>
              {formData.socialCauses.length === 0
                ? "Please select at least one social cause you're interested in"
                : "Add as many causes as you like. You can rank them below after adding."}
            </FormHelperText>
          </FormControl>

          {/* Selected causes with improved ranking UI */}
          {formData.socialCauses.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ mb: 1 }}>
                Your ranked causes (most important first):
              </Typography>

              <Paper variant="outlined" sx={{ p: 2 }}>
                {formData.socialCauses.map((cause, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: index === formData.socialCauses.length - 1 ? 0 : 2,
                      bgcolor: "background.paper",
                      borderRadius: 1,
                      overflow: "hidden",
                      border: "1px solid",
                      borderColor: "divider",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        borderColor: "primary.main",
                      },
                    }}
                  >
                    {/* Priority indicator */}
                    <Box
                      sx={{
                        bgcolor:
                          index === 0
                            ? "primary.main"
                            : index === 1
                              ? "primary.light"
                              : index === 2
                                ? "info.light"
                                : "grey.200",
                        color: index < 3 ? "white" : "text.primary",
                        p: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        width: 50,
                        fontSize: "1.1rem",
                      }}
                    >
                      #{index + 1}
                    </Box>

                    {/* Cause name */}
                    <Box sx={{ flex: 1, px: 2, py: 1.5, fontSize: "1rem" }}>
                      {cause === "Other" ? (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography sx={{ mr: 1 }}>Other:</Typography>
                          <Typography fontWeight="medium" color="primary.main">
                            {formData.otherSocialCause || "(not specified)"}
                          </Typography>
                          <Button
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditOtherCause();
                            }}
                            sx={{ ml: 1, minWidth: 0, p: 0.5 }}
                          >
                            Edit
                          </Button>
                        </Box>
                      ) : (
                        cause
                      )}
                    </Box>

                    {/* Control buttons with improved touchability */}
                    <Box
                      sx={{
                        display: "flex",
                        mr: 0.5,
                        flexDirection: { xs: "column", sm: "row" },
                      }}
                    >
                      <Button
                        variant={index === 0 ? "text" : "contained"}
                        color="primary"
                        disabled={index === 0}
                        onClick={() => handleMoveCause(index, "up")}
                        sx={{
                          minWidth: { xs: 40, sm: 48 },
                          height: { xs: 28, sm: 40 },
                          p: 0.5,
                          m: 0.5,
                          fontSize: "1.2rem",
                        }}
                        aria-label="Move up"
                      >
                        ↑
                      </Button>
                      <Button
                        variant={
                          index === formData.socialCauses.length - 1
                            ? "text"
                            : "contained"
                        }
                        color="primary"
                        disabled={index === formData.socialCauses.length - 1}
                        onClick={() => handleMoveCause(index, "down")}
                        sx={{
                          minWidth: { xs: 40, sm: 48 },
                          height: { xs: 28, sm: 40 },
                          p: 0.5,
                          m: 0.5,
                          fontSize: "1.2rem",
                        }}
                        aria-label="Move down"
                      >
                        ↓
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleRemoveCause(index)}
                        sx={{
                          minWidth: { xs: 40, sm: 48 },
                          height: { xs: 28, sm: 40 },
                          p: 0.5,
                          m: 0.5,
                        }}
                        aria-label="Remove"
                      >
                        ✕
                      </Button>
                    </Box>
                  </Box>
                ))}

                {/* Empty state message when no causes selected */}
                {formData.socialCauses.length === 0 && (
                  <Box
                    sx={{ textAlign: "center", py: 4, color: "text.secondary" }}
                  >
                    No causes selected yet. Please add at least one cause from
                    the dropdown above.
                  </Box>
                )}
              </Paper>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1, fontStyle: "italic" }}
              >
                The order matters! Your top priority should be #1.
              </Typography>
            </Box>
          )}

          {/* Rest of the form remains unchanged */}
          <TextField
            label="Previous Social Impact Experience (Optional)"
            name="socialImpactExperience"
            multiline
            rows={3}
            fullWidth
            value={formData.socialImpactExperience || ""}
            onChange={handleChange}
            helperText="Share any previous experience with social impact projects or nonprofits"
            sx={{ mb: 3 }}
          />

          <TextField
            label="What motivates you to participate in Opportunity Hack?"
            name="motivation"
            multiline
            rows={3}
            fullWidth
            value={formData.motivation || ""}
            onChange={handleChange}
            helperText="What impact do you hope to create?"
            sx={{ mb: 3 }}
          />

          <FormControl fullWidth required sx={{ mb: 3 }}>
            <InputLabel id="team-status-label">Team Status</InputLabel>
            <Select
              labelId="team-status-label"
              id="team-status"
              name="teamStatus"
              value={formData.teamStatus || ""}
              onChange={handleChange}
              label="Team Status"
            >
              <MenuItem value="I have a team">
                I have a complete team of 2-5 people
              </MenuItem>
              <MenuItem value="I'm looking for team members">
                I have a team and we'd like to add more people
              </MenuItem>
              <MenuItem value="I'd like to be matched with a team">
                I don't have a team and I'd like to be matched with people to
                form a team
              </MenuItem>
              <MenuItem value="I would like to work alone">
                I would like to work alone and I'm okay with not obtaining
                experience with working with others
              </MenuItem>
            </Select>
            <FormHelperText>
              Let us know your team situation - we'll help connect you with
              teammates before or during the event
            </FormHelperText>
          </FormControl>

          {formData.teamStatus === "I have a team" && (
            <Box
              sx={{
                border: "1px solid #e0e0e0",
                borderRadius: 1,
                p: 2,
                mb: 3,
              }}
            >
              <Typography variant="subtitle1" gutterBottom>
                Find your team
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Pick the team you're on from the list below. If your team
                isn't created yet, type the agreed team name in the field —
                make sure your teammates use the same name so we can match you
                up.
              </Typography>
              <TextField
                label="Search teams"
                fullWidth
                size="small"
                value={teamSearch}
                onChange={(e) => setTeamSearch(e.target.value)}
                placeholder="Filter by team name…"
                sx={{ mb: 2 }}
                disabled={teamsLoading}
              />
              {teamsLoading && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Loading teams…
                </Typography>
              )}
              {!teamsLoading && eventTeams.length === 0 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    No teams have been created for this event yet — you'll be
                    among the first. Type your agreed team name below.
                  </Typography>
                </Alert>
              )}
              {!teamsLoading && eventTeams.length > 0 && (
                <Box
                  sx={{
                    maxHeight: 240,
                    overflowY: "auto",
                    border: "1px solid #f0f0f0",
                    borderRadius: 1,
                    mb: 2,
                  }}
                >
                  {eventTeams
                    .filter((t) =>
                      teamSearch
                        ? (t.name || "")
                            .toLowerCase()
                            .includes(teamSearch.toLowerCase())
                        : true,
                    )
                    .map((t) => {
                      const selected =
                        (formData.teamCode || "").trim().toLowerCase() ===
                        (t.name || "").trim().toLowerCase();
                      const memberCount = Array.isArray(t.users)
                        ? t.users.length
                        : 0;
                      return (
                        <Box
                          key={t.id || t.name}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              teamCode: t.name || "",
                            }))
                          }
                          sx={{
                            p: 1.5,
                            cursor: "pointer",
                            borderBottom: "1px solid #f5f5f5",
                            bgcolor: selected ? "action.selected" : "inherit",
                            "&:hover": { bgcolor: "action.hover" },
                          }}
                        >
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: 600 }}
                          >
                            {t.name || "(unnamed team)"}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            {memberCount} member
                            {memberCount === 1 ? "" : "s"}
                          </Typography>
                        </Box>
                      );
                    })}
                </Box>
              )}
              <TextField
                label="Team Name"
                name="teamCode"
                required
                fullWidth
                value={formData.teamCode || ""}
                onChange={handleChange}
                helperText="Pick a team above to fill this in, or type your agreed team name. Your teammates must enter the exact same name."
              />
            </Box>
          )}

          {formData.teamStatus === "I would like to work alone" && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                Solo hackers usually don't finish.
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                In our experience most hackers who start solo drop out by the
                end of day one — building, testing, demoing, and presenting
                alone in 36 hours is genuinely hard. Joining a team makes
                finishing far more likely, and you'll learn more along the way.
                We strongly recommend picking "I don't have a team" instead so
                we can match you with people.
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    name="soloAcknowledged"
                    checked={!!formData.soloAcknowledged}
                    onChange={handleChange}
                    color="primary"
                    required
                  />
                }
                label={
                  <Typography variant="body1">
                    I understand the risks and still want to work alone.
                  </Typography>
                }
                sx={{ alignItems: "flex-start", mt: 1 }}
              />
            </Alert>
          )}

          {(formData.teamStatus === "I'm looking for team members" ||
            formData.teamStatus === "I'd like to be matched with a team") && (
            <Box
              sx={{ border: "1px solid #e0e0e0", borderRadius: 1, p: 2, mb: 3 }}
            >
              <Typography variant="subtitle1" gutterBottom>
                Team Matching Preferences
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Our team-matching process has successfully connected hundreds of
                hackers into effective teams over the years. Your preferences
                below will help us create balanced teams where members
                complement each other's skills and share common interests in
                social causes.
              </Typography>

              <FormControl fullWidth required sx={{ mb: 3 }}>
                <InputLabel id="preferred-size-label">
                  Preferred Team Size
                </InputLabel>
                <Select
                  labelId="preferred-size-label"
                  id="preferred-size"
                  value={formData.teamMatchingPreferences?.preferredSize || ""}
                  onChange={(e) =>
                    handleTeamMatchingChange("preferredSize", e.target.value)
                  }
                  label="Preferred Team Size"
                >
                  {teamSizeOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  This helps us match you with the right sized team
                </FormHelperText>
              </FormControl>

              <FormControl fullWidth required sx={{ mb: 3 }}>
                <InputLabel id="preferred-skills-label">
                  Skills You'd Like in Teammates
                </InputLabel>
                <Select
                  labelId="preferred-skills-label"
                  id="preferred-skills"
                  multiple
                  value={
                    formData.teamMatchingPreferences?.preferredSkills || []
                  }
                  onChange={(e) =>
                    handleTeamMatchingChange("preferredSkills", e.target.value)
                  }
                  input={
                    <OutlinedInput label="Skills You'd Like in Teammates" />
                  }
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {primaryRoleOptions
                    .filter((option) => option !== "Other")
                    .map((option) => (
                      <MenuItem key={option} value={option}>
                        <Checkbox
                          checked={
                            (
                              formData.teamMatchingPreferences
                                ?.preferredSkills || []
                            ).indexOf(option) > -1
                          }
                        />
                        <ListItemText primary={option} />
                      </MenuItem>
                    ))}
                </Select>
                <FormHelperText>
                  Select skills that would complement your own. These are
                  especially helpful for team matching.
                </FormHelperText>
              </FormControl>

              <Alert severity="info" sx={{ mb: 1 }}>
                <Typography variant="body2">
                  <strong>Tip:</strong> Being specific about your team
                  preferences increases your chances of finding compatible
                  teammates!
                </Typography>
              </Alert>
            </Box>
          )}

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="workshop-interests-label">
              Workshop Interests (Optional)
            </InputLabel>
            <Select
              labelId="workshop-interests-label"
              id="workshop-interests"
              multiple
              value={formData.workshopInterests || []}
              onChange={(e) =>
                customHandleMultiSelectChange(e, "workshopInterests")
              }
              input={<OutlinedInput label="Workshop Interests (Optional)" />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              {workshopOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  <Checkbox
                    checked={
                      (formData.workshopInterests || []).indexOf(option) > -1
                    }
                  />
                  <ListItemText primary={option} />
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              We use this to plan workshop topics. Select anything that sounds
              useful — pick "Other" if you have something specific in mind.
            </FormHelperText>
          </FormControl>

          {(formData.workshopInterests || []).includes("Other") && (
            <TextField
              label="Tell us what other workshop you'd like"
              name="workshopInterestsOther"
              fullWidth
              value={formData.workshopInterestsOther || ""}
              onChange={handleChange}
              helperText="What topic, format, or speaker would help you?"
              sx={{ mb: 3 }}
            />
          )}

          <FormControlLabel
            control={
              <Checkbox
                name="willContinue"
                checked={formData.willContinue || false}
                onChange={handleChange}
                color="primary"
              />
            }
            label="I'm interested in continuing project development after the hackathon"
            sx={{ mb: 2, display: "block" }}
          />
        </Box>
      </Box>
    );
  };

  // Render review form
  const renderReviewForm = () => {
    const depositCfg = eventData?.constraints?.hacker_deposit;
    const depositEnabled = !!depositCfg?.enabled;
    const defaultCents = depositCfg?.default_amount_cents || 500;
    const currentCents = Number.isInteger(formData.depositAmountCents)
      ? formData.depositAmountCents
      : defaultCents;
    const paid = !!formData.stripePaymentIntentId;
    return (
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
        value={formData.additionalInfo || ""}
        onChange={handleChange}
        sx={{ mb: 4 }}
      />

      {depositEnabled && (
        <Paper variant="outlined" sx={{ p: 2.5, mb: 4 }}>
          <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
            Hacker deposit
          </Typography>
          {paid ? (
            <Alert severity="success" sx={{ mb: 1 }}>
              <Typography variant="body1">
                ✓ Deposit received (
                ${((currentCents || 0) / 100).toFixed(2)}{" "}
                — {formData.depositDisposition === "donate"
                  ? "donated to OHack"
                  : "refundable on completion"}
                ). You're all set to submit your application.
              </Typography>
            </Alert>
          ) : (
            <>
              <Typography variant="body1" sx={{ mb: 2 }}>
                We collect a small deposit so we can plan accurately for food
                and supplies. After the hackathon, we'll refund it — or you
                can leave it as a donation to keep Opportunity Hack free for
                the next group of hackers.
              </Typography>
              <TextField
                label="Deposit amount (USD)"
                type="number"
                value={(currentCents / 100).toString()}
                onChange={(e) => {
                  const dollars = parseFloat(e.target.value);
                  const cents = Number.isFinite(dollars)
                    ? Math.round(dollars * 100)
                    : defaultCents;
                  setFormData((prev) => ({
                    ...prev,
                    depositAmountCents: Math.max(
                      Math.round(defaultCents),
                      cents,
                    ),
                  }));
                }}
                inputProps={{
                  min: (defaultCents / 100).toString(),
                  step: 1,
                }}
                helperText={`Minimum is the default ($${(defaultCents / 100).toFixed(2)}). You can pay more if you'd like to chip in.`}
                sx={{ maxWidth: 240, mb: 2 }}
              />
              <FormControl component="fieldset" sx={{ mb: 1 }}>
                <Typography variant="subtitle1" gutterBottom>
                  What should we do with your deposit?
                </Typography>
                <RadioGroup
                  name="depositDisposition"
                  value={formData.depositDisposition || "refund"}
                  onChange={handleChange}
                >
                  <FormControlLabel
                    value="refund"
                    control={<Radio />}
                    label="Refund it to me after I complete the hackathon."
                  />
                  <FormControlLabel
                    value="donate"
                    control={<Radio />}
                    label="Donate it to Opportunity Hack."
                  />
                </RadioGroup>
              </FormControl>
              <Typography variant="body2" color="text.secondary">
                You'll be redirected to Stripe to pay when you submit. Your
                application is saved and will pick up where you left off.
              </Typography>
            </>
          )}
        </Paper>
      )}

      <FormControlLabel
        control={
          <Checkbox
            name="codeOfConduct"
            checked={formData.codeOfConduct || false}
            onChange={handleChange}
            color="primary"
            required
          />
        }
        label={
          <Typography variant="body1">
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
        <Typography variant="body1">
          By submitting this form, you're applying to participate in Opportunity
          Hack. We'll send you next steps and event details over email.
        </Typography>
      </Alert>
    </Box>
    );
  };

  // Function to render the current step form
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderBasicInfoForm();
      case 1:
        return renderSkillsAndExperienceForm();
      case 2:
        return renderLocationDemographicsForm();
      case 3:
        return renderInterestsTeamsForm();
      case 4:
        return renderReviewForm();
      default:
        return "Unknown step";
    }
  };

  // SEO metadata and descriptions
  const pageTitle = eventData
    ? `Hack at ${eventData.name} | Build Tech Solutions for Good`
    : "Hack at Opportunity Hack | Build Tech Solutions for Good";
  const pageDescription = eventData
    ? `Apply to participate as a hacker/maker in ${eventData.name} in ${eventData.location}. Build innovative tech solutions for nonprofits, work with amazing teams, and create real social impact.`
    : "Apply to participate as a hacker/maker in our tech for good hackathon. Build innovative solutions for nonprofits, work with amazing teams, and create real social impact.";
  const canonicalUrl = `https://ohack.dev/hack/${event_id}/hacker-application`;

  const imageUrl =
    eventData?.image || "https://cdn.ohack.dev/ohack.dev/2024_hackathon_1.webp";

  // Breadcrumb items for structured data
  const breadcrumbItems = [
    { name: "Home", url: "https://ohack.dev" },
    { name: "Hackathons", url: "https://ohack.dev/hack" },
    {
      name: eventData?.name || "Hackathon Event",
      url: `https://ohack.dev/hack/${event_id}`,
    },
    {
      name: "Hacker Application",
      url: canonicalUrl,
    },
  ];

  // Structured data for hacker application
  const hackerApplicationStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: pageTitle,
    description: pageDescription,
    url: canonicalUrl,
    isPartOf: {
      "@type": "WebSite",
      name: "Opportunity Hack",
      url: "https://ohack.dev",
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbItems.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    },
    mainEntity: {
      "@type": "Event",
      name: eventData?.name || "Opportunity Hack",
      description:
        "Apply to participate in a tech for good hackathon where you'll build solutions for nonprofits",
      organizer: {
        "@type": "Organization",
        name: "Opportunity Hack",
      },
      location: {
        "@type": "Place",
        name: eventData?.location || "Tempe, Arizona",
        address: {
          "@type": "PostalAddress",
          addressLocality: eventData?.location || "Tempe",
          addressRegion: "Arizona",
          addressCountry: "US",
        },
      },
      eventAttendanceMode: "OfflineEventAttendanceMode",
      eventStatus: "EventScheduled",
      audience: {
        "@type": "Audience",
        audienceType: [
          "Developers",
          "Designers",
          "Students",
          "Tech Professionals",
          "Social Impact Enthusiasts",
        ],
      },
      keywords: [
        "hackathon",
        "tech for good",
        "nonprofit",
        "social impact",
        "coding",
        "volunteering",
        "team building",
      ],
    },
  };

  // If form submitted successfully, show success message
  if (success) {
    return (
      <Container>
        <Head>
          <title>{pageTitle}</title>
          <meta name="description" content={pageDescription} />
          <meta
            name="keywords"
            content="hackathon, hacker application, tech for good, nonprofit hackathon, opportunity hack, coding for social good, volunteer, tech projects"
          />
          <link rel="canonical" href={canonicalUrl} />

          {/* DNS prefetch and preconnect for performance */}
          <link rel="dns-prefetch" href="//cdn.ohack.dev" />
          <link
            rel="preconnect"
            href="https://cdn.ohack.dev"
            crossOrigin="anonymous"
          />

          {/* Open Graph tags */}
          <meta property="og:title" content={pageTitle} />
          <meta property="og:description" content={pageDescription} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={canonicalUrl} />
          <meta property="og:image" content={imageUrl} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta
            property="og:image:alt"
            content="Developers coding solutions for nonprofits at Opportunity Hack"
          />
          <meta property="og:site_name" content="Opportunity Hack" />

          {/* Twitter Card tags */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={pageTitle} />
          <meta name="twitter:description" content={pageDescription} />
          <meta name="twitter:image" content={imageUrl} />
          <meta
            name="twitter:image:alt"
            content="Developers coding solutions for nonprofits at Opportunity Hack"
          />

          {/* Additional SEO meta tags */}
          <meta name="robots" content="index, follow" />
          <meta name="author" content="Opportunity Hack" />
          <meta name="theme-color" content="#1976d2" />
        </Head>

        {/* Structured Data */}
        <Script
          id="hacker-application-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(hackerApplicationStructuredData),
          }}
        />

        <Box my={8} textAlign="center">
          <Typography
            variant="h1"
            component="h1"
            sx={{ fontSize: "2.5rem", mb: 4, mt: 12 }}
          >
            Application Submitted!
          </Typography>

          <Alert severity="success" sx={{ mb: 4, mx: "auto", maxWidth: 600 }}>
            <Typography variant="body1">
              Thanks for applying to participate in Opportunity Hack — we've
              received your application. Watch your email for next steps.
            </Typography>
          </Alert>

          <Box sx={{ mb: 4, display: "flex", justifyContent: "center" }}>
            <GiveButterWidget
              context="success"
              userId={user?.userId}
              applicationType="hacker"
              size="large"
              onDonationEvent={(eventData) => {
                console.log("Hacker donation event:", eventData);
              }}
            />
          </Box>

          <Box
            sx={{
              mt: 2,
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              justifyContent: "center",
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push(`/hack/${event_id}`)}
            >
              Return to Hackathon Page
            </Button>

            {/* Added button for team finding if the user indicated they're looking for a team */}
            {(formData.teamStatus === "I'd like to be matched with a team" ||
              formData.teamStatus === "I'm looking for team members") && (
              <Button
                variant="outlined"
                color="primary"
                onClick={() => router.push(`/hack/${event_id}/findteam`)}
                startIcon={<SearchIcon />}
              >
                Find a Team
              </Button>
            )}
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta
          name="keywords"
          content="hackathon, hacker application, tech for good, nonprofit hackathon, opportunity hack, coding for social good, volunteer, tech projects"
        />
        <link rel="canonical" href={canonicalUrl} />

        {/* DNS prefetch and preconnect for performance */}
        <link rel="dns-prefetch" href="//cdn.ohack.dev" />
        <link
          rel="preconnect"
          href="https://cdn.ohack.dev"
          crossOrigin="anonymous"
        />

        {/* Open Graph tags */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="Developers coding solutions for nonprofits at Opportunity Hack"
        />
        <meta property="og:site_name" content="Opportunity Hack" />

        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={imageUrl} />
        <meta
          name="twitter:image:alt"
          content="Developers coding solutions for nonprofits at Opportunity Hack"
        />

        {/* Additional SEO meta tags */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Opportunity Hack" />
        <meta name="theme-color" content="#1976d2" />
      </Head>

      {/* Structured Data */}
      <Script
        id="hacker-application-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(hackerApplicationStructuredData),
        }}
      />

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
          Hacker Application
        </Typography>

        {/* QR Code for Check-in */}
        <VolunteerCheckInQR
          eventId={event_id}
          volunteerId={volunteerId}
          isSelected={isSelected}
          volunteerType="hacker"
          name={formData.name}
          isSubmitted={true}
          qrSize={200}
          sx={{ mx: "auto", maxWidth: 500 }}
        />

        {isLoading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {/* Header section with responsive layout */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: { xs: "flex-start", md: "flex-start" },
                gap: 2,
                mb: 3,
              }}
            >
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
                        color: "text.secondary",
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
                        gap: 1,
                      }}
                    >
                      <Box
                        component="span"
                        sx={{ display: "inline-flex", alignItems: "center" }}
                      >
                        📆 {eventData.formattedStartDate}
                      </Box>
                      {eventData.formattedStartDate !==
                        eventData.formattedEndDate && (
                        <>
                          <Box component="span" sx={{ mx: 0.5 }}>
                            to
                          </Box>
                          <Box
                            component="span"
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                            }}
                          >
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
                  width: { xs: "100%", sm: "180px", md: "220px" },
                  height: { xs: "140px", sm: "120px", md: "150px" },
                  borderRadius: 2,
                  overflow: "hidden",
                  boxShadow: 2,
                  flexShrink: 0,
                  alignSelf: { xs: "center", md: "flex-start" },
                  maxWidth: "100%",
                  mt: { xs: 0, md: 1 },
                }}
              >
                <img
                  src="https://cdn.ohack.dev/ohack.dev/2024_hackathon_1.webp"
                  alt="Developers building innovative solutions for nonprofits at Opportunity Hack"
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "block",
                    objectFit: "cover",
                  }}
                />
              </Box>
            </Box>

            {/* Add ApplicationNav component */}
            {event_id && (
              <ApplicationNav eventId={event_id} currentType="hacker" />
            )}

            <Box sx={{ mb: 4 }}>                   
              {eventData && eventData.isEventPast ? (
                <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
                  <Alert severity="warning" sx={{ mb: 3 }}>
                    <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                      This event has already ended
                    </Typography>
                    <Typography variant="body1">
                      Applications are no longer being accepted for this
                      hackathon as it has already concluded. Please check our
                      upcoming events for future participation opportunities.
                    </Typography>
                  </Alert>

                  <Box sx={{ mb: 4, display: "flex", justifyContent: "center" }}>
                    <GiveButterWidget
                      context="event-ended"
                      userId={user?.userId}
                      applicationType="hacker"
                      size="large"
                      onDonationEvent={(eventData) => {
                        // Track hacker application donations when event ended
                        console.log("Event ended hacker donation event:", eventData);
                      }}
                    />
                  </Box>

                  <Box textAlign="center">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => router.push("/hack")}
                      sx={{ mt: 2 }}
                    >
                      View Upcoming Events
                    </Button>
                  </Box>
                </Paper>
              ) : eventData && eventData.isApplicationsClosed ? (
                <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
                  <Alert severity="warning" sx={{ mb: 3 }}>
                    <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                      Applications are now closed
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      The application deadline has passed. Applications closed
                      on{" "}
                      <strong>{eventData.formattedApplicationDeadline}</strong>{" "}
                      to allow time for application review and acceptance
                      notifications.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      The hackathon begins on {eventData.formattedStartDate}. If
                      you believe this is an error or have special
                      circumstances, please{" "}
                      <Link href="/contact" color="primary" underline="hover">
                        contact the organizers
                      </Link>{" "}
                      immediately.
                    </Typography>
                  </Alert>
                  <Box
                    textAlign="center"
                    sx={{
                      display: "flex",
                      gap: 2,
                      justifyContent: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => router.push(`/hack/${event_id}`)}
                      sx={{ mt: 2 }}
                    >
                      View Event Details
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => router.push("/hack")}
                      sx={{ mt: 2 }}
                    >
                      View Other Events
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
                        "& .MuiStepLabel-root": {
                          padding: "0 4px", // Reduce padding on mobile
                        },
                        "& .MuiStepLabel-labelContainer": {
                          width: "auto", // Let the label container be as small as possible
                        },
                        "& .MuiStepLabel-label": {
                          fontSize: "0.7rem", // Smaller text on mobile
                          whiteSpace: "nowrap", // Prevent text wrapping
                        },
                        "& .MuiSvgIcon-root": {
                          width: 20, // Smaller icons
                          height: 20,
                        },
                        overflowX: "auto", // Allow horizontal scrolling if needed
                        "&::-webkit-scrollbar": {
                          display: "none", // Hide scrollbar on webkit browsers
                        },
                        scrollbarWidth: "none", // Hide scrollbar on Firefox
                      }),
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

                  <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
                    <Typography variant="body1" paragraph>
                      Thank you for your interest in participating as a hacker
                      at Opportunity Hack! Hackers like you build innovative
                      solutions for nonprofits that make a real difference in
                      their communities.
                    </Typography>

                    <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 4 }}>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>What to expect as a hacker:</strong>
                      </Typography>
                      <ul style={{ marginBottom: 0, paddingLeft: "1.5rem" }}>
                        <li>
                          Work in teams to develop solutions for nonprofit
                          challenges
                        </li>
                        <li>
                          Gain experience with new technologies and
                          collaboration tools
                        </li>
                        <li>
                          Learn from mentors and nonprofit partners about social
                          impact
                        </li>
                        <li>
                          Present your solution to judges and compete for prizes
                        </li>
                        <li>
                          Build your portfolio and network with tech
                          professionals
                        </li>
                      </ul>
                    </Alert>

                    {eventData && (
                      <Alert
                        severity={
                          eventData.daysUntilDeadline <= 1
                            ? "error"
                            : eventData.daysUntilDeadline <= 3
                              ? "warning"
                              : "info"
                        }
                        sx={{ mb: 4 }}
                      >
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Application Deadline:</strong>
                        </Typography>
                        <Typography variant="body2">
                          Applications close on{" "}
                          {eventData.formattedApplicationDeadline}
                          {eventData.hoursUntilDeadline > 0 && (
                            <span>
                              {" "}
                              (
                              {eventData.daysUntilDeadline > 0
                                ? `${eventData.daysUntilDeadline} day${eventData.daysUntilDeadline !== 1 ? "s" : ""} remaining`
                                : `${eventData.hoursUntilDeadline} hour${eventData.hoursUntilDeadline !== 1 ? "s" : ""} remaining`}
                              )
                            </span>
                          )}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          This early deadline allows us to review applications
                          and send acceptance notifications before the hackathon
                          begins on {eventData.formattedStartDate}.
                        </Typography>
                        {eventData.daysUntilDeadline <= 1 && (
                          <Typography
                            variant="body2"
                            sx={{ mt: 1, fontWeight: "bold" }}
                          >
                            ⚠️ Deadline is approaching soon - please submit your
                            application as early as possible!
                          </Typography>
                        )}
                      </Alert>
                    )}

                    {(error || recaptchaError) && (
                      <Alert severity="error" sx={{ mb: 4 }}>
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
                          justifyContent: "space-between",
                          mt: 4,
                        }}
                      >
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
                          disabled={
                            submitting ||
                            recaptchaLoading ||
                            (eventData &&
                              (eventData.isApplicationsClosed ||
                                eventData.isEventPast))
                          }
                        >
                          {activeStep === steps.length - 1 ? (
                            submitting || recaptchaLoading ? (
                              <CircularProgress size={24} />
                            ) : isDepositRequired() &&
                              !formData.stripePaymentIntentId ? (
                              "Continue to deposit"
                            ) : (
                              "Submit Application"
                            )
                          ) : (
                            "Next"
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

// Create a new component that uses RequiredAuthProvider
const HackerApplicationPage = ({ seoMetadata }) => {
  const router = useRouter();
  const { event_id } = router.query;

  // Create the current URL for redirection
  const currentUrl =
    typeof window !== "undefined" && event_id
      ? `${window.location.origin}/hack/${event_id}/hacker-application`
      : null;

  return (
    <>
      {/* SEO metadata available to crawlers before authentication */}
      <Head>
        <title>{seoMetadata.title}</title>
        <meta name="description" content={seoMetadata.description} />
        <meta
          name="keywords"
          content="hackathon, hacker application, tech for good, nonprofit hackathon, opportunity hack, developer, coding, programming, social impact"
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
          content="Hackers building tech solutions at Opportunity Hack"
        />
        <meta property="og:site_name" content="Opportunity Hack" />

        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoMetadata.title} />
        <meta name="twitter:description" content={seoMetadata.description} />
        <meta name="twitter:image" content={seoMetadata.imageUrl} />
        <meta
          name="twitter:image:alt"
          content="Hackers building tech solutions at Opportunity Hack"
        />

        {/* Additional SEO meta tags */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Opportunity Hack" />
        <meta name="theme-color" content="#1976d2" />
      </Head>

      {/* Structured Data for SEO */}
      <Script
        id="hacker-application-structured-data-seo"
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
              url: "https://ohack.dev",
            },
            breadcrumb: {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: "https://ohack.dev",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Hackathons",
                  item: "https://ohack.dev/hack",
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: seoMetadata.eventName,
                  item: `https://ohack.dev/hack/${event_id}`,
                },
                {
                  "@type": "ListItem",
                  position: 4,
                  name: "Hacker Application",
                  item: seoMetadata.canonicalUrl,
                },
              ],
            },
            mainEntity: {
              "@type": "Event",
              name: seoMetadata.eventName,
              description:
                "Join our hackathon to build innovative tech solutions for nonprofits and social good",
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
                url: "https://ohack.dev",
              },
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
                availability: "https://schema.org/InStock",
                url: seoMetadata.canonicalUrl,
              },
            },
          }),
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
        <HackerApplicationComponent />
      </RequiredAuthProvider>
    </>
  );
};

// Server-side props for SEO metadata (available to crawlers before auth)
export async function getServerSideProps(context) {
  const { event_id } = context.params;

  // Default metadata for SEO
  let seoMetadata = {
    title: "Join Opportunity Hack | Build Tech Solutions for Nonprofits",
    description:
      "Join our hackathon to build innovative tech solutions for nonprofits and social good. Apply to participate as a developer, designer, or product manager.",
    eventName: "Opportunity Hack",
    location: "Tempe, Arizona",
    canonicalUrl: `https://ohack.dev/hack/${event_id}/hacker-application`,
    imageUrl: "https://cdn.ohack.dev/ohack.dev/2024_hackathon_1.webp",
  };

  // Try to fetch event data for better SEO
  try {
    const apiServerUrl = process.env.NEXT_PUBLIC_REACT_APP_API_SERVER_URL;
    if (apiServerUrl) {
      const response = await fetch(
        `${apiServerUrl}/api/messages/hackathon/${event_id}`,
      );

      if (response.ok) {
        const eventData = await response.json();

        if (eventData && eventData.title) {
          seoMetadata = {
            title: `Join ${eventData.title} | Build Tech Solutions for Nonprofits`,
            description: `Join ${eventData.title} in ${eventData.location || "Tempe, Arizona"}. Build innovative tech solutions for nonprofits and make a real social impact through code.`,
            eventName: eventData.title,
            location: eventData.location || "Tempe, Arizona",
            canonicalUrl: `https://ohack.dev/hack/${event_id}/hacker-application`,
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

export default function HackerApplicationPageWithRecaptcha(props) {
  return (
    <ReCaptchaProvider>
      <HackerApplicationPage {...props} />
    </ReCaptchaProvider>
  );
}
