import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/format";

type Variant = "primary" | "gold" | "outline" | "danger" | "ghost";

const variants: Record<Variant, string> = {
  primary: "bg-navy text-white hover:bg-navy2 border border-navy shadow-sm",
  gold: "bg-gold text-ink hover:brightness-95 border border-gold shadow-sm",
  outline: "bg-card text-ink border border-line hover:bg-bg",
  danger: "bg-red-600 text-white hover:bg-red-700 border border-red-600",
  ghost: "bg-transparent text-fg hover:bg-bg border border-transparent",
};

const base = "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-50";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant }

export function Button({ variant = "primary", className, type = "button", ...rest }: Props) {
  return <button type={type} className={cn(base, variants[variant], className)} {...rest} />;
}

export function LinkButton({ href, variant = "primary", className, children }: { href: string; variant?: Variant; className?: string; children: ReactNode }) {
  return <Link href={href} className={cn(base, variants[variant], className)}>{children}</Link>;
}
