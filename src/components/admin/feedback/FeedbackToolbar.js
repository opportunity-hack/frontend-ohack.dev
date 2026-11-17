// Shared "Download CSV" + "Print" controls and the print stylesheet for the
// admin Feedback page. Panels render <FeedbackToolbar/> at their top; the page
// wraps everything in <Box id={FEEDBACK_PRINT_ROOT_ID}> and mounts
// <FeedbackPrintStyles/> once.
//
// Print conventions (class names used by the panels):
//   .fb-no-print     — on-screen controls (filters, tabs, buttons): hidden on paper
//   .fb-print-only   — report header / context lines: paper only
//   .fb-print-detail — the long per-response lists: dropped by "Print summary"
import React, { useState } from "react";
import { Box, Button, Menu, MenuItem, ListItemText, Stack, Typography } from "@mui/material";
import { Print as PrintIcon, ArrowDropDown as ArrowIcon } from "@mui/icons-material";
import ExportCsvButton from "../ExportCsvButton";
import * as ga from "../../../lib/ga";

export const FEEDBACK_PRINT_ROOT_ID = "feedback-print-root";
const ROOT = `#${FEEDBACK_PRINT_ROOT_ID}`;
// Printable width at 0.5in margins: Letter 720 CSS px, A4 ~698. Laying the
// report out just under that before printing lets the charts re-measure, so
// nothing is clipped on either paper size.
const PRINT_WIDTH_PX = 690;

const PRINT_CSS = `
${ROOT} .fb-print-only { display: none; }
@media print {
  @page { margin: 0.5in; }
  /* Only the report prints: hide everything that isn't the root, in it, or an ancestor of it. */
  body *:not(:has(${ROOT})):not(${ROOT}):not(${ROOT} *) { display: none !important; }
  /* Ancestors: drop the admin chrome's padding, shadows and overflow clips (they cut pages short). */
  html, body, body *:has(${ROOT}) {
    display: block !important; overflow: visible !important; background: #fff !important;
    box-shadow: none !important; padding: 0 !important; margin: 0 !important;
    width: auto !important; max-width: none !important; height: auto !important; min-height: 0 !important;
    border: 0 !important; position: static !important;
  }
  ${ROOT} { -webkit-print-color-adjust: exact; print-color-adjust: exact; font-size: 10.5pt; }
  ${ROOT} .fb-no-print { display: none !important; }
  ${ROOT} .fb-print-only { display: block !important; }
  ${ROOT}[data-print-detail="off"] .fb-print-detail { display: none !important; }

  /* Keep cards, quotes and responses whole; keep headings with what follows. */
  ${ROOT} .MuiCard-root, ${ROOT} .MuiAccordion-root, ${ROOT} .recharts-wrapper,
  ${ROOT} tr, ${ROOT} .fb-keep { break-inside: avoid; page-break-inside: avoid; }
  ${ROOT} h1, ${ROOT} h2, ${ROOT} h3, ${ROOT} h4, ${ROOT} h5, ${ROOT} h6,
  ${ROOT} .MuiTypography-subtitle2 { break-after: avoid; page-break-after: avoid; }
  /* Long lists may run across pages — only their items stay whole. */
  ${ROOT} .fb-flow { break-inside: auto !important; page-break-inside: auto !important; }
  ${ROOT} .MuiCard-root, ${ROOT} .MuiAccordion-root { box-shadow: none !important; border-color: #bdbdbd !important; }

  /* Every individual response prints expanded. */
  ${ROOT} .MuiAccordion-root { border: 1px solid #bdbdbd; margin: 0 0 8px !important; }
  ${ROOT} .MuiAccordion-root::before { display: none !important; }
  ${ROOT} .MuiAccordion-root .MuiCollapse-root {
    height: auto !important; min-height: 0 !important; visibility: visible !important; overflow: visible !important;
  }
  ${ROOT} .MuiAccordionSummary-expandIconWrapper { display: none !important; }
  ${ROOT} .MuiAccordionSummary-root { min-height: 0 !important; }

  /* Charts and tables never exceed the page. */
  ${ROOT} .recharts-wrapper, ${ROOT} .recharts-surface { max-width: 100% !important; }
  ${ROOT} .MuiTable-root { width: 100% !important; }
  ${ROOT} { max-width: 100% !important; }
  ${ROOT} a { color: inherit !important; text-decoration: none !important; }
}
`;

export const FeedbackPrintStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />
);

