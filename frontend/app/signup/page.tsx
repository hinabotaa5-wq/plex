"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import type { SignupPayload, UserRole } from "@/lib/types";

function optional(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

const inputClass =
  "mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-900";

const GRADE_OPTIONS = [
  "大学1年",
  "大学2年",
  "大学3年",
  "大学4年",
  "修士1年",
  "修士2年",
  "その他",
] as const;

export default function SignupPage() {
  const router = useRouter();
  const { user, loading, signup } = useAuth();
  const [role, setRole] = useState<UserRole>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [university, setUniversity] = useState("");
  const [grade, setGrade] = useState("");
  const [selfPr, setSelfPr] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [description, setDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  function handleRoleChange(nextRole: UserRole) {
    setRole(nextRole);
    setErrors([]);
    setName("");
    setUniversity("");
    setGrade("");
    setSelfPr("");
    setGithubUrl("");
    setPortfolioUrl("");
    setDescription("");
    setWebsiteUrl("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors([]);
    setSubmitting(true);

    const payload: SignupPayload =
      role === "student"
        ? {
            email,
            password,
            role: "student",
            student_profile_attributes: {
              name,
              university,
              grade,
              self_pr: optional(selfPr),
              github_url: optional(githubUrl),
              portfolio_url: optional(portfolioUrl),
            },
          }
        : {
            email,
            password,
            role: "company",
            company_profile_attributes: {
              name,
              description: optional(description),
              website_url: optional(websiteUrl),
            },
          };

    try {
      await signup(payload);
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.errors);
      } else {
        setErrors(["登録に失敗しました"]);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || user) {
    return <p className="p-8 text-center text-zinc-500">読み込み中...</p>;
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <Link
          href="/"
          aria-label="トップに戻る"
          className="mb-3 inline-block text-lg leading-none text-zinc-500 hover:text-zinc-900"
        >
          ←
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          新規登録
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          学生または企業のアカウントを作成できます。
        </p>

        <div className="mt-6 grid grid-cols-2 gap-2 rounded-lg bg-zinc-100 p-1">
          <button
            type="button"
            onClick={() => handleRoleChange("student")}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              role === "student" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500"
            }`}
          >
            学生
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange("company")}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              role === "company" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500"
            }`}
          >
            企業
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-zinc-700">メールアドレス</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-zinc-700">パスワード</span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClass}
            />
          </label>

          {role === "student" ? (
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
            <ul className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {errors.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
          >
            {submitting ? "登録中..." : "登録する"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          アカウントをお持ちの方は{" "}
          <Link href="/login" className="font-medium text-zinc-900 underline">
            ログイン
          </Link>
        </p>
      </div>
    </main>
  );
}
