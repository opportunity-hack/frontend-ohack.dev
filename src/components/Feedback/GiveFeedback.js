import React, { useState, useEffect } from "react";
import LoginOrRegister from "../LoginOrRegister/LoginOrRegister";
import { useRouter } from "next/router";
import Head from "next/head";
import axios from "axios";
import { Alert } from "@mui/material";
import { useAuthInfo, withRequiredAuthInfo } from "@propelauth/react";
import Link from "next/link";

import {
  Slider,
  Box,
  TextField,
  FormGroup,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  Button,
  Typography,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Tooltip,
  Checkbox,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { roles, feedbackAreas, generalFeedbackAreas } from "./feedbackData";
import Image from "next/image";

const GiveFeedback = withRequiredAuthInfo(({ userClass }) => {
  const { user } = useAuthInfo();
  const router = useRouter();
  const { userid } = router.query;
  const [role, setRole] = useState("");
  const [feedback, setFeedback] = useState({});
  const [relationship, setRelationship] = useState("");
  const [confidenceLevel, setConfidenceLevel] = useState("medium");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [duration, setDuration] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { accessToken } = useAuthInfo();
  const [userProfile, setUserProfile] = useState(null);
  const [errors, setErrors] = useState({});

  if (!user) {
    return (
      <div className="content-layout">
        <LoginOrRegister />
      </div>
    );
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/profile/${userid}`
        );
        if (response.status === 200) {
          console.log("User profile data:", response.data);
          setUserProfile(response.data);
        } else {
          console.error("Error fetching user profile:", response.data);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchProfile();
  }, [userid]);

  const handleFeedbackChange = (area, value) => {
    setFeedback((prev) => ({ ...prev, [area]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!role) newErrors.role = "Please select a role";
    if (!relationship) newErrors.relationship = "Please select a relationship";
    if (!duration) newErrors.duration = "Please select a duration";
    if (!confidenceLevel)
      newErrors.confidenceLevel = "Please select a confidence level";

    const hasFeedback = Object.values(feedback).some(
      (value) => value !== undefined && value !== ""
    );
    if (!hasFeedback)
      newErrors.feedback = "Please provide feedback in at least one area";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const feedbackData = {
        feedback_receiver_id: userid,
        relationship,
        duration,
        confidence_level: confidenceLevel,
        is_anonymous: isAnonymous,
        feedback: {
          role,
          ...feedback,
        },
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/feedback`,
        feedbackData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 200) {
        console.log("Feedback submitted successfully");
        setSuccessMessage("Feedback submitted successfully!");
      } else {
        console.error("Error submitting feedback:", response.data);
        setErrorMessage("Failed to submit feedback. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setErrorMessage("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFeedbackItem = (area) => (
    <Box key={area.name} mb={2}>
      <Tooltip
        title={<span style={{ fontSize: "14px" }}>{area.tooltip}</span>}
        placement="top-start"
      >
        <Typography>
          {area.name} <InfoIcon fontSize="small" />
        </Typography>
      </Tooltip>
      {area.type === "slider" ? (
        <Slider
          min={0}
          max={100}
          step={10}
          valueLabelDisplay="auto"
          onChange={(_, value) => handleFeedbackChange(area.name, value)}
          marks={[
            { value: 0, label: "Poor" },
            { value: 50, label: "Average" },
            { value: 100, label: "Excellent" },
          ]}
        />
      ) : (
        <TextField
          fullWidth
          multiline
          rows={4}
          onChange={(e) => handleFeedbackChange(area.name, e.target.value)}
          error={!!errors.feedback}
          helperText={errors.feedback}
        />
      )}
    </Box>
  );

  return (
    <div className="content-layout">
      <Head>
        <title>
          Feedback for {userProfile?.name || "User"} - Opportunity Hack
          Developer Portal
        </title>
      </Head>

      <Typography mt={10} variant="h4" gutterBottom>
        Provide Feedback for {userProfile?.name || "User"}
      </Typography>
      {userProfile?.profile_image && (
        <Image
          src={userProfile.profile_image}
          alt="User Avatar"
          width={100}
          height={100}
        />
      )}
      {userProfile?.github && (
        <Typography variant="body1" gutterBottom>
          GitHub:{" "}
          <Link
            href={`https://github.com/${userProfile.github}`}
            target="_blank"
            style={{
              color: "blue",
              textDecoration: "underline",
            }}
          >
            {userProfile.github}
          </Link>
        </Typography>
      )}

      <FormControl fullWidth margin="normal" error={!!errors.role}>
        <FormLabel>
          What majority role did this person play when you worked with them?
        </FormLabel>
        <Select value={role} onChange={(e) => setRole(e.target.value)}>
          {roles.map((r) => (
            <MenuItem key={r} value={r}>
              {r}
            </MenuItem>
          ))}
        </Select>
        {errors.role && <Typography color="error">{errors.role}</Typography>}
      </FormControl>

      <FormControlLabel
        control={
          <Checkbox
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
          />
        }
        label="Keep this feedback anonymous"
      />

      <FormControl
        component="fieldset"
        margin="normal"
        error={!!errors.relationship}
      >
        <FormLabel component="legend">Your Relationship</FormLabel>
        <RadioGroup
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
        >
          <FormControlLabel
            value="mentor"
            control={<Radio />}
            label="I mentored this person"
          />
          <FormControlLabel
            value="teammate"
            control={<Radio />}
            label="I was on their team"
          />
          <FormControlLabel
            value="nonprofit"
            control={<Radio />}
            label="I worked with them as a nonprofit"
          />
          <FormControlLabel value="other" control={<Radio />} label="Other" />
        </RadioGroup>
        {errors.relationship && (
          <Typography color="error">{errors.relationship}</Typography>
        )}
      </FormControl>

      <FormControl fullWidth margin="normal" error={!!errors.duration}>
        <FormLabel>Duration of Work Together</FormLabel>
        <Select value={duration} onChange={(e) => setDuration(e.target.value)}>
          <MenuItem value="< 12 hours">Less than 12 hours</MenuItem>
          <MenuItem value="12-48 hours">
            12-48 hours (a normal hackathon)
          </MenuItem>
          <MenuItem value="7 days">7 days</MenuItem>
          <MenuItem value="14 days">14 days</MenuItem>
          <MenuItem value="30 days">30 days</MenuItem>
          <MenuItem value="60 days">60 days</MenuItem>
          <MenuItem value="90 days">90 days</MenuItem>
          <MenuItem value="180 days">180 days</MenuItem>
          <MenuItem value="365 days">365 days</MenuItem>
        </Select>
        {errors.duration && (
          <Typography color="error">{errors.duration}</Typography>
        )}
      </FormControl>

      <FormControl
        component="fieldset"
        margin="normal"
        error={!!errors.confidenceLevel}
      >
        <FormLabel component="legend">Confidence Level in Feedback</FormLabel>
        <RadioGroup
          value={confidenceLevel}
          onChange={(e) => setConfidenceLevel(e.target.value)}
        >
          <FormControlLabel value="low" control={<Radio />} label="Low" />
          <FormControlLabel value="medium" control={<Radio />} label="Medium" />
          <FormControlLabel value="high" control={<Radio />} label="High" />
        </RadioGroup>
        {errors.confidenceLevel && (
          <Typography color="error">{errors.confidenceLevel}</Typography>
        )}
      </FormControl>

      {role && feedbackAreas[role] && (
        <>
          <Typography variant="h5" gutterBottom>
            Role-specific Feedback
          </Typography>
          {feedbackAreas[role].map(renderFeedbackItem)}
        </>
      )}

      <Typography variant="h5" gutterBottom>
        General Feedback
      </Typography>
      {generalFeedbackAreas.map(renderFeedbackItem)}

      {successMessage && <Alert severity="success">{successMessage}</Alert>}
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit Feedback"}
      </Button>
    </div>
  );
});

export default GiveFeedback;
