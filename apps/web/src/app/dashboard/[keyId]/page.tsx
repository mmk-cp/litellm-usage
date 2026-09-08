import type { Metadata } from "next";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const metadata: Metadata = { title: "داشبورد مصرف" };

export default async function DashboardPage({ params }: { params: Promise<{ keyId: string }> }) {
  const { keyId } = await params;
  return <DashboardClient keyId={keyId} />;
}
