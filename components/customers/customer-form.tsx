"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import type { Customer, CustomerErrors, CustomerInput } from "@/types/customer";
import { EMPTY_CUSTOMER, INDIAN_STATES } from "@/constants/customer";
import { addCustomer, updateCustomer } from "@/lib/customer-storage";
import { findDuplicate, validateCustomer } from "@/lib/customer-validation";
import { useCustomers } from "@/hooks/use-customers";
import { useToast } from "@/hooks/use-toast";
import { Button, LinkButton } from "@/components/common/button";
import { Card } from "@/components/common/page-header";
import { TextField } from "@/components/common/text-field";

function toInput(c: Customer): CustomerInput {
  const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = c;
  void _id; void _c; void _u;
  return rest;
}

export function CustomerForm({ customer }: { customer?: Customer }) {
  const router = useRouter();
  const { toast } = useToast();
  const { customers } = useCustomers();
  const [values, setValues] = useState<CustomerInput>(customer ? toInput(customer) : EMPTY_CUSTOMER);
  const [errors, setErrors] = useState<CustomerErrors>({});
  const [duplicate, setDuplicate] = useState<Customer | null>(null);
  const [saving, setSaving] = useState(false);

  const set = (key: keyof CustomerInput) => (value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setDuplicate(null);
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validateCustomer(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      toast("Please fix the highlighted fields.", "error");
      return;
    }
    const dup = findDuplicate(values, customers, customer?.id);
    if (dup && !duplicate) { setDuplicate(dup); return; }
    setSaving(true);
    try {
      const saved = customer ? await updateCustomer(customer.id, values) : await addCustomer(values);
      toast(customer ? "Customer updated." : "Customer added.");
      router.push(`/customers/view/?id=${encodeURIComponent(saved.id)}`);
    } catch {
      toast("Could not save the customer. Please try again.", "error");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {customer && <p className="text-sm text-muted">Customer ID: <b className="text-fg">{customer.id}</b></p>}
      <Card title="Customer details">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Customer Name" required value={values.name} onChange={set("name")} error={errors.name} autoComplete="off" />
          <TextField label="Shop / Business Name" value={values.shopName} onChange={set("shopName")} />
          <TextField label="Mobile Number" value={values.mobile} onChange={set("mobile")} error={errors.mobile} inputMode="tel" type="tel" placeholder="10-digit mobile" />
          <TextField label="Alternate Mobile Number" value={values.altMobile} onChange={set("altMobile")} error={errors.altMobile} inputMode="tel" type="tel" />
          <TextField label="GST Number" value={values.gst} onChange={set("gst")} error={errors.gst} maxLength={15} placeholder="33ABCDE1234F1Z5" />
          <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium text-fg">
            <input type="checkbox" checked={values.active} onChange={(e) => setValues((p) => ({ ...p, active: e.target.checked }))} className="h-4 w-4 accent-[#c9a227]" /> Active customer
          </label>
        </div>
      </Card>

      <Card title="Address">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Address Line 1" value={values.address1} onChange={set("address1")} className="sm:col-span-2" />
          <TextField label="Address Line 2" value={values.address2} onChange={set("address2")} className="sm:col-span-2" />
          <TextField label="Landmark" value={values.landmark} onChange={set("landmark")} />
          <TextField label="Area" value={values.area} onChange={set("area")} />
          <TextField label="City" value={values.city} onChange={set("city")} />
          <TextField label="District" value={values.district} onChange={set("district")} />
          <TextField label="State" value={values.state} onChange={set("state")} list="state-options" />
          <TextField label="PIN Code" value={values.pin} onChange={set("pin")} error={errors.pin} inputMode="numeric" maxLength={6} />
        </div>
        <datalist id="state-options">{INDIAN_STATES.map((s) => <option key={s} value={s} />)}</datalist>
      </Card>

      <Card title="Additional notes">
        <TextField label="Additional Notes" multiline value={values.notes} onChange={set("notes")} />
      </Card>

      {duplicate && (
        <div role="alert" className="flex gap-3 rounded-xl border border-amber-400 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div>
            A similar customer already exists: <b>{duplicate.name}</b>{duplicate.shopName ? ` (${duplicate.shopName})` : ""} — {duplicate.id}.
            Press <b>Save anyway</b> if this is a different customer.
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-end gap-2">
        <LinkButton href={customer ? `/customers/view/?id=${encodeURIComponent(customer.id)}` : "/customers"} variant="outline">Cancel</LinkButton>
        <Button type="submit" variant="gold" disabled={saving}>{saving ? "Saving…" : duplicate ? "Save anyway" : customer ? "Save changes" : "Add customer"}</Button>
      </div>
    </form>
  );
}
