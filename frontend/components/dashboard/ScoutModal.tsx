"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { ApiError, createScout } from "@/lib/api";
import type { StudentListItem } from "@/lib/types";

type ScoutModalProps = {
  student: StudentListItem | null;
  open: boolean;
  onClose: () => void;
  onSent: (studentId: number) => void;
};

export function ScoutModal({ student, open, onClose, onSent }: ScoutModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const { logout } = useAuth();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && student) {
      setSubject("");
      setBody("");
      setErrors([]);
      setLocked(false);
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open, student]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!student || locked) return;

    setSubmitting(true);
    setErrors([]);
    try {
      await createScout({
        student_profile_id: student.id,
        subject,
        body,
      });
      onSent(student.id);
      onClose();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        logout();
        router.push("/login");
        return;
      }
      if (error instanceof ApiError && error.status === 422) {
        setErrors(["この学生にはすでにスカウト済みです"]);
        setLocked(true);
        onSent(student.id);
      } else if (error instanceof ApiError) {
        setErrors(error.errors);
      } else {
        setErrors(["送信に失敗しました"]);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg backdrop:bg-black/40"
    >
      <h2 className="text-lg font-semibold text-zinc-900">スカウト送信</h2>
      <p className="mt-1 text-sm text-zinc-500">
        宛先: {student?.name ?? ""}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">件名</span>
          <input
            type="text"
            required
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-900"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">本文</span>
          <textarea
            required
            rows={5}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-900"
          />
        </label>

        {errors.length > 0 && (
          <ul className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {errors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={submitting || locked}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
          >
            {submitting ? "送信中..." : "送信"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
