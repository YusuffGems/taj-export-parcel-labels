"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/database";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState, LoadingState } from "@/components/common/empty-state";
import { LinkButton } from "@/components/common/button";
import { CustomerForm } from "./customer-form";

export function EditCustomerView({ id }: { id: string }) {
  const customer = useLiveQuery(async () => (await db.customers.get(id)) ?? null, [id]);
  if (customer === undefined) return <LoadingState />;
  if (customer === null) return <EmptyState title="Customer not found" action={<LinkButton href="/customers">Back to customers</LinkButton>} />;
  return (
    <>
      <PageHeader title="Edit Customer" description={customer.name} />
      <CustomerForm key={customer.id} customer={customer} />
    </>
  );
}
