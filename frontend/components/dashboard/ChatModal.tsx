"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { ApiError, createMessage, getMessages } from "@/lib/api";
import type { ChatMessage } from "@/lib/types";

type ChatModalProps = {
  scoutId: number | null;
  title: string;
  open: boolean;
  onClose: () => void;
};

export function ChatModal({ scoutId, title, open, onClose }: ChatModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && scoutId) {
      setBody("");
      setError(null);
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
  }, [open, scoutId]);

  useEffect(() => {
    if (!open || !scoutId) return;

    let cancelled = false;
    setLoading(true);
    getMessages(scoutId)
      .then((data) => {
        if (!cancelled) setMessages(data.messages);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          logout();
          router.push("/login");
          return;
        }
        setError(err instanceof ApiError ? err.errors.join(", ") : "メッセージの取得に失敗しました");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, scoutId, logout, router]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!scoutId || body.trim() === "") return;

    setSubmitting(true);
    setError(null);
    try {
      const data = await createMessage(scoutId, body.trim());
      setMessages((current) => [...current, data.message]);
      setBody("");
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        logout();
        router.push("/login");
        return;
      }
      setError(err instanceof ApiError ? err.errors.join(", ") : "送信に失敗しました");
    } finally {
      setSubmitting(false);
    }
  }

  const dialog = (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg backdrop:bg-black/40"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">メッセージ</h2>
          <p className="mt-1 text-sm text-zinc-500">{title}</p>
        </div>
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          className="text-sm text-zinc-500 hover:text-zinc-900"
        >
          閉じる
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-zinc-500">読み込み中...</p>
      ) : (
        <ul
          ref={listRef}
          className="mt-6 flex max-h-80 flex-col gap-2 overflow-y-auto"
        >
          {messages.length === 0 ? (
            <li className="text-sm text-zinc-500">まだメッセージはありません。日程の希望などを送りましょう。</li>
          ) : (
            messages.map((message) => {
              const mine = message.user_id === user?.id;
              return (
                <li
                  key={message.id}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <p
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-6 ${
                      mine
                        ? "bg-zinc-900 text-white"
                        : "bg-zinc-100 text-zinc-900"
                    }`}
                  >
                    {message.body}
                  </p>
                </li>
              );
            })
          )}
        </ul>
      )}

      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <textarea
          required
          rows={2}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="例: 来週火曜 14時はいかがでしょうか。"
          className="min-h-[44px] flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900"
        />
        <button
          type="submit"
          disabled={submitting}
          className="self-end rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
        >
          {submitting ? "送信中..." : "送信"}
        </button>
      </form>
    </dialog>
  );

  return mounted ? createPortal(dialog, document.body) : null;
}
