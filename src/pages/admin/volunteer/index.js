import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuthInfo, withRequiredAuthInfo } from "@propelauth/react";
import { useRouter } from "next/router";
import Head from "next/head";
import {
  Box,
  Grid,
  CircularProgress,
  TextField,
  Button,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Tooltip,
  Alert,
  Snackbar as MuiSnackbar,
  Typography,
  useTheme,
  useMediaQuery,
  Stack,
  Collapse,
  Card,
  CardContent,
} from "@mui/material";
import { Share as ShareIcon, ContentCopy as CopyIcon } from "@mui/icons-material";

// Import components individually to avoid circular dependencies
import AdminPage from "../../../components/admin/AdminPage";
import VolunteerTable from "../../../components/admin/VolunteerTable";
import VolunteerEditDialog from "../../../components/admin/VolunteerEditDialog";  
import ApplicationReviewList from "../../../components/admin/ApplicationReviewList";
import ApplicationEditDialog from "../../../components/admin/ApplicationEditDialog";
import VolunteerCommunication from "../../../components/admin/VolunteerCommunication";
import SlackInviteDialog from "../../../components/admin/SlackInviteDialog";
import BatchEmailDialog from "../../../components/admin/BatchEmailDialog";
import BulkCertificateDialog from "../../../components/admin/BulkCertificateDialog";
import HackerDepositRefundDialog from "../../../components/admin/HackerDepositRefundDialog";
import useHackathonEvents from "../../../hooks/use-hackathon-events";

// Define initial state outside component to prevent re-initialization
const INITIAL_VOLUNTEERS_STATE = {
  mentors: [],
  judges: [],
  volunteers: [],
  hackers: [],
  sponsors: []
};

const INITIAL_SNACKBAR_STATE = {
  open: false,
  message: "",
  severity: "success",
};

// Move this function outside component to avoid circular dependency issues
const getCurrentVolunteerType = (currentTabValue) => {
  switch (currentTabValue) {
    case 0:
      return "mentors";
    case 1:
      return "judges";
    case 2:
      return "volunteers";
    case 3:
      return "hackers";
    case 4:
      return "sponsors";
    default:
      return "";
  }
};

const getCurrentVolunteerTypeSingular = (currentTabValue) => {
  switch (currentTabValue) {
    case 0:
      return "mentor";
    case 1:
      return "judge";
    case 2:
      return "volunteer";
    case 3:
      return "hacker";
    case 4:
      return "sponsor";
    default:
      return "";
  }
};

