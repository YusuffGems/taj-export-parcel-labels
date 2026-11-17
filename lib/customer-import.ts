import type { Customer, CustomerInput } from "@/types/customer";
import { EMPTY_CUSTOMER, IMPORT_FIELDS } from "@/constants/customer";
import { findDuplicate, normalizeCustomerInput, normalizeMobile, validateCustomer } from "./customer-validation";

export type ColumnMapping = Partial<Record<keyof CustomerInput, string>>;

export interface ImportRow {
  rowNumber: number; // 1-based, as seen in the spreadsheet (header = row 1)
  input: CustomerInput;
  errors: string[];
  duplicateOf?: string;
  raw: Record<string, string>;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export function autoMapColumns(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  const used = new Set<string>();
  for (const field of IMPORT_FIELDS) {
    const match = headers.find((h) => !used.has(h) && field.aliases.includes(norm(h)));
    if (match) { mapping[field.key] = match; used.add(match); }
  }
  return mapping;
}

function parseActive(value: string): boolean {
  return !["no", "n", "false", "0", "inactive"].includes(value.trim().toLowerCase());
}

export function recordToInput(record: Record<string, string>, mapping: ColumnMapping): CustomerInput {
  const input: CustomerInput = { ...EMPTY_CUSTOMER };
  for (const field of IMPORT_FIELDS) {
    const header = mapping[field.key];
    if (!header) continue;
    const value = (record[header] ?? "").trim();
    if (field.key === "active") input.active = value === "" ? true : parseActive(value);
    else (input[field.key] as string) = value;
  }
  return normalizeCustomerInput(input);
}

export function buildImportRows(records: Record<string, string>[], mapping: ColumnMapping, existing: Customer[]): ImportRow[] {
  const seenMobiles = new Map<string, number>();
  const seenNamePin = new Map<string, number>();
  return records.map((raw, idx) => {
    const rowNumber = idx + 2;
    const input = recordToInput(raw, mapping);
    const errors = Object.values(validateCustomer(input));
    let duplicateOf: string | undefined;
    const dup = findDuplicate(input, existing);
    if (dup) duplicateOf = `Already saved as ${dup.name} (${dup.id})`;
    const mobile = normalizeMobile(input.mobile);
    const namePin = input.pin ? `${input.name.toLowerCase()}|${input.pin}` : "";
    if (!duplicateOf && mobile.length === 10 && seenMobiles.has(mobile)) duplicateOf = `Same mobile as row ${seenMobiles.get(mobile)} in this file`;
    if (!duplicateOf && namePin && seenNamePin.has(namePin)) duplicateOf = `Same name and PIN as row ${seenNamePin.get(namePin)} in this file`;
    if (errors.length === 0) {
      if (mobile.length === 10 && !seenMobiles.has(mobile)) seenMobiles.set(mobile, rowNumber);
      if (namePin && !seenNamePin.has(namePin)) seenNamePin.set(namePin, rowNumber);
    }
    return { rowNumber, input, errors, duplicateOf, raw };
  });
}

function csvCell(v: string): string {
  return /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

/** CSV listing every row that was not imported, with the reason. */
export function importErrorReportCsv(rows: ImportRow[], headers: string[]): string {
  const bad = rows.filter((r) => r.errors.length > 0 || r.duplicateOf);
  const head = ["Row", "Problem", ...headers].map(csvCell).join(",");
  const lines = bad.map((r) =>
    [String(r.rowNumber), [...r.errors, r.duplicateOf ?? ""].filter(Boolean).join("; "), ...headers.map((h) => r.raw[h] ?? "")]
      .map(csvCell)
      .join(","),
  );
  return "\uFEFF" + [head, ...lines].join("\r\n");
}
