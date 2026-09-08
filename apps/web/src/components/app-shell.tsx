"use client";

import { BarChart3, KeyRound, Menu, Send, Settings, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "کلیدهای API", icon: KeyRound },
  { href: "/dashboard", label: "نمای کلی", icon: BarChart3 },
  { href: "/settings", label: "تنظیمات", icon: Settings },
];

export function AppShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dashboardKey = pathname.startsWith("/dashboard/") ? pathname : "/dashboard";
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {open && (
        <button
          className="fixed inset-0 z-30 bg-black/45 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="بستن منوی ناوبری"
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-40 flex w-64 flex-col border-l bg-[var(--surface)] p-4 transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex h-11 items-center justify-between px-2">
          <Logo />
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="بستن منو"
          >
            <X className="size-4" />
          </Button>
        </div>
        <nav className="mt-8 space-y-1">
          {nav.map((item) => {
            const href = item.href === "/dashboard" ? dashboardKey : item.href;
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]",
                  active && "bg-[var(--accent)] text-[var(--primary)]",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-center gap-1 border-t pt-3">
            <a
              href="https://t.me/mmk_cp"
              target="_blank"
              rel="noreferrer"
              className="grid size-9 place-items-center rounded-md text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--primary)]"
              title="تلگرام"
              aria-label="تلگرام Coffee VPS"
            >
              <Send className="size-4" />
            </a>
          </div>
          <div className="rounded-md border bg-[var(--surface-muted)] p-3">
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold">
              <span className="size-2 rounded-full bg-emerald-500" />
              اتصال امن و خصوصی
            </div>
            <p className="text-xs leading-5 text-[var(--muted)]">
              کلیدها در نشست رمزگذاری‌شده و HttpOnly نگهداری می‌شوند.
            </p>
          </div>
        </div>
      </aside>
      <div className="lg:pr-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-[color-mix(in_srgb,var(--background)_88%,transparent)] px-4 backdrop-blur-lg sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="باز کردن منو"
          >
            <Menu className="size-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-bold">{title}</h1>
            {subtitle && (
              <p dir="auto" className="truncate text-xs text-[var(--muted)]">
                {subtitle}
              </p>
            )}
          </div>
          <ThemeToggle />
        </header>
        <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
