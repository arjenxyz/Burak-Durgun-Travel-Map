"use client";

import type { MapCountry } from "@/lib/supabase/client";

type Props = {
  open: boolean;
  countries: MapCountry[];
  selectedCode?: string;
  onClose: () => void;
  onSelect: (country: MapCountry) => void;
};

export default function MobileCountrySheet({
  open,
  countries,
  selectedCode,
  onClose,
  onSelect,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30 md:hidden">
      <button
        type="button"
        aria-label="Kapat"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="absolute bottom-0 left-0 right-0 flex max-h-[min(70dvh,520px)] flex-col rounded-t-2xl border border-white/10 bg-zinc-950 shadow-2xl safe-bottom">
        <div className="flex shrink-0 items-center justify-center py-2">
          <span className="h-1 w-10 rounded-full bg-zinc-600" />
        </div>

        <div className="flex items-center justify-between border-b border-white/10 px-4 pb-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-orange-400">Ülkeler</p>
            <p className="text-sm text-zinc-400">{countries.length} ülke</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 active:bg-white/5"
          >
            Kapat
          </button>
        </div>

        <ul className="flex-1 overflow-y-auto overscroll-contain p-2 touch-scroll">
          {countries.map((country) => (
            <li key={country.country_code}>
              <button
                type="button"
                onClick={() => {
                  onSelect(country);
                  onClose();
                }}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left text-base transition active:scale-[0.98] ${
                  selectedCode === country.country_code
                    ? "bg-orange-500/20 text-orange-200"
                    : "text-zinc-100 active:bg-white/5"
                }`}
              >
                <span className="truncate pr-2">{country.country_name}</span>
                <span className="shrink-0 rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-400">
                  {country.video_count}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
