// Google-Sheets "paste a row" support for add-mode in the volunteer edit
// dialog. Extracted verbatim from the old VolunteerEditDialog so the TSV
// parser (which understands quoted multi-line cells) is unit-testable.
import { transformJudgeData } from "../judgeHeaderMappings";
import { transformMentorData } from "../mentorHeaderMappings";
import { toSingularType } from "./applicationSchema";

/**
 * Parse a header row + ONE data row of tab-separated text (as copied from
 * Google Sheets). Cells wrapped in double quotes may contain newlines and
 * escaped quotes (""). Returns { [header]: value }.
 */
export function parseBulkRow(text) {
  const lines = String(text || "").trim().split("\n");
  if (lines.length < 2) return {};
  const headers = lines[0].split("\t").map((h) => h.trim());

  const dataValues = [];
  let currentValue = "";
  let inQuotes = false;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        // Sheets escapes a literal quote inside a quoted cell as "" — keep one.
        if (inQuotes && line[j + 1] === '"') {
          currentValue += '"';
          j += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "\t" && !inQuotes) {
        dataValues.push(currentValue.trim());
        currentValue = "";
      } else {
        currentValue += char;
      }
    }
    if (inQuotes) {
      currentValue += "\n";
    } else {
      dataValues.push(currentValue.trim());
      break;
    }
  }

  const rawData = {};
  headers.forEach((header, index) => {
    if (index < dataValues.length) {
      rawData[header] = dataValues[index];
    }
  });
  return rawData;
}

/**
 * Parse + map Sheets headers onto doc keys for the given volunteer type.
 * Unknown types pass the raw header→value map through. The importers stamp
 * `isSelected: false` — strip it; roster is owned by the select route.
 */
export function applyBulkRow(text, type) {
  const raw = parseBulkRow(text);
  const singular = toSingularType(type);
  let transformed = raw;
  if (singular === "mentor") transformed = transformMentorData(raw);
  else if (singular === "judge") transformed = transformJudgeData(raw);
  const { isSelected: _ignored, ...rest } = transformed;
  return rest;
}
