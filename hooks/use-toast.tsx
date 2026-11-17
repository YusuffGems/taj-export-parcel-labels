"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/format";

type ToastType = "success" | "error" | "info";
interface ToastItem { id: number; message: string; type: ToastType }
interface ToastContextValue { toast: (message: string, type?: ToastType) => void }

const ToastContext = createContext<ToastContextValue | null>(null);
let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = nextId++;
    setItems((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 4500);
  }, []);
  const value = useMemo(() => ({ toast }), [toast]);
  const icons = { success: CheckCircle2, error: XCircle, info: Info };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed inset-x-3 bottom-3 z-[100] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-4 sm:bottom-4" role="status" aria-live="polite">
        {items.map((t) => {
          const Icon = icons[t.type];
          return (
            <div key={t.id} className={cn("flex w-full max-w-sm items-start gap-2 rounded-lg border bg-card px-4 py-3 text-sm text-fg shadow-lg sm:w-auto",
              t.type === "success" && "border-emerald-500/50", t.type === "error" && "border-red-500/60", t.type === "info" && "border-line")}>
              <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", t.type === "success" && "text-emerald-600", t.type === "error" && "text-red-600", t.type === "info" && "text-navy2")} />
              <span>{t.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
