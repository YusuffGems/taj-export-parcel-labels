import type { Customer } from "@/types/customer";
import type { AppSettings } from "@/types/settings";
import { DEFAULT_SETTINGS } from "@/constants/business";
import { db } from "./database";
import { allocateIds, coerceCustomer, getSettings, replaceSettings, saveSettings } from "./customer-storage";

export interface BackupFile {
  app: "taj-export";
  version: 1;
  exportedAt: string;
  customers: Customer[];
  settings: AppSettings;
}

export type RestoreMode = "merge" | "replace";

export async function createBackup(): Promise<BackupFile> {
  return {
    app: "taj-export",
    version: 1,
    exportedAt: new Date().toISOString(),
    customers: await db.customers.toArray(),
    settings: await getSettings(),
  };
}

export function backupFilename(date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `taj-export-backup-${date.getFullYear()}${p(date.getMonth() + 1)}${p(date.getDate())}-${p(date.getHours())}${p(date.getMinutes())}.json`;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function downloadBackup(): Promise<number> {
  const backup = await createBackup();
  downloadBlob(new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }), backupFilename());
  await saveSettings({ lastBackupAt: backup.exportedAt });
  return backup.customers.length;
}

/** Validates a backup file's text. Throws an Error with a readable message when invalid. */
export function parseBackup(text: string): BackupFile {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("This file is not valid JSON.");
  }
  const obj = data as Partial<BackupFile> | null;
  if (!obj || obj.app !== "taj-export" || !Array.isArray(obj.customers)) {
    throw new Error("This is not a TAJ EXPORT backup file.");
  }
  const customers: Customer[] = [];
  const ids = new Set<string>();
  for (const item of obj.customers) {
    const c = coerceCustomer(item);
    if (c && !ids.has(c.id)) { ids.add(c.id); customers.push(c); }
  }
  return {
    app: "taj-export",
    version: 1,
    exportedAt: typeof obj.exportedAt === "string" ? obj.exportedAt : new Date().toISOString(),
    customers,
    settings: { ...DEFAULT_SETTINGS, ...(obj.settings ?? {}) } as AppSettings,
  };
}

/**
 * Restores a backup. In "merge" mode a backup customer whose ID is already used by a
 * *different* customer (e.g. both devices started at CUS00001) is saved under a new ID
 * instead of overwriting or being dropped.
 */
export async function restoreBackup(backup: BackupFile, mode: RestoreMode): Promise<{ added: number; updated: number }> {
  let added = 0;
  let updated = 0;
  await db.transaction("rw", db.customers, db.settings, async () => {
    if (mode === "replace") await db.customers.clear();
    for (const c of backup.customers) {
      const existing = await db.customers.get(c.id);
      if (!existing) { await db.customers.add(c); added++; }
      else if (existing.createdAt !== c.createdAt) {
        const [id] = await allocateIds(1);
        await db.customers.add({ ...c, id });
        added++;
      } else if (c.updatedAt >= existing.updatedAt) { await db.customers.put(c); updated++; }
    }
  });
  if (mode === "replace") await replaceSettings({ ...backup.settings, lastBackupAt: backup.exportedAt });
  return { added, updated };
}
