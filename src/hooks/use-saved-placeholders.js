import { useState, useCallback, useMemo } from 'react';

const STORAGE_PREFIX = 'ohack_placeholders_';

function getStorageKey(eventId, templateId) {
  if (!eventId || !templateId) return null;
  return `${STORAGE_PREFIX}${eventId}_${templateId}`;
}

export default function useSavedPlaceholders(eventId, templateId) {
  const storageKey = getStorageKey(eventId, templateId);

  const loadValues = useCallback(() => {
    if (!storageKey) return null;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  }, [storageKey]);

  const savedValues = useMemo(() => loadValues(), [loadValues]);
  const hasSavedValues = savedValues !== null && Object.keys(savedValues).length > 0;

  const saveValues = useCallback((values) => {
    if (!storageKey) return;
    try {
      // Only save if there are non-empty values
      const nonEmpty = Object.fromEntries(
        Object.entries(values).filter(([, v]) => v)
      );
      if (Object.keys(nonEmpty).length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(nonEmpty));
      }
    } catch {
      // localStorage full or unavailable — silently ignore
    }
  }, [storageKey]);

  const clearValues = useCallback(() => {
    if (!storageKey) return;
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // silently ignore
    }
  }, [storageKey]);

  return { savedValues, saveValues, clearValues, hasSavedValues };
}
