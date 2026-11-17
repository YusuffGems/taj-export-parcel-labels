import type { LucideIcon } from "lucide-react";

export type StatTone = "blue" | "gold" | "purple" | "green";

const GRADIENTS: Record<StatTone, string> = {
  blue: "linear-gradient(110deg, #0b57a4 0%, #1a8be0 100%)",
  gold: "linear-gradient(110deg, #d49a1c 0%, #f0c04a 100%)",
  purple: "linear-gradient(110deg, #5a4aa3 0%, #8c7bd8 100%)",
  green: "linear-gradient(110deg, #0d8668 0%, #1bae88 100%)",
};

/** Large gradient KPI card. */
export function StatCard({ label, value, icon: Icon, tone }: { label: string; value: number | string; icon: LucideIcon; tone: StatTone }) {
  return (
    <div className="flex items-center gap-5 rounded-2xl px-6 py-6 text-white shadow-md sm:px-8 sm:py-7" style={{ background: GRADIENTS[tone] }}>
      <Icon className="h-9 w-9 shrink-0 sm:h-11 sm:w-11" strokeWidth={1.6} aria-hidden="true" />
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-white/90 sm:text-base">{label}</div>
        <div className="text-3xl font-bold leading-tight sm:text-4xl">{value}</div>
      </div>
    </div>
  );
}

/** Small white KPI card for secondary numbers. */
export function MiniStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-line bg-card px-5 py-4 shadow-sm">
      <div className="text-2xl font-bold text-ink">{value}</div>
      <div className="text-sm text-muted">{label}</div>
    </div>
  );
}
