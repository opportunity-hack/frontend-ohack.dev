import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import { Campaign as CampaignIcon } from "@mui/icons-material";
import BroadcastService from "../../../lib/broadcastService";
import useEmailTemplates from "../../../hooks/use-email-templates";
import { parseEmailsFromText } from "../../../lib/emailParsing";
import * as ga from "../../../lib/ga";
import BroadcastSourcePicker, {
  DEFAULT_SOURCE_SELECTION,
  buildSourcesPayload,
} from "./BroadcastSourcePicker";

const STEPS = ["Recipients", "Segment", "Compose", "Confirm & send"];
const PLACEHOLDER_RE = /\[[A-Z_ ]+\]/g;
const POLL_INTERVAL_MS = 3000;

const BroadcastComposer = ({
  apiServerUrl,
  accessToken,
  orgId,
  onSnack,
  onBroadcastSent,
}) => {
  const service = useMemo(
    () => new BroadcastService(apiServerUrl, accessToken, orgId),
    [apiServerUrl, accessToken, orgId],
  );
  const { templates } = useEmailTemplates({ accessToken, orgId });

  const [activeStep, setActiveStep] = useState(0);

  // Step 1: sources
  const [selection, setSelection] = useState(DEFAULT_SOURCE_SELECTION);
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Step 2: segment + sync
  const [segments, setSegments] = useState([]);
  const [segmentsLoading, setSegmentsLoading] = useState(false);
  const [segmentValue, setSegmentValue] = useState(null); // object from list or freeSolo string
  const [resolvedSegmentId, setResolvedSegmentId] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);
  const [syncStarting, setSyncStarting] = useState(false);
  const [syncSkipped, setSyncSkipped] = useState(false);
  const pollRef = useRef(null);

  // Step 3: compose
  const [subject, setSubject] = useState("");
  const [bodyMarkdown, setBodyMarkdown] = useState("");
  const [seedTemplateId, setSeedTemplateId] = useState("");
  const [placeholderAck, setPlaceholderAck] = useState(false);
  const [fromAddress, setFromAddress] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");

  // Step 4: send
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  const flatTemplates = useMemo(
    () =>
      Object.values(templates || {}).flatMap((group) =>
        (group.templates || []).map((t) => ({
          ...t,
          category: group.category,
        })),
      ),
    [templates],
  );

  const customEmails = useMemo(
    () => parseEmailsFromText(selection.customText),
    [selection.customText],
  );

  const foundPlaceholders = useMemo(
    () => [...new Set(bodyMarkdown.match(PLACEHOLDER_RE) || [])],
    [bodyMarkdown],
  );

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  const startPolling = useCallback(
    (segmentId) => {
      stopPolling();
      const poll = async () => {
        try {
          const data = await service.getSyncStatus(segmentId);
          const status = data.status || {};
          setSyncStatus(status);
          if (["done", "error", "stalled", "none"].includes(status.state)) {
            stopPolling();
            if (status.state === "done") {
              ga.trackStructuredEvent(
                ga.EventCategory.ADMIN,
                "broadcast_sync_completed",
                segmentId,
                status.added || 0,
              );
            }
          }
        } catch (error) {
          console.error("Sync status poll failed:", error);
        }
      };
      poll();
      pollRef.current = setInterval(poll, POLL_INTERVAL_MS);
    },
    [service, stopPolling],
  );

  const loadSegments = useCallback(async () => {
    try {
      setSegmentsLoading(true);
      const data = await service.listSegments();
      setSegments(data.segments || []);
    } catch (error) {
      onSnack?.(`Failed to load Resend segments: ${error.message}`, "error");
    } finally {
      setSegmentsLoading(false);
    }
  }, [service, onSnack]);

  useEffect(() => {
    if (activeStep === 1 && segments.length === 0 && !segmentsLoading) {
      loadSegments();
    }
    // segments/segmentsLoading/loadSegments intentionally omitted: this only
    // fires the initial load when the step is first opened.
  }, [activeStep]);

  const handlePreview = async () => {
    try {
      setPreviewLoading(true);
      const data = await service.previewSources({
        sources: buildSourcesPayload(selection),
        customEmails,
      });
      setPreview(data.stats);
      ga.trackStructuredEvent(
        ga.EventCategory.ADMIN,
        "broadcast_preview",
        "sources",
        data.stats?.union_total || 0,
      );
    } catch (error) {
      onSnack?.(`Preview failed: ${error.message}`, "error");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleStartSync = async () => {
    const isExisting = segmentValue && typeof segmentValue === "object";
    const segmentName =
      typeof segmentValue === "string" ? segmentValue.trim() : "";
    if (!isExisting && !segmentName) {
      onSnack?.(
        "Pick an existing segment or type a new segment name",
        "warning",
      );
      return;
    }

    try {
      setSyncStarting(true);
      setSyncSkipped(false);
      const data = await service.startSegmentSync({
        segmentId: isExisting ? segmentValue.id : undefined,
        segmentName: isExisting ? undefined : segmentName,
        sources: buildSourcesPayload(selection),
        customEmails,
      });
      setResolvedSegmentId(data.segment_id);
      setSyncStatus({ state: "running", collected: data.collected });
      startPolling(data.segment_id);
      ga.trackStructuredEvent(
        ga.EventCategory.ADMIN,
        "broadcast_sync_started",
        data.segment_id,
        data.collected || 0,
      );
    } catch (error) {
      if (error.status === 409 && error.data?.segment_id) {
        // Another admin's sync is running — just watch it.
        setResolvedSegmentId(error.data.segment_id);
        startPolling(error.data.segment_id);
        onSnack?.(
          "A sync for this segment is already running — watching it",
          "info",
        );
      } else {
        onSnack?.(`Sync failed to start: ${error.message}`, "error");
      }
    } finally {
      setSyncStarting(false);
    }
  };

  const handleSkipSync = () => {
    if (!(segmentValue && typeof segmentValue === "object")) {
      onSnack?.(
        "Skipping the sync requires picking an EXISTING segment",
        "warning",
      );
      return;
    }
    stopPolling();
    setResolvedSegmentId(segmentValue.id);
    setSyncSkipped(true);
    setSyncStatus(null);
  };

  const handleSeedTemplate = (templateId) => {
    setSeedTemplateId(templateId);
    const template = flatTemplates.find((t) => t.id === templateId);
    if (template) {
      setSubject((prev) => prev || template.title);
      setBodyMarkdown(template.message || "");
      setPlaceholderAck(false);
      ga.trackStructuredEvent(
        ga.EventCategory.ADMIN,
        "broadcast_template_seeded",
        templateId,
      );
    }
  };

  const handleCreateBroadcast = async (sendNow) => {
    try {
      setSending(true);
      const data = await service.createBroadcast({
        segmentId: resolvedSegmentId,
        subject,
        bodyMarkdown,
        name: subject,
        fromAddress: fromAddress.trim() || undefined,
        send: sendNow,
        scheduledAt: sendNow && scheduledAt ? scheduledAt : undefined,
      });
      setSendResult({
        ...data.broadcast,
        simulated: data.simulated,
        sentNow: sendNow,
      });
      ga.trackStructuredEvent(
        ga.EventCategory.ADMIN,
        sendNow ? "broadcast_sent" : "broadcast_created_draft",
        resolvedSegmentId,
        contactCount || 0,
      );
      onSnack?.(
        sendNow
          ? "Broadcast sent 🎉"
          : "Draft created — review it in the Resend dashboard, then send",
        "success",
      );
      onBroadcastSent?.();
    } catch (error) {
      onSnack?.(`Broadcast failed: ${error.message}`, "error");
    } finally {
      setSending(false);
    }
  };

  const handleReset = () => {
    stopPolling();
    setActiveStep(0);
    setPreview(null);
    setSegmentValue(null);
    setResolvedSegmentId(null);
    setSyncStatus(null);
    setSyncSkipped(false);
    setSubject("");
    setBodyMarkdown("");
    setSeedTemplateId("");
    setPlaceholderAck(false);
    setScheduledAt("");
    setSendResult(null);
  };

  const contactLimit = preview?.contact_limit || 1000;
  const contactCount =
    syncStatus?.projected_total ??
    (syncSkipped ? null : preview?.union_total) ??
    null;
  const overLimit = contactCount !== null && contactCount > contactLimit;

  const canLeaveSources = preview && preview.union_total > 0;
  const syncDone = syncStatus?.state === "done";
  const canLeaveSegment =
    Boolean(resolvedSegmentId) && (syncDone || syncSkipped);
  const canLeaveCompose =
    subject.trim() &&
    bodyMarkdown.trim() &&
    (foundPlaceholders.length === 0 || placeholderAck);

  const nextDisabled =
    (activeStep === 0 && !canLeaveSources) ||
    (activeStep === 1 && !canLeaveSegment) ||
    (activeStep === 2 && !canLeaveCompose);

  const segmentLabel =
    typeof segmentValue === "object" && segmentValue
      ? segmentValue.name
      : segmentValue || "";

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        <CampaignIcon sx={{ mr: 1, verticalAlign: "middle" }} />
        Broadcast via Resend
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Build a recipient list from your data sources, sync it into a Resend
        segment, and send one broadcast campaign — instead of one email per
        person. Unsubscribes are handled automatically by Resend.
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step 1: Recipients */}
      {activeStep === 0 && (
        <Box>
          <BroadcastSourcePicker
            selection={selection}
            onChange={(next) => {
              setSelection(next);
              setPreview(null);
            }}
            disabled={previewLoading}
          />
          <Box sx={{ mt: 2, display: "flex", gap: 2, alignItems: "center" }}>
            <Button
              variant="outlined"
              onClick={handlePreview}
              disabled={
                previewLoading ||
                (buildSourcesPayload(selection).length === 0 &&
                  customEmails.length === 0)
              }
              startIcon={previewLoading ? <CircularProgress size={16} /> : null}
            >
              Preview recipients
            </Button>
          </Box>

          {preview && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
                {Object.entries(preview.per_source || {}).map(
                  ([label, count]) => (
                    <Chip
                      key={label}
                      label={`${label}: ${count}`}
                      size="small"
                    />
                  ),
                )}
                {preview.custom_valid > 0 && (
                  <Chip
                    label={`custom: ${preview.custom_valid}`}
                    size="small"
                  />
                )}
                <Chip
                  label={`${preview.union_total} unique emails (${preview.overlap_removed} duplicates removed)`}
                  color="primary"
                  size="small"
                />
              </Box>
              {preview.custom_invalid?.length > 0 && (
                <Alert severity="warning" sx={{ mb: 1 }}>
                  Ignored invalid emails:{" "}
                  {preview.custom_invalid.slice(0, 5).join(", ")}
                  {preview.custom_invalid.length > 5 ? "…" : ""}
                </Alert>
              )}
              {preview.over_limit && (
                <Alert severity="warning">
                  Your Resend marketing tier caps contacts at{" "}
                  {contactLimit.toLocaleString()} — syncing{" "}
                  {preview.union_total.toLocaleString()} would exceed it, and
                  writes past the cap will fail. Narrow the sources, or upgrade
                  the marketing tier at resend.com/settings/billing.
                </Alert>
              )}
              {preview.union_total === 0 && (
                <Alert severity="error">
                  No recipients found — pick at least one source with contacts.
                </Alert>
              )}
            </Box>
          )}
        </Box>
      )}

      {/* Step 2: Segment */}
      {activeStep === 1 && (
        <Box>
          <Typography variant="body2" color="text.secondary" paragraph>
            Broadcasts are sent to a Resend segment (a stored contact list).
            Reuse a standing segment when possible — re-syncing only adds new
            contacts and never re-subscribes anyone who unsubscribed.
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Autocomplete
              freeSolo
              options={segments}
              loading={segmentsLoading}
              getOptionLabel={(opt) =>
                typeof opt === "string" ? opt : opt.name || ""
              }
              value={segmentValue}
              onChange={(e, value) => {
                setSegmentValue(value);
                setResolvedSegmentId(null);
                setSyncStatus(null);
                setSyncSkipped(false);
              }}
              onInputChange={(e, value, reason) => {
                if (reason === "input") {
                  setSegmentValue(value);
                  setResolvedSegmentId(null);
                  setSyncStatus(null);
                  setSyncSkipped(false);
                }
              }}
              sx={{ minWidth: 320 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Segment (pick existing or type a new name)"
                  size="small"
                />
              )}
            />
            <Button
              variant="contained"
              onClick={handleStartSync}
              disabled={syncStarting || syncStatus?.state === "running"}
              startIcon={syncStarting ? <CircularProgress size={16} /> : null}
            >
              Sync contacts into segment
            </Button>
            <Button
              variant="text"
              onClick={handleSkipSync}
              disabled={!(segmentValue && typeof segmentValue === "object")}
            >
              Use segment as-is (skip sync)
            </Button>
          </Box>

          {syncStatus && (
            <Box sx={{ mt: 2 }}>
              {syncStatus.state === "running" && (
                <>
                  <LinearProgress
                    variant={
                      syncStatus.to_add ? "determinate" : "indeterminate"
                    }
                    value={
                      syncStatus.to_add
                        ? Math.min(
                            100,
                            Math.round(
                              ((syncStatus.added || 0) / syncStatus.to_add) *
                                100,
                            ),
                          )
                        : undefined
                    }
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Syncing… {syncStatus.added || 0}
                    {syncStatus.to_add
                      ? ` of ${syncStatus.to_add} new`
                      : ""}{" "}
                    contacts added
                    {syncStatus.already_in_segment != null &&
                      ` (${syncStatus.already_in_segment} already in segment)`}
                  </Typography>
                </>
              )}
              {syncStatus.state === "done" && (
                <Alert severity="success">
                  Sync complete{syncStatus.simulated ? " (simulated)" : ""}:{" "}
                  {syncStatus.added || 0} added,{" "}
                  {syncStatus.already_in_segment || 0} already present
                  {syncStatus.failed > 0 && `, ${syncStatus.failed} failed`}.
                  Segment now has ~
                  {(syncStatus.projected_total || 0).toLocaleString()} contacts.
                  {syncStatus.over_limit && (
                    <>
                      {" "}
                      ⚠️ This exceeds your marketing tier's contact cap — some
                      writes may have failed.
                    </>
                  )}
                </Alert>
              )}
              {syncStatus.state === "stalled" && (
                <Alert
                  severity="warning"
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      onClick={handleStartSync}
                    >
                      Retry
                    </Button>
                  }
                >
                  The sync appears stalled (no heartbeat for 2+ minutes) — the
                  server worker may have restarted. Retrying is safe: already-
                  synced contacts are skipped.
                </Alert>
              )}
              {syncStatus.state === "error" && (
                <Alert
                  severity="error"
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      onClick={handleStartSync}
                    >
                      Retry
                    </Button>
                  }
                >
                  Sync failed: {syncStatus.error || "unknown error"}
                </Alert>
              )}
            </Box>
          )}
          {syncSkipped && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Using “{segmentLabel}” as-is — the recipients from step 1 were NOT
              added to it.
            </Alert>
          )}
        </Box>
      )}

      {/* Step 3: Compose */}
      {activeStep === 2 && (
        <Box>
          <FormControl size="small" sx={{ minWidth: 280, mb: 2 }}>
            <InputLabel>Seed from template (optional)</InputLabel>
            <Select
              value={seedTemplateId}
              label="Seed from template (optional)"
              onChange={(e) => handleSeedTemplate(e.target.value)}
            >
              <MenuItem value="">
                <em>Start blank</em>
              </MenuItem>
              {flatTemplates.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.icon} {t.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            minRows={8}
            label="Message (markdown supported)"
            value={bodyMarkdown}
            onChange={(e) => {
              setBodyMarkdown(e.target.value);
              setPlaceholderAck(false);
            }}
            helperText="An unsubscribe link is added automatically. For a personalized greeting you can use Resend merge tags like {{{FIRST_NAME|there}}}."
            sx={{ mb: 2 }}
          />

          {foundPlaceholders.length > 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                This message contains template placeholders that are{" "}
                <strong>NOT substituted in broadcasts</strong> — every recipient
                will see the literal text: {foundPlaceholders.join(", ")}. For
                per-recipient personalization use the Personalized mode instead.
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={placeholderAck}
                    onChange={(e) => setPlaceholderAck(e.target.checked)}
                    size="small"
                  />
                }
                label="Send the literal text anyway"
              />
            </Alert>
          )}

          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <TextField
              size="small"
              label="From (optional override)"
              placeholder="Opportunity Hack <updates@notify.ohack.dev>"
              value={fromAddress}
              onChange={(e) => setFromAddress(e.target.value)}
              helperText="Must be on a verified domain (notify.ohack.dev / apply.ohack.dev)"
              sx={{ minWidth: 320 }}
            />
            <TextField
              size="small"
              type="datetime-local"
              label="Schedule (optional)"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              InputLabelProps={{ shrink: true }}
              helperText="Leave blank to send immediately"
            />
          </Box>
        </Box>
      )}

      {/* Step 4: Confirm + send */}
      {activeStep === 3 && (
        <Box>
          {sendResult ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              {sendResult.sentNow
                ? "Broadcast sent!"
                : "Draft created — review and send it from the Resend dashboard or the status list below."}
              {sendResult.simulated && " (simulated — notifications disabled)"}
              {sendResult.id && (
                <Typography variant="caption" display="block">
                  Broadcast ID: {sendResult.id}
                </Typography>
              )}
            </Alert>
          ) : (
            <>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" gutterBottom>
                  <strong>Segment:</strong> {segmentLabel}{" "}
                  {contactCount !== null &&
                    `(~${contactCount.toLocaleString()} contacts)`}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Subject:</strong> {subject}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>From:</strong>{" "}
                  {fromAddress.trim() ||
                    "Opportunity Hack <updates@notify.ohack.dev> (default)"}
                </Typography>
                {scheduledAt && (
                  <Typography variant="body1" gutterBottom>
                    <strong>Scheduled:</strong> {scheduledAt}
                  </Typography>
                )}
              </Box>
              {overLimit && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  This segment (~{contactCount.toLocaleString()} contacts)
                  exceeds your Resend marketing tier cap of{" "}
                  {contactLimit.toLocaleString()} contacts. Contacts beyond the
                  cap were not stored and won&apos;t receive the broadcast.
                </Alert>
              )}
              <Alert severity="info" sx={{ mb: 2 }}>
                Unsubscribed contacts are excluded automatically, so delivered
                count can be lower than segment size. Broadcast sends don&apos;t
                count against the transactional email quota.
              </Alert>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => handleCreateBroadcast(false)}
                  disabled={sending}
                >
                  Save as draft
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleCreateBroadcast(true)}
                  disabled={sending}
                  startIcon={sending ? <CircularProgress size={16} /> : null}
                >
                  {scheduledAt ? "Schedule broadcast" : "Send now"}
                </Button>
              </Box>
            </>
          )}
        </Box>
      )}

      <Divider sx={{ my: 3 }} />
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Button
          disabled={activeStep === 0}
          onClick={() => setActiveStep((s) => s - 1)}
        >
          Back
        </Button>
        {activeStep < STEPS.length - 1 ? (
          <Button
            variant="contained"
            onClick={() => setActiveStep((s) => s + 1)}
            disabled={nextDisabled}
          >
            Next
          </Button>
        ) : (
          <Button onClick={handleReset}>Start another broadcast</Button>
        )}
      </Box>
    </Paper>
  );
};

export default BroadcastComposer;
