import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center p-6 text-center">
      <div>
        <Logo className="mb-8 justify-center" />
        <p className="text-6xl font-bold text-[var(--primary)]">۴۰۴</p>
        <h1 className="mt-4 text-xl font-bold">صفحه پیدا نشد</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">صفحه‌ای که خواسته‌اید وجود ندارد.</p>
        <Button asChild className="mt-6">
          <Link href="/">بازگشت به کلیدها</Link>
        </Button>
      </div>
    </main>
  );
}
