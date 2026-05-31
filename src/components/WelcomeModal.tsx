"use client";

import { useEffect, useState } from "react";
import { YOUTUBE_CHANNEL_URL, YoutubeIcon } from "@/components/YoutubeChannelLink";

const STORAGE_KEY = "burak-travel-map-welcome-seen";

const GLOBE = { cx: 120, cy: 76, r: 46 };

const PINS = [
  { angle: -128, delay: "0s" },
  { angle: -42, delay: "0.15s" },
  { angle: 18, delay: "0.3s" },
  { angle: 72, delay: "0.45s" },
  { angle: 138, delay: "0.6s" },
];

function pinPoint(angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: GLOBE.cx + GLOBE.r * Math.cos(rad),
    y: GLOBE.cy + GLOBE.r * Math.sin(rad),
  };
}

const PIN_POINTS = PINS.map((p) => ({ ...pinPoint(p.angle), delay: p.delay }));

const ROUTES = [
  { from: 0, to: 1, delay: "0.1s" },
  { from: 1, to: 2, delay: "0.35s" },
  { from: 2, to: 3, delay: "0.55s" },
  { from: 3, to: 4, delay: "0.75s" },
  { from: 4, to: 0, delay: "0.95s" },
];

function routePath(fromIdx: number, toIdx: number) {
  const a = PIN_POINTS[fromIdx];
  const b = PIN_POINTS[toIdx];
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = mx - GLOBE.cx;
  const dy = my - GLOBE.cy;
  const len = Math.hypot(dx, dy) || 1;
  const pull = 0.35;
  const qx = mx - (dx / len) * GLOBE.r * pull;
  const qy = my - (dy / len) * GLOBE.r * pull;
  return `M ${a.x} ${a.y} Q ${qx} ${qy} ${b.x} ${b.y}`;
}

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

  useEffect(() => {
    if (visible) {
      document.body.classList.add("welcome-modal-open");
    } else {
      document.body.classList.remove("welcome-modal-open");
    }
    return () => document.body.classList.remove("welcome-modal-open");
  }, [visible]);

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
        className="welcome-backdrop absolute inset-0"
        onClick={dismiss}
        aria-label="Kapat"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        className={`welcome-modal relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/95 shadow-2xl safe-bottom sm:max-w-md ${
          closing ? "welcome-modal-out" : "welcome-modal-in"
        }`}
      >
        <div className="relative border-b border-white/10 px-5 pb-4 pt-5 sm:px-6 sm:pb-5 sm:pt-6">
          <div className="welcome-globe-visual pointer-events-none mx-auto w-full max-w-[240px]">
            <svg viewBox="0 0 240 152" className="h-auto w-full" fill="none" aria-hidden>
              <defs>
                <radialGradient id="welcomeGlobeGrad" cx="36%" cy="32%" r="68%">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.45" />
                  <stop offset="45%" stopColor="#0f172a" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#09090b" />
                </radialGradient>
                <filter id="welcomeGlobeGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <circle
                cx={GLOBE.cx}
                cy={GLOBE.cy}
                r={GLOBE.r + 5}
                stroke="rgba(99,102,241,0.22)"
                strokeWidth="1"
                className="welcome-globe-atmosphere-ring"
              />

              <circle
                cx={GLOBE.cx}
                cy={GLOBE.cy}
                r={GLOBE.r}
                fill="url(#welcomeGlobeGrad)"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="1"
                className="welcome-globe-sphere-svg"
                filter="url(#welcomeGlobeGlow)"
              />

              {ROUTES.map((route) => (
                <path
                  key={`${route.from}-${route.to}`}
                  d={routePath(route.from, route.to)}
                  className="welcome-route"
                  style={{ animationDelay: route.delay }}
                />
              ))}

              {PIN_POINTS.map((pin, i) => (
                <g key={i}>
                  <circle
                    cx={pin.x}
                    cy={pin.y}
                    r="9"
                    className="welcome-pin-ring"
                    style={{ animationDelay: pin.delay }}
                  />
                  <circle
                    cx={pin.x}
                    cy={pin.y}
                    r="3.25"
                    className="welcome-pin"
                    style={{ animationDelay: pin.delay }}
                  />
                </g>
              ))}
            </svg>
          </div>

          <div className="relative -mt-1 text-center">
            <p className="text-[11px] uppercase tracking-[0.18em] text-orange-400">Burak Durgun</p>
            <h2 id="welcome-title" className="mt-2 text-lg font-semibold leading-snug text-white sm:text-xl">
              Gezdiğim dünyayı seninle paylaşıyorum
            </h2>
            <p className="mx-auto mt-3 max-w-[18rem] text-sm leading-relaxed text-zinc-400">
              Yıllardır kamerayla dolaştığım ülkeleri bu haritaya işledim. Bir noktaya dokun —
              o yolculuğun videolarını birlikte izleyelim.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 px-5 py-4 sm:px-6">
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
            className="flex items-center justify-center gap-2 py-2 text-sm text-zinc-500 transition hover:text-zinc-300"
          >
            <span className="text-red-500">
              <YoutubeIcon size={16} />
            </span>
            YouTube kanalıma git
          </a>
        </div>
      </div>
    </div>
  );
}
