import type { Customer } from "@/types/customer";

export type SortKey = "name" | "newest" | "oldest";

export interface CustomerFilters {
  search: string;
  letter: string; // "" = all, "A".."Z", or "#" for names starting with a digit/symbol
  state: string;
  city: string;
  district: string;
  area: string;
  pin: string;
  sort: SortKey;
}

export const DEFAULT_FILTERS: CustomerFilters = { search: "", letter: "", state: "", city: "", district: "", area: "", pin: "", sort: "newest" };

export function filterCustomers(customers: Customer[], f: CustomerFilters): Customer[] {
  const q = f.search.trim().toLowerCase();
  const qDigits = q.replace(/\D/g, "");
  const result = customers.filter((c) => {
    if (f.letter && !matchesLetter(c, f.letter)) return false;
    if (f.state && c.state !== f.state) return false;
    if (f.city && c.city !== f.city) return false;
    if (f.district && c.district !== f.district) return false;
    if (f.area.trim() && !c.area.toLowerCase().includes(f.area.trim().toLowerCase())) return false;
    if (f.pin.trim() && !c.pin.startsWith(f.pin.trim())) return false;
    if (f.district && c.district !== f.district) return false;
    if (f.area.trim() && !c.area.toLowerCase().includes(f.area.trim().toLowerCase())) return false;
    if (f.pin.trim() && !c.pin.startsWith(f.pin.trim())) return false;
    if (!q) return true;
    const text = [c.name, c.shopName, c.city, c.district, c.state, c.pin, c.id].join("\n").toLowerCase();
    if (text.includes(q)) return true;
    return qDigits.length >= 3 && (c.mobile + c.altMobile).includes(qDigits);
  });
  return sortCustomers(result, f.sort);
}

export function sortCustomers(list: Customer[], sort: SortKey): Customer[] {
  const copy = [...list];
  if (sort === "name") return copy.sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
  const dir = sort === "newest" ? -1 : 1;
  return copy.sort((a, b) => dir * a.createdAt.localeCompare(b.createdAt));
}

export function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/** "A".."Z" for the first letter/digit of the text (accents ignored), or "#" for digits and symbols. */
export function firstLetter(text: string): string {
  const ch = text.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").charAt(0).toUpperCase();
  return /[A-Z]/.test(ch) ? ch : "#";
}

/** A customer matches a letter when either the customer name or the shop name starts with it. */
export function matchesLetter(c: Customer, letter: string): boolean {
  return firstLetter(c.name) === letter || (c.shopName.trim() !== "" && firstLetter(c.shopName) === letter);
}

export function availableLetters(customers: Customer[]): Set<string> {
  const set = new Set<string>();
  for (const c of customers) {
    set.add(firstLetter(c.name));
    if (c.shopName.trim()) set.add(firstLetter(c.shopName));
  }
  return set;
}
