import type { Customer } from "@/types/customer";
import { formatDateNumeric } from "./format";

export type ColumnKey =
  | "id" | "name" | "shopName" | "mobile" | "altMobile" | "address1" | "address2"
  | "area" | "city" | "district" | "state" | "pin" | "gst" | "createdAt";

export interface ColumnDef {
  key: ColumnKey;
  label: string;
  value: (c: Customer) => string;
  className?: string;
}

export const COLUMNS: ColumnDef[] = [
  { key: "id", label: "Customer ID", value: (c) => c.id, className: "whitespace-nowrap" },
  { key: "name", label: "Customer Name", value: (c) => c.name, className: "whitespace-nowrap font-semibold" },
  { key: "shopName", label: "Shop Name", value: (c) => c.shopName, className: "whitespace-nowrap" },
  { key: "mobile", label: "Mobile", value: (c) => c.mobile, className: "whitespace-nowrap" },
  { key: "altMobile", label: "Alternate Mobile", value: (c) => c.altMobile, className: "whitespace-nowrap" },
  { key: "address1", label: "Address Line 1", value: (c) => c.address1, className: "min-w-[14rem]" },
  { key: "address2", label: "Address Line 2", value: (c) => c.address2, className: "min-w-[16rem]" },
  { key: "area", label: "Area", value: (c) => c.area, className: "whitespace-nowrap" },
  { key: "city", label: "City", value: (c) => c.city, className: "whitespace-nowrap" },
  { key: "district", label: "District", value: (c) => c.district, className: "whitespace-nowrap" },
  { key: "state", label: "State", value: (c) => c.state, className: "whitespace-nowrap" },
  { key: "pin", label: "PIN Code", value: (c) => c.pin, className: "whitespace-nowrap" },
  { key: "gst", label: "GST Number", value: (c) => c.gst, className: "whitespace-nowrap" },
  { key: "createdAt", label: "Created On", value: (c) => formatDateNumeric(c.createdAt), className: "whitespace-nowrap" },
];

export const ALL_COLUMN_KEYS: ColumnKey[] = COLUMNS.map((c) => c.key);
