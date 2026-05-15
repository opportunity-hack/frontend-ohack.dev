// localStorage-backed user catalog. Lives client-side until we decide to
// promote it to the backend. Keyed per-vendor so admins can keep different
// vendors' menus separate.
//
// Shape per stored item (matches FAT_FREDDYS_CATALOG entries):
//   { id, vendor, category, name, description?, price_cents, unit, min_quantity?, dietary_tags[] }

import { FAT_FREDDYS_CATALOG, FAT_FREDDYS_VENDOR, FAT_FREDDYS_CATEGORIES } from "./fatFreddysCatalog";

const STORAGE_KEY = "ohack_admin_menu_catalog_v1";

const seededFatFreddysItems = FAT_FREDDYS_CATALOG.map((it) => ({ ...it, vendor: FAT_FREDDYS_VENDOR }));

const readStorage = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Failed to read catalog from localStorage:", err);
    return [];
  }
};

const writeStorage = (items) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn("Failed to write catalog to localStorage:", err);
  }
};

export const getCombinedCatalog = () => {
  const userItems = readStorage();
  return [...seededFatFreddysItems, ...userItems];
};

export const getVendors = () => {
  const vendors = new Set([FAT_FREDDYS_VENDOR]);
  readStorage().forEach((it) => it.vendor && vendors.add(it.vendor));
  return Array.from(vendors);
};

export const getCategoriesForVendor = (vendor) => {
  if (vendor === FAT_FREDDYS_VENDOR) return FAT_FREDDYS_CATEGORIES;
  const categories = new Set();
  readStorage().forEach((it) => {
    if (it.vendor === vendor && it.category) categories.add(it.category);
  });
  return Array.from(categories);
};

export const addUserCatalogItem = (item) => {
  const userItems = readStorage();
  const next = [...userItems, item];
  writeStorage(next);
  return next;
};

export const removeUserCatalogItem = (id) => {
  const next = readStorage().filter((it) => it.id !== id);
  writeStorage(next);
  return next;
};

export const isSeededItem = (id) => seededFatFreddysItems.some((it) => it.id === id);
