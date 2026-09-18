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
  Tooltip,
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
  OpenInNew as OpenInNewIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HelpOutline as HelpOutlineIcon,
} from "@mui/icons-material";
import LiteVideoThumbnail from "../VideoDisplay/LiteVideoThumbnail";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { normalizeStatus, rosterConflict, rosterReady } from "../../lib/applicationStatus";
import {
  LINK_FIELDS,
  getFieldLabel as schemaFieldLabel,
  getRenderedKeys,
  getReviewFields,
  linkedinUrlOf,
  readFieldValue,
} from "./volunteer/applicationSchema";
import { InlineStatusSelect } from "./volunteer/StatusControls";
import { RosterToggle } from "./volunteer/RosterControls";
import {
  JUDGE_TRAINING_BUNDLE_URL,
  JUDGE_TRAINING_CERTS,
} from "../../lib/lmsClient";

// A field value the card should skip (never render "Not provided" rows for
// things the applicant never filled in). Switch-type fields that are false
// are skipped too — a missing "agreed" is not information.
const isBlankValue = (v) =>
  v === undefined || v === null || v === "" || v === false || (Array.isArray(v) && v.length === 0);

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
        {lmsAccess === "full" && rollup ? (
          <Typography variant="caption" color="text.secondary" display="block">
            {`attempts ${rollup.attemptCount} · best ${Math.round(rollup.bestScore)}%`}
            {rollup.passed
              ? rollup.attemptsToPass
                ? ` · passed on attempt ${rollup.attemptsToPass}`
                : " · passed"
              : " · not passed yet"}
          </Typography>
        ) : typeof slot?.cert?.attemptCount === "number" ? (
          // Attempt fields from the anonymous certificate lookup (LMS ≥ Sep
          // 2026) — available to every admin, no LMS role needed.
          <Typography variant="caption" color="text.secondary" display="block">
            {`attempts ${slot.cert.attemptCount}`}
            {slot.cert.attemptsToPass && slot.cert.attemptCount > 1
              ? ` · passed on attempt ${slot.cert.attemptsToPass}`
              : ""}
          </Typography>
        ) : null}
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

// Two decision axes, kept apart on purpose:
//   Review  — `status`      → header InlineStatusSelect + footer quick buttons
//   Roster  — `isSelected`  → footer RosterToggle pill (never a status chip)
const ApplicationReviewCard = ({
  application,
  applicationType,
  onStatusChange,
  onRosterChange,
  onEdit,
  pending = false,
  isLoading = false,
  trainingStatus,
  lmsAccess,
  onPlayVideo,
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleExpand = () => {
    setExpanded(!expanded);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(application);
    }
  };

  // Field lists come from the shared schema (one source for dialog, card,
  // table and search). Decision fields are not in these lists.
  const review = getReviewFields(applicationType);
  const typeTitle = `${applicationType.charAt(0).toUpperCase()}${applicationType.slice(1)} Application`;
  const onRoster = Boolean(application.isSelected);
  const currentStatus = normalizeStatus(application.status);
  const rosterHint = rosterReady(application)
    ? "Reviewed favorably but not on the roster — they won't see participant tools yet."
    : rosterConflict(application)
      ? "On the roster but the review is closed — remove them?"
      : null;

  // Helper function to format field values
  const formatFieldValue = (field, value) => {
    if (!value) return "Not provided";

    // Handle boolean fields with Yes/No
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    if (field === "inPerson") {
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

  // Labels come from the schema (aliases resolve to the canonical label).
  const getFieldLabel = (field) => schemaFieldLabel(applicationType, field);

  return (
    <Card
      sx={{
        mb: 2,
        // Tint = ON THE ROSTER (navy), not review status.
        border: onRoster ? "2px solid" : "1px solid",
        borderColor: onRoster ? "primary.main" : "divider",
        bgcolor: onRoster ? "rgba(27, 58, 107, 0.04)" : "background.paper",
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
                {typeTitle}
              </Typography>
              {/* LinkedIn + OHack profile quick-access chips */}
              <Box
                sx={{ display: "flex", gap: 0.5, mt: 0.5, flexWrap: "wrap" }}
              >
                {(() => {
                  const liUrl = linkedinUrlOf(application);
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
            {/* Review axis: application status, inline for every type */}
            <InlineStatusSelect
              value={application.status}
              onChange={(next) => onStatusChange?.(application, next)}
              pending={pending}
              disabled={isLoading || !onStatusChange}
            />
            <IconButton onClick={handleExpand} size="small">
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>

        {/* Primary information (always visible) */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {review.primary.map((fld) => {
            const field = fld.key;
            const value = readFieldValue(application, fld);
            if (isBlankValue(value)) return null;

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
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {getFieldLabel(field)}
                    </Typography>
                    <Typography variant="body1">
                      {renderField(field, value)}
                    </Typography>
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
              {review.secondary.slice(0, 6).map((fld) => {
                const field = fld.key;
                const value = readFieldValue(application, fld);
                if (isBlankValue(value)) return null;

                const isLink = Boolean(fld.isLink) || LINK_FIELDS.includes(field);

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
            {review.secondary.map((fld) => {
              const field = fld.key;
              const value = readFieldValue(application, fld);
              if (isBlankValue(value)) return null;

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
                    {renderField(field, value, Boolean(fld.isLink) || LINK_FIELDS.includes(field))}
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
              {review.additional.map((fld) => {
                const field = fld.key;
                const value = readFieldValue(application, fld);
                if (isBlankValue(value)) return null;

                const isLink = Boolean(fld.isLink) || LINK_FIELDS.includes(field);

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
            // Every key the card (or JudgeTrainingPanel) already accounts
            // for, incl. aliases/mirrors, system, decision and hidden keys.
            const alreadyRendered = getRenderedKeys(applicationType);
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

      {/* Footer: [Edit] · review quick actions · │ · roster pill */}
      <CardActions
        sx={{
          p: 2,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          gap: 1.5,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={handleEdit}
          disabled={isLoading}
          size="small"
        >
          Edit details
        </Button>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", flex: 1 }}>
          <Button
            variant="contained"
            color="success"
            size="small"
            startIcon={<CheckIcon />}
            onClick={() => onStatusChange?.(application, "approved")}
            disabled={isLoading || pending || !onStatusChange || currentStatus === "approved"}
          >
            Approve
          </Button>
          <Button
            variant="outlined"
            color="warning"
            size="small"
            startIcon={<PlaylistAddIcon />}
            onClick={() => onStatusChange?.(application, "waitlisted")}
            disabled={isLoading || pending || !onStatusChange || currentStatus === "waitlisted"}
          >
            Waitlist
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<CloseIcon />}
            onClick={() => onStatusChange?.(application, "denied")}
            disabled={isLoading || pending || !onStatusChange || currentStatus === "denied"}
          >
            Deny
          </Button>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", sm: "block" } }} />

        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            border: 1,
            borderColor: onRoster ? "primary.main" : "divider",
            borderRadius: 1,
            px: 1,
            py: 0.25,
            alignSelf: { xs: "stretch", sm: "center" },
            justifyContent: { xs: "space-between", sm: "flex-start" },
          }}
        >
          <RosterToggle
            checked={onRoster}
            onChange={(on) => onRosterChange?.(application, on)}
            pending={pending}
            disabled={isLoading || !onRosterChange}
          />
          {rosterHint && (
            <Tooltip title={rosterHint}>
              <WarningAmberIcon color="warning" fontSize="small" />
            </Tooltip>
          )}
        </Box>
      </CardActions>
    </Card>
  );
};

export default ApplicationReviewCard;
