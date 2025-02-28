import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  Button,
  TextField,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Paper,
  useTheme,
  useMediaQuery,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import FunVolunteerTimer from "../../components/FunVolunteerTimer/FunVolunteerTimer";
import VolunteerStatsTable from "../../components/VolunteerStatsTable/VolunteerStatsTable";
import moment from "moment";
import { withAuthInfo } from "@propelauth/react";
import dynamic from "next/dynamic";
import { styled } from "@mui/material";
import { initFacebookPixel, trackEvent } from "../../lib/ga";

// Dynamic imports with loading state
const Confetti = dynamic(() => import("react-confetti"), {
  ssr: false,
  loading: () => null,
});

const LoginOrRegister = dynamic(
  () => import("../../components/LoginOrRegister/LoginOrRegister"),
  { ssr: false }
);

export const StyledLink = styled(Link)({
  textDecoration: "none",
  color: "#0000ff",
  transitionDuration: "0.3s",
  "&:hover": {
    color: "orange",
  },
});

const roundToOneDecimal = (number) => {
  return isNaN(number) ? 0 : parseFloat(number.toFixed(2));
};

export async function getStaticProps() {
  return {
    props: {
      metaTitle: "Volunteer Time Tracking - Opportunity Hack",
      metaDescription:
        "Track your volunteer hours with Opportunity Hack. Our easy-to-use platform helps you record and manage your contributions to the community.",
      metaKeywords:
        "volunteer tracking, time tracking, community service, opportunity hack, volunteer hours",
      ogImage: "https://cdn.ohack.dev/ohack.dev/2023_hackathon_1.webp",
    },
  };
}

