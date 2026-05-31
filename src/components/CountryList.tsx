"use client";

import type { MapCountry } from "@/lib/supabase/client";

type Props = {
  countries: MapCountry[];
  selectedCode?: string;
  onSelect: (country: MapCountry) => void;
  onClose?: () => void;
  className?: string;
};

export default function CountryList({
  countries,
  selectedCode,
  onSelect,
  onClose,
  className = "",
}: Props) {
  if (countries.length === 0) return null;

  return (
    <aside className={`flex min-h-0 flex-col ${className}`}>
      <div className="flex shrink-0 items-start justify-between gap-2 border-b border-white/10 px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-orange-400">Ülkeler</p>
          <p className="text-sm text-zinc-400">{countries.length} ülke</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg px-2 py-1 text-sm text-zinc-400 hover:bg-white/5"
            aria-label="Kapat"
          >
            ✕
          </button>
        )}
      </div>
      <ul className="panel-scroll flex-1 overflow-y-auto overscroll-contain p-2">
        {countries.map((country) => (
          <li key={country.country_code}>
            <button
              type="button"
              onClick={() => onSelect(country)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition active:scale-[0.99] md:py-3 md:text-[15px] ${
                selectedCode === country.country_code
                  ? "bg-orange-500/20 text-orange-200 ring-1 ring-orange-500/30"
                  : "text-zinc-200 hover:bg-white/5 active:bg-white/5"
              }`}
            >
              <span className="truncate">{country.country_name}</span>
              <span className="ml-2 shrink-0 rounded-full bg-zinc-800/80 px-2 py-0.5 text-xs text-zinc-400">
                {country.video_count}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
