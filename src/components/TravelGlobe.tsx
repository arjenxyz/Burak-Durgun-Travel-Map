"use client";

import { useEffect, useRef, useState } from "react";
import type { MapCity, MapCountry, MapStats } from "@/lib/supabase/client";
import type { GlobeInstance } from "globe.gl";
import CountryList from "@/components/CountryList";
import VideoPanel from "@/components/VideoPanel";

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
  cityName?: string;
};

type Selection = {
  country: MapCountry;
  city?: string;
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
  const [selection, setSelection] = useState<Selection | null>(null);
  const [autoRotate, setAutoRotate] = useState(false);
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
    const controls = globeRef.current?.controls();
    if (controls) controls.autoRotate = autoRotate;
  }, [autoRotate]);

  function focusOnPoint(point: GlobePoint) {
    const globe = globeRef.current;
    if (!globe) return;
    globe.controls().autoRotate = false;
    setAutoRotate(false);
    globe.pointOfView({ lat: point.lat, lng: point.lng, altitude: 1.6 }, 800);
  }

  function selectCountry(country: MapCountry, city?: string) {
    setSelection({ country, city });
    const cityRow = city
      ? data?.cities.find((c) => c.country_code === country.country_code && c.city === city)
      : undefined;
    focusOnPoint({
      lat: cityRow?.lat ?? country.lat,
      lng: cityRow?.lng ?? country.lng,
    } as GlobePoint);
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

        const countryPoints: GlobePoint[] = data!.countries.map((c) => ({
          lat: c.lat,
          lng: c.lng,
          size: 0.55 + Math.min(c.video_count * 0.1, 1.2),
          color: "#f97316",
          label: `${c.country_name} · ${c.video_count} video`,
          type: "country" as const,
          countryCode: c.country_code,
        }));

        const cityPoints: GlobePoint[] = data!.cities.map((c) => ({
          lat: c.lat,
          lng: c.lng,
          size: 0.4 + Math.min(c.video_count * 0.06, 0.9),
          color: "#38bdf8",
          label: `${c.city}, ${c.country_name} · ${c.video_count} video`,
          type: "city" as const,
          countryCode: c.country_code,
          cityName: c.city,
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
          .pointAltitude(0.03)
          .pointRadius((d) => (d as GlobePoint).size * 0.45)
          .pointColor("color")
          .pointLabel("label")
          .onPointClick((point: object) => {
            const p = point as GlobePoint;
            const country = data!.countries.find((c) => c.country_code === p.countryCode);
            if (!country) return;
            focusOnPoint(p);
            setSelection({
              country,
              city: p.type === "city" ? p.cityName : undefined,
            });
          })
          .width(container.clientWidth)
          .height(container.clientHeight);

        const controls = globe.controls();
        controls.autoRotate = false;
        controls.enableZoom = true;
        controls.rotateSpeed = 0.35;
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
              Başlık odaklı konum tespiti — trend hashtag&apos;ler filtrelenir
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

      {data && data.countries.length > 0 && (
        <CountryList
          countries={data.countries}
          selectedCode={selection?.country.country_code}
          onSelect={(country) => selectCountry(country)}
        />
      )}

      <div className="absolute right-4 top-28 z-10 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setAutoRotate((v) => !v)}
          className="rounded-xl border border-white/10 bg-zinc-950/80 px-3 py-2 text-xs text-zinc-200 backdrop-blur hover:bg-white/5"
        >
          {autoRotate ? "Döndürmeyi durdur" : "Küreyi döndür"}
        </button>
      </div>

      {isEmpty && (
        <div className="absolute left-1/2 top-1/2 z-20 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-6">
          <div className="rounded-2xl border border-orange-500/30 bg-zinc-950/90 p-6 text-center backdrop-blur">
            <p className="text-lg font-medium text-white">Henüz konum verisi yok</p>
            <p className="mt-2 text-sm text-zinc-400">
              Sync çalıştırın veya reparse ile yeniden parse edin.
            </p>
          </div>
        </div>
      )}

      {selection && <VideoPanel selection={selection} onClose={() => setSelection(null)} />}

      <div className="absolute bottom-6 right-6 z-10 rounded-xl border border-white/10 bg-zinc-950/70 px-4 py-3 text-xs text-zinc-300 backdrop-blur">
        <p>
          <span className="inline-block h-2 w-2 rounded-full bg-orange-500" /> Ülke
        </p>
        <p className="mt-1">
          <span className="inline-block h-2 w-2 rounded-full bg-sky-400" /> Şehir
        </p>
        <p className="mt-2 text-zinc-500">Sol listeden veya pin&apos;e tıkla</p>
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
