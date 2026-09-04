"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { PrefectureSelector } from "@/components/ui/PrefectureSelector";
import { AVAILABLE_DAYS_PER_WEEK, WEEKDAYS } from "@/lib/constants";
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
  const [faculty, setFaculty] = useState("");
  const [desiredJobType, setDesiredJobType] = useState("");
  const [desiredLocation, setDesiredLocation] = useState<string[]>([]);
  const [availableDaysPerWeek, setAvailableDaysPerWeek] = useState("");
  const [availableWeekdays, setAvailableWeekdays] = useState<string[]>([]);
  const [availableTimeFrom, setAvailableTimeFrom] = useState("");
  const [availableTimeTo, setAvailableTimeTo] = useState("");
  const [selfPr, setSelfPr] = useState("");
  const [gakuchika, setGakuchika] = useState("");
  const [skills, setSkills] = useState("");
  const [hasSkills, setHasSkills] = useState(false);
  const [qualifications, setQualifications] = useState("");
  const [hasQualifications, setHasQualifications] = useState(false);
  const [internExperience, setInternExperience] = useState("");
  const [hasInternExperience, setHasInternExperience] = useState(false);
  const [githubUrl, setGithubUrl] = useState("");
  const [hasGithub, setHasGithub] = useState(false);
  const [department, setDepartment] = useState("");
  const [industry, setIndustry] = useState("");
  const [numberOfEmployees, setNumberOfEmployees] = useState("");
  const [salary, setSalary] = useState("");
  const [location, setLocation] = useState("");
  const [recruitingJobType, setRecruitingJobType] = useState("");
  const [description, setDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  function resetProfileFields() {
    setName("");
    setUniversity("");
    setGrade("");
    setFaculty("");
    setDesiredJobType("");
    setDesiredLocation([]);
    setAvailableDaysPerWeek("");
    setAvailableWeekdays([]);
    setAvailableTimeFrom("");
    setAvailableTimeTo("");
    setSelfPr("");
    setGakuchika("");
    setSkills("");
    setHasSkills(false);
    setQualifications("");
    setHasQualifications(false);
    setInternExperience("");
    setHasInternExperience(false);
    setGithubUrl("");
    setHasGithub(false);
    setDepartment("");
    setIndustry("");
    setNumberOfEmployees("");
    setSalary("");
    setLocation("");
    setRecruitingJobType("");
    setDescription("");
    setWebsiteUrl("");
  }

  function handleRoleChange(nextRole: UserRole) {
    setRole(nextRole);
    setErrors([]);
    resetProfileFields();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors([]);

    if (role === "student") {
      const clientErrors: string[] = [];
      if (desiredLocation.length === 0) {
        clientErrors.push("希望勤務地を選択してください");
      }
      if (availableWeekdays.length === 0) {
        clientErrors.push("曜日を選択してください");
      }
      if (clientErrors.length > 0) {
        setErrors(clientErrors);
        return;
      }
    }

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
              faculty,
              desired_job_type: desiredJobType,
              desired_location: desiredLocation,
              available_days_per_week: availableDaysPerWeek,
              available_weekdays: WEEKDAYS.filter((day) =>
                availableWeekdays.includes(day)
              ),
              available_time_from: availableTimeFrom,
              available_time_to: availableTimeTo,
              self_pr: selfPr,
              gakuchika,
              skills: hasSkills ? optional(skills) : undefined,
              qualifications: hasQualifications
                ? optional(qualifications)
                : undefined,
              intern_experience: hasInternExperience
                ? optional(internExperience)
                : undefined,
              github_url: hasGithub ? optional(githubUrl) : undefined,
            },
          }
        : {
            email,
            password,
            role: "company",
            company_profile_attributes: {
              name,
              department,
              industry,
              number_of_employees: numberOfEmployees,
              salary,
              location,
              recruiting_job_type: recruitingJobType,
              description,
              website_url: websiteUrl,
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
      <div className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
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
                <span className="text-sm font-medium text-zinc-700">学部</span>
                <input
                  type="text"
                  required
                  value={faculty}
                  onChange={(event) => setFaculty(event.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-zinc-700">希望職種</span>
                <input
                  type="text"
                  required
                  value={desiredJobType}
                  onChange={(event) => setDesiredJobType(event.target.value)}
                  className={inputClass}
                />
              </label>
              <div>
                <span className="text-sm font-medium text-zinc-700">希望勤務地</span>
                <PrefectureSelector
                  selected={desiredLocation}
                  onChange={setDesiredLocation}
                />
              </div>
              <label className="block">
                <span className="text-sm font-medium text-zinc-700">稼働可能日数</span>
                <select
                  required
                  value={availableDaysPerWeek}
                  onChange={(event) => setAvailableDaysPerWeek(event.target.value)}
                  className={inputClass}
                >
                  <option value="">選択してください</option>
                  {AVAILABLE_DAYS_PER_WEEK.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <fieldset>
                <legend className="text-sm font-medium text-zinc-700">曜日</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {WEEKDAYS.map((day) => {
                    const checked = availableWeekdays.includes(day);
                    return (
                      <label
                        key={day}
                        className={`inline-flex cursor-pointer items-center rounded-full border px-3 py-1 text-sm ${
                          checked
                            ? "border-zinc-900 bg-zinc-900 text-white"
                            : "border-zinc-300 bg-white text-zinc-700"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setAvailableWeekdays((current) =>
                              current.includes(day)
                                ? current.filter((item) => item !== day)
                                : [...current, day]
                            )
                          }
                          className="sr-only"
                        />
                        {day}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
              <div>
                <span className="text-sm font-medium text-zinc-700">稼働可能時間</span>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="time"
                    required
                    value={availableTimeFrom}
                    onChange={(event) => setAvailableTimeFrom(event.target.value)}
                    className={inputClass}
                  />
                  <span className="text-sm text-zinc-500">〜</span>
                  <input
                    type="time"
                    required
                    value={availableTimeTo}
                    onChange={(event) => setAvailableTimeTo(event.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <label className="block">
                <span className="text-sm font-medium text-zinc-700">自己PR</span>
                <textarea
                  rows={3}
                  required
                  value={selfPr}
                  onChange={(event) => setSelfPr(event.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-zinc-700">ガクチカ</span>
                <textarea
                  rows={3}
                  required
                  value={gakuchika}
                  onChange={(event) => setGakuchika(event.target.value)}
                  className={inputClass}
                />
              </label>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hasSkills}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      setHasSkills(checked);
                      if (!checked) setSkills("");
                    }}
                    className="size-4 rounded border-zinc-300"
                  />
                  <span className="text-sm font-medium text-zinc-700">ITスキル</span>
                </label>
                {hasSkills && (
                  <textarea
                    rows={3}
                    required
                    value={skills}
                    onChange={(event) => setSkills(event.target.value)}
                    className={inputClass}
                  />
                )}
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hasQualifications}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      setHasQualifications(checked);
                      if (!checked) setQualifications("");
                    }}
                    className="size-4 rounded border-zinc-300"
                  />
                  <span className="text-sm font-medium text-zinc-700">資格</span>
                </label>
                {hasQualifications && (
                  <textarea
                    rows={3}
                    required
                    value={qualifications}
                    onChange={(event) => setQualifications(event.target.value)}
                    className={inputClass}
                  />
                )}
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hasInternExperience}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      setHasInternExperience(checked);
                      if (!checked) setInternExperience("");
                    }}
                    className="size-4 rounded border-zinc-300"
                  />
                  <span className="text-sm font-medium text-zinc-700">インターン経験</span>
                </label>
                {hasInternExperience && (
                  <textarea
                    rows={3}
                    required
                    value={internExperience}
                    onChange={(event) => setInternExperience(event.target.value)}
                    className={inputClass}
                  />
                )}
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hasGithub}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      setHasGithub(checked);
                      if (!checked) setGithubUrl("");
                    }}
                    className="size-4 rounded border-zinc-300"
                  />
                  <span className="text-sm font-medium text-zinc-700">
                    GitHub URL・ポートフォリオ URL
                  </span>
                </label>
                {hasGithub && (
                  <input
                    type="url"
                    required
                    value={githubUrl}
                    onChange={(event) => setGithubUrl(event.target.value)}
                    className={inputClass}
                  />
                )}
              </div>
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
                  required
                  value={department}
                  onChange={(event) => setDepartment(event.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-zinc-700">業界</span>
                <input
                  type="text"
                  required
                  value={industry}
                  onChange={(event) => setIndustry(event.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-zinc-700">従業員数</span>
                <input
                  type="text"
                  required
                  value={numberOfEmployees}
                  onChange={(event) => setNumberOfEmployees(event.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-zinc-700">給与</span>
                <input
                  type="text"
                  required
                  value={salary}
                  onChange={(event) => setSalary(event.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-zinc-700">勤務地</span>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-zinc-700">採用職種</span>
                <input
                  type="text"
                  required
                  value={recruitingJobType}
                  onChange={(event) => setRecruitingJobType(event.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-zinc-700">企業概要</span>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-zinc-700">Webサイト URL</span>
                <input
                  type="url"
                  required
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
