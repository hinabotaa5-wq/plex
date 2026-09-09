"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RecruitmentFormModal } from "@/components/dashboard/RecruitmentFormModal";
import { useAuth } from "@/components/AuthProvider";
import { ApiError, getRecruitments, updateRecruitment } from "@/lib/api";
import {
  isCompanyProfile,
  type Recruitment,
  type RecruitmentStatus,
} from "@/lib/types";

const STATUS_LABEL: Record<RecruitmentStatus, string> = {
  published: "公開中",
  closed: "終了",
};

function formatDate(value: string | undefined) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("ja-JP");
}

export function CompanyRecruitments() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [recruitments, setRecruitments] = useState<Recruitment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Recruitment | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

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

  function handleOpenCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function handleOpenEdit(recruitment: Recruitment) {
    setEditing(recruitment);
    setModalOpen(true);
  }

  function handleSaved(recruitment: Recruitment) {
    setRecruitments((current) => {
      const exists = current.some((item) => item.id === recruitment.id);
      if (exists) {
        return current.map((item) => (item.id === recruitment.id ? recruitment : item));
      }
      return [recruitment, ...current];
    });
  }

  async function handleToggleStatus(recruitment: Recruitment) {
    const nextStatus: RecruitmentStatus =
      recruitment.status === "published" ? "closed" : "published";

    setUpdatingId(recruitment.id);
    setError(null);
    try {
      const data = await updateRecruitment(recruitment.id, { status: nextStatus });
      setRecruitments((current) =>
        current.map((item) => (item.id === data.recruitment.id ? data.recruitment : item))
      );
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        logout();
        router.push("/login");
        return;
      }
      setError(err instanceof ApiError ? err.errors.join(", ") : "募集の更新に失敗しました");
    } finally {
      setUpdatingId(null);
    }
  }

  const formDefaults =
    user && isCompanyProfile(user)
      ? {
          job_type: user.profile.recruiting_job_type ?? "",
          location: user.profile.location ?? "",
          salary: user.profile.salary ?? "",
        }
      : undefined;

  if (loading) {
    return <p className="text-sm text-zinc-500">募集一覧を読み込み中...</p>;
  }

  if (error && recruitments.length === 0) {
    return <p className="text-sm text-red-700">{error}</p>;
  }

  return (
    <section>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">募集管理</h2>
          <p className="mt-1 text-sm text-zinc-500">インターン募集の掲載と公開状態を管理できます。</p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="w-full shrink-0 rounded-lg bg-zinc-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 sm:w-auto"
        >
          募集を掲載
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

      {recruitments.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-500">掲載した募集はまだありません。</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {recruitments.map((recruitment) => (
            <li
              key={recruitment.id}
              className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6"
            >
              <div className="flex items-start justify-between gap-3 sm:gap-4">
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-zinc-900">{recruitment.title}</h3>
                  <p className="mt-1 text-sm text-zinc-500">{recruitment.job_type}</p>
                </div>
                <span className="shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                  {STATUS_LABEL[recruitment.status]}
                </span>
              </div>
              <dl className="mt-4 space-y-1 text-sm text-zinc-500">
                <div>
                  <dt className="inline">勤務地：</dt>
                  <dd className="inline">{recruitment.location}</dd>
                </div>
                <div>
                  <dt className="inline">給与：</dt>
                  <dd className="inline">{recruitment.salary}</dd>
                </div>
                {recruitment.period && (
                  <div>
                    <dt className="inline">期間：</dt>
                    <dd className="inline">{recruitment.period}</dd>
                  </div>
                )}
              </dl>
              <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-700">{recruitment.description}</p>
              <p className="mt-2 text-xs text-zinc-500">掲載日: {formatDate(recruitment.created_at)}</p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(recruitment)}
                  className="w-full rounded-lg bg-zinc-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 sm:w-auto"
                >
                  編集
                </button>
                <button
                  type="button"
                  onClick={() => void handleToggleStatus(recruitment)}
                  disabled={updatingId === recruitment.id}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-60 sm:w-auto"
                >
                  {updatingId === recruitment.id
                    ? "更新中..."
                    : recruitment.status === "published"
                      ? "終了する"
                      : "再公開する"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <RecruitmentFormModal
        recruitment={editing}
        open={modalOpen}
        defaults={formDefaults}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
      />
    </section>
  );
}
