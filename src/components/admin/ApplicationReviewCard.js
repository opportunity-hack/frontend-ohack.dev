import React, { useState } from "react";
import Image from "next/image";
import NextLink from "next/link";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Grid,
  Avatar,
  IconButton,
  Collapse,
  Alert,
  Link,
  Divider,
  CircularProgress,
} from "@mui/material";
import {
  Check as CheckIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
  Language as WebsiteIcon,
  School as SchoolIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Gavel as StatusIcon,
  OpenInNew as OpenInNewIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HelpOutline as HelpOutlineIcon,
} from "@mui/icons-material";
import LiteVideoThumbnail from "../VideoDisplay/LiteVideoThumbnail";
import {
  JUDGE_TRAINING_BUNDLE_URL,
  JUDGE_TRAINING_CERTS,
} from "../../lib/lmsClient";

// Resolve LinkedIn URL from any of the field names forms use
const getLinkedInUrl = (app) => {
  const raw = app.linkedin || app.linkedinProfile || app.linkedinUrl || "";
  if (!raw) return null;
  return raw.startsWith("http") ? raw : `https://${raw}`;
};

// Fields rendered as external links wherever they appear on the card.
const LINK_FIELDS = [
  "linkedin",
  "linkedinProfile",
  "linkedinUrl",
  "github",
  "portfolio",
  "website",
  "introductionVideoUrl",
  "judgeTrainingIntroCertUrl",
  "judgeTrainingToolCertUrl",
];

const TRAINING_SLOT_COPY = {
  missing: "No certificate on the application",
  invalid: "Malformed certificate link",
  not_found: "Certificate not found on the LMS",
  mismatch: "Certificate is for a different quiz",
  error: "Couldn't verify — LMS unreachable",
};

const formatIssuedDate = (ms) => {
  if (!ms) return null;
  const date = new Date(ms);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString();
};

// One row of the training panel: verification result for a single required
// certificate, plus attempt data when the admin has LMS access.
const TrainingSlotRow = ({ spec, slot, lmsAccess }) => {
  const state = slot?.state || "missing";
  const verified = state === "verified";
  const rollup = slot?.rollup;
  const detailParts = [];
  if (verified) {
    if (typeof slot.cert?.score === "number") {
      detailParts.push(`score ${Math.round(slot.cert.score)}%`);
    }
    const issued = formatIssuedDate(slot.cert?.issuedAt);
    if (issued) detailParts.push(`issued ${issued}`);
  }
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mt: 1 }}>
      {verified ? (
        <CheckCircleIcon fontSize="small" color="success" sx={{ mt: 0.25 }} />
      ) : state === "missing" || state === "error" ? (
        <HelpOutlineIcon fontSize="small" color="disabled" sx={{ mt: 0.25 }} />
      ) : (
        <CancelIcon fontSize="small" color="error" sx={{ mt: 0.25 }} />
      )}
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {spec.videoTitle}
          {verified && detailParts.length > 0 && (
            <Typography component="span" variant="body2" color="text.secondary">
              {` — ${detailParts.join(" · ")}`}
            </Typography>
          )}
          {slot?.certUrl && state !== "invalid" && (
            <>
              {" "}
              <Link
                href={slot.certUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="body2"
              >
                View cert
              </Link>
            </>
          )}
        </Typography>
        {!verified && (
          <Typography variant="caption" color="text.secondary">
            {TRAINING_SLOT_COPY[state]}
            {state === "mismatch" && slot?.cert && (
              <> (it&apos;s for “{slot.cert.targetTitle || slot.cert.quizTitle}”)</>
            )}
          </Typography>
        )}
        {lmsAccess === "full" && rollup && (
          <Typography variant="caption" color="text.secondary" display="block">
            {`attempts ${rollup.attemptCount} · best ${Math.round(rollup.bestScore)}%`}
            {rollup.passed
              ? rollup.attemptsToPass
                ? ` · passed on attempt ${rollup.attemptsToPass}`
                : " · passed"
              : " · not passed yet"}
          </Typography>
        )}
        {!verified && rollup?.passed && (
          <Chip
            label="Passed on LMS"
            size="small"
            color="info"
            variant="outlined"
            sx={{ mt: 0.5 }}
          />
        )}
      </Box>
    </Box>
  );
};

