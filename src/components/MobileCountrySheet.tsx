"use client";

import type { MapCity, MapCountry } from "@/lib/supabase/client";
import LocationPicker from "@/components/LocationPicker";

type Props = {
  open: boolean;
  countries: MapCountry[];
  cities: MapCity[];
  selectedCountryCode?: string;
  selectedCity?: string;
  onClose: () => void;
  onSelect: (country: MapCountry, city?: string) => void;
};

export default function MobileCountrySheet({
  open,
  countries,
  cities,
  selectedCountryCode,
  selectedCity,
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

      <div className="absolute bottom-0 left-0 right-0 flex max-h-[min(75dvh,560px)] flex-col rounded-t-2xl border border-white/10 bg-zinc-950 shadow-2xl safe-bottom">
        <div className="flex shrink-0 items-center justify-center py-2">
          <span className="h-1 w-10 rounded-full bg-zinc-600" />
        </div>

        <div className="flex items-center justify-between border-b border-white/10 px-4 pb-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-orange-400">Ülkeler & Şehirler</p>
            <p className="text-sm text-zinc-400">
              {countries.length} ülke · {cities.length} şehir
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 active:bg-white/5"
          >
            Kapat
          </button>
        </div>

        <p className="shrink-0 px-4 pb-2 text-xs text-zinc-500">
          Ok ile şehirleri aç · mavi pinler haritada
        </p>

        <div className="flex-1 overflow-y-auto overscroll-contain p-2 touch-scroll">
          <LocationPicker
            countries={countries}
            cities={cities}
            selectedCountryCode={selectedCountryCode}
            selectedCity={selectedCity}
            onSelect={(country, city) => {
              onSelect(country, city);
              onClose();
            }}
            mobile
          />
        </div>
      </div>
    </div>
  );
}
