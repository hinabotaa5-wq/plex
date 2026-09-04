"use client";

import { Suspense, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CompanyStudents } from "@/components/dashboard/CompanyStudents";
import { StudentScoutInbox } from "@/components/dashboard/StudentScoutInbox";
import { useAuth } from "@/components/AuthProvider";

function parseId(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const scoutId = parseId(searchParams.get("scoutId"));
  const chatScoutId = parseId(searchParams.get("chatScoutId"));

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  const handleDeepLinkConsumed = useCallback(() => {
    if (!searchParams.get("scoutId") && !searchParams.get("chatScoutId")) return;
    router.replace("/dashboard", { scroll: false });
  }, [router, searchParams]);

  if (loading || !user) {
    return <p className="p-8 text-center text-zinc-500">読み込み中...</p>;
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:gap-8 sm:py-16">
      {user.role === "company" && (
        <CompanyStudents
          chatScoutId={chatScoutId}
          onDeepLinkConsumed={handleDeepLinkConsumed}
        />
      )}
      {user.role === "student" && (
        <StudentScoutInbox
          scoutId={scoutId}
          chatScoutId={chatScoutId}
          onDeepLinkConsumed={handleDeepLinkConsumed}
        />
      )}
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-zinc-500">読み込み中...</p>}>
      <DashboardContent />
    </Suspense>
  );
}
