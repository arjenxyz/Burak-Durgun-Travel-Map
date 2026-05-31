"use client";

import { useEffect, useRef, useState } from "react";
import type { MapCountry, MapStats } from "@/lib/supabase/client";
import type { GlobeInstance } from "globe.gl";
import CountryList from "@/components/CountryList";
import MobileCountrySheet from "@/components/MobileCountrySheet";
import VideoPanel from "@/components/VideoPanel";

type MapData = {
  stats: MapStats;
  countries: MapCountry[];
};

type GlobePoint = {
  lat: number;
  lng: number;
  size: number;
  color: string;
  label: string;
  countryCode: string;
};

const TEXTURES = {
  globe: "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg",
  bump: "https://unpkg.com/three-globe/example/img/earth-topology.png",
  background: "https://unpkg.com/three-globe/example/img/night-sky.png",
};

export default function TravelGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeInstance | null>(null);
  const [data, setData] = useState<MapData | null>(null);
  const [selection, setSelection] = useState<MapCountry | null>(null);
  const [countrySheetOpen, setCountrySheetOpen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globeError, setGlobeError] = useState<string | null>(null);

  const panelOpen = selection !== null || countrySheetOpen;

  useEffect(() => {
    fetch("/api/map")
      .then(async (res) => {
        const json = (await res.json()) as MapData & { error?: string };
        if (!res.ok) throw new Error(json.error ?? "Harita verisi yüklenemedi");
        return json;
      })
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const controls = globeRef.current?.controls();
    if (controls) controls.autoRotate = autoRotate;
  }, [autoRotate]);

  function focusOnCountry(country: MapCountry) {
    const globe = globeRef.current;
    if (!globe) return;
    globe.controls().autoRotate = false;
    setAutoRotate(false);
    globe.pointOfView({ lat: country.lat, lng: country.lng, altitude: 1.6 }, 800);
  }

  function selectCountry(country: MapCountry) {
    setSelection(country);
    focusOnCountry(country);
  }

  useEffect(() => {
    if (!data || !containerRef.current) return;

    let mounted = true;

    async function initGlobe() {
      try {
        const GlobeModule = await import("globe.gl");
        const Globe = GlobeModule.default;

        const container = containerRef.current;
        if (!mounted || !container) return;

        container.innerHTML = "";

        const points: GlobePoint[] = data!.countries.map((c) => ({
          lat: c.lat,
          lng: c.lng,
          size: 0.55 + Math.min(c.video_count * 0.1, 1.2),
          color: "#f97316",
          label: `${c.country_name} · ${c.video_count} video`,
          countryCode: c.country_code,
        }));

        const globe = new Globe(container, { animateIn: true })
          .globeImageUrl(TEXTURES.globe)
          .bumpImageUrl(TEXTURES.bump)
          .backgroundImageUrl(TEXTURES.background)
          .showAtmosphere(true)
          .atmosphereColor("#3a228a")
          .atmosphereAltitude(0.15)
          .pointsData(points)
          .pointLat("lat")
          .pointLng("lng")
          .pointAltitude(0.03)
          .pointRadius((d) => (d as GlobePoint).size * 0.5)
          .pointColor("color")
          .pointLabel("label")
          .onPointClick((point: object) => {
            const p = point as GlobePoint;
            const country = data!.countries.find((c) => c.country_code === p.countryCode);
            if (!country) return;
            globe.controls().autoRotate = false;
            setAutoRotate(false);
            globe.pointOfView({ lat: country.lat, lng: country.lng, altitude: 1.6 }, 800);
            setSelection(country);
          })
          .width(container.clientWidth)
          .height(container.clientHeight);

        const controls = globe.controls();
        controls.autoRotate = false;
        controls.enableZoom = true;
        controls.rotateSpeed = 0.35;
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
        globeRef.current = globe;

        const stopRotate = () => {
          controls.autoRotate = false;
          setAutoRotate(false);
        };
        container.addEventListener("mousedown", stopRotate);
        container.addEventListener("touchstart", stopRotate, { passive: true });

        const handleResize = () => {
          if (!globeRef.current || !containerRef.current) return;
          globeRef.current
            .width(containerRef.current.clientWidth)
            .height(containerRef.current.clientHeight);
        };

        window.addEventListener("resize", handleResize);
        return () => {
          window.removeEventListener("resize", handleResize);
          container.removeEventListener("mousedown", stopRotate);
          container.removeEventListener("touchstart", stopRotate);
          globeRef.current?._destructor();
          globeRef.current = null;
          container.innerHTML = "";
        };
      } catch (err) {
        if (mounted) {
          setGlobeError(err instanceof Error ? err.message : "3D harita başlatılamadı");
        }
      }
    }

    const cleanupPromise = initGlobe();

    return () => {
      mounted = false;
      cleanupPromise.then((cleanup) => cleanup?.());
    };
  }, [data]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-zinc-400">
        Harita yükleniyor...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-red-400">{error}</p>
        <p className="max-w-md text-sm text-zinc-500">
          Bağlantını ve Supabase ayarlarını kontrol edin.
        </p>
      </div>
    );
  }

  const isEmpty = (data?.stats.totalCountries ?? 0) === 0;

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="absolute inset-0 touch-none" />

      {globeError && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/90">
          <p className="text-red-400">{globeError}</p>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-zinc-950/50" />

      <header className="absolute left-0 right-0 top-0 z-10 px-3 pt-2 md:p-6">
        <div className="mx-auto flex max-w-6xl items-start justify-between gap-2 md:gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.15em] text-orange-400 md:text-xs md:tracking-[0.2em]">
              Burak Durgun
            </p>
            <h1 className="truncate text-lg font-semibold text-white md:text-3xl">
              Seyahat Haritası
            </h1>
            <p className="mt-0.5 hidden text-sm text-zinc-300 sm:block">
              Gezilen ülkeler ve videolar
            </p>
          </div>

          {data && (
            <div className="grid shrink-0 grid-cols-2 gap-2 rounded-xl border border-white/10 bg-zinc-950/80 px-3 py-2 text-center backdrop-blur md:gap-4 md:rounded-2xl md:px-4 md:py-3">
              <Stat label="Ülke" value={data.stats.totalCountries} />
              <Stat label="Video" value={data.stats.totalVideos} />
            </div>
          )}
        </div>
      </header>

      {data && data.countries.length > 0 && (
        <CountryList
          countries={data.countries}
          selectedCode={selection?.country_code}
          onSelect={selectCountry}
        />
      )}

      <div className="absolute right-4 top-28 z-10 hidden md:flex md:flex-col md:gap-2">
        <button
          type="button"
          onClick={() => setAutoRotate((v) => !v)}
          className="rounded-xl border border-white/10 bg-zinc-950/80 px-3 py-2 text-xs text-zinc-200 backdrop-blur hover:bg-white/5"
        >
          {autoRotate ? "Döndürmeyi durdur" : "Küreyi döndür"}
        </button>
      </div>

      {!panelOpen && data && data.countries.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 flex gap-2 border-t border-white/10 bg-zinc-950/95 px-3 py-2 backdrop-blur-md safe-bottom md:hidden">
          <button
            type="button"
            onClick={() => setCountrySheetOpen(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 text-sm font-medium text-white active:bg-orange-400"
          >
            <span>🌍</span>
            Ülkeler ({data.countries.length})
          </button>
          <button
            type="button"
            onClick={() => setAutoRotate((v) => !v)}
            className="rounded-xl border border-white/10 px-4 py-3.5 text-sm text-zinc-200 active:bg-white/5"
            aria-label={autoRotate ? "Döndürmeyi durdur" : "Küreyi döndür"}
          >
            {autoRotate ? "⏸" : "↻"}
          </button>
        </div>
      )}

      {data && (
        <MobileCountrySheet
          open={countrySheetOpen}
          countries={data.countries}
          selectedCode={selection?.country_code}
          onClose={() => setCountrySheetOpen(false)}
          onSelect={selectCountry}
        />
      )}

      {isEmpty && (
        <div className="absolute left-1/2 top-1/2 z-20 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4">
          <div className="rounded-2xl border border-orange-500/30 bg-zinc-950/90 p-5 text-center backdrop-blur">
            <p className="text-lg font-medium text-white">Henüz konum verisi yok</p>
            <p className="mt-2 text-sm text-zinc-400">Sync çalıştırın.</p>
          </div>
        </div>
      )}

      {selection && <VideoPanel country={selection} onClose={() => setSelection(null)} />}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-[2.5rem] md:min-w-0">
      <p className="text-sm font-semibold text-white md:text-lg">{value}</p>
      <p className="text-[10px] text-zinc-400 md:text-xs">{label}</p>
    </div>
  );
}
