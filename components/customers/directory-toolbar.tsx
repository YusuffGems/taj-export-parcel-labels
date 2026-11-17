import { Printer, Settings2, Plus } from "lucide-react";
import type { Customer } from "@/types/customer";
import { Button, LinkButton } from "@/components/common/button";
import { ExportMenu } from "./export-menu";

interface Props {
  matching: number;
  selectedCount: number;
  exportRows: Customer[];
  exportScope: string;
  onToggleColumns: () => void;
  onPrint: () => void;
}

export function DirectoryToolbar({ matching, selectedCount, exportRows, exportScope, onToggleColumns, onPrint }: Props) {
  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
      <div>
        <h2 className="text-2xl font-bold text-ink">Customer Directory</h2>
        <p className="mt-1 text-sm text-muted sm:text-base">{matching} matching customer(s) · {selectedCount} selected</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" className="hidden md:inline-flex" onClick={onToggleColumns}><Settings2 className="h-4 w-4" /> Columns</Button>
        <ExportMenu rows={exportRows} scopeLabel={exportScope} />
        <Button variant="gold" disabled={selectedCount === 0} onClick={onPrint}><Printer className="h-4 w-4" /> Print Selected ({selectedCount})</Button>
        <LinkButton href="/customers/add" variant="primary"><Plus className="h-4 w-4" /> Add Customer</LinkButton>
      </div>
    </div>
  );
}
