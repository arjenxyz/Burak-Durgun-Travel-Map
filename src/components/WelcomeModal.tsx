"use client";

import { useEffect, useState } from "react";
import { YOUTUBE_CHANNEL_URL, YoutubeIcon } from "@/components/YoutubeChannelLink";

const STORAGE_KEY = "burak-travel-map-welcome-seen";

const ROUTES = [
  { d: "M 48 88 Q 120 42 192 58", delay: "0s" },
  { d: "M 192 58 Q 240 72 272 96", delay: "0.35s" },
  { d: "M 48 88 Q 100 110 160 102", delay: "0.7s" },
];

const PINS = [
  { cx: 48, cy: 88, delay: "0s" },
  { cx: 192, cy: 58, delay: "0.2s" },
  { cx: 272, cy: 96, delay: "0.5s" },
  { cx: 160, cy: 102, delay: "0.8s" },
  { cx: 118, cy: 68, delay: "1.1s" },
];

export default function WelcomeModal() {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") return;
      setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    setClosing(true);
    window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* private browsing */
      }
      setVisible(false);
      setClosing(false);
    }, 280);
  }

  if (!visible) return null;

  return (
    <div
      className={`welcome-overlay fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-5 ${
        closing ? "welcome-overlay-out" : "welcome-overlay-in"
      }`}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
        onClick={dismiss}
        aria-label="Kapat"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        className={`welcome-modal relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl safe-bottom ${
          closing ? "welcome-modal-out" : "welcome-modal-in"
        }`}
      >
        <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-zinc-900/80 to-zinc-950 px-5 pb-5 pt-6 sm:px-6">
          <div className="welcome-globe-visual pointer-events-none relative mx-auto h-32 w-full max-w-[280px]">
            <div className="welcome-globe-sphere absolute left-1/2 top-[58%] h-[7.5rem] w-[7.5rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_32%_28%,#1e3a5f_0%,#0c1220_45%,#09090b_100%)] shadow-[inset_-8px_-12px_24px_rgba(0,0,0,0.5),0_0_40px_rgba(59,130,246,0.12)] ring-1 ring-white/10" />
            <div className="welcome-globe-atmosphere absolute left-1/2 top-[58%] h-[8.5rem] w-[8.5rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-indigo-500/20" />
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 280 128"
              fill="none"
              aria-hidden
            >
              {ROUTES.map((route) => (
                <path
                  key={route.d}
                  d={route.d}
                  className="welcome-route"
                  style={{ animationDelay: route.delay }}
                />
              ))}
              {PINS.map((pin) => (
                <g key={`${pin.cx}-${pin.cy}`}>
                  <circle
                    cx={pin.cx}
                    cy={pin.cy}
                    r="10"
                    className="welcome-pin-ring"
                    style={{ animationDelay: pin.delay }}
                  />
                  <circle
                    cx={pin.cx}
                    cy={pin.cy}
                    r="3.5"
                    className="welcome-pin"
                    style={{ animationDelay: pin.delay }}
                  />
                </g>
              ))}
            </svg>
          </div>

          <div className="relative mt-2 text-center">
            <p className="text-[11px] uppercase tracking-[0.18em] text-orange-400">Burak Durgun</p>
            <h2 id="welcome-title" className="mt-1.5 text-xl font-semibold text-white sm:text-2xl">
              Dünyayı videolarla gez
            </h2>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-zinc-400">
              Kanaldaki her ülke bu haritada bir durak. Rotayı seç, videolarla yola çık.
            </p>
          </div>
        </div>

        <div className="space-y-3 px-5 py-5 sm:px-6">
          <WelcomeStep
            index={1}
            title="Haritada dolaş"
            text="Küreyi çevir, turuncu noktalar Burak'ın gittiği ülkeler."
          />
          <WelcomeStep
            index={2}
            title="Ülke seç, izle"
            text="Bir ülkeye dokun — o destinasyondaki tüm videolar açılır."
          />
          <WelcomeStep
            index={3}
            title="Liste ve kanal"
            text="Sağ üstten ülke listesine ulaşabilir veya YouTube'dan takip edebilirsin."
          />
        </div>

        <div className="flex flex-col gap-2.5 border-t border-white/10 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={dismiss}
            className="w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 active:scale-[0.99]"
          >
            Haritaya başla
          </button>
          <a
            href={YOUTUBE_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2 text-sm text-zinc-400 transition hover:text-zinc-200"
          >
            <span className="text-red-500">
              <YoutubeIcon size={16} />
            </span>
            YouTube kanalı
          </a>
        </div>
      </div>
    </div>
  );
}

function WelcomeStep({
  index,
  title,
  text,
}: {
  index: number;
  title: string;
  text: string;
}) {
  return (
    <div
      className="welcome-step flex gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-3.5 py-3"
      style={{ animationDelay: `${0.15 + index * 0.1}s` }}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-xs font-semibold text-orange-400 ring-1 ring-orange-500/25">
        {index}
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="text-sm font-medium text-zinc-200">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-zinc-500 sm:text-sm">{text}</p>
      </div>
    </div>
  );
}
