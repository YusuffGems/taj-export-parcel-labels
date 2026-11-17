import { Home, Info, Printer, Settings, UserPlus, Users, ArrowLeftRight, type LucideIcon } from "lucide-react";
import { AppFooter } from "./app-footer";
export interface NavItem { href: string; label: string; icon: LucideIcon }

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/customers/add", label: "Add Customer", icon: UserPlus },
  { href: "/printing", label: "Parcel Printing", icon: Printer },
  { href: "/import-export", label: "Import / Export", icon: ArrowLeftRight },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/about", label: "About & Install", icon: Info },
  
];
