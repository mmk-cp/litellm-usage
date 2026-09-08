"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { KeyRound, Plus, ShieldCheck, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "./app-shell";
import { api } from "@/lib/api";
import { clearSavedKeys, removeSavedKey, useSavedKeys } from "@/lib/saved-keys";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

export function SettingsClient() {
  const keys = useSavedKeys();
  const [clearing, setClearing] = useState(false);
  const remove = async (id: string) => {
    try {
      await api(`/keys/${id}`, { method: "DELETE" });
    } catch {
      /* Metadata must still be removable after cookie expiry. */
    }
    removeSavedKey(id);
    toast.success("کلید ذخیره‌شده حذف شد");
  };
  const clear = async () => {
    setClearing(true);
    await Promise.allSettled(keys.map((key) => api(`/keys/${key.id}`, { method: "DELETE" })));
    clearSavedKeys();
    setClearing(false);
    toast.success("همه کلیدهای ذخیره‌شده پاک شدند");
  };

  return (
    <AppShell title="تنظیمات" subtitle="مدیریت کلیدها و حریم خصوصی مرورگر">
      <div className="mx-auto max-w-4xl space-y-8">
        <section>
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-lg font-bold">کلیدهای API ذخیره‌شده</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                کلیدهای ثبت‌شده در این مرورگر را مدیریت کنید.
              </p>
            </div>
            <Button asChild size="sm">
              <Link href="/">
                <Plus className="size-4" />
                افزودن کلید
              </Link>
            </Button>
          </div>
          <Card className="overflow-hidden">
            {keys.length ? (
              <div className="divide-y">
                {keys.map((key) => (
                  <div key={key.id} className="flex items-center gap-3 p-4 sm:p-5">
                    <span className="grid size-10 shrink-0 place-items-center rounded-md bg-[var(--accent)] text-[var(--primary)]">
                      <KeyRound className="size-4" />
                    </span>
                    <Link href={`/dashboard/${key.id}`} className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold hover:text-[var(--primary)]">
                        {key.name}
                      </span>
                      <span
                        dir="ltr"
                        className="mt-0.5 block truncate text-left font-mono text-xs text-[var(--muted)]"
                      >
                        {key.maskedKey}
                      </span>
                    </Link>
                    <span className="hidden text-xs text-[var(--muted)] sm:block">
                      افزوده‌شده در{" "}
                      {new Intl.DateTimeFormat("fa-IR", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }).format(new Date(key.createdAt))}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-[var(--danger)]"
                      title="حذف کلید ذخیره‌شده"
                      aria-label={`حذف کلید ${key.name}`}
                      onClick={() => void remove(key.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid min-h-48 place-items-center p-8 text-center">
                <div>
                  <span className="mx-auto mb-3 grid size-10 place-items-center rounded-md bg-[var(--surface-muted)] text-[var(--muted)]">
                    <KeyRound className="size-4" />
                  </span>
                  <h3 className="text-sm font-bold">هنوز کلیدی ذخیره نشده است</h3>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    برای شروع، یک کلید LiteLLM متصل کنید.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </section>
        <section>
          <h2 className="text-lg font-bold">حریم خصوصی</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            داده‌های نگهداری‌شده در این مرورگر را کنترل کنید.
          </p>
          <Card className="mt-4 flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <span className="grid size-10 shrink-0 place-items-center rounded-md bg-[var(--accent)] text-[var(--primary)]">
              <ShieldCheck className="size-4" />
            </span>
            <div className="flex-1">
              <h3 className="text-sm font-bold">پاک کردن کلیدهای ذخیره‌شده</h3>
              <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                نام‌ها، شناسه‌های پوشانده‌شده و نشست‌های رمزگذاری‌شده مرورگر حذف می‌شوند. این عملیات
                کلیدها را در LiteLLM باطل نمی‌کند.
              </p>
            </div>
            <Dialog.Root>
              <Dialog.Trigger asChild>
                <Button variant="secondary" size="sm" disabled={!keys.length}>
                  پاک کردن کلیدها
                </Button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-[var(--surface)] p-6 shadow-2xl">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Dialog.Title className="text-base font-bold">
                        همه کلیدهای ذخیره‌شده پاک شوند؟
                      </Dialog.Title>
                      <Dialog.Description className="mt-2 text-sm leading-6 text-[var(--muted)]">
                        برای استفاده دوباره باید هر کلید API را وارد کنید. کلیدها در LiteLLM فعال
                        باقی می‌مانند.
                      </Dialog.Description>
                    </div>
                    <Dialog.Close asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="-ml-2 -mt-2 shrink-0"
                        aria-label="بستن پنجره"
                      >
                        <X className="size-4" />
                      </Button>
                    </Dialog.Close>
                  </div>
                  <div className="mt-6 flex justify-end gap-2">
                    <Dialog.Close asChild>
                      <Button variant="secondary">انصراف</Button>
                    </Dialog.Close>
                    <Dialog.Close asChild>
                      <Button variant="danger" disabled={clearing} onClick={() => void clear()}>
                        {clearing ? "در حال پاک کردن..." : "پاک کردن همه"}
                      </Button>
                    </Dialog.Close>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
