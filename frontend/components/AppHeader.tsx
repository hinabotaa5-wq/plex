"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { UserDropdown } from "@/components/UserDropdown";

export function AppHeader() {
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-zinc-900"
        >
          プレックス
        </Link>
        {!loading && user ? <UserDropdown /> : null}
      </div>
    </header>
  );
}
