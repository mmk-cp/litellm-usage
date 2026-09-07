import { Logo } from "@/components/logo";
import { KeyEntry } from "@/components/key-entry";
import { ThemeToggle } from "@/components/theme-toggle";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="grid-pattern pointer-events-none absolute inset-x-0 top-0 h-[65vh] opacity-70" />
      <header className="relative mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Logo />
        <ThemeToggle />
      </header>
      <div className="relative flex min-h-[calc(100vh-5rem)] items-center px-5 pb-10 sm:px-8">
        <KeyEntry />
      </div>
    </main>
  );
}
