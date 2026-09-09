"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApplicationDetailModal } from "@/components/dashboard/ApplicationDetailModal";
import { ChatModal } from "@/components/dashboard/ChatModal";
import { useAuth } from "@/components/AuthProvider";
import { ApiError, getCompanyApplications, updateApplicationStatus } from "@/lib/api";
import type { ApplicationStatus, CompanyApplication } from "@/lib/types";

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  sent: "未回答",
  accepted: "承諾済み",
  declined: "辞退済み",
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ja-JP");
}

type CompanyApplicationsProps = {
  applicationId?: number | null;
  chatApplicationId?: number | null;
  onDeepLinkConsumed?: () => void;
};

export function CompanyApplications({
  applicationId = null,
  chatApplicationId = null,
  onDeepLinkConsumed,
}: CompanyApplicationsProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [applications, setApplications] = useState<CompanyApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [detailId, setDetailId] = useState<number | null>(applicationId);
  const [chatApplication, setChatApplication] = useState<CompanyApplication | null>(null);

  useEffect(() => {
    let cancelled = false;

    getCompanyApplications()
      .then((data) => {
        if (!cancelled) setApplications(data.applications);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          logout();
          router.push("/login");
          return;
        }
        setError(err instanceof ApiError ? err.errors.join(", ") : "応募一覧の取得に失敗しました");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [logout, router]);

  const [prevApplicationId, setPrevApplicationId] = useState(applicationId);
  if (applicationId !== prevApplicationId) {
    setPrevApplicationId(applicationId);
    if (applicationId != null) {
      setChatApplication(null);
      setDetailId(applicationId);
    }
  }

  const [openedChatId, setOpenedChatId] = useState<number | null>(null);
  if (!loading && chatApplicationId != null && openedChatId !== chatApplicationId) {
    setOpenedChatId(chatApplicationId);
    const application = applications.find((item) => item.id === chatApplicationId);
    if (application) {
      setDetailId(null);
      setChatApplication(application);
    }
  }
  if (chatApplicationId == null && openedChatId != null) {
    setOpenedChatId(null);
  }

  useEffect(() => {
    if (loading) return;
    if (applicationId == null && chatApplicationId == null) return;
    onDeepLinkConsumed?.();
  }, [loading, applicationId, chatApplicationId, onDeepLinkConsumed]);

  async function handleStatus(id: number, status: Extract<ApplicationStatus, "accepted" | "declined">) {
    setUpdatingId(id);
    setError(null);
    try {
      const data = await updateApplicationStatus(id, status);
      setApplications((current) =>
        current.map((item) => (item.id === data.application.id ? data.application : item))
      );
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

  function handleOpenChat(application: CompanyApplication) {
    setDetailId(null);
    window.setTimeout(() => setChatApplication(application), 0);
  }

  const detail = applications.find((item) => item.id === detailId) ?? null;

  if (loading) {
    return <p className="text-sm text-zinc-500">応募一覧を読み込み中...</p>;
  }

  if (error && applications.length === 0) {
    return <p className="text-sm text-red-700">{error}</p>;
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-zinc-900">応募管理</h2>
      <p className="mt-1 text-sm text-zinc-500">自社の募集に届いた応募を確認できます。</p>

      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

      {applications.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-500">届いた応募はまだありません。</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {applications.map((application) => (
            <li
              key={application.id}
              className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6"
            >
              <div className="flex items-start justify-between gap-3 sm:gap-4">
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-zinc-900">{application.student.name}</h3>
                  <p className="mt-1 text-sm text-zinc-500">{application.recruitment.title}</p>
                </div>
                <span className="shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                  {STATUS_LABEL[application.status]}
                </span>
              </div>
              <p className="mt-4 text-sm text-zinc-700 line-clamp-2">{application.body}</p>
              <p className="mt-2 text-xs text-zinc-500">応募日: {formatDate(application.created_at)}</p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  onClick={() => setDetailId(application.id)}
                  className="w-full rounded-lg bg-zinc-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 sm:w-auto"
                >
                  詳細を見る
                </button>
                {application.status === "accepted" && (
                  <button
                    type="button"
                    onClick={() => handleOpenChat(application)}
                    className="w-full rounded-lg bg-zinc-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 sm:w-auto"
                  >
                    メッセージ
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <ApplicationDetailModal
        application={detail}
        open={detail !== null}
        updating={detail !== null && updatingId === detail.id}
        onClose={() => setDetailId(null)}
        onAccept={() => {
          if (detail) void handleStatus(detail.id, "accepted");
        }}
        onDecline={() => {
          if (detail) void handleStatus(detail.id, "declined");
        }}
        onMessage={detail ? () => handleOpenChat(detail) : undefined}
      />

      <ChatModal
        applicationId={chatApplication?.id ?? null}
        title={chatApplication ? `${chatApplication.student.name}さん` : ""}
        open={chatApplication !== null}
        onClose={() => setChatApplication(null)}
      />
    </section>
  );
}
