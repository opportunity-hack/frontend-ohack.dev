import React, { useState, useEffect, useCallback, useMemo } from "react";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import axios from "axios";
import {
  useAuthInfo,
  RequiredAuthProvider,
  RedirectToLogin,
} from "@propelauth/react";
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  ThemeProvider,
  Tooltip,
} from "@mui/material";

import { RefinedRoot, Eyebrow } from "../../../components/design/refined";
import TeamBreadcrumbs from "../../../components/Teams/TeamBreadcrumbs";
import {
  ApplicationLoadingPanel,
  NoApplicationPanel,
  AwaitingConfirmationPanel,
} from "../../../components/TeamDashboard/GatingPanels";
import {
  refinedFormTheme,
  refinedFieldSx,
  refinedChipSx,
} from "../../../components/ApplicationForm/refinedStyles";
import { useEnv } from "../../../context/env.context";

// ---------------------------------------------------------------- helpers
// Everything presentational is module-scope so the list doesn't remount on
// every keystroke in the search box (SectionBlock remount lesson).

const TEAM_STATUS_LABEL = {
  looking_for_members: "Looking for team members",
  want_to_be_matched: "Wants to be matched",
  already_have_team: "Already has a team",
};

const SLACK_WORKSPACE_URL = "https://opportunity-hack.slack.com";

// Portal surfaces (MUI Dialog) don't inherit RefinedRoot's CSS variables, so
// the dialog uses literal brand colors.
const NAVY = "#1B3A6B";
const NAVY_INK = "#0E2547";
const LINE = "#E7E1D4";
const SURFACE_2 = "#F4F1E9";
const MUTED = "#5B6270";

const fieldSx = { ...refinedFieldSx, mb: 0 };

function affiliationLine(person) {
  if (!person) return "";
  if (person.participantType === "Student") {
    return `Student at ${person.schoolOrganization || "school/university"}`;
  }
  if (person.participantType === "Professional") {
    return `Professional at ${person.schoolOrganization || "company/organization"}`;
  }
  return person.schoolOrganization || person.participantType || "";
}

// Applications that haven't been processed yet (e.g. the unconfirmed-
// application branch keeps the RAW doc) carry `skills`/`interests` as
// comma strings. Scoring against those used to throw `.filter is not a
// function` and blank the whole page behind the ErrorBoundary.
function asList(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) return value.split(/,\s*/);
  return [];
}

function firstName(name) {
  return name?.split(" ")[0] || "there";
}

function suggestedMessage(person, score, eventTitle) {
  return `Hi ${firstName(person?.name)}! I found your profile on the Opportunity Hack team finder and we seem to have a great match (compatibility score: ${score}%). I'm interested in collaborating for the ${eventTitle || "hackathon"}. Would you be open to chatting about potentially forming a team?`;
}

function Tag({ children, accent = false, title }) {
  return (
    <span
      className={`ohx-tag${accent ? " ohx-tag--accent" : ""}`}
      title={title}
    >
      {children}
    </span>
  );
}

// First `max` items as tags; items you share (`mine`) are accented; the rest
// collapse into "+N more" with the full list on hover/focus.
function TagList({ items, mine = [], max = 3, moreLabel = "more" }) {
  if (!Array.isArray(items) || items.length === 0) return null;
  const shown = items.slice(0, max);
  const rest = items.slice(max);
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
      {shown.map((item) => (
        <Tag
          key={item}
          accent={mine.includes(item)}
          title={mine.includes(item) ? "You share this" : undefined}
        >
          {item}
        </Tag>
      ))}
      {rest.length > 0 && (
        <Tooltip title={rest.join(" · ")} arrow>
          <span className="ohx-tag" tabIndex={0} style={{ cursor: "help" }}>
            +{rest.length} {moreLabel}
          </span>
        </Tooltip>
      )}
    </Box>
  );
}

function FieldLabel({ children }) {
  return (
    <Box
      sx={{
        fontSize: "0.72rem",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "var(--faint)",
        fontWeight: 600,
        mb: 0.75,
      }}
    >
      {children}
    </Box>
  );
}

function MatchTag({ score }) {
  return (
    <Tag
      accent={score >= 80}
      title="Based on shared causes, complementary skills, and what each of you is looking for"
    >
      {score}% match
    </Tag>
  );
}

