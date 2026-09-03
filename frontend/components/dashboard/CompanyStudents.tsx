"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ScoutModal } from "@/components/dashboard/ScoutModal";
import { useAuth } from "@/components/AuthProvider";
import { ApiError, getStudents } from "@/lib/api";
import type { StudentListItem } from "@/lib/types";

export function CompanyStudents() {
  const router = useRouter();
  const { logout } = useAuth();
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<StudentListItem | null>(null);
  const [sentIds, setSentIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    let cancelled = false;

    getStudents()
      .then((data) => {
        if (!cancelled) setStudents(data.students);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          logout();
          router.push("/login");
          return;
        }
        setError(err instanceof ApiError ? err.errors.join(", ") : "学生一覧の取得に失敗しました");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [logout, router]);

  function handleSent(studentId: number) {
    setSentIds((current) => new Set(current).add(studentId));
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">学生一覧を読み込み中...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-700">{error}</p>;
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-zinc-900">学生一覧</h2>
      <p className="mt-1 text-sm text-zinc-500">気になる学生にスカウトを送れます。</p>

      {students.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-500">登録している学生はまだいません。</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {students.map((student) => {
            const sent = sentIds.has(student.id);
            return (
              <li
                key={student.id}
                className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-zinc-900">{student.name}</h3>
                    <p className="mt-1 text-sm text-zinc-500">
                      {student.university} / {student.grade}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={sent}
                    onClick={() => setSelected(student)}
                    className="shrink-0 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:bg-zinc-300 disabled:text-zinc-600"
                  >
                    {sent ? "送信済み" : "スカウトする"}
                  </button>
                </div>
                {student.self_pr && (
                  <p className="mt-4 text-sm leading-6 text-zinc-700">{student.self_pr}</p>
                )}
                {student.github_url && (
                  <a
                    href={student.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-sm text-zinc-500 underline"
                  >
                    GitHub
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <ScoutModal
        student={selected}
        open={selected !== null}
        onClose={() => setSelected(null)}
        onSent={handleSent}
      />
    </section>
  );
}
