"use client";

import { useEffect, useRef } from "react";
import type { Recruitment } from "@/lib/types";

type RecruitmentDetailModalProps = {
  recruitment: Recruitment | null;
  open: boolean;
  onClose: () => void;
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

export function RecruitmentDetailModal({
  recruitment,
  open,
  onClose,
}: RecruitmentDetailModalProps) {
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

  const company = recruitment?.company;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="w-full max-w-lg max-h-[90vh] overflow-hidden rounded-2xl border border-zinc-200 bg-white p-0 shadow-lg backdrop:bg-black/40 max-sm:m-0 max-sm:h-dvh max-sm:max-h-dvh max-sm:max-w-none max-sm:rounded-none max-sm:border-0"
    >
      {open && recruitment && (
        <div className="flex h-full max-h-[90vh] flex-col max-sm:max-h-none">
          <div className="border-b border-zinc-200 px-4 py-4 sm:px-6 max-sm:pt-[max(1rem,env(safe-area-inset-top))]">
            <h2 className="text-lg font-semibold break-words text-zinc-900">{recruitment.title}</h2>
            <p className="mt-1 text-sm text-zinc-500">{company?.name ?? "企業"}</p>
          </div>

          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-4 text-sm sm:px-6">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">募集内容</h3>
              <dl className="mt-3 space-y-3">
                <Field label="職種" value={recruitment.job_type} />
                <Field label="勤務地" value={recruitment.location} />
                <Field label="給与・報酬" value={recruitment.salary} />
                <Field label="期間" value={recruitment.period} />
                <Field label="業務内容" value={recruitment.description} />
              </dl>
            </div>

            {company && (
              <div className="border-t border-zinc-200 pt-4">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">企業情報</h3>
                <dl className="space-y-3">
                  <Field label="企業名" value={company.name} />
                  <Field label="部署名" value={company.department} />
                  <Field label="業界" value={company.industry} />
                  <Field label="所在地" value={company.location} />
                  <Field label="従業員数" value={company.number_of_employees} />
                  <Field label="企業概要" value={company.description} />
                  {company.website_url && (
                    <div>
                      <dt className="text-zinc-500">Webサイト</dt>
                      <dd className="mt-1">
                        <a
                          href={company.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium break-all text-zinc-900 underline"
                        >
                          {company.website_url}
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            <p className="rounded-lg bg-zinc-50 px-3 py-2 text-xs leading-5 text-zinc-500">
              応募機能はまだありません。興味がある場合は、企業からのスカウトをお待ちください。
            </p>
          </div>

          <div className="flex flex-col gap-2 border-t border-zinc-200 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 sm:w-auto"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
