"use client";

import { useEffect, useMemo, useState } from "react";
import type { MapCity, MapCountry } from "@/lib/supabase/client";

type Props = {
  countries: MapCountry[];
  cities: MapCity[];
  selectedCountryCode?: string;
  selectedCity?: string;
  onSelect: (country: MapCountry, city?: string) => void;
  /** Larger touch targets for mobile sheet */
  mobile?: boolean;
};

export default function LocationPicker({
  countries,
  cities,
  selectedCountryCode,
  selectedCity,
  onSelect,
  mobile = false,
}: Props) {
  const citiesByCountry = useMemo(() => {
    const map = new Map<string, MapCity[]>();
    for (const city of cities) {
      const list = map.get(city.country_code) ?? [];
      list.push(city);
      map.set(city.country_code, list);
    }
    for (const [code, list] of map) {
      map.set(
        code,
        [...list].sort((a, b) => b.video_count - a.video_count || a.city.localeCompare(b.city, "tr")),
      );
    }
    return map;
  }, [cities]);

  const [expandedCode, setExpandedCode] = useState<string | null>(null);

  useEffect(() => {
    if (selectedCountryCode && citiesByCountry.has(selectedCountryCode)) {
      setExpandedCode(selectedCountryCode);
    }
  }, [selectedCountryCode, citiesByCountry]);

  const rowPad = mobile ? "px-4 py-3.5" : "px-3 py-2";
  const textSize = mobile ? "text-base" : "text-sm";

  return (
    <ul className="space-y-0.5">
      {countries.map((country) => {
        const countryCities = citiesByCountry.get(country.country_code) ?? [];
        const hasCities = countryCities.length > 0;
        const isExpanded = expandedCode === country.country_code;
        const isCountrySelected =
          selectedCountryCode === country.country_code && !selectedCity;

        return (
          <li key={country.country_code}>
            <div
              className={`flex items-center gap-1 rounded-xl transition ${
                isCountrySelected ? "bg-orange-500/20" : ""
              }`}
            >
              {hasCities && (
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  aria-label={`${country.country_name} şehirlerini ${isExpanded ? "gizle" : "göster"}`}
                  onClick={() =>
                    setExpandedCode(isExpanded ? null : country.country_code)
                  }
                  className={`shrink-0 rounded-lg text-zinc-400 active:bg-white/10 hover:bg-white/5 ${
                    mobile ? "p-3.5" : "p-2"
                  }`}
                >
                  <Chevron open={isExpanded} />
                </button>
              )}

              <button
                type="button"
                onClick={() => onSelect(country)}
                className={`flex min-w-0 flex-1 items-center justify-between gap-2 rounded-lg text-left transition active:scale-[0.99] ${
                  !hasCities ? rowPad : mobile ? "py-3.5 pr-4" : "py-2 pr-3"
                } ${!hasCities ? "pl-3" : ""} ${
                  isCountrySelected
                    ? "text-orange-200"
                    : "text-zinc-100 active:bg-white/5 hover:bg-white/5"
                } ${textSize}`}
              >
                <span className="min-w-0 flex-1 truncate">{country.country_name}</span>
                <span className="flex shrink-0 items-center gap-1.5">
                  {hasCities && (
                    <span className="hidden text-[10px] text-sky-400/80 sm:inline">
                      {countryCities.length} şehir
                    </span>
                  )}
                  <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                    {country.video_count}
                  </span>
                </span>
              </button>
            </div>

            {hasCities && isExpanded && (
              <ul className={`mt-0.5 space-y-0.5 border-l border-sky-500/20 ${mobile ? "ml-5" : "ml-4"}`}>
                {countryCities.map((city) => {
                  const isCitySelected =
                    selectedCountryCode === country.country_code &&
                    selectedCity === city.city;

                  return (
                    <li key={`${city.country_code}-${city.city}`}>
                      <button
                        type="button"
                        onClick={() => onSelect(country, city.city)}
                        className={`flex w-full items-center justify-between gap-2 rounded-lg text-left transition active:scale-[0.99] ${
                          mobile ? "py-3 pl-4 pr-4 text-sm" : "py-1.5 pl-3 pr-2 text-xs"
                        } ${
                          isCitySelected
                            ? "bg-sky-500/20 text-sky-200"
                            : "text-zinc-300 active:bg-white/5 hover:bg-white/5"
                        }`}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                          <span className="truncate">{city.city}</span>
                        </span>
                        <span className="shrink-0 text-zinc-500">{city.video_count}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={`transition-transform ${open ? "rotate-90" : ""}`}
      aria-hidden
    >
      <path
        d="M6 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
