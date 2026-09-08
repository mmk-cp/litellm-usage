"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Plus,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { api, ApiClientError } from "@/lib/api";
import { saveKey, useSavedKeys } from "@/lib/saved-keys";
import type { SavedKey } from "@/lib/types";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";

const schema = z.object({
  name: z.string().trim().min(2, "نام کلید باید حداقل ۲ نویسه باشد.").max(60),
  apiKey: z.string().trim().min(8, "یک کلید معتبر LiteLLM وارد کنید.").max(512),
});
type FormData = z.infer<typeof schema>;

const connectionSteps = [
  "برای کلید خود یک نام قابل تشخیص بنویسید.",
  "کلید مجازی LiteLLM را وارد و اعتبارسنجی کنید.",
  "مصرف، هزینه و درخواست‌ها را در داشبورد ببینید.",
];

export function KeyEntry() {
  const router = useRouter();
  const [showKey, setShowKey] = useState(false);
  const saved = useSavedKeys();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { name: "", apiKey: "" } });

  const onSubmit = async (values: FormData) => {
    try {
      const response = await api<SavedKey & { status: string }>("/keys/validate", {
        method: "POST",
        body: JSON.stringify(values),
      });
      saveKey(response.data);
      reset();
      toast.success("کلید API با موفقیت تأیید شد");
      router.push(`/dashboard/${response.data.id}`);
    } catch (error) {
      const message =
        error instanceof ApiClientError ? error.message : "اعتبارسنجی این کلید انجام نشد.";
      toast.error(message);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-12">
      <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:gap-14">
        <section className="flex min-w-0 flex-col justify-center py-4 lg:py-8">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--muted)] shadow-sm">
            <ShieldCheck className="size-3.5 text-[var(--primary)]" />
            داشبورد امن مصرف LiteLLM
          </div>
          <h1 className="max-w-2xl text-4xl font-bold leading-[1.25] sm:text-5xl">
            Coffee <span className="text-[var(--primary)]">VPS</span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-8 text-[var(--muted)]">
            مصرف کلید API خود را شفاف و یک‌جا ببینید؛ از تعداد درخواست و توکن تا هزینه، مدل و جزئیات
            هر فراخوانی.
          </p>

          <div className="mt-7 max-w-xl border-r-2 border-[var(--primary)] pr-5">
            <h2 className="text-sm font-bold">راهنمای اتصال کلید</h2>
            <ol className="mt-3 space-y-3">
              {connectionSteps.map((step, index) => (
                <li key={step} className="flex items-start gap-3 text-sm text-[var(--muted)]">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-xs font-bold text-[var(--primary)]">
                    {(index + 1).toLocaleString("fa-IR")}
                  </span>
                  <span className="pt-0.5 leading-6">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2">
            {[
              { icon: LockKeyhole, label: "نشست رمزگذاری‌شده" },
              { icon: CheckCircle2, label: "اعتبارسنجی از سرور" },
              { icon: ShieldCheck, label: "بدون ذخیره متن کلید" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 text-xs font-semibold text-[var(--muted)]"
              >
                <item.icon className="size-4 text-[var(--primary)]" />
                {item.label}
              </div>
            ))}
          </div>
        </section>

        <Card className="self-center p-5 sm:p-7">
          <div className="mb-6">
            <span className="mb-4 grid size-11 place-items-center rounded-md bg-[var(--accent)] text-[var(--primary)]">
              <Plus className="size-5" />
            </span>
            <h2 className="text-xl font-bold">اتصال کلید API</h2>
            <p className="mt-1.5 text-sm leading-6 text-[var(--muted)]">
              برای پیدا کردن آسان کلید، یک نام دلخواه انتخاب کنید.
            </p>
          </div>
          <form
            className="space-y-5"
            method="post"
            action="/api/keys/validate"
            onSubmit={handleSubmit(onSubmit)}
          >
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">نام کلید</span>
              <Input autoComplete="off" placeholder="ربات اصلی" {...register("name")} />
              {errors.name && (
                <span className="mt-1.5 block text-xs text-[var(--danger)]">
                  {errors.name.message}
                </span>
              )}
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">کلید API در LiteLLM</span>
              <span className="relative block" dir="ltr">
                <Input
                  dir="ltr"
                  type={showKey ? "text" : "password"}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="sk-xxxxxxxx"
                  className="pr-11 font-mono"
                  {...register("apiKey")}
                />
                <button
                  type="button"
                  className="absolute right-1 top-1 grid size-9 place-items-center rounded-md text-[var(--muted)] hover:bg-[var(--surface-muted)]"
                  onClick={() => setShowKey((value) => !value)}
                  aria-label={showKey ? "پنهان کردن کلید API" : "نمایش کلید API"}
                  title={showKey ? "پنهان کردن کلید" : "نمایش کلید"}
                >
                  {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </span>
              {errors.apiKey && (
                <span className="mt-1.5 block text-xs text-[var(--danger)]">
                  {errors.apiKey.message}
                </span>
              )}
            </label>
            <Button className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                  در حال اعتبارسنجی امن...
                </>
              ) : (
                <>
                  تأیید و ورود به داشبورد
                  <ArrowLeft className="size-4" />
                </>
              )}
            </Button>
          </form>
          <div className="mt-5 flex items-start gap-2.5 border-t pt-5 text-xs leading-5 text-[var(--muted)]">
            <LockKeyhole className="mt-0.5 size-4 shrink-0 text-[var(--primary)]" />
            <p>
              مرورگر فقط نام و نسخه پوشانده‌شده کلید را نگه می‌دارد. دسترسی اصلی در کوکی
              رمزگذاری‌شده و HttpOnly قرار می‌گیرد.
            </p>
          </div>
        </Card>
      </div>

      {saved.length > 0 && (
        <section aria-labelledby="recent-keys-title">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="recent-keys-title" className="text-sm font-bold">
              کلیدهای اخیر
            </h2>
            <Link
              href="/settings"
              className="text-xs font-semibold text-[var(--primary)] hover:underline"
            >
              مدیریت کلیدها
            </Link>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {saved.slice(0, 4).map((key) => (
              <Link
                href={`/dashboard/${key.id}`}
                key={key.id}
                className="group flex min-w-0 items-center gap-3 rounded-md border bg-[var(--surface)] p-3 transition-colors hover:border-[var(--primary)]"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-md bg-[var(--accent)] text-[var(--primary)]">
                  <KeyRound className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{key.name}</span>
                  <span
                    dir="ltr"
                    className="block truncate text-left font-mono text-xs text-[var(--muted)]"
                  >
                    {key.maskedKey}
                  </span>
                </span>
                <ArrowLeft className="size-4 text-[var(--muted)] transition-transform group-hover:-translate-x-0.5" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <section
        aria-labelledby="coffee-services-title"
        className="border-y bg-[var(--surface)] px-5 py-8 sm:px-7"
      >
        <div className="mb-6 max-w-2xl">
          <p className="text-xs font-bold text-[var(--primary)]">خدمات Coffee VPS</p>
          <h2 id="coffee-services-title" className="mt-1 text-xl font-bold">
            دسترسی اقتصادی به ابزارهای هوش مصنوعی و اینترنت پایدار
          </h2>
        </div>
        <div className="grid gap-7 md:grid-cols-2 md:[&>div:first-child]:border-l md:[&>div:first-child]:pl-7">
          <div className="flex items-start gap-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-md bg-[var(--accent)] text-[var(--primary)]">
              <KeyRound className="size-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold">خرید API مدل‌های OpenAI و Claude</h3>
              <p className="mt-1.5 text-sm leading-6 text-[var(--muted)]">
                دسترسی به مدل‌های OpenAI و Claude با یک‌پنجم قیمت مستقیم. برای دریافت تعرفه و
                راهنمای خرید در تلگرام پیام بدهید.
              </p>
              <a
                href="https://t.me/mmk_cp"
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[var(--primary)] hover:underline"
              >
                ارتباط در تلگرام
                <ExternalLink className="size-3.5" />
              </a>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-md bg-[var(--surface-muted)] text-[var(--primary)]">
              <Bot className="size-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold">خرید سرویس VPN با IP ثابت</h3>
              <p className="mt-1.5 text-sm leading-6 text-[var(--muted)]">
                سرویس VPN با IP ثابت را مستقیماً و سریع از ربات Coffee VPS تهیه کنید.
              </p>
              <a
                href="https://t.me/coffee_vps_bot"
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[var(--primary)] hover:underline"
              >
                ورود به ربات Coffee VPS
                <ExternalLink className="size-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
