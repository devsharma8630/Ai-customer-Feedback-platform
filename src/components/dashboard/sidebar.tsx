"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquareText,
  Users,
  BarChart3,
  Settings,
  Sparkles,
  Building2,
  ShieldCheck,
  Bookmark,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/database.types";
import { useMobileNav } from "@/components/providers/mobile-nav-provider";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["super_admin", "company_admin", "manager", "employee"] },
  { href: "/feedback", label: "Feedback", icon: MessageSquareText, roles: ["super_admin", "company_admin", "manager", "employee"] },
  { href: "/customers", label: "Customers", icon: Users, roles: ["super_admin", "company_admin", "manager"] },
  { href: "/reports", label: "Reports", icon: BarChart3, roles: ["super_admin", "company_admin", "manager"] },
  { href: "/assistant", label: "AI Assistant", icon: Sparkles, roles: ["super_admin", "company_admin", "manager", "employee"] },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark, roles: ["super_admin", "company_admin", "manager", "employee"] },
  { href: "/settings", label: "Settings", icon: Settings, roles: ["super_admin", "company_admin"] },
  { href: "/admin", label: "Platform Admin", icon: ShieldCheck, roles: ["super_admin"] },
] as const;

export function Sidebar({ role, companyName }: { role: UserRole; companyName: string }) {
  const pathname = usePathname();
  const { isOpen, close } = useMobileNav();

  const navItems = NAV.filter((item) => (item.roles as readonly string[]).includes(role));

  const content = (
    <>
      <div className="mb-6 flex items-center justify-between px-2">
        <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[image:var(--accent-gradient)] text-white">
            <Sparkles className="h-4 w-4" />
          </span>
          Loop
        </div>
        <button
          onClick={close}
          aria-label="Close menu"
          className="rounded-[8px] p-1.5 text-[var(--muted)] hover:bg-[rgb(var(--surface)/0.7)] lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-[var(--radius-sm)] bg-[rgb(var(--surface-border))] px-3 py-2 text-xs text-[var(--muted)]">
        <Building2 className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{companyName}</span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className={cn(
                "flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-[image:var(--accent-gradient)] text-white shadow-[0_4px_20px_-6px_rgba(110,92,246,0.6)]"
                  : "text-[var(--foreground)] hover:bg-[rgb(var(--surface)/0.7)]"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 rounded-[var(--radius-md)] border border-[rgb(var(--surface-border))] p-3 text-xs text-[var(--muted)]">
        Signed in as <span className="font-medium text-[var(--foreground)]">{role.replace("_", " ")}</span>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop: static sidebar */}
      <aside className="glass-panel sticky top-4 ml-4 hidden h-[calc(100vh-2rem)] w-64 shrink-0 flex-col rounded-[var(--radius-lg)] p-4 lg:flex">
        {content}
      </aside>

      {/* Mobile: overlay + slide-in drawer */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={close}
        aria-hidden="true"
      />
      <aside
        className={cn(
          "glass-panel fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col p-4 transition-transform duration-300 ease-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
      >
        {content}
      </aside>
    </>
  );
}
