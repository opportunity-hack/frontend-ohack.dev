// THE volunteer-application edit dialog — one component for both the Table
// view (pencil icon) and Review mode ("Edit details"). Schema-driven from
// `volunteer/applicationSchema.js`; controlled (own formData), diff-based
// save.
//
// Two decisions live in a pinned bar above the fields and travel on separate
// transports (see buildPatch): Review = `status` (generic PATCH), Roster =
// `isSelected` (dedicated select route). Nothing decision-related is ever
// inside an accordion — that was the bug this dialog replaces.
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PublicIcon from "@mui/icons-material/Public";
import RateReviewIcon from "@mui/icons-material/RateReview";
import {
  normalizeStatus,
  rosterConflict,
  rosterReady,
  statusMeta,
} from "../../lib/applicationStatus";
import {
  buildCreatePayload,
  buildPatch,
  getEditableSections,
  getSchema,
  getSystemSection,
  hasChanges,
  toFormData,
  toSingularType,
  typeOf,
} from "./volunteer/applicationSchema";
import { StatusPicker } from "./volunteer/StatusControls";
import { ROSTER_CONSEQUENCES, RosterToggle } from "./volunteer/RosterControls";
import { applyBulkRow } from "./volunteer/bulkPaste";

// ---------------------------------------------------------------------------
// Module-scope pieces (never define components inside the dialog body — a
// remount on every keystroke would wipe in-progress edits).
// ---------------------------------------------------------------------------

const isHttpUrl = (v) => typeof v === "string" && /^https?:\/\/\S+$/i.test(v.trim());

const FULL_WIDTH_TYPES = new Set(["textarea", "multiselect", "artifacts"]);

const SectionHeader = ({ title }) => (
  <Grid size={{ xs: 12 }}>
    <Typography
      variant="overline"
      component="h3"
      sx={{ color: "text.secondary", letterSpacing: 1, display: "block", mt: 1 }}
    >
      {title}
    </Typography>
    <Divider />
  </Grid>
);

