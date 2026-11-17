"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Download, Menu, WifiOff, X } from "lucide-react";
import { NAV_ITEMS } from "./nav-items";
import { cn } from "@/lib/format";
import { useInstallPrompt } from "@/hooks/use-install-prompt";
import { AppFooter } from "./app-footer";

const strip = (p: string) => (p.length > 1 ? p.replace(/\/$/, "") : p);

function isActive(pathname: string, href: string): boolean {
  const p = strip(pathname);
  if (href === "/") return p === "/";
  if (href === "/customers") return p === "/customers" || p.startsWith("/customers/view") || p.startsWith("/customers/edit");
  return p === href;
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold text-sm font-extrabold text-ink">TE</span>
      <span className="leading-tight">
        <span className="block text-base font-bold tracking-wide text-white">TAJ EXPORT</span>
        <span className="block text-[11px] text-white/60">Customer &amp; Parcel Manager</span>
      </span>
    </Link>
  );
}

function NavList({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 px-3" aria-label="Main navigation">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link key={href} href={href} onClick={onNavigate} aria-current={active ? "page" : undefined}
            className={cn("flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition",
              active ? "bg-white/12 text-gold" : "text-white/80 hover:bg-white/8 hover:text-white")}>
            <Icon className="h-5 w-5" />{label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter({ online }: { online: boolean }) {
  const { canInstall, install } = useInstallPrompt();
  return (
    <div className="mt-auto space-y-3 px-4">
      {!online && <div className="flex items-center gap-2 rounded-lg bg-amber-100 px-3 py-2 text-xs font-medium text-amber-900"><WifiOff className="h-4 w-4" /> Offline — everything still works</div>}
      {canInstall && (
        <button type="button" onClick={install} className="flex w-full items-center justify-center gap-2 rounded-xl border border-gold bg-gold/15 px-3 py-2 text-sm font-semibold text-gold hover:bg-gold/25">
          <Download className="h-4 w-4" /> Install app
        </button>
      )}
      <p className="text-[11px] text-white/40">Data is stored on this device only.</p>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [drawer, setDrawer] = useState(false);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); };
  }, []);

  return (
   <div className="flex min-h-screen flex-col lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-side py-5 lg:flex">
        <div className="mb-6 px-5"><Brand /></div>
        <NavList pathname={pathname} />
        <SidebarFooter online={online} />
      </aside>

      {drawer && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-black/50" onClick={() => setDrawer(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-side py-5">
            <div className="mb-6 flex items-center justify-between px-5">
              <Brand />
              <button type="button" onClick={() => setDrawer(false)} aria-label="Close menu" className="rounded p-1 text-white/80"><X className="h-5 w-5" /></button>
            </div>
            <NavList pathname={pathname} onNavigate={() => setDrawer(false)} />
            <SidebarFooter online={online} />
          </aside>
        </div>
      )}

      <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-card/95 px-3 backdrop-blur sm:px-6 lg:hidden">
        <button type="button" onClick={() => setDrawer(true)} aria-label="Open menu" className="rounded-lg p-2 text-ink hover:bg-bg"><Menu className="h-5 w-5" /></button>
        <span className="font-bold text-ink">TAJ EXPORT</span>
        {!online && <span className="ml-auto flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900"><WifiOff className="h-3.5 w-3.5" /> Offline</span>}
      </header>
<main className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
<AppFooter />
    </div>
  );
}
