"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CompanyStudents } from "@/components/dashboard/CompanyStudents";
import { StudentScoutInbox } from "@/components/dashboard/StudentScoutInbox";
import { useAuth } from "@/components/AuthProvider";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return <p className="p-8 text-center text-zinc-500">読み込み中...</p>;
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-16">
      {user.role === "company" && <CompanyStudents />}
      {user.role === "student" && <StudentScoutInbox />}
    </main>
  );
}
