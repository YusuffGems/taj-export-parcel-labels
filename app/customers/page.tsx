import type { Metadata } from "next";
import { CustomerDirectory } from "@/components/customers/customer-directory";

export const metadata: Metadata = { title: "All Customers" };

export default function Page() {
  return <CustomerDirectory mode="manage" />;
}
