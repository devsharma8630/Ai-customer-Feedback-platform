"use client";

import { Search, Sun, Moon, Bell, LogOut, Menu } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { useMobileNav } from "@/components/providers/mobile-nav-provider";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/actions/auth.actions";
import { useRouter } from "next/navigation";

export function Topbar({
  userName,
  avatarUrl,
  unreadCount = 0,
}: {
  userName: string;
  avatarUrl?: string | null;
  unreadCount?: number;
}) {
  const { theme, toggleTheme } = useTheme();
  const { toggle } = useMobileNav();
  const router = useRouter();

  return (
    <header className="glass-panel sticky top-4 z-10 mx-4 mb-6 flex items-center gap-2 rounded-[var(--radius-lg)] px-3 py-3 sm:gap-3 sm:px-4 lg:mx-0">
      <Button variant="ghost" size="icon" className="shrink-0 lg:hidden" onClick={toggle} aria-label="Open menu">
        <Menu className="h-4 w-4" />
      </Button>

      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
        <input
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const val = (e.target as HTMLInputElement).value;
              if (val) router.push(`/feedback?q=${encodeURIComponent(val)}`);
            }
          }}
          placeholder="Search…"
          className="h-10 w-full min-w-0 rounded-[var(--radius-sm)] border border-[rgb(var(--surface-border))] bg-[rgb(var(--surface)/0.5)] pl-9 pr-3 text-sm outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent-violet)]"
        />
      </div>

      <Button variant="ghost" size="icon" className="hidden shrink-0 sm:inline-flex" onClick={toggleTheme} aria-label="Toggle theme">
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      <Button variant="ghost" size="icon" className="relative hidden shrink-0 sm:inline-flex" aria-label="Notifications">
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      <div className="mx-1 hidden h-6 w-px shrink-0 bg-[rgb(var(--surface-border))] sm:block" />

      <div className="shrink-0">
        <Avatar name={userName} src={avatarUrl} />
      </div>

      <form action={logoutAction} className="shrink-0">
        <Button variant="ghost" size="icon" aria-label="Sign out" type="submit">
          <LogOut className="h-4 w-4" />
        </Button>
      </form>
    </header>
  );
}
