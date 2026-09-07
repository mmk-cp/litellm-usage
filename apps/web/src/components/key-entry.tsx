"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  CheckCircle2,
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
  name: z.string().trim().min(2, "Enter a name with at least 2 characters.").max(60),
  apiKey: z.string().trim().min(8, "Enter a valid LiteLLM API key.").max(512),
});
type FormData = z.infer<typeof schema>;

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
      toast.success("API key verified");
      router.push(`/dashboard/${response.data.id}`);
    } catch (error) {
      const message =
        error instanceof ApiClientError ? error.message : "Could not verify this key.";
      toast.error(message);
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1fr_420px] lg:gap-14">
      <section className="flex min-w-0 flex-col justify-center py-4 lg:py-10">
        <div className="mb-7 inline-flex w-fit items-center gap-2 rounded-full border bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--muted)] shadow-sm">
          <ShieldCheck className="size-3.5 text-[var(--primary)]" />
          Private by architecture
        </div>
        <h1 className="max-w-2xl text-4xl font-bold leading-[1.08] sm:text-5xl">
          Your LiteLLM usage,
          <br />
          <span className="text-[var(--primary)]">clear at a glance.</span>
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-[var(--muted)]">
          Connect a virtual key to inspect requests, tokens, model mix, and cost. Your admin
          credential remains isolated on the server.
        </p>
        <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
          {[
            { icon: LockKeyhole, label: "Encrypted session" },
            { icon: CheckCircle2, label: "Verified upstream" },
            { icon: ShieldCheck, label: "No plaintext storage" },
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

        {saved.length > 0 && (
          <div className="mt-12 max-w-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold">Recent keys</h2>
              <Link
                href="/settings"
                className="text-xs font-semibold text-[var(--primary)] hover:underline"
              >
                Manage
              </Link>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
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
                    <span className="block truncate font-mono text-xs text-[var(--muted)]">
                      {key.maskedKey}
                    </span>
                  </span>
                  <ArrowRight className="size-4 text-[var(--muted)] transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      <Card className="self-center p-5 sm:p-7">
        <div className="mb-6">
          <span className="mb-4 grid size-11 place-items-center rounded-md bg-[var(--accent)] text-[var(--primary)]">
            <Plus className="size-5" />
          </span>
          <h2 className="text-xl font-bold">Connect an API key</h2>
          <p className="mt-1.5 text-sm leading-6 text-[var(--muted)]">
            Use a memorable label to find it later.
          </p>
        </div>
        <form
          className="space-y-5"
          method="post"
          action="/api/keys/validate"
          onSubmit={handleSubmit(onSubmit)}
        >
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Key name</span>
            <Input autoComplete="off" placeholder="Production Bot" {...register("name")} />
            {errors.name && (
              <span className="mt-1.5 block text-xs text-[var(--danger)]">
                {errors.name.message}
              </span>
            )}
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">LiteLLM API key</span>
            <span className="relative block">
              <Input
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
                aria-label={showKey ? "Hide API key" : "Show API key"}
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
                Verifying securely...
              </>
            ) : (
              <>
                Verify and continue
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </form>
        <div className="mt-5 flex items-start gap-2.5 border-t pt-5 text-xs leading-5 text-[var(--muted)]">
          <LockKeyhole className="mt-0.5 size-4 shrink-0 text-[var(--primary)]" />
          <p>
            The browser keeps only the label and masked key. Access is held in an encrypted HttpOnly
            cookie.
          </p>
        </div>
      </Card>
    </div>
  );
}
