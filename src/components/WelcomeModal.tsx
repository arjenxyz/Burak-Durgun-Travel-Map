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

function WelcomeGlobeIllustration() {
  return (
    <div className="welcome-globe-visual pointer-events-none mx-auto w-full max-w-[220px] sm:max-w-none">
      <svg viewBox="0 0 240 152" className="h-auto w-full" fill="none" aria-hidden>
        <defs>
          <radialGradient id="welcomeGlobeGrad" cx="36%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#0f172a" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#09090b" />
          </radialGradient>
        </defs>
        <circle
          cx={GLOBE.cx}
          cy={GLOBE.cy}
          r={GLOBE.r + 6}
          stroke="rgba(99,102,241,0.18)"
          strokeWidth="1"
        />
        <circle
          cx={GLOBE.cx}
          cy={GLOBE.cy}
          r={GLOBE.r}
          fill="url(#welcomeGlobeGrad)"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
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
              r="8"
              className="welcome-pin-ring"
              style={{ animationDelay: pin.delay }}
            />
            <circle
              cx={pin.x}
              cy={pin.y}
              r="3"
              className="welcome-pin"
              style={{ animationDelay: pin.delay }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
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
      className={`welcome-overlay fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6 ${
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
        className={`welcome-modal-card relative z-10 w-full max-w-[22rem] overflow-hidden safe-bottom sm:max-w-xl ${
          closing ? "welcome-modal-out" : "welcome-modal-in"
        }`}
      >
        <div className="welcome-modal-accent" />

        <button
          type="button"
          onClick={dismiss}
          className="absolute right-3 top-3 z-10 rounded-lg p-1.5 text-zinc-500 transition hover:bg-white/5 hover:text-zinc-300 sm:right-4 sm:top-4"
          aria-label="Kapat"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>

        <div className="welcome-hero-bg grid sm:grid-cols-[9.5rem_1fr] sm:items-center sm:gap-0">
          <div className="flex items-center justify-center px-6 pb-2 pt-8 sm:px-4 sm:py-8">
            <WelcomeGlobeIllustration />
          </div>

          <div className="px-6 pb-5 pt-2 text-center sm:px-6 sm:py-8 sm:pr-8 sm:text-left">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-orange-400/90">
              Burak Durgun
            </p>
            <h2 id="welcome-title" className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-[1.35rem]">
              Merhaba, ben Burak
            </h2>
            <p className="mt-3 text-[13px] leading-[1.65] text-zinc-400 sm:text-sm">
              2017&apos;den beri gezdiğim yerleri YouTube&apos;da paylaşıyorum. Güney Amerika&apos;dan
              Balkanlar&apos;a uzanan rotalarımı bu haritada topladım.
            </p>
            <p className="mt-2 text-[13px] leading-[1.65] text-zinc-500 sm:text-sm">
              Bir ülkeye dokun — o gezinin videolarını izle.
            </p>
          </div>
        </div>

        <div className="border-t border-white/[0.06] bg-zinc-950/50 px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={dismiss}
              className="welcome-btn-primary order-1 flex-1 rounded-xl py-3 text-sm font-semibold text-white transition active:scale-[0.99] sm:order-2"
            >
              Haritaya başla
            </button>
            <a
              href={YOUTUBE_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="welcome-btn-secondary order-2 flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium text-zinc-300 transition sm:order-1"
            >
              <span className="text-red-500">
                <YoutubeIcon size={16} />
              </span>
              YouTube
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
