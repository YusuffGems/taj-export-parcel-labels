"use client";

import { useEffect, type ReactNode } from "react";
import { ToastProvider, useToast } from "@/hooks/use-toast";
import { SelectionProvider } from "@/hooks/use-selection";
import { useSettings } from "@/hooks/use-customers";
import { migrateLegacyLocalStorage } from "@/lib/customer-storage";
import { THEME_KEY } from "@/constants/business";

function Bootstrap() {
  const { toast } = useToast();
  const { settings, loading } = useSettings();

  // One-time, non-destructive migration of the old localStorage customer list.
  useEffect(() => {
    migrateLegacyLocalStorage()
      .then((n) => { if (n > 0) toast(`Moved ${n} existing customer${n === 1 ? "" : "s"} into the new local database.`, "info"); })
      .catch(() => toast("Could not migrate older customer data. Your original data was not changed.", "error"));
  }, [toast]);

  useEffect(() => {
    if (loading) return;
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
    try { localStorage.setItem(THEME_KEY, settings.theme); } catch { /* storage unavailable */ }
  }, [settings.theme, loading]);

  // Offline support: register the service worker generated at build time.
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => { /* app still works online */ });
  }, []);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <SelectionProvider>
        <Bootstrap />
        {children}
      </SelectionProvider>
    </ToastProvider>
  );
}
