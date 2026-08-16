import { FONT_DISPLAY } from "../../styles/fonts";
import React, { useMemo, useState } from "react";
import {
  Typography,
  Paper,
  useTheme,
  useMediaQuery,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Divider,
  Stack,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
  Avatar,
  Tooltip,
  Badge,
} from "@mui/material";
import { styled } from "@mui/system";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import PersonIcon from "@mui/icons-material/Person";
import ComputerIcon from "@mui/icons-material/Computer";
import GroupsIcon from "@mui/icons-material/Groups";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const MentorCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(1),
  "&:hover": {
    boxShadow: theme.shadows[2],
  },
}));

// Sticky first column for the matrix (keeps the date label visible on mobile scroll)
const DateHeadCell = styled(TableCell)(({ theme }) => ({
  position: "sticky",
  left: 0,
  zIndex: 2,
  backgroundColor: "var(--surface-2, #F4F1E9)",
  fontWeight: 700,
  fontSize: "0.7rem",
  padding: theme.spacing(0.75, 1),
  borderRight: `1px solid ${theme.palette.divider}`,
}));

const DateBodyCell = styled(TableCell)(({ theme }) => ({
  position: "sticky",
  left: 0,
  zIndex: 1,
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(0.5, 1),
  borderRight: `1px solid ${theme.palette.divider}`,
  minWidth: 120,
}));

// Heat-mapped availability cell — darker green = more mentors
const MatrixCell = styled(TableCell, {
  shouldForwardProp: (prop) => prop !== "count",
})(({ theme, count }) => {
  let backgroundColor = theme.palette.grey[50];
  let color = theme.palette.text.disabled;
  if (count > 0) {
    const intensity = Math.min(count, 5);
    backgroundColor = `rgba(27, 94, 32, ${0.1 + intensity * 0.13})`;
    color = intensity >= 3 ? "#fff" : theme.palette.success.dark;
  }
  return {
    textAlign: "center",
    fontWeight: 700,
    fontSize: "0.8rem",
    padding: theme.spacing(0.75, 0.5),
    backgroundColor,
    color,
    borderLeft: `1px solid ${theme.palette.divider}`,
    minWidth: 40,
  };
});

