import Link from "next/link";
import type { Customer } from "@/types/customer";
import { formatDateNumeric } from "@/lib/format";
import { Card } from "@/components/common/page-header";

export function RecentCustomers({ items }: { items: Customer[] }) {
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink">Recently Added Customers</h2>
        <Link href="/customers" className="text-sm font-semibold text-navy hover:underline">View all →</Link>
      </div>
      {items.length === 0 ? <p className="text-sm text-muted">Nothing here yet.</p> : (
        <ul className="divide-y divide-line">
          {items.map((c) => (
            <li key={c.id}>
              <Link href={`/customers/view/?id=${encodeURIComponent(c.id)}`} className="flex items-center gap-4 py-3.5 hover:opacity-80">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy/10 text-lg font-bold text-navy">{(c.name.trim()[0] ?? "?").toUpperCase()}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-ink">{c.name}</span>
                  <span className="block truncate text-sm text-muted">{[c.shopName, c.state].filter(Boolean).join(" · ") || c.id}</span>
                </span>
                <span className="shrink-0 text-xs text-muted sm:text-sm">{formatDateNumeric(c.createdAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
