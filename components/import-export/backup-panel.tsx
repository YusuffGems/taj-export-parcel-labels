"use client";

import { useRef, useState } from "react";
import { DatabaseBackup, Upload } from "lucide-react";
import { useSettings } from "@/hooks/use-customers";
import { useToast } from "@/hooks/use-toast";
import { downloadBackup, parseBackup, restoreBackup, type BackupFile, type RestoreMode } from "@/lib/backup";
import { formatDateTime } from "@/lib/format";
import { Button } from "@/components/common/button";
import { Card } from "@/components/common/page-header";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Modal } from "@/components/common/modal";

/** Backup download + restore. Used on the Import/Export page and in Settings. */
export function BackupPanel() {
  const { toast } = useToast();
  const { settings } = useSettings();
  const input = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<BackupFile | null>(null);
  const [mode, setMode] = useState<RestoreMode>("merge");
  const [confirmReplace, setConfirmReplace] = useState(false);

  async function onFile(file?: File) {
    if (!file) return;
    try { setPending(parseBackup(await file.text())); }
    catch (err) { toast(err instanceof Error ? err.message : "Could not read the backup file.", "error"); }
    if (input.current) input.current.value = "";
  }

  async function doRestore() {
    if (!pending) return;
    try {
      const { added, updated } = await restoreBackup(pending, mode);
      toast(`Backup restored: ${added} added, ${updated} updated.`);
    } catch { toast("Restore failed. Your existing data was not changed.", "error"); }
    setPending(null); setConfirmReplace(false);
  }

  return (
    <Card title="Backup & restore">
      <p className="mb-3 text-sm text-muted">Customer data lives only on this device. Download a backup regularly, and use restore to move your data to another device. Last backup: <b className="text-fg">{formatDateTime(settings.lastBackupAt)}</b></p>
      <div className="flex flex-wrap gap-2">
        <Button variant="gold" onClick={async () => { const n = await downloadBackup(); toast(`Backup downloaded (${n} customers).`); }}><DatabaseBackup className="h-4 w-4" /> Download backup</Button>
        <Button variant="outline" onClick={() => input.current?.click()}><Upload className="h-4 w-4" /> Restore from backup</Button>
        <input ref={input} type="file" accept="application/json,.json" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      </div>

      {pending && !confirmReplace && (
        <Modal title="Restore backup" onClose={() => setPending(null)} size="sm"
          footer={<><Button variant="outline" onClick={() => setPending(null)}>Cancel</Button><Button variant="gold" onClick={() => (mode === "replace" ? setConfirmReplace(true) : doRestore())}>Restore</Button></>}>
          <p className="mb-3 text-sm text-fg">This backup has <b>{pending.customers.length}</b> customers (created {formatDateTime(pending.exportedAt)}).</p>
          <div className="space-y-2 text-sm text-fg">
            <label className="flex gap-2"><input type="radio" checked={mode === "merge"} onChange={() => setMode("merge")} className="mt-1 accent-[#c9a227]" /><span><b>Merge</b> — keep current customers and add / update from the backup (recommended).</span></label>
            <label className="flex gap-2"><input type="radio" checked={mode === "replace"} onChange={() => setMode("replace")} className="mt-1 accent-[#c9a227]" /><span><b>Replace everything</b> — delete current customers and use only the backup.</span></label>
          </div>
        </Modal>
      )}
      {pending && confirmReplace && (
        <ConfirmDialog title="Replace all data?" confirmLabel="Replace data" requireText="REPLACE" onCancel={() => { setConfirmReplace(false); setPending(null); }} onConfirm={doRestore}
          message="All current customers on this device will be deleted and replaced by the backup. Download a backup of the current data first if unsure." />
      )}
    </Card>
  );
}
