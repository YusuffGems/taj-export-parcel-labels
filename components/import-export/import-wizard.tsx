"use client";

import { useMemo, useRef, useState } from "react";
import { FileUp } from "lucide-react";
import { IMPORT_FIELDS } from "@/constants/customer";
import type { CustomerInput } from "@/types/customer";
import { useCustomers } from "@/hooks/use-customers";
import { useToast } from "@/hooks/use-toast";
import { readSpreadsheetFile, type ParsedSheet } from "@/lib/customer-excel";
import { autoMapColumns, buildImportRows, importErrorReportCsv, type ColumnMapping } from "@/lib/customer-import";
import { importCustomers } from "@/lib/customer-storage";
import { downloadBlob } from "@/lib/backup";
import { Button } from "@/components/common/button";
import { Card } from "@/components/common/page-header";
import { inputClass } from "@/components/common/text-field";
import { ImportPreview } from "./import-preview";

type Step = "choose" | "map" | "preview" | "done";

export function ImportWizard() {
  const { toast } = useToast();
  const { customers } = useCustomers();
  const fileInput = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("choose");
  const [fileName, setFileName] = useState("");
  const [sheet, setSheet] = useState<ParsedSheet>({ headers: [], records: [] });
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState({ imported: 0, skipped: 0, failed: 0 });

  const rows = useMemo(() => (step === "preview" || step === "done" ? buildImportRows(sheet.records, mapping, customers) : []), [step, sheet, mapping, customers]);
  const importable = rows.filter((r) => r.errors.length === 0 && (!r.duplicateOf || !skipDuplicates));

  function reset() {
    setStep("choose"); setSheet({ headers: [], records: [] }); setMapping({}); setFileName("");
    if (fileInput.current) fileInput.current.value = "";
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const parsed = await readSpreadsheetFile(file);
      if (parsed.records.length === 0) throw new Error("No data rows were found in this file.");
      setSheet(parsed); setFileName(file.name); setMapping(autoMapColumns(parsed.headers)); setStep("map");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not read this file.", "error");
      if (fileInput.current) fileInput.current.value = "";
    } finally { setBusy(false); }
  }

  async function runImport() {
    setBusy(true);
    try {
      const inputs: CustomerInput[] = importable.map((r) => r.input);
      const imported = inputs.length ? await importCustomers(inputs) : 0;
      setResult({ imported, skipped: rows.filter((r) => r.errors.length === 0 && r.duplicateOf && skipDuplicates).length, failed: rows.filter((r) => r.errors.length > 0).length });
      setStep("done");
      toast(`${imported} customer${imported === 1 ? "" : "s"} imported.`);
    } catch { toast("Import failed. No data was changed.", "error"); } finally { setBusy(false); }
  }

  return (
    <Card title="Import customers (CSV or Excel)">
      {step === "choose" && (
        <div className="space-y-3">
          <p className="text-sm text-muted">Choose a .csv or .xlsx file. The first row must contain column headings. You can match columns and review every row before anything is saved.</p>
          <input ref={fileInput} type="file" accept=".csv,.xlsx,.xls,text/csv" className="hidden" id="import-file" onChange={(e) => onFile(e.target.files?.[0])} />
          <Button variant="gold" disabled={busy} onClick={() => fileInput.current?.click()}><FileUp className="h-4 w-4" /> {busy ? "Reading file…" : "Choose file"}</Button>
        </div>
      )}

      {step === "map" && (
        <div className="space-y-4">
          <p className="text-sm text-muted"><b className="text-fg">{fileName}</b> · {sheet.records.length} rows. Match each customer field to a column in your file.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {IMPORT_FIELDS.map((f) => (
              <label key={f.key} className="block text-sm">
                <span className="mb-1 block font-medium text-fg">{f.label}{f.key === "name" && <span className="text-red-600"> *</span>}</span>
                <select className={inputClass} value={mapping[f.key] ?? ""} onChange={(e) => setMapping((m) => ({ ...m, [f.key]: e.target.value || undefined }))}>
                  <option value="">— Not in file —</option>
                  {sheet.headers.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </label>
            ))}
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={reset}>Cancel</Button>
            <Button variant="gold" disabled={!mapping.name} onClick={() => setStep("preview")}>Preview &amp; validate</Button>
          </div>
          {!mapping.name && <p className="text-right text-xs text-red-600">Customer Name must be matched to a column.</p>}
        </div>
      )}

      {step === "preview" && (
        <div className="space-y-4">
          <ImportPreview rows={rows} />
          <label className="flex items-center gap-2 text-sm text-fg"><input type="checkbox" checked={skipDuplicates} onChange={(e) => setSkipDuplicates(e.target.checked)} className="h-4 w-4 accent-[#c9a227]" /> Skip rows that look like duplicates</label>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={() => setStep("map")}>Back</Button>
            <Button variant="outline" onClick={reset}>Cancel</Button>
            <Button variant="gold" disabled={busy || importable.length === 0} onClick={runImport}>{busy ? "Importing…" : `Import ${importable.length} customer${importable.length === 1 ? "" : "s"}`}</Button>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3 text-sm">
            <div className="rounded-lg border border-emerald-400 bg-emerald-50 p-3 text-emerald-900"><div className="text-xl font-bold">{result.imported}</div>Imported</div>
            <div className="rounded-lg border border-amber-400 bg-amber-50 p-3 text-amber-900"><div className="text-xl font-bold">{result.skipped}</div>Duplicates skipped</div>
            <div className="rounded-lg border border-red-400 bg-red-50 p-3 text-red-900"><div className="text-xl font-bold">{result.failed}</div>Rows with errors</div>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            {(result.failed > 0 || result.skipped > 0) && (
              <Button variant="outline" onClick={() => downloadBlob(new Blob([importErrorReportCsv(rows, sheet.headers)], { type: "text/csv;charset=utf-8" }), "import-error-report.csv")}>Download error report</Button>
            )}
            <Button variant="gold" onClick={reset}>Import another file</Button>
          </div>
        </div>
      )}
    </Card>
  );
}
