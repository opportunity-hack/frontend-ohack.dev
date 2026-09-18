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
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import {
  Share as ShareIcon,
  ContentCopy as CopyIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

// Import components individually to avoid circular dependencies
import AdminPage from "../../../components/admin/AdminPage";
import VolunteerTable from "../../../components/admin/VolunteerTable";
import VolunteerEditDialog from "../../../components/admin/VolunteerEditDialog";  
import ApplicationReviewList from "../../../components/admin/ApplicationReviewList";
import VolunteerCommunication from "../../../components/admin/VolunteerCommunication";
import SlackInviteDialog from "../../../components/admin/SlackInviteDialog";
import BatchEmailDialog from "../../../components/admin/BatchEmailDialog";
import BulkCertificateDialog from "../../../components/admin/BulkCertificateDialog";
import HackerDepositRefundDialog from "../../../components/admin/HackerDepositRefundDialog";
import HackerDepositBulkRefundDialog from "../../../components/admin/HackerDepositBulkRefundDialog";
import { getDepositState } from "../../../components/admin/HackerDepositChip";
import VideoDisplay from "../../../components/VideoDisplay/VideoDisplay";
import useHackathonEvents from "../../../hooks/use-hackathon-events";
import useJudgeTrainingStatus from "../../../hooks/use-judge-training-status";
import { statusLabel, statusSortIndex } from "../../../lib/applicationStatus";
import { getSearchValues } from "./applicationSchema";
import { RosterConfirmDialog } from "./RosterControls";

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
const PLURAL_TYPES = ["mentors", "judges", "volunteers", "hackers", "sponsors"];

// Per-tab filter state. `statusFilter` is the REVIEW axis (application
// status), `selectedFilter` the ROSTER axis (isSelected), `preset` the two
// mismatch views that bridge them ("ready" / "conflict").
const DEFAULT_FILTER_STATE = {
  filter: '',
  statusFilter: 'all',
  selectedFilter: 'all',
  preset: 'none',
  inPersonFilter: 'all',
  checkedInFilter: 'all',
  sortBy: 'timestamp',
  sortOrder: 'desc',
  showBatchActions: false,
};

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

// When `embedded` is true, this component is being rendered inside the
// per-event hackathon admin page (/admin/hackathons/[event_id]?section=volunteer).
// In that mode we skip the standalone AdminPage chrome, hide the in-page event
// picker (the sidebar already owns event context), and source the event id
// from `externalEventId` instead of URL/state.
const VolunteerWorkbench = ({ userClass, embedded = false, externalEventId, onSnack }) => {
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
  // Edit dialog: the row is derived LIVE from `volunteers` by id (never a
  // snapshot) so optimistic decision writes can't leave the dialog stale.
  const [editingVolunteerId, setEditingVolunteerId] = useState(null);
  const [addDraft, setAddDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  // Per-row in-flight decision writes (replaces the whole-table spinner).
  const [pendingIds, setPendingIds] = useState(() => new Set());
  // Bulk roster changes confirm first: { apps, direction }
  const [rosterConfirm, setRosterConfirm] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState("");
  // Full event doc for the selected event — used to read constraints
  // (currently just hacker_deposit.enabled). Fetched separately because the
  // hackathons LIST endpoint doesn't include the `constraints` blob.
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [depositDialogVolunteer, setDepositDialogVolunteer] = useState(null);
  const [bulkRefundDialogOpen, setBulkRefundDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState("table"); // "table" or "review"
  const [communicationDialogOpen, setCommunicationDialogOpen] = useState(false);
  const [selectedVolunteerForMessage, setSelectedVolunteerForMessage] = useState(null);
  const [slackInviteDialogOpen, setSlackInviteDialogOpen] = useState(false);
  const [volunteersForSlackInvite, setVolunteersForSlackInvite] = useState([]);
  const [volunteerTypeForSlackInvite, setVolunteerTypeForSlackInvite] = useState('');
  const [batchEmailDialogOpen, setBatchEmailDialogOpen] = useState(false);
  const [volunteersForBatchEmail, setVolunteersForBatchEmail] = useState([]);
  const [volunteerTypeForBatchEmail, setVolunteerTypeForBatchEmail] = useState('');
  const [emailAudience, setEmailAudience] = useState("roster"); // roster | denied | waitlisted
  const [bulkCertificateDialogOpen, setBulkCertificateDialogOpen] = useState(false);
  const [volunteersForBulkCertificate, setVolunteersForBulkCertificate] = useState([]);
  const [volunteerTypeForBulkCertificate, setVolunteerTypeForBulkCertificate] = useState('');
  const [shareSnackbar, setShareSnackbar] = useState({ open: false, message: '' });
  // One page-level player dialog serves both the table and review views
  // (TeamList pattern — never an iframe per row/card).
  const [videoDialog, setVideoDialog] = useState({ open: false, url: null, name: null });

  // Filter state management
  const [filterStates, setFilterStates] = useState(() =>
    Object.fromEntries(PLURAL_TYPES.map((t) => [t, { ...DEFAULT_FILTER_STATE }]))
  );

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

  // When embedded, pre-seed the event id from the parent's sidebar context
  // and never write back to the URL — the host page owns the URL contract.
  // (Declared before the !isAdmin early return to keep hook order stable.)
  useEffect(() => {
    if (!embedded) return;
    if (!externalEventId) return;
    if (selectedEventId === externalEventId) return;
    setSelectedEventId(externalEventId);
    initializedFromUrlRef.current = true;
  }, [embedded, externalEventId, selectedEventId]);

  const handlePlayVideo = useCallback((url, name) => {
    setVideoDialog({ open: true, url, name });
  }, []);
  const handleCloseVideo = useCallback(() => {
    // Keep url/name during the close animation.
    setVideoDialog((prev) => ({ ...prev, open: false }));
  }, []);

  // LMS training status for the Judges tab (tab 1). Gated on the tab so the
  // other tabs never call the LMS; one fetch feeds both table and review
  // views. (Declared before the !isAdmin early return to keep hook order
  // stable.)
  const {
    statusByEmail: trainingStatusByEmail,
    lmsAccess: trainingLmsAccess,
  } = useJudgeTrainingStatus({
    accessToken,
    judges: volunteers.judges,
    enabled: isAdmin && tabValue === 1 && volunteers.judges.length > 0,
  });

  // Early return if not admin to prevent further execution
  if (!isAdmin) {
    if (embedded) return null;
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
      selectedFilter,
      preset,
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

        if (filterToApply || statusFilter || selectedFilter || preset || inPersonFilter || checkedInFilter || sortBy || sortOrder || showBatchActions) {
          setFilterStates(prev => ({
            ...prev,
            [currentType]: {
              filter: filterToApply,
              statusFilter: statusFilter || 'all',
              selectedFilter: selectedFilter || 'all',
              preset: preset || 'none',
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
    if (embedded) return; // host page owns the URL when embedded
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
      if (currentFilterState.selectedFilter !== 'all') {
        queryParams.set('selectedFilter', currentFilterState.selectedFilter);
      }
      if (currentFilterState.preset && currentFilterState.preset !== 'none') {
        queryParams.set('preset', currentFilterState.preset);
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

  // Eligible for bulk refund: paid + disposition=refund. Donate-disposition
  // is excluded (override is a per-row decision); refund_failed is excluded
  // (those likely need human triage).
  const eligibleForBulkRefund = useMemo(() => {
    if (!depositEnabled) return [];
    return (volunteers.hackers || []).filter((h) => {
      const state = getDepositState(h);
      return state.kind === "paid" && h.deposit_disposition === "refund";
    });
  }, [volunteers.hackers, depositEnabled]);

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

  const handleBulkRefundComplete = useCallback(() => {
    dataLoadedRef.current = false;
    fetchVolunteers();
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
    return filterStates[currentType] || DEFAULT_FILTER_STATE;
  }, [tabValue, filterStates]);

  // ONE edit entry point for both Table view and Review mode.
  const handleEditVolunteer = useCallback((volunteer) => {
    if (!volunteer?.id) return;
    setEditingVolunteerId(volunteer.id);
    setIsAdding(false);
    setEditDialogOpen(true);
  }, []);

  const handleCloseEdit = useCallback(() => {
    setEditDialogOpen(false);
    setEditingVolunteerId(null);
    setAddDraft(null);
  }, []);

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

  // audience: "roster" (isSelected) | "denied" | "waitlisted" (by status).
  // Rejection emails key on status — NOT on "not selected", which under the
  // two-axis model also covers pending and approved-but-unpublished people.
  const handleBatchEmail = useCallback((volunteers, type, audience = "roster") => {
    setVolunteersForBatchEmail(volunteers);
    setVolunteerTypeForBatchEmail(type);
    setEmailAudience(typeof audience === "string" ? audience : audience === false ? "denied" : "roster");
    setBatchEmailDialogOpen(true);
  }, []);

  const handleBatchEmailComplete = useCallback((summary) => {
    const messageType =
      emailAudience === "denied" ? 'Denial emails' : emailAudience === "waitlisted" ? 'Waitlist emails' : 'Roster emails';
    setSnackbar({
      open: true,
      message: `${messageType} completed: ${summary.successful} successful, ${summary.failed} failed`,
      severity: summary.failed > 0 ? "warning" : "success",
    });
    setBatchEmailDialogOpen(false);
    setVolunteersForBatchEmail([]);
    setVolunteerTypeForBatchEmail('');
    setEmailAudience("roster");
  }, [emailAudience]);

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
    setAddDraft({
      volunteer_type: getCurrentVolunteerTypeSingular(tabValue),
      name: "",
      email: "",
      isSelected: false,
      status: "pending",
    });
    setIsAdding(true);
    setEditDialogOpen(true);
  }, [tabValue]);

  // ---------------------------------------------------------------------
  // Decision writes — two transports, one optimistic layer.
  //   review  (status)      → generic hackathon PATCH `{ id, status }`
  //   roster  (isSelected)  → dedicated select route `{ selected }`
  // `isSelected` never travels in a PATCH body from the admin UI; the select
  // route is the single server-side writer (clears the participant's own
  // caches, audits to Slack).
  // ---------------------------------------------------------------------
  const authHeaders = useCallback(() => ({
    authorization: `Bearer ${accessToken}`,
    "content-type": "application/json",
    "X-Org-Id": orgId,
  }), [accessToken, orgId]);

  const patchVolunteer = useCallback(async (patch) => {
    const url = `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${selectedEventId}/${getCurrentVolunteerTypeSingular(tabValue)}`;
    const res = await fetch(url, { method: "PATCH", headers: authHeaders(), body: JSON.stringify(patch) });
    if (!res.ok) throw new Error(`PATCH failed (${res.status})`);
    return res;
  }, [selectedEventId, tabValue, authHeaders]);

  const selectVolunteer = useCallback(async (id, selected) => {
    const url = `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/admin/volunteer/${id}/select`;
    const res = await fetch(url, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ selected: Boolean(selected) }),
    });
    if (!res.ok) throw new Error(`Roster update failed (${res.status})`);
    return res;
  }, [authHeaders]);

  const applyLocal = useCallback((id, changes) => {
    const plural = getCurrentVolunteerType(tabValue);
    setVolunteers((prev) => ({
      ...prev,
      [plural]: (prev[plural] || []).map((v) => (v?.id === id ? { ...v, ...changes } : v)),
    }));
  }, [tabValue]);

  const markPending = useCallback((ids, on) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
      return next;
    });
  }, []);

  const snack = useCallback((message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
    // Embedded mode: AdminPage's Snackbar isn't mounted, the host page owns it.
    if (embedded && typeof onSnack === "function") onSnack(message, severity);
  }, [embedded, onSnack]);

  // Optimistic single write with revert.
  const writeDecision = useCallback(async (application, changes, send, successMsg) => {
    const id = application?.id;
    if (!id) return;
    const previous = Object.fromEntries(Object.keys(changes).map((k) => [k, application[k]]));
    applyLocal(id, changes);
    markPending([id], true);
    try {
      await send();
      snack(successMsg, "success");
    } catch (error) {
      console.error("Decision write failed:", error);
      applyLocal(id, previous);
      snack(`Couldn't update ${application.name || "application"}. Please try again.`, "error");
    } finally {
      markPending([id], false);
    }
  }, [applyLocal, markPending, snack]);

  const handleStatusChange = useCallback((application, status) =>
    writeDecision(
      application,
      { status },
      () => patchVolunteer({ id: application.id, status }),
      `${application.name || "Application"}: ${statusLabel(status)}`,
    ), [writeDecision, patchVolunteer]);

  const handleRosterChange = useCallback((application, selected) =>
    writeDecision(
      application,
      { isSelected: Boolean(selected) },
      () => selectVolunteer(application.id, selected),
      `${application.name || "Application"}: ${selected ? "added to" : "removed from"} the roster`,
    ), [writeDecision, selectVolunteer]);

  // Batch: allSettled + per-item revert + one summary snackbar.
  const handleBatchDecision = useCallback(async (apps, changes, sendOne, label) => {
    const valid = (apps || []).filter((a) => a?.id);
    if (valid.length === 0) return;
    valid.forEach((a) => applyLocal(a.id, changes));
    markPending(valid.map((a) => a.id), true);
    const results = await Promise.allSettled(valid.map((a) => sendOne(a)));
    let failed = 0;
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        failed += 1;
        const a = valid[i];
        applyLocal(a.id, Object.fromEntries(Object.keys(changes).map((k) => [k, a[k]])));
      }
    });
    markPending(valid.map((a) => a.id), false);
    snack(
      failed ? `${valid.length - failed} ${label}, ${failed} failed` : `${valid.length} ${label}`,
      failed ? "warning" : "success",
    );
  }, [applyLocal, markPending, snack]);

  const handleBatchStatus = useCallback((apps, status) =>
    handleBatchDecision(
      apps,
      { status },
      (a) => patchVolunteer({ id: a.id, status }),
      `set to ${statusLabel(status)}`,
    ), [handleBatchDecision, patchVolunteer]);

  const runBatchRoster = useCallback((apps, selected) =>
    handleBatchDecision(
      apps,
      { isSelected: Boolean(selected) },
      (a) => selectVolunteer(a.id, selected),
      selected ? "added to the roster" : "removed from the roster",
    ), [handleBatchDecision, selectVolunteer]);

  // Bulk roster changes are consequential and un-emailed → confirm first.
  const handleBatchRoster = useCallback((apps, direction) => {
    const dir = Boolean(direction);
    const valid = (apps || []).filter((a) => a?.id && Boolean(a.isSelected) !== dir);
    setRosterConfirm({ apps: valid, direction: dir });
  }, []);

  const handleRosterConfirm = useCallback(async () => {
    if (!rosterConfirm) return;
    const { apps, direction } = rosterConfirm;
    setRosterConfirm(null);
    await runBatchRoster(apps, direction);
  }, [rosterConfirm, runBatchRoster]);

  // Live row for the edit dialog (see "Stale selected item snapshots" in CLAUDE.md).
  const editingVolunteer = useMemo(() => {
    if (isAdding) return addDraft;
    if (!editingVolunteerId) return null;
    const list = volunteers?.[getCurrentVolunteerType(tabValue)] || [];
    return list.find((v) => v?.id === editingVolunteerId) || null;
  }, [isAdding, addDraft, editingVolunteerId, volunteers, tabValue]);

  // Dialog hands back { patch, roster } (edit) or { create, roster } (add).
  // Fields + status ride the PATCH; the roster switch rides the select route.
  const handleSaveEdit = useCallback(async ({ patch, roster = null, create } = {}) => {
    if (!selectedEventId) return;
    setSaving(true);
    try {
      if (isAdding) {
        const url = `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${selectedEventId}/${getCurrentVolunteerTypeSingular(tabValue)}`;
        const res = await fetch(url, { method: "POST", headers: authHeaders(), body: JSON.stringify(create) });
        if (!res.ok) throw new Error(`POST failed (${res.status})`);
        dataLoadedRef.current = false;
        await fetchVolunteers();
        snack(
          roster === true
            ? "Volunteer added. Use the roster toggle on their row to add them to the roster."
            : "Volunteer added",
          roster === true ? "info" : "success",
        );
        handleCloseEdit();
        return;
      }

      const id = patch?.id;
      if (!id) throw new Error("Missing id");
      const { id: _omit, ...changes } = patch;
      const changedCount = Object.keys(changes).length;
      if (changedCount > 0) {
        applyLocal(id, changes);
        await patchVolunteer(patch);
      }
      if (roster !== null && roster !== undefined) {
        try {
          applyLocal(id, { isSelected: roster });
          await selectVolunteer(id, roster);
        } catch (rosterError) {
          console.error("Roster update failed:", rosterError);
          applyLocal(id, { isSelected: !roster });
          snack(
            changedCount > 0
              ? "Details saved. Roster change failed — try the toggle again."
              : "Roster change failed — try the toggle again.",
            "warning",
          );
          handleCloseEdit();
          return;
        }
      }
      const rosterMsg = roster === null || roster === undefined ? "" : roster ? " · added to roster" : " · removed from roster";
      snack(
        changedCount > 0
          ? `Saved ${changedCount} change${changedCount === 1 ? "" : "s"}${rosterMsg}`
          : rosterMsg
            ? rosterMsg.replace(" · ", "").replace(/^./, (c) => c.toUpperCase())
            : "No changes",
        "success",
      );
      handleCloseEdit();
    } catch (error) {
      console.error("Save failed:", error);
      snack(isAdding ? "Failed to add volunteer. Please try again." : "Save failed — reloading the list.", "error");
      if (!isAdding) {
        dataLoadedRef.current = false;
        fetchVolunteers();
      }
    } finally {
      setSaving(false);
    }
  }, [selectedEventId, isAdding, tabValue, authHeaders, fetchVolunteers, applyLocal, patchVolunteer, selectVolunteer, snack, handleCloseEdit]);

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
        } else if (orderBy === "status") {
          valueA = statusSortIndex(a?.status);
          valueB = statusSortIndex(b?.status);
        } else if (orderBy === "company") {
          // Judges store `companyName` (VolunteerTable renders both).
          valueA = (a?.company || a?.companyName || "").toLowerCase();
          valueB = (b?.company || b?.companyName || "").toLowerCase();
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
        return getSearchValues(volunteer, currentType).some((v) =>
          v.toLowerCase().includes(searchValue)
        );
      });
  }, [volunteers, orderBy, order, filter, tabValue]);

  // Add error boundary-like behavior
  if (!router) {
    return <div>Router not available</div>;
  }

  const Outer = embedded ? React.Fragment : AdminPage;
  const outerProps = embedded
    ? {}
    : {
        title: "Volunteer Management",
        snackbar,
        onSnackbarClose: () => setSnackbar({ ...snackbar, open: false }),
        isAdmin,
      };

  return (
    <>
      {!embedded && (
        <Head>
          <title>{getPageTitle()}</title>
        </Head>
      )}
      <Outer {...outerProps}>
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
            {!embedded && (
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
            )}

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
            {!embedded && (
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
            )}
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
              {tabValue === 3 && depositEnabled && (
                <Box
                  sx={{
                    mb: 1.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flexWrap: "wrap",
                  }}
                >
                  <Button
                    variant="outlined"
                    color="error"
                    disabled={eligibleForBulkRefund.length === 0}
                    onClick={() => setBulkRefundDialogOpen(true)}
                  >
                    {eligibleForBulkRefund.length === 0
                      ? "No deposits eligible for bulk refund"
                      : `Refund ${eligibleForBulkRefund.length} eligible deposit${
                          eligibleForBulkRefund.length === 1 ? "" : "s"
                        } ($${(
                          eligibleForBulkRefund.reduce(
                            (s, h) => s + (h.deposit_amount_cents || 0),
                            0,
                          ) / 100
                        ).toFixed(2)})`}
                  </Button>
                  <Typography variant="caption" color="text.secondary">
                    Eligible = paid + disposition=refund. Donated and
                    refund-failed rows excluded.
                  </Typography>
                </Box>
              )}
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
                onBulkCertificate={handleBulkCertificate}
                onStatusChange={handleStatusChange}
                onRosterChange={handleRosterChange}
                pendingIds={pendingIds}
                statusFilter={getCurrentFilterState().statusFilter}
                onStatusFilterChange={(value) => updateFilterState('statusFilter', value)}
                selectedFilter={getCurrentFilterState().selectedFilter}
                onSelectedFilterChange={(value) => updateFilterState('selectedFilter', value)}
                preset={getCurrentFilterState().preset}
                onPresetChange={(value) => updateFilterState('preset', value)}
                checkedInFilter={getCurrentFilterState().checkedInFilter}
                onCheckedInFilterChange={(value) => updateFilterState('checkedInFilter', value)}
                accessToken={accessToken}
                orgId={orgId}
                depositEnabled={depositEnabled}
                onDepositClick={handleDepositClick}
                trainingStatusByEmail={trainingStatusByEmail}
                trainingLmsAccess={trainingLmsAccess}
                onPlayVideo={handlePlayVideo}
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
              onStatusChange={handleStatusChange}
              onRosterChange={handleRosterChange}
              onEdit={handleEditVolunteer}
              onBatchStatus={handleBatchStatus}
              onBatchRoster={handleBatchRoster}
              pendingIds={pendingIds}
              isLoading={loading}
              eventId={selectedEventId}
              trainingStatusByEmail={trainingStatusByEmail}
              trainingLmsAccess={trainingLmsAccess}
              onPlayVideo={handlePlayVideo}
              // Controlled filter state
              filter={getCurrentFilterState().filter}
              statusFilter={getCurrentFilterState().statusFilter}
              selectedFilter={getCurrentFilterState().selectedFilter}
              preset={getCurrentFilterState().preset}
              inPersonFilter={getCurrentFilterState().inPersonFilter}
              checkedInFilter={getCurrentFilterState().checkedInFilter}
              sortBy={getCurrentFilterState().sortBy}
              sortOrder={getCurrentFilterState().sortOrder}
              showBatchActions={getCurrentFilterState().showBatchActions}
              // Filter change callbacks
              onFilterChange={(value) => updateFilterState('filter', value)}
              onStatusFilterChange={(value) => updateFilterState('statusFilter', value)}
              onSelectedFilterChange={(value) => updateFilterState('selectedFilter', value)}
              onPresetChange={(value) => updateFilterState('preset', value)}
              onInPersonFilterChange={(value) => updateFilterState('inPersonFilter', value)}
              onCheckedInFilterChange={(value) => updateFilterState('checkedInFilter', value)}
              onSortByChange={(value) => updateFilterState('sortBy', value)}
              onSortOrderChange={(value) => updateFilterState('sortOrder', value)}
              onShowBatchActionsChange={(value) => updateFilterState('showBatchActions', value)}
            />
          )}
        </Box>
      )}

      {/* Intro-video player — one dialog for every row/card */}
      <Dialog
        open={videoDialog.open}
        onClose={handleCloseVideo}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          {`${videoDialog.name || "Judge"} — intro video`}
          <IconButton aria-label="Close video" onClick={handleCloseVideo} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {videoDialog.url && (
            <VideoDisplay
              url={videoDialog.url}
              title={`${videoDialog.name || "Judge"} intro video`}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ONE edit dialog for both views; receives the live row by id. */}
      <VolunteerEditDialog
        open={editDialogOpen}
        onClose={handleCloseEdit}
        volunteer={editingVolunteer}
        volunteerType={getCurrentVolunteerTypeSingular(tabValue)}
        onSave={handleSaveEdit}
        isAdding={isAdding}
        saving={saving}
      />

      {/* Bulk roster changes confirm first (consequential, un-emailed). */}
      <RosterConfirmDialog
        open={Boolean(rosterConfirm)}
        count={rosterConfirm?.apps?.length || 0}
        direction={rosterConfirm?.direction ?? true}
        onClose={() => setRosterConfirm(null)}
        onConfirm={handleRosterConfirm}
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
          setEmailAudience("roster");
        }}
        volunteers={volunteersForBatchEmail}
        volunteerType={volunteerTypeForBatchEmail}
        accessToken={accessToken}
        orgId={orgId}
        eventId={selectedEventId}
        onComplete={handleBatchEmailComplete}
        audience={emailAudience}
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

      <HackerDepositBulkRefundDialog
        open={bulkRefundDialogOpen}
        onClose={() => setBulkRefundDialogOpen(false)}
        eligibleHackers={eligibleForBulkRefund}
        eventId={selectedEventId}
        apiServerUrl={process.env.NEXT_PUBLIC_API_SERVER_URL}
        accessToken={accessToken}
        orgId={orgId}
        onComplete={handleBulkRefundComplete}
      />

      {/* Share Link Snackbar */}
      <MuiSnackbar
        open={shareSnackbar.open}
        autoHideDuration={3000}
        onClose={() => setShareSnackbar({ open: false, message: '' })}
        message={shareSnackbar.message}
      />
    </Outer>
    </>
  );
};

const AdminVolunteerPage = withRequiredAuthInfo(VolunteerWorkbench);

export default AdminVolunteerPage;
export { VolunteerWorkbench };
