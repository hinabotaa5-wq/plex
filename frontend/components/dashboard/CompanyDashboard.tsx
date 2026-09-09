"use client";

import { useState } from "react";
import { CompanyRecruitments } from "@/components/dashboard/CompanyRecruitments";
import { CompanyStudents } from "@/components/dashboard/CompanyStudents";

type CompanyTab = "students" | "recruitments";

type CompanyDashboardProps = {
  chatScoutId?: number | null;
  onDeepLinkConsumed?: () => void;
};

export function CompanyDashboard({
  chatScoutId = null,
  onDeepLinkConsumed,
}: CompanyDashboardProps) {
  const [tab, setTab] = useState<CompanyTab>("students");
  const [prevChatScoutId, setPrevChatScoutId] = useState(chatScoutId);

  if (chatScoutId !== prevChatScoutId) {
    setPrevChatScoutId(chatScoutId);
    if (chatScoutId != null) {
      setTab("students");
    }
  }

  return (
    <div className="space-y-6">
      <div
        role="tablist"
        aria-label="企業ダッシュボード"
        className="grid grid-cols-2 gap-1 rounded-xl border border-zinc-200 bg-zinc-100 p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "students"}
          onClick={() => setTab("students")}
          className={`rounded-lg px-3 py-2 text-sm font-medium ${
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
          className={`rounded-lg px-3 py-2 text-sm font-medium ${
            tab === "recruitments"
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          募集管理
        </button>
      </div>

      {tab === "students" ? (
        <CompanyStudents
          chatScoutId={chatScoutId}
          onDeepLinkConsumed={onDeepLinkConsumed}
        />
      ) : (
        <CompanyRecruitments />
      )}
    </div>
  );
}