const ArtifactsEditor = ({ value, onChange, disabled }) => {
  const artifacts = Array.isArray(value) ? value : [];
  const update = (index, key, v) => {
    const next = artifacts.map((a, i) => (i === index ? { ...a, [key]: v } : a));
    onChange(next);
  };
  return (
    <Box>
      {artifacts.map((artifact, index) => (
        <Grid container spacing={1} key={index} sx={{ mb: 1 }} alignItems="center">
          <Grid size={{ xs: 12, sm: 2 }}>
            <TextField label="Type" size="small" fullWidth value={artifact?.type || ""} disabled={disabled}
              onChange={(e) => update(index, "type", e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField label="Label" size="small" fullWidth value={artifact?.label || ""} disabled={disabled}
              onChange={(e) => update(index, "label", e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField label="Comment" size="small" fullWidth value={artifact?.comment || ""} disabled={disabled}
              onChange={(e) => update(index, "comment", e.target.value)} />
          </Grid>
          <Grid size={{ xs: 10, sm: 3 }}>
            <TextField label="URL" size="small" fullWidth value={artifact?.url?.[0] || ""} disabled={disabled}
              onChange={(e) => update(index, "url", [e.target.value])} />
          </Grid>
          <Grid size={{ xs: 2, sm: 1 }}>
            <IconButton aria-label="Remove artifact" disabled={disabled}
              onClick={() => onChange(artifacts.filter((_, i) => i !== index))}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Grid>
        </Grid>
      ))}
      <Button size="small" startIcon={<AddIcon />} disabled={disabled}
        onClick={() => onChange([...artifacts, { type: "", label: "", comment: "", url: [""] }])}>
        Add artifact
      </Button>
    </Box>
  );
};

const SchemaField = ({ field, value, onChange, disabled }) => {
  const label = field.label;
  const set = (v) => onChange(field.key, field.normalize ? field.normalize(v) : v);

  switch (field.type) {
    case "readonly":
      return (
        <TextField label={label} size="small" fullWidth value={value ?? ""} disabled
          InputProps={{ readOnly: true }} />
      );
    case "switch":
      return (
        <FormControlLabel
          sx={{ ml: 0, mt: 0.5 }}
          control={<Switch size="small" checked={Boolean(value)} disabled={disabled} onChange={(e) => set(e.target.checked)} />}
          label={<Typography variant="body2">{label}</Typography>}
        />
      );
    case "textarea":
      return (
        <TextField label={label} size="small" fullWidth multiline minRows={3} maxRows={12}
          value={value ?? ""} disabled={disabled} onChange={(e) => set(e.target.value)} />
      );
    case "select":
    case "yesno": {
      const options = field.options || [];
      const current = value ?? "";
      const hasCurrent = !current || options.includes(current);
      return (
        <FormControl size="small" fullWidth disabled={disabled}>
          <InputLabel>{label}</InputLabel>
          <Select label={label} value={current} onChange={(e) => set(e.target.value)} displayEmpty={false}>
            <MenuItem value="">
              <em>Not set</em>
            </MenuItem>
            {!hasCurrent && (
              <MenuItem value={current}>{`${current} (legacy)`}</MenuItem>
            )}
            {options.map((opt) => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }
    case "multiselect":
      return (
        <Autocomplete
          multiple
          freeSolo
          size="small"
          disabled={disabled}
          options={field.options || []}
          value={Array.isArray(value) ? value : []}
          onChange={(_e, next) => set(next.map((v) => (typeof v === "string" ? v.trim() : v)).filter(Boolean))}
          renderTags={(tagValue, getTagProps) =>
            tagValue.map((option, index) => (
              <Chip size="small" label={option} {...getTagProps({ index })} key={`${option}-${index}`} />
            ))
          }
          renderInput={(params) => (
            <TextField {...params} label={label} helperText="Type and press Enter to add a value" />
          )}
        />
      );
    case "artifacts":
      return <ArtifactsEditor value={value} onChange={(v) => onChange(field.key, v)} disabled={disabled} />;
    case "url":
      return (
        <TextField
          label={label} size="small" fullWidth type="url" value={value ?? ""} disabled={disabled}
          onChange={(e) => set(e.target.value)}
          InputProps={{
            endAdornment: isHttpUrl(value) ? (
              <InputAdornment position="end">
                <IconButton size="small" component={Link} href={value} target="_blank" rel="noopener noreferrer" aria-label={`Open ${label}`}>
                  <OpenInNewIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />
      );
    case "email":
      return (
        <TextField label={label} size="small" fullWidth type="email" value={value ?? ""} disabled={disabled}
          onChange={(e) => set(e.target.value)} />
      );
    default:
      return (
        <TextField label={label} size="small" fullWidth value={value ?? ""} disabled={disabled}
          onChange={(e) => set(e.target.value)} />
      );
  }
};

// The pinned two-pane decision bar: Review (status) | Event roster (isSelected).
const DecisionBar = ({ decision, onStatus, onRoster, disabled, original, isMobile }) => {
  const meta = statusMeta(decision.status);
  const preview = { status: decision.status, isSelected: decision.isSelected };
  const ready = rosterReady(preview);
  const conflict = rosterConflict(preview);
  return (
    <Box sx={{ position: "sticky", top: 0, zIndex: 2, bgcolor: "background.paper", pt: 1, pb: 1.5 }}>
      <Paper variant="outlined" sx={{ p: 1.5 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ borderRight: { sm: 1 }, borderColor: { sm: "divider" }, pr: { sm: 2 } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
              <RateReviewIcon fontSize="small" color="action" />
              <Typography variant="overline" sx={{ lineHeight: 1, color: "text.secondary" }}>Review</Typography>
            </Box>
            <StatusPicker value={decision.status} onChange={onStatus} disabled={disabled} label="Application status" />
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
              {meta.description}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
              <PublicIcon fontSize="small" color={decision.isSelected ? "primary" : "action"} />
              <Typography variant="overline" sx={{ lineHeight: 1, color: "text.secondary" }}>Event roster</Typography>
            </Box>
            <RosterToggle checked={decision.isSelected} onChange={onRoster} disabled={disabled} />
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
              {ROSTER_CONSEQUENCES}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      {(ready || conflict) && (
        <Alert severity="warning" sx={{ mt: 1, py: 0 }} icon={false}>
          <Typography variant="body2">
            {ready
              ? `${meta.label} but not on the roster — they won't see participant tools or appear on the event page yet.`
              : `On the roster although the review is ${meta.label.toLowerCase()} — they still show on the event page. Remove them?`}
          </Typography>
        </Alert>
      )}
      {isMobile && original?.email && (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
          {original.email}
        </Typography>
      )}
    </Box>
  );
};

const formatDate = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

// ---------------------------------------------------------------------------

const VolunteerEditDialog = ({
  open,
  onClose,
  volunteer,
  volunteerType,
  onSave,
  isAdding = false,
  saving = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const type = useMemo(() => typeOf(volunteer, volunteerType) || toSingularType(volunteerType) || "volunteer", [volunteer, volunteerType]);
  const schema = getSchema(type);
  const sections = useMemo(() => getEditableSections(type), [type]);
  const systemSection = useMemo(() => getSystemSection(type), [type]);

  const [formData, setFormData] = useState({});
  const [decision, setDecision] = useState({ status: "pending", isSelected: false });
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [copied, setCopied] = useState(false);

  // Reset ONLY when the dialog opens or the target row changes — never on
  // every `volunteer` reference, or optimistic list updates would clobber
  // in-progress edits.
  const rowId = volunteer?.id || null;
  useEffect(() => {
    if (!open) return;
    setFormData(toFormData(volunteer || {}, type));
    setDecision({
      status: normalizeStatus(volunteer?.status),
      isSelected: Boolean(volunteer?.isSelected),
    });
    setConfirmDiscard(false);
    setBulkText("");
  }, [open, rowId, isAdding, type]);

  const diff = useMemo(
    () => buildPatch(volunteer || {}, formData, type, decision),
    [volunteer, formData, type, decision]
  );
  const dirty = isAdding ? Boolean(formData.name || formData.email) : hasChanges(diff);
  const changedCount = Object.keys(diff.patch || {}).filter((k) => k !== "id" && k !== "status").length;

  const setField = useCallback((key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const requestClose = useCallback(() => {
    if (saving) return;
    if (dirty) {
      setConfirmDiscard(true);
      return;
    }
    onClose?.();
  }, [dirty, saving, onClose]);

  const handleSave = useCallback(() => {
    if (!onSave || saving) return;
    if (isAdding) {
      onSave({
        create: buildCreatePayload(formData, type, decision),
        roster: decision.isSelected ? true : null,
      });
      return;
    }
    if (!dirty) return;
    onSave(diff);
  }, [onSave, saving, isAdding, formData, type, decision, dirty, diff]);

  const handleApplyBulk = useCallback(() => {
    const mapped = applyBulkRow(bulkText, type);
    if (!mapped || Object.keys(mapped).length === 0) return;
    setFormData((prev) => ({ ...prev, ...toFormData({ ...prev, ...mapped }, type) }));
    setBulkText("");
  }, [bulkText, type]);

  const copyId = useCallback(() => {
    if (!rowId || typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(rowId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [rowId]);

  if (!open) return null;

  const title = isAdding
    ? `Add ${schema.title.toLowerCase()}`
    : `Edit ${schema.title.toLowerCase()} — ${volunteer?.name || "application"}`;
  const applied = formatDate(volunteer?.timestamp || volunteer?.created_timestamp);

  const footerSummary = isAdding
    ? decision.isSelected
      ? "New application · roster: on"
      : "New application"
    : [
        changedCount > 0 ? `${changedCount} field${changedCount === 1 ? "" : "s"} changed` : null,
        diff.patch?.status ? `status → ${statusMeta(diff.patch.status).label}` : null,
        diff.roster === null ? null : `roster: ${diff.roster ? "on" : "off"}`,
      ]
        .filter(Boolean)
        .join(" · ") || "No changes";

  return (
    <Dialog
      open={open}
      onClose={requestClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      aria-labelledby="volunteer-edit-title"
    >
      <DialogTitle id="volunteer-edit-title" sx={{ pb: 0.5, pr: 6 }}>
        <Typography variant={isMobile ? "h6" : "h5"} component="h2" sx={{ lineHeight: 1.2 }}>
          {title}
        </Typography>
        {!isAdding && (
          <Typography variant="body2" color="text.secondary" component="div" sx={{ mt: 0.5, display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
            {volunteer?.email && <span>{volunteer.email}</span>}
            {applied && <span>· applied {applied}</span>}
            {rowId && (
              <Tooltip title={copied ? "Copied" : "Copy id"}>
                <Chip
                  size="small"
                  variant="outlined"
                  icon={<ContentCopyIcon sx={{ fontSize: 14 }} />}
                  label={`id ${String(rowId).slice(0, 8)}…`}
                  onClick={copyId}
                  sx={{ fontFamily: "monospace" }}
                />
              </Tooltip>
            )}
          </Typography>
        )}
        <IconButton aria-label="Close" onClick={requestClose} size="small" sx={{ position: "absolute", right: 8, top: 8 }} disabled={saving}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 0 }}>
        <DecisionBar
          decision={decision}
          onStatus={(status) => setDecision((d) => ({ ...d, status: normalizeStatus(status) }))}
          onRoster={(on) => setDecision((d) => ({ ...d, isSelected: Boolean(on) }))}
          disabled={saving}
          original={volunteer}
          isMobile={isMobile}
        />

        {isAdding && (type === "judge" || type === "mentor") && (
          <Accordion variant="outlined" sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body2">Paste a row from Google Sheets</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TextField
                multiline minRows={3} fullWidth size="small"
                placeholder="Header row + one data row, tab-separated"
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                sx={{ mb: 1 }}
              />
              <Button size="small" variant="outlined" onClick={handleApplyBulk} disabled={!bulkText.trim()}>
                Fill fields from row
              </Button>
            </AccordionDetails>
          </Accordion>
        )}

        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {sections.map((section) => (
            <React.Fragment key={section.id}>
              <SectionHeader title={section.title} />
              {section.fields
                .filter((field) => field.type !== "readonly")
                .map((field) => (
                  <Grid size={{ xs: 12, sm: FULL_WIDTH_TYPES.has(field.type) ? 12 : 6 }} key={field.key}>
                    {field.key === "photoUrl" ? (
                      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                        <Avatar src={isHttpUrl(formData.photoUrl) ? formData.photoUrl : undefined} sx={{ width: 40, height: 40 }} />
                        <Box sx={{ flex: 1 }}>
                          <SchemaField field={field} value={formData[field.key]} onChange={setField} disabled={saving} />
                        </Box>
                      </Box>
                    ) : (
                      <SchemaField field={field} value={formData[field.key]} onChange={setField} disabled={saving} />
                    )}
                  </Grid>
                ))}
            </React.Fragment>
          ))}
        </Grid>

        {!isAdding && (
          <Accordion variant="outlined" sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body2" color="text.secondary">System (read-only)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={1.5}>
                {systemSection.fields
                  .filter((field) => volunteer?.[field.key] !== undefined && volunteer?.[field.key] !== null && volunteer?.[field.key] !== "")
                  .map((field) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={field.key}>
                      <SchemaField field={field} value={typeof volunteer[field.key] === "object" ? JSON.stringify(volunteer[field.key]) : String(volunteer[field.key])} onChange={() => {}} disabled />
                    </Grid>
                  ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        )}

        {confirmDiscard && (
          <Alert
            severity="warning"
            sx={{ mt: 2 }}
            action={
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button size="small" onClick={() => setConfirmDiscard(false)}>Keep editing</Button>
                <Button size="small" color="warning" variant="contained" onClick={() => { setConfirmDiscard(false); onClose?.(); }}>
                  Discard
                </Button>
              </Box>
            }
          >
            Discard unsaved changes?
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 1.5, justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
        <Typography variant="caption" color="text.secondary">{footerSummary}</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button onClick={requestClose} disabled={saving}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving || !dirty}
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}
          >
            {isAdding ? "Add" : "Save changes"}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default VolunteerEditDialog;
