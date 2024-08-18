import React, { useState, useEffect } from "react";
import Head from 'next/head';
import Link from 'next/link';

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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import FunVolunteerTimer from "../../components/FunVolunteerTimer/FunVolunteerTimer";
import Confetti from "react-confetti";
import moment from "moment";
import { withAuthInfo } from "@propelauth/react";
import dynamic from "next/dynamic";
import { styled } from "@mui/material";
import { initFacebookPixel, trackEvent } from "../../lib/ga";


const LoginOrRegister = dynamic( () => import("../../components/LoginOrRegister/LoginOrRegister"), { ssr: false });

export const StyledLink = styled(Link)({
  textDecoration: "none",
  
  color: "#0000ff",
  transitionDuration: "0.3s",
  "&:hover": {
    color: "orange",
  },
});

const roundToOneDecimal = (number) => {
  return parseFloat(number.toFixed(2));
};

export async function getStaticProps() {
  return {
    props: {
      metaTitle: "Volunteer Time Tracking - Opportunity Hack",
      metaDescription: "Track your volunteer hours with Opportunity Hack. Our easy-to-use platform helps you record and manage your contributions to the community.",
      metaKeywords: "volunteer tracking, time tracking, community service, opportunity hack, volunteer hours",
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
    const [totalHours, setTotalHours] = useState(0);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [volunteerStats, setVolunteerStats] = useState([]);

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

    useEffect(() => {
        initFacebookPixel();

      if (isLoggedIn) {
        fetchTotalHours();
        loadVolunteeringState();
      }
    }, [isLoggedIn]);

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
    }, [isVolunteering]);

    const triggerConfetti = () => {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    };

    const loadVolunteeringState = () => {
      const savedState = JSON.parse(localStorage.getItem("volunteeringState"));
      if (savedState) {
        setIsVolunteering(savedState.isVolunteering);
        setTimeLeft(savedState.timeLeft);
        setTotalTime(savedState.totalTime);
        setCommitmentHours(savedState.commitmentHours);
        setReason(savedState.reason);
      }
    };

    const saveVolunteeringState = (currentTimeLeft) => {
      const stateToSave = {
        isVolunteering,
        timeLeft: currentTimeLeft,
        totalTime,
        commitmentHours,
        reason,
      };
      localStorage.setItem("volunteeringState", JSON.stringify(stateToSave));
    };

    const fetchTotalHours = async () => {
      try {
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_SERVER_URL
          }/api/users/volunteering?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setTotalHours(data.totalHours);
          setVolunteerStats(data.volunteering);
        }
      } catch (error) {
        console.log("Error fetching total hours: ", error);
      }
    };

    const startVolunteering = async () => {
      const totalSeconds = commitmentHours * 3600;
      setIsVolunteering(true);
      setTimeLeft(totalSeconds);
      setTotalTime(totalSeconds);
      saveVolunteeringState(totalSeconds);

      trackEvent("volunteering_start", { 
        commitmentHours: commitmentHours,
        reason: reason,
       });

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
      if (response.ok) {
        console.log("Volunteering session started successfully");
      }
    };

    const endVolunteering = async () => {
      setIsVolunteering(false);

      trackEvent("volunteering_end", {
        finalHours: (totalTime - timeLeft) / 3600,
        reason: reason,
    });

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
      if (response.ok) {
        console.log("Volunteering session ended successfully");
      }

      localStorage.removeItem("volunteeringState");
      fetchTotalHours();
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
          Like all code for Opportunity Hack, this code is open-source and available on GitHub. If you'd like to contribute, please check out the{" "}
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
                  <FormControl fullWidth>
                    <InputLabel>Commitment Hours</InputLabel>
                    <Select
                      value={commitmentHours}
                      onChange={(e) =>
                        setCommitmentHours(Number(e.target.value))
                      }
                      disabled={isVolunteering}
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
                  <FormControl fullWidth>
                    <InputLabel>Reason for Volunteering</InputLabel>
                    <Select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      disabled={isVolunteering}
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
                  >
                    {isVolunteering ? "End Volunteering" : "Start Volunteering"}
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
                Total Hours Volunteered: {roundToOneDecimal(totalHours)}
              </Typography>

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={5}>
                    <DatePicker
                      label="Start Date"
                      value={startDate}
                      onChange={(newValue) => setStartDate(newValue)}
                      renderInput={(params) => (
                        <TextField {...params} fullWidth />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <DatePicker
                      label="End Date"
                      value={endDate}
                      onChange={(newValue) => setEndDate(newValue)}
                      renderInput={(params) => (
                        <TextField {...params} fullWidth />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Button
                      variant="outlined"
                      onClick={fetchTotalHours}
                      fullWidth
                    >
                      Fetch Report
                    </Button>
                  </Grid>
                </Grid>
              </LocalizationProvider>

              <TableContainer
                component={Paper}
                sx={{ mt: 2, overflowX: "auto" }}
              >
                <Table aria-label="volunteer statistics table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Hours</TableCell>
                      <TableCell>Reason</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {volunteerStats.map((stat, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {moment
                            .utc(stat.timestamp)
                            .format(
                              isMobile
                                ? "MM/DD/YY HH:mm"
                                : "MMMM Do YYYY, h:mm:ss a"
                            )}
                        </TableCell>
                        <TableCell align="right">
                          {roundToOneDecimal(stat.finalHours)}
                        </TableCell>
                        <TableCell>{stat.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        )}
      </Box>
    );
  }
);

export default VolunteerTrackingPage;