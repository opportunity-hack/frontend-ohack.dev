import React from "react";
import { Box } from "@mui/material";

// Plain names for the write-up fields, as the notice says them.
export const PROJECT_FIELD_LABELS = {
  project_tagline: "tagline",
  project_story: "story",
  project_built_with: "“Built with” list",
  project_links: "links",
  project_thumbnail_url: "thumbnail",
  project_images: "images",
};

/** A short, readable preview of a teammate's saved value (null = nothing to show). */
export function describeConflictValue(key, value) {
  if (key === "project_thumbnail_url") return null;
  if (key === "project_images") {
    const count = Array.isArray(value) ? value.length : 0;
    return `${count} image${count === 1 ? "" : "s"}`;
  }
  if (key === "project_links") {
    return (Array.isArray(value) ? value : [])
      .map((link) => [link?.label, link?.url].filter(Boolean).join(" — "))
      .filter(Boolean)
      .join("\n");
  }
  if (Array.isArray(value)) return value.join(", ");
  return typeof value === "string" ? value : "";
}

/**
 * Shown when a teammate saved a field this person was also editing: nothing
 * of theirs or yours is lost until a choice is made. Renders nothing without
 * conflicts. Only ever inside the dashboard's `RefinedRoot`.
 */
export default function ProjectConflictNotice({ conflicts, onResolve }) {
  const keys = Object.keys(conflicts || {});
  if (keys.length === 0) return null;
  return (
    <Box
      role="status"
      sx={{
        border: "1px solid var(--accent, #E2552E)",
        background: "var(--surface-2, #F4F1E9)",
        borderRadius: "4px",
        p: 2,
        mb: 3,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {keys.map((key) => {
        const conflict = conflicts[key];
        const label = PROJECT_FIELD_LABELS[key] || "write-up";
        const who = conflict.by || "A teammate";
        const preview = describeConflictValue(key, conflict.value);
        return (
          <Box key={key} data-conflict-field={key}>
            <Box sx={{ fontWeight: 600 }}>
              {who} saved a different {label} while you were editing.
            </Box>
            <Box sx={{ color: "var(--muted)", mt: 0.5, maxWidth: "40em" }}>
              Yours isn&apos;t saved yet, and nothing has been lost. Pick the
              one to keep.
            </Box>
            {preview !== null && (
              <Box component="details" sx={{ mt: 1 }}>
                <Box component="summary" sx={{ cursor: "pointer" }}>
                  See their version
                </Box>
                <Box
                  sx={{
                    mt: 1,
                    p: 1.5,
                    maxHeight: 240,
                    overflowY: "auto",
                    whiteSpace: "pre-wrap",
                    overflowWrap: "anywhere",
                    background: "var(--paper, #FBFAF6)",
                    border: "1px solid var(--line, #E7E1D4)",
                    fontSize: "14.5px",
                  }}
                >
                  {preview || "(empty)"}
                </Box>
              </Box>
            )}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5 }}>
              <button
                type="button"
                className="ohx-btn ohx-btn--ghost"
                onClick={() => onResolve(key, "mine")}
              >
                Keep mine
              </button>
              <button
                type="button"
                className="ohx-btn ohx-btn--ghost"
                onClick={() => onResolve(key, "theirs")}
              >
                Use theirs
              </button>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
