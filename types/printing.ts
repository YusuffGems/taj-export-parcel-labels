export interface SenderAddress {
  name: string;
  businessName: string;
  mobile: string;
  address1: string;
  address2: string;
  area: string;
  city: string;
  state: string;
  pin: string;
}

export type SenderMode = "default" | "custom" | "none";

export interface PrintOptions {
  sender: SenderAddress | null;
  showCutLine: boolean;
  fontScale: number;
}
