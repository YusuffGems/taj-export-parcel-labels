import type { Customer } from "@/types/customer";
import { EXPORT_COLUMNS } from "@/constants/customer";
import { cellValue, parseCsv, rowsToObjects } from "./customer-csv";

export interface ParsedSheet {
  headers: string[];
  records: Record<string, string>[];
}

/** xlsx is loaded lazily so it only costs bytes when import/export is used. */
export async function customersToXlsxBlob(customers: Customer[]): Promise<Blob> {
  const XLSX = await import("xlsx");
  const data = customers.map((c) => {
    const row: Record<string, string> = {};
    EXPORT_COLUMNS.forEach((col) => { row[col.label] = cellValue(c, col.key); });
    return row;
  });
  const sheet = XLSX.utils.json_to_sheet(data, { header: EXPORT_COLUMNS.map((c) => c.label) });
  sheet["!cols"] = EXPORT_COLUMNS.map((c) => ({ wch: Math.max(14, c.label.length + 2) }));
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Customers");
  const out = XLSX.write(book, { type: "array", bookType: "xlsx" });
  return new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

/** Reads a .csv / .xlsx / .xls file into header + record objects (all values as text). */
export async function readSpreadsheetFile(file: File): Promise<ParsedSheet> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".csv") || file.type === "text/csv") {
    return rowsToObjects(parseCsv(await file.text()));
  }
  if (!/\.(xlsx|xls)$/.test(name)) throw new Error("Unsupported file type. Please choose a .csv or .xlsx file.");
  const XLSX = await import("xlsx");
  const book = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const sheet = book.Sheets[book.SheetNames[0]];
  if (!sheet) throw new Error("The Excel file has no sheets.");
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: false, defval: "", blankrows: false });
  return rowsToObjects(rows.map((r) => r.map((cell) => String(cell ?? ""))));
}
