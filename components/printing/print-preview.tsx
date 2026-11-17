"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Printer } from "lucide-react";
import type { Customer } from "@/types/customer";
import type { PrintOptions } from "@/types/printing";
import { buildSenderLines } from "@/lib/format";
import { Modal } from "@/components/common/modal";
import { Button } from "@/components/common/button";
import { LabelSheet } from "./label-sheet";
import { PrintPortal } from "./print-portal";

const SHEET_WIDTH_PX = 794; // 210 mm at 96 dpi

interface Props {
  pages: Customer[][];
  options: PrintOptions;
  onPrint: () => void;
  onBack: () => void;
  onCancel: () => void;
}

export function PrintPreview({ pages, options, onPrint, onBack, onCancel }: Props) {
  const [index, setIndex] = useState(0);
  const [scale, setScale] = useState(0.6);
  const box = useRef<HTMLDivElement>(null);
  const total = pages.reduce((n, p) => n + p.length, 0);
  const current = pages[Math.min(index, pages.length - 1)] ?? [];

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const update = () => setScale(Math.max(0.3, Math.min(1, (el.clientWidth - 24) / SHEET_WIDTH_PX)));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const fromLines = options.sender ? buildSenderLines(options.sender) : [];

  return (
    <>
      <Modal title="Print preview" onClose={onCancel} size="xl"
        footer={<>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant="outline" onClick={onBack}>Change FROM address</Button>
          <Button variant="gold" onClick={onPrint}><Printer className="h-4 w-4" /> Print / Save as PDF</Button>
        </>}>
        <div className="grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-lg border border-line p-3"><div className="text-muted">Selected customers</div><div className="text-xl font-bold text-fg">{total}</div></div>
          <div className="rounded-lg border border-line p-3"><div className="text-muted">A4 pages</div><div className="text-xl font-bold text-fg">{pages.length}</div></div>
          <div className="rounded-lg border border-line p-3">
            <div className="text-muted">FROM address</div>
            {fromLines.length ? <div className="text-xs text-fg">{fromLines.join(", ")}</div> : <div className="text-fg">Not printed</div>}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-3">
          <Button variant="outline" disabled={index === 0} onClick={() => setIndex((i) => i - 1)} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-sm font-medium text-fg">Page {index + 1} of {pages.length} · {current.length} label{current.length === 1 ? "" : "s"}</span>
          <Button variant="outline" disabled={index >= pages.length - 1} onClick={() => setIndex((i) => i + 1)} aria-label="Next page"><ChevronRight className="h-4 w-4" /></Button>
        </div>

        <div ref={box} className="mt-3 overflow-auto rounded-lg bg-slate-300/60 p-3 dark:bg-slate-700/40">
          <div style={{ width: `${SHEET_WIDTH_PX * scale}px`, margin: "0 auto" }}>
            <div style={{ zoom: scale }} className="shadow-lg"><LabelSheet customers={current} options={options} /></div>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted">In the browser print dialog choose paper size <b>A4</b>, <b>Portrait</b>, margins <b>None</b>, scale <b>100%</b>, and turn on <b>Background graphics</b>. Choose &quot;Save as PDF&quot; as the printer to create a PDF.</p>
      </Modal>
      <PrintPortal pages={pages} options={options} />
    </>
  );
}
