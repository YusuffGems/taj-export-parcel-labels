"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { EmptyState, LoadingState } from "@/components/common/empty-state";
import { LinkButton } from "@/components/common/button";
import { CustomerDetail } from "./customer-detail";
import { EditCustomerView } from "./edit-customer-view";

function Inner({ mode }: { mode: "view" | "edit" }) {
  const id = useSearchParams().get("id");
  if (!id) return <EmptyState title="No customer selected" action={<LinkButton href="/customers">Back to customers</LinkButton>} />;
  return mode === "view" ? <CustomerDetail id={id} /> : <EditCustomerView id={id} />;
}

/** Customer pages use /customers/view/?id=... so the app can be a fully static, offline-capable export. */
export function IdParamPage({ mode }: { mode: "view" | "edit" }) {
  return <Suspense fallback={<LoadingState />}><Inner mode={mode} /></Suspense>;
}
