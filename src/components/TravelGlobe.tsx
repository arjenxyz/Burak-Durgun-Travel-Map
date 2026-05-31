"use client";

import { useEffect, useRef, useState } from "react";
import type { MapCity, MapCountry, MapStats } from "@/lib/supabase/client";

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

export default function TravelGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<unknown>(null);
  const [data, setData] = useState<MapData | null>(null);
  const [selected, setSelected] = useState<MapCountry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/map")
      .then(async (res) => {
        if (!res.ok) throw new Error("Harita verisi yüklenemedi");
        return res.json() as Promise<MapData>;
      })
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!data || !containerRef.current) return;

    let mounted = true;

    async function initGlobe() {
      const Globe = (await import("globe.gl")).default;

      const container = containerRef.current;
      if (!mounted || !container) return;

      const countryPoints: GlobePoint[] = data!.countries.map((c) => ({
        lat: c.lat,
        lng: c.lng,
        size: 0.35 + Math.min(c.video_count * 0.08, 1.2),
        color: "#f97316",
        label: `${c.country_name} · ${c.video_count} video`,
        type: "country" as const,
        countryCode: c.country_code,
      }));

      const cityPoints: GlobePoint[] = data!.cities.map((c) => ({
        lat: c.lat,
        lng: c.lng,
        size: 0.2 + Math.min(c.video_count * 0.05, 0.8),
        color: "#38bdf8",
        label: `${c.city}, ${c.country_name} · ${c.video_count} video`,
        type: "city" as const,
        countryCode: c.country_code,
      }));

      const points = [...countryPoints, ...cityPoints];

      const globe = Globe(container)
        .globeImageUrl("//unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
        .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
        .backgroundImageUrl("//unpkg.com/three-globe/example/img/night-sky.png")
        .pointsData(points)
        .pointAltitude("size")
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
      globe.controls().autoRotateSpeed = 0.4;
      globeRef.current = globe;

      const handleResize = () => {
        if (!globeRef.current) return;
        const g = globeRef.current as ReturnType<typeof Globe>;
        g.width(container.clientWidth);
        g.height(container.clientHeight);
      };

      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
        container.innerHTML = "";
      };
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
          Supabase bağlantısını ve migration SQL dosyasını çalıştırdığınızdan emin olun.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />

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
        <p><span className="inline-block h-2 w-2 rounded-full bg-orange-500" /> Ülke</p>
        <p className="mt-1"><span className="inline-block h-2 w-2 rounded-full bg-sky-400" /> Şehir</p>
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
