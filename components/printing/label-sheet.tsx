import { Fragment } from "react";
import type { Customer } from "@/types/customer";
import type { PrintOptions } from "@/types/printing";
import { buildSenderLines, buildToBlock } from "@/lib/format";
import { pickToFontSize } from "@/lib/print-layout";

function Label({ customer, options }: { customer: Customer; options: PrintOptions }) {
  const to = buildToBlock(customer);
  const fromLines = options.sender ? buildSenderLines(options.sender) : [];
  const size = pickToFontSize(to, fromLines.length, options.fontScale);
  return (
    <div className="label" data-testid="label">
      {fromLines.length > 0 && (
        <div className="from">
          <span className="tag">FROM:</span>
          <div className="from-lines">{fromLines.map((l, i) => <div key={i} style={i === 0 ? { fontWeight: 700 } : undefined}>{l}</div>)}</div>
        </div>
      )}
      <div className="to">
        <span className="tag">TO:</span>
        <div className="to-body" style={{ fontSize: `${size}pt` }}>
          <div className="to-name">{to.name}</div>
          {to.shop && <div className="to-shop">{to.shop}</div>}
          {to.body.map((line, i) => <div key={i}>{line}</div>)}
          {to.phone && <div className="to-phone">Mobile: {to.phone}</div>}
        </div>
      </div>
    </div>
  );
}

/** One physical A4 sheet holding one or two address labels. */
export function LabelSheet({ customers, options }: { customers: Customer[]; options: PrintOptions }) {
  return (
    <section className="sheet" data-testid="sheet">
      {customers.map((c, i) => (
        <Fragment key={c.id}>
          {i > 0 && options.showCutLine && <div className="cut-line" aria-hidden="true" />}
          <Label customer={c} options={options} />
        </Fragment>
      ))}
    </section>
  );
}
