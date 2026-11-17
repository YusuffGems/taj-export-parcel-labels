import type { Metadata } from "next";
import { IdParamPage } from "@/components/customers/id-param-page";

export const metadata: Metadata = { title: "Customer Details" };

export default function Page() {
  return <IdParamPage mode="view" />;
}
