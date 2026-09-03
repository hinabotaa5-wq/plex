"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

function getInitial(name: string | undefined, email: string): string {
  const source = name?.trim() || email;
  return Array.from(source)[0]?.toUpperCase() ?? "?";
}

export function UserDropdown() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!user) return null;

  const displayName = user.profile?.name ?? user.email;
  const roleLabel = user.role === "student" ? "学生" : "企業";
  const initial = getInitial(user.profile?.name, user.email);

  function handleLogout() {
    logout();
    setOpen(false);
    router.push("/login");
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="ユーザーメニュー"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-sm font-medium text-white hover:bg-zinc-700"
      >
        {initial}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg"
        >
          <div className="border-b border-zinc-100 px-4 py-3">
            <p className="truncate text-sm font-medium text-zinc-900">{displayName}</p>
            <p className="mt-0.5 text-xs text-zinc-500">{roleLabel}</p>
            <p className="mt-0.5 truncate text-xs text-zinc-500">{user.email}</p>
          </div>
          <div className="p-1">
            <Link
              href="/profile"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              マイページ
            </Link>
          </div>
          <div className="border-t border-zinc-100 p-1">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50"
            >
              ログアウト
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
