import type { ImportRow } from "@/lib/customer-import";
import { cn } from "@/lib/format";

export function ImportPreview({ rows }: { rows: ImportRow[] }) {
  const errors = rows.filter((r) => r.errors.length > 0).length;
  const dups = rows.filter((r) => r.errors.length === 0 && r.duplicateOf).length;
  const ok = rows.length - errors - dups;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 text-sm">
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-900">{ok} ready</span>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-900">{dups} possible duplicates</span>
        <span className="rounded-full bg-red-100 px-3 py-1 text-red-900">{errors} with errors</span>
      </div>
      <div className="max-h-96 overflow-auto rounded-lg border border-line">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="sticky top-0 bg-navy text-white"><tr><th className="px-3 py-2">Row</th><th className="px-3 py-2">Name</th><th className="px-3 py-2">Mobile</th><th className="px-3 py-2">City</th><th className="px-3 py-2">PIN</th><th className="px-3 py-2">Status</th></tr></thead>
          <tbody>
            {rows.slice(0, 200).map((r) => {
              const bad = r.errors.length > 0;
              return (
                <tr key={r.rowNumber} className={cn("border-t border-line align-top", bad && "bg-red-50 text-red-900", !bad && r.duplicateOf && "bg-amber-50 text-amber-900")}>
                  <td className="px-3 py-2">{r.rowNumber}</td><td className="px-3 py-2">{r.input.name || "—"}</td><td className="px-3 py-2">{r.input.mobile || "—"}</td><td className="px-3 py-2">{r.input.city || "—"}</td><td className="px-3 py-2">{r.input.pin || "—"}</td>
                  <td className="px-3 py-2 text-xs">{bad ? r.errors.join(" ") : r.duplicateOf ?? "Ready"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {rows.length > 200 && <p className="text-xs text-muted">Showing the first 200 of {rows.length} rows. All rows are validated and imported.</p>}
    </div>
  );
}
