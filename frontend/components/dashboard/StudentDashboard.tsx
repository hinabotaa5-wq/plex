"use client";

import { useState } from "react";
import { StudentRecruitments } from "@/components/dashboard/StudentRecruitments";
import { StudentScoutInbox } from "@/components/dashboard/StudentScoutInbox";

type StudentTab = "scouts" | "recruitments";

type StudentDashboardProps = {
  scoutId?: number | null;
  chatScoutId?: number | null;
  applicationId?: number | null;
  chatApplicationId?: number | null;
  onDeepLinkConsumed?: () => void;
};

export function StudentDashboard({
  scoutId = null,
  chatScoutId = null,
  applicationId = null,
  chatApplicationId = null,
  onDeepLinkConsumed,
}: StudentDashboardProps) {
  const hasScoutDeepLink = scoutId != null || chatScoutId != null;
  const hasApplicationDeepLink = applicationId != null || chatApplicationId != null;
  const [tab, setTab] = useState<StudentTab>(
    hasScoutDeepLink ? "scouts" : hasApplicationDeepLink ? "recruitments" : "scouts"
  );
  const [prevHasDeepLink, setPrevHasDeepLink] = useState(hasScoutDeepLink);
  const [prevHasApplicationDeepLink, setPrevHasApplicationDeepLink] =
    useState(hasApplicationDeepLink);

  if (hasScoutDeepLink !== prevHasDeepLink) {
    setPrevHasDeepLink(hasScoutDeepLink);
    if (hasScoutDeepLink) {
      setTab("scouts");
    }
  }

  if (hasApplicationDeepLink !== prevHasApplicationDeepLink) {
    setPrevHasApplicationDeepLink(hasApplicationDeepLink);
    if (hasApplicationDeepLink) {
      setTab("recruitments");
    }
  }

  return (
    <div className="space-y-6">
      <div
        role="tablist"
        aria-label="学生ダッシュボード"
        className="grid grid-cols-2 gap-1 rounded-xl border border-zinc-200 bg-zinc-100 p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "scouts"}
          onClick={() => setTab("scouts")}
          className={`rounded-lg px-3 py-2 text-sm font-medium ${
            tab === "scouts"
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          受信スカウト
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
          募集を探す
        </button>
      </div>

      {tab === "scouts" ? (
        <StudentScoutInbox
          scoutId={scoutId}
          chatScoutId={chatScoutId}
          onDeepLinkConsumed={onDeepLinkConsumed}
        />
      ) : (
        <StudentRecruitments
          applicationId={applicationId}
          chatApplicationId={chatApplicationId}
          onDeepLinkConsumed={onDeepLinkConsumed}
        />
      )}
    </div>
  );
}
