import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  Link,
  Paper,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Send as SendIcon,
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  StrikethroughS as StrikeIcon,
  Code as CodeIcon,
  Link as LinkIcon,
  FormatListBulleted as BulletIcon,
  Campaign as NotifyIcon,
  AutoFixHigh as FixIcon,
  Lock as LockIcon,
  Tag as TagIcon,
  OpenInNew as OpenInNewIcon,
  Replay as ReuseIcon,
  DeleteOutline as ClearIcon,
  PersonOutline as SelfIcon,
} from "@mui/icons-material";

import * as ga from "../../lib/ga";
import slackMessageApi, { FALLBACK_CHANNELS } from "../../lib/slackMessageApi";
import {
  SLACK_MESSAGE_LIMIT,
  broadcastMentions,
  lintSlackMessage,
  markdownToMrkdwn,
  parseMrkdwn,
} from "../../lib/slackMrkdwn";

const DRAFT_KEY = "ohack.adminSlack.draft";
const HISTORY_KEY = "ohack.adminSlack.history";
const HISTORY_MAX = 10;
const BOT_ICON =
  "https://cdn.ohack.dev/ohack.dev/logos/OpportunityHack_2Letter_Light_Blue.png";

const readStored = (key, fallback) => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
};

const writeStored = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // Private mode / full storage: the composer still works without it.
  }
};

