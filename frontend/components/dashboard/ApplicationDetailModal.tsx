"use client";

import { useEffect, useRef } from "react";
import {
  formatAvailableTime,
  parseDesiredLocations,
  parseStringList,
  type ApplicationStatus,
  type CompanyApplication,
} from "@/lib/types";

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  sent: "未回答",
  accepted: "承諾済み",
  declined: "辞退済み",
};

type ApplicationDetailModalProps = {
  application: CompanyApplication | null;
  open: boolean;
  updating: boolean;
  onClose: () => void;
  onAccept: () => void;
  onDecline: () => void;
  onMessage?: () => void;
};

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-zinc-500">{label}</dt>
      <dd className="mt-1 font-medium whitespace-pre-wrap text-zinc-900">{value}</dd>
    </div>
  );
}

export function ApplicationDetailModal({
  application,
  open,
  updating,
  onClose,
  onAccept,
  onDecline,
  onMessage,
}: ApplicationDetailModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  const student = application?.student;
  const desiredLocations = student ? parseDesiredLocations(student.desired_location) : [];
  const availableWeekdays = student ? parseStringList(student.available_weekdays) : [];
  const availableTime = student
    ? formatAvailableTime(student.available_time_from, student.available_time_to)
    : null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="w-full max-w-lg max-h-[90vh] overflow-hidden rounded-2xl border border-zinc-200 bg-white p-0 shadow-lg backdrop:bg-black/40 max-sm:m-0 max-sm:h-dvh max-sm:max-h-dvh max-sm:max-w-none max-sm:rounded-none max-sm:border-0"
    >
      {open && application && (
        <div className="flex h-full max-h-[90vh] flex-col max-sm:max-h-none">
          <div className="border-b border-zinc-200 px-4 py-4 sm:px-6 max-sm:pt-[max(1rem,env(safe-area-inset-top))]">
            <div className="flex items-start justify-between gap-3 sm:gap-4">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold break-words text-zinc-900">
                  {application.recruitment.title}
                </h2>
                <p className="mt-1 text-sm text-zinc-500">{student?.name ?? ""}</p>
              </div>
              <span className="shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                {STATUS_LABEL[application.status]}
              </span>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-4 text-sm sm:px-6">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">応募文</h3>
              <p className="mt-2 whitespace-pre-wrap leading-6 text-zinc-700">{application.body}</p>
            </div>

            <div className="border-t border-zinc-200 pt-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">学生情報</h3>
              <dl className="space-y-3">
                <Field label="氏名" value={student?.name} />
                <Field label="大学名" value={student?.university} />
                <Field label="学部" value={student?.faculty} />
                <Field label="学年" value={student?.grade} />
                <Field label="希望職種" value={student?.desired_job_type} />
                {desiredLocations.length > 0 && (
                  <div>
                    <dt className="text-zinc-500">希望勤務地</dt>
                    <dd className="mt-1 flex flex-wrap gap-1.5">
                      {desiredLocations.map((location) => (
                        <span
                          key={location}
                          className="inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-800"
                        >
                          {location}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
                <Field label="稼働可能日数" value={student?.available_days_per_week} />
                {availableWeekdays.length > 0 && (
                  <div>
                    <dt className="text-zinc-500">曜日</dt>
                    <dd className="mt-1 flex flex-wrap gap-1.5">
                      {availableWeekdays.map((day) => (
                        <span
                          key={day}
                          className="inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-800"
                        >
                          {day}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
                <Field label="稼働可能時間" value={availableTime} />
                <Field label="自己PR" value={student?.self_pr} />
                <Field label="ガクチカ" value={student?.gakuchika} />
                <Field label="ITスキル" value={student?.skills} />
                <Field label="資格" value={student?.qualifications} />
                <Field label="インターン経験" value={student?.intern_experience} />
                {student?.github_url && (
                  <div>
                    <dt className="text-zinc-500">GitHub URL・ポートフォリオ URL</dt>
                    <dd className="mt-1 font-medium text-zinc-900">
                      <a
                        href={student.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline break-all"
                      >
                        {student.github_url}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-zinc-200 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:flex-wrap sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 sm:w-auto"
            >
              閉じる
            </button>
            {application.status === "sent" && (
              <>
                <button
                  type="button"
                  disabled={updating}
                  onClick={onDecline}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-60 sm:w-auto"
                >
                  辞退
                </button>
                <button
                  type="button"
                  disabled={updating}
                  onClick={onAccept}
                  className="w-full rounded-lg bg-zinc-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 sm:w-auto"
                >
                  承諾
                </button>
              </>
            )}
            {application.status === "accepted" && onMessage && (
              <button
                type="button"
                onClick={onMessage}
                className="w-full rounded-lg bg-zinc-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 sm:w-auto"
              >
                メッセージ
              </button>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}
