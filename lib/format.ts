import type { Customer } from "@/types/customer";
import type { SenderAddress } from "@/types/printing";

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateNumeric(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatDateTime(iso?: string | null): string {
  if (!iso) return "Never";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Never";
  return d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

export interface ToBlock {
  name: string;
  shop: string;
  body: string[];
  phone: string;
}

/** Builds the printable TO block for a customer (empty parts are omitted). */
export function buildToBlock(c: Customer): ToBlock {
  const body: string[] = [];
  if (c.address1) body.push(c.address1);
  if (c.address2) body.push(c.address2);
  if (c.landmark) body.push(`Landmark: ${c.landmark}`);
  if (c.area) body.push(c.area);
  const cityDistrict = [c.city, c.district && c.district.toLowerCase() !== c.city.toLowerCase() ? c.district : ""]
    .filter(Boolean)
    .join(", ");
  if (cityDistrict) body.push(cityDistrict);
  const statePin = [c.state, c.pin].filter(Boolean).join(" – ");
  if (statePin) body.push(statePin);
  return { name: c.name, shop: c.shopName, body, phone: [c.mobile, c.altMobile].filter(Boolean).join(" / ") };
}

export function buildSenderLines(s: SenderAddress): string[] {
  const lines: string[] = [];
  if (s.name) lines.push(s.name);
  if (s.businessName) lines.push(s.businessName);
  if (s.address1) lines.push(s.address1);
  if (s.address2) lines.push(s.address2);
  if (s.area) lines.push(s.area);
  const cityLine = [s.city, [s.state, s.pin].filter(Boolean).join(" – ")].filter(Boolean).join(", ");
  if (cityLine) lines.push(cityLine);
  if (s.mobile) lines.push(`Mobile: ${s.mobile}`);
  return lines;
}

export function fullAddress(c: Customer): string {
  return buildToBlock(c).body.join(", ");
}
