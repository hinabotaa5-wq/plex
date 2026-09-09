"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApplyModal } from "@/components/dashboard/ApplyModal";
import { RecruitmentDetailModal } from "@/components/dashboard/RecruitmentDetailModal";
import { useAuth } from "@/components/AuthProvider";
import { ApiError, getApplications, getRecruitments } from "@/lib/api";
import type { ApplicationStatus, Recruitment, StudentApplication } from "@/lib/types";

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  sent: "応募済み",
  accepted: "承諾済み",
  declined: "辞退済み",
};

function formatDate(value: string | undefined) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("ja-JP");
}

export function StudentRecruitments() {
  const router = useRouter();
  const { logout } = useAuth();
  const [recruitments, setRecruitments] = useState<Recruitment[]>([]);
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Recruitment | null>(null);
  const [applying, setApplying] = useState<Recruitment | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getRecruitments(), getApplications()])
      .then(([recruitmentsData, applicationsData]) => {
        if (cancelled) return;
        setRecruitments(recruitmentsData.recruitments);
        setApplications(applicationsData.applications);
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

  const applicationsByRecruitmentId = new Map(
    applications.map((application) => [application.recruitment.id, application])
  );
  const selectedApplication = selected
    ? (applicationsByRecruitmentId.get(selected.id) ?? null)
    : null;

  function handleOpenApply(recruitment: Recruitment) {
    setSelected(null);
    window.setTimeout(() => setApplying(recruitment), 0);
  }

  function handleApplied(application: StudentApplication) {
    setApplications((current) => [
      application,
      ...current.filter((item) => item.id !== application.id),
    ]);
  }

  function handleOpenFromApplication(application: StudentApplication) {
    const listed = recruitments.find((item) => item.id === application.recruitment.id);
    setSelected(listed ?? application.recruitment);
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">募集一覧を読み込み中...</p>;
  }

  if (error && recruitments.length === 0 && applications.length === 0) {
    return <p className="text-sm text-red-700">{error}</p>;
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-lg font-semibold text-zinc-900">募集を探す</h2>
        <p className="mt-1 text-sm text-zinc-500">公開中のインターン募集を確認できます。</p>

        {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

        {recruitments.length === 0 ? (
          <p className="mt-6 text-sm text-zinc-500">公開中の募集はまだありません。</p>
        ) : (
          <ul className="mt-6 space-y-4">
            {recruitments.map((recruitment) => {
              const application = applicationsByRecruitmentId.get(recruitment.id);
              return (
                <li
                  key={recruitment.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-base font-semibold text-zinc-900">{recruitment.title}</h3>
                        {application && (
                          <span className="shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 sm:hidden">
                            {STATUS_LABEL[application.status]}
                          </span>
                        )}
                      </div>
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
                      <p className="mt-2 text-xs text-zinc-500">
                        掲載日: {formatDate(recruitment.created_at)}
                      </p>
                    </div>
                    <div className="flex w-full shrink-0 flex-col items-stretch gap-2 sm:w-auto sm:items-end">
                      {application && (
                        <span className="hidden rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 sm:inline-flex">
                          {STATUS_LABEL[application.status]}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelected(recruitment)}
                        className="w-full rounded-lg bg-zinc-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 sm:w-auto"
                      >
                        詳細を見る
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-zinc-900">応募した募集</h2>
        <p className="mt-1 text-sm text-zinc-500">送った応募と企業の回答状況です。</p>

        {applications.length === 0 ? (
          <p className="mt-6 text-sm text-zinc-500">応募した募集はまだありません。</p>
        ) : (
          <ul className="mt-6 space-y-4">
            {applications.map((application) => (
              <li
                key={application.id}
                className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6"
              >
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-zinc-900">
                      {application.recruitment.title}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-500">
                      {application.recruitment.company.name}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                    {STATUS_LABEL[application.status]}
                  </span>
                </div>
                <p className="mt-4 text-sm text-zinc-700 line-clamp-2">{application.body}</p>
                <p className="mt-2 text-xs text-zinc-500">応募日: {formatDate(application.created_at)}</p>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => handleOpenFromApplication(application)}
                    className="w-full rounded-lg bg-zinc-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 sm:w-auto"
                  >
                    詳細を見る
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <RecruitmentDetailModal
        recruitment={selected}
        application={selectedApplication}
        open={selected !== null}
        onClose={() => setSelected(null)}
        onApply={handleOpenApply}
      />

      <ApplyModal
        recruitment={applying}
        open={applying !== null}
        onClose={() => setApplying(null)}
        onApplied={handleApplied}
      />
    </div>
  );
}
