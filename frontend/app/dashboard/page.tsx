"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CompanyStudents } from "@/components/dashboard/CompanyStudents";
import { StudentScoutInbox } from "@/components/dashboard/StudentScoutInbox";
import { useAuth } from "@/components/AuthProvider";
import { isCompanyProfile, isStudentProfile } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  if (loading || !user) {
    return <p className="p-8 text-center text-zinc-500">読み込み中...</p>;
  }

  const displayName = user.profile?.name ?? user.email;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-16">
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <p className="text-sm text-zinc-500">マイページ</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">
          {displayName}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {user.role === "student" ? "学生" : "企業"} / {user.email}
        </p>

        <dl className="mt-8 space-y-4 text-sm">
          {isStudentProfile(user) && (
            <>
              <div>
                <dt className="text-zinc-500">氏名</dt>
                <dd className="mt-1 font-medium text-zinc-900">{user.profile.name}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">大学名</dt>
                <dd className="mt-1 font-medium text-zinc-900">
                  {user.profile.university}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">学年</dt>
                <dd className="mt-1 font-medium text-zinc-900">{user.profile.grade}</dd>
              </div>
            </>
          )}
          {isCompanyProfile(user) && (
            <>
              <div>
                <dt className="text-zinc-500">企業名</dt>
                <dd className="mt-1 font-medium text-zinc-900">{user.profile.name}</dd>
              </div>
              {user.profile.description && (
                <div>
                  <dt className="text-zinc-500">企業概要</dt>
                  <dd className="mt-1 font-medium text-zinc-900">
                    {user.profile.description}
                  </dd>
                </div>
              )}
            </>
          )}
        </dl>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-8 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          ログアウト
        </button>
      </div>

      {user.role === "company" && <CompanyStudents />}
      {user.role === "student" && <StudentScoutInbox />}
    </main>
  );
}
