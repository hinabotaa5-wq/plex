"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { ApiError, getScouts, updateScoutStatus } from "@/lib/api";
import type { ReceivedScout, ScoutStatus } from "@/lib/types";

const STATUS_LABEL: Record<ScoutStatus, string> = {
  sent: "未回答",
  accepted: "承諾済み",
  declined: "辞退済み",
};

export function StudentScoutInbox() {
  const router = useRouter();
  const { logout } = useAuth();
  const [scouts, setScouts] = useState<ReceivedScout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    getScouts()
      .then((data) => {
        if (!cancelled) setScouts(data.scouts);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          logout();
          router.push("/login");
          return;
        }
        setError(err instanceof ApiError ? err.errors.join(", ") : "スカウト一覧の取得に失敗しました");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [logout, router]);

  async function handleStatus(id: number, status: Extract<ScoutStatus, "accepted" | "declined">) {
    setUpdatingId(id);
    setError(null);
    try {
      const data = await updateScoutStatus(id, status);
      setScouts((current) => current.map((scout) => (scout.id === id ? data.scout : scout)));
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        logout();
        router.push("/login");
        return;
      }
      setError(err instanceof ApiError ? err.errors.join(", ") : "更新に失敗しました");
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">受信スカウトを読み込み中...</p>;
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-zinc-900">受信スカウト</h2>
      <p className="mt-1 text-sm text-zinc-500">企業からのメッセージを確認できます。</p>

      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

      {scouts.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-500">受信したスカウトはまだありません。</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {scouts.map((scout) => (
            <li
              key={scout.id}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-zinc-900">{scout.subject}</h3>
                  <p className="mt-1 text-sm text-zinc-500">{scout.company.name}</p>
                </div>
                <span className="shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                  {STATUS_LABEL[scout.status]}
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-zinc-700">{scout.body}</p>
              {scout.status === "sent" && (
                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    disabled={updatingId === scout.id}
                    onClick={() => handleStatus(scout.id, "accepted")}
                    className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
                  >
                    承諾
                  </button>
                  <button
                    type="button"
                    disabled={updatingId === scout.id}
                    onClick={() => handleStatus(scout.id, "declined")}
                    className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
                  >
                    辞退
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