// Judge-only panel: intro-video thumbnail beside LMS training verification.
// Module-scope on purpose (defining it inside the card remounts it on every
// parent state tick — the SectionBlock lesson).
const JudgeTrainingPanel = ({
  application,
  trainingStatus,
  lmsAccess,
  onPlayVideo,
}) => {
  const videoUrl = application.introductionVideoUrl;
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: 2,
        mb: 2,
      }}
    >
      <Box sx={{ flexShrink: 0 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          Intro video
        </Typography>
        {videoUrl ? (
          onPlayVideo ? (
            <LiteVideoThumbnail
              url={videoUrl}
              width={280}
              height={158}
              label="Watch intro video"
              onClick={() => onPlayVideo(videoUrl, application.name)}
            />
          ) : (
            <Link href={videoUrl} target="_blank" rel="noopener noreferrer">
              Watch intro video
            </Link>
          )
        ) : (
          <Box
            sx={{
              width: 280,
              maxWidth: "100%",
              height: 158,
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No intro video
            </Typography>
          </Box>
        )}
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          minWidth: 0,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          p: 1.5,
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
          <Typography variant="subtitle2">Judge training</Typography>
          <Chip
            label={
              application.judgeTrainingCompleted
                ? "Marked complete at submit"
                : "Not marked at submit"
            }
            size="small"
            color={application.judgeTrainingCompleted ? "success" : "default"}
            variant="outlined"
          />
        </Box>
        {trainingStatus ? (
          JUDGE_TRAINING_CERTS.map((spec) => (
            <TrainingSlotRow
              key={spec.key}
              spec={spec}
              slot={trainingStatus.slots?.[spec.key]}
              lmsAccess={lmsAccess}
            />
          ))
        ) : (
          // No verification data (hook disabled / card used standalone /
          // still checking): fall back to the stored links.
          <Box sx={{ mt: 1 }}>
            {JUDGE_TRAINING_CERTS.map((spec) =>
              application[spec.field] ? (
                <Typography variant="body2" key={spec.key}>
                  {spec.videoTitle}:{" "}
                  <Link
                    href={application[spec.field]}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ wordBreak: "break-all" }}
                  >
                    View cert
                  </Link>
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary" key={spec.key}>
                  {spec.videoTitle}: no certificate on the application
                </Typography>
              ),
            )}
            {lmsAccess === null && (
              <Typography variant="caption" color="text.secondary">
                Checking LMS training status…
              </Typography>
            )}
          </Box>
        )}
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          {lmsAccess === "certs-only" &&
            "Attempt details need an LMS admin/editor account. "}
          {lmsAccess === "unavailable" &&
            "LMS unreachable — showing stored links only. "}
          <Link
            href={JUDGE_TRAINING_BUNDLE_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open training bundle
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

const ApplicationReviewCard = ({
  application,
  applicationType,
  onApprove,
  onReject,
  onEdit,
  isLoading = false,
  trainingStatus,
  lmsAccess,
  onPlayVideo,
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleExpand = () => {
    setExpanded(!expanded);
  };

  const handleApprove = () => {
    onApprove(application);
  };

  const handleReject = () => {
    onReject(application);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(application);
    }
  };

  // Get the configuration for this application type
  const getFieldConfig = (type) => {
    const configs = {
      hacker: {
        title: "Hacker Application",
        primaryFields: ["name", "email", "experienceLevel", "primaryRoles"],
        secondaryFields: [
          "schoolOrganization",
          "participantType",
          "skills",
          "teamStatus",
        ],
        additionalFields: [
          "bio",
          "linkedin",
          "github",
          "portfolio",
          "motivation",
          "socialCauses",
          "dietaryRestrictions",
        ],
        statusField: "isSelected",
      },
      mentor: {
        title: "Mentor Application",
        primaryFields: ["name", "email", "company", "title"],
        secondaryFields: [
          "expertise",
          "yearsExperience",
          "mentorshipAreas",
          "aiToolsUsed",
          "aiToolsExperience",
        ],
        additionalFields: [
          "bio",
          "linkedin",
          "availability",
          "previousMentoring",
          "dietaryRestrictions",
        ],
        statusField: "isSelected",
      },
      judge: {
        title: "Judge Application",
        primaryFields: ["name", "email", "title", "companyName", "status"],
        // introductionVideoUrl + the training cert URLs render in the
        // JudgeTrainingPanel, not as raw field rows.
        secondaryFields: [
          "inPerson",
          "canAttendJudging",
          "participationCount",
          "country",
          "state",
          "linkedinProfile",
          "backgroundAreas",
        ],
        additionalFields: [
          "biography",
          "whyJudge",
          "availability",
          "additionalInfo",
          "pronouns",
          "otherBackground",
          "dietaryRestrictions",
          "photoUrl",
        ],
        statusField: "isSelected",
      },
      volunteer: {
        title: "Volunteer Application",
        primaryFields: ["name", "email", "title", "company", "experienceLevel"],
        secondaryFields: [
          "socialCauses",
          "availability",
          "availableDays",
          "skills",
          "previousVolunteering",
        ],
        additionalFields: [
          "bio",
          "shortBio",
          "motivation",
          "linkedin",
          "linkedinProfile",
          "portfolio",
          "otherSocialCause",
          "shirtSize",
          "dietaryRestrictions",
          "additionalInfo",
        ],
        statusField: "isSelected",
      },
      sponsor: {
        title: "Sponsor Application",
        primaryFields: [
          "companyName",
          "name",
          "email",
          "sponsorshipTypes",
          "title",
        ],
        secondaryFields: [
          "volunteerType",
          "volunteerCount",
          "volunteerHours",
          "phoneNumber",
          "preferredContact",
          "useLogo",
        ],
        additionalFields: [
          "company",
          "industry",
          "employeeCount",
          "bio",
          "website",
          "specialRequests",
          "howHeard",
          "otherInvolvement",
          "logoUrl",
        ],
        statusField: "isSelected",
      },
    };
    return configs[type] || configs.hacker;
  };

  const config = getFieldConfig(applicationType);
  const isApproved = application[config.statusField];

  // Helper function to get status chip configuration
  const getStatusChipConfig = (status) => {
    const statusConfigs = {
      pending: { label: "Pending Review", color: "default", icon: null },
      approved: { label: "Approved", color: "success", icon: <CheckIcon /> },
      denied: { label: "Denied", color: "error", icon: <CloseIcon /> },
      verified_travel: {
        label: "Verified Travel",
        color: "info",
        icon: <StatusIcon />,
      },
      confirmed: { label: "Confirmed", color: "primary", icon: <CheckIcon /> },
      withdrew: { label: "Withdrew", color: "warning", icon: <CloseIcon /> },
      no_show: { label: "No Show", color: "error", icon: <CloseIcon /> },
    };
    return statusConfigs[status] || statusConfigs.pending;
  };

  // Helper function to format field values
  const formatFieldValue = (field, value) => {
    if (!value) return "Not provided";

    // Handle boolean fields with Yes/No
    if (field === "inPerson") {
      if (typeof value === "boolean") {
        return value ? "Yes" : "No";
      }
      return value; // If it's already a string like "Yes"/"No"
    }

    // Handle special formatting for participation count
    if (field === "participationCount") {
      return value;
    }

    // Handle canAttendJudging with better formatting
    if (field === "canAttendJudging") {
      if (value === "Yes") return "✅ Yes, full judging period";
      if (value === "No") return "❌ Cannot attend";
      if (value === "Partial") return "⚠️ Partial attendance";
      return value;
    }

    // Handle sponsor-specific field formatting
    if (field === "useLogo") {
      if (value === "Yes") return "✅ Yes";
      if (value === "No") return "❌ No";
      if (value === "Not sure") return "❓ Not sure";
      return value;
    }

    if (field === "volunteerCount") {
      return `${value} volunteer${value !== "1" ? "s" : ""}`;
    }

    if (field === "volunteerHours") {
      return `${value} hour${value !== "1" ? "s" : ""}`;
    }

    if (field === "preferredContact") {
      return value === "email"
        ? "📧 Email"
        : value === "phone"
          ? "📞 Phone"
          : value;
    }

    // Handle volunteer-specific field formatting
    if (field === "experienceLevel") {
      if (value.includes("First time")) return "🔰 First Timer";
      if (value.includes("Some experience")) return "💪 Experienced";
      if (value.includes("Experienced volunteer")) return "⭐ Expert Volunteer";
      return value;
    }

    if (field === "availableDays") {
      if (Array.isArray(value)) {
        const roleTypes = [
          ...new Set(
            value
              .map((day) => {
                const parts = day.split("-");
                return parts[parts.length - 1];
              })
              .filter(Boolean),
          ),
        ];

        const roleIcons = {
          Photography: "📸 Photography",
          "Cleanup Crew": "🧹 Cleanup",
          "Judging Support": "🏆 Judging",
          Registration: "📋 Registration",
          Setup: "🔧 Setup",
        };

        return roleTypes.map((role) => roleIcons[role] || role).join(", ");
      }
      return value;
    }

    if (field === "availability") {
      if (typeof value === "string" && value.includes(",")) {
        const slots = value.split(",").map((s) => s.trim());
        const dayCount = slots.length;
        const uniqueDays = [
          ...new Set(
            slots
              .map((slot) => {
                const match = slot.match(/(Saturday|Sunday)/);
                return match ? match[1] : null;
              })
              .filter(Boolean),
          ),
        ];

        return `${dayCount} time slots across ${uniqueDays.join(" & ")}`;
      }
      return value;
    }

    if (Array.isArray(value)) {
      return value.join(", ");
    }

    if (typeof value === "string" && value.includes(",")) {
      return value
        .split(",")
        .map((item) => item.trim())
        .join(", ");
    }

    return value;
  };

  // Helper function to render field with proper formatting
  const renderField = (field, value, isLink = false) => {
    if (!value) return null;

    const formattedValue = formatFieldValue(field, value);

    if (isLink && value) {
      return (
        <Link
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ wordBreak: "break-all" }}
        >
          {formattedValue}
        </Link>
      );
    }

    return formattedValue;
  };

  // Helper function to get field label
  const getFieldLabel = (field) => {
    const labelMap = {
      name: "Name",
      email: "Email",
      experienceLevel: "Experience",
      primaryRoles: "Primary Roles",
      schoolOrganization: "School/Organization",
      participantType: "Type",
      skills: "Skills",
      teamStatus: "Team Status",
      bio: "Bio",
      linkedin: "LinkedIn",
      github: "GitHub",
      portfolio: "Portfolio",
      motivation: "Motivation",
      socialCauses: "Social Causes",
      company: "Company",
      title: "Title",
      expertise: "Expertise",
      yearsExperience: "Years Experience",
      mentorshipAreas: "Mentorship Areas",
      aiToolsUsed: "AI Tools Used",
      aiToolsExperience: "AI Tools Experience",
      judgingExperience: "Judging Experience",
      volunteerRole: "Volunteer Role",
      availability: "Availability",
      previousVolunteering: "Previous Volunteering",
      previousMentoring: "Previous Mentoring",
      criteriaPreferences: "Criteria Preferences",
      companyName: "Company",
      contactName: "Contact Name",
      sponsorshipLevel: "Sponsorship Level",
      industry: "Industry",
      employeeCount: "Employee Count",
      website: "Website",
      specialRequests: "Special Requests",
      // Judge-specific fields
      participationCount: "OHack Participation",
      backgroundAreas: "Background Areas",
      canAttendJudging: "Can Attend Judging",
      inPerson: "In Person",
      biography: "Biography",
      whyJudge: "Why Judge?",
      additionalInfo: "Additional Information",
      pronouns: "Pronouns",
      country: "Country",
      state: "State",
      otherBackground: "Other Background",
      linkedinProfile: "LinkedIn Profile",
      introductionVideoUrl: "Intro Video",
      judgeTrainingIntroCertUrl: "Training Cert: Judge Intro",
      judgeTrainingToolCertUrl: "Training Cert: Judging Tool",
      judgeTrainingCompleted: "Judge Training Completed",
      shirtSize: "T-Shirt Size",
      dietaryRestrictions: "Dietary Restrictions",
      photoUrl: "Photo",
      status: "Status",
      // Sponsor-specific fields
      sponsorshipTypes: "Sponsorship Types",
      volunteerType: "Volunteer Type",
      volunteerCount: "Volunteer Count",
      volunteerHours: "Volunteer Hours",
      phoneNumber: "Phone Number",
      preferredContact: "Preferred Contact",
      useLogo: "Use Logo",
      howHeard: "How Heard About Event",
      otherInvolvement: "Other Involvement",
      logoUrl: "Logo URL",
      // Volunteer-specific fields
      availableDays: "Time Slots",
      otherSocialCause: "Other Social Cause",
      shortBio: "Short Bio",
      previousVolunteering: "Previous Volunteering",
    };
    return labelMap[field] || field.charAt(0).toUpperCase() + field.slice(1);
  };

  return (
    <Card
      sx={{
        mb: 2,
        border: isApproved ? "2px solid #4caf50" : "1px solid #e0e0e0",
        bgcolor: isApproved ? "#f1f8e9" : "background.paper",
      }}
    >
      <CardContent>
        {/* Header with name and approval status */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            mb: 2,
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", minWidth: 0 }}>
            <Avatar
              src={application.profile_image || application.photoUrl}
              sx={{
                mr: 2,
                bgcolor: "primary.main",
                width: 48,
                height: 48,
                flexShrink: 0,
              }}
            >
              <PersonIcon />
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h6"
                component="h3"
                sx={{ wordBreak: "break-word" }}
              >
                {application.name || "No name provided"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {config.title}
              </Typography>
              {/* LinkedIn + OHack profile quick-access chips */}
              <Box
                sx={{ display: "flex", gap: 0.5, mt: 0.5, flexWrap: "wrap" }}
              >
                {(() => {
                  const liUrl = getLinkedInUrl(application);
                  return liUrl ? (
                    <Chip
                      icon={
                        <LinkedInIcon sx={{ fontSize: "0.9rem !important" }} />
                      }
                      label="LinkedIn"
                      size="small"
                      component="a"
                      href={liUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      clickable
                      sx={{
                        bgcolor: "#0077b5",
                        color: "#fff",
                        "& .MuiChip-icon": { color: "#fff" },
                      }}
                    />
                  ) : (
                    <Chip
                      label="No LinkedIn"
                      size="small"
                      variant="outlined"
                      sx={{ opacity: 0.5 }}
                    />
                  );
                })()}
                {application.user_db_id && (
                  <Chip
                    icon={
                      <OpenInNewIcon sx={{ fontSize: "0.9rem !important" }} />
                    }
                    label="OHack profile"
                    size="small"
                    component={NextLink}
                    href={`/profile/${application.user_db_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    clickable
                    variant="outlined"
                    color="primary"
                  />
                )}
              </Box>
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexShrink: 0,
            }}
          >
            {/* Show status for judges, or approval status for others */}
            {applicationType === "judge" && application.status ? (
              <Chip {...getStatusChipConfig(application.status)} size="small" />
            ) : (
              isApproved && (
                <Chip
                  label="APPROVED"
                  color="success"
                  size="small"
                  icon={<CheckIcon />}
                />
              )
            )}
            <IconButton onClick={handleExpand} size="small">
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>

        {/* Primary information (always visible) */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {config.primaryFields.map((field) => {
            const value = application[field];
            if (!value) return null;

            return (
              <Grid size={{ xs: 12, sm: 6 }} key={field}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {field === "email" && (
                    <EmailIcon fontSize="small" color="action" />
                  )}
                  {field === "schoolOrganization" && (
                    <SchoolIcon fontSize="small" color="action" />
                  )}
                  {field === "company" && (
                    <SchoolIcon fontSize="small" color="action" />
                  )}
                  {field === "status" && (
                    <StatusIcon fontSize="small" color="action" />
                  )}
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {getFieldLabel(field)}
                    </Typography>
                    {field === "status" ? (
                      <Chip
                        {...getStatusChipConfig(value)}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    ) : (
                      <Typography variant="body1">
                        {renderField(field, value)}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>

        {/* Judge-only: intro video + LMS training verification */}
        {applicationType === "judge" && (
          <JudgeTrainingPanel
            application={application}
            trainingStatus={trainingStatus}
            lmsAccess={lmsAccess}
            onPlayVideo={onPlayVideo}
          />
        )}

        {/* Secondary information (visible when collapsed) */}
        {!expanded && (
          <Box sx={{ mb: 2 }}>
            <Grid container spacing={2}>
              {config.secondaryFields.slice(0, 6).map((field) => {
                const value = application[field];
                if (!value) return null;

                const isLink = LINK_FIELDS.includes(field);

                return (
                  <Grid size={{ xs: 12, sm: 6 }} key={field}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {(field === "linkedin" ||
                        field === "linkedinProfile") && (
                        <LinkedInIcon fontSize="small" color="action" />
                      )}
                      {field === "country" && (
                        <LocationIcon fontSize="small" color="action" />
                      )}
                      {field === "state" && (
                        <LocationIcon fontSize="small" color="action" />
                      )}
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {getFieldLabel(field)}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            ...(field === "canAttendJudging" && {
                              p: 1,
                              borderRadius: 1,
                              bgcolor:
                                value === "Yes"
                                  ? "success.light"
                                  : value === "No"
                                    ? "error.light"
                                    : "warning.light",
                              color:
                                value === "Yes"
                                  ? "success.contrastText"
                                  : value === "No"
                                    ? "error.contrastText"
                                    : "warning.contrastText",
                            }),
                            ...(field === "inPerson" && {
                              p: 1,
                              borderRadius: 1,
                              bgcolor:
                                value === "Yes" || value === true
                                  ? "info.light"
                                  : "grey.200",
                              color:
                                value === "Yes" || value === true
                                  ? "info.contrastText"
                                  : "text.primary",
                            }),
                          }}
                        >
                          {renderField(field, value, isLink)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}

        {/* Expandable detailed information */}
        <Collapse in={expanded}>
          <Divider sx={{ my: 2 }} />

          {/* All secondary fields when expanded */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {config.secondaryFields.map((field) => {
              const value = application[field];
              if (!value) return null;

              return (
                <Grid size={{ xs: 12, sm: 6 }} key={field}>
                  <Typography variant="body2" color="text.secondary">
                    {getFieldLabel(field)}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      ...(field === "canAttendJudging" && {
                        p: 1,
                        borderRadius: 1,
                        bgcolor:
                          value === "Yes"
                            ? "success.light"
                            : value === "No"
                              ? "error.light"
                              : "warning.light",
                        color:
                          value === "Yes"
                            ? "success.contrastText"
                            : value === "No"
                              ? "error.contrastText"
                              : "warning.contrastText",
                      }),
                    }}
                  >
                    {renderField(field, value, LINK_FIELDS.includes(field))}
                  </Typography>
                </Grid>
              );
            })}
          </Grid>

          {/* Additional fields */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Additional Information
            </Typography>
            <Grid container spacing={2}>
              {config.additionalFields.map((field) => {
                const value = application[field];
                if (!value) return null;

                const isLink = LINK_FIELDS.includes(field);

                return (
                  <Grid size={{ xs: 12 }} key={field}>
                    <Box
                      sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}
                    >
                      {(field === "linkedin" ||
                        field === "linkedinProfile") && (
                        <LinkedInIcon fontSize="small" color="action" />
                      )}
                      {field === "github" && (
                        <GitHubIcon fontSize="small" color="action" />
                      )}
                      {(field === "portfolio" || field === "website") && (
                        <WebsiteIcon fontSize="small" color="action" />
                      )}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {getFieldLabel(field)}
                        </Typography>
                        {field === "photoUrl" && value ? (
                          <Box
                            sx={{
                              mt: 1,
                              position: "relative",
                              width: "120px",
                              height: "120px",
                            }}
                          >
                            <Image
                              src={value}
                              alt="Judge photo"
                              fill
                              style={{
                                borderRadius: "8px",
                                objectFit: "cover",
                              }}
                            />
                          </Box>
                        ) : field === "logoUrl" && value ? (
                          <Box
                            sx={{
                              mt: 1,
                              position: "relative",
                              width: "120px",
                              height: "120px",
                            }}
                          >
                            <Image
                              src={value}
                              alt="Company logo"
                              fill
                              style={{
                                borderRadius: "8px",
                                objectFit: "contain",
                              }}
                            />
                          </Box>
                        ) : field === "biography" ||
                          field === "whyJudge" ||
                          field === "motivation" ||
                          field === "bio" ||
                          field === "shortBio" ? (
                          <Typography
                            variant="body2"
                            sx={{
                              mt: 0.5,
                              p: 2,
                              bgcolor: "grey.50",
                              borderRadius: 1,
                              fontStyle:
                                field === "whyJudge" || field === "motivation"
                                  ? "italic"
                                  : "normal",
                              fontWeight: field === "shortBio" ? 500 : "normal",
                            }}
                          >
                            {renderField(field, value, isLink)}
                          </Typography>
                        ) : field === "availability" && value ? (
                          <Box sx={{ mt: 1 }}>
                            {/* Availability Timeline Visualization */}
                            {(() => {
                              // Parse availability into structured data
                              const parseAvailability = (availStr) => {
                                const slots = availStr
                                  .split(",")
                                  .map((s) => s.trim());
                                const parsed = [];

                                slots.forEach((slot) => {
                                  const dayMatch = slot.match(
                                    /(Saturday|Sunday), (\w+ \d+)/,
                                  );
                                  const timeMatch = slot.match(/\(([^)]+)\)/);
                                  const roleMatch =
                                    slot.match(/(📸|🧹|🏆|📋|🔧)/);
                                  const roleNameMatch = slot.match(
                                    /(?:📸|🧹|🏆|📋|🔧)\s*([^(]+)/,
                                  );
                                  const sessionMatch =
                                    slot.match(/: ([^-]+) -/);

                                  if (dayMatch && timeMatch) {
                                    const [, dayName, date] = dayMatch;
                                    const timeRange = timeMatch[1];
                                    const roleIcon = roleMatch
                                      ? roleMatch[1]
                                      : "👥";
                                    const roleName = roleNameMatch
                                      ? roleNameMatch[1].trim()
                                      : "General";
                                    const sessionName = sessionMatch
                                      ? sessionMatch[1].trim()
                                      : "";

                                    // Parse start and end times
                                    const [startStr, endStr] =
                                      timeRange.split(" - ");
                                    const parseTime = (timeStr) => {
                                      const match =
                                        timeStr.match(/(\d+):(\d+)(am|pm)/);
                                      if (!match) return 0;
                                      let [, hours, minutes, ampm] = match;
                                      hours = parseInt(hours);
                                      minutes = parseInt(minutes);
                                      if (ampm === "pm" && hours !== 12)
                                        hours += 12;
                                      if (ampm === "am" && hours === 12)
                                        hours = 0;
                                      return hours * 60 + minutes;
                                    };

                                    parsed.push({
                                      day: dayName,
                                      date,
                                      startTime: parseTime(startStr),
                                      endTime: parseTime(endStr),
                                      timeRange,
                                      roleIcon,
                                      roleName: roleName.replace(
                                        /^\w+\s*-\s*/,
                                        "",
                                      ),
                                      sessionName,
                                    });
                                  }
                                });

                                return parsed;
                              };

                              const slots = parseAvailability(value);
                              const saturdaySlots = slots
                                .filter((s) => s.day === "Saturday")
                                .sort((a, b) => a.startTime - b.startTime);
                              const sundaySlots = slots
                                .filter((s) => s.day === "Sunday")
                                .sort((a, b) => a.startTime - b.startTime);

                              const totalHours = slots.reduce((total, slot) => {
                                return (
                                  total + (slot.endTime - slot.startTime) / 60
                                );
                              }, 0);

                              const roleStats = slots.reduce((acc, slot) => {
                                acc[slot.roleIcon] =
                                  (acc[slot.roleIcon] || 0) +
                                  (slot.endTime - slot.startTime) / 60;
                                return acc;
                              }, {});

                              const roleColors = {
                                "📸": "#2196f3",
                                "🧹": "#4caf50",
                                "🏆": "#ff9800",
                                "📋": "#9c27b0",
                                "🔧": "#f44336",
                                "👥": "#757575",
                              };

                              const roleNames = {
                                "📸": "Photography",
                                "🧹": "Cleanup",
                                "🏆": "Judging",
                                "📋": "Registration",
                                "🔧": "Setup",
                                "👥": "General",
                              };

                              const createDetailedTimeline = (
                                daySlots,
                                dayName,
                              ) => {
                                if (daySlots.length === 0) return null;

                                const minTime = Math.min(
                                  ...daySlots.map((s) => s.startTime),
                                );
                                const maxTime = Math.max(
                                  ...daySlots.map((s) => s.endTime),
                                );
                                const totalMinutes = maxTime - minTime;
                                const timelineHeight = 40;

                                return (
                                  <Box sx={{ mb: 2 }}>
                                    <Typography
                                      variant="subtitle2"
                                      sx={{
                                        mb: 1,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          width: 8,
                                          height: 8,
                                          borderRadius: "50%",
                                          bgcolor:
                                            dayName === "Saturday"
                                              ? "primary.main"
                                              : "secondary.main",
                                        }}
                                      />
                                      {dayName} ({daySlots.length} time slots)
                                    </Typography>

                                    {/* Timeline bar */}
                                    <Box
                                      sx={{
                                        position: "relative",
                                        height: timelineHeight,
                                        bgcolor: "grey.100",
                                        borderRadius: 2,
                                        mb: 1,
                                      }}
                                    >
                                      {daySlots.map((slot, idx) => {
                                        const left =
                                          ((slot.startTime - minTime) /
                                            totalMinutes) *
                                          100;
                                        const width =
                                          ((slot.endTime - slot.startTime) /
                                            totalMinutes) *
                                          100;

                                        return (
                                          <Box
                                            key={idx}
                                            sx={{
                                              position: "absolute",
                                              left: `${left}%`,
                                              width: `${width}%`,
                                              height: "70%",
                                              bgcolor:
                                                roleColors[slot.roleIcon] ||
                                                roleColors["👥"],
                                              borderRadius: 1,
                                              top: `${15 + (idx % 2) * 5}%`,
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              fontSize: "0.9rem",
                                              color: "white",
                                              fontWeight: 500,
                                              border:
                                                "2px solid rgba(255,255,255,0.3)",
                                              boxShadow:
                                                "0 1px 3px rgba(0,0,0,0.2)",
                                            }}
                                          >
                                            {slot.roleIcon}
                                          </Box>
                                        );
                                      })}
                                    </Box>

                                    {/* Time labels */}
                                    <Box
                                      sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        fontSize: "0.75rem",
                                        color: "text.secondary",
                                      }}
                                    >
                                      <span>
                                        {new Date(
                                          minTime * 60000,
                                        ).toLocaleTimeString("en-US", {
                                          hour: "numeric",
                                          minute: "2-digit",
                                          hour12: true,
                                        })}
                                      </span>
                                      <span>
                                        {new Date(
                                          maxTime * 60000,
                                        ).toLocaleTimeString("en-US", {
                                          hour: "numeric",
                                          minute: "2-digit",
                                          hour12: true,
                                        })}
                                      </span>
                                    </Box>
                                  </Box>
                                );
                              };

                              return (
                                <Box sx={{ overflowX: "auto" }}>
                                  {/* Summary stats */}
                                  <Box
                                    sx={{
                                      display: "flex",
                                      gap: 2,
                                      mb: 2,
                                      flexWrap: "wrap",
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        bgcolor: "success.light",
                                        p: 1,
                                        borderRadius: 1,
                                      }}
                                    >
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          fontWeight: 600,
                                          color: "success.contrastText",
                                        }}
                                      >
                                        Total:{" "}
                                        {Math.round(totalHours * 10) / 10} hours
                                      </Typography>
                                    </Box>
                                    <Box
                                      sx={{
                                        bgcolor: "info.light",
                                        p: 1,
                                        borderRadius: 1,
                                      }}
                                    >
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          fontWeight: 600,
                                          color: "info.contrastText",
                                        }}
                                      >
                                        {slots.length} time slots
                                      </Typography>
                                    </Box>
                                    <Box
                                      sx={{
                                        bgcolor: "primary.light",
                                        p: 1,
                                        borderRadius: 1,
                                      }}
                                    >
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          fontWeight: 600,
                                          color: "primary.contrastText",
                                        }}
                                      >
                                        {Object.keys(roleStats).length} roles
                                      </Typography>
                                    </Box>
                                  </Box>

                                  {/* Role breakdown */}
                                  <Box sx={{ mb: 2 }}>
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        fontWeight: 600,
                                        display: "block",
                                        mb: 1,
                                      }}
                                    >
                                      Role Distribution:
                                    </Typography>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        gap: 1,
                                        flexWrap: "wrap",
                                      }}
                                    >
                                      {Object.entries(roleStats).map(
                                        ([role, hours]) => (
                                          <Box
                                            key={role}
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 0.5,
                                              bgcolor: "grey.50",
                                              px: 1,
                                              py: 0.5,
                                              borderRadius: 1,
                                              border: `2px solid ${roleColors[role]}`,
                                            }}
                                          >
                                            <span>{role}</span>
                                            <Typography
                                              variant="caption"
                                              sx={{ fontWeight: 500 }}
                                            >
                                              {roleNames[role]}:{" "}
                                              {Math.round(hours * 10) / 10}h
                                            </Typography>
                                          </Box>
                                        ),
                                      )}
                                    </Box>
                                  </Box>

                                  {/* Day timelines */}
                                  {createDetailedTimeline(
                                    saturdaySlots,
                                    "Saturday",
                                  )}
                                  {createDetailedTimeline(
                                    sundaySlots,
                                    "Sunday",
                                  )}

                                  {/* Detailed schedule */}
                                  <Box
                                    sx={{
                                      bgcolor: "grey.50",
                                      p: 2,
                                      borderRadius: 2,
                                      mt: 2,
                                    }}
                                  >
                                    <Typography
                                      variant="subtitle2"
                                      sx={{ mb: 1 }}
                                    >
                                      Complete Schedule:
                                    </Typography>
                                    <Box sx={{ display: "grid", gap: 0.5 }}>
                                      {[...saturdaySlots, ...sundaySlots].map(
                                        (slot, idx) => (
                                          <Box
                                            key={idx}
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 1,
                                              fontSize: "0.8rem",
                                              p: 0.5,
                                              borderLeft: `3px solid ${roleColors[slot.roleIcon]}`,
                                              pl: 1,
                                            }}
                                          >
                                            <Box sx={{ minWidth: 60 }}>
                                              <Typography
                                                variant="caption"
                                                sx={{ fontWeight: 600 }}
                                              >
                                                {slot.day.substring(0, 3)}
                                              </Typography>
                                            </Box>
                                            <Box sx={{ minWidth: 100 }}>
                                              <Typography variant="caption">
                                                {slot.timeRange}
                                              </Typography>
                                            </Box>
                                            <Box
                                              sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 0.5,
                                              }}
                                            >
                                              <span>{slot.roleIcon}</span>
                                              <Typography
                                                variant="caption"
                                                sx={{ fontWeight: 500 }}
                                              >
                                                {slot.roleName}
                                              </Typography>
                                            </Box>
                                            {slot.sessionName && (
                                              <Typography
                                                variant="caption"
                                                sx={{
                                                  color: "text.secondary",
                                                  fontStyle: "italic",
                                                }}
                                              >
                                                ({slot.sessionName})
                                              </Typography>
                                            )}
                                          </Box>
                                        ),
                                      )}
                                    </Box>
                                  </Box>
                                </Box>
                              );
                            })()}
                          </Box>
                        ) : (
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {renderField(field, value, isLink)}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>

          {/* Application metadata */}
          <Box sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Application Details
            </Typography>
            <Grid container spacing={2}>
              {application.timestamp && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Submitted
                  </Typography>
                  <Typography variant="body2">
                    {new Date(application.timestamp).toLocaleDateString()} at{" "}
                    {new Date(application.timestamp).toLocaleTimeString()}
                  </Typography>
                </Grid>
              )}
              {application.event_id && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Event ID
                  </Typography>
                  <Typography variant="body2">
                    {application.event_id}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>

          {/* All submitted fields — shows anything the applicant filled in that isn't already displayed above */}
          {(() => {
            const alreadyRendered = new Set([
              ...config.primaryFields,
              ...config.secondaryFields,
              ...config.additionalFields,
              "name",
              "photoUrl",
              "status",
              "timestamp",
              "event_id",
              // rendered by JudgeTrainingPanel
              "introductionVideoUrl",
              "judgeTrainingIntroCertUrl",
              "judgeTrainingToolCertUrl",
              "judgeTrainingCompleted",
              // internal / audit fields never shown to reviewers
              "id",
              "user_id",
              "user_db_id",
              "propel_id",
              "slack_user_id",
              "volunteer_type",
              "isSelected",
              "created_by",
              "created_timestamp",
              "updated_by",
              "updated_timestamp",
              "sent_emails",
              "certificates",
              "profile_image",
              "checkedIn",
              "checkedInBy",
              "checkedInAt",
              "checkInTime",
              "checkInTimeList",
              "isCheckedIn",
              "timeSlot",
            ]);
            const extraEntries = Object.entries(application).filter(
              ([key, val]) => {
                if (alreadyRendered.has(key)) return false;
                if (val === null || val === undefined || val === "")
                  return false;
                if (Array.isArray(val) && val.length === 0) return false;
                return true;
              },
            );
            if (extraEntries.length === 0) return null;
            return (
              <Box sx={{ mt: 2 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  All Submitted Fields
                </Typography>
                <Grid container spacing={2}>
                  {extraEntries.map(([key, val]) => {
                    const isLink = LINK_FIELDS.includes(key);
                    const displayVal = Array.isArray(val)
                      ? val.join(", ")
                      : typeof val === "object"
                        ? JSON.stringify(val)
                        : String(val);
                    return (
                      <Grid size={{ xs: 12, sm: 6 }} key={key}>
                        <Typography variant="body2" color="text.secondary">
                          {getFieldLabel(key)}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ wordBreak: "break-word" }}
                        >
                          {isLink && val ? (
                            <Link
                              href={
                                val.startsWith("http") ? val : `https://${val}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {displayVal}
                            </Link>
                          ) : (
                            displayVal
                          )}
                        </Typography>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            );
          })()}
        </Collapse>
      </CardContent>

      {/* Action buttons */}
      <CardActions
        sx={{
          justifyContent: "space-between",
          p: 2,
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          gap: { xs: 1, sm: 0 },
        }}
      >
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={handleEdit}
          disabled={isLoading}
          size="small"
        >
          Edit Details
        </Button>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<CloseIcon />}
            onClick={handleReject}
            disabled={isLoading}
            size="small"
          >
            Reject
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={
              isLoading ? <CircularProgress size={16} /> : <CheckIcon />
            }
            onClick={handleApprove}
            disabled={isApproved || isLoading}
            size="small"
          >
            {isApproved ? "Approved" : "Approve"}
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};

export default ApplicationReviewCard;
