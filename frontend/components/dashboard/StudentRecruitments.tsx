"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RecruitmentDetailModal } from "@/components/dashboard/RecruitmentDetailModal";
import { useAuth } from "@/components/AuthProvider";
import { ApiError, getRecruitments } from "@/lib/api";
import type { Recruitment } from "@/lib/types";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ja-JP");
}

export function StudentRecruitments() {
  const router = useRouter();
  const { logout } = useAuth();
  const [recruitments, setRecruitments] = useState<Recruitment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Recruitment | null>(null);

  useEffect(() => {
    let cancelled = false;

    getRecruitments()
      .then((data) => {
        if (!cancelled) setRecruitments(data.recruitments);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          logout();
          router.push("/login");
          return;
        }
        setError(err instanceof ApiError ? err.errors.join(", ") : "募集一覧の取得に失敗しました");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [logout, router]);

  if (loading) {
    return <p className="text-sm text-zinc-500">募集一覧を読み込み中...</p>;
  }

  if (error && recruitments.length === 0) {
    return <p className="text-sm text-red-700">{error}</p>;
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-zinc-900">募集を探す</h2>
      <p className="mt-1 text-sm text-zinc-500">公開中のインターン募集を確認できます。</p>

      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

      {recruitments.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-500">公開中の募集はまだありません。</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {recruitments.map((recruitment) => (
            <li
              key={recruitment.id}
              className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-zinc-900">{recruitment.title}</h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    {recruitment.company?.name ?? "企業"}
                  </p>
                  <dl className="mt-3 space-y-1 text-sm text-zinc-500">
                    <div>
                      <dt className="inline">職種：</dt>
                      <dd className="inline">{recruitment.job_type}</dd>
                    </div>
                    <div>
                      <dt className="inline">勤務地：</dt>
                      <dd className="inline">{recruitment.location}</dd>
                    </div>
                    <div>
                      <dt className="inline">給与：</dt>
                      <dd className="inline">{recruitment.salary}</dd>
                    </div>
                  </dl>
                  <p className="mt-2 text-xs text-zinc-500">掲載日: {formatDate(recruitment.created_at)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(recruitment)}
                  className="w-full shrink-0 rounded-lg bg-zinc-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 sm:w-auto"
                >
                  詳細を見る
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <RecruitmentDetailModal
        recruitment={selected}
        open={selected !== null}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}
