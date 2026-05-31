"use client";

import { useEffect, useRef, useState } from "react";
import type { MapCountry, MapStats } from "@/lib/supabase/client";
import type { GlobeInstance } from "globe.gl";
import CountryList from "@/components/CountryList";
import MobileCountrySheet from "@/components/MobileCountrySheet";
import VideoPanel from "@/components/VideoPanel";
import { YOUTUBE_CHANNEL_URL, YoutubeIcon } from "@/components/YoutubeChannelLink";
import {
  createFlagPinElement,
  updateFlagPinSelection,
  updateFlagPinSizes,
  type GlobeCountryMarker,
} from "@/lib/globe/country-flag-marker";
import { getCountryFocusAltitude, type FocusZoomSource } from "@/lib/globe/country-focus-altitude";
import {
  getVisitedPolygonCapColor,
  loadVisitedCountryPolygons,
  VISITED_POLYGON_SIDE_COLOR,
  VISITED_POLYGON_STROKE_COLOR,
  type VisitedCountryPolygon,
} from "@/lib/globe/visited-country-polygons";

type MapData = {
  stats: MapStats;
  countries: MapCountry[];
};

const TEXTURES = {
  globe: "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg",
  bump: "https://unpkg.com/three-globe/example/img/earth-topology.png",
  background: "https://unpkg.com/three-globe/example/img/night-sky.png",
};

const FOCUS_ANIMATION_MS = 900;
/** globe.gl başlangıç ~2.5; bundan fazla uzaklaşmayı engelle */
const MAX_GLOBE_ALTITUDE = 2.6;
const GLOBE_RADIUS = 100;

