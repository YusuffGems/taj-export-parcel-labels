import type { Customer, CustomerErrors, CustomerInput } from "@/types/customer";

const GST_REGEX = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const PIN_REGEX = /^[1-9]\d{5}$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/;

/** Returns the 10-digit Indian mobile number (strips +91 / 0 prefixes, spaces, dashes). */
export function normalizeMobile(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}

export function isValidMobile(value: string): boolean {
  return MOBILE_REGEX.test(normalizeMobile(value));
}

export function isValidPin(value: string): boolean {
  return PIN_REGEX.test(value.trim());
}

export function isValidGst(value: string): boolean {
  return GST_REGEX.test(value.trim().toUpperCase());
}

/** Trims text, normalises mobiles and upper-cases GST so stored data is consistent. */
export function normalizeCustomerInput(input: CustomerInput): CustomerInput {
  const t = (v: string) => (v ?? "").trim();
  const mobile = t(input.mobile);
  const alt = t(input.altMobile);
  return {
    ...input,
    name: t(input.name),
    shopName: t(input.shopName),
    mobile: mobile && isValidMobile(mobile) ? normalizeMobile(mobile) : mobile,
    altMobile: alt && isValidMobile(alt) ? normalizeMobile(alt) : alt,
    gst: t(input.gst).toUpperCase(),
    address1: t(input.address1),
    address2: t(input.address2),
    landmark: t(input.landmark),
    area: t(input.area),
    city: t(input.city),
    district: t(input.district),
    state: t(input.state),
    pin: t(input.pin),
    notes: t(input.notes),
    active: Boolean(input.active),
  };
}

export function validateCustomer(input: CustomerInput): CustomerErrors {
  const errors: CustomerErrors = {};
  if (!input.name.trim()) errors.name = "Customer name is required.";
  if (input.mobile.trim() && !isValidMobile(input.mobile)) errors.mobile = "Enter a valid 10-digit mobile number.";
  if (input.altMobile.trim() && !isValidMobile(input.altMobile)) errors.altMobile = "Enter a valid 10-digit mobile number.";
  if (input.gst.trim() && !isValidGst(input.gst)) errors.gst = "Enter a valid 15-character GST number (e.g. 33ABCDE1234F1Z5).";
  if (input.pin.trim() && !isValidPin(input.pin)) errors.pin = "PIN code must be 6 digits and cannot start with 0.";
  return errors;
}

/** Finds a likely duplicate: same mobile number, or same name + PIN code. */
export function findDuplicate(input: CustomerInput, existing: Customer[], excludeId?: string): Customer | undefined {
  const mobile = normalizeMobile(input.mobile);
  const name = input.name.trim().toLowerCase();
  const pin = input.pin.trim();
  return existing.find((c) => {
    if (c.id === excludeId) return false;
    if (mobile.length === 10 && normalizeMobile(c.mobile) === mobile) return true;
    return Boolean(name && pin && c.name.trim().toLowerCase() === name && c.pin === pin);
  });
}
