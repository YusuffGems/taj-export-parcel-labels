import type { Customer, CustomerInput } from "@/types/customer";
import type { AppSettings } from "@/types/settings";
import { DEFAULT_SETTINGS, LEGACY_STORAGE_KEY, MIGRATED_FLAG_KEY } from "@/constants/business";
import { EMPTY_CUSTOMER } from "@/constants/customer";
import { db } from "./database";
import { normalizeCustomerInput } from "./customer-validation";

const ID_COUNTER_KEY = "idCounter";

export function formatCustomerId(n: number): string {
  return `CUS${String(n).padStart(5, "0")}`;
}

/**
 * Reserves the next sequential customer IDs (CUS00001, CUS00002 …).
 * The counter only moves forward, so an ID is never reused after a delete.
 */
export async function allocateIds(count: number): Promise<string[]> {
  return db.transaction("rw", db.customers, db.settings, async () => {
    const keys = (await db.customers.toCollection().primaryKeys()) as string[];
    let max = 0;
    for (const k of keys) {
      const m = /^CUS(\d+)$/.exec(k);
      if (m) max = Math.max(max, Number(m[1]));
    }
    const row = await db.settings.get(ID_COUNTER_KEY);
    const counter = typeof row?.value === "number" ? row.value : 0;
    const start = Math.max(max, counter);
    await db.settings.put({ key: ID_COUNTER_KEY, value: start + count });
    return Array.from({ length: count }, (_, i) => formatCustomerId(start + i + 1));
  });
}

export async function addCustomer(input: CustomerInput): Promise<Customer> {
  const now = new Date().toISOString();
  return db.transaction("rw", db.customers, db.settings, async () => {
    const [id] = await allocateIds(1);
    const customer: Customer = { ...normalizeCustomerInput(input), id, createdAt: now, updatedAt: now };
    await db.customers.add(customer);
    return customer;
  });
}

export async function updateCustomer(id: string, input: CustomerInput): Promise<Customer> {
  const existing = await db.customers.get(id);
  if (!existing) throw new Error("Customer not found.");
  const updated: Customer = { ...existing, ...normalizeCustomerInput(input), id, updatedAt: new Date().toISOString() };
  await db.customers.put(updated);
  return updated;
}

export async function deleteCustomers(ids: string[]): Promise<void> {
  await db.customers.bulkDelete(ids);
}

export async function clearCustomers(): Promise<void> {
  await db.transaction("rw", db.customers, db.settings, async () => {
    await db.customers.clear();
    await db.settings.delete(ID_COUNTER_KEY); // numbering starts again from CUS00001
  });
}

/** Saves many validated inputs in one transaction. Returns how many were stored. */
export async function importCustomers(inputs: CustomerInput[]): Promise<number> {
  if (inputs.length === 0) return 0;
  const now = new Date().toISOString();
  return db.transaction("rw", db.customers, db.settings, async () => {
    const ids = await allocateIds(inputs.length);
    const records: Customer[] = inputs.map((input, i) => ({ ...normalizeCustomerInput(input), id: ids[i], createdAt: now, updatedAt: now }));
    await db.customers.bulkAdd(records);
    return records.length;
  });
}

// ---------- settings ----------

const SETTINGS_KEY = "app";

export async function getSettings(): Promise<AppSettings> {
  const row = await db.settings.get(SETTINGS_KEY);
  const saved = (row?.value ?? {}) as Partial<AppSettings>;
  return { ...DEFAULT_SETTINGS, ...saved, customSender: { ...DEFAULT_SETTINGS.customSender, ...saved.customSender } };
}

export async function saveSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
  const next = { ...(await getSettings()), ...patch };
  await db.settings.put({ key: SETTINGS_KEY, value: next });
  return next;
}

export async function replaceSettings(settings: AppSettings): Promise<void> {
  await db.settings.put({ key: SETTINGS_KEY, value: settings });
}

// ---------- coercion + legacy migration ----------

const str = (v: unknown): string => (typeof v === "string" ? v : typeof v === "number" ? String(v) : "").trim();

/** Turns any loosely-shaped object into a full Customer, or null when it has no name. */
export function coerceCustomer(raw: unknown, fallbackId?: () => string): Customer | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const pick = (...keys: string[]) => {
    for (const k of keys) if (r[k] !== undefined && r[k] !== null && str(r[k]) !== "") return str(r[k]);
    return "";
  };
  const name = pick("name", "customerName", "customer_name");
  if (!name) return null;
  const now = new Date().toISOString();
  const base: CustomerInput = {
    ...EMPTY_CUSTOMER,
    name,
    shopName: pick("shopName", "shop", "shopBusinessName", "businessName", "shop_name"),
    mobile: pick("mobile", "mobileNumber", "phone"),
    altMobile: pick("altMobile", "alternateMobile", "alternateMobileNumber", "alt_mobile"),
    gst: pick("gst", "gstNumber", "gstin"),
    address1: pick("address1", "addressLine1", "address", "address_line1"),
    address2: pick("address2", "addressLine2", "address_line2"),
    landmark: pick("landmark"),
    area: pick("area"),
    city: pick("city"),
    district: pick("district"),
    state: pick("state"),
    pin: pick("pin", "pinCode", "pincode", "zip"),
    notes: pick("notes", "additionalNotes", "remarks"),
    active: r.active === false || r.active === "No" ? false : true,
  };
  const id = pick("id", "customerId", "customer_id") || (fallbackId ? fallbackId() : `IMP-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`);
  const created = pick("createdAt", "createdDate", "created_at") || now;
  return { ...base, id, createdAt: created, updatedAt: pick("updatedAt", "updatedDate", "updated_at") || created };
}

/**
 * Copies customers saved by an older version in localStorage (key taj-export-customers-v1)
 * into IndexedDB. The original localStorage data is never deleted: it is only marked
 * as migrated after every record is verified to exist in IndexedDB.
 */
export async function migrateLegacyLocalStorage(storage: Pick<Storage, "getItem" | "setItem"> = localStorage): Promise<number> {
  if (storage.getItem(MIGRATED_FLAG_KEY)) return 0;
  const raw = storage.getItem(LEGACY_STORAGE_KEY);
  if (!raw) return 0;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return 0; // unreadable data is left untouched
  }
  const list = Array.isArray(parsed) ? parsed : [];
  const used = new Set<string>();
  const customers: Customer[] = [];
  for (const item of list) {
    const c = coerceCustomer(item, () => "");
    if (!c) continue;
    if (c.id && used.has(c.id)) c.id = ""; // duplicate id inside the old data → give it a fresh one
    if (c.id) used.add(c.id);
    customers.push(c);
  }
  let added = 0;
  const finalIds: string[] = [];
  await db.transaction("rw", db.customers, db.settings, async () => {
    const needIds = customers.filter((c) => !c.id);
    const fresh = needIds.length ? await allocateIds(needIds.length) : [];
    needIds.forEach((c, i) => { c.id = fresh[i]; });
    for (const c of customers) {
      finalIds.push(c.id);
      if (!(await db.customers.get(c.id))) { await db.customers.add(c); added++; }
    }
  });
  const stored = await db.customers.bulkGet(finalIds);
  if (stored.every(Boolean)) storage.setItem(MIGRATED_FLAG_KEY, new Date().toISOString());
  return added;
}
