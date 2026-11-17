"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import type { Customer } from "@/types/customer";
import { useCustomers } from "@/hooks/use-customers";
import { useSelection } from "@/hooks/use-selection";
import { useToast } from "@/hooks/use-toast";
import { customersToCsv } from "@/lib/customer-csv";
import { customersToXlsxBlob } from "@/lib/customer-excel";
import { downloadBlob } from "@/lib/backup";
import { uniqueSorted } from "@/lib/customer-search";
import { Button } from "@/components/common/button";
import { Card } from "@/components/common/page-header";
import { inputClass } from "@/components/common/text-field";

type Scope = "all" | "selected" | "filtered";

export function ExportPanel() {
  const { customers } = useCustomers();
  const { selected } = useSelection();
  const { toast } = useToast();
  const [scope, setScope] = useState<Scope>("all");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [busy, setBusy] = useState(false);

  const states = useMemo(() => uniqueSorted(customers.map((c) => c.state)), [customers]);
  const cities = useMemo(() => uniqueSorted(customers.filter((c) => !state || c.state === state).map((c) => c.city)), [customers, state]);

  const rows: Customer[] = useMemo(() => {
    if (scope === "selected") return customers.filter((c) => selected.has(c.id));
    if (scope === "filtered") return customers.filter((c) => (!state || c.state === state) && (!city || c.city === city));
    return customers;
  }, [scope, customers, selected, state, city]);

  async function run(format: "csv" | "xlsx") {
    if (rows.length === 0) { toast("There are no customers to export for this choice.", "error"); return; }
    setBusy(true);
    try {
      const stamp = new Date().toISOString().slice(0, 10);
      if (format === "csv") downloadBlob(new Blob([customersToCsv(rows)], { type: "text/csv;charset=utf-8" }), `taj-export-customers-${stamp}.csv`);
      else downloadBlob(await customersToXlsxBlob(rows), `taj-export-customers-${stamp}.xlsx`);
      toast(`Exported ${rows.length} customer${rows.length === 1 ? "" : "s"}.`);
    } catch { toast("Export failed.", "error"); } finally { setBusy(false); }
  }

  const options: { value: Scope; label: string }[] = [
    { value: "all", label: `All customers (${customers.length})` },
    { value: "selected", label: `Selected customers (${customers.filter((c) => selected.has(c.id)).length})` },
    { value: "filtered", label: "Filtered by state / city" },
  ];

  return (
    <Card title="Export customers">
      <div className="space-y-3">
        {options.map((o) => (
          <label key={o.value} className="flex items-center gap-2 text-sm text-fg"><input type="radio" name="export-scope" checked={scope === o.value} onChange={() => setScope(o.value)} className="h-4 w-4 accent-[#c9a227]" /> {o.label}</label>
        ))}
        {scope === "filtered" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <select aria-label="State" className={inputClass} value={state} onChange={(e) => { setState(e.target.value); setCity(""); }}><option value="">All states</option>{states.map((s) => <option key={s}>{s}</option>)}</select>
            <select aria-label="City" className={inputClass} value={city} onChange={(e) => setCity(e.target.value)}><option value="">All cities</option>{cities.map((c) => <option key={c}>{c}</option>)}</select>
          </div>
        )}
        <p className="text-sm text-muted">{rows.length} customer{rows.length === 1 ? "" : "s"} will be exported.</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="gold" disabled={busy} onClick={() => run("csv")}><Download className="h-4 w-4" /> Export CSV</Button>
          <Button variant="primary" disabled={busy} onClick={() => run("xlsx")}><Download className="h-4 w-4" /> Export Excel</Button>
        </div>
      </div>
    </Card>
  );
}
