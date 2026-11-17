import type { ReactNode } from "react";
import { DateChip } from "./date-chip";

interface HeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  eyebrow?: string;
}

export function PageHeader({ title, description, actions, eyebrow = "Wholesale Business Management" }: HeaderProps) {
  return (
    <header className="mb-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold-ink sm:text-xs">{eyebrow}</p>
          <h1 className="mt-1 break-words text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h1>
          {description && <p className="mt-1.5 text-sm text-muted sm:text-lg">{description}</p>}
        </div>
        <div className="hidden sm:block"><DateChip /></div>
      </div>
      <div className="mt-3 sm:hidden"><DateChip /></div>
      {actions && <div className="mt-4 flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function Card({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-line bg-card p-4 shadow-sm sm:p-6 ${className}`}>
      {title && <h2 className="mb-4 text-lg font-bold text-ink">{title}</h2>}
      {children}
    </section>
  );
}
