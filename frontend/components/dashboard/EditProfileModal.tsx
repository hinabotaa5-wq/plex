"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { ApiError, updateProfile } from "@/lib/api";
import { PrefectureSelector } from "@/components/ui/PrefectureSelector";
import { AVAILABLE_DAYS_PER_WEEK, WEEKDAYS } from "@/lib/constants";
import {
  isCompanyProfile,
  isStudentProfile,
  parseDesiredLocations,
  parseStringList,
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
  const [description, setDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [industry, setIndustry] = useState("");
  const [numberOfEmployees, setNumberOfEmployees] = useState("");
  const [salary, setSalary] = useState("");
  const [location, setLocation] = useState("");
  const [recruitingJobType, setRecruitingJobType] = useState("");
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
        setFaculty(user.profile.faculty ?? "");
        setDesiredJobType(user.profile.desired_job_type ?? "");
        setDesiredLocation(parseDesiredLocations(user.profile.desired_location));
        setAvailableDaysPerWeek(user.profile.available_days_per_week ?? "");
        setAvailableWeekdays(parseStringList(user.profile.available_weekdays));
        setAvailableTimeFrom((user.profile.available_time_from ?? "").slice(0, 5));
        setAvailableTimeTo((user.profile.available_time_to ?? "").slice(0, 5));
        setSelfPr(user.profile.self_pr ?? "");
        setGakuchika(user.profile.gakuchika ?? "");
        setSkills(user.profile.skills ?? "");
        setHasSkills(Boolean(user.profile.skills));
        setQualifications(user.profile.qualifications ?? "");
        setHasQualifications(Boolean(user.profile.qualifications));
        setInternExperience(user.profile.intern_experience ?? "");
        setHasInternExperience(Boolean(user.profile.intern_experience));
        setGithubUrl(user.profile.github_url ?? "");
        setHasGithub(Boolean(user.profile.github_url));
      } else if (isCompanyProfile(user)) {
        setName(user.profile.name);
        setDepartment(user.profile.department ?? "");
        setDescription(user.profile.description ?? "");
        setWebsiteUrl(user.profile.website_url ?? "");
        setIndustry(user.profile.industry ?? "");
        setNumberOfEmployees(user.profile.number_of_employees ?? "");
        setSalary(user.profile.salary ?? "");
        setLocation(user.profile.location ?? "");
        setRecruitingJobType(user.profile.recruiting_job_type ?? "");
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

        await updateProfile({
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
          skills: hasSkills ? optional(skills) : null,
          qualifications: hasQualifications ? optional(qualifications) : null,
          intern_experience: hasInternExperience ? optional(internExperience) : null,
          github_url: hasGithub ? optional(githubUrl) : null,
        });
      } else {
        await updateProfile({
          name,
          department,
          description,
          website_url: websiteUrl,
          industry,
          number_of_employees: numberOfEmployees,
          salary,
          location,
          recruiting_job_type: recruitingJobType,
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
      className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-4 shadow-lg backdrop:bg-black/40 max-sm:m-0 max-sm:h-dvh max-sm:max-h-dvh max-sm:max-w-none max-sm:rounded-none max-sm:border-0 sm:p-6"
    >
      <h2 className="text-lg font-semibold text-zinc-900 max-sm:pt-[max(0px,env(safe-area-inset-top))]">
        プロフィールを編集
      </h2>
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
              <div className="mt-1 flex min-w-0 items-center gap-2">
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
                <span className="text-sm font-medium text-zinc-700">GitHub URL・ポートフォリオ URL</span>
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
          <ul className="space-y-1 text-sm text-red-700">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        )}

        <div className="flex flex-col gap-2 pt-2 pb-[max(0px,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 sm:w-auto"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-zinc-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:bg-zinc-400 sm:w-auto"
          >
            {submitting ? "保存中..." : "保存する"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
