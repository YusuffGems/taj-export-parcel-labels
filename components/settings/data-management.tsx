"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useCustomers } from "@/hooks/use-customers";
import { useToast } from "@/hooks/use-toast";
import { clearCustomers } from "@/lib/customer-storage";
import { formatBytes } from "@/lib/format";
import { Button } from "@/components/common/button";
import { Card } from "@/components/common/page-header";
import { ConfirmDialog } from "@/components/common/confirm-dialog";

export function DataManagement() {
  const { customers } = useCustomers();
  const { toast } = useToast();
  const [usage, setUsage] = useState<{ used: number; quota: number } | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    navigator.storage?.estimate?.().then((e) => setUsage({ used: e.usage ?? 0, quota: e.quota ?? 0 })).catch(() => setUsage(null));
  }, [customers.length]);

  return (
    <Card title="Data management">
      <dl className="mb-4 grid gap-2 text-sm sm:grid-cols-3">
        <div className="rounded-lg border border-line p-3"><dt className="text-muted">Customers stored</dt><dd className="text-lg font-bold text-fg">{customers.length}</dd></div>
        <div className="rounded-lg border border-line p-3"><dt className="text-muted">Storage used by app</dt><dd className="text-lg font-bold text-fg">{usage ? formatBytes(usage.used) : "Not available"}</dd></div>
        <div className="rounded-lg border border-line p-3"><dt className="text-muted">Storage available</dt><dd className="text-lg font-bold text-fg">{usage?.quota ? formatBytes(usage.quota) : "Not available"}</dd></div>
      </dl>
      <Button variant="danger" disabled={customers.length === 0} onClick={() => setConfirming(true)}><Trash2 className="h-4 w-4" /> Clear customer database</Button>
      {confirming && (
        <ConfirmDialog title="Clear customer database?" confirmLabel="Delete all customers" requireText="DELETE" onCancel={() => setConfirming(false)}
          onConfirm={async () => { await clearCustomers(); setConfirming(false); toast("All customers were deleted."); }}
          message={<>This permanently deletes all <b>{customers.length}</b> customers from this device. Download a backup first if you may need them again.</>} />
      )}
    </Card>
  );
}
