"use client";

import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import type { Customer } from "@/types/customer";
import { customersToCsv } from "@/lib/customer-csv";
import { customersToXlsxBlob } from "@/lib/customer-excel";
import { downloadBlob } from "@/lib/backup";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/common/button";

/** Export button with a CSV / Excel menu. `rows` is what will be exported. */
export function ExportMenu({ rows, scopeLabel }: { rows: Customer[]; scopeLabel: string }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  async function run(format: "csv" | "xlsx") {
    setOpen(false);
    if (rows.length === 0) { toast("There are no customers to export.", "error"); return; }
    try {
      const stamp = new Date().toISOString().slice(0, 10);
      if (format === "csv") downloadBlob(new Blob([customersToCsv(rows)], { type: "text/csv;charset=utf-8" }), `taj-export-customers-${stamp}.csv`);
      else downloadBlob(await customersToXlsxBlob(rows), `taj-export-customers-${stamp}.xlsx`);
      toast(`Exported ${rows.length} customer${rows.length === 1 ? "" : "s"}.`);
    } catch { toast("Export failed.", "error"); }
  }

  const item = "block w-full rounded-lg px-3 py-2 text-left text-sm text-fg hover:bg-bg";
  return (
    <div ref={box} className="relative">
      <Button variant="outline" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}><Download className="h-4 w-4" /> Export</Button>
      {open && (
        <div role="menu" className="absolute right-0 z-20 mt-2 w-60 rounded-xl border border-line bg-card p-1.5 shadow-lg">
          <p className="px-3 py-1.5 text-xs text-muted">{rows.length} {scopeLabel}</p>
          <button role="menuitem" type="button" className={item} onClick={() => run("csv")}>CSV file (.csv)</button>
          <button role="menuitem" type="button" className={item} onClick={() => run("xlsx")}>Excel file (.xlsx)</button>
        </div>
      )}
    </div>
  );
}
