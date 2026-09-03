"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ReceivedScout, ScoutStatus } from "@/lib/types";

const STATUS_LABEL: Record<ScoutStatus, string> = {
  sent: "未回答",
  accepted: "承諾済み",
  declined: "辞退済み",
};

type ScoutDetailModalProps = {
  scout: ReceivedScout | null;
  open: boolean;
  updating: boolean;
  onClose: () => void;
  onAccept: () => void;
  onDecline: () => void;
  onMessage: () => void;
};

export function ScoutDetailModal({
  scout,
  open,
  updating,
  onClose,
  onAccept,
  onDecline,
  onMessage,
}: ScoutDetailModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && scout) {
      if (!dialog.open) {
        try {
          dialog.showModal();
        } catch {
          try {
            dialog.close();
            dialog.showModal();
          } catch {
            // 他のモーダルがトップレイヤーに残っている場合は次の tick に任せる
          }
        }
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open, scout]);

  function handleMessage() {
    onMessage();
  }

  const dialog = (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="w-full max-w-lg max-h-[90vh] overflow-hidden rounded-2xl border border-zinc-200 bg-white p-0 shadow-lg backdrop:bg-black/40"
    >
      <div className="flex max-h-[90vh] flex-col">
        <div className="border-b border-zinc-200 px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">
                {scout?.subject ?? "スカウト詳細"}
              </h2>
              <p className="mt-1 text-sm text-zinc-500">{scout?.company.name ?? ""}</p>
            </div>
            {scout && (
              <span className="shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                {STATUS_LABEL[scout.status]}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-6 overflow-y-auto px-6 py-4 text-sm">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">メッセージ</h3>
            <p className="mt-2 whitespace-pre-wrap leading-6 text-zinc-700">{scout?.body}</p>
          </div>

          <div className="border-t border-zinc-200 pt-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">企業情報</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-zinc-500">企業名</dt>
                <dd className="mt-1 font-medium text-zinc-900">{scout?.company.name}</dd>
              </div>
              {scout?.company.department && (
                <div>
                  <dt className="text-zinc-500">部署名</dt>
                  <dd className="mt-1 font-medium text-zinc-900">{scout.company.department}</dd>
                </div>
              )}
              {scout?.company.industry && (
                <div>
                  <dt className="text-zinc-500">業界</dt>
                  <dd className="mt-1 font-medium text-zinc-900">{scout.company.industry}</dd>
                </div>
              )}
              {scout?.company.location && (
                <div>
                  <dt className="text-zinc-500">勤務地</dt>
                  <dd className="mt-1 font-medium text-zinc-900">{scout.company.location}</dd>
                </div>
              )}
              {scout?.company.recruiting_job_type && (
                <div>
                  <dt className="text-zinc-500">採用職種</dt>
                  <dd className="mt-1 font-medium text-zinc-900">{scout.company.recruiting_job_type}</dd>
                </div>
              )}
              {scout?.company.salary && (
                <div>
                  <dt className="text-zinc-500">給与</dt>
                  <dd className="mt-1 font-medium text-zinc-900">{scout.company.salary}</dd>
                </div>
              )}
              {scout?.company.number_of_employees && (
                <div>
                  <dt className="text-zinc-500">従業員数</dt>
                  <dd className="mt-1 font-medium text-zinc-900">{scout.company.number_of_employees}</dd>
                </div>
              )}
              {scout?.company.description && (
                <div>
                  <dt className="text-zinc-500">企業概要</dt>
                  <dd className="mt-1 font-medium text-zinc-900 whitespace-pre-wrap">{scout.company.description}</dd>
                </div>
              )}
              {scout?.company.website_url && (
                <div>
                  <dt className="text-zinc-500">Webサイト</dt>
                  <dd className="mt-1">
                    <a
                      href={scout.company.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-zinc-900 underline break-all"
                    >
                      {scout.company.website_url}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-zinc-200 px-6 py-4">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            閉じる
          </button>
          {scout?.status === "sent" && (
            <>
              <button
                type="button"
                disabled={updating}
                onClick={onDecline}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
              >
                辞退
              </button>
              <button
                type="button"
                disabled={updating}
                onClick={onAccept}
                className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
              >
                承諾
              </button>
            </>
          )}
          {scout?.status === "accepted" && (
            <button
              type="button"
              onClick={handleMessage}
              className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700"
            >
              メッセージ
            </button>
          )}
        </div>
      </div>
    </dialog>
  );

  return mounted ? createPortal(dialog, document.body) : null;
}
