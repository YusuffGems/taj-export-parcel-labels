import { RotateCcw, Search } from "lucide-react";
import type { CustomerFilters } from "@/lib/customer-search";
import { inputClass } from "@/components/common/text-field";

interface Props {
  filters: CustomerFilters;
  states: string[];
  districts: string[];
  onChange: (patch: Partial<CustomerFilters>) => void;
  onReset: () => void;
}

export function CustomerFiltersBar({ filters, states, districts, onChange, onReset }: Props) {
  const field = `${inputClass} h-12 rounded-xl`;
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-[2.2fr_1.3fr_1.3fr_1.3fr_0.8fr_auto]">
      <div className="relative sm:col-span-2 lg:col-span-3 2xl:col-span-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input type="search" value={filters.search} onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Search name, shop, mobile, address, PIN…" aria-label="Search customers" className={`${field} pl-11`} />
      </div>
      <select aria-label="Filter by state" value={filters.state} onChange={(e) => onChange({ state: e.target.value })} className={field}>
        <option value="">All States</option>
        {states.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <select aria-label="Filter by district" value={filters.district} onChange={(e) => onChange({ district: e.target.value })} className={field}>
        <option value="">All Districts</option>
        {districts.map((d) => <option key={d} value={d}>{d}</option>)}
      </select>
      <input value={filters.area} onChange={(e) => onChange({ area: e.target.value })} placeholder="Area / locality" aria-label="Filter by area" className={field} />
      <input value={filters.pin} onChange={(e) => onChange({ pin: e.target.value.replace(/\D/g, "").slice(0, 6) })} placeholder="PIN code" inputMode="numeric" aria-label="Filter by PIN code" className={field} />
      <button type="button" onClick={onReset} aria-label="Reset filters" title="Reset filters"
        className="flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-card text-ink hover:bg-bg sm:justify-self-start"><RotateCcw className="h-4 w-4" /></button>
    </div>
  );
}
