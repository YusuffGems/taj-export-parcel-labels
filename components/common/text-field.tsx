import type { HTMLInputTypeAttribute } from "react";
import { cn } from "@/lib/format";

export const inputClass = "w-full rounded-lg border border-line bg-input px-3 py-2 text-sm text-fg placeholder:text-muted/70 focus:border-gold focus:outline-2 focus:outline-gold/40";

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  type?: HTMLInputTypeAttribute;
  inputMode?: "text" | "numeric" | "tel" | "email";
  maxLength?: number;
  placeholder?: string;
  multiline?: boolean;
  list?: string;
  className?: string;
  autoComplete?: string;
}

export function TextField({ label, value, onChange, error, required, type = "text", inputMode, maxLength, placeholder, multiline, list, className, autoComplete }: Props) {
  const id = `f-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const common = {
    id, value, required, placeholder, maxLength, autoComplete,
    "aria-invalid": Boolean(error), "aria-describedby": error ? `${id}-err` : undefined,
    className: cn(inputClass, error && "border-red-500"),
  };
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-fg">
        {label}{required && <span className="text-red-600"> *</span>}
      </label>
      {multiline
        ? <textarea {...common} rows={3} onChange={(e) => onChange(e.target.value)} />
        : <input {...common} type={type} inputMode={inputMode} list={list} onChange={(e) => onChange(e.target.value)} />}
      {error && <p id={`${id}-err`} className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
