import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  RestaurantMenu as MenuIconSvg,
  Search as SearchIcon,
} from "@mui/icons-material";
import {
  addUserCatalogItem,
  getCategoriesForVendor,
  getCombinedCatalog,
  getVendors,
  isSeededItem,
  removeUserCatalogItem,
} from "./catalogStorage";
import { formatUSD } from "./formatCurrency";

const ALLOWED_DIETARY_TAGS = [
  "vegetarian",
  "vegan",
  "halal",
  "kosher",
  "gluten-free",
  "dairy-free",
  "nut-free",
  "pescatarian",
];

const newId = () => `user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const blankCustomItem = (vendor) => ({
  id: newId(),
  vendor: vendor || "",
  category: "",
  name: "",
  description: "",
  price_cents: 0,
  unit: "per_person",
  min_quantity: 15,
  dietary_tags: [],
});

const AddCustomForm = ({ vendor, onAdd, onCancel }) => {
  const [draft, setDraft] = useState(blankCustomItem(vendor));
  const set = (field, value) => setDraft((d) => ({ ...d, [field]: value }));
  const valid = draft.name.trim() && draft.vendor.trim() && draft.price_cents >= 0;

  const handleSave = () => {
    addUserCatalogItem({
      ...draft,
      name: draft.name.trim(),
      vendor: draft.vendor.trim(),
      category: draft.category.trim() || "Custom",
      description: draft.description.trim() || undefined,
    });
    onAdd();
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "primary.50" }}>
      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>
        New catalog item (saves to your browser)
      </Typography>
      <Stack spacing={1.5}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <TextField
            label="Name"
            size="small"
            fullWidth
            value={draft.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
          <TextField
            label="Vendor"
            size="small"
            fullWidth
            value={draft.vendor}
            onChange={(e) => set("vendor", e.target.value)}
            required
            placeholder="e.g. Local Pizza Co"
          />
        </Stack>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <TextField
            label="Category"
            size="small"
            fullWidth
            value={draft.category}
            onChange={(e) => set("category", e.target.value)}
            placeholder="Lunch, Dinner, Snack…"
          />
          <TextField
            label="Price (USD)"
            type="number"
            size="small"
            value={(draft.price_cents / 100).toString()}
            onChange={(e) => {
              const dollars = parseFloat(e.target.value);
              set("price_cents", Number.isFinite(dollars) ? Math.round(dollars * 100) : 0);
            }}
            inputProps={{ min: 0, step: 0.25 }}
            sx={{ width: 140 }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Unit</InputLabel>
            <Select label="Unit" value={draft.unit} onChange={(e) => set("unit", e.target.value)}>
              <MenuItem value="per_person">per person</MenuItem>
              <MenuItem value="each">each (qty)</MenuItem>
              <MenuItem value="fixed">fixed total</MenuItem>
            </Select>
          </FormControl>
        </Stack>
        <TextField
          label="Description (optional)"
          size="small"
          fullWidth
          multiline
          rows={2}
          value={draft.description}
          onChange={(e) => set("description", e.target.value)}
        />
        <FormControl size="small" fullWidth>
          <InputLabel>Dietary tags</InputLabel>
          <Select
            multiple
            value={draft.dietary_tags}
            onChange={(e) => set("dietary_tags", e.target.value)}
            input={<OutlinedInput label="Dietary tags" />}
            renderValue={(sel) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {sel.map((v) => <Chip key={v} label={v} size="small" />)}
              </Box>
            )}
          >
            {ALLOWED_DIETARY_TAGS.map((tag) => (
              <MenuItem key={tag} value={tag}>{tag}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button size="small" onClick={onCancel}>Cancel</Button>
          <Button size="small" variant="contained" disabled={!valid} onClick={handleSave}>Save to catalog</Button>
        </Stack>
      </Stack>
    </Paper>
  );
};

const MenuCatalogPicker = ({ open, onClose, onAddItems, headcount }) => {
  const [catalog, setCatalog] = useState(() => getCombinedCatalog());
  const [vendors, setVendors] = useState(() => getVendors());
  const [vendorFilter, setVendorFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [showAdd, setShowAdd] = useState(false);

  // Refresh catalog whenever the dialog is opened so newly-added user items
  // show up immediately.
  useEffect(() => {
    if (open) {
      setCatalog(getCombinedCatalog());
      setVendors(getVendors());
      setSelected(new Set());
      setShowAdd(false);
    }
  }, [open]);

  const refresh = () => {
    setCatalog(getCombinedCatalog());
    setVendors(getVendors());
    setShowAdd(false);
  };

  const categories = useMemo(() => {
    if (!vendorFilter) {
      const all = new Set();
      catalog.forEach((it) => it.category && all.add(it.category));
      return Array.from(all);
    }
    return getCategoriesForVendor(vendorFilter);
  }, [vendorFilter, catalog]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return catalog.filter((it) => {
      if (vendorFilter && it.vendor !== vendorFilter) return false;
      if (categoryFilter && it.category !== categoryFilter) return false;
      if (q && !`${it.name} ${it.description || ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [catalog, vendorFilter, categoryFilter, search]);

  const toggleOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAdd = () => {
    const items = catalog
      .filter((it) => selected.has(it.id))
      .map((it) => ({
        id: `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        name: it.name,
        description: it.description || "",
        dietary_tags: it.dietary_tags || [],
        price_cents: it.price_cents,
        unit: it.unit || "per_person",
        vendor: it.vendor,
        catalog_item_id: it.id,
        ...(it.unit === "each" ? { quantity: 1 } : {}),
      }));
    onAddItems(items);
    onClose();
  };

  const handleDeleteUserItem = (id) => {
    if (!window.confirm("Remove this catalog item from your saved list?")) return;
    removeUserCatalogItem(id);
    refresh();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, pr: 6 }}>
        <MenuIconSvg color="primary" />
        Browse menu catalog
        <Box sx={{ flex: 1 }} />
        <IconButton size="small" onClick={onClose} aria-label="Close" sx={{ position: "absolute", right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              size="small"
              fullWidth
              placeholder="Search items…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Vendor</InputLabel>
              <Select
                label="Vendor"
                value={vendorFilter}
                onChange={(e) => {
                  setVendorFilter(e.target.value);
                  setCategoryFilter("");
                }}
              >
                <MenuItem value=""><em>All vendors</em></MenuItem>
                {vendors.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Category</InputLabel>
              <Select
                label="Category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value=""><em>All categories</em></MenuItem>
                {categories.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>

          {headcount > 0 && (
            <Alert severity="info" sx={{ py: 0.5 }}>
              Headcount: <strong>{headcount}</strong> — per-person prices are multiplied by this when added to a meal.
            </Alert>
          )}

          <Box>
            <Button size="small" startIcon={<AddIcon />} onClick={() => setShowAdd((v) => !v)}>
              {showAdd ? "Hide add form" : "Add a custom item"}
            </Button>
            <Collapse in={showAdd}>
              <Box sx={{ mt: 1 }}>
                <AddCustomForm vendor={vendorFilter} onAdd={refresh} onCancel={() => setShowAdd(false)} />
              </Box>
            </Collapse>
          </Box>

          <Divider />

          {filtered.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
              No items match. Adjust filters or add a custom item.
            </Typography>
          ) : (
            <Stack spacing={1}>
              {filtered.map((it) => {
                const checked = selected.has(it.id);
                const userOwned = !isSeededItem(it.id);
                return (
                  <Paper
                    key={it.id}
                    variant="outlined"
                    onClick={() => toggleOne(it.id)}
                    sx={{
                      p: 1.5,
                      cursor: "pointer",
                      borderColor: checked ? "primary.main" : "divider",
                      bgcolor: checked ? "primary.50" : "background.paper",
                      transition: "border-color 80ms",
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <Checkbox checked={checked} sx={{ p: 0.5 }} onClick={(e) => e.stopPropagation()} onChange={() => toggleOne(it.id)} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap: "wrap" }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{it.name}</Typography>
                          <Chip label={it.category} size="small" variant="outlined" />
                          {(it.dietary_tags || []).map((t) => (
                            <Chip key={t} label={t} size="small" sx={{ fontSize: "0.7rem" }} />
                          ))}
                          {userOwned && <Chip label="custom" size="small" color="warning" variant="outlined" />}
                        </Stack>
                        {it.description && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                            {it.description}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                          {it.vendor}
                          {it.min_quantity ? ` · ${it.min_quantity}-person min` : ""}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatUSD(it.price_cents)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {it.unit === "per_person" ? "/ person" : it.unit === "each" ? "each" : "fixed"}
                        </Typography>
                        {it.unit === "per_person" && headcount > 0 && (
                          <Typography variant="caption" color="primary.main" sx={{ display: "block", fontWeight: 600 }}>
                            = {formatUSD((it.price_cents || 0) * headcount)}
                          </Typography>
                        )}
                        {userOwned && (
                          <Tooltip title="Remove from catalog">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteUserItem(it.id);
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={selected.size === 0}
          onClick={handleAdd}
          startIcon={<AddIcon />}
        >
          Add {selected.size || ""} item{selected.size === 1 ? "" : "s"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MenuCatalogPicker;
