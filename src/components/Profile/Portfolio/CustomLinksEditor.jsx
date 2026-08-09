import React, { useEffect, useRef, useState } from "react";
import { TextField, IconButton, Button, Tooltip } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

const MAX_LINKS = 10;

/**
 * Editor for the user's own links ({label, url} rows, up/down reorder).
 * Saves the whole array (debounced 1.5s) via update_profile_metadata —
 * the backend sanitizes/validates each URL.
 */
export default function CustomLinksEditor({ initialLinks, onSave }) {
  const [links, setLinks] = useState(initialLinks || []);
  const debounceRef = useRef(null);
  const hydratedRef = useRef(false);

  // Hydrate once from the async-loaded profile; don't clobber in-progress edits
  useEffect(() => {
    if (!hydratedRef.current && Array.isArray(initialLinks) && initialLinks.length) {
      setLinks(initialLinks);
      hydratedRef.current = true;
    }
  }, [initialLinks]);

  const scheduleSave = (next) => {
    setLinks(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      // Only persist rows with a URL; https:// is auto-prefixed server-side
      onSave(next.filter((l) => (l.url || "").trim()));
    }, 1500);
  };

  const updateRow = (i, patch) => {
    const next = links.map((l, idx) => (idx === i ? { ...l, ...patch } : l));
    scheduleSave(next);
  };

  const removeRow = (i) => scheduleSave(links.filter((_, idx) => idx !== i));

  const moveRow = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= links.length) return;
    const next = [...links];
    [next[i], next[j]] = [next[j], next[i]];
    scheduleSave(next);
  };

  const addRow = () => {
    if (links.length >= MAX_LINKS) return;
    setLinks([...links, { label: "", url: "" }]);
  };

  return (
    <div>
      {links.map((link, i) => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
          <TextField
            size="small"
            label="Label"
            value={link.label || ""}
            onChange={(e) => updateRow(i, { label: e.target.value.slice(0, 40) })}
            sx={{ width: 160 }}
          />
          <TextField
            size="small"
            label="URL"
            value={link.url || ""}
            onChange={(e) => updateRow(i, { url: e.target.value })}
            placeholder="https://your-site.dev"
            sx={{ minWidth: 220, flex: "1 1 220px" }}
          />
          <Tooltip title="Move up">
            <span>
              <IconButton size="small" onClick={() => moveRow(i, -1)} disabled={i === 0} aria-label="Move link up">
                <ArrowUpwardIcon fontSize="inherit" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Move down">
            <span>
              <IconButton size="small" onClick={() => moveRow(i, 1)} disabled={i === links.length - 1} aria-label="Move link down">
                <ArrowDownwardIcon fontSize="inherit" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Remove">
            <IconButton size="small" onClick={() => removeRow(i)} aria-label="Remove link">
              <DeleteOutlineIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </div>
      ))}

      {links.length < MAX_LINKS && (
        <Button size="small" variant="outlined" onClick={addRow} sx={{ textTransform: "none" }}>
          + Add link
        </Button>
      )}
      <p className="ohx-muted" style={{ margin: "10px 0 0", fontSize: "0.85rem" }}>
        Your personal site, LinkedIn projects, Devpost profile — anywhere you want employers to look next.
      </p>
    </div>
  );
}
