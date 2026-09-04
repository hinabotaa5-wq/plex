"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EditProfileModal } from "@/components/dashboard/EditProfileModal";
import { useAuth } from "@/components/AuthProvider";
import {
  isCompanyProfile,
  isStudentProfile,
  parseDesiredLocations,
  parseStringList,
  formatAvailableTime,
} from "@/lib/types";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, refreshMe } = useAuth();
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return <p className="p-8 text-center text-zinc-500">読み込み中...</p>;
  }

  const displayName = user.profile?.name ?? user.email;
  const desiredLocations = isStudentProfile(user)
    ? parseDesiredLocations(user.profile.desired_location)
    : [];
  const availableWeekdays = isStudentProfile(user)
    ? parseStringList(user.profile.available_weekdays)
    : [];
  const availableTime = isStudentProfile(user)
    ? formatAvailableTime(
        user.profile.available_time_from,
        user.profile.available_time_to
      )
    : null;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:gap-8 sm:py-16">
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-8">
        <p className="text-sm text-zinc-500">マイページ</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">
          {displayName}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {user.role === "student" ? "学生" : "企業"} / {user.email}
        </p>

        <dl className="mt-8 space-y-4 text-sm">
          {isStudentProfile(user) && (
            <>
              <div>
                <dt className="text-zinc-500">氏名</dt>
                <dd className="mt-1 font-medium text-zinc-900">{user.profile.name}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">大学名</dt>
                <dd className="mt-1 font-medium text-zinc-900">
                  {user.profile.university}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">学年</dt>
                <dd className="mt-1 font-medium text-zinc-900">{user.profile.grade}</dd>
              </div>
              {user.profile.faculty && (
                <div>
                  <dt className="text-zinc-500">学部</dt>
                  <dd className="mt-1 font-medium text-zinc-900">{user.profile.faculty}</dd>
                </div>
              )}
              {user.profile.desired_job_type && (
                <div>
                  <dt className="text-zinc-500">希望職種</dt>
                  <dd className="mt-1 font-medium text-zinc-900">
                    {user.profile.desired_job_type}
                  </dd>
                </div>
              )}
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
              {user.profile.available_days_per_week && (
                <div>
                  <dt className="text-zinc-500">稼働可能日数</dt>
                  <dd className="mt-1 font-medium text-zinc-900">
                    {user.profile.available_days_per_week}
                  </dd>
                </div>
              )}
              {availableWeekdays.length > 0 && (
                <div>
                  <dt className="text-zinc-500">曜日</dt>
                  <dd className="mt-1 flex flex-wrap gap-1.5">
                    {availableWeekdays.map((day) => (
                      <span
                        key={day}
                        className="inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-800"
                      >
                        {day}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
              {availableTime && (
                <div>
                  <dt className="text-zinc-500">稼働可能時間</dt>
                  <dd className="mt-1 font-medium text-zinc-900">{availableTime}</dd>
                </div>
              )}
              {user.profile.self_pr && (
                <div>
                  <dt className="text-zinc-500">自己PR</dt>
                  <dd className="mt-1 font-medium text-zinc-900">{user.profile.self_pr}</dd>
                </div>
              )}
              {user.profile.gakuchika && (
                <div>
                  <dt className="text-zinc-500">ガクチカ</dt>
                  <dd className="mt-1 font-medium text-zinc-900">{user.profile.gakuchika}</dd>
                </div>
              )}
              {user.profile.skills && (
                <div>
                  <dt className="text-zinc-500">ITスキル</dt>
                  <dd className="mt-1 font-medium text-zinc-900">{user.profile.skills}</dd>
                </div>
              )}
              {user.profile.qualifications && (
                <div>
                  <dt className="text-zinc-500">資格</dt>
                  <dd className="mt-1 font-medium text-zinc-900">
                    {user.profile.qualifications}
                  </dd>
                </div>
              )}
              {user.profile.intern_experience && (
                <div>
                  <dt className="text-zinc-500">インターン経験</dt>
                  <dd className="mt-1 font-medium text-zinc-900">
                    {user.profile.intern_experience}
                  </dd>
                </div>
              )}
              {user.profile.github_url && (
                <div>
                  <dt className="text-zinc-500">GitHub URL・ポートフォリオ URL</dt>
                  <dd className="mt-1 font-medium text-zinc-900">
                    <a
                      href={user.profile.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline break-all"
                    >
                      {user.profile.github_url}
                    </a>
                  </dd>
                </div>
              )}
            </>
          )}
          {isCompanyProfile(user) && (
            <>
              <div>
                <dt className="text-zinc-500">企業名</dt>
                <dd className="mt-1 font-medium text-zinc-900">{user.profile.name}</dd>
              </div>
              {user.profile.department && (
                <div>
                  <dt className="text-zinc-500">部署名</dt>
                  <dd className="mt-1 font-medium text-zinc-900">{user.profile.department}</dd>
                </div>
              )}
              {user.profile.industry && (
                <div>
                  <dt className="text-zinc-500">業界</dt>
                  <dd className="mt-1 font-medium text-zinc-900">{user.profile.industry}</dd>
                </div>
              )}
              {user.profile.number_of_employees && (
                <div>
                  <dt className="text-zinc-500">従業員数</dt>
                  <dd className="mt-1 font-medium text-zinc-900">
                    {user.profile.number_of_employees}
                  </dd>
                </div>
              )}
              {user.profile.salary && (
                <div>
                  <dt className="text-zinc-500">給与</dt>
                  <dd className="mt-1 font-medium text-zinc-900">{user.profile.salary}</dd>
                </div>
              )}
              {user.profile.location && (
                <div>
                  <dt className="text-zinc-500">勤務地</dt>
                  <dd className="mt-1 font-medium text-zinc-900">{user.profile.location}</dd>
                </div>
              )}
              {user.profile.recruiting_job_type && (
                <div>
                  <dt className="text-zinc-500">採用職種</dt>
                  <dd className="mt-1 font-medium text-zinc-900">
                    {user.profile.recruiting_job_type}
                  </dd>
                </div>
              )}
              {user.profile.description && (
                <div>
                  <dt className="text-zinc-500">企業概要</dt>
                  <dd className="mt-1 font-medium text-zinc-900">
                    {user.profile.description}
                  </dd>
                </div>
              )}
              {user.profile.website_url && (
                <div>
                  <dt className="text-zinc-500">Webサイト</dt>
                  <dd className="mt-1 font-medium text-zinc-900">
                    <a
                      href={user.profile.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline break-all"
                    >
                      {user.profile.website_url}
                    </a>
                  </dd>
                </div>
              )}
            </>
          )}
        </dl>

        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 sm:w-auto"
          >
            プロフィールを編集
          </button>
          <Link
            href="/dashboard"
            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-center text-sm font-medium text-zinc-700 hover:bg-zinc-50 sm:w-auto"
          >
            戻る
          </Link>
        </div>
      </div>

      <EditProfileModal
        user={user}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={refreshMe}
      />
    </main>
  );
}
