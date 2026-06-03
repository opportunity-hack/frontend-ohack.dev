import React, { useState, useEffect } from "react";
import LoginOrRegister from "../LoginOrRegister/LoginOrRegister";
import { useRouter } from "next/router";
import Head from "next/head";
import axios from "axios";
import { useAuthInfo, withRequiredAuthInfo } from "@propelauth/react";
import Link from "next/link";

import {
  Slider,
  Box,
  TextField,
  FormControlLabel,
  Select,
  MenuItem,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Tooltip,
  Checkbox,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { roles, feedbackAreas, generalFeedbackAreas } from "./feedbackData";
import Image from "next/image";
import { RefinedFonts, RefinedRoot, Eyebrow } from "../design/refined";

// --- Shared themed control styles (navy/terracotta civic-editorial tokens) ---
const fieldSx = {
  bgcolor: "var(--surface)",
  borderRadius: "6px",
  fontFamily: "var(--body)",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--line)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#d8d1c0" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "var(--brand)",
  },
};
const labelSx = {
  color: "var(--ink)",
  fontWeight: 600,
  fontFamily: "var(--body)",
  mb: 1,
  "&.Mui-focused": { color: "var(--ink)" },
};
const radioSx = {
  color: "var(--faint)",
  "&.Mui-checked": { color: "var(--brand)" },
};
const sliderSx = {
  color: "var(--brand)",
  mt: 1,
  "& .MuiSlider-markLabel": { color: "var(--muted)", fontSize: "0.72rem" },
  "& .MuiSlider-valueLabel": { backgroundColor: "var(--brand)" },
  "& .MuiSlider-rail": { opacity: 0.3 },
};
const radioLabelSx = {
  "& .MuiFormControlLabel-label": {
    fontFamily: "var(--body)",
    color: "var(--ink)",
    fontSize: "0.95rem",
  },
};

// A calm hairline section frame: eyebrow + Fraunces heading + body.
const Section = ({ eyebrow, title, desc, children, style }) => (
  <Box
    className="ohx-card"
    sx={{ p: { xs: 2.5, md: 4 }, mb: 3 }}
    style={style}
  >
    <Eyebrow>{eyebrow}</Eyebrow>
    <Box
      className="ohx-display"
      sx={{
        fontSize: "1.35rem",
        mt: 1,
        mb: desc ? 0.5 : 2.5,
        color: "var(--ink)",
      }}
    >
      {title}
    </Box>
    {desc && <Box sx={{ color: "var(--muted)", mb: 2.5 }}>{desc}</Box>}
    {children}
  </Box>
);

const ErrorText = ({ children }) =>
  children ? (
    <Box sx={{ color: "#b23a18", fontSize: "0.82rem", mt: 0.75, fontWeight: 600 }}>
      {children}
    </Box>
  ) : null;

