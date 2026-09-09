"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { ApiError, createRecruitment, updateRecruitment } from "@/lib/api";
import { PREFECTURES } from "@/lib/constants";
import type { Recruitment, RecruitmentPayload } from "@/lib/types";

const inputClass =
  "mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-900";

type RecruitmentFormModalProps = {
  recruitment: Recruitment | null;
  open: boolean;
  defaults?: {
    job_type?: string;
    location?: string;
    salary?: string;
  };
  onClose: () => void;
  onSaved: (recruitment: Recruitment) => void;
};

function optional(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function RecruitmentFormModal({
  recruitment,
  open,
  defaults,
  onClose,
  onSaved,
}: RecruitmentFormModalProps) {
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

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-4 shadow-lg backdrop:bg-black/40 max-sm:m-0 max-sm:h-dvh max-sm:max-h-dvh max-sm:max-w-none max-sm:rounded-none max-sm:border-0 sm:p-6"
    >
      {open && (
        <RecruitmentFormFields
          key={recruitment?.id ?? "new"}
          recruitment={recruitment}
          defaults={defaults}
          onClose={onClose}
          onSaved={onSaved}
        />
      )}
    </dialog>
  );
}

function RecruitmentFormFields({
  recruitment,
  defaults,
  onClose,
  onSaved,
}: Omit<RecruitmentFormModalProps, "open">) {
  const router = useRouter();
  const { logout } = useAuth();
  const isEdit = recruitment !== null;
  const [title, setTitle] = useState(recruitment?.title ?? "");
  const [jobType, setJobType] = useState(recruitment?.job_type ?? defaults?.job_type ?? "");
  const [description, setDescription] = useState(recruitment?.description ?? "");
  const [location, setLocation] = useState(recruitment?.location ?? defaults?.location ?? "");
  const [salary, setSalary] = useState(recruitment?.salary ?? defaults?.salary ?? "");
  const [period, setPeriod] = useState(recruitment?.period ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: RecruitmentPayload = {
      title: title.trim(),
      job_type: jobType.trim(),
      description: description.trim(),
      location,
      salary: salary.trim(),
      period: optional(period),
    };

    setSubmitting(true);
    setErrors([]);
    try {
      const data = isEdit
        ? await updateRecruitment(recruitment.id, payload)
        : await createRecruitment(payload);
      onSaved(data.recruitment);
      onClose();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        logout();
        router.push("/login");
        return;
      }
      if (error instanceof ApiError) {
        setErrors(error.errors);
      } else {
        setErrors(["保存に失敗しました"]);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const locationOptions =
    location && !PREFECTURES.includes(location)
      ? [location, ...PREFECTURES]
      : PREFECTURES;

  return (
    <>
      <h2 className="text-lg font-semibold text-zinc-900 max-sm:pt-[max(0px,env(safe-area-inset-top))]">
        {isEdit ? "募集を編集" : "募集を掲載"}
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        {isEdit ? "募集内容を更新できます。" : "学生に公開するインターン募集を作成します。"}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">タイトル</span>
          <input
            type="text"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">職種</span>
          <input
            type="text"
            required
            value={jobType}
            onChange={(event) => setJobType(event.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">業務内容</span>
          <textarea
            required
            rows={5}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">勤務地</span>
          <select
            required
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className={inputClass}
          >
            <option value="">選択してください</option>
            {locationOptions.map((prefecture) => (
              <option key={prefecture} value={prefecture}>
                {prefecture}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">給与・報酬</span>
          <input
            type="text"
            required
            value={salary}
            onChange={(event) => setSalary(event.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">期間（任意）</span>
          <input
            type="text"
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            placeholder="例: 夏季2ヶ月"
            className={inputClass}
          />
        </label>

        {errors.length > 0 && (
          <ul className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {errors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        )}

        <div className="flex flex-col gap-2 pb-[max(0px,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-60 sm:w-auto"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 sm:w-auto"
          >
            {submitting ? "保存中..." : isEdit ? "更新する" : "掲載する"}
          </button>
        </div>
      </form>
    </>
  );
}
