"use client";

import { PREFECTURE_REGIONS } from "@/lib/constants";

type PrefectureSelectorProps = {
  selected: string[];
  onChange: (next: string[]) => void;
};

export function PrefectureSelector({
  selected,
  onChange,
}: PrefectureSelectorProps) {
  function toggle(prefecture: string) {
    if (selected.includes(prefecture)) {
      onChange(selected.filter((item) => item !== prefecture));
    } else {
      onChange([...selected, prefecture]);
    }
  }

  return (
    <div className="mt-1 space-y-3 rounded-lg border border-zinc-300 p-3">
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
                  checked={selected.includes(prefecture)}
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
  );
}
