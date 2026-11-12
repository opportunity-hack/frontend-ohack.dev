import React, { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useAuthInfo, withRequiredAuthInfo } from "@propelauth/react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import AdminPage from "../../../components/admin/AdminPage";
import SetupTab from "../../../components/admin/giveaways/SetupTab";
import EntriesTab from "../../../components/admin/giveaways/EntriesTab";
import DrawTab from "../../../components/admin/giveaways/DrawTab";
import {
  useAdminGiveaway,
  useAdminGiveaways,
} from "../../../hooks/use-admin-giveaway";
import { createAdminGiveaway, giveawayErrorMessage } from "../../../lib/giveawayApi";
import {
  GIVEAWAY_ID_RE,
  defaultGiveawayId,
  slugifyGiveawayId,
} from "../../../components/admin/giveaways/giveawaySetup";

const TAB_SLUGS = ["setup", "entries", "draw"];
const STATUS_LABEL = { draft: "Draft", open: "Open", closed: "Closed", drawn: "Drawn" };

function NewGiveawayDialog({ open, onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [id, setId] = useState("");
  const [idTouched, setIdTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const effectiveId = idTouched ? id : slugifyGiveawayId(title);
  const valid = Boolean(title.trim()) && GIVEAWAY_ID_RE.test(effectiveId);

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      await onCreate({ id: effectiveId, title: title.trim() });
      setTitle("");
      setId("");
      setIdTouched(false);
    } catch (err) {
      setError(giveawayErrorMessage(err, "Couldn't create the giveaway."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>New giveaway</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mt: 1, mb: 2 }}
        />
        <TextField
          fullWidth
          label="Id (in links; can't change later)"
          value={effectiveId}
          onChange={(e) => {
            setIdTouched(true);
            setId(e.target.value.toLowerCase());
          }}
          error={Boolean(effectiveId) && !GIVEAWAY_ID_RE.test(effectiveId)}
          helperText="Lowercase letters, digits and dashes — e.g. fall-2026"
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          It starts as a draft. Add prizes, then set it to Open so people can enter.
        </Typography>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={!valid || busy}>
          {busy ? "Creating…" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const AdminGiveawaysPage = withRequiredAuthInfo(({ userClass }) => {
  const router = useRouter();
  const { accessToken } = useAuthInfo();
  const org = userClass?.getOrgByName("Opportunity Hack Org");
  const orgId = org?.orgId;
  const isAdmin = Boolean(org?.hasPermission("volunteer.admin"));

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [newOpen, setNewOpen] = useState(false);
  const onSnack = useCallback((message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const list = useAdminGiveaways(orgId, { enabled: isAdmin });
  const giveaways = useMemo(() => list.data?.giveaways || [], [list.data]);
  const queryId = typeof router.query.g === "string" ? router.query.g : null;
  const selectedId = queryId || defaultGiveawayId(giveaways);
  const tabIndex = Math.max(0, TAB_SLUGS.indexOf(router.query.tab));

  const detail = useAdminGiveaway(selectedId, orgId, { enabled: isAdmin && Boolean(selectedId) });
  const giveaway = detail.data?.giveaway?.id === selectedId ? detail.data.giveaway : null;
  const entries = useMemo(() => detail.data?.entries || [], [detail.data]);
  const { setData: setDetailData } = detail;
  const { refresh: refreshList, reload: reloadList } = list;

  const setQuery = useCallback(
    (next) => {
      router.replace(
        { pathname: router.pathname, query: { ...router.query, ...next } },
        undefined,
        { shallow: true, scroll: false },
      );
    },
    [router],
  );

  /** Merge a saved/updated campaign into the page state (no refetch). */
  const onUpdated = useCallback(
    (updated) => {
      setDetailData((d) => ({ ...(d || {}), giveaway: { ...(d?.giveaway || {}), ...updated } }));
      refreshList();
    },
    [setDetailData, refreshList],
  );

  const onCreate = async ({ id, title }) => {
    await createAdminGiveaway({ id, title, status: "draft" }, { token: accessToken, orgId });
    setNewOpen(false);
    await reloadList();
    setQuery({ g: id, tab: "setup" });
    onSnack("Giveaway created. Add prizes, then open it.");
  };

  if (!isAdmin) {
    return (
      <AdminPage title="Giveaways" isAdmin={false}>
        <Typography>You do not have permission to view this page.</Typography>
      </AdminPage>
    );
  }

  const spinner = (
    <Box sx={{ display: "flex", justifyContent: "center", py: 6, minHeight: 320 }}>
      <CircularProgress />
    </Box>
  );

  let body;
  if (list.status === "loading" || list.status === "idle") {
    body = spinner;
  } else if (list.status === "error") {
    body = (
      <Alert severity="error" action={<Button onClick={reloadList}>Retry</Button>}>
        Couldn't load giveaways.
      </Alert>
    );
  } else if (list.data?.unavailable) {
    body = <Alert severity="info">Giveaways aren't available on this backend yet.</Alert>;
  } else if (!giveaways.length) {
    body = (
      <Alert severity="info" action={<Button onClick={() => setNewOpen(true)}>New giveaway</Button>}>
        No giveaways yet.
      </Alert>
    );
  } else {
    let tabBody;
    if (detail.status === "error") {
      tabBody = (
        <Alert severity="error" action={<Button onClick={detail.reload}>Retry</Button>}>
          {giveawayErrorMessage(detail.error, "Couldn't load this giveaway.")}
        </Alert>
      );
    } else if (!giveaway) {
      tabBody = spinner;
    } else if (tabIndex === 0) {
      tabBody = (
        <SetupTab
          key={giveaway.id}
          giveaway={giveaway}
          orgId={orgId}
          entriesCount={entries.length}
          onSaved={onUpdated}
          onSnack={onSnack}
        />
      );
    } else if (tabIndex === 1) {
      tabBody = <EntriesTab key={giveaway.id} giveaway={giveaway} entries={entries} />;
    } else {
      tabBody = (
        <DrawTab
          key={giveaway.id}
          giveaway={giveaway}
          entries={entries}
          orgId={orgId}
          onUpdated={onUpdated}
          onSnack={onSnack}
          onReload={detail.reload}
        />
      );
    }

    body = (
      <>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap", mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 280 }}>
            <InputLabel id="giveaway-select-label">Giveaway</InputLabel>
            <Select
              labelId="giveaway-select-label"
              label="Giveaway"
              value={giveaways.some((g) => g.id === selectedId) ? selectedId : ""}
              onChange={(e) => setQuery({ g: e.target.value })}
            >
              {giveaways.map((g) => (
                <MenuItem key={g.id} value={g.id}>
                  {g.title} · {STATUS_LABEL[g.status] || g.status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button startIcon={<AddIcon />} onClick={() => setNewOpen(true)}>
            New giveaway
          </Button>
        </Box>
        <Tabs
          value={tabIndex}
          onChange={(_, i) => setQuery({ tab: TAB_SLUGS[i] })}
          sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="Setup" />
          <Tab label={`Entries${giveaway ? ` (${entries.length})` : ""}`} />
          <Tab label="Draw" />
        </Tabs>
        {tabBody}
      </>
    );
  }

  return (
    <AdminPage
      title="Giveaways"
      isAdmin={isAdmin}
      snackbar={snackbar}
      onSnackbarClose={() => setSnackbar((s) => ({ ...s, open: false }))}
    >
      {body}
      <NewGiveawayDialog open={newOpen} onClose={() => setNewOpen(false)} onCreate={onCreate} />
    </AdminPage>
  );
});

export default AdminGiveawaysPage;
