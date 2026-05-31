"use client";

import type { MapCity, MapCountry } from "@/lib/supabase/client";
import LocationPicker from "@/components/LocationPicker";

type Props = {
  countries: MapCountry[];
  cities: MapCity[];
  selectedCountryCode?: string;
  selectedCity?: string;
  onSelect: (country: MapCountry, city?: string) => void;
};

export default function CountryList({
  countries,
  cities,
  selectedCountryCode,
  selectedCity,
  onSelect,
}: Props) {
  if (countries.length === 0) return null;

  return (
    <aside className="absolute left-4 top-28 z-10 hidden max-h-[calc(100dvh-10rem)] w-64 flex-col rounded-2xl border border-white/10 bg-zinc-950/85 backdrop-blur md:flex">
      <div className="border-b border-white/10 px-4 py-3">
        <p className="text-xs uppercase tracking-wider text-orange-400">Ülkeler & Şehirler</p>
        <p className="text-sm text-zinc-400">
          {countries.length} ülke · {cities.length} şehir
        </p>
      </div>
      <div className="flex-1 overflow-y-auto overscroll-contain p-2 touch-scroll">
        <LocationPicker
          countries={countries}
          cities={cities}
          selectedCountryCode={selectedCountryCode}
          selectedCity={selectedCity}
          onSelect={onSelect}
        />
      </div>
    </aside>
  );
}
