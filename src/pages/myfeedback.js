import React, { useState, useEffect } from "react";
import axios from "axios";
import Head from "next/head";
import {
  Box,
  Grid,
  CircularProgress,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  TextField,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import LoginOrRegister from "../components/LoginOrRegister/LoginOrRegister2";
import { useAuthInfo, withRequiredAuthInfo } from "@propelauth/react";
import {
  feedbackAreas,
  generalFeedbackAreas,
} from "../components/Feedback/feedbackData";
import { RefinedFonts, RefinedRoot, Eyebrow } from "../components/design/refined";

// Quiet hairline accordion for a group of scored skill areas.
const FeedbackCategory = ({ title, data, tooltips }) => (
  <Accordion
    disableGutters
    elevation={0}
    sx={{
      bgcolor: "var(--surface)",
      border: "1px solid var(--line)",
      borderRadius: "10px !important",
      boxShadow: "none",
      overflow: "hidden",
      mb: 1.25,
      "&:before": { display: "none" },
    }}
  >
    <AccordionSummary
      expandIcon={<ExpandMoreIcon sx={{ color: "var(--brand)" }} />}
      sx={{ px: { xs: 2, sm: 3 }, py: 0.5, minHeight: 60 }}
    >
      <Box
        component="span"
        className="ohx-display"
        sx={{ fontSize: "1.15rem", color: "var(--ink)" }}
      >
        {title}
      </Box>
    </AccordionSummary>
    <AccordionDetails sx={{ px: { xs: 2, sm: 3 }, pb: 3, pt: 0 }}>
      <hr className="ohx-rule" style={{ marginBottom: 20 }} />
      <Grid container spacing={3}>
        {Object.entries(data).map(([key, value]) => (
          <Grid size={{ xs: 12, sm: 6 }} key={key}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.75 }}>
              <Box
                component="span"
                sx={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--ink)" }}
              >
                {key}
              </Box>
              <Tooltip
                arrow
                title={
                  <span style={{ fontSize: "13px" }}>{tooltips[key] || ""}</span>
                }
              >
                <InfoOutlinedIcon
                  sx={{ fontSize: 16, color: "var(--faint)", cursor: "help" }}
                />
              </Tooltip>
            </Box>
            <LinearProgress
              variant="determinate"
              value={value}
              sx={{
                height: 8,
                borderRadius: 999,
                bgcolor: "var(--surface-2)",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: "var(--brand)",
                  borderRadius: 999,
                },
              }}
            />
            <Box
              sx={{
                mt: 0.5,
                fontSize: "0.78rem",
                color: "var(--muted)",
              }}
            >
              <Box component="span" sx={{ fontWeight: 700, color: "var(--ink)" }}>
                {value}
              </Box>
              {" / 100"}
            </Box>
          </Grid>
        ))}
      </Grid>
    </AccordionDetails>
  </Accordion>
);

const Shell = ({ children, maxWidth = 920 }) => (
  <RefinedRoot>
    <Box
      className="ohx-wrap"
      sx={{
        maxWidth,
        pt: "clamp(104px, 13vh, 160px)",
        pb: { xs: 8, md: 12 },
      }}
    >
      {children}
    </Box>
  </RefinedRoot>
);