const GiveFeedback = withRequiredAuthInfo(({ userClass }) => {
  const { user, accessToken } = useAuthInfo();
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
  const [userProfile, setUserProfile] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!userid) return;
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/profile/${userid}`
        );
        if (response.status === 200) {
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

  if (!user) {
    return (
      <div className="content-layout">
        <LoginOrRegister />
      </div>
    );
  }

  const renderFeedbackItem = (area) => (
    <Box key={area.name} mb={area.type === "slider" ? 3.5 : 2.5}>
      <Tooltip
        arrow
        title={<span style={{ fontSize: "13px" }}>{area.tooltip}</span>}
        placement="top-start"
      >
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            mb: area.type === "slider" ? 0 : 1,
            fontWeight: 600,
            color: "var(--ink)",
            cursor: "help",
          }}
        >
          {area.name}
          <InfoOutlinedIcon sx={{ fontSize: 16, color: "var(--faint)" }} />
        </Box>
      </Tooltip>
      {area.type === "slider" ? (
        <Box sx={{ px: 1 }}>
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
            sx={sliderSx}
          />
        </Box>
      ) : (
        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder="Share specifics — what stood out, what could be stronger…"
          onChange={(e) => handleFeedbackChange(area.name, e.target.value)}
          error={!!errors.feedback}
          sx={{ "& .MuiOutlinedInput-root": fieldSx, "& textarea": { color: "var(--ink)" } }}
        />
      )}
      {area.type !== "slider" && <ErrorText>{errors.feedback}</ErrorText>}
    </Box>
  );

  const name = userProfile?.name || "this person";

  return (
    <RefinedRoot>
      <Head>
        <title>
          Feedback for {userProfile?.name || "User"} - Opportunity Hack
          Developer Portal
        </title>
        <RefinedFonts />
      </Head>

      <Box
        className="ohx-wrap"
        sx={{
          maxWidth: 840,
          pt: "clamp(104px, 13vh, 160px)",
          pb: { xs: 8, md: 12 },
        }}
      >
        {/* Editorial hero */}
        <Box className="rise" sx={{ mb: 4 }}>
          <Eyebrow>Peer feedback</Eyebrow>
          <Box
            component="h1"
            className="ohx-display"
            sx={{ mt: 1.5, mb: 2, fontSize: "clamp(2.2rem, 5vw, 3.6rem)" }}
          >
            Feedback for{" "}
            <span className="ohx-italic">{userProfile?.name || "a teammate"}</span>
          </Box>
          <p className="ohx-lead">
            Honest, specific feedback is one of the most valuable gifts at
            Opportunity Hack. Take a few minutes to help {name} understand their
            strengths and where to grow.
          </p>
        </Box>

        {/* Person card */}
        {(userProfile?.profile_image || userProfile?.github) && (
          <Box
            className="ohx-card"
            sx={{
              p: { xs: 2.5, md: 3 },
              mb: 4,
              display: "flex",
              alignItems: "center",
              gap: 2.5,
            }}
          >
            {userProfile?.profile_image && (
              <Image
                src={userProfile.profile_image}
                alt={userProfile?.name || "User avatar"}
                width={72}
                height={72}
                style={{
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "1px solid var(--line)",
                }}
              />
            )}
            <Box>
              {userProfile?.name && (
                <Box
                  className="ohx-display"
                  sx={{ fontSize: "1.3rem", color: "var(--ink)" }}
                >
                  {userProfile.name}
                </Box>
              )}
              {userProfile?.github && (
                <Box sx={{ mt: 0.5 }}>
                  <Link
                    href={`https://github.com/${userProfile.github}`}
                    target="_blank"
                    className="ohx-link"
                  >
                    github.com/{userProfile.github}
                    <span className="ohx-arrow" aria-hidden="true">
                      →
                    </span>
                  </Link>
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* Context */}
        <Section
          eyebrow="Context"
          title="About your collaboration"
          desc="A little context helps us weigh and route your feedback accurately."
        >
          <FormControl fullWidth error={!!errors.role} sx={{ mb: 3 }}>
            <FormLabel sx={labelSx}>
              What majority role did this person play when you worked with them?
            </FormLabel>
            <Select
              value={role}
              displayEmpty
              onChange={(e) => setRole(e.target.value)}
              sx={fieldSx}
            >
              <MenuItem value="" disabled>
                Select a role…
              </MenuItem>
              {roles.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </Select>
            <ErrorText>{errors.role}</ErrorText>
          </FormControl>

          <FormControl
            component="fieldset"
            error={!!errors.relationship}
            sx={{ mb: 3, display: "block" }}
          >
            <FormLabel component="legend" sx={labelSx}>
              Your relationship
            </FormLabel>
            <RadioGroup
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
            >
              <FormControlLabel
                value="mentor"
                control={<Radio sx={radioSx} />}
                label="I mentored this person"
                sx={radioLabelSx}
              />
              <FormControlLabel
                value="teammate"
                control={<Radio sx={radioSx} />}
                label="I was on their team"
                sx={radioLabelSx}
              />
              <FormControlLabel
                value="nonprofit"
                control={<Radio sx={radioSx} />}
                label="I worked with them as a nonprofit"
                sx={radioLabelSx}
              />
              <FormControlLabel
                value="other"
                control={<Radio sx={radioSx} />}
                label="Other"
                sx={radioLabelSx}
              />
            </RadioGroup>
            <ErrorText>{errors.relationship}</ErrorText>
          </FormControl>

          <FormControl fullWidth error={!!errors.duration} sx={{ mb: 3 }}>
            <FormLabel sx={labelSx}>Duration of work together</FormLabel>
            <Select
              value={duration}
              displayEmpty
              onChange={(e) => setDuration(e.target.value)}
              sx={fieldSx}
            >
              <MenuItem value="" disabled>
                Select a duration…
              </MenuItem>
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
            <ErrorText>{errors.duration}</ErrorText>
          </FormControl>

          <FormControl
            component="fieldset"
            error={!!errors.confidenceLevel}
            sx={{ mb: 3, display: "block" }}
          >
            <FormLabel component="legend" sx={labelSx}>
              Confidence level in your feedback
            </FormLabel>
            <RadioGroup
              row
              value={confidenceLevel}
              onChange={(e) => setConfidenceLevel(e.target.value)}
            >
              <FormControlLabel
                value="low"
                control={<Radio sx={radioSx} />}
                label="Low"
                sx={radioLabelSx}
              />
              <FormControlLabel
                value="medium"
                control={<Radio sx={radioSx} />}
                label="Medium"
                sx={radioLabelSx}
              />
              <FormControlLabel
                value="high"
                control={<Radio sx={radioSx} />}
                label="High"
                sx={radioLabelSx}
              />
            </RadioGroup>
            <ErrorText>{errors.confidenceLevel}</ErrorText>
          </FormControl>

          <hr className="ohx-rule" style={{ margin: "4px 0 16px" }} />
          <FormControlLabel
            control={
              <Checkbox
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                sx={radioSx}
              />
            }
            label="Keep this feedback anonymous"
            sx={radioLabelSx}
          />
        </Section>

        {/* Role-specific feedback */}
        {role && feedbackAreas[role] && (
          <Section
            eyebrow="Role-specific"
            title={`${role} skills`}
            desc="Rate each area from your direct experience working together."
          >
            {feedbackAreas[role].map(renderFeedbackItem)}
          </Section>
        )}

        {/* General feedback */}
        <Section
          eyebrow="General"
          title="Overall feedback"
          desc="These apply to everyone, regardless of role."
        >
          {generalFeedbackAreas.map(renderFeedbackItem)}
        </Section>

        {/* Status + submit */}
        {successMessage && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              p: 2.5,
              mb: 2,
              borderRadius: 2,
              bgcolor: "var(--surface-2)",
              borderLeft: "3px solid var(--brand)",
              border: "1px solid var(--line)",
              color: "var(--ink)",
              fontWeight: 600,
            }}
          >
            <CheckCircleRoundedIcon sx={{ color: "var(--brand)" }} />
            {successMessage}
          </Box>
        )}
        {errorMessage && (
          <Box
            sx={{
              p: 2.5,
              mb: 2,
              borderRadius: 2,
              bgcolor: "var(--accent-soft)",
              border: "1px solid #f3d3c7",
              color: "#b23a18",
              fontWeight: 600,
            }}
          >
            {errorMessage}
          </Box>
        )}

        <Box sx={{ mt: 1 }}>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="ohx-btn ohx-btn--primary"
            style={{
              fontSize: "1.05rem",
              padding: "1em 2em",
              opacity: isSubmitting ? 0.6 : 1,
              cursor: isSubmitting ? "not-allowed" : "pointer",
            }}
          >
            {isSubmitting ? "Submitting…" : "Submit feedback"}
            {!isSubmitting && (
              <span className="ohx-arrow" aria-hidden="true">
                →
              </span>
            )}
          </button>
        </Box>
      </Box>
    </RefinedRoot>
  );
});

export default GiveFeedback;
