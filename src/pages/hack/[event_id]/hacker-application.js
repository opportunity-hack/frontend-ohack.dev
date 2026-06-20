import React, { useState, useEffect, useCallback, useRef } from "react";
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
import ReviewStep from "../../../components/ApplicationForm/Hacker/ReviewStep";
import LocationDemographicsStep from "../../../components/ApplicationForm/Hacker/LocationDemographicsStep";
import BasicInfoStep from "../../../components/ApplicationForm/Hacker/BasicInfoStep";
import SkillsExperienceStep from "../../../components/ApplicationForm/Hacker/SkillsExperienceStep";
import InterestsTeamsStep from "../../../components/ApplicationForm/Hacker/InterestsTeamsStep";
import Moment from "moment";
import "moment-timezone";
import {
  getEventTimezone,
  getTimezoneAbbreviation,
  formatDualTimezone,
} from "../../../lib/timezoneUtils";
import {
  PARTICIPANT_TYPE_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  PRIMARY_ROLE_OPTIONS,
  TECHNICAL_SKILLS_OPTIONS,
  ALL_TECHNICAL_SKILLS,
  SOCIAL_CAUSES_OPTIONS,
  WORKSHOP_OPTIONS,
  ARIZONA_COUNTY_OPTIONS,
  COUNTRY_OPTIONS,
  US_STATE_OPTIONS,
  AGE_RANGE_OPTIONS,
  REFERRAL_SOURCE_OPTIONS,
  TEAM_SIZE_OPTIONS,
} from "../../../components/ApplicationForm/Hacker/hackerFormConfig";
import {
  RefinedRoot,
  RefinedFonts,
  Eyebrow,
  Arrow,
} from "../../../components/design/refined";

const RX = {
  ink: "#16181D",
  brand: "#1B3A6B",
  brandInk: "#0E2547",
  accent: "#E2552E",
  accentSoft: "#FBE9E2",
  line: "#E7E1D4",
  surface2: "#F4F1E9",
  muted: "#5B6270",
};

const refinedPanelSx = {
  p: { xs: 2.5, sm: 3, md: 3.5 },
  borderRadius: "10px",
  backgroundColor: "var(--surface)",
  boxShadow: "0 18px 40px -32px rgba(22,24,29,0.24)",
};

const refinedPrimaryButtonSx = {
  textTransform: "none",
  fontWeight: 600,
  borderRadius: "6px",
  px: 2.5,
  py: 1.15,
  bgcolor: RX.brand,
  color: "#fff",
  boxShadow: "none",
  "&:hover": {
    bgcolor: RX.brandInk,
    boxShadow: "none",
  },
  "&.Mui-disabled": {
    backgroundColor: "rgba(27,58,107,0.32)",
    color: "rgba(255,255,255,0.78)",
  },
};

const refinedGhostButtonSx = {
  textTransform: "none",
  fontWeight: 600,
  borderRadius: "6px",
  px: 2.5,
  py: 1.15,
  color: RX.ink,
  borderColor: RX.line,
  backgroundColor: "transparent",
  boxShadow: "none",
  "&:hover": {
    borderColor: RX.ink,
    backgroundColor: "rgba(0,0,0,0.02)",
    boxShadow: "none",
  },
  "&.Mui-disabled": {
    borderColor: RX.line,
    color: "rgba(22,24,29,0.38)",
  },
};

const refinedTagSx = {
  display: "inline-flex",
  alignItems: "center",
  px: 1.2,
  py: 0.5,
  borderRadius: "999px",
  border: `1px solid ${RX.line}`,
  backgroundColor: RX.surface2,
  color: RX.muted,
  fontSize: "0.78rem",
  fontWeight: 600,
  lineHeight: 1.35,
};

const refinedAccentTagSx = {
  ...refinedTagSx,
  borderColor: "#F3D3C7",
  backgroundColor: RX.accentSoft,
  color: "#B23A18",
};

