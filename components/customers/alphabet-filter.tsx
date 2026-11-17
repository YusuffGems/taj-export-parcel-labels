import { ALPHABET } from "@/lib/customer-search";
import { cn } from "@/lib/format";

interface Props {
  value: string;
  /** Letters that have at least one customer (under the other active filters). */
  available: Set<string>;
  onChange: (letter: string) => void;
}

/** A–Z quick filter: picks customers whose name OR shop name starts with the letter. */
export function AlphabetFilter({ value, available, onChange }: Props) {
  const items = ["", ...ALPHABET, "#"];
  return (
    <div role="group" aria-label="Filter by first letter of customer or shop name"
      className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1.5 [scrollbar-width:thin] md:flex-wrap md:overflow-visible md:pb-0">
      {items.map((l) => {
        const active = value === l;
        const disabled = l !== "" && !active && !available.has(l);
        return (
          <button key={l || "all"} type="button" aria-pressed={active} disabled={disabled} onClick={() => onChange(active && l !== "" ? "" : l)}
            title={l === "" ? "All customers" : l === "#" ? "Names starting with a number or symbol" : `Names starting with ${l}`}
            className={cn("h-10 min-w-10 shrink-0 rounded-lg border px-2.5 text-sm font-semibold transition",
              active ? "border-navy bg-navy text-white shadow-sm" : "border-line bg-card text-ink hover:bg-bg",
              disabled && "cursor-not-allowed opacity-35 hover:bg-card")}>
            {l === "" ? "All" : l}
          </button>
        );
      })}
    </div>
  );
}
