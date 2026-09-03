"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { ApiError, updateProfile } from "@/lib/api";
import {
  isCompanyProfile,
  isStudentProfile,
  type User,
} from "@/lib/types";

const GRADE_OPTIONS = [
  "大学1年",
  "大学2年",
  "大学3年",
  "大学4年",
  "修士1年",
  "修士2年",
  "その他",
] as const;

const inputClass =
  "mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900";

type EditProfileModalProps = {
  user: User;
  open: boolean;
  onClose: () => void;
  onSaved: () => Promise<void>;
};

function optional(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function EditProfileModal({ user, open, onClose, onSaved }: EditProfileModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const { logout } = useAuth();
  const [name, setName] = useState("");
  const [university, setUniversity] = useState("");
  const [grade, setGrade] = useState("");
  const [selfPr, setSelfPr] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && user.profile) {
      if (isStudentProfile(user)) {
        setName(user.profile.name);
        setUniversity(user.profile.university);
        setGrade(user.profile.grade);
        setSelfPr(user.profile.self_pr ?? "");
        setGithubUrl(user.profile.github_url ?? "");
        setPortfolioUrl(user.profile.portfolio_url ?? "");
      } else if (isCompanyProfile(user)) {
        setName(user.profile.name);
        setDepartment(user.profile.department ?? "");
        setDescription(user.profile.description ?? "");
        setWebsiteUrl(user.profile.website_url ?? "");
      }
      setErrors([]);
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrors([]);

    try {
      if (user.role === "student") {
        await updateProfile({
          name,
          university,
          grade,
          self_pr: optional(selfPr),
          github_url: optional(githubUrl),
          portfolio_url: optional(portfolioUrl),
        });
      } else {
        await updateProfile({
          name,
          department: optional(department),
          description: optional(description),
          website_url: optional(websiteUrl),
        });
      }
      await onSaved();
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

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg backdrop:bg-black/40"
    >
      <h2 className="text-lg font-semibold text-zinc-900">プロフィールを編集</h2>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {user.role === "student" ? (
          <>
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">氏名</span>
              <input
                type="text"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">大学名</span>
              <input
                type="text"
                required
                value={university}
                onChange={(event) => setUniversity(event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">学年</span>
              <select
                required
                value={grade}
                onChange={(event) => setGrade(event.target.value)}
                className={inputClass}
              >
                <option value="">選択してください</option>
                {GRADE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">自己PR</span>
              <textarea
                rows={3}
                value={selfPr}
                onChange={(event) => setSelfPr(event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">GitHub URL</span>
              <input
                type="url"
                value={githubUrl}
                onChange={(event) => setGithubUrl(event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">ポートフォリオ URL</span>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(event) => setPortfolioUrl(event.target.value)}
                className={inputClass}
              />
            </label>
          </>
        ) : (
          <>
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">企業名</span>
              <input
                type="text"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">部署名</span>
              <input
                type="text"
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">企業概要</span>
              <textarea
                rows={3}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Webサイト URL</span>
              <input
                type="url"
                value={websiteUrl}
                onChange={(event) => setWebsiteUrl(event.target.value)}
                className={inputClass}
              />
            </label>
          </>
        )}

        {errors.length > 0 && (
          <ul className="space-y-1 text-sm text-red-700">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:bg-zinc-400"
          >
            {submitting ? "保存中..." : "保存する"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