function MyProfileCard({ myProfile, eventId, slackSignupUrl }) {
  const app = myProfile?.application;
  const prefs = app?.teamMatchingPreferences;
  const showPrefs =
    (app?.team_formation === "looking_for_members" ||
      app?.team_formation === "want_to_be_matched") &&
    prefs?.preferredSkills?.length > 0;
  return (
    <Box
      component="aside"
      className="ohx-card"
      aria-labelledby="findteam-profile-heading"
      sx={{
        p: { xs: 2.5, md: 3 },
        position: { md: "sticky" },
        top: { md: 88 },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
        <Avatar
          src={myProfile?.profile_image}
          alt=""
          sx={{
            width: 56,
            height: 56,
            bgcolor: "var(--surface-2)",
            color: "var(--brand)",
          }}
        >
          {myProfile?.name?.[0] || "?"}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Box className="ohx-eyebrow" id="findteam-profile-heading">
            Your profile
          </Box>
          <Box
            className="ohx-display"
            sx={{ fontSize: "1.25rem", lineHeight: 1.2, mt: 0.25 }}
          >
            {myProfile?.name || "You"}
          </Box>
          {myProfile?.github && (
            <Box sx={{ color: "var(--muted)", fontSize: "0.9rem" }}>
              GitHub: {myProfile.github}
            </Box>
          )}
        </Box>
      </Box>

      {app?.team_formation && (
        <Box sx={{ mb: 2 }}>
          <Tag accent={app.team_formation !== "already_have_team"}>
            {TEAM_STATUS_LABEL[app.team_formation] || "Team status unknown"}
          </Tag>
        </Box>
      )}

      {showPrefs && (
        <Box sx={{ mb: 2 }}>
          <FieldLabel>Teammate preferences</FieldLabel>
          <Box sx={{ fontSize: "0.92rem", color: "var(--muted)", mb: 0.75 }}>
            Preferred team size: {prefs.preferredSize || "not specified"}
          </Box>
          <Box sx={{ fontSize: "0.92rem", color: "var(--muted)", mb: 0.75 }}>
            Looking for teammates with:
          </Box>
          <TagList items={prefs.preferredSkills} max={6} />
          {app.teamNeededSkills && (
            <Box sx={{ fontSize: "0.92rem", color: "var(--muted)", mt: 1 }}>
              Also needed: {app.teamNeededSkills}
            </Box>
          )}
        </Box>
      )}

      {app?.background && (
        <Box sx={{ mb: 2 }}>
          <FieldLabel>Your background</FieldLabel>
          <Box sx={{ fontSize: "0.95rem", lineHeight: 1.55 }}>
            {app.background}
          </Box>
        </Box>
      )}

      <Box sx={{ mb: 2 }}>
        <FieldLabel>Your causes</FieldLabel>
        {app?.interests?.length ? (
          <TagList items={app.interests} max={8} />
        ) : (
          <Box sx={{ color: "var(--faint)", fontSize: "0.9rem" }}>
            None listed yet
          </Box>
        )}
      </Box>

      <Box sx={{ mb: 2.5 }}>
        <FieldLabel>Your skills</FieldLabel>
        {app?.skills?.length ? (
          <TagList items={app.skills} max={8} />
        ) : (
          <Box sx={{ color: "var(--faint)", fontSize: "0.9rem" }}>
            None listed yet
          </Box>
        )}
      </Box>

      <hr className="ohx-rule" style={{ margin: "0 0 16px" }} />

      <Box sx={{ display: "grid", gap: 1 }}>
        <NextLink
          href={`/hack/${eventId}/hacker-application`}
          className="ohx-btn ohx-btn--ghost"
          style={{ justifyContent: "center" }}
        >
          Edit your application
        </NextLink>
        <a
          href={slackSignupUrl || SLACK_WORKSPACE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="ohx-btn ohx-btn--ghost"
          style={{ justifyContent: "center" }}
        >
          Join Slack
        </a>
        <NextLink
          href={`/hack/${eventId}/manageteam`}
          className="ohx-link"
          style={{ textAlign: "center", fontSize: "0.92rem" }}
        >
          Already have teammates? Create your team →
        </NextLink>
      </Box>
    </Box>
  );
}

function TeammateCard({
  teammate,
  matchScore,
  myApp,
  isFavorite,
  onToggleFavorite,
  onContact,
}) {
  const app = teammate.application || {};
  const details = app.teamMatchingDetails || {};
  const hasPrefs =
    details.preferredSize ||
    details.teamNeededSkills ||
    details.preferredTeammateSkills?.length > 0;
  const background = app.background || "";
  return (
    <Box
      component="article"
      className="ohx-card"
      sx={{
        p: 2.5,
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        flex: 1,
      }}
    >
      <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
        <Avatar
          src={teammate.photoUrl || undefined}
          alt=""
          sx={{
            width: 48,
            height: 48,
            bgcolor: "var(--surface-2)",
            color: "var(--brand)",
          }}
        >
          {teammate.name?.[0] || "?"}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Box
            className="ohx-display"
            sx={{ fontSize: "1.15rem", lineHeight: 1.2 }}
          >
            {teammate.name || "Anonymous hacker"}
            {teammate.pronouns && (
              <span
                style={{
                  color: "var(--faint)",
                  fontSize: "0.85rem",
                  marginLeft: 6,
                  fontFamily: "var(--body)",
                }}
              >
                ({teammate.pronouns})
              </span>
            )}
          </Box>
          <Box sx={{ color: "var(--muted)", fontSize: "0.9rem" }}>
            {affiliationLine(teammate)}
          </Box>
        </Box>
        <MatchTag score={matchScore} />
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
        {app.team_formation && (
          <Tag>
            {TEAM_STATUS_LABEL[app.team_formation] || app.team_formation}
          </Tag>
        )}
        {teammate.experienceLevel && <Tag>{teammate.experienceLevel}</Tag>}
        <Tag>{teammate.inPerson ? "In person" : "Virtual"}</Tag>
        {teammate.willContinue && (
          <Tag title="Interested in continuing after the hackathon">
            Long-term
          </Tag>
        )}
      </Box>

      {background && (
        <Box
          sx={{
            fontSize: "0.95rem",
            lineHeight: 1.55,
            color: "var(--ink)",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
          title={background.length > 140 ? background : undefined}
        >
          {background}
        </Box>
      )}

      {hasPrefs && (
        <Box>
          <FieldLabel>Their team preferences</FieldLabel>
          <Box
            sx={{
              display: "grid",
              gap: 0.5,
              fontSize: "0.9rem",
              color: "var(--muted)",
            }}
          >
            {details.preferredSize && (
              <span>Prefers {details.preferredSize}</span>
            )}
            {details.teamNeededSkills && (
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={details.teamNeededSkills}
              >
                Seeking: {details.teamNeededSkills}
              </span>
            )}
          </Box>
          {details.preferredTeammateSkills?.length > 0 && (
            <Box sx={{ mt: 0.75 }}>
              <TagList
                items={details.preferredTeammateSkills}
                mine={myApp?.skills || []}
                max={2}
              />
            </Box>
          )}
        </Box>
      )}

      {app.interests?.length > 0 && (
        <Box>
          <FieldLabel>Causes</FieldLabel>
          <TagList items={app.interests} mine={myApp?.interests || []} />
        </Box>
      )}

      {app.skills?.length > 0 && (
        <Box>
          <FieldLabel>Skills</FieldLabel>
          <TagList items={app.skills} mine={myApp?.skills || []} />
        </Box>
      )}

      <Box
        sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: "auto", pt: 0.5 }}
      >
        <button
          type="button"
          className="ohx-btn ohx-btn--primary"
          onClick={onContact}
          style={{ fontSize: "0.9rem" }}
        >
          Reach out
        </button>
        <button
          type="button"
          className="ohx-btn ohx-btn--ghost"
          onClick={onToggleFavorite}
          aria-pressed={isFavorite}
          style={{ fontSize: "0.9rem" }}
        >
          {isFavorite ? "★ Favorited" : "☆ Favorite"}
        </button>
      </Box>
    </Box>
  );
}

function ContactDialog({
  open,
  onClose,
  person,
  myApp,
  matchScore,
  eventTitle,
  isFavorite,
  onToggleFavorite,
}) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  const details = person?.application?.teamMatchingDetails;
  const sharedInterests = (myApp?.interests || []).filter((i) =>
    person?.application?.interests?.includes(i),
  );
  const theyHaveSkillsIWant = (
    myApp?.teamMatchingDetails?.preferredTeammateSkills || []
  ).some((s) => person?.application?.skills?.includes(s));
  const iHaveSkillsTheyWant = (details?.preferredTeammateSkills || []).some(
    (s) => myApp?.skills?.includes(s),
  );
  const bothSameMode = person && person.inPerson === myApp?.inPerson;
  const bothContinue = person?.willContinue && myApp?.willContinue;
  const reasons = [
    sharedInterests.length > 0 &&
      `${sharedInterests.length} shared cause${sharedInterests.length === 1 ? "" : "s"}`,
    iHaveSkillsTheyWant && "You have skills they want",
    theyHaveSkillsIWant && "They have skills you want",
    bothSameMode && (person?.inPerson ? "Both in person" : "Both virtual"),
    bothContinue && "Both want to continue after the hackathon",
  ].filter(Boolean);

  const message = suggestedMessage(person, matchScore, eventTitle);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const pillSx = {
    bgcolor: SURFACE_2,
    border: `1px solid ${LINE}`,
    color: NAVY_INK,
    fontWeight: 500,
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        Reach out to {person?.name || "this hacker"}
      </DialogTitle>
      <DialogContent dividers>
        {person && (
          <>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}
            >
              <Avatar
                src={person.photoUrl || undefined}
                alt=""
                sx={{ width: 52, height: 52 }}
              >
                {person.name?.[0] || "?"}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Box sx={{ fontWeight: 600 }}>{person.name}</Box>
                <Box sx={{ color: MUTED, fontSize: "0.9rem" }}>
                  {affiliationLine(person)}
                  {person.experienceLevel ? ` · ${person.experienceLevel}` : ""}
                </Box>
                {person.github && (
                  <Box sx={{ color: MUTED, fontSize: "0.9rem" }}>
                    GitHub: {person.github}
                  </Box>
                )}
              </Box>
              <Chip
                label={`${matchScore}% match`}
                size="small"
                sx={{ ml: "auto", ...pillSx, fontWeight: 700 }}
              />
            </Box>

            {reasons.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    fontSize: "0.8rem",
                    color: MUTED,
                    mb: 0.75,
                    fontWeight: 600,
                  }}
                >
                  Why you match
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                  {reasons.map((r) => (
                    <Chip key={r} label={r} size="small" sx={pillSx} />
                  ))}
                </Box>
              </Box>
            )}

            {details &&
              (details.preferredSize ||
                details.teamNeededSkills ||
                details.preferredTeammateSkills?.length > 0 ||
                details.preferredCauses?.length > 0) && (
                <Box
                  sx={{
                    mb: 2,
                    fontSize: "0.92rem",
                    color: MUTED,
                    display: "grid",
                    gap: 0.5,
                  }}
                >
                  <Box sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                    Their team preferences
                  </Box>
                  {details.preferredSize && (
                    <span>Preferred team size: {details.preferredSize}</span>
                  )}
                  {details.teamNeededSkills && (
                    <span>Looking for: {details.teamNeededSkills}</span>
                  )}
                  {details.preferredTeammateSkills?.length > 0 && (
                    <span>
                      Teammate skills:{" "}
                      {details.preferredTeammateSkills.join(", ")}
                    </span>
                  )}
                  {details.preferredCauses?.length > 0 && (
                    <span>Causes: {details.preferredCauses.join(", ")}</span>
                  )}
                </Box>
              )}

            <Box sx={{ fontSize: "0.92rem", color: MUTED, mb: 2 }}>
              Everyone at Opportunity Hack is in our Slack workspace — find{" "}
              {firstName(person.name)} there and say hello.
            </Box>

            <Box
              sx={{
                fontSize: "0.8rem",
                color: MUTED,
                mb: 0.75,
                fontWeight: 600,
              }}
            >
              Suggested message
            </Box>
            <Box
              sx={{
                bgcolor: SURFACE_2,
                border: `1px solid ${LINE}`,
                borderRadius: 1.5,
                p: 1.5,
                fontSize: "0.92rem",
                lineHeight: 1.55,
                mb: 1,
              }}
            >
              {message}
            </Box>
            <Button
              size="small"
              onClick={copy}
              sx={{ color: NAVY, textTransform: "none" }}
            >
              {copied ? "Copied ✓" : "Copy message"}
            </Button>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1, flexWrap: "wrap" }}>
        <Button onClick={onClose} sx={{ color: MUTED, textTransform: "none" }}>
          Close
        </Button>
        {person && (
          <Button
            onClick={() => {
              onToggleFavorite(person.user_id);
              onClose();
            }}
            variant="outlined"
            sx={{ textTransform: "none", color: NAVY, borderColor: LINE }}
          >
            {isFavorite ? "Remove from favorites" : "Add to favorites"}
          </Button>
        )}
        <Button
          component="a"
          href={SLACK_WORKSPACE_URL}
          target="_blank"
          rel="noopener noreferrer"
          variant="contained"
          disableElevation
          sx={{
            textTransform: "none",
            bgcolor: NAVY,
            "&:hover": { bgcolor: NAVY_INK },
          }}
        >
          Open Slack
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ----------------------------------------------------------- main component
const FindTeamPage = () => {
  // Authentication and routing
  const { user, accessToken, userClass } = useAuthInfo();
  const router = useRouter();
  const { event_id } = router.query;
  const { slackSignupUrl } = useEnv();

  // State variables
  const [loading, setLoading] = useState(true);
  const [isCheckingApplication, setIsCheckingApplication] = useState(true);
  const [myProfile, setMyProfile] = useState(null);
  const [potentialTeammates, setPotentialTeammates] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);
  const [error, setError] = useState("");
  const [allInterests, setAllInterests] = useState([]);
  const [allSkills, setAllSkills] = useState([]);

  // Organization data for API calls
  const org = userClass.getOrgByName("Opportunity Hack Org");
  const orgId = org?.orgId;

  // Fetch current user's profile and application data
  const fetchMyProfile = useCallback(async () => {
    try {
      setIsCheckingApplication(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/users/profile`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "X-Org-Id": orgId,
          },
        },
      );

      if (response.data) {
        // Fetch my hacker application for this event
        const applicationResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/hacker/application/${event_id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
              "X-Org-Id": orgId,
            },
          },
        );

        if (applicationResponse.data) {
          // Process the application data to extract interests and skills
          const appData = applicationResponse.data.data;

          // If the application has not yet been confirmed, render the
          // dedicated pending-confirmation panel below instead of an error.
          // isSelected === false covers both "still under review" and
          // "not selected after review" — don't prejudge here.
          if (appData.isSelected === false) {
            setMyProfile({
              ...response.data,
              application: appData,
            });
            setIsCheckingApplication(false);
            return;
          }

          // Parse interests from social causes and preferred causes
          const interests = [];
          if (appData.socialCauses) {
            interests.push(...appData.socialCauses.split(/,\s*/));
          }
          if (appData.teamMatchingPreferences?.preferredCauses) {
            interests.push(...appData.teamMatchingPreferences.preferredCauses);
          } else if (appData.teamMatchingPreferredCauses) {
            interests.push(
              ...appData.teamMatchingPreferredCauses.split(/,\s*/),
            );
          }

          // Parse skills from primary roles and skills
          const skills = [];
          if (appData.primaryRoles) {
            skills.push(...appData.primaryRoles.split(/,\s*/));
          }
          if (appData.skills) {
            skills.push(...appData.skills.split(/,\s*/));
          }
          if (appData.teamMatchingPreferences?.preferredSkills) {
            skills.push(...appData.teamMatchingPreferences.preferredSkills);
          } else if (appData.teamMatchingPreferredSkills) {
            skills.push(...appData.teamMatchingPreferredSkills.split(/,\s*/));
          }

          // Get team formation status
          let teamFormation = "want_to_be_matched";
          if (appData.teamStatus) {
            if (appData.teamStatus.includes("looking for")) {
              teamFormation = "looking_for_members";
            } else if (appData.teamStatus.includes("already have")) {
              teamFormation = "already_have_team";
            }
          }

          // Create processed application object
          const processedApp = {
            ...appData,
            interests: [...new Set(interests)], // Remove duplicates
            skills: [...new Set(skills)], // Remove duplicates
            background: appData.shortBio || appData.bio,
            team_formation: teamFormation,
          };

          setMyProfile({
            ...response.data,
            application: processedApp,
          });
        } else {
          // No application yet — the dedicated panel below renders the
          // submit-application CTA.
          setMyProfile(response.data);
        }
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to fetch your profile. Please try again later.");
    } finally {
      setIsCheckingApplication(false);
    }
  }, [accessToken, orgId, event_id]);

  // Fetch event details
  const fetchEventDetails = useCallback(async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${event_id}`,
      );
      if (response.data) {
        setEventDetails(response.data);
      }
    } catch (err) {
      console.error("Error fetching event details:", err);
      setError("Failed to fetch event details.");
    }
  }, [event_id]);

  // Fetch all hackers for the event
  const fetchPotentialTeammates = useCallback(async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/hacker/applications/${event_id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "X-Org-Id": orgId,
          },
        },
      );

      if (response.data.data && Array.isArray(response.data.data)) {
        // Process each hacker's application data
        const processedHackers = response.data.data.map((appData) => {
          // Parse interests from social causes and preferred causes
          const interests = [];
          if (appData.socialCauses) {
            interests.push(...appData.socialCauses.split(/,\s*/));
          }
          if (appData.teamMatchingPreferences?.preferredCauses) {
            interests.push(...appData.teamMatchingPreferences.preferredCauses);
          } else if (appData.teamMatchingPreferredCauses) {
            interests.push(
              ...appData.teamMatchingPreferredCauses.split(/,\s*/),
            );
          }

          // Parse skills from primary roles and skills
          const skills = [];
          if (appData.primaryRoles) {
            skills.push(...appData.primaryRoles.split(/,\s*/));
          }
          if (appData.skills) {
            skills.push(...appData.skills.split(/,\s*/));
          }
          if (appData.teamMatchingPreferences?.preferredSkills) {
            skills.push(...appData.teamMatchingPreferences.preferredSkills);
          } else if (appData.teamMatchingPreferredSkills) {
            skills.push(...appData.teamMatchingPreferredSkills.split(/,\s*/));
          }

          // Get team formation status
          let teamFormation = "want_to_be_matched";
          if (appData.teamStatus) {
            if (appData.teamStatus.includes("looking for")) {
              teamFormation = "looking_for_members";
            } else if (appData.teamStatus.includes("already have")) {
              teamFormation = "already_have_team";
            }
          }

          // Parse preferred team size
          let preferredSize = "";
          if (appData.teamMatchingPreferences?.preferredSize) {
            preferredSize = appData.teamMatchingPreferences.preferredSize;
          } else if (appData.teamMatchingPreferredSize) {
            preferredSize = appData.teamMatchingPreferredSize;
          }

          // Parse preferred skills for teammates
          const preferredTeammateSkills = [];
          if (appData.teamMatchingPreferences?.preferredSkills) {
            preferredTeammateSkills.push(
              ...appData.teamMatchingPreferences.preferredSkills,
            );
          } else if (appData.teamMatchingPreferredSkills) {
            preferredTeammateSkills.push(
              ...appData.teamMatchingPreferredSkills.split(/,\s*/),
            );
          }

          // Parse preferred causes for the team
          const preferredCauses = [];
          if (appData.teamMatchingPreferences?.preferredCauses) {
            preferredCauses.push(
              ...appData.teamMatchingPreferences.preferredCauses,
            );
          } else if (appData.teamMatchingPreferredCauses) {
            preferredCauses.push(
              ...appData.teamMatchingPreferredCauses.split(/,\s*/),
            );
          }

          return {
            user_id: appData.user_id,
            name: appData.name,
            github: appData.github,
            slack_user_id: appData.slack_user_id,
            pronouns: appData.pronouns,
            experienceLevel: appData.experienceLevel,
            participationCount: appData.participationCount,
            participantType: appData.participantType,
            schoolOrganization: appData.schoolOrganization,
            linkedin: appData.linkedin || appData.linkedinProfile,
            photoUrl: appData.photoUrl || null,
            portfolio: appData.portfolio,
            willContinue: appData.willContinue,
            inPerson: appData.inPerson === "Yes" || appData.isInPerson,
            application: {
              ...appData,
              interests: [...new Set(interests)], // Remove duplicates
              skills: [...new Set(skills)], // Remove duplicates
              background: appData.shortBio || appData.bio,
              team_formation: teamFormation,
              teamMatchingDetails: {
                preferredSize,
                teamNeededSkills: appData.teamNeededSkills || "",
                preferredTeammateSkills: [...new Set(preferredTeammateSkills)],
                preferredCauses: [...new Set(preferredCauses)],
              },
            },
          };
        });

        // Only show users who are selected, looking for a team or want to be matched
        const lookingForTeamHackers = processedHackers.filter(
          (hacker) =>
            hacker.application.isSelected === true && // Only show selected users
            hacker.application.teamStatus &&
            (hacker.application.teamStatus.includes("match") ||
              hacker.application.teamStatus.includes("looking for")) &&
            hacker.user_id !== user?.userId, // Don't show the current user
        );

        setPotentialTeammates(lookingForTeamHackers);
        setFiltered(lookingForTeamHackers);

        // Extract all unique interests and skills
        const interests = new Set();
        const skills = new Set();

        lookingForTeamHackers.forEach((hacker) => {
          if (hacker.application) {
            hacker.application.interests?.forEach((interest) =>
              interests.add(interest),
            );
            hacker.application.skills?.forEach((skill) => skills.add(skill));
          }
        });

        setAllInterests(Array.from(interests).sort());
        setAllSkills(Array.from(skills).sort());
      }
    } catch (err) {
      console.error("Error fetching hackers:", err);
      setError("Failed to fetch potential teammates. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, orgId, event_id, user?.userId]);

  // Load data on component mount
  useEffect(() => {
    if (accessToken && event_id) {
      setLoading(true);
      Promise.all([
        fetchMyProfile(),
        fetchEventDetails(),
        fetchPotentialTeammates(),
      ]).finally(() => {
        setLoading(false);
      });
    }
  }, [
    accessToken,
    event_id,
    fetchMyProfile,
    fetchEventDetails,
    fetchPotentialTeammates,
  ]);

  // Load saved favorites from localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && event_id) {
      const savedFavorites = localStorage.getItem(`favorites_${event_id}`);
      if (savedFavorites) {
        try {
          setFavorites(JSON.parse(savedFavorites));
        } catch (e) {
          console.error("Error parsing saved favorites", e);
        }
      }
      setFavoritesLoaded(true);
    }
  }, [event_id]);

  // Save favorites to localStorage — including an empty list, so un-starring
  // your last favorite doesn't resurrect it on the next visit.
  useEffect(() => {
    if (favoritesLoaded && typeof window !== "undefined" && event_id) {
      localStorage.setItem(`favorites_${event_id}`, JSON.stringify(favorites));
    }
  }, [favorites, favoritesLoaded, event_id]);

  // Calculate match score between two users
  const calculateMatchScore = useCallback(
    (otherUser) => {
      if (!myProfile?.application || !otherUser.application) return 0;

      let score = 0;
      const myInterests = asList(myProfile.application.interests);
      const mySkills = asList(myProfile.application.skills);
      const otherInterests = asList(otherUser.application.interests);
      const otherSkills = asList(otherUser.application.skills);

      // Match interests (higher weight)
      const commonInterests = myInterests.filter((i) =>
        otherInterests.includes(i),
      );
      score += (commonInterests.length / Math.max(myInterests.length, 1)) * 40;

      // Match complementary skills
      const myUniqueSkills = mySkills.filter((s) => !otherSkills.includes(s));
      const otherUniqueSkills = otherSkills.filter(
        (s) => !mySkills.includes(s),
      );

      // Skill complementarity (medium weight)
      score +=
        ((myUniqueSkills.length + otherUniqueSkills.length) /
          Math.max(mySkills.length + otherSkills.length, 1)) *
        30;

      // Check if other user has skills I'm looking for in teammates
      const preferredTeammateSkills = asList(
        myProfile.application.teamMatchingDetails?.preferredTeammateSkills,
      );
      if (preferredTeammateSkills.length > 0) {
        const matchingPreferredSkills = preferredTeammateSkills.filter((s) =>
          otherSkills.includes(s),
        );
        score +=
          (matchingPreferredSkills.length / preferredTeammateSkills.length) *
          20;
      }

      // Check if I have skills they're looking for in teammates
      const theirPreferredSkills = asList(
        otherUser.application.teamMatchingDetails?.preferredTeammateSkills,
      );
      if (theirPreferredSkills.length > 0) {
        const matchingTheirPreferences = theirPreferredSkills.filter((s) =>
          mySkills.includes(s),
        );
        score +=
          (matchingTheirPreferences.length / theirPreferredSkills.length) * 10;
      }

      // Cap at 100
      return Math.min(Math.round(score), 100);
    },
    [myProfile],
  );

  // Filter teammates based on search and filters
  const filterTeammates = useCallback(() => {
    if (!potentialTeammates.length) return;

    let result = [...potentialTeammates];

    // Text search
    if (searchValue) {
      const lowerSearch = searchValue.toLowerCase();
      result = result.filter(
        (mate) =>
          mate.name?.toLowerCase().includes(lowerSearch) ||
          mate.github?.toLowerCase().includes(lowerSearch) ||
          mate.application?.background?.toLowerCase().includes(lowerSearch) ||
          mate.application?.interests?.some((i) =>
            i.toLowerCase().includes(lowerSearch),
          ) ||
          mate.application?.skills?.some((s) =>
            s.toLowerCase().includes(lowerSearch),
          ),
      );
    }

    // Interest filters
    if (selectedInterests.length > 0) {
      result = result.filter((mate) =>
        selectedInterests.every((interest) =>
          mate.application?.interests?.includes(interest),
        ),
      );
    }

    // Skill filters
    if (selectedSkills.length > 0) {
      result = result.filter((mate) =>
        selectedSkills.some((skill) =>
          mate.application?.skills?.includes(skill),
        ),
      );
    }

    // Only show users who are selected and looking for a team or to be matched
    result = result.filter(
      (mate) =>
        mate.application?.isSelected === true && // Only selected users
        (mate.application?.team_formation === "looking_for_members" ||
          mate.application?.team_formation === "want_to_be_matched"),
    );

    // Don't show self
    result = result.filter((mate) => mate.user_id !== user?.userId);

    // Sort by match score
    result.sort((a, b) => calculateMatchScore(b) - calculateMatchScore(a));

    setFiltered(result);
  }, [
    potentialTeammates,
    searchValue,
    selectedInterests,
    selectedSkills,
    calculateMatchScore,
    user?.userId,
  ]);

  // Apply filters when dependencies change
  useEffect(() => {
    filterTeammates();
  }, [
    filterTeammates,
    potentialTeammates,
    searchValue,
    selectedInterests,
    selectedSkills,
  ]);

  // Handle adding/removing favorites
  const toggleFavorite = (userId) => {
    setFavorites((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  // Open contact dialog
  const handleContactClick = (person) => {
    setSelectedUser(person);
    setContactDialogOpen(true);
  };

  // Filtered list based on active tab
  const currentList =
    selectedTab === 1
      ? filtered.filter((mate) => favorites.includes(mate.user_id))
      : filtered;

  // Don't strand someone on an empty Favorites view after they un-star the
  // last one.
  useEffect(() => {
    if (selectedTab === 1 && favorites.length === 0) setSelectedTab(0);
  }, [favorites.length, selectedTab]);

  // Navigate to team creation
  const createTeamWithFavorites = () => {
    const favoriteUsers = potentialTeammates.filter((mate) =>
      favorites.includes(mate.user_id),
    );
    // Store in session storage to pre-fill the team creation form
    sessionStorage.setItem("team_members", JSON.stringify(favoriteUsers));
    router.push(`/hack/${event_id}/manageteam`);
  };

  const hasActiveFilters =
    Boolean(searchValue) ||
    selectedInterests.length > 0 ||
    selectedSkills.length > 0;
  const clearFilters = () => {
    setSearchValue("");
    setSelectedInterests([]);
    setSelectedSkills([]);
  };

  const eventTitle = eventDetails?.title;
  const unlocked =
    !isCheckingApplication &&
    myProfile?.application &&
    myProfile.application.isSelected !== false;
  const scoreById = useMemo(() => {
    const map = {};
    filtered.forEach((mate) => {
      map[mate.user_id] = calculateMatchScore(mate);
    });
    return map;
  }, [filtered, calculateMatchScore]);

  if (!user) {
    return (
      <RefinedRoot>
        <Box sx={{ display: "flex", justifyContent: "center", pt: 20 }}>
          <CircularProgress sx={{ color: "var(--brand)" }} />
        </Box>
      </RefinedRoot>
    );
  }

  return (
    <RefinedRoot>
      <Box
        className="ohx-wrap"
        sx={{ pt: "clamp(88px, 9vh, 108px)", pb: { xs: 8, md: 10 } }}
      >
        <TeamBreadcrumbs
          items={[
            {
              name: eventTitle || event_id || "Event",
              href: `/hack/${event_id}`,
            },
          ]}
          current="Find teammates"
        />

        {/* Masthead */}
        <Box component="header" className="rise" sx={{ mb: { xs: 3, md: 4 } }}>
          <Eyebrow>{eventTitle ? `${eventTitle} · ` : ""}Team finder</Eyebrow>
          <Box
            component="h1"
            className="ohx-display"
            sx={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)", m: 0, mt: 1.5 }}
          >
            Find your <span className="ohx-italic">teammates.</span>
          </Box>
          <p className="ohx-lead" style={{ marginTop: 14, maxWidth: "60ch" }}>
            Hackers who are still looking, ranked by how well your causes and
            skills line up. Star the people you&apos;d build with, then create
            your team in one click.
          </p>
          <hr className="ohx-rule" style={{ marginTop: 20 }} />
        </Box>

        {error && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Gating — shared with /manageteam so the two never drift */}
        {isCheckingApplication && (
          <ApplicationLoadingPanel eventTitle={eventTitle} />
        )}
        {!isCheckingApplication && !myProfile?.application && (
          <NoApplicationPanel
            eventId={event_id}
            eventTitle={eventTitle}
            title="Apply first to use the Team Finder"
            feature="The Team Finder"
          />
        )}
        {!isCheckingApplication &&
          myProfile?.application &&
          myProfile.application.isSelected === false && (
            <AwaitingConfirmationPanel
              eventTitle={eventTitle}
              feature="the Team Finder"
            />
          )}

        {unlocked && (
          <>
            {favorites.length > 0 && (
              <Box
                className="ohx-card"
                role="status"
                sx={{
                  p: { xs: 2, md: 2.5 },
                  mb: 3,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  flexWrap: "wrap",
                  borderLeft: "3px solid var(--accent)",
                }}
              >
                <Box sx={{ flex: 1, minWidth: 220 }}>
                  <Box className="ohx-eyebrow">Ready when you are</Box>
                  <Box sx={{ mt: 0.5 }}>
                    {favorites.length} favorite{" "}
                    {favorites.length === 1 ? "teammate" : "teammates"} starred.
                    We&apos;ll pre-fill them on the team form.
                  </Box>
                </Box>
                <button
                  type="button"
                  className="ohx-btn ohx-btn--primary"
                  onClick={createTeamWithFavorites}
                >
                  Create a team with your favorites →
                </button>
              </Box>
            )}

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "minmax(260px, 1fr) 2fr",
                },
                gap: { xs: 3, md: 4 },
                alignItems: "start",
              }}
            >
              {loading ? (
                <Box
                  className="ohx-card"
                  sx={{ p: 4, textAlign: "center", minHeight: 320 }}
                >
                  <CircularProgress sx={{ color: "var(--brand)" }} />
                </Box>
              ) : (
                <MyProfileCard
                  myProfile={myProfile}
                  eventId={event_id}
                  slackSignupUrl={slackSignupUrl}
                />
              )}

              <Box component="section" aria-labelledby="findteam-list-heading">
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 2,
                    flexWrap: "wrap",
                    mb: 2,
                  }}
                >
                  <h2
                    id="findteam-list-heading"
                    className="ohx-display"
                    style={{ fontSize: "1.5rem", margin: 0 }}
                  >
                    Potential teammates
                  </h2>
                  <Box
                    role="group"
                    aria-label="Show"
                    sx={{ display: "flex", gap: 0.75, ml: "auto" }}
                  >
                    <button
                      type="button"
                      className={`ohx-tag${selectedTab === 0 ? " ohx-tag--accent" : ""}`}
                      aria-pressed={selectedTab === 0}
                      onClick={() => setSelectedTab(0)}
                      style={{ cursor: "pointer", font: "inherit" }}
                    >
                      All ({filtered.length})
                    </button>
                    <button
                      type="button"
                      className={`ohx-tag${selectedTab === 1 ? " ohx-tag--accent" : ""}`}
                      aria-pressed={selectedTab === 1}
                      onClick={() => setSelectedTab(1)}
                      disabled={favorites.length === 0}
                      style={{
                        cursor: favorites.length === 0 ? "default" : "pointer",
                        opacity: favorites.length === 0 ? 0.5 : 1,
                        font: "inherit",
                      }}
                    >
                      ★ Favorites ({favorites.length})
                    </button>
                  </Box>
                </Box>

                {/* Search + filters */}
                <ThemeProvider theme={refinedFormTheme}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1.3fr 1fr 1fr" },
                      gap: 1.5,
                      mb: 2,
                    }}
                  >
                    <TextField
                      size="small"
                      placeholder="Search name, skill, or cause…"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      inputProps={{ "aria-label": "Search teammates" }}
                      sx={fieldSx}
                    />
                    <Autocomplete
                      multiple
                      size="small"
                      options={allInterests}
                      value={selectedInterests}
                      onChange={(e, v) => setSelectedInterests(v)}
                      slotProps={{ chip: { size: "small", sx: refinedChipSx } }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Causes"
                          sx={fieldSx}
                        />
                      )}
                    />
                    <Autocomplete
                      multiple
                      size="small"
                      options={allSkills}
                      value={selectedSkills}
                      onChange={(e, v) => setSelectedSkills(v)}
                      slotProps={{ chip: { size: "small", sx: refinedChipSx } }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Skills"
                          sx={fieldSx}
                        />
                      )}
                    />
                  </Box>
                </ThemeProvider>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 2,
                    color: "var(--muted)",
                    fontSize: "0.9rem",
                  }}
                  aria-live="polite"
                >
                  {loading
                    ? "Loading hackers…"
                    : `${currentList.length} ${currentList.length === 1 ? "hacker" : "hackers"}${
                        selectedTab === 1 ? " starred" : " still looking"
                      }${hasActiveFilters ? " match your filters" : ""}`}
                  {hasActiveFilters && (
                    <button
                      type="button"
                      className="ohx-link"
                      onClick={clearFilters}
                      style={{
                        background: "none",
                        border: 0,
                        padding: 0,
                        cursor: "pointer",
                        font: "inherit",
                      }}
                    >
                      Clear filters
                    </button>
                  )}
                </Box>

                {loading ? (
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
                      gap: 2,
                    }}
                  >
                    {[0, 1, 2, 3].map((i) => (
                      <Box
                        key={i}
                        className="ohx-card"
                        sx={{ minHeight: 260 }}
                      />
                    ))}
                  </Box>
                ) : currentList.length === 0 ? (
                  <Box
                    className="ohx-card"
                    sx={{ p: 4, textAlign: "center", color: "var(--muted)" }}
                  >
                    {selectedTab === 1 ? (
                      "You haven't starred anyone yet."
                    ) : hasActiveFilters ? (
                      <>
                        No one matches those filters yet.{" "}
                        <button
                          type="button"
                          className="ohx-link"
                          onClick={clearFilters}
                          style={{
                            background: "none",
                            border: 0,
                            padding: 0,
                            cursor: "pointer",
                            font: "inherit",
                          }}
                        >
                          Clear them
                        </button>{" "}
                        to see everyone.
                      </>
                    ) : (
                      "No one is looking for a team right now — check back as more hackers are confirmed."
                    )}
                  </Box>
                ) : (
                  <Box
                    component="ul"
                    sx={{
                      listStyle: "none",
                      m: 0,
                      p: 0,
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
                      gap: 2,
                    }}
                  >
                    {currentList.map((teammate) => (
                      <Box
                        component="li"
                        key={teammate.user_id}
                        sx={{ display: "flex" }}
                      >
                        <TeammateCard
                          teammate={teammate}
                          matchScore={scoreById[teammate.user_id] ?? 0}
                          myApp={myProfile?.application}
                          isFavorite={favorites.includes(teammate.user_id)}
                          onToggleFavorite={() =>
                            toggleFavorite(teammate.user_id)
                          }
                          onContact={() => handleContactClick(teammate)}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          </>
        )}

        <ContactDialog
          open={contactDialogOpen}
          onClose={() => setContactDialogOpen(false)}
          person={selectedUser}
          myApp={myProfile?.application}
          matchScore={selectedUser ? calculateMatchScore(selectedUser) : 0}
          eventTitle={eventTitle}
          isFavorite={
            selectedUser ? favorites.includes(selectedUser.user_id) : false
          }
          onToggleFavorite={toggleFavorite}
        />
      </Box>
    </RefinedRoot>
  );
};

