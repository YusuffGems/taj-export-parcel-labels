"use client";

import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";
import type { Customer } from "@/types/customer";
import { COLUMNS, type ColumnKey } from "@/lib/customer-columns";
import { cn, fullAddress } from "@/lib/format";

interface Props {
  customers: Customer[];
  columns: ColumnKey[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onTogglePage: (on: boolean) => void;
  onDelete?: (customer: Customer) => void;
  showActions?: boolean;
}

const viewHref = (c: Customer) => `/customers/view/?id=${encodeURIComponent(c.id)}`;
const editHref = (c: Customer) => `/customers/edit/?id=${encodeURIComponent(c.id)}`;
const checkbox = "h-[18px] w-[18px] rounded accent-[#0b4a8a]";

function RowActions({ c, onDelete }: { c: Customer; onDelete?: (c: Customer) => void }) {
  const btn = "rounded-lg p-2 text-muted hover:bg-bg hover:text-ink";
  return (
    <div className="flex items-center gap-0.5">
      <Link href={viewHref(c)} aria-label={`View ${c.name}`} className={btn}><Eye className="h-4 w-4" /></Link>
      <Link href={editHref(c)} aria-label={`Edit ${c.name}`} className={btn}><Pencil className="h-4 w-4" /></Link>
      {onDelete && <button type="button" onClick={() => onDelete(c)} aria-label={`Delete ${c.name}`} className={cn(btn, "hover:text-red-600")}><Trash2 className="h-4 w-4" /></button>}
    </div>
  );
}

export function CustomerTable({ customers, columns, selected, onToggle, onTogglePage, onDelete, showActions = true }: Props) {
  const cols = COLUMNS.filter((c) => columns.includes(c.key));
  const allOnPage = customers.length > 0 && customers.every((c) => selected.has(c.id));
  const someOnPage = customers.some((c) => selected.has(c.id));

  return (
    <>
      {/* Tablet / desktop: scrollable table */}
      <div className="hidden overflow-x-auto rounded-xl border border-line md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-bg text-ink">
            <tr>
              <th className="w-14 px-4 py-4">
                <input type="checkbox" aria-label="Select all customers on this page" checked={allOnPage} className={checkbox}
                  ref={(el) => { if (el) el.indeterminate = !allOnPage && someOnPage; }} onChange={(e) => onTogglePage(e.target.checked)} />
              </th>
              {cols.map((c) => <th key={c.key} className="whitespace-nowrap px-3 py-4 font-bold">{c.label}</th>)}
              {showActions && <th className="sticky right-0 bg-bg px-3 py-4"><span className="sr-only">Actions</span></th>}
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className={cn("border-t border-line text-fg transition hover:bg-bg/70", selected.has(c.id) && "bg-gold/10")}>
                <td className="px-4 py-[18px]"><input type="checkbox" aria-label={`Select ${c.name}`} checked={selected.has(c.id)} onChange={() => onToggle(c.id)} className={checkbox} /></td>
                {cols.map((col) => (
                  <td key={col.key} className={cn("px-3 py-[18px] align-middle", col.className)}>
                    {col.key === "name" ? <Link href={viewHref(c)} className="text-ink hover:underline">{c.name}</Link> : col.value(c)}
                  </td>
                ))}
                {showActions && <td className="sticky right-0 bg-card px-3 py-2 shadow-[-8px_0_8px_-8px_rgba(15,42,82,0.18)]"><RowActions c={c} onDelete={onDelete} /></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phones: cards */}
      <div className="space-y-3 md:hidden">
        <label className="flex items-center gap-2 px-1 text-sm text-muted">
          <input type="checkbox" checked={allOnPage} onChange={(e) => onTogglePage(e.target.checked)} className={checkbox} /> Select all on this page
        </label>
        {customers.map((c) => (
          <div key={c.id} className={cn("rounded-xl border border-line bg-card p-3.5", selected.has(c.id) && "border-gold bg-gold/10")}>
            <div className="flex items-start gap-3">
              <input type="checkbox" aria-label={`Select ${c.name}`} checked={selected.has(c.id)} onChange={() => onToggle(c.id)} className={cn(checkbox, "mt-1 shrink-0")} />
              <div className="min-w-0 flex-1">
                <div className="text-xs text-muted">{c.id}</div>
                <Link href={viewHref(c)} className="block break-words font-semibold text-ink">{c.name}</Link>
                {c.shopName && <div className="break-words text-sm text-fg">{c.shopName}</div>}
                <div className="mt-1 text-sm text-fg">{c.mobile || "No mobile"}</div>
                <div className="break-words text-xs text-muted">{fullAddress(c) || "No address"}</div>
              </div>
            </div>
            {showActions && <div className="mt-2 flex justify-end border-t border-line pt-2"><RowActions c={c} onDelete={onDelete} /></div>}
          </div>
        ))}
      </div>
    </>
  );
}
