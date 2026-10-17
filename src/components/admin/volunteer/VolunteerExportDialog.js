import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Link,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import { Download as DownloadIcon } from "@mui/icons-material";
import { buildCsv, csvFilename, downloadCsv } from "../../../lib/csvExport";
import * as ga from "../../../lib/ga";
import {
  COLUMN_SETS,
  ROSTER_SCOPES,
  buildVolunteerExportColumns,
  exportScopeSlug,
  rosterBreakdown,
  scopeVolunteersForExport,
  statusBreakdown,
} from "./volunteerExport";

const TYPE_LABELS = {
  mentors: "mentors",
  judges: "judges",
  volunteers: "volunteers",
  hackers: "hackers",
  sponsors: "sponsors",
};

/**
 * "Download CSV" for one volunteer type on the admin tab.
 *
 * Seeds its choices from the table's current filters (so the default is
 * "what I'm looking at"), then lets the admin widen or narrow along the two
 * decision axes — roster (isSelected) and review status — before downloading.
 * Counts update live and always match what the table would show for the
 * same filters (shared `filterByDecision`).
 */
const VolunteerExportDialog = ({
  open,
  onClose,
  type, // plural: "judges"
  volunteers, // every application of this type (unfiltered)
  eventId,
  filterState, // { statusFilter, selectedFilter, preset, checkedInFilter, filter }
  searchText, // the workbench search box value (table mode)
}) => {
  const list = useMemo(
    () => (Array.isArray(volunteers) ? volunteers.filter(Boolean) : []),
    [volunteers],
  );
  const allStatuses = useMemo(() => statusBreakdown(list), [list]);

  const view = useMemo(
    () => ({
      search: searchText || filterState?.filter || "",
      checkedInFilter: filterState?.checkedInFilter || "all",
      preset: filterState?.preset || "none",
    }),
    [searchText, filterState],
  );
  const viewFilterLabels = useMemo(() => {
    const parts = [];
    if (view.search) parts.push(`search "${view.search}"`);
    if (view.checkedInFilter === "yes") parts.push("checked in only");
    if (view.checkedInFilter === "no") parts.push("not checked in only");
    if (view.preset === "ready") parts.push("Ready for roster preset");
    if (view.preset === "conflict") parts.push("Roster conflicts preset");
    return parts;
  }, [view]);
  const hasViewFilters = viewFilterLabels.length > 0;

  const [rosterScope, setRosterScope] = useState("all");
  const [statuses, setStatuses] = useState(() => new Set());
  const [keepView, setKeepView] = useState(false);
  const [columnSet, setColumnSet] = useState("all");

  // Re-seed from the live filters every time the dialog opens.
  useEffect(() => {
    if (!open) return;
    setRosterScope(
      filterState?.selectedFilter === "yes" ||
        filterState?.selectedFilter === "no"
        ? filterState.selectedFilter
        : "all",
    );
    const current = filterState?.statusFilter;
    setStatuses(
      new Set(
        current && current !== "all"
          ? [current]
          : allStatuses.map((s) => s.value),
      ),
    );
    setKeepView(hasViewFilters);
  }, [open]); // seed on open only — later filter changes shouldn't yank the admin's choices

  // Base list after the optional view filters — drives the roster counts.
  const base = useMemo(
    () =>
      scopeVolunteersForExport(list, {
        type,
        rosterScope: "all",
        statuses: null,
        keepView,
        view,
      }),
    [list, type, keepView, view],
  );
  const rosterCounts = useMemo(() => rosterBreakdown(base), [base]);
  // Status counts inside the chosen roster scope.
  const statusCounts = useMemo(
    () =>
      statusBreakdown(
        scopeVolunteersForExport(base, { type, rosterScope, statuses: null }),
      ),
    [base, type, rosterScope],
  );
  const statusValues = useMemo(
    () => allStatuses.map((s) => s.value),
    [allStatuses],
  );
  const everyStatusChecked = statusValues.every((v) => statuses.has(v));
  const statusesArg = everyStatusChecked ? null : Array.from(statuses);

  const rows = useMemo(
    () =>
      scopeVolunteersForExport(base, {
        type,
        rosterScope,
        statuses: statusesArg,
      }),
    [base, type, rosterScope, statusesArg],
  );
  const columns = useMemo(
    () => buildVolunteerExportColumns(type, rows, columnSet),
    [type, rows, columnSet],
  );

  const toggleStatus = (value) =>
    setStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });

  const handleDownload = () => {
    if (rows.length === 0) return;
    const scope = exportScopeSlug({
      rosterScope,
      statuses: statusesArg,
      allStatusCount: statusValues.length,
    });
    const filename = csvFilename(eventId, TYPE_LABELS[type] || type, scope);
    downloadCsv(filename, buildCsv(rows, columns));
    ga.trackStructuredEvent(
      ga.EventCategory.ADMIN,
      "admin_csv_export",
      `volunteer_${type}`,
      rows.length,
      {
        event_id: eventId || undefined,
        roster: rosterScope,
        statuses: statusesArg ? statusesArg.join("|") : "all",
        columns: columnSet,
        kept_view_filters: keepView,
      },
    );
    onClose?.();
  };

  const typeLabel = TYPE_LABELS[type] || type || "applications";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Download {typeLabel} CSV</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ fontWeight: 600, mb: 0.5 }}>
              Event roster
            </FormLabel>
            <RadioGroup
              row
              value={rosterScope}
              onChange={(e) => setRosterScope(e.target.value)}
            >
              {ROSTER_SCOPES.map((opt) => (
                <FormControlLabel
                  key={opt.value}
                  value={opt.value}
                  control={<Radio size="small" />}
                  label={`${opt.label} (${rosterCounts[opt.value] ?? 0})`}
                />
              ))}
            </RadioGroup>
            <Typography variant="caption" color="text.secondary">
              "On roster" = published on the public event page with participant
              tools unlocked.
            </Typography>
          </FormControl>

          <FormControl component="fieldset">
            <Box
              sx={{
                display: "flex",
                alignItems: "baseline",
                gap: 1.5,
                mb: 0.5,
              }}
            >
              <FormLabel component="legend" sx={{ fontWeight: 600 }}>
                Application status
              </FormLabel>
              <Link
                component="button"
                type="button"
                variant="caption"
                onClick={() => setStatuses(new Set(statusValues))}
              >
                All
              </Link>
              <Link
                component="button"
                type="button"
                variant="caption"
                onClick={() => setStatuses(new Set())}
              >
                None
              </Link>
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                columnGap: 2,
              }}
            >
              {statusCounts.map((s) => (
                <FormControlLabel
                  key={s.value}
                  control={
                    <Checkbox
                      size="small"
                      checked={statuses.has(s.value)}
                      onChange={() => toggleStatus(s.value)}
                    />
                  }
                  label={`${s.label} (${s.count})`}
                  sx={{ color: s.count === 0 ? "text.disabled" : "inherit" }}
                />
              ))}
            </Box>
          </FormControl>

          {hasViewFilters && (
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={keepView}
                  onChange={(e) => setKeepView(e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant="body2">
                    Keep the current view's other filters
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {viewFilterLabels.join(" · ")}
                  </Typography>
                </Box>
              }
            />
          )}

          <Divider />

          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ fontWeight: 600, mb: 0.5 }}>
              Columns
            </FormLabel>
            <RadioGroup
              value={columnSet}
              onChange={(e) => setColumnSet(e.target.value)}
            >
              {COLUMN_SETS.map((opt) => (
                <FormControlLabel
                  key={opt.value}
                  value={opt.value}
                  control={<Radio size="small" />}
                  label={
                    <Box>
                      <Typography variant="body2">{opt.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {opt.description}
                      </Typography>
                    </Box>
                  }
                  sx={{ alignItems: "flex-start", mb: 0.5 }}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between", px: 3 }}>
        <Typography
          variant="body2"
          color={rows.length === 0 ? "error" : "text.secondary"}
        >
          {rows.length === 0
            ? `No ${typeLabel} match these filters.`
            : `${rows.length} of ${list.length} ${typeLabel} · ${columns.length} columns`}
        </Typography>
        <Box>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            disabled={rows.length === 0}
            sx={{ ml: 1 }}
          >
            Download CSV
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default VolunteerExportDialog;
