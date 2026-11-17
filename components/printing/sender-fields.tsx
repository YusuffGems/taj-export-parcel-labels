import type { SenderAddress } from "@/types/printing";
import { INDIAN_STATES } from "@/constants/customer";
import { TextField } from "@/components/common/text-field";

export type SenderErrors = Partial<Record<keyof SenderAddress, string>>;

interface Props {
  value: SenderAddress;
  onChange: (next: SenderAddress) => void;
  errors?: SenderErrors;
  idPrefix?: string;
}

/** Form fields for a custom sender (FROM) address. Shared by the print dialog and Settings. */
export function SenderFields({ value, onChange, errors = {}, idPrefix = "Sender" }: Props) {
  const set = (key: keyof SenderAddress) => (v: string) => onChange({ ...value, [key]: v });
  const p = (label: string) => `${idPrefix} ${label}`;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <TextField label={p("Name")} value={value.name} onChange={set("name")} error={errors.name} />
      <TextField label={p("Business Name")} value={value.businessName} onChange={set("businessName")} />
      <TextField label={p("Mobile Number")} value={value.mobile} onChange={set("mobile")} error={errors.mobile} inputMode="tel" type="tel" />
      <TextField label={p("Area")} value={value.area} onChange={set("area")} />
      <TextField label={p("Address Line 1")} value={value.address1} onChange={set("address1")} error={errors.address1} className="sm:col-span-2" />
      <TextField label={p("Address Line 2")} value={value.address2} onChange={set("address2")} className="sm:col-span-2" />
      <TextField label={p("City")} value={value.city} onChange={set("city")} />
      <TextField label={p("State")} value={value.state} onChange={set("state")} list={`${idPrefix}-states`} />
      <TextField label={p("PIN Code")} value={value.pin} onChange={set("pin")} error={errors.pin} inputMode="numeric" maxLength={6} />
      <datalist id={`${idPrefix}-states`}>{INDIAN_STATES.map((s) => <option key={s} value={s} />)}</datalist>
    </div>
  );
}
