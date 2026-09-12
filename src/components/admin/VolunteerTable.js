import React, { useMemo, useState, useCallback, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Button,
  Avatar,
  Typography,
  Chip,
  Tooltip,
  Box,
  IconButton,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  CardActions,
  Divider,
  Stack,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { styled } from "@mui/system";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import { Email as EmailIcon, VolunteerActivism as CertificateIcon, OpenInNew as OpenInNewIcon, PlayCircleFilled as PlayCircleIcon } from '@mui/icons-material';
import { FaPaperPlane, FaSlack, FaLinkedin } from 'react-icons/fa';
import NextLink from 'next/link';
import HackerDepositChip from "./HackerDepositChip";
import { JUDGE_TRAINING_CERTS } from "../../lib/lmsClient";
import { normalizeEmail } from "../../hooks/use-judge-training-status";

// Attempt history for one training slot, as a short phrase or null.
// Prefers the admin rollup (needs an LMS admin/editor role; also covers
// judges who attempted but haven't passed), else the attempt fields the
// anonymous certificate lookup returns (LMS ≥ Sep 2026 — exact user, works
// for every admin, verified slots only).
const attemptsSummary = (slot, lmsAccess) => {
  const rollup = lmsAccess === "full" ? slot?.rollup : null;
  const count = rollup?.attemptCount ?? slot?.cert?.attemptCount;
  if (typeof count !== "number") return null;
  const toPass = rollup?.attemptsToPass ?? slot?.cert?.attemptsToPass;
  let text = `${count} attempt${count === 1 ? "" : "s"}`;
  if (rollup && !rollup.passed) {
    if (typeof rollup.bestScore === "number") {
      text += `, best ${Math.round(rollup.bestScore)}%`;
    }
    text += ", not passed yet";
  } else if (toPass && count > 1) {
    text += `, passed on attempt ${toPass}`;
  }
  return text;
};

// Compact judge-training summary for the table/mobile chip. `entry` is one
// value from useJudgeTrainingStatus's statusByEmail (undefined while the LMS
// check is pending or unavailable — then fall back to the application's own
// judgeTrainingCompleted flag). Returns { label, color, tooltip } or null.
// Tooltip = one line per required cert (state, score, attempts).
const trainingChipConfig = (entry, volunteer, lmsAccess) => {
  if (!entry) {
    return volunteer.judgeTrainingCompleted
      ? {
          label: "✓ Trained",
          color: "success",
          tooltip: "Marked complete at submit (LMS check pending)",
        }
      : null;
  }
  let anyAttempts = false;
  const rows = JUDGE_TRAINING_CERTS.map((spec) => {
    const slot = entry.slots?.[spec.key];
    const state = slot?.state || "missing";
    const verified = state === "verified";
    const passedOnLms = Boolean(slot?.rollup?.passed);
    let status = verified
      ? "verified"
      : passedOnLms
        ? "passed on LMS, no cert link"
        : state.replace(/_/g, " ");
    if (verified && typeof slot?.cert?.score === "number") {
      status += ` (${Math.round(slot.cert.score)}%)`;
    }
    const attempts = attemptsSummary(slot, lmsAccess);
    if (attempts) anyAttempts = true;
    return {
      done: verified || passedOnLms,
      line: `${spec.videoTitle}: ${status}${attempts ? ` · ${attempts}` : ""}`,
    };
  });
  const doneCount = rows.filter((row) => row.done).length;
  const lines = rows.map((row) => row.line);
  if (!anyAttempts && lmsAccess === "certs-only") {
    lines.push("Attempt counts unavailable — needs an LMS admin role");
  }
  const tooltip = lines.join("\n");
  if (doneCount === rows.length) {
    return { label: "✓ Trained", color: "success", tooltip };
  }
  if (doneCount > 0) {
    return { label: `${doneCount} of ${rows.length}`, color: "warning", tooltip };
  }
  return { label: "✗ Not trained", color: "error", tooltip };
};

// Company lives under `company` on most application types but `companyName`
// on judge (and some sponsor) applications — read both everywhere.
export const companyOf = (volunteer) =>
  volunteer?.company || volunteer?.companyName || "";

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  width: "100%",
  overflowX: "auto",
  overflowY: "visible",
  maxWidth: "100vw", // Ensure it doesn't exceed viewport
  "& .MuiTable-root": {
    minWidth: 800, // Minimum width to force horizontal scroll when needed
    tableLayout: "auto", // Allow flexible column sizing
    whiteSpace: "nowrap", // Prevent text wrapping in cells
  },
  // Better mobile scrolling
  WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
  // Enhanced scrollbar for better touch interaction
  "&::-webkit-scrollbar": {
    height: theme.breakpoints.down('md') ? 12 : 8, // Larger scrollbar on mobile
  },
  "&::-webkit-scrollbar-track": {
    backgroundColor: theme.palette.grey[200],
    borderRadius: 6,
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: theme.palette.grey[400],
    borderRadius: 6,
    "&:hover": {
      backgroundColor: theme.palette.grey[600],
    },
    "&:active": {
      backgroundColor: theme.palette.grey[700],
    },
  },
  // Touch-friendly scrolling area
  [theme.breakpoints.down('md')]: {
    '&::after': {
      content: '"Scroll horizontally to see all columns →"',
      position: 'sticky',
      right: 0,
      top: '50%',
      transform: 'translateY(-50%)',
      backgroundColor: theme.palette.info.main,
      color: theme.palette.info.contrastText,
      padding: theme.spacing(0.5, 1),
      borderRadius: theme.spacing(0.5),
      fontSize: '0.75rem',
      whiteSpace: 'nowrap',
      zIndex: 10,
      opacity: 0.8,
      pointerEvents: 'none',
    },
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(0.5, 1), // Reduced padding
  fontSize: "0.875rem", // Smaller font size
  overflow: "hidden", // Prevent overflow
  textOverflow: "ellipsis", // Add ellipsis for long text
  whiteSpace: "nowrap", // Prevent text wrapping by default
  // Better touch targets on mobile
  [theme.breakpoints.down("md")]: {
    padding: theme.spacing(1, 1.5), // Larger touch targets
    fontSize: "0.8rem",
    minHeight: 44, // Minimum touch target size
    // Ensure interactive elements are accessible
    '& .MuiIconButton-root': {
      padding: theme.spacing(1),
      minWidth: 44,
      minHeight: 44,
    },
    '& .MuiChip-root': {
      minHeight: 28,
      fontSize: '0.75rem',
    },
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  // Better hover states for desktop
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  // Touch-friendly mobile styling
  [theme.breakpoints.down("md")]: {
    borderBottom: `2px solid ${theme.palette.divider}`,
    '&:active': {
      backgroundColor: theme.palette.action.selected,
    },
  },
}));

const SelectedChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.success.main,
  color: theme.palette.common.white,
}));

const NotSelectedChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.error.main,
  color: theme.palette.common.white,
}));

const StatusChip = styled(Chip)(({ theme, statustype }) => {
  const getStatusColors = (status) => {
    switch (status) {
      case 'pending':
        return { backgroundColor: theme.palette.grey[500], color: theme.palette.common.white };
      case 'approved':
        return { backgroundColor: theme.palette.success.main, color: theme.palette.common.white };
      case 'denied':
        return { backgroundColor: theme.palette.error.main, color: theme.palette.common.white };
      case 'verified_travel':
        return { backgroundColor: theme.palette.info.main, color: theme.palette.common.white };
      case 'confirmed':
        return { backgroundColor: theme.palette.primary.main, color: theme.palette.common.white };
      case 'withdrew':
        return { backgroundColor: theme.palette.warning.main, color: theme.palette.common.white };
      case 'no_show':
        return { backgroundColor: theme.palette.error.dark, color: theme.palette.common.white };
      default:
        return { backgroundColor: theme.palette.grey[300], color: theme.palette.text.primary };
    }
  };
  
  return getStatusColors(statustype);
});

const ClickableCell = styled(Typography)(({ theme }) => ({
  cursor: 'pointer',
  display: 'block',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  padding: theme.spacing(0.25, 0.5),
  borderRadius: theme.spacing(0.5),
  transition: 'background-color 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:active': {
    backgroundColor: theme.palette.action.selected,
  },
}));

