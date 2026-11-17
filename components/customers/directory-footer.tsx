import { ChevronLeft, ChevronRight } from "lucide-react";
import { inputClass } from "@/components/common/text-field";

interface Props {
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
  onPage: (p: number) => void;
  onPageSize: (n: number) => void;
}

const arrow = "flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-card text-ink hover:bg-bg disabled:opacity-40 disabled:hover:bg-card";

export function DirectoryFooter({ page, pageCount, pageSize, total, onPage, onPageSize }: Props) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
      <span>Showing {from}–{to} of {total}</span>
      <div className="flex items-center gap-2">
        <select aria-label="Rows per page" value={pageSize} onChange={(e) => onPageSize(Number(e.target.value))} className={`${inputClass} h-10 w-auto rounded-xl pr-8`}>
          {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n} / page</option>)}
        </select>
        <button type="button" className={arrow} disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button>
        <span className="min-w-12 text-center font-semibold text-ink">{page} / {pageCount}</span>
        <button type="button" className={arrow} disabled={page >= pageCount} onClick={() => onPage(page + 1)} aria-label="Next page"><ChevronRight className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