const SeoHead = () => (
  <Head>
    <title>Developer Feedback Dashboard - Opportunity Hack</title>
    <meta
      name="description"
      content="View your personalized developer feedback, performance metrics, and skill assessments from Opportunity Hack projects. Track your growth in software development and nonprofit tech contributions."
    />
    <meta
      name="keywords"
      content="developer feedback, coding assessment, software development feedback, tech skills evaluation, developer performance, coding portfolio feedback"
    />
    <link rel="canonical" href="https://www.ohack.dev/myfeedback" />
    <meta
      property="og:title"
      content="Developer Feedback Dashboard - Opportunity Hack"
    />
    <meta
      property="og:description"
      content="View your personalized developer feedback, performance metrics, and skill assessments from Opportunity Hack projects."
    />
    <meta property="og:url" content="https://www.ohack.dev/myfeedback" />
    <meta property="og:type" content="website" />
    <meta name="robots" content="index, follow" />
    <RefinedFonts />
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Developer Feedback Dashboard",
          description:
            "View your personalized developer feedback, performance metrics, and skill assessments from Opportunity Hack projects.",
          url: "https://www.ohack.dev/myfeedback",
          applicationCategory: "DeveloperTools",
          provider: {
            "@type": "Organization",
            name: "Opportunity Hack",
          },
        }),
      }}
    />
  </Head>
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
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/users/profile`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setProfileId(response.data.id);
    } catch (err) {
      console.error("Failed to fetch profile ID:", err);
    }
  };

  const feedbackUrl =
    profileId && typeof window !== "undefined"
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
    return (
      <Shell>
        <SeoHead />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            minHeight: "40vh",
          }}
        >
          <CircularProgress sx={{ color: "var(--brand)" }} />
          <Box sx={{ color: "var(--muted)" }}>Gathering your feedback…</Box>
        </Box>
      </Shell>
    );
  }

  if (error) {
    return (
      <Shell>
        <SeoHead />
        <Box
          sx={{
            p: 3,
            borderRadius: 2,
            border: "1px solid #f3d3c7",
            bgcolor: "var(--accent-soft)",
            color: "#b23a18",
            fontWeight: 600,
          }}
        >
          {error}
        </Box>
      </Shell>
    );
  }

  const aggregatedFeedback = aggregateFeedback();

  // Shared editorial hero used by both the empty + populated states.
  const Hero = ({ lead }) => (
    <Box sx={{ mb: { xs: 4, md: 6 } }} className="rise">
      <Eyebrow>Developer growth</Eyebrow>
      <Box
        component="h1"
        className="ohx-display"
        sx={{ mt: 1.5, mb: 2, fontSize: "clamp(2.4rem, 5.4vw, 4rem)" }}
      >
        Your feedback <span className="ohx-italic">journey.</span>
      </Box>
      <p className="ohx-lead">{lead}</p>
    </Box>
  );

  if (feedback.length === 0) {
    return (
      <Shell>
        <SeoHead />
        <Hero lead="Opportunity Hack is one of the few places that gives developers detailed, structured feedback. Your insights will show up here as mentors and teammates share them." />
        <Box
          sx={{
            mt: 2,
            p: 3,
            borderRadius: 2,
            bgcolor: "var(--surface-2)",
            borderLeft: "3px solid var(--accent)",
            border: "1px solid var(--line)",
          }}
        >
          <Box sx={{ fontWeight: 700, color: "var(--ink)", mb: 0.5 }}>
            No feedback yet
          </Box>
          <Box sx={{ color: "var(--muted)" }}>
            Once you’ve worked on a project, mentors and teammates can leave you
            feedback. Check back after your next hackathon — it’ll appear right
            here.
          </Box>
        </Box>
      </Shell>
    );
  }

  const { score } = aggregatedFeedback.overall;
  const roleCount = Object.keys(aggregatedFeedback.roleSpecific).length;

  return (
    <Shell>
      <SeoHead />

      <Hero lead="A calm, honest view of how mentors and teammates have experienced your work — built to help you grow and to showcase your strengths." />

      <a
        href="/feedback"
        className="ohx-link"
        style={{ display: "inline-flex", marginBottom: 40 }}
      >
        Why feedback matters at Opportunity Hack
        <span className="ohx-arrow" aria-hidden="true">
          →
        </span>
      </a>

      {/* Overall performance — the centerpiece */}
      <Box
        className="ohx-card rise"
        sx={{
          p: { xs: 3, md: 4 },
          mb: 3,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: { xs: 3, md: 5 },
        }}
      >
        <Box sx={{ position: "relative", display: "inline-flex" }}>
          <CircularProgress
            variant="determinate"
            value={100}
            size={132}
            thickness={3}
            sx={{ color: "var(--line)" }}
          />
          <CircularProgress
            variant="determinate"
            value={score}
            size={132}
            thickness={3}
            sx={{
              color: "var(--brand)",
              position: "absolute",
              left: 0,
              "& .MuiCircularProgress-circle": { strokeLinecap: "round" },
            }}
          />
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              className="ohx-display"
              sx={{ fontSize: "2.4rem", lineHeight: 1, color: "var(--ink)" }}
            >
              {score}
            </Box>
            <Box sx={{ fontSize: "0.7rem", color: "var(--faint)", mt: 0.25 }}>
              / 100
            </Box>
          </Box>
        </Box>

        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Eyebrow>Overall performance</Eyebrow>
          <Box
            className="ohx-display"
            sx={{ fontSize: "1.5rem", mt: 1, mb: 1, color: "var(--ink)" }}
          >
            Your aggregate score
          </Box>
          <Box sx={{ color: "var(--muted)" }}>
            Averaged across{" "}
            <Box component="span" sx={{ color: "var(--ink)", fontWeight: 600 }}>
              {feedback.length}
            </Box>{" "}
            feedback submission{feedback.length !== 1 ? "s" : ""}
            {roleCount > 0 && (
              <>
                {" "}
                and{" "}
                <Box
                  component="span"
                  sx={{ color: "var(--ink)", fontWeight: 600 }}
                >
                  {roleCount}
                </Box>{" "}
                role{roleCount !== 1 ? "s" : ""}
              </>
            )}
            .
          </Box>
        </Box>
      </Box>

      {/* Share profile */}
      {profileId && (
        <Box
          className="ohx-card"
          sx={{ p: { xs: 3, md: 4 }, mb: 5 }}
        >
          <Eyebrow>Invite feedback</Eyebrow>
          <Box
            className="ohx-display"
            sx={{ fontSize: "1.3rem", mt: 1, mb: 0.5, color: "var(--ink)" }}
          >
            Share your feedback profile
          </Box>
          <Box sx={{ color: "var(--muted)", mb: 2 }}>
            Send this link to a mentor, teammate, or nonprofit partner so they
            can leave you structured feedback.
          </Box>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "stretch",
              gap: 1.5,
            }}
          >
            <TextField
              fullWidth
              value={feedbackUrl}
              InputProps={{ readOnly: true }}
              sx={{
                flex: 1,
                minWidth: 240,
                "& .MuiOutlinedInput-root": {
                  bgcolor: "var(--surface-2)",
                  borderRadius: "6px",
                  fontFamily: "var(--body)",
                  "& fieldset": { borderColor: "var(--line)" },
                  "&:hover fieldset": { borderColor: "#d8d1c0" },
                  "&.Mui-focused fieldset": { borderColor: "var(--brand)" },
                },
                "& input": { color: "var(--ink)" },
              }}
            />
            <button
              type="button"
              onClick={copyFeedbackUrl}
              className="ohx-btn ohx-btn--primary"
              style={{ whiteSpace: "nowrap" }}
            >
              {copied ? (
                <>
                  <CheckRoundedIcon sx={{ fontSize: 18 }} /> Copied
                </>
              ) : (
                <>
                  <ContentCopyIcon sx={{ fontSize: 18 }} /> Copy link
                </>
              )}
            </button>
          </Box>
        </Box>
      )}

      {/* Skill breakdowns */}
      <Box sx={{ mb: 1 }}>
        <Eyebrow>Skill breakdown</Eyebrow>
        <Box
          className="ohx-display"
          component="h2"
          sx={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", mt: 1, mb: 2.5 }}
        >
          How your skills land
        </Box>
      </Box>

      {Object.entries(aggregatedFeedback.roleSpecific).map(([role, data]) => (
        <FeedbackCategory
          key={role}
          title={`${role} skills`}
          data={data}
          tooltips={Object.fromEntries(
            (feedbackAreas[role] || []).map((area) => [area.name, area.tooltip])
          )}
        />
      ))}

      <FeedbackCategory
        title="General skills"
        data={aggregatedFeedback.general}
        tooltips={Object.fromEntries(
          (generalFeedbackAreas || []).map((area) => [area.name, area.tooltip])
        )}
      />

      {/* Individual feedback entries */}
      <Box sx={{ mt: 6, mb: 1 }}>
        <Eyebrow>The record</Eyebrow>
        <Box
          className="ohx-display"
          component="h2"
          sx={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", mt: 1, mb: 2.5 }}
        >
          Feedback, in detail
        </Box>
      </Box>

      {feedback.map((item, index) => (
        <Box
          key={index}
          className="ohx-card"
          sx={{ p: { xs: 2.5, md: 3.5 }, mb: 2 }}
        >
          <Box
            className="ohx-eyebrow"
            sx={{ letterSpacing: "0.14em", fontSize: "0.66rem" }}
          >
            {new Date(item.timestamp).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Box>
          <Box
            sx={{
              mt: 1.5,
              fontSize: "1.1rem",
              color: "var(--ink)",
              lineHeight: 1.6,
            }}
          >
            {item.feedback["Overall Performance"]}
          </Box>
          {item.feedback["Areas for Improvement"] && (
            <Box sx={{ mt: 1.5, color: "var(--muted)" }}>
              <Box
                component="span"
                sx={{ fontWeight: 600, color: "var(--ink)" }}
              >
                Areas for improvement:
              </Box>{" "}
              {item.feedback["Areas for Improvement"]}
            </Box>
          )}
          <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
            <span className="ohx-tag">{item.feedback.role}</span>
            <span className="ohx-tag">
              Confidence: {item.confidence_level}
            </span>
            <span className="ohx-tag">{item.duration}</span>
          </Box>
        </Box>
      ))}

      <Box
        sx={{
          mt: 4,
          p: 3,
          borderRadius: 2,
          bgcolor: "var(--surface-2)",
          borderLeft: "3px solid var(--brand)",
          border: "1px solid var(--line)",
          color: "var(--muted)",
        }}
      >
        Your feedback journey is ongoing. Keep seeking opportunities to grow —
        every project adds to the picture.
      </Box>
    </Shell>
  );
});

export default MyFeedbackPage;