const VolunteerTable = ({
  volunteers,
  type,
  orderBy,
  order,
  onRequestSort,
  onEditVolunteer,
  onMessageVolunteer,
  onSlackInvite,
  onBatchEmail,
  onBatchEmailNotSelected,
  onBulkCertificate, // New prop for bulk certificate sending
  // Filter props
  checkedInFilter = 'all',
  onCheckedInFilterChange,
  // Auth props for Resend status lookup
  accessToken,
  orgId,
  // Deposit refund (hackers only)
  depositEnabled = false,
  onDepositClick,
  // Judge training/video review (judges only; see useJudgeTrainingStatus)
  trainingStatusByEmail,
  trainingLmsAccess,
  onPlayVideo,
}) => {
  const [copyFeedback, setCopyFeedback] = useState({ open: false, message: '' });
  const [resendStatuses, setResendStatuses] = useState({}); // { resend_id: { last_event, ... } }
  const [loadingResendStatus, setLoadingResendStatus] = useState({});
  const [resendEmailsByRecipient, setResendEmailsByRecipient] = useState({}); // { email: [{id, subject, created_at, last_event}] }
  const [resendListLoaded, setResendListLoaded] = useState(false);
  const [resendSyncing, setResendSyncing] = useState(false);
  const [resendSyncSnackbar, setResendSyncSnackbar] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleCopyToClipboard = async (text, fieldName) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      
      setCopyFeedback({ 
        open: true, 
        message: `${fieldName} copied: ${text.length > 30 ? text.substring(0, 30) + '...' : text}` 
      });
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setCopyFeedback({ 
        open: true, 
        message: `Failed to copy ${fieldName}` 
      });
    }
  };

  // Fetch delivery status from Resend for a volunteer's sent emails
  const fetchResendStatuses = useCallback(async (resendIds) => {
    if (!resendIds?.length || !accessToken || !orgId) return;

    // Filter out IDs we already have or are loading
    const idsToFetch = resendIds.filter(id => id && !resendStatuses[id] && !loadingResendStatus[id]);
    if (idsToFetch.length === 0) return;

    setLoadingResendStatus(prev => {
      const next = { ...prev };
      idsToFetch.forEach(id => { next[id] = true; });
      return next;
    });

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/admin/emails/resend-status`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Org-Id': orgId,
          },
          body: JSON.stringify({ email_ids: idsToFetch }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.statuses) {
          setResendStatuses(prev => ({ ...prev, ...data.statuses }));
        }
      }
    } catch (err) {
      console.warn('Failed to fetch Resend statuses:', err);
    } finally {
      setLoadingResendStatus(prev => {
        const next = { ...prev };
        idsToFetch.forEach(id => { delete next[id]; });
        return next;
      });
    }
  }, [accessToken, orgId, resendStatuses, loadingResendStatus]);

  // Fetch all sent emails from Resend list API, indexed by recipient
  const fetchResendEmailList = useCallback(async (force = false) => {
    if (!accessToken || !orgId || !volunteers?.length) return;

    const uniqueEmails = [
      ...new Set(
        volunteers
          .map(v => (v.email ? v.email.trim().toLowerCase() : null))
          .filter(e => e && e.includes("@"))
      ),
    ];

    if (uniqueEmails.length === 0) return;

    try {
      setResendSyncing(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/admin/emails/resend-list`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Org-Id': orgId,
          },
          body: JSON.stringify({ emails: uniqueEmails, force }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const payload = data?.data || data;
        const emailsByRecipient = payload?.emails_by_recipient;
        if (emailsByRecipient) {
          const normalizedEmailsByRecipient = {};
          Object.entries(emailsByRecipient).forEach(([key, value]) => {
            const normalizedKey =
              typeof key === "string" ? key.trim().toLowerCase() : "";
            if (normalizedKey) {
              normalizedEmailsByRecipient[normalizedKey] = value;
            }
          });
          setResendEmailsByRecipient(normalizedEmailsByRecipient);
        }
        setResendListLoaded(true);
        if (payload?.syncing) {
          setResendSyncSnackbar(true);
          // Re-fetch once after ~30s to pick up background sync results
          setTimeout(() => fetchResendEmailList(false), 30000);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch Resend email list:", err);
    } finally {
      setResendSyncing(false);
    }
  }, [accessToken, orgId, volunteers]);

  // Reset resend list state when auth context changes so we can refetch
  useEffect(() => {
    setResendListLoaded(false);
    setResendEmailsByRecipient({});
  }, [orgId, accessToken]);

  // Bulk-fetch delivery status for all known resend_ids when volunteers load (DB-first, no list crawl)
  useEffect(() => {
    if (!volunteers?.length || !accessToken || !orgId) return;
    const allIds = [];
    volunteers.forEach(v => {
      const emails = Array.isArray(v.sent_emails) ? v.sent_emails : [];
      emails.forEach(e => { if (e.resend_id && !resendStatuses[e.resend_id]) allIds.push(e.resend_id); });
    });
    if (allIds.length === 0) return;
    const unique = [...new Set(allIds)];
    for (let i = 0; i < unique.length; i += 100) {
      fetchResendStatuses(unique.slice(i, i + 100));
    }
  }, [volunteers, accessToken, orgId]);

  // Helper to get sent emails from either new sent_emails or legacy messages_sent
  const getSentEmails = useCallback((volunteer) => {
    if (Array.isArray(volunteer.sent_emails) && volunteer.sent_emails.length > 0) {
      return volunteer.sent_emails;
    }
    // Backward compatibility with old messages_sent format
    if (Array.isArray(volunteer.messages_sent) && volunteer.messages_sent.length > 0) {
      return volunteer.messages_sent.map(msg => ({
        resend_id: null,
        subject: msg.subject,
        timestamp: msg.timestamp,
        sent_by: msg.sent_by,
        recipient_type: msg.recipient_type,
        _legacy_delivery_status: msg.delivery_status,
      }));
    }
    return [];
  }, []);

  const handleCloseFeedback = () => {
    setCopyFeedback({ open: false, message: '' });
  };

  const columns = useMemo(() => {
    const baseColumns = [
      { id: "id", label: "ID", minWidth: 50 },
      { id: "name", label: "Name", minWidth: 100 },
      { id: "created_timestamp", label: "Created", minWidth: 50 },
      { id: "messages_sent", label: "Msgs", minWidth: 20 },
      { id: "certificates", label: "Certs", minWidth: 20 },
      { id: "email", label: "Email", minWidth: 140, priority: 2 },
      { id: "pronouns", label: "Pronouns", minWidth: 80, priority: 3 }, // Increased from 70 for better spacing
      { id: "company", label: "Company", minWidth: 90, priority: 2 }, // Reduced from 120
      { id: "isInPerson", label: "In Person", minWidth: 70 }, // Reduced from 100
      { id: "isSelected", label: "Selected", minWidth: 80 }, // Reduced from 100
      { id: "slack_user_id", label: "Slack", minWidth: 40, priority: 3 }, // Reduced from 50
    ];

    if (type === "mentors") {
      return [
        ...baseColumns,
        { id: "checkedIn", label: "Checked In", minWidth: 80, priority: 2 },
        { id: "availability", label: "Slots", minWidth: 100, priority: 2 },
        { id: "participationCount", label: "Experience", minWidth: 90, priority: 2 },
        { id: "linkedin", label: "LinkedIn", minWidth: 50, priority: 3 },
        { id: "expertise", label: "Expertise", minWidth: 120, priority: 2 }, // Reduced from 150
        { id: "country", label: "Country", minWidth: 70, priority: 3 }, // Reduced from 100
        { id: "state", label: "State", minWidth: 60, priority: 3 }, // Reduced from 100
      ];
    } else if (type === "judges") {
      // Review-critical columns (status, training, video, title, company)
      // sit right after Name so judges can be screened without horizontal
      // scrolling; the shared base columns follow.
      const base = Object.fromEntries(baseColumns.map((col) => [col.id, col]));
      return [
        base.id,
        base.name,
        { id: "status", label: "Status", minWidth: 90 },
        { id: "training", label: "Training", minWidth: 90, sortable: false },
        { id: "introVideo", label: "Video", minWidth: 56, sortable: false },
        { id: "title", label: "Title", minWidth: 100 },
        base.company,
        base.created_timestamp,
        base.messages_sent,
        base.certificates,
        base.email,
        base.pronouns,
        base.isInPerson,
        base.isSelected,
        base.slack_user_id,
        { id: "checkedIn", label: "Checked In", minWidth: 80, priority: 2 },
        { id: "background", label: "Background", minWidth: 120, priority: 3 },
      ];
    } else if (type === "volunteers") {
      return [
        { id: "id", label: "ID", minWidth: 40, priority: 3 },
        { id: "name", label: "Name", minWidth: 100 },
        { id: "messages_sent", label: "Msgs", minWidth: 20, priority: 3 },
        { id: "certificates", label: "Certs", minWidth: 20, priority: 3 },
        { id: "email", label: "Email", minWidth: 120, priority: 2 },
        { id: "checkedIn", label: "Checked In", minWidth: 80, priority: 2 },
        { id: "availableDays", label: "Time Slots", minWidth: 100, priority: 3 },
        { id: "experienceLevel", label: "Experience", minWidth: 90 },        
        { id: "title", label: "Title", minWidth: 90, priority: 2 },
        { id: "company", label: "Company", minWidth: 90, priority: 2 },
        { id: "socialCauses", label: "Causes", minWidth: 100, priority: 3 },        
        { id: "isInPerson", label: "In Person", minWidth: 70, priority: 2 },
        { id: "isSelected", label: "Selected", minWidth: 80 },
        { id: "pronouns", label: "Pronouns", minWidth: 80, priority: 3 },
        { id: "slack_user_id", label: "Slack", minWidth: 40, priority: 3 },
        { id: "artifacts", label: "Contrib.", minWidth: 100, priority: 3 },
      ];
    } else if (type === "hackers") {
      const cols = [
        ...baseColumns,
        { id: "checkedIn", label: "Checked In", minWidth: 80, priority: 2 },
        { id: "teamCode", label: "Team Code", minWidth: 50 }, // Reduced from 120, shorter label
        { id: "participantType", label: "Type", minWidth: 80 }, // Reduced from 120, shorter label
        { id: "experienceLevel", label: "Exp.", minWidth: 60 }, // Reduced from 120, shorter label
        { id: "teamStatus", label: "Team", minWidth: 80 }, // Reduced from 120, shorter label
        { id: "primaryRoles", label: "Roles", minWidth: 100, priority: 2 }, // Reduced from 150
      ];
      if (depositEnabled) {
        cols.push({ id: "deposit", label: "Deposit", minWidth: 130 });
      }
      return cols;
    } else if (type === "sponsors") {
      return [
        ...baseColumns,
        { id: "checkedIn", label: "Checked In", minWidth: 80, priority: 2 },
        { id: "sponsorshipTypes", label: "Sponsorship", minWidth: 100 },
        { id: "title", label: "Title", minWidth: 90 },
        { id: "volunteerType", label: "Vol. Type", minWidth: 90 },
        { id: "volunteerCount", label: "Vol. Count", minWidth: 70 },
        { id: "volunteerHours", label: "Vol. Hours", minWidth: 70 },
        { id: "phoneNumber", label: "Phone", minWidth: 100, priority: 2 },
        { id: "preferredContact", label: "Pref. Contact", minWidth: 80, priority: 3 },
        { id: "useLogo", label: "Use Logo", minWidth: 70, priority: 3 },
      ];
    }

    return baseColumns;
  }, [type, depositEnabled]);

  const selectedCount = useMemo(() => {
    return volunteers.filter((volunteer) => volunteer.isSelected).length;
  }, [volunteers]);

  const eligibleForSlackCount = useMemo(() => {
    return volunteers.filter((volunteer) => 
      volunteer.isSelected && volunteer.slack_user_id && volunteer.slack_user_id.trim() !== ''
    ).length;
  }, [volunteers]);

  const eligibleForEmailCount = useMemo(() => {
    return volunteers.filter((volunteer) =>
      volunteer.isSelected && volunteer.email && volunteer.email.trim() !== '' && volunteer.id
    ).length;
  }, [volunteers]);

  const notSelectedForEmailCount = useMemo(() => {
    return volunteers.filter((volunteer) =>
      !volunteer.isSelected && volunteer.email && volunteer.email.trim() !== '' && volunteer.id
    ).length;
  }, [volunteers]);

  const eligibleForCertificateCount = useMemo(() => {
    // Only mentors and judges can receive certificates
    if (type !== 'mentors' && type !== 'judges') return 0;
    return volunteers.filter((volunteer) =>
      volunteer.isSelected && volunteer.slack_user_id && volunteer.slack_user_id.trim() !== ''
    ).length;
  }, [volunteers, type]);

  // Filter volunteers based on checked-in status
  const filteredVolunteers = useMemo(() => {
    let filtered = volunteers;

    // Apply checked-in filter
    if (checkedInFilter !== 'all') {
      if (checkedInFilter === 'yes') {
        filtered = filtered.filter(volunteer => volunteer.checkedIn === true);
      } else if (checkedInFilter === 'no') {
        filtered = filtered.filter(volunteer =>
          volunteer.checkedIn === false ||
          volunteer.checkedIn === null ||
          volunteer.checkedIn === undefined
        );
      }
    }

    return filtered;
  }, [volunteers, checkedInFilter]);

  const renderCellContent = (volunteer, column) => {
    switch (column.id) {
      case "training": {
        const chip = trainingChipConfig(
          trainingStatusByEmail?.[normalizeEmail(volunteer.email)],
          volunteer,
          trainingLmsAccess,
        );
        if (!chip) {
          return (
            <Typography variant="caption" color="text.secondary">
              —
            </Typography>
          );
        }
        return (
          <Tooltip
            title={<span style={{ whiteSpace: "pre-line" }}>{chip.tooltip}</span>}
          >
            <Chip
              label={chip.label}
              size="small"
              color={chip.color}
              variant="outlined"
            />
          </Tooltip>
        );
      }
      case "introVideo":
        return volunteer.introductionVideoUrl ? (
          <Tooltip title="Play intro video">
            <IconButton
              size="small"
              aria-label="Play intro video"
              onClick={() =>
                onPlayVideo?.(volunteer.introductionVideoUrl, volunteer.name)
              }
            >
              <PlayCircleIcon fontSize="small" color="primary" />
            </IconButton>
          </Tooltip>
        ) : (
          <Typography variant="caption" color="text.secondary">
            —
          </Typography>
        );
      case "deposit":
        return (
          <HackerDepositChip
            volunteer={volunteer}
            onClick={onDepositClick ? () => onDepositClick(volunteer) : undefined}
          />
        );
      case "id":
        const id = volunteer.id || "N/A";
        const truncatedId = id.length > 8 ? `${id.slice(0, 8)}...` : id;
        return (
          <Tooltip title={`${id} (click to copy)`}>
            <ClickableCell
              variant="caption"
              onClick={() => handleCopyToClipboard(id, 'ID')}
            >
              {truncatedId}
            </ClickableCell>
          </Tooltip>
        );
      case "name":
        const name = volunteer.name || "";
        return (
          <Tooltip title="Click to copy name">
            <ClickableCell
              variant="caption"
              onClick={() => handleCopyToClipboard(name, 'Name')}
              sx={{ maxWidth: '90px' }}
            >
              {name}
            </ClickableCell>
          </Tooltip>
        );
      case "email":
        const email = volunteer.email || "";
        const displayEmail = email.length > 25;
        return (
          <Tooltip title={displayEmail ? `${email} (Click to copy)` : "Click to copy email"}>
            <ClickableCell
              variant="caption" 
              onClick={() => handleCopyToClipboard(email, 'Email')}
              sx={{ maxWidth: '130px' }}
            >
              {email}
            </ClickableCell>
          </Tooltip>
        );
      case "pronouns":
        const pronouns = volunteer.pronouns || "";
        return (
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '70px'
            }}
          >
            {pronouns}
          </Typography>
        );
      case "isInPerson":
        return volunteer[column.id] ? (
          <Chip label="Yes" size="small" color="success" sx={{ minWidth: 45, fontSize: '0.75rem' }} />
        ) : (
          <Chip label="No" size="small" color="default" sx={{ minWidth: 45, fontSize: '0.75rem' }} />
        );
      case "isSelected":
        return volunteer[column.id] ? (
          <Tooltip title="Selected">
            <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
              <CheckCircleIcon color="success" fontSize="small" />
            </Box>
          </Tooltip>
        ) : (
          <Tooltip title="Not Selected">
            <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
              <CancelIcon color="error" fontSize="small" />
            </Box>
          </Tooltip>
        );
      case "checkedIn":
        const checkedIn = volunteer.checkedIn;
        const checkedInAt = volunteer.checkedInAt;
        
        let checkInStatus, color, chipColor;
        if (checkedIn === true) {
          checkInStatus = "Yes";
          color = "success";
          chipColor = "success";
        } else if (checkedIn === false) {
          checkInStatus = "No";
          color = "default";
          chipColor = "default";
        } else {
          checkInStatus = "Not set";
          color = "text.secondary";
          chipColor = "default";
        }
        
        const tooltipTitle = checkedInAt 
          ? `Checked in at: ${new Date(checkedInAt).toLocaleString()}`
          : checkInStatus === "Not set" 
            ? "Not checked in"
            : "No check-in timestamp available";
        
        return (
          <Tooltip title={tooltipTitle}>
            <Chip 
              label={checkInStatus} 
              size="small" 
              color={chipColor}
              variant={checkInStatus === "Not set" ? "outlined" : "filled"}
              sx={{ fontSize: '0.75rem', minWidth: 60 }}
            />
          </Tooltip>
        );
      case "status":
        const status = volunteer.status || "pending";
        const statusLabels = {
          pending: "Pending",
          approved: "Approved",
          denied: "Denied",
          verified_travel: "Verified",
          confirmed: "Confirmed",
          withdrew: "Withdrew",
          no_show: "No Show",
        };
        return (
          <StatusChip
            statustype={status}
            label={statusLabels[status] || status}
            size="small"
            sx={{ fontSize: '0.7rem', minWidth: 60 }}
          />
        );
      case "messages_sent":
        const sentEmails = getSentEmails(volunteer);
        const messageCount = sentEmails.length;

        // Look up emails from Resend list API for this volunteer
        const volunteerEmail = volunteer.email?.toLowerCase();
        const resendListEmails = volunteerEmail ? (resendEmailsByRecipient[volunteerEmail] || []) : [];

        // Delivery status chip rendering helper (shared by stored and list-based emails)
        const eventMap = {
          delivered: { label: 'Delivered', color: 'success' },
          sent: { label: 'Sent', color: 'info' },
          bounced: { label: 'Bounced', color: 'error' },
          complained: { label: 'Complained', color: 'error' },
          delivery_delayed: { label: 'Delayed', color: 'warning' },
        };

        const renderResendEventChip = (lastEvent) => {
          const display = eventMap[lastEvent] || { label: lastEvent || 'Unknown', color: 'default' };
          return <Chip label={display.label} size="small" sx={{ fontSize: '0.6rem', height: '16px' }} color={display.color} />;
        };

        if (messageCount === 0 && resendListEmails.length === 0) {
          return (
            <Chip
              label="0"
              size="small"
              variant="outlined"
              sx={{ minWidth: 32, fontSize: '0.75rem' }}
            />
          );
        }

        // Delivery status chip for a single sent email (stored records)
        const renderDeliveryStatus = (email) => {
          // Check for Resend live status first (from per-ID fetch)
          if (email.resend_id && resendStatuses[email.resend_id]) {
            const status = resendStatuses[email.resend_id];
            return renderResendEventChip(status.last_event);
          }
          // Loading state
          if (email.resend_id && loadingResendStatus[email.resend_id]) {
            return <Chip label="Loading..." size="small" sx={{ fontSize: '0.6rem', height: '16px' }} variant="outlined" />;
          }
          // Try matching from Resend list data by subject when no resend_id
          if (!email.resend_id && email.subject && resendListEmails.length > 0) {
            const match = resendListEmails.find(re => re.subject === email.subject);
            if (match) {
              return renderResendEventChip(match.last_event);
            }
          }
          // Legacy delivery_status fallback
          if (email._legacy_delivery_status) {
            const ds = email._legacy_delivery_status;
            return (
              <>
                {ds.email_sent && <Chip label="Email ✓" size="small" sx={{ fontSize: '0.6rem', height: '16px' }} color="success" />}
                {ds.slack_sent && <Chip label="Slack ✓" size="small" sx={{ fontSize: '0.6rem', height: '16px' }} color="info" />}
                {ds.email_error && <Chip label="Email ✗" size="small" sx={{ fontSize: '0.6rem', height: '16px' }} color="error" />}
                {ds.slack_error && <Chip label="Slack ✗" size="small" sx={{ fontSize: '0.6rem', height: '16px' }} color="error" />}
              </>
            );
          }
          // Has resend_id but not yet fetched
          if (email.resend_id) {
            return <Chip label="Click for status" size="small" sx={{ fontSize: '0.6rem', height: '16px' }} variant="outlined" />;
          }
          return null;
        };

        // Build a normalized key for matching emails without relying solely on resend_id.
        // We use a combination of lowercased subject and timestamp truncated to the minute,
        // so legacy stored emails without resend_id can still be matched against Resend list entries.
        const buildEmailKey = (subject, timestamp) => {
          if (!subject || !timestamp) {
            return null;
          }
          const normalizedSubject = String(subject).trim().toLowerCase();
          const date = new Date(timestamp);
          if (Number.isNaN(date.getTime())) {
            return null;
          }
          // Truncate to minute precision to allow for small differences in seconds.
          const isoMinute = date.toISOString().slice(0, 16); // 'YYYY-MM-DDTHH:MM'
          return `${normalizedSubject}|${isoMinute}`;
        };

        // Collect keys for all stored emails (including legacy ones without resend_id).
        const storedEmailKeys = new Set();
        sentEmails.forEach((email) => {
          const timestamp = email.timestamp || email.created_at;
          const key = buildEmailKey(email.subject, timestamp);
          if (key) {
            storedEmailKeys.add(key);
          }
        });

        // Determine display count: stored messages + any additional from Resend list
        const storedResendIds = new Set(sentEmails.filter(e => e.resend_id).map(e => e.resend_id));
        const additionalResendEmails = resendListEmails.filter((re) => {
          // First, exclude any entries whose id we already have stored.
          if (storedResendIds.has(re.id)) {
            return false;
          }
          // Then, exclude entries that match a stored email by our fallback key
          // (subject + timestamp/window), to avoid duplicating legacy records.
          const timestamp = re.timestamp || re.created_at;
          const key = buildEmailKey(re.subject, timestamp);
          if (key && storedEmailKeys.has(key)) {
            return false;
          }
          return true;
        });
        const totalDisplayCount = messageCount + additionalResendEmails.length;

        const messagesToolTipContent = (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Recent Messages ({totalDisplayCount})
            </Typography>
            {sentEmails.slice(0, 5).map((email, idx) => (
              <Box key={`stored-${idx}`} sx={{ mb: 1, pb: 1, borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                <Typography variant="caption" sx={{ display: 'block', fontWeight: 'bold' }}>
                  {new Date(email.timestamp).toLocaleString()}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                  Subject: {email.subject}
                </Typography>
                {email.sent_by && (
                  <Typography variant="caption" sx={{ display: 'block' }}>
                    Sent by: {email.sent_by}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                  {renderDeliveryStatus(email)}
                </Box>
              </Box>
            ))}
            {additionalResendEmails.length > 0 && (
              <>
                <Typography variant="caption" sx={{ display: 'block', fontStyle: 'italic', mb: 1, mt: 1, opacity: 0.8 }}>
                  Via Resend
                </Typography>
                {additionalResendEmails.slice(0, 5).map((re, idx) => (
                  <Box key={`resend-${idx}`} sx={{ mb: 1, pb: 1, borderBottom: idx < Math.min(4, additionalResendEmails.length - 1) ? '1px solid rgba(255,255,255,0.2)' : 'none' }}>
                    <Typography variant="caption" sx={{ display: 'block', fontWeight: 'bold' }}>
                      {new Date(re.created_at).toLocaleString()}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                      Subject: {re.subject}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                      {renderResendEventChip(re.last_event)}
                    </Box>
                  </Box>
                ))}
                {additionalResendEmails.length > 5 && (
                  <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                    ...and {additionalResendEmails.length - 5} more from Resend
                  </Typography>
                )}
              </>
            )}
            {messageCount > 5 && (
              <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                ...and {messageCount - 5} more stored messages
              </Typography>
            )}
          </Box>
        );

        // Fetch Resend statuses when the tooltip opens (supplementary per-ID fetch)
        const handleTooltipOpen = () => {
          const resendIds = sentEmails
            .filter(e => e.resend_id)
            .map(e => e.resend_id);
          if (resendIds.length > 0) {
            fetchResendStatuses(resendIds);
          }
        };

        return (
          <Tooltip
            title={messagesToolTipContent}
            arrow
            placement="bottom-start"
            onOpen={handleTooltipOpen}
            componentsProps={{
              tooltip: {
                sx: {
                  maxWidth: 400,
                  '& .MuiTooltip-arrow': {
                    color: 'rgba(97, 97, 97, 0.9)',
                  },
                },
              },
            }}
          >
            <Chip
              label={totalDisplayCount}
              size="small"
              variant="outlined"
              color="primary"
              sx={{ cursor: 'pointer', minWidth: 32, fontSize: '0.75rem' }}
            />
          </Tooltip>
        );
      case "certificates":
        const certs = volunteer.certificates || [];
        const certCount = certs.length;

        if (certCount === 0) {
          return (
            <Chip
              label="0"
              size="small"
              variant="outlined"
              sx={{ minWidth: 32, fontSize: '0.75rem' }}
            />
          );
        }

        const certsTooltipContent = (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Certificates ({certCount})
            </Typography>
            {certs.map((cert, idx) => {
              // Handle both old format (string) and new format (object with filename)
              const certFilename = typeof cert === 'string' ? cert : cert.filename;
              const hasMetadata = typeof cert === 'object' && cert.filename;
              return (
                <Box key={idx} sx={{ mb: hasMetadata ? 1 : 0.5, pb: hasMetadata ? 0.5 : 0, borderBottom: hasMetadata && idx < certs.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                  {hasMetadata && cert.reasons && (
                    <Typography variant="caption" sx={{ display: 'block', color: '#fff', fontWeight: 600, mb: 0.25 }}>
                      {cert.hearts && `${cert.hearts} heart${cert.hearts !== 1 ? 's' : ''} - `}{cert.reasons.join(', ')}
                    </Typography>
                  )}
                  {hasMetadata && cert.timestamp && (
                    <Typography variant="caption" sx={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.65rem', mb: 0.25 }}>
                      {new Date(cert.timestamp).toLocaleString()}
                    </Typography>
                  )}
                  <Typography
                    variant="caption"
                    component="a"
                    href={`https://cdn.ohack.dev/certificates/${certFilename}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: '#90caf9',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      display: 'block',
                      fontSize: '0.65rem',
                      '&:hover': { color: '#fff' },
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {certFilename}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        );

        return (
          <Tooltip
            title={certsTooltipContent}
            arrow
            placement="bottom-start"
            componentsProps={{
              tooltip: {
                sx: {
                  maxWidth: 400,
                  '& .MuiTooltip-arrow': {
                    color: 'rgba(97, 97, 97, 0.9)',
                  },
                },
              },
            }}
          >
            <Chip
              label={certCount}
              size="small"
              variant="outlined"
              color="success"
              sx={{ cursor: 'pointer', minWidth: 32, fontSize: '0.75rem' }}
            />
          </Tooltip>
        );
      case "slack_user_id":
        return volunteer.slack_user_id && volunteer.slack_user_id.trim() !== '' ? (
          <Tooltip title="Has Slack ID">
            <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
              <FaSlack size={14} color="#4A154B" />
            </Box>
          </Tooltip>
        ) : (
          <Tooltip title="No Slack ID">
            <Box sx={{ width: 14, height: 14, backgroundColor: '#ccc', borderRadius: '50%' }} />
          </Tooltip>
        );
      case "artifacts":
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {volunteer.artifacts?.slice(0, 3).map((artifact, index) => (
              <Tooltip key={index} title={artifact.comment}>
                <Chip 
                  label={artifact.label} 
                  size="small" 
                  sx={{ fontSize: '0.65rem', height: 20 }}
                />
              </Tooltip>
            ))}
            {volunteer.artifacts?.length > 3 && (
              <Chip 
                label={`+${volunteer.artifacts.length - 3}`} 
                size="small" 
                variant="outlined"
                sx={{ fontSize: '0.65rem', height: 20 }}
              />
            )}
          </Box>
        );
      case "phoneNumber":
        const phone = volunteer.phoneNumber || "";
        return (
          <Tooltip title="Click to copy phone number">
            <ClickableCell
              variant="caption"
              onClick={() => handleCopyToClipboard(phone, 'Phone Number')}
              sx={{ maxWidth: '90px' }}
            >
              {phone}
            </ClickableCell>
          </Tooltip>
        );
      case "preferredContact":
        const contact = volunteer.preferredContact || "";
        return (
          <Chip 
            label={contact} 
            size="small" 
            color={contact === 'email' ? 'primary' : contact === 'phone' ? 'secondary' : 'default'}
            sx={{ fontSize: '0.7rem', minWidth: 60 }}
          />
        );
      case "useLogo":
        const logoUsage = volunteer.useLogo || "";
        return (
          <Chip 
            label={logoUsage} 
            size="small" 
            color={logoUsage === 'Yes' ? 'success' : logoUsage === 'No' ? 'error' : 'warning'}
            sx={{ fontSize: '0.7rem', minWidth: 45 }}
          />
        );
      case "volunteerType":
        const volType = volunteer.volunteerType || "";
        return (
          <Tooltip title={volType}>
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '80px'
              }}
            >
              {volType}
            </Typography>
          </Tooltip>
        );
      case "volunteerCount":
        const count = volunteer.volunteerCount || "0";
        return (
          <Chip 
            label={count} 
            size="small" 
            variant="outlined"
            color="primary"
            sx={{ fontSize: '0.75rem', minWidth: 32 }}
          />
        );
      case "volunteerHours":
        const hours = volunteer.volunteerHours || "0";
        return (
          <Chip 
            label={`${hours}h`} 
            size="small" 
            variant="outlined"
            color="secondary"
            sx={{ fontSize: '0.75rem', minWidth: 40 }}
          />
        );
      case "sponsorshipTypes":
        const sponsorship = volunteer.sponsorshipTypes || volunteer.sponsorshipTier || volunteer.sponsorshipLevel || "";
        return (
          <Tooltip title={sponsorship}>
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '90px',
                fontWeight: 500
              }}
            >
              {sponsorship}
            </Typography>
          </Tooltip>
        );
      case "experienceLevel":
        const expLevel = volunteer.experienceLevel || "";
        const expColor = expLevel.includes('First time') ? 'info' : 
                        expLevel.includes('Some experience') ? 'warning' :
                        expLevel.includes('Experienced') ? 'success' : 'default';
        const expLabel = expLevel.includes('First time') ? 'First Timer' :
                        expLevel.includes('Some experience') ? 'Experienced' :
                        expLevel.includes('Experienced volunteer') ? 'Expert' : 
                        expLevel.substring(0, 8) + (expLevel.length > 8 ? '...' : '');
        return (
          <Tooltip title={expLevel}>
            <Chip 
              label={expLabel} 
              size="small" 
              color={expColor}
              sx={{ fontSize: '0.7rem', minWidth: 60 }}
            />
          </Tooltip>
        );
      case "socialCauses":
        const causes = volunteer.socialCauses || volunteer.otherSocialCause || "";
        const causesList = causes.split(',').map(c => c.trim()).filter(c => c);
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {causesList.slice(0, 2).map((cause, index) => (
              <Chip 
                key={index}
                label={cause.length > 10 ? cause.substring(0, 10) + '...' : cause} 
                size="small" 
                variant="outlined"
                color="primary"
                sx={{ fontSize: '0.65rem', height: 20 }}
              />
            ))}
            {causesList.length > 2 && (
              <Tooltip title={causesList.slice(2).join(', ')}>
                <Chip 
                  label={`+${causesList.length - 2}`} 
                  size="small" 
                  variant="outlined"
                  sx={{ fontSize: '0.65rem', height: 20 }}
                />
              </Tooltip>
            )}
          </Box>
        );
      case "availability":
        const availability = volunteer.availability || "";
        if (!availability) return <Typography variant="caption" color="text.secondary">No slots</Typography>;
        
        // Simple slot parsing - just extract the essential info without complex time calculations
        // Groups by day name + date (e.g., "Saturday, Oct 11") dynamically from the data
        const parseSlots = (availStr) => {
          if (!availStr) return { dayGroups: [], total: 0 };

          // Split on ", " followed by a day name — avoids breaking "Saturday, Mar 28" on its internal comma
          const slots = availStr.split(/,\s*(?=(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday))/).map(s => s.trim()).filter(s => s);
          const dayMap = new Map(); // key: "DayName, Date" -> array of slots

          slots.forEach(slot => {
            // Extract day name and date (e.g., "Saturday" + "Oct 11")
            const dayMatch = slot.match(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)[,\s]+(\w+\s+\d+)/);
            const sessionMatch = slot.match(/:\s*([^-]+?)\s*-/); // Get session name
            const timeMatch = slot.match(/\(([^)]+)\)/); // Get time range

            // Get role icon and name
            let roleIcon = '👥';
            let roleName = 'General';

            if (slot.includes('🌅') || slot.includes('Early Morning')) {
              roleIcon = '🌅';
              roleName = 'Early Morning';
            } else if (slot.includes('☀️') || slot.includes('Morning')) {
              roleIcon = '☀️';
              roleName = 'Morning';
            } else if (slot.includes('🏙️') || slot.includes('🌤️') || slot.includes('Afternoon')) {
              roleIcon = '🏙️';
              roleName = 'Afternoon';
            } else if (slot.includes('🌆') || slot.includes('Evening')) {
              roleIcon = '🌆';
              roleName = 'Evening';
            } else if (slot.includes('🌙') || slot.includes('Late Night')) {
              roleIcon = '🌙';
              roleName = 'Late Night';
            } else if (slot.includes('🌃') || slot.includes('Night')) {
              roleIcon = '🌃';
              roleName = 'Night';
            } else if (slot.includes('📸') || slot.includes('Photography')) {
              roleIcon = '📸';
              roleName = 'Photography';
            } else if (slot.includes('🧹') || slot.includes('Cleanup')) {
              roleIcon = '🧹';
              roleName = 'Cleanup';
            } else if (slot.includes('🏆') || slot.includes('Judging')) {
              roleIcon = '🏆';
              roleName = 'Judging';
            } else if (slot.includes('📋') || slot.includes('Registration')) {
              roleIcon = '📋';
              roleName = 'Registration';
            } else if (slot.includes('🔧') || slot.includes('Setup')) {
              roleIcon = '🔧';
              roleName = 'Setup';
            }

            if (dayMatch) {
              const dayLabel = `${dayMatch[1]}, ${dayMatch[2]}`; // e.g., "Saturday, Oct 11"
              const slotInfo = {
                day: dayMatch[1],
                date: dayMatch[2],
                session: sessionMatch ? sessionMatch[1].trim() : 'Session',
                time: timeMatch ? timeMatch[1] : '',
                roleIcon,
                roleName,
                full: slot
              };

              if (!dayMap.has(dayLabel)) {
                dayMap.set(dayLabel, []);
              }
              dayMap.get(dayLabel).push(slotInfo);
            }
          });

          // Convert to array sorted by date order (preserves insertion order from data)
          const dayGroups = Array.from(dayMap.entries()).map(([label, slots]) => ({
            label,
            slots
          }));
          const total = dayGroups.reduce((sum, g) => sum + g.slots.length, 0);

          return { dayGroups, total };
        };
        
        const slotData = parseSlots(availability);
        
        // Get unique roles for display
        const allSlots = slotData.dayGroups.flatMap(g => g.slots);
        const roleIcons = [...new Set(allSlots.map(s => s.roleIcon))];

        // Create tooltip content
        const availabilityTooltipContent = (
          <Box sx={{ minWidth: 280 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Availability ({slotData.total} slots)
            </Typography>

            {slotData.dayGroups.map((group, groupIdx) => (
              <Box key={group.label} sx={{ mb: groupIdx < slotData.dayGroups.length - 1 ? 1.5 : 0 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5, color: 'primary.main' }}>
                  {group.label}
                </Typography>
                {group.slots.map((slot, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ mr: 1, minWidth: 20 }}>
                      {slot.roleIcon}
                    </Typography>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={{ display: 'block', fontWeight: 500 }}>
                        {slot.session}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontSize: '0.7rem' }}>
                        {slot.time}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        );

        // Simple table cell display
        return (
          <Tooltip 
            title={availabilityTooltipContent}
            arrow
            placement="bottom-start"
            componentsProps={{
              tooltip: {
                sx: {
                  maxWidth: 400,
                  '& .MuiTooltip-arrow': {
                    color: 'rgba(97, 97, 97, 0.9)',
                  },
                },
              },
            }}
          >
            <Box sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {/* Slot count badge */}
              <Chip 
                label={slotData.total}
                size="small" 
                color="primary"
                sx={{ 
                  fontSize: '0.75rem', 
                  height: 22,
                  minWidth: 32,
                  fontWeight: 600
                }}
              />
              
              {/* Role icons */}
              <Box sx={{ display: 'flex', gap: 0.25 }}>
                {roleIcons.slice(0, 3).map((icon, idx) => (
                  <Typography key={idx} variant="caption" sx={{ fontSize: '0.9rem' }}>
                    {icon}
                  </Typography>
                ))}
                {roleIcons.length > 3 && (
                  <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                    +{roleIcons.length - 3}
                  </Typography>
                )}
              </Box>
              
              {/* Day indicators */}
              <Box sx={{ display: 'flex', gap: 0.25 }}>
                {slotData.dayGroups.map((group) => (
                  <Chip
                    key={group.label}
                    label={group.slots[0]?.day?.charAt(0) || '?'}
                    size="small"
                    variant="outlined"
                    title={group.label}
                    sx={{ fontSize: '0.65rem', height: 18, minWidth: 20 }}
                  />
                ))}
              </Box>
            </Box>
          </Tooltip>
        );
      case "availableDays":
        const availDays = volunteer.availableDays || [];
        if (!availDays.length) {
          return <Typography variant="caption" color="text.secondary">No days</Typography>;
        }
        
        // Count unique days
        const days = new Set();
        const roles = new Set();
        
        availDays.forEach(dayStr => {
          // Extract day (Friday, Saturday, Sunday)
          if (dayStr.includes('Friday')) days.add('Fri');
          if (dayStr.includes('Saturday')) days.add('Sat');
          if (dayStr.includes('Sunday')) days.add('Sun');
          
          // Extract role types
          if (dayStr.includes('Food Service')) roles.add('🍽️');
          if (dayStr.includes('Cleanup')) roles.add('🧹');
          if (dayStr.includes('Photography')) roles.add('📸');
          if (dayStr.includes('Registration')) roles.add('📋');
          if (dayStr.includes('Setup')) roles.add('🔧');
        });
        
        const dayArray = Array.from(days);
        const roleArray = Array.from(roles);
        
        return (
            <Tooltip 
              title={
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Time Slots ({availDays.length})
                  </Typography>
                  {availDays.map((dayStr, idx) => (
                    <Typography key={idx} variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                      {dayStr}
                    </Typography>
                  ))}
                </Box>
              }
              arrow
              placement="bottom-start"
              componentsProps={{
                tooltip: {
                  sx: {
                    maxWidth: 400,
                    '& .MuiTooltip-arrow': {
                      color: 'rgba(97, 97, 97, 0.9)',
                    },
                  },
                },
              }}
            >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Chip 
                label={availDays.length}
                size="small" 
                color="primary"
                sx={{ fontSize: '0.75rem', minWidth: 28 }}
              />
              <Box sx={{ display: 'flex', gap: 0.25 }}>
                {dayArray.slice(0, 3).map((day, idx) => (                  
                  <Chip 
                    key={idx}
                    label={day} 
                    size="small" 
                    variant="outlined"
                    sx={{ fontSize: '0.65rem', height: 18, minWidth: 28 }}
                  />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 0.25 }}>
                {roleArray.slice(0, 2).map((role, idx) => (
                  <span key={idx} style={{ fontSize: '0.8rem' }}>{role}</span>
                ))}
                {roleArray.length > 2 && (
                  <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                    +{roleArray.length - 2}
                  </Typography>
                )}
              </Box>
            </Box>
          </Tooltip>
        );
      case "title":
        const jobTitle = volunteer.title || "";
        return (
          <Tooltip title={jobTitle}>
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '80px',
                fontWeight: 500
              }}
            >
              {jobTitle}
            </Typography>
          </Tooltip>
        );
      case "linkedin":
        const linkedinUrl = volunteer.linkedin || volunteer.linkedinProfile || "";
        if (!linkedinUrl) return <Typography variant="caption" color="text.secondary">—</Typography>;
        const fullLinkedinUrl = linkedinUrl.startsWith('http') ? linkedinUrl : `https://${linkedinUrl}`;
        return (
          <Tooltip title={linkedinUrl}>
            <IconButton
              size="small"
              component="a"
              href={fullLinkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: '#0077B5' }}
            >
              <FaLinkedin size={16} />
            </IconButton>
          </Tooltip>
        );
      case "participationCount":
        const participation = volunteer.participationCount || "";
        if (!participation) return <Typography variant="caption" color="text.secondary">—</Typography>;
        const isFirstYear = participation.toLowerCase().includes('first');
        // Extract a short label like "1st", "2nd", "3rd", "4th" from the text
        const yearMatch = participation.match(/(first|second|third|fourth|fifth|\d+)/i);
        const yearMap = { first: "1st", second: "2nd", third: "3rd", fourth: "4th", fifth: "5th" };
        const shortLabel = yearMatch
          ? (yearMap[yearMatch[1].toLowerCase()] || `${yearMatch[1]}th`)
          : participation;
        return (
          <Tooltip title={participation}>
            <Chip
              label={shortLabel}
              size="small"
              variant={isFirstYear ? "outlined" : "filled"}
              color={isFirstYear ? "default" : "success"}
              sx={{ fontSize: '0.7rem', height: 22 }}
            />
          </Tooltip>
        );
      case "company":
      default:
        // Judge applications store the field as `companyName` (see
        // ApplicationEditDialog "Company Name"); other types use `company`.
        const value =
          column.id === "company"
            ? companyOf(volunteer)
            : volunteer[column.id];
        if (typeof value === 'string' && value.length > 15) {
          return (
            <Tooltip title={value}>
              <Typography 
                variant="caption" 
                sx={{ 
                  cursor: 'pointer',
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {value.substring(0, 12)}...
              </Typography>
            </Tooltip>
          );
        }
        return (
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {value}
          </Typography>
        );
    }
  };

  // Mobile Card View Component
  const MobileCardView = ({ volunteers }) => {
    return (
      <Stack spacing={1.5}>
        {volunteers.map((volunteer, index) => {
          const getStatusColor = (isSelected, checkedIn) => {
            if (isSelected && checkedIn) return 'success';
            if (isSelected) return 'primary';
            return 'default';
          };

          const primaryText = volunteer.name || 'Unknown';
          const secondaryTexts = [
            volunteer.email,
            companyOf(volunteer),
            volunteer.title
          ].filter(Boolean);

          return (
            <Card
              key={volunteer.id || `${volunteer.name}-${index}`}
              sx={{
                backgroundColor: volunteer.isSelected ? "#e8f5e9" : "inherit",
                border: volunteer.isSelected ? '1px solid' : 'none',
                borderColor: volunteer.isSelected ? 'success.light' : 'transparent'
              }}
            >
              <CardContent sx={{ pb: 1 }}>
                {/* Header Row */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar
                    src={volunteer.profile_image || volunteer.photoUrl}
                    alt={volunteer.name}
                    sx={{ width: 40, height: 40, mr: 2 }}
                  >
                    {volunteer.name?.charAt(0) || '?'}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {primaryText}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {secondaryTexts.slice(0, 2).join(' • ')}
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      minWidth: 'max-content'
                    }}
                  >
                    #{index + 1}
                  </Typography>
                </Box>

                {/* Status Chips Row */}
                <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={volunteer.isSelected ? 'Selected' : 'Not Selected'}
                    size="small"
                    color={getStatusColor(volunteer.isSelected, volunteer.checkedIn)}
                    variant={volunteer.isSelected ? 'filled' : 'outlined'}
                  />
                  {volunteer.isInPerson && (
                    <Chip label="In Person" size="small" color="info" variant="outlined" />
                  )}
                  {volunteer.checkedIn && (
                    <Chip label="Checked In" size="small" color="success" variant="outlined" />
                  )}
                  {volunteer.slack_user_id && (
                    <Chip
                      icon={<FaSlack size={12} />}
                      label="Slack"
                      size="small"
                      variant="outlined"
                      sx={{ '& .MuiChip-icon': { mr: 0.5 } }}
                    />
                  )}
                  {getSentEmails(volunteer).length > 0 && (
                    <Chip
                      label={`${getSentEmails(volunteer).length} msgs`}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  )}
                  {type === "hackers" && depositEnabled && (
                    <HackerDepositChip
                      volunteer={volunteer}
                      onClick={
                        onDepositClick
                          ? () => onDepositClick(volunteer)
                          : undefined
                      }
                    />
                  )}
                </Box>

                {/* Key Info for Specific Types */}
                {type === 'volunteers' && volunteer.availability && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      Availability:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {/* Extract unique day+date labels from availability string */}
                      {(() => {
                        const dayMatches = [...(volunteer.availability || '').matchAll(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)[,\s]+(\w+\s+\d+)/g)];
                        const uniqueDays = [...new Set(dayMatches.map(m => `${m[1]}, ${m[2]}`))];
                        return uniqueDays.map(dayLabel => (
                          <Chip key={dayLabel} label={dayLabel} size="small" variant="outlined" color="primary" />
                        ));
                      })()}
                      {volunteer.experienceLevel && (
                        <Chip
                          label={volunteer.experienceLevel.includes('First time') ? 'First Timer' : 'Experienced'}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>
                )}

                {type === 'judges' && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center', mb: 1 }}>
                    {(() => {
                      const chip = trainingChipConfig(
                        trainingStatusByEmail?.[normalizeEmail(volunteer.email)],
                        volunteer,
                        trainingLmsAccess,
                      );
                      return chip ? (
                        <Tooltip title={<span style={{ whiteSpace: 'pre-line' }}>{chip.tooltip}</span>}>
                          <Chip label={chip.label} size="small" color={chip.color} variant="outlined" />
                        </Tooltip>
                      ) : null;
                    })()}
                    {volunteer.introductionVideoUrl && onPlayVideo && (
                      <Tooltip title="Play intro video">
                        <IconButton
                          size="small"
                          aria-label="Play intro video"
                          onClick={() => onPlayVideo(volunteer.introductionVideoUrl, volunteer.name)}
                        >
                          <PlayCircleIcon fontSize="small" color="primary" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                )}

                {type === 'judges' && volunteer.background && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Background: {volunteer.background.substring(0, 60)}{volunteer.background.length > 60 ? '...' : ''}
                  </Typography>
                )}

                {type === 'mentors' && volunteer.expertise && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Expertise: {volunteer.expertise.substring(0, 60)}{volunteer.expertise.length > 60 ? '...' : ''}
                  </Typography>
                )}
              </CardContent>

              {/* Actions */}
              <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
                <Box sx={{ display: 'flex', gap: 0.5, width: '100%', alignItems: 'center' }}>
                  <Tooltip title="Edit">
                    <IconButton
                      onClick={() => onEditVolunteer(volunteer)}
                      size="small"
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {onMessageVolunteer && (
                    <Tooltip title="Send Message">
                      <IconButton
                        onClick={() => onMessageVolunteer(volunteer)}
                        size="small"
                        color="secondary"
                      >
                        <FaPaperPlane size={12} />
                      </IconButton>
                    </Tooltip>
                  )}
                  {volunteer.user_db_id && (
                    <Tooltip title="View OHack profile">
                      <IconButton
                        component={NextLink}
                        href={`/profile/${volunteer.user_db_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                      >
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Box sx={{ flex: 1 }} />
                  {volunteer.email && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleCopyToClipboard(volunteer.email, 'Email')}
                      sx={{ minWidth: 'auto', px: 1 }}
                    >
                      Copy Email
                    </Button>
                  )}
                </Box>
              </CardActions>
            </Card>
          );
        })}
      </Stack>
    );
  };

  return (
    <>
      {/* Filter Controls */}
      <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Checked In</InputLabel>
          <Select
            value={checkedInFilter}
            onChange={(e) => onCheckedInFilterChange && onCheckedInFilterChange(e.target.value)}
            label="Checked In"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="yes">Checked In</MenuItem>
            <MenuItem value="no">Not Checked In</MenuItem>
          </Select>
        </FormControl>

        {checkedInFilter !== 'all' && (
          <Chip
            label={`Checked In: ${checkedInFilter === 'yes' ? 'Yes' : 'No'}`}
            onDelete={() => onCheckedInFilterChange && onCheckedInFilterChange('all')}
            size="small"
            variant="outlined"
          />
        )}

        <Tooltip title="Discover emails not yet tracked in the database (confirmation emails, etc.)">
          <span>
            <Button
              size="small"
              variant="outlined"
              disabled={resendSyncing}
              onClick={() => fetchResendEmailList(true)}
              sx={{ ml: 'auto' }}
            >
              {resendSyncing ? 'Syncing…' : 'Sync from Resend'}
            </Button>
          </span>
        </Tooltip>
      </Box>

      <Snackbar
        open={resendSyncSnackbar}
        autoHideDuration={35000}
        onClose={() => setResendSyncSnackbar(false)}
        message="Sync started — refreshing in ~30s"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontSize: isMobile ? '0.9rem' : '0.95rem' }}>
            {type}: {filteredVolunteers.length} of {volunteers.length} | Selected: {selectedCount}
          </Typography>
          {type === 'volunteers' && !isMobile && (
            <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
              📅 Availability column is highlighted - scroll horizontally to see all columns
            </Typography>
          )}
        </Box>
        <Box display="flex" gap={0.5} flexWrap="wrap">
          {onBatchEmail && eligibleForEmailCount > 0 && (
            <Tooltip title={`Send Email to ${eligibleForEmailCount} selected`}>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => onBatchEmail(volunteers, type, true)}
                size={isMobile ? 'small' : 'small'}
                sx={{ minWidth: 'auto', px: 1 }}
              >
                <EmailIcon fontSize="small" />
                <Typography variant="caption" sx={{ ml: 0.5 }}>
                  {eligibleForEmailCount}
                </Typography>
              </Button>
            </Tooltip>
          )}
          {onSlackInvite && eligibleForSlackCount > 0 && (
            <Tooltip title={`Invite ${eligibleForSlackCount} to Slack`}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => onSlackInvite(volunteers, type)}
                size={isMobile ? 'small' : 'small'}
                sx={{ minWidth: 'auto', px: 1 }}
              >
                <FaSlack size={14} />
                <Typography variant="caption" sx={{ ml: 0.5 }}>
                  {eligibleForSlackCount}
                </Typography>
              </Button>
            </Tooltip>
          )}
          {onBulkCertificate && eligibleForCertificateCount > 0 && (
            <Tooltip title={`Send Certificates to ${eligibleForCertificateCount} selected ${type}`}>
              <Button
                variant="contained"
                color="success"
                onClick={() => onBulkCertificate(volunteers, type)}
                size={isMobile ? 'small' : 'small'}
                sx={{ minWidth: 'auto', px: 1 }}
              >
                <CertificateIcon fontSize="small" />
                <Typography variant="caption" sx={{ ml: 0.5 }}>
                  {eligibleForCertificateCount}
                </Typography>
              </Button>
            </Tooltip>
          )}
          {onBatchEmailNotSelected && notSelectedForEmailCount > 0 && (
            <Tooltip title={`Send rejection email to ${notSelectedForEmailCount}`}>
              <Button
                variant="outlined"
                color="warning"
                onClick={() => onBatchEmailNotSelected(volunteers, type, false)}
                size={isMobile ? 'small' : 'small'}
                sx={{ minWidth: 'auto', px: 1 }}
              >
                <EmailIcon fontSize="small" />
                <Typography variant="caption" sx={{ ml: 0.5 }}>
                  {notSelectedForEmailCount}
                </Typography>
              </Button>
            </Tooltip>
          )}
        </Box>
      </Box>

      {isMobile ? (
        <MobileCardView volunteers={filteredVolunteers} />
      ) : (
        <StyledTableContainer component={Paper}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <StyledTableCell style={{ width: 40 }}>#</StyledTableCell>
              <StyledTableCell style={{ width: 50 }}>
                <Tooltip title="Photo">
                  <Avatar sx={{ width: 24, height: 24 }} />
                </Tooltip>
              </StyledTableCell>
              <StyledTableCell style={{ width: 80 }}>
                Actions
              </StyledTableCell>
              {columns.map((column) => {
                // Handle responsive display
                let displayStyle = 'table-cell';
                if (column.priority === 3) {
                  displayStyle = { xs: 'none', lg: 'table-cell' };
                } else if (column.priority === 2) {
                  displayStyle = { xs: 'none', md: 'table-cell' };
                }

                return (
                  <StyledTableCell
                    key={column.id}
                    sx={{ 
                      minWidth: column.minWidth,
                      display: displayStyle,
                      // Highlight availability column
                      ...(column.id === 'availability' && {
                        backgroundColor: 'primary.light',
                        position: 'sticky',
                        left: type === 'volunteers' ? 220 : 'auto', // Stick after name column
                        zIndex: 10,
                        borderLeft: '2px solid',
                        borderLeftColor: 'primary.main',
                        borderRight: '2px solid',
                        borderRightColor: 'primary.main',
                      })
                    }}
                  >
                    {column.sortable === false ? (
                      <Typography variant="caption" fontWeight="bold">
                        {column.label}
                      </Typography>
                    ) : (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : "asc"}
                      onClick={() => onRequestSort(column.id)}
                      sx={{
                        ...(column.id === 'availability' && {
                          color: 'primary.contrastText',
                          fontWeight: 700,
                          '& .MuiTableSortLabel-icon': {
                            color: 'inherit !important'
                          }
                        })
                      }}
                    >
                      <Typography 
                        variant="caption" 
                        fontWeight={column.id === 'availability' ? '800' : 'bold'}
                        sx={{
                          ...(column.id === 'availability' && {
                            color: 'primary.contrastText'
                          })
                        }}
                      >
                        {column.label}
                        {column.id === 'availability' && (
                          <Chip 
                            label="📅" 
                            size="small" 
                            sx={{ 
                              ml: 0.5, 
                              height: 16, 
                              fontSize: '0.6rem',
                              backgroundColor: 'primary.main',
                              color: 'primary.contrastText',
                              '& .MuiChip-label': { px: 0.5 }
                            }} 
                          />
                        )}
                        {['id', 'name', 'email'].includes(column.id) && (
                          <Chip 
                            label="📋" 
                            size="small" 
                            sx={{ 
                              ml: 0.5, 
                              height: 16, 
                              fontSize: '0.6rem',
                              '& .MuiChip-label': { px: 0.5 }
                            }} 
                          />
                        )}
                      </Typography>
                    </TableSortLabel>
                    )}
                  </StyledTableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredVolunteers.map((volunteer, index) => (
              <StyledTableRow
                key={volunteer.id || `${volunteer.name}-${index}`}
                style={{
                  backgroundColor: volunteer.isSelected ? "#e8f5e9" : "inherit",
                }}
              >
                <StyledTableCell>
                  <Typography variant="caption">{index + 1}</Typography>
                </StyledTableCell>
                <StyledTableCell>
                  <Avatar
                    src={volunteer.photoUrl}
                    alt={volunteer.name}
                    key={`${volunteer.name}-${volunteer.photoUrl}`}
                    sx={{ width: 32, height: 32 }}
                  />
                </StyledTableCell>
                <StyledTableCell data-label="Actions">
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Edit">
                      <IconButton
                        onClick={() => onEditVolunteer(volunteer)}
                        size="small"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {onMessageVolunteer && (
                      <Tooltip title="Send Message">
                        <IconButton
                          onClick={() => onMessageVolunteer(volunteer)}
                          size="small"
                          color="primary"
                        >
                          <FaPaperPlane size={12} />
                        </IconButton>
                      </Tooltip>
                    )}
                    {volunteer.user_db_id && (
                      <Tooltip title="View OHack profile">
                        <IconButton
                          component={NextLink}
                          href={`/profile/${volunteer.user_db_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="small"
                          color="default"
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </StyledTableCell>
                {columns.map((column) => {
                  // Handle responsive display
                  let displayStyle = 'table-cell';
                  if (column.priority === 3) {
                    displayStyle = { xs: 'none', lg: 'table-cell' };
                  } else if (column.priority === 2) {
                    displayStyle = { xs: 'none', md: 'table-cell' };
                  }

                  return (
                    <StyledTableCell 
                      key={column.id} 
                      data-label={column.label}
                      sx={{ 
                        display: displayStyle,
                        // Make availability column sticky and highlighted
                        ...(column.id === 'availability' && {
                          backgroundColor: 'rgba(25, 118, 210, 0.08)', // Light blue background
                          position: 'sticky',
                          left: type === 'volunteers' ? 220 : 'auto',
                          zIndex: 5,
                          borderLeft: '2px solid',
                          borderLeftColor: 'primary.main',
                          borderRight: '2px solid',
                          borderRightColor: 'primary.main',
                          fontWeight: 500,
                          '& > *': {
                            backgroundColor: 'transparent !important'
                          }
                        })
                      }}
                    >
                      {renderCellContent(volunteer, column)}
                    </StyledTableCell>
                  );
                })}
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
        </StyledTableContainer>
      )}

      <Snackbar
        open={copyFeedback.open}
        autoHideDuration={2000}
        onClose={handleCloseFeedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseFeedback}
          severity="success"
          variant="filled"
          sx={{ fontSize: '0.875rem' }}
        >
          {copyFeedback.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default VolunteerTable;