const MentorAvailability = ({ volunteers }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [expandedDates, setExpandedDates] = useState(new Set());
  const [showPastDates, setShowPastDates] = useState(false);
  const [compactView, setCompactView] = useState(true);

  // Helper function to extract expertise from volunteer data
  const extractExpertise = (volunteer) => {
    const expertise = [];

    // Check various fields for expertise information
    if (volunteer.skills)
      expertise.push(...volunteer.skills.split(",").map((s) => s.trim()));
    if (volunteer.expertise)
      expertise.push(...volunteer.expertise.split(",").map((s) => s.trim()));
    if (volunteer.technologies)
      expertise.push(...volunteer.technologies.split(",").map((s) => s.trim()));
    if (volunteer.programming_languages)
      expertise.push(
        ...volunteer.programming_languages.split(",").map((s) => s.trim()),
      );

    // Remove duplicates and empty strings
    return [...new Set(expertise.filter((e) => e && e.length > 0))];
  };

  // Helper function to get mentor initials for avatar
  const getMentorInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  // Helper function to check if a date is in the past
  const isPastDate = (dateString) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Parse various date formats
      let dateToCheck;
      if (dateString.includes(",")) {
        // Format: "Monday, Jan 15" or "Jan 15"
        const cleanDate = dateString.replace(/^\w+,\s*/, "");
        dateToCheck = new Date(cleanDate + ", " + today.getFullYear());
      } else {
        // Try direct parsing
        dateToCheck = new Date(dateString + ", " + today.getFullYear());
      }

      return dateToCheck < today;
    } catch (error) {
      return false; // If parsing fails, don't filter out
    }
  };

  const toggleDateExpansion = (date) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDates(newExpanded);
  };

  const availabilityData = useMemo(() => {
    // Group data by date
    const dateGroups = {};

    // Define time periods in order
    const timePeriods = [
      {
        emoji: "🌅",
        name: "Early Morning",
        key: "earlyMorning",
        short: "Early",
      },
      { emoji: "☀️", name: "Morning", key: "morning", short: "Morn" },
      { emoji: "🏙️", name: "Afternoon", key: "afternoon", short: "Aft" },
      { emoji: "🌆", name: "Evening", key: "evening", short: "Eve" },
      { emoji: "🌃", name: "Night", key: "night", short: "Night" },
      { emoji: "🌙", name: "Late Night", key: "lateNight", short: "Late" },
    ];

    // Process each volunteer
    volunteers.forEach((volunteer) => {
      if (volunteer.isSelected && volunteer.volunteer_type === "mentor") {
        if (volunteer?.availability) {
          const mentorId = volunteer.id || volunteer.email || volunteer.name;
          const mentorExpertise = extractExpertise(volunteer);
          const isCheckedIn = volunteer.checkedIn === true;
          const slots = [];
          let currentSlot = "";
          const parts = volunteer.availability.split(", ");

          for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const startsNewSlot =
              /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|\w+ \w+ \d+:|🌅|☀️|🏙️|🌆|🌃|🌙)/.test(
                part,
              );

            if (startsNewSlot && currentSlot) {
              slots.push(currentSlot.trim());
              currentSlot = part;
            } else if (currentSlot) {
              currentSlot += ", " + part;
            } else {
              currentSlot = part;
            }
          }

          if (currentSlot) {
            slots.push(currentSlot.trim());
          }

          slots.forEach((slot) => {
            if (slot) {
              const hasTimeInfo =
                /🌅|☀️|🏙️|🌆|🌃|🌙/.test(slot) &&
                /(Early Morning|Morning|Afternoon|Evening|Night|Late Night)/.test(
                  slot,
                );

              if (hasTimeInfo) {
                // Extract date part (everything before the colon)
                const datePart = slot.split(":")[0]?.trim();

                // Extract time period
                const timePeriodMatch = slot.match(
                  /🌅\s+(Early Morning)|☀️\s+(Morning)|🏙️\s+(Afternoon)|🌆\s+(Evening)|🌃\s+(Night)|🌙\s+(Late Night)/,
                );
                const timePeriod = timePeriodMatch
                  ? timePeriodMatch[1] ||
                    timePeriodMatch[2] ||
                    timePeriodMatch[3] ||
                    timePeriodMatch[4] ||
                    timePeriodMatch[5] ||
                    timePeriodMatch[6]
                  : "";

                if (datePart && timePeriod) {
                  if (!dateGroups[datePart]) {
                    dateGroups[datePart] = {
                      uniqueMentors: new Set(),
                      mentorDetails: new Map(),
                    };
                    timePeriods.forEach((period) => {
                      dateGroups[datePart][period.key] = {
                        total: 0,
                        inPerson: 0,
                        remote: 0,
                        checkedIn: 0,
                        mentors: new Set(),
                        mentorList: [],
                        name: period.name,
                        emoji: period.emoji,
                        short: period.short,
                      };
                    });
                  }

                  // Add mentor to the day's unique mentors
                  dateGroups[datePart].uniqueMentors.add(mentorId);
                  dateGroups[datePart].mentorDetails.set(mentorId, {
                    name: volunteer.name,
                    isInPerson: volunteer.isInPerson,
                    expertise: mentorExpertise,
                    email: volunteer.email,
                    company: volunteer.company,
                    isCheckedIn: isCheckedIn,
                  });

                  // Map time period to key
                  const periodKey = timePeriods.find(
                    (p) => p.name === timePeriod,
                  )?.key;
                  if (periodKey && dateGroups[datePart][periodKey]) {
                    dateGroups[datePart][periodKey].total++;
                    dateGroups[datePart][periodKey].mentors.add(mentorId);
                    dateGroups[datePart][periodKey].mentorList.push({
                      id: mentorId,
                      name: volunteer.name,
                      isInPerson: volunteer.isInPerson,
                      expertise: mentorExpertise,
                      email: volunteer.email,
                      company: volunteer.company,
                      isCheckedIn: isCheckedIn,
                    });
                    if (volunteer.isInPerson) {
                      dateGroups[datePart][periodKey].inPerson++;
                    } else {
                      dateGroups[datePart][periodKey].remote++;
                    }
                    if (isCheckedIn) {
                      dateGroups[datePart][periodKey].checkedIn++;
                    }
                  }
                }
              }
            }
          });
        }
      }
    });

    // Sort dates
    const sortedDates = Object.keys(dateGroups).sort((a, b) => {
      const fullDayA = a.trim();
      const fullDayB = b.trim();

      let dayMatchA =
        fullDayA.match(/(\w+),\s+(\w+)\s+(\d+)/) ||
        fullDayA.match(/(\w+)\s+(\w+)\s+(\d+)/) ||
        fullDayA.match(/(\w+)\s+(\d+)/);

      let dayMatchB =
        fullDayB.match(/(\w+),\s+(\w+)\s+(\d+)/) ||
        fullDayB.match(/(\w+)\s+(\w+)\s+(\d+)/) ||
        fullDayB.match(/(\w+)\s+(\d+)/);

      if (dayMatchA && dayMatchB) {
        let monthA, monthB, dateA, dateB;

        if (dayMatchA.length === 4) {
          monthA = dayMatchA[2];
          dateA = parseInt(dayMatchA[3], 10);
        } else {
          monthA = dayMatchA[1];
          dateB = parseInt(dayMatchA[2], 10);
        }

        if (dayMatchB.length === 4) {
          monthB = dayMatchB[2];
          dateB = parseInt(dayMatchB[3], 10);
        } else {
          monthB = dayMatchB[1];
          dateB = parseInt(dayMatchB[2], 10);
        }

        const monthOrder = {
          Jan: 1,
          Feb: 2,
          Mar: 3,
          Apr: 4,
          May: 5,
          Jun: 6,
          Jul: 7,
          Aug: 8,
          Sep: 9,
          Oct: 10,
          Nov: 11,
          Dec: 12,
          January: 1,
          February: 2,
          March: 3,
          April: 4,
          June: 6,
          July: 7,
          August: 8,
          September: 9,
          October: 10,
          November: 11,
          December: 12,
        };

        const monthOrderA = monthOrder[monthA] || 0;
        const monthOrderB = monthOrder[monthB] || 0;

        if (monthOrderA !== monthOrderB) {
          return monthOrderA - monthOrderB;
        }

        if (!isNaN(dateA) && !isNaN(dateB) && dateA !== dateB) {
          return dateA - dateB;
        }
      }

      return a.localeCompare(b);
    });

    // Filter past dates unless explicitly shown
    const filteredDates = showPastDates
      ? sortedDates
      : sortedDates.filter((date) => !isPastDate(date));

    return { dateGroups, sortedDates: filteredDates, timePeriods };
  }, [volunteers, showPastDates]);

  const { dateGroups, sortedDates, timePeriods } = availabilityData;

  // Calculate total mentors across all slots
  const totalMentors = useMemo(() => {
    const uniqueMentors = new Set();
    volunteers.forEach((volunteer) => {
      if (
        volunteer.isSelected &&
        volunteer.volunteer_type === "mentor" &&
        volunteer?.availability
      ) {
        uniqueMentors.add(volunteer.id || volunteer.email || volunteer.name);
      }
    });
    return uniqueMentors.size;
  }, [volunteers]);

  // Mentor-centric roster: dedupe each mentor across the whole event and
  // collect WHICH days/periods they're available (date -> Set(periodKey)).
  const mentorRoster = useMemo(() => {
    const roster = new Map();
    sortedDates.forEach((date) => {
      const dayData = dateGroups[date];
      if (!dayData) return;
      timePeriods.forEach((period) => {
        const slot = dayData[period.key];
        slot.mentorList.forEach((m) => {
          if (!roster.has(m.id)) {
            roster.set(m.id, {
              id: m.id,
              name: m.name,
              isInPerson: m.isInPerson,
              expertise: m.expertise,
              company: m.company,
              isCheckedIn: m.isCheckedIn,
              availability: new Map(), // date -> Set(periodKey)
              slotCount: 0,
            });
          }
          const entry = roster.get(m.id);
          if (!entry.availability.has(date))
            entry.availability.set(date, new Set());
          entry.availability.get(date).add(period.key);
          entry.slotCount += 1;
        });
      });
    });
    // Sort: checked-in first, then in-person, then most available, then name.
    return Array.from(roster.values()).sort((a, b) => {
      if (a.isCheckedIn !== b.isCheckedIn) return a.isCheckedIn ? -1 : 1;
      if (a.isInPerson !== b.isInPerson) return a.isInPerson ? -1 : 1;
      if (b.slotCount !== a.slotCount) return b.slotCount - a.slotCount;
      return (a.name || "").localeCompare(b.name || "");
    });
  }, [dateGroups, sortedDates, timePeriods]);

  // Small emoji pill for a single time period (used in roster availability rows)
  const renderPeriodPill = (period, key) => (
    <Tooltip key={key} title={period.name} arrow>
      <Box
        component="span"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.25,
          px: 0.75,
          py: 0.25,
          borderRadius: "999px",
          backgroundColor: "var(--surface-2, #F4F1E9)",
          border: "1px solid var(--line, #E7E1D4)",
          fontSize: "0.65rem",
          lineHeight: 1.2,
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ fontSize: "0.8rem" }}>{period.emoji}</span>
        {!isMobile && <span>{period.short}</span>}
      </Box>
    </Tooltip>
  );

  const renderMentorRosterCard = (mentor) => (
    <MentorCard key={mentor.id} variant="outlined" sx={{ height: "100%" }}>
      <CardContent
        sx={{
          p: 1.5,
          "&:last-child": { pb: 1.5 },
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            badgeContent={
              mentor.isCheckedIn ? (
                <CheckCircleIcon
                  sx={{
                    color: theme.palette.success.main,
                    fontSize: "16px",
                    backgroundColor: "white",
                    borderRadius: "50%",
                  }}
                />
              ) : null
            }
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: mentor.isInPerson
                  ? theme.palette.primary.main
                  : theme.palette.secondary.main,
                fontSize: "1rem",
              }}
            >
              {getMentorInitials(mentor.name)}
            </Avatar>
          </Badge>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, lineHeight: 1.2 }}
            >
              {mentor.name}
            </Typography>
            {mentor.company && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block" }}
              >
                {mentor.company}
              </Typography>
            )}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}>
              <Chip
                icon={mentor.isInPerson ? <GroupsIcon /> : <ComputerIcon />}
                label={mentor.isInPerson ? "In-Person" : "Remote"}
                size="small"
                color={mentor.isInPerson ? "primary" : "secondary"}
                variant="outlined"
                sx={{ height: 20, fontSize: "0.65rem" }}
              />
              {mentor.isCheckedIn && (
                <Chip
                  icon={<CheckCircleIcon />}
                  label="Checked in"
                  size="small"
                  color="success"
                  variant="filled"
                  sx={{ height: 20, fontSize: "0.65rem" }}
                />
              )}
            </Box>
          </Box>
        </Box>

        {mentor.expertise && mentor.expertise.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
            {mentor.expertise.slice(0, isMobile ? 3 : 5).map((skill, idx) => (
              <Chip
                key={idx}
                label={skill}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: "0.65rem",
                  height: "20px",
                  "& .MuiChip-label": { px: 1 },
                }}
              />
            ))}
            {mentor.expertise.length > (isMobile ? 3 : 5) && (
              <Tooltip
                title={mentor.expertise.slice(isMobile ? 3 : 5).join(", ")}
                arrow
              >
                <Chip
                  label={`+${mentor.expertise.length - (isMobile ? 3 : 5)}`}
                  size="small"
                  variant="filled"
                  color="info"
                  sx={{
                    fontSize: "0.65rem",
                    height: "20px",
                    "& .MuiChip-label": { px: 1 },
                  }}
                />
              </Tooltip>
            )}
          </Box>
        )}

        <Divider sx={{ my: 1 }} />

        <Typography
          variant="overline"
          sx={{
            color: "text.secondary",
            lineHeight: 1.2,
            fontSize: "0.6rem",
            letterSpacing: "0.06em",
          }}
        >
          Available
        </Typography>
        <Stack spacing={0.5} sx={{ mt: 0.5 }}>
          {Array.from(mentor.availability.entries()).map(
            ([date, periodKeys]) => (
              <Box
                key={date}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  flexWrap: "wrap",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: "var(--ink, #16181D)",
                    minWidth: 88,
                  }}
                >
                  {date}
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {timePeriods
                    .filter((p) => periodKeys.has(p.key))
                    .map((p) => renderPeriodPill(p, `${date}-${p.key}`))}
                </Box>
              </Box>
            ),
          )}
        </Stack>
      </CardContent>
    </MentorCard>
  );

  return (
    <StyledPaper elevation={3}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 500,
            color: "var(--ink, #16181D)",
          }}
        >
          Mentor Availability
        </Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <FormControlLabel
            control={
              <Switch
                checked={compactView}
                onChange={(e) => setCompactView(e.target.checked)}
                size="small"
              />
            }
            label="Compact"
            sx={{ mr: 1 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={showPastDates}
                onChange={(e) => setShowPastDates(e.target.checked)}
                size="small"
              />
            }
            label="Show Past"
          />
        </Box>
      </Box>

      {totalMentors > 0 && (
        <Box
          sx={{
            mb: 2,
            p: 1.5,
            backgroundColor: "var(--surface-2, #F4F1E9)",
            border: "1px solid var(--line, #E7E1D4)",
            borderLeft: "3px solid var(--accent, #E2552E)",
            borderRadius: 2,
          }}
        >
          <Typography
            variant="body1"
            sx={{ color: "var(--ink, #16181D)", fontWeight: 600 }}
          >
            {totalMentors} total mentors available
          </Typography>
        </Box>
      )}

      <Box sx={{ textAlign: "center", mt: 2, mb: 2 }}>
        <Button
          variant="contained"
          disableElevation
          href="https://opportunity-hack.slack.com/archives/C01E5CGDQ74"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            padding: theme.spacing(1.1, 3),
            textTransform: "none",
            fontWeight: 600,
            borderRadius: "5px",
            backgroundColor: "var(--brand, #1B3A6B)",
            color: "#fff",
            boxShadow: "none",
            "&:hover": { backgroundColor: "#16315a", boxShadow: "none" },
          }}
        >
          Join #ask-a-mentor Slack
        </Button>
      </Box>

      {sortedDates.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 3 }}>
          <Typography variant="h6" color="text.secondary">
            {showPastDates
              ? "No mentor availability data yet"
              : "No upcoming mentor availability"}
          </Typography>
        </Box>
      ) : compactView ? (
        // Compact MATRIX: one table, dates as rows × time periods as columns.
        // Heat-mapped cells show unique mentors; click a row to reveal names.
        <>
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ borderColor: "var(--line, #E7E1D4)" }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <DateHeadCell>Date</DateHeadCell>
                  {timePeriods.map((period) => (
                    <TableCell
                      key={period.key}
                      align="center"
                      sx={{
                        p: 0.5,
                        fontWeight: 700,
                        fontSize: "0.65rem",
                        lineHeight: 1.1,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ fontSize: "1rem" }}>{period.emoji}</span>
                        <span>{isMobile ? period.short : period.name}</span>
                      </Box>
                    </TableCell>
                  ))}
                  <TableCell
                    align="center"
                    sx={{ p: 0.5, fontWeight: 700, fontSize: "0.65rem" }}
                  >
                    Mentors
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedDates.map((date) => {
                  const dayData = dateGroups[date];
                  const hasAnyAvailability = timePeriods.some(
                    (period) => dayData[period.key].total > 0,
                  );
                  if (!hasAnyAvailability) return null;

                  const isExpanded = expandedDates.has(date);
                  const uniqueMentorCount = dayData.uniqueMentors.size;
                  const checkedInCount = Array.from(
                    dayData.uniqueMentors,
                  ).filter(
                    (mentorId) =>
                      dayData.mentorDetails.get(mentorId)?.isCheckedIn,
                  ).length;
                  const isPast = isPastDate(date);

                  return (
                    <React.Fragment key={date}>
                      <TableRow
                        hover
                        onClick={() => toggleDateExpansion(date)}
                        sx={{ cursor: "pointer", opacity: isPast ? 0.6 : 1 }}
                      >
                        <DateBodyCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            {isExpanded ? (
                              <ExpandLessIcon
                                fontSize="small"
                                sx={{ color: "text.secondary" }}
                              />
                            ) : (
                              <ExpandMoreIcon
                                fontSize="small"
                                sx={{ color: "text.secondary" }}
                              />
                            )}
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600, lineHeight: 1.2 }}
                              >
                                {isPast && "⏰ "}
                                {date}
                              </Typography>
                              {checkedInCount > 0 && (
                                <Typography
                                  variant="caption"
                                  color="success.main"
                                  sx={{ fontSize: "0.6rem" }}
                                >
                                  ✅ {checkedInCount} checked in
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </DateBodyCell>
                        {timePeriods.map((period) => {
                          const slotData = dayData[period.key];
                          const uniqueInPeriod = slotData.mentors.size;
                          const tip =
                            uniqueInPeriod > 0
                              ? `${period.name}: ${uniqueInPeriod} mentor${uniqueInPeriod !== 1 ? "s" : ""}` +
                                (slotData.inPerson > 0
                                  ? ` · 👥 ${slotData.inPerson} in-person`
                                  : "") +
                                (slotData.remote > 0
                                  ? ` · 💻 ${slotData.remote} remote`
                                  : "") +
                                (slotData.checkedIn > 0
                                  ? ` · ✅ ${slotData.checkedIn} checked in`
                                  : "")
                              : `${period.name}: no mentors`;
                          return (
                            <Tooltip key={period.key} title={tip} arrow>
                              <MatrixCell count={uniqueInPeriod}>
                                {uniqueInPeriod || ""}
                              </MatrixCell>
                            </Tooltip>
                          );
                        })}
                        <TableCell
                          align="center"
                          sx={{ fontWeight: 700, fontSize: "0.85rem" }}
                        >
                          {uniqueMentorCount}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          colSpan={timePeriods.length + 2}
                          sx={{ p: 0, border: 0 }}
                        >
                          <Collapse in={isExpanded} unmountOnExit>
                            <Box
                              sx={{
                                p: 1.5,
                                backgroundColor: "var(--surface-2, #F4F1E9)",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: 0.75,
                                }}
                              >
                                {Array.from(dayData.uniqueMentors).map(
                                  (mentorId) => {
                                    const d =
                                      dayData.mentorDetails.get(mentorId);
                                    if (!d) return null;
                                    const tipText =
                                      (d.company ? `${d.company} · ` : "") +
                                      (d.expertise?.length
                                        ? d.expertise.join(", ")
                                        : "No skills listed");
                                    return (
                                      <Tooltip
                                        key={mentorId}
                                        title={tipText}
                                        arrow
                                      >
                                        <Chip
                                          size="small"
                                          variant="outlined"
                                          color={
                                            d.isInPerson
                                              ? "primary"
                                              : "secondary"
                                          }
                                          avatar={
                                            <Avatar
                                              sx={{
                                                bgcolor: d.isInPerson
                                                  ? theme.palette.primary.main
                                                  : theme.palette.secondary
                                                      .main,
                                                fontSize: "0.6rem",
                                              }}
                                            >
                                              {getMentorInitials(d.name)}
                                            </Avatar>
                                          }
                                          label={
                                            <Box
                                              component="span"
                                              sx={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 0.4,
                                              }}
                                            >
                                              {d.name}
                                              {d.isInPerson ? (
                                                <GroupsIcon
                                                  sx={{ fontSize: "0.85rem" }}
                                                />
                                              ) : (
                                                <ComputerIcon
                                                  sx={{ fontSize: "0.85rem" }}
                                                />
                                              )}
                                              {d.isCheckedIn && (
                                                <CheckCircleIcon
                                                  sx={{
                                                    fontSize: "0.85rem",
                                                    color: "success.main",
                                                  }}
                                                />
                                              )}
                                            </Box>
                                          }
                                        />
                                      </Tooltip>
                                    );
                                  },
                                )}
                              </Box>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 1 }}
          >
            Numbers = unique mentors available · 👥 in-person · 💻 remote · ✅
            checked in · tap a date for names
          </Typography>
        </>
      ) : (
        // Detailed view: one card per mentor (deduped) with their availability windows.
        <Grid container spacing={2}>
          {mentorRoster.map((mentor) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={mentor.id}>
              {renderMentorRosterCard(mentor)}
            </Grid>
          ))}
        </Grid>
      )}
    </StyledPaper>
  );
};

export default MentorAvailability;