/** @param {"info" | "success" | "warning" | "error"} tone */
const getRefinedAlertSx = (tone = "info") => {
  let palette;

  switch (tone) {
    case "warning":
      palette = {
        backgroundColor: "rgba(226,85,46,0.08)",
        borderColor: "rgba(226,85,46,0.2)",
        iconColor: RX.accent,
      };
      break;
    case "error":
      palette = {
        backgroundColor: "rgba(176,58,24,0.08)",
        borderColor: "rgba(176,58,24,0.2)",
        iconColor: "#B23A18",
      };
      break;
    case "success":
    case "info":
    default:
      palette = {
        backgroundColor: "rgba(27,58,107,0.05)",
        borderColor: "rgba(27,58,107,0.18)",
        iconColor: RX.brand,
      };
      break;
  }

  return {
    alignItems: "flex-start",
    borderRadius: "10px",
    border: `1px solid ${palette.borderColor}`,
    backgroundColor: palette.backgroundColor,
    color: RX.ink,
    boxShadow: "none",
    "& .MuiAlert-icon": {
      color: palette.iconColor,
      mt: 0.25,
    },
    "& .MuiAlert-message": {
      width: "100%",
    },
    "& a": {
      color: RX.brand,
    },
  };
};

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
  // Guards `loadUserAndFormData` against re-runs when PropelAuth re-emits a new
  // `user` object reference (token refresh, internal SDK updates). Without this
  // guard the effect would re-fire `loadPreviousSubmission` (an API call) on
  // every reference change.
  const userDataLoadedRef = useRef(false);

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
        const externalUrl =
          eventData.constraints?.application_hacker_external_url;
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
        const forceOpen = eventData.constraints?.application_hacker_force_open === true;
        const isEventPast = !forceOpen && endDate.clone().add(1, "day").isBefore(now);

        // Check if applications are closed (deadline has passed)
        const isApplicationsClosed = !forceOpen && now.isAfter(applicationDeadline);

        // Check if event is online/virtual
        const isOnlineEvent = ["Virtual", "Global", "Online"].some((term) =>
          eventData.location?.toLowerCase().includes(term.toLowerCase()),
        );

        // Format application deadline for display
        const tzAbbr = getTimezoneAbbreviation(
          applicationDeadline.toDate(),
          eventTz,
        );
        const formattedApplicationDeadline =
          applicationDeadline.format("dddd, MMMM Do, YYYY [at] h:mm A") +
          ` ${tzAbbr}`;

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

        // Initialize requiredQuestionAnswers to match question count without
        // clobbering answers already loaded from a previous submission /
        // localStorage (these effects resolve independently of this one).
        if (requiredQuestions.length > 0) {
          setFormData((prev) => {
            const existing = prev.requiredQuestionAnswers || [];
            if (existing.length === requiredQuestions.length) return prev;
            const filled = new Array(requiredQuestions.length).fill(null);
            existing.forEach((v, i) => {
              if (i < filled.length) filled[i] = v;
            });
            return { ...prev, requiredQuestionAnswers: filled };
          });
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

  // Build the "Find your team" list from the team codes that already-registered
  // hackers entered for this event. The first hacker on a team types a team code;
  // everyone after can pick it from this list instead of remembering it. Source is
  // the `teamCode` column on the volunteers collection (public hacker endpoint).
  useEffect(() => {
    if (!apiServerUrl || !event_id) return;
    let cancelled = false;
    const fetchTeamCodes = async () => {
      setTeamsLoading(true);
      try {
        const res = await fetch(
          `${apiServerUrl}/api/messages/hackathon/${event_id}/hacker`,
        );
        if (!res.ok) throw new Error(`Failed to load hackers: ${res.status}`);
        const json = await res.json();
        const hackers = Array.isArray(json?.data) ? json.data : [];
        // Tally distinct, non-empty team codes (case-insensitive dedupe; keep the
        // first-seen casing as the display label).
        const byKey = new Map();
        for (const h of hackers) {
          const raw = (h?.teamCode || "").trim();
          if (!raw) continue;
          const key = raw.toLowerCase();
          const existing = byKey.get(key);
          if (existing) existing.count += 1;
          else byKey.set(key, { code: raw, count: 1 });
        }
        const codes = Array.from(byKey.values()).sort((a, b) =>
          a.code.localeCompare(b.code, undefined, { sensitivity: "base" }),
        );
        if (!cancelled) setEventTeams(codes);
      } catch (err) {
        console.warn("Could not load team codes for event browser:", err);
        if (!cancelled) setEventTeams([]);
      } finally {
        if (!cancelled) setTeamsLoading(false);
      }
    };
    fetchTeamCodes();
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
      // Run-once: PropelAuth re-emits `user` on token refresh, which would
      // otherwise re-fire loadPreviousSubmission (an API call) on every emit.
      if (userDataLoadedRef.current) return;
      userDataLoadedRef.current = true;

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
                    requiredQuestionAnswers: Array.isArray(
                      prevData.requiredQuestionAnswers,
                    )
                      ? prevData.requiredQuestionAnswers
                      : [],
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
    scrollToFormCard();
  };

  const scrollToProgressSection = () => {
    if (typeof window === "undefined") {
      return;
    }

    const element = document.getElementById("hacker-application-progress");

    if (!element) {
      return;
    }

    const offset = isMobile ? 80 : 96;

    window.requestAnimationFrame(() => {
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      window.scrollTo({
        top: Math.max(top, 0),
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    });
  };

  const scrollToFormCard = () => {
    if (typeof window === "undefined") {
      return;
    }

    const element = document.getElementById("hacker-application-form");

    if (!element) {
      return;
    }

    const offset = isMobile ? 80 : 96;

    window.requestAnimationFrame(() => {
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      window.scrollTo({
        top: Math.max(top, 0),
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    });
  };

  const validateBasicInfo = () => {
    // Validate required screening questions first
    const questions = eventData?.requiredQuestions || [];
    if (questions.length > 0) {
      const answers = formData.requiredQuestionAnswers || [];
      for (let i = 0; i < questions.length; i++) {
        if (answers[i] === null || answers[i] === undefined) {
          setErrorAndScroll(
            `Please answer the required question: "${questions[i].question}"`,
          );
          return false;
        }
        if (answers[i] !== questions[i].required_answer) {
          setErrorAndScroll(
            questions[i].error ||
              "You do not meet the eligibility requirements for this event.",
          );
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

    const requiredFields = ["country", "state", "ageRange"];

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

    // AZ residents must select a county.
    if (
      formData.country === "United States" &&
      formData.state === "Arizona" &&
      !formData.county
    ) {
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
      trackEvent({
        action: "hacker_app_step",
        params: {
          event_label: steps[activeStep + 1],
          step: activeStep + 2,
          event_id,
          page: "hacker_application",
        },
      });
      scrollToProgressSection();
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    trackEvent({
      action: "hacker_app_step_back",
      params: {
        event_label: steps[activeStep - 1],
        step: activeStep,
        event_id,
        page: "hacker_application",
      },
    });
    // Save progress when moving between steps
    handleManualSave();
    scrollToProgressSection();
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
        // Derive arizonaResident from country + state (kept in payload for any
        // legacy downstream consumers — the user-facing dropdown was removed).
        arizonaResident:
          formData.country === "United States" && formData.state === "Arizona"
            ? "Arizona Resident"
            : "Non-Arizona Resident",
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
      trackEvent({
        action: "hacker_app_submit",
        params: {
          event_label: "success",
          event_id,
          page: "hacker_application",
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
        action: "hacker_app_submit_error",
        params: {
          event_label: err.message,
          event_id,
          page: "hacker_application",
        },
      });
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

  // Render basic information form
  const renderBasicInfoForm = () => (
    <BasicInfoStep
      formData={formData}
      setFormData={setFormData}
      handleChange={handleChange}
      customHandleMultiSelectChange={customHandleMultiSelectChange}
      eventData={eventData}
    />
  );

  // Render skills and experience form
  const renderSkillsAndExperienceForm = () => (
    <SkillsExperienceStep
      formData={formData}
      handleChange={handleChange}
      handleSkillsChange={handleSkillsChange}
      handlePhotoUpload={handlePhotoUpload}
      handlePhotoError={handlePhotoError}
      profileAutofilled={profileAutofilled}
      profile={profile}
      apiServerUrl={apiServerUrl}
      accessToken={accessToken}
      user={user}
    />
  );

  // Render location and demographics form
  const renderLocationDemographicsForm = () => (
    <LocationDemographicsStep
      formData={formData}
      setFormData={setFormData}
      handleChange={handleChange}
      eventData={eventData}
    />
  );

  // Render interests and team formation form
  const renderInterestsTeamsForm = () => (
    <InterestsTeamsStep
      formData={formData}
      setFormData={setFormData}
      handleChange={handleChange}
      handleTeamMatchingChange={handleTeamMatchingChange}
      customHandleMultiSelectChange={customHandleMultiSelectChange}
      saveToLocalStorage={saveToLocalStorage}
      eventTeams={eventTeams}
      teamsLoading={teamsLoading}
      teamSearch={teamSearch}
      setTeamSearch={setTeamSearch}
    />
  );

  // Render review form
  const renderReviewForm = () => (
    <ReviewStep
      formData={formData}
      setFormData={setFormData}
      handleChange={handleChange}
      eventData={eventData}
    />
  );

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
  const canonicalUrl = `https://www.ohack.dev/hack/${event_id}/hacker-application`;

  const imageUrl =
    eventData?.image || "https://cdn.ohack.dev/ohack.dev/2024_hackathon_1.webp";

  // Breadcrumb items for structured data
  const breadcrumbItems = [
    { name: "Home", url: "https://www.ohack.dev" },
    { name: "Hackathons", url: "https://www.ohack.dev/hack" },
    {
      name: eventData?.name || "Hackathon Event",
      url: `https://www.ohack.dev/hack/${event_id}`,
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
      url: "https://www.ohack.dev",
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

  const eventDateLabel = eventData?.formattedStartDate
    ? eventData.formattedEndDate &&
      eventData.formattedStartDate !== eventData.formattedEndDate
      ? `${eventData.formattedStartDate} to ${eventData.formattedEndDate}`
      : eventData.formattedStartDate
    : null;
  const currentStepLabel = steps[activeStep] || steps[0];
  const deadlineTone =
    eventData?.daysUntilDeadline <= 1
      ? "error"
      : eventData?.daysUntilDeadline <= 3
        ? "warning"
        : "info";
  const stepperSx = {
    "& .MuiStepLabel-label": {
      fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
      fontSize: isMobile ? "0.72rem" : "0.92rem",
      fontWeight: 500,
      mt: 1,
      color: RX.muted,
      whiteSpace: isMobile ? "nowrap" : "normal",
    },
    "& .MuiStepLabel-label.Mui-active": {
      color: RX.brand,
      fontWeight: 700,
    },
    "& .MuiStepLabel-label.Mui-completed": {
      color: RX.ink,
      fontWeight: 600,
    },
    "& .MuiStepIcon-root": {
      color: RX.line,
      width: isMobile ? 22 : 28,
      height: isMobile ? 22 : 28,
    },
    "& .MuiStepIcon-root.Mui-active": {
      color: RX.brand,
    },
    "& .MuiStepIcon-root.Mui-completed": {
      color: RX.brand,
    },
    "& .MuiStepIcon-text": {
      fill: "#fff",
    },
    "& .MuiStepConnector-line": {
      borderColor: RX.line,
    },
    ...(isMobile && {
      overflowX: "auto",
      px: 0.5,
      "& .MuiStepLabel-root": {
        px: 0.5,
      },
      "& .MuiStepLabel-labelContainer": {
        width: "auto",
      },
      "&::-webkit-scrollbar": {
        display: "none",
      },
      scrollbarWidth: "none",
    }),
  };

  // If form submitted successfully, show success message
  if (success) {
    return (
      <RefinedRoot>
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
          <meta name="theme-color" content={RX.brand} />
        </Head>

        <Script
          id="hacker-application-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(hackerApplicationStructuredData),
          }}
        />

        <section
          className="ohx-wrap"
          style={{
            paddingTop: "clamp(100px, 12vh, 148px)",
            paddingBottom: "clamp(48px, 8vh, 96px)",
          }}
        >
          <Box sx={{ maxWidth: 760, mx: "auto", textAlign: "center", mb: 4 }}>
            <Eyebrow>Application received</Eyebrow>
            <h1 className="ohx-display" style={{ marginTop: 8 }}>
              Hacker application <span className="ohx-italic">submitted.</span>
            </h1>
            <Typography
              component="p"
              className="ohx-lead"
              sx={{ mt: 2, mx: "auto" }}
            >
              Thanks for applying to {eventData?.name || "Opportunity Hack"}. We
              have your information and will follow up by email with next steps.
            </Typography>
          </Box>

          <Box
            className="ohx-card"
            sx={{ ...refinedPanelSx, maxWidth: 820, mx: "auto" }}
          >
            <Alert
              severity="success"
              sx={{ ...getRefinedAlertSx("success"), mb: 3 }}
            >
              <Typography variant="body1">
                Your application is in. Watch your inbox for review updates,
                acceptance details, and team-matching information.
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
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
                justifyContent: "center",
              }}
            >
              <Button
                variant="contained"
                onClick={() => router.push(`/hack/${event_id}`)}
                sx={refinedPrimaryButtonSx}
              >
                Return to event
              </Button>

              {(formData.teamStatus === "I'd like to be matched with a team" ||
                formData.teamStatus === "I'm looking for team members") && (
                <Button
                  variant="outlined"
                  onClick={() => router.push(`/hack/${event_id}/findteam`)}
                  startIcon={<SearchIcon />}
                  sx={refinedGhostButtonSx}
                >
                  Find a team
                </Button>
              )}
            </Box>
          </Box>
        </section>
      </RefinedRoot>
    );
  }

  return (
    <RefinedRoot>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta
          name="keywords"
          content="hackathon, hacker application, tech for good, nonprofit hackathon, opportunity hack, coding for social good, volunteer, tech projects"
        />
        <link rel="canonical" href={canonicalUrl} />

        <link rel="dns-prefetch" href="//cdn.ohack.dev" />
        <link
          rel="preconnect"
          href="https://cdn.ohack.dev"
          crossOrigin="anonymous"
        />

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

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={imageUrl} />
        <meta
          name="twitter:image:alt"
          content="Developers coding solutions for nonprofits at Opportunity Hack"
        />

        <meta name="robots" content="index, follow" />
        <meta name="author" content="Opportunity Hack" />
        <meta name="theme-color" content={RX.brand} />
      </Head>

      <Script
        id="hacker-application-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(hackerApplicationStructuredData),
        }}
      />

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
          <Box sx={{ maxWidth: 780, mb: 4 }}>
            <Eyebrow>Opportunity Hack application</Eyebrow>
            <h1 className="ohx-display" style={{ marginTop: 8 }}>
              Hacker application <span className="ohx-italic">for good.</span>
            </h1>
            <Typography component="p" className="ohx-lead" sx={{ mt: 2 }}>
              Tell us how you build, collaborate, and want to contribute. We
              review applications early so teams and nonprofit partners can
              start strong.
            </Typography>
          </Box>

          <Box
            className="ohx-card"
            sx={{ ...refinedPanelSx, mb: 3, p: { xs: 2, sm: 2.5, md: 3 } }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "minmax(0,1.35fr) minmax(260px,320px)",
                },
                gap: 3,
                alignItems: "start",
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="overline"
                  sx={{
                    display: "block",
                    color: RX.muted,
                    letterSpacing: "0.16em",
                    mb: 1,
                  }}
                >
                  Current event
                </Typography>
                <Typography
                  component="h2"
                  sx={{
                    fontFamily: "'Fraunces', Georgia, serif",
                    fontWeight: 500,
                    letterSpacing: "-0.015em",
                    fontSize: { xs: "1.7rem", md: "2.15rem" },
                    lineHeight: 1.08,
                    color: RX.ink,
                    mb: 1,
                  }}
                >
                  {eventData?.name || "Loading event details"}
                </Typography>
                <Typography sx={{ color: RX.muted, fontSize: "1rem", mb: 2 }}>
                  {eventData?.location || "Fetching location and timing"}
                </Typography>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                  {eventDateLabel && (
                    <Box component="span" sx={refinedTagSx}>
                      {eventDateLabel}
                    </Box>
                  )}
                  {eventData?.formattedApplicationDeadline && (
                    <Box component="span" sx={refinedTagSx}>
                      Apply by {eventData.formattedApplicationDeadline}
                    </Box>
                  )}
                  <Box component="span" sx={refinedAccentTagSx}>
                    Step {activeStep + 1} of {steps.length}
                  </Box>
                </Box>

                <Typography sx={{ color: RX.muted, maxWidth: "58ch" }}>
                  Build with a team, work from real nonprofit needs, and leave
                  with a shipped portfolio piece instead of a throwaway demo.
                </Typography>
              </Box>

              <Box
                sx={{
                  minHeight: { xs: 220, md: 260 },
                  borderRadius: "10px",
                  overflow: "hidden",
                  border: "1px solid var(--line)",
                  backgroundColor: "var(--surface-2)",
                }}
              >
                <img
                  src={imageUrl}
                  alt="Developers building innovative solutions for nonprofits at Opportunity Hack"
                  width="1200"
                  height="800"
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "block",
                    objectFit: "cover",
                  }}
                />
              </Box>
            </Box>
          </Box>

          <VolunteerCheckInQR
            eventId={event_id}
            volunteerId={volunteerId}
            isSelected={isSelected}
            volunteerType="hacker"
            name={formData.name}
            isSubmitted={true}
            qrSize={200}
            sx={{ mx: "auto", maxWidth: 560, mb: 3 }}
          />

          {event_id && (
            <Box sx={{ mb: 3 }}>
              <ApplicationNav eventId={event_id} currentType="hacker" />
            </Box>
          )}

          {isLoading ? (
            <Box
              className="ohx-card"
              sx={{
                ...refinedPanelSx,
                py: 8,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <CircularProgress sx={{ color: RX.brand }} />
            </Box>
          ) : (
            <Box sx={{ mt: 3, mb: 4 }}>
              {eventData && eventData.isEventPast ? (
                <Box className="ohx-card" sx={refinedPanelSx}>
                  <Alert
                    severity="warning"
                    sx={{ ...getRefinedAlertSx("warning"), mb: 3 }}
                  >
                    <Typography
                      component="h2"
                      sx={{
                        fontFamily: "'Fraunces', Georgia, serif",
                        fontSize: "1.5rem",
                        fontWeight: 500,
                        mb: 1,
                      }}
                    >
                      This event has already ended
                    </Typography>
                    <Typography variant="body1">
                      Applications are no longer being accepted for this
                      hackathon. Head back to the events page to find the next
                      chance to build with a nonprofit.
                    </Typography>
                  </Alert>

                  <Box
                    sx={{ mb: 4, display: "flex", justifyContent: "center" }}
                  >
                    <GiveButterWidget
                      context="event-ended"
                      userId={user?.userId}
                      applicationType="hacker"
                      size="large"
                      onDonationEvent={(eventData) => {
                        console.log(
                          "Event ended hacker donation event:",
                          eventData,
                        );
                      }}
                    />
                  </Box>

                  <Box textAlign="center">
                    <Button
                      variant="contained"
                      onClick={() => router.push("/hack")}
                      sx={refinedPrimaryButtonSx}
                    >
                      View upcoming events
                    </Button>
                  </Box>
                </Box>
              ) : eventData && eventData.isApplicationsClosed ? (
                <Box className="ohx-card" sx={refinedPanelSx}>
                  <Alert
                    severity="warning"
                    sx={{ ...getRefinedAlertSx("warning"), mb: 3 }}
                  >
                    <Typography
                      component="h2"
                      sx={{
                        fontFamily: "'Fraunces', Georgia, serif",
                        fontSize: "1.5rem",
                        fontWeight: 500,
                        mb: 1,
                      }}
                    >
                      Applications are now closed
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      The deadline passed on{" "}
                      <strong>{eventData.formattedApplicationDeadline}</strong>{" "}
                      so we have time to review submissions and send decisions
                      before the event starts.
                    </Typography>
                    <Typography variant="body2" sx={{ color: RX.muted }}>
                      The hackathon begins on {eventData.formattedStartDate}. If
                      you believe this is an error or have special
                      circumstances, please{" "}
                      <Link href="/contact" underline="hover">
                        contact the organizers
                      </Link>{" "}
                      right away.
                    </Typography>
                  </Alert>

                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      justifyContent: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <Button
                      variant="contained"
                      onClick={() => router.push(`/hack/${event_id}`)}
                      sx={refinedPrimaryButtonSx}
                    >
                      View event details
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => router.push("/hack")}
                      sx={refinedGhostButtonSx}
                    >
                      View other events
                    </Button>
                  </Box>
                </Box>
              ) : (
                <>
                  <Box
                    id="hacker-application-progress"
                    className="ohx-card"
                    sx={{ ...refinedPanelSx, mb: 3, p: { xs: 2, sm: 3 } }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 2,
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: { xs: "flex-start", sm: "flex-end" },
                        mb: 2,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="overline"
                          sx={{
                            display: "block",
                            color: RX.muted,
                            letterSpacing: "0.16em",
                            mb: 0.5,
                          }}
                        >
                          Application progress
                        </Typography>
                        <Typography
                          component="h2"
                          sx={{
                            fontFamily: "'Fraunces', Georgia, serif",
                            fontWeight: 500,
                            letterSpacing: "-0.01em",
                            fontSize: { xs: "1.35rem", sm: "1.55rem" },
                            color: RX.ink,
                          }}
                        >
                          Step {activeStep + 1}: {currentStepLabel}
                        </Typography>
                      </Box>
                      <Typography sx={{ color: RX.muted }}>
                        {activeStep + 1} of {steps.length} sections
                      </Typography>
                    </Box>

                    <Stepper
                      activeStep={activeStep}
                      alternativeLabel={!isMobile}
                      orientation="horizontal"
                      sx={stepperSx}
                    >
                      {steps.map((label, index) => (
                        <Step key={label}>
                          <StepLabel>
                            {isMobile
                              ? activeStep === index
                                ? label
                                : index + 1
                              : label}
                          </StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                  </Box>

                  <Box
                    id="hacker-application-form"
                    className="ohx-card"
                    sx={{ ...refinedPanelSx, p: { xs: 2.5, sm: 3, md: 4 } }}
                  >
                    <Box
                      sx={{
                        display: "grid",
                        gap: 2,
                        gridTemplateColumns: {
                          xs: "1fr",
                          lg: "minmax(0,1.1fr) minmax(280px,0.9fr)",
                        },
                        mb: 4,
                      }}
                    >
                      <Box
                        sx={{
                          p: { xs: 2, md: 2.5 },
                          borderRadius: "10px",
                          border: "1px solid var(--line)",
                          backgroundColor: "var(--surface-2)",
                          minHeight: "100%",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Typography
                          variant="overline"
                          sx={{
                            display: "block",
                            color: RX.muted,
                            letterSpacing: "0.16em",
                            mb: 0.75,
                          }}
                        >
                          What to expect
                        </Typography>
                        <Typography
                          component="h2"
                          sx={{
                            fontFamily: "'Fraunces', Georgia, serif",
                            fontWeight: 500,
                            fontSize: { xs: "1.35rem", sm: "1.6rem" },
                            lineHeight: 1.15,
                            color: RX.ink,
                            mb: 1,
                          }}
                        >
                          Hackers ship real work for nonprofits
                        </Typography>
                        <Typography sx={{ color: RX.muted, mb: 1.5 }}>
                          We use this application to understand your skills,
                          team preferences, and the kind of support you will
                          need during the event.
                        </Typography>
                        <Box
                          component="ul"
                          sx={{
                            mb: 0,
                            pl: 2.25,
                            color: RX.ink,
                            "& li": { mb: 0.75 },
                            "& li:last-child": { mb: 0 },
                          }}
                        >
                          <li>
                            Work in teams to solve real nonprofit challenges.
                          </li>
                          <li>
                            Learn from mentors, judges, and nonprofit partners.
                          </li>
                          <li>
                            Ship something portfolio-worthy instead of a
                            throwaway demo.
                          </li>
                          <li>
                            Present your solution and build new connections.
                          </li>
                        </Box>
                      </Box>

                      {eventData && (
                        <Box
                          sx={{
                            p: { xs: 2, md: 2.5 },
                            borderRadius: "10px",
                            border:
                              deadlineTone === "info"
                                ? `1px solid ${RX.line}`
                                : "1px solid rgba(226,85,46,0.22)",
                            backgroundColor:
                              deadlineTone === "info"
                                ? "var(--surface-2)"
                                : "rgba(226,85,46,0.06)",
                            minHeight: "100%",
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <Typography
                            variant="overline"
                            sx={{
                              display: "block",
                              color: RX.muted,
                              letterSpacing: "0.16em",
                              mb: 0.75,
                            }}
                          >
                            Application deadline
                          </Typography>
                          <Typography
                            component="h3"
                            sx={{
                              fontFamily: "'Fraunces', Georgia, serif",
                              fontWeight: 500,
                              fontSize: { xs: "1.35rem", sm: "1.6rem" },
                              lineHeight: 1.15,
                              color: RX.ink,
                              mb: 1,
                            }}
                          >
                            Apply before kickoff
                          </Typography>
                          <Typography sx={{ color: RX.muted, mb: 1.5 }}>
                            Applications close on{" "}
                            {eventData.formattedApplicationDeadline}.
                          </Typography>
                          {eventData.hoursUntilDeadline > 0 && (
                            <Box
                              component="span"
                              sx={{
                                ...(deadlineTone === "info"
                                  ? refinedTagSx
                                  : refinedAccentTagSx),
                                alignSelf: "flex-start",
                                mb: 1.5,
                              }}
                            >
                              {eventData.daysUntilDeadline > 0
                                ? `${eventData.daysUntilDeadline} day${eventData.daysUntilDeadline !== 1 ? "s" : ""} remaining`
                                : `${eventData.hoursUntilDeadline} hour${eventData.hoursUntilDeadline !== 1 ? "s" : ""} remaining`}
                            </Box>
                          )}
                          <Typography sx={{ color: RX.muted }}>
                            We close applications ahead of kickoff so we can
                            review submissions and send decisions before the
                            hackathon begins on {eventData.formattedStartDate}.
                          </Typography>
                          {eventData.daysUntilDeadline <= 1 && (
                            <Typography
                              sx={{
                                mt: 1.5,
                                color: RX.ink,
                                fontWeight: 600,
                              }}
                            >
                              Deadline is close. Submit as early as you can.
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Box>

                    {(error || recaptchaError) && (
                      <Alert
                        severity="error"
                        sx={{ ...getRefinedAlertSx("error"), mb: 3 }}
                      >
                        {error || recaptchaError}
                      </Alert>
                    )}

                    <Divider sx={{ borderColor: RX.line, mb: 3 }} />

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
                          alignItems: "center",
                          gap: 2,
                          mt: 4,
                          flexDirection: { xs: "column-reverse", sm: "row" },
                        }}
                      >
                        <Button
                          disabled={activeStep === 0 || submitting}
                          onClick={handleBack}
                          variant="outlined"
                          sx={{
                            ...refinedGhostButtonSx,
                            minWidth: 120,
                            alignSelf: { xs: "stretch", sm: "auto" },
                          }}
                        >
                          Back
                        </Button>

                        <Button
                          variant="contained"
                          onClick={handleNext}
                          disabled={
                            submitting ||
                            recaptchaLoading ||
                            (eventData &&
                              (eventData.isApplicationsClosed ||
                                eventData.isEventPast))
                          }
                          endIcon={
                            !(submitting || recaptchaLoading) ? (
                              <Arrow />
                            ) : undefined
                          }
                          sx={{
                            ...refinedPrimaryButtonSx,
                            minWidth: 180,
                            alignSelf: { xs: "stretch", sm: "auto" },
                          }}
                        >
                          {activeStep === steps.length - 1 ? (
                            submitting || recaptchaLoading ? (
                              <CircularProgress
                                size={24}
                                sx={{ color: "#fff" }}
                              />
                            ) : isDepositRequired() &&
                              !formData.stripePaymentIntentId ? (
                              "Continue to deposit"
                            ) : (
                              "Submit application"
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
        <meta name="theme-color" content={RX.brand} />
        <RefinedFonts />
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
                url: "https://www.ohack.dev",
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
            postLoginRedirectUrl={
              currentUrl ||
              (typeof window !== "undefined" ? window.location.href : undefined)
            }
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
    canonicalUrl: `https://www.ohack.dev/hack/${event_id}/hacker-application`,
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
            title: `Join ${eventData.title} | Build Tech Solutions for Nonprofits`,
            description: `Join ${eventData.title} in ${eventData.location || "Tempe, Arizona"}. Build innovative tech solutions for nonprofits and make a real social impact through code.`,
            eventName: eventData.title,
            location: eventData.location || "Tempe, Arizona",
            canonicalUrl: `https://www.ohack.dev/hack/${event_id}/hacker-application`,
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
