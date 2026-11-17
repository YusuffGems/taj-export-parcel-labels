"use client";

import { useMemo, useState } from "react";
import type { Customer } from "@/types/customer";
import type { PrintOptions, SenderAddress, SenderMode } from "@/types/printing";
import type { AppSettings } from "@/types/settings";
import { DEFAULT_SENDER } from "@/constants/business";
import { saveSettings } from "@/lib/customer-storage";
import { chunkPairs } from "@/lib/print-layout";

type Step = "idle" | "sender" | "preview";

/** Drives the print flow: choose sender → preview → browser print dialog. */
export function usePrinting(customers: Customer[], settings: AppSettings) {
  const [step, setStep] = useState<Step>("idle");
  const [options, setOptions] = useState<PrintOptions | null>(null);

  const pages = useMemo(() => chunkPairs(customers), [customers]);

  const start = () => setStep("sender");
  const cancel = () => { setStep("idle"); setOptions(null); };

  const confirmSender = async (mode: SenderMode, custom: SenderAddress, save: boolean) => {
    if (mode === "custom" && save) await saveSettings({ customSender: custom, defaultSenderMode: "custom" });
    const sender = mode === "default" ? DEFAULT_SENDER : mode === "custom" ? custom : null;
    setOptions({ sender, showCutLine: settings.showCutLine, fontScale: settings.fontScale });
    setStep("preview");
  };

  const print = () => window.print();

  return { step, options, pages, start, cancel, confirmSender, backToSender: () => setStep("sender"), print };
}
