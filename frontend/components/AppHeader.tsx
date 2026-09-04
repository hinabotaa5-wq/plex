"use client";

import { MouseEvent } from "react";
import { useAuth } from "@/components/AuthProvider";
import { NotificationBell } from "@/components/NotificationBell";
import { UserDropdown } from "@/components/UserDropdown";

export function AppHeader() {
  const { user, loading } = useAuth();

  function handleBrandClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    if (
      window.location.pathname === "/dashboard" &&
      window.location.search === "" &&
      window.location.hash === ""
    ) {
      window.location.reload();
      return;
    }
    window.location.assign("/dashboard");
  }

  if (loading || !user) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        <a
          href="/dashboard"
          onClick={handleBrandClick}
          className="text-sm font-semibold tracking-tight text-zinc-900"
        >
          プレックス
        </a>
        <div className="flex items-center gap-1">
          <NotificationBell />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}