const VolunteerTrackingPage = withAuthInfo(
  ({
    user,
    isLoggedIn,
    accessToken,
    metaTitle,
    metaDescription,
    metaKeywords,
    ogImage,
  }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const [commitmentHours, setCommitmentHours] = useState(0.5);
    const [reason, setReason] = useState("");
    const [isVolunteering, setIsVolunteering] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [totalTime, setTotalTime] = useState(0);
    const [totalActiveHours, setTotalActiveHours] = useState(0);
    const [totalCommittmentHours, setTotalCommittmentHours] = useState(0);
    const [startDate, setStartDate] = useState(() => {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 6);
      return lastMonth;
    });
    const [endDate, setEndDate] = useState(new Date());
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [volunteerStats, setVolunteerStats] = useState([]);
    
    // New state variables for better UX
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState("");
    const [notificationSeverity, setNotificationSeverity] = useState("success");

    const photos = [
      "https://cdn.ohack.dev/ohack.dev/2023_hackathon_1.webp",
      "https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp",
      "https://cdn.ohack.dev/ohack.dev/2023_hackathon_3.webp",
      "https://cdn.ohack.dev/ohack.dev/2023_hackathon_4.webp",
      "https://cdn.ohack.dev/ohack.dev/404/sleeping1.webp",
      "https://cdn.ohack.dev/ohack.dev/404/sleeping2.webp",
      "https://cdn.ohack.dev/ohack.dev/404/sleeping3.webp",
      "https://cdn.ohack.dev/ohack.dev/icon-of-hearts-surrounding-a-technological-cyberpunk-heart-supernova-in-space-.jpeg",
      "https://cdn.ohack.dev/ohack.dev/definition-of-done-65b90f271348b.webp",
    ];

    // Display notification helper
    const showNotify = useCallback((message, severity = "success") => {
      setNotificationMessage(message);
      setNotificationSeverity(severity);
      setShowNotification(true);
    }, []);

    // Memoized fetch function to reduce rerenders
    const fetchtotalActiveHours = useCallback(async () => {
      if (!isLoggedIn || !accessToken) return;
      
      setIsLoading(true);
      setError("");
      
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/users/volunteering?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        setTotalActiveHours(data.totalActiveHours);
        setTotalCommittmentHours(data.totalCommitmentHours);
        setVolunteerStats(data.allVolunteering || []);
      } catch (error) {
        console.error("Error fetching total hours: ", error);
        setError("Failed to load your volunteer data. Please try again later.");
        showNotify("Failed to load your volunteer data.", "error");
      } finally {
        setIsLoading(false);
      }
    }, [isLoggedIn, accessToken, startDate, endDate, showNotify]);

    useEffect(() => {
      initFacebookPixel();
      if (isLoggedIn) {
        fetchtotalActiveHours();
        loadVolunteeringState();
      }
    }, [isLoggedIn, fetchtotalActiveHours]);

    useEffect(() => {
      let timer;
      if (isVolunteering && timeLeft > 0) {
        timer = setTimeout(() => {
          setTimeLeft((prevTime) => {
            const newTime = prevTime - 1;
            saveVolunteeringState(newTime);
            if (newTime > 0 && (totalTime - newTime) % 1795 === 0) {
              triggerConfetti();
            }
            return newTime;
          });
        }, 1000);
      } else if (timeLeft === 0 && isVolunteering) {
        endVolunteering();
      }
      return () => clearTimeout(timer);
    }, [isVolunteering, timeLeft, totalTime]);

    useEffect(() => {
      let photoTimer;
      if (isVolunteering) {
        photoTimer = setInterval(() => {
          setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % photos.length);
        }, 60000);
      }
      return () => clearInterval(photoTimer);
    }, [isVolunteering, photos.length]);

    const triggerConfetti = () => {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    };

    const loadVolunteeringState = () => {
      try {
        const savedState = JSON.parse(localStorage.getItem("volunteeringState"));
        if (savedState) {
          setIsVolunteering(savedState.isVolunteering);
          setTimeLeft(savedState.timeLeft);
          setTotalTime(savedState.totalTime);
          setCommitmentHours(savedState.commitmentHours);
          setReason(savedState.reason);
        }
      } catch (error) {
        console.error("Error loading volunteering state:", error);
        localStorage.removeItem("volunteeringState");
      }
    };

    const saveVolunteeringState = (currentTimeLeft) => {
      try {
        const stateToSave = {
          isVolunteering,
          timeLeft: currentTimeLeft,
          totalTime,
          commitmentHours,
          reason,
        };
        localStorage.setItem("volunteeringState", JSON.stringify(stateToSave));
      } catch (error) {
        console.error("Error saving volunteering state:", error);
        showNotify("Failed to save your session state.", "warning");
      }
    };

    const handleCloseNotification = (_, reason) => {
      if (reason === 'clickaway') return;
      setShowNotification(false);
    };

    const startVolunteering = async () => {
      if (!reason) {
        showNotify("Please select a reason for volunteering", "error");
        return;
      }

      setIsLoading(true);
      const totalSeconds = commitmentHours * 3600;
      
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/users/volunteering`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              commitmentHours: commitmentHours,
              reason: reason,
            }),
          }
        );
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }

        setIsVolunteering(true);
        setTimeLeft(totalSeconds);
        setTotalTime(totalSeconds);
        saveVolunteeringState(totalSeconds);

        trackEvent("volunteering_start", {
          commitmentHours: commitmentHours,
          reason: reason,
        });
        
        showNotify("Volunteering session started successfully!");
      } catch (error) {
        console.error("Error starting volunteering session:", error);
        showNotify("Failed to start volunteering session. Please try again.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    const endVolunteering = async () => {
      setIsLoading(true);
      
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/users/volunteering`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              finalHours: (totalTime - timeLeft) / 3600,
              reason: reason,
            }),
          }
        );
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }

        setIsVolunteering(false);
        trackEvent("volunteering_end", {
          finalHours: (totalTime - timeLeft) / 3600,
          reason: reason,
        });

        localStorage.removeItem("volunteeringState");
        await fetchtotalActiveHours();
        showNotify("Volunteering session ended successfully!");
      } catch (error) {
        console.error("Error ending volunteering session:", error);
        showNotify("Failed to end volunteering session. Please try again.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    const prepareChartData = () => {
      return volunteerStats.map((stat) => ({
        date: moment.utc(stat.timestamp).format("MM/DD/YY"),
        Committed: roundToOneDecimal(stat.commitmentHours),
        "Actively Tracked": roundToOneDecimal(stat.finalHours),
      }));
    };

    return (
      <Box
        sx={{
          width: "100%",
          maxWidth: 800,
          margin: "auto",
          mt: { xs: 10, sm: 10 },
          p: { xs: 1, sm: 2 },
        }}
      >
        <Head>
          <title>{metaTitle}</title>
          <meta name="description" content={metaDescription} />
          <meta name="keywords" content={metaKeywords} />
          <meta property="og:title" content={metaTitle} />
          <meta property="og:description" content={metaDescription} />
          <meta property="og:image" content={ogImage} />
          <meta property="og:url" content="https://ohack.dev/volunteer/track" />
          <meta property="og:site_name" content="Opportunity Hack" />
          <meta property="image" content={ogImage} />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={metaTitle} />
          <meta name="twitter:description" content={metaDescription} />
          <meta name="twitter:image" content={ogImage} />
        </Head>

        {showConfetti && <Confetti />}
        <Typography variant="h4" gutterBottom align="center">
          Volunteer Time Tracking
        </Typography>

        <Paper elevation={3} sx={{ p: { xs: 1, sm: 2 }, mb: 2 }}>
          <Typography variant="body1" paragraph>
            At Opportunity Hack, we believe in recognizing and celebrating your
            contributions. By tracking volunteer hours, we can:
          </Typography>
          <ul>
            <li>Acknowledge your dedication and impact</li>
            <li>Provide certificates and recognition for your service</li>
            <li>Improve our programs based on volunteer engagement</li>
          </ul>
          <Typography variant="body1" paragraph>
            For coding contributions, we also track time through GitHub commits.
            Learn more about our{" "}
            <StyledLink href="/cert">
              volunteer certification process
            </StyledLink>
            .
          </Typography>
          <Typography variant="body1" paragraph>
            Like all code for Opportunity Hack, this code is open-source and
            available on GitHub. If you'd like to contribute, please check out
            the{" "}
            <StyledLink href="https://github.com/opportunity-hack/frontend-ohack.dev/blob/main/src/pages/volunteer/track.js">
              source code
            </StyledLink>
            .
          </Typography>
        </Paper>

        {!isLoggedIn ? (
          <Paper elevation={3} sx={{ p: { xs: 1, sm: 2 }, mb: 2 }}>
            <Typography variant="body1" paragraph align="center">
              Please log in to access the volunteer time tracking feature.
            </Typography>
            <LoginOrRegister
              introText="Ready to track your volunteer hours?"
              previousPage="/volunteer/track"
            />
          </Paper>
        ) : (
          <>
            <Paper elevation={3} sx={{ p: { xs: 1, sm: 2 }, mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12}>
                  <FormControl fullWidth error={isVolunteering && !commitmentHours}>
                    <InputLabel id="commitment-hours-label">Commitment Hours</InputLabel>
                    <Select
                      labelId="commitment-hours-label"
                      value={commitmentHours}
                      onChange={(e) =>
                        setCommitmentHours(Number(e.target.value))
                      }
                      disabled={isVolunteering || isLoading}
                      label="Commitment Hours"
                    >
                      {Array.from({ length: 49 }, (_, i) => i * 0.5 + 0.5).map(
                        (hours) => (
                          <MenuItem key={hours} value={hours}>
                            {hours} hours
                          </MenuItem>
                        )
                      )}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth error={isVolunteering && !reason}>
                    <InputLabel id="reason-label">Reason for Volunteering</InputLabel>
                    <Select
                      labelId="reason-label"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      disabled={isVolunteering || isLoading}
                      label="Reason for Volunteering"
                    >
                      <MenuItem value="mentoring">Mentoring</MenuItem>
                      <MenuItem value="event_organization">
                        Event Organization
                      </MenuItem>
                      <MenuItem value="judging">Judging</MenuItem>
                      <MenuItem value="coding">
                        Coding (we track this with GitHub commits too)
                      </MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color={isVolunteering ? "secondary" : "primary"}
                    onClick={
                      isVolunteering ? endVolunteering : startVolunteering
                    }
                    fullWidth
                    disabled={isLoading}
                    aria-label={isVolunteering ? "End volunteering session" : "Start volunteering session"}
                  >
                    {isLoading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : isVolunteering ? (
                      "End Volunteering"
                    ) : (
                      "Start Volunteering"
                    )}
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {isVolunteering && (
              <Paper elevation={3} sx={{ p: { xs: 1, sm: 2 }, mb: 2 }}>
                <Typography variant="h6" gutterBottom align="center">
                  Current Session
                </Typography>
                <FunVolunteerTimer timeLeft={timeLeft} totalTime={totalTime} />
                <Box sx={{ mt: 2, textAlign: "center" }}>
                  <img
                    src={photos[currentPhotoIndex]}
                    alt="Opportunity Hack"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "200px",
                      objectFit: "cover",
                    }}
                  />
                </Box>
              </Paper>
            )}

            <Paper elevation={3} sx={{ p: { xs: 1, sm: 2 } }}>
              <Typography variant="h6" gutterBottom>
                Volunteering Statistics
              </Typography>
              <Typography variant="body1" paragraph>
                Total Hours Committed:{" "}
                {roundToOneDecimal(totalCommittmentHours)}
              </Typography>
              <Typography variant="body1" paragraph>
                Total Hours Actively Tracked:{" "}
                {roundToOneDecimal(totalActiveHours)}
              </Typography>

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={5}>
                    <DatePicker
                      label="Start Date"
                      value={startDate}
                      onChange={(newValue) => setStartDate(newValue)}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <DatePicker
                      label="End Date"
                      value={endDate}
                      onChange={(newValue) => setEndDate(newValue)}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Button
                      variant="outlined"
                      onClick={fetchtotalActiveHours}
                      fullWidth
                      disabled={isLoading}
                      aria-label="Fetch volunteer report"
                    >
                      {isLoading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        "Fetch Report"
                      )}
                    </Button>
                  </Grid>
                </Grid>
              </LocalizationProvider>

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              {/* Stacked Bar Chart */}
              {volunteerStats.length > 0 ? (
                <Box sx={{ height: 300, mt: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={prepareChartData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Committed" stackId="a" fill="#8884d8" />
                      <Bar
                        dataKey="Actively Tracked"
                        stackId="a"
                        fill="#82ca9d"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                !isLoading && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    No volunteering data available for the selected date range.
                  </Alert>
                )
              )}

              {/* Explanation */}
              {volunteerStats.length > 0 && (
                <Typography variant="body2" sx={{ mt: 2, fontStyle: "italic" }}>
                  The chart above shows your committed hours (purple) and actively
                  tracked hours (green) for each volunteering session. Committed
                  hours represent your intended volunteer time, while actively
                  tracked hours show the time you spent with the browser window
                  open.
                </Typography>
              )}

              {/* Use the new VolunteerStatsTable component */}
              <VolunteerStatsTable volunteerStats={volunteerStats} />
            </Paper>
          </>
        )}

        {/* Notification system */}
        <Snackbar 
          open={showNotification} 
          autoHideDuration={6000} 
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseNotification} 
            severity={notificationSeverity} 
            sx={{ width: '100%' }}
          >
            {notificationMessage}
          </Alert>
        </Snackbar>
      </Box>
    );
  }
);

export default VolunteerTrackingPage;
