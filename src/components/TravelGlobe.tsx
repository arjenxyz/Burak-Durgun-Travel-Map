"use client";

import { useEffect, useRef, useState } from "react";
import type { MapCity, MapCountry, MapStats } from "@/lib/supabase/client";
import type { GlobeInstance } from "globe.gl";

type MapData = {
  stats: MapStats;
  countries: MapCountry[];
  cities: MapCity[];
};

type GlobePoint = {
  lat: number;
  lng: number;
  size: number;
  color: string;
  label: string;
  type: "country" | "city";
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
  const [selected, setSelected] = useState<MapCountry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globeError, setGlobeError] = useState<string | null>(null);

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
    if (!data || !containerRef.current) return;

    let mounted = true;

    async function initGlobe() {
      try {
        const GlobeModule = await import("globe.gl");
        const Globe = GlobeModule.default;

        const container = containerRef.current;
        if (!mounted || !container) return;

        container.innerHTML = "";

        const countryPoints: GlobePoint[] = data!.countries.map((c) => ({
          lat: c.lat,
          lng: c.lng,
          size: 0.5 + Math.min(c.video_count * 0.12, 1.5),
          color: "#f97316",
          label: `${c.country_name} · ${c.video_count} video`,
          type: "country" as const,
          countryCode: c.country_code,
        }));

        const cityPoints: GlobePoint[] = data!.cities.map((c) => ({
          lat: c.lat,
          lng: c.lng,
          size: 0.35 + Math.min(c.video_count * 0.08, 1),
          color: "#38bdf8",
          label: `${c.city}, ${c.country_name} · ${c.video_count} video`,
          type: "city" as const,
          countryCode: c.country_code,
        }));

        const points = [...countryPoints, ...cityPoints];

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
          .pointAltitude(0.02)
          .pointRadius((d) => (d as GlobePoint).size * 0.35)
          .pointColor("color")
          .pointLabel("label")
          .onPointClick((point: object) => {
            const p = point as GlobePoint;
            const country = data!.countries.find((c) => c.country_code === p.countryCode);
            if (country) setSelected(country);
          })
          .width(container.clientWidth)
          .height(container.clientHeight);

        globe.controls().autoRotate = true;
        globe.controls().autoRotateSpeed = 0.5;
        globe.controls().enableZoom = true;
        globeRef.current = globe;

        const handleResize = () => {
          if (!globeRef.current || !containerRef.current) return;
          globeRef.current
            .width(containerRef.current.clientWidth)
            .height(containerRef.current.clientHeight);
        };

        window.addEventListener("resize", handleResize);
        return () => {
          window.removeEventListener("resize", handleResize);
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
          Vercel env değişkenlerini ve Supabase migration SQL dosyasını kontrol edin.
        </p>
      </div>
    );
  }

  const isEmpty = (data?.stats.totalCountries ?? 0) === 0;

  return (
    <div className="relative h-full w-full min-h-[400px]">
      <div ref={containerRef} className="absolute inset-0" />

      {globeError && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/90">
          <p className="text-red-400">{globeError}</p>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-zinc-950/40" />

      <header className="absolute left-0 right-0 top-0 z-10 p-6">
        <div className="mx-auto flex max-w-6xl items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-orange-400">Burak Durgun</p>
            <h1 className="mt-1 text-2xl font-semibold text-white md:text-3xl">Seyahat Haritası</h1>
            <p className="mt-2 max-w-xl text-sm text-zinc-300">
              YouTube video başlıklarından otomatik çıkarılan ülke ve şehirler
            </p>
          </div>

          {data && (
            <div className="grid grid-cols-3 gap-3 rounded-2xl border border-white/10 bg-zinc-950/70 px-4 py-3 text-center backdrop-blur">
              <Stat label="Ülke" value={data.stats.totalCountries} />
              <Stat label="Şehir" value={data.stats.totalCities} />
              <Stat label="Video" value={data.stats.totalVideos} />
            </div>
          )}
        </div>
      </header>

      {isEmpty && (
        <div className="absolute left-1/2 top-1/2 z-20 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-6">
          <div className="rounded-2xl border border-orange-500/30 bg-zinc-950/90 p-6 text-center backdrop-blur">
            <p className="text-lg font-medium text-white">Henüz konum verisi yok</p>
            <p className="mt-2 text-sm text-zinc-400">
              {data?.stats.totalVideos
                ? `${data.stats.totalVideos} video var ama konum çıkarılamamış. Sync tekrar çalıştırın.`
                : "Önce YouTube sync çalıştırılmalı."}
            </p>
            <p className="mt-3 text-xs text-zinc-500">
              Yerelde: <code className="text-orange-300">npm run sync</code>
              <br />
              Canlıda: <code className="text-orange-300">/api/sync?secret=...</code>
            </p>
          </div>
        </div>
      )}

      {selected && (
        <aside className="absolute bottom-6 left-6 z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-950/85 p-5 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-orange-400">Seçili ülke</p>
              <h2 className="mt-1 text-xl font-semibold text-white">{selected.country_name}</h2>
              <p className="mt-1 text-sm text-zinc-400">
                {selected.video_count} video · {selected.city_count} şehir
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="rounded-lg px-2 py-1 text-sm text-zinc-400 hover:bg-white/5 hover:text-white"
            >
              ✕
            </button>
          </div>

          <a
            href={`https://www.youtube.com/@BurakDurgun/search?query=${encodeURIComponent(selected.country_name)}`}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-400"
          >
            YouTube&apos;da videoları gör
          </a>
        </aside>
      )}

      <div className="absolute bottom-6 right-6 z-10 rounded-xl border border-white/10 bg-zinc-950/70 px-4 py-3 text-xs text-zinc-300 backdrop-blur">
        <p>
          <span className="inline-block h-2 w-2 rounded-full bg-orange-500" /> Ülke
        </p>
        <p className="mt-1">
          <span className="inline-block h-2 w-2 rounded-full bg-sky-400" /> Şehir
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-lg font-semibold text-white">{value}</p>
      <p className="text-xs text-zinc-400">{label}</p>
    </div>
  );
}
