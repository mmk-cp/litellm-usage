import { Send } from "lucide-react";
import { Logo } from "@/components/logo";
import { KeyEntry } from "@/components/key-entry";
import { ThemeToggle } from "@/components/theme-toggle";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="grid-pattern pointer-events-none absolute inset-x-0 top-0 h-[65vh] opacity-70" />
      <header className="relative mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <Logo />
        <div className="flex items-center gap-1 sm:gap-2">
          <a
            href="https://t.me/mmk_cp"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-2 rounded-md px-2.5 text-xs font-semibold text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
            title="تلگرام"
          >
            <Send className="size-4" />
            <span className="hidden md:inline">تلگرام</span>
          </a>
          <ThemeToggle />
        </div>
      </header>
      <div className="relative px-5 pb-12 pt-5 sm:px-8 lg:pt-10">
        <KeyEntry />
      </div>
      <footer className="relative border-t px-5 py-6 text-xs text-[var(--muted)] sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <p>Coffee VPS؛ داشبورد فارسی و امن مدیریت مصرف API</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2" dir="ltr">
            <a
              href="https://t.me/mmk_cp"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[var(--primary)]"
            >
              t.me/mmk_cp
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
