"use client";

import { useEffect, useState } from "react";
import { ChatModal } from "@/components/dashboard/ChatModal";
import type { ScoutStatus, SentScout, StudentListItem } from "@/lib/types";

const STATUS_LABEL: Record<ScoutStatus, string> = {
  sent: "未回答",
  accepted: "承諾済み",
  declined: "辞退済み",
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ja-JP");
}

type CompanySentScoutsProps = {
  scouts: SentScout[];
  chatScoutId?: number | null;
  onDeepLinkConsumed?: () => void;
  onViewStudent: (student: StudentListItem) => void;
};

export function CompanySentScouts({
  scouts,
  chatScoutId = null,
  onDeepLinkConsumed,
  onViewStudent,
}: CompanySentScoutsProps) {
  const [chatScout, setChatScout] = useState<SentScout | null>(null);

  useEffect(() => {
    if (chatScoutId == null) return;

    const scout = scouts.find((item) => item.id === chatScoutId);
    if (scout) {
      setChatScout(scout);
    }
    onDeepLinkConsumed?.();
  }, [scouts, chatScoutId, onDeepLinkConsumed]);

  return (
    <section>
      <h2 className="text-lg font-semibold text-zinc-900">送信済みスカウト</h2>
      <p className="mt-1 text-sm text-zinc-500">送ったスカウトと学生の回答状況です。</p>

      {scouts.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-500">送信したスカウトはまだありません。</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {scouts.map((scout) => (
            <li
              key={scout.id}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-zinc-900">{scout.student.name}</h3>
                  <p className="mt-1 text-sm text-zinc-500">{scout.student.university}</p>
                </div>
                <span className="shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                  {STATUS_LABEL[scout.status]}
                </span>
              </div>
              <p className="mt-4 text-sm font-medium text-zinc-900">{scout.subject}</p>
              <p className="mt-2 text-xs text-zinc-500">送信日: {formatDate(scout.created_at)}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onViewStudent(scout.student)}
                  className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700"
                >
                  詳細を見る
                </button>
                {scout.status === "accepted" && (
                  <button
                    type="button"
                    onClick={() => setChatScout(scout)}
                    className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700"
                  >
                    メッセージ
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <ChatModal
        scoutId={chatScout?.id ?? null}
        title={chatScout ? `${chatScout.student.name}さん` : ""}
        open={chatScout !== null}
        onClose={() => setChatScout(null)}
      />
    </section>
  );
}
