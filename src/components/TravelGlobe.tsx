"use client";

import { useEffect, useRef, useState } from "react";
import type { MapCountry, MapStats } from "@/lib/supabase/client";
import type { GlobeInstance } from "globe.gl";
import CountryList from "@/components/CountryList";
import MobileCountrySheet from "@/components/MobileCountrySheet";
import VideoPanel from "@/components/VideoPanel";
import { YOUTUBE_CHANNEL_URL, YoutubeIcon } from "@/components/YoutubeChannelLink";

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
  const [countryListOpen, setCountryListOpen] = useState(false);
  const [countrySheetOpen, setCountrySheetOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globeError, setGlobeError] = useState<string | null>(null);

  function toggleCountryList() {
    if (window.matchMedia("(min-width: 768px)").matches) {
      setCountryListOpen((open) => !open);
    } else {
      setCountrySheetOpen((open) => !open);
    }
  }

  function closeCountryList() {
    setCountryListOpen(false);
    setCountrySheetOpen(false);
  }

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

  function focusOnCountry(country: MapCountry) {
    const globe = globeRef.current;
    if (!globe) return;
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

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !globeRef.current) return;

    const resizeGlobe = () => {
      if (!globeRef.current || !containerRef.current) return;
      globeRef.current
        .width(containerRef.current.clientWidth)
        .height(containerRef.current.clientHeight);
    };

    resizeGlobe();
    const observer = new ResizeObserver(resizeGlobe);
    observer.observe(container);
    return () => observer.disconnect();
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
  const listOpen = countryListOpen || countrySheetOpen;

  return (
    <div className="relative flex h-full flex-col">
      <header className="relative z-20 shrink-0 border-b border-white/5 bg-zinc-950/80 px-3 py-2.5 backdrop-blur-md md:px-6 md:py-3">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-2 md:gap-3">
          <div className="flex min-w-0 flex-1 flex-col-reverse">
            <h1 className="mt-0.5 truncate text-xs font-normal tracking-wide text-zinc-500 md:text-sm">
              Seyahat Haritası
            </h1>
            <a
              href={YOUTUBE_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 transition hover:opacity-90 active:scale-[0.99] md:gap-2"
              aria-label="Burak Durgun YouTube kanalı"
            >
              <span className="shrink-0 text-red-500 [&_svg]:h-4 [&_svg]:w-4 md:[&_svg]:h-[18px] md:[&_svg]:w-[18px]">
                <YoutubeIcon size={16} />
              </span>
              <span className="truncate text-sm font-semibold uppercase tracking-[0.14em] text-orange-400 md:text-[15px]">
                Burak Durgun
              </span>
            </a>
          </div>

          {data && data.stats.totalCountries > 0 && (
            <CountryCountButton
              count={data.stats.totalCountries}
              open={listOpen}
              onClick={toggleCountryList}
            />
          )}
        </div>
      </header>

      <div className="relative min-h-0 flex-1">
        <div ref={containerRef} className="absolute inset-0 touch-none" />

        {globeError && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/90">
            <p className="text-red-400">{globeError}</p>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(9,9,11,0.12)_55%,rgba(9,9,11,0.45)_100%)]" />

        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <div className="max-w-md rounded-2xl border border-orange-500/30 bg-zinc-950/90 p-5 text-center backdrop-blur">
              <p className="text-lg font-medium text-white">Henüz konum verisi yok</p>
              <p className="mt-2 text-sm text-zinc-400">Sync çalıştırın.</p>
            </div>
          </div>
        )}

        {data && data.countries.length > 0 && countryListOpen && (
          <div className="floating-panel panel-enter-left absolute bottom-3 left-3 top-3 z-30 hidden w-72 overflow-hidden md:flex lg:bottom-4 lg:left-4 lg:top-4 lg:w-80">
            <CountryList
              countries={data.countries}
              selectedCode={selection?.country_code}
              onSelect={selectCountry}
              onClose={closeCountryList}
              className="w-full"
            />
          </div>
        )}

        {selection && (
          <div className="floating-panel panel-enter-right absolute bottom-3 right-3 top-3 z-30 hidden w-[min(100%,20rem)] overflow-hidden md:flex lg:bottom-4 lg:right-4 lg:top-4 lg:w-96">
            <VideoPanel
              country={selection}
              onClose={() => setSelection(null)}
              variant="sidebar"
            />
          </div>
        )}
      </div>

      {data && (
        <MobileCountrySheet
          open={countrySheetOpen}
          countries={data.countries}
          selectedCode={selection?.country_code}
          onClose={closeCountryList}
          onSelect={selectCountry}
        />
      )}

      {selection && (
        <div className="md:hidden">
          <VideoPanel country={selection} onClose={() => setSelection(null)} variant="sheet" />
        </div>
      )}
    </div>
  );
}

function CountryCountButton({
  count,
  open,
  onClick,
}: {
  count: number;
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-label={open ? "Ülke listesini kapat" : "Ülke listesini aç"}
      className={`flex shrink-0 items-center gap-1 rounded-lg border px-2.5 py-1.5 backdrop-blur transition md:px-3 md:py-2 ${
        open
          ? "border-orange-500/40 bg-orange-500/15"
          : "border-white/10 bg-zinc-900/60 hover:border-white/20 hover:bg-zinc-900/80"
      }`}
    >
      <span className="text-sm font-semibold tabular-nums text-white">{count}</span>
      <span className="text-xs text-zinc-400">Ülke</span>
    </button>
  );
}
