"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { Pencil, Printer, Trash2 } from "lucide-react";
import { db } from "@/lib/database";
import { deleteCustomers } from "@/lib/customer-storage";
import { formatDateTime } from "@/lib/format";
import { useSelection } from "@/hooks/use-selection";
import { useToast } from "@/hooks/use-toast";
import { Button, LinkButton } from "@/components/common/button";
import { Card, PageHeader } from "@/components/common/page-header";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState, LoadingState } from "@/components/common/empty-state";

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="grid grid-cols-3 gap-2 border-b border-line py-2 text-sm last:border-0">
      <dt className="text-muted">{label}</dt>
      <dd className="col-span-2 break-words font-medium text-fg">{value || "—"}</dd>
    </div>
  );
}

export function CustomerDetail({ id }: { id: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { replace } = useSelection();
  const [confirming, setConfirming] = useState(false);
  const customer = useLiveQuery(async () => (await db.customers.get(id)) ?? null, [id]);

  if (customer === undefined) return <LoadingState />;
  if (customer === null) {
    return <EmptyState title="Customer not found" message="This customer may have been deleted." action={<LinkButton href="/customers">Back to customers</LinkButton>} />;
  }

  return (
    <>
      <PageHeader title={customer.name} description={customer.shopName || `Customer ${customer.id}`}
        actions={<>
          <Button variant="outline" onClick={() => { replace([customer.id]); router.push("/printing"); }}><Printer className="h-4 w-4" /> Print address</Button>
          <LinkButton href={`/customers/edit/?id=${encodeURIComponent(customer.id)}`} variant="outline"><Pencil className="h-4 w-4" /> Edit</LinkButton>
          <Button variant="danger" onClick={() => setConfirming(true)}><Trash2 className="h-4 w-4" /> Delete</Button>
        </>} />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Customer">
          <dl>
            <Row label="Customer ID" value={customer.id} />
            <Row label="Name" value={customer.name} />
            <Row label="Shop / Business" value={customer.shopName} />
            <Row label="Mobile" value={customer.mobile} />
            <Row label="Alternate mobile" value={customer.altMobile} />
            <Row label="GST number" value={customer.gst} />
            <Row label="Status" value={customer.active ? "Active" : "Inactive"} />
          </dl>
        </Card>
        <Card title="Address">
          <dl>
            <Row label="Address line 1" value={customer.address1} />
            <Row label="Address line 2" value={customer.address2} />
            <Row label="Landmark" value={customer.landmark} />
            <Row label="Area" value={customer.area} />
            <Row label="City" value={customer.city} />
            <Row label="District" value={customer.district} />
            <Row label="State" value={customer.state} />
            <Row label="PIN code" value={customer.pin} />
          </dl>
        </Card>
        <Card title="Notes & history" className="lg:col-span-2">
          <dl>
            <Row label="Notes" value={customer.notes} />
            <Row label="Created" value={formatDateTime(customer.createdAt)} />
            <Row label="Last updated" value={formatDateTime(customer.updatedAt)} />
          </dl>
        </Card>
      </div>
      {confirming && (
        <ConfirmDialog title="Delete customer?" message={<>This will permanently delete <b>{customer.name}</b> from this device. This cannot be undone.</>}
          onCancel={() => setConfirming(false)}
          onConfirm={async () => { await deleteCustomers([customer.id]); toast("Customer deleted."); router.push("/customers"); }} />
      )}
    </>
  );
}
