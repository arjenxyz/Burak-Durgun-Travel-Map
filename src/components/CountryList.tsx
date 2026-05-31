"use client";

import type { MapCountry } from "@/lib/supabase/client";

type Props = {
  countries: MapCountry[];
  selectedCode?: string;
  onSelect: (country: MapCountry) => void;
};

export default function CountryList({ countries, selectedCode, onSelect }: Props) {
  if (countries.length === 0) return null;

  return (
    <aside className="absolute left-4 top-28 z-10 hidden max-h-[calc(100vh-10rem)] w-56 flex-col rounded-2xl border border-white/10 bg-zinc-950/85 backdrop-blur md:flex">
      <div className="border-b border-white/10 px-4 py-3">
        <p className="text-xs uppercase tracking-wider text-orange-400">Ülkeler</p>
        <p className="text-sm text-zinc-400">{countries.length} ülke</p>
      </div>
      <ul className="flex-1 overflow-y-auto p-2">
        {countries.map((country) => (
          <li key={country.country_code}>
            <button
              type="button"
              onClick={() => onSelect(country)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                selectedCode === country.country_code
                  ? "bg-orange-500/20 text-orange-200"
                  : "text-zinc-200 hover:bg-white/5"
              }`}
            >
              <span className="truncate">{country.country_name}</span>
              <span className="ml-2 shrink-0 text-xs text-zinc-500">{country.video_count}</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
