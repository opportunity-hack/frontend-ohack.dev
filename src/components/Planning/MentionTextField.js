/**
 * Textarea with @-mention autocomplete.
 *
 * Wire format: when a user picks someone from the suggestion list, the token
 * `@[Display Name](propel_user_id)` is inserted at the cursor. This is the
 * same shape the backend's MENTION_RE in services/planning_mention_notifier.py
 * looks for to dispatch Slack DMs / emails.
 *
 * Privacy: only display name + propel_user_id flow through the wire format.
 * No emails, no Slack IDs are ever surfaced in the picker or in the rendered
 * comment.
 */
import { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Box,
  CircularProgress,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Popper,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useAuthInfo } from "@propelauth/react";

const API = process.env.NEXT_PUBLIC_API_SERVER_URL;
const SEARCH_DEBOUNCE_MS = 200;
const MAX_SUGGESTIONS_HEIGHT = 280;

export default function MentionTextField({
  value,
  onChange,
  placeholder,
  rows = 2,
  multiline = true,
  disabled = false,
  fullWidth = true,
  size,
  sx,
}) {
  const { accessToken } = useAuthInfo();
  const theme = useTheme();
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Mention picker state — only active while the user is typing inside an @-token.
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionAnchor, setMentionAnchor] = useState(null);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionStart, setMentionStart] = useState(null); // index of the @ in `value`
  const [suggestions, setSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [highlight, setHighlight] = useState(0);

  // Detect if the cursor is currently inside an @-token (e.g. "...hello @gre|").
  // If so, return {start, query}; otherwise null.
  function detectActiveMention(text, cursor) {
    // Walk backward from cursor to find an @ that starts a mention token.
    // Stop at whitespace or start-of-string. Skip if @ is followed by a `[` —
    // that's an already-completed mention token like @[Name](id).
    let i = cursor - 1;
    while (i >= 0) {
      const ch = text[i];
      if (ch === "@") {
        // Must be at SOS or after whitespace
        if (i === 0 || /\s/.test(text[i - 1])) {
          // If followed by '[' it's a completed mention, not a typing one
          if (text[i + 1] === "[") return null;
          const query = text.slice(i + 1, cursor);
          // Bail on multi-line spans or extremely long queries
          if (/[\n\r]/.test(query) || query.length > 32) return null;
          return { start: i, query };
        }
        return null;
      }
      if (/\s/.test(ch)) return null;
      i--;
    }
    return null;
  }

  function handleChange(e) {
    const next = e.target.value;
    onChange(next);
    const cursor = e.target.selectionStart ?? next.length;
    const detected = detectActiveMention(next, cursor);
    if (detected) {
      setMentionStart(detected.start);
      setMentionQuery(detected.query);
      setMentionOpen(true);
      setMentionAnchor(inputRef.current);
      setHighlight(0);
    } else {
      setMentionOpen(false);
    }
  }

  // Debounced backend search
  useEffect(() => {
    if (!mentionOpen) return;
    if (!mentionQuery || mentionQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      let cancelled = false;
      setSearchLoading(true);
      fetch(
        `${API}/api/planning/_users/mention-search?q=${encodeURIComponent(mentionQuery)}`,
        { headers: { authorization: `Bearer ${accessToken}` } }
      )
        .then((r) => (r.ok ? r.json() : { users: [] }))
        .then((data) => !cancelled && setSuggestions(data.users || []))
        .catch(() => !cancelled && setSuggestions([]))
        .finally(() => !cancelled && setSearchLoading(false));
      return () => {
        cancelled = true;
      };
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [mentionQuery, mentionOpen, accessToken]);

  function insertMention(option) {
    if (mentionStart == null) return;
    const before = value.slice(0, mentionStart);
    const cursor = inputRef.current?.selectionStart ?? value.length;
    const after = value.slice(cursor);
    const token = `@[${option.name}](${option.user_id}) `;
    const next = before + token + after;
    onChange(next);
    setMentionOpen(false);
    // Restore cursor position after token
    requestAnimationFrame(() => {
      const pos = before.length + token.length;
      inputRef.current?.focus();
      try {
        inputRef.current?.setSelectionRange(pos, pos);
      } catch {}
    });
  }

  function handleKeyDown(e) {
    if (!mentionOpen || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      insertMention(suggestions[highlight]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setMentionOpen(false);
    }
  }

  return (
    <Box sx={{ position: "relative", ...sx }}>
      <TextField
        inputRef={inputRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        multiline={multiline}
        rows={rows}
        fullWidth={fullWidth}
        size={size}
        disabled={disabled}
        helperText="Type @ to mention someone — they'll get a Slack DM and email."
        sx={{
          "& .MuiInputBase-root": {
            bgcolor: "background.paper",
            color: "text.primary",
          },
          "& textarea, & input": { color: "text.primary" },
        }}
      />
      <Popper
        open={mentionOpen && (suggestions.length > 0 || searchLoading)}
        anchorEl={mentionAnchor}
        placement="bottom-start"
        style={{ zIndex: theme.zIndex.modal + 1 }}
      >
        <Paper
          elevation={6}
          sx={{
            mt: 0.5,
            minWidth: 280,
            maxHeight: MAX_SUGGESTIONS_HEIGHT,
            overflowY: "auto",
            bgcolor: "background.paper",
          }}
        >
          {searchLoading && suggestions.length === 0 && (
            <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
              <CircularProgress size={20} />
            </Box>
          )}
          {suggestions.map((s, idx) => (
            <ListItem
              key={s.user_id}
              dense
              button
              selected={idx === highlight}
              onMouseDown={(e) => {
                e.preventDefault(); // keep textarea focused
                insertMention(s);
              }}
              onMouseEnter={() => setHighlight(idx)}
            >
              <ListItemAvatar>
                <Avatar src={s.profile_image} sx={{ width: 28, height: 28 }}>
                  {(s.name || "?").charAt(0).toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={s.name || "(no name)"}
                primaryTypographyProps={{ variant: "body2" }}
              />
            </ListItem>
          ))}
          {!searchLoading && suggestions.length === 0 && mentionQuery.length >= 2 && (
            <Box sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary">
                No matches
              </Typography>
            </Box>
          )}
        </Paper>
      </Popper>
    </Box>
  );
}

/**
 * Render comment markdown with mention tokens highlighted as chips.
 * Used by the comments thread in PlanningCardDialog.
 */
export function MentionRenderer({ body }) {
  if (!body) return null;
  const parts = [];
  let last = 0;
  const re = /@\[([^\]]{1,80})\]\(([A-Za-z0-9_\-|]{1,64})\)/g;
  let match;
  let key = 0;
  while ((match = re.exec(body)) !== null) {
    if (match.index > last) parts.push(<span key={key++}>{body.slice(last, match.index)}</span>);
    parts.push(
      <Box
        key={key++}
        component="span"
        sx={{
          display: "inline-block",
          bgcolor: "primary.main",
          color: "primary.contrastText",
          px: 0.75,
          py: 0.1,
          borderRadius: 1,
          fontSize: "0.85em",
          fontWeight: 500,
          mx: 0.25,
        }}
      >
        @{match[1]}
      </Box>
    );
    last = match.index + match[0].length;
  }
  if (last < body.length) parts.push(<span key={key++}>{body.slice(last)}</span>);
  return <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{parts}</Typography>;
}
