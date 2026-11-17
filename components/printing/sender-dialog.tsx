"use client";

import { useState } from "react";
import type { SenderAddress, SenderMode } from "@/types/printing";
import { DEFAULT_SENDER, EMPTY_SENDER } from "@/constants/business";
import { buildSenderLines } from "@/lib/format";
import { isValidMobile, isValidPin } from "@/lib/customer-validation";
import { Modal } from "@/components/common/modal";
import { Button } from "@/components/common/button";
import { cn } from "@/lib/format";
import { SenderFields, type SenderErrors } from "./sender-fields";

interface Props {
  count: number;
  initialMode: SenderMode;
  initialCustom: SenderAddress;
  onCancel: () => void;
  onContinue: (mode: SenderMode, custom: SenderAddress, save: boolean) => void | Promise<void>;
}

function validateSender(s: SenderAddress): SenderErrors {
  const e: SenderErrors = {};
  if (!s.name.trim() && !s.businessName.trim()) e.name = "Enter a sender name or business name.";
  if (!s.address1.trim()) e.address1 = "Address line 1 is required.";
  if (s.mobile.trim() && !isValidMobile(s.mobile)) e.mobile = "Enter a valid 10-digit mobile number.";
  if (s.pin.trim() && !isValidPin(s.pin)) e.pin = "PIN code must be 6 digits.";
  return e;
}

export function SenderDialog({ count, initialMode, initialCustom, onCancel, onContinue }: Props) {
  const [mode, setMode] = useState<SenderMode>(initialMode);
  const [custom, setCustom] = useState<SenderAddress>({ ...EMPTY_SENDER, ...initialCustom });
  const [save, setSave] = useState(true);
  const [errors, setErrors] = useState<SenderErrors>({});

  const options: { value: SenderMode; title: string; body: string[] }[] = [
    { value: "default", title: "Default TAJ EXPORT address", body: buildSenderLines(DEFAULT_SENDER) },
    { value: "custom", title: "Custom sender address", body: ["Enter your own FROM details below."] },
    { value: "none", title: "No FROM address", body: ["Print only the customer TO address."] },
  ];

  async function submit() {
    if (mode === "custom") {
      const found = validateSender(custom);
      setErrors(found);
      if (Object.keys(found).length > 0) return;
    }
    await onContinue(mode, custom, save);
  }

  return (
    <Modal title="Choose FROM (sender) address" onClose={onCancel} size="lg"
      footer={<><Button variant="outline" onClick={onCancel}>Cancel</Button><Button variant="gold" onClick={submit}>Continue to preview</Button></>}>
      <p className="mb-4 text-sm text-muted">Printing <b className="text-fg">{count}</b> customer address{count === 1 ? "" : "es"}.</p>
      <div role="radiogroup" aria-label="Sender address option" className="space-y-3">
        {options.map((o) => (
          <label key={o.value} className={cn("flex cursor-pointer gap-3 rounded-xl border p-3", mode === o.value ? "border-gold bg-gold/10" : "border-line")}>
            <input type="radio" name="sender-mode" value={o.value} checked={mode === o.value} onChange={() => setMode(o.value)} className="mt-1 h-4 w-4 accent-[#c9a227]" />
            <span className="min-w-0 text-sm">
              <span className="block font-semibold text-fg">{o.title}</span>
              {o.body.map((line) => <span key={line} className="block text-muted">{line}</span>)}
            </span>
          </label>
        ))}
      </div>
      {mode === "custom" && (
        <div className="mt-4 space-y-3">
          <SenderFields value={custom} onChange={setCustom} errors={errors} idPrefix="Sender" />
          <label className="flex items-center gap-2 text-sm text-fg">
            <input type="checkbox" checked={save} onChange={(e) => setSave(e.target.checked)} className="h-4 w-4 accent-[#c9a227]" /> Save this sender address for future printing
          </label>
        </div>
      )}
    </Modal>
  );
}
