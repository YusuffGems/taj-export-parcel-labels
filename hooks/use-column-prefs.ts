"use client";

import { useCallback, useEffect, useState } from "react";
import { ALL_COLUMN_KEYS, type ColumnKey } from "@/lib/customer-columns";

const KEY = "taj-columns-v1";

/** Which table columns are visible. Remembered on this device. */
export function useColumnPrefs() {
  const [visible, setVisible] = useState<ColumnKey[]>(ALL_COLUMN_KEYS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const saved: unknown = raw ? JSON.parse(raw) : null;
      if (Array.isArray(saved)) {
        const valid = ALL_COLUMN_KEYS.filter((k) => saved.includes(k));
        if (valid.length > 0) setVisible(valid);
      }
    } catch { /* ignore unreadable preference */ }
  }, []);

  const toggle = useCallback((key: ColumnKey) => {
    setVisible((prev) => {
      if (prev.includes(key) && prev.length === 1) return prev; // keep at least one column
      const next = ALL_COLUMN_KEYS.filter((k) => (k === key ? !prev.includes(k) : prev.includes(k)));
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage unavailable */ }
      return next;
    });
  }, []);

  const showAll = useCallback(() => {
    setVisible(ALL_COLUMN_KEYS);
    try { localStorage.setItem(KEY, JSON.stringify(ALL_COLUMN_KEYS)); } catch { /* storage unavailable */ }
  }, []);

  return { visible, toggle, showAll };
}
