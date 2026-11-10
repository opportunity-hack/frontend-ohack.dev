import React, { useState, useEffect, useCallback } from "react";
import { useAuthInfo, withRequiredAuthInfo } from "@propelauth/react";
import {
  Typography,
  Box,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Collapse,
} from "@mui/material";
import QrScanner from "react-qr-scanner";
import AdminPage from "../../../components/admin/AdminPage";
import { useRouter } from "next/router";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import PersonIcon from "@mui/icons-material/Person";
import useHackathonEvents from "../../../hooks/use-hackathon-events";
import ExportCsvButton from "../ExportCsvButton";
import { orgCanCheckIn, orgIsFullAdmin } from "../../../lib/adminPermissions";

const EMPTY_COUNTS = {
  mentor: 0,
  judge: 0,
  volunteer: 0,
  hacker: 0,
  sponsor: 0,
};
const CHECKIN_API = `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/checkin`;

const VOLUNTEER_TYPES = [
  { value: "hacker", label: "Hacker" },
  { value: "mentor", label: "Mentor" },
  { value: "judge", label: "Judge" },
  { value: "volunteer", label: "Volunteer" },
  { value: "sponsor", label: "Sponsor" },
];

// Label for a roster row in the Manual Entry search. Email is the tiebreaker
// when two people share a name at the desk.
const rosterOptionLabel = (p) =>
  [p?.name || "(no name)", p?.email].filter(Boolean).join(" — ");

const CHECKED_IN_CSV_COLUMNS = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "volunteerType", label: "Type" },
  { key: "checkedInAt", label: "Checked in at" },
  {
    key: "checkedInBy",
    label: "Checked in by",
    get: (p) =>
      [p?.checkedInBy?.firstName, p?.checkedInBy?.lastName]
        .filter(Boolean)
        .join(" "),
  },
  {
    key: "company",
    label: "Company",
    get: (p) => p?.company || p?.companyName || "",
  },
  { key: "id", label: "Id" },
];

