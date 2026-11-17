import type { Customer, CustomerInput } from "@/types/customer";

export const EMPTY_CUSTOMER: CustomerInput = {
  name: "",
  shopName: "",
  mobile: "",
  altMobile: "",
  gst: "",
  address1: "",
  address2: "",
  landmark: "",
  area: "",
  city: "",
  district: "",
  state: "",
  pin: "",
  notes: "",
  active: true,
};

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
  "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

/** Columns used for CSV / Excel export (and understood by the importer). */
export const EXPORT_COLUMNS: { key: keyof Customer; label: string }[] = [
  { key: "id", label: "Customer ID" },
  { key: "name", label: "Customer Name" },
  { key: "shopName", label: "Shop / Business Name" },
  { key: "mobile", label: "Mobile Number" },
  { key: "altMobile", label: "Alternate Mobile Number" },
  { key: "gst", label: "GST Number" },
  { key: "address1", label: "Address Line 1" },
  { key: "address2", label: "Address Line 2" },
  { key: "landmark", label: "Landmark" },
  { key: "area", label: "Area" },
  { key: "city", label: "City" },
  { key: "district", label: "District" },
  { key: "state", label: "State" },
  { key: "pin", label: "PIN Code" },
  { key: "notes", label: "Additional Notes" },
  { key: "active", label: "Active" },
  { key: "createdAt", label: "Created Date" },
  { key: "updatedAt", label: "Updated Date" },
];

/** Fields that can be mapped during import, with header aliases for auto-matching. */
export const IMPORT_FIELDS: { key: keyof CustomerInput; label: string; aliases: string[] }[] = [
  { key: "name", label: "Customer Name", aliases: ["customername", "name", "customer", "party", "partyname"] },
  { key: "shopName", label: "Shop / Business Name", aliases: ["shopbusinessname", "shopname", "shop", "businessname", "business", "firm", "firmname", "company"] },
  { key: "mobile", label: "Mobile Number", aliases: ["mobilenumber", "mobile", "phone", "phonenumber", "contact", "mobileno"] },
  { key: "altMobile", label: "Alternate Mobile Number", aliases: ["alternatemobilenumber", "alternatemobile", "altmobile", "alternatephone", "mobile2"] },
  { key: "gst", label: "GST Number", aliases: ["gstnumber", "gst", "gstin"] },
  { key: "address1", label: "Address Line 1", aliases: ["addressline1", "address1", "address", "street", "addr1"] },
  { key: "address2", label: "Address Line 2", aliases: ["addressline2", "address2", "addr2"] },
  { key: "landmark", label: "Landmark", aliases: ["landmark"] },
  { key: "area", label: "Area", aliases: ["area", "locality"] },
  { key: "city", label: "City", aliases: ["city", "town"] },
  { key: "district", label: "District", aliases: ["district"] },
  { key: "state", label: "State", aliases: ["state"] },
  { key: "pin", label: "PIN Code", aliases: ["pincode", "pin", "zip", "zipcode", "postalcode"] },
  { key: "notes", label: "Additional Notes", aliases: ["additionalnotes", "notes", "note", "remarks"] },
  { key: "active", label: "Active", aliases: ["active", "status"] },
];