export default function TravelGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeInstance | null>(null);
  const selectionRef = useRef<MapCountry | null>(null);
  const [data, setData] = useState<MapData | null>(null);
  const [selection, setSelection] = useState<MapCountry | null>(null);
  const [countrySheetOpen, setCountrySheetOpen] = useState(false);
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

  function focusOnCountry(country: MapCountry, source: FocusZoomSource = "list") {
    const globe = globeRef.current;
    if (!globe) return;
    globe.pointOfView(
      {
        lat: country.lat,
        lng: country.lng,
        altitude: getCountryFocusAltitude(country.country_code, source),
      },
      FOCUS_ANIMATION_MS,
    );
  }

  function selectCountry(country: MapCountry) {
    selectionRef.current = country;
    setSelection(country);
    focusOnCountry(country, "list");
  }

  useEffect(() => {
    selectionRef.current = selection;
    const globe = globeRef.current;
    if (!globe) return;

    globe.polygonCapColor((feature) =>
      getVisitedPolygonCapColor(
        (feature as VisitedCountryPolygon).properties?.ISO_A2,
        selection?.country_code,
      ),
    );

    if (containerRef.current) {
      updateFlagPinSelection(containerRef.current, selection?.country_code);
    }
  }, [selection]);

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

        const markers: GlobeCountryMarker[] = data!.countries.map((c) => ({
          lat: c.lat,
          lng: c.lng,
          label: `${c.country_name} · ${c.video_count} video`,
          countryCode: c.country_code,
        }));

        const countryByCode = new Map(
          data!.countries.map((country) => [country.country_code, country]),
        );

        const globe = new Globe(container, { animateIn: true })
          .globeImageUrl(TEXTURES.globe)
          .bumpImageUrl(TEXTURES.bump)
          .backgroundImageUrl(TEXTURES.background)
          .showAtmosphere(true)
          .atmosphereColor("#3a228a")
          .atmosphereAltitude(0.15)
          .polygonsData([])
          .polygonCapColor((feature) =>
            getVisitedPolygonCapColor(
              (feature as VisitedCountryPolygon).properties?.ISO_A2,
              selectionRef.current?.country_code,
            ),
          )
          .polygonSideColor(() => VISITED_POLYGON_SIDE_COLOR)
          .polygonStrokeColor(() => VISITED_POLYGON_STROKE_COLOR)
          .polygonAltitude(0.006)
          .polygonLabel((feature) => {
            const code = (feature as VisitedCountryPolygon).properties?.ISO_A2;
            const country = code ? countryByCode.get(code) : undefined;
            return country ? `${country.country_name} · ${country.video_count} video` : "";
          })
          .onPolygonClick((feature: object) => {
            const code = (feature as VisitedCountryPolygon).properties?.ISO_A2;
            const country = code ? countryByCode.get(code) : undefined;
            if (!country) return;
            selectionRef.current = country;
            setSelection(country);
            globe.pointOfView(
              {
                lat: country.lat,
                lng: country.lng,
                altitude: getCountryFocusAltitude(country.country_code, "globe"),
              },
              FOCUS_ANIMATION_MS,
            );
          })
          .htmlElementsData(markers)
          .htmlLat("lat")
          .htmlLng("lng")
          .htmlAltitude(0.015)
          .htmlTransitionDuration(0)
          .htmlElement((d) =>
            createFlagPinElement(d as GlobeCountryMarker, (countryCode) => {
              const country = countryByCode.get(countryCode);
              if (!country) return;
              selectionRef.current = country;
              setSelection(country);
              globe.pointOfView(
                {
                  lat: country.lat,
                  lng: country.lng,
                  altitude: getCountryFocusAltitude(country.country_code, "globe"),
                },
                FOCUS_ANIMATION_MS,
              );
            }),
          )
          .htmlElementVisibilityModifier((el, isVisible) => {
            (el as HTMLElement).style.opacity = isVisible ? "1" : "0.12";
          })
          .onZoom(({ altitude }) => {
            updateFlagPinSizes(container, altitude);
          })
          .width(container.clientWidth)
          .height(container.clientHeight);

        const controls = globe.controls();
        controls.autoRotate = false;
        controls.enableZoom = true;
        controls.rotateSpeed = 0.35;
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
        controls.maxDistance = GLOBE_RADIUS * (1 + MAX_GLOBE_ALTITUDE);
        globeRef.current = globe;

        updateFlagPinSizes(container, globe.pointOfView().altitude);

        loadVisitedCountryPolygons(data!.countries.map((c) => c.country_code))
          .then((polygons) => {
            if (!mounted || globeRef.current !== globe) return;
            globe.polygonsData(polygons);
          })
          .catch(() => {
            /* bayraklar yine görünür; sınır katmanı opsiyonel */
          });

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
  }, [data, selection]);

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
            <>
              <button
                type="button"
                onClick={() => setCountrySheetOpen((open) => !open)}
                aria-expanded={countrySheetOpen}
                className={`flex shrink-0 items-center gap-1 rounded-lg border px-2.5 py-1.5 backdrop-blur transition md:hidden ${
                  countrySheetOpen
                    ? "border-orange-500/40 bg-orange-500/15"
                    : "border-white/10 bg-zinc-900/60"
                }`}
              >
                <span className="text-sm font-semibold tabular-nums text-white">
                  {data.stats.totalCountries}
                </span>
                <span className="text-xs text-zinc-400">Ülke</span>
              </button>
              <div className="hidden shrink-0 items-center gap-1 rounded-lg border border-white/10 bg-zinc-900/60 px-3 py-2 md:flex">
                <span className="text-sm font-semibold tabular-nums text-white">
                  {data.stats.totalCountries}
                </span>
                <span className="text-xs text-zinc-400">Ülke</span>
              </div>
            </>
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

        {data && data.countries.length > 0 && (
          <div className="floating-panel panel-enter-left absolute bottom-3 left-3 top-3 z-30 hidden w-72 overflow-hidden md:flex lg:bottom-4 lg:left-4 lg:top-4 lg:w-80">
            <CountryList
              countries={data.countries}
              selectedCode={selection?.country_code}
              onSelect={selectCountry}
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
          onClose={() => setCountrySheetOpen(false)}
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
