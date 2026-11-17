export interface Customer {
  id: string;
  name: string;
  shopName: string;
  mobile: string;
  altMobile: string;
  gst: string;
  address1: string;
  address2: string;
  landmark: string;
  area: string;
  city: string;
  district: string;
  state: string;
  pin: string;
  notes: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CustomerInput = Omit<Customer, "id" | "createdAt" | "updatedAt">;
export type CustomerErrors = Partial<Record<keyof CustomerInput, string>>;