// When `embedded` is true, this component is rendered inside the per-event
// hackathon admin page. The host page already owns the AdminPage wrapper and
// the event selection (via URL), so we skip both chrome layers and use
// `externalEventId` as the pinned event id.
const CheckInWorkbench = ({
  userClass,
  embedded = false,
  externalEventId,
  onSnack,
}) => {
  const { accessToken, user } = useAuthInfo();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Authentication — `checkin.admin` (desk helpers) OR `volunteer.admin`.
  // Optional chaining: a logged-in user who isn't in the org has no OrgInfo.
  const org = userClass?.getOrgByName?.("Opportunity Hack Org");
  const orgId = org?.orgId;
  const isFullAdmin = orgIsFullAdmin(org);
  const canCheckIn = orgCanCheckIn(org);

  // Hackathon events
  const { hackathons = [] } = useHackathonEvents(false) || {};

  // State
  const [selectedEventId, setSelectedEventId] = useState("");
  const [checkInCounts, setCheckInCounts] = useState({
    mentor: 0,
    judge: 0,
    volunteer: 0,
    hacker: 0,
    sponsor: 0,
  });
  const [scanning, setScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [checkInHistory, setCheckInHistory] = useState([]);
  const [allCheckedInPeople, setAllCheckedInPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [manualEntryOpen, setManualEntryOpen] = useState(false);
  const [manualEventId, setManualEventId] = useState("");
  const [manualVolunteerId, setManualVolunteerId] = useState("");
  const [manualVolunteerType, setManualVolunteerType] = useState("");
  // Manual Entry roster search: the desk volunteer rarely knows a record id,
  // so the dialog loads the chosen role's roster and lets them pick by name
  // or email. The raw-id field stays behind a toggle as the fallback.
  const [manualRoster, setManualRoster] = useState({
    key: "",
    loading: false,
    people: [],
    error: null,
  });
  const [manualSelection, setManualSelection] = useState(null);
  const [manualIdFieldOpen, setManualIdFieldOpen] = useState(false);
  const rosterCacheRef = React.useRef({});

  // Scanner settings
  const [facingMode, setFacingMode] = useState("environment"); // 'user' for front camera, 'environment' for back camera

  const authHeaders = useCallback(
    () => ({
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
      "X-Org-Id": orgId,
    }),
    [accessToken, orgId],
  );

  // ONE request per role → counts + the checked-in list (the lean
  // /api/checkin payload; the old code fetched the same five URLs twice).
  const refreshCheckIns = useCallback(
    async (eventId) => {
      if (!eventId) return;
      try {
        const results = await Promise.all(
          VOLUNTEER_TYPES.map(async ({ value: type }) => {
            const response = await fetch(
              `${CHECKIN_API}/${encodeURIComponent(eventId)}/checkins/${type}`,
              { headers: authHeaders() },
            );
            if (!response.ok) return { type, people: [] };
            const data = await response.json();
            const people = (Array.isArray(data.data) ? data.data : [])
              .filter((v) => v.checkedIn === true)
              .map((v) => ({ ...v, volunteerType: type, eventId }));
            return { type, people };
          }),
        );
        const counts = { ...EMPTY_COUNTS };
        results.forEach(({ type, people }) => {
          counts[type] = people.length;
        });
        const sortedPeople = results
          .flatMap((r) => r.people)
          .sort(
            (a, b) =>
              new Date(b.checkedInAt || 0) - new Date(a.checkedInAt || 0),
          );
        setCheckInCounts(counts);
        setAllCheckedInPeople(sortedPeople);
      } catch (error) {
        console.error("Error fetching check-ins:", error);
        setCheckInCounts({ ...EMPTY_COUNTS });
        setAllCheckedInPeople([]);
      }
    },
    [authHeaders],
  );

  // Load one role's roster for the Manual Entry search (admin endpoint — the
  // same list processCheckIn verifies against). Cached per event+type until a
  // check-in succeeds, so "already checked in" stays truthful.
  const fetchManualRoster = useCallback(
    async (eventId, volunteerType) => {
      if (!eventId || !volunteerType) return;
      const key = `${eventId}|${volunteerType}`;
      const cached = rosterCacheRef.current[key];
      if (cached) {
        setManualRoster({ key, loading: false, people: cached, error: null });
        return;
      }
      setManualRoster({ key, loading: true, people: [], error: null });
      try {
        const response = await fetch(
          `${CHECKIN_API}/${encodeURIComponent(eventId)}/roster/${volunteerType}`,
          { headers: authHeaders() },
        );
        if (!response.ok)
          throw new Error(
            `Couldn't load the ${volunteerType} list (${response.status})`,
          );
        const data = await response.json();
        const people = (Array.isArray(data.data) ? data.data : [])
          .filter((p) => p && p.id)
          .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        rosterCacheRef.current[key] = people;
        setManualRoster({ key, loading: false, people, error: null });
      } catch (error) {
        setManualRoster({
          key,
          loading: false,
          people: [],
          error: error.message,
        });
      }
    },
    [authHeaders],
  );

  useEffect(() => {
    if (!manualEntryOpen) return;
    fetchManualRoster(manualEventId, manualVolunteerType);
  }, [manualEntryOpen, manualEventId, manualVolunteerType, fetchManualRoster]);

  // Handle hackathon event selection
  const handleEventChange = (eventId) => {
    setSelectedEventId(eventId);
    setManualEventId(eventId); // Also set it for manual entry

    // Update URL to reflect the selected event without page reload
    if (eventId) {
      const currentPath = router.asPath.split("?")[0];
      router.replace(`${currentPath}?event_id=${eventId}`, undefined, {
        shallow: true,
      });
      refreshCheckIns(eventId);
    } else {
      // Remove event_id parameter from URL
      router.replace(router.pathname, undefined, { shallow: true });
      setCheckInCounts({ ...EMPTY_COUNTS });
      setAllCheckedInPeople([]);
    }
  };

  // Handle URL parameters and initial event selection
  useEffect(() => {
    if (embedded) {
      if (externalEventId && externalEventId !== selectedEventId) {
        setSelectedEventId(externalEventId);
        setManualEventId(externalEventId);
      }
      return;
    }
    const { event_id } = router.query;
    if (event_id && hackathons.length > 0) {
      // Check if the event_id from URL parameter exists in our hackathons list
      const eventExists = hackathons.some(
        (hackathon) => hackathon.event_id === event_id,
      );
      if (eventExists && event_id !== selectedEventId) {
        setSelectedEventId(event_id);
        setManualEventId(event_id);
      }
    }
  }, [embedded, externalEventId, router.query, hackathons, selectedEventId]);

  // Auto-refresh check-in counts every 7 seconds. Gated on the permission:
  // hooks run before the "no permission" early return, so without this gate
  // an unauthorised embed still fired five 403s every 7s.
  useEffect(() => {
    if (!selectedEventId || !canCheckIn) return;

    refreshCheckIns(selectedEventId);

    const interval = setInterval(() => refreshCheckIns(selectedEventId), 7000);

    return () => clearInterval(interval);
  }, [selectedEventId, canCheckIn, refreshCheckIns]);

  // Define processCheckIn before handleScan.
  // One narrow POST: the backend validates the volunteer belongs to this
  // event + role and writes only the check-in fields (no full-doc round trip).
  const processCheckIn = useCallback(
    async (eventId, volunteerId, volunteerType) => {
      setLoading(true);
      try {
        const response = await fetch(
          `${CHECKIN_API}/${encodeURIComponent(eventId)}/${encodeURIComponent(volunteerType)}/${encodeURIComponent(volunteerId)}`,
          { method: "POST", headers: authHeaders() },
        );
        let payload = null;
        try {
          payload = await response.json();
        } catch {
          payload = null;
        }
        if (!response.ok) {
          const reason =
            payload?.error === "wrong_event"
              ? "This QR code is for a different event or role."
              : payload?.message ||
                payload?.error ||
                `Check-in failed (${response.status})`;
          throw new Error(reason);
        }
        const volunteer = payload?.data || {};
        const alreadyCheckedIn = payload?.already_checked_in === true;

        // Add to check-in history
        const checkInRecord = {
          id: Date.now(),
          eventId,
          volunteerId,
          volunteerType,
          volunteerName: volunteer.name || "Unknown",
          timestamp: new Date().toISOString(),
          success: true,
        };

        setCheckInHistory((prev) => [checkInRecord, ...prev.slice(0, 9)]); // Keep last 10 records
        rosterCacheRef.current = {};

        setSnackbar({
          open: true,
          message: alreadyCheckedIn
            ? `${volunteer.name || "This person"} was already checked in${volunteer.checkedInAt ? ` at ${new Date(volunteer.checkedInAt).toLocaleTimeString()}` : ""}.`
            : `Successfully checked in ${volunteer.name || "volunteer"}`,
          severity: alreadyCheckedIn ? "info" : "success",
        });

        // Refresh check-in counts and people list after successful check-in
        if (selectedEventId) {
          refreshCheckIns(selectedEventId);
        }
      } catch (error) {
        console.error("Check-in error:", error);

        // Add failed attempt to history
        const failedRecord = {
          id: Date.now(),
          eventId,
          volunteerId,
          volunteerType,
          timestamp: new Date().toISOString(),
          success: false,
          error: error.message,
        };

        setCheckInHistory((prev) => [failedRecord, ...prev.slice(0, 9)]);

        setSnackbar({
          open: true,
          message: `Check-in failed: ${error.message}`,
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [authHeaders, selectedEventId, refreshCheckIns],
  );

  const handleScan = useCallback(
    async (data) => {
      if (data && data.text && data.text !== lastScanned) {
        setLastScanned(data.text);
        setScanning(false);

        try {
          // Parse QR code data
          // Expected format: eventId|volunteerId|volunteerType
          const parts = data.text.split("|");
          if (parts.length !== 3) {
            throw new Error(
              "Invalid QR code format. Expected: eventId|volunteerId|volunteerType",
            );
          }

          const [eventId, volunteerId, volunteerType] = parts;

          // Validate the data
          if (!eventId || !volunteerId || !volunteerType) {
            throw new Error("Missing required information in QR code");
          }

          const validTypes = [
            "mentor",
            "judge",
            "volunteer",
            "hacker",
            "sponsor",
          ];
          if (!validTypes.includes(volunteerType)) {
            throw new Error(`Invalid volunteer type: ${volunteerType}`);
          }

          setScanResult({
            eventId,
            volunteerId,
            volunteerType,
            timestamp: new Date().toISOString(),
            success: true,
          });

          // Process check-in
          await processCheckIn(eventId, volunteerId, volunteerType);
        } catch (error) {
          console.error("QR code processing error:", error);
          setScanResult({
            error: error.message,
            timestamp: new Date().toISOString(),
            success: false,
          });
          setSnackbar({
            open: true,
            message: `Check-in failed: ${error.message}`,
            severity: "error",
          });
        }
      }
    },
    [lastScanned, processCheckIn],
  );

  const handleError = useCallback((err) => {
    console.error("QR Scanner error:", err);
    setSnackbar({
      open: true,
      message: "Camera error. Please check camera permissions and try again.",
      severity: "error",
    });
  }, []);

  const startScanning = () => {
    setScanning(true);
    setScanResult(null);
    setLastScanned(null);
  };

  const stopScanning = () => {
    setScanning(false);
  };

  const switchCamera = () => {
    setFacingMode(facingMode === "environment" ? "user" : "environment");
  };

  const handleManualCheckIn = async () => {
    if (!manualEventId || !manualVolunteerId || !manualVolunteerType) {
      setSnackbar({
        open: true,
        message: "Please fill in all fields",
        severity: "error",
      });
      return;
    }

    await processCheckIn(manualEventId, manualVolunteerId, manualVolunteerType);
    setManualEntryOpen(false);
    setManualVolunteerId("");
    setManualSelection(null);
  };

  const openManualEntry = () => {
    setManualEventId(selectedEventId || manualEventId);
    setManualSelection(null);
    setManualVolunteerId("");
    setManualEntryOpen(true);
  };

  const handleViewVolunteer = (eventId, volunteerId, volunteerType) => {
    // Navigate to volunteer admin with this specific volunteer
    const url = `/admin/volunteer?event_id=${eventId}&volunteer_id=${volunteerId}&volunteer_type=${volunteerType}`;
    router.push(url);
  };

  if (!canCheckIn) {
    if (embedded) return null;
    return (
      <AdminPage title="Check-In System" isAdmin={false}>
        <Typography>You do not have permission to view this page.</Typography>
      </AdminPage>
    );
  }

  const Outer = embedded ? React.Fragment : AdminPage;
  const outerProps = embedded
    ? {}
    : {
        title: "QR Code Check-In System",
        isAdmin: isFullAdmin,
        snackbar,
        onSnackbarClose: () => setSnackbar({ ...snackbar, open: false }),
      };

  return (
    <Outer {...outerProps}>
      {/* Event Selection and Check-in Counts */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          {!embedded && (
            <Grid size={{ xs: 12, md: 4 }}>
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
                  <MenuItem value="">
                    <em>Select an event...</em>
                  </MenuItem>
                  {Array.isArray(hackathons) &&
                    hackathons
                      .filter((hackathon) => hackathon?.event_id)
                      .sort(
                        (a, b) =>
                          new Date(b.start_date || 0) -
                          new Date(a.start_date || 0),
                      )
                      .map((hackathon) => (
                        <MenuItem
                          key={hackathon.event_id}
                          value={hackathon.event_id}
                        >
                          {hackathon.title || hackathon.event_id}
                          {hackathon.start_date && (
                            <Typography
                              variant="caption"
                              color="textSecondary"
                              sx={{ ml: 1 }}
                            >
                              ({new Date(hackathon.start_date).getFullYear()})
                            </Typography>
                          )}
                        </MenuItem>
                      ))}
                </Select>
              </FormControl>
              {router.query.event_id && (
                <Typography
                  variant="caption"
                  color="primary"
                  sx={{ display: "block", mt: 1 }}
                >
                  📎 Event pre-selected from URL parameter
                </Typography>
              )}
            </Grid>
          )}
          <Grid size={{ xs: 12, md: embedded ? 12 : 8 }}>
            {selectedEventId && (
              <Paper elevation={1} sx={{ p: 2, bgcolor: "background.paper" }}>
                <Typography variant="h6" gutterBottom>
                  Real-time Check-in Counts
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { key: "mentor", label: "Mentors", color: "primary" },
                    { key: "judge", label: "Judges", color: "secondary" },
                    { key: "volunteer", label: "Volunteers", color: "success" },
                    { key: "hacker", label: "Hackers", color: "info" },
                    { key: "sponsor", label: "Sponsors", color: "warning" },
                  ].map(({ key, label, color }) => (
                    <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={key}>
                      <Card sx={{ textAlign: "center", minHeight: 80 }}>
                        <CardContent sx={{ pb: 1, "&:last-child": { pb: 1 } }}>
                          <Typography
                            variant="h4"
                            color={`${color}.main`}
                            fontWeight="bold"
                          >
                            {checkInCounts[key]}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {label}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ mt: 1, display: "block" }}
                >
                  Updates every 7 seconds
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3}>
        {/* Scanner Section */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <QrCodeScannerIcon sx={{ mr: 1 }} />
              <Typography variant="h5">QR Code Scanner</Typography>
            </Box>

            {!scanning ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  Scan volunteer QR codes to check them in for hackathon events
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<QrCodeScannerIcon />}
                  onClick={startScanning}
                  sx={{ mr: 2, mb: 2 }}
                >
                  Start Scanning
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={openManualEntry}
                  sx={{ mb: 2 }}
                >
                  Manual Entry
                </Button>
              </Box>
            ) : (
              <Box>
                <Box sx={{ position: "relative", mb: 2 }}>
                  <QrScanner
                    delay={300}
                    style={{
                      width: "100%",
                      maxWidth: "500px",
                      height: "auto",
                    }}
                    onError={handleError}
                    onScan={handleScan}
                    constraints={{
                      audio: false,
                      video: { facingMode: facingMode },
                    }}
                  />
                  {loading && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        bgcolor: "rgba(0,0,0,0.7)",
                        borderRadius: 2,
                        p: 2,
                      }}
                    >
                      <CircularProgress color="primary" />
                    </Box>
                  )}
                </Box>

                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={stopScanning}
                  >
                    Stop Scanning
                  </Button>
                  <Button variant="outlined" onClick={switchCamera}>
                    Switch Camera (
                    {facingMode === "environment" ? "Back" : "Front"})
                  </Button>
                </Box>
              </Box>
            )}

            {/* Last Scan Result */}
            {scanResult && (
              <Alert
                severity={scanResult.success ? "success" : "error"}
                sx={{ mt: 2 }}
                icon={scanResult.success ? <CheckCircleIcon /> : <ErrorIcon />}
              >
                {scanResult.success ? (
                  <Box>
                    <Typography variant="body2">
                      <strong>Successfully scanned:</strong>
                    </Typography>
                    <Typography variant="body2">
                      Event: {scanResult.eventId}
                      <br />
                      Volunteer Type: {scanResult.volunteerType}
                      <br />
                      ID: {scanResult.volunteerId}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2">
                    <strong>Scan Error:</strong> {scanResult.error}
                  </Typography>
                )}
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* All Checked-In People */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <PersonIcon sx={{ mr: 1 }} />
              <Typography variant="h6">All Checked-In People</Typography>
              <Box
                sx={{
                  ml: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                {allCheckedInPeople.length > 0 && (
                  <Chip
                    size="small"
                    label={`${allCheckedInPeople.length} total`}
                    variant="outlined"
                  />
                )}
                <ExportCsvButton
                  rows={allCheckedInPeople}
                  columns={CHECKED_IN_CSV_COLUMNS}
                  filenameParts={[selectedEventId, "checked-in"]}
                  table="checkin_people"
                  eventId={selectedEventId}
                  label="Download CSV"
                  iconOnly
                />
              </Box>
            </Box>

            {allCheckedInPeople.length === 0 ? (
              <Typography variant="body2" color="textSecondary">
                No one has checked in yet
              </Typography>
            ) : (
              <Box sx={{ maxHeight: "600px", overflowY: "auto" }}>
                {allCheckedInPeople.map((person) => {
                  const isCheckedInByCurrentUser =
                    person.checkedInBy?.userId === user?.userId;
                  return (
                    <Card
                      key={`${person.id}-${person.volunteerType}`}
                      sx={{
                        mb: 1,
                        // Only full admins can open the volunteer record —
                        // a checkin.admin helper has nowhere to go.
                        cursor: isFullAdmin ? "pointer" : "default",
                        border: isCheckedInByCurrentUser ? "2px solid" : "none",
                        borderColor: isCheckedInByCurrentUser
                          ? "primary.main"
                          : "transparent",
                        bgcolor: isCheckedInByCurrentUser
                          ? "primary.50"
                          : "background.paper",
                      }}
                      onClick={
                        isFullAdmin
                          ? () =>
                              handleViewVolunteer(
                                person.eventId,
                                person.id,
                                person.volunteerType,
                              )
                          : undefined
                      }
                    >
                      <CardContent
                        sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          <Chip
                            size="small"
                            icon={<CheckCircleIcon />}
                            label={
                              isCheckedInByCurrentUser
                                ? "You checked in"
                                : "Checked in"
                            }
                            color={
                              isCheckedInByCurrentUser ? "primary" : "success"
                            }
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="caption" color="textSecondary">
                            {person.checkedInAt
                              ? new Date(person.checkedInAt).toLocaleString()
                              : "Unknown time"}
                          </Typography>
                        </Box>

                        <Typography
                          variant="body2"
                          sx={{ fontWeight: "medium" }}
                        >
                          {person.name || "Unknown"}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {person.volunteerType}
                          {isFullAdmin ? " • Click to view" : ""}
                        </Typography>

                        {person.checkedInBy && !isCheckedInByCurrentUser && (
                          <Typography
                            variant="caption"
                            color="textSecondary"
                            sx={{ display: "block", mt: 0.5 }}
                          >
                            Checked in by: {person.checkedInBy.firstName}{" "}
                            {person.checkedInBy.lastName}
                          </Typography>
                        )}

                        {person.checkedInBy && isCheckedInByCurrentUser && (
                          <Typography
                            variant="caption"
                            color="primary.main"
                            sx={{ display: "block", mt: 0.5 }}
                          >
                            ✓ You checked this person in
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Manual Entry Dialog — pick a role, search the roster by name/email */}
      <Dialog
        open={manualEntryOpen}
        onClose={() => setManualEntryOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Manual check-in</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            For anyone without their QR code. Pick their role, then find them by
            name or email.
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            {embedded ? (
              <Typography variant="caption" color="textSecondary">
                Event: <strong>{manualEventId || selectedEventId}</strong>
              </Typography>
            ) : (
              <TextField
                fullWidth
                label="Event ID"
                value={manualEventId}
                onChange={(e) => setManualEventId(e.target.value)}
                placeholder="e.g., 2025_fall"
              />
            )}
            <FormControl fullWidth>
              <InputLabel id="manual-volunteer-type-label">Role</InputLabel>
              <Select
                labelId="manual-volunteer-type-label"
                id="manual-volunteer-type"
                label="Role"
                value={manualVolunteerType}
                onChange={(e) => {
                  setManualVolunteerType(e.target.value);
                  setManualSelection(null);
                  setManualVolunteerId("");
                }}
              >
                {VOLUNTEER_TYPES.map((t) => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Autocomplete
              id="manual-roster-search"
              options={manualRoster.people}
              value={manualSelection}
              loading={manualRoster.loading}
              disabled={!manualVolunteerType}
              getOptionLabel={rosterOptionLabel}
              isOptionEqualToValue={(a, b) => a?.id === b?.id}
              onChange={(_, person) => {
                setManualSelection(person);
                setManualVolunteerId(person?.id || "");
              }}
              noOptionsText={
                manualRoster.error
                  ? manualRoster.error
                  : manualRoster.loading
                    ? "Loading…"
                    : manualVolunteerType
                      ? "Nobody on this list matches"
                      : "Pick a role first"
              }
              renderOption={(props, person) => {
                const { key, ...optionProps } = props;
                return (
                  <li key={key} {...optionProps}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {person.name || "(no name)"}
                        </Typography>
                        {person.checkedIn === true && (
                          <Chip
                            size="small"
                            color="success"
                            label="Checked in"
                          />
                        )}
                        {person.isSelected !== true && (
                          <Chip
                            size="small"
                            color="warning"
                            variant="outlined"
                            label="Not on roster"
                          />
                        )}
                      </Box>
                      {person.email && (
                        <Typography variant="caption" color="textSecondary">
                          {person.email}
                        </Typography>
                      )}
                    </Box>
                  </li>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search by name or email"
                  placeholder={
                    manualVolunteerType
                      ? "Start typing a name…"
                      : "Pick a role first"
                  }
                  helperText={
                    manualSelection?.isSelected !== true && manualSelection
                      ? "This person isn't on the roster yet — check with an organizer before checking them in."
                      : manualSelection?.checkedIn === true
                        ? `Already checked in${manualSelection.checkedInAt ? ` at ${new Date(manualSelection.checkedInAt).toLocaleString()}` : ""}.`
                        : manualRoster.loading
                          ? "Loading the roster…"
                          : " "
                  }
                />
              )}
            />
            <Box>
              <Button
                size="small"
                onClick={() => setManualIdFieldOpen((v) => !v)}
                sx={{ textTransform: "none", px: 0 }}
              >
                {manualIdFieldOpen
                  ? "Hide the ID field"
                  : "Have their record ID? Enter it directly"}
              </Button>
              <Collapse in={manualIdFieldOpen}>
                <TextField
                  fullWidth
                  sx={{ mt: 1 }}
                  label="Record ID"
                  value={manualVolunteerId}
                  onChange={(e) => {
                    setManualVolunteerId(e.target.value);
                    setManualSelection(null);
                  }}
                  placeholder="The id shown on their QR card"
                />
              </Collapse>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManualEntryOpen(false)}>Cancel</Button>
          <Button
            onClick={handleManualCheckIn}
            variant="contained"
            disabled={
              loading ||
              !manualEventId ||
              !manualVolunteerId ||
              !manualVolunteerType
            }
          >
            {loading ? <CircularProgress size={20} /> : "Check In"}
          </Button>
        </DialogActions>
      </Dialog>
    </Outer>
  );
};

const AdminCheckInPage = withRequiredAuthInfo(CheckInWorkbench);

export default AdminCheckInPage;
export { CheckInWorkbench };
