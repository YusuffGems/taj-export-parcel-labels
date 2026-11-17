"use client";

import { useMemo, useState } from "react";
import { Filter } from "lucide-react";
import type { Customer } from "@/types/customer";
import type { SortKey } from "@/lib/customer-search";
import { useCustomerQuery, useCustomers, useSettings } from "@/hooks/use-customers";
import { useColumnPrefs } from "@/hooks/use-column-prefs";
import { usePrinting } from "@/hooks/use-printing";
import { useSelection } from "@/hooks/use-selection";
import { useToast } from "@/hooks/use-toast";
import { deleteCustomers } from "@/lib/customer-storage";
import { LinkButton } from "@/components/common/button";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState, LoadingState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { inputClass } from "@/components/common/text-field";
import { SenderDialog } from "@/components/printing/sender-dialog";
import { PrintPreview } from "@/components/printing/print-preview";
import { AlphabetFilter } from "./alphabet-filter";
import { ColumnPicker } from "./column-picker";
import { CustomerFiltersBar } from "./customer-filters";
import { CustomerTable } from "./customer-table";
import { DirectoryFooter } from "./directory-footer";
import { DirectoryToolbar } from "./directory-toolbar";

const COPY = {
  manage: { title: "All Customers", description: "Search, organise, select and print customer delivery addresses." },
  print: { title: "Print Addresses", description: "Select customers, choose the FROM address and print two labels per A4 page." },
};

/** The main customer list. `print` mode hides row actions; both modes can print the selection. */
export function CustomerDirectory({ mode }: { mode: "manage" | "print" }) {
  const { customers, loading } = useCustomers();
  const { settings } = useSettings();
  const q = useCustomerQuery(customers, 10);
  const { selected, toggle, setMany, clear } = useSelection();
  const columns = useColumnPrefs();
  const { toast } = useToast();
  const [showColumns, setShowColumns] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Customer | "selected" | null>(null);

  const chosen = useMemo(
    () => customers.filter((c) => selected.has(c.id)).sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" })),
    [customers, selected],
  );
  const printing = usePrinting(chosen, settings);

  if (loading) return <LoadingState />;
  const copy = COPY[mode];

  const allMatching = q.filtered.length > 0 && q.filtered.every((c) => selected.has(c.id));
  const linkBtn = "font-semibold text-navy hover:underline disabled:opacity-50";

  async function confirmDelete() {
    const ids = pendingDelete === "selected" ? chosen.map((c) => c.id) : pendingDelete ? [pendingDelete.id] : [];
    await deleteCustomers(ids);
    setMany(ids, false);
    toast(`${ids.length} customer${ids.length === 1 ? "" : "s"} deleted.`);
    setPendingDelete(null);
  }

  return (
    <>
      <PageHeader title={copy.title} description={copy.description} />

      <section className="rounded-2xl border border-line bg-card p-4 shadow-sm sm:p-6">
        <DirectoryToolbar matching={q.filtered.length} selectedCount={chosen.length} onToggleColumns={() => setShowColumns((s) => !s)}
          exportRows={chosen.length > 0 ? chosen : q.filtered} exportScope={chosen.length > 0 ? "selected customer(s)" : "filtered customer(s)"}
          onPrint={printing.start} />

        {customers.length === 0 ? (
          <div className="mt-6">
            <EmptyState title="No customers yet" message="Add your first customer or import a CSV / Excel file."
              action={<><LinkButton href="/customers/add" variant="gold">Add customer</LinkButton><LinkButton href="/import-export" variant="outline">Import customers</LinkButton></>} />
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {showColumns && <ColumnPicker visible={columns.visible} onToggle={columns.toggle} onShowAll={columns.showAll} onClose={() => setShowColumns(false)} />}
            <CustomerFiltersBar filters={q.filters} states={q.states} districts={q.districts} onChange={q.setFilters} onReset={q.reset} />

            <AlphabetFilter value={q.filters.letter} available={q.letters} onChange={(letter) => q.setFilters({ letter })} />

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <div className="flex items-center gap-2 text-ink">
                <Filter className="h-4 w-4 text-muted" /><span className="font-semibold">Sort by</span>
                <select aria-label="Sort customers" value={q.filters.sort} onChange={(e) => q.setFilters({ sort: e.target.value as SortKey })} className={`${inputClass} h-11 w-auto rounded-xl`}>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Name (A–Z)</option>
                </select>
              </div>
              <button type="button" className={linkBtn} onClick={() => setMany(q.filtered.map((c) => c.id), !allMatching)}>
                {allMatching ? `Unselect all ${q.filtered.length} filtered results` : `Select all ${q.filtered.length} filtered results`}
              </button>
              {chosen.length > 0 && <button type="button" className={linkBtn} onClick={clear}>Clear selection</button>}
              {chosen.length > 0 && mode === "manage" && <button type="button" className="font-semibold text-red-600 hover:underline" onClick={() => setPendingDelete("selected")}>Delete selected</button>}
              <span className="ml-auto hidden text-muted lg:inline">Select across pages supported</span>
            </div>

            {q.filtered.length === 0
              ? <EmptyState title="No matching customers" message="Try a different search or reset the filters." />
              : <CustomerTable customers={q.pageItems} columns={columns.visible} selected={selected} onToggle={toggle}
                  onTogglePage={(on) => setMany(q.pageItems.map((c) => c.id), on)} onDelete={mode === "manage" ? setPendingDelete : undefined} showActions />}

            <DirectoryFooter page={q.page} pageCount={q.pageCount} pageSize={q.pageSize} total={q.filtered.length} onPage={q.setPage} onPageSize={q.setPageSize} />
          </div>
        )}
      </section>

      {pendingDelete && (
        <ConfirmDialog title="Delete customers?" onCancel={() => setPendingDelete(null)} onConfirm={confirmDelete}
          message={pendingDelete === "selected"
            ? <>Permanently delete <b>{chosen.length}</b> selected customer{chosen.length === 1 ? "" : "s"}? This cannot be undone. Consider downloading a backup first.</>
            : <>Permanently delete <b>{pendingDelete.name}</b>? This cannot be undone.</>} />
      )}
      {printing.step === "sender" && (
        <SenderDialog count={chosen.length} initialMode={settings.defaultSenderMode} initialCustom={settings.customSender}
          onCancel={printing.cancel} onContinue={printing.confirmSender} />
      )}
      {printing.step === "preview" && printing.options && (
        <PrintPreview pages={printing.pages} options={printing.options} onPrint={printing.print} onBack={printing.backToSender} onCancel={printing.cancel} />
      )}
    </>
  );
}
