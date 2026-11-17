import Dexie, { type Table } from "dexie";
import type { Customer } from "@/types/customer";

export interface SettingRow {
  key: string;
  value: unknown;
}

class TajDatabase extends Dexie {
  customers!: Table<Customer, string>;
  settings!: Table<SettingRow, string>;

  constructor() {
    super("taj-export");
    // Version 1. Add new versions below (never edit an existing one) so that
    // existing user data is migrated instead of being lost.
    this.version(1).stores({
      customers: "id, name, shopName, mobile, city, district, state, pin, createdAt, updatedAt",
      settings: "key",
    });
  }
}

export const db = new TajDatabase();
