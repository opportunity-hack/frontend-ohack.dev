import { FONT_BODY, FONT_DISPLAY } from "../../styles/fonts";
import React from "react";
import { Box } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ReactMarkdown from "react-markdown";
import { parseLocalDate } from "../../lib/dateUtils";

// Refined "civic editorial" event masthead. Replaces the old mint-gradient
// Paper with a calm, confident hero: eyebrow → big Fraunces title → a single
// date·location meta line → muted markdown description → hairline rule.
//
// Styling is inline with CSS-var fallbacks (e.g. var(--ink, #16181D)) so the
// masthead looks correct whether or not it sits inside a <RefinedRoot> — it's
// reused on /hack/[event_id], /hack/[event_id]/agenda and /census, only one of
// which provides the refined scope.
const INK = "var(--ink, #16181D)";
const MUTED = "var(--muted, #5B6270)";
const ACCENT = "var(--accent, #E2552E)";
const LINE = "var(--line, #E7E1D4)";
const BRAND = "var(--brand, #1B3A6B)";
const DISPLAY = FONT_DISPLAY;
const BODY = FONT_BODY;

const HackathonHeader = ({
  title,
  startDate,
  endDate,
  location,
  description,
}) => {
  const formatDate = (date) => {
    const d = parseLocalDate(date);
    if (isNaN(d.getTime())) return "TBA";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  const formatDateISO = (date) => {
    const d = parseLocalDate(date);
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const metaItem = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    color: MUTED,
    fontSize: "0.95rem",
    fontWeight: 500,
    fontFamily: BODY,
  };

  return (
    <Box
      component="header"
      role="banner"
      itemScope
      itemType="https://schema.org/Event"
      sx={{
        pt: { xs: "92px", md: "120px" },
        pb: { xs: 3, md: 4 },
        minHeight: 220,
      }}
    >
      <p
        className="rise"
        style={{
          fontFamily: BODY,
          textTransform: "uppercase",
          letterSpacing: "0.22em",
          fontSize: "0.72rem",
          fontWeight: 600,
          color: MUTED,
          margin: 0,
        }}
      >
        Opportunity Hack · hackathon
      </p>

      <h1
        className="rise"
        itemProp="name"
        style={{
          fontFamily: DISPLAY,
          fontWeight: 500,
          letterSpacing: "-0.015em",
          lineHeight: 1.05,
          color: INK,
          margin: "16px 0 20px",
          maxWidth: "18ch",
          fontSize: "clamp(2.2rem, 5vw, 3.6rem)",
          animationDelay: "60ms",
        }}
      >
        {title}
      </h1>

      <div
        className="rise"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 14,
          animationDelay: "130ms",
        }}
      >
        <span style={metaItem}>
          <CalendarTodayIcon sx={{ fontSize: 18, color: ACCENT }} />
          <span>
            <time dateTime={formatDateISO(startDate)} itemProp="startDate">
              {formatDate(startDate)}
            </time>
            {" – "}
            <time dateTime={formatDateISO(endDate)} itemProp="endDate">
              {formatDate(endDate)}
            </time>
          </span>
        </span>
        <span aria-hidden="true" style={{ color: LINE }}>
          ·
        </span>
        <span style={metaItem} itemProp="location">
          <LocationOnIcon sx={{ fontSize: 18, color: ACCENT }} />
          <span>{location}</span>
        </span>
      </div>

      {description && (
        <Box
          itemProp="description"
          className="rise"
          sx={{
            mt: 2.5,
            maxWidth: "62ch",
            animationDelay: "200ms",
            "& p": {
              color: MUTED,
              fontFamily: BODY,
              fontSize: "1.05rem",
              lineHeight: 1.65,
              margin: "0 0 12px",
            },
            "& a": {
              color: BRAND,
              textDecoration: "underline",
              textUnderlineOffset: "3px",
            },
            "& a:hover": { color: ACCENT },
            "& strong": { color: INK },
          }}
        >
          <ReactMarkdown>{description}</ReactMarkdown>
        </Box>
      )}

      <hr
        style={{
          height: 1,
          border: 0,
          background: LINE,
          width: "100%",
          margin: "28px 0 0",
        }}
      />
    </Box>
  );
};

export default HackathonHeader;
