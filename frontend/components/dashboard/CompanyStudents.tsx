"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CompanySentScouts } from "@/components/dashboard/CompanySentScouts";
import { ScoutModal } from "@/components/dashboard/ScoutModal";
import { useAuth } from "@/components/AuthProvider";
import { ApiError, getSentScouts, getStudents } from "@/lib/api";
import type { SentScout, StudentListItem, StudentSearchParams } from "@/lib/types";

const GRADE_OPTIONS = [
  "大学1年",
  "大学2年",
  "大学3年",
  "大学4年",
  "修士1年",
  "修士2年",
  "その他",
] as const;

const EMPTY_FILTERS: StudentSearchParams = {
  q: "",
  grade: "",
  has_github: false,
  has_qualifications: false,
  has_intern_experience: false,
};

export function CompanyStudents() {
  const router = useRouter();
  const { logout } = useAuth();
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [sentScouts, setSentScouts] = useState<SentScout[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<StudentListItem | null>(null);
  const [draftFilters, setDraftFilters] = useState<StudentSearchParams>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<StudentSearchParams>(EMPTY_FILTERS);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getStudents(), getSentScouts()])
      .then(([studentsData, scoutsData]) => {
        if (cancelled) return;
        setStudents(studentsData.students);
        setSentScouts(scoutsData.scouts);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          logout();
          router.push("/login");
          return;
        }
        setError(err instanceof ApiError ? err.errors.join(", ") : "データの取得に失敗しました");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [logout, router]);

  async function fetchStudents(params: StudentSearchParams) {
    setSearching(true);
    setError(null);
    try {
      const data = await getStudents(params);
      setStudents(data.students);
      setAppliedFilters(params);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        logout();
        router.push("/login");
        return;
      }
      setError(err instanceof ApiError ? err.errors.join(", ") : "検索に失敗しました");
    } finally {
      setSearching(false);
    }
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void fetchStudents(draftFilters);
  }

  function handleGradeChange(grade: string) {
    const next = { ...draftFilters, grade };
    setDraftFilters(next);
    void fetchStudents(next);
  }

  function handleHasGithubChange(hasGithub: boolean) {
    const next = { ...draftFilters, has_github: hasGithub };
    setDraftFilters(next);
    void fetchStudents(next);
  }

  function handleHasQualificationsChange(hasQualifications: boolean) {
    const next = { ...draftFilters, has_qualifications: hasQualifications };
    setDraftFilters(next);
    void fetchStudents(next);
  }

  function handleHasInternExperienceChange(hasInternExperience: boolean) {
    const next = { ...draftFilters, has_intern_experience: hasInternExperience };
    setDraftFilters(next);
    void fetchStudents(next);
  }

  function handleClear() {
    setDraftFilters(EMPTY_FILTERS);
    void fetchStudents(EMPTY_FILTERS);
  }

  const sentIds = new Set(sentScouts.map((scout) => scout.student.id));
  const hasActiveFilters = Boolean(
    appliedFilters.q?.trim() ||
      appliedFilters.grade ||
      appliedFilters.has_github ||
      appliedFilters.has_qualifications ||
      appliedFilters.has_intern_experience
  );

  function handleSent(_studentId: number, scout?: SentScout) {
    if (scout) {
      setSentScouts((current) => [scout, ...current.filter((item) => item.id !== scout.id)]);
      return;
    }

    getSentScouts().then((data) => setSentScouts(data.scouts));
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">学生一覧を読み込み中...</p>;
  }

  if (error && students.length === 0 && !hasActiveFilters) {
    return <p className="text-sm text-red-700">{error}</p>;
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-lg font-semibold text-zinc-900">学生一覧</h2>
        <p className="mt-1 text-sm text-zinc-500">気になる学生にスカウトを送れます。</p>

        <form
          onSubmit={handleSearchSubmit}
          className="mt-6 space-y-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block text-sm text-zinc-700 sm:col-span-2 lg:col-span-1">
              <span className="mb-1 block font-medium">フリーワード</span>
              <input
                type="text"
                value={draftFilters.q ?? ""}
                onChange={(event) =>
                  setDraftFilters((current) => ({ ...current, q: event.target.value }))
                }
                placeholder="名前・大学・自己PR"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
              />
            </label>

            <label className="block text-sm text-zinc-700">
              <span className="mb-1 block font-medium">学年</span>
              <select
                value={draftFilters.grade ?? ""}
                onChange={(event) => handleGradeChange(event.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
              >
                <option value="">すべて</option>
                {GRADE_OPTIONS.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-end gap-2 pb-2 text-sm text-zinc-700">
              <input
                type="checkbox"
                checked={Boolean(draftFilters.has_github)}
                onChange={(event) => handleHasGithubChange(event.target.checked)}
                className="size-4 rounded border-zinc-300"
              />
              <span className="font-medium">GitHubありのみ</span>
            </label>

            <label className="flex items-end gap-2 pb-2 text-sm text-zinc-700">
              <input
                type="checkbox"
                checked={Boolean(draftFilters.has_qualifications)}
                onChange={(event) => handleHasQualificationsChange(event.target.checked)}
                className="size-4 rounded border-zinc-300"
              />
              <span className="font-medium">資格ありのみ</span>
            </label>

            <label className="flex items-end gap-2 pb-2 text-sm text-zinc-700">
              <input
                type="checkbox"
                checked={Boolean(draftFilters.has_intern_experience)}
                onChange={(event) => handleHasInternExperienceChange(event.target.checked)}
                className="size-4 rounded border-zinc-300"
              />
              <span className="font-medium">インターン経験ありのみ</span>
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700"
            >
              検索
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              クリア
            </button>
          </div>
        </form>

        {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

        {searching ? (
          <p className="mt-6 text-sm text-zinc-500">検索中...</p>
        ) : students.length === 0 ? (
          <p className="mt-6 text-sm text-zinc-500">
            {hasActiveFilters
              ? "条件に一致する学生が見つかりませんでした。"
              : "登録している学生はまだいません。"}
          </p>
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
      </section>

      <CompanySentScouts scouts={sentScouts} />

      <ScoutModal
        student={selected}
        open={selected !== null}
        onClose={() => setSelected(null)}
        onSent={handleSent}
      />
    </div>
  );
}
