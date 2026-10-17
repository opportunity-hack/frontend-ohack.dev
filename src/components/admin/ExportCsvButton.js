import React, { useCallback } from "react";
import { Button, IconButton, Tooltip } from "@mui/material";
import { Download as DownloadIcon } from "@mui/icons-material";
import { buildCsv, csvFilename, downloadCsv } from "../../lib/csvExport";
import * as ga from "../../lib/ga";

/**
 * One button = one CSV download of the rows the admin is looking at.
 *
 * Props:
 *   rows        — array of row objects (already filtered the way the table is)
 *   columns     — `buildCsv` column spec
 *   filename    — full filename, OR pass `filenameParts` (array) and we stamp it
 *   table       — short id for GA (`admin_csv_export` event_label), e.g. "teams"
 *   eventId     — hackathon event_id, added to the GA params + default filename
 *   label       — button text (default "Download CSV")
 *   iconOnly    — render an IconButton (for crowded toolbars)
 *   onExported  — optional callback({ rows, filename })
 *
 * Disabled automatically when there is nothing to export.
 */
const ExportCsvButton = ({
  rows,
  columns,
  filename,
  filenameParts,
  table = "table",
  eventId,
  label = "Download CSV",
  tooltip,
  iconOnly = false,
  size = "small",
  variant = "outlined",
  color = "primary",
  disabled = false,
  sx,
  onExported,
}) => {
  const count = Array.isArray(rows) ? rows.length : 0;
  const isDisabled = disabled || count === 0;

  const handleClick = useCallback(() => {
    if (!Array.isArray(rows) || rows.length === 0) return;
    const name =
      filename ||
      csvFilename(
        ...(filenameParts && filenameParts.length
          ? filenameParts
          : [eventId, table]),
      );
    const csv = buildCsv(rows, columns);
    downloadCsv(name, csv);
    ga.trackStructuredEvent(
      ga.EventCategory.ADMIN,
      "admin_csv_export",
      table,
      rows.length,
      {
        event_id: eventId || undefined,
      },
    );
    onExported?.({ rows, filename: name });
  }, [rows, columns, filename, filenameParts, eventId, table, onExported]);

  const title =
    tooltip ||
    (count === 0
      ? "Nothing to download yet"
      : `Download ${count} row${count === 1 ? "" : "s"} as CSV`);

  const control = iconOnly ? (
    <IconButton
      size={size}
      color={color}
      onClick={handleClick}
      disabled={isDisabled}
      aria-label={label}
    >
      <DownloadIcon fontSize={size === "small" ? "small" : "medium"} />
    </IconButton>
  ) : (
    <Button
      size={size}
      variant={variant}
      color={color}
      startIcon={<DownloadIcon />}
      onClick={handleClick}
      disabled={isDisabled}
      sx={sx}
    >
      {label}
    </Button>
  );

  // <span> so the tooltip still shows while the control is disabled.
  return (
    <Tooltip title={title}>
      <span style={{ display: "inline-flex" }}>{control}</span>
    </Tooltip>
  );
};

export default ExportCsvButton;
