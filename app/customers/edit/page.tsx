import type { Metadata } from "next";
import { IdParamPage } from "@/components/customers/id-param-page";

export const metadata: Metadata = { title: "Edit Customer" };

export default function Page() {
  return <IdParamPage mode="edit" />;
}
