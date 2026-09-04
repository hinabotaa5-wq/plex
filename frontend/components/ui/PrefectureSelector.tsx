"use client";

import { type MouseEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PREFECTURE_REGIONS } from "@/lib/constants";

type PrefectureSelectorProps = {
  selected: string[];
  onChange: (next: string[]) => void;
};

export function PrefectureSelector({
  selected,
  onChange,
}: PrefectureSelectorProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  function toggle(prefecture: string) {
    setDraft((current) =>
      current.includes(prefecture)
        ? current.filter((item) => item !== prefecture)
        : [...current, prefecture]
    );
  }

  function handleOpen(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setDraft(selected);
    setOpen(true);
  }

  function handleConfirm(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    onChange(draft);
    setOpen(false);
  }

  function handleCancel(event?: MouseEvent<HTMLButtonElement>) {
    event?.preventDefault();
    event?.stopPropagation();
    setOpen(false);
  }

  const label =
    selected.length === 0
      ? "希望勤務地を選択（未選択）"
      : `希望勤務地を選択（${selected.length}件選択中）`;

  const dialog = (
      <dialog
        ref={dialogRef}
        onClose={(event) => {
          event.stopPropagation();
          setOpen(false);
        }}
        onCancel={(event) => {
          event.stopPropagation();
        }}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg max-h-[90vh] overflow-hidden rounded-2xl border border-zinc-200 bg-white p-0 shadow-lg backdrop:bg-black/40 max-sm:m-0 max-sm:h-dvh max-sm:max-h-dvh max-sm:max-w-none max-sm:rounded-none max-sm:border-0"
      >
        <div className="flex h-full max-h-[90vh] flex-col max-sm:max-h-none">
          <div className="border-b border-zinc-200 px-4 py-4 sm:px-6 max-sm:pt-[max(1rem,env(safe-area-inset-top))]">
            <h3 className="text-lg font-semibold text-zinc-900">希望勤務地を選択</h3>
            <p className="mt-1 text-sm text-zinc-500">
              {draft.length === 0 ? "未選択" : `${draft.length}件選択中`}
            </p>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-6">
            {PREFECTURE_REGIONS.map((group) => (
              <fieldset key={group.region}>
                <legend className="text-xs font-semibold text-zinc-500">
                  {group.region}
                </legend>
                <div className="mt-1 grid grid-cols-2 gap-1 sm:grid-cols-3">
                  {group.prefectures.map((prefecture) => (
                    <label
                      key={prefecture}
                      className="flex items-center gap-1.5 text-sm text-zinc-800"
                    >
                      <input
                        type="checkbox"
                        checked={draft.includes(prefecture)}
                        onChange={() => toggle(prefecture)}
                        className="rounded border-zinc-300"
                      />
                      {prefecture}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>

          <div className="flex flex-col gap-2 border-t border-zinc-200 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={handleCancel}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 sm:w-auto"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full rounded-lg bg-zinc-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 sm:w-auto"
            >
              決定
            </button>
          </div>
        </div>
      </dialog>
  );

  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={handleOpen}
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-left text-sm text-zinc-900 outline-none hover:bg-zinc-50 focus:border-zinc-900"
      >
        {label}
      </button>

      {selected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selected.map((location) => (
            <span
              key={location}
              className="inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-800"
            >
              {location}
            </span>
          ))}
        </div>
      )}

      {mounted ? createPortal(dialog, document.body) : null}
    </div>
  );
}