/** Print the report. `detail=false` leaves the per-response lists out. */
export function printFeedback({ detail = true } = {}) {
  if (typeof window === "undefined") return;
  const root = document.getElementById(FEEDBACK_PRINT_ROOT_ID);
  if (!root) {
    window.print();
    return;
  }
  const prevWidth = root.style.width;
  root.setAttribute("data-print-detail", detail ? "on" : "off");
  root.style.width = `${PRINT_WIDTH_PX}px`;

  let restored = false;
  const restore = () => {
    if (restored) return;
    restored = true;
    root.style.width = prevWidth;
    root.removeAttribute("data-print-detail");
    window.removeEventListener("afterprint", restore);
  };
  window.addEventListener("afterprint", restore);

  // Give the charts' ResizeObservers a beat to re-measure at the print width.
  window.setTimeout(() => {
    try {
      window.print();
    } finally {
      // Browsers that block in print() are done here; the rest fire afterprint.
      window.setTimeout(restore, 1000);
    }
  }, 350);
}

/** Paper-only line describing which slice of the data the report covers. */
export const PrintContext = ({ children }) => (
  <Typography className="fb-print-only" variant="body2" sx={{ mb: 2 }}>
    {children}
  </Typography>
);

/**
 * Props:
 *   exports  — [{ label, rows, columns, filenameParts, table }] → one CSV button each
 *   hasDetail — the panel has a per-response list (offers "summary only" printing)
 *   table     — GA label for the print event
 */
const FeedbackToolbar = ({ exports = [], hasDetail = true, table = "feedback", disabled = false, sx }) => {
  const [anchor, setAnchor] = useState(null);

  const print = (detail) => {
    setAnchor(null);
    ga.trackStructuredEvent(
      ga.EventCategory.ADMIN,
      "admin_feedback_print",
      `${table}_${detail ? "full" : "summary"}`
    );
    printFeedback({ detail });
  };

  return (
    <Stack
      className="fb-no-print"
      direction="row"
      spacing={1}
      flexWrap="wrap"
      useFlexGap
      justifyContent="flex-end"
      sx={sx}
    >
      {exports.map((ex) => (
        <ExportCsvButton
          key={ex.label}
          label={ex.label}
          rows={ex.rows}
          columns={ex.columns}
          filenameParts={ex.filenameParts}
          table={ex.table || table}
          disabled={disabled}
        />
      ))}
      {hasDetail ? (
        <>
          <Button
            size="small"
            variant="outlined"
            startIcon={<PrintIcon />}
            endIcon={<ArrowIcon />}
            disabled={disabled}
            aria-haspopup="menu"
            onClick={(e) => setAnchor(e.currentTarget)}
          >
            Print
          </Button>
          <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
            <MenuItem onClick={() => print(false)}>
              <ListItemText primary="Summary" secondary="Numbers, charts, themes and quotes" />
            </MenuItem>
            <MenuItem onClick={() => print(true)}>
              <ListItemText primary="Full report" secondary="Summary plus every individual response" />
            </MenuItem>
          </Menu>
        </>
      ) : (
        <Button size="small" variant="outlined" startIcon={<PrintIcon />} disabled={disabled} onClick={() => print(true)}>
          Print
        </Button>
      )}
    </Stack>
  );
};

export default FeedbackToolbar;

const LOGO_URL =
  "https://cdn.ohack.dev/ohack.dev/logos/OpportunityHack_Logo_Dark_Blue_Banner.png";
const BRAND_NAVY = "#1B3A6B";
const BRAND_ACCENT = "#E2552E";

/** Branded report masthead — paper only. */
export const PrintHeader = ({ section }) => (
  <Box className="fb-print-only" sx={{ mb: 2.5 }}>
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 2,
        pb: 1.25,
        borderBottom: `3px solid ${BRAND_NAVY}`,
      }}
    >
      {/* Plain <img> with explicit size: the CDN logo is 3:1. */}
      <img src={LOGO_URL} alt="Opportunity Hack" width={168} height={56} style={{ display: "block" }} />
      <Box sx={{ textAlign: "right" }}>
        <Typography
          component="div"
          sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: BRAND_ACCENT }}
        >
          Feedback report
        </Typography>
        <Typography component="div" sx={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2, color: BRAND_NAVY }}>
          {section}
        </Typography>
      </Box>
    </Box>
    <Typography component="div" sx={{ fontSize: 11, color: "#555", mt: 0.75 }}>
      Printed {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })} ·
      Internal — contains participant feedback
    </Typography>
  </Box>
);

/** Closing brand line — paper only. */
export const PrintFooter = () => (
  <Box
    className="fb-print-only fb-keep"
    sx={{ mt: 3, pt: 1, borderTop: `1px solid ${BRAND_NAVY}`, fontSize: 11, color: BRAND_NAVY }}
  >
    <strong>Opportunity Hack</strong> · Tech for social good · www.ohack.dev
  </Box>
);
