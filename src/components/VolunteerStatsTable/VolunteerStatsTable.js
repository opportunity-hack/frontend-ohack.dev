// components/VolunteerStatsTable/VolunteerStatsTable.js
// Refined hairline table of volunteering entries, grouped by day. Uses CSS-var
// fallbacks so it renders correctly inside <RefinedRoot> and on plain surfaces.
import React from "react";
import moment from "moment";

const REASON_LABELS = {
  mentoring: "Mentoring",
  event_organization: "Event organization",
  judging: "Judging",
  coding: "Coding",
  other: "Other",
};

const fmtHours = (n) =>
  n === undefined || n === null || isNaN(n) ? null : parseFloat(Number(n).toFixed(2));

const cellBase = {
  padding: "10px 12px",
  fontSize: "0.9rem",
  borderBottom: "1px solid var(--line, #E7E1D4)",
  verticalAlign: "middle",
};

const VolunteerStatsTable = ({ volunteerStats }) => {
  if (!volunteerStats || volunteerStats.length === 0) return null;

  // Newest day first; entries within a day newest first.
  const grouped = volunteerStats.reduce((acc, stat) => {
    const date = moment.utc(stat.timestamp).format("YYYY-MM-DD");
    (acc[date] = acc[date] || []).push(stat);
    return acc;
  }, {});
  const days = Object.keys(grouped).sort((a, b) => (a < b ? 1 : -1));

  return (
    <div
      style={{
        marginTop: 20,
        border: "1px solid var(--line, #E7E1D4)",
        borderRadius: 8,
        overflowX: "auto",
        background: "var(--surface, #fff)",
      }}
    >
      <table
        style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}
        aria-label="Volunteering history"
      >
        <thead>
          <tr>
            {["Time", "Committed", "Tracked", "Reason"].map((h, i) => (
              <th
                key={h}
                style={{
                  ...cellBase,
                  textAlign: i === 1 || i === 2 ? "right" : "left",
                  fontFamily: "var(--body, sans-serif)",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--muted, #5B6270)",
                  background: "var(--surface-2, #F4F1E9)",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((date) => {
            const entries = grouped[date]
              .slice()
              .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
            return (
              <React.Fragment key={date}>
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      ...cellBase,
                      fontFamily: "var(--display, serif)",
                      fontSize: "0.95rem",
                      fontWeight: 500,
                      color: "var(--ink, #16181D)",
                      background: "var(--surface-2, #F4F1E9)",
                    }}
                  >
                    {moment(date).format("dddd, MMMM D, YYYY")}
                  </td>
                </tr>
                {entries.map((stat, index) => {
                  const committed = fmtHours(stat.commitmentHours);
                  const tracked = fmtHours(stat.finalHours);
                  return (
                    <tr key={`${date}-${index}`}>
                      <td style={{ ...cellBase, color: "var(--muted, #5B6270)", whiteSpace: "nowrap" }}>
                        {moment.utc(stat.timestamp).local().format("h:mm a")}
                        {stat.manual && (
                          <span
                            className="ohx-tag"
                            style={{ marginLeft: 8, fontSize: "0.62rem", padding: "0.1em 0.5em" }}
                          >
                            manual
                          </span>
                        )}
                      </td>
                      <td style={{ ...cellBase, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                        {committed === null ? <span style={{ color: "var(--faint, #8A8F9A)" }}>—</span> : committed}
                      </td>
                      <td
                        style={{
                          ...cellBase,
                          textAlign: "right",
                          fontVariantNumeric: "tabular-nums",
                          fontWeight: tracked !== null ? 600 : 400,
                          color: tracked !== null ? "var(--brand, #1B3A6B)" : "var(--faint, #8A8F9A)",
                        }}
                      >
                        {tracked === null ? "—" : tracked}
                      </td>
                      <td style={{ ...cellBase, color: "var(--ink, #16181D)" }}>
                        {REASON_LABELS[stat.reason] || stat.reason || "—"}
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default VolunteerStatsTable;
