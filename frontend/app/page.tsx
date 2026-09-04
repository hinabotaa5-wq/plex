"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export default function HomePage() {
  const { user, loading } = useAuth();

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-start justify-center px-4 py-12 sm:py-24">
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">
        インターンマッチ
      </h1>
      <p className="mt-4 text-zinc-600">
        インターン生と企業をつなぐスカウトサービスです。
      </p>

      <div className="mt-8 flex gap-3">
        {loading ? (
          <p className="text-sm text-zinc-500">読み込み中...</p>
        ) : user ? (
          <Link
            href="/dashboard"
            className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700"
          >
            ダッシュボード
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700"
            >
              ログイン
            </Link>
            <Link
              href="/signup"
              className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
            >
              新規登録
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