const AdminVolunteerPage = withRequiredAuthInfo(({ userClass }) => {
  // Early returns for safety
  if (!userClass) {
    return <div>Loading...</div>;
  }

  const { accessToken } = useAuthInfo();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Defensive hook usage with fallbacks
  const { hackathons = [] } = useHackathonEvents(false) || {};

  const [volunteers, setVolunteers] = useState(INITIAL_VOLUNTEERS_STATE);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState(INITIAL_SNACKBAR_STATE);
  const [orderBy, setOrderBy] = useState("name");
  const [order, setOrder] = useState("asc");
  const [filter, setFilter] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState("");
  // Full event doc for the selected event — used to read constraints
  // (currently just hacker_deposit.enabled). Fetched separately because the
  // hackathons LIST endpoint doesn't include the `constraints` blob.
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [depositDialogVolunteer, setDepositDialogVolunteer] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // "table" or "review"
  const [applicationEditDialogOpen, setApplicationEditDialogOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [communicationDialogOpen, setCommunicationDialogOpen] = useState(false);
  const [selectedVolunteerForMessage, setSelectedVolunteerForMessage] = useState(null);
  const [slackInviteDialogOpen, setSlackInviteDialogOpen] = useState(false);
  const [volunteersForSlackInvite, setVolunteersForSlackInvite] = useState([]);
  const [volunteerTypeForSlackInvite, setVolunteerTypeForSlackInvite] = useState('');
  const [batchEmailDialogOpen, setBatchEmailDialogOpen] = useState(false);
  const [volunteersForBatchEmail, setVolunteersForBatchEmail] = useState([]);
  const [volunteerTypeForBatchEmail, setVolunteerTypeForBatchEmail] = useState('');
  const [isSelectedUsersForEmail, setIsSelectedUsersForEmail] = useState(true);
  const [bulkCertificateDialogOpen, setBulkCertificateDialogOpen] = useState(false);
  const [volunteersForBulkCertificate, setVolunteersForBulkCertificate] = useState([]);
  const [volunteerTypeForBulkCertificate, setVolunteerTypeForBulkCertificate] = useState('');
  const [shareSnackbar, setShareSnackbar] = useState({ open: false, message: '' });

  // Filter state management
  const [filterStates, setFilterStates] = useState({
    mentors: {
      filter: '',
      statusFilter: 'all',
      inPersonFilter: 'all',
      checkedInFilter: 'all',
      sortBy: 'timestamp',
      sortOrder: 'desc',
      showBatchActions: false
    },
    judges: {
      filter: '',
      statusFilter: 'all',
      inPersonFilter: 'all',
      checkedInFilter: 'all',
      sortBy: 'timestamp',
      sortOrder: 'desc',
      showBatchActions: false
    },
    volunteers: {
      filter: '',
      statusFilter: 'all',
      inPersonFilter: 'all',
      checkedInFilter: 'all',
      sortBy: 'timestamp',
      sortOrder: 'desc',
      showBatchActions: false
    },
    hackers: {
      filter: '',
      statusFilter: 'all',
      inPersonFilter: 'all',
      checkedInFilter: 'all',
      sortBy: 'timestamp',
      sortOrder: 'desc',
      showBatchActions: false
    },
    sponsors: {
      filter: '',
      statusFilter: 'all',
      inPersonFilter: 'all',
      checkedInFilter: 'all',
      sortBy: 'timestamp',
      sortOrder: 'desc',
      showBatchActions: false
    }
  });

  // Refs for scroll position preservation
  const scrollContainerRef = useRef(null);
  const savedScrollPositionRef = useRef(0);
  const lastUrlRef = useRef('');
  const dataLoadedRef = useRef(false);
  const initializedFromUrlRef = useRef(false);

  // Save scroll position when navigating away and restore when returning
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (scrollContainerRef.current) {
        savedScrollPositionRef.current = scrollContainerRef.current.scrollTop;
        // Store in sessionStorage as a backup
        sessionStorage.setItem('volunteer-admin-scroll', savedScrollPositionRef.current.toString());
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && scrollContainerRef.current) {
        savedScrollPositionRef.current = scrollContainerRef.current.scrollTop;
        sessionStorage.setItem('volunteer-admin-scroll', savedScrollPositionRef.current.toString());
      } else if (!document.hidden && scrollContainerRef.current) {
        // Restore scroll position when page becomes visible again
        const savedPosition = savedScrollPositionRef.current || 
                             parseInt(sessionStorage.getItem('volunteer-admin-scroll') || '0', 10);
        
        if (savedPosition > 0) {
          setTimeout(() => {
            if (scrollContainerRef.current) {
              scrollContainerRef.current.scrollTop = savedPosition;
              savedScrollPositionRef.current = savedPosition;
            }
          }, 100);
        }
      }
    };

    const handlePopState = () => {
      // Handle browser back/forward navigation
      const savedPosition = parseInt(sessionStorage.getItem('volunteer-admin-scroll') || '0', 10);
      if (savedPosition > 0 && scrollContainerRef.current) {
        setTimeout(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = savedPosition;
          }
        }, 100);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('popstate', handlePopState);

    // Restore scroll position on initial load if available
    const savedPosition = parseInt(sessionStorage.getItem('volunteer-admin-scroll') || '0', 10);
    if (savedPosition > 0) {
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = savedPosition;
        }
      }, 200);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Defensive org access with null checks
  const org = userClass?.getOrgByName?.("Opportunity Hack Org");
  const isAdmin = org?.hasPermission?.("volunteer.admin") ?? false;
  const orgId = org?.orgId;

  // Early return if not admin to prevent further execution
  if (!isAdmin) {
    return (
      <AdminPage title="Volunteer Management" isAdmin={false}>
        <Typography>You do not have permission to view this page.</Typography>
      </AdminPage>
    );
  }
  
  // Handle URL parameters and set initial state with defensive checks
  // Only runs for initialization — once event ID is set from URL, stops overriding user selections
  useEffect(() => {
    if (!router?.query) return;
    if (!Array.isArray(hackathons) || hackathons.length === 0) return;
    if (initializedFromUrlRef.current) return;

    const {
      event_id,
      tab,
      filter,
      statusFilter,
      inPersonFilter,
      checkedInFilter,
      sortBy,
      sortOrder,
      showBatchActions,
      volunteer_id,
      volunteer_type
    } = router.query;

    if (event_id && hackathons.some(h => h?.event_id === event_id)) {
      setSelectedEventId(event_id);
    } else {
      // Sort hackathons by date (descending) and use the most recent one
      const sortedHackathons = [...hackathons]
        .filter(h => h?.start_date) // Filter out invalid entries
        .sort((a, b) => {
          const dateA = new Date(a.start_date);
          const dateB = new Date(b.start_date);
          return dateB - dateA; // Most recent first
        });

      if (sortedHackathons.length > 0) {
        setSelectedEventId(sortedHackathons[0].event_id);
      }
    }

    initializedFromUrlRef.current = true;

    // Handle volunteer_type parameter to set correct tab
    if (volunteer_type && !tab) {
      const typeToTabMap = {
        mentor: 0,
        judge: 1,
        volunteer: 2,
        hacker: 3,
        sponsor: 4
      };
      if (typeToTabMap[volunteer_type] !== undefined) {
        setTabValue(typeToTabMap[volunteer_type]);
      }
    } else if (tab !== undefined) {
      const tabIndex = parseInt(tab, 10);
      if (tabIndex >= 0 && tabIndex <= 4) {
        setTabValue(tabIndex);
      }
    }

    // Handle filter state restoration and volunteer_id filtering
    const finalTabValue = volunteer_type && !tab ?
      ({ mentor: 0, judge: 1, volunteer: 2, hacker: 3, sponsor: 4 })[volunteer_type] || tabValue :
      (tab !== undefined ? parseInt(tab, 10) : tabValue);

    if (finalTabValue >= 0 && finalTabValue <= 4) {
      const currentType = getCurrentVolunteerType(finalTabValue);
      if (currentType) {
        const filterToApply = volunteer_id ? volunteer_id : (filter || '');

        if (filterToApply || statusFilter || inPersonFilter || checkedInFilter || sortBy || sortOrder || showBatchActions) {
          setFilterStates(prev => ({
            ...prev,
            [currentType]: {
              filter: filterToApply,
              statusFilter: statusFilter || 'all',
              inPersonFilter: inPersonFilter || 'all',
              checkedInFilter: checkedInFilter || 'all',
              sortBy: sortBy || 'timestamp',
              sortOrder: sortOrder || 'desc',
              showBatchActions: showBatchActions === 'true'
            }
          }));
        }

        // If we have volunteer_id, also set the global filter
        if (volunteer_id) {
          setFilter(volunteer_id);
        }
      }
    }
  }, [hackathons, router?.query]);

  // Update URL when selectedEventId, tabValue, or filter states change
  useEffect(() => {
    if (!router?.replace || !selectedEventId || !Array.isArray(hackathons) || hackathons.length === 0) {
      return;
    }
    
    try {
      const currentFilterState = getCurrentFilterState();
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.set('event_id', selectedEventId);
      queryParams.set('tab', tabValue.toString());
      
      // Add filter parameters if they differ from defaults
      if (currentFilterState.filter) {
        queryParams.set('filter', currentFilterState.filter);
      }
      if (currentFilterState.statusFilter !== 'all') {
        queryParams.set('statusFilter', currentFilterState.statusFilter);
      }
      if (currentFilterState.inPersonFilter !== 'all') {
        queryParams.set('inPersonFilter', currentFilterState.inPersonFilter);
      }
      if (currentFilterState.checkedInFilter !== 'all') {
        queryParams.set('checkedInFilter', currentFilterState.checkedInFilter);
      }
      if (currentFilterState.sortBy !== 'timestamp') {
        queryParams.set('sortBy', currentFilterState.sortBy);
      }
      if (currentFilterState.sortOrder !== 'desc') {
        queryParams.set('sortOrder', currentFilterState.sortOrder);
      }
      if (currentFilterState.showBatchActions) {
        queryParams.set('showBatchActions', 'true');
      }
      
      const newUrl = `${router.pathname}?${queryParams.toString()}`;
      
      // Only update URL if it's actually different to prevent unnecessary re-renders
      if (lastUrlRef.current !== newUrl) {
        lastUrlRef.current = newUrl;
        
        const newQuery = Object.fromEntries(queryParams);
        router.replace({
          pathname: router.pathname,
          query: newQuery
        }, undefined, { shallow: true });
      }
    } catch (error) {
      console.warn('Failed to update URL:', error);
    }
  }, [selectedEventId, tabValue, filterStates, router, hackathons]);

  const fetchVolunteers = useCallback(async () => {
    if (!selectedEventId || !accessToken || !orgId) {
      console.warn('Missing required parameters for fetchVolunteers');
      return;
    }
    
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_SERVER_URL;
      if (!baseUrl) {
        throw new Error('API server URL not configured');
      }

      const endpoints = [
        `${baseUrl}/api/messages/admin/hackathon/${selectedEventId}/mentor`,
        `${baseUrl}/api/messages/admin/hackathon/${selectedEventId}/judge`,
        `${baseUrl}/api/messages/admin/hackathon/${selectedEventId}/volunteer`,
        `${baseUrl}/api/messages/admin/hackathon/${selectedEventId}/hacker`,
        `${baseUrl}/api/messages/admin/hackathon/${selectedEventId}/sponsor`,
      ];

      const headers = {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
        "X-Org-Id": orgId,
      };

      const responses = await Promise.allSettled(
        endpoints.map(url => fetch(url, { headers }))
      );

      // Process responses safely
      const responseData = { ...INITIAL_VOLUNTEERS_STATE };
      const keys = ['mentors', 'judges', 'volunteers', 'hackers', 'sponsors'];

      for (let i = 0; i < responses.length; i++) {
        const result = responses[i];
        const key = keys[i];
        
        if (result.status === 'fulfilled' && result.value?.ok) {
          try {
            const data = await result.value.json();
            responseData[key] = Array.isArray(data?.data) ? data.data : [];
          } catch (jsonError) {
            console.warn(`Failed to parse JSON for ${key}:`, jsonError);
            responseData[key] = [];
          }
        } else {
          console.warn(`Failed to fetch ${key}:`, result.reason || 'Unknown error');
          responseData[key] = [];
        }
      }
      
      setVolunteers(responseData);
      
    } catch (error) {
      console.error("Error fetching volunteers:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch volunteers. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [accessToken, orgId, selectedEventId]);

  useEffect(() => {
    if (isAdmin && selectedEventId && accessToken && orgId) {
      // Only fetch if we don't already have data for this event, or if data is explicitly stale
      const hasCurrentEventData = volunteers.mentors.length > 0 || 
                                  volunteers.judges.length > 0 || 
                                  volunteers.volunteers.length > 0 || 
                                  volunteers.hackers.length > 0 || 
                                  volunteers.sponsors.length > 0;
      
      if (!dataLoadedRef.current || !hasCurrentEventData) {
        fetchVolunteers();
        dataLoadedRef.current = true;
      }
    }
  }, [isAdmin, selectedEventId, accessToken, orgId]);

  // Load the full event doc so we can read constraints.hacker_deposit.enabled.
  // The hackathons list endpoint omits `constraints`, so we fetch the event
  // individually. Reset on event change so a stale `selectedEvent` from the
  // previous event can't leak the wrong deposit column visibility.
  useEffect(() => {
    if (!selectedEventId) {
      setSelectedEvent(null);
      return;
    }
    let cancelled = false;
    const apiServerUrl = process.env.NEXT_PUBLIC_API_SERVER_URL;
    if (!apiServerUrl) return;
    setSelectedEvent(null);
    (async () => {
      try {
        const res = await fetch(
          `${apiServerUrl}/api/messages/hackathon/${selectedEventId}`,
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setSelectedEvent(data);
      } catch (e) {
        if (!cancelled) console.warn("Failed to load event for admin:", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedEventId]);

  const depositEnabled = Boolean(
    selectedEvent?.constraints?.hacker_deposit?.enabled,
  );

  const handleDepositClick = useCallback((volunteer) => {
    setDepositDialogVolunteer(volunteer);
  }, []);

  const handleDepositRefunded = useCallback(() => {
    // Re-fetch hackers so the chip/state updates immediately.
    dataLoadedRef.current = false;
    fetchVolunteers();
    setSnackbar({
      open: true,
      message: "Deposit refunded successfully",
      severity: "success",
    });
  }, [fetchVolunteers]);

  const handleRequestSort = useCallback(
    (property) => {
      const isAsc = orderBy === property && order === "asc";
      setOrder(isAsc ? "desc" : "asc");
      setOrderBy(property);
    },
    [order, orderBy]
  );

  const handleTabChange = useCallback((event, newValue) => {
    setTabValue(newValue);
    // Clear scroll position when switching tabs for fresh start
    savedScrollPositionRef.current = 0;
    sessionStorage.removeItem('volunteer-admin-scroll');
  }, []);

  const handleEventChange = useCallback((eventId) => {
    setSelectedEventId(eventId);
    // Reset data loaded flag when event changes to ensure fresh data
    dataLoadedRef.current = false;
  }, []);

  const getCurrentEventName = useCallback(() => {
    if (!selectedEventId || !Array.isArray(hackathons)) return 'Volunteer Management';
    const currentEvent = hackathons.find(h => h?.event_id === selectedEventId);
    return currentEvent ? `${currentEvent.event_id} - ${currentEvent.start_date}` : 'Volunteer Management';
  }, [selectedEventId, hackathons]);

  const generateShareLink = useCallback(() => {
    if (!selectedEventId || typeof window === 'undefined') return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/admin/volunteer?event_id=${selectedEventId}&tab=${tabValue}`;
  }, [selectedEventId, tabValue]);

  const handleShareLink = useCallback(() => {
    const shareUrl = generateShareLink();
    if (navigator.share) {
      navigator.share({
        title: `Volunteer Management - ${getCurrentEventName()}`,
        url: shareUrl,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setShareSnackbar({ open: true, message: 'Link copied to clipboard!' });
      }).catch(() => {
        setShareSnackbar({ open: true, message: 'Failed to copy link' });
      });
    }
  }, [generateShareLink, getCurrentEventName]);

  const getPageTitle = useCallback(() => {
    const eventName = getCurrentEventName();
    const tabNames = ['Mentors', 'Judges', 'Volunteers', 'Hackers', 'Sponsors'];
    const currentTab = tabNames[tabValue] || 'Volunteer';
    return `${currentTab} - ${eventName}`;
  }, [getCurrentEventName, tabValue]);

  const handleEditChange = useCallback((field, value) => {
    setEditingVolunteer((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Filter state management helpers
  const updateFilterState = useCallback((field, value) => {
    const currentType = getCurrentVolunteerType(tabValue);
    if (!currentType) return;

    setFilterStates(prev => ({
      ...prev,
      [currentType]: {
        ...prev[currentType],
        [field]: value
      }
    }));
  }, [tabValue]);

  const getCurrentFilterState = useCallback(() => {
    const currentType = getCurrentVolunteerType(tabValue);
    return filterStates[currentType] || {
      filter: '',
      statusFilter: 'all',
      inPersonFilter: 'all',
      checkedInFilter: 'all',
      sortBy: 'timestamp',
      sortOrder: 'desc',
      showBatchActions: false
    };
  }, [tabValue, filterStates]);

  // Get searchable fields for each volunteer type
  const getSearchableFields = useCallback((volunteer, type) => {
    // Helper function to safely get field value
    const getFieldValue = (field) => {
      if (field === null || field === undefined) return '';
      if (typeof field === 'string') return field.trim();
      if (typeof field === 'boolean') return field.toString();
      if (Array.isArray(field)) return field.join(' ');
      return field.toString();
    };

    const commonFields = [
      volunteer.name,
      volunteer.email,
      volunteer.pronouns,
      volunteer.company,
      volunteer.companyName,
      volunteer.linkedinProfile
    ];

    switch (type) {
      case "mentors":
        return [
          ...commonFields,
          volunteer.expertise,
          volunteer.country,
          volunteer.state,
          volunteer.title,
          volunteer.bio,
          volunteer.availability,
          volunteer.mentorshipAreas,
          volunteer.previousMentoring
        ].map(getFieldValue);

      case "judges":
        return [
          ...commonFields,
          volunteer.title,
          volunteer.background,
          volunteer.backgroundAreas,
          volunteer.biography,
          volunteer.shortBio,
          volunteer.shortBiography,
          volunteer.whyJudge,
          volunteer.additionalInfo,
          volunteer.availability,
          volunteer.canAttendJudging,
          volunteer.participationCount,
          volunteer.otherBackground,
          volunteer.country,
          volunteer.state,
          volunteer.inPerson
        ].map(getFieldValue);

      case "volunteers":
        return [
          ...commonFields,
          volunteer.title,
          volunteer.volunteerType,
          volunteer.volunteerRole,
          volunteer.experienceLevel,
          volunteer.availability,
          volunteer.availableDays,
          volunteer.skills,
          volunteer.previousVolunteering,
          volunteer.motivation,
          volunteer.bio,
          volunteer.shortBio,
          volunteer.socialCauses,
          volunteer.otherSocialCause,
          volunteer.linkedin,
          volunteer.linkedinProfile,
          volunteer.portfolio,
          ...(volunteer.artifacts || []).map(artifact => [
            artifact.label,
            artifact.comment
          ]).flat()
        ].map(getFieldValue);

      case "hackers":
        return [
          ...commonFields,
          volunteer.participantType,
          volunteer.experienceLevel,
          volunteer.teamStatus,
          volunteer.primaryRoles,
          volunteer.skills,
          volunteer.schoolOrganization,
          volunteer.bio,
          volunteer.motivation,
          volunteer.socialCauses,
          volunteer.github,
          volunteer.portfolio
        ].map(getFieldValue);

      case "sponsors":
        return [
          ...commonFields,
          volunteer.sponsorshipTypes,
          volunteer.sponsorshipTier,
          volunteer.sponsorshipDetails,
          volunteer.sponsorshipLevel,
          volunteer.title,
          volunteer.contactName,
          volunteer.industry,
          volunteer.employeeCount,
          volunteer.website,
          volunteer.specialRequests,
          volunteer.bio,
          volunteer.volunteerType,
          volunteer.volunteerCount,
          volunteer.volunteerHours,
          volunteer.phoneNumber,
          volunteer.preferredContact,
          volunteer.useLogo,
          volunteer.howHeard,
          volunteer.otherInvolvement
        ].map(getFieldValue);

      default:
        return commonFields.map(getFieldValue);
    }
  }, []);

  const handleEditVolunteer = useCallback(
    (volunteer) => {
      setEditingVolunteer({
        ...volunteer,
        type: getCurrentVolunteerType(tabValue),
      });
      setIsAdding(false);
      setEditDialogOpen(true);
    },
    [tabValue]
  );

  const handleMessageVolunteer = useCallback((volunteer) => {
    setSelectedVolunteerForMessage({
      ...volunteer,
      type: getCurrentVolunteerType(tabValue),
    });
    setCommunicationDialogOpen(true);
  }, [tabValue]);

  const handleSlackInvite = useCallback((volunteers, type) => {
    setVolunteersForSlackInvite(volunteers);
    setVolunteerTypeForSlackInvite(type);
    setSlackInviteDialogOpen(true);
  }, []);

  const handleSlackInviteComplete = useCallback((summary) => {
    setSnackbar({
      open: true,
      message: `Slack invitations completed: ${summary.successful} successful, ${summary.failed} failed`,
      severity: summary.failed > 0 ? "warning" : "success",
    });
    setSlackInviteDialogOpen(false);
    setVolunteersForSlackInvite([]);
    setVolunteerTypeForSlackInvite('');
  }, []);

  const handleBatchEmail = useCallback((volunteers, type, isSelected = true) => {
    setVolunteersForBatchEmail(volunteers);
    setVolunteerTypeForBatchEmail(type);
    setIsSelectedUsersForEmail(isSelected);
    setBatchEmailDialogOpen(true);
  }, []);

  const handleBatchEmailComplete = useCallback((summary) => {
    const messageType = isSelectedUsersForEmail ? 'Batch emails' : 'Rejection emails';
    setSnackbar({
      open: true,
      message: `${messageType} completed: ${summary.successful} successful, ${summary.failed} failed`,
      severity: summary.failed > 0 ? "warning" : "success",
    });
    setBatchEmailDialogOpen(false);
    setVolunteersForBatchEmail([]);
    setVolunteerTypeForBatchEmail('');
    setIsSelectedUsersForEmail(true);
  }, [isSelectedUsersForEmail]);

  const handleBulkCertificate = useCallback((volunteers, type) => {
    setVolunteersForBulkCertificate(volunteers);
    setVolunteerTypeForBulkCertificate(type);
    setBulkCertificateDialogOpen(true);
  }, []);

  const handleBulkCertificateComplete = useCallback((summary) => {
    setSnackbar({
      open: true,
      message: `Bulk certificates completed: ${summary.successful} successful, ${summary.failed} failed`,
      severity: summary.failed > 0 ? "warning" : "success",
    });
    setBulkCertificateDialogOpen(false);
    setVolunteersForBulkCertificate([]);
    setVolunteerTypeForBulkCertificate('');
    // Optionally refresh volunteers data to reflect updated heart counts
    dataLoadedRef.current = false;
    fetchVolunteers();
  }, [fetchVolunteers]);

  const handleAddSingleVolunteer = useCallback(() => {
    setEditingVolunteer({
      type: getCurrentVolunteerType(tabValue),
      name: "",
      photoUrl: "",
      linkedinProfile: "",
      isInPerson: false,
      isSelected: false,
      pronouns: "",
      slack_user_id: "",
    });
    setIsAdding(true);
    setEditDialogOpen(true);
  }, [tabValue]);

  const handleSaveEdit = useCallback(async () => {
    if (!selectedEventId) return;
    
    setLoading(true);
    try {
      const url = `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${selectedEventId}/${getCurrentVolunteerTypeSingular(tabValue)}`;
      const method = isAdding ? "POST" : "PATCH";

      const volunteerData = {
        ...editingVolunteer,
        timestamp: isAdding
          ? new Date().toISOString()
          : editingVolunteer.timestamp,
      };

      const response = await fetch(url, {
        method: method,
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
          "X-Org-Id": orgId,
        },
        body: JSON.stringify(volunteerData),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: isAdding
            ? "Volunteer added successfully"
            : "Volunteer updated successfully",
          severity: "success",
        });
        // Reset data flag to force refresh after editing
        dataLoadedRef.current = false;
        fetchVolunteers();
      } else {
        throw new Error(
          isAdding ? "Failed to add volunteer" : "Failed to update volunteer"
        );
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Failed to ${isAdding ? "add" : "update"} volunteer. Please try again.`,
        severity: "error",
      });
    } finally {
      setLoading(false);
      setEditDialogOpen(false);
    }
  }, [
    editingVolunteer,
    isAdding,
    accessToken,
    orgId,
    fetchVolunteers,
    tabValue,
    selectedEventId,
  ]);

  // Application review functions
  const handleApproveApplication = useCallback(async (application) => {
    if (!selectedEventId) return;
    
    setLoading(true);
    try {
      const currentType = getCurrentVolunteerTypeSingular(tabValue);
      const url = `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${selectedEventId}/${currentType}`;
      
      const updatedApplication = {
        ...application,
        isSelected: true
      };

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
          "X-Org-Id": orgId,
        },
        body: JSON.stringify(updatedApplication),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Application approved successfully",
          severity: "success",
        });
        fetchVolunteers();
      } else {
        throw new Error("Failed to approve application");
      }
    } catch (error) {
      console.error('Error approving application:', error);
      setSnackbar({
        open: true,
        message: "Failed to approve application. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [accessToken, orgId, fetchVolunteers, tabValue, selectedEventId]);

  const handleRejectApplication = useCallback(async (application) => {
    if (!selectedEventId) return;
    
    setLoading(true);
    try {
      const currentType = getCurrentVolunteerTypeSingular(tabValue);
      const url = `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${selectedEventId}/${currentType}`;
      
      const updatedApplication = {
        ...application,
        isSelected: false
      };

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
          "X-Org-Id": orgId,
        },
        body: JSON.stringify(updatedApplication),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Application rejected successfully",
          severity: "success",
        });
        fetchVolunteers();
      } else {
        throw new Error("Failed to reject application");
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      setSnackbar({
        open: true,
        message: "Failed to reject application. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [accessToken, orgId, fetchVolunteers, tabValue, selectedEventId]);

  const handleBatchApproveApplications = useCallback(async (applications) => {
    if (!selectedEventId || applications.length === 0) return;
    
    setLoading(true);
    try {
      const currentType = getCurrentVolunteerTypeSingular(tabValue);
      const url = `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${selectedEventId}/${currentType}`;
      
      // Process applications in batches
      await Promise.all(applications.map(async (application) => {
        const updatedApplication = {
          ...application,
          isSelected: true
        };

        const response = await fetch(url, {
          method: "PATCH",
          headers: {
            authorization: `Bearer ${accessToken}`,
            "content-type": "application/json",
            "X-Org-Id": orgId,
          },
          body: JSON.stringify(updatedApplication),
        });

        if (!response.ok) {
          throw new Error(`Failed to approve application for ${application.name || 'Unknown'}`);
        }
      }));

      setSnackbar({
        open: true,
        message: `Successfully approved ${applications.length} applications`,
        severity: "success",
      });
      fetchVolunteers();
    } catch (error) {
      console.error('Error batch approving applications:', error);
      setSnackbar({
        open: true,
        message: "Failed to approve some applications. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [accessToken, orgId, fetchVolunteers, tabValue, selectedEventId]);

  const handleBatchRejectApplications = useCallback(async (applications) => {
    if (!selectedEventId || applications.length === 0) return;
    
    setLoading(true);
    try {
      const currentType = getCurrentVolunteerTypeSingular(tabValue);
      const url = `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${selectedEventId}/${currentType}`;
      
      // Process applications in batches
      await Promise.all(applications.map(async (application) => {
        const updatedApplication = {
          ...application,
          isSelected: false
        };

        const response = await fetch(url, {
          method: "PATCH",
          headers: {
            authorization: `Bearer ${accessToken}`,
            "content-type": "application/json",
            "X-Org-Id": orgId,
          },
          body: JSON.stringify(updatedApplication),
        });

        if (!response.ok) {
          throw new Error(`Failed to reject application for ${application.name || 'Unknown'}`);
        }
      }));

      setSnackbar({
        open: true,
        message: `Successfully rejected ${applications.length} applications`,
        severity: "success",
      });
      fetchVolunteers();
    } catch (error) {
      console.error('Error batch rejecting applications:', error);
      setSnackbar({
        open: true,
        message: "Failed to reject some applications. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [accessToken, orgId, fetchVolunteers, tabValue, selectedEventId]);

  // Application edit functions
  const handleEditApplication = useCallback((application) => {
    setEditingApplication(application);
    setApplicationEditDialogOpen(true);
  }, []);

  const handleSaveApplicationEdit = useCallback(async (updatedApplication) => {
    if (!selectedEventId) return;
    
    setLoading(true);
    try {
      const currentType = getCurrentVolunteerTypeSingular(tabValue);
      const url = `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${selectedEventId}/${currentType}`;
      
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
          "X-Org-Id": orgId,
        },
        body: JSON.stringify(updatedApplication),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Application updated successfully",
          severity: "success",
        });
        fetchVolunteers();
        setApplicationEditDialogOpen(false);
        setEditingApplication(null);
      } else {
        throw new Error("Failed to update application");
      }
    } catch (error) {
      console.error('Error updating application:', error);
      setSnackbar({
        open: true,
        message: "Failed to update application. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [accessToken, orgId, fetchVolunteers, tabValue, selectedEventId]);

  const sortedVolunteers = useMemo(() => {
    const currentVolunteers = volunteers?.[getCurrentVolunteerType(tabValue)] || [];

    if (!Array.isArray(currentVolunteers)) {
      return [];
    }

    // Count availability slots by splitting on day-name boundaries
    const countSlots = (availStr) => {
      if (!availStr) return 0;
      return availStr.split(/,\s*(?=(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday))/).filter(s => s.trim()).length;
    };

    // Extract numeric year from participationCount (e.g., "This is my third year" -> 3)
    const parseParticipationYear = (val) => {
      if (!val) return 0;
      const wordMap = { first: 1, second: 2, third: 3, fourth: 4, fifth: 5 };
      const match = val.match(/(first|second|third|fourth|fifth|\d+)/i);
      if (!match) return 0;
      return wordMap[match[1].toLowerCase()] || parseInt(match[1], 10) || 0;
    };

    return currentVolunteers
      .filter(volunteer => volunteer != null) // Remove null/undefined entries
      .sort((a, b) => {
        let valueA, valueB;

        if (orderBy === "availability") {
          valueA = countSlots(a?.availability);
          valueB = countSlots(b?.availability);
        } else if (orderBy === "participationCount") {
          valueA = parseParticipationYear(a?.participationCount);
          valueB = parseParticipationYear(b?.participationCount);
        } else {
          valueA = (a?.[orderBy] || "").toString().toLowerCase();
          valueB = (b?.[orderBy] || "").toString().toLowerCase();
        }

        if (valueA < valueB) {
          return order === "asc" ? -1 : 1;
        }
        if (valueA > valueB) {
          return order === "asc" ? 1 : -1;
        }
        return 0;
      })
      .filter((volunteer) => {
        if (!volunteer) return false;
        if (!filter) return true;
        
        const searchValue = filter.toLowerCase();
        const currentType = getCurrentVolunteerType(tabValue);
        const searchableFields = getSearchableFields(volunteer, currentType);
        
        return searchableFields.some(field => {
          // Field is already processed by getFieldValue in getSearchableFields
          if (!field || field === '') return false;
          return field.toLowerCase().includes(searchValue);
        });
      });
  }, [volunteers, getSearchableFields, orderBy, order, filter, tabValue]);

  // Add error boundary-like behavior
  if (!router) {
    return <div>Router not available</div>;
  }

  return (
    <>
      <Head>
        <title>{getPageTitle()}</title>
      </Head>
      <AdminPage
        title="Volunteer Management"
        snackbar={snackbar}
        onSnackbarClose={() => setSnackbar({ ...snackbar, open: false })}
        isAdmin={isAdmin}
      >
      <Box sx={{ mb: 3, width: "100%" }}>
        {isMobile ? (
          // Mobile layout - stacked vertically
          <Stack spacing={2}>
            {/* Primary Actions Row */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                onClick={() => {
                  dataLoadedRef.current = false;
                  savedScrollPositionRef.current = 0;
                  fetchVolunteers();
                }}
                variant="outlined"
                size={isSmallMobile ? 'small' : 'medium'}
                sx={{ flex: '1 1 auto', minWidth: 'max-content' }}
              >
                {isSmallMobile ? 'Refresh' : 'Refresh Data'}
              </Button>
              <Button
                onClick={handleAddSingleVolunteer}
                variant="outlined"
                color="primary"
                size={isSmallMobile ? 'small' : 'medium'}
                sx={{ flex: '1 1 auto', minWidth: 'max-content' }}
              >
                {isSmallMobile ? 'Add' : 'Add Volunteer'}
              </Button>
            </Box>

            {/* Event Selector - Full Width */}
            <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
              <InputLabel id="hackathon-select-label">
                Hackathon Event
              </InputLabel>
              <Select
                labelId="hackathon-select-label"
                id="hackathon-select"
                value={selectedEventId || ""}
                label="Hackathon Event"
                onChange={(e) => handleEventChange(e.target.value)}
              >
                {Array.isArray(hackathons) &&
                  hackathons
                    .filter(hackathon => hackathon?.event_id)
                    .map((hackathon) => (
                      <MenuItem
                        key={hackathon.event_id}
                        value={hackathon.event_id}
                      >
                        {isSmallMobile
                          ? hackathon.event_id
                          : `${hackathon.event_id} - ${hackathon.start_date || 'Unknown Date'}`
                        }
                      </MenuItem>
                    ))}
              </Select>
            </FormControl>

            {/* View Mode & Share Row */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(event, newViewMode) => {
                  if (newViewMode !== null) {
                    setViewMode(newViewMode);
                  }
                }}
                aria-label="view mode"
                size="small"
                sx={{ flex: '1 1 auto' }}
              >
                <ToggleButton value="table" aria-label="table view" sx={{ flex: 1 }}>
                  {isSmallMobile ? 'Table' : 'Table View'}
                </ToggleButton>
                <ToggleButton value="review" aria-label="review view" sx={{ flex: 1 }}>
                  {isSmallMobile ? 'Review' : 'Review Mode'}
                </ToggleButton>
              </ToggleButtonGroup>
              <Tooltip title="Share link to this hackathon">
                <IconButton
                  onClick={handleShareLink}
                  color="primary"
                  disabled={!selectedEventId}
                  size={isSmallMobile ? 'small' : 'medium'}
                >
                  <ShareIcon />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Search Field - Only show in table mode */}
            {viewMode === "table" && (
              <TextField
                fullWidth
                size={isMobile ? 'small' : 'medium'}
                label={(() => {
                  const currentType = getCurrentVolunteerType(tabValue);
                  if (isSmallMobile) {
                    return `Search ${currentType}`;
                  }
                  switch (currentType) {
                    case "judges":
                      return "Search all fields (name, email, company, bio, background, etc.)";
                    case "mentors":
                      return "Search all fields (name, email, company, expertise, etc.)";
                    case "hackers":
                      return "Search all fields (name, email, skills, experience, etc.)";
                    case "volunteers":
                      return "Search all fields (name, email, role, skills, etc.)";
                    case "sponsors":
                      return "Search all fields (company, contact, tier, industry, etc.)";
                    default:
                      return "Search all available fields";
                  }
                })()}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                variant="outlined"
              />
            )}
          </Stack>
        ) : (
          // Desktop layout - horizontal
          <Grid container spacing={2} alignItems="center">
            <Grid>
              <Button
                onClick={() => {
                  dataLoadedRef.current = false;
                  savedScrollPositionRef.current = 0;
                  fetchVolunteers();
                }}
                variant="outlined"
              >
                Refresh Data
              </Button>
            </Grid>
            <Grid>
              <Button
                onClick={handleAddSingleVolunteer}
                variant="outlined"
                color="primary"
              >
                Add Single Volunteer
              </Button>
            </Grid>
            <Grid>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(event, newViewMode) => {
                  if (newViewMode !== null) {
                    setViewMode(newViewMode);
                  }
                }}
                aria-label="view mode"
                size="small"
              >
                <ToggleButton value="table" aria-label="table view">
                  Table View
                </ToggleButton>
                <ToggleButton value="review" aria-label="review view">
                  Review Mode
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
            <Grid size={{ xs: 3 }}>
              <FormControl fullWidth>
                <InputLabel id="hackathon-select-label">
                  Hackathon Event
                </InputLabel>
                <Select
                  labelId="hackathon-select-label"
                  id="hackathon-select"
                  value={selectedEventId || ""}
                  label="Hackathon Event"
                  onChange={(e) => handleEventChange(e.target.value)}
                >
                  {Array.isArray(hackathons) &&
                    hackathons
                      .filter(hackathon => hackathon?.event_id)
                      .map((hackathon) => (
                        <MenuItem
                          key={hackathon.event_id}
                          value={hackathon.event_id}
                        >
                          {hackathon.event_id} - {hackathon.start_date || 'Unknown Date'}
                        </MenuItem>
                      ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid>
              <Tooltip title="Share link to this hackathon">
                <IconButton
                  onClick={handleShareLink}
                  color="primary"
                  disabled={!selectedEventId}
                >
                  <ShareIcon />
                </IconButton>
              </Tooltip>
            </Grid>
            {viewMode === "table" && (
              <Grid size={{ xs: true }}>
                <TextField
                  fullWidth
                  label={(() => {
                    const currentType = getCurrentVolunteerType(tabValue);
                    switch (currentType) {
                      case "judges":
                        return "Search all fields (name, email, company, bio, background, etc.)";
                      case "mentors":
                        return "Search all fields (name, email, company, expertise, etc.)";
                      case "hackers":
                        return "Search all fields (name, email, skills, experience, etc.)";
                      case "volunteers":
                        return "Search all fields (name, email, role, skills, etc.)";
                      case "sponsors":
                        return "Search all fields (company, contact, tier, industry, etc.)";
                      default:
                        return "Search all available fields";
                    }
                  })()}
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </Grid>
            )}
          </Grid>
        )}
      </Box>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        aria-label="volunteer tabs"
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          '& .MuiTabs-scrollButtons': {
            '&.Mui-disabled': {
              opacity: 0.3,
            },
          },
          // Better mobile tab sizing
          ...(isMobile && {
            '& .MuiTab-root': {
              minWidth: 'auto',
              fontSize: '0.875rem',
              padding: theme.spacing(1, 0.5),
            },
            '& .MuiBadge-badge': {
              fontSize: '0.65rem',
              minWidth: 16,
              height: 16,
            },
          }),
        }}
      >
        <Tab
          label={
            <Badge color="primary" badgeContent={volunteers.mentors.length} max={isMobile ? 99 : 999}>
              {isMobile ? 'Mentors' : 'Mentors'}
            </Badge>
          }
        />
        <Tab
          label={
            <Badge color="primary" badgeContent={volunteers.judges.length} max={isMobile ? 99 : 999}>
              {isMobile ? 'Judges' : 'Judges'}
            </Badge>
          }
        />
        <Tab
          label={
            <Badge color="primary" badgeContent={volunteers.volunteers.length} max={isMobile ? 99 : 999}>
              {isMobile ? 'Vol.' : 'Volunteers'}
            </Badge>
          }
        />
        <Tab
          label={
            <Badge color="primary" badgeContent={volunteers.hackers.length} max={isMobile ? 99 : 999}>
              {isMobile ? 'Hackers' : 'Hackers'}
            </Badge>
          }
        />
        <Tab
          label={
            <Badge color="primary" badgeContent={volunteers.sponsors.length} max={isMobile ? 99 : 999}>
              {isMobile ? 'Sponsors' : 'Sponsors'}
            </Badge>
          }
        />
      </Tabs>

      {!selectedEventId ? (
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="h6">Please select a hackathon event</Typography>
        </Box>
      ) : loading ? (
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ mt: 2 }} ref={scrollContainerRef}>
          {viewMode === "table" ? (
            <>
              <VolunteerTable
                volunteers={sortedVolunteers}
                type={getCurrentVolunteerType(tabValue)}
                orderBy={orderBy}
                order={order}
                onRequestSort={handleRequestSort}
                onEditVolunteer={handleEditVolunteer}
                onMessageVolunteer={handleMessageVolunteer}
                onSlackInvite={handleSlackInvite}
                onBatchEmail={handleBatchEmail}
                onBatchEmailNotSelected={handleBatchEmail}
                onBulkCertificate={handleBulkCertificate}
                checkedInFilter={getCurrentFilterState().checkedInFilter}
                onCheckedInFilterChange={(value) => updateFilterState('checkedInFilter', value)}
                accessToken={accessToken}
                orgId={orgId}
                depositEnabled={depositEnabled}
                onDepositClick={handleDepositClick}
              />
              {sortedVolunteers.length === 0 && (
                <Box sx={{ mt: 2, textAlign: "center" }}>
                  <Typography>
                    No {getCurrentVolunteerType(tabValue)} found for this hackathon
                    event.
                  </Typography>
                </Box>
              )}
            </>
          ) : (
            <ApplicationReviewList
              applications={sortedVolunteers}
              applicationType={getCurrentVolunteerTypeSingular(tabValue)}
              onApprove={handleApproveApplication}
              onReject={handleRejectApplication}
              onEdit={handleEditApplication}
              onBatchApprove={handleBatchApproveApplications}
              onBatchReject={handleBatchRejectApplications}
              isLoading={loading}
              eventId={selectedEventId}
              // Controlled filter state
              filter={getCurrentFilterState().filter}
              statusFilter={getCurrentFilterState().statusFilter}
              inPersonFilter={getCurrentFilterState().inPersonFilter}
              checkedInFilter={getCurrentFilterState().checkedInFilter}
              sortBy={getCurrentFilterState().sortBy}
              sortOrder={getCurrentFilterState().sortOrder}
              showBatchActions={getCurrentFilterState().showBatchActions}
              // Filter change callbacks
              onFilterChange={(value) => updateFilterState('filter', value)}
              onStatusFilterChange={(value) => updateFilterState('statusFilter', value)}
              onInPersonFilterChange={(value) => updateFilterState('inPersonFilter', value)}
              onCheckedInFilterChange={(value) => updateFilterState('checkedInFilter', value)}
              onSortByChange={(value) => updateFilterState('sortBy', value)}
              onSortOrderChange={(value) => updateFilterState('sortOrder', value)}
              onShowBatchActionsChange={(value) => updateFilterState('showBatchActions', value)}
            />
          )}
        </Box>
      )}

      <VolunteerEditDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        volunteer={editingVolunteer}
        onSave={handleSaveEdit}
        onChange={handleEditChange}
        isAdding={isAdding}
      />

      <ApplicationEditDialog
        open={applicationEditDialogOpen}
        onClose={() => {
          setApplicationEditDialogOpen(false);
          setEditingApplication(null);
        }}
        application={editingApplication}
        applicationType={getCurrentVolunteerTypeSingular(tabValue)}
        onSave={handleSaveApplicationEdit}
        isLoading={loading}
      />

      {/* Volunteer Communication Dialog */}
      {selectedVolunteerForMessage && (
        <VolunteerCommunication
          volunteer={selectedVolunteerForMessage}
          volunteerType={getCurrentVolunteerTypeSingular(tabValue)}
          eventId={selectedEventId}
          orgId={orgId}
          accessToken={accessToken}
          open={communicationDialogOpen}
          onClose={() => {
            setCommunicationDialogOpen(false);
            setSelectedVolunteerForMessage(null);
          }}
          onMessageSent={() => {
            setCommunicationDialogOpen(false);
            setSelectedVolunteerForMessage(null);
            fetchVolunteers(); // Refresh data
          }}
        />
      )}

      {/* Slack Invite Dialog */}
      <SlackInviteDialog
        open={slackInviteDialogOpen}
        onClose={() => {
          setSlackInviteDialogOpen(false);
          setVolunteersForSlackInvite([]);
          setVolunteerTypeForSlackInvite('');
        }}
        volunteers={volunteersForSlackInvite}
        volunteerType={volunteerTypeForSlackInvite}
        accessToken={accessToken}
        orgId={orgId}
        onComplete={handleSlackInviteComplete}
      />

      {/* Batch Email Dialog */}
      <BatchEmailDialog
        open={batchEmailDialogOpen}
        onClose={() => {
          setBatchEmailDialogOpen(false);
          setVolunteersForBatchEmail([]);
          setVolunteerTypeForBatchEmail('');
          setIsSelectedUsersForEmail(true);
        }}
        volunteers={volunteersForBatchEmail}
        volunteerType={volunteerTypeForBatchEmail}
        accessToken={accessToken}
        orgId={orgId}
        eventId={selectedEventId}
        onComplete={handleBatchEmailComplete}
        isSelectedUsers={isSelectedUsersForEmail}
      />

      {/* Bulk Certificate Dialog */}
      <BulkCertificateDialog
        open={bulkCertificateDialogOpen}
        onClose={() => {
          setBulkCertificateDialogOpen(false);
          setVolunteersForBulkCertificate([]);
          setVolunteerTypeForBulkCertificate('');
        }}
        volunteers={volunteersForBulkCertificate}
        volunteerType={volunteerTypeForBulkCertificate}
        accessToken={accessToken}
        orgId={orgId}
        onComplete={handleBulkCertificateComplete}
      />

      <HackerDepositRefundDialog
        open={Boolean(depositDialogVolunteer)}
        onClose={() => setDepositDialogVolunteer(null)}
        volunteer={depositDialogVolunteer}
        apiServerUrl={process.env.NEXT_PUBLIC_API_SERVER_URL}
        accessToken={accessToken}
        orgId={orgId}
        onRefunded={handleDepositRefunded}
      />

      {/* Share Link Snackbar */}
      <MuiSnackbar
        open={shareSnackbar.open}
        autoHideDuration={3000}
        onClose={() => setShareSnackbar({ open: false, message: '' })}
        message={shareSnackbar.message}
      />
    </AdminPage>
    </>
  );
});

export default AdminVolunteerPage;
