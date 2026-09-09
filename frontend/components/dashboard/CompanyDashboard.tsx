"use client";

import { useState } from "react";
import { CompanyApplications } from "@/components/dashboard/CompanyApplications";
import { CompanyRecruitments } from "@/components/dashboard/CompanyRecruitments";
import { CompanyStudents } from "@/components/dashboard/CompanyStudents";

type CompanyTab = "students" | "recruitments" | "applications";

type CompanyDashboardProps = {
  chatScoutId?: number | null;
  applicationId?: number | null;
  chatApplicationId?: number | null;
  onDeepLinkConsumed?: () => void;
};

export function CompanyDashboard({
  chatScoutId = null,
  applicationId = null,
  chatApplicationId = null,
  onDeepLinkConsumed,
}: CompanyDashboardProps) {
  const [tab, setTab] = useState<CompanyTab>(
    applicationId != null || chatApplicationId != null ? "applications" : "students"
  );
  const [prevChatScoutId, setPrevChatScoutId] = useState(chatScoutId);
  const [prevApplicationId, setPrevApplicationId] = useState(applicationId);
  const [prevChatApplicationId, setPrevChatApplicationId] = useState(chatApplicationId);

  if (chatScoutId !== prevChatScoutId) {
    setPrevChatScoutId(chatScoutId);
    if (chatScoutId != null) {
      setTab("students");
    }
  }

  if (applicationId !== prevApplicationId) {
    setPrevApplicationId(applicationId);
    if (applicationId != null) {
      setTab("applications");
    }
  }

  if (chatApplicationId !== prevChatApplicationId) {
    setPrevChatApplicationId(chatApplicationId);
    if (chatApplicationId != null) {
      setTab("applications");
    }
  }

  return (
    <div className="space-y-6">
      <div
        role="tablist"
        aria-label="企業ダッシュボード"
        className="grid grid-cols-3 gap-1 rounded-xl border border-zinc-200 bg-zinc-100 p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "students"}
          onClick={() => setTab("students")}
          className={`rounded-lg px-2 py-2 text-xs font-medium sm:px-3 sm:text-sm ${
            tab === "students"
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          学生検索
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "recruitments"}
          onClick={() => setTab("recruitments")}
          className={`rounded-lg px-2 py-2 text-xs font-medium sm:px-3 sm:text-sm ${
            tab === "recruitments"
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          募集管理
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "applications"}
          onClick={() => setTab("applications")}
          className={`rounded-lg px-2 py-2 text-xs font-medium sm:px-3 sm:text-sm ${
            tab === "applications"
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          応募管理
        </button>
      </div>

      {tab === "students" && (
        <CompanyStudents
          chatScoutId={chatScoutId}
          onDeepLinkConsumed={onDeepLinkConsumed}
        />
      )}
      {tab === "recruitments" && <CompanyRecruitments />}
      {tab === "applications" && (
        <CompanyApplications
          applicationId={applicationId}
          chatApplicationId={chatApplicationId}
          onDeepLinkConsumed={onDeepLinkConsumed}
        />
      )}
    </div>
  );
}
