import { Card } from "@/components/common/page-header";

export function StateDistribution({ data, total }: { data: { state: string; count: number }[]; total: number }) {
  return (
    <Card title="State-wise Customer Distribution">
      {data.length === 0 ? <p className="text-sm text-muted">No customers yet.</p> : (
        <ul className="space-y-4">
          {data.slice(0, 8).map((d) => (
            <li key={d.state} className="grid grid-cols-[minmax(5rem,9rem)_1fr_auto] items-center gap-3 text-sm text-fg">
              <span className="truncate">{d.state}</span>
              <span className="h-4 overflow-hidden rounded-full bg-bg" role="img" aria-label={`${d.count} of ${total} customers`}>
                <span className="block h-full rounded-full" style={{ width: `${Math.max(6, Math.round((d.count / total) * 100))}%`, background: "linear-gradient(90deg, #0b3f7a, #f0c04a)" }} />
              </span>
              <span className="w-6 text-right font-semibold text-ink">{d.count}</span>
            </li>
          ))}
        </ul>
      )}
      {data.length > 8 && <p className="mt-4 text-xs text-muted">Showing the top 8 of {data.length} states.</p>}
    </Card>
  );
}
