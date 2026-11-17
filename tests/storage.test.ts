import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { EMPTY_CUSTOMER } from "@/constants/customer";
import { LEGACY_STORAGE_KEY, MIGRATED_FLAG_KEY } from "@/constants/business";
import { db } from "@/lib/database";
import { addCustomer, clearCustomers, deleteCustomers, getSettings, importCustomers, migrateLegacyLocalStorage, saveSettings, updateCustomer } from "@/lib/customer-storage";
import { createBackup, parseBackup, restoreBackup } from "@/lib/backup";

function memoryStorage(initial: Record<string, string> = {}) {
  const data = { ...initial };
  return { getItem: (k: string) => data[k] ?? null, setItem: (k: string, v: string) => { data[k] = v; }, data };
}

beforeEach(async () => { await clearCustomers(); await db.settings.clear(); });

describe("customer storage", () => {
  it("adds with sequential CUS ids and timestamps, updates, deletes", async () => {
    const a = await addCustomer({ ...EMPTY_CUSTOMER, name: "  A  " });
    const b = await addCustomer({ ...EMPTY_CUSTOMER, name: "B" });
    expect([a.id, b.id]).toEqual(["CUS00001", "CUS00002"]);
    expect(a.name).toBe("A");
    const updated = await updateCustomer(a.id, { ...EMPTY_CUSTOMER, name: "A2", city: "Erode" });
    expect(updated.createdAt).toBe(a.createdAt);
    expect(updated.updatedAt >= a.updatedAt).toBe(true);
    await deleteCustomers([a.id]);
    expect(await db.customers.count()).toBe(1);
  });
  it("never reuses an id after a delete, and restarts after clearing the database", async () => {
    await addCustomer({ ...EMPTY_CUSTOMER, name: "A" });
    const b = await addCustomer({ ...EMPTY_CUSTOMER, name: "B" });
    await deleteCustomers([b.id]);
    expect((await addCustomer({ ...EMPTY_CUSTOMER, name: "C" })).id).toBe("CUS00003");
    await clearCustomers();
    expect((await addCustomer({ ...EMPTY_CUSTOMER, name: "D" })).id).toBe("CUS00001");
  });
  it("bulk imports with consecutive ids", async () => {
    expect(await importCustomers([{ ...EMPTY_CUSTOMER, name: "X" }, { ...EMPTY_CUSTOMER, name: "Y" }])).toBe(2);
    expect((await db.customers.toArray()).map((c) => c.id).sort()).toEqual(["CUS00001", "CUS00002"]);
  });
  it("merges settings with defaults", async () => {
    await saveSettings({ showCutLine: false });
    const s = await getSettings();
    expect(s.showCutLine).toBe(false);
    expect(s.businessName).toBe("TAJ EXPORT");
  });
});

describe("legacy localStorage migration", () => {
  it("copies records into IndexedDB, keeps the original and is idempotent", async () => {
    const legacy = JSON.stringify([{ id: "old-1", name: "Old One", mobile: "9876543210", city: "Salem" }, { customerName: "No Id", pin: "636001" }, { shop: "no name" }]);
    const storage = memoryStorage({ [LEGACY_STORAGE_KEY]: legacy });
    expect(await migrateLegacyLocalStorage(storage)).toBe(2);
    expect(storage.data[LEGACY_STORAGE_KEY]).toBe(legacy); // original untouched
    expect(storage.data[MIGRATED_FLAG_KEY]).toBeTruthy();
    expect(await db.customers.get("old-1")).toMatchObject({ name: "Old One", city: "Salem" });
    expect(await db.customers.get("CUS00001")).toMatchObject({ name: "No Id", pin: "636001" }); // record without an id gets a fresh one
    expect(await migrateLegacyLocalStorage(storage)).toBe(0);
    expect(await db.customers.count()).toBe(2);
  });
  it("does nothing for corrupt data", async () => {
    const storage = memoryStorage({ [LEGACY_STORAGE_KEY]: "{not json" });
    expect(await migrateLegacyLocalStorage(storage)).toBe(0);
    expect(storage.data[MIGRATED_FLAG_KEY]).toBeUndefined();
  });
});

describe("backup & restore", () => {
  it("round-trips and supports merge and replace", async () => {
    const a = await addCustomer({ ...EMPTY_CUSTOMER, name: "A" });
    await addCustomer({ ...EMPTY_CUSTOMER, name: "B" });
    const backup = parseBackup(JSON.stringify(await createBackup()));
    await clearCustomers();
    await addCustomer({ ...EMPTY_CUSTOMER, name: "Extra" });
    expect(await restoreBackup(backup, "merge")).toMatchObject({ added: 2 });
    expect(await db.customers.count()).toBe(3);
    await restoreBackup(backup, "replace");
    expect(await db.customers.count()).toBe(2);
    expect(await db.customers.get(a.id)).toBeTruthy();
  });
  it("rejects files that are not backups", () => {
    expect(() => parseBackup("nope")).toThrow();
    expect(() => parseBackup(JSON.stringify({ hello: 1 }))).toThrow(/not a TAJ EXPORT backup/);
  });
});
