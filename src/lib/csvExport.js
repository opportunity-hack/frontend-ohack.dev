/**
 * Shared CSV export helpers for the admin tables under
 * `/admin/hackathons/[event_id]` (and anywhere else an admin wants "download
 * what I'm looking at").
 *
 * Everything except `downloadCsv` is pure (no DOM) so it can be unit-tested.
 *
 * Column spec accepted by `buildCsv`:
 *   - a string            → `{ key: str, label: str }`
 *   - `{ key, label }`    → reads `row[key]`
 *   - `{ key, label, get }` → calls `get(row)` instead of reading `row[key]`
 *
 * Values are normalised by `formatCsvValue` (arrays → "a; b", booleans →
 * Yes/No, objects → JSON, null/undefined → "") and escaped per RFC-4180 by
 * `csvField`, which also neutralises spreadsheet formula injection (a cell
 * like `=HYPERLINK(...)` typed into an application form must not execute
 * when the admin opens the file in Excel / Sheets).
 */

const NEEDS_QUOTES = /[",\r\n]/;

// Leading characters Excel/Sheets/LibreOffice treat as "this cell is a
// formula". `+`/`-` are only dangerous when followed by something that isn't
// a plain number ("-5" and "+1 480 555 1234" are fine; "-cmd|'/C calc'!A0"
// and "+SUM(1)" are not).
const FORMULA_LEAD = /^[=@\t\r]/;
const SIGNED_NON_NUMERIC = /^[+-](?![\d.\s()-]+$)/;

export function isFormulaLike(str) {
  if (typeof str !== "string" || !str) return false;
  return FORMULA_LEAD.test(str) || SIGNED_NON_NUMERIC.test(str);
}

/** RFC-4180 field: quote when needed, double embedded quotes, defuse formulas. */
export function csvField(value) {
  let str = value == null ? "" : String(value);
  if (isFormulaLike(str)) str = `'${str}`;
  if (NEEDS_QUOTES.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

/** Turn any JS value into the string that should land in the cell. */
export function formatCsvValue(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number")
    return Number.isFinite(value) ? String(value) : "";
  if (value instanceof Date)
    return Number.isNaN(value.getTime()) ? "" : value.toISOString();
  if (Array.isArray(value)) {
    return value
      .map((v) =>
        v && typeof v === "object" && !(v instanceof Date)
          ? JSON.stringify(v)
          : formatCsvValue(v),
      )
      .filter((v) => v !== "")
      .join("; ");
  }
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function normalizeColumn(col) {
  if (typeof col === "string") return { key: col, label: col };
  return { key: col.key, label: col.label ?? col.key, get: col.get };
}

/**
 * Build an RFC-4180 CSV string (header + rows, CRLF line endings) from an
 * array of row objects and a column spec. Never throws on a malformed row —
 * a missing value is an empty cell.
 */
export function buildCsv(rows, columns) {
  const cols = (columns || []).map(normalizeColumn);
  const header = cols.map((c) => csvField(c.label));
  const lines = [header.join(",")];
  (rows || []).forEach((row) => {
    const cells = cols.map((c) => {
      let v;
      try {
        v = c.get ? c.get(row) : row?.[c.key];
      } catch {
        v = "";
      }
      return csvField(formatCsvValue(v));
    });
    lines.push(cells.join(","));
  });
  return lines.join("\r\n");
}

/** "Fall 2026" → "fall-2026"; drops anything that isn't [a-z0-9]. */
export function slugForFilename(part) {
  return String(part ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function dateStamp(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * `csvFilename("fall-2026", "judges", "on roster")` →
 * `"fall-2026-judges-on-roster-2026-10-16.csv"`. Empty parts are skipped.
 */
export function csvFilename(...parts) {
  const slug = parts.map(slugForFilename).filter(Boolean).join("-") || "export";
  return `${slug}-${dateStamp()}.csv`;
}

/**
 * Browser-only: trigger a download of `csv` as `filename`. Prepends a UTF-8
 * BOM so Excel opens accented names correctly (Sheets/Numbers ignore it).
 */
export function downloadCsv(filename, csv) {
  if (typeof window === "undefined" || typeof document === "undefined")
    return false;
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}