// Authenticated component that uses auth context
const AuthenticatedFindTeam = () => <FindTeamPage />;

// Export the component with RequiredAuthProvider. The <Head> sits OUTSIDE the
// auth gate so `noindex` is in the SSR'd shell crawlers actually see.
const FindTeam = () => {
  const router = useRouter();
  const { event_id } = router.query;

  // Create the current URL for redirection
  const currentUrl =
    typeof window !== "undefined" && event_id
      ? `${window.location.origin}/hack/${event_id}/findteam`
      : null;

  return (
    <>
      <Head>
        <title>Find teammates — Opportunity Hack</title>
        <meta
          name="description"
          content="Connect with potential teammates who share your causes and complement your skills at Opportunity Hack."
        />
        <meta name="robots" content="noindex,follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href={SLACK_WORKSPACE_URL} />
      </Head>
      <RequiredAuthProvider
        authUrl={process.env.NEXT_PUBLIC_REACT_APP_AUTH_URL}
        displayIfLoggedOut={
          <RedirectToLogin
            postLoginRedirectUrl={
              currentUrl ||
              (typeof window !== "undefined" ? window.location.href : undefined)
            }
          />
        }
      >
        <AuthenticatedFindTeam />
      </RequiredAuthProvider>
    </>
  );
};

export default FindTeam;
