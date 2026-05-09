import { useEffect, useMemo, useRef, useState } from "react";
import { useAuthInfo } from "@propelauth/react";
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Delete, PersonAdd } from "@mui/icons-material";

const API = process.env.NEXT_PUBLIC_API_SERVER_URL;

/**
 * Editors picker. Searches Firestore users by name/email through the
 * admin-only /api/planning/_users/search endpoint, so the admin never
 * has to know or paste a PropelAuth user_id.
 *
 * Resolved editor identities (name + avatar) are also fetched so the
 * existing editors list shows real names instead of opaque IDs.
 */
export default function PlanningEditorsManager({ editors = [], onUpdateEditors }) {
  const { accessToken, orgHelper } = useAuthInfo();
  const orgId = orgHelper?.getOrgs()?.[0]?.orgId;

  const [query, setQuery] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [options, setOptions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [editorProfiles, setEditorProfiles] = useState({}); // { [user_id]: {name, email, profile_image} }
  const debounceRef = useRef(null);

  // Debounce search input
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQ(query), 250);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Fetch search results
  useEffect(() => {
    if (!debouncedQ || debouncedQ.length < 2) {
      setOptions([]);
      return;
    }
    let cancelled = false;
    setSearchLoading(true);
    fetch(`${API}/api/planning/_users/search?q=${encodeURIComponent(debouncedQ)}`, {
      headers: {
        authorization: `Bearer ${accessToken}`,
        ...(orgId && { "X-Org-Id": orgId }),
      },
    })
      .then((r) => (r.ok ? r.json() : { users: [] }))
      .then((data) => {
        if (cancelled) return;
        setOptions(data.users || []);
      })
      .catch(() => !cancelled && setOptions([]))
      .finally(() => !cancelled && setSearchLoading(false));
    return () => {
      cancelled = true;
    };
  }, [debouncedQ, accessToken, orgId]);

  // Resolve display names for current editors (one batched search per missing id)
  useEffect(() => {
    const missing = editors.filter((id) => !editorProfiles[id]);
    if (missing.length === 0) return;
    let cancelled = false;
    Promise.all(
      missing.map((id) =>
        fetch(`${API}/api/planning/_users/search?q=${encodeURIComponent(id.slice(0, 8))}`, {
          headers: {
            authorization: `Bearer ${accessToken}`,
            ...(orgId && { "X-Org-Id": orgId }),
          },
        })
          .then((r) => (r.ok ? r.json() : { users: [] }))
          .then((data) => (data.users || []).find((u) => u.user_id === id))
          .catch(() => null)
      )
    ).then((results) => {
      if (cancelled) return;
      const next = { ...editorProfiles };
      missing.forEach((id, i) => {
        if (results[i]) next[id] = results[i];
      });
      setEditorProfiles(next);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editors.join(",")]);

  // Filter out users already added
  const filteredOptions = useMemo(
    () => options.filter((u) => !editors.includes(u.user_id)),
    [options, editors]
  );

  async function handleAdd(option) {
    if (!option) return;
    setAdding(true);
    setError("");
    const result = await onUpdateEditors([option.user_id], []);
    if (result?.ok) {
      setQuery("");
      setOptions([]);
    } else {
      setError(result?.error || "Failed to add editor");
    }
    setAdding(false);
  }

  async function handleRemove(userId) {
    setAdding(true);
    await onUpdateEditors([], [userId]);
    setAdding(false);
  }

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Board editors
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Editors can create, edit, and move cards. Admins always have full access.
      </Typography>

      {/* Existing editors */}
      <Stack spacing={1} sx={{ mb: 2 }}>
        {editors.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
            No editors yet. Search and add someone below.
          </Typography>
        )}
        {editors.map((userId) => {
          const profile = editorProfiles[userId];
          return (
            <Stack
              key={userId}
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{
                p: 1,
                borderRadius: 1,
                bgcolor: "grey.50",
                border: "1px solid",
                borderColor: "grey.200",
              }}
            >
              <Avatar src={profile?.profile_image} sx={{ width: 32, height: 32 }}>
                {(profile?.name || "?").charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                  {profile?.name || "Unknown user"}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontFamily: "monospace", fontSize: "0.7rem" }}
                  noWrap
                >
                  {profile?.email || userId}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={() => handleRemove(userId)}
                disabled={adding}
                title="Remove editor"
              >
                <Delete fontSize="small" />
              </IconButton>
            </Stack>
          );
        })}
      </Stack>

      {/* Search picker */}
      <Autocomplete
        size="small"
        loading={searchLoading}
        options={filteredOptions}
        getOptionLabel={(o) => o.name || o.email || o.user_id}
        isOptionEqualToValue={(o, v) => o.user_id === v.user_id}
        filterOptions={(x) => x} // server filters
        noOptionsText={
          query.length < 2 ? "Type at least 2 characters to search" : "No matching users"
        }
        onChange={(_, value) => value && handleAdd(value)}
        inputValue={query}
        onInputChange={(_, value, reason) => {
          if (reason !== "reset") setQuery(value);
        }}
        renderOption={(props, option) => (
          <ListItem {...props} key={option.user_id} dense>
            <ListItemAvatar>
              <Avatar src={option.profile_image} sx={{ width: 28, height: 28 }}>
                {(option.name || "?").charAt(0).toUpperCase()}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={option.name || "(no name)"}
              secondary={option.email}
              primaryTypographyProps={{ variant: "body2" }}
              secondaryTypographyProps={{ variant: "caption" }}
            />
          </ListItem>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Search by name or email…"
            InputProps={{
              ...params.InputProps,
              startAdornment: <PersonAdd fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />,
              endAdornment: (
                <>
                  {searchLoading || adding ? <CircularProgress size={16} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
      {error && (
        <Typography color="error" variant="caption" sx={{ mt: 0.5, display: "block" }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
