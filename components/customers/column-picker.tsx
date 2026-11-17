import { ALL_COLUMN_KEYS, COLUMNS, type ColumnKey } from "@/lib/customer-columns";
import { Button } from "@/components/common/button";

interface Props {
  visible: ColumnKey[];
  onToggle: (key: ColumnKey) => void;
  onShowAll: () => void;
  onClose: () => void;
}

export function ColumnPicker({ visible, onToggle, onShowAll, onClose }: Props) {
  return (
    <fieldset className="rounded-xl border border-line bg-bg px-4 py-3">
      <legend className="sr-only">Visible columns</legend>
      <div className="flex flex-wrap gap-x-6 gap-y-2.5">
        {COLUMNS.map((c) => (
          <label key={c.key} className="flex cursor-pointer items-center gap-2 text-sm text-fg">
            <input type="checkbox" checked={visible.includes(c.key)} onChange={() => onToggle(c.key)} className="h-4 w-4 accent-[#0b4a8a]" />
            {c.label}
          </label>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="outline" className="min-h-9 px-3 py-1" disabled={visible.length === ALL_COLUMN_KEYS.length} onClick={onShowAll}>Show all</Button>
        <Button variant="primary" className="min-h-9 px-3 py-1" onClick={onClose}>Done</Button>
      </div>
    </fieldset>
  );
}
