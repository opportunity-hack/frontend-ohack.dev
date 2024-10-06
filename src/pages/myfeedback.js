import React, { useState, useEffect } from "react";
import axios from "axios";
import Head from "next/head";
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Button,
  TextField,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoIcon from "@mui/icons-material/Info";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LoginOrRegister from "../components/LoginOrRegister/LoginOrRegister";
import { useAuthInfo, withRequiredAuthInfo } from "@propelauth/react";
import {
  roles,
  feedbackAreas,
  generalFeedbackAreas,
} from "../components/Feedback/feedbackData";
import { LinkStyled } from "../styles/nonprofit/styles";

const FeedbackCategory = ({ title, data, tooltips }) => (
  <Accordion>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Typography variant="h6">{title}</Typography>
    </AccordionSummary>
    <AccordionDetails>
      <Grid container spacing={2}>
        {Object.entries(data).map(([key, value]) => (
          <Grid item xs={12} sm={6} key={key}>
            <Box display="flex" alignItems="center">
              <Typography variant="subtitle1">{key}</Typography>
              <Tooltip
                title={
                  <span style={{ fontSize: "14px" }}>
                    {tooltips[key] || ""}
                  </span>
                }
              >
                <InfoIcon fontSize="small" sx={{ ml: 1 }} />
              </Tooltip>
            </Box>
            <LinearProgress
              variant="determinate"
              value={value}
              sx={{ height: 10, borderRadius: 5 }}
            />
            <Typography variant="caption">{value}/100</Typography>
          </Grid>
        ))}
      </Grid>
    </AccordionDetails>
  </Accordion>
);

const MyFeedbackPage = withRequiredAuthInfo(({ userClass }) => {
  const { user, accessToken } = useAuthInfo();
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileId, setProfileId] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      fetchFeedback();
      fetchProfileId();
    }
  }, [user]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/feedback`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setFeedback(response.data.feedback);
    } catch (err) {
      setError("Failed to fetch feedback. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileId = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/profile`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log("Profile ID:", response);
      setProfileId(response.data.text.id);
    } catch (err) {
      console.error("Failed to fetch profile ID:", err);
    }
  };

  const feedbackUrl = profileId
    ? `${window.location.origin}/feedback/${profileId}`
    : "";

  const copyFeedbackUrl = () => {
    navigator.clipboard.writeText(feedbackUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const aggregateFeedback = () => {
    const aggregated = {
      roleSpecific: {},
      general: {},
      overall: { score: 0, count: 0 },
    };

    feedback.forEach((item) => {
      const role = item.feedback.role;
      if (!aggregated.roleSpecific[role]) {
        aggregated.roleSpecific[role] = {};
      }

      Object.entries(item.feedback).forEach(([key, value]) => {
        if (typeof value === "number") {
          if (feedbackAreas[role]?.some((area) => area.name === key)) {
            if (!aggregated.roleSpecific[role][key]) {
              aggregated.roleSpecific[role][key] = { sum: 0, count: 0 };
            }
            aggregated.roleSpecific[role][key].sum += value;
            aggregated.roleSpecific[role][key].count++;
          } else if (generalFeedbackAreas.some((area) => area.name === key)) {
            if (!aggregated.general[key]) {
              aggregated.general[key] = { sum: 0, count: 0 };
            }
            aggregated.general[key].sum += value;
            aggregated.general[key].count++;
          }
          aggregated.overall.score += value;
          aggregated.overall.count++;
        }
      });
    });

    // Calculate averages
    Object.keys(aggregated.roleSpecific).forEach((role) => {
      Object.keys(aggregated.roleSpecific[role]).forEach((key) => {
        const { sum, count } = aggregated.roleSpecific[role][key];
        aggregated.roleSpecific[role][key] = Math.round(sum / count);
      });
    });

    Object.keys(aggregated.general).forEach((key) => {
      const { sum, count } = aggregated.general[key];
      aggregated.general[key] = Math.round(sum / count);
    });

    aggregated.overall.score = Math.round(
      aggregated.overall.score / aggregated.overall.count
    );

    return aggregated;
  };

  if (!user) {
    return (
      <div className="content-layout">
        <LoginOrRegister />
      </div>
    );
  }

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const aggregatedFeedback = aggregateFeedback();

  if (feedback.length === 0) {
    return (
      <div className="content-layout">
        <Head>
          <title>Your Feedback - Opportunity Hack Developer Portal</title>
        </Head>
        <Box sx={{ maxWidth: 800, margin: "auto", padding: 3 }}>
          <Typography variant="h4" gutterBottom>
            Your Feedback Journey
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            Opportunity Hack is unique in providing this detailed feedback. Use
            it to grow and showcase your skills!
          </Alert>
          <Alert severity="warning">
            No feedback available. Please check back later.
          </Alert>
        </Box>
      </div>
    );
  }

  return (
    <div className="content-layout">
      <Head>
        <title>Your Feedback - Opportunity Hack Developer Portal</title>
      </Head>
      <Box sx={{ maxWidth: 800, margin: "auto", padding: 3 }}>
        <Typography variant="h4" gutterBottom>
          Your Feedback Journey
        </Typography>
        <Alert severity="info" sx={{ mb: 2, fontSize:'14px' }}>
          Opportunity Hack is unique in providing this detailed feedback. Use it
          to grow and showcase your skills!{" "}
          <LinkStyled href="/feedback">
            Learn more about why giving and receiving feedback is important.
          </LinkStyled>
        </Alert>

        {profileId && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Share Your Feedback Profile
              </Typography>
              <Box display="flex" alignItems="center">
                <TextField
                  fullWidth
                  value={feedbackUrl}
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{ mr: 1 }}
                />
                <Button
                  variant="contained"
                  startIcon={<ContentCopyIcon />}
                  onClick={copyFeedbackUrl}
                >
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Overall Performance
            </Typography>
            <Box display="flex" alignItems="center">
              <CircularProgress
                variant="determinate"
                value={aggregatedFeedback.overall.score}
                size={80}
                thickness={4}
                sx={{ mr: 2 }}
              />
              <Typography variant="h4">
                {aggregatedFeedback.overall.score}
                /100
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Based on {feedback.length} feedback submission
              {feedback.length !== 1 ? "s" : ""}
            </Typography>
          </CardContent>
        </Card>

        {Object.entries(aggregatedFeedback.roleSpecific).map(([role, data]) => (
          <FeedbackCategory
            key={role}
            title={`${role} Skills`}
            data={data}
            tooltips={Object.fromEntries(
              feedbackAreas[role].map((area) => [area.name, area.tooltip])
            )}
          />
        ))}

        <FeedbackCategory
          title="General Skills"
          data={aggregatedFeedback.general}
          tooltips={Object.fromEntries(
            generalFeedbackAreas.map((area) => [area.name, area.tooltip])
          )}
        />

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Feedback Details
          </Typography>
          {feedback.map((item, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  {new Date(item.timestamp).toLocaleDateString()}
                </Typography>
                <Typography variant="body1">
                  {item.feedback["Overall Performance"]}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Areas for Improvement:{" "}
                  {item.feedback["Areas for Improvement"]}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip
                    label={`Role: ${item.feedback.role}`}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={`Confidence: ${item.confidence_level}`}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip label={`Duration: ${item.duration}`} size="small" />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Alert severity="success" sx={{ mt: 3 }}>
          Your feedback journey is ongoing. Keep seeking opportunities to grow
          and improve!
        </Alert>
      </Box>
    </div>
  );
});

export default MyFeedbackPage;
