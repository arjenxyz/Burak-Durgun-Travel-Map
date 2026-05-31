"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { MapCountry, CountryVideo } from "@/lib/supabase/client";

type Props = {
  country: MapCountry;
  onClose: () => void;
  variant?: "sheet" | "sidebar";
};

export default function VideoPanel({ country, onClose, variant = "sheet" }: Props) {
  const [videos, setVideos] = useState<CountryVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isSidebar = variant === "sidebar";

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`/api/countries/${country.country_code}/videos`)
      .then(async (res) => {
        const json = (await res.json()) as { videos?: CountryVideo[]; error?: string };
        if (!res.ok) throw new Error(json.error ?? "Videolar yüklenemedi");
        return json.videos ?? [];
      })
      .then(setVideos)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [country.country_code]);

  return (
    <aside
      className={
        isSidebar
          ? "flex h-full min-h-0 w-full flex-col"
          : "fixed inset-x-0 bottom-0 z-40 flex max-h-[min(75dvh,640px)] flex-col border-t border-white/10 bg-zinc-950/98 backdrop-blur-md safe-bottom"
      }
    >
      {!isSidebar && (
        <div className="flex shrink-0 items-center justify-center py-2">
          <span className="h-1 w-10 rounded-full bg-zinc-600" />
        </div>
      )}

      <div
        className={`flex shrink-0 items-start justify-between gap-3 border-b border-white/10 ${
          isSidebar ? "px-4 py-4" : "px-4 pb-3 pt-1"
        }`}
      >
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-wider text-orange-400">Ülke</p>
          <h2 className="truncate text-base font-semibold text-white">{country.country_name}</h2>
          <p className="mt-0.5 text-sm text-zinc-400">
            {loading ? "Yükleniyor..." : `${videos.length} video`}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-white/5 active:bg-white/10"
          aria-label="Kapat"
        >
          ✕
        </button>
      </div>

      <div className="panel-scroll flex-1 overflow-y-auto overscroll-contain p-2 md:p-3">
        {error && <p className="px-2 py-4 text-center text-sm text-red-400">{error}</p>}

        {!error && !loading && videos.length === 0 && (
          <p className="px-2 py-8 text-center text-sm text-zinc-500">
            Bu ülke için henüz video yok.
          </p>
        )}

        <ul className="space-y-1.5">
          {videos.map((video) => (
            <li key={video.id}>
              <a
                href={video.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex gap-3 rounded-xl border border-transparent p-2.5 transition hover:border-white/10 hover:bg-white/5 active:bg-white/5"
              >
                <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-zinc-800 md:h-16 md:w-28">
                  {video.thumbnail_url ? (
                    <Image
                      src={video.thumbnail_url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 96px, 112px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-zinc-500">
                      Video
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 py-0.5">
                  <p className="line-clamp-2 text-sm font-medium leading-snug text-white group-hover:text-orange-300">
                    {video.title}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">{formatDate(video.published_at)}</p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}
