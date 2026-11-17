import type { Customer } from "@/types/customer";
import { EXPORT_COLUMNS } from "@/constants/customer";

function escapeCell(value: string): string {
  // Neutralise spreadsheet formula injection while keeping phone numbers readable.
  const safe = /^[=+@]/.test(value) || /^-(?!\d)/.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function cellValue(c: Customer, key: keyof Customer): string {
  const v = c[key];
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return String(v ?? "");
}

export function customersToCsv(customers: Customer[]): string {
  const header = EXPORT_COLUMNS.map((c) => escapeCell(c.label)).join(",");
  const rows = customers.map((c) => EXPORT_COLUMNS.map((col) => escapeCell(cellValue(c, col.key))).join(","));
  return "\uFEFF" + [header, ...rows].join("\r\n");
}

/** Minimal RFC-4180 CSV parser (quoted fields, escaped quotes, CRLF/LF). */
export function parseCsv(text: string): string[][] {
  const input = text.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (inQuotes) {
      if (ch === '"' && input[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') inQuotes = false;
      else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && input[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
    } else field += ch;
  }
  row.push(field);
  if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  return rows;
}

export function rowsToObjects(rows: string[][]): { headers: string[]; records: Record<string, string>[] } {
  if (rows.length === 0) return { headers: [], records: [] };
  const headers = rows[0].map((h) => h.trim());
  const records = rows.slice(1).map((r) => {
    const rec: Record<string, string> = {};
    headers.forEach((h, i) => { if (h) rec[h] = (r[i] ?? "").trim(); });
    return rec;
  });
  return { headers: headers.filter(Boolean), records };
}
