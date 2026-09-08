"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error.message);
  }, [error]);
  return (
    <main className="grid min-h-screen place-items-center p-6 text-center">
      <div>
        <h1 className="text-xl font-bold">مشکلی پیش آمد</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">نمایش این صفحه با خطا روبه‌رو شد.</p>
        <Button className="mt-6" onClick={reset}>
          تلاش دوباره
        </Button>
      </div>
    </main>
  );
}