const cleanChannel = (value) =>
  String(value || "")
    .trim()
    .replace(/^#+/, "")
    .trim()
    .toLowerCase();

/* ---------- Preview (module scope: never remounts while typing) ---------- */

const mentionSx = {
  bgcolor: "rgba(29, 155, 209, 0.12)",
  color: "#1264a3",
  borderRadius: "3px",
  px: "2px",
};

function Tokens({ tokens }) {
  return tokens.map((token, index) => {
    const key = `${token.type}-${index}`;
    switch (token.type) {
      case "bold":
        return (
          <strong key={key}>
            <Tokens tokens={token.children} />
          </strong>
        );
      case "italic":
        return (
          <em key={key}>
            <Tokens tokens={token.children} />
          </em>
        );
      case "strike":
        return (
          <s key={key}>
            <Tokens tokens={token.children} />
          </s>
        );
      case "code":
        return (
          <Box
            key={key}
            component="code"
            sx={{
              fontFamily: "Monaco, Menlo, Consolas, monospace",
              fontSize: "0.85em",
              color: "#e01e5a",
              bgcolor: "rgba(29,28,29,0.04)",
              border: "1px solid rgba(29,28,29,0.13)",
              borderRadius: "3px",
              px: "3px",
            }}
          >
            {token.value}
          </Box>
        );
      case "link":
        return (
          <Link
            key={key}
            href={token.url}
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            sx={{ color: "#1264a3" }}
          >
            {token.label}
          </Link>
        );
      case "broadcast":
        return (
          <Box
            key={key}
            component="span"
            sx={{ ...mentionSx, bgcolor: "rgba(242,199,68,0.4)", color: "#1d1c1d" }}
          >
            @{token.value}
          </Box>
        );
      case "user":
        return (
          <Box key={key} component="span" sx={mentionSx}>
            @{token.value}
          </Box>
        );
      case "channel":
        return (
          <Box key={key} component="span" sx={mentionSx}>
            #{token.value}
          </Box>
        );
      case "emoji":
        return token.value ? (
          <span key={key} role="img" aria-label={token.code}>
            {token.value}
          </span>
        ) : (
          <Tooltip
            key={key}
            title="Not in this preview's emoji set. Slack will draw it if the workspace has it."
          >
            <Box component="span" sx={{ color: "text.secondary" }}>
              :{token.code}:
            </Box>
          </Tooltip>
        );
      default:
        return <React.Fragment key={key}>{token.value}</React.Fragment>;
    }
  });
}

function SlackPreview({ text, channel }) {
  const lines = useMemo(() => parseMrkdwn(text), [text]);
  const empty = !text.trim();
  return (
    <Paper
      variant="outlined"
      sx={{ p: 2, bgcolor: "#fff", color: "#1d1c1d", minHeight: 220 }}
      aria-label="Slack preview"
    >
      <Typography variant="caption" sx={{ color: "#616061", display: "block", mb: 1 }}>
        {channel ? `#${channel}` : "Pick a channel"}
      </Typography>
      <Box sx={{ display: "flex", gap: 1.25 }}>
        <Box
          component="img"
          src={BOT_ICON}
          alt=""
          width={36}
          height={36}
          sx={{ borderRadius: "6px", flexShrink: 0 }}
        />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.75, mb: 0.25 }}>
            <Typography sx={{ fontWeight: 800, fontSize: 15 }}>Hackathon Bot</Typography>
            <Box
              component="span"
              sx={{
                fontSize: 10,
                fontWeight: 700,
                bgcolor: "rgba(29,28,29,0.13)",
                color: "#616061",
                borderRadius: "2px",
                px: "3px",
              }}
            >
              APP
            </Box>
            <Typography sx={{ fontSize: 12, color: "#616061" }}>now</Typography>
          </Box>
          {empty ? (
            <Typography sx={{ fontSize: 15, color: "#868686" }}>
              Your message will appear here as Slack shows it.
            </Typography>
          ) : (
            <Box sx={{ fontSize: 15, lineHeight: 1.46668, overflowWrap: "anywhere" }}>
              {lines.map((line, index) => {
                const key = `l-${index}`;
                if (line.kind === "blank") {
                  return <Box key={key} sx={{ height: "0.73em" }} />;
                }
                if (line.kind === "quote") {
                  return (
                    <Box
                      key={key}
                      sx={{ borderLeft: "4px solid #ddd", pl: 1.5 }}
                    >
                      <Tokens tokens={line.tokens} />
                    </Box>
                  );
                }
                return (
                  <Box key={key}>
                    <Tokens tokens={line.tokens} />
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
}

/* ------------------------------ Composer ------------------------------ */

const SlackMessageComposer = ({ accessToken, orgId, onSnack }) => {
  const [channel, setChannel] = useState("");
  const [text, setText] = useState("");
  const [unfurlLinks, setUnfurlLinks] = useState(false);
  const [channels, setChannels] = useState({ status: "idle", list: [], error: "" });
  const [sending, setSending] = useState(null); // "test" | "send" | null
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState("");
  const [lastSent, setLastSent] = useState(null);
  const [history, setHistory] = useState([]);
  const inputRef = useRef(null);
  const hydratedRef = useRef(false);

  // PropelAuth rotates the token on tab refocus: read it through refs so
  // nothing here refetches (or loses typed text) when it changes.
  const tokenRef = useRef(accessToken);
  const orgRef = useRef(orgId);
  tokenRef.current = accessToken;
  orgRef.current = orgId;
  const hasToken = Boolean(accessToken);

  useEffect(() => {
    const draft = readStored(DRAFT_KEY, null);
    if (draft) {
      setChannel(cleanChannel(draft.channel));
      setText(typeof draft.text === "string" ? draft.text : "");
    }
    const stored = readStored(HISTORY_KEY, []);
    setHistory(Array.isArray(stored) ? stored : []);
    hydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return undefined;
    const timer = setTimeout(() => writeStored(DRAFT_KEY, { channel, text }), 400);
    return () => clearTimeout(timer);
  }, [channel, text]);

  const loadChannels = useCallback(async () => {
    if (!tokenRef.current) return;
    setChannels((prev) => ({ ...prev, status: "loading", error: "" }));
    try {
      const list = await slackMessageApi.listChannels(tokenRef.current, orgRef.current);
      setChannels({ status: "ready", list, error: "" });
    } catch (e) {
      setChannels({
        status: "error",
        list: [],
        error:
          e.status === 404
            ? "The channel list needs a newer backend. You can still type a channel name."
            : `${e.message}. You can still type a channel name.`,
      });
    }
  }, []);

  useEffect(() => {
    if (hasToken) loadChannels();
  }, [hasToken, loadChannels]);

  const channelOptions = useMemo(
    () =>
      channels.list.length
        ? channels.list.map((c) => c.name).filter(Boolean)
        : FALLBACK_CHANNELS,
    [channels.list],
  );
  const channelInfo = useMemo(
    () => channels.list.find((c) => c.name === channel) || null,
    [channels.list, channel],
  );
  const issues = useMemo(() => lintSlackMessage(text), [text]);
  const broadcasts = useMemo(() => broadcastMentions(text), [text]);
  const hasError = issues.some((issue) => issue.severity === "error");
  const fixable = issues.some((issue) => issue.fixable);
  const length = text.trim().length;
  const canTest = length > 0 && !hasError && !sending;
  const canSend = canTest && Boolean(channel);
  const unknownChannel =
    channels.status === "ready" && Boolean(channel) && !channelInfo;

  /** Wrap the selection (or insert a placeholder) and keep it selected. */
  const applyWrap = (before, after, placeholder) => {
    const el = inputRef.current;
    const start = el?.selectionStart ?? text.length;
    const end = el?.selectionEnd ?? text.length;
    const selected = text.slice(start, end) || placeholder;
    const next = `${text.slice(0, start)}${before}${selected}${after}${text.slice(end)}`;
    setText(next);
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  };

  const insertAtCursor = (snippet) => {
    const el = inputRef.current;
    const start = el?.selectionStart ?? text.length;
    const end = el?.selectionEnd ?? text.length;
    setText(`${text.slice(0, start)}${snippet}${text.slice(end)}`);
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      el.setSelectionRange(start + snippet.length, start + snippet.length);
    });
  };

  const insertLink = () => {
    const el = inputRef.current;
    const start = el?.selectionStart ?? text.length;
    const end = el?.selectionEnd ?? text.length;
    const selected = text.slice(start, end);
    if (/^https?:\/\//.test(selected)) applyWrap("<", "|link text>", "");
    else applyWrap("<https://|", ">", "link text");
  };

  const bulletLines = () => {
    const el = inputRef.current;
    const start = el?.selectionStart ?? text.length;
    const end = el?.selectionEnd ?? text.length;
    const lineStart = text.lastIndexOf("\n", start - 1) + 1;
    const block = text.slice(lineStart, end) || "";
    const bulleted = block
      .split("\n")
      .map((line) => (line.trim() && !line.startsWith("• ") ? `• ${line}` : line))
      .join("\n");
    setText(`${text.slice(0, lineStart)}${bulleted || "• "}${text.slice(end)}`);
    requestAnimationFrame(() => el?.focus());
  };

  const handlePaste = (event) => {
    // Rich text copied from a doc arrives as Markdown-ish plain text; leave
    // it alone here and let the "Fix formatting" lint offer the conversion.
    const pasted = event.clipboardData?.getData("text/plain");
    if (pasted && !text.trim() && !pasted.includes("\n") && /^#/.test(pasted)) {
      // A lone "#channel" pasted into an empty box is almost always meant
      // for the channel field.
      const name = cleanChannel(pasted);
      if (/^[a-z0-9][a-z0-9._-]*$/.test(name)) {
        event.preventDefault();
        setChannel(name);
      }
    }
  };

  const recordHistory = (entry) => {
    setHistory((prev) => {
      const next = [entry, ...prev].slice(0, HISTORY_MAX);
      writeStored(HISTORY_KEY, next);
      return next;
    });
  };

  const send = async (toSelf) => {
    setSending(toSelf ? "test" : "send");
    setError("");
    const message = text.trim();
    try {
      const result = await slackMessageApi.send(tokenRef.current, orgRef.current, {
        message,
        channel,
        toSelf,
        unfurlLinks,
      });
      ga.trackStructuredEvent(
        ga.EventCategory.ADMIN,
        toSelf ? "admin_slack_message_test" : "admin_slack_message_sent",
        toSelf ? "self" : channel,
        message.length,
      );
      if (toSelf) {
        onSnack?.("Test sent. Check your Slack direct messages.", "success");
        setLastSent({ ...result, test: true });
      } else {
        const entry = {
          channel,
          text: message,
          at: new Date().toISOString(),
          permalink: result.permalink || null,
        };
        recordHistory(entry);
        setLastSent({ ...result, test: false, channelName: channel });
        setText("");
        setConfirmOpen(false);
        onSnack?.(
          result.unverified
            ? `Sent to #${channel}. This backend can't confirm delivery; check the channel.`
            : `Posted to #${channel}.`,
          result.unverified ? "warning" : "success",
        );
      }
    } catch (e) {
      setConfirmOpen(false);
      setError(e.message || "Could not send the Slack message.");
    } finally {
      setSending(null);
    }
  };

  const toolbar = [
    { label: "Bold", icon: <BoldIcon fontSize="small" />, run: () => applyWrap("*", "*", "bold text") },
    { label: "Italic", icon: <ItalicIcon fontSize="small" />, run: () => applyWrap("_", "_", "italic text") },
    { label: "Strikethrough", icon: <StrikeIcon fontSize="small" />, run: () => applyWrap("~", "~", "text") },
    { label: "Code", icon: <CodeIcon fontSize="small" />, run: () => applyWrap("`", "`", "code") },
    { label: "Link", icon: <LinkIcon fontSize="small" />, run: insertLink },
    { label: "Bullets", icon: <BulletIcon fontSize="small" />, run: bulletLines },
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Send a message to Slack
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 760 }}>
        Posts as Hackathon Bot. Write in Slack formatting: <code>*bold*</code>,{" "}
        <code>_italic_</code>, <code>{"<https://url|link text>"}</code> and{" "}
        <code>:emoji:</code> codes. The preview shows what the channel will see.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {lastSent && !error && (
        <Alert
          severity={lastSent.unverified ? "warning" : "success"}
          sx={{ mb: 2 }}
          onClose={() => setLastSent(null)}
          action={
            lastSent.permalink ? (
              <Button
                color="inherit"
                size="small"
                href={lastSent.permalink}
                target="_blank"
                rel="noopener noreferrer"
                endIcon={<OpenInNewIcon fontSize="small" />}
              >
                View in Slack
              </Button>
            ) : null
          }
        >
          {lastSent.test
            ? "Test sent to your Slack direct messages. Nothing was posted to a channel."
            : `Posted to #${lastSent.channelName}.`}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Autocomplete
            freeSolo
            options={channelOptions}
            value={channel}
            inputValue={channel}
            onInputChange={(_, value) => setChannel(cleanChannel(value))}
            loading={channels.status === "loading"}
            renderOption={(props, option) => {
              const info = channels.list.find((c) => c.name === option);
              const { key, ...rest } = props;
              return (
                <Box component="li" key={key} {...rest} sx={{ gap: 1 }}>
                  {info?.is_private ? (
                    <LockIcon fontSize="small" color="action" />
                  ) : (
                    <TagIcon fontSize="small" color="action" />
                  )}
                  <Box sx={{ flex: 1 }}>{option}</Box>
                  {info && typeof info.num_members === "number" && (
                    <Typography variant="caption" color="text.secondary">
                      {info.num_members.toLocaleString()} members
                    </Typography>
                  )}
                </Box>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Channel"
                placeholder="general"
                size="small"
                helperText={
                  channels.status === "error"
                    ? channels.error
                    : unknownChannel
                      ? "Not in the channel list. A private channel works only after the bot is invited."
                      : channelInfo
                        ? `${channelInfo.is_private ? "Private" : "Public"} channel${
                            typeof channelInfo.num_members === "number"
                              ? ` · ${channelInfo.num_members.toLocaleString()} members`
                              : ""
                          }${channelInfo.is_member ? "" : " · the bot joins when you send"}`
                        : "Search by name. Private channels appear once the bot is a member."
                }
                slotProps={{
                  input: {
                    ...params.InputProps,
                    startAdornment: (
                      <Box component="span" sx={{ color: "text.secondary", pl: 0.5 }}>
                        #
                      </Box>
                    ),
                    endAdornment: (
                      <>
                        {channels.status === "loading" ? (
                          <CircularProgress color="inherit" size={16} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  },
                }}
              />
            )}
            sx={{ mb: 2 }}
          />

          <Paper variant="outlined" sx={{ overflow: "hidden" }}>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 0.25,
                px: 0.5,
                py: 0.25,
                borderBottom: 1,
                borderColor: "divider",
                bgcolor: "action.hover",
              }}
            >
              {toolbar.map((item) => (
                <Tooltip key={item.label} title={item.label}>
                  <IconButton size="small" onClick={item.run} aria-label={item.label}>
                    {item.icon}
                  </IconButton>
                </Tooltip>
              ))}
              <Box sx={{ flex: 1 }} />
              <Tooltip title="Notifies everyone in the channel">
                <Button
                  size="small"
                  startIcon={<NotifyIcon fontSize="small" />}
                  onClick={() => insertAtCursor("<!channel> ")}
                  sx={{ textTransform: "none" }}
                >
                  Notify @channel
                </Button>
              </Tooltip>
              <Tooltip title="Notifies people who are active right now">
                <Button
                  size="small"
                  onClick={() => insertAtCursor("<!here> ")}
                  sx={{ textTransform: "none" }}
                >
                  @here
                </Button>
              </Tooltip>
            </Box>
            <TextField
              multiline
              fullWidth
              minRows={10}
              maxRows={28}
              variant="standard"
              placeholder={
                ":trophy: Fall 2026 hackathon update\n\nWrite the announcement here. Leave a blank line between paragraphs."
              }
              value={text}
              onChange={(e) => setText(e.target.value)}
              onPaste={handlePaste}
              disabled={Boolean(sending)}
              inputRef={inputRef}
              slotProps={{
                input: { disableUnderline: true },
                htmlInput: { "aria-label": "Slack message", spellCheck: true },
              }}
              sx={{
                px: 1.5,
                py: 1,
                "& textarea": { fontSize: 15, lineHeight: 1.5 },
              }}
            />
          </Paper>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 0.5,
              mb: 1,
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={unfurlLinks}
                  onChange={(e) => setUnfurlLinks(e.target.checked)}
                />
              }
              label={
                <Typography variant="body2">Show link previews under the message</Typography>
              }
            />
            <Typography
              variant="caption"
              color={length > SLACK_MESSAGE_LIMIT ? "error" : "text.secondary"}
            >
              {length.toLocaleString()} / {SLACK_MESSAGE_LIMIT.toLocaleString()}
            </Typography>
          </Box>

          <Stack spacing={1} sx={{ mb: 2 }}>
            {issues.map((issue) => (
              <Alert
                key={issue.id}
                severity={issue.severity}
                action={
                  issue.fixable ? (
                    <Button
                      color="inherit"
                      size="small"
                      startIcon={<FixIcon fontSize="small" />}
                      onClick={() => setText(markdownToMrkdwn(text))}
                    >
                      Fix formatting
                    </Button>
                  ) : null
                }
              >
                {issue.message}
              </Alert>
            ))}
          </Stack>

          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              disabled={!canSend}
              onClick={() => setConfirmOpen(true)}
            >
              {channel ? `Send to #${channel}` : "Send"}
            </Button>
            <Tooltip title="Sends this message only to you, as a direct message from the bot">
              <span>
                <Button
                  variant="outlined"
                  startIcon={
                    sending === "test" ? <CircularProgress size={16} /> : <SelfIcon />
                  }
                  disabled={!canTest}
                  onClick={() => send(true)}
                >
                  Send a test to me
                </Button>
              </span>
            </Tooltip>
            {(text || fixable) && (
              <Button
                color="inherit"
                startIcon={<ClearIcon />}
                disabled={Boolean(sending) || !text}
                onClick={() => setText("")}
              >
                Clear
              </Button>
            )}
          </Box>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Typography variant="overline" color="text.secondary">
            Preview
          </Typography>
          <SlackPreview text={text} channel={channel} />

          {history.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography variant="overline" color="text.secondary">
                  Sent from this browser
                </Typography>
                <Button
                  size="small"
                  color="inherit"
                  onClick={() => {
                    setHistory([]);
                    writeStored(HISTORY_KEY, []);
                  }}
                >
                  Clear list
                </Button>
              </Box>
              <Stack spacing={1}>
                {history.map((entry) => (
                  <Paper
                    key={`${entry.at}-${entry.channel}`}
                    variant="outlined"
                    sx={{ p: 1.25, display: "flex", gap: 1, alignItems: "center" }}
                  >
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="body2" noWrap>
                        {entry.text.split("\n")[0]}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        #{entry.channel} · {new Date(entry.at).toLocaleString()}
                      </Typography>
                    </Box>
                    {entry.permalink && (
                      <Tooltip title="View in Slack">
                        <IconButton
                          size="small"
                          href={entry.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="View in Slack"
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Copy into the editor">
                      <IconButton
                        size="small"
                        aria-label="Copy into the editor"
                        onClick={() => {
                          setText(entry.text);
                          setChannel(entry.channel);
                          inputRef.current?.focus();
                        }}
                      >
                        <ReuseIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}
        </Grid>
      </Grid>

      <Dialog
        open={confirmOpen}
        onClose={() => (sending ? null : setConfirmOpen(false))}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Send to #{channel}?</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {channelInfo && typeof channelInfo.num_members === "number" && (
                <Chip
                  size="small"
                  label={`${channelInfo.num_members.toLocaleString()} members`}
                />
              )}
              <Chip size="small" label={`${length.toLocaleString()} characters`} />
              <Chip
                size="small"
                label={unfurlLinks ? "Link previews on" : "Link previews off"}
              />
            </Box>
            {broadcasts.length > 0 && (
              <Alert severity="warning">
                This sends a notification to{" "}
                {broadcasts.includes("here") && broadcasts.length === 1
                  ? "everyone active in the channel"
                  : "everyone in the channel"}
                .
              </Alert>
            )}
            {unknownChannel && (
              <Alert severity="info">
                #{channel} is not in the channel list. If it is private, invite the bot
                first or the send will be refused.
              </Alert>
            )}
            <Typography variant="body2" color="text.secondary">
              A posted message can't be edited or deleted from this page.
            </Typography>
          </Stack>
          <SlackPreview text={text} channel={channel} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={Boolean(sending)}>
            Keep editing
          </Button>
          <Button
            variant="contained"
            onClick={() => send(false)}
            disabled={Boolean(sending)}
            startIcon={
              sending === "send" ? <CircularProgress size={16} color="inherit" /> : <SendIcon />
            }
          >
            Send to #{channel}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SlackMessageComposer;
