"use client";

import { useEffect, useState } from "react";
import { YOUTUBE_CHANNEL_URL, YoutubeIcon } from "@/components/YoutubeChannelLink";

const STORAGE_KEY = "burak-travel-map-welcome-seen";

export default function WelcomeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") return;
      setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* private browsing */
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={dismiss}
        aria-label="Kapat"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        className="floating-panel relative flex max-h-[min(90dvh,560px)] w-full max-w-lg flex-col overflow-hidden safe-bottom"
      >
        <div className="border-b border-white/10 px-5 py-4 sm:px-6 sm:py-5">
          <p className="text-xs uppercase tracking-[0.14em] text-orange-400">Burak Durgun</p>
          <h2 id="welcome-title" className="mt-1 text-lg font-semibold text-white sm:text-xl">
            Seyahat Haritasına hoş geldin
          </h2>
        </div>

        <div className="panel-scroll flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
          <p className="text-sm leading-relaxed text-zinc-300 sm:text-[15px]">
            Burak Durgun&apos;un YouTube kanalındaki geziler bu haritada toplanıyor. Gittiği
            ülkeleri keşfedebilir, her ülkeye ait videolara doğrudan ulaşabilirsin.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-[15px]">
            Haritadaki turuncu noktalara tıkla veya sağ üstteki ülke sayısından listeyi aç.
            Bir ülke seçtiğinde o destinasyona ait tüm videolar karşına çıkar — sanki Burak&apos;la
            birlikte o rotayı baştan sona izliyormuşsun gibi.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500 sm:text-[15px]">
            Harita, kanaldaki oynatma listeleri ve videolardan otomatik güncellenir. Yeni bir ülke
            videosu geldikçe burada da görünür.
          </p>

          <a
            href={YOUTUBE_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-orange-400 transition hover:text-orange-300"
          >
            <span className="text-red-500">
              <YoutubeIcon size={18} />
            </span>
            YouTube kanalına git
          </a>
        </div>

        <div className="border-t border-white/10 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={dismiss}
            className="w-full rounded-xl bg-orange-500 py-3 text-sm font-medium text-white transition hover:bg-orange-400 active:bg-orange-400"
          >
            Haritayı keşfet
          </button>
        </div>
      </div>
    </div>
  );
}
