"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { parseDesiredLocations, type StudentListItem } from "@/lib/types";

type StudentDetailModalProps = {
  student: StudentListItem | null;
  open: boolean;
  sent: boolean;
  onClose: () => void;
  onScout: (student: StudentListItem) => void;
};

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-zinc-500">{label}</dt>
      <dd className="mt-1 font-medium text-zinc-900">{value}</dd>
    </div>
  );
}

export function StudentDetailModal({
  student,
  open,
  sent,
  onClose,
  onScout,
}: StudentDetailModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && student) {
      if (!dialog.open) {
        try {
          dialog.showModal();
        } catch {
          try {
            dialog.close();
            dialog.showModal();
          } catch {
            // 他のモーダルがトップレイヤーに残っている場合は次の tick に任せる
          }
        }
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open, student]);

  function handleScout() {
    if (!student || sent) return;
    onScout(student);
  }

  const desiredLocations = student
    ? parseDesiredLocations(student.desired_location)
    : [];

  const dialog = (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="w-full max-w-lg max-h-[90vh] overflow-hidden rounded-2xl border border-zinc-200 bg-white p-0 shadow-lg backdrop:bg-black/40"
    >
      <div className="flex max-h-[90vh] flex-col">
        <div className="border-b border-zinc-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-zinc-900">学生詳細</h2>
          <p className="mt-1 text-sm text-zinc-500">{student?.name ?? ""}</p>
        </div>

        <dl className="space-y-4 overflow-y-auto px-6 py-4 text-sm">
          <div>
            <dt className="text-zinc-500">氏名</dt>
            <dd className="mt-1 font-medium text-zinc-900">{student?.name}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">大学名</dt>
            <dd className="mt-1 font-medium text-zinc-900">{student?.university}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">学部</dt>
            <dd className="mt-1 font-medium text-zinc-900">{student?.faculty || "—"}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">学年</dt>
            <dd className="mt-1 font-medium text-zinc-900">{student?.grade}</dd>
          </div>
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
                  className="underline"
                >
                  {student.github_url}
                </a>
              </dd>
            </div>
          )}
        </dl>

        <div className="flex justify-end gap-2 border-t border-zinc-200 px-6 py-4">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            閉じる
          </button>
          <button
            type="button"
            disabled={sent}
            onClick={handleScout}
            className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:bg-zinc-300 disabled:text-zinc-600"
          >
            {sent ? "送信済み" : "スカウトする"}
          </button>
        </div>
      </div>
    </dialog>
  );

  return mounted ? createPortal(dialog, document.body) : null;
}
