import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { CustomerForm } from "@/components/customers/customer-form";

export const metadata: Metadata = { title: "Add Customer" };

export default function Page() {
  return (
    <>
      <PageHeader title="Add Customer" description="Fields marked * are required." />
      <CustomerForm />
    </>
  );
}
