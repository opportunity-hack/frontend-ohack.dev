import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import FunVolunteerTimer from "../../components/FunVolunteerTimer/FunVolunteerTimer";
import Confetti from "react-confetti";

const VolunteerTrackingPage = () => {
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

  const photos = [
    "https://cdn.ohack.dev/ohack.dev/2023_hackathon_1.webp",
    "https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp",
    "https://cdn.ohack.dev/ohack.dev/2023_hackathon_3.webp",
    "https://cdn.ohack.dev/ohack.dev/2023_hackathon_4.webp",
  ];

  useEffect(() => {
    fetchTotalHours();
    loadVolunteeringState();
  }, []);

  useEffect(() => {
    let timer;
    if (isVolunteering && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft((prevTime) => {
          const newTime = prevTime - 1;
          saveVolunteeringState(newTime);

          // Trigger confetti every 30 minutes
          if (newTime > 0 && (totalTime - newTime) % 1800 === 0) {
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
    setTimeout(() => setShowConfetti(false), 5000); // Stop confetti after 5 seconds
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
    // TODO: Implement API call to fetch total hours
    setTotalHours(50);
  };

  const startVolunteering = async () => {
    const totalSeconds = commitmentHours * 3600;
    setIsVolunteering(true);
    setTimeLeft(totalSeconds);
    setTotalTime(totalSeconds);
    saveVolunteeringState(totalSeconds);
    // TODO: Implement API call to start volunteering session
  };

  const endVolunteering = async () => {
    setIsVolunteering(false);
    localStorage.removeItem("volunteeringState");
    // TODO: Implement API call to end volunteering session
    fetchTotalHours();
  };

  return (
    <Box sx={{ maxWidth: 800, margin: "auto", mt: 4, p: 2 }}>
      {showConfetti && <Confetti />}
      <Typography variant="h4" gutterBottom>
        Volunteer Time Tracking
      </Typography>

      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Commitment Hours</InputLabel>
              <Select
                value={commitmentHours}
                onChange={(e) => setCommitmentHours(Number(e.target.value))}
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
          <Grid item xs={12} sm={6}>
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
                <MenuItem value="coding">Coding</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color={isVolunteering ? "secondary" : "primary"}
              onClick={isVolunteering ? endVolunteering : startVolunteering}
              fullWidth
            >
              {isVolunteering ? "End Volunteering" : "Start Volunteering"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {isVolunteering && (
        <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
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

      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Volunteering Statistics
        </Typography>
        <Typography variant="body1" paragraph>
          Total Hours Volunteered: {totalHours}
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={5}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button variant="outlined" onClick={fetchTotalHours} fullWidth>
                Fetch Report
              </Button>
            </Grid>
          </Grid>
        </LocalizationProvider>
      </Paper>
    </Box>
  );
};

export default VolunteerTrackingPage;
