"use client";

import { createPortal } from "react-dom";
import type { Customer } from "@/types/customer";
import type { PrintOptions } from "@/types/printing";
import { LabelSheet } from "./label-sheet";

/**
 * Renders every A4 sheet directly under <body>. The print stylesheet hides everything
 * else, so only these sheets reach the printer / "Save as PDF".
 */
export function PrintPortal({ pages, options }: { pages: Customer[][]; options: PrintOptions }) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <div id="print-portal" className="print-portal">
      {pages.map((group) => <LabelSheet key={group.map((c) => c.id).join("|")} customers={group} options={options} />)}
    </div>,
    document.body,
  );
}
