"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChatModal } from "@/components/dashboard/ChatModal";
import { ScoutDetailModal } from "@/components/dashboard/ScoutDetailModal";
import { useAuth } from "@/components/AuthProvider";
import { ApiError, getScouts, updateScoutStatus } from "@/lib/api";
import type { ReceivedScout, ScoutStatus } from "@/lib/types";

const STATUS_LABEL: Record<ScoutStatus, string> = {
  sent: "未回答",
  accepted: "承諾済み",
  declined: "辞退済み",
};

type StudentScoutInboxProps = {
  scoutId?: number | null;
  chatScoutId?: number | null;
  onDeepLinkConsumed?: () => void;
};

export function StudentScoutInbox({
  scoutId = null,
  chatScoutId = null,
  onDeepLinkConsumed,
}: StudentScoutInboxProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [scouts, setScouts] = useState<ReceivedScout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [detailScoutId, setDetailScoutId] = useState<number | null>(null);
  const [chatScout, setChatScout] = useState<ReceivedScout | null>(null);

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

  useEffect(() => {
    if (loading) return;
    if (chatScoutId == null && scoutId == null) return;

    if (chatScoutId != null) {
      const scout = scouts.find((item) => item.id === chatScoutId);
      if (scout) {
        setDetailScoutId(null);
        window.setTimeout(() => setChatScout(scout), 0);
      }
      onDeepLinkConsumed?.();
      return;
    }

    if (scoutId != null && scouts.some((item) => item.id === scoutId)) {
      setChatScout(null);
      window.setTimeout(() => setDetailScoutId(scoutId), 0);
    }
    onDeepLinkConsumed?.();
  }, [loading, scouts, scoutId, chatScoutId, onDeepLinkConsumed]);

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

  const detailScout = scouts.find((scout) => scout.id === detailScoutId) ?? null;

  function handleOpenDetail(id: number) {
    setChatScout(null);
    window.setTimeout(() => setDetailScoutId(id), 0);
  }

  function handleMessage() {
    if (!detailScout) return;
    const scout = detailScout;
    setDetailScoutId(null);
    window.setTimeout(() => setChatScout(scout), 0);
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
              className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6"
            >
              <div className="flex items-start justify-between gap-3 sm:gap-4">
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-zinc-900">{scout.company.name}</h3>
                  <p className="mt-1 text-sm text-zinc-500">{scout.subject}</p>
                </div>
                <span className="shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                  {STATUS_LABEL[scout.status]}
                </span>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => handleOpenDetail(scout.id)}
                  className="w-full rounded-lg bg-zinc-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 sm:w-auto"
                >
                  詳細を見る
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ScoutDetailModal
        scout={detailScout}
        open={detailScout !== null}
        updating={detailScout !== null && updatingId === detailScout.id}
        onClose={() => setDetailScoutId(null)}
        onAccept={() => {
          if (detailScout) void handleStatus(detailScout.id, "accepted");
        }}
        onDecline={() => {
          if (detailScout) void handleStatus(detailScout.id, "declined");
        }}
        onMessage={handleMessage}
      />

      <ChatModal
        scoutId={chatScout?.id ?? null}
        title={chatScout ? chatScout.company.name : ""}
        open={chatScout !== null}
        onClose={() => setChatScout(null)}
      />
    </section>
  );
}
