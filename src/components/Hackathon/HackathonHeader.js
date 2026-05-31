import React from "react";
import { Box } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ReactMarkdown from "react-markdown";
import { parseLocalDate } from "../../lib/dateUtils";

// Refined "civic editorial" event masthead. Replaces the old mint-gradient
// Paper with a calm, confident hero: eyebrow → big Fraunces title → a single
// date·location meta line → muted markdown description → hairline rule.
// Relies on the .ohx-* utility classes provided by the page's <RefinedRoot>.
const HackathonHeader = ({ title, startDate, endDate, location, description }) => {
  const formatDate = (date) => {
    const d = parseLocalDate(date);
    if (isNaN(d.getTime())) return "TBA";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };
  const formatDateISO = (date) => {
    const d = parseLocalDate(date);
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const metaItem = { display: "inline-flex", alignItems: "center", gap: 6, color: "var(--muted)", fontSize: "0.95rem", fontWeight: 500 };

  return (
    <Box
      component="header"
      role="banner"
      itemScope
      itemType="https://schema.org/Event"
      sx={{ pt: { xs: "92px", md: "120px" }, pb: { xs: 3, md: 4 }, minHeight: 220 }}
    >
      <p className="ohx-eyebrow rise">Opportunity Hack · hackathon</p>

      <h1
        className="ohx-display rise"
        itemProp="name"
        style={{ marginTop: 16, marginBottom: 20, maxWidth: "18ch", fontSize: "clamp(2.2rem, 5vw, 3.6rem)", animationDelay: "60ms" }}
      >
        {title}
      </h1>

      <div className="rise" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14, animationDelay: "130ms" }}>
        <span style={metaItem}>
          <CalendarTodayIcon sx={{ fontSize: 18, color: "var(--accent)" }} />
          <span>
            <time dateTime={formatDateISO(startDate)} itemProp="startDate">{formatDate(startDate)}</time>
            {" – "}
            <time dateTime={formatDateISO(endDate)} itemProp="endDate">{formatDate(endDate)}</time>
          </span>
        </span>
        <span className="ohx-faint" aria-hidden="true">·</span>
        <span style={metaItem} itemProp="location">
          <LocationOnIcon sx={{ fontSize: 18, color: "var(--accent)" }} />
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
            "& p": { color: "var(--muted)", fontSize: "1.05rem", lineHeight: 1.65, margin: "0 0 12px" },
            "& a": { color: "var(--brand)", textDecoration: "underline", textUnderlineOffset: "3px" },
            "& a:hover": { color: "var(--accent)" },
            "& strong": { color: "var(--ink)" },
          }}
        >
          <ReactMarkdown>{description}</ReactMarkdown>
        </Box>
      )}

      <hr className="ohx-rule" style={{ marginTop: 28 }} />
    </Box>
  );
};

export default HackathonHeader;
