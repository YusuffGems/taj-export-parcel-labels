import type { Customer } from "@/types/customer";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export interface DashboardStats {
  total: number;
  active: number;
  recentlyAdded: number;
  recentlyUpdated: number;
  states: number;
  cities: number;
  districts: number;
  pins: number;
}

const distinct = (values: string[]) => new Set(values.map((v) => v.trim().toLowerCase()).filter(Boolean)).size;

export function computeStats(customers: Customer[], now = Date.now()): DashboardStats {
  const within = (iso: string) => now - new Date(iso).getTime() <= WEEK_MS;
  return {
    total: customers.length,
    active: customers.filter((c) => c.active).length,
    recentlyAdded: customers.filter((c) => within(c.createdAt)).length,
    recentlyUpdated: customers.filter((c) => c.updatedAt !== c.createdAt && within(c.updatedAt)).length,
    states: distinct(customers.map((c) => c.state)),
    cities: distinct(customers.map((c) => c.city)),
    districts: distinct(customers.map((c) => c.district)),
    pins: distinct(customers.map((c) => c.pin)),
  };
}

/** Customers per state, largest first. Customers without a state are grouped as "Not specified". */
export function stateDistribution(customers: Customer[]): { state: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const c of customers) {
    const key = c.state.trim() || "Not specified";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts, ([state, count]) => ({ state, count })).sort((a, b) => b.count - a.count || a.state.localeCompare(b.state));
}